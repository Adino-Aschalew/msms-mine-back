const express = require('express');
const FinanceController = require('./finance.controller');
const PayrollController = require('../../controllers/payrollController');
const { authMiddleware, roleMiddleware } = require('../../middleware/auth');
const { auditMiddleware } = require('../../middleware/audit');
const { cloudinary, storage } = require('../../config/cloudinary');
const multer = require('multer');

const router = express.Router();

// Apply authentication and role middleware
router.use(authMiddleware);
router.use(roleMiddleware(['ADMIN', 'FINANCE', 'FINANCE_ADMIN', 'SUPER_ADMIN']));

// File upload configuration using Cloudinary
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.mimetype === 'application/vnd.ms-excel' || file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.originalname.endsWith('.csv') || file.originalname.endsWith('.xlsx')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV and Excel files are allowed'), false);
    }
  }
});

// Memory storage for immediate processing (e.g. Payroll)
const memoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1 // Only allow one file at a time
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    const allowedExtensions = ['.csv', '.xlsx', '.xls'];
    
    const isValidMimeType = allowedMimes.includes(file.mimetype);
    const isValidExtension = allowedExtensions.some(ext => 
      file.originalname.toLowerCase().endsWith(ext)
    );
    
    if (isValidMimeType || isValidExtension) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed: ${allowedExtensions.join(', ')}`), false);
    }
  }
});

// Add error handling middleware for multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        message: 'File too large. Maximum size is 10MB',
        error: 'LIMIT_FILE_SIZE'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Only one file allowed at a time',
        error: 'LIMIT_FILE_COUNT'
      });
    }
    return res.status(400).json({
      success: false,
      message: `File upload error: ${error.message}`,
      error: error.code
    });
  }
  
  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      message: error.message,
      error: 'INVALID_FILE_TYPE'
    });
  }
  
  next(error);
};

// Financial overview
router.get('/overview', FinanceController.getFinancialOverview);
router.get('/transactions', FinanceController.getRecentTransactions);
router.get('/employees', FinanceController.getEmployees);
router.get('/transactions-list', FinanceController.getTransactionsList);
router.get('/analytics', FinanceController.getAnalytics);
router.get('/budgets/overview', FinanceController.getBudgetOverview);

// Payroll management
router.post('/payroll/upload', handleMulterError, memoryUpload.single('payroll'), auditMiddleware('PAYROLL_UPLOADED'), PayrollController.uploadPayroll);
router.put('/payroll/batches/:batchId/validate', auditMiddleware('PAYROLL_BATCH_VALIDATE'), PayrollController.validateBatch);
router.put('/payroll/batches/:batchId/approve', auditMiddleware('PAYROLL_BATCH_APPROVE'), PayrollController.approveBatch);
router.put('/payroll/batches/:batchId/process', auditMiddleware('PAYROLL_BATCH_PROCESS'), PayrollController.processBatch);
router.put('/payroll/batches/:batchId/reverse', auditMiddleware('PAYROLL_BATCH_REVERSE'), PayrollController.reverseBatch);
router.get('/payroll/batches', PayrollController.getBatches);
router.get('/payroll/batches/:batchId', PayrollController.getBatch);
router.get('/payroll/batches/:batchId/details', PayrollController.getBatchDetails);
router.get('/payroll/batches/:batchId/export', auditMiddleware('PAYROLL_BATCH_EXPORT'), PayrollController.exportBatch);
router.get('/payroll/history/:userId', PayrollController.getEmployeePayrollHistory);
router.get('/payroll/stats', PayrollController.getPayrollStats);
router.get('/payroll/template', PayrollController.downloadBatchTemplate);

// Financial reports
router.get('/reports/cash-flow', FinanceController.getCashFlowReport);
router.get('/reports/profit-loss', FinanceController.getProfitLossReport);
router.get('/reports/loan-portfolio', FinanceController.getLoanPortfolio);
router.get('/reports/savings-summary', FinanceController.getSavingsSummary);

// Payroll reports (must come before generic :reportType route)
router.get('/reports/payroll', FinanceController.getPayrollReport);
router.get('/reports/payroll/download', FinanceController.downloadPayrollReport);

// Generic report handler (must come after specific routes)
router.get('/reports/:reportType', FinanceController.getFinancialReports);

// Report export

// System health
router.get('/health', FinanceController.getSystemHealth);

module.exports = router;
