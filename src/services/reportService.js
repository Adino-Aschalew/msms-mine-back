const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');
const { query } = require('../config/database');
const moment = require('moment');

class ReportService {
  static async generateOperationalReport(filters = {}) {
    const { start_date, end_date, department, account_status } = filters;
    
    let whereClause = 'WHERE 1=1';
    const params = [];
    
    if (start_date) {
      whereClause += ' AND DATE(st.transaction_date) >= ?';
      params.push(start_date);
    }
    
    if (end_date) {
      whereClause += ' AND DATE(st.transaction_date) <= ?';
      params.push(end_date);
    }
    
    
    const savingsQuery = `
      SELECT 
        COUNT(DISTINCT sa.user_id) as total_savers,
        COUNT(sa.id) as total_accounts,
        SUM(sa.current_balance) as total_savings_balance,
        SUM(sa.total_contributions) as total_contributions,
        SUM(sa.interest_earned) as total_interest_earned,
        COUNT(CASE WHEN sa.account_status = 'ACTIVE' THEN 1 END) as active_accounts,
        COUNT(CASE WHEN sa.account_status = 'FROZEN' THEN 1 END) as frozen_accounts,
        COUNT(CASE WHEN sa.account_status = 'CLOSED' THEN 1 END) as closed_accounts,
        AVG(sa.saving_percentage) as avg_saving_percentage
      FROM savings_accounts sa
      JOIN users u ON sa.user_id = u.id
      JOIN employee_profiles ep ON u.id = ep.user_id
      ${department ? 'WHERE ep.department = ?' : ''}
    `;
    
    
    const transactionQuery = `
      SELECT 
        st.transaction_type,
        COUNT(*) as transaction_count,
        SUM(st.amount) as total_amount,
        AVG(st.amount) as avg_amount
      FROM savings_transactions st
      ${whereClause}
      GROUP BY st.transaction_type
    `;
    
    
    const payrollQuery = `
      SELECT 
        COUNT(DISTINCT pb.id) as total_batches,
        COUNT(DISTINCT pd.user_id) as total_employees_processed,
        SUM(pd.total_deductions) as total_deductions,
        SUM(pd.savings_deduction) as total_savings_deductions,
        SUM(pd.loan_repayment_deduction) as total_loan_repayments,
        COUNT(CASE WHEN pb.status = 'CONFIRMED' THEN 1 END) as confirmed_batches
      FROM payroll_batches pb
      LEFT JOIN payroll_details pd ON pb.id = pd.payroll_batch_id
      ${start_date && end_date ? 'WHERE pb.payroll_date BETWEEN ? AND ?' : ''}
    `;
    
    const [savingsData, transactionData, payrollData] = await Promise.all([
      query(savingsQuery, department ? [department] : []),
      query(transactionQuery, params),
      query(payrollQuery, start_date && end_date ? [start_date, end_date] : [])
    ]);
    
    return {
      report_type: 'OPERATIONAL',
      period: { start_date, end_date },
      filters: { department, account_status },
      savings_summary: savingsData[0],
      transaction_summary: transactionData,
      payroll_summary: payrollData[0],
      generated_at: new Date().toISOString()
    };
  }
  
