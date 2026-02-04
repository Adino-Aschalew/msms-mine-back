const { query } = require('../config/database');
const moment = require('moment');

class AnalyticsService {
  static async getHistoricalData(table, dateColumn, valueColumn, startDate, endDate, groupBy = 'DAY') {
    let dateFormat;
    switch (groupBy) {
      case 'DAY':
        dateFormat = '%Y-%m-%d';
        break;
      case 'WEEK':
        dateFormat = '%Y-%u';
        break;
      case 'MONTH':
        dateFormat = '%Y-%m';
        break;
      case 'YEAR':
        dateFormat = '%Y';
        break;
      default:
        dateFormat = '%Y-%m-%d';
    }
    
    const sql = `
      SELECT 
        DATE_FORMAT(${dateColumn}, '${dateFormat}') as period,
        COUNT(*) as count,
        ${valueColumn ? `SUM(${valueColumn}) as total, AVG(${valueColumn}) as average` : ''}
      FROM ${table}
      WHERE ${dateColumn} BETWEEN ? AND ?
      GROUP BY DATE_FORMAT(${dateColumn}, '${dateFormat}')
      ORDER BY period ASC
    `;
    
    return await query(sql, [startDate, endDate]);
  }
  
  static calculateMovingAverage(data, windowSize = 3) {
    const result = [];
    for (let i = 0; i < data.length; i++) {
      if (i < windowSize - 1) {
        result.push(null);
      } else {
        const window = data.slice(i - windowSize + 1, i + 1);
        const sum = window.reduce((acc, val) => acc + (val.count || val.total || 0), 0);
        result.push(sum / windowSize);
      }
    }
    return result;
  }
  
  static linearRegression(data) {
    const n = data.length;
    if (n < 2) return { slope: 0, intercept: 0, r2: 0 };
    
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    
    data.forEach((point, index) => {
      const x = index;
      const y = point.count || point.total || 0;
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumX2 += x * x;
    });
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    const meanY = sumY / n;
    let ssTotal = 0, ssResidual = 0;
    
    data.forEach((point, index) => {
      const x = index;
      const y = point.count || point.total || 0;
      const predicted = slope * x + intercept;
      ssTotal += Math.pow(y - meanY, 2);
      ssResidual += Math.pow(y - predicted, 2);
    });
    
    const r2 = 1 - (ssResidual / ssTotal);
    
    return { slope, intercept, r2 };
  }
  
  static predictFutureValues(data, periods = 12) {
    const regression = this.linearRegression(data);
    const predictions = [];
    
    for (let i = 0; i < periods; i++) {
      const futureIndex = data.length + i;
      const predictedValue = regression.slope * futureIndex + regression.intercept;
      predictions.push(Math.max(0, predictedValue));
    }
    
    return {
      predictions,
      confidence: Math.abs(regression.r2),
      trend: regression.slope > 0 ? 'increasing' : regression.slope < 0 ? 'decreasing' : 'stable'
    };
  }
  
  static async forecastUserRegistrations(period = 'MONTHLY', futurePeriods = 12) {
    const endDate = moment().format('YYYY-MM-DD');
    const startDate = moment().subtract(24, 'months').format('YYYY-MM-DD');
    
    const historicalData = await this.getHistoricalData(
      'users', 
      'created_at', 
      null, 
      startDate, 
      endDate, 
      period === 'MONTHLY' ? 'MONTH' : 'YEAR'
    );
    
    const forecast = this.predictFutureValues(historicalData, futurePeriods);
    
    return {
      forecast_type: 'USER_REGISTRATION',
      forecast_period: period,
      historical_data: historicalData,
      predictions: forecast.predictions,
      confidence_score: forecast.confidence,
      trend: forecast.trend,
      training_data_period_start: startDate,
      training_data_period_end: endDate
    };
  }
  
  static async forecastLoanDemand(period = 'MONTHLY', futurePeriods = 12) {
    const endDate = moment().format('YYYY-MM-DD');
    const startDate = moment().subtract(24, 'months').format('YYYY-MM-DD');
    
    const loanApplicationsData = await this.getHistoricalData(
      'loan_applications', 
      'created_at', 
      'requested_amount', 
      startDate, 
      endDate, 
      period === 'MONTHLY' ? 'MONTH' : 'YEAR'
    );
    
    const approvedLoansData = await this.getHistoricalData(
      'loans', 
      'created_at', 
      'principal_amount', 
      startDate, 
      endDate, 
      period === 'MONTHLY' ? 'MONTH' : 'YEAR'
    );
    
    const countForecast = this.predictFutureValues(loanApplicationsData, futurePeriods);
    const amountForecast = this.predictFutureValues(approvedLoansData, futurePeriods);
    
    return {
      forecast_type: 'LOAN_DEMAND',
      forecast_period: period,
      historical_data: {
        applications: loanApplicationsData,
        approved_loans: approvedLoansData
      },
      predictions: {
        application_count: countForecast.predictions,
        loan_amount: amountForecast.predictions
      },
      confidence_score: (countForecast.confidence + amountForecast.confidence) / 2,
      trend: countForecast.trend,
      training_data_period_start: startDate,
      training_data_period_end: endDate
    };
  }
  
