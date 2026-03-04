const { query } = require('../../config/database');
const { auditLog } = require('../../middleware/audit');
const NotificationService = require('../../services/notification.service');

class FinanceService {
  static async getFinancialOverview(period = 'MONTHLY') {
    try {
      const savingsDateFilter = this.getDateFilter(period, 'created_at');
      const loanDateFilter = this.getDateFilter(period, 'created_at');
      const payrollDateFilter = this.getDateFilter(period, 'created_at');
      
      // Get total savings and loans
      const [savingsTotals] = await query(`
        SELECT 
          SUM(current_balance) as total_savings,
          COUNT(*) as active_accounts,
          AVG(current_balance) as avg_balance
        FROM savings_accounts 
        WHERE account_status = 'ACTIVE'
        ${savingsDateFilter}
      `);
      
      const [loanTotals] = await query(`
        SELECT 
          SUM(remaining_balance) as total_loans,
          COUNT(*) as active_loans,
          AVG(remaining_balance) as avg_loan_balance,
          COUNT(CASE WHEN status = 'OVERDUE' THEN 1 END) as overdue_loans
        FROM loans 
        WHERE status IN ('ACTIVE', 'OVERDUE')
        ${loanDateFilter}
      `);
      
      // Get transaction summaries
      const [savingsTransactions] = await query(`
        SELECT 
          COUNT(*) as total_transactions,
          SUM(CASE WHEN transaction_type = 'CONTRIBUTION' THEN amount ELSE 0 END) as total_contributions,
          SUM(CASE WHEN transaction_type = 'WITHDRAWAL' THEN amount ELSE 0 END) as total_withdrawals,
          SUM(CASE WHEN transaction_type = 'INTEREST' THEN amount ELSE 0 END) as total_interest
        FROM savings_transactions 
        WHERE 1=1
        ${this.getDateFilter(period, 'transaction_date')}
      `);
      
      const [loanTransactions] = await query(`
        SELECT 
          COUNT(*) as total_transactions,
          SUM(CASE WHEN transaction_type = 'PAYMENT' THEN amount ELSE 0 END) as total_payments,
          SUM(CASE WHEN transaction_type = 'INTEREST' THEN amount ELSE 0 END) as total_interest,
          SUM(CASE WHEN transaction_type = 'PENALTY' THEN amount ELSE 0 END) as total_penalties
        FROM loan_transactions 
        WHERE 1=1
        ${this.getDateFilter(period, 'transaction_date')}
      `);
      
      // Get payroll summary
      const [payrollSummary] = await query(`
        SELECT 
          COUNT(*) as total_payrolls,
          SUM(total_employees) as total_records_processed,
          SUM(total_amount) as total_payroll_amount,
          AVG(total_amount) as avg_salary
        FROM payroll_batches 
        WHERE 1=1
        AND status = 'PROCESSED'
        ${payrollDateFilter}
      `);
      
      return {
        period,
        savings: {
          total_savings: parseFloat(savingsTotals[0]?.total_savings || 0),
          active_accounts: savingsTotals[0]?.active_accounts || 0,
          average_balance: parseFloat(savingsTotals[0]?.avg_balance || 0)
        },
        loans: {
          total_loans: parseFloat(loanTotals[0]?.total_loans || 0),
          active_loans: loanTotals[0]?.active_loans || 0,
          overdue_loans: loanTotals[0]?.overdue_loans || 0,
          average_balance: parseFloat(loanTotals[0]?.avg_loan_balance || 0)
        },
        transactions: {
          savings: {
            total_transactions: savingsTransactions[0]?.total_transactions || 0,
            total_contributions: parseFloat(savingsTransactions[0]?.total_contributions || 0),
            total_withdrawals: parseFloat(savingsTransactions[0]?.total_withdrawals || 0),
            total_interest: parseFloat(savingsTransactions[0]?.total_interest || 0)
          },
          loans: {
            total_transactions: loanTransactions[0]?.total_transactions || 0,
            total_payments: parseFloat(loanTransactions[0]?.total_payments || 0),
            total_interest: parseFloat(loanTransactions[0]?.total_interest || 0),
            total_penalties: parseFloat(loanTransactions[0]?.total_penalties || 0)
          }
        },
        payroll: {
          total_payrolls: payrollSummary[0]?.total_payrolls || 0,
          total_records: payrollSummary[0]?.total_records || 0,
          total_amount: parseFloat(payrollSummary[0]?.total_payroll_amount || 0),
          average_salary: parseFloat(payrollSummary[0]?.avg_salary || 0)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  static async processPayroll(payrollData, uploadedBy) {
    try {
      const SalarySyncService = require('../../services/salarySync.service');
      const result = await SalarySyncService.processPayrollUpload(payrollData, uploadedBy);
      
      // Log payroll processing
      await auditLog(uploadedBy, 'PAYROLL_PROCESSED', 'payroll_batches', result.batchId, null, payrollData, '127.0.0.1', 'System');
      
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async getPayrollBatches(page = 1, limit = 10, filters = {}) {
    try {
      const SalarySyncService = require('../../services/salarySync.service');
      return await SalarySyncService.getPayrollBatches(page, limit, filters);
    } catch (error) {
      throw error;
    }
  }

  static async getPayrollBatchDetails(batchId) {
    try {
      const SalarySyncService = require('../../services/salarySync.service');
      return await SalarySyncService.getPayrollBatchDetails(batchId);
    } catch (error) {
      throw error;
    }
  }

  static async getPayrollHistory(userId, page = 1, limit = 10) {
    try {
      const SalarySyncService = require('../../services/salarySync.service');
      return await SalarySyncService.getEmployeePayrollHistory(userId, page, limit);
    } catch (error) {
      throw error;
    }
  }

  static async getFinancialReports(reportType, period = 'MONTHLY', filters = {}) {
    try {
      switch (reportType) {
        case 'cash_flow':
          return await this.getCashFlowReport(period, filters);
        case 'profit_loss':
          return this.getProfitLossReport(period, filters);
        case 'loan_portfolio':
          return this.getLoanPortfolioReport(filters);
        case 'savings_summary':
          return this.getSavingsSummaryReport(period, filters);
        default:
          throw new Error('Invalid report type');
      }
    } catch (error) {
      throw error;
    }
  }

  static async getCashFlowReport(period, filters = {}) {
    try {
      const dateFilter = this.getDateFilter(period);
      
      const [cashFlow] = await query(`
        SELECT 
          DATE_FORMAT(created_at, '%Y-%m') as period,
          SUM(CASE WHEN transaction_type = 'CONTRIBUTION' THEN amount ELSE 0 END) as savings_in,
          SUM(CASE WHEN transaction_type = 'WITHDRAWAL' THEN -amount ELSE 0 END) as savings_out,
          SUM(CASE WHEN transaction_type = 'PAYMENT' THEN -amount ELSE 0 END) as loan_payments,
          SUM(CASE WHEN transaction_type = 'INTEREST' THEN amount ELSE 0 END) as savings_interest,
          SUM(CASE WHEN transaction_type = 'PENALTY' THEN -amount ELSE 0 END) as loan_penalties
        FROM (
          SELECT 
            'CONTRIBUTION' as transaction_type, amount, created_at
          FROM savings_transactions
          UNION ALL
          SELECT 
            'WITHDRAWAL' as transaction_type, amount, created_at
          FROM savings_transactions
          UNION ALL
          SELECT 
            'PAYMENT' as transaction_type, amount, created_at
          FROM loan_transactions
          UNION ALL
          SELECT 
            'INTEREST' as transaction_type, amount, created_at
          FROM savings_transactions
          UNION ALL
          SELECT 
            'PENALTY' as transaction_type, amount, created_at
          FROM loan_transactions
        ) as transactions
        ${dateFilter}
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY period DESC
      `);
      
      return cashFlow;
    } catch (error) {
      throw error;
    }
  }

  static async getProfitLossReport(period, filters = {}) {
    try {
      const dateFilter = this.getDateFilter(period);
      
      // Get income and expenses
      const [incomeData] = await query(`
        SELECT 
          DATE_FORMAT(created_at, '%Y-%m') as period,
          SUM(CASE WHEN transaction_type = 'CONTRIBUTION' THEN amount ELSE 0 END) as savings_income,
          SUM(CASE WHEN transaction_type = 'PAYMENT' THEN -amount ELSE 0 END) as loan_payments,
          SUM(CASE WHEN transaction_type = 'INTEREST' THEN amount ELSE 0 END) as savings_interest
        FROM (
          SELECT 'CONTRIBUTION' as transaction_type, amount, created_at
          FROM savings_transactions
          UNION ALL
          SELECT 'PAYMENT' as transaction_type, amount, created_at
          FROM loan_transactions
          UNION ALL
          SELECT 'INTEREST' as transaction_type, amount, created_at
          FROM savings_transactions
        ) as transactions
        ${dateFilter}
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY period DESC
      `);
      
      const [expenseData] = await query(`
        SELECT 
          DATE_FORMAT(created_at, '%Y-%m') as period,
          SUM(CASE WHEN transaction_type = 'WITHDRAWAL' THEN amount ELSE 0 END) as savings_expenses,
          SUM(CASE WHEN transaction_type = 'PENALTY' THEN amount ELSE 0 END) as loan_penalties,
          SUM(CASE WHEN transaction_type = 'FEES' THEN amount ELSE 0 END) as other_expenses
        FROM (
          SELECT 'WITHDRAWAL' as transaction_type, amount, created_at
          FROM savings_transactions
          UNION ALL
          SELECT 'PENALTY' as transaction_type, amount, created_at
          FROM loan_transactions
          UNION ALL
          SELECT 'FEES' as transaction_type, amount, created_at
          FROM loan_transactions
        ) as transactions
        ${dateFilter}
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY period DESC
      `);
      
      const profitLoss = [];
      
      for (let i = 0; i < incomeData.length; i++) {
        const income = incomeData[i];
        const expense = expenseData[i] || { period: income.period, total_expenses: 0 };
        const profit = income.savings_income + income.loan_payments + income.savings_interest - expense.total_expenses;
        
        profitLoss.push({
          period: income.period,
          income: income.savings_income + income.loan_payments + income.savings_interest,
          expenses: expense.total_expenses,
          profit: profit
        });
      }
      
      return profitLoss;
    } catch (error) {
      throw error;
    }
  }

  static async getLoanPortfolio(filters = {}) {
    try {
      let whereClause = 'WHERE 1=1';
      const params = [];
      
      if (filters.status) {
        whereClause += ' AND l.status = ?';
        params.push(filters.status);
      }
      
      if (filters.department) {
        whereClause += ' AND ep.department = ?';
        params.push(filters.department);
      }
      
      const [loans] = await query(`
        SELECT 
          l.*,
          ep.first_name,
          ep.last_name,
          ep.department,
          ep.job_grade,
          l.remaining_balance,
          l.interest_rate,
          l.loan_term_months,
          l.status,
          l.created_at,
          l.next_payment_date
        FROM loans l
        LEFT JOIN users u ON l.user_id = u.id
        LEFT JOIN employee_profiles ep ON u.id = ep.user_id
        ${whereClause}
        ORDER BY l.created_at DESC
      `, params);
      
      // Calculate portfolio metrics
      const portfolio = {
        total_loans: loans.reduce((sum, loan) => sum + parseFloat(loan.remaining_balance), 0),
        active_loans: loans.filter(loan => loan.status === 'ACTIVE').length,
        overdue_loans: loans.filter(loan => loan.status === 'OVERDUE').length,
        total_outstanding: loans.reduce((sum, loan) => sum + parseFloat(loan.remaining_balance), 0),
        average_balance: loans.length > 0 ? loans.reduce((sum, loan) => sum + parseFloat(loan.remaining_balance), 0) / loans.length : 0,
        by_department: this.groupBy(loans, 'department'),
        by_status: this.groupBy(loans, 'status')
      };
      
      return {
        loans,
        portfolio
      };
    } catch (error) {
      throw error;
    }
  }

  static async getSavingsSummaryReport(period = 'MONTHLY', filters = {}) {
    try {
      const dateFilter = this.getDateFilter(period);
      
      const [summary] = await query(`
        SELECT 
          COUNT(DISTINCT user_id) as total_members,
          COUNT(CASE WHEN account_status = 'ACTIVE' THEN 1 END) as active_members,
          SUM(current_balance) as total_savings,
          AVG(current_balance) as average_balance,
          SUM(saving_percentage) as total_saving_percentage
        FROM savings_accounts sa
        ${dateFilter}
      `);
      
      const [transactions] = await query(`
        SELECT 
          COUNT(*) as total_transactions,
          SUM(CASE WHEN transaction_type = 'CONTRIBUTION' THEN 1 ELSE 0 END) as contributions,
          SUM(CASE WHEN transaction_type = 'WITHDRAWAL' THEN 1 ELSE 0 END) as withdrawals
        FROM savings_transactions
        ${dateFilter}
      `);
      
      return {
        period,
        total_members: summary[0]?.total_members || 0,
        active_members: summary[0]?.active_members || 0,
        total_savings: parseFloat(summary[0]?.total_savings || 0),
        average_balance: parseFloat(summary[0]?.average_balance || 0),
        total_saving_percentage: parseFloat(summary[0]?.total_saving_percentage || 0),
        transaction_count: transactions[0]?.total_transactions || 0
      };
    } catch (error) {
      throw error;
    }
  }

  static getDateFilter(period, dateColumn = 'created_at') {
    switch (period) {
      case 'DAILY':
        return `AND DATE(${dateColumn}) = CURDATE()`;
      case 'WEEKLY':
        return `AND YEARWEEK(${dateColumn}) = YEARWEEK(CURDATE()) AND WEEK(${dateColumn}) = YEARWEEK(CURDATE())`;
      case 'MONTHLY':
        return `AND DATE_FORMAT(${dateColumn}, "%Y-%m") = DATE_FORMAT(CURDATE(), "%Y-%m")`;
      case 'QUARTERLY':
        return `AND QUARTER(${dateColumn}) = QUARTER(CURDATE(), YEAR(CURDATE()))`;
      case 'YEARLY':
        return `AND YEAR(${dateColumn}) = YEAR(CURDATE())`;
      default:
        return '';
    }
  }

  static groupBy(items, field) {
    const grouped = {};
    
    items.forEach(item => {
      const key = item[field];
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(item);
    });
    
    return Object.keys(grouped).map(key => ({
      [field]: key,
      count: grouped[key].length,
      items: grouped[key]
    }));
  }

  static async getSystemHealthMetrics() {
    try {
      const [systemSettings] = await query(`
        SELECT setting_key, setting_value 
        FROM system_settings 
        WHERE is_public = TRUE
      `);
      
      const settings = {};
      systemSettings.forEach(setting => {
        settings[setting.key] = setting.setting_value;
      });
      
      return {
        settings,
        timestamp: new Date().toISOString(),
        database_status: 'connected'
      };
    } catch (error) {
      return {
        settings: {},
        timestamp: new Date().toISOString(),
        database_status: 'error',
        error: error.message
      };
    }
  }
}

module.exports = FinanceService;
