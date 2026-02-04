const User = require('../models/User');
const { auditLog } = require('../middleware/audit');

class AuthController {
  static async login(req, res) {
    try {
      const { employee_id, password } = req.body;
      
      if (!employee_id || !password) {
        return res.status(400).json({
          success: false,
          message: 'Employee ID and password are required'
        });
      }
      
      const result = await User.authenticate(employee_id, password);
      
      if (!result) {
        await auditLog(null, 'LOGIN_FAILED', 'users', null, null, { employee_id }, req.ip, req.get('User-Agent'));
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }
      
      await auditLog(result.user.id, 'LOGIN_SUCCESS', 'users', result.user.id, null, null, req.ip, req.get('User-Agent'));
      
      res.json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
  
  static async register(req, res) {
    try {
      const { employee_id, username, email, password, confirm_password } = req.body;
      
      if (!employee_id || !username || !email || !password || !confirm_password) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required'
        });
      }
      
      if (password !== confirm_password) {
        return res.status(400).json({
          success: false,
          message: 'Passwords do not match'
        });
      }
      
      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 8 characters long'
        });
      }
      
      const userId = await User.create({
        employee_id,
        username,
        email,
        password
      });
      
      await auditLog(userId, 'USER_REGISTER', 'users', userId, null, { employee_id, username, email }, req.ip, req.get('User-Agent'));
      
      res.status(201).json({
        success: true,
        message: 'Registration successful. Please wait for HR verification.',
        data: { userId }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Registration failed'
      });
    }
  }
  
  static async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token is required'
        });
      }
      
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
      
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid refresh token'
        });
      }
      
      const newToken = jwt.sign(
        { userId: user.id, employeeId: user.employee_id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );
      
      await auditLog(user.id, 'TOKEN_REFRESH', 'users', user.id, null, null, req.ip, req.get('User-Agent'));
      
      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: { token: newToken }
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }
  }
  
  static async changePassword(req, res) {
    try {
      const { current_password, new_password, confirm_password } = req.body;
      const userId = req.userId;
      
      if (!current_password || !new_password || !confirm_password) {
        return res.status(400).json({
          success: false,
          message: 'All password fields are required'
        });
      }
      
      if (new_password !== confirm_password) {
        return res.status(400).json({
          success: false,
          message: 'New passwords do not match'
        });
      }
      
      if (new_password.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 8 characters long'
        });
      }
      
      const user = await User.findById(userId);
      const bcrypt = require('bcryptjs');
      const isValidPassword = await bcrypt.compare(current_password, user.password_hash);
      
      if (!isValidPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }
      
      await User.updatePassword(userId, new_password);
      
      await auditLog(userId, 'PASSWORD_CHANGE', 'users', userId, null, null, req.ip, req.get('User-Agent'));
      
      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      console.error('Password change error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
  
  static async getProfile(req, res) {
    try {
      const user = await User.findById(req.userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      res.json({
        success: true,
        data: {
          id: user.id,
          employee_id: user.employee_id,
          username: user.username,
          email: user.email,
          role: user.role,
          first_name: user.first_name,
          last_name: user.last_name,
          department: user.department,
          job_grade: user.job_grade,
          employment_status: user.employment_status,
          created_at: user.created_at,
          last_login: user.last_login
        }
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
      const { first_name, last_name, phone, address } = req.body;
      const userId = req.userId;
      
      await User.updateProfile(userId, {
        first_name,
        last_name,
        phone,
        address
      });
      
      await auditLog(userId, 'PROFILE_UPDATE', 'employee_profiles', userId, null, { first_name, last_name, phone, address }, req.ip, req.get('User-Agent'));
      
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
}

module.exports = AuthController;
