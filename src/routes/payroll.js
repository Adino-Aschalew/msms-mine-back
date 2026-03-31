const express = require('express');
const PayrollController = require('../controllers/payrollController');
const { authMiddleware, roleCheck } = require('../middleware/auth');
const { auditMiddleware } = require('../middleware/audit');

const router = express.Router();

router.post('/upload', authMiddleware, roleCheck(['SUPER_ADMIN', 'FINANCE_ADMIN']), PayrollController.uploadMiddleware, auditMiddleware('PAYROLL_UPLOAD', 'payroll_batches'), PayrollController.uploadPayroll);
router.get('/batches', authMiddleware, roleCheck(['SUPER_ADMIN', 'FINANCE_ADMIN']), PayrollController.getBatches);
router.get('/batch/:batchId', authMiddleware, roleCheck(['SUPER_ADMIN', 'FINANCE_ADMIN']), PayrollController.getBatch);
router.get('/batch/:batchId/details', authMiddleware, roleCheck(['SUPER_ADMIN', 'FINANCE_ADMIN']), PayrollController.getBatchDetails);
router.put('/batch/:batchId/validate', authMiddleware, roleCheck(['SUPER_ADMIN', 'FINANCE_ADMIN']), auditMiddleware('PAYROLL_BATCH_VALIDATE', 'payroll_batches'), PayrollController.validateBatch);
router.put('/batch/:batchId/approve', authMiddleware, roleCheck(['SUPER_ADMIN', 'FINANCE_ADMIN']), auditMiddleware('PAYROLL_BATCH_APPROVE', 'payroll_batches'), PayrollController.approveBatch);
router.put('/batch/:batchId/process', authMiddleware, roleCheck(['SUPER_ADMIN', 'FINANCE_ADMIN']), auditMiddleware('PAYROLL_BATCH_PROCESS', 'payroll_batches'), PayrollController.processBatch);
router.put('/batch/:batchId/reverse', authMiddleware, roleCheck(['SUPER_ADMIN', 'FINANCE_ADMIN']), auditMiddleware('PAYROLL_BATCH_REVERSE', 'payroll_batches'), PayrollController.reverseBatch);

router.get('/stats', authMiddleware, roleCheck(['SUPER_ADMIN', 'FINANCE_ADMIN']), PayrollController.getPayrollStats);
router.get('/template', authMiddleware, roleCheck(['SUPER_ADMIN', 'FINANCE_ADMIN']), PayrollController.downloadBatchTemplate);
router.get('/employee/:userId/history', authMiddleware, PayrollController.getEmployeePayrollHistory);

module.exports = router;
