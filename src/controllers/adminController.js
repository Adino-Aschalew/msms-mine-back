const { query } = require('../config/database');
const { auditLog } = require('../middleware/audit');

class AdminController {
  static async getSystemConfiguration(req, res) {
    try {
      const configQuery = `
        SELECT * FROM system_configuration 
        WHERE is_active = true 
        ORDER BY config_key ASC
      `;
      
      const configurations = await query(configQuery);
      
      res.json({
        success: true,
        data: configurations
      });
    } catch (error) {
      console.error('Get system configuration error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
  
  static async updateSystemConfiguration(req, res) {
    try {
      const { configurations } = req.body;
      const updatedBy = req.userId;
      
      if (!Array.isArray(configurations)) {
        return res.status(400).json({
          success: false,
          message: 'Configurations must be an array'
        });
      }
      
      const updatePromises = configurations.map(async (config) => {
        const { config_key, config_value, future_only = false } = config;
        
        if (!config_key || config_value === undefined) {
          throw new Error('Config key and value are required');
        }
        
        if (future_only) {
          
          await query(`
            INSERT INTO system_configuration (config_key, config_value, config_type, description, is_active)
            VALUES (?, ?, ?, ?, true)
            ON DUPLICATE KEY UPDATE 
            config_value = VALUES(config_value),
            updated_at = NOW()
          `, [config_key, config_value, config.config_type || 'STRING', config.description]);
        } else {
          
          await query(`
            UPDATE system_configuration 
            SET config_value = ?, updated_at = NOW()
            WHERE config_key = ? AND is_active = true
          `, [config_value, config_key]);
        }
      });
      
      await Promise.all(updatePromises);
      
      await auditLog(updatedBy, 'SYSTEM_CONFIG_UPDATE', 'system_configuration', null, null, { configurations }, req.ip, req.get('User-Agent'));
      
      res.json({
        success: true,
        message: 'System configuration updated successfully'
      });
    } catch (error) {
      console.error('Update system configuration error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }
  
  static async getAuditLogs(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const offset = (page - 1) * limit;
      
      const filters = {
        user_id: req.query.user_id,
        action: req.query.action,
        table_name: req.query.table_name,
        start_date: req.query.start_date,
        end_date: req.query.end_date
      };
      
      let whereClause = 'WHERE 1=1';
      const params = [];
      
      if (filters.user_id) {
        whereClause += ' AND al.user_id = ?';
        params.push(filters.user_id);
      }
      
      if (filters.action) {
        whereClause += ' AND al.action LIKE ?';
        params.push(`%${filters.action}%`);
      }
      
      if (filters.table_name) {
        whereClause += ' AND al.table_name = ?';
        params.push(filters.table_name);
      }
      
      if (filters.start_date) {
        whereClause += ' AND DATE(al.created_at) >= ?';
        params.push(filters.start_date);
      }
      
      if (filters.end_date) {
        whereClause += ' AND DATE(al.created_at) <= ?';
        params.push(filters.end_date);
      }
      
      const countQuery = `
        SELECT COUNT(*) as total FROM audit_logs al ${whereClause}
      `;
      
      const selectQuery = `
        SELECT al.*, u.username, u.first_name, u.last_name, u.role
        FROM audit_logs al
        LEFT JOIN users u ON al.user_id = u.id
        ${whereClause}
        ORDER BY al.created_at DESC
        LIMIT ? OFFSET ?
      `;
      
      const [countResult, logs] = await Promise.all([
        query(countQuery, params),
        query(selectQuery, [...params, limit, offset])
      ]);
      
      res.json({
        success: true,
        data: {
          logs,
          pagination: {
            page,
            limit,
            total: countResult[0].total,
            pages: Math.ceil(countResult[0].total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Get audit logs error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
  
  static async getSystemHealth(req, res) {
    try {
      const healthChecks = await Promise.all([
        this.checkDatabaseHealth(),
        this.checkPayrollHealth(),
        this.checkLoanHealth(),
        this.checkSavingsHealth(),
        this.checkSystemMetrics()
      ]);
      
      const overallHealth = {
        status: healthChecks.every(check => check.status === 'healthy') ? 'healthy' : 'warning',
        checks: healthChecks,
        timestamp: new Date().toISOString()
      };
      
      res.json({
        success: true,
        data: overallHealth
      });
    } catch (error) {
      console.error('Get system health error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
  
  static async checkDatabaseHealth() {
    try {
      await query('SELECT 1');
      return {
        component: 'Database',
        status: 'healthy',
        message: 'Database connection successful'
      };
    } catch (error) {
      return {
        component: 'Database',
        status: 'unhealthy',
        message: `Database connection failed: ${error.message}`
      };
    }
  }
  
  static async checkPayrollHealth() {
    try {
      const stuckBatches = await query(`
        SELECT COUNT(*) as count 
        FROM payroll_batches 
        WHERE status IN ('UPLOADED', 'VALIDATED') 
        AND created_at < DATE_SUB(NOW(), INTERVAL 7 DAY)
      `);
      
      const count = stuckBatches[0].count;
      
      return {
        component: 'Payroll Processing',
        status: count === 0 ? 'healthy' : 'warning',
        message: count === 0 ? 'No stuck payroll batches' : `${count} payroll batches stuck in processing`
      };
    } catch (error) {
      return {
        component: 'Payroll Processing',
        status: 'unhealthy',
        message: `Payroll health check failed: ${error.message}`
      };
    }
  }
  
  static async checkLoanHealth() {
    try {
      const overdueLoans = await query(`
        SELECT COUNT(*) as count 
        FROM loans l
        WHERE l.status = 'ACTIVE' 
        AND l.disbursement_date < DATE_SUB(NOW(), INTERVAL 30 DAY)
        AND NOT EXISTS (
          SELECT 1 FROM loan_repayments lr 
          WHERE lr.loan_id = l.id 
          AND lr.repayment_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        )
      `);
      
      const count = overdueLoans[0].count;
      
      return {
        component: 'Loan Management',
        status: count === 0 ? 'healthy' : 'warning',
        message: count === 0 ? 'No overdue loan repayments' : `${count} loans with overdue repayments`
      };
    } catch (error) {
      return {
        component: 'Loan Management',
        status: 'unhealthy',
        message: `Loan health check failed: ${error.message}`
      };
    }
  }
  
  static async checkSavingsHealth() {
    try {
      const missedSavings = await query(`
        SELECT COUNT(*) as count 
        FROM savings_accounts sa
        LEFT JOIN savings_transactions st ON sa.id = st.savings_account_id AND st.transaction_type = 'CONTRIBUTION'
        WHERE sa.account_status = 'ACTIVE'
        AND (st.transaction_date IS NULL OR st.transaction_date < DATE_SUB(NOW(), INTERVAL 35 DAY))
      `);
      
      const count = missedSavings[0].count;
      
      return {
        component: 'Savings Management',
        status: count === 0 ? 'healthy' : 'warning',
        message: count === 0 ? 'All savings accounts up to date' : `${count} accounts with missed savings`
      };
    } catch (error) {
      return {
        component: 'Savings Management',
        status: 'unhealthy',
        message: `Savings health check failed: ${error.message}`
      };
    }
  }
  
  static async checkSystemMetrics() {
    try {
      const [userCount, activeLoans, totalSavings] = await Promise.all([
        query('SELECT COUNT(*) as count FROM users WHERE is_active = true'),
        query('SELECT COUNT(*) as count FROM loans WHERE status = "ACTIVE"'),
        query('SELECT SUM(current_balance) as total FROM savings_accounts WHERE account_status = "ACTIVE"')
      ]);
      
      return {
        component: 'System Metrics',
        status: 'healthy',
        message: 'System metrics collected',
        metrics: {
          active_users: userCount[0].count,
          active_loans: activeLoans[0].count,
          total_savings: totalSavings[0].total || 0
        }
      };
    } catch (error) {
      return {
        component: 'System Metrics',
        status: 'unhealthy',
        message: `System metrics check failed: ${error.message}`
      };
    }
  }
  
  static async getComplianceReport(req, res) {
    try {
      const { start_date, end_date } = req.query;
      
      let dateFilter = '';
      const params = [];
      
      if (start_date && end_date) {
        dateFilter = 'WHERE DATE(created_at) BETWEEN ? AND ?';
        params.push(start_date, end_date);
      }
      
      const complianceChecks = await Promise.all([
        this.checkUserRegistrationCompliance(dateFilter, params),
        this.checkLoanApprovalCompliance(dateFilter, params),
        this.checkPayrollCompliance(dateFilter, params),
        this.checkDataIntegrityCompliance()
      ]);
      
      const overallCompliance = {
        period: { start_date, end_date },
        checks: complianceChecks,
        overall_score: complianceChecks.reduce((sum, check) => sum + check.score, 0) / complianceChecks.length,
        generated_at: new Date().toISOString()
      };
      
      res.json({
        success: true,
        data: overallCompliance
      });
    } catch (error) {
      console.error('Get compliance report error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
  
  static async checkUserRegistrationCompliance(dateFilter, params) {
    try {
      const [totalUsers, verifiedUsers] = await Promise.all([
        query(`SELECT COUNT(*) as count FROM users u JOIN employee_profiles ep ON u.id = ep.user_id ${dateFilter}`, params),
        query(`SELECT COUNT(*) as count FROM users u JOIN employee_profiles ep ON u.id = ep.user_id WHERE ep.hr_verified = true ${dateFilter}`, params)
      ]);
      
      const complianceRate = totalUsers[0].count > 0 ? (verifiedUsers[0].count / totalUsers[0].count) * 100 : 100;
      
      return {
        area: 'User Registration',
        score: complianceRate,
        status: complianceRate >= 95 ? 'compliant' : complianceRate >= 80 ? 'partial' : 'non-compliant',
        details: {
          total_users: totalUsers[0].count,
          verified_users: verifiedUsers[0].count,
          compliance_rate: complianceRate.toFixed(2) + '%'
        }
      };
    } catch (error) {
      return {
        area: 'User Registration',
        score: 0,
        status: 'error',
        details: { error: error.message }
      };
    }
  }
  
  static async checkLoanApprovalCompliance(dateFilter, params) {
    try {
      const [totalLoans, approvedWithGuarantor] = await Promise.all([
        query(`SELECT COUNT(*) as count FROM loan_applications la ${dateFilter}`, params),
        query(`
          SELECT COUNT(*) as count 
          FROM loan_applications la 
          JOIN guarantors g ON la.id = g.loan_application_id 
          WHERE la.status = 'APPROVED' AND g.is_approved = true 
          ${dateFilter}
        `, params)
      ]);
      
      const complianceRate = totalLoans[0].count > 0 ? (approvedWithGuarantor[0].count / totalLoans[0].count) * 100 : 100;
      
      return {
        area: 'Loan Approval',
        score: complianceRate,
        status: complianceRate >= 95 ? 'compliant' : complianceRate >= 80 ? 'partial' : 'non-compliant',
        details: {
          total_applications: totalLoans[0].count,
          approved_with_guarantor: approvedWithGuarantor[0].count,
          compliance_rate: complianceRate.toFixed(2) + '%'
        }
      };
    } catch (error) {
      return {
        area: 'Loan Approval',
        score: 0,
        status: 'error',
        details: { error: error.message }
      };
    }
  }
  
  static async checkPayrollCompliance(dateFilter, params) {
    try {
      const [totalBatches, confirmedBatches] = await Promise.all([
        query(`SELECT COUNT(*) as count FROM payroll_batches ${dateFilter}`, params),
        query(`SELECT COUNT(*) as count FROM payroll_batches WHERE status = 'CONFIRMED' ${dateFilter}`, params)
      ]);
      
      const complianceRate = totalBatches[0].count > 0 ? (confirmedBatches[0].count / totalBatches[0].count) * 100 : 100;
      
      return {
        area: 'Payroll Processing',
        score: complianceRate,
        status: complianceRate >= 95 ? 'compliant' : complianceRate >= 80 ? 'partial' : 'non-compliant',
        details: {
          total_batches: totalBatches[0].count,
          confirmed_batches: confirmedBatches[0].count,
          compliance_rate: complianceRate.toFixed(2) + '%'
        }
      };
    } catch (error) {
      return {
        area: 'Payroll Processing',
        score: 0,
        status: 'error',
        details: { error: error.message }
      };
    }
  }
  
  static async checkDataIntegrityCompliance() {
    try {
      const [orphanedRecords, dataAnomalies] = await Promise.all([
        query(`
          SELECT COUNT(*) as count 
          FROM savings_transactions st 
          LEFT JOIN savings_accounts sa ON st.savings_account_id = sa.id 
          WHERE sa.id IS NULL
        `),
        query(`
          SELECT COUNT(*) as count 
          FROM loan_repayments lr 
          LEFT JOIN loans l ON lr.loan_id = l.id 
          WHERE l.id IS NULL
        `)
      ]);
      
      const totalIssues = orphanedRecords[0].count + dataAnomalies[0].count;
      const complianceRate = totalIssues === 0 ? 100 : Math.max(0, 100 - (totalIssues * 10));
      
      return {
        area: 'Data Integrity',
        score: complianceRate,
        status: totalIssues === 0 ? 'compliant' : totalIssues <= 5 ? 'partial' : 'non-compliant',
        details: {
          orphaned_records: orphanedRecords[0].count,
          data_anomalies: dataAnomalies[0].count,
          total_issues: totalIssues,
          compliance_rate: complianceRate.toFixed(2) + '%'
        }
      };
    } catch (error) {
      return {
        area: 'Data Integrity',
        score: 0,
        status: 'error',
        details: { error: error.message }
      };
    }
  }
  
  static async getSystemStats(req, res) {
    try {
      const [
        userStats,
        savingsStats,
        loanStats,
        payrollStats,
        systemStats
      ] = await Promise.all([
        query(`
          SELECT 
            COUNT(*) as total_users,
            COUNT(CASE WHEN is_active = true THEN 1 END) as active_users,
            COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as new_users_this_month,
            COUNT(CASE WHEN last_login >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as active_this_week
          FROM users
        `),
        query(`
          SELECT 
            COUNT(*) as total_accounts,
            COUNT(CASE WHEN account_status = 'ACTIVE' THEN 1 END) as active_accounts,
            SUM(current_balance) as total_balance,
            SUM(total_contributions) as total_contributions,
            AVG(saving_percentage) as avg_saving_percentage
          FROM savings_accounts
        `),
        query(`
          SELECT 
            COUNT(*) as total_loans,
            COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END) as active_loans,
            COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed_loans,
            COUNT(CASE WHEN status = 'DEFAULTED' THEN 1 END) as defaulted_loans,
            SUM(principal_amount) as total_loan_amount,
            SUM(remaining_balance) as total_outstanding,
            AVG(monthly_repayment) as avg_monthly_repayment
          FROM loans
        `),
        query(`
          SELECT 
            COUNT(*) as total_batches,
            COUNT(CASE WHEN status = 'CONFIRMED' THEN 1 END) as confirmed_batches,
            COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as batches_this_month,
            SUM(total_amount) as total_amount_processed
          FROM payroll_batches
        `),
        query(`
          SELECT 
            COUNT(*) as total_audit_logs,
            COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as logs_this_week,
            COUNT(DISTINCT user_id) as unique_users_active
          FROM audit_logs
        `)
      ]);
      
      res.json({
        success: true,
        data: {
          users: userStats[0],
          savings: savingsStats[0],
          loans: loanStats[0],
          payroll: payrollStats[0],
          system: systemStats[0],
          generated_at: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Get system stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = AdminController;
