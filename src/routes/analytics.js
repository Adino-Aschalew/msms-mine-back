const express = require('express');
const AnalyticsController = require('../controllers/analyticsController');
const { authMiddleware, roleCheck } = require('../middleware/auth');
const { auditMiddleware } = require('../middleware/audit');

const router = express.Router();

router.post('/forecast', authMiddleware, roleCheck(['SUPER_ADMIN', 'LOAN_COMMITTEE', 'FINANCE_ADMIN']), auditMiddleware('FORECAST_GENERATE', 'ai_forecasts'), AnalyticsController.generateForecast);
router.post('/forecast/all', authMiddleware, roleCheck(['SUPER_ADMIN']), auditMiddleware('BULK_FORECAST_GENERATE', 'ai_forecasts'), AnalyticsController.generateAllForecasts);
router.get('/forecast/types', authMiddleware, roleCheck(['SUPER_ADMIN', 'LOAN_COMMITTEE', 'FINANCE_ADMIN']), AnalyticsController.getAllForecastTypes);
router.get('/forecast/:forecast_type/history', authMiddleware, roleCheck(['SUPER_ADMIN', 'LOAN_COMMITTEE', 'FINANCE_ADMIN']), AnalyticsController.getForecastHistory);
router.get('/forecast/:forecast_type/compare', authMiddleware, roleCheck(['SUPER_ADMIN', 'LOAN_COMMITTEE', 'FINANCE_ADMIN']), AnalyticsController.compareForecastWithActual);
router.get('/forecast/:forecast_type/accuracy', authMiddleware, roleCheck(['SUPER_ADMIN', 'LOAN_COMMITTEE', 'FINANCE_ADMIN']), AnalyticsController.getForecastAccuracy);

router.get('/dashboard', authMiddleware, roleCheck(['SUPER_ADMIN', 'LOAN_COMMITTEE', 'FINANCE_ADMIN']), AnalyticsController.getDashboardAnalytics);

module.exports = router;
