const SavingsService = require('../modules/savings/savings.service');
const NotificationService = require('../services/notification.service');
const { auditLog } = require('../middleware/audit');

class MonthlySavingsJob {
  static async execute(adminId = null) {
    try {
      console.log('🏦 Starting monthly savings processing job...');
      
      const results = {
        processed: 0,
        failed: 0,
        totalContributions: 0,
        totalAmount: 0,
        errors: []
      };
      
      // Get all active savings accounts
      const { accounts } = await SavingsService.getAllAccounts(1, 1000, { account_status: 'ACTIVE' });
      
      console.log(`📊 Found ${accounts.length} active savings accounts`);
      
      for (const account of accounts) {
        try {
          // Calculate monthly contribution based on salary
          const contributionAmount = await this.calculateMonthlyContribution(account);
          
          if (contributionAmount > 0) {
            // Add automatic contribution
            const contributionResult = await SavingsService.addContribution(
              account.user_id,
              contributionAmount,
              `AUTO_${new Date().toISOString().slice(0, 7)}`,
              'Automatic monthly savings contribution',
              '127.0.0.1',
              'System Job'
            );
            
            results.processed++;
            results.totalContributions++;
            results.totalAmount += contributionAmount;
            
            // Send notification to user
            await NotificationService.createNotification(
              account.user_id,
              'Monthly Savings Processed',
              `Your monthly savings contribution of ${contributionAmount} has been processed. New balance: ${contributionResult.newBalance}`,
              'INFO'
            );
            
            console.log(`✅ Processed contribution for user ${account.user_id}: ${contributionAmount}`);
          }
          
        } catch (error) {
          results.failed++;
          results.errors.push({
            userId: account.user_id,
            accountId: account.id,
            error: error.message
          });
          
          console.error(`❌ Failed to process savings for user ${account.user_id}:`, error);
          
          // Log error notification
          await NotificationService.createNotification(
            account.user_id,
            'Savings Processing Error',
            'There was an error processing your monthly savings contribution. Please contact support.',
            'ERROR'
          );
        }
      }
      
      // Log job completion
      if (adminId) {
        await auditLog(adminId, 'MONTHLY_SAVINGS_JOB', 'savings_accounts', null, null, results, '127.0.0.1', 'System Job');
      }
      
      console.log(`🎉 Monthly savings job completed. Processed: ${results.processed}, Failed: ${results.failed}, Total Amount: ${results.totalAmount}`);
      
      return results;
      
    } catch (error) {
      console.error('💥 Monthly savings job failed:', error);
      throw error;
    }
  }

  static async calculateMonthlyContribution(account) {
    try {
      // Get user's latest payroll record
      const { query } = require('../config/database');
      const [payroll] = await query(`
        SELECT net_salary 
        FROM payroll_records 
        WHERE user_id = ? 
        ORDER BY pay_period DESC 
        LIMIT 1
      `, [account.user_id]);
      
      if (!payroll || !payroll[0]) {
        console.log(`⚠️  No payroll record found for user ${account.user_id}`);
        return 0;
      }
      
      const netSalary = parseFloat(payroll[0].net_salary);
      const savingPercentage = parseFloat(account.saving_percentage);
      
      const contributionAmount = (netSalary * savingPercentage) / 100;
      
      // Ensure minimum contribution of 100
      const minimumContribution = 100;
      return Math.max(contributionAmount, minimumContribution);
      
    } catch (error) {
      console.error(`Error calculating contribution for account ${account.id}:`, error);
      return 0;
    }
  }

  static async schedule() {
    const cron = require('node-cron');
    
    // Schedule job to run on the 25th of every month at 2 AM
    cron.schedule('0 2 25 * *', async () => {
      try {
        await this.execute();
      } catch (error) {
        console.error('Scheduled monthly savings job failed:', error);
      }
    }, {
      scheduled: true,
      timezone: 'UTC'
    });
    
    console.log('📅 Monthly savings job scheduled: 0 2 25 * * (25th of every month at 2 AM UTC)');
  }

  static async runManual(adminId) {
    try {
      const results = await this.execute(adminId);
      
      return {
        success: true,
        message: 'Manual monthly savings job completed',
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
        WHERE action = 'MONTHLY_SAVINGS_JOB' 
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
      console.error('Error getting job status:', error);
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
    const currentDay = now.getDate();
    
    let nextRun = new Date(now.getFullYear(), now.getMonth(), 25, 2, 0, 0, 0);
    
    // If the 25th has passed this month, schedule for next month
    if (currentDay > 25) {
      nextRun = new Date(now.getFullYear(), now.getMonth() + 1, 25, 2, 0, 0, 0);
    }
    
    return nextRun;
  }

  static async validateJobConfiguration() {
    const issues = [];
    
    // Check if required environment variables are set
    if (!process.env.JWT_SECRET) {
      issues.push('JWT_SECRET environment variable not set');
    }
    
    if (!process.env.DATABASE_HOST) {
      issues.push('Database configuration not found');
    }
    
    // Check database connectivity
    try {
      const { query } = require('../config/database');
      await query('SELECT 1');
    } catch (error) {
      issues.push('Database connectivity failed: ' + error.message);
    }
    
    // Check if savings tables exist
    try {
      const { query } = require('../config/database');
      await query('SELECT 1 FROM savings_accounts LIMIT 1');
    } catch (error) {
      issues.push('Savings accounts table not found or inaccessible');
    }
    
    return {
      isValid: issues.length === 0,
      issues,
      message: issues.length === 0 ? 'Job configuration is valid' : 'Job configuration has issues'
    };
  }

  static async getJobStatistics() {
    try {
      const { query } = require('../config/database');
      
      // Get statistics for the last 12 months
      const [stats] = await query(`
        SELECT 
          DATE_FORMAT(created_at, '%Y-%m') as month,
          COUNT(*) as job_executions,
          SUM(CASE WHEN JSON_EXTRACT(new_values, '$.processed') > 0 THEN 1 ELSE 0 END) as successful_executions,
          SUM(JSON_EXTRACT(new_values, '$.processed')) as total_processed,
          SUM(JSON_EXTRACT(new_values, '$.totalAmount')) as total_amount
        FROM audit_logs 
        WHERE action = 'MONTHLY_SAVINGS_JOB' 
        AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY month DESC
      `);
      
      return {
        monthlyStats: stats,
        totalExecutions: stats.reduce((sum, stat) => sum + stat.job_executions, 0),
        totalProcessed: stats.reduce((sum, stat) => sum + stat.total_processed, 0),
        totalAmount: stats.reduce((sum, stat) => sum + stat.total_amount, 0)
      };
      
    } catch (error) {
      console.error('Error getting job statistics:', error);
      return {
        monthlyStats: [],
        totalExecutions: 0,
        totalProcessed: 0,
        totalAmount: 0,
        error: error.message
      };
    }
  }
}

module.exports = MonthlySavingsJob;
