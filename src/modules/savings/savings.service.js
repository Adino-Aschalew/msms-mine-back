const SavingsModel = require('./savings.model');
const { auditLog } = require('../../middleware/audit');

class SavingsService {
  static async createAccount(userId, employeeId, savingPercentage, ip, userAgent) {
    try {
      
      const finalSavingPercentage = savingPercentage || 15;
      
      
      if (finalSavingPercentage < 15 || finalSavingPercentage > 65) {
        throw new Error('Saving percentage must be between 15% and 65%');
      }
      
      
      console.log('SavingsService.createAccount: checking for existing account for userId:', userId);
      const existingAccount = await SavingsModel.getSavingsAccount(userId);
      if (existingAccount) {
        console.log('SavingsService.createAccount: account exists for userId:', userId, existingAccount);
        throw new Error('Savings account already exists');
      }
      
      console.log('SavingsService.createAccount: creating new account for userId:', userId, 'employeeId:', employeeId);
      
      
      const accountId = await SavingsModel.createSavingsAccount(userId, employeeId, finalSavingPercentage);
      
      await auditLog(userId, 'SAVINGS_ACCOUNT_CREATE', 'savings_accounts', accountId, null, { saving_percentage: finalSavingPercentage }, ip, userAgent);
      
      return { 
        accountId, 
        message: 'Savings account created successfully',
        saving_percentage: finalSavingPercentage,
        is_default: !savingPercentage
      };
    } catch (error) {
      throw error;
    }
  }

  static async getAccount(userId) {
    try {
      const account = await SavingsModel.getSavingsAccount(userId);
      
      if (!account) {
        throw new Error('Savings account not found');
      }
      
      return account;
    } catch (error) {
      throw error;
    }
  }

  static async getAccountSummary(userId) {
    try {
      const summary = await SavingsModel.getAccountSummary(userId);
      
      if (!summary) {
        throw new Error('Savings account not found');
      }
      
      return summary;
    } catch (error) {
      throw error;
    }
  }

  static async updateSavingPercentage(userId, savingPercentage, ip, userAgent) {
    try {
      
      if (!savingPercentage || savingPercentage < 15 || savingPercentage > 65) {
        throw new Error('Saving percentage must be between 15% and 65%');
      }
      
      const updated = await SavingsModel.updateSavingPercentage(userId, savingPercentage);
      
      if (!updated) {
        throw new Error('Savings account not found or not active');
      }
      
      await auditLog(userId, 'SAVING_PERCENTAGE_UPDATE', 'savings_accounts', null, null, { saving_percentage: savingPercentage }, ip, userAgent);
      
      return { message: 'Saving percentage updated successfully' };
    } catch (error) {
      throw error;
    }
  }

