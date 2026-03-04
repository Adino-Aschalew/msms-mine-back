const express = require('express');
const FinanceController = require('./finance.controller');
const { authMiddleware, roleMiddleware } = require('../../middleware/auth');
const { auditMiddleware } = require('../../middleware/audit');
const multer = require('multer');

const router = express.Router();

// Apply authentication and role middleware
router.use(authMiddleware);
router.use(roleMiddleware(['ADMIN', 'FINANCE', 'SUPER_ADMIN']));

// File upload configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  }
});

// Financial overview
router.get('/overview', FinanceController.getFinancialOverview);

// Payroll management
router.post('/payroll', auditMiddleware('PAYROLL_PROCESSED'), FinanceController.processPayroll);
router.post('/payroll/upload', upload.single('payroll'), auditMiddleware('PAYROLL_UPLOADED'), FinanceController.uploadPayrollFile);
router.get('/payroll/batches', FinanceController.getPayrollBatches);
router.get('/payroll/batches/:batchId', FinanceController.getPayrollBatchDetails);
router.get('/payroll/history/:userId', FinanceController.getPayrollHistory);

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