  static async generateFinancialReport(filters = {}) {
    const { start_date, end_date, department } = filters;
    
    
    const portfolioQuery = `
      SELECT 
        SUM(sa.current_balance) as total_savings,
        COUNT(DISTINCT sa.user_id) as total_savers,
        AVG(sa.current_balance) as avg_savings_per_member,
        SUM(l.remaining_balance) as total_outstanding_loans,
        COUNT(DISTINCT l.user_id) as total_borrowers,
        AVG(l.remaining_balance) as avg_loan_per_borrower,
        SUM(l.paid_amount) as total_loan_repaid,
        SUM(l.total_interest) as total_interest_earned
      FROM savings_accounts sa
      LEFT JOIN loans l ON sa.user_id = l.user_id AND l.status = 'ACTIVE'
      JOIN users u ON sa.user_id = u.id
      JOIN employee_profiles ep ON u.id = ep.user_id
      ${department ? 'WHERE ep.department = ?' : ''}
    `;
    
    
    const monthlyQuery = `
      SELECT 
        DATE_FORMAT(transaction_date, '%Y-%m') as month,
        SUM(CASE WHEN transaction_type = 'CONTRIBUTION' THEN amount ELSE 0 END) as monthly_contributions,
        SUM(CASE WHEN transaction_type = 'INTEREST' THEN amount ELSE 0 END) as monthly_interest_paid,
        COUNT(CASE WHEN transaction_type = 'CONTRIBUTION' THEN 1 END) as contribution_count
      FROM savings_transactions
      WHERE transaction_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(transaction_date, '%Y-%m')
      ORDER BY month DESC
    `;
    
    
    const loanPerformanceQuery = `
      SELECT 
        COUNT(*) as total_loans,
        SUM(principal_amount) as total_loan_amount,
        SUM(total_interest) as total_interest_charged,
        SUM(paid_amount) as total_amount_repaid,
        COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed_loans,
        COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END) as active_loans,
        COUNT(CASE WHEN status = 'DEFAULTED' THEN 1 END) as defaulted_loans,
        AVG(DATEDIFF(maturity_date, NOW())) as avg_days_to_maturity
      FROM loans
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
    `;
    
    const [portfolioData, monthlyData, loanPerformance] = await Promise.all([
      query(portfolioQuery, department ? [department] : []),
      query(monthlyQuery),
      query(loanPerformanceQuery)
    ]);
    
    return {
      report_type: 'FINANCIAL',
      period: { start_date, end_date },
      filters: { department },
      portfolio_overview: portfolioData[0],
      monthly_performance: monthlyData,
      loan_performance: loanPerformance[0],
      generated_at: new Date().toISOString()
    };
  }
  
  static async generateAuditReport(filters = {}) {
    const { start_date, end_date, user_id, action, table_name } = filters;
    
    let whereClause = 'WHERE 1=1';
    const params = [];
    
    if (start_date) {
      whereClause += ' AND DATE(al.created_at) >= ?';
      params.push(start_date);
    }
    
    if (end_date) {
      whereClause += ' AND DATE(al.created_at) <= ?';
      params.push(end_date);
    }
    
    if (user_id) {
      whereClause += ' AND al.user_id = ?';
      params.push(user_id);
    }
    
    if (action) {
      whereClause += ' AND al.action = ?';
      params.push(action);
    }
    
    if (table_name) {
      whereClause += ' AND al.table_name = ?';
      params.push(table_name);
    }
    
    
    const summaryQuery = `
      SELECT 
        COUNT(*) as total_audit_logs,
        COUNT(DISTINCT al.user_id) as unique_users,
        COUNT(DISTINCT al.action) as unique_actions,
        COUNT(DISTINCT al.table_name) as unique_tables,
        COUNT(CASE WHEN al.action LIKE '%CREATE%' OR al.action LIKE '%ADD%' THEN 1 END) as create_actions,
        COUNT(CASE WHEN al.action LIKE '%UPDATE%' OR al.action LIKE '%EDIT%' THEN 1 END) as update_actions,
        COUNT(CASE WHEN al.action LIKE '%DELETE%' OR al.action LIKE '%REMOVE%' THEN 1 END) as delete_actions
      FROM audit_logs al
      ${whereClause}
    `;
    
    
    const topActionsQuery = `
      SELECT 
        al.action,
        COUNT(*) as count,
        COUNT(DISTINCT al.user_id) as unique_users
      FROM audit_logs al
      ${whereClause}
      GROUP BY al.action
      ORDER BY count DESC
      LIMIT 10
    `;
    
    
    const userActivityQuery = `
      SELECT 
        u.username,
        u.first_name,
        u.last_name,
        u.role,
        COUNT(al.id) as action_count,
        COUNT(DISTINCT al.action) as unique_actions,
        MAX(al.created_at) as last_activity
      FROM audit_logs al
      JOIN users u ON al.user_id = u.id
      ${whereClause.replace('WHERE al.', 'WHERE al.')}
      GROUP BY u.id, u.username, u.first_name, u.last_name, u.role
      ORDER BY action_count DESC
      LIMIT 20
    `;
    
    
    const recentQuery = `
      SELECT 
        al.*,
        u.username,
        u.first_name,
        u.last_name,
        u.role
      FROM audit_logs al
      JOIN users u ON al.user_id = u.id
      ${whereClause}
      ORDER BY al.created_at DESC
      LIMIT 50
    `;
    
    const [summaryData, topActions, userActivity, recentActivities] = await Promise.all([
      query(summaryQuery, params),
      query(topActionsQuery, params),
      query(userActivityQuery, params),
      query(recentQuery, params)
    ]);
    
    return {
      report_type: 'AUDIT',
      period: { start_date, end_date },
      filters: { user_id, action, table_name },
      summary: summaryData[0],
      top_actions: topActions,
      user_activity: userActivity,
      recent_activities: recentActivities,
      generated_at: new Date().toISOString()
    };
  }
  
