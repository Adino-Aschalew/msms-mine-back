const cron = require('node-cron');
const AnalyticsService = require('./analyticsService');
const Savings = require('../models/Savings');
const Loan = require('../models/Loan');
const { query } = require('../config/database');

class SchedulerService {
  static initialize() {
    console.log('🕐 Initializing scheduler service...');
    
    // Daily at 2 AM - Generate user registration and loan demand forecasts
    cron.schedule('0 2 * * *', async () => {
      try {
        console.log('📊 Running daily analytics forecasts...');
        
        const [userForecast, loanForecast] = await Promise.all([
          AnalyticsService.forecastUserRegistrations('MONTHLY', 12),
          AnalyticsService.forecastLoanDemand('MONTHLY', 12)
        ]);
        
        await Promise.all([
          AnalyticsService.saveForecast(userForecast),
          AnalyticsService.saveForecast(loanForecast)
        ]);
        
        console.log('✅ Daily forecasts completed successfully');
      } catch (error) {
        console.error('❌ Error in daily forecast job:', error);
      }
    }, {
      scheduled: true,
      timezone: 'UTC'
    });
    
    // Monthly on 1st at 1 AM - Calculate savings interest and liquidity forecast
    cron.schedule('0 1 1 * *', async () => {
      try {
        console.log('💰 Running monthly interest calculation...');
        
        const interestResults = await Savings.processMonthlyInterest();
        console.log(`💸 Processed interest for ${interestResults.filter(r => r.success).length} accounts`);
        
        console.log('📈 Generating monthly liquidity forecast...');
        const liquidityForecast = await AnalyticsService.forecastLiquidity('MONTHLY', 12);
        await AnalyticsService.saveForecast(liquidityForecast);
        
        console.log('✅ Monthly jobs completed successfully');
      } catch (error) {
        console.error('❌ Error in monthly job:', error);
      }
    }, {
      scheduled: true,
      timezone: 'UTC'
    });
    
    // Weekly on Sunday at 11 PM - Check for missed savings and loan defaults
    cron.schedule('0 23 * * 0', async () => {
      try {
        console.log('🔍 Running weekly compliance checks...');
        
        const [missedSavings, loanDefaults] = await Promise.all([
          Savings.checkMissedSavings(),
          Loan.checkLoanDefaults()
        ]);
        
        console.log(`⚠️  Found ${missedSavings.filter(r => r.success).length} missed savings cases`);
        console.log(`⚠️  Found ${loanDefaults.filter(r => r.success).length} loan default cases`);
        
        console.log('✅ Weekly compliance checks completed');
      } catch (error) {
        console.error('❌ Error in weekly compliance check:', error);
      }
    }, {
      scheduled: true,
      timezone: 'UTC'
    });
    
    // Quarterly on 1st at 3 AM - Generate risk indicators and comprehensive forecasts
    cron.schedule('0 3 1 */3 *', async () => {
      try {
        console.log('🎯 Running quarterly risk assessment...');
        
        const riskIndicators = await AnalyticsService.calculateRiskIndicators();
        await AnalyticsService.saveForecast(riskIndicators);
        
        console.log('📊 Generating comprehensive quarterly forecasts...');
        const [
          userForecast,
          loanForecast,
          liquidityForecast
        ] = await Promise.all([
          AnalyticsService.forecastUserRegistrations('QUARTERLY', 4),
          AnalyticsService.forecastLoanDemand('QUARTERLY', 4),
          AnalyticsService.forecastLiquidity('QUARTERLY', 4)
        ]);
        
        await Promise.all([
          AnalyticsService.saveForecast(userForecast),
          AnalyticsService.saveForecast(loanForecast),
          AnalyticsService.saveForecast(liquidityForecast)
        ]);
        
        console.log('✅ Quarterly risk assessment completed');
      } catch (error) {
        console.error('❌ Error in quarterly risk assessment:', error);
      }
    }, {
      scheduled: true,
      timezone: 'UTC'
    });
    
    // Yearly on January 1st at 4 AM - Generate yearly forecasts and cleanup
    cron.schedule('0 4 1 1 *', async () => {
      try {
        console.log('🗓️  Running yearly analytics...');
        
        const [
          userForecast,
          loanForecast,
          liquidityForecast,
          riskIndicators
        ] = await Promise.all([
          AnalyticsService.forecastUserRegistrations('YEARLY', 5),
          AnalyticsService.forecastLoanDemand('YEARLY', 5),
          AnalyticsService.forecastLiquidity('YEARLY', 5),
          AnalyticsService.calculateRiskIndicators()
        ]);
        
        await Promise.all([
          AnalyticsService.saveForecast(userForecast),
          AnalyticsService.saveForecast(loanForecast),
          AnalyticsService.saveForecast(liquidityForecast),
          AnalyticsService.saveForecast(riskIndicators)
        ]);
        
        console.log('🧹 Cleaning up old forecast records...');
        await this.cleanupOldRecords();
        
        console.log('✅ Yearly analytics completed');
      } catch (error) {
        console.error('❌ Error in yearly analytics:', error);
      }
    }, {
      scheduled: true,
      timezone: 'UTC'
    });
    
    // Every 6 hours - System health check
    cron.schedule('0 */6 * * *', async () => {
      try {
        console.log('🏥 Running system health check...');
        
        const healthStatus = await this.performHealthCheck();
        
        if (healthStatus.status === 'unhealthy') {
          console.error('🚨 System health check failed:', healthStatus.issues);
          await this.logSystemIssue(healthStatus.issues);
        } else {
          console.log('✅ System health check passed');
        }
      } catch (error) {
        console.error('❌ Error in system health check:', error);
      }
    }, {
      scheduled: true,
      timezone: 'UTC'
    });
    
    console.log('✅ Scheduler service initialized successfully');
  }
  
