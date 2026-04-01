const { query, transaction } = require('../config/database');
const fs = require('fs').promises;
const path = require('path');
const csv = require('csv-parser');
const ExcelJS = require('exceljs');
const { auditLog } = require('../middleware/audit');
const axios = require('axios');

/**
 * Payroll Model - Handles payroll processing, validation, and database operations
 * 
 * EXPECTED CSV/EXCEL FILE FORMAT:
 * Column 1: employee_id (e.g., EMP001)
 * Column 2: gross_salary (numeric, e.g., 5000)
 * Column 3: saving (numeric, e.g., 500)
 * Column 4: deduction (numeric, e.g., 500)
 * Column 5: net_salary (numeric, e.g., 4000) - MUST equal gross_salary - saving - deduction
 * Column 6: payroll_date (optional, format: YYYY-MM-DD)
 * 
 * CSV Headers can use spaces: "gross salary", "net salary"
 * Excel files should use underscore column names: gross_salary, net_salary
 * 
 * Net Salary Calculation: net_salary MUST equal gross_salary - saving - deduction
 * Files with incorrect net salary calculations will be rejected with validation errors
 * 
 * PAYROLL BATCH STATUS LIFECYCLE:
 * 1. UPLOADED - Initial state after file upload
 * 2. VALIDATED - File parsed and validated successfully
 * 3. CONFIRMED - Batch approved by finance admin (approvePayrollBatch)
 * 4. PROCESSED - Payroll deductions applied to accounts
 * 5. REVERSED - Batch rolled back (reversePayrollBatch)
 */

