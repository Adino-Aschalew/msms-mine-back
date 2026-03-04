const InterestService = require('../services/interest.service');
const NotificationService = require('../services/notification.service');
const { auditLog } = require('../middleware/audit');

class InterestJob {
  static async execute(adminId = null) {
    try {
      console.log('💰 Starting interest calculation job...');
      
      const results = {
        savings: {
          processed: 0,
          failed: 0,
          totalInterest: 0,
          errors: []
        },
        loans: {
          processed: 0,
          failed: 0,
          totalInterest: 0,
          errors: []
        }
      };
      
      // Process savings interest
      console.log('📊 Processing savings interest...');
      const savingsResults = await InterestService.applyInterestToAllSavingsAccounts();
      results.savings = savingsResults;
      
      // Process loan interest
      console.log('📊 Processing loan interest...');
      const loanResults = await InterestService.applyInterestToAllLoans();
      results.loans = loanResults;
      
      // Send summary notification to admin
      if (adminId) {
        await NotificationService.createNotification(
          adminId,
          'Interest Calculation Completed',
          `Savings: ${savingsResults.processed} processed, ${savingsResults.failed} failed. Loans: ${loanResults.processed} processed, ${loanResults.failed} failed.`,
          'INFO'
        );
        
        // Log job completion
        await auditLog(adminId, 'INTEREST_CALCULATION_JOB', 'interest_transactions', null, null, results, '127.0.0.1', 'System Job');
      }
      
      console.log(`🎉 Interest job completed. Savings: ${savingsResults.processed} processed, ${savingsResults.failed} failed. Loans: ${loanResults.processed} processed, ${loanResults.failed} failed`);
      
      return results;
      
    } catch (error) {
      console.error('💥 Interest calculation job failed:', error);
      throw error;
    }
  }

  static async schedule() {
    const cron = require('node-cron');
    
    // Schedule job to run on the 1st of every month at 1 AM
    cron.schedule('0 1 1 * *', async () => {
      try {
        await this.execute();
      } catch (error) {
        console.error('Scheduled interest job failed:', error);
      }
    }, {
      scheduled: true,
      timezone: 'UTC'
    });
    
    console.log('📅 Interest calculation job scheduled: 0 1 1 * * (1st of every month at 1 AM UTC)');
  }