  static async forecastLiquidity(period = 'MONTHLY', futurePeriods = 12) {
    const endDate = moment().format('YYYY-MM-DD');
    const startDate = moment().subtract(24, 'months').format('YYYY-MM-DD');
    
    const savingsData = await this.getHistoricalData(
      'savings_transactions', 
      'transaction_date', 
      'amount', 
      startDate, 
      endDate, 
      period === 'MONTHLY' ? 'MONTH' : 'YEAR'
    );
    
    const loanRepaymentData = await this.getHistoricalData(
      'loan_repayments', 
      'repayment_date', 
      'amount', 
      startDate, 
      endDate, 
      period === 'MONTHLY' ? 'MONTH' : 'YEAR'
    );
    
    const savingsForecast = this.predictFutureValues(savingsData, futurePeriods);
    const repaymentForecast = this.predictFutureValues(loanRepaymentData, futurePeriods);
    
    const liquidityForecast = savingsForecast.predictions.map((savings, index) => ({
      period: index + 1,
      projected_savings: savings,
      projected_repayments: repaymentForecast.predictions[index] || 0,
      net_liquidity: savings + (repaymentForecast.predictions[index] || 0)
    }));
    
    return {
      forecast_type: 'LIQUIDITY',
      forecast_period: period,
      historical_data: {
        savings: savingsData,
        repayments: loanRepaymentData
      },
      predictions: liquidityForecast,
      confidence_score: (savingsForecast.confidence + repaymentForecast.confidence) / 2,
      trend: savingsForecast.trend,
      training_data_period_start: startDate,
      training_data_period_end: endDate
    };
  }
  
  static async calculateRiskIndicators() {
    const endDate = moment().format('YYYY-MM-DD');
    const startDate = moment().subtract(12, 'months').format('YYYY-MM-DD');
    
    const defaultRateQuery = `
      SELECT 
        COUNT(*) as total_loans,
        COUNT(CASE WHEN l.status = 'DEFAULTED' THEN 1 END) as defaulted_loans,
        AVG(CASE WHEN l.status = 'DEFAULTED' THEN 1 ELSE 0 END) as default_rate
      FROM loans l
      WHERE l.created_at BETWEEN ? AND ?
    `;
    
    const penaltyRateQuery = `
      SELECT 
        COUNT(*) as total_penalties,
        SUM(amount) as total_penalty_amount,
        AVG(amount) as avg_penalty_amount
      FROM penalties p
      WHERE p.created_at BETWEEN ? AND ?
    `;
    
    const missedSavingsQuery = `
      SELECT 
        COUNT(DISTINCT st.user_id) as users_with_missed_savings,
        COUNT(*) as total_missed_savings
      FROM savings_transactions st
      WHERE st.transaction_type = 'PENALTY'
      AND st.transaction_date BETWEEN ? AND ?
    `;
    
    const [defaultRate, penaltyRate, missedSavings] = await Promise.all([
      query(defaultRateQuery, [startDate, endDate]),
      query(penaltyRateQuery, [startDate, endDate]),
      query(missedSavingsQuery, [startDate, endDate])
    ]);
    
    const riskScore = this.calculateRiskScore(defaultRate[0], penaltyRate[0], missedSavings[0]);
    
    return {
      forecast_type: 'RISK_INDICATORS',
      forecast_period: 'YEARLY',
      risk_indicators: {
        default_rate: (defaultRate[0].default_rate * 100).toFixed(2),
        total_penalties: penaltyRate[0].total_penalties,
        total_penalty_amount: penaltyRate[0].total_penalty_amount,
        users_with_missed_savings: missedSavings[0].users_with_missed_savings,
        risk_score: riskScore,
        risk_level: this.getRiskLevel(riskScore)
      },
      training_data_period_start: startDate,
      training_data_period_end: endDate
    };
  }
  
  static calculateRiskScore(defaultRate, penaltyRate, missedSavings) {
    let score = 50;
    
    if (defaultRate.total_loans > 0) {
      const defaultPercentage = defaultRate.default_rate * 100;
      score -= Math.min(defaultPercentage * 10, 30);
    }
    
    if (penaltyRate.total_penalties > 0) {
      const penaltyImpact = Math.min(penaltyRate.total_penalty_amount / 100000, 20);
      score -= penaltyImpact;
    }
    
    if (missedSavings.users_with_missed_savings > 0) {
      const missedImpact = Math.min(missedSavings.users_with_missed_savings / 10, 15);
      score -= missedImpact;
    }
    
    return Math.max(0, Math.min(100, score));
  }
  
