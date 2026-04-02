const SalarySyncService = require('../services/salarySync.service');
const NotificationService = require('../services/notification.service');
const { auditLog } = require('../middleware/audit');

class SalaryMonitorJob {
  static async execute(adminId = null) {
    try {
      console.log('💼 Starting salary monitoring job...');
      
      const results = {
        pendingPayrolls: 0,
        stuckPayrolls: 0,
        notifications: 0,
        alerts: [],
        errors: []
      };
      
      
      const pendingBatches = await this.getPendingPayrollBatches();
      results.pendingPayrolls = pendingBatches.length;
      
      console.log(`📊 Found ${pendingBatches.length} pending payroll batches`);
      
      
      const stuckBatches = await this.getStuckPayrollBatches();
      results.stuckPayrolls = stuckBatches.length;
      
      console.log(`📊 Found ${stuckBatches.length} stuck payroll batches`);
      
      
      for (const batch of stuckBatches) {
        try {
          await this.processStuckBatchAlert(batch, adminId);
          results.notifications++;
          results.alerts.push({
            type: 'stuck_batch',
            batchId: batch.id,
            message: `Payroll batch ${batch.id} stuck for ${batch.days_stuck} days`
          });
        } catch (error) {
          results.errors.push({
            batchId: batch.id,
            error: error.message
          });
        }
      }
      
      
      const pendingLoans = await this.getPendingLoanApplications();
      
      console.log(`📊 Found ${pendingLoans.length} pending loan applications`);
      
      
      for (const loan of pendingLoans) {
        try {
          await this.processPendingLoanAlert(loan, adminId);
          results.notifications++;
          results.alerts.push({
            type: 'pending_loan',
            loanId: loan.id,
            message: `Loan application ${loan.id} pending for ${loan.days_pending} days`
          });
        } catch (error) {
          results.errors.push({
            loanId: loan.id,
            error: error.message
          });
        }
      }
      
      
      const highPenalties = await this.getHighPenalties();
      
      console.log(`📊 Found ${highPenalties.length} high penalty cases`);
      
      
      for (const penalty of highPenalties) {
        try {
          await this.processHighPenaltyAlert(penalty, adminId);
          results.notifications++;
          results.alerts.push({
            type: 'high_penalty',
            penaltyId: penalty.id,
            message: `High penalty amount: ${penalty.amount}`
          });
        } catch (error) {
          results.errors.push({
            penaltyId: penalty.id,
            error: error.message
          });
        }
      }
      
      
      if (adminId) {
        await auditLog(adminId, 'SALARY_MONITOR_JOB', 'system_monitoring', null, null, results, '127.0.0.1', 'System Job');
      }
      
      console.log(`🎉 Salary monitor job completed. Notifications: ${results.notifications}, Errors: ${results.errors.length}`);
      
      return results;
      
    } catch (error) {
      console.error('💥 Salary monitor job failed:', error);
      throw error;
    }
  }

  static async getPendingPayrollBatches() {
    try {
      const { query } = require('../config/database');
      
      const [batches] = await query(`
        SELECT 
          pb.*,
          u.username as uploaded_by_name,
          DATEDIFF(NOW(), pb.created_at) as days_pending
        FROM payroll_batches pb
        LEFT JOIN users u ON pb.uploaded_by = u.id
        WHERE pb.status IN ('UPLOADED', 'VALIDATED')
        ORDER BY pb.created_at ASC
      `);
      
      return batches;
    } catch (error) {
      console.error('Error getting pending payroll batches:', error);
      throw error;
    }
  }

  static async getStuckPayrollBatches() {
    try {
      const { query } = require('../config/database');
      
      const [batches] = await query(`
        SELECT 
          pb.*,
          u.username as uploaded_by_name,
          DATEDIFF(NOW(), pb.created_at) as days_stuck
        FROM payroll_batches pb
        LEFT JOIN users u ON pb.uploaded_by = u.id
        WHERE pb.status IN ('UPLOADED', 'VALIDATED')
        AND pb.created_at < DATE_SUB(NOW(), INTERVAL 7 DAY)
        ORDER BY pb.created_at ASC
      `);
      
      return batches;
    } catch (error) {
      console.error('Error getting stuck payroll batches:', error);
      throw error;
    }
  }

  static async getPendingLoanApplications() {
    try {
      const { query } = require('../config/database');
      
      const [loans] = await query(`
        SELECT 
          la.*,
          u.username,
          ep.first_name,
          ep.last_name,
          u.email,
          DATEDIFF(NOW(), la.created_at) as days_pending
        FROM loan_applications la
        LEFT JOIN users u ON la.user_id = u.id
        LEFT JOIN employee_profiles ep ON u.id = ep.user_id
        WHERE la.status = 'PENDING'
        AND la.created_at < DATE_SUB(NOW(), INTERVAL 14 DAY)
        ORDER BY la.created_at ASC
      `);
      
      return loans;
    } catch (error) {
      console.error('Error getting pending loan applications:', error);
      throw error;
    }
  }

