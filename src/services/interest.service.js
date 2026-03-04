const { query, transaction } = require('../config/database');

class InterestService {
  static async calculateSavingsInterest(accountId, interestRate = 0.05) {
    const connection = await transaction();
    
    try {
      // Get account details
      const [account] = await connection.execute(
        'SELECT * FROM savings_accounts WHERE id = ? AND account_status = "ACTIVE"',
        [accountId]
      );
      
      if (!account || !account[0]) {
        throw new Error('Savings account not found or not active');
      }
      
      const accountData = account[0];
      const currentBalance = parseFloat(accountData.current_balance);
      
      if (currentBalance <= 0) {
        return { interestAmount: 0, message: 'No interest calculated for zero or negative balance' };
      }
      
      // Calculate monthly interest (5% annual rate divided by 12)
      const monthlyInterestRate = interestRate / 12;
      const interestAmount = currentBalance * monthlyInterestRate;
      
      // Add interest transaction
      await connection.execute(`
        INSERT INTO savings_transactions (account_id, user_id, transaction_type, amount, balance_before, balance_after, reference_id, description, transaction_date)
        VALUES (?, ?, 'INTEREST', ?, ?, ?, ?, ?, NOW())
      `, [
        accountId,
        accountData.user_id,
        interestAmount,
        currentBalance,
        currentBalance + interestAmount,
        `INTEREST_${new Date().toISOString().slice(0, 7)}`,
        `Monthly interest payment - ${(interestRate * 100).toFixed(2)}% annual rate`
      ]);
      
      // Update account balance
      await connection.execute(
        'UPDATE savings_accounts SET current_balance = ?, updated_at = NOW() WHERE id = ?',
        [currentBalance + interestAmount, accountId]
      );
      
      await connection.commit();
      
      return {
        interestAmount,
        newBalance: currentBalance + interestAmount,
        message: 'Interest calculated and applied successfully'
      };
      
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  }

  static async calculateLoanInterest(loanId, overdueDays = 0) {
    try {
      // Get loan details
      const [loan] = await query(
        'SELECT * FROM loans WHERE id = ? AND status IN ("ACTIVE", "OVERDUE")',
        [loanId]
      );
      
      if (!loan || !loan[0]) {
        throw new Error('Loan not found or not active');
      }
      
      const loanData = loan[0];
      const outstandingBalance = parseFloat(loanData.outstanding_balance);
      const interestRate = parseFloat(loanData.interest_rate);
      
      if (outstandingBalance <= 0) {
        return { interestAmount: 0, message: 'No interest calculated for paid-off loan' };
      }
      
      // Calculate monthly interest
      const monthlyInterestRate = interestRate / 12 / 100;
      let interestAmount = outstandingBalance * monthlyInterestRate;
      
      // Add penalty interest if overdue
      if (overdueDays > 0) {
        const penaltyRate = 0.02; // 2% penalty rate
        const penaltyInterest = outstandingBalance * penaltyRate * (overdueDays / 30);
        interestAmount += penaltyInterest;
      }
      
      return {
        interestAmount,
        outstandingBalance,
        interestRate,
        overdueDays,
        message: 'Loan interest calculated successfully'
      };
      
    } catch (error) {
      throw error;
    }
  }

  static async applyInterestToAllSavingsAccounts(interestRate = 0.05) {
    const connection = await transaction();
    
    try {
      // Get all active savings accounts
      const [accounts] = await connection.execute(
        'SELECT * FROM savings_accounts WHERE account_status = "ACTIVE" AND current_balance > 0'
      );
      
      const results = {
        processed: 0,
        failed: 0,
        totalInterest: 0,
        errors: []
      };
      
      for (const account of accounts) {
        try {
          const currentBalance = parseFloat(account.current_balance);
          const monthlyInterestRate = interestRate / 12;
          const interestAmount = currentBalance * monthlyInterestRate;
          
          if (interestAmount > 0) {
            // Add interest transaction
            await connection.execute(`
              INSERT INTO savings_transactions (account_id, user_id, transaction_type, amount, balance_before, balance_after, reference_id, description, transaction_date)
              VALUES (?, ?, 'INTEREST', ?, ?, ?, ?, ?, NOW())
            `, [
              account.id,
              account.user_id,
              interestAmount,
              currentBalance,
              currentBalance + interestAmount,
              `INTEREST_${new Date().toISOString().slice(0, 7)}`,
              `Monthly interest payment - ${(interestRate * 100).toFixed(2)}% annual rate`
            ]);
            
            // Update account balance
            await connection.execute(
              'UPDATE savings_accounts SET current_balance = ?, updated_at = NOW() WHERE id = ?',
              [currentBalance + interestAmount, account.id]
            );
            
            results.processed++;
            results.totalInterest += interestAmount;
          }
          
        } catch (error) {
          results.failed++;
          results.errors.push({
            accountId: account.id,
            userId: account.user_id,
            error: error.message
          });
          console.error(`Failed to apply interest for account ${account.id}:`, error);
        }
      }
      
      await connection.commit();
      
      return results;
      
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  }

  static async applyInterestToAllLoans() {
    const connection = await transaction();
    
    try {
      // Get all active and overdue loans
      const [loans] = await connection.execute(`
        SELECT l.*, DATEDIFF(NOW(), l.next_payment_date) as overdue_days
        FROM loans l 
        WHERE l.status IN ('ACTIVE', 'OVERDUE') AND l.outstanding_balance > 0
      `);
      
      const results = {
        processed: 0,
        failed: 0,
        totalInterest: 0,
        errors: []
      };
      
      for (const loan of loans) {
        try {
          const outstandingBalance = parseFloat(loan.outstanding_balance);
          const interestRate = parseFloat(loan.interest_rate);
          const overdueDays = loan.overdue_days > 0 ? loan.overdue_days : 0;
          
          // Calculate monthly interest
          const monthlyInterestRate = interestRate / 12 / 100;
          let interestAmount = outstandingBalance * monthlyInterestRate;
          
          // Add penalty interest if overdue
          if (overdueDays > 0) {
            const penaltyRate = 0.02; // 2% penalty rate
            const penaltyInterest = outstandingBalance * penaltyRate * (overdueDays / 30);
            interestAmount += penaltyInterest;
            
            // Update loan status to overdue if not already
            if (loan.status === 'ACTIVE') {
              await connection.execute(
                'UPDATE loans SET status = "OVERDUE", updated_at = NOW() WHERE id = ?',
                [loan.id]
              );
            }
          }
          
          if (interestAmount > 0) {
            // Add interest transaction
            await connection.execute(`
              INSERT INTO loan_transactions (loan_id, user_id, transaction_type, amount, balance_before, balance_after, reference_id, description, transaction_date)
              VALUES (?, ?, 'INTEREST', ?, ?, ?, ?, ?, NOW())
            `, [
              loan.id,
              loan.user_id,
              interestAmount,
              outstandingBalance,
              outstandingBalance + interestAmount,
              `INTEREST_${new Date().toISOString().slice(0, 7)}`,
              `Monthly interest - ${interestRate}% annual rate${overdueDays > 0 ? ` + penalty for ${overdueDays} days overdue` : ''}`
            ]);
            
            // Update loan balance
            await connection.execute(
              'UPDATE loans SET outstanding_balance = ?, updated_at = NOW() WHERE id = ?',
              [outstandingBalance + interestAmount, loan.id]
            );
            
            results.processed++;
            results.totalInterest += interestAmount;
          }
          
        } catch (error) {
          results.failed++;
          results.errors.push({
            loanId: loan.id,
            userId: loan.user_id,
            error: error.message
          });
          console.error(`Failed to apply interest for loan ${loan.id}:`, error);
        }
      }
      
      await connection.commit();
      
      return results;
      
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  }

  static async getInterestHistory(accountType, accountId, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      
      let tableName, idField;
      if (accountType === 'savings') {
        tableName = 'savings_transactions';
        idField = 'account_id';
      } else if (accountType === 'loan') {
        tableName = 'loan_transactions';
        idField = 'loan_id';
      } else {
        throw new Error('Invalid account type. Must be "savings" or "loan"');
      }
      
      const countQuery = `
        SELECT COUNT(*) as total 
        FROM ${tableName} 
        WHERE ${idField} = ? AND transaction_type = 'INTEREST'
      `;
      
      const selectQuery = `
        SELECT * FROM ${tableName} 
        WHERE ${idField} = ? AND transaction_type = 'INTEREST'
        ORDER BY transaction_date DESC
        LIMIT ? OFFSET ?
      `;
      
      const [countResult, transactions] = await Promise.all([
        query(countQuery, [accountId]),
        query(selectQuery, [accountId, limit, offset])
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
    } catch (error) {
      throw error;
    }
  }

  static async getInterestSummary(period = 'MONTHLY') {
    try {
      let dateFormat;
      switch (period) {
        case 'DAILY':
          dateFormat = '%Y-%m-%d';
          break;
        case 'WEEKLY':
          dateFormat = '%Y-%u';
          break;
        case 'MONTHLY':
          dateFormat = '%Y-%m';
          break;
        case 'YEARLY':
          dateFormat = '%Y';
          break;
        default:
          dateFormat = '%Y-%m';
      }
      
      // Savings interest summary
      const savingsQuery = `
        SELECT 
          DATE_FORMAT(transaction_date, '${dateFormat}') as period,
          SUM(amount) as total_interest,
          COUNT(*) as transaction_count
        FROM savings_transactions 
        WHERE transaction_type = 'INTEREST'
        GROUP BY DATE_FORMAT(transaction_date, '${dateFormat}')
        ORDER BY period DESC
        LIMIT 12
      `;
      
      // Loan interest summary
      const loanQuery = `
        SELECT 
          DATE_FORMAT(transaction_date, '${dateFormat}') as period,
          SUM(amount) as total_interest,
          COUNT(*) as transaction_count
        FROM loan_transactions 
        WHERE transaction_type = 'INTEREST'
        GROUP BY DATE_FORMAT(transaction_date, '${dateFormat}')
        ORDER BY period DESC
        LIMIT 12
      `;
      
      const [savingsInterest, loanInterest] = await Promise.all([
        query(savingsQuery),
        query(loanQuery)
      ]);
      
      return {
        period,
        savings_interest: savingsInterest,
        loan_interest: loanInterest
      };
    } catch (error) {
      throw error;
    }
  }

  static async updateInterestRates(savingsRate, loanRate) {
    try {
      // Update default interest rates in system settings
      await query(`
        INSERT INTO system_settings (setting_key, setting_value, updated_at)
        VALUES ('DEFAULT_SAVINGS_INTEREST_RATE', ?, NOW())
        ON DUPLICATE KEY UPDATE setting_value = ?, updated_at = NOW()
      `, [savingsRate, savingsRate]);
      
      await query(`
        INSERT INTO system_settings (setting_key, setting_value, updated_at)
        VALUES ('DEFAULT_LOAN_INTEREST_RATE', ?, NOW())
        ON DUPLICATE KEY UPDATE setting_value = ?, updated_at = NOW()
      `, [loanRate, loanRate]);
      
      return { message: 'Interest rates updated successfully' };
    } catch (error) {
      throw error;
    }
  }

  static async getCurrentInterestRates() {
    try {
      const [settings] = await query(`
        SELECT setting_key, setting_value 
        FROM system_settings 
        WHERE setting_key IN ('DEFAULT_SAVINGS_INTEREST_RATE', 'DEFAULT_LOAN_INTEREST_RATE')
      `);
      
      const rates = {};
      settings.forEach(setting => {
        rates[setting.setting_key] = parseFloat(setting.setting_value);
      });
      
      return {
        savings_rate: rates.DEFAULT_SAVINGS_INTEREST_RATE || 0.05,
        loan_rate: rates.DEFAULT_LOAN_INTEREST_RATE || 0.15
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = InterestService;
