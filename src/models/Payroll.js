const { query, transaction } = require('../config/database');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const ExcelJS = require('exceljs');
const axios = require('axios');

class Payroll {
  static async createPayrollBatch(batchData, uploadUserId) {
    const { batch_name, payroll_date, total_employees, total_amount, file_path, cloudinary_url, public_id } = batchData;
    
    const insertQuery = `
      INSERT INTO payroll_batches 
      (batch_name, upload_user_id, total_employees, total_amount, payroll_date, file_path, cloudinary_url, public_id, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'UPLOADED')
    `;
    
    const result = await query(insertQuery, [
      batch_name, uploadUserId, total_employees, total_amount, payroll_date, file_path, cloudinary_url, public_id
    ]);
    
    return result.insertId;
  }
  
  static async processPayrollFile(filePath, uploadUserId, cloudinaryInfo = {}) {
    const { cloudinaryUrl, originalName, publicId } = cloudinaryInfo;
    const fileExtension = path.extname(originalName || filePath).toLowerCase();
    let payrollData = [];
    
    try {
      // Download file from Cloudinary for processing
      const fileBuffer = await this.downloadFromCloudinary(cloudinaryUrl || filePath);
      
      if (fileExtension === '.csv') {
        payrollData = await this.parseCSVBuffer(fileBuffer);
      } else if (fileExtension === '.xlsx' || fileExtension === '.xls') {
        payrollData = await this.parseExcelBuffer(fileBuffer);
      } else {
        throw new Error('Unsupported file format. Only CSV and Excel files are allowed.');
      }
      
      const validationResults = await this.validatePayrollData(payrollData);
      
      if (validationResults.errors.length > 0) {
        return {
          success: false,
          errors: validationResults.errors,
          warnings: validationResults.warnings,
          validRecords: validationResults.validRecords
        };
      }
      
      const batchName = `Payroll_${new Date().toISOString().split('T')[0]}_${uploadUserId}`;
      const payrollDate = payrollData[0]?.payroll_date || new Date().toISOString().split('T')[0];
      const totalEmployees = validationResults.validRecords.length;
      const totalAmount = validationResults.validRecords.reduce((sum, record) => sum + parseFloat(record.net_salary), 0);
      
      const batchId = await this.createPayrollBatch({
        batch_name: batchName,
        payroll_date: payrollDate,
        total_employees: totalEmployees,
        total_amount: totalAmount,
        file_path: originalName || filePath,
        cloudinary_url: cloudinaryUrl,
        public_id: publicId
      }, uploadUserId);
      
      await this.insertPayrollDetails(batchId, validationResults.validRecords);
      
      return {
        success: true,
        batchId,
        batchName,
        totalEmployees,
        totalAmount,
        warnings: validationResults.warnings,
        validRecords: validationResults.validRecords.length
      };
      
    } catch (error) {
      console.error('Payroll file processing error:', error);
      throw error;
    }
  }
  
  static async downloadFromCloudinary(url) {
    try {
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      return Buffer.from(response.data);
    } catch (error) {
      throw new Error(`Failed to download file from Cloudinary: ${error.message}`);
    }
  }

  static async parseCSVBuffer(buffer) {
    return new Promise((resolve, reject) => {
      const results = [];
      const stream = require('stream');
      const readable = new stream.Readable();
      readable.push(buffer);
      readable.push(null);
      
      readable
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', (error) => reject(error));
    });
  }

  static async parseExcelBuffer(buffer) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    
    const worksheet = workbook.getWorksheet(1);
    const results = [];
    
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      
      const data = {
        employee_id: row.getCell(1).value,
        gross_salary: parseFloat(row.getCell(2).value) || 0,
        net_salary: parseFloat(row.getCell(3).value) || 0,
        payroll_date: row.getCell(4).value ? new Date(row.getCell(4).value).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      };
      
