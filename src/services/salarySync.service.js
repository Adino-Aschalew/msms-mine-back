const { query, transaction } = require('../config/database');
const NotificationService = require('./notification.service');

class SalarySyncService {
  static async processPayrollUpload(payrollData, uploadedBy) {
    return transaction(async (connection) => {
      // Create payroll batch
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
      
      // Process each payroll record
      let processedCount = 0;
      let errorCount = 0;
      
      for (const record of payrollData) {
        try {
          await this.processPayrollRecord(connection, record, batchId);
          processedCount++;
        } catch (error) {
          console.error(`Error processing payroll record for employee ${record['Employee ID'] || record.employee_id}:`, error);
          errorCount++;
          
          // Log error - assuming payroll_errors or similar exists or we skip for now
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
      
      // Update batch status
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
    const savings_deduction = parseFloat(record['Savings Deduction'] || record.savings || 0);
    const loan_deduction = parseFloat(record['Loan Deduction'] || record.loan_payment || 0);
    const net_salary = parseFloat(record['Net Salary'] || record.net_pay || (gross_salary - savings_deduction - loan_deduction));
    
    // Validate employee exists
    const [employees] = await connection.execute(
      'SELECT id, username FROM users WHERE employee_id = ?',
      [employee_id]
    );
    
    if (!employees || employees.length === 0) {
      throw new Error(`Employee with ID ${employee_id} not found in system`);
    }
    
    const userId = employees[0].id;
    
    // Insert payroll detail
    const payrollInsertQuery = `
      INSERT INTO payroll_details (
        payroll_batch_id, user_id, employee_id, gross_salary, net_salary, 
        savings_deduction, loan_repayment_deduction, total_deductions, 
        final_amount, payment_status, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PAID', NOW())
    `;
    
    const total_deductions = savings_deduction + loan_deduction;
    
    await connection.execute(payrollInsertQuery, [
      batchId,
      userId,
      employee_id,
      gross_salary,
      net_salary,
      savings_deduction,
      loan_deduction,
      total_deductions,
      net_salary, // Final amount paid to bank
    ]);
    
    // Process automatic savings contribution
    if (savings_deduction > 0) {
      await this.processSavingsContribution(connection, userId, savings_deduction, `PAYROLL_BATCH_${batchId}`);
    }
    
    // Process loan deductions
    if (loan_deduction > 0) {
      await this.processLoanDeductionFromPayroll(connection, userId, loan_deduction, `PAYROLL_BATCH_${batchId}`);
    }
    
    // Send notification to employee
    await NotificationService.createNotification(
      userId,
      'Payroll Processed',
      `Your payroll for this period has been processed. Net amount: ${net_salary}. Savings deduction: ${savings_deduction} has been deposited to your account.`,
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
    // Get user's savings account
    const [savingsAccount] = await connection.execute(
      'SELECT * FROM savings_accounts WHERE user_id = ? AND account_status = "ACTIVE"',
      [userId]
    );
    
    if (!savingsAccount || !savingsAccount[0]) {
      console.warn(`No active savings account found for user ${userId}. Skipping contribution.`);
      return;
    }
    
    const account = savingsAccount[0];
    
    // Add savings transaction
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
    
    // Update account balance
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
    // Get active loans for this user
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
      
      // Process loan payment - Using loan_repayments table
      await connection.execute(`
        INSERT INTO loan_repayments (loan_id, user_id, amount, principal_amount, interest_amount, balance_before, balance_after, payroll_batch_id, status, repayment_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PAID', NOW())
      `, [
        loan.id,
        userId,
        paymentForThisLoan,
        paymentForThisLoan, // Simplified principal allocation
        0, // Simplified interest allocation
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
}

module.exports = SalarySyncService;
