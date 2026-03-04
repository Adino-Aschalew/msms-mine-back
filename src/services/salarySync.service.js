const { query, transaction } = require('../config/database');
const NotificationService = require('./notification.service');

class SalarySyncService {
  static async processPayrollUpload(payrollData, uploadedBy) {
    const connection = await transaction();
    
    try {
      // Create payroll batch
      const batchInsertQuery = `
        INSERT INTO payroll_batches (batch_name, upload_user_id, total_employees, total_amount, payroll_date, status, file_path, created_at)
        VALUES (?, ?, ?, ?, CURRENT_DATE(), 'UPLOADED', 'csv_upload', NOW())
      `;
      
      const [batchResult] = await connection.execute(batchInsertQuery, [
        `Payroll_${new Date().toISOString().split('T')[0]}`,
        uploadedBy,
        payrollData.length,
        payrollData.reduce((sum, record) => sum + parseFloat(record.salary || 0), 0)
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
          console.error(`Error processing payroll record for employee ${record.employee_id}:`, error);
          errorCount++;
          
          // Log error
          await connection.execute(`
            INSERT INTO payroll_errors (batch_id, employee_id, error_message, record_data, created_at)
            VALUES (?, ?, ?, ?, NOW())
          `, [batchId, record.employee_id, error.message, JSON.stringify(record)]);
        }
      }
      
      // Update batch status
      const status = errorCount === 0 ? 'PROCESSED' : 'PARTIALLY_PROCESSED';
      await connection.execute(`
        UPDATE payroll_batches 
        SET status = ?, processed_date = NOW(), updated_at = NOW()
        WHERE id = ?
      `, [status, batchId]);
      
      await connection.commit();
      
      return {
        success: true,
        batchId,
        processedCount,
        errorCount,
        status
      };
      
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  }

  static async processPayrollRecord(connection, record, batchId) {
    const { employee_id, salary, bonus, deductions } = record;
    
    // Validate employee exists
    const [employee] = await connection.execute(
      'SELECT id, first_name, email FROM users u LEFT JOIN employee_profiles ep ON u.id = ep.user_id WHERE u.employee_id = ?',
      [employee_id]
    );
    
    if (!employee || !employee[0]) {
      throw new Error(`Employee ${employee_id} not found`);
    }
    
    const userId = employee[0].id;
    const gross_salary = parseFloat(salary) + parseFloat(bonus || 0);
    const net_salary = gross_salary - parseFloat(deductions || 0);
    
    // Insert payroll record
    const payrollInsertQuery = `
      INSERT INTO payroll_records (user_id, employee_id, batch_id, gross_salary, net_salary, deductions, allowances, pay_period, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    
    await connection.execute(payrollInsertQuery, [
      userId,
      employee_id,
      batchId,
      gross_salary,
      net_salary,
      JSON.stringify({ total: deductions || 0 }),
      JSON.stringify({ bonus: bonus || 0 }),
      new Date().toISOString().split('T')[0] // Current month as pay period
    ]);
    
    // Process automatic savings contribution
    await this.processSavingsContribution(connection, userId, net_salary, new Date().toISOString().split('T')[0]);
    
    // Process automatic loan deductions
    await this.processLoanDeductions(connection, userId, new Date().toISOString().split('T')[0]);
    
    // Send notification to employee
    await NotificationService.createNotification(
      userId,
      'Salary Processed',
      `Your salary of ${net_salary} has been processed and deposited to your account.`,
      'PAYROLL'
    );
    
    return {
      userId,
      employee_id,
      gross_salary,
      net_salary,
      processed: true
    };
  }

  static async processSavingsContribution(connection, userId, netSalary, payPeriod) {
    // Get user's savings account
    const [savingsAccount] = await connection.execute(
      'SELECT * FROM savings_accounts WHERE user_id = ? AND account_status = "ACTIVE"',
      [userId]
    );
    
    if (!savingsAccount || !savingsAccount[0]) {
      return; // No active savings account
    }
    
    const account = savingsAccount[0];
    const savingPercentage = account.saving_percentage;
    const contributionAmount = (netSalary * savingPercentage) / 100;
    
    if (contributionAmount > 0) {
      // Add savings transaction
      await connection.execute(`
        INSERT INTO savings_transactions (account_id, user_id, transaction_type, amount, balance_before, balance_after, reference_id, description, transaction_date)
        VALUES (?, ?, 'CONTRIBUTION', ?, ?, ?, ?, ?, NOW())
      `, [
        account.id,
        userId,
        contributionAmount,
        account.current_balance,
        account.current_balance + contributionAmount,
        `PAYROLL_${payPeriod}`,
        `Automatic savings contribution for ${payPeriod}`
      ]);
      
      // Update account balance
      await connection.execute(
        'UPDATE savings_accounts SET current_balance = ?, updated_at = NOW() WHERE id = ?',
        [account.current_balance + contributionAmount, account.id]
      );
    }
  }

  static async processLoanDeductions(connection, userId, payPeriod) {
    // Get active loans with automatic deductions
    const [loans] = await connection.execute(`
      SELECT * FROM loans 
      WHERE user_id = ? AND status = 'ACTIVE' AND auto_deduct = true
      ORDER BY next_payment_date ASC
    `, [userId]);
    
    for (const loan of loans) {
      if (loan.amount_due > 0 && loan.next_payment_date <= new Date()) {
        try {
          // Process loan payment
          await this.processLoanPayment(connection, loan, payPeriod);
        } catch (error) {
          console.error(`Error processing loan payment for loan ${loan.id}:`, error);
        }
      }
    }
  }

  static async processLoanPayment(connection, loan, payPeriod) {
    const paymentAmount = Math.min(loan.amount_due, loan.monthly_payment);
    
    // Add loan transaction
    await connection.execute(`
      INSERT INTO loan_transactions (loan_id, user_id, transaction_type, amount, balance_before, balance_after, reference_id, description, transaction_date)
      VALUES (?, ?, 'PAYMENT', ?, ?, ?, ?, ?, NOW())
    `, [
      loan.id,
      loan.user_id,
      paymentAmount,
      loan.outstanding_balance,
      loan.outstanding_balance - paymentAmount,
      `PAYROLL_${payPeriod}`,
      `Automatic loan payment for ${payPeriod}`
    ]);
    
    // Update loan balance
    const newBalance = loan.outstanding_balance - paymentAmount;
    const newStatus = newBalance <= 0 ? 'COMPLETED' : 'ACTIVE';
    
    await connection.execute(`
      UPDATE loans 
      SET outstanding_balance = ?, amount_due = ?, status = ?, last_payment_date = NOW(), updated_at = NOW()
      WHERE id = ?
    `, [newBalance, 0, newStatus, loan.id]);
    
    // Update next payment date if not completed
    if (newStatus !== 'COMPLETED') {
      const nextPaymentDate = new Date(loan.next_payment_date);
      nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
      
      await connection.execute(
        'UPDATE loans SET next_payment_date = ? WHERE id = ?',
        [nextPaymentDate, loan.id]
      );
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
        SELECT pr.*, ep.first_name, ep.last_name, ep.department
        FROM payroll_records pr
        LEFT JOIN users u ON pr.user_id = u.id
        LEFT JOIN employee_profiles ep ON u.id = ep.user_id
        WHERE pr.batch_id = ?
        ORDER BY pr.employee_id
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
        FROM payroll_records 
        WHERE user_id = ?
      `;
      
      const selectQuery = `
        SELECT * FROM payroll_records 
        WHERE user_id = ?
        ORDER BY pay_period DESC
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
