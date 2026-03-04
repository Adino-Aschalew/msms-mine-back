const GuarantorService = require('./guarantor.service');
const { auditMiddleware } = require('../../middleware/audit');

class GuarantorController {
  static async addGuarantor(req, res) {
    try {
      const { loan_application_id, guarantor_details } = req.body;
      const userId = req.userId;
      const ip = req.ip;
      const userAgent = req.get('User-Agent');
      
      const result = await GuarantorService.addGuarantor(loan_application_id, guarantor_details, userId, ip, userAgent);
      
      res.status(201).json({
        success: true,
        message: result.message,
        data: result
      });
    } catch (error) {
      console.error('Add guarantor error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add guarantor'
      });
    }
  }

  static async getGuarantors(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {
        status: req.query.status,
        loan_application_id: req.query.loan_application_id,
        search: req.query.search
      };
      
      Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);
      
      const result = await GuarantorService.getGuarantors(page, limit, filters);
      
      res.json({
        success: true,
        data: result.guarantors,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Get guarantors error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch guarantors'
      });
    }
  }

  static async getGuarantorById(req, res) {
    try {
      const { guarantorId } = req.params;
      const guarantor = await GuarantorService.getGuarantorById(guarantorId);
      
      res.json({
        success: true,
        data: guarantor
      });
    } catch (error) {
      console.error('Get guarantor error:', error);
      
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch guarantor'
      });
    }
  }

  static async updateGuarantorStatus(req, res) {
    try {
      const { guarantorId } = req.params;
      const { status } = req.body;
      const updatedBy = req.userId;
      const ip = req.ip;
      const userAgent = req.get('User-Agent');
      
      const result = await GuarantorService.updateGuarantorStatus(guarantorId, status, updatedBy, ip, userAgent);
      
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Update guarantor status error:', error);
      
      if (error.message.includes('not found') || error.message.includes('Invalid')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to update guarantor status'
      });
    }
  }

  static async getGuarantorStats(req, res) {
    try {
      const stats = await GuarantorService.getGuarantorStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get guarantor stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch guarantor statistics'
      });
    }
  }

  static async validateGuarantor(req, res) {
    try {
      const { guarantor_details } = req.body;
      
      const validation = await GuarantorService.validateGuarantor(guarantor_details);
      
      res.json({
        success: true,
        data: validation
      });
    } catch (error) {
      console.error('Validate guarantor error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = GuarantorController;