  static async getHighPenalties() {
    try {
      const { query } = require('../config/database');
      
      const [penalties] = await query(`
        SELECT 
          p.*,
          u.username,
          ep.first_name,
          ep.last_name,
          u.email,
          l.employee_id,
          l.outstanding_balance
        FROM penalties p
        LEFT JOIN users u ON p.user_id = u.id
        LEFT JOIN employee_profiles ep ON u.id = ep.user_id
        LEFT JOIN loans l ON p.loan_id = l.id
        WHERE p.status = 'ACTIVE'
        AND p.amount > 1000
        AND p.created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
        ORDER BY p.amount DESC
      `);
      
      return penalties;
    } catch (error) {
      console.error('Error getting high penalties:', error);
      throw error;
    }
  }

  static async processStuckBatchAlert(batch, adminId) {
    try {
      
      await NotificationService.createNotification(
        adminId,
        'Stuck Payroll Batch Alert',
        `Payroll batch ${batch.id} has been stuck in ${batch.status} status for ${batch.days_stuck} days. Please review and process.`,
        'WARNING'
      );
      
      
      if (process.env.PAYROLL_TEAM_EMAIL) {
        await NotificationService.sendEmail(
          process.env.PAYROLL_TEAM_EMAIL,
          'Stuck Payroll Batch Alert',
          `
            <h2>Payroll Batch Alert</h2>
            <p>Payroll batch <strong>${batch.id}</strong> has been stuck in <strong>${batch.status}</strong> status for <strong>${batch.days_stuck}</strong> days.</p>
            <p><strong>Details:</strong></p>
            <ul>
              <li>Batch ID: ${batch.id}</li>
              <li>Status: ${batch.status}</li>
              <li>Uploaded by: ${batch.uploaded_by_name}</li>
              <li>Created: ${batch.created_at}</li>
              <li>Total Records: ${batch.total_records}</li>
            </ul>
            <p>Please review and process this batch as soon as possible.</p>
          `
        );
      }
      
    } catch (error) {
      console.error('Error processing stuck batch alert:', error);
      throw error;
    }
  }

  static async processPendingLoanAlert(loan, adminId) {
    try {
      
      await NotificationService.createNotification(
        adminId,
        'Pending Loan Application Alert',
        `Loan application ${loan.id} for ${loan.first_name} ${loan.last_name} has been pending for ${loan.days_pending} days.`,
        'WARNING'
      );
      
      
      if (process.env.LOAN_COMMITTEE_EMAIL) {
        await NotificationService.sendEmail(
          process.env.LOAN_COMMITTEE_EMAIL,
          'Pending Loan Application Alert',
          `
            <h2>Pending Loan Application Alert</h2>
            <p>Loan application <strong>${loan.id}</strong> has been pending for <strong>${loan.days_pending}</strong> days.</p>
            <p><strong>Applicant Details:</strong></p>
            <ul>
              <li>Name: ${loan.first_name} ${loan.last_name}</li>
              <li>Employee ID: ${loan.employee_id}</li>
              <li>Email: ${loan.email}</li>
              <li>Application Date: ${loan.created_at}</li>
              <li>Loan Amount: ${loan.loan_amount}</li>
            </ul>
            <p>Please review and process this application as soon as possible.</p>
          `
        );
      }
      
      
      await NotificationService.createNotification(
        loan.user_id,
        'Loan Application Update',
        'Your loan application is still under review. We appreciate your patience and will notify you of any updates.',
        'INFO'
      );
      
    } catch (error) {
      console.error('Error processing pending loan alert:', error);
      throw error;
    }
  }

  static async processHighPenaltyAlert(penalty, adminId) {
    try {
      
      await NotificationService.createNotification(
        adminId,
        'High Penalty Alert',
        `High penalty amount of ${penalty.amount} detected for ${penalty.first_name} ${penalty.last_name}.`,
        'WARNING'
      );
      
      
      if (process.env.FINANCE_TEAM_EMAIL) {
        await NotificationService.sendEmail(
          process.env.FINANCE_TEAM_EMAIL,
          'High Penalty Alert',
          `
            <h2>High Penalty Alert</h2>
            <p>A high penalty amount of <strong>${penalty.amount}</strong> has been detected.</p>
            <p><strong>Penalty Details:</strong></p>
            <ul>
              <li>Penalty ID: ${penalty.id}</li>
              <li>User: ${penalty.first_name} ${penalty.last_name}</li>
              <li>Employee ID: ${penalty.employee_id}</li>
              <li>Amount: ${penalty.amount}</li>
              <li>Created: ${penalty.created_at}</li>
              <li>Outstanding Balance: ${penalty.outstanding_balance}</li>
            </ul>
            <p>Please review this case and consider appropriate action.</p>
          `
        );
      }
      
      
      await NotificationService.createNotification(
        penalty.user_id,
        'Account Alert',
        `A penalty of ${penalty.amount} has been applied to your account. Please contact support if you have any questions.`,
        'WARNING'
      );
      
    } catch (error) {
      console.error('Error processing high penalty alert:', error);
      throw error;
    }
  }

