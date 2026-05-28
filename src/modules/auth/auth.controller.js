const AuthService = require('./auth.service');

class AuthController {
  static async login(req, res) {
    try {
      const { identifier, password, role } = req.body;
      const ip = req.ip;
      const userAgent = req.get('User-Agent');
      
      const result = await AuthService.login(identifier, password, role, ip, userAgent);
      
      res.json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.message.includes('required') || error.message.includes('credentials')) {
        return res.status(error.message.includes('required') ? 400 : 401).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
  
  static async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      const ip = req.ip;
      const userAgent = req.get('User-Agent');
      
      const result = await AuthService.refreshToken(refreshToken, ip, userAgent);
      
      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: result
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      
      res.status(401).json({
        success: false,
        message: error.message || 'Invalid refresh token'
      });
    }
  }
  
  static async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.userId;
      const ip = req.ip;
      const userAgent = req.get('User-Agent');
      
      const result = await AuthService.changePassword(userId, currentPassword, newPassword, ip, userAgent);
      
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Password change error:', error);
      
      if (error.message.includes('incorrect') || error.message.includes('required')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
  
  static async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      const ip = req.ip;
      const userAgent = req.get('User-Agent');
      
      const result = await AuthService.forgotPassword(email, ip, userAgent);
      
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to process password reset request'
      });
    }
  }
  
  static async resetPassword(req, res) {
    try {
      const { otp, newPassword } = req.body;
      const ip = req.ip;
      const userAgent = req.get('User-Agent');
      
      const result = await AuthService.resetPassword(otp, newPassword, ip, userAgent);
      
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Reset password error:', error);
      
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to reset password'
      });
    }
  }
  
  static async getProfile(req, res) {
    try {
      const userId = req.userId;
      const profile = await AuthService.getProfile(userId);
      
      res.json({
        success: true,
        data: profile
      });
    } catch (error) {
      console.error('Get profile error:', error);
      
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
  
  static async updateProfile(req, res) {
    try {
      const profileData = req.body;
      const userId = req.userId;
      const ip = req.ip;
      const userAgent = req.get('User-Agent');
      
      const result = await AuthService.updateProfile(userId, profileData, ip, userAgent);
      
      res.json({
        success: true,
        message: result.message,
        data: result.data || null
      });
    } catch (error) {
      console.error('Update profile error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async uploadProfilePicture(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No image file provided'
        });
      }
      
      const userId = req.userId;
      const profilePicturePath = `/uploads/profile-pictures/${req.file.filename}`;
      const ip = req.ip;
      const userAgent = req.get('User-Agent');
      
      const result = await AuthService.updateProfilePicture(userId, profilePicturePath, ip, userAgent);
      
      res.json({
        success: true,
        message: 'Profile picture uploaded successfully',
        data: {
          profile_picture: profilePicturePath
        }
      });
    } catch (error) {
      console.error('Upload profile picture error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload profile picture'
      });
    }
  }

  static async forceChangePassword(req, res) {
    try {
      const { newPassword } = req.body;
      const userId = req.userId;
      const ip = req.ip;
      const userAgent = req.get('User-Agent');
      
      const result = await AuthService.forceChangePassword(userId, newPassword, ip, userAgent);
      
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Force change password error:', error);
      
      if (error.message.includes('required')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async requestOTP(req, res) {
    try {
      const userId = req.userId;
      const ip = req.ip;
      const userAgent = req.get('User-Agent');
      
      const result = await AuthService.requestOTP(userId, ip, userAgent);
      
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Request OTP error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to send verification code'
      });
    }
  }

  static async verifyOTP(req, res) {
    try {
      const { otpCode } = req.body;
      const userId = req.userId;
      const ip = req.ip;
      const userAgent = req.get('User-Agent');
      
      if (!otpCode) {
        return res.status(400).json({
          success: false,
          message: 'Verification code is required'
        });
      }
      
      const result = await AuthService.verifyOTP(userId, otpCode, ip, userAgent);
      
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Verify OTP error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Verification failed'
      });
    }
  }
  static async getActivityLog(req, res) {
    try {
      const userId = req.userId;
      const limit = parseInt(req.query.limit) || 20;
      const { query } = require('../../config/database');

      const rows = await query(
        `SELECT action, table_name, created_at, ip_address, user_agent
         FROM audit_logs
         WHERE user_id = ?
         ORDER BY created_at DESC
         LIMIT ?`,
        [userId, limit]
      );

      res.json({ success: true, data: rows });
    } catch (error) {
      console.error('Activity log error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch activity log' });
    }
  }
}

module.exports = AuthController;
