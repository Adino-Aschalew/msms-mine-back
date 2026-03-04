const { query } = require('../config/database');
const NotificationService = require('../services/notification.service');
const { auditLog } = require('../middleware/audit');

class LoanPenaltyJob {
  static async execute(adminId = null) {
    try {
      console.log('⚠️  Starting loan penalty calculation job...');
      
      const results = {
        processed: 0,
        failed: 0,
        totalPenalties: 0,
        totalAmount: 0,
        penalties: [],
        errors: []
      };
      
      // Get overdue loans
      const overdueLoans = await this.getOverdueLoans();
      
      console.log(`📊 Found ${overdueLoans.length} overdue loans`);
      
      for (const loan of overdueLoans) {
        try {
          const penaltyResult = await this.processLoanPenalty(loan);
          
          if (penaltyResult.penaltyApplied) {
            results.processed++;
            results.totalPenalties++;
            results.totalAmount += penaltyResult.penaltyAmount;
            results.penalties.push(penaltyResult);
            
            // Send notification to user
            await NotificationService.createNotification(
              loan.user_id,
              'Loan Penalty Applied',
              `A penalty of ${penaltyResult.penaltyAmount} has been applied to your loan due to ${penaltyResult.overdueDays} days overdue.`,
              'WARNING'
            );
            
            console.log(`⚠️  Applied penalty for loan ${loan.id}: ${penaltyResult.penaltyAmount}`);
          }
          
        } catch (error) {
          results.failed++;
          results.errors.push({
            loanId: loan.id,
            userId: loan.user_id,
            error: error.message
          });
          
          console.error(`❌ Failed to process penalty for loan ${loan.id}:`, error);
        }
      }
      
      // Log job completion
      if (adminId) {
        await auditLog(adminId, 'LOAN_PENALTY_JOB', 'penalties', null, null, results, '127.0.0.1', 'System Job');
      }
      
      console.log(`🎉 Loan penalty job completed. Processed: ${results.processed}, Failed: ${results.failed}, Total Amount: ${results.totalAmount}`);
      
      return results;
      
    } catch (error) {
      console.error('💥 Loan penalty job failed:', error);
      throw error;
    }
  }

  static async getOverdueLoans() {
    try {
      const [loans] = await query(`
        SELECT 
          l.*,
          ep.first_name,
          ep.last_name,
          ep.email,
          DATEDIFF(NOW(), l.next_payment_date) as overdue_days
        FROM loans l
        LEFT JOIN users u ON l.user_id = u.id
        LEFT JOIN employee_profiles ep ON u.id = ep.user_id
        WHERE l.status IN ('ACTIVE', 'OVERDUE')
        AND l.next_payment_date < NOW()
        AND l.outstanding_balance > 0
        ORDER BY l.next_payment_date ASC
      `);
      
      return loans;
    } catch (error) {
      console.error('Error getting overdue loans:', error);
      throw error;
    }
  }

  static async processLoanPenalty(loan) {
    const overdueDays = loan.overdue_days;
    const outstandingBalance = parseFloat(loan.outstanding_balance);
    
    // Calculate penalty based on overdue days and balance
    const penaltyRate = this.getPenaltyRate(overdueDays);
    const penaltyAmount = outstandingBalance * penaltyRate;
    
    if (penaltyAmount <= 0) {
      return { penaltyApplied: false, reason: 'No penalty applicable' };
    }
    
    // Add penalty transaction
    await this.addPenaltyTransaction(loan, penaltyAmount, overdueDays);
    
    // Update loan balance
    await this.updateLoanBalance(loan.id, outstandingBalance + penaltyAmount);
    
    // Update loan status if severely overdue
    if (overdueDays > 90) {
      await this.updateLoanStatus(loan.id, 'SEVERELY_OVERDUE');
    } else if (overdueDays > 30 && loan.status === 'ACTIVE') {
      await this.updateLoanStatus(loan.id, 'OVERDUE');
    }
    
    return {
      penaltyApplied: true,
      loanId: loan.id,
      userId: loan.user_id,
      penaltyAmount,
      overdueDays,
      penaltyRate,
      newBalance: outstandingBalance + penaltyAmount
    };
  }

  static getPenaltyRate(overdueDays) {
    // Penalty rates based on overdue days
    if (overdueDays <= 7) {
      return 0; // No penalty for 1 week grace period
    } else if (overdueDays <= 30) {
      return 0.01; // 1% for 8-30 days
    } else if (overdueDays <= 60) {
      return 0.02; // 2% for 31-60 days
    } else if (overdueDays <= 90) {
      return 0.03; // 3% for 61-90 days
    } else {
      return 0.05; // 5% for 90+ days
    }
  }

