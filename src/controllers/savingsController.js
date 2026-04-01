const Savings = require('../models/Savings');
const SavingsRequest = require('../models/SavingsRequest');
const { auditLog } = require('../middleware/audit');

class SavingsController {
  static async createAccount(req, res) {
    try {
      const { saving_percentage } = req.body;
      const userId = req.userId;
      const employeeId = req.user.employee_id;
      
      // Default to 15% if not provided
      const finalSavingPercentage = saving_percentage || 15;
      
      if (finalSavingPercentage < 15 || finalSavingPercentage > 65) {
        return res.status(400).json({
          success: false,
          message: 'Saving percentage must be between 15% and 65%'
        });
      }
      
      const existingAccount = await Savings.getSavingsAccount(userId);
      
      if (existingAccount) {
        return res.status(400).json({
          success: false,
          message: 'Savings account already exists'
        });
      }
      
      const accountId = await Savings.createSavingsAccount(userId, employeeId, finalSavingPercentage);
      
      await auditLog(userId, 'SAVINGS_ACCOUNT_CREATE', 'savings_accounts', accountId, null, { saving_percentage: finalSavingPercentage }, req.ip, req.get('User-Agent'));
      
      res.status(201).json({
        success: true,
        message: 'Savings account created successfully',
        data: { 
          accountId,
          saving_percentage: finalSavingPercentage,
          is_default: !saving_percentage // Indicates if default percentage was used
        }
      });
    } catch (error) {
      console.error('Create savings account error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }
  
  static async getAccount(req, res) {
    try {
      const userId = req.userId;
      
      const account = await Savings.getSavingsAccount(userId);
      
      if (!account) {
        return res.status(404).json({
          success: false,
          message: 'Savings account not found'
        });
      }
      
      res.json({
        success: true,
        data: account
      });
    } catch (error) {
      console.error('Get savings account error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
  
  static async updateSavingPercentage(req, res) {
    try {
      const { saving_percentage, reason } = req.body;
      const userId = req.userId;
      
      if (!saving_percentage || saving_percentage < 15 || saving_percentage > 65) {
        return res.status(400).json({
          success: false,
          message: 'Saving percentage must be between 15% and 65%'
        });
      }
      
      const account = await Savings.getSavingsAccount(userId);
      if (!account) {
        return res.status(404).json({
          success: false,
          message: 'Savings account not found'
        });
      }
      
      const requestId = await SavingsRequest.createRequest(
        userId, 
        account.saving_percentage, 
        saving_percentage, 
        reason
      );
      
      await auditLog(userId, 'SAVING_PERCENTAGE_REQUEST_CREATE', 'savings_update_requests', requestId, null, { old_percentage: account.saving_percentage, new_percentage: saving_percentage, reason }, req.ip, req.get('User-Agent'));
      
      res.json({
        success: true,
        message: 'Savings update request submitted for approval',
        data: { requestId }
      });
    } catch (error) {
      console.error('Update saving percentage error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async getSavingsRequests(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {
        status: req.query.status,
        user_id: req.query.user_id
      };
      
      const result = await SavingsRequest.getRequests(page, limit, filters);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get savings requests error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async handleSavingsRequest(req, res) {
    try {
      const { requestId } = req.params;
      const { status, comments } = req.body;
      const reviewedBy = req.userId;
      
      if (!['APPROVED', 'REJECTED'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Status must be APPROVED or REJECTED'
        });
      }
      
      const result = await SavingsRequest.updateRequestStatus(requestId, status, reviewedBy, comments || '');
      
      await auditLog(reviewedBy, `SAVING_PERCENTAGE_REQUEST_${status}`, 'savings_update_requests', requestId, null, { status, comments }, req.ip, req.get('User-Agent'));
      
      res.json({
        success: true,
        message: `Savings request ${status.toLowerCase()} successfully`,
        data: result
      });
    } catch (error) {
      console.error('Handle savings request error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }
  
  static async getTransactions(req, res) {
    try {
      const userId = req.userId;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {
        transaction_type: req.query.transaction_type,
        start_date: req.query.start_date,
        end_date: req.query.end_date
      };
      
      Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);
      
      const result = await Savings.getSavingsTransactions(userId, page, limit, filters);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get savings transactions error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
  
  static async addContribution(req, res) {
    try {
      const { amount, reference_id, description } = req.body;
      const userId = req.userId;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Valid amount is required'
        });
      }
      
      const account = await Savings.getSavingsAccount(userId);
      
      if (!account) {
        return res.status(404).json({
          success: false,
          message: 'Savings account not found'
        });
      }
      
      if (account.account_status !== 'ACTIVE') {
        return res.status(400).json({
          success: false,
          message: 'Savings account is not active'
        });
      }
      
      const result = await Savings.addSavingsTransaction(
        account.id,
        userId,
        'CONTRIBUTION',
        amount,
        reference_id,
        description
      );
      
      await auditLog(userId, 'SAVINGS_CONTRIBUTION', 'savings_transactions', result.transactionId, null, { amount, reference_id, description }, req.ip, req.get('User-Agent'));
      
      res.json({
        success: true,
        message: 'Contribution added successfully',
        data: {
          transactionId: result.transactionId,
          newBalance: result.balanceAfter
        }
      });
    } catch (error) {
      console.error('Add contribution error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }
  
  static async withdrawSavings(req, res) {
    try {
      const { amount, reason } = req.body;
      const userId = req.userId;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Valid amount is required'
        });
      }
      
      const account = await Savings.getSavingsAccount(userId);
      
      if (!account) {
        return res.status(404).json({
          success: false,
          message: 'Savings account not found'
        });
      }
      
      if (account.account_status !== 'ACTIVE') {
        return res.status(400).json({
          success: false,
          message: 'Savings account is not active'
        });
      }
      
      if (account.lock_period_end_date && new Date(account.lock_period_end_date) > new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Savings are still in lock period'
        });
      }
      
      if (account.current_balance < amount) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient balance'
        });
      }
      
      const result = await Savings.addSavingsTransaction(
        account.id,
        userId,
        'WITHDRAWAL',
        amount,
        null,
        reason || 'Savings withdrawal'
      );
      
      await auditLog(userId, 'SAVINGS_WITHDRAWAL', 'savings_transactions', result.transactionId, null, { amount, reason }, req.ip, req.get('User-Agent'));
      
      res.json({
        success: true,
        message: 'Withdrawal processed successfully',
        data: {
          transactionId: result.transactionId,
          newBalance: result.balanceAfter
        }
      });
    } catch (error) {
      console.error('Withdraw savings error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }
  
  static async getAllAccounts(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {
        account_status: req.query.account_status,
        department: req.query.department,
        min_balance: req.query.min_balance
      };
      
      Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);
      
      const result = await Savings.getAllSavingsAccounts(page, limit, filters);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get all savings accounts error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
  
  static async getSavingsStats(req, res) {
    try {
      const userId = req.query.user_id;
      const stats = await Savings.getSavingsStats(userId);
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get savings stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
  
  static async freezeAccount(req, res) {
    try {
      const { userId: targetUserId } = req.params;
      const { reason } = req.body;
      const frozenBy = req.userId;
      
      if (!reason) {
        return res.status(400).json({
          success: false,
          message: 'Reason for freezing is required'
        });
      }
      
      const frozen = await Savings.freezeSavingsAccount(targetUserId, reason);
      
      if (!frozen) {
        return res.status(404).json({
          success: false,
          message: 'Savings account not found'
        });
      }
      
      await auditLog(frozenBy, 'SAVINGS_ACCOUNT_FREEZE', 'savings_accounts', targetUserId, null, { reason }, req.ip, req.get('User-Agent'));
      
      res.json({
        success: true,
        message: 'Savings account frozen successfully'
      });
    } catch (error) {
      console.error('Freeze savings account error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
  
  static async processMonthlyInterest(req, res) {
    try {
      const results = await Savings.processMonthlyInterest();
      
      await auditLog(req.userId, 'MONTHLY_INTEREST_PROCESS', 'savings_transactions', null, null, { results }, req.ip, req.get('User-Agent'));
      
      res.json({
        success: true,
        message: 'Monthly interest processed',
        data: results
      });
    } catch (error) {
      console.error('Process monthly interest error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
  
  static async checkMissedSavings(req, res) {
    try {
      const results = await Savings.checkMissedSavings();
      
      await auditLog(req.userId, 'MISSED_SAVINGS_CHECK', 'penalties', null, null, { results }, req.ip, req.get('User-Agent'));
      
      res.json({
        success: true,
        message: 'Missed savings check completed',
        data: results
      });
    } catch (error) {
      console.error('Check missed savings error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = SavingsController;
