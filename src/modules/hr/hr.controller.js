const HrService = require('./hr.service');
const { auditMiddleware } = require('../../middleware/audit');

class HrController {
  static async getEmployees(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {
        department: req.query.department,
        employment_status: req.query.employment_status,
        job_grade: req.query.job_grade,
        search: req.query.search,
        is_active: req.query.is_active
      };
      
      // Remove undefined filters
      Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);
      
      const result = await HrService.getEmployees(page, limit, filters);
      
      res.json({
        success: true,
        data: result.employees,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Get employees error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch employees'
      });
    }
  }

  static async verifyEmployee(req, res) {
    try {
      const { userId } = req.params;
      const adminId = req.userId;
      const ip = req.ip;
      const userAgent = req.get('User-Agent');
      
      const result = await HrService.verifyEmployee(userId, adminId, ip, userAgent);
      
      res.json({
        success: true,
        message: result.message,
        data: result.employee
      });
    } catch (error) {
      console.error('Verify employee error:', error);
      
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to verify employee'
      });
    }
  }

  static async updateEmploymentStatus(req, res) {
    try {
      const { userId } = req.params;
      const { employment_status } = req.body;
      const adminId = req.userId;
      const ip = req.ip;
      const userAgent = req.get('User-Agent');
      
      const result = await HrService.updateEmploymentStatus(userId, employment_status, adminId, ip, userAgent);
      
      res.json({
        success: true,
        message: result.message,
        data: result.employee
      });
    } catch (error) {
      console.error('Update employment status error:', error);
      
      if (error.message.includes('not found') || error.message.includes('Invalid')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to update employment status'
      });
    }
  }

  static async createEmployee(req, res) {
    try {
      const employeeData = {
        employee_id: req.body.employee_id,
        username: req.body.username,
        email: req.body.email,
        role: req.body.role || 'EMPLOYEE'
      };
      
      const profileData = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        phone: req.body.phone,
        address: req.body.address,
        department: req.body.department,
        job_grade: req.body.job_grade,
        employment_status: req.body.employment_status,
        hire_date: req.body.hire_date
      };
      
      const adminId = req.userId;
      const ip = req.ip;
      const userAgent = req.get('User-Agent');
      
      const result = await HrService.createEmployee(employeeData, profileData, adminId, ip, userAgent);
      
      res.status(201).json({
        success: true,
        message: result.message,
        data: result.employee
      });
    } catch (error) {
      console.error('Create employee error:', error);
      
      if (error.message.includes('already exists') || error.message.includes('required')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to create employee'
      });
    }
  }

  static async getEmployeeById(req, res) {
    try {
      const { userId } = req.params;
      
      const employee = await HrService.getEmployeeById(userId);
      
      res.json({
        success: true,
        data: employee
      });
    } catch (error) {
      console.error('Get employee by ID error:', error);
      
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch employee'
      });
    }
  }

  static async updateEmployeeProfile(req, res) {
    try {
      const { userId } = req.params;
      const profileData = req.body;
      const adminId = req.userId;
      const ip = req.ip;
      const userAgent = req.get('User-Agent');
      
      const result = await HrService.updateEmployeeProfile(userId, profileData, adminId, ip, userAgent);
      
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Update employee profile error:', error);
      
      if (error.message.includes('not found') || error.message.includes('No valid fields')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to update employee profile'
      });
    }
  }

  static async getDepartments(req, res) {
    try {
      const departments = await HrService.getDepartments();
      
      res.json({
        success: true,
        data: departments
      });
    } catch (error) {
      console.error('Get departments error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch departments'
      });
    }
  }

  static async getJobGrades(req, res) {
    try {
      const jobGrades = await HrService.getJobGrades();
      
      res.json({
        success: true,
        data: jobGrades
      });
    } catch (error) {
      console.error('Get job grades error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch job grades'
      });
    }
  }

  static async getEmployeeStats(req, res) {
    try {
      const stats = await HrService.getEmployeeStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get employee stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch employee statistics'
      });
    }
  }

  static async bulkVerifyEmployees(req, res) {
    try {
      const { userIds } = req.body;
      const adminId = req.userId;
      const ip = req.ip;
      const userAgent = req.get('User-Agent');
      
      const results = await HrService.bulkVerifyEmployees(userIds, adminId, ip, userAgent);
      
      res.json({
        success: true,
        message: `Bulk verification completed. Verified: ${results.verified.length}, Failed: ${results.failed.length}`,
        data: results
      });
    } catch (error) {
      console.error('Bulk verify employees error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to bulk verify employees'
      });
    }
  }
}

module.exports = HrController;