  static getRiskLevel(score) {
    if (score >= 80) return 'LOW';
    if (score >= 60) return 'MEDIUM';
    if (score >= 40) return 'HIGH';
    return 'CRITICAL';
  }
  
  static async saveForecast(forecastData) {
    const insertQuery = `
      INSERT INTO ai_forecasts 
      (forecast_type, forecast_period, target_date, predicted_value, confidence_score, 
       model_version, training_data_period_start, training_data_period_end)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const results = [];
    
    if (Array.isArray(forecastData.predictions)) {
      forecastData.predictions.forEach((prediction, index) => {
        const targetDate = moment().add(index + 1, 'months').format('YYYY-MM-DD');
        results.push(query(insertQuery, [
          forecastData.forecast_type,
          forecastData.forecast_period,
          targetDate,
          typeof prediction === 'object' ? JSON.stringify(prediction) : prediction,
          forecastData.confidence_score,
          '1.0.0',
          forecastData.training_data_period_start,
          forecastData.training_data_period_end
        ]));
      });
    } else {
      const targetDate = moment().add(1, 'months').format('YYYY-MM-DD');
      results.push(query(insertQuery, [
        forecastData.forecast_type,
        forecastData.forecast_period,
        targetDate,
        JSON.stringify(forecastData.predictions || forecastData.risk_indicators),
        forecastData.confidence_score,
        '1.0.0',
        forecastData.training_data_period_start,
        forecastData.training_data_period_end
      ]));
    }
    
    return await Promise.all(results);
  }
  
  static async getForecastHistory(forecastType, limit = 50) {
    const selectQuery = `
      SELECT * FROM ai_forecasts 
      WHERE forecast_type = ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `;
    
    return await query(selectQuery, [forecastType, limit]);
  }
  
  static async compareForecastWithActual(forecastType, startDate, endDate) {
    const forecastQuery = `
      SELECT * FROM ai_forecasts 
      WHERE forecast_type = ? 
      AND target_date BETWEEN ? AND ?
      ORDER BY target_date ASC
    `;
    
    const forecasts = await query(forecastQuery, [forecastType, startDate, endDate]);
    
    const actualData = await this.getActualData(forecastType, startDate, endDate);
    
    const comparisons = forecasts.map(forecast => {
      const actual = actualData.find(a => a.period === forecast.target_date);
      return {
        target_date: forecast.target_date,
        predicted_value: forecast.predicted_value,
        actual_value: actual ? actual.value : null,
        accuracy: actual ? this.calculateAccuracy(forecast.predicted_value, actual.value) : null,
        confidence_score: forecast.confidence_score
      };
    });
    
    return {
      forecast_type: forecastType,
      period_start: startDate,
      period_end: endDate,
      comparisons,
      overall_accuracy: comparisons.filter(c => c.accuracy !== null).reduce((sum, c) => sum + c.accuracy, 0) / comparisons.filter(c => c.accuracy !== null).length
    };
  }
  
  static async getActualData(forecastType, startDate, endDate) {
    switch (forecastType) {
      case 'USER_REGISTRATION':
        return await this.getHistoricalData('users', 'created_at', null, startDate, endDate, 'MONTH');
      case 'LOAN_DEMAND':
        return await this.getHistoricalData('loan_applications', 'created_at', 'requested_amount', startDate, endDate, 'MONTH');
      case 'LIQUIDITY':
        return await this.getHistoricalData('savings_transactions', 'transaction_date', 'amount', startDate, endDate, 'MONTH');
      default:
        return [];
    }
  }
  
  static calculateAccuracy(predicted, actual) {
    const predictedValue = typeof predicted === 'string' ? JSON.parse(predicted) : predicted;
    const actualValue = typeof actual === 'string' ? JSON.parse(actual) : actual;
    
    if (typeof predictedValue === 'object' && typeof actualValue === 'object') {
      return this.calculateObjectAccuracy(predictedValue, actualValue);
    }
    
    const error = Math.abs(predictedValue - actualValue);
    return Math.max(0, 100 - (error / actualValue * 100));
  }
  
  static calculateObjectAccuracy(predicted, actual) {
    const keys = Object.keys(predicted);
    let totalAccuracy = 0;
    let validComparisons = 0;
    
    keys.forEach(key => {
      if (actual[key] !== undefined) {
        const accuracy = this.calculateAccuracy(predicted[key], actual[key]);
        totalAccuracy += accuracy;
        validComparisons++;
      }
    });
    
    return validComparisons > 0 ? totalAccuracy / validComparisons : 0;
  }
}

module.exports = AnalyticsService;
