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
  limits: { fileSize: 10 * 1024 * 1024 }
});

// Financial overview
router.get('/overview', FinanceController.getFinancialOverview);
router.get('/transactions', FinanceController.getRecentTransactions);
router.get('/employees', FinanceController.getEmployees);
router.get('/transactions-list', FinanceController.getTransactionsList);
router.get('/analytics', FinanceController.getAnalytics);
router.get('/budgets/overview', FinanceController.getBudgetOverview);

// Payroll management
router.post('/payroll/upload', memoryUpload.single('payroll'), auditMiddleware('PAYROLL_UPLOADED'), PayrollController.uploadPayroll);
router.put('/payroll/batches/:batchId/validate', auditMiddleware('PAYROLL_BATCH_VALIDATE'), PayrollController.validateBatch);
router.put('/payroll/batches/:batchId/approve', auditMiddleware('PAYROLL_BATCH_APPROVE'), PayrollController.approveBatch);
router.put('/payroll/batches/:batchId/process', auditMiddleware('PAYROLL_BATCH_PROCESS'), PayrollController.processBatch);
router.put('/payroll/batches/:batchId/reverse', auditMiddleware('PAYROLL_BATCH_REVERSE'), PayrollController.reverseBatch);
router.get('/payroll/batches', PayrollController.getBatches);
router.get('/payroll/batches/:batchId', PayrollController.getBatch);
router.get('/payroll/batches/:batchId/details', PayrollController.getBatchDetails);
router.get('/payroll/history/:userId', PayrollController.getEmployeePayrollHistory);
router.get('/payroll/stats', PayrollController.getPayrollStats);
router.get('/payroll/template', PayrollController.downloadBatchTemplate);

// Financial reports
router.get('/reports/:reportType', FinanceController.getFinancialReports);
router.get('/reports/cash-flow', FinanceController.getCashFlowReport);
router.get('/reports/profit-loss', FinanceController.getProfitLossReport);
router.get('/reports/loan-portfolio', FinanceController.getLoanPortfolio);
router.get('/reports/savings-summary', FinanceController.getSavingsSummary);

// Report export
router.get('/export/:reportType', FinanceController.exportFinancialReport);

// System health
router.get('/health', FinanceController.getSystemHealth);

module.exports = router;
