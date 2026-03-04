const { query, transaction } = require('../../config/database');

class SavingsModel {
  static async createSavingsAccount(userId, employeeId, savingPercentage) {
    const insertQuery = `
      INSERT INTO savings_accounts (user_id, employee_id, saving_percentage, account_status, created_at)
      VALUES (?, ?, ?, 'ACTIVE', NOW())
    `;
    
    try {
      const result = await query(insertQuery, [userId, employeeId, savingPercentage]);
      return result.insertId;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Savings account already exists for this user');
      }
      throw error;
    }
  }

  static async getSavingsAccount(userId) {
    const selectQuery = `
      SELECT sa.*, u.username, u.email, ep.first_name, ep.last_name, ep.department
      FROM savings_accounts sa
      JOIN users u ON sa.user_id = u.id
      LEFT JOIN employee_profiles ep ON sa.user_id = ep.user_id
      WHERE sa.user_id = ?
    `;
    
    const accounts = await query(selectQuery, [userId]);
    return accounts[0] || null;
  }

  static async getSavingsAccountById(accountId) {
    const selectQuery = `
      SELECT sa.*, u.username, u.email, ep.first_name, ep.last_name, ep.department
      FROM savings_accounts sa
      JOIN users u ON sa.user_id = u.id
      LEFT JOIN employee_profiles ep ON sa.user_id = ep.user_id
      WHERE sa.id = ?
    `;
    
    const accounts = await query(selectQuery, [accountId]);
    return accounts[0] || null;
  }

  static async updateSavingPercentage(userId, savingPercentage) {
    const updateQuery = `
      UPDATE savings_accounts 
      SET saving_percentage = ?, updated_at = NOW()
      WHERE user_id = ? AND account_status = 'ACTIVE'
    `;
    
    const result = await query(updateQuery, [savingPercentage, userId]);
    return result.affectedRows > 0;
  }

  static async addSavingsTransaction(accountId, userId, transactionType, amount, referenceId, description) {
    console.log('addSavingsTransaction called with:', { accountId, userId, transactionType, amount, referenceId, description });
    
    return await transaction(async (connection) => {
      // Get current balance
      const [account] = await connection.execute(
        'SELECT current_balance FROM savings_accounts WHERE id = ? FOR UPDATE',
        [accountId]
      );
      
      if (!account[0]) {
        throw new Error('Savings account not found');
      }
      
      const currentBalance = parseFloat(account[0].current_balance);
      let newBalance;
      
      if (transactionType === 'CONTRIBUTION') {
        newBalance = currentBalance + parseFloat(amount);
      } else if (transactionType === 'WITHDRAWAL') {
        newBalance = currentBalance - parseFloat(amount);
        if (newBalance < 0) {
          throw new Error('Insufficient balance');
        }
      } else {
        throw new Error('Invalid transaction type');
      }
      
      // Add transaction
      const insertTransactionQuery = `
        INSERT INTO savings_transactions (savings_account_id, user_id, transaction_type, amount, balance_before, balance_after, reference_id, description, transaction_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `;
      
      const [transactionResult] = await connection.execute(insertTransactionQuery, [
        accountId, userId, transactionType, amount, currentBalance, newBalance, referenceId || null, description || null
      ]);
      
      // Update account balance
      await connection.execute(
        'UPDATE savings_accounts SET current_balance = ?, updated_at = NOW() WHERE id = ?',
        [newBalance, accountId]
      );
      
      return {
        transactionId: transactionResult.insertId,
        balanceAfter: newBalance
      };
    });
  }

  static async getSavingsTransactions(userId, page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;
    let whereClause = 'WHERE st.savings_account_id = sa.id AND sa.user_id = ?';
    const params = [userId];
    
    if (filters.transaction_type) {
      whereClause += ' AND st.transaction_type = ?';
      params.push(filters.transaction_type);
    }
    
    if (filters.start_date) {
      whereClause += ' AND st.transaction_date >= ?';
      params.push(filters.start_date);
    }
    
    if (filters.end_date) {
      whereClause += ' AND st.transaction_date <= ?';
      params.push(filters.end_date);
    }
    
    const countQuery = `
      SELECT COUNT(*) as total
      FROM savings_transactions st
      JOIN savings_accounts sa ON st.savings_account_id = sa.id
      ${whereClause}
    `;
    
    const selectQuery = `
      SELECT st.*, sa.account_status, sa.saving_percentage
      FROM savings_transactions st
      JOIN savings_accounts sa ON st.savings_account_id = sa.id
      ${whereClause}
      ORDER BY st.transaction_date DESC
      LIMIT ? OFFSET ?
    `;
    
    const [countResult, transactions] = await Promise.all([
      query(countQuery, params),
      query(selectQuery, [...params, limit, offset])
    ]);
    
    return {
      transactions,
      pagination: {
        page,
        limit,
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit)
      }
    };
  }

  static async getAllSavingsAccounts(page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;
    let whereClause = 'WHERE 1=1';
    const params = [];
    
    if (filters.account_status) {
      whereClause += ' AND sa.account_status = ?';
      params.push(filters.account_status);
    }
    
    if (filters.department) {
      whereClause += ' AND ep.department = ?';
      params.push(filters.department);
    }
    
    if (filters.min_balance) {
      whereClause += ' AND sa.current_balance >= ?';
      params.push(filters.min_balance);
    }
    
    const countQuery = `
      SELECT COUNT(*) as total
      FROM savings_accounts sa
      JOIN users u ON sa.user_id = u.id
      LEFT JOIN employee_profiles ep ON sa.user_id = ep.user_id
      ${whereClause}
    `;
    
    const selectQuery = `
      SELECT sa.*, u.username, u.email, ep.first_name, ep.last_name, ep.department
      FROM savings_accounts sa
      JOIN users u ON sa.user_id = u.id
      LEFT JOIN employee_profiles ep ON sa.user_id = ep.user_id
      ${whereClause}
      ORDER BY sa.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const [countResult, accounts] = await Promise.all([
      query(countQuery, params),
      query(selectQuery, [...params, limit, offset])
    ]);
    
    return {
      accounts,
      pagination: {
        page,
        limit,
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit)
      }
    };
  }

  static async freezeSavingsAccount(userId, reason) {
    const updateQuery = `
      UPDATE savings_accounts 
      SET account_status = 'FROZEN', freeze_reason = ?, updated_at = NOW()
      WHERE user_id = ?
    `;
    
    const result = await query(updateQuery, [reason, userId]);
    return result.affectedRows > 0;
  }

  static async unfreezeSavingsAccount(userId) {
    const updateQuery = `
      UPDATE savings_accounts 
      SET account_status = 'ACTIVE', freeze_reason = NULL, updated_at = NOW()
      WHERE user_id = ?
    `;
    
    const result = await query(updateQuery, [userId]);
    return result.affectedRows > 0;
  }

  static async getSavingsStats(userId = null) {
    let whereClause = userId ? 'WHERE user_id = ?' : '';
    const params = userId ? [userId] : [];
    
    const statsQuery = `
      SELECT 
        COUNT(*) as total_accounts,
        COUNT(CASE WHEN account_status = 'ACTIVE' THEN 1 END) as active_accounts,
        COUNT(CASE WHEN account_status = 'FROZEN' THEN 1 END) as frozen_accounts,
        SUM(current_balance) as total_balance,
        AVG(current_balance) as average_balance,
        AVG(saving_percentage) as average_saving_percentage
      FROM savings_accounts
      ${whereClause}
    `;
    
    const result = await query(statsQuery, params);
    return result[0];
  }

  static async processMonthlyInterest() {
    const interestRate = 0.05; // 5% annual interest
    const connection = await transaction();
    
    try {
      // Get all active accounts
      const [accounts] = await connection.execute(
        'SELECT id, user_id, current_balance FROM savings_accounts WHERE account_status = "ACTIVE"'
      );
      
      const results = {
        processed: 0,
        failed: 0,
        totalInterest: 0
      };
      
      for (const account of accounts) {
        try {
          const monthlyInterest = (account.current_balance * interestRate) / 12;
          
          if (monthlyInterest > 0) {
            await this.addSavingsTransaction(
              account.id,
              account.user_id,
              'INTEREST',
              monthlyInterest,
              null,
              'Monthly interest payment'
            );
            
            results.processed++;
            results.totalInterest += monthlyInterest;
          }
        } catch (error) {
          results.failed++;
          console.error(`Failed to process interest for account ${account.id}:`, error);
        }
      }
      
      await connection.commit();
      return results;
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  }

  static async checkMissedSavings() {
    const penaltyRate = 0.02; // 2% penalty
    const connection = await transaction();
    
    try {
      // This is a simplified version - in reality, you'd check against expected monthly contributions
      const [accounts] = await connection.execute(
        'SELECT id, user_id, current_balance FROM savings_accounts WHERE account_status = "ACTIVE"'
      );
      
      const results = {
        penalties: 0,
        totalPenalty: 0
      };
      
      // For demonstration, we'll assume some accounts missed their savings
      // In a real implementation, you'd have a more sophisticated logic
      for (const account of accounts.slice(0, 2)) { // Just demo with first 2 accounts
        try {
          const penaltyAmount = account.current_balance * penaltyRate;
          
          await this.addSavingsTransaction(
            account.id,
            account.user_id,
            'PENALTY',
            penaltyAmount,
            null,
            'Missed monthly savings penalty'
          );
          
          results.penalties++;
          results.totalPenalty += penaltyAmount;
        } catch (error) {
          console.error(`Failed to apply penalty for account ${account.id}:`, error);
        }
      }
      
      await connection.commit();
      return results;
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  }

  static async getAccountSummary(userId) {
    const summaryQuery = `
      SELECT 
        sa.*,
        (SELECT COUNT(*) FROM savings_transactions WHERE account_id = sa.id) as total_transactions,
        (SELECT SUM(amount) FROM savings_transactions WHERE account_id = sa.id AND transaction_type = 'CONTRIBUTION') as total_contributions,
        (SELECT SUM(amount) FROM savings_transactions WHERE account_id = sa.id AND transaction_type = 'WITHDRAWAL') as total_withdrawals,
        (SELECT MAX(transaction_date) FROM savings_transactions WHERE account_id = sa.id) as last_transaction_date
      FROM savings_accounts sa
      WHERE sa.user_id = ?
    `;
    
    const result = await query(summaryQuery, [userId]);
    return result[0] || null;
  }
}

module.exports = SavingsModel;
