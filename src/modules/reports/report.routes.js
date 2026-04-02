const express = require('express');
const ReportController = require('./report.controller');
const { authMiddleware, roleMiddleware } = require('../../middleware/auth');

const router = express.Router();


router.use(authMiddleware);


router.get('/stats', (req, res) => {
  console.log('GET /api/reports/stats - Route hit');
  ReportController.getReportStats(req, res);
});


router.get('/', (req, res) => {
  console.log('GET /api/reports - Route hit, query:', req.query);
  ReportController.getReports(req, res);
});


router.get('/templates', ReportController.getReportTemplates);


router.post('/generate', ReportController.generateReport);


router.get('/history', ReportController.getReportHistory);


router.get('/history/:reportId', ReportController.getReportById);


router.delete('/history/:reportId', ReportController.deleteReport);


router.post('/schedule', ReportController.scheduleReport);


router.get('/scheduled', ReportController.getScheduledReports);


router.delete('/scheduled/:reportId', ReportController.cancelScheduledReport);


router.get('/definitions', ReportController.getReportDefinitions);

module.exports = router;