  static async addPenaltyTransaction(loan, penaltyAmount, overdueDays) {
    try {
      const insertQuery = `
        INSERT INTO loan_transactions (loan_id, user_id, transaction_type, amount, balance_before, balance_after, reference_id, description, transaction_date)
        VALUES (?, ?, 'PENALTY', ?, ?, ?, ?, ?, NOW())
      `;
      
      await query(insertQuery, [
        loan.id,
        loan.user_id,
        penaltyAmount,
        loan.outstanding_balance,
        loan.outstanding_balance + penaltyAmount,
        `PENALTY_${new Date().toISOString().slice(0, 7)}`,
        `Penalty for ${overdueDays} days overdue`
      ]);
      
    } catch (error) {
      console.error('Error adding penalty transaction:', error);
      throw error;
    }
  }

  static async updateLoanBalance(loanId, newBalance) {
    try {
      const updateQuery = `
        UPDATE loans 
        SET outstanding_balance = ?, updated_at = NOW()
        WHERE id = ?
      `;
      
      await query(updateQuery, [newBalance, loanId]);
      
    } catch (error) {
      console.error('Error updating loan balance:', error);
      throw error;
    }
  }

  static async updateLoanStatus(loanId, status) {
    try {
      const updateQuery = `
        UPDATE loans 
        SET status = ?, updated_at = NOW()
        WHERE id = ?
      `;
      
      await query(updateQuery, [status, loanId]);
      
    } catch (error) {
      console.error('Error updating loan status:', error);
      throw error;
    }
  }

  static async schedule() {
    const cron = require('node-cron');
    
    // Schedule job to run every Sunday at 11 PM
    cron.schedule('0 23 * * 0', async () => {
      try {
        await this.execute();
      } catch (error) {
        console.error('Scheduled loan penalty job failed:', error);
      }
    }, {
      scheduled: true,
      timezone: 'UTC'
    });
    
    console.log('📅 Loan penalty job scheduled: 0 23 * * 0 (Every Sunday at 11 PM UTC)');
  }

