const AuthService = require('./auth.service');

class AuthController {
  static async login(req, res) {
    try {
      const { identifier, password, role } = req.body;
      const ip = req.ip;
      const userAgent = req.get('User-Agent');
      
      const result = await AuthService.login(identifier, password, ip, userAgent);
      
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
        message: result.message || 'Password changed successfully'
      });
    } catch (error) {
      console.error('Password change error:', error);
      
      if (error.message.includes('incorrect') || error.message.includes('required') || error.message.includes('must contain')) {
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
      const { token, newPassword } = req.body;
      const ip = req.ip;
      const userAgent = req.get('User-Agent');
      
      const result = await AuthService.resetPassword(token, newPassword, ip, userAgent);
      
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
      
      // Structure data to match frontend expectations
      const responseData = {
        user: {
          id: profile.id,
          name: `${profile.first_name} ${profile.last_name}`,
          email: profile.email,
          role: profile.role,
          created_at: profile.created_at
        },
        employeeProfile: {
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone: profile.phone_number,
          address: profile.address,
          department: profile.department,
          position: profile.job_title,
          employee_id: profile.employee_id,
          hire_date: profile.created_at, // Using created_at as fallback
          employment_type: profile.employment_status || 'Full-time',
          date_of_birth: null, // Add if available in schema
          emergency_contact: null, // Add if available in schema
          bio: null // Add if available in schema
        }
      };
      
      res.json({
        success: true,
        data: responseData
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

  static async completeOTPVerification(req, res) {
    try {
      const { userId } = req.body;
      const ip = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent');

      const result = await AuthService.completeOTPVerification(userId, ip, userAgent);

      res.json(result);
    } catch (error) {
      console.error('Complete OTP verification error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to complete OTP verification'
      });
    }
  }
}

module.exports = AuthController;
