const Guarantor = require('../models/Guarantor');
const { auditLog } = require('../middleware/audit');

class GuarantorController {
  static async addGuarantor(req, res) {
    try {
      const { applicationId } = req.params;
      const userId = req.userId;
      const guarantorData = req.body;
      
      const { guarantor_type, guarantor_name, guarantor_id, relationship, monthly_income, contact_phone } = guarantorData;
      
      if (!guarantor_type || !guarantor_name || !guarantor_id || !relationship || !monthly_income || !contact_phone) {
        return res.status(400).json({
          success: false,
          message: 'All required fields must be provided'
        });
      }
      
      if (!['INTERNAL', 'EXTERNAL'].includes(guarantor_type)) {
        return res.status(400).json({
          success: false,
          message: 'Guarantor type must be INTERNAL or EXTERNAL'
        });
      }
      
      if (monthly_income <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Monthly income must be positive'
        });
      }
      
      const guarantorId = await Guarantor.addGuarantor(applicationId, userId, guarantorData);
      
      await auditLog(userId, 'GUARANTOR_ADD', 'guarantors', guarantorId, null, guarantorData, req.ip, req.get('User-Agent'));
      
      res.status(201).json({
        success: true,
        message: 'Guarantor added successfully',
        data: { guarantorId }
      });
    } catch (error) {
      console.error('Add guarantor error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }
  
  static async getGuarantors(req, res) {
    try {
      const { applicationId } = req.params;
      
      const guarantors = await Guarantor.getGuarantors(applicationId);
      
      res.json({
        success: true,
        data: guarantors
      });
    } catch (error) {
      console.error('Get guarantors error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
  
  static async getGuarantor(req, res) {
    try {
      const { guarantorId } = req.params;
      
      const guarantor = await Guarantor.getGuarantor(guarantorId);
      
      if (!guarantor) {
        return res.status(404).json({
          success: false,
          message: 'Guarantor not found'
        });
      }
      
      res.json({
        success: true,
        data: guarantor
      });
    } catch (error) {
      console.error('Get guarantor error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
  
  static async updateGuarantor(req, res) {
    try {
      const { guarantorId } = req.params;
      const guarantorData = req.body;
      const userId = req.userId;
      
      const { guarantor_name, relationship, monthly_income, contact_phone, contact_email, address } = guarantorData;
      
      if (!guarantor_name || !relationship || !monthly_income || !contact_phone) {
        return res.status(400).json({
          success: false,
          message: 'Required fields are missing'
        });
      }
      
      if (monthly_income <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Monthly income must be positive'
        });
      }
      
      await Guarantor.updateGuarantor(guarantorId, guarantorData);
      
      await auditLog(userId, 'GUARANTOR_UPDATE', 'guarantors', guarantorId, null, guarantorData, req.ip, req.get('User-Agent'));
      
      res.json({
        success: true,
        message: 'Guarantor updated successfully'
      });
    } catch (error) {
      console.error('Update guarantor error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }
  
  static async approveGuarantor(req, res) {
    try {
      const { guarantorId } = req.params;
      const approvedBy = req.userId;
      
      const guarantor = await Guarantor.getGuarantor(guarantorId);
      
      if (!guarantor) {
        return res.status(404).json({
          success: false,
          message: 'Guarantor not found'
        });
      }
      
      if (guarantor.is_approved) {
        return res.status(400).json({
          success: false,
          message: 'Guarantor already processed'
        });
      }
      
      try {
        await Guarantor.validateGuarantorEligibility(guarantorId);
      } catch (validationError) {
        return res.status(400).json({
          success: false,
          message: validationError.message
        });
      }
      
      await Guarantor.approveGuarantor(guarantorId, approvedBy);
      
      await auditLog(approvedBy, 'GUARANTOR_APPROVE', 'guarantors', guarantorId, null, null, req.ip, req.get('User-Agent'));
      
      res.json({
        success: true,
        message: 'Guarantor approved successfully'
      });
    } catch (error) {
      console.error('Approve guarantor error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }
  
  static async rejectGuarantor(req, res) {
    try {
      const { guarantorId } = req.params;
      const approvedBy = req.userId;
      
      const guarantor = await Guarantor.getGuarantor(guarantorId);
      
      if (!guarantor) {
        return res.status(404).json({
          success: false,
          message: 'Guarantor not found'
        });
      }
      
      if (guarantor.is_approved) {
        return res.status(400).json({
          success: false,
          message: 'Guarantor already processed'
        });
      }
      
      await Guarantor.rejectGuarantor(guarantorId, approvedBy);
      
      await auditLog(approvedBy, 'GUARANTOR_REJECT', 'guarantors', guarantorId, null, null, req.ip, req.get('User-Agent'));
      
      res.json({
        success: true,
        message: 'Guarantor rejected successfully'
      });
    } catch (error) {
      console.error('Reject guarantor error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }
  
  static async deleteGuarantor(req, res) {
    try {
      const { guarantorId } = req.params;
      const userId = req.userId;
      
      await Guarantor.deleteGuarantor(guarantorId, userId);
      
      await auditLog(userId, 'GUARANTOR_DELETE', 'guarantors', guarantorId, null, null, req.ip, req.get('User-Agent'));
      
      res.json({
        success: true,
        message: 'Guarantor deleted successfully'
      });
    } catch (error) {
      console.error('Delete guarantor error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }
  
  static async validateGuarantor(req, res) {
    try {
      const { guarantorId } = req.params;
      
      const validation = await Guarantor.validateGuarantorEligibility(guarantorId);
      
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
  
  static async getGuarantorExposure(req, res) {
    try {
      const { guarantorId } = req.params;
      
      const exposure = await Guarantor.getGuarantorExposure(guarantorId);
      
      res.json({
        success: true,
        data: exposure
      });
    } catch (error) {
      console.error('Get guarantor exposure error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }
  
  static async getAllGuarantors(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {
        guarantor_type: req.query.guarantor_type,
        is_approved: req.query.is_approved !== undefined ? req.query.is_approved === 'true' : undefined,
        guarantor_id: req.query.guarantor_id
      };
      
      Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);
      
      const result = await Guarantor.getAllGuarantors(page, limit, filters);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get all guarantors error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
  
  static async getGuarantorStats(req, res) {
    try {
      const stats = await Guarantor.getGuarantorStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get guarantor stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = GuarantorController;
