const AuthService = require('./auth.service');

class AuthController {
  static async login(req, res) {
    try {
      const { employee_id, password } = req.body;
      const ip = req.ip;
      const userAgent = req.get('User-Agent');
      
      const result = await AuthService.login(employee_id, password, ip, userAgent);
      
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
  
  static async register(req, res) {
    try {
      const userData = req.body;
      const ip = req.ip;
      const userAgent = req.get('User-Agent');
      
      const result = await AuthService.register(userData, ip, userAgent);
      
      res.status(201).json({
        success: true,
        message: 'Registration successful. Please wait for HR verification.',
        data: result
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
      const passwordData = req.body;
      const userId = req.userId;
      const ip = req.ip;
      const userAgent = req.get('User-Agent');
      
      const result = await AuthService.changePassword(userId, passwordData, ip, userAgent);
      
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Password change error:', error);
      
      if (error.message.includes('required') || error.message.includes('password')) {
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
        message: result.message
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
