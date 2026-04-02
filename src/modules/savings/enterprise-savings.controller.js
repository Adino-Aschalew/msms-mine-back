const EnterpriseSavingsService = require('./enterprise-savings.service');
const { auditLog } = require('../../middleware/audit');
const { query } = require('../../config/database');

class EnterpriseSavingsController {
  
  static async getSavingsDashboard(req, res) {
    try {
      const userId = req.userId;
      
      const dashboardData = await EnterpriseSavingsService.getEmployeeSavingsDashboard(userId);
      
      res.json({
        success: true,
        data: dashboardData
      });
      
    } catch (error) {
      console.error('Get savings dashboard error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch savings dashboard'
      });
    }
  }

  
  static async simulateSavingsChange(req, res) {
    try {
      const userId = req.userId;
      const { newValue, savingsType, effectiveDate } = req.body;
      
      
      if (!newValue || !savingsType || !effectiveDate) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: newValue, savingsType, effectiveDate'
        });
      }
      
      if (!['PERCENTAGE', 'FIXED_AMOUNT'].includes(savingsType)) {
        return res.status(400).json({
          success: false,
          message: 'savingsType must be either PERCENTAGE or FIXED_AMOUNT'
        });
      }
      
      const simulation = await EnterpriseSavingsService.simulateSavingsChange(
        userId, 
        parseFloat(newValue), 
        savingsType, 
        effectiveDate
      );
      
      res.json({
        success: true,
        data: simulation
      });
      
    } catch (error) {
      console.error('Simulate savings change error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to simulate savings change'
      });
    }
  }

  
  static async submitSavingsRequest(req, res) {
    try {
      const userId = req.userId;
      const {
        newValue,
        savingsType,
        effectiveDate,
        reason,
        simulationResult,
        urgencyLevel = 'NORMAL'
      } = req.body;
      
      
      if (!newValue || !savingsType || !effectiveDate || !reason || !simulationResult) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields'
        });
      }
      
      const result = await EnterpriseSavingsService.submitSavingsRequest(userId, {
        newValue: parseFloat(newValue),
        savingsType,
        effectiveDate,
        reason,
        simulationResult,
        urgencyLevel
      });
      
      
      await auditLog(
        userId,
        'REQUEST_SUBMITTED',
        'savings_requests',
        result.requestId,
        null,
        {
          new_value: newValue,
          savings_type: savingsType,
          effective_date: effectiveDate
        },
        req.ip,
        req.get('User-Agent')
      );
      
      res.status(201).json({
        success: true,
        data: result,
        message: 'Savings change request submitted successfully'
      });
      
    } catch (error) {
      console.error('Submit savings request error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to submit savings request'
      });
    }
  }

  
  static async getSavingsHistory(req, res) {
    try {
      const userId = req.userId;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      
      const history = await EnterpriseSavingsService.getEmployeeSavingsHistory(userId, page, limit);
      
      res.json({
        success: true,
        data: history
      });
      
    } catch (error) {
      console.error('Get savings history error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch savings history'
      });
    }
  }

  
  static async getSavingsConstraints(req, res) {
    try {
      const constraints = await EnterpriseSavingsService.getSavingsConstraints();
      
      res.json({
        success: true,
        data: constraints
      });
      
    } catch (error) {
      console.error('Get savings constraints error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch savings constraints'
      });
    }
  }

  
  static async getPendingRequests(req, res) {
    try {
      const userId = req.userId;
      
      const pendingQuery = `
        SELECT 
          sr.*,
          ep.first_name,
          ep.last_name,
          ep.department
        FROM savings_requests sr
        LEFT JOIN users u ON sr.user_id = u.id
        LEFT JOIN employee_profiles ep ON u.id = ep.user_id
        WHERE sr.user_id = ? 
        AND sr.status IN ('PENDING', 'UNDER_REVIEW')
        ORDER BY sr.submitted_at DESC
      `;
      
      const pendingRequests = await query(pendingQuery, [userId]);
      
      res.json({
        success: true,
        data: pendingRequests.map(r => ({
          id: r.id,
          type: r.request_type,
          oldValue: r.old_value,
          newValue: r.new_value,
          savingsType: r.savings_type,
          status: r.status,
          workflowStage: r.workflow_stage,
          submittedAt: r.submitted_at,
          effectiveDate: r.effective_date,
          reason: r.reason,
          urgencyLevel: r.urgency_level
        }))
      });
      
    } catch (error) {
      console.error('Get pending requests error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch pending requests'
      });
    }
  }

  
  static async cancelRequest(req, res) {
    try {
      const userId = req.userId;
      const { requestId } = req.params;
      
      
      const requestQuery = `
        SELECT * FROM savings_requests 
        WHERE id = ? AND user_id = ? AND status IN ('PENDING', 'UNDER_REVIEW')
      `;
      
      const [request] = await query(requestQuery, [requestId, userId]);
      
      if (!request) {
        return res.status(404).json({
          success: false,
          message: 'Request not found or cannot be cancelled'
        });
      }
      
      
      await query(
        'UPDATE savings_requests SET status = ?, updated_at = NOW() WHERE id = ?',
        ['CANCELLED', requestId]
      );
      
      
      await auditLog(
        userId,
        'REQUEST_CANCELLED',
        'savings_requests',
        requestId,
        null,
        { old_status: request.status, new_status: 'CANCELLED' },
        req.ip,
        req.get('User-Agent')
      );
      
      res.json({
        success: true,
        message: 'Request cancelled successfully'
      });
      
    } catch (error) {
      console.error('Cancel request error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cancel request'
      });
    }
  }

  
  static async getSavingsStatistics(req, res) {
    try {
      const userId = req.userId;
      
      
      const statsQuery = `
        SELECT 
          sa.current_balance,
          sa.saving_percentage,
          sa.fixed_amount,
          sa.savings_type,
          sa.account_status,
          sa.is_paused,
          sa.total_requests_count,
          sa.approved_requests_count,
          COUNT(st.id) as total_transactions,
          SUM(CASE WHEN st.transaction_type = 'CONTRIBUTION' THEN st.amount ELSE 0 END) as total_contributions,
          SUM(CASE WHEN st.transaction_type = 'INTEREST' THEN st.amount ELSE 0 END) as total_interest,
          MAX(st.transaction_date) as last_transaction_date
        FROM savings_accounts sa
        LEFT JOIN savings_transactions st ON sa.user_id = st.user_id
        WHERE sa.user_id = ?
        GROUP BY sa.id
      `;
      
      const [stats] = await query(statsQuery, [userId]);
      
      if (!stats) {
        return res.json({
          success: true,
          data: {
            hasAccount: false
          }
        });
      }
      
      
      const trendQuery = `
        SELECT 
          DATE_FORMAT(transaction_date, '%Y-%m') as month,
          SUM(CASE WHEN transaction_type = 'CONTRIBUTION' THEN amount ELSE 0 END) as contributions,
          SUM(CASE WHEN transaction_type = 'INTEREST' THEN amount ELSE 0 END) as interest
        FROM savings_transactions 
        WHERE user_id = ? 
        AND transaction_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        AND transaction_type IN ('CONTRIBUTION', 'INTEREST')
        GROUP BY DATE_FORMAT(transaction_date, '%Y-%m')
        ORDER BY month ASC
      `;
      
      const trend = await query(trendQuery, [userId]);
      
      res.json({
        success: true,
        data: {
          hasAccount: true,
          currentBalance: parseFloat(stats.current_balance),
          savingsType: stats.savings_type,
          currentValue: stats.savings_type === 'PERCENTAGE' 
            ? stats.saving_percentage 
            : stats.fixed_amount,
          accountStatus: stats.account_status,
          isPaused: stats.is_paused,
          totalRequests: parseInt(stats.total_requests_count),
          approvedRequests: parseInt(stats.approved_requests_count),
          totalTransactions: parseInt(stats.total_transactions),
          totalContributions: parseFloat(stats.total_contributions),
          totalInterest: parseFloat(stats.total_interest),
          lastTransactionDate: stats.last_transaction_date,
          monthlyTrend: trend.map(t => ({
            month: t.month,
            contributions: parseFloat(t.contributions),
            interest: parseFloat(t.interest)
          }))
        }
      });
      
    } catch (error) {
      console.error('Get savings statistics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch savings statistics'
      });
    }
  }
}

module.exports = EnterpriseSavingsController;
