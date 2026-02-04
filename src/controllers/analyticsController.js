const AnalyticsService = require('../services/analyticsService');
const { auditLog } = require('../middleware/audit');

class AnalyticsController {
  static async generateForecast(req, res) {
    try {
      const { forecast_type, forecast_period = 'MONTHLY', future_periods = 12 } = req.body;
      const generatedBy = req.userId;
      
      if (!forecast_type) {
        return res.status(400).json({
          success: false,
          message: 'Forecast type is required'
        });
      }
      
      const validTypes = ['USER_REGISTRATION', 'LOAN_DEMAND', 'LIQUIDITY', 'RISK_INDICATORS'];
      if (!validTypes.includes(forecast_type)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid forecast type'
        });
      }
      
      let forecastData;
      
      switch (forecast_type) {
        case 'USER_REGISTRATION':
          forecastData = await AnalyticsService.forecastUserRegistrations(forecast_period, future_periods);
          break;
        case 'LOAN_DEMAND':
          forecastData = await AnalyticsService.forecastLoanDemand(forecast_period, future_periods);
          break;
        case 'LIQUIDITY':
          forecastData = await AnalyticsService.forecastLiquidity(forecast_period, future_periods);
          break;
        case 'RISK_INDICATORS':
          forecastData = await AnalyticsService.calculateRiskIndicators();
          break;
        default:
          throw new Error('Unsupported forecast type');
      }
      
      await AnalyticsService.saveForecast(forecastData);
      
      await auditLog(generatedBy, 'FORECAST_GENERATE', 'ai_forecasts', null, null, { 
        forecast_type, 
        forecast_period, 
        future_periods,
        confidence_score: forecastData.confidence_score
      }, req.ip, req.get('User-Agent'));
      
      res.json({
        success: true,
        message: 'Forecast generated successfully',
        data: forecastData
      });
    } catch (error) {
      console.error('Generate forecast error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }
  
  static async getForecastHistory(req, res) {
    try {
      const { forecast_type } = req.params;
      const limit = parseInt(req.query.limit) || 50;
      
      const history = await AnalyticsService.getForecastHistory(forecast_type, limit);
      
      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      console.error('Get forecast history error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
  
  static async compareForecastWithActual(req, res) {
    try {
      const { forecast_type } = req.params;
      const { start_date, end_date } = req.query;
      
      if (!start_date || !end_date) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required'
        });
      }
      
      const comparison = await AnalyticsService.compareForecastWithActual(forecast_type, start_date, end_date);
      
      res.json({
        success: true,
        data: comparison
      });
    } catch (error) {
      console.error('Compare forecast error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
  
  static async getDashboardAnalytics(req, res) {
    try {
      const { period = 'MONTHLY' } = req.query;
      
      const [
        userForecast,
        loanForecast,
        liquidityForecast,
        riskIndicators
      ] = await Promise.all([
        AnalyticsService.forecastUserRegistrations(period, 3),
        AnalyticsService.forecastLoanDemand(period, 3),
        AnalyticsService.forecastLiquidity(period, 3),
        AnalyticsService.calculateRiskIndicators()
      ]);
      
      const dashboardData = {
        user_registrations: {
          current_trend: userForecast.trend,
          confidence: userForecast.confidence_score,
          next_period_prediction: userForecast.predictions[0] || 0
        },
        loan_demand: {
          current_trend: loanForecast.trend,
          confidence: loanForecast.confidence_score,
          next_period_prediction: loanForecast.predictions.application_count?.[0] || 0
        },
        liquidity: {
          current_trend: liquidityForecast.trend,
          confidence: liquidityForecast.confidence_score,
          next_period_prediction: liquidityForecast.predictions[0]?.net_liquidity || 0
        },
        risk_indicators: {
          risk_score: riskIndicators.risk_indicators.risk_score,
          risk_level: riskIndicators.risk_indicators.risk_level,
          default_rate: riskIndicators.risk_indicators.default_rate
        }
      };
      
      res.json({
        success: true,
        data: dashboardData
      });
    } catch (error) {
      console.error('Get dashboard analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
  
  static async getForecastAccuracy(req, res) {
    try {
      const { forecast_type } = req.params;
      const { months = 6 } = req.query;
      
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - months * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const accuracy = await AnalyticsService.compareForecastWithActual(forecast_type, startDate, endDate);
      
      res.json({
        success: true,
        data: accuracy
      });
    } catch (error) {
      console.error('Get forecast accuracy error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
  
  static async getAllForecastTypes(req, res) {
    try {
      const forecastTypes = [
        {
          type: 'USER_REGISTRATION',
          name: 'User Registration Forecast',
          description: 'Predicts new user registrations over time',
          periods: ['MONTHLY', 'QUARTERLY', 'YEARLY']
        },
        {
          type: 'LOAN_DEMAND',
          name: 'Loan Demand Forecast',
          description: 'Predicts loan applications and amounts',
          periods: ['MONTHLY', 'QUARTERLY', 'YEARLY']
        },
        {
          type: 'LIQUIDITY',
          name: 'Liquidity Forecast',
          description: 'Predicts cash flow and liquidity position',
          periods: ['MONTHLY', 'QUARTERLY', 'YEARLY']
        },
        {
          type: 'RISK_INDICATORS',
          name: 'Risk Indicators',
          description: 'Calculates current risk metrics and indicators',
          periods: ['YEARLY']
        }
      ];
      
      res.json({
        success: true,
        data: forecastTypes
      });
    } catch (error) {
      console.error('Get forecast types error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
  
  static async generateAllForecasts(req, res) {
    try {
      const { forecast_period = 'MONTHLY', future_periods = 12 } = req.body;
      const generatedBy = req.userId;
      
      const [
        userForecast,
        loanForecast,
        liquidityForecast,
        riskIndicators
      ] = await Promise.all([
        AnalyticsService.forecastUserRegistrations(forecast_period, future_periods),
        AnalyticsService.forecastLoanDemand(forecast_period, future_periods),
        AnalyticsService.forecastLiquidity(forecast_period, future_periods),
        AnalyticsService.calculateRiskIndicators()
      ]);
      
      const results = await Promise.all([
        AnalyticsService.saveForecast(userForecast),
        AnalyticsService.saveForecast(loanForecast),
        AnalyticsService.saveForecast(liquidityForecast),
        AnalyticsService.saveForecast(riskIndicators)
      ]);
      
      await auditLog(generatedBy, 'BULK_FORECAST_GENERATE', 'ai_forecasts', null, null, { 
        forecast_period, 
        future_periods,
        forecasts_generated: 4
      }, req.ip, req.get('User-Agent'));
      
      res.json({
        success: true,
        message: 'All forecasts generated successfully',
        data: {
          user_registrations: userForecast,
          loan_demand: loanForecast,
          liquidity: liquidityForecast,
          risk_indicators: riskIndicators,
          total_records_saved: results.flat().length
        }
      });
    } catch (error) {
      console.error('Generate all forecasts error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }
}

module.exports = AnalyticsController;
