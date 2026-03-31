const { query, transaction } = require('../config/database');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const ExcelJS = require('exceljs');
const axios = require('axios');

class Payroll {
  static async createPayrollBatch(batchData, uploadUserId) {
    const { batch_name, payroll_date, total_employees, total_amount, file_path, cloudinary_url, public_id } = batchData;
    
    // Extract month and year
    const pDate = new Date(payroll_date);
    const month = pDate.getMonth() + 1;
    const year = pDate.getFullYear();

    // Check for duplicates
    const checkQuery = `
      SELECT id FROM payroll_batches 
      WHERE payroll_month = ? AND payroll_year = ? AND status != 'REVERSED'
    `;
    const existing = await query(checkQuery, [month, year]);
    if (existing.length > 0) {
      throw new Error(`Payroll for ${month}/${year} already exists and is not reversed.`);
    }
    
    const insertQuery = `
      INSERT INTO payroll_batches 
      (batch_name, upload_user_id, total_employees, total_amount, payroll_date, payroll_month, payroll_year, file_path, cloudinary_url, public_id, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'UPLOADED')
    `;
    
    const result = await query(insertQuery, [
      batch_name, uploadUserId, total_employees, total_amount, payroll_date, month, year, file_path, cloudinary_url, public_id
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
      console.log('Payroll validation results:', {
        totalParsed: payrollData.length,
        errors: validationResults.errors,
        warnings: validationResults.warnings,
        validRecords: validationResults.validRecords.length,
        sampleData: payrollData.slice(0, 2)
      });
      
      if (validationResults.errors.length > 0) {
        console.error('Payroll validation errors:', validationResults.errors);
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
      return {
        success: false,
        errors: [error.message],
        warnings: [],
        validRecords: 0,
        totalEmployees: 0,
        totalAmount: 0,
        batchId: null,
        batchName: null
      };
    }
  }
  
  static async downloadFromCloudinary(url) {
    try {
      if (!url || typeof url !== 'string') {
        throw new Error(`Invalid URL type identifier provided`);
      }

      // Handle protocol-relative URLs (e.g. //res.cloudinary.com/...)
      let downloadUrl = url;
      if (downloadUrl.startsWith('//')) {
        downloadUrl = `https:${downloadUrl}`;
      }

      console.log('Final Cloudinary download URL:', downloadUrl);
      
      if (!downloadUrl.startsWith('http')) {
        throw new Error(`Invalid URL format: ${downloadUrl}`);
      }

      const response = await axios.get(downloadUrl, { 
        responseType: 'arraybuffer',
        timeout: 15000 // Increased to 15s
      });
      return Buffer.from(response.data);
    } catch (error) {
      console.error('Cloudinary download details:', {
        originalUrl: url,
        error: error.message,
        responseStatus: error.response?.status
      });
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
        .on('data', (data) => {
          const processedData = {
            employee_id: data.employee_id || data['employee_id'],
            gross_salary: parseFloat(data['gross salary'] || data.gross_salary || 0),
            saving: parseFloat(data.saving || 0),
            deduction: parseFloat(data.deduction || 0),
            net_salary: parseFloat(data['net salary'] || data.net_salary || 0),
            payroll_date: data.payroll_date || data['payroll_date'] || new Date().toISOString().split('T')[0]
          };
          
          // Calculate net salary if not provided
          if (!data['net salary'] && !data.net_salary) {
            processedData.net_salary = processedData.gross_salary - processedData.saving - processedData.deduction;
          }
          
          results.push(processedData);
        })
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
        saving: parseFloat(row.getCell(3).value) || 0,
        deduction: parseFloat(row.getCell(4).value) || 0,
        net_salary: parseFloat(row.getCell(5).value) || 0,
        payroll_date: row.getCell(6).value ? new Date(row.getCell(6).value).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      };
      
      // Calculate net salary if not provided or zero
      if (!row.getCell(5).value || parseFloat(row.getCell(5).value) === 0) {
        data.net_salary = data.gross_salary - data.saving - data.deduction;
      }
      
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
      
      if (!record.net_salary || record.net_salary < 0) {
        warnings.push(`Record ${recordNumber}: Net salary should not be negative (calculated as ${record.net_salary})`);
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
        const systemDeductions = savingsDeduction + loanRepayment;
        
        // Use the net salary from file (already calculated as gross - saving - deduction)
        const fileNetSalary = record.net_salary;
        
        // Check if file net salary matches system calculation
        const expectedNetSalary = record.gross_salary - systemDeductions;
        if (Math.abs(fileNetSalary - expectedNetSalary) > 0.01) {
          warnings.push(`Record ${recordNumber}: File net salary (${fileNetSalary}) differs from system calculation (${expectedNetSalary})`);
        }
        
        validRecords.push({
          ...record,
          user_id: employee.id,
          savings_deduction: savingsDeduction,
          loan_repayment_deduction: loanRepayment,
          total_deductions: systemDeductions,
          net_salary: fileNetSalary, // Use net salary from file
          final_amount: fileNetSalary
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
        await connection.query(`
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
  
  static async approvePayrollBatch(batchId, approvedBy) {
    const batch = await this.getPayrollBatch(batchId);
    
    if (!batch) {
      throw new Error('Payroll batch not found');
    }
    
    if (batch.status !== 'VALIDATED') {
      throw new Error('Payroll batch must be validated before approval');
    }
    
    const updateQuery = `
      UPDATE payroll_batches 
      SET status = 'CONFIRMED', confirmed_by = ?, confirmed_date = NOW(), updated_at = NOW()
      WHERE id = ?
    `;
    
    await query(updateQuery, [approvedBy, batchId]);
    return { batchId, status: 'CONFIRMED' };
  }

  static async processPayrollBatch(batchId, processedBy) {
    return await transaction(async (connection) => {
      const batch = await this.getPayrollBatch(batchId);
      
      if (!batch) {
        throw new Error('Payroll batch not found');
      }
      
      if (batch.status !== 'CONFIRMED') {
        throw new Error('Payroll batch must be approved before processing');
      }
      
      const details = await this.getPayrollDetails(batchId, 1, 10000);
      
      for (const detail of details.details) {
        if (detail.savings_deduction > 0) {
          const savingsAccountQuery = 'SELECT id, current_balance FROM savings_accounts WHERE user_id = ? AND account_status = "ACTIVE"';
          const savingsAccount = await connection.query(savingsAccountQuery, [detail.user_id]);
          
          if (savingsAccount.length > 0) {
            const balanceBefore = savingsAccount[0].current_balance || 0;
            const balanceAfter = balanceBefore + detail.savings_deduction;
            
            await connection.query(`
              INSERT INTO savings_transactions 
              (savings_account_id, user_id, transaction_type, amount, balance_before, balance_after, reference_id, description, payroll_batch_id)
              VALUES (?, ?, 'CONTRIBUTION', ?, ?, ?, ?, ?, ?)
            `, [
              savingsAccount[0].id, detail.user_id, detail.savings_deduction, 
              balanceBefore, balanceAfter,
              `PAYROLL-${batchId}`, 'Automatic savings deduction from payroll', batchId
            ]);
            
            await connection.query(`
              UPDATE savings_accounts 
              SET current_balance = ?, last_contribution_date = NOW(), updated_at = NOW()
              WHERE id = ?
            `, [balanceAfter, savingsAccount[0].id]);
          }
        }
        
        if (detail.loan_repayment_deduction > 0) {
          const loanQuery = 'SELECT id FROM loans WHERE user_id = ? AND status = "ACTIVE"';
          const loan = await connection.query(loanQuery, [detail.user_id]);
          
          if (loan.length > 0) {
            await connection.query(`
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
        
        await connection.query(`
          UPDATE payroll_details 
          SET payment_status = 'PAID', payment_date = NOW(), payment_reference = ?
          WHERE id = ?
        `, [`PAYROLL-${batchId}-${detail.employee_id}`, detail.id]);
      }
      
      await connection.query(`
        UPDATE payroll_batches 
        SET status = 'PROCESSED', processed_date = NOW(), updated_at = NOW()
        WHERE id = ?
      `, [batchId]);
      
      return {
        batchId,
        status: 'PROCESSED',
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

  static async reversePayrollBatch(batchId, reversedBy) {
    return await transaction(async (connection) => {
      const batch = await this.getPayrollBatch(batchId);
      
      if (!batch) {
        throw new Error('Payroll batch not found');
      }
      
      if (batch.status !== 'CONFIRMED' && batch.status !== 'PROCESSED') {
        throw new Error('Only CONFIRMED or PROCESSED batches can be reversed');
      }
      
      const details = await this.getPayrollDetails(batchId, 1, 10000);
      
      for (const detail of details.details) {
        // Reverse savings transactions
        if (detail.savings_deduction > 0) {
          const savingsAccountQuery = 'SELECT id, current_balance FROM savings_accounts WHERE user_id = ?';
          const savingsAccount = await connection.query(savingsAccountQuery, [detail.user_id]);
          
          if (savingsAccount.length > 0) {
            const balanceBefore = savingsAccount[0].current_balance;
            const balanceAfter = balanceBefore - detail.savings_deduction;
            
            await connection.query(`
              INSERT INTO savings_transactions 
              (savings_account_id, user_id, transaction_type, amount, balance_before, balance_after, reference_id, description, payroll_batch_id)
              VALUES (?, ?, 'WITHDRAWAL', ?, ?, ?, ?, ?, ?)
            `, [
              savingsAccount[0].id, detail.user_id, detail.savings_deduction, 
              balanceBefore, balanceAfter,
              `REVERSAL-${batchId}`, `Reversal of payroll batch ${batchId}`, batchId
            ]);
            
            await connection.query(`
              UPDATE savings_accounts 
              SET current_balance = ?, updated_at = NOW()
              WHERE id = ?
            `, [balanceAfter, savingsAccount[0].id]);
          }
        }
        
        // Reverse loan repayments
        if (detail.loan_repayment_deduction > 0) {
          const loanQuery = 'SELECT id, paid_amount, outstanding_balance FROM loans WHERE user_id = ? AND (status = "ACTIVE" OR status = "COMPLETED")';
          const loan = await connection.query(loanQuery, [detail.user_id]);
          
          if (loan.length > 0) {
            // Revert paid amount and outstanding balance? 
            // Usually we just mark the repayment as reversed or add a negative repayment.
            // For simplicity, let's just add a log entry if needed, but since we don't have a reversal flag on repayments table yet,
            // we'll just log it in audit. Actually, we should probably delete/invalidate the repayment records.
            await connection.query(`
              DELETE FROM loan_repayments 
              WHERE payroll_batch_id = ? AND user_id = ?
            `, [batchId, detail.user_id]);
          }
        }
        
        await connection.query(`
          UPDATE payroll_details 
          SET payment_status = 'FAILED', payment_reference = ?
          WHERE id = ?
        `, [`REVERSED-${batchId}`, detail.id]);
      }
      
      await connection.query(`
        UPDATE payroll_batches 
        SET status = 'REVERSED', updated_at = NOW()
        WHERE id = ?
      `, [batchId]);
      
      return {
        batchId,
        status: 'REVERSED',
        totalReverted: details.details.length
      };
    });
  }
  static async getPayrollStats(startDate, endDate) {
    const db = require('../config/database');
    let whereClause = "WHERE status = 'PROCESSED'";
    const params = [];

    if (startDate) {
      whereClause += " AND payroll_date >= ?";
      params.push(startDate);
    }
    if (endDate) {
      whereClause += " AND payroll_date <= ?";
      params.push(endDate);
    }

    const statsQuery = `
      SELECT 
        COUNT(*) as total_batches,
        COALESCE(SUM(total_employees), 0) as total_employees_processed,
        COALESCE(SUM(total_amount), 0) as total_payroll_amount,
        COALESCE(AVG(total_amount), 0) as average_batch_amount,
        COALESCE(SUM(total_deductions), 0) as total_deductions
      FROM payroll_batches
      ${whereClause}
    `;

    const trendQuery = `
      SELECT 
        DATE_FORMAT(payroll_date, '%b') as month,
        SUM(total_amount) as amount
      FROM payroll_batches
      WHERE status = 'PROCESSED'
      GROUP BY DATE_FORMAT(payroll_date, '%Y-%m'), month
      ORDER BY DATE_FORMAT(payroll_date, '%Y-%m') DESC
      LIMIT 6
    `;

    const [stats, trend] = await Promise.all([
      db.query(statsQuery, params),
      db.query(trendQuery)
    ]);

    const s = stats[0];

    return {
      currentMonth: {
        totalPayroll: parseFloat(s.total_payroll_amount || 0),
        totalEmployees: parseInt(s.total_employees_processed || 0),
        averageSalary: s.total_employees_processed > 0 ? parseFloat(s.total_payroll_amount / s.total_employees_processed) : 0,
        totalDeductions: parseFloat(s.total_deductions || 0),
        netPayroll: parseFloat(s.total_payroll_amount || 0) - parseFloat(s.total_deductions || 0),
        overtimeCost: 0, 
        taxes: 0
      },
      lastMonth: {
        totalPayroll: 0, 
        totalEmployees: 0,
        averageSalary: 0,
        overtimeCost: 0,
        taxes: 0,
        netPayroll: 0
      },
      yearToDate: {
        totalPayroll: 0,
        totalEmployees: 0,
        averageSalary: 0,
        overtimeCost: 0,
        taxes: 0,
        netPayroll: 0
      },
      trend: trend.length > 0 ? trend.reverse() : [
        { month: 'Jan', amount: 0 },
        { month: 'Feb', amount: 0 },
        { month: 'Mar', amount: 0 },
        { month: 'Apr', amount: 0 },
        { month: 'May', amount: 0 },
        { month: 'Jun', amount: 0 }
      ]
    };
  }
}

module.exports = Payroll;
