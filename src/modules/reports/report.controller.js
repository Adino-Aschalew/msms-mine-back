const ReportService = require('./report.service');
const { authMiddleware, roleMiddleware } = require('../../middleware/auth');

class ReportController {
  static async getReportStats(req, res) {
    try {
      console.log('getReportStats controller called');
      const stats = await ReportService.getReportStats();
      console.log('Stats from service:', stats);
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get report stats error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        data: {
          totalReports: 0,
          thisMonthReports: 0,
          totalDownloads: 0,
          activeUsers: 0,
          reportsChange: '0%',
          thisMonthChange: '0%',
          downloadsChange: '0%',
          activeUsersChange: '0%'
        }
      });
    }
  }
  
  static async getReports(req, res) {
    try {
      console.log('getReports controller called with query:', req.query);
      const { type, period, search } = req.query;
      
      const filters = {
        type,
        period,
        search
      };
      
      const reports = await ReportService.getReportList(filters);
      console.log('Reports from service:', reports?.length || 0, 'items');
      
      res.json({
        success: true,
        data: reports
      });
    } catch (error) {
      console.error('Get reports error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        data: []
      });
    }
  }

  static async generateReport(req, res) {
    try {
      const { reportType, format = 'json', filters = {} } = req.body;
      const userId = req.userId;
      
      const result = await ReportService.generateReport(reportType, format, filters, userId);
      
      if (format === 'pdf') {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${reportType}_report.pdf"`);
        res.send(result);
      } else if (format === 'excel') {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheet.sheet+xml');
        res.setHeader('Content-Disposition', `attachment; filename="${reportType}_report.xlsx"`);
        res.send(result);
      } else {
        res.json({
          success: true,
          data: result
        });
      }
    } catch (error) {
      console.error('Generate report error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate report'
      });
    }
  }

  static async getReportTemplates(req, res) {
    try {
      const templates = await ReportService.getReportTemplates();
      
      res.json({
        success: true,
        data: templates
      });
    } catch (error) {
      console.error('Get report templates error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch report templates'
      });
    }
  }

  static async getReportHistory(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {
        report_type: req.query.report_type,
        generated_by: req.query.generated_by,
        start_date: req.query.start_date,
        end_date: req.query.end_date
      };
      
      const result = await ReportService.getReportHistory(page, limit, filters);
      
      res.json({
        success: true,
        data: result.reports,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Get report history error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch report history'
      });
    }
  }

  static async getReportById(req, res) {
    try {
      const { reportId } = req.params;
      const report = await ReportService.getReportById(reportId);
      
      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      console.error('Get report by ID error:', error);
      
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch report'
      });
    }
  }

  static async deleteReport(req, res) {
    try {
      const { reportId } = req.params;
      const userId = req.userId;
      
      const result = await ReportService.deleteReport(reportId, userId);
      
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Delete report error:', error);
      
      if (error.message.includes('not found') || error.message.includes('permission')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to delete report'
      });
    }
  }

  static async scheduleReport(req, res) {
    try {
      const { reportType, schedule, parameters, recipients } = req.body;
      const userId = req.userId;
      
      const result = await ReportService.scheduleReport(reportType, schedule, parameters, recipients, userId);
      
      res.json({
        success: true,
        message: result.message,
        data: result
      });
    } catch (error) {
      console.error('Schedule report error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to schedule report'
      });
    }
  }

  static async getScheduledReports(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {
        status: req.query.status,
        next_run: req.query.next_run
      };
      
      const result = await ReportService.getScheduledReports(page, limit, filters);
      
      res.json({
        success: true,
        data: result.reports,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Get scheduled reports error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch scheduled reports'
      });
    }
  }

  static async cancelScheduledReport(req, res) {
    try {
      const { reportId } = req.params;
      const userId = req.userId;
      
      const result = await ReportService.cancelScheduledReport(reportId, userId);
      
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Cancel scheduled report error:', error);
      
      if (error.message.includes('not found') || error.message.includes('permission')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to cancel scheduled report'
      });
    }
  }

  static async getReportDefinitions(req, res) {
    try {
      const definitions = await ReportService.getReportDefinitions();
      
      res.json({
        success: true,
        data: definitions
      });
    } catch (error) {
      console.error('Get report definitions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch report definitions'
      });
    }
  }
}

module.exports = ReportController;
