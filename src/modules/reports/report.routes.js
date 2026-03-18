const express = require('express');
const ReportController = require('./report.controller');
const { authMiddleware, roleMiddleware } = require('../../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Get report statistics for dashboard
router.get('/stats', (req, res) => {
  console.log('GET /api/reports/stats - Route hit');
  ReportController.getReportStats(req, res);
});

// Get all reports with filtering (must come before parameterized routes)
router.get('/', (req, res) => {
  console.log('GET /api/reports - Route hit, query:', req.query);
  ReportController.getReports(req, res);
});

// Get report templates
router.get('/templates', ReportController.getReportTemplates);

// Generate a new report
router.post('/generate', ReportController.generateReport);

// Get report history
router.get('/history', ReportController.getReportHistory);

// Get specific report by ID (must come after /history)
router.get('/history/:reportId', ReportController.getReportById);

// Delete a report (must come after /history/:reportId)
router.delete('/history/:reportId', ReportController.deleteReport);

// Schedule a report
router.post('/schedule', ReportController.scheduleReport);

// Get scheduled reports
router.get('/scheduled', ReportController.getScheduledReports);

// Cancel scheduled report
router.delete('/scheduled/:reportId', ReportController.cancelScheduledReport);

// Get report definitions
router.get('/definitions', ReportController.getReportDefinitions);

module.exports = router;
