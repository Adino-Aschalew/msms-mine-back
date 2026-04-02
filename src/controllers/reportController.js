const ReportService = require('../services/reportService');
const { auditLog } = require('../middleware/audit');
const path = require('path');

class ReportController {
  static async generateReport(req, res) {
    try {
      const { report_type, file_format = 'PDF', filters = {} } = req.body;
      const generatedBy = req.userId;
      
      if (!report_type) {
        return res.status(400).json({
          success: false,
          message: 'Report type is required'
        });
      }
      
      const validTypes = ['OPERATIONAL', 'FINANCIAL', 'AUDIT', 'FORECAST_COMPARISON'];
      if (!validTypes.includes(report_type)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid report type'
        });
      }
      
      const validFormats = ['PDF', 'CSV', 'EXCEL'];
      if (!validFormats.includes(file_format.toUpperCase())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid file format'
        });
      }
      
      let reportData;
      
      switch (report_type) {
        case 'OPERATIONAL':
          reportData = await ReportService.generateOperationalReport(filters);
          break;
        case 'FINANCIAL':
          reportData = await ReportService.generateFinancialReport(filters);
          break;
        case 'AUDIT':
          reportData = await ReportService.generateAuditReport(filters);
          break;
        case 'FORECAST_COMPARISON':
          if (!filters.forecast_type || !filters.start_date || !filters.end_date) {
            return res.status(400).json({
              success: false,
              message: 'Forecast comparison requires forecast_type, start_date, and end_date'
            });
          }
          reportData = await ReportService.generateForecastComparisonReport(filters);
          break;
        default:
          throw new Error('Unsupported report type');
      }
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${report_type}_Report_${timestamp}.${file_format.toLowerCase()}`;
      
      let filePath;
      if (file_format.toUpperCase() === 'PDF') {
        filePath = await ReportService.generatePDFReport(reportData, filename);
      } else {
        filePath = await ReportService.generateExcelReport(reportData, filename);
      }
      
      const reportRecord = await ReportService.saveReportRecord(reportData, filePath, generatedBy);
      
      await auditLog(generatedBy, 'REPORT_GENERATE', 'generated_reports', null, null, {
        report_type,
        file_format,
        filters,
        file_path: filePath
      }, req.ip, req.get('User-Agent'));
      
      res.json({
        success: true,
        message: 'Report generated successfully',
        data: {
          ...reportRecord,
          report_data: reportData
        }
      });
    } catch (error) {
      console.error('Generate report error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }
  
  static async getReportHistory(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      
      const filters = {
        report_type: req.query.report_type,
        generated_by: req.query.generated_by,
        start_date: req.query.start_date,
        end_date: req.query.end_date
      };
      
      let whereClause = 'WHERE 1=1';
      const params = [];
      
      if (filters.report_type) {
        whereClause += ' AND gr.report_type = ?';
        params.push(filters.report_type);
      }
      
      if (filters.generated_by) {
        whereClause += ' AND gr.generated_by = ?';
        params.push(filters.generated_by);
      }
      
      if (filters.start_date) {
        whereClause += ' AND DATE(gr.generation_date) >= ?';
        params.push(filters.start_date);
      }
      
      if (filters.end_date) {
        whereClause += ' AND DATE(gr.generation_date) <= ?';
        params.push(filters.end_date);
      }
      
      const countQuery = `
        SELECT COUNT(*) as total FROM generated_reports gr ${whereClause}
      `;
      
      const selectQuery = `
        SELECT gr.*, u.username as generated_by_username, u.first_name as generated_by_first_name, u.last_name as generated_by_last_name
        FROM generated_reports gr
        JOIN users u ON gr.generated_by = u.id
        ${whereClause}
        ORDER BY gr.generation_date DESC
        LIMIT ? OFFSET ?
      `;
      
      const [countResult, reports] = await Promise.all([
        require('../config/database').query(countQuery, params),
        require('../config/database').query(selectQuery, [...params, limit, offset])
      ]);
      
      res.json({
        success: true,
        data: {
          reports,
          pagination: {
            page,
            limit,
            total: countResult[0].total,
            pages: Math.ceil(countResult[0].total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Get report history error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
  
  static async downloadReport(req, res) {
    try {
      const { reportId } = req.params;
      
      const reportQuery = `
        SELECT gr.*, u.username as generated_by_username
        FROM generated_reports gr
        JOIN users u ON gr.generated_by = u.id
        WHERE gr.id = ?
      `;
      
      const reports = await require('../config/database').query(reportQuery, [reportId]);
      
      if (!reports || reports.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Report not found'
        });
      }
      
      const report = reports[0];
      
      if (!require('fs').existsSync(report.file_path)) {
        return res.status(404).json({
          success: false,
          message: 'Report file not found'
        });
      }
      
      const filename = path.basename(report.file_path);
      
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      if (report.file_format === 'PDF') {
        res.setHeader('Content-Type', 'application/pdf');
      } else if (report.file_format === 'EXCEL') {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      } else {
        res.setHeader('Content-Type', 'text/csv');
      }
      
      require('fs').createReadStream(report.file_path).pipe(res);
      
      await auditLog(req.userId, 'REPORT_DOWNLOAD', 'generated_reports', reportId, null, { filename }, req.ip, req.get('User-Agent'));
      
    } catch (error) {
      console.error('Download report error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
  
  static async getReportTypes(req, res) {
    try {
      const reportTypes = [
        {
          type: 'OPERATIONAL',
          name: 'Operational Report',
          description: 'Daily operational metrics including savings, transactions, and payroll data',
          filters: ['start_date', 'end_date', 'department', 'account_status'],
          formats: ['PDF', 'EXCEL']
        },
        {
          type: 'FINANCIAL',
          name: 'Financial Report',
          description: 'Financial performance metrics including portfolio overview and loan performance',
          filters: ['start_date', 'end_date', 'department'],
          formats: ['PDF', 'EXCEL']
        },
        {
          type: 'AUDIT',
          name: 'Audit Report',
          description: 'Comprehensive audit logs and user activity tracking',
          filters: ['start_date', 'end_date', 'user_id', 'action', 'table_name'],
          formats: ['PDF', 'EXCEL']
        },
        {
          type: 'FORECAST_COMPARISON',
          name: 'Forecast Comparison Report',
          description: 'Comparison of forecasted values vs actual values',
          filters: ['forecast_type', 'start_date', 'end_date'],
          formats: ['PDF', 'EXCEL']
        }
      ];
      
      res.json({
        success: true,
        data: reportTypes
      });
    } catch (error) {
      console.error('Get report types error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
  
  static async getReportStats(req, res) {
    try {
      const statsQuery = `
        SELECT 
          COUNT(*) as total_reports,
          COUNT(CASE WHEN report_type = 'OPERATIONAL' THEN 1 END) as operational_reports,
          COUNT(CASE WHEN report_type = 'FINANCIAL' THEN 1 END) as financial_reports,
          COUNT(CASE WHEN report_type = 'AUDIT' THEN 1 END) as audit_reports,
          COUNT(CASE WHEN report_type = 'FORECAST_COMPARISON' THEN 1 END) as forecast_reports,
          COUNT(CASE WHEN file_format = 'PDF' THEN 1 END) as pdf_reports,
          COUNT(CASE WHEN file_format = 'EXCEL' THEN 1 END) as excel_reports,
          COUNT(CASE WHEN file_format = 'CSV' THEN 1 END) as csv_reports,
          SUM(record_count) as total_records_processed,
          COUNT(DISTINCT generated_by) as unique_generators,
          MAX(generation_date) as last_generated,
          MIN(generation_date) as first_generated
        FROM generated_reports
      `;
      
      const monthlyQuery = `
        SELECT 
          DATE_FORMAT(generation_date, '%Y-%m') as month,
          COUNT(*) as report_count,
          SUM(record_count) as total_records
        FROM generated_reports
        WHERE generation_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        GROUP BY DATE_FORMAT(generation_date, '%Y-%m')
        ORDER BY month DESC
      `;
      
      const topGeneratorsQuery = `
        SELECT 
          u.username,
          u.first_name,
          u.last_name,
          u.role,
          COUNT(gr.id) as reports_generated,
          SUM(gr.record_count) as total_records_processed
        FROM generated_reports gr
        JOIN users u ON gr.generated_by = u.id
        GROUP BY u.id, u.username, u.first_name, u.last_name, u.role
        ORDER BY reports_generated DESC
        LIMIT 10
      `;
      
      const [stats, monthly, topGenerators] = await Promise.all([
        require('../config/database').query(statsQuery),
        require('../config/database').query(monthlyQuery),
        require('../config/database').query(topGeneratorsQuery)
      ]);
      
      res.json({
        success: true,
        data: {
          overview: stats[0],
          monthly_trends: monthly,
          top_generators: topGenerators
        }
      });
    } catch (error) {
      console.error('Get report stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
  
  static async deleteReport(req, res) {
    try {
      const { reportId } = req.params;
      const deletedBy = req.userId;
      
      const reportQuery = 'SELECT * FROM generated_reports WHERE id = ?';
      const reports = await require('../config/database').query(reportQuery, [reportId]);
      
      if (!reports || reports.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Report not found'
        });
      }
      
      const report = reports[0];
      
      
      if (require('fs').existsSync(report.file_path)) {
        require('fs').unlinkSync(report.file_path);
      }
      
      
      const deleteQuery = 'DELETE FROM generated_reports WHERE id = ?';
      await require('../config/database').query(deleteQuery, [reportId]);
      
      await auditLog(deletedBy, 'REPORT_DELETE', 'generated_reports', reportId, null, { 
        report_name: report.report_name,
        file_path: report.file_path
      }, req.ip, req.get('User-Agent'));
      
      res.json({
        success: true,
        message: 'Report deleted successfully'
      });
    } catch (error) {
      console.error('Delete report error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
  
  static async getDashboardSummary(req, res) {
    try {
      const [
        recentReports,
        reportStats,
        popularTypes
      ] = await Promise.all([
        require('../config/database').query(`
          SELECT gr.*, u.username as generated_by_username
          FROM generated_reports gr
          JOIN users u ON gr.generated_by = u.id
          ORDER BY gr.generation_date DESC
          LIMIT 5
        `),
        require('../config/database').query(`
          SELECT 
            COUNT(*) as total_reports,
            COUNT(CASE WHEN generation_date >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as reports_this_week,
            COUNT(CASE WHEN generation_date >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as reports_this_month
          FROM generated_reports
        `),
        require('../config/database').query(`
          SELECT 
            report_type,
            COUNT(*) as count
          FROM generated_reports
          WHERE generation_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
          GROUP BY report_type
          ORDER BY count DESC
        `)
      ]);
      
      res.json({
        success: true,
        data: {
          recent_reports: recentReports,
          stats: reportStats[0],
          popular_types: popularTypes
        }
      });
    } catch (error) {
      console.error('Get dashboard summary error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = ReportController;
