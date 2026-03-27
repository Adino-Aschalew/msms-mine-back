const UserService = require('./user.service');

class UserController {
  static async createUser(req, res) {
    try {
      const userData = req.body;
      const profileData = req.body.profile || {};
      const ip = req.ip;
      const userAgent = req.get('User-Agent');
      
      // Remove profile data from userData
      const { profile, ...userOnlyData } = userData;
      
      const result = await UserService.createUser(userOnlyData, profileData, ip, userAgent);
      
      res.status(201).json({
        success: true,
        message: result.message,
        data: { userId: result.userId }
      });
    } catch (error) {
      console.error('Create user error:', error);
      
      if (error.message.includes('already exists')) {
        return res.status(409).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create user'
      });
    }
  }

  static async getAllUsers(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {
        role: req.query.role,
        department: req.query.department,
        employment_status: req.query.employment_status,
        search: req.query.search
      };
      
      // Remove undefined filters
      Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);
      
      const result = await UserService.getAllUsers(page, limit, filters);
      
      res.json({
        success: true,
        data: result.users,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch users'
      });
    }
  }

  static async getAllUsersWithInactive(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {
        role: req.query.role,
        department: req.query.department,
        employment_status: req.query.employment_status,
        is_active: req.query.is_active !== undefined ? req.query.is_active === 'true' : undefined,
        search: req.query.search
      };
      
      // Remove undefined filters
      Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);
      
      const result = await UserService.getAllUsersWithInactive(page, limit, filters);
      
      res.json({
        success: true,
        data: result.users,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch users'
      });
    }
  }

  static async getUserById(req, res) {
    try {
      const { userId } = req.params;
      const user = await UserService.getUserById(userId);
      
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Get user error:', error);
      
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user'
      });
    }
  }

  static async updateUser(req, res) {
    try {
      const { userId } = req.params;
      const userData = req.body;
      const ip = req.ip;
      const userAgent = req.get('User-Agent');
      
      const result = await UserService.updateUser(userId, userData, ip, userAgent);
      
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Update user error:', error);
      
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update user'
      });
    }
  }

  static async updateUserProfile(req, res) {
    try {
      const { userId } = req.params;
      const profileData = req.body;
      const ip = req.ip;
      const userAgent = req.get('User-Agent');
      
      const result = await UserService.updateUserProfile(userId, profileData, ip, userAgent);
      
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Update profile error:', error);
      
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update profile'
      });
    }
  }

  static async deactivateUser(req, res) {
    try {
      const { userId } = req.params;
      const ip = req.ip;
      const userAgent = req.get('User-Agent');
      
      const result = await UserService.deactivateUser(userId, ip, userAgent);
      
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Deactivate user error:', error);
      
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to deactivate user'
      });
    }
  }

  static async activateUser(req, res) {
    try {
      const { userId } = req.params;
      const ip = req.ip;
      const userAgent = req.get('User-Agent');
      
      const result = await UserService.activateUser(userId, ip, userAgent);
      
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Activate user error:', error);
      
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to activate user'
      });
    }
  }

  static async deleteUser(req, res) {
    try {
      const { userId } = req.params;
      const ip = req.ip;
      const userAgent = req.get('User-Agent');
      
      const result = await UserService.deleteUser(userId, ip, userAgent);
      
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Delete user error:', error);
      
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to delete user'
      });
    }
  }

  static async resetPassword(req, res) {
    try {
      const { userId } = req.params;
      const { newPassword } = req.body;
      const ip = req.ip;
      const userAgent = req.get('User-Agent');
      
      if (!newPassword) {
        return res.status(400).json({
          success: false,
          message: 'New password is required'
        });
      }
      
      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 8 characters long'
        });
      }
      
      const result = await UserService.resetUserPassword(userId, newPassword, ip, userAgent);
      
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Reset password error:', error);
      
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to reset password'
      });
    }
  }

  static async getProfile(req, res) {
    try {
      console.log('getProfile - Request received for userId:', req.userId);
      const userId = req.userId;
      
      // Use UserService to get the user with profile - it already handles findByIdWithProfile and data transformation
      const user = await UserService.getUserById(userId);
      console.log('getProfile - User data retrieved successfully');
      
      const responseData = {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          created_at: user.created_at
        },
        employeeProfile: user.employee_profile || null
      };
      
      res.json({
        success: true,
        data: responseData
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch profile'
      });
    }
  }

  static async getUserStats(req, res) {
    try {
      const stats = await UserService.getUserStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get user stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user statistics'
      });
    }
  }

  static async searchUsers(req, res) {
    try {
      const searchTerm = req.query.q;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      
      if (!searchTerm) {
        return res.status(400).json({
          success: false,
          message: 'Search term is required'
        });
      }
      
      const result = await UserService.searchUsers(searchTerm, page, limit);
      
      res.json({
        success: true,
        data: result.users,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Search users error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search users'
      });
    }
  }
}

module.exports = UserController;