  static async schedule() {
    const cron = require('node-cron');
    
    
    cron.schedule('0 9 * * *', async () => {
      try {
        await this.execute();
      } catch (error) {
        console.error('Scheduled salary monitor job failed:', error);
      }
    }, {
      scheduled: true,
      timezone: 'UTC'
    });
    
    console.log('📅 Salary monitor job scheduled: 0 9 * * * (Every day at 9 AM UTC)');
  }

  static async runManual(adminId) {
    try {
      const results = await this.execute(adminId);
      
      return {
        success: true,
        message: 'Manual salary monitor job completed',
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
      
      
      const [lastExecution] = await query(`
        SELECT * FROM audit_logs 
        WHERE action = 'SALARY_MONITOR_JOB' 
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
      console.error('Error getting salary monitor job status:', error);
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
    const nextRun = new Date(now);
    nextRun.setDate(now.getDate() + 1);
    nextRun.setHours(9, 0, 0, 0);
    
    return nextRun;
  }

  static async getSystemHealthReport() {
    try {
      const { query } = require('../config/database');
      
      const report = {
        timestamp: new Date().toISOString(),
        payroll_status: {},
        loan_status: {},
        penalty_status: {},
        overall_health: 'healthy'
      };
      
      
      const [payrollStats] = await query(`
        SELECT 
          COUNT(*) as total_batches,
          COUNT(CASE WHEN status = 'PROCESSED' THEN 1 END) as processed_batches,
          COUNT(CASE WHEN status IN ('UPLOADED', 'VALIDATED') THEN 1 END) as pending_batches,
          COUNT(CASE WHEN created_at < DATE_SUB(NOW(), INTERVAL 7 DAY) AND status IN ('UPLOADED', 'VALIDATED') THEN 1 END) as stuck_batches
        FROM payroll_batches
      `);
      
      report.payroll_status = payrollStats[0] || {};
      
      
      const [loanStats] = await query(`
        SELECT 
          COUNT(*) as total_applications,
          COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending_applications,
          COUNT(CASE WHEN status = 'PENDING' AND created_at < DATE_SUB(NOW(), INTERVAL 14 DAY) THEN 1 END) as long_pending_applications
        FROM loan_applications
      `);
      
      report.loan_status = loanStats[0] || {};
      
      
      const [penaltyStats] = await query(`
        SELECT 
          COUNT(*) as total_penalties,
          COUNT(CASE WHEN amount > 1000 THEN 1 END) as high_penalties,
          SUM(amount) as total_penalty_amount
        FROM penalties
        WHERE status = 'ACTIVE'
      `);
      
      report.penalty_status = penaltyStats[0] || {};
      
      
      const issues = [];
      
      if (report.payroll_status.stuck_batches > 0) {
        issues.push(`${report.payroll_status.stuck_batches} stuck payroll batches`);
      }
      
      if (report.loan_status.long_pending_applications > 5) {
        issues.push(`${report.loan_status.long_pending_applications} long-pending loan applications`);
      }
      
      if (report.penalty_status.high_penalties > 10) {
        issues.push(`${report.penalty_status.high_penalties} high-value penalties`);
      }
      
      if (issues.length > 0) {
        report.overall_health = 'unhealthy';
        report.issues = issues;
      }
      
      return report;
      
    } catch (error) {
      console.error('Error getting system health report:', error);
      return {
        timestamp: new Date().toISOString(),
        overall_health: 'error',
        error: error.message
      };
    }
  }

  static async validateJobConfiguration() {
    const issues = [];
    
    
    if (!process.env.JWT_SECRET) {
      issues.push('JWT_SECRET environment variable not set');
    }
    
    
    try {
      const { query } = require('../config/database');
      await query('SELECT 1');
    } catch (error) {
      issues.push('Database connectivity failed: ' + error.message);
    }
    
    
    try {
      const { query } = require('../config/database');
      await query('SELECT 1 FROM payroll_batches LIMIT 1');
      await query('SELECT 1 FROM loan_applications LIMIT 1');
      await query('SELECT 1 FROM penalties LIMIT 1');
    } catch (error) {
      issues.push('Monitoring tables not found or inaccessible');
    }
    
    return {
      isValid: issues.length === 0,
      issues,
      message: issues.length === 0 ? 'Salary monitor job configuration is valid' : 'Salary monitor job configuration has issues'
    };
  }
}

module.exports = SalaryMonitorJob;
