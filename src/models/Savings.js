const { query, transaction } = require('../config/database');
const moment = require('moment');

class Savings {
  static async createSavingsAccount(userId, employeeId, savingPercentage) {
    const checkQuery = `SELECT id FROM savings_accounts WHERE user_id = ?`;
    const existing = await query(checkQuery, [userId]);
    
    if (existing.length > 0) {
      throw new Error('Savings account already exists for this user');
    }
    
    const insertQuery = `
      INSERT INTO savings_accounts (user_id, employee_id, saving_percentage, lock_period_end_date)
      VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 6 MONTH))
    `;
    
    const result = await query(insertQuery, [userId, employeeId, savingPercentage]);
    return result.insertId;
  }
  
  static async getSavingsAccount(userId) {
    const selectQuery = `
      SELECT sa.*, u.username, u.email, ep.first_name, ep.last_name, ep.department, ep.salary
      FROM savings_accounts sa
      JOIN users u ON sa.user_id = u.id
      JOIN employee_profiles ep ON sa.user_id = ep.user_id
      WHERE sa.user_id = ?
    `;
    
    const accounts = await query(selectQuery, [userId]);
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
  
  static async addSavingsTransaction(savingsAccountId, userId, transactionType, amount, referenceId = null, description = null, payrollBatchId = null) {
    return await transaction(async (connection) => {
      const [account] = await connection.execute(
        'SELECT current_balance FROM savings_accounts WHERE id = ?',
        [savingsAccountId]
      );
      
      if (!account[0]) {
        throw new Error('Savings account not found');
      }
      
      const balanceBefore = account[0].current_balance;
      let balanceAfter = balanceBefore;
      
      if (transactionType === 'CONTRIBUTION' || transactionType === 'INTEREST') {
        balanceAfter = balanceBefore + amount;
      } else if (transactionType === 'WITHDRAWAL' || transactionType === 'PENALTY') {
        if (balanceBefore < amount) {
          throw new Error('Insufficient balance');
        }
        balanceAfter = balanceBefore - amount;
      }
      
      const insertQuery = `
        INSERT INTO savings_transactions 
        (savings_account_id, user_id, transaction_type, amount, balance_before, balance_after, reference_id, description, payroll_batch_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const [result] = await connection.execute(insertQuery, [
        savingsAccountId, userId, transactionType, amount, balanceBefore, balanceAfter, referenceId, description, payrollBatchId
      ]);
      
      const updateQuery = `
        UPDATE savings_accounts 
        SET current_balance = ?, updated_at = NOW()
        WHERE id = ?
      `;
      
      await connection.execute(updateQuery, [balanceAfter, savingsAccountId]);
      
      if (transactionType === 'CONTRIBUTION') {
        await connection.execute(
          'UPDATE savings_accounts SET total_contributions = total_contributions + ? WHERE id = ?',
          [amount, savingsAccountId]
        );
      } else if (transactionType === 'INTEREST') {
        await connection.execute(
          'UPDATE savings_accounts SET interest_earned = interest_earned + ? WHERE id = ?',
          [amount, savingsAccountId]
        );
      }
      
      return {
        transactionId: result.insertId,
        balanceAfter,
        balanceBefore
      };
    });
  }
  
  static async getSavingsTransactions(userId, page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;
    let whereClause = 'WHERE st.user_id = ?';
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
      ${whereClause}
    `;
    
    const selectQuery = `
      SELECT st.*, sa.saving_percentage, sa.account_status
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
  
  static async calculateMonthlyInterest(savingsAccountId) {
    const accountQuery = `
      SELECT current_balance, account_status
      FROM savings_accounts
      WHERE id = ? AND account_status = 'ACTIVE'
    `;
    
    const account = await query(accountQuery, [savingsAccountId]);
    
    if (!account[0] || account[0].current_balance <= 0) {
      return 0;
    }
    
    const configQuery = `
      SELECT config_value FROM system_configuration 
      WHERE config_key = 'savings_interest_rate' AND is_active = true
    `;
    
    const config = await query(configQuery);
    const annualRate = parseFloat(config[0]?.config_value || '7.00');
    const monthlyRate = annualRate / 12 / 100;
    
    const monthlyInterest = account[0].current_balance * monthlyRate;
    return Math.round(monthlyInterest * 100) / 100;
  }
  
  static async processMonthlyInterest() {
    const accountsQuery = `
      SELECT id, user_id, employee_id, current_balance
      FROM savings_accounts
      WHERE account_status = 'ACTIVE' AND current_balance > 0
    `;
    
    const accounts = await query(accountsQuery);
    const results = [];
    
    for (const account of accounts) {
      try {
        const interestAmount = await this.calculateMonthlyInterest(account.id);
        
        if (interestAmount > 0) {
          const result = await this.addSavingsTransaction(
            account.id,
            account.user_id,
            'INTEREST',
            interestAmount,
            null,
            `Monthly interest - ${moment().format('YYYY-MM')}`,
            null
          );
          
          results.push({
            accountId: account.id,
            employeeId: account.employee_id,
            interestAmount,
            success: true
          });
        }
      } catch (error) {
        results.push({
          accountId: account.id,
          employeeId: account.employee_id,
          error: error.message,
          success: false
        });
      }
    }
    
    return results;
  }
  
  static async checkMissedSavings() {
    const configQuery = `
      SELECT config_value FROM system_configuration 
      WHERE config_key = 'penalty_days_threshold' AND is_active = true
    `;
    
    const config = await query(configQuery);
    const thresholdDays = parseInt(config[0]?.config_value || '10');
    
    const missedSavingsQuery = `
      SELECT sa.id, sa.user_id, sa.employee_id, sa.current_balance,
             MAX(st.transaction_date) as last_contribution_date
      FROM savings_accounts sa
      LEFT JOIN savings_transactions st ON sa.id = st.savings_account_id AND st.transaction_type = 'CONTRIBUTION'
      WHERE sa.account_status = 'ACTIVE'
      GROUP BY sa.id, sa.user_id, sa.employee_id, sa.current_balance
      HAVING last_contribution_date < DATE_SUB(NOW(), INTERVAL ? DAY) OR last_contribution_date IS NULL
    `;
    
    const missedAccounts = await query(missedSavingsQuery, [thresholdDays]);
    const results = [];
    
    for (const account of missedAccounts) {
      const penaltyAmount = account.current_balance * 0.02;
      
      try {
        await this.addSavingsTransaction(
          account.id,
          account.user_id,
          'PENALTY',
          penaltyAmount,
          null,
          `Penalty for missed savings - ${thresholdDays} days`,
          null
        );
        
        await query(
          'INSERT INTO penalties (user_id, employee_id, penalty_type, amount, reason, due_date) VALUES (?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 30 DAY))',
          [account.user_id, account.employee_id, 'MISSED_SAVINGS', penaltyAmount, `Missed savings for ${thresholdDays} days`]
        );
        
        results.push({
          accountId: account.id,
          employeeId: account.employee_id,
          penaltyAmount,
          success: true
        });
      } catch (error) {
        results.push({
          accountId: account.id,
          employeeId: account.employee_id,
          error: error.message,
          success: false
        });
      }
    }
    
    return results;
  }
  
  static async getSavingsStats(userId = null) {
    let whereClause = userId ? 'WHERE sa.user_id = ?' : '';
    const params = userId ? [userId] : [];
    
    const statsQuery = `
      SELECT 
        COUNT(*) as total_accounts,
        SUM(current_balance) as total_balance,
        SUM(total_contributions) as total_contributions,
        SUM(interest_earned) as total_interest,
        COUNT(CASE WHEN sa.account_status = 'ACTIVE' THEN 1 END) as active_accounts,
        COUNT(CASE WHEN sa.account_status = 'FROZEN' THEN 1 END) as frozen_accounts,
        COUNT(CASE WHEN sa.account_status = 'CLOSED' THEN 1 END) as closed_accounts,
        AVG(saving_percentage) as avg_saving_percentage
      FROM savings_accounts sa
      ${whereClause}
    `;
    
    const stats = await query(statsQuery, params);
    return stats[0];
  }
  
  static async freezeSavingsAccount(userId, reason) {
    const updateQuery = `
      UPDATE savings_accounts 
      SET account_status = 'FROZEN', updated_at = NOW()
      WHERE user_id = ?
    `;
    
    const result = await query(updateQuery, [userId]);
    
    if (result.affectedRows > 0) {
      await query(
        'INSERT INTO notifications (user_id, title, message, notification_type) VALUES (?, ?, ?, ?)',
        [userId, 'Savings Account Frozen', reason, 'WARNING']
      );
    }
    
    return result.affectedRows > 0;
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
      JOIN employee_profiles ep ON sa.user_id = ep.user_id
      ${whereClause}
    `;
    
    const selectQuery = `
      SELECT sa.*, u.username, u.email, ep.first_name, ep.last_name, ep.department, ep.job_grade
      FROM savings_accounts sa
      JOIN users u ON sa.user_id = u.id
      JOIN employee_profiles ep ON sa.user_id = ep.user_id
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
}

module.exports = Savings;