  static async runManual(adminId) {
    try {
      const results = await this.execute(adminId);
      
      return {
        success: true,
        message: 'Manual loan penalty job completed',
        data: results
      };
      
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  static async getJobStatus() {
    try {
      const { query } = require('../config/database');
      
      // Get last execution details from audit logs
      const [lastExecution] = await query(`
        SELECT * FROM audit_logs 
        WHERE action = 'LOAN_PENALTY_JOB' 
        ORDER BY created_at DESC 
        LIMIT 1
      `);
      
      const status = {
        lastRun: lastExecution ? lastExecution.created_at : null,
        lastResults: lastExecution ? JSON.parse(lastExecution.new_values || '{}') : null,
        nextRun: this.getNextRunDate(),
        isActive: true
      };
      
      return status;
      
    } catch (error) {
      console.error('Error getting loan penalty job status:', error);
      return {
        lastRun: null,
        lastResults: null,
        nextRun: this.getNextRunDate(),
        isActive: false,
        error: error.message
      };
    }
  }

  static getNextRunDate() {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday
    
    let daysUntilSunday = (7 - currentDay) % 7;
    if (daysUntilSunday === 0 && now.getHours() >= 23) {
      daysUntilSunday = 7; // Next Sunday if it's already past 11 PM on Sunday
    }
    
    const nextRun = new Date(now);
    nextRun.setDate(now.getDate() + daysUntilSunday);
    nextRun.setHours(23, 0, 0, 0);
    
    return nextRun;
  }

  static async getPenaltyStatistics() {
    try {
      const { query } = require('../config/database');
      
      // Get penalty statistics for the last 12 months
      const [stats] = await query(`
        SELECT 
          DATE_FORMAT(created_at, '%Y-%m') as month,
          COUNT(*) as penalty_count,
          SUM(amount) as total_penalty_amount,
          AVG(amount) as average_penalty
        FROM loan_transactions 
        WHERE transaction_type = 'PENALTY'
        AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY month DESC
      `);
      
      // Get current overdue loan summary
      const [overdueSummary] = await query(`
        SELECT 
          COUNT(*) as total_overdue,
          SUM(outstanding_balance) as total_overdue_balance,
          AVG(DATEDIFF(NOW(), next_payment_date)) as average_overdue_days
        FROM loans 
        WHERE status IN ('ACTIVE', 'OVERDUE')
        AND next_payment_date < NOW()
        AND outstanding_balance > 0
      `);
      
      return {
        monthlyStats: stats,
        currentOverdue: overdueSummary[0] || {
          total_overdue: 0,
          total_overdue_balance: 0,
          average_overdue_days: 0
        }
      };
      
    } catch (error) {
      console.error('Error getting penalty statistics:', error);
      return {
        monthlyStats: [],
        currentOverdue: {
          total_overdue: 0,
          total_overdue_balance: 0,
          average_overdue_days: 0
        },
        error: error.message
      };
    }
  }

  static async getOverdueLoanReport() {
    try {
      const overdueLoans = await this.getOverdueLoans();
      
      // Group by overdue days ranges
      const report = {
        total_overdue: overdueLoans.length,
        total_balance: overdueLoans.reduce((sum, loan) => sum + parseFloat(loan.outstanding_balance), 0),
        overdue_ranges: {
          '1-7_days': overdueLoans.filter(loan => loan.overdue_days <= 7).length,
          '8-30_days': overdueLoans.filter(loan => loan.overdue_days > 7 && loan.overdue_days <= 30).length,
          '31-60_days': overdueLoans.filter(loan => loan.overdue_days > 30 && loan.overdue_days <= 60).length,
          '61-90_days': overdueLoans.filter(loan => loan.overdue_days > 60 && loan.overdue_days <= 90).length,
          '90+_days': overdueLoans.filter(loan => loan.overdue_days > 90).length
        },
        loans: overdueLoans.map(loan => ({
          id: loan.id,
          user_id: loan.user_id,
          employee_id: loan.employee_id,
          borrower_name: `${loan.first_name} ${loan.last_name}`,
          email: loan.email,
          outstanding_balance: loan.outstanding_balance,
          overdue_days: loan.overdue_days,
          next_payment_date: loan.next_payment_date,
          status: loan.status
        }))
      };
      
      return report;
      
    } catch (error) {
      console.error('Error getting overdue loan report:', error);
      throw error;
    }
  }

  static async waivePenalty(penaltyId, adminId, reason) {
    try {
      const { query } = require('../config/database');
      
      // Get penalty transaction details
      const [penalty] = await query(`
        SELECT * FROM loan_transactions 
        WHERE id = ? AND transaction_type = 'PENALTY'
      `, [penaltyId]);
      
      if (!penalty || !penalty[0]) {
        throw new Error('Penalty transaction not found');
      }
      
      const penaltyData = penalty[0];
      
      // Create waiver transaction
      await query(`
        INSERT INTO loan_transactions (loan_id, user_id, transaction_type, amount, balance_before, balance_after, reference_id, description, transaction_date)
        VALUES (?, ?, 'PENALTY_WAIVER', ?, ?, ?, ?, ?, NOW())
      `, [
        penaltyData.loan_id,
        penaltyData.user_id,
        -penaltyData.amount,
        penaltyData.balance_after,
        penaltyData.balance_before,
        `WAIVER_${penaltyId}`,
        `Penalty waived: ${reason}`
      ]);
      
      // Update loan balance
      await query(`
        UPDATE loans 
        SET outstanding_balance = ?, updated_at = NOW()
        WHERE id = ?
      `, [penaltyData.balance_before, penaltyData.loan_id]);
      
      // Log waiver
      await auditLog(adminId, 'PENALTY_WAIVER', 'loan_transactions', penaltyId, null, { reason, amount: penaltyData.amount }, '127.0.0.1', 'Admin');
      
      // Send notification to user
      await NotificationService.createNotification(
        penaltyData.user_id,
        'Penalty Waived',
        `A penalty of ${penaltyData.amount} has been waived from your loan account.`,
        'SUCCESS'
      );
      
      return {
        success: true,
        message: 'Penalty waived successfully',
        data: {
          penaltyId,
          amount: penaltyData.amount,
          reason
        }
      };
      
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  static async validateJobConfiguration() {
    const issues = [];
    
    // Check if required environment variables are set
    if (!process.env.JWT_SECRET) {
      issues.push('JWT_SECRET environment variable not set');
    }
    
    // Check database connectivity
    try {
      const { query } = require('../config/database');
      await query('SELECT 1');
    } catch (error) {
      issues.push('Database connectivity failed: ' + error.message);
    }
    
    // Check if loan tables exist
    try {
      const { query } = require('../config/database');
      await query('SELECT 1 FROM loans LIMIT 1');
      await query('SELECT 1 FROM loan_transactions LIMIT 1');
    } catch (error) {
      issues.push('Loan tables not found or inaccessible');
    }
    
    return {
      isValid: issues.length === 0,
      issues,
      message: issues.length === 0 ? 'Loan penalty job configuration is valid' : 'Loan penalty job configuration has issues'
    };
  }
}

module.exports = LoanPenaltyJob;
