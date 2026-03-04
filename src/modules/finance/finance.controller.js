const FinanceService = require('./finance.service');
const { auditMiddleware } = require('../../middleware/audit');

class FinanceController {
  static async getFinancialOverview(req, res) {
    try {
      const period = req.query.period || 'MONTHLY';
      const overview = await FinanceService.getFinancialOverview(period);
      
      res.json({
        success: true,
        data: overview
      });
    } catch (error) {
      console.error('Get financial overview error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch financial overview'
      });
    }
  }

  static async processPayroll(req, res) {
    try {
      const payrollData = req.body;
      const uploadedBy = req.userId;
      
      const result = await FinanceService.processPayroll(payrollData, uploadedBy);
      
      res.json({
        success: true,
        message: 'Payroll processed successfully',
        data: result
      });
    } catch (error) {
      console.error('Process payroll error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process payroll'
      });
    }
  }

  static async getPayrollBatches(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {
        status: req.query.status,
        start_date: req.query.start_date,
        end_date: req.query.end_date
      };
      
      Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);
      
      const result = await FinanceService.getPayrollBatches(page, limit, filters);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get payroll batches error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch payroll batches'
      });
    }
  }

  static async getPayrollBatchDetails(req, res) {
    try {
      const { batchId } = req.params;
      const details = await FinanceService.getPayrollBatchDetails(batchId);
      
      res.json({
        success: true,
        data: details
      });
    } catch (error) {
      console.error('Get payroll batch details error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch payroll batch details'
      });
    }
  }

  static async getPayrollHistory(req, res) {
    try {
      const { userId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      
      const history = await FinanceService.getPayrollHistory(userId, page, limit);
      
      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      console.error('Get payroll history error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch payroll history'
      });
    }
  }

  static async getFinancialReports(req, res) {
    try {
      const { reportType } = req.params;
      const period = req.query.period || 'MONTHLY';
      const filters = {
        department: req.query.department,
        status: req.query.status,
        start_date: req.query.start_date,
        end_date: req.query.end_date
      };
      
      Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);
      
      const report = await FinanceService.getFinancialReports(reportType, period, filters);
      
      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      console.error('Get financial reports error:', error);
      
      if (error.message.includes('Invalid report type')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to generate financial report'
      });
    }
  }

  static async getCashFlowReport(req, res) {
    try {
      const period = req.query.period || 'MONTHLY';
      const report = await FinanceService.getCashFlowReport(period);
      
      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      console.error('Get cash flow report error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate cash flow report'
      });
    }
  }

  static async getProfitLossReport(req, res) {
    try {
      const period = req.query.period || 'MONTHLY';
      const report = await FinanceService.getProfitLossReport(period);
      
      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      console.error('Get profit loss report error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate profit loss report'
      });
    }
  }

  static async getLoanPortfolio(req, res) {
    try {
      const filters = {
        status: req.query.status,
        department: req.query.department
      };
      
      Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);
      
      const portfolio = await FinanceService.getLoanPortfolio(filters);
      
      res.json({
        success: true,
        data: portfolio
      });
    } catch (error) {
      console.error('Get loan portfolio error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch loan portfolio'
      });
    }
  }

  static async getSavingsSummary(req, res) {
    try {
      const period = req.query.period || 'MONTHLY';
      const summary = await FinanceService.getSavingsSummaryReport(period);
      
      res.json({
        success: true,
        data: summary
      });
    } catch (error) {
      console.error('Get savings summary error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch savings summary'
      });
    }
  }

  static async getSystemHealth(req, res) {
    try {
      const health = await FinanceService.getSystemHealthMetrics();
      
      res.json({
        success: true,
        data: health
      });
    } catch (error) {
      console.error('Get system health error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch system health metrics'
      });
    }
  }

  static async uploadPayrollFile(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }
      
      const uploadedBy = req.userId;
      const fileData = req.file;
      
      // Process the uploaded CSV file
      const CsvUtils = require('../../utils/csv');
      const parsedData = await CsvUtils.parseCsvBuffer(fileData.buffer);
      
      // Process payroll data
      const result = await FinanceService.processPayroll(parsedData.data, uploadedBy);
      
      res.json({
        success: true,
        message: 'Payroll file uploaded and processed successfully',
        data: result
      });
    } catch (error) {
      console.error('Upload payroll file error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload payroll file'
      });
    }
  }

  static async exportFinancialReport(req, res) {
    try {
      const { reportType } = req.params;
      const period = req.query.period || 'MONTHLY';
      const format = req.query.format || 'json';
      
      const report = await FinanceService.getFinancialReports(reportType, period);
      
      if (format === 'csv') {
        const CsvUtils = require('../../utils/csv');
        const csvBuffer = await CsvUtils.generateCsvBuffer(report);
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${reportType}_report.csv"`);
        res.send(csvBuffer);
      } else if (format === 'pdf') {
        const PdfUtils = require('../../utils/pdf');
        const template = {
          title: `${reportType.toUpperCase()} Report`,
          content: [
            {
              type: 'text',
              text: `Financial Report: ${reportType}`,
              style: 'heading'
            },
            {
              type: 'text',
              text: `Period: ${period}`,
              style: 'subheading'
            },
            {
              type: 'table',
              headers: Object.keys(report[0] || {}).map(key => ({ text: key, key })),
              rows: report
            }
          ]
        };
        
        const pdfBuffer = await PdfUtils.generatePdfBuffer(report, template);
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${reportType}_report.pdf"`);
        res.send(pdfBuffer);
      } else {
        res.json({
          success: true,
          data: report
        });
      }
    } catch (error) {
      console.error('Export financial report error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export financial report'
      });
    }
  }
}

module.exports = FinanceController;