  static async cleanupOldRecords() {
    try {
      const cleanupDate = new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000); // 2 years ago
      
      const deleteQuery = `
        DELETE FROM ai_forecasts 
        WHERE created_at < ? 
        AND forecast_type != 'RISK_INDICATORS'
      `;
      
      const result = await query(deleteQuery, [cleanupDate]);
      console.log(`🗑️  Cleaned up ${result.affectedRows} old forecast records`);
      
    } catch (error) {
      console.error('❌ Error cleaning up old records:', error);
    }
  }
  
  static async performHealthCheck() {
    const issues = [];
    
    try {
      // Check database connectivity
      await query('SELECT 1');
      
      // Check for stuck payroll batches
      const stuckPayroll = await query(`
        SELECT COUNT(*) as count 
        FROM payroll_batches 
        WHERE status IN ('UPLOADED', 'VALIDATED') 
        AND created_at < DATE_SUB(NOW(), INTERVAL 7 DAY)
      `);
      
      if (stuckPayroll[0].count > 0) {
        issues.push(`${stuckPayroll[0].count} payroll batches stuck in processing`);
      }
      
      // Check for long-pending loan applications
      const pendingLoans = await query(`
        SELECT COUNT(*) as count 
        FROM loan_applications 
        WHERE status = 'PENDING' 
        AND created_at < DATE_SUB(NOW(), INTERVAL 14 DAY)
      `);
      
      if (pendingLoans[0].count > 0) {
        issues.push(`${pendingLoans[0].count} loan applications pending for over 14 days`);
      }
      
      // Check for high penalty accumulation
      const highPenalties = await query(`
        SELECT COUNT(*) as count 
        FROM penalties 
        WHERE status = 'ACTIVE' 
        AND amount > 1000
        AND created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
      `);
      
      if (highPenalties[0].count > 10) {
        issues.push(`${highPenalties[0].count} high-value penalties outstanding`);
      }
      
      return {
        status: issues.length === 0 ? 'healthy' : 'unhealthy',
        issues,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      return {
        status: 'unhealthy',
        issues: [`Database connectivity error: ${error.message}`],
        timestamp: new Date().toISOString()
      };
    }
  }
  
  static async logSystemIssue(issues) {
    try {
      const insertQuery = `
        INSERT INTO notifications (title, message, notification_type, created_at)
        VALUES (?, ?, 'ERROR', NOW())
      `;
      
      await query(insertQuery, [
        'System Health Alert',
        `System health check detected issues: ${issues.join(', ')}`
      ]);
      
    } catch (error) {
      console.error('Failed to log system issue:', error);
    }
  }
  
  static async runManualJob(jobType) {
    try {
      console.log(`🔧 Running manual job: ${jobType}`);
      
      switch (jobType) {
        case 'interest_calculation':
          const results = await Savings.processMonthlyInterest();
          return { success: true, message: `Processed interest for ${results.filter(r => r.success).length} accounts`, data: results };
          
        case 'missed_savings_check':
          const missedResults = await Savings.checkMissedSavings();
          return { success: true, message: `Found ${missedResults.filter(r => r.success).length} missed savings cases`, data: missedResults };
          
        case 'loan_defaults_check':
          const defaultResults = await Loan.checkLoanDefaults();
          return { success: true, message: `Found ${defaultResults.filter(r => r.success).length} loan default cases`, data: defaultResults };
          
        case 'user_forecast':
          const userForecast = await AnalyticsService.forecastUserRegistrations('MONTHLY', 12);
          await AnalyticsService.saveForecast(userForecast);
          return { success: true, message: 'User registration forecast generated', data: userForecast };
          
        case 'loan_forecast':
          const loanForecast = await AnalyticsService.forecastLoanDemand('MONTHLY', 12);
          await AnalyticsService.saveForecast(loanForecast);
          return { success: true, message: 'Loan demand forecast generated', data: loanForecast };
          
        case 'liquidity_forecast':
          const liquidityForecast = await AnalyticsService.forecastLiquidity('MONTHLY', 12);
          await AnalyticsService.saveForecast(liquidityForecast);
          return { success: true, message: 'Liquidity forecast generated', data: liquidityForecast };
          
        case 'risk_assessment':
          const riskIndicators = await AnalyticsService.calculateRiskIndicators();
          await AnalyticsService.saveForecast(riskIndicators);
          return { success: true, message: 'Risk assessment completed', data: riskIndicators };
          
        case 'health_check':
          const healthStatus = await this.performHealthCheck();
          return { success: true, message: 'Health check completed', data: healthStatus };
          
        default:
          return { success: false, message: 'Unknown job type' };
      }
      
    } catch (error) {
      console.error(`Error running manual job ${jobType}:`, error);
      return { success: false, message: error.message };
    }
  }
  
  static getJobStatus() {
    return {
      scheduler_active: true,
      jobs: [
        { name: 'daily_forecasts', schedule: '0 2 * * *', description: 'Daily analytics forecasts' },
        { name: 'monthly_interest', schedule: '0 1 1 * *', description: 'Monthly interest calculation' },
        { name: 'weekly_compliance', schedule: '0 23 * * 0', description: 'Weekly compliance checks' },
        { name: 'quarterly_risk', schedule: '0 3 1 */3 *', description: 'Quarterly risk assessment' },
        { name: 'yearly_analytics', schedule: '0 4 1 1 *', description: 'Yearly analytics and cleanup' },
        { name: 'health_check', schedule: '0 */6 * * *', description: 'System health check' }
      ],
      last_run: new Date().toISOString()
    };
  }
}

module.exports = SchedulerService;
