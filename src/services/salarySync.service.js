const { query, transaction } = require('../config/database');
const NotificationService = require('./notification.service');

class SalarySyncService {
  static async processPayrollUpload(payrollData, uploadedBy) {
    return transaction(async (connection) => {
      
      const batchInsertQuery = `
        INSERT INTO payroll_batches (batch_name, upload_user_id, total_employees, total_amount, payroll_date, status, file_path, created_at)
        VALUES (?, ?, ?, ?, CURRENT_DATE(), 'UPLOADED', 'csv_upload', NOW())
      `;
      
      const totalAmount = payrollData.reduce((sum, record) => {
        const salary = record['Gross Salary'] || record.salary || record.gross_salary || 0;
        return sum + parseFloat(salary);
      }, 0);

      const [batchResult] = await connection.execute(batchInsertQuery, [
        `Payroll_${new Date().toISOString().split('T')[0]}`,
        uploadedBy,
        payrollData.length,
        totalAmount
      ]);
      
      const batchId = batchResult.insertId;
      
      
      let processedCount = 0;
      let errorCount = 0;
      
      for (const record of payrollData) {
        try {
          await this.processPayrollRecord(connection, record, batchId);
          processedCount++;
        } catch (error) {
          console.error(`Error processing payroll record for employee ${record['Employee ID'] || record.employee_id}:`, error);
          errorCount++;
          
          
          try {
            await connection.execute(`
              INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values, ip_address, user_agent)
              VALUES (?, 'PAYROLL_ERROR', 'payroll_batches', ?, ?, '127.0.0.1', 'System')
            `, [uploadedBy, batchId, `Error processing ${record['Employee ID'] || record.employee_id}: ${error.message}`]);
          } catch (logErr) {
            console.error('Failed to log payroll error to audit_logs', logErr);
          }
        }
      }
      
      
      const status = errorCount === 0 ? 'PROCESSED' : 'PARTIALLY_PROCESSED';
      await connection.execute(`
        UPDATE payroll_batches 
        SET status = ?, processed_date = NOW(), updated_at = NOW()
        WHERE id = ?
      `, [status, batchId]);
      
      return {
        success: true,
        batchId,
        processedCount,
        errorCount,
        status
      };
    });
  }

  static async processPayrollRecord(connection, record, batchId) {
    const employee_id = record['Employee ID'] || record.employee_id;
    const gross_salary = parseFloat(record['Gross Salary'] || record.salary || record.gross_salary || 0);
    
    
    const [employees] = await connection.execute(
      'SELECT id, username FROM users WHERE employee_id = ?',
      [employee_id]
    );
    
    if (!employees || employees.length === 0) {
      throw new Error(`Employee with ID ${employee_id} not found in system`);
    }
    
    const userId = employees[0].id;
    
    
    
    
    let savings_deduction = 0;
    const [savingsAccount] = await connection.execute(
      'SELECT * FROM savings_accounts WHERE user_id = ? AND account_status = "ACTIVE"',
      [userId]
    );
    
    if (savingsAccount && savingsAccount[0]) {
      const account = savingsAccount[0];
      if (account.savings_type === 'PERCENTAGE') {
        savings_deduction = gross_salary * (account.saving_percentage / 100);
      } else if (account.savings_type === 'FIXED_AMOUNT') {
        savings_deduction = account.fixed_amount;
      }
    }
    
    
    let loan_deduction = 0;
    const [activeLoans] = await connection.execute(
      'SELECT * FROM loans WHERE user_id = ? AND status = "ACTIVE"',
      [userId]
    );
    
    if (activeLoans && activeLoans.length > 0) {
      
      loan_deduction = activeLoans.reduce((total, loan) => {
        return total + parseFloat(loan.monthly_deduction || 0);
      }, 0);
    }
    
    
    const total_deductions = savings_deduction + loan_deduction;
    const net_salary = gross_salary - total_deductions;
    
    
    const payrollInsertQuery = `
      INSERT INTO payroll_details (
        payroll_batch_id, user_id, employee_id, gross_salary, net_salary, 
        savings_deduction, loan_repayment_deduction, total_deductions, 
        final_amount, payment_status, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PAID', NOW())
    `;
    
    await connection.execute(payrollInsertQuery, [
      batchId,
      userId,
      employee_id,
      gross_salary,
      net_salary,
      savings_deduction,
      loan_deduction,
      total_deductions,
      net_salary, 
    ]);
    
    
    if (savings_deduction > 0) {
      await this.processSavingsContribution(connection, userId, savings_deduction, `PAYROLL_BATCH_${batchId}`);
    }
    
    
    if (loan_deduction > 0) {
      await this.processLoanDeductionFromPayroll(connection, userId, loan_deduction, `PAYROLL_BATCH_${batchId}`);
    }
    
    
    let notificationMessage = `Your payroll for this period has been processed.\n`;
    notificationMessage += `Gross Salary: ${gross_salary}\n`;
    if (savings_deduction > 0) {
      notificationMessage += `Savings Deduction: ${savings_deduction} (auto-calculated)\n`;
    }
    if (loan_deduction > 0) {
      notificationMessage += `Loan Deduction: ${loan_deduction} (auto-calculated)\n`;
    }
    notificationMessage += `Net Amount: ${net_salary}`;
    
    await NotificationService.createNotification(
      userId,
      'Payroll Processed',
      notificationMessage,
      'INFO'
    );
    
    return {
      userId,
      employee_id,
      gross_salary,
      net_salary,
      processed: true
    };
  }

