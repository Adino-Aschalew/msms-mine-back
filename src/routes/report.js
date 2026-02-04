const express = require('express');
const ReportController = require('../controllers/reportController');
const { authMiddleware, roleCheck } = require('../middleware/auth');
const { auditMiddleware } = require('../middleware/audit');

const router = express.Router();

router.post('/generate', authMiddleware, roleCheck(['SUPER_ADMIN', 'LOAN_COMMITTEE', 'FINANCE_ADMIN']), auditMiddleware('REPORT_GENERATE', 'generated_reports'), ReportController.generateReport);
router.get('/history', authMiddleware, roleCheck(['SUPER_ADMIN', 'LOAN_COMMITTEE', 'FINANCE_ADMIN']), ReportController.getReportHistory);
router.get('/types', authMiddleware, roleCheck(['SUPER_ADMIN', 'LOAN_COMMITTEE', 'FINANCE_ADMIN']), ReportController.getReportTypes);
router.get('/stats', authMiddleware, roleCheck(['SUPER_ADMIN']), ReportController.getReportStats);
router.get('/dashboard', authMiddleware, roleCheck(['SUPER_ADMIN', 'LOAN_COMMITTEE', 'FINANCE_ADMIN']), ReportController.getDashboardSummary);
router.get('/download/:reportId', authMiddleware, roleCheck(['SUPER_ADMIN', 'LOAN_COMMITTEE', 'FINANCE_ADMIN']), ReportController.downloadReport);
router.delete('/:reportId', authMiddleware, roleCheck(['SUPER_ADMIN']), auditMiddleware('REPORT_DELETE', 'generated_reports'), ReportController.deleteReport);

module.exports = router;
