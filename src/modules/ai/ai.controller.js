const AiService = require('./ai.service');
const { authMiddleware, roleMiddleware } = require('../../middleware/auth');

class AiController {
  static async getPredictions(req, res) {
    try {
      const { predictionType, parameters } = req.body;
      const userId = req.userId;
      
      const result = await AiService.getPredictions(predictionType, parameters, userId);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get predictions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate predictions'
      });
    }
  }

  static async getRiskAssessment(req, res) {
    try {
      const { userId, loanAmount, loanTerm } = req.body;
      
      
      if (!userId || !loanAmount || !loanTerm) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: userId, loanAmount, and loanTerm are required'
        });
      }
      
      if (isNaN(userId) || isNaN(loanAmount) || isNaN(loanTerm)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid data types: userId, loanAmount, and loanTerm must be numbers'
        });
      }
      
      const result = await AiService.getRiskAssessment(userId, loanAmount, loanTerm);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get risk assessment error:', error);
      
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      if (error.message.includes('required') || error.message.includes('Invalid')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to generate risk assessment'
      });
    }
  }

  static async getRecommendations(req, res) {
    try {
      const { recommendationType, userId } = req.body;
      
      const result = await AiService.getRecommendations(recommendationType, userId);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get recommendations error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate recommendations'
      });
    }
  }

  static async getAnomalyDetection(req, res) {
    try {
      const { dataType, timeRange } = req.body;
      
      const result = await AiService.getAnomalyDetection(dataType, timeRange);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get anomaly detection error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to detect anomalies'
      });
    }
  }

  static async getForecast(req, res) {
    try {
      const { forecastType, parameters } = req.body;
      
      const result = await AiService.getForecast(forecastType, parameters);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get forecast error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate forecast'
      });
    }
  }

  static async getInsights(req, res) {
    try {
      const { insightType, parameters } = req.body;
      
      const result = await AiService.getInsights(insightType, parameters);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get insights error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate insights'
      });
    }
  }

  static async getPerformanceMetrics(req, res) {
    try {
      const metrics = await AiService.getPerformanceMetrics();
      
      res.json({
        success: true,
        data: metrics
      });
    } catch (error) {
      console.error('Get performance metrics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch performance metrics'
      });
    }
  }

  static async trainModel(req, res) {
    try {
      const { modelType, trainingData } = req.body;
      const userId = req.userId;
      
      const result = await AiService.trainModel(modelType, trainingData, userId);
      
      res.json({
        success: true,
        message: result.message,
        data: result
      });
    } catch (error) {
      console.error('Train model error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to train model'
      });
    }
  }

  static async getModelStatus(req, res) {
    try {
      const { modelType } = req.params;
      
      const status = await AiService.getModelStatus(modelType);
      
      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      console.error('Get model status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch model status'
      });
    }
  }
}

module.exports = AiController;