  static async processSavingsContribution(connection, userId, contributionAmount, batchId) {
    
    const [savingsAccount] = await connection.execute(
      'SELECT * FROM savings_accounts WHERE user_id = ? AND account_status = "ACTIVE"',
      [userId]
    );
    
    if (!savingsAccount || !savingsAccount[0]) {
      console.warn(`No active savings account found for user ${userId}. Skipping contribution.`);
      return;
    }
    
    const account = savingsAccount[0];
    
    
    await connection.execute(`
      INSERT INTO savings_transactions (savings_account_id, user_id, transaction_type, amount, balance_before, balance_after, payroll_batch_id, description, transaction_date)
      VALUES (?, ?, 'CONTRIBUTION', ?, ?, ?, ?, ?, NOW())
    `, [
      account.id,
      userId,
      contributionAmount,
      account.current_balance,
      account.current_balance + contributionAmount,
      batchId,
      `Automatic savings contribution from payroll batch ${batchId}`
    ]);
    
    
    await connection.execute(
      'UPDATE savings_accounts SET current_balance = ?, updated_at = NOW() WHERE id = ?',
      [account.current_balance + contributionAmount, account.id]
    );

    await NotificationService.createNotification(
      userId,
      'Savings Updated',
      `A savings contribution of ${contributionAmount} was added to your account from payroll.`,
      'SUCCESS'
    );
  }

  static async processLoanDeductionFromPayroll(connection, userId, totalDeduction, batchId) {
    
    const [loans] = await connection.execute(`
      SELECT * FROM loans 
      WHERE user_id = ? AND status = 'ACTIVE' 
      ORDER BY next_payment_date ASC
    `, [userId]);
    
    if (!loans || loans.length === 0) {
      console.warn(`No active loans found for user ${userId} despite deduction.`);
      return;
    }

    let remainingDeduction = totalDeduction;

    for (const loan of loans) {
      if (remainingDeduction <= 0) break;

      const paymentForThisLoan = Math.min(remainingDeduction, loan.outstanding_balance);
      
      
      await connection.execute(`
        INSERT INTO loan_repayments (loan_id, user_id, amount, principal_amount, interest_amount, balance_before, balance_after, payroll_batch_id, status, repayment_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PAID', NOW())
      `, [
        loan.id,
        userId,
        paymentForThisLoan,
        paymentForThisLoan, 
        0, 
        loan.outstanding_balance,
        loan.outstanding_balance - paymentForThisLoan,
        batchId
      ]);
      
      const newBalance = loan.outstanding_balance - paymentForThisLoan;
      const newStatus = newBalance <= 0 ? 'COMPLETED' : 'ACTIVE';
      
      await connection.execute(`
        UPDATE loans 
        SET outstanding_balance = ?, status = ?, last_payment_date = NOW(), updated_at = NOW()
        WHERE id = ?
      `, [newBalance, newStatus, loan.id]);

      remainingDeduction -= paymentForThisLoan;
    }
  }


