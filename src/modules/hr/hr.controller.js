const HrService = require('./hr.service');
const { auditMiddleware } = require('../../middleware/audit');

class HrController {
  static async getEmployees(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {
        page,
        limit,
        department: req.query.department,
        employment_status: req.query.employment_status,
        job_grade: req.query.job_grade,
        search: req.query.search,
        is_active: req.query.is_active
      };
      
      // Remove undefined filters
      Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);
      
      const result = await HrService.getEmployees(filters);
      
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
      const adminId = req.userId;
      const ip = req.ip;
      const userAgent = req.get('User-Agent');
      
      const { 
        firstName, lastName, grandfatherName, phone, address, department, jobRole, role, 
        type, salary, status, joinDate 
      } = req.body;
      
      const profileData = {
        first_name: firstName,
        last_name: lastName,
        grandfather_name: grandfatherName,
        phone,
        address,
        department,
        job_grade: type,
        job_role: jobRole || role,
        employment_status: status ? status.toUpperCase() : undefined,
        hire_date: joinDate,
        salary: salary
      };
      
      // Remove undefined values to avoid overwriting with null if unintentional
      Object.keys(profileData).forEach(key => profileData[key] === undefined && delete profileData[key]);
      
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

  static async createEmployee(req, res) {
    try {
      const { 
        employeeId, firstName, lastName, grandfatherName, email, 
        phone, department, role, type, salary, address, 
        emergencyContact, joinDate, status, jobRole 
      } = req.body;
      
      const employeeData = {
        employee_id: employeeId || `EMP${Date.now().toString().slice(-6)}`,
        username: email,
        email: email,
        role: 'EMPLOYEE' // SECURITY: All users created via HR dashboard are categorized as 'EMPLOYEE'
      };
      
      const profileData = {
        first_name: firstName,
        last_name: lastName,
        grandfather_name: grandfatherName,
        phone: phone,
        address: address,
        department: department,
        job_grade: type,
        job_role: role || jobRole, // Display role/job title
        salary: salary,
        employment_status: status === 'Active' ? 'ACTIVE' : (status === 'Inactive' ? 'INACTIVE' : status.toUpperCase()),
        hire_date: joinDate
      };
      
      // Validate required fields
      if (!employeeData.employee_id || !employeeData.username || !employeeData.email) {
        return res.status(400).json({
          success: false,
          message: 'Employee ID, username, and email are required'
        });
      }
      
      const createdBy = req.userId;
      const ip = req.ip;
      const userAgent = req.get('User-Agent');
      
      const result = await HrService.createEmployee(employeeData, profileData, createdBy, ip, userAgent);
      
      res.json({
        success: true,
        message: 'Employee created successfully',
        data: result
      });
    } catch (error) {
      console.error('Create employee error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create employee: ' + error.message
      });
    }
  }

  static async getDashboardStats(req, res) {
    try {
      const stats = await HrService.getDashboardStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard statistics'
      });
    }
  }

  static async updateDashboardStats(req, res) {
    try {
      const { stats } = req.body;
      const userId = req.user.id;
      const ip = req.ip;
      const userAgent = req.get('User-Agent');
      
      const updatedStats = await HrService.updateDashboardStats(stats, userId, ip, userAgent);
      
      res.json({
        success: true,
        message: 'Dashboard statistics updated successfully',
        data: updatedStats
      });
    } catch (error) {
      console.error('Update dashboard stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update dashboard statistics'
      });
    }
  }

  static async getAttendanceData(req, res) {
    try {
      const period = req.query.period || 'month';
      const attendanceData = await HrService.getAttendanceData(period);
      
      res.json({
        success: true,
        data: attendanceData
      });
    } catch (error) {
      console.error('Get attendance data error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch attendance data'
      });
    }
  }

  static async getDepartmentData(req, res) {
    try {
      const departmentData = await HrService.getDepartmentData();
      
      res.json({
        success: true,
        data: departmentData
      });
    } catch (error) {
      console.error('Get department data error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch department data'
      });
    }
  }

  static async getDiversityData(req, res) {
    try {
      const diversityData = await HrService.getDiversityData();
      
      res.json({
        success: true,
        data: diversityData
      });
    } catch (error) {
      console.error('Get diversity data error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch diversity data'
      });
    }
  }

  static async getRecentActivities(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const activities = await HrService.getRecentActivities(limit);
      
      res.json({
        success: true,
        data: activities
      });
    } catch (error) {
      console.error('Get recent activities error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch recent activities'
      });
    }
  }

  static async getUnverifiedEmployees(req, res) {
    try {
      const unverifiedEmployees = await HrService.getUnverifiedEmployees();
      
      res.json({
        success: true,
        data: unverifiedEmployees
      });
    } catch (error) {
      console.error('Get unverified employees error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch unverified employees'
      });
    }
  }

  static async syncWithHRDatabase(req, res) {
    try {
      const adminId = req.userId;
      const ip = req.ip;
      const userAgent = req.get('User-Agent');
      
      const syncResult = await HrService.syncWithHRDatabase(adminId, ip, userAgent);
      
      res.json({
        success: true,
        message: 'HR database sync completed',
        data: syncResult
      });
    } catch (error) {
      console.error('Sync HR database error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to sync with HR database'
      });
    }
  }

  static async getPerformanceStats(req, res) {
    try {
      const stats = await HrService.getPerformanceStats();
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch performance statistics'
      });
    }
  }

  static async getPerformanceReviews(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;
      
      const reviews = await HrService.getPerformanceReviews(parseInt(limit), offset);
      
      res.json({
        success: true,
        data: reviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: reviews.length
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch performance reviews'
      });
    }
  }

  static async createPerformanceReview(req, res) {
    try {
      const review = await HrService.createPerformanceReview(req.body);
      
      res.status(201).json({
        success: true,
        data: review,
        message: 'Performance review created successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to create performance review'
      });
    }
  }

  static async getReportsData(req, res) {
    try {
      const { reportType = 'payroll' } = req.query;
      const data = await HrService.getReportsData(reportType);
      
      res.json({
        success: true,
        data: data
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch reports data'
      });
    }
  }

  static async getUserProfile(req, res) {
    try {
      const userId = req.userId;
      
      // For now, return basic user info from auth middleware
      // We can enhance this later once the profile service is debugged
      res.json({
        success: true,
        data: {
          user: {
            id: userId,
            username: req.user?.username || 'hr@msms.com',
            email: req.user?.email || 'hr@msms.com',
            role: req.user?.role || 'HR',
            first_name: 'HR',
            last_name: 'Manager',
            department: 'Human Resources',
            job_grade: 'MANAGER',
            phone: null,
            address: null
          },
          loginActivity: []
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user profile'
      });
    }
  }

  static async updateUserProfile(req, res) {
    try {
      const userId = req.userId;
      const result = await HrService.updateUserProfile(userId, req.body);
      
      res.json({
        success: true,
        data: result,
        message: 'Profile updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update profile'
      });
    }
  }

  static async validateEmployee(req, res) {
    try {
      const { employeeId } = req.params;
      const employee = await HrService.validateEmployee(employeeId);
      
      res.json({
        success: true,
        data: employee,
        message: 'Employee validated successfully'
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message || 'Employee not found'
      });
    }
  }
}

module.exports = HrController;
