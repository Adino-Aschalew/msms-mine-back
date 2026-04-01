const CommitteeService = require('./committee.service');
const { query } = require('../../config/database');
const { auditMiddleware } = require('../../middleware/audit');

class CommitteeController {
  static async getPendingApplications(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {
        department: req.query.department,
        min_amount: req.query.min_amount,
        max_amount: req.query.max_amount,
        risk_level: req.query.risk_level,
        search: req.query.search
      };
      
      Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);
      
      const result = await CommitteeService.getPendingApplications(page, limit, filters);
      
      res.json({
        success: true,
        data: result.applications,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Get pending applications error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch pending applications'
      });
    }
  }

  static async getApplicationById(req, res) {
    try {
      const { applicationId } = req.params;
      const application = await CommitteeService.getApplicationById(applicationId);
      
      res.json({
        success: true,
        data: application
      });
    } catch (error) {
      console.error('Get application error:', error);
      
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch application'
      });
    }
  }

  static async reviewApplication(req, res) {
    try {
      const { applicationId } = req.params;
      const reviewData = req.body;
      const reviewedBy = req.userId;
      const ip = req.ip;
      const userAgent = req.get('User-Agent');
      
      const result = await CommitteeService.reviewApplication(applicationId, reviewData, reviewedBy, ip, userAgent);
      
      res.json({
        success: true,
        message: result.message,
        data: result
      });
    } catch (error) {
      console.error('Review application error:', error);
      
      if (error.message.includes('not found') || error.message.includes('not pending') || error.message.includes('Invalid')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to review application'
      });
    }
  }

  static async bulkReviewApplications(req, res) {
    try {
      const { applications, decision, common_notes } = req.body;
      const reviewedBy = req.userId;
      const ip = req.ip;
      const userAgent = req.get('User-Agent');
      
      const results = {
        processed: 0,
        failed: 0,
        errors: []
      };
      
      for (const applicationId of applications) {
        try {
          const reviewData = { decision, notes: common_notes };
          await CommitteeService.reviewApplication(applicationId, reviewData, reviewedBy, ip, userAgent);
          results.processed++;
        } catch (error) {
          results.failed++;
          results.errors.push({
            applicationId,
            error: error.message
          });
        }
      }
      
      res.json({
        success: true,
        message: `Bulk review completed. Processed: ${results.processed}, Failed: ${results.failed}`,
        data: results
      });
    } catch (error) {
      console.error('Bulk review applications error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to bulk review applications'
      });
    }
  }

  static async getCommitteeMeetings(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {
        status: req.query.status,
        date_from: req.query.date_from,
        date_to: req.query.date_to
      };
      
      Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);
      
      const result = await CommitteeService.getCommitteeMeetings(page, limit, filters);
      
      res.json({
        success: true,
        data: result.meetings,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Get committee meetings error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch committee meetings'
      });
    }
  }

  static async createMeeting(req, res) {
    try {
      const meetingData = req.body;
      const createdBy = req.userId;
      const ip = req.ip;
      const userAgent = req.get('User-Agent');
      
      const result = await CommitteeService.createMeeting(meetingData, createdBy, ip, userAgent);
      
      res.status(201).json({
        success: true,
        message: result.message,
        data: { meetingId: result.meetingId }
      });
    } catch (error) {
      console.error('Create meeting error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create committee meeting'
      });
    }
  }

  static async getCommitteeMembers(req, res) {
    try {
      const members = await CommitteeService.getCommitteeMembers();
      
      res.json({
        success: true,
        data: members
      });
    } catch (error) {
      console.error('Get committee members error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch committee members'
      });
    }
  }

  static async getCommitteeStats(req, res) {
    try {
      const stats = await CommitteeService.getCommitteeStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get committee stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch committee statistics'
      });
    }
  }

  static async getApplicationHistory(req, res) {
    try {
      const { applicationId } = req.params;
      const history = await CommitteeService.getApplicationHistory(applicationId);
      
      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      console.error('Get application history error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch application history'
      });
    }
  }

  static async getCommitteeWorkload(req, res) {
    try {
      const memberId = req.query.memberId || req.userId;
      const period = req.query.period || 'MONTHLY';
      
      const workload = await CommitteeService.getCommitteeWorkload(memberId, period);
      
      res.json({
        success: true,
        data: workload
      });
    } catch (error) {
      console.error('Get committee workload error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch committee workload'
      });
    }
  }

  static async getRiskAnalysis(req, res) {
    try {
      const applications = await CommitteeService.getPendingApplications(1, 100, {});
      
      // Analyze risk distribution
      const riskDistribution = {
        LOW: applications.applications.filter(app => app.risk_level === 'LOW').length,
        MEDIUM: applications.applications.filter(app => app.risk_level === 'MEDIUM').length,
        HIGH: applications.applications.filter(app => app.risk_level === 'HIGH').length,
        CRITICAL: applications.applications.filter(app => app.risk_level === 'CRITICAL').length
      };
      
      // Calculate average risk score
      const avgRiskScore = applications.applications.reduce((sum, app) => sum + app.risk_score, 0) / applications.applications.length;
      
      // Get applications by department
      const departmentRisks = {};
      applications.applications.forEach(app => {
        if (!departmentRisks[app.department]) {
          departmentRisks[app.department] = [];
        }
        departmentRisks[app.department].push(app.risk_score);
      });
      
      Object.keys(departmentRisks).forEach(dept => {
        const scores = departmentRisks[dept];
        departmentRisks[dept] = {
          count: scores.length,
          average_score: scores.reduce((sum, score) => sum + score, 0) / scores.length,
          max_score: Math.max(...scores),
          min_score: Math.min(...scores)
        };
      });
      
      res.json({
        success: true,
        data: {
          total_applications: applications.applications.length,
          risk_distribution: riskDistribution,
          average_risk_score: avgRiskScore,
          department_analysis: departmentRisks,
          applications: applications.applications
        }
      });
    } catch (error) {
      console.error('Get risk analysis error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate risk analysis'
      });
    }
  }

  static async getApprovalTrends(req, res) {
    try {
      const period = req.query.period || 'MONTHLY';
      
      const [trends] = await query(`
        SELECT 
          DATE_FORMAT(created_at, '%Y-%m') as period,
          COUNT(*) as total_applications,
          COUNT(CASE WHEN status = 'APPROVED' THEN 1 END) as approved_applications,
          COUNT(CASE WHEN status = 'REJECTED' THEN 1 END) as rejected_applications,
          COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending_applications
        FROM loan_applications
        WHERE DATE_FORMAT(created_at, '%Y-%m') >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 12 MONTH), '%Y-%m')
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY period DESC
      `);
      
      // Calculate approval rates
      const approvalTrends = trends.map(trend => ({
        ...trend,
        approval_rate: trend.total_applications > 0 ? (trend.approved_applications / trend.total_applications) * 100 : 0,
        rejection_rate: trend.total_applications > 0 ? (trend.rejected_applications / trend.total_applications) * 100 : 0
      }));
      
      res.json({
        success: true,
        data: approvalTrends
      });
    } catch (error) {
      console.error('Get approval trends error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch approval trends'
      });
    }
  }

  static async getDashboardData(req, res) {
    try {
      // 1. Stats
      const [stats] = await query(`
        SELECT 
          COUNT(*) as total_requests,
          SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending_reviews,
          SUM(CASE WHEN status = 'APPROVED' THEN 1 ELSE 0 END) as approved_loans,
          SUM(CASE WHEN status = 'REJECTED' THEN 1 ELSE 0 END) as rejected_loans,
          SUM(CASE WHEN status = 'SUSPENDED' THEN 1 ELSE 0 END) as suspended_requests
        FROM loan_applications
      `);
      
      const [portfolio] = await query(`
        SELECT COALESCE(SUM(outstanding_balance), 0) as total_portfolio 
        FROM loans WHERE status = 'ACTIVE'
      `);

      // 2. Monthly Distribution (Trends)
      const [trends] = await query(`
        SELECT 
          DATE_FORMAT(created_at, '%b') as label,
          COUNT(*) as total_requests,
          SUM(CASE WHEN status = 'APPROVED' THEN 1 ELSE 0 END) as approved_loans
        FROM loan_applications
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(created_at, '%b'), MONTH(created_at)
        ORDER BY MONTH(created_at) ASC
      `);

      // 3. Loan Growth Data
      const [growth] = await query(`
        SELECT 
          DATE_FORMAT(created_at, '%b') as label,
          SUM(loan_amount) as amount
        FROM loans
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(created_at, '%b'), MONTH(created_at)
        ORDER BY MONTH(created_at) ASC
      `);

      // 4. Recent Requests
      const [recentRequests] = await query(`
        SELECT 
          la.id,
          CONCAT(ep.first_name, ' ', ep.last_name) as employee,
          ep.department,
          la.purpose as loanType,
          la.requested_amount as amount,
          la.created_at as submissionDate,
          la.status
        FROM loan_applications la
        LEFT JOIN users u ON la.user_id = u.id
        LEFT JOIN employee_profiles ep ON u.id = ep.user_id
        ORDER BY la.created_at DESC
        LIMIT 5
      `);

      // 5. Loan Size Distribution
      const [sizeDistribution] = await query(`
        SELECT 
          CASE 
            WHEN requested_amount < 5000 THEN '< $5K'
            WHEN requested_amount >= 5000 AND requested_amount < 10000 THEN '$5K-$10K'
            WHEN requested_amount >= 10000 AND requested_amount < 20000 THEN '$10K-$20K'
            WHEN requested_amount >= 20000 AND requested_amount < 50000 THEN '$20K-$50K'
            ELSE '> $50K'
          END as category,
          COUNT(*) as count
        FROM loan_applications
        GROUP BY category
      `);

      res.json({
        success: true,
        data: {
          stats: {
            ...stats[0],
            total_portfolio: portfolio[0]?.total_portfolio || '0.00'
          },
          trends: trends || [],
          growth: growth || [],
          recentRequests: recentRequests || [],
          sizeDistribution: sizeDistribution || []
        }
      });
    } catch (error) {
      console.error('Get dashboard data error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard data'
      });
    }
  }

  static async getReportsData(req, res) {
    try {
      const [approvalTrends] = await query(`
        SELECT 
          DATE_FORMAT(created_at, '%b') as label,
          COUNT(*) as request_rate,
          SUM(CASE WHEN status = 'APPROVED' THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as approval_rate,
          COUNT(*) as total_requests,
          SUM(CASE WHEN status = 'APPROVED' THEN 1 ELSE 0 END) as approved_loans
        FROM loan_applications
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(created_at, '%b'), MONTH(created_at)
        ORDER BY MONTH(created_at) ASC
      `);

      const [yearlyDistribution] = await query(`
        SELECT 
          YEAR(created_at) as label,
          COUNT(*) as total_loans
        FROM loan_applications
        GROUP BY YEAR(created_at)
        ORDER BY YEAR(created_at) ASC
      `);

      const [departmentDistribution] = await query(`
        SELECT 
          COALESCE(ep.department, 'Unknown') as department,
          COUNT(*) as count
        FROM loan_applications la
        LEFT JOIN employee_profiles ep ON la.user_id = ep.user_id
        GROUP BY ep.department
      `);

      const [summaryStats] = await query(`
        SELECT 
          COUNT(*) as total_loans_year,
          (SELECT SUM(outstanding_balance) FROM loans) as total_portfolio,
          AVG(requested_amount) as avg_loan_size,
          SUM(CASE WHEN status = 'APPROVED' THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as approval_rate
        FROM loan_applications
        WHERE YEAR(created_at) = YEAR(NOW())
      `);

      const [repaymentPerformanceData] = await query(`
        SELECT 
          CASE 
            WHEN status = 'COMPLETED' THEN 'On Time'
            WHEN status = 'ACTIVE' THEN 'On Time'
            WHEN status = 'DEFAULTED' THEN 'Default'
            ELSE 'Unknown'
          END as category,
          COUNT(*) as count
        FROM loans
        GROUP BY category
      `);

      const [topBorrowers] = await query(`
        SELECT 
          CONCAT(ep.first_name, ' ', ep.last_name) as name,
          ep.department,
          COUNT(l.id) as totalLoans,
          SUM(l.loan_amount) as totalAmount
        FROM loans l
        JOIN employee_profiles ep ON l.user_id = ep.user_id
        GROUP BY l.user_id
        ORDER BY totalAmount DESC
        LIMIT 5
      `);

      const [sizeDistribution] = await query(`
        SELECT 
          CASE 
            WHEN requested_amount < 5000 THEN '< $5K'
            WHEN requested_amount >= 5000 AND requested_amount < 10000 THEN '$5K-$10K'
            WHEN requested_amount >= 10000 AND requested_amount < 20000 THEN '$10K-$20K'
            WHEN requested_amount >= 20000 AND requested_amount < 50000 THEN '$20K-$50K'
            ELSE '> $50K'
          END as category,
          COUNT(*) as count
        FROM loan_applications
        GROUP BY category
      `);

      res.json({
        success: true,
        data: {
          trends: approvalTrends,
          yearlyDistribution,
          departmentDistribution,
          summaryStats: summaryStats[0],
          repaymentPerformanceData,
          topBorrowers,
          sizeDistribution
        }
      });
    } catch (error) {
      console.error('Get reports error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch reports' });
    }
  }

  static async exportApplications(req, res) {
    try {
      const format = req.query.format || 'json';
      const applications = await CommitteeService.getPendingApplications(1, 1000, {});
      
      if (format === 'csv') {
        const CsvUtils = require('../../utils/csv');
        const csvBuffer = await CsvUtils.generateCsvBuffer(applications.applications);
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="pending_applications.csv"');
        res.send(csvBuffer);
      } else if (format === 'pdf') {
        const PdfUtils = require('../../utils/pdf');
        const template = {
          title: 'Pending Loan Applications',
          content: [
            {
              type: 'text',
              text: 'Pending Loan Applications Report',
              style: 'heading'
            },
            {
              type: 'table',
              headers: [
                { text: 'Application ID', key: 'id' },
                { text: 'Employee ID', key: 'employee_id' },
                { text: 'Name', key: 'first_name' },
                { text: 'Department', key: 'department' },
                { text: 'Amount', key: 'loan_amount' },
                { text: 'Risk Level', key: 'risk_level' },
                { text: 'Risk Score', key: 'risk_score' },
                { text: 'Created Date', key: 'created_at' }
              ],
              rows: applications.applications
            }
          ]
        };
        
        const pdfBuffer = await PdfUtils.generatePdfBuffer(applications.applications, template);
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="pending_applications.pdf"');
        res.send(pdfBuffer);
      } else {
        res.json({
          success: true,
          data: applications.applications
        });
      }
    } catch (error) {
      console.error('Export applications error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export applications'
      });
    }
  }

  static async getApprovedApplications(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const result = await CommitteeService.getApprovedApplications(page, limit);
      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Get approved error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch approved applications' });
    }
  }

  static async disburseLoan(req, res) {
    try {
      const { applicationId } = req.params;
      const reviewedBy = req.userId;
      const ip = req.ip;
      const userAgent = req.get('User-Agent');
      const result = await CommitteeService.disburseLoan(applicationId, reviewedBy, ip, userAgent);
      res.json({ success: true, message: result.message });
    } catch (error) {
      console.error('Disburse error:', error);
      res.status(500).json({ success: false, message: 'Failed to disburse loan' });
    }
  }
}

module.exports = CommitteeController;