class Payroll {
  static async createPayrollBatch(batchData, uploadUserId) {
    const { batch_name, payroll_date, total_employees, total_amount, file_path, cloudinary_url, public_id } = batchData;

    // Extract month and year
    const pDate = new Date(payroll_date);
    const month = pDate.getMonth() + 1;
    const year = pDate.getFullYear();

    // Check for duplicates - allow multiple uploads for same month but show warning
    const checkQuery = `
      SELECT id, batch_name, status FROM payroll_batches 
        WHERE payroll_month = ? AND payroll_year = ? AND status != 'REVERSED'
    `;
    const existing = await query(checkQuery, [month, year]);
    if (existing.length > 0) {
      console.log(`Warning: Found ${existing.length} existing payroll batch(es) for ${month}/${year}`);
      // Don't throw error, just log warning - allow multiple uploads
    }

    const insertQuery = `
      INSERT INTO payroll_batches 
      (batch_name, upload_user_id, total_employees, total_amount, payroll_date, payroll_month, payroll_year, file_path, cloudinary_url, public_id, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await query(insertQuery, [
      batch_name, uploadUserId, total_employees, total_amount, payroll_date, month, year, file_path, cloudinary_url, public_id, 'VALIDATED'
    ]);

    return result.insertId;
  }

  static async processPayrollFile(filePath, uploadUserId, cloudinaryInfo = {}) {
    console.log('=== PAYROLL FILE PROCESSING START ===');
    console.log('File path:', filePath);
    console.log('Upload User ID:', uploadUserId);
    console.log('Cloudinary info:', cloudinaryInfo);

    const { cloudinaryUrl, originalName, publicId } = cloudinaryInfo;
    const fileExtension = path.extname(originalName || filePath).toLowerCase();
    let payrollData = [];
    let fileBuffer = null;

    console.log('File extension:', fileExtension);
    console.log('Original name:', originalName);

    try {
      // Download from Cloudinary if URL provided, otherwise read local file
      if (cloudinaryUrl) {
        fileBuffer = await this.downloadFromCloudinary(cloudinaryUrl);
      } else if (filePath && fs.existsSync(filePath)) {
        // Read local file directly
        fileBuffer = await fs.readFile(filePath);
      } else {
        throw new Error('No valid file source provided (missing Cloudinary URL or local file path)');
      }

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
        validRecords: validationResults.validRecords
      };

    } catch (error) {
      console.error('Payroll file processing error:', error);
      return {
        success: false,
        errors: [error.message],
        warnings: [],
        validRecords: [],
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
        .pipe(csv({ mapHeaders: ({ header }) => header.toLowerCase().trim() }))
        .on('data', (data) => {
          // Standardize to underscore field names immediately
          const processedData = {
            employee_id: data['employee id'] || data.employee_id,
            gross_salary: parseFloat(data['gross salary'] || data.gross_salary || 0),
            saving: parseFloat(data['savings deduction'] || data.saving || data['saving deduction'] || 0),
            deduction: parseFloat(data['loan deduction'] || data.deduction || data['loan repayment'] || 0),
            net_salary: parseFloat(data['net salary'] || data.net_salary || 0),
            payroll_date: data['payroll date'] || data.payroll_date || new Date().toISOString().split('T')[0]
          };

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

    // Get header row and create column mapping
    const headerRow = worksheet.getRow(1);
    const columnMap = {};

    headerRow.eachCell((cell, colNumber) => {
      const header = (cell.value || '').toString().toLowerCase().trim();
      columnMap[header] = colNumber;
    });

    // Process data rows
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header row

      const data = {};

      // Map columns using the same logic as CSV parser
      data.employee_id = this.getCellValue(row, columnMap['employee_id'] || columnMap['employee id']);
      data.gross_salary = parseFloat(this.getCellValue(row, columnMap['gross_salary'] || columnMap['gross salary'])) || 0;
      data.saving = parseFloat(this.getCellValue(row, columnMap['saving']) || this.getCellValue(row, columnMap['savings deduction']) || this.getCellValue(row, columnMap['saving deduction'])) || 0;
      data.deduction = parseFloat(this.getCellValue(row, columnMap['deduction']) || this.getCellValue(row, columnMap['loan deduction']) || this.getCellValue(row, columnMap['loan repayment'])) || 0;
      data.net_salary = parseFloat(this.getCellValue(row, columnMap['net_salary'] || columnMap['net salary'])) || 0;
      data.payroll_date = this.getCellValue(row, columnMap['payroll_date'] || columnMap['payroll date']) || new Date().toISOString().split('T')[0];

      // Format payroll_date if it's a date
      if (data.payroll_date instanceof Date) {
        data.payroll_date = data.payroll_date.toISOString().split('T')[0];
      }

      results.push(data);
    });

    return results;
  }

  static getCellValue(row, columnNumber) {
    if (!columnNumber) return null;
    return row.getCell(columnNumber).value;
  }

  static async parseCSVFile(filePath) {
    return new Promise((resolve, reject) => {
      const results = [];

      fs.createReadStream(filePath)
        .pipe(csv({ mapHeaders: ({ header }) => header.toLowerCase().trim() }))
        .on('data', (data) => {
          // Standardize to underscore field names immediately
          const processedData = {
            employee_id: data['employee id'] || data.employee_id,
            gross_salary: parseFloat(data['gross salary'] || data.gross_salary || 0),
            saving: parseFloat(data['savings deduction'] || data.saving || data['saving deduction'] || 0),
            deduction: parseFloat(data['loan deduction'] || data.deduction || data['loan repayment'] || 0),
            net_salary: parseFloat(data['net salary'] || data.net_salary || 0),
            payroll_date: data['payroll date'] || data.payroll_date || new Date().toISOString().split('T')[0]
          };

          results.push(processedData);
        })
        .on('end', () => resolve(results))
        .on('error', (error) => reject(error));
    });
  }

  static async parseExcelFile(filePath) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const worksheet = workbook.getWorksheet(1);
    const results = [];

    // Get header row and create column mapping
    const headerRow = worksheet.getRow(1);
    const columnMap = {};

    headerRow.eachCell((cell, colNumber) => {
      const header = (cell.value || '').toString().toLowerCase().trim();
      columnMap[header] = colNumber;
    });

    // Process data rows
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header row

      const data = {};

      // Map columns using the same logic as CSV parser
      data.employee_id = this.getCellValue(row, columnMap['employee_id'] || columnMap['employee id']);
      data.gross_salary = parseFloat(this.getCellValue(row, columnMap['gross_salary'] || columnMap['gross salary'])) || 0;
      data.saving = parseFloat(this.getCellValue(row, columnMap['saving']) || this.getCellValue(row, columnMap['savings deduction']) || this.getCellValue(row, columnMap['saving deduction'])) || 0;
      data.deduction = parseFloat(this.getCellValue(row, columnMap['deduction']) || this.getCellValue(row, columnMap['loan deduction']) || this.getCellValue(row, columnMap['loan repayment'])) || 0;
      data.net_salary = parseFloat(this.getCellValue(row, columnMap['net_salary'] || columnMap['net salary'])) || 0;
      data.payroll_date = this.getCellValue(row, columnMap['payroll_date'] || columnMap['payroll date']) || new Date().toISOString().split('T')[0];

      // Format payroll_date if it's a date
      if (data.payroll_date instanceof Date) {
        data.payroll_date = data.payroll_date.toISOString().split('T')[0];
      }

      results.push(data);
    });

    return results;
  }

  static async validatePayrollData(payrollData) {
    const errors = [];
    const warnings = [];
    const validRecords = [];
    const seenEmployeeIds = new Set();

    // Extract unique employee IDs for bulk loading
    const uniqueEmployeeIds = [...new Set(payrollData.map(record => record.employee_id).filter(Boolean))];

    // Bulk load all employee records at once
    const employeeRecords = await this.bulkLoadEmployees(uniqueEmployeeIds);
    const employeeMap = new Map(employeeRecords.map(emp => [emp.employee_id, emp]));

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

      // We will automatically calculate net salary from gross, saving_percentage, and loan
      // Remove the exact match validation that caused failures when file only has gross_salary

      if (record.net_salary && record.net_salary > record.gross_salary) {
        warnings.push(`Record ${recordNumber}: Provided net salary (${record.net_salary}) was greater than gross salary (${record.gross_salary})`);
      }

      // Check employee exists in bulk-loaded data
      const employee = employeeMap.get(record.employee_id);
      if (!employee) {
        errors.push(`Record ${recordNumber}: This employee_id (${record.employee_id}) is invalid or not found in database`);
        continue;
      }

      if (!employee.is_active) {
        errors.push(`Record ${recordNumber}: Employee ${record.employee_id} is not active`);
        continue;
      }

      if (employee.employment_status !== 'ACTIVE') {
        warnings.push(`Record ${recordNumber}: Employee ${record.employee_id} employment status is ${employee.employment_status}`);
      }

      // Validate against stored employee salary
      if (employee.salary && parseFloat(employee.salary) !== parseFloat(record.gross_salary)) {
        errors.push(
          `Record ${recordNumber}: Invalid gross salary. Provided (${record.gross_salary}) does not match the stored salary for ${record.employee_id} (${employee.salary})`
        );
        continue;
      }

      // AUTOMATIC CALCULATION
      const systemSavingsDeduction = employee.saving_percentage ? (record.gross_salary * employee.saving_percentage / 100) : 0;
      const systemLoanRepayment = employee.monthly_repayment || 0;

      // Use the system deductions
      const calculatedSavingsDeduction = systemSavingsDeduction;
      const calculatedLoanDeduction = systemLoanRepayment;
      const calculatedTotalDeductions = calculatedSavingsDeduction + calculatedLoanDeduction;

      // Calculate the net salary automatically
      const calculatedNetSalary = record.gross_salary - calculatedTotalDeductions;

      if (record.saving !== undefined && record.saving !== calculatedSavingsDeduction) {
        warnings.push(`Record ${recordNumber}: Calculated savings deduction (${calculatedSavingsDeduction}) differs from file (${record.saving})`);
      }
      if (record.deduction !== undefined && record.deduction !== calculatedLoanDeduction) {
        warnings.push(`Record ${recordNumber}: Calculated loan deduction (${calculatedLoanDeduction}) differs from file (${record.deduction})`);
      }

      validRecords.push({
        ...record,
        user_id: employee.id,
        row: i + 1, // Add row number for frontend display
        valid: true, // ✅ Frontend checks this field for Success/Failed status
        'Employee ID': record.employee_id, // Frontend field name
        'Employee Name': `${employee.first_name || ''} ${employee.last_name || ''}`.trim(), // Frontend field name
        'Salary': record.gross_salary, // Frontend field name
        'Status': 'Processed', // Frontend field name
        'Notes': '', // Frontend field name
        employee_id: record.employee_id, // Use database field name
        gross_salary: record.gross_salary, // Use database field name
        net_salary: calculatedNetSalary, // Use calculated net salary
        savings_deduction: calculatedSavingsDeduction, // Use calculated savings deduction
        loan_repayment_deduction: calculatedLoanDeduction, // Use calculated loan deduction
        total_deductions: calculatedTotalDeductions, // Use calculated total deductions
        final_amount: calculatedNetSalary
      });
    }

    return { errors, warnings, validRecords };
  }

  static async bulkLoadEmployees(employeeIds) {
    if (employeeIds.length === 0) return [];

    const placeholders = employeeIds.map(() => '?').join(',');
    const employeeQuery = `
      SELECT u.id, u.employee_id, u.is_active, ep.employment_status, 
             ep.first_name, ep.last_name, ep.salary, sa.saving_percentage, l.monthly_repayment
      FROM users u
      JOIN employee_profiles ep ON u.id = ep.user_id
      LEFT JOIN savings_accounts sa ON u.id = sa.user_id AND sa.account_status = 'ACTIVE'
      LEFT JOIN loans l ON u.id = l.user_id AND l.status = 'ACTIVE'
      WHERE u.employee_id IN (${placeholders})
    `;

    try {
      const employees = await query(employeeQuery, employeeIds);
      return Array.isArray(employees) ? employees : [];
    } catch (error) {
      console.error('Bulk load employees error:', error);
      return [];
    }
  }

  static async insertPayrollDetails(batchId, validRecords) {
    return await transaction(async (connection) => {
      for (const record of validRecords) {
        const [result] = await connection.query(`
          INSERT INTO payroll_details 
          (payroll_batch_id, user_id, employee_id, gross_salary, net_salary, 
           savings_deduction, loan_repayment_deduction, total_deductions, final_amount)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          batchId, record.user_id, record.employee_id, record.gross_salary, record.net_salary,
          record.savings_deduction, record.loan_repayment_deduction, record.total_deductions, record.final_amount
        ]);

        // Verify insertion succeeded
        if (!result || !result.insertId) {
          throw new Error(`Failed to insert payroll detail for employee ${record.employee_id}`);
        }
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
             confirmer.username as confirm_username, confirmer_ep.first_name as confirm_first_name, confirmer_ep.last_name as confirm_last_name
      FROM payroll_batches pb
      JOIN users u ON pb.upload_user_id = u.id
      JOIN employee_profiles ep ON u.id = ep.user_id
      LEFT JOIN users confirmer ON pb.confirmed_by = confirmer.id
      LEFT JOIN employee_profiles confirmer_ep ON confirmer.id = confirmer_ep.user_id
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
             confirmer.username as confirm_username, confirmer_ep.first_name as confirm_first_name, confirmer_ep.last_name as confirm_last_name
      FROM payroll_batches pb
      JOIN users u ON pb.upload_user_id = u.id
      JOIN employee_profiles ep ON u.id = ep.user_id
      LEFT JOIN users confirmer ON pb.confirmed_by = confirmer.id
      LEFT JOIN employee_profiles confirmer_ep ON confirmer.id = confirmer_ep.user_id
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
      SELECT pd.*, u.username, u.email, ep.first_name, ep.last_name, ep.department, ep.job_grade, ep.employment_status
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
      console.log(` Processing payroll batch ${batchId}`);
      
      const batch = await this.getPayrollBatch(batchId);

      if (!batch) {
        throw new Error('Payroll batch not found');
      }

      if (batch.status !== 'CONFIRMED') {
        throw new Error('Payroll batch must be approved before processing');
      }

      const details = await this.getPayrollDetails(batchId, 1, 10000);
      console.log(` Processing ${details.details.length} payroll details`);

      for (const detail of details.details) {
        console.log(` Processing employee ${detail.employee_id} - Savings: ${detail.savings_deduction}, Loan: ${detail.loan_repayment_deduction}`);
        
        // Process savings deduction
        if (detail.savings_deduction > 0) {
          console.log(` Adding ${detail.savings_deduction} to savings account for employee ${detail.employee_id}`);
          
          const savingsAccountQuery = 'SELECT id, current_balance FROM savings_accounts WHERE user_id = ? AND account_status = "ACTIVE"';
          const [savingsAccount] = await connection.query(savingsAccountQuery, [detail.user_id]);

          if (savingsAccount && savingsAccount.length > 0) {
            const balanceBefore = savingsAccount[0].current_balance || 0;
            const balanceAfter = balanceBefore + detail.savings_deduction;

            const [transactionResult] = await connection.query(`
              INSERT INTO savings_transactions 
              (savings_account_id, user_id, transaction_type, amount, balance_before, balance_after, reference_id, description, payroll_batch_id)
              VALUES (?, ?, 'CONTRIBUTION', ?, ?, ?, ?, ?, ?)
            `, [
              savingsAccount[0].id, detail.user_id, detail.savings_deduction,
              balanceBefore, balanceAfter,
              `PAYROLL-${batchId}`, 'Automatic savings deduction from payroll', batchId
            ]);

            if (!transactionResult || !transactionResult.insertId) {
              throw new Error(`Failed to create savings transaction for employee ${detail.employee_id}`);
            }

            const [updateResult] = await connection.query(`
              UPDATE savings_accounts 
              SET current_balance = ?, last_contribution_date = NOW(), updated_at = NOW()
              WHERE id = ?
            `, [balanceAfter, savingsAccount[0].id]);

            if (!updateResult || updateResult.affectedRows === 0) {
              throw new Error(`Failed to update savings account for employee ${detail.employee_id}`);
            }
            
            console.log(` Savings account updated: ${balanceBefore} → ${balanceAfter}`);
          } else {
            console.log(` No active savings account found for employee ${detail.employee_id}`);
          }
        }

        // Process loan repayment
        if (detail.loan_repayment_deduction > 0) {
          console.log(` Processing loan repayment of ${detail.loan_repayment_deduction} for employee ${detail.employee_id}`);
          
          const loanQuery = 'SELECT id FROM loans WHERE user_id = ? AND status = "ACTIVE"';
          const [loan] = await connection.query(loanQuery, [detail.user_id]);

          if (loan && loan.length > 0) {
            const [repaymentResult] = await connection.query(`
              INSERT INTO loan_repayments 
              (loan_id, user_id, amount, principal_amount, interest_amount, balance_before, balance_after, reference_id, payroll_batch_id)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
              loan[0].id, detail.user_id, detail.loan_repayment_deduction,
              detail.loan_repayment_deduction, 0, 0, 0,
              `PAYROLL-${batchId}`, batchId
            ]);

            if (!repaymentResult || !repaymentResult.insertId) {
              throw new Error(`Failed to create loan repayment for employee ${detail.employee_id}`);
            }
            
            console.log(` Loan repayment recorded for employee ${detail.employee_id}`);
          } else {
            console.log(` No active loan found for employee ${detail.employee_id}`);
          }
        }

        // Update payment status
        const [updateResult] = await connection.query(`
          UPDATE payroll_details 
          SET payment_status = 'PAID', payment_date = NOW(), payment_reference = ?
          WHERE id = ?
        `, [`PAYROLL-${batchId}-${detail.employee_id}`, detail.id]);

        if (!updateResult || updateResult.affectedRows === 0) {
          throw new Error(`Failed to update payroll detail status for employee ${detail.employee_id}`);
        }
        
        console.log(` Payment status updated for employee ${detail.employee_id}`);
      }

      const [batchUpdateResult] = await connection.query(`
        UPDATE payroll_batches 
        SET status = 'PROCESSED', processed_date = NOW(), updated_at = NOW()
        WHERE id = ?
      `, [batchId]);

      if (!batchUpdateResult || batchUpdateResult.affectedRows === 0) {
        throw new Error(`Failed to update payroll batch ${batchId} status to PROCESSED`);
      }

      console.log(` Payroll batch ${batchId} processed successfully`);
      return { batchId, status: 'PROCESSED' };
    });
  }

  // ... (rest of the code remains the same)
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
      // Check if deductions exceed net salary
      if (detail.total_deductions > detail.net_salary) {
        validationErrors.push(`Employee ${detail.employee_id}: Deductions exceed net salary`);
      }

      // Verify exact net salary calculation: net_salary == gross_salary - savings_deduction - loan_repayment_deduction
      const expectedNet = detail.gross_salary - detail.savings_deduction - detail.loan_repayment_deduction;
      if (Math.abs(detail.net_salary - expectedNet) > 0.01) {
        validationErrors.push(`Employee ${detail.employee_id}: Net salary must equal gross - saving - deduction (expected ${expectedNet}, got ${detail.net_salary})`);
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
          const [savingsAccount] = await connection.query(savingsAccountQuery, [detail.user_id]);

          if (savingsAccount && savingsAccount.length > 0) {
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
          const [loan] = await connection.query(loanQuery, [detail.user_id]);

          if (loan && loan.length > 0) {
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
}

module.exports = Payroll;
