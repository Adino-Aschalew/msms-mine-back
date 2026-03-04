const express = require('express');
const AiController = require('./ai.controller');
const { authMiddleware, roleMiddleware } = require('../../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// AI predictions and analytics
router.post('/predictions', AiController.getPredictions);
router.post('/risk-assessment', AiController.getRiskAssessment);
router.post('/recommendations', AiController.getRecommendations);
router.post('/anomaly-detection', AiController.getAnomalyDetection);
router.post('/forecast', AiController.getForecast);
router.post('/insights', AiController.getInsights);

// AI model management
router.get('/performance-metrics', roleMiddleware(['ADMIN']), AiController.getPerformanceMetrics);
router.post('/train-model', roleMiddleware(['ADMIN']), AiController.trainModel);
router.get('/model-status/:modelType', roleMiddleware(['ADMIN']), AiController.getModelStatus);

module.exports = router;
