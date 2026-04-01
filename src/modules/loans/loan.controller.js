const LoanService = require('./loan.service');
const LoanModel = require('./loan.model');
const { query } = require('../../config/database');
const { auditMiddleware } = require('../../middleware/audit');

class LoanController {
  static async applyForLoan(req, res) {
    try {
      const applicationData = req.body;
      const userId = req.userId;
      const ip = req.ip;
      const userAgent = req.get('User-Agent');
      
      const result = await LoanService.applyForLoan(applicationData, userId, ip, userAgent);
      
      res.status(201).json({
        success: true,
        message: result.message,
        data: result
      });
    } catch (error) {
      console.error('Apply for loan error:', error);
      
      if (error.message.includes('not eligible') || 
          error.message.includes('required') || 
          error.message.includes('pending loan')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to apply for loan'
      });
    }
  }

  static async getUserLoanById(req, res) {
    try {
      const { loanId } = req.params;
      const userId = req.userId;
      const loan = await LoanModel.getUserLoanById(loanId, userId);
      res.json({
        success: true,
        data: loan
      });
    } catch (error) {
      console.error('Get user loan error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch loan'
      });
    }
  }

  static async getAllLoans(req, res) {
    try {
      const loans = await LoanModel.getAllLoans();
      res.json({
        success: true,
        data: loans
      });
    } catch (error) {
      console.error('Get all loans error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch loans'
      });
    }
  }

  static async getLoanApplicationById(req, res) {
    try {
      const { applicationId } = req.params;
      const application = await LoanModel.getLoanApplicationById(applicationId);
      res.json({
        success: true,
        data: application
      });
    } catch (error) {
      console.error('Get loan application error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch loan application'
      });
    }
  }

  static async reviewLoanApplication(req, res) {
    try {
      const { applicationId } = req.params;
      const { review_comments, approved } = req.body;
      const result = await LoanModel.reviewLoanApplication(applicationId, review_comments, approved);
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Review loan application error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to review loan application'
      });
    }
  }

  static async getLoans(req, res) {
    try {
      const loans = await LoanModel.getLoans();
      res.json({
        success: true,
        data: loans
      });
    } catch (error) {
      console.error('Get loans error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch loans'
      });
    }
  }

  static async getLoanApplications(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {
        status: req.query.status,
        department: req.query.department,
        search: req.query.search
      };
      
      Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);
      
      const result = await LoanService.getLoanApplications(page, limit, filters);
      
      res.json({
        success: true,
        data: result.applications,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Get loan applications error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch loan applications'
      });
    }
  }

  static async getLoanApplicationById(req, res) {
    try {
      const { applicationId } = req.params;
      const application = await LoanService.getLoanApplicationById(applicationId);
      
      res.json({
        success: true,
        data: application
      });
    } catch (error) {
      console.error('Get loan application error:', error);
      
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch loan application'
      });
    }
  }

  static async reviewLoanApplication(req, res) {
    try {
      const { applicationId } = req.params;
      const { action, notes } = req.body;
      const reviewedBy = req.userId;
      const ip = req.ip;
      const userAgent = req.get('User-Agent');
      
      const result = await LoanService.reviewLoanApplication(
        applicationId, action, reviewedBy, notes, ip, userAgent
      );
      
      res.json({
        success: true,
        message: result.message,
        data: result
      });
    } catch (error) {
      console.error('Review loan application error:', error);
      
      if (error.message.includes('not found') || error.message.includes('not pending') || error.message.includes('Invalid')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to review loan application'
      });
    }
  }

  static async getLoans(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {
        status: req.query.status,
        department: req.query.department,
        search: req.query.search
      };
      
      Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);
      
      const result = await LoanService.getLoans(page, limit, filters);
      
      res.json({
        success: true,
        data: result.loans,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Get loans error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch loans'
      });
    }
  }

  static async getLoanById(req, res) {
    try {
      const { loanId } = req.params;
      const loan = await LoanService.getLoanById(loanId);
      
      res.json({
        success: true,
        data: loan
      });
    } catch (error) {
      console.error('Get loan error:', error);
      
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch loan'
      });
    }
  }

  static async disburseLoan(req, res) {
    try {
      const { loanId } = req.params;
      const disbursedBy = req.userId;
      const ip = req.ip;
      const userAgent = req.get('User-Agent');
      
      const result = await LoanService.disburseLoan(loanId, disbursedBy, ip, userAgent);
      
      res.json({
        success: true,
        message: result.message,
        data: result
      });
    } catch (error) {
      console.error('Disburse loan error:', error);
      
      if (error.message.includes('not found') || error.message.includes('not active') || error.message.includes('already')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to disburse loan'
      });
    }
  }

  static async makeLoanPayment(req, res) {
    try {
      const { loanId } = req.params;
      const { payment_amount, payment_method } = req.body;
      const userId = req.userId;
      const ip = req.ip;
      const userAgent = req.get('User-Agent');
      
      const result = await LoanService.makeLoanPayment(
        loanId, payment_amount, payment_method, userId, ip, userAgent
      );
      
      res.json({
        success: true,
        message: result.message,
        data: result
      });
    } catch (error) {
      console.error('Make loan payment error:', error);
      
      if (error.message.includes('not found') || error.message.includes('not payable') || error.message.includes('greater than 0') || error.message.includes('exceeds')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to process loan payment'
      });
    }
  }

  static async getLoanTransactions(req, res) {
    try {
      const { loanId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {
        transaction_type: req.query.transaction_type,
        start_date: req.query.start_date,
        end_date: req.query.end_date
      };
      
      Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);
      
      const result = await LoanService.getLoanTransactions(loanId, page, limit, filters);
      
      res.json({
        success: true,
        data: result.transactions,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Get loan transactions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch loan transactions'
      });
    }
  }

  static async getLoanStats(req, res) {
    try {
      const stats = await LoanModel.getLoanStats();
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get loan stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch loan stats'
      });
    }
  }

  static async getOverdueLoans(req, res) {
    try {
      const overdueLoans = await LoanModel.getOverdueLoans();
      res.json({
        success: true,
        data: overdueLoans
      });
    } catch (error) {
      console.error('Get overdue loans error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch overdue loans'
      });
    }
  }

  static async disburseLoan(req, res) {
    try {
      const { loanId } = req.params;
      const { disbursement_date, disbursement_method } = req.body;
      const result = await LoanModel.disburseLoan(loanId, disbursement_date, disbursement_method);
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Disburse loan error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to disburse loan'
      });
    }
  }

  static async updateLoanStatus(req, res) {
    try {
      const { loanId } = req.params;
      const { status, notes } = req.body;
      const result = await LoanModel.updateLoanStatus(loanId, status, notes);
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Update loan status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update loan status'
      });
    }
  }

  static async getUserLoanTransactions(req, res) {
    try {
      const userId = req.userId;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      
      const result = await LoanModel.getUserLoanTransactions(userId, page, limit);
      
      res.json({
        success: true,
        data: result.transactions,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Get user loan transactions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch loan transactions'
      });
    }
  }

  static async getLoanPortfolio(req, res) {
    try {
      const portfolio = await LoanService.getLoanPortfolio();
      
      res.json({
        success: true,
        data: portfolio
      });
    } catch (error) {
      console.error('Get loan portfolio error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch loan portfolio'
      });
    }
  }

  static async calculateLoanSchedule(req, res) {
    try {
      const { loan_amount, interest_rate, loan_term_months } = req.body;
      
      if (!loan_amount || !interest_rate || !loan_term_months) {
        return res.status(400).json({
          success: false,
          message: 'Loan amount, interest rate, and term are required'
        });
      }
      
      const result = await LoanService.calculateLoanSchedule(loan_amount, interest_rate, loan_term_months);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Calculate loan schedule error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to calculate loan schedule'
      });
    }
  }
  

  static async checkEligibility(req, res) {
    try {
      const userId = req.userId;
      const eligibility = await LoanService.checkEligibility(userId);
      
      res.json({
        success: true,
        data: eligibility
      });
    } catch (error) {
      console.error('Check eligibility error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check eligibility'
      });
    }
  }

  static async getUserLoans(req, res) {
    try {
      const userId = req.userId;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      
      const result = await LoanService.getUserLoans(userId, page, limit);
      
      res.json({
        success: true,
        data: result.loans,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Get user loans error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user loans'
      });
    }
  }

  static async getUserLoanApplications(req, res) {
    try {
      const userId = req.userId;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      
      const result = await LoanService.getUserLoanApplications(userId, page, limit);
      
      res.json({
        success: true,
        data: result.applications,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Get user loan applications error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user loan applications'
      });
    }
  }

  static async updateLoanStatus(req, res) {
    try {
      const { loanId } = req.params;
      const { status } = req.body;
      const updatedBy = req.userId;
      const ip = req.ip;
      const userAgent = req.get('User-Agent');
      
      const result = await LoanService.updateLoanStatus(loanId, status, updatedBy, ip, userAgent);
      
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Update loan status error:', error);
      
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to update loan status'
      });
    }
  }

  static async getEligibilityScore(req, res) {
    try {
      const userId = req.userId;
      const score = await LoanService.calculateLoanEligibilityScore(userId);
      
      res.json({
        success: true,
        data: score
      });
    } catch (error) {
      console.error('Get eligibility score error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to calculate eligibility score'
      });
    }
  }

  static async getEmployeeDashboard(req, res) {
    try {
      const userId = req.userId;
      
      const [loanStats] = await query(`
        SELECT 
          COUNT(*) as active_loans,
          COALESCE(SUM(remaining_balance), 0) as outstanding_balance
        FROM loans 
        WHERE user_id = ? AND status = 'ACTIVE'
      `, [userId]);

      // We don't currently store a "due_date" + "PENDING" payroll deduction schedule
      // in `loan_repayments`. Approximate the monthly payroll deduction as the sum
      // of `monthly_repayment` for active loans.
      const [deductions] = await query(`
        SELECT COALESCE(SUM(monthly_repayment), 0) as sum_deductions
        FROM loans
        WHERE user_id = ? AND status = 'ACTIVE'
      `, [userId]);

      const recentActivity = await query(`
        SELECT 
          id,
          'loan_request' as type,
          CONCAT(purpose, ' Loan Request') as title,
          CONCAT('Requested amount: $', requested_amount) as description,
          created_at as date,
          status
        FROM loan_applications
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 5
      `, [userId]);

      const loanBalanceGrowth = await query(`
        SELECT 
          DATE_FORMAT(COALESCE(disbursement_date, created_at), '%b') as label,
          SUM(principal_amount) as total
        FROM loans
        WHERE user_id = ? AND COALESCE(disbursement_date, created_at) >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(COALESCE(disbursement_date, created_at), '%b')
        ORDER BY label ASC
      `, [userId]);

      res.json({
        success: true,
        data: {
          stats: {
            savingsBalance: 0, // Mock savings as it belongs to another module
            currentSavingRate: 0,
            activeLoans: loanStats?.active_loans ?? 0,
            outstandingLoanBalance: loanStats?.outstanding_balance ?? 0,
            monthlyPayrollDeduction: deductions?.sum_deductions ?? 0
          },
          recentActivity,
          loanBalanceGrowth
        }
      });
    } catch (error) {
      console.error('Get employee dashboard error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch employee dashboard'
      });
    }
  }
}

module.exports = LoanController;
