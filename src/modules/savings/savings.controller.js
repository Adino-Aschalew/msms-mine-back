const SavingsService = require('./savings.service');

class SavingsController {
  static async createAccount(req, res) {
    try {
      const { saving_percentage } = req.body;
      const userId = req.userId;
      const employeeId = req.user.employee_id;
      const ip = req.ip;
      const userAgent = req.get('User-Agent');
      
      const result = await SavingsService.createAccount(userId, employeeId, saving_percentage, ip, userAgent);
      
      res.status(201).json({
        success: true,
        message: result.message,
        data: { accountId: result.accountId }
      });
    } catch (error) {
      console.error('Create savings account error:', error);
      
      if (error.message.includes('already exists') || error.message.includes('between')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create savings account'
      });
    }
  }
  
  static async getAccount(req, res) {
    try {
      const userId = req.userId;
      const account = await SavingsService.getAccount(userId);
      
      res.json({
        success: true,
        data: account
      });
    } catch (error) {
      console.error('Get savings account error:', error);
      
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch savings account'
      });
    }
  }

  static async getAccountSummary(req, res) {
    try {
      const userId = req.userId;
      const summary = await SavingsService.getAccountSummary(userId);
      
      res.json({
        success: true,
        data: summary
      });
    } catch (error) {
      console.error('Get account summary error:', error);
      
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch account summary'
      });
    }
  }
  
  static async updateSavingPercentage(req, res) {
    try {
      const { saving_percentage } = req.body;
      const userId = req.userId;
      const ip = req.ip;
      const userAgent = req.get('User-Agent');
      
      const result = await SavingsService.updateSavingPercentage(userId, saving_percentage, ip, userAgent);
      
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Update saving percentage error:', error);
      
      if (error.message.includes('not found') || error.message.includes('between')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to update saving percentage'
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
      
      const result = await SavingsService.getTransactions(userId, page, limit, filters);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get savings transactions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch savings transactions'
      });
    }
  }
  
  static async addContribution(req, res) {
    try {
      const { amount, reference_id, description } = req.body;
      const userId = req.userId;
      const ip = req.ip;
      const userAgent = req.get('User-Agent');
      
      const result = await SavingsService.addContribution(userId, amount, reference_id, description, ip, userAgent);
      
      res.json({
        success: true,
        message: result.message,
        data: {
          transactionId: result.transactionId,
          newBalance: result.newBalance
        }
      });
    } catch (error) {
      console.error('Add contribution error:', error);
      
      if (error.message.includes('not found') || error.message.includes('not active') || error.message.includes('Valid amount')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to add contribution'
      });
    }
  }
  
  static async withdrawSavings(req, res) {
    try {
      const { amount, reason } = req.body;
      const userId = req.userId;
      const ip = req.ip;
      const userAgent = req.get('User-Agent');
      
      const result = await SavingsService.withdrawSavings(userId, amount, reason, ip, userAgent);
      
      res.json({
        success: true,
        message: result.message,
        data: {
          transactionId: result.transactionId,
          newBalance: result.newBalance
        }
      });
    } catch (error) {
      console.error('Withdraw savings error:', error);
      
      if (error.message.includes('not found') || error.message.includes('not active') || 
          error.message.includes('lock period') || error.message.includes('Insufficient') || 
          error.message.includes('Valid amount')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to process withdrawal'
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
      
      const result = await SavingsService.getAllAccounts(page, limit, filters);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get all savings accounts error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch savings accounts'
      });
    }
  }

  static async getAccountById(req, res) {
    try {
      const { accountId } = req.params;
      const account = await SavingsService.getAccountById(accountId);
      
      res.json({
        success: true,
        data: account
      });
    } catch (error) {
      console.error('Get account by ID error:', error);
      
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch savings account'
      });
    }
  }

  static async getAccountTransactions(req, res) {
    try {
      const { accountId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {
        transaction_type: req.query.transaction_type,
        start_date: req.query.start_date,
        end_date: req.query.end_date
      };
      
      Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);
      
      const result = await SavingsService.getAccountTransactions(accountId, page, limit, filters);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get account transactions error:', error);
      
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch account transactions'
      });
    }
  }
  
  static async getSavingsStats(req, res) {
    try {
      const userId = req.query.user_id;
      const stats = await SavingsService.getSavingsStats(userId);
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get savings stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch savings statistics'
      });
    }
  }
  
  static async freezeAccount(req, res) {
    try {
      const { userId: targetUserId } = req.params;
      const { reason } = req.body;
      const adminId = req.userId;
      const ip = req.ip;
      const userAgent = req.get('User-Agent');
      
      const result = await SavingsService.freezeAccount(targetUserId, reason, adminId, ip, userAgent);
      
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Freeze savings account error:', error);
      
      if (error.message.includes('not found') || error.message.includes('required')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to freeze savings account'
      });
    }
  }

  static async unfreezeAccount(req, res) {
    try {
      const { userId: targetUserId } = req.params;
      const adminId = req.userId;
      const ip = req.ip;
      const userAgent = req.get('User-Agent');
      
      const result = await SavingsService.unfreezeAccount(targetUserId, adminId, ip, userAgent);
      
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Unfreeze savings account error:', error);
      
      if (error.message.includes('not found')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to unfreeze savings account'
      });
    }
  }
  
  static async processMonthlyInterest(req, res) {
    try {
      const adminId = req.userId;
      const ip = req.ip;
      const userAgent = req.get('User-Agent');
      
      const result = await SavingsService.processMonthlyInterest(adminId, ip, userAgent);
      
      res.json({
        success: true,
        message: result.message,
        data: result.data
      });
    } catch (error) {
      console.error('Process monthly interest error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process monthly interest'
      });
    }
  }
  
  static async checkMissedSavings(req, res) {
    try {
      const adminId = req.userId;
      const ip = req.ip;
      const userAgent = req.get('User-Agent');
      
      const result = await SavingsService.checkMissedSavings(adminId, ip, userAgent);
      
      res.json({
        success: true,
        message: result.message,
        data: result.data
      });
    } catch (error) {
      console.error('Check missed savings error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check missed savings'
      });
    }
  }
}

module.exports = SavingsController;