  static async generateForecastComparisonReport(filters = {}) {
    const { forecast_type, start_date, end_date } = filters;
    
    const comparisonQuery = `
      SELECT 
        af.forecast_type,
        af.target_date,
        af.predicted_value,
        af.confidence_score,
        af.created_at as forecast_date
      FROM ai_forecasts af
      WHERE af.forecast_type = ?
      AND af.target_date BETWEEN ? AND ?
      ORDER BY af.target_date ASC
    `;
    
    const forecasts = await query(comparisonQuery, [forecast_type, start_date, end_date]);
    
    
    let actualData = [];
    if (forecast_type === 'USER_REGISTRATION') {
      actualData = await query(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as actual_value
        FROM users
        WHERE DATE(created_at) BETWEEN ? AND ?
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `, [start_date, end_date]);
    } else if (forecast_type === 'LOAN_DEMAND') {
      actualData = await query(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as actual_value
        FROM loan_applications
        WHERE DATE(created_at) BETWEEN ? AND ?
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `, [start_date, end_date]);
    }
    
    const comparisons = forecasts.map(forecast => {
      const actual = actualData.find(a => a.date === forecast.target_date);
      const predicted = typeof forecast.predicted_value === 'string' ? 
        JSON.parse(forecast.predicted_value) : forecast.predicted_value;
      
      const actualValue = actual ? actual.actual_value : null;
      const predictedValue = typeof predicted === 'object' ? predicted.count || predicted.total || 0 : predicted;
      
      return {
        target_date: forecast.target_date,
        predicted_value: predictedValue,
        actual_value: actualValue,
        accuracy: actualValue !== null ? this.calculateAccuracy(predictedValue, actualValue) : null,
        confidence_score: forecast.confidence_score,
        variance: actualValue !== null ? Math.abs(predictedValue - actualValue) : null
      };
    });
    
    const overallAccuracy = comparisons
      .filter(c => c.accuracy !== null)
      .reduce((sum, c) => sum + c.accuracy, 0) / comparisons.filter(c => c.accuracy !== null).length;
    
    return {
      report_type: 'FORECAST_COMPARISON',
      forecast_type,
      period: { start_date, end_date },
      comparisons,
      overall_accuracy: overallAccuracy || 0,
      total_comparisons: comparisons.length,
      accurate_predictions: comparisons.filter(c => c.accuracy !== null).length,
      generated_at: new Date().toISOString()
    };
  }
  
  static calculateAccuracy(predicted, actual) {
    if (actual === 0) return predicted === 0 ? 100 : 0;
    const error = Math.abs(predicted - actual);
    return Math.max(0, 100 - (error / actual * 100));
  }
  