      results.push(data);
    });
    
    return results;
  }

  static async parseCSVFile(filePath) {
    return new Promise((resolve, reject) => {
      const results = [];
      
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', (error) => reject(error));
    });
  }
  
  static async parseExcelFile(filePath) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    
    const worksheet = workbook.getWorksheet(1);
    const results = [];
    
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      
      const data = {
        employee_id: row.getCell(1).value,
        gross_salary: parseFloat(row.getCell(2).value) || 0,
        net_salary: parseFloat(row.getCell(3).value) || 0,
        payroll_date: row.getCell(4).value ? new Date(row.getCell(4).value).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      };
      
      results.push(data);
    });
    
    return results;
  }
  
  static async validatePayrollData(payrollData) {
    const errors = [];
    const warnings = [];
    const validRecords = [];
    const seenEmployeeIds = new Set();
    
    for (let i = 0; i < payrollData.length; i++) {
      const record = payrollData[i];
      const recordNumber = i + 1;
      
      if (!record.employee_id) {
        errors.push(`Record ${recordNumber}: Employee ID is required`);
        continue;
      }
      
      if (seenEmployeeIds.has(record.employee_id)) {
        errors.push(`Record ${recordNumber}: Duplicate employee ID ${record.employee_id}`);
        continue;
      }
      
      seenEmployeeIds.add(record.employee_id);
      
      if (!record.gross_salary || record.gross_salary <= 0) {
        errors.push(`Record ${recordNumber}: Valid gross salary is required`);
        continue;
      }
      
      if (!record.net_salary || record.net_salary <= 0) {
        errors.push(`Record ${recordNumber}: Valid net salary is required`);
        continue;
      }
      
      if (record.net_salary > record.gross_salary) {
        warnings.push(`Record ${recordNumber}: Net salary (${record.net_salary}) is greater than gross salary (${record.gross_salary})`);
      }
      
      const employeeQuery = `
        SELECT u.id, u.employee_id, u.is_active, ep.employment_status, sa.saving_percentage, l.monthly_repayment
        FROM users u
        JOIN employee_profiles ep ON u.id = ep.user_id
        LEFT JOIN savings_accounts sa ON u.id = sa.user_id AND sa.account_status = 'ACTIVE'
        LEFT JOIN loans l ON u.id = l.user_id AND l.status = 'ACTIVE'
        WHERE u.employee_id = ?
      `;
      
      try {
        const employees = await query(employeeQuery, [record.employee_id]);
        
        if (employees.length === 0) {
          errors.push(`Record ${recordNumber}: Employee ${record.employee_id} not found in system`);
          continue;
        }
        
        const employee = employees[0];
        
        if (!employee.is_active) {
          errors.push(`Record ${recordNumber}: Employee ${record.employee_id} is not active`);
          continue;
        }
        
        if (employee.employment_status !== 'ACTIVE') {
          warnings.push(`Record ${recordNumber}: Employee ${record.employee_id} employment status is ${employee.employment_status}`);
        }
        
        const savingsDeduction = employee.saving_percentage ? (record.gross_salary * employee.saving_percentage / 100) : 0;
        const loanRepayment = employee.monthly_repayment || 0;
        const totalDeductions = savingsDeduction + loanRepayment;
        
        if (totalDeductions > record.net_salary) {
          errors.push(`Record ${recordNumber}: Total deductions (${totalDeductions}) exceed net salary (${record.net_salary})`);
          continue;
        }
        
        validRecords.push({
          ...record,
          user_id: employee.id,
          savings_deduction: savingsDeduction,
          loan_repayment_deduction: loanRepayment,
          total_deductions: totalDeductions,
          final_amount: record.net_salary - totalDeductions
        });
        
      } catch (error) {
        errors.push(`Record ${recordNumber}: Database validation error - ${error.message}`);
      }
    }
    
    return { errors, warnings, validRecords };
  }
  
  static async insertPayrollDetails(batchId, validRecords) {
    return await transaction(async (connection) => {
      for (const record of validRecords) {
        await connection.execute(`
          INSERT INTO payroll_details 
          (payroll_batch_id, user_id, employee_id, gross_salary, net_salary, 
           savings_deduction, loan_repayment_deduction, total_deductions, final_amount)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          batchId, record.user_id, record.employee_id, record.gross_salary, record.net_salary,
          record.savings_deduction, record.loan_repayment_deduction, record.total_deductions, record.final_amount
        ]);
      }
    });
  }
  
  static async getPayrollBatches(page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;
    let whereClause = 'WHERE 1=1';
    const params = [];
    
    if (filters.status) {
      whereClause += ' AND pb.status = ?';
      params.push(filters.status);
    }
    
    if (filters.start_date) {
      whereClause += ' AND pb.payroll_date >= ?';
      params.push(filters.start_date);
    }
    
    if (filters.end_date) {
      whereClause += ' AND pb.payroll_date <= ?';
      params.push(filters.end_date);
    }
    
    const countQuery = `
      SELECT COUNT(*) as total FROM payroll_batches pb ${whereClause}
    `;
    
    const selectQuery = `
      SELECT pb.*, u.username as upload_username, ep.first_name as upload_first_name, ep.last_name as upload_last_name,
             confirmer.username as confirm_username, confirmer.first_name as confirm_first_name, confirmer.last_name as confirm_last_name
      FROM payroll_batches pb
      JOIN users u ON pb.upload_user_id = u.id
      JOIN employee_profiles ep ON u.id = ep.user_id
      LEFT JOIN users confirmer ON pb.confirmed_by = confirmer.id
      LEFT JOIN employee_profiles confirmer_profile ON confirmer.id = confirmer_profile.user_id
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
  }
  
  static async getPayrollBatch(batchId) {
    const batchQuery = `
      SELECT pb.*, u.username as upload_username, ep.first_name as upload_first_name, ep.last_name as upload_last_name,
             confirmer.username as confirm_username, confirmer.first_name as confirm_first_name, confirmer.last_name as confirm_last_name
      FROM payroll_batches pb
      JOIN users u ON pb.upload_user_id = u.id
      JOIN employee_profiles ep ON u.id = ep.user_id
      LEFT JOIN users confirmer ON pb.confirmed_by = confirmer.id
      LEFT JOIN employee_profiles confirmer_profile ON confirmer.id = confirmer_profile.user_id
      WHERE pb.id = ?
    `;
    
    const batches = await query(batchQuery, [batchId]);
    return batches[0] || null;
  }
  
  static async getPayrollDetails(batchId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const countQuery = `
      SELECT COUNT(*) as total FROM payroll_details WHERE payroll_batch_id = ?
    `;
    
    const selectQuery = `
      SELECT pd.*, u.username, u.email, ep.first_name, ep.last_name, ep.department, ep.job_grade
      FROM payroll_details pd
      JOIN users u ON pd.user_id = u.id
      JOIN employee_profiles ep ON pd.user_id = ep.user_id
      WHERE pd.payroll_batch_id = ?
      ORDER BY pd.employee_id ASC
      LIMIT ? OFFSET ?
    `;
    
    const [countResult, details] = await Promise.all([
      query(countQuery, [batchId]),
      query(selectQuery, [batchId, limit, offset])
    ]);
    
    return {
      details,
      pagination: {
        page,
        limit,
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit)
      }
    };
  }
  
  static async confirmPayrollBatch(batchId, confirmedBy) {
    return await transaction(async (connection) => {
      const batch = await this.getPayrollBatch(batchId);
      
      if (!batch) {
        throw new Error('Payroll batch not found');
      }
      
      if (batch.status !== 'VALIDATED') {
        throw new Error('Payroll batch must be validated before confirmation');
      }
      
      const details = await this.getPayrollDetails(batchId, 1, 10000);
      
      for (const detail of details.details) {
        if (detail.savings_deduction > 0) {
          const savingsAccountQuery = 'SELECT id, current_balance FROM savings_accounts WHERE user_id = ? AND account_status = "ACTIVE"';
          const [savingsAccount] = await connection.execute(savingsAccountQuery, [detail.user_id]);
          
          if (savingsAccount[0]) {
            const balanceBefore = savingsAccount[0].current_balance || 0;
            const balanceAfter = balanceBefore + detail.savings_deduction;
            
            // Insert transaction with proper balance tracking
            await connection.execute(`
              INSERT INTO savings_transactions 
              (savings_account_id, user_id, transaction_type, amount, balance_before, balance_after, reference_id, description, payroll_batch_id)
              VALUES (?, ?, 'CONTRIBUTION', ?, ?, ?, ?, ?, ?)
            `, [
              savingsAccount[0].id, detail.user_id, detail.savings_deduction, 
              balanceBefore, balanceAfter,
              `PAYROLL-${batchId}`, 'Automatic savings deduction from payroll', batchId
            ]);
            
            // Update savings account balance
            await connection.execute(`
              UPDATE savings_accounts 
              SET current_balance = ?, last_contribution_date = NOW(), updated_at = NOW()
              WHERE id = ?
            `, [balanceAfter, savingsAccount[0].id]);
          }
        }
        
        if (detail.loan_repayment_deduction > 0) {
          const loanQuery = 'SELECT id FROM loans WHERE user_id = ? AND status = "ACTIVE"';
          const [loan] = await connection.execute(loanQuery, [detail.user_id]);
          
          if (loan[0]) {
            await connection.execute(`
              INSERT INTO loan_repayments 
              (loan_id, user_id, amount, principal_amount, interest_amount, balance_before, balance_after, reference_id, payroll_batch_id)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
              loan[0].id, detail.user_id, detail.loan_repayment_deduction,
              detail.loan_repayment_deduction, 0, 0, 0,
              `PAYROLL-${batchId}`, batchId
            ]);
          }
        }
        
        await connection.execute(`
          UPDATE payroll_details 
          SET payment_status = 'PAID', payment_date = NOW(), payment_reference = ?
          WHERE id = ?
        `, [`PAYROLL-${batchId}-${detail.employee_id}`, detail.id]);
      }
      
      await connection.execute(`
        UPDATE payroll_batches 
        SET status = 'CONFIRMED', confirmed_by = ?, confirmed_date = NOW(), updated_at = NOW()
        WHERE id = ?
      `, [confirmedBy, batchId]);
      
      return {
        batchId,
        totalEmployees: details.details.length,
        totalSavingsDeductions: details.details.reduce((sum, d) => sum + d.savings_deduction, 0),
        totalLoanRepayments: details.details.reduce((sum, d) => sum + d.loan_repayment_deduction, 0)
      };
    });
  }
  
  static async validatePayrollBatch(batchId) {
    const batch = await this.getPayrollBatch(batchId);
    
    if (!batch) {
      throw new Error('Payroll batch not found');
    }
    
    if (batch.status !== 'UPLOADED') {
      throw new Error('Payroll batch can only be validated in UPLOADED status');
    }
    
    const details = await this.getPayrollDetails(batchId, 1, 10000);
    const validationErrors = [];
    
    for (const detail of details.details) {
      if (detail.total_deductions > detail.net_salary) {
        validationErrors.push(`Employee ${detail.employee_id}: Deductions exceed net salary`);
      }
    }
    
    const updateQuery = `
      UPDATE payroll_batches 
      SET status = ?, validation_errors = ?, updated_at = NOW()
      WHERE id = ?
    `;
    
    const status = validationErrors.length > 0 ? 'UPLOADED' : 'VALIDATED';
    const errorsText = validationErrors.length > 0 ? validationErrors.join('; ') : null;
    
    await query(updateQuery, [status, errorsText, batchId]);
    
    return {
      batchId,
      status,
      validationErrors,
      totalRecords: details.details.length
    };
  }
  
  static async getPayrollStats(startDate = null, endDate = null) {
    let whereClause = 'WHERE 1=1';
    const params = [];
    
    if (startDate) {
      whereClause += ' AND pb.payroll_date >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      whereClause += ' AND pb.payroll_date <= ?';
      params.push(endDate);
    }
    
    const statsQuery = `
      SELECT 
        COUNT(*) as total_batches,
        SUM(pb.total_employees) as total_employees,
        SUM(pb.total_amount) as total_amount,
        COUNT(CASE WHEN pb.status = 'CONFIRMED' THEN 1 END) as confirmed_batches,
        COUNT(CASE WHEN pb.status = 'VALIDATED' THEN 1 END) as validated_batches,
        COUNT(CASE WHEN pb.status = 'UPLOADED' THEN 1 END) as uploaded_batches,
        AVG(pb.total_amount) as avg_batch_amount
      FROM payroll_batches pb
      ${whereClause}
    `;
    
    const deductionStatsQuery = `
      SELECT 
        SUM(pd.savings_deduction) as total_savings_deductions,
        SUM(pd.loan_repayment_deduction) as total_loan_repayments,
        SUM(pd.total_deductions) as total_deductions,
        COUNT(CASE WHEN pd.payment_status = 'PAID' THEN 1 END) as paid_employees,
        COUNT(CASE WHEN pd.payment_status = 'PENDING' THEN 1 END) as pending_employees
      FROM payroll_details pd
      JOIN payroll_batches pb ON pd.payroll_batch_id = pb.id
      ${whereClause}
    `;
    
    const [stats, deductionStats] = await Promise.all([
      query(statsQuery, params),
      query(deductionStatsQuery, params)
    ]);
    
    return {
      ...stats[0],
      ...deductionStats[0]
    };
  }
}

module.exports = Payroll;
