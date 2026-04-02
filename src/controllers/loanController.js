const Loan = require('../models/Loan');
const Guarantor = require('../models/Guarantor');
const { auditLog } = require('../middleware/audit');

class LoanController {
  static async checkEligibility(req, res) {
    try {
      const userId = req.userId;
      
      const eligibility = await Loan.checkLoanEligibility(userId);
      
      res.json({
        success: true,
        data: eligibility
      });
    } catch (error) {
      console.error('Check loan eligibility error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
  
  static async createApplication(req, res) {
    try {
      const { requested_amount, purpose, repayment_duration_months, monthly_income, guarantor_details } = req.body;
      const userId = req.userId;
      const employeeId = req.user.employee_id;
      
      if (!requested_amount || !purpose || !repayment_duration_months || !monthly_income) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required'
        });
      }
      
      if (requested_amount <= 0 || monthly_income <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Amounts must be positive'
        });
      }
      
      if (repayment_duration_months < 6 || repayment_duration_months > 60) {
        return res.status(400).json({
          success: false,
          message: 'Repayment duration must be between 6 and 60 months'
        });
      }
      
      const applicationId = await Loan.createLoanApplication(userId, employeeId, {
        requested_amount,
        purpose,
        repayment_duration_months,
        monthly_income
      });
      
      
      if (guarantor_details) {
        try {
          const guarantorData = typeof guarantor_details === 'string' 
            ? JSON.parse(guarantor_details) 
            : guarantor_details;
          
          await Guarantor.addGuarantor(applicationId, userId, {
            guarantor_type: guarantorData.type === 'internal' ? 'INTERNAL' : 'EXTERNAL',
            guarantor_name: guarantorData.fullName || guarantorData.employeeId || 'Unknown',
            guarantor_id: guarantorData.employeeId || '',
            relationship: guarantorData.relationship || '',
            monthly_income: 0,
            contact_phone: guarantorData.phoneNumber || '',
            contact_email: guarantorData.email || '',
            address: ''
          });
        } catch (guarantorError) {
          console.error('Error saving guarantor:', guarantorError);
          
        }
      }
      
      await auditLog(userId, 'LOAN_APPLICATION_CREATE', 'loan_applications', applicationId, null, { requested_amount, purpose, repayment_duration_months, monthly_income }, req.ip, req.get('User-Agent'));
      
      res.status(201).json({
        success: true,
        message: 'Loan application submitted successfully',
        data: { applicationId }
      });
    } catch (error) {
      console.error('❌ Create loan application error:', error);
      console.error('Error stack:', error.stack);
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
      console.error('SQL error:', error.sql);
      res.status(400).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }
  
  static async getApplications(req, res) {
    try {
      const userId = req.userId;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {
        status: req.query.status
      };
      
      Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);
      
      const result = await Loan.getLoanApplications(userId, page, limit, filters);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get loan applications error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
  
  static async getApplication(req, res) {
    try {
      const { applicationId } = req.params;
      const userId = req.userId;
      
      const application = await Loan.getLoanApplication(applicationId);
      
      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Loan application not found'
        });
      }
      
      if (application.user_id !== userId && !['SUPER_ADMIN', 'LOAN_COMMITTEE'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
      
      const guarantors = await Guarantor.getGuarantors(applicationId);
      
      res.json({
        success: true,
        data: {
          ...application,
          guarantors
        }
      });
    } catch (error) {
      console.error('Get loan application error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
  
  static async getAllApplications(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {
        status: req.query.status,
        employee_id: req.query.employee_id
      };
      
      Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);
      
      const result = await Loan.getLoanApplications(null, page, limit, filters);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get all loan applications error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
  
  static async reviewApplication(req, res) {
    try {
      const { applicationId } = req.params;
      const { action, review_comments } = req.body;
      const reviewedBy = req.userId;
      
      if (!['APPROVE', 'REJECT'].includes(action)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid action'
        });
      }
      
      const application = await Loan.getLoanApplication(applicationId);
      
      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Loan application not found'
        });
      }
      
      if (application.status !== 'PENDING' && application.status !== 'UNDER_REVIEW') {
        return res.status(400).json({
          success: false,
          message: 'Application cannot be reviewed in current status'
        });
      }
      
      const guarantors = await Guarantor.getGuarantors(applicationId);
      const approvedGuarantors = guarantors.filter(g => g.is_approved);
      
      if (approvedGuarantors.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'At least one approved guarantor is required'
        });
      }
      
      let result;
      if (action === 'APPROVE') {
        result = await Loan.approveLoanApplication(applicationId, reviewedBy);
        await auditLog(reviewedBy, 'LOAN_APPLICATION_APPROVE', 'loan_applications', applicationId, null, { review_comments }, req.ip, req.get('User-Agent'));
      } else {
        await Loan.rejectLoanApplication(applicationId, reviewedBy, review_comments);
        await auditLog(reviewedBy, 'LOAN_APPLICATION_REJECT', 'loan_applications', applicationId, null, { review_comments }, req.ip, req.get('User-Agent'));
      }
      
      res.json({
        success: true,
        message: `Loan application ${action.toLowerCase()}d successfully`,
        data: result || null
      });
    } catch (error) {
      console.error('Review loan application error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }
  
  static async getActiveLoans(req, res) {
    try {
      const userId = req.query.user_id;
      const loans = await Loan.getActiveLoans(userId);
      
      res.json({
        success: true,
        data: loans
      });
    } catch (error) {
      console.error('Get active loans error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
  
  static async getLoan(req, res) {
    try {
      const { loanId } = req.params;
      
      const loan = await Loan.getLoan(loanId);
      
      if (!loan) {
        return res.status(404).json({
          success: false,
          message: 'Loan not found'
        });
      }
      
      if (loan.user_id !== req.userId && !['SUPER_ADMIN', 'LOAN_COMMITTEE', 'FINANCE_ADMIN'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
      
      res.json({
        success: true,
        data: loan
      });
    } catch (error) {
      console.error('Get loan error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
  
  static async makeRepayment(req, res) {
    try {
      const { loanId } = req.params;
      const { amount, reference_id } = req.body;
      const userId = req.userId;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Valid amount is required'
        });
      }
      
      const result = await Loan.makeLoanRepayment(loanId, userId, amount, reference_id);
      
      await auditLog(userId, 'LOAN_REPAYMENT', 'loan_repayments', result.repaymentId, null, { amount, reference_id }, req.ip, req.get('User-Agent'));
      
      res.json({
        success: true,
        message: 'Loan repayment processed successfully',
        data: result
      });
    } catch (error) {
      console.error('Make loan repayment error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }
  
  static async getLoanRepayments(req, res) {
    try {
      const { loanId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      
      const result = await Loan.getLoanRepayments(loanId, page, limit);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get loan repayments error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
  
  static async getLoanStats(req, res) {
    try {
      const userId = req.query.user_id;
      const stats = await Loan.getLoanStats(userId);
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get loan stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
  
  static async checkLoanDefaults(req, res) {
    try {
      const results = await Loan.checkLoanDefaults();
      
      await auditLog(req.userId, 'LOAN_DEFAULT_CHECK', 'penalties', null, null, { results }, req.ip, req.get('User-Agent'));
      
      res.json({
        success: true,
        message: 'Loan default check completed',
        data: results
      });
    } catch (error) {
      console.error('Check loan defaults error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = LoanController;
