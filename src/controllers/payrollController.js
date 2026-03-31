const Payroll = require('../models/Payroll');
const { auditLog } = require('../middleware/audit');
const multer = require('multer');
const { cloudinary, storage } = require('../config/cloudinary');
const path = require('path');

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.csv', '.xlsx', '.xls'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error('Only CSV and Excel files are allowed'), false);
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB
  }
});

class PayrollController {
  static uploadMiddleware = upload.single('payroll_file');
  
  static async uploadPayroll(req, res) {
    try {
      const uploadUserId = req.userId;
      
      if (!req.file) {
        console.error('Upload failed: req.file is missing');
        return res.status(400).json({
          success: false,
          message: 'Payroll file is required and must be in allowed format (CSV/Excel)'
        });
      }
      
      console.log('Payroll upload req.file properties:', {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        size: req.file.size,
        hasBuffer: !!req.file.buffer,
        path: req.file.path,
        secure_url: req.file.secure_url
      });
      
      let cloudinaryUrl = req.file.path || req.file.secure_url || req.file.url;
      let publicId = req.file.filename;
      
      // If we only have a buffer (memory storage), upload it manually to Cloudinary
      if (!cloudinaryUrl && req.file.buffer) {
        console.log('Manual upload to Cloudinary from buffer...');
        const uploadResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'microfinance/payroll',
              resource_type: 'raw',
              public_id: `payroll-${Date.now()}`
            },
            (error, result) => {
              if (error) {
                console.error('Cloudinary manual upload error:', error);
                reject(error);
              } else {
                resolve(result);
              }
            }
          );
          
          const stream = require('stream');
          const bufferStream = new stream.PassThrough();
          bufferStream.end(req.file.buffer);
          bufferStream.pipe(uploadStream);
        });
        
        cloudinaryUrl = uploadResult.secure_url;
        publicId = uploadResult.public_id;
        console.log('Manual upload success:', cloudinaryUrl);
      }
      
      if (!cloudinaryUrl) {
        console.error('Failed to resolve Cloudinary URL');
        return res.status(500).json({
          success: false,
          message: 'Failed to upload/retrieve file URL'
        });
      }
      
      // Process payroll file from Cloudinary URL
      const result = await Payroll.processPayrollFile(cloudinaryUrl, uploadUserId, {
        cloudinaryUrl: cloudinaryUrl,
        originalName: req.file.originalname,
        publicId: publicId
      });
      
      if (result.success) {
        await auditLog(uploadUserId, 'PAYROLL_UPLOAD', 'payroll_batches', result.batchId, null, { 
          batchName: result.batchName, 
          totalEmployees: result.totalEmployees,
          totalAmount: result.totalAmount,
          fileName: req.file.originalname,
          cloudinaryUrl: req.file.path,
          publicId: req.file.filename
        }, req.ip, req.get('User-Agent'));
        
        res.json({
          success: true,
          message: 'Payroll uploaded and processed successfully',
          batch_id: result.batchId,
          batch_name: result.batchName,
          total_employees: result.totalEmployees,
          total_amount: result.totalAmount,
          status: 'UPLOADED',
          warnings: result.warnings,
          valid_records_count: result.validRecords,
          data: result
        });
      } else {
        await auditLog(uploadUserId, 'PAYROLL_UPLOAD_FAILED', 'payroll_batches', null, null, { 
          fileName: req.file.originalname,
          errors: result.errors,
          cloudinaryUrl: cloudinaryUrl
        }, req.ip, req.get('User-Agent'));
        
        res.json({
          success: false,
          message: 'Payroll validation failed',
          errors: result.errors,
          total_employees: result.validRecords ? result.validRecords.length : 0,
          data: result
        });
      }
    } catch (error) {
      console.error('CRITICAL Upload payroll error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Internal server error during payroll upload: ' + (error.message || 'Unknown error'),
        error: error.message
      });
    }
  }
  
  static async getBatches(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {
        status: req.query.status,
        start_date: req.query.start_date,
        end_date: req.query.end_date
      };
      
      Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);
      
      const result = await Payroll.getPayrollBatches(page, limit, filters);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get payroll batches error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
  
  static async getBatch(req, res) {
    try {
      const { batchId } = req.params;
      
      const batch = await Payroll.getPayrollBatch(batchId);
      
      if (!batch) {
        return res.status(404).json({
          success: false,
          message: 'Payroll batch not found'
        });
      }
      
      res.json({
        success: true,
        data: batch
      });
    } catch (error) {
      console.error('Get payroll batch error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
  
  static async getBatchDetails(req, res) {
    try {
      const { batchId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      
      const result = await Payroll.getPayrollDetails(batchId, page, limit);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get payroll batch details error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
  
  static async validateBatch(req, res) {
    try {
      const { batchId } = req.params;
      const validatedBy = req.userId;
      
      const result = await Payroll.validatePayrollBatch(batchId);
      
      await auditLog(validatedBy, 'PAYROLL_BATCH_VALIDATE', 'payroll_batches', batchId, null, { 
        status: result.status,
        validationErrors: result.validationErrors
      }, req.ip, req.get('User-Agent'));
      
      res.json({
        success: true,
        message: 'Payroll batch validation completed',
        data: result
      });
    } catch (error) {
      console.error('Validate payroll batch error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }
  
  static async approveBatch(req, res) {
    try {
      const { batchId } = req.params;
      const approvedBy = req.userId;
      
      const result = await Payroll.approvePayrollBatch(batchId, approvedBy);
      
      await auditLog(approvedBy, 'PAYROLL_BATCH_APPROVE', 'payroll_batches', batchId, null, result, req.ip, req.get('User-Agent'));
      
      res.json({
        success: true,
        message: 'Payroll batch approved successfully',
        data: result
      });
    } catch (error) {
      console.error('Approve payroll batch error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }

  static async processBatch(req, res) {
    try {
      const { batchId } = req.params;
      const processedBy = req.userId;
      
      const result = await Payroll.processPayrollBatch(batchId, processedBy);
      
      await auditLog(processedBy, 'PAYROLL_BATCH_PROCESS', 'payroll_batches', batchId, null, result, req.ip, req.get('User-Agent'));
      
      res.json({
        success: true,
        message: 'Payroll batch processed successfully',
        data: result
      });
    } catch (error) {
      console.error('Process payroll batch error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }

  static async reverseBatch(req, res) {
    try {
      const { batchId } = req.params;
      const reversedBy = req.userId;
      
      const result = await Payroll.reversePayrollBatch(batchId, reversedBy);
      
      await auditLog(reversedBy, 'PAYROLL_BATCH_REVERSE', 'payroll_batches', batchId, null, result, req.ip, req.get('User-Agent'));
      
      res.json({
        success: true,
        message: 'Payroll batch reversed successfully',
        data: result
      });
    } catch (error) {
      console.error('Reverse payroll batch error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }
  
  static async getPayrollStats(req, res) {
    try {
      const { start_date, end_date } = req.query;
      
      const stats = await Payroll.getPayrollStats(start_date, end_date);
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get payroll stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
  
  static async downloadBatchTemplate(req, res) {
    try {
      const ExcelJS = require('exceljs');
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Payroll Template');
      
      worksheet.columns = [
        { header: 'Employee ID', key: 'employee_id', width: 15 },
        { header: 'Gross Salary', key: 'gross_salary', width: 15 },
        { header: 'Net Salary', key: 'net_salary', width: 15 },
        { header: 'Payroll Date', key: 'payroll_date', width: 15 }
      ];
      
      worksheet.getRow(1).font = { bold: true };
      
      const sampleData = [
        { employee_id: 'EMP001', gross_salary: 5000, net_salary: 4500, payroll_date: '2024-01-31' },
        { employee_id: 'EMP002', gross_salary: 6000, net_salary: 5400, payroll_date: '2024-01-31' }
      ];
      
      sampleData.forEach(data => {
        worksheet.addRow(data);
      });
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=payroll-template.xlsx');
      
      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error('Download template error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
  
  static async getEmployeePayrollHistory(req, res) {
    try {
      const { userId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      
      const countQuery = `
        SELECT COUNT(*) as total
        FROM payroll_details pd
        WHERE pd.user_id = ?
      `;
      
      const selectQuery = `
        SELECT pd.*, pb.batch_name, pb.payroll_date, pb.status as batch_status
        FROM payroll_details pd
        JOIN payroll_batches pb ON pd.payroll_batch_id = pb.id
        WHERE pd.user_id = ?
        ORDER BY pd.created_at DESC
        LIMIT ? OFFSET ?
      `;
      
      const [countResult, history] = await Promise.all([
        require('../config/database').query(countQuery, [userId]),
        require('../config/database').query(selectQuery, [userId, limit, offset])
      ]);
      
      res.json({
        success: true,
        data: {
          history,
          pagination: {
            page,
            limit,
            total: countResult[0].total,
            pages: Math.ceil(countResult[0].total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Get employee payroll history error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = PayrollController;