  static async runManual(adminId) {
    try {
      const results = await this.execute(adminId);
      
      return {
        success: true,
        message: 'Manual interest calculation job completed',
        data: results
      };
      
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  static async runSavingsInterestOnly(adminId) {
    try {
      console.log('💰 Running savings interest calculation only...');
      
      const results = await InterestService.applyInterestToAllSavingsAccounts();
      
      if (adminId) {
        await auditLog(adminId, 'SAVINGS_INTEREST_JOB', 'savings_transactions', null, null, results, '127.0.0.1', 'System Job');
      }
      
      return {
        success: true,
        message: 'Savings interest calculation completed',
        data: results
      };
      
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  static async runLoanInterestOnly(adminId) {
    try {
      console.log('💰 Running loan interest calculation only...');
      
      const results = await InterestService.applyInterestToAllLoans();
      
      if (adminId) {
        await auditLog(adminId, 'LOAN_INTEREST_JOB', 'loan_transactions', null, null, results, '127.0.0.1', 'System Job');
      }
      
      return {
        success: true,
        message: 'Loan interest calculation completed',
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
        WHERE action IN ('INTEREST_CALCULATION_JOB', 'SAVINGS_INTEREST_JOB', 'LOAN_INTEREST_JOB') 
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
      console.error('Error getting interest job status:', error);
      return {
        lastRun: null,
        lastResults: null,
        nextRun: this.getNextRunDate(),
        isActive: false,
        error: error.message
      };
    }
  }

  static async getNextRunDate() {
    const now = new Date();
    const currentDay = now.getDate();
    
    let nextRun = new Date(now.getFullYear(), now.getMonth(), 1, 1, 0, 0, 0);
    
    // If the 1st has passed this month, schedule for next month
    if (currentDay > 1) {
      nextRun = new Date(now.getFullYear(), now.getMonth() + 1, 1, 1, 0, 0, 0);
    }
    
    return nextRun;
  }

  static async getCurrentInterestRates() {
    try {
      return await InterestService.getCurrentInterestRates();
    } catch (error) {
      console.error('Error getting current interest rates:', error);
      return {
        savings_rate: 0.05,
        loan_rate: 0.15,
        error: error.message
      };
    }
  }

  static async updateInterestRates(savingsRate, loanRate, adminId) {
    try {
      await InterestService.updateInterestRates(savingsRate, loanRate);
      
      if (adminId) {
        await auditLog(adminId, 'INTEREST_RATES_UPDATE', 'system_settings', null, null, { savingsRate, loanRate }, '127.0.0.1', 'Admin');
      }
      
      return {
        success: true,
        message: 'Interest rates updated successfully',
        data: { savings_rate: savingsRate, loan_rate: loanRate }
      };
      
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  static async getInterestSummary(period = 'MONTHLY') {
    try {
      return await InterestService.getInterestSummary(period);
    } catch (error) {
      console.error('Error getting interest summary:', error);
      return {
        period,
        savings_interest: [],
        loan_interest: [],
        error: error.message
      };
    }
  }

  static async getJobStatistics() {
    try {
      const { query } = require('../config/database');
      
      // Get statistics for the last 12 months
      const [stats] = await query(`
        SELECT 
          DATE_FORMAT(created_at, '%Y-%m') as month,
          action,
          COUNT(*) as job_executions,
          SUM(CASE WHEN JSON_EXTRACT(new_values, '$.savings.processed') > 0 THEN JSON_EXTRACT(new_values, '$.savings.processed') ELSE 0 END) as savings_processed,
          SUM(CASE WHEN JSON_EXTRACT(new_values, '$.loans.processed') > 0 THEN JSON_EXTRACT(new_values, '$.loans.processed') ELSE 0 END) as loans_processed,
          SUM(CASE WHEN JSON_EXTRACT(new_values, '$.savings.totalInterest') > 0 THEN JSON_EXTRACT(new_values, '$.savings.totalInterest') ELSE 0 END) as total_savings_interest,
          SUM(CASE WHEN JSON_EXTRACT(new_values, '$.loans.totalInterest') > 0 THEN JSON_EXTRACT(new_values, '$.loans.totalInterest') ELSE 0 END) as total_loan_interest
        FROM audit_logs 
        WHERE action IN ('INTEREST_CALCULATION_JOB', 'SAVINGS_INTEREST_JOB', 'LOAN_INTEREST_JOB') 
        AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        GROUP BY DATE_FORMAT(created_at, '%Y-%m'), action
        ORDER BY month DESC
      `);
      
      return {
        monthlyStats: stats,
        totalExecutions: stats.reduce((sum, stat) => sum + stat.job_executions, 0),
        totalSavingsProcessed: stats.reduce((sum, stat) => sum + stat.savings_processed, 0),
        totalLoansProcessed: stats.reduce((sum, stat) => sum + stat.loans_processed, 0),
        totalSavingsInterest: stats.reduce((sum, stat) => sum + stat.total_savings_interest, 0),
        totalLoanInterest: stats.reduce((sum, stat) => sum + stat.total_loan_interest, 0)
      };
      
    } catch (error) {
      console.error('Error getting interest job statistics:', error);
      return {
        monthlyStats: [],
        totalExecutions: 0,
        totalSavingsProcessed: 0,
        totalLoansProcessed: 0,
        totalSavingsInterest: 0,
        totalLoanInterest: 0,
        error: error.message
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
    
    // Check if interest tables exist
    try {
      const { query } = require('../config/database');
      await query('SELECT 1 FROM savings_transactions WHERE transaction_type = "INTEREST" LIMIT 1');
      await query('SELECT 1 FROM loan_transactions WHERE transaction_type = "INTEREST" LIMIT 1');
    } catch (error) {
      issues.push('Interest transaction tables not found or inaccessible');
    }
    
    return {
      isValid: issues.length === 0,
      issues,
      message: issues.length === 0 ? 'Interest job configuration is valid' : 'Interest job configuration has issues'
    };
  }

  static async getInterestProjections(months = 12) {
    try {
      const { query } = require('../config/database');
      
      // Get current totals
      const [currentTotals] = await query(`
        SELECT 
          (SELECT SUM(current_balance) FROM savings_accounts WHERE account_status = 'ACTIVE') as total_savings,
          (SELECT SUM(outstanding_balance) FROM loans WHERE status IN ('ACTIVE', 'OVERDUE')) as total_loans
      `);
      
      const { getCurrentInterestRates } = require('../services/interest.service');
      const rates = await getCurrentInterestRates();
      
      const totalSavings = parseFloat(currentTotals[0].total_savings) || 0;
      const totalLoans = parseFloat(currentTotals[0].total_loans) || 0;
      
      const projections = [];
      let projectedSavings = totalSavings;
      let projectedLoans = totalLoans;
      
      for (let i = 1; i <= months; i++) {
        const savingsInterest = projectedSavings * (rates.savings_rate / 12);
        const loanInterest = projectedLoans * (rates.loan_rate / 12);
        
        projectedSavings += savingsInterest;
        projectedLoans += loanInterest;
        
        projections.push({
          month: i,
          projected_savings: projectedSavings,
          projected_loans: projectedLoans,
          savings_interest: savingsInterest,
          loan_interest: loanInterest,
          total_interest: savingsInterest + loanInterest
        });
      }
      
      return {
        current_totals: { total_savings: totalSavings, total_loans: totalLoans },
        interest_rates: rates,
        projections
      };
      
    } catch (error) {
      console.error('Error getting interest projections:', error);
      return {
        current_totals: { total_savings: 0, total_loans: 0 },
        interest_rates: { savings_rate: 0.05, loan_rate: 0.15 },
        projections: [],
        error: error.message
      };
    }
  }
}

module.exports = InterestJob;
