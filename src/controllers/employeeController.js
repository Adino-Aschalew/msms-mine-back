const Employee = require('../models/Employee');
const { auditLog } = require('../middleware/audit');

class EmployeeController {
  static async verifyEmployee(req, res) {
    try {
      const { employee_id } = req.body;
      const userId = req.userId;
      
      if (!employee_id) {
        return res.status(400).json({
          success: false,
          message: 'Employee ID is required'
        });
      }
      
      const hrData = await Employee.verifyEmployeeFromHR(employee_id);
      
      if (!hrData) {
        await auditLog(userId, 'HR_VERIFICATION_FAILED', 'employee_profiles', null, null, { employee_id }, req.ip, req.get('User-Agent'));
        
        return res.status(404).json({
          success: false,
          message: 'Employee not found in HR database or not active'
        });
      }
      
      const existingProfile = await Employee.getEmployeeProfileByEmployeeId(employee_id);
      
      if (existingProfile) {
        return res.status(400).json({
          success: false,
          message: 'Employee profile already exists'
        });
      }
      
      const profileId = await Employee.createEmployeeProfile(userId, hrData);
      await Employee.updateHRVerification(userId, true);
      
      await auditLog(userId, 'HR_VERIFICATION_SUCCESS', 'employee_profiles', profileId, null, hrData, req.ip, req.get('User-Agent'));
      
      res.json({
        success: true,
        message: 'Employee verified and profile created successfully',
        data: {
          profileId,
          employeeData: hrData
        }
      });
    } catch (error) {
      console.error('Employee verification error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }
  
  static async getProfile(req, res) {
    try {
      const userId = req.userId;
      
      const profile = await Employee.getEmployeeProfile(userId);
      
      if (!profile) {
        return res.status(404).json({
          success: false,
          message: 'Employee profile not found'
        });
      }
      
      res.json({
        success: true,
        data: profile
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
  
  static async updateProfile(req, res) {
    try {
      const userId = req.userId;
      const { phone, address } = req.body;
      
      const updateQuery = `
        UPDATE employee_profiles 
        SET phone = ?, address = ?, updated_at = NOW()
        WHERE user_id = ?
      `;
      
      await require('../config/database').query(updateQuery, [phone, address, userId]);
      
      await auditLog(userId, 'PROFILE_UPDATE', 'employee_profiles', userId, null, { phone, address }, req.ip, req.get('User-Agent'));
      
      res.json({
        success: true,
        message: 'Profile updated successfully'
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async validateEmployee(req, res) {
    try {
      const { employeeId } = req.params;
      
      const profile = await Employee.getEmployeeProfileByEmployeeId(employeeId);
      
      if (!profile) {
        return res.status(404).json({
          success: false,
          message: 'Employee profile not found'
        });
      }
      
      res.json({
        success: true,
        data: profile
      });
    } catch (error) {
      console.error('Validate employee error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
  
  static async getAllEmployees(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {
        department: req.query.department,
        job_grade: req.query.job_grade,
        employment_status: req.query.employment_status,
        hr_verified: req.query.hr_verified !== undefined ? req.query.hr_verified === 'true' : undefined
      };
      
      Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);
      
      const result = await Employee.getAllEmployees(page, limit, filters);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get all employees error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
  
  static async getUnverifiedEmployees(req, res) {
    try {
      const employees = await Employee.getUnverifiedEmployees();
      
      res.json({
        success: true,
        data: employees
      });
    } catch (error) {
      console.error('Get unverified employees error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
  
  static async bulkVerifyEmployees(req, res) {
    try {
      const { employee_ids } = req.body;
      const verifiedBy = req.userId;
      
      if (!employee_ids || !Array.isArray(employee_ids) || employee_ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Employee IDs array is required'
        });
      }
      
      const results = await Employee.bulkVerifyEmployees(employee_ids, verifiedBy);
      
      await auditLog(verifiedBy, 'BULK_HR_VERIFICATION', 'employee_profiles', null, null, { employee_ids, results }, req.ip, req.get('User-Agent'));
      
      res.json({
        success: true,
        message: 'Bulk verification completed',
        data: results
      });
    } catch (error) {
      console.error('Bulk verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
  
  static async updateEmployeeStatus(req, res) {
    try {
      const { userId: targetUserId } = req.params;
      const { employment_status } = req.body;
      const updatedBy = req.userId;
      
      if (!employment_status || !['ACTIVE', 'INACTIVE', 'TERMINATED'].includes(employment_status)) {
        return res.status(400).json({
          success: false,
          message: 'Valid employment status is required'
        });
      }
      
      await Employee.updateEmployeeStatus(targetUserId, employment_status);
      
      await auditLog(updatedBy, 'EMPLOYMENT_STATUS_UPDATE', 'employee_profiles', targetUserId, null, { employment_status }, req.ip, req.get('User-Agent'));
      
      res.json({
        success: true,
        message: 'Employee status updated successfully'
      });
    } catch (error) {
      console.error('Update employee status error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
  
  static async getEmployeeStats(req, res) {
    try {
      const stats = await Employee.getEmployeeStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get employee stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = EmployeeController;