  static async getPayrollBatches(page = 1, limit = 10, filters = {}) {
    try {
      const offset = (page - 1) * limit;
      let whereClause = 'WHERE 1=1';
      const params = [];
      
      if (filters.status) {
        whereClause += ' AND status = ?';
        params.push(filters.status);
      }
      
      if (filters.start_date) {
        whereClause += ' AND created_at >= ?';
        params.push(filters.start_date);
      }
      
      if (filters.end_date) {
        whereClause += ' AND created_at <= ?';
        params.push(filters.end_date);
      }
      
      const countQuery = `SELECT COUNT(*) as total FROM payroll_batches ${whereClause}`;
      
      const selectQuery = `
        SELECT pb.*, u.username as uploaded_by_name
        FROM payroll_batches pb
        LEFT JOIN users u ON pb.upload_user_id = u.id
        ${whereClause}
        ORDER BY pb.created_at DESC
        LIMIT ? OFFSET ?
      `;
      
      const [countResult, batches] = await Promise.all([
        query(countQuery, params),
        query(selectQuery, [...params, limit, offset])
      ]);
      
      return {
        batches,
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

  static async getPayrollBatchDetails(batchId) {
    try {
      const batchQuery = `
        SELECT pb.*, u.username as uploaded_by_name
        FROM payroll_batches pb
        LEFT JOIN users u ON pb.uploaded_by = u.id
        WHERE pb.id = ?
      `;
      
      const [batch] = await query(batchQuery, [batchId]);
      
      if (!batch || !batch[0]) {
        throw new Error('Payroll batch not found');
      }
      
      const recordsQuery = `
        SELECT pd.*, ep.first_name, ep.last_name, ep.department
        FROM payroll_details pd
        LEFT JOIN users u ON pd.user_id = u.id
        LEFT JOIN employee_profiles ep ON u.id = ep.user_id
        WHERE pd.payroll_batch_id = ?
        ORDER BY pd.employee_id
      `;
      
      const records = await query(recordsQuery, [batchId]);
      
      const errorsQuery = `
        SELECT pe.*, ep.first_name, ep.last_name
        FROM payroll_errors pe
        LEFT JOIN users u ON pe.employee_id = u.employee_id
        LEFT JOIN employee_profiles ep ON u.id = ep.user_id
        WHERE pe.batch_id = ?
        ORDER BY pe.created_at DESC
      `;
      
      const errors = await query(errorsQuery, [batchId]);
      
      return {
        batch: batch[0],
        records,
        errors
      };
    } catch (error) {
      throw error;
    }
  }

  static async getEmployeePayrollHistory(userId, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      
      const countQuery = `
        SELECT COUNT(*) as total 
        FROM payroll_details 
        WHERE user_id = ?
      `;
      
      const selectQuery = `
        SELECT * FROM payroll_details 
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `;
      
      const [countResult, records] = await Promise.all([
        query(countQuery, [userId]),
        query(selectQuery, [userId, limit, offset])
      ]);
      
      return {
        records,
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

  static async generatePayrollReport(batchId = null, dateRange = null) {
    try {
      let whereClause = 'WHERE 1=1';
      let params = [];
      
      if (batchId) {
        whereClause += ' AND pd.payroll_batch_id = ?';
        params.push(batchId);
      }
      
      if (dateRange && dateRange.startDate && dateRange.endDate) {
        whereClause += ' AND pb.payroll_date BETWEEN ? AND ?';
        params.push(dateRange.startDate, dateRange.endDate);
      }
      
      const query = `
        SELECT 
          pd.employee_id,
          ep.first_name,
          ep.last_name,
          pd.gross_salary,
          pd.savings_deduction as savings,
          pd.loan_repayment_deduction as loan,
          pd.net_salary,
          DATE(pb.payroll_date) as payroll_date,
          pb.batch_name,
          pd.payment_status
        FROM payroll_details pd
        INNER JOIN payroll_batches pb ON pd.payroll_batch_id = pb.id
        INNER JOIN users u ON pd.user_id = u.id
        INNER JOIN employee_profiles ep ON u.id = ep.user_id
        ${whereClause}
        ORDER BY pb.payroll_date DESC, ep.last_name, ep.first_name
      `;
      
      const { query: dbQuery } = require('../config/database');
      
      const result = await dbQuery(query, params);
      const records = result && result[0] ? result[0] : [];
      
      return {
        success: true,
        data: records,
        total: records ? records.length : 0,
        generated_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating payroll report:', error);
      throw error;
    }
  }

  static async downloadPayrollReport(format = 'csv', batchId = null, dateRange = null) {
    try {
      const reportData = await this.generatePayrollReport(batchId, dateRange);
      
      if (format === 'csv') {
        return this.generateCSVReport(reportData.data);
      } else if (format === 'excel') {
        return this.generateExcelReport(reportData.data);
      } else {
        throw new Error('Unsupported format. Use csv or excel.');
      }
    } catch (error) {
      console.error('Error downloading payroll report:', error);
      throw error;
    }
  }

  static generateCSVReport(data) {
    const { Parser } = require('json2csv');
    
    const fields = [
      { label: 'Employee ID', value: 'employee_id' },
      { label: 'First Name', value: 'first_name' },
      { label: 'Last Name', value: 'last_name' },
      { label: 'Gross Salary', value: 'gross_salary' },
      { label: 'Savings Deduction', value: 'savings' },
      { label: 'Loan Deduction', value: 'loan' },
      { label: 'Net Salary', value: 'net_salary' },
      { label: 'Payroll Date', value: 'payroll_date' },
      { label: 'Batch Name', value: 'batch_name' },
      { label: 'Payment Status', value: 'payment_status' }
    ];
    
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(data);
    
    return {
      filename: `payroll_report_${new Date().toISOString().split('T')[0]}.csv`,
      content: csv,
      mimeType: 'text/csv'
    };
  }

  static async generateExcelReport(data) {
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Payroll Report');
    
    
    worksheet.columns = [
      { header: 'Employee ID', key: 'employee_id', width: 15 },
      { header: 'First Name', key: 'first_name', width: 15 },
      { header: 'Last Name', key: 'last_name', width: 15 },
      { header: 'Gross Salary', key: 'gross_salary', width: 15 },
      { header: 'Savings Deduction', key: 'savings', width: 18 },
      { header: 'Loan Deduction', key: 'loan', width: 15 },
      { header: 'Net Salary', key: 'net_salary', width: 12 },
      { header: 'Payroll Date', key: 'payroll_date', width: 15 },
      { header: 'Batch Name', key: 'batch_name', width: 20 },
      { header: 'Payment Status', key: 'payment_status', width: 15 }
    ];
    
    
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    
    
    data.forEach(record => {
      worksheet.addRow(record);
    });
    
    
    ['gross_salary', 'savings', 'loan', 'net_salary'].forEach(key => {
      worksheet.getColumn(key).numFmt = '#,##0.00';
    });
    
    
    const buffer = await workbook.xlsx.writeBuffer();
    
    return {
      filename: `payroll_report_${new Date().toISOString().split('T')[0]}.xlsx`,
      content: buffer,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    };
  }
}

module.exports = SalarySyncService;
