const { query } = require('../../config/database');
const { auditLog } = require('../../middleware/audit');
const NotificationService = require('../../services/notification.service');

class FinanceService {
  static async getFinancialOverview(period = 'MONTHLY') {
    try {
      const savingsDateFilter = this.getDateFilter('ALL', 'created_at');
      const loanDateFilter = this.getDateFilter('ALL', 'created_at');
      const payrollDateFilter = this.getDateFilter('ALL', 'created_at');
      
      
      let savingsTotals, loanTotals, savingsTransactions, loanTransactions, payrollSummary;
      
      try {
        savingsTotals = await query(`
          SELECT 
            SUM(current_balance) as total_savings,
            COUNT(*) as active_accounts,
            AVG(current_balance) as avg_balance
          FROM savings_accounts 
          WHERE account_status = 'ACTIVE'
          ${savingsDateFilter}
        `);
      } catch (error) {
        console.warn('Savings totals query failed:', error.message);
        savingsTotals = [{ total_savings: 0, active_accounts: 0, avg_balance: 0 }];
      }
      
      try {
        loanTotals = await query(`
          SELECT 
            SUM(remaining_balance) as total_loans,
            COUNT(*) as active_loans,
            AVG(remaining_balance) as avg_loan_balance,
            COUNT(CASE WHEN status = 'OVERDUE' THEN 1 END) as overdue_loans
          FROM loans 
          WHERE status IN ('ACTIVE', 'OVERDUE')
          ${loanDateFilter}
        `);
      } catch (error) {
        console.warn('Loan totals query failed:', error.message);
        loanTotals = [{ total_loans: 0, active_loans: 0, avg_loan_balance: 0, overdue_loans: 0 }];
      }
      
      
      try {
        savingsTransactions = await query(`
          SELECT 
            COUNT(*) as total_transactions,
            SUM(CASE WHEN transaction_type = 'CONTRIBUTION' THEN amount ELSE 0 END) as total_contributions,
            SUM(CASE WHEN transaction_type = 'WITHDRAWAL' THEN amount ELSE 0 END) as total_withdrawals,
            SUM(CASE WHEN transaction_type = 'INTEREST' THEN amount ELSE 0 END) as total_interest
          FROM savings_transactions 
          WHERE 1=1
          ${this.getDateFilter(period, 'transaction_date')}
        `);
      } catch (error) {
        console.warn('Savings transactions query failed:', error.message);
        
        try {
          savingsTransactions = await query(`
            SELECT 
              COUNT(*) as total_transactions,
              SUM(CASE WHEN transaction_type = 'CONTRIBUTION' THEN amount ELSE 0 END) as total_contributions,
              SUM(CASE WHEN transaction_type = 'WITHDRAWAL' THEN amount ELSE 0 END) as total_withdrawals,
              0 as total_interest
            FROM savings_transactions 
            WHERE 1=1
            ${this.getDateFilter(period, 'transaction_date')}
          `);
        } catch (fallbackError) {
          console.warn('Fallback savings transactions query also failed:', fallbackError.message);
          savingsTransactions = [{ total_transactions: 0, total_contributions: 0, total_withdrawals: 0, total_interest: 0 }];
        }
      }
      
      try {
        loanTransactions = await query(`
          SELECT 
            COUNT(*) as total_transactions,
            SUM(CASE WHEN status = 'PAID' THEN amount ELSE 0 END) as total_payments,
            SUM(CASE WHEN status = 'PAID' THEN interest_amount ELSE 0 END) as total_interest,
            SUM(CASE WHEN status = 'OVERDUE' THEN amount ELSE 0 END) as total_penalties
          FROM loan_repayments 
          WHERE 1=1
          ${this.getDateFilter(period, 'repayment_date')}
        `);
      } catch (error) {
        console.warn('Loan transactions query failed:', error.message);
        loanTransactions = [{ total_transactions: 0, total_payments: 0, total_interest: 0, total_penalties: 0 }];
        loanTransactions = [{ total_transactions: 0, total_payments: 0, total_interest: 0, total_penalties: 0, total_disbursements: 0 }];
      }
      
      
      try {
        payrollSummary = await query(`
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
      } catch (error) {
        console.warn('Payroll summary query failed:', error.message);
        payrollSummary = [{ total_payrolls: 0, total_records_processed: 0, total_payroll_amount: 0, avg_salary: 0 }];
      }
      
      const totalSavings = parseFloat(savingsTotals[0]?.total_savings || 0);
      const totalLoans = parseFloat(loanTotals[0]?.total_loans || 0);

      const totalContributions = parseFloat(savingsTransactions[0]?.total_contributions || 0);
      const totalPayments = parseFloat(loanTransactions[0]?.total_payments || 0);
      const totalWithdrawals = parseFloat(savingsTransactions[0]?.total_withdrawals || 0);
      const totalPayrollAmount = parseFloat(payrollSummary[0]?.total_payroll_amount || 0);
      const totalDisbursements = parseFloat(loanTransactions[0]?.total_disbursements || 0);

      const overviewData = {
        period,
        revenue: totalContributions + totalPayments,
        expenses: totalWithdrawals + totalPayrollAmount,
        netProfit: Math.abs((totalContributions + totalPayments) - (totalWithdrawals + totalPayrollAmount)),
        cashBalance: totalSavings,
        accountsReceivable: totalLoans,
        accountsPayable: totalPayrollAmount,
        total_assets: totalSavings + totalLoans,
        savings: {
          total_savings: totalSavings,
          total_withdrawals: totalWithdrawals,
          active_accounts: savingsTotals[0]?.active_accounts || 0,
          average_balance: parseFloat(savingsTotals[0]?.avg_balance || 0)
        },
        loans: {
          total_loans: totalLoans,
          total_payments: totalPayments,
          active_loans: loanTotals[0]?.active_loans || 0,
          overdue_loans: loanTotals[0]?.overdue_loans || 0,
          average_balance: parseFloat(loanTotals[0]?.avg_loan_balance || 0)
        },
        transactions: {
          savings: {
            total_transactions: savingsTransactions[0]?.total_transactions || 0,
            total_contributions: totalContributions,
            total_withdrawals: totalWithdrawals,
            total_interest: parseFloat(savingsTransactions[0]?.total_interest || 0)
          },
          loans: {
            total_transactions: loanTransactions[0]?.total_transactions || 0,
            total_payments: totalPayments,
            total_interest: parseFloat(loanTransactions[0]?.total_interest || 0),
            total_penalties: parseFloat(loanTransactions[0]?.total_penalties || 0),
            total_disbursements: totalDisbursements
          }
        },
        payroll: {
          total_payrolls: payrollSummary[0]?.total_payrolls || 0,
          total_records: payrollSummary[0]?.total_records_processed || 0,
          total_amount: totalPayrollAmount,
          average_salary: parseFloat(payrollSummary[0]?.avg_salary || 0)
        }
      };

      console.log('Finance Overview Processed Data:', overviewData);
      return overviewData;
    } catch (error) {
      console.error('Financial overview error:', error);
      
      return {
        period,
        total_assets: 0,
        savings: {
          total_savings: 0,
          total_withdrawals: 0,
          active_accounts: 0,
          average_balance: 0
        },
        loans: {
          total_loans: 0,
          total_payments: 0,
          active_loans: 0,
          overdue_loans: 0,
          average_balance: 0
        },
        transactions: {
          savings: {
            total_transactions: 0,
            total_contributions: 0,
            total_withdrawals: 0,
            total_interest: 0
          },
          loans: {
            total_transactions: 0,
            total_payments: 0,
            total_interest: 0,
            total_penalties: 0,
            total_disbursements: 0
          }
        },
        payroll: {
          total_payrolls: 0,
          total_records_processed: 0,
          total_amount: 0,
          average_salary: 0
        }
      };
    }
  }

  static async processPayroll(payrollData, uploadedBy) {
    try {
      const SalarySyncService = require('../../services/salarySync.service');
      const result = await SalarySyncService.processPayrollUpload(payrollData, uploadedBy);
      
      
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
      const dateFilter = this.getDateFilter(period, 'transaction_date');
      
      const cashFlow = await query(`
        SELECT 
          DATE_FORMAT(transaction_date, '%Y-%m') as period,
          SUM(CASE WHEN transaction_type = 'CONTRIBUTION' THEN amount ELSE 0 END) as savings_in,
          SUM(CASE WHEN transaction_type IN ('WITHDRAWAL', 'PAYROLL') THEN amount ELSE 0 END) as savings_out,
          SUM(CASE WHEN transaction_type = 'PAYMENT' THEN amount ELSE 0 END) as loan_payments,
          SUM(CASE WHEN transaction_type = 'INTEREST' THEN amount ELSE 0 END) as savings_interest,
          SUM(CASE WHEN transaction_type = 'PENALTY' THEN amount ELSE 0 END) as loan_penalties
        FROM (
          SELECT 'CONTRIBUTION' as transaction_type, amount, transaction_date FROM savings_transactions WHERE transaction_type = 'CONTRIBUTION'
          UNION ALL
          SELECT 'WITHDRAWAL' as transaction_type, amount, transaction_date FROM savings_transactions WHERE transaction_type = 'WITHDRAWAL'
          UNION ALL
          SELECT 'PAYROLL' as transaction_type, total_amount as amount, processed_date as transaction_date FROM payroll_batches WHERE status = 'PROCESSED'
          UNION ALL
          SELECT 'PAYMENT' as transaction_type, amount, repayment_date as transaction_date FROM loan_repayments WHERE status = 'PAID'
          UNION ALL
          SELECT 'INTEREST' as transaction_type, interest_amount as amount, repayment_date as transaction_date FROM loan_repayments WHERE status = 'PAID' AND interest_amount > 0
          UNION ALL
          SELECT 'PENALTY' as transaction_type, amount, repayment_date as transaction_date FROM loan_repayments WHERE status = 'OVERDUE'
        ) as transactions
        WHERE 1=1 ${dateFilter}
        GROUP BY DATE_FORMAT(transaction_date, '%Y-%m')
        ORDER BY period DESC
      `);
      
      return cashFlow;
    } catch (error) {
      throw error;
    }
  }

  static async getProfitLossReport(period, filters = {}) {
    try {
      const dateFilter = this.getDateFilter(period, 'transaction_date');
      
      
      const incomeData = await query(`
        SELECT 
          DATE_FORMAT(transaction_date, '%Y-%m') as period,
          SUM(CASE WHEN transaction_type = 'CONTRIBUTION' THEN amount ELSE 0 END) as savings_income,
          SUM(CASE WHEN transaction_type = 'PAYMENT' THEN amount ELSE 0 END) as loan_payments,
          SUM(CASE WHEN transaction_type = 'INTEREST' THEN amount ELSE 0 END) as savings_interest
        FROM (
          SELECT 'CONTRIBUTION' as transaction_type, amount, transaction_date FROM savings_transactions WHERE transaction_type = 'CONTRIBUTION'
          UNION ALL
          SELECT 'PAYMENT' as transaction_type, amount, repayment_date as transaction_date FROM loan_repayments WHERE status = 'PAID'
          UNION ALL
          SELECT 'INTEREST' as transaction_type, interest_amount as amount, repayment_date as transaction_date FROM loan_repayments WHERE status = 'PAID' AND interest_amount > 0
        ) as transactions
        WHERE 1=1 ${dateFilter}
        GROUP BY DATE_FORMAT(transaction_date, '%Y-%m')
        ORDER BY period DESC
      `);
      
      const expenseData = await query(`
        SELECT 
          DATE_FORMAT(transaction_date, '%Y-%m') as period,
          SUM(CASE WHEN transaction_type = 'WITHDRAWAL' THEN amount ELSE 0 END) as savings_expenses,
          SUM(CASE WHEN transaction_type = 'PENALTY' THEN amount ELSE 0 END) as loan_penalties,
          SUM(CASE WHEN transaction_type = 'PAYROLL' THEN amount ELSE 0 END) as payroll_expenses
        FROM (
          SELECT 'WITHDRAWAL' as transaction_type, amount, transaction_date FROM savings_transactions WHERE transaction_type = 'WITHDRAWAL'
          UNION ALL
          SELECT 'PENALTY' as transaction_type, amount, repayment_date as transaction_date FROM loan_repayments WHERE status = 'OVERDUE'
          UNION ALL
          SELECT 'PAYROLL' as transaction_type, total_amount as amount, processed_date as transaction_date FROM payroll_batches WHERE status = 'PROCESSED'
        ) as transactions
        WHERE 1=1 ${dateFilter}
        GROUP BY DATE_FORMAT(transaction_date, '%Y-%m')
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
    if (!period || period === 'ALL') return '';
    
    switch (period) {
      case '30days':
        return `AND ${dateColumn} >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`;
      case 'DAILY':
        return `AND DATE(${dateColumn}) = CURDATE()`;
      case 'WEEKLY':
        return `AND YEARWEEK(${dateColumn}) = YEARWEEK(CURDATE())`;
      case 'MONTHLY':
        return `AND DATE_FORMAT(${dateColumn}, "%Y-%m") = DATE_FORMAT(CURDATE(), "%Y-%m")`;
      case 'QUARTERLY':
        return `AND QUARTER(${dateColumn}) = QUARTER(CURDATE()) AND YEAR(${dateColumn}) = YEAR(CURDATE())`;
      case 'YEARLY':
        return `AND YEAR(${dateColumn}) = YEAR(CURDATE())`;
      default:
        return '';
    }
  }

  static async getEmployees(page = 1, limit = 10, filters = {}) {
    try {
      console.log('getEmployees called with filters:', filters);
      const offset = (page - 1) * limit;
      let whereClause = 'WHERE u.is_active = ? AND ep.employment_status = ?';
      const params = [1, 'ACTIVE'];
      
      if (filters.department && filters.department !== 'undefined' && filters.department !== 'all') {
        whereClause += ' AND ep.department = ?';
        params.push(filters.department);
      }
      
      if (filters.search && filters.search !== 'undefined') {
        whereClause += ' AND (u.username LIKE ? OR u.email LIKE ? OR ep.first_name LIKE ? OR ep.last_name LIKE ? OR u.employee_id LIKE ?)';
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
      }
      
      console.log('Query params:', params);
      console.log('Where clause:', whereClause);
      
      const countRows = await query(`
        SELECT COUNT(*) as total
        FROM users u
        INNER JOIN employee_profiles ep ON u.id = ep.user_id
        INNER JOIN savings_accounts sa ON u.id = sa.user_id AND sa.account_status = 'ACTIVE'
        ${whereClause}
      `, params);
      
      console.log('Count result:', countRows);
      
      const employees = await query(`
        SELECT 
          u.id,
          u.employee_id,
          u.username,
          u.email,
          u.role,
          u.is_active,
          u.created_at as joinDate,
          ep.first_name,
          ep.last_name,
          ep.phone,
          ep.department,
          ep.job_grade,
          ep.employment_status as status,
          ep.hire_date,
          sa.current_balance as savingsBalance,
          sa.saving_percentage,
          sa.account_status,
          sa.created_at as savingsActivatedDate,
          ep.salary
        FROM users u
        INNER JOIN employee_profiles ep ON u.id = ep.user_id
        INNER JOIN savings_accounts sa ON u.id = sa.user_id AND sa.account_status = 'ACTIVE'
        ${whereClause}
        ORDER BY sa.created_at DESC
        LIMIT ? OFFSET ?
      `, [...params, parseInt(limit), parseInt(offset)]);
      
      console.log('Employees found:', employees ? employees.length : 0);
      console.log('Employees data:', employees);
      
      const total = countRows[0]?.total || 0;
      
      return {
        employees: (employees || []).map(emp => ({
          ...emp,
          name: `${emp.first_name} ${emp.last_name}`,
          salary: parseFloat(emp.salary) || 0,
          savingsBalance: parseFloat(emp.savingsBalance) || 0,
          joinDate: emp.savingsActivatedDate
            ? new Date(emp.savingsActivatedDate).toLocaleDateString()
            : (emp.hire_date ? new Date(emp.hire_date).toLocaleDateString() : '—'),
          position: emp.job_grade || 'Employee',
          payrollHistory: emp.payrollHistory || []
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  static async getEmployeesExport(filters = {}) {
    try {
      let whereClause = 'WHERE u.is_active = ? AND ep.employment_status = ?';
      const params = [1, 'ACTIVE'];
      
      if (filters.department && filters.department !== 'all') {
        whereClause += ' AND ep.department = ?';
        params.push(filters.department);
      }
      
      if (filters.search) {
        whereClause += ' AND (u.username LIKE ? OR u.email LIKE ? OR ep.first_name LIKE ? OR ep.last_name LIKE ? OR u.employee_id LIKE ?)';
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
      }

      const employees = await query(`
        SELECT 
          u.employee_id,
          ep.first_name,
          ep.last_name,
          ep.department,
          ep.job_grade,
          ep.employment_status,
          ep.salary,
          sa.current_balance as savingsBalance,
          sa.saving_percentage,
          sa.created_at as savingsActivatedDate
        FROM users u
        INNER JOIN employee_profiles ep ON u.id = ep.user_id
        INNER JOIN savings_accounts sa ON u.id = sa.user_id AND sa.account_status = 'ACTIVE'
        ${whereClause}
        ORDER BY ep.last_name, ep.first_name
      `, params);

      return (employees || []).map(emp => ({
        'Employee ID': emp.employee_id,
        'Name': `${emp.first_name} ${emp.last_name}`,
        'Department': emp.department,
        'Position': emp.job_grade || 'Employee',
        'Status': emp.employment_status,
        'Salary': parseFloat(emp.salary || 0).toFixed(2),
        'Savings Balance': parseFloat(emp.savingsBalance || 0).toFixed(2),
        'Savings %': emp.saving_percentage,
        'Join Date': emp.savingsActivatedDate ? new Date(emp.savingsActivatedDate).toLocaleDateString() : '—'
      }));
    } catch (error) {
      throw error;
    }
  }

  static async getTransactionsList(page = 1, limit = 10, filters = {}) {
    try {
      const offset = (page - 1) * limit;
      let whereClause = 'WHERE 1=1';
      const params = [];
      
      if (filters.type && filters.type !== 'all') {
        const type = filters.type.toLowerCase() === 'income' ? 'CONTRIBUTION' : 'WITHDRAWAL';
        whereClause += ' AND type = ?';
        params.push(type);
      }

      if (filters.search) {
        whereClause += ' AND (id LIKE ? OR user_name LIKE ? OR account LIKE ? OR category LIKE ?)';
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm);
      }
      
      const transactionQuery = `
        SELECT * FROM (
          SELECT 
            st.id, 
            st.transaction_date as date, 
            st.transaction_type as type, 
            'Savings' as category, 
            'Savings Account' as account, 
            st.amount, 
            'completed' as status,
            CONCAT(ep.first_name, ' ', ep.last_name) as user_name
          FROM savings_transactions st
          LEFT JOIN savings_accounts sa ON st.savings_account_id = sa.id
          LEFT JOIN users u ON sa.user_id = u.id
          LEFT JOIN employee_profiles ep ON u.id = ep.user_id
          
          UNION ALL
          
          SELECT 
            lt.id, 
            lt.repayment_date as date, 
            lt.status as type, 
            'Loan' as category, 
            'Loan Account' as account, 
            lt.amount, 
            'completed' as status,
            CONCAT(ep.first_name, ' ', ep.last_name) as user_name
          FROM loan_repayments lt
          LEFT JOIN loans l ON lt.loan_id = l.id
          LEFT JOIN users u ON l.user_id = u.id
          LEFT JOIN employee_profiles ep ON u.id = ep.user_id
        ) as combined_transactions
        ${whereClause}
        ORDER BY date DESC
        LIMIT ? OFFSET ?
      `;
      
      const transactions = await query(transactionQuery, [...params, parseInt(limit), parseInt(offset)]);
      
      return {
        transactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit)
          
          
        }
      };
    } catch (error) {
      throw error;
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

  static async getAnalytics(period = 'MONTHLY') {
    try {
      const overview = await this.getFinancialOverview(period);
      
      
      let cashFlow = [];
      try {
        cashFlow = await this.getCashFlowReport(period);
      } catch (cashFlowError) {
        console.warn('Cash flow report failed, using fallback:', cashFlowError.message);
        cashFlow = [];
      }
      
      
      let pendingPayrolls = 0;
      let pendingSavingsRequests = 0;
      
      try {
        const payrollCount = await query("SELECT COUNT(*) as count FROM payroll_batches WHERE status IN ('UPLOADED', 'VALIDATED', 'CONFIRMED')");
        pendingPayrolls = payrollCount[0]?.count || 0;
        
        const savingsCount = await query("SELECT COUNT(*) as count FROM savings_requests WHERE status = 'PENDING'");
        pendingSavingsRequests = savingsCount[0]?.count || 0;
      } catch (countError) {
        console.warn('Pending counts query failed:', countError.message);
      }

      
      let analyzerData = {
        monthSaving: 0,
        monthLoan: 0,
        highSaving: 0,
        highLoan: 0,
        yearSaving: 0,
        yearLoan: 0
      };

      try {
        
        const monthTotals = await query(`
          SELECT 
            COALESCE(SUM(CASE WHEN transaction_type = 'CONTRIBUTION' AND DATE_FORMAT(transaction_date, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m') THEN amount ELSE 0 END), 0) as month_saving,
            COALESCE(SUM(CASE WHEN transaction_type = 'PAYMENT' AND DATE_FORMAT(transaction_date, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m') THEN amount ELSE 0 END), 0) as month_loan
          FROM (
            SELECT 'CONTRIBUTION' as transaction_type, amount, transaction_date FROM savings_transactions
            UNION ALL
            SELECT 'PAYMENT' as transaction_type, amount, repayment_date as transaction_date FROM loan_repayments WHERE status = 'PAID'
          ) as t1
        `);
        
        
        const yearTotals = await query(`
          SELECT 
            COALESCE(SUM(CASE WHEN transaction_type = 'CONTRIBUTION' AND YEAR(transaction_date) = YEAR(CURDATE()) THEN amount ELSE 0 END), 0) as year_saving,
            COALESCE(SUM(CASE WHEN transaction_type = 'PAYMENT' AND YEAR(transaction_date) = YEAR(CURDATE()) THEN amount ELSE 0 END), 0) as year_loan
          FROM (
            SELECT 'CONTRIBUTION' as transaction_type, amount, transaction_date FROM savings_transactions
            UNION ALL
            SELECT 'PAYMENT' as transaction_type, amount, repayment_date as transaction_date FROM loan_repayments WHERE status = 'PAID'
          ) as t2
        `);

        
        const highs = await query(`
          SELECT 
            MAX(monthly_saving) as high_saving,
            MAX(monthly_loan) as high_loan
          FROM (
            SELECT 
              DATE_FORMAT(transaction_date, '%Y-%m') as period,
              SUM(CASE WHEN transaction_type = 'CONTRIBUTION' THEN amount ELSE 0 END) as monthly_saving,
              SUM(CASE WHEN transaction_type = 'PAYMENT' THEN amount ELSE 0 END) as monthly_loan
            FROM (
              SELECT 'CONTRIBUTION' as transaction_type, amount, transaction_date FROM savings_transactions
              UNION ALL
              SELECT 'PAYMENT' as transaction_type, amount, repayment_date as transaction_date FROM loan_repayments WHERE status = 'PAID'
            ) as t3sub
            GROUP BY period
          ) as t3
        `);

        analyzerData = {
          monthSaving: parseFloat(monthTotals[0]?.month_saving || 0),
          monthLoan: parseFloat(monthTotals[0]?.month_loan || 0),
          highSaving: parseFloat(highs[0]?.high_saving || 0),
          highLoan: parseFloat(highs[0]?.high_loan || 0),
          yearSaving: parseFloat(yearTotals[0]?.year_saving || 0),
          yearLoan: parseFloat(yearTotals[0]?.year_loan || 0)
        };
      } catch (analyzerError) {
        console.warn('Saving analyzer query failed:', analyzerError.message);
      }

      
      let expenses = [];
      try {
        expenses = await query(`
          SELECT 
            category, 
            SUM(amount) as value
          FROM (
            SELECT 'Payroll' as category, COALESCE(SUM(total_amount), 0) as amount FROM payroll_batches WHERE status = 'PROCESSED'
            UNION ALL
            SELECT 'Withdrawals' as category, COALESCE(SUM(amount), 0) as amount FROM savings_transactions WHERE transaction_type = 'WITHDRAWAL'
          ) as e
          GROUP BY category
        `);
      } catch (expenseError) {
        console.warn('Expense breakdown failed, using fallback:', expenseError.message);
        expenses = [
          { category: 'Payroll', value: 0 },
          { category: 'Withdrawals', value: 0 }
        ];
      }

      
      const totalContributions = parseFloat(overview.transactions?.savings?.total_contributions || 0);
      const totalPayments = parseFloat(overview.transactions?.loans?.total_payments || 0);
      const totalWithdrawals = parseFloat(overview.transactions?.savings?.total_withdrawals || 0);
      const totalPayroll = parseFloat(overview.payroll?.total_amount || 0);
      
      const currentRevenue = totalContributions + totalPayments;
      const currentExpenses = totalWithdrawals + totalPayroll;
      const currentProfit = Math.abs(currentRevenue - currentExpenses);
      
      // Calculate Previous Period for Growth
      let prevPeriodFilter = '';
      if (period === 'MONTHLY') {
        prevPeriodFilter = "AND DATE_FORMAT(transaction_date, '%Y-%m') = DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m')";
      } else if (period === 'YEARLY') {
        prevPeriodFilter = "AND YEAR(transaction_date) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 YEAR))";
      }

      let revenueGrowth = 0, expensesGrowth = 0, profitGrowth = 0, cashChange = 0, receivableChange = 0, payableChange = 0;
      
      try {
        if (prevPeriodFilter) {
          const prevTotals = await query(`
            SELECT 
              COALESCE(SUM(CASE WHEN transaction_type = 'CONTRIBUTION' THEN amount ELSE 0 END), 0) as prev_savings_in,
              COALESCE(SUM(CASE WHEN transaction_type = 'PAYMENT' THEN amount ELSE 0 END), 0) as prev_loan_in,
              COALESCE(SUM(CASE WHEN transaction_type = 'WITHDRAWAL' THEN amount ELSE 0 END), 0) as prev_savings_out,
              COALESCE(SUM(CASE WHEN transaction_type = 'PAYROLL' THEN amount ELSE 0 END), 0) as prev_payroll
            FROM (
              SELECT 'CONTRIBUTION' as transaction_type, amount, transaction_date FROM savings_transactions WHERE transaction_type = 'CONTRIBUTION'
              UNION ALL
              SELECT 'WITHDRAWAL' as transaction_type, amount, transaction_date FROM savings_transactions WHERE transaction_type = 'WITHDRAWAL'
              UNION ALL
              SELECT 'PAYROLL' as transaction_type, total_amount as amount, processed_date as transaction_date FROM payroll_batches WHERE status = 'PROCESSED'
              UNION ALL
              SELECT 'PAYMENT' as transaction_type, amount, repayment_date as transaction_date FROM loan_repayments WHERE status = 'PAID'
            ) as transactions
            WHERE 1=1 ${prevPeriodFilter}
          `);

          const prevRevenue = parseFloat(prevTotals[0]?.prev_savings_in || 0) + parseFloat(prevTotals[0]?.prev_loan_in || 0);
          const prevExpenses = parseFloat(prevTotals[0]?.prev_savings_out || 0) + parseFloat(prevTotals[0]?.prev_payroll || 0);
          const prevProfit = Math.abs(prevRevenue - prevExpenses);

          if (prevRevenue > 0) revenueGrowth = ((currentRevenue - prevRevenue) / prevRevenue) * 100;
          if (prevExpenses > 0) expensesGrowth = ((currentExpenses - prevExpenses) / prevExpenses) * 100;
          if (prevProfit > 0) profitGrowth = ((currentProfit - prevProfit) / prevProfit) * 100;
        }
      } catch (error) {
        console.warn('Failed to calculate previous period growth:', error.message);
      }

      return {
        revenue: currentRevenue,
        expenses: currentExpenses,
        netProfit: currentProfit,
        revenueGrowth: Math.round(revenueGrowth * 10) / 10,
        expensesGrowth: Math.round(expensesGrowth * 10) / 10,
        profitGrowth: Math.round(profitGrowth * 10) / 10,
        cashBalance: parseFloat(overview.total_assets || 0),
        cashChange: Math.round((revenueGrowth - expensesGrowth) * 10) / 10, // Simulated based on performance
        accountsReceivable: parseFloat(overview.transactions?.loans?.total_disbursements || 0),
        receivableChange: Math.round(revenueGrowth * 10) / 10,
        accountsPayable: totalPayroll,
        payableChange: Math.round(expensesGrowth * 10) / 10,
        expenseBreakdown: expenses,
        monthlyCashFlow: cashFlow || [],
        pendingApprovals: {
          payroll: pendingPayrolls,
          savingsRequests: pendingSavingsRequests
        },
        savingAnalyzer: analyzerData
      };
    } catch (error) {
      console.error('Analytics service error:', error);
      
      return {
        revenue: 0,
        expenses: 0,
        netProfit: 0,
        revenueGrowth: 0,
        expensesGrowth: 0,
        profitGrowth: 0,
        cashBalance: 0,
        cashChange: 0,
        accountsReceivable: 0,
        receivableChange: 0,
        accountsPayable: 0,
        payableChange: 0,
        expenseBreakdown: [],
        monthlyCashFlow: []
      };
    }
  }

  static async getRecentTransactions(limit = 10) {
    try {
      const transactions = await query(`
        SELECT * FROM (
          SELECT 
            st.id, 
            st.transaction_date as date, 
            st.transaction_type as type, 
            'Savings' as category, 
            'Savings Account' as account, 
            st.amount, 
            'completed' as status,
            CONCAT(COALESCE(ep.first_name, 'Unknown'), ' ', COALESCE(ep.last_name, 'User')) as user_name
          FROM savings_transactions st
          LEFT JOIN savings_accounts sa ON st.savings_account_id = sa.id
          LEFT JOIN users u ON sa.user_id = u.id
          LEFT JOIN employee_profiles ep ON u.id = ep.user_id
          
          UNION ALL
          
          SELECT 
            lt.id, 
            lt.repayment_date as date, 
            'PAYMENT' as type, 
            'Loan' as category, 
            'Loan Account' as account, 
            lt.amount, 
            'completed' as status,
            CONCAT(COALESCE(ep.first_name, 'Unknown'), ' ', COALESCE(ep.last_name, 'User')) as user_name
          FROM loan_repayments lt
          LEFT JOIN loans l ON lt.loan_id = l.id
          LEFT JOIN users u ON l.user_id = u.id
          LEFT JOIN employee_profiles ep ON u.id = ep.user_id
        ) as combined_transactions
        ORDER BY date DESC
        LIMIT ?
      `, [limit]);
      
      return transactions;
    } catch (error) {
      console.error('Get recent transactions error:', error);
      
      return [
        {
          id: 0,
          date: new Date().toISOString(),
          type: 'CONTRIBUTION',
          category: 'Savings',
          account: 'Savings Account',
          amount: 0,
          status: 'completed',
          user_name: 'System User'
        }
      ];
    }
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

  static async getPayrollPreparationEmployees(filters = {}) {
    try {
      let queryStr = `
        SELECT 
          u.id as user_id,
          u.employee_id,
          ep.first_name,
          ep.last_name,
          ep.department,
          ep.salary,
          sa.saving_percentage,
          sa.current_balance,
          sa.account_status,
          COUNT(DISTINCT l.id) as active_loans_count,
          COALESCE(SUM(l.monthly_deduction), 0) as total_monthly_loan_deduction
        FROM users u
        JOIN employee_profiles ep ON u.id = ep.user_id
        LEFT JOIN savings_accounts sa ON u.id = sa.user_id AND sa.account_status = 'ACTIVE'
        LEFT JOIN loans l ON u.id = l.user_id AND l.status = 'ACTIVE'
        WHERE u.status = 'ACTIVE'
        AND ep.employment_status = 'ACTIVE'
        AND (sa.account_status = 'ACTIVE' OR l.status = 'ACTIVE')
      `;

      const params = [];

      if (filters.department) {
        queryStr += ' AND ep.department = ?';
        params.push(filters.department);
      }

      queryStr += `
        GROUP BY u.id, u.employee_id, ep.first_name, ep.last_name, ep.department, ep.salary, sa.saving_percentage, sa.current_balance, sa.account_status
        ORDER BY ep.department, ep.last_name, ep.first_name
      `;

      const employees = await query(queryStr, params);

      return {
        success: true,
        data: employees,
        count: employees.length
      };
    } catch (error) {
      console.error('Get payroll preparation employees error:', error);
      throw error;
    }
  }
}

module.exports = FinanceService;