  static async getTransactions(userId, page = 1, limit = 10, filters = {}) {
    try {
      
      const account = await SavingsModel.getSavingsAccount(userId);
      if (!account) {
        
        return {
          transactions: [],
          pagination: {
            page,
            limit,
            total: 0,
            pages: 0
          }
        };
      }
      
      const result = await SavingsModel.getSavingsTransactions(userId, page, limit, filters);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async addContribution(userId, amount, referenceId, description, ip, userAgent) {
    try {
      
      if (!amount || amount <= 0) {
        throw new Error('Valid amount is required');
      }
      
      
      const account = await SavingsModel.getSavingsAccount(userId);
      if (!account) {
        throw new Error('Savings account not found');
      }
      
      if (account.account_status !== 'ACTIVE') {
        throw new Error('Savings account is not active');
      }
      
      
      const result = await SavingsModel.addSavingsTransaction(
        account.id,
        userId,
        'CONTRIBUTION',
        amount,
        referenceId,
        description
      );
      
      await auditLog(userId, 'SAVINGS_CONTRIBUTION', 'savings_transactions', result.transactionId, null, { amount, reference_id: referenceId, description }, ip, userAgent);
      
      return {
        transactionId: result.transactionId,
        newBalance: result.balanceAfter,
        message: 'Contribution added successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  static async withdrawSavings(userId, amount, reason, ip, userAgent) {
    try {
      
      if (!amount || amount <= 0) {
        throw new Error('Valid amount is required');
      }
      
      
      const account = await SavingsModel.getSavingsAccount(userId);
      if (!account) {
        throw new Error('Savings account not found');
      }
      
      if (account.account_status !== 'ACTIVE') {
        throw new Error('Savings account is not active');
      }
      
      
      if (account.lock_period_end_date && new Date(account.lock_period_end_date) > new Date()) {
        throw new Error('Savings are still in lock period');
      }
      
      
      if (account.current_balance < amount) {
        throw new Error('Insufficient balance');
      }
      
      
      const result = await SavingsModel.addSavingsTransaction(
        account.id,
        userId,
        'WITHDRAWAL',
        amount,
        null,
        reason || 'Savings withdrawal'
      );
      
      await auditLog(userId, 'SAVINGS_WITHDRAWAL', 'savings_transactions', result.transactionId, null, { amount, reason }, ip, userAgent);
      
      return {
        transactionId: result.transactionId,
        newBalance: result.balanceAfter,
        message: 'Withdrawal processed successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  static async getAllAccounts(page = 1, limit = 10, filters = {}) {
    try {
      const result = await SavingsModel.getAllSavingsAccounts(page, limit, filters);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async getSavingsStats(userId = null) {
    try {
      const stats = await SavingsModel.getSavingsStats(userId);
      return stats;
    } catch (error) {
      throw error;
    }
  }

  static async freezeAccount(targetUserId, reason, adminId, ip, userAgent) {
    try {
      if (!reason) {
        throw new Error('Reason for freezing is required');
      }
      
      const frozen = await SavingsModel.freezeSavingsAccount(targetUserId, reason);
      
      if (!frozen) {
        throw new Error('Savings account not found');
      }
      
      await auditLog(adminId, 'SAVINGS_ACCOUNT_FREEZE', 'savings_accounts', targetUserId, null, { reason }, ip, userAgent);
      
      return { message: 'Savings account frozen successfully' };
    } catch (error) {
      throw error;
    }
  }

  static async unfreezeAccount(targetUserId, adminId, ip, userAgent) {
    try {
      const unfrozen = await SavingsModel.unfreezeSavingsAccount(targetUserId);
      
      if (!unfrozen) {
        throw new Error('Savings account not found');
      }
      
      await auditLog(adminId, 'SAVINGS_ACCOUNT_UNFREEZE', 'savings_accounts', targetUserId, null, null, ip, userAgent);
      
      return { message: 'Savings account unfrozen successfully' };
    } catch (error) {
      throw error;
    }
  }

  static async processMonthlyInterest(adminId, ip, userAgent) {
    try {
      const results = await SavingsModel.processMonthlyInterest();
      
      await auditLog(adminId, 'MONTHLY_INTEREST_PROCESS', 'savings_transactions', null, null, { results }, ip, userAgent);
      
      return {
        message: 'Monthly interest processed',
        data: results
      };
    } catch (error) {
      throw error;
    }
  }

  static async checkMissedSavings(adminId, ip, userAgent) {
    try {
      const results = await SavingsModel.checkMissedSavings();
      
      await auditLog(adminId, 'MISSED_SAVINGS_CHECK', 'penalties', null, null, { results }, ip, userAgent);
      
      return {
        message: 'Missed savings check completed',
        data: results
      };
    } catch (error) {
      throw error;
    }
  }

  static async getAccountById(accountId) {
    try {
      const account = await SavingsModel.getSavingsAccountById(accountId);
      
      if (!account) {
        throw new Error('Savings account not found');
      }
      
      return account;
    } catch (error) {
      throw error;
    }
  }

  static async getAccountTransactions(accountId, page = 1, limit = 10, filters = {}) {
    try {
      
      const account = await SavingsModel.getSavingsAccountById(accountId);
      if (!account) {
        throw new Error('Savings account not found');
      }
      
      const result = await SavingsModel.getSavingsTransactions(account.user_id, page, limit, filters);
      return result;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = SavingsService;
