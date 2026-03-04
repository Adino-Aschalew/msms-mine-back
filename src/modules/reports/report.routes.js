const express = require('express');
const ReportController = require('./report.controller');
const { authMiddleware, roleMiddleware } = require('../../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Report generation and management
router.post('/generate', ReportController.generateReport);
router.get('/templates', ReportController.getReportTemplates);
router.get('/history', ReportController.getReportHistory);
router.get('/history/:reportId', ReportController.getReportById);
router.delete('/history/:reportId', ReportController.deleteReport);

// Scheduled reports
router.post('/schedule', ReportController.scheduleReport);
router.get('/scheduled', ReportController.getScheduledReports);
router.delete('/scheduled/:reportId', ReportController.cancelScheduledReport);

// Report definitions
router.get('/definitions', ReportController.getReportDefinitions);

module.exports = router;