  static async generatePDFReport(reportData, filename) {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const filePath = path.join(__dirname, '../../uploads/reports', filename);
      
      doc.pipe(fs.createWriteStream(filePath));
      
      
      doc.fontSize(20).text(`${reportData.report_type} Report`, { align: 'center' });
      doc.moveDown();
      
      
      if (reportData.period) {
        doc.fontSize(12).text(`Period: ${reportData.period.start_date || 'N/A'} to ${reportData.period.end_date || 'N/A'}`);
        doc.moveDown();
      }
      
      
      doc.text(`Generated at: ${new Date(reportData.generated_at).toLocaleString()}`);
      doc.moveDown();
      
      
      switch (reportData.report_type) {
        case 'OPERATIONAL':
          this.generateOperationalPDF(doc, reportData);
          break;
        case 'FINANCIAL':
          this.generateFinancialPDF(doc, reportData);
          break;
        case 'AUDIT':
          this.generateAuditPDF(doc, reportData);
          break;
        case 'FORECAST_COMPARISON':
          this.generateForecastPDF(doc, reportData);
          break;
      }
      
      doc.end();
      
      doc.on('end', () => resolve(filePath));
      doc.on('error', reject);
    });
  }
  
  static generateOperationalPDF(doc, data) {
    doc.fontSize(16).text('Savings Summary', { underline: true });
    doc.moveDown();
    
    const savings = data.savings_summary;
    doc.fontSize(12);
    doc.text(`Total Savers: ${savings.total_savers || 0}`);
    doc.text(`Total Accounts: ${savings.total_accounts || 0}`);
    doc.text(`Total Savings Balance: $${(savings.total_savings_balance || 0).toLocaleString()}`);
    doc.text(`Total Contributions: $${(savings.total_contributions || 0).toLocaleString()}`);
    doc.text(`Total Interest Earned: $${(savings.total_interest_earned || 0).toLocaleString()}`);
    doc.text(`Active Accounts: ${savings.active_accounts || 0}`);
    doc.text(`Frozen Accounts: ${savings.frozen_accounts || 0}`);
    doc.text(`Closed Accounts: ${savings.closed_accounts || 0}`);
    doc.text(`Average Saving Percentage: ${(savings.avg_saving_percentage || 0).toFixed(2)}%`);
    
    doc.moveDown();
    doc.fontSize(16).text('Transaction Summary', { underline: true });
    doc.moveDown();
    
    data.transaction_summary.forEach(transaction => {
      doc.text(`${transaction.transaction_type}: ${transaction.transaction_count} transactions, Total: $${(transaction.total_amount || 0).toLocaleString()}`);
    });
  }
  
  static generateFinancialPDF(doc, data) {
    doc.fontSize(16).text('Portfolio Overview', { underline: true });
    doc.moveDown();
    
    const portfolio = data.portfolio_overview;
    doc.fontSize(12);
    doc.text(`Total Savings: $${(portfolio.total_savings || 0).toLocaleString()}`);
    doc.text(`Total Savers: ${portfolio.total_savers || 0}`);
    doc.text(`Average Savings per Member: $${(portfolio.avg_savings_per_member || 0).toLocaleString()}`);
    doc.text(`Total Outstanding Loans: $${(portfolio.total_outstanding_loans || 0).toLocaleString()}`);
    doc.text(`Total Borrowers: ${portfolio.total_borrowers || 0}`);
    doc.text(`Average Loan per Borrower: $${(portfolio.avg_loan_per_borrower || 0).toLocaleString()}`);
    doc.text(`Total Loan Repaid: $${(portfolio.total_loan_repaid || 0).toLocaleString()}`);
    doc.text(`Total Interest Earned: $${(portfolio.total_interest_earned || 0).toLocaleString()}`);
  }
  
  static generateAuditPDF(doc, data) {
    doc.fontSize(16).text('Audit Summary', { underline: true });
    doc.moveDown();
    
    const summary = data.summary;
    doc.fontSize(12);
    doc.text(`Total Audit Logs: ${summary.total_audit_logs || 0}`);
    doc.text(`Unique Users: ${summary.unique_users || 0}`);
    doc.text(`Unique Actions: ${summary.unique_actions || 0}`);
    doc.text(`Unique Tables: ${summary.unique_tables || 0}`);
    doc.text(`Create Actions: ${summary.create_actions || 0}`);
    doc.text(`Update Actions: ${summary.update_actions || 0}`);
    doc.text(`Delete Actions: ${summary.delete_actions || 0}`);
    
    doc.moveDown();
    doc.fontSize(16).text('Top Actions', { underline: true });
    doc.moveDown();
    
    data.top_actions.forEach(action => {
      doc.text(`${action.action}: ${action.count} times by ${action.unique_users} users`);
    });
  }
  
  static generateForecastPDF(doc, data) {
    doc.fontSize(16).text('Forecast Comparison', { underline: true });
    doc.moveDown();
    
    doc.fontSize(12);
    doc.text(`Forecast Type: ${data.forecast_type}`);
    doc.text(`Period: ${data.period.start_date} to ${data.period.end_date}`);
    doc.text(`Overall Accuracy: ${data.overall_accuracy.toFixed(2)}%`);
    doc.text(`Total Comparisons: ${data.total_comparisons}`);
    doc.text(`Accurate Predictions: ${data.accurate_predictions}`);
    
    doc.moveDown();
    doc.fontSize(16).text('Comparison Details', { underline: true });
    doc.moveDown();
    
    data.comparisons.forEach(comp => {
      doc.text(`Date: ${comp.target_date}`);
      doc.text(`  Predicted: ${comp.predicted_value}`);
      doc.text(`  Actual: ${comp.actual_value || 'N/A'}`);
      doc.text(`  Accuracy: ${comp.accuracy ? comp.accuracy.toFixed(2) + '%' : 'N/A'}`);
      doc.text(`  Confidence: ${comp.confidence_score.toFixed(2)}`);
      doc.moveDown();
    });
  }
  
  static async generateExcelReport(reportData, filename) {
    const workbook = new ExcelJS.Workbook();
    const filePath = path.join(__dirname, '../../uploads/reports', filename);
    
    switch (reportData.report_type) {
      case 'OPERATIONAL':
        this.createOperationalExcel(workbook, reportData);
        break;
      case 'FINANCIAL':
        this.createFinancialExcel(workbook, reportData);
        break;
      case 'AUDIT':
        this.createAuditExcel(workbook, reportData);
        break;
      case 'FORECAST_COMPARISON':
        this.createForecastExcel(workbook, reportData);
        break;
    }
    
    await workbook.xlsx.writeFile(filePath);
    return filePath;
  }
  
  static createOperationalExcel(workbook, data) {
    
    const savingsSheet = workbook.addWorksheet('Savings Summary');
    savingsSheet.addRow(['Metric', 'Value']);
    
    const savings = data.savings_summary;
    savingsSheet.addRow(['Total Savers', savings.total_savers || 0]);
    savingsSheet.addRow(['Total Accounts', savings.total_accounts || 0]);
    savingsSheet.addRow(['Total Savings Balance', savings.total_savings_balance || 0]);
    savingsSheet.addRow(['Total Contributions', savings.total_contributions || 0]);
    savingsSheet.addRow(['Total Interest Earned', savings.total_interest_earned || 0]);
    savingsSheet.addRow(['Active Accounts', savings.active_accounts || 0]);
    savingsSheet.addRow(['Frozen Accounts', savings.frozen_accounts || 0]);
    savingsSheet.addRow(['Closed Accounts', savings.closed_accounts || 0]);
    savingsSheet.addRow(['Average Saving Percentage', (savings.avg_saving_percentage || 0).toFixed(2) + '%']);
    
    
    const transactionSheet = workbook.addWorksheet('Transaction Summary');
    transactionSheet.addRow(['Transaction Type', 'Count', 'Total Amount', 'Average Amount']);
    
    data.transaction_summary.forEach(transaction => {
      transactionSheet.addRow([
        transaction.transaction_type,
        transaction.transaction_count,
        transaction.total_amount || 0,
        transaction.avg_amount || 0
      ]);
    });
  }
  
  static createFinancialExcel(workbook, data) {
    const portfolioSheet = workbook.addWorksheet('Portfolio Overview');
    portfolioSheet.addRow(['Metric', 'Value']);
    
    const portfolio = data.portfolio_overview;
    portfolioSheet.addRow(['Total Savings', portfolio.total_savings || 0]);
    portfolioSheet.addRow(['Total Savers', portfolio.total_savers || 0]);
    portfolioSheet.addRow(['Average Savings per Member', portfolio.avg_savings_per_member || 0]);
    portfolioSheet.addRow(['Total Outstanding Loans', portfolio.total_outstanding_loans || 0]);
    portfolioSheet.addRow(['Total Borrowers', portfolio.total_borrowers || 0]);
    portfolioSheet.addRow(['Average Loan per Borrower', portfolio.avg_loan_per_borrower || 0]);
    portfolioSheet.addRow(['Total Loan Repaid', portfolio.total_loan_repaid || 0]);
    portfolioSheet.addRow(['Total Interest Earned', portfolio.total_interest_earned || 0]);
    
    
    const monthlySheet = workbook.addWorksheet('Monthly Performance');
    monthlySheet.addRow(['Month', 'Contributions', 'Interest Paid', 'Contribution Count']);
    
    data.monthly_performance.forEach(month => {
      monthlySheet.addRow([
        month.month,
        month.monthly_contributions || 0,
        month.monthly_interest_paid || 0,
        month.contribution_count || 0
      ]);
    });
  }
  
  static createAuditExcel(workbook, data) {
    const summarySheet = workbook.addWorksheet('Audit Summary');
    summarySheet.addRow(['Metric', 'Value']);
    
    const summary = data.summary;
    summarySheet.addRow(['Total Audit Logs', summary.total_audit_logs || 0]);
    summarySheet.addRow(['Unique Users', summary.unique_users || 0]);
    summarySheet.addRow(['Unique Actions', summary.unique_actions || 0]);
    summarySheet.addRow(['Unique Tables', summary.unique_tables || 0]);
    summarySheet.addRow(['Create Actions', summary.create_actions || 0]);
    summarySheet.addRow(['Update Actions', summary.update_actions || 0]);
    summarySheet.addRow(['Delete Actions', summary.delete_actions || 0]);
    
    
    const actionsSheet = workbook.addWorksheet('Top Actions');
    actionsSheet.addRow(['Action', 'Count', 'Unique Users']);
    
    data.top_actions.forEach(action => {
      actionsSheet.addRow([action.action, action.count, action.unique_users]);
    });
    
    
    const userSheet = workbook.addWorksheet('User Activity');
    userSheet.addRow(['Username', 'First Name', 'Last Name', 'Role', 'Action Count', 'Unique Actions', 'Last Activity']);
    
    data.user_activity.forEach(user => {
      userSheet.addRow([
        user.username,
        user.first_name,
        user.last_name,
        user.role,
        user.action_count,
        user.unique_actions,
        user.last_activity
      ]);
    });
  }
  
  static createForecastExcel(workbook, data) {
    const comparisonSheet = workbook.addWorksheet('Forecast Comparison');
    comparisonSheet.addRow(['Target Date', 'Predicted Value', 'Actual Value', 'Accuracy (%)', 'Confidence Score', 'Variance']);
    
    data.comparisons.forEach(comp => {
      comparisonSheet.addRow([
        comp.target_date,
        comp.predicted_value,
        comp.actual_value,
        comp.accuracy ? comp.accuracy.toFixed(2) : 'N/A',
        comp.confidence_score.toFixed(2),
        comp.variance || 'N/A'
      ]);
    });
    
    
    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.addRow(['Metric', 'Value']);
    summarySheet.addRow(['Forecast Type', data.forecast_type]);
    summarySheet.addRow(['Period Start', data.period.start_date]);
    summarySheet.addRow(['Period End', data.period.end_date]);
    summarySheet.addRow(['Overall Accuracy', data.overall_accuracy.toFixed(2) + '%']);
    summarySheet.addRow(['Total Comparisons', data.total_comparisons]);
    summarySheet.addRow(['Accurate Predictions', data.accurate_predictions]);
  }
  
  static async saveReportRecord(reportData, filePath, generatedBy) {
    const insertQuery = `
      INSERT INTO generated_reports 
      (report_name, report_type, generated_by, file_path, file_format, generation_date, parameters, record_count)
      VALUES (?, ?, ?, ?, ?, NOW(), ?, ?)
    `;
    
    const reportName = `${reportData.report_type}_Report_${moment().format('YYYY-MM-DD_HH-mm-ss')}`;
    const fileFormat = path.extname(filePath).substring(1).toUpperCase();
    const parameters = JSON.stringify(reportData.filters || {});
    const recordCount = this.calculateRecordCount(reportData);
    
    await query(insertQuery, [
      reportName,
      reportData.report_type,
      generatedBy,
      filePath,
      fileFormat,
      parameters,
      recordCount
    ]);
    
    return {
      report_name: reportName,
      file_path: filePath,
      file_format: fileFormat
    };
  }
  
  static calculateRecordCount(reportData) {
    switch (reportData.report_type) {
      case 'OPERATIONAL':
        return (reportData.transaction_summary?.length || 0) + 1;
      case 'FINANCIAL':
        return (reportData.monthly_performance?.length || 0) + 1;
      case 'AUDIT':
        return (reportData.top_actions?.length || 0) + (reportData.user_activity?.length || 0) + 1;
      case 'FORECAST_COMPARISON':
        return reportData.comparisons?.length || 0;
      default:
        return 0;
    }
  }
}

module.exports = ReportService;
