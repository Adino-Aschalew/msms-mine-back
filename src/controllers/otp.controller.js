const OTPService = require('../services/otp-service-bypass');
const { auditLog } = require('../middleware/audit');

// Rate limiting storage (in production, use Redis)
const rateLimitStore = new Map();

class OTPController {
  /**
   * Rate limiting middleware
   * @param {string} identifier - Email or IP
   * @param {number} maxRequests - Max requests allowed
   * @param {number} windowMs - Time window in milliseconds
   * @returns {boolean} Whether request is allowed
   */
  static checkRateLimit(identifier, maxRequests = 3, windowMs = 300000) { // 5 minutes
    const now = Date.now();
    const key = `otp_${identifier}`;
    
    if (!rateLimitStore.has(key)) {
      rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }
    
    const data = rateLimitStore.get(key);
    
    // Reset if window expired
    if (now > data.resetTime) {
      rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }
    
    // Check limit
    if (data.count >= maxRequests) {
      return false;
    }
    
    data.count++;
    return true;
  }

  /**
   * Send OTP to user email
   * Security: Rate limited, validates user exists
   */
  static async sendOTP(req, res) {
    try {
      const { email, userId } = req.body;
      const clientIP = req.ip || req.connection.remoteAddress;
      
      // Input validation
      if (!email || !userId) {
        return res.status(400).json({
          success: false,
          message: 'Email and user ID are required'
        });
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
      }
      
      // Rate limiting check (3 requests per 5 minutes per email/IP)
      if (!OTPController.checkRateLimit(email) || !OTPController.checkRateLimit(clientIP)) {
        return res.status(429).json({
          success: false,
          message: 'Too many OTP requests. Please try again later.',
          retryAfter: 300 // 5 minutes
        });
      }
      
      // Check if user already has active OTP (prevent spam)
      const hasActiveOTP = await OTPService.hasActiveOTP(email);
      if (hasActiveOTP) {
        return res.status(429).json({
          success: false,
          message: 'An OTP has already been sent. Please check your email or wait for it to expire.',
          retryAfter: 60
        });
      }
      
      // Get user details for personalization
      const { query } = require('../config/database');
      const users = await query(
        'SELECT first_name, last_name FROM users WHERE id = ? AND email = ? AND is_active = 1',
        [userId, email]
      );
      
      if (users.length === 0) {
        // Don't reveal if user exists for security
        await auditLog(null, 'OTP_SEND_ATTEMPT_INVALID_USER', 'otp_records', null, null, { email }, clientIP, req.get('User-Agent'));
        return res.status(400).json({
          success: false,
          message: 'Invalid user credentials'
        });
      }
      
      const user = users[0];
      const userName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || email.split('@')[0];
      
      // Prepare login context for personalization
      const loginContext = {
        ipAddress: clientIP,
        userAgent: req.get('User-Agent')
      };

      // Generate and send OTP with dynamic personalization
      const result = await OTPService.generateAndSendOTP(email, userId, { userName, ...user }, loginContext);
      
      // Log successful OTP send
      await auditLog(userId, 'OTP_SENT', 'otp_records', null, null, { email, loginContext }, clientIP, req.get('User-Agent'));
      
      res.json({
        success: true,
        message: result.message,
        expiresAt: result.expiresAt,
        // Don't return actual email for security (mask it if needed)
        emailMask: email.replace(/(.{2}).*(@.*)/, '$1***$2')
      });
      
    } catch (error) {
      console.error('Send OTP error:', error);
      
      // Log error
      await auditLog(null, 'OTP_SEND_ERROR', 'otp_records', null, null, { 
        email: req.body.email, 
        error: error.message 
      }, req.ip, req.get('User-Agent'));
      
      res.status(500).json({
        success: false,
        message: 'Failed to send OTP. Please try again.',
        debug: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Verify OTP code
   * Security: Rate limited, validates all conditions
   */
  static async verifyOTP(req, res) {
    try {
      const { email, otp } = req.body;
      const clientIP = req.ip || req.connection.remoteAddress;
      
      // Input validation
      if (!email || !otp) {
        return res.status(400).json({
          success: false,
          message: 'Email and OTP are required'
        });
      }
      
      // Validate OTP format (6 digits)
      if (!/^\d{6}$/.test(otp)) {
        return res.status(400).json({
          success: false,
          message: 'OTP must be 6 digits'
        });
      }
      
      // Rate limiting verification attempts
      if (!OTPController.checkRateLimit(email, 10, 300000)) { // 10 attempts per 5 minutes
        return res.status(429).json({
          success: false,
          message: 'Too many verification attempts. Please try again later.',
          retryAfter: 300
        });
      }
      
      // Verify OTP
      const result = await OTPService.verifyOTP(email, otp);
      
      if (result.success) {
        // Log successful verification
        await auditLog(null, 'OTP_VERIFIED', 'otp_records', null, null, { email }, clientIP, req.get('User-Agent'));
        
        res.json({
          success: true,
          message: result.message,
          verifiedAt: result.verifiedAt
        });
      } else {
        // Log failed verification
        await auditLog(null, 'OTP_VERIFY_FAILED', 'otp_records', null, null, { 
          email, 
          reason: result.message,
          remainingAttempts: result.remainingAttempts 
        }, clientIP, req.get('User-Agent'));
        
        res.status(400).json({
          success: false,
          message: result.message,
          remainingAttempts: result.remainingAttempts
        });
      }
      
    } catch (error) {
      console.error('Verify OTP error:', error);
      
      // Log error
      await auditLog(null, 'OTP_VERIFY_ERROR', 'otp_records', null, null, { 
        email: req.body.email, 
        error: error.message 
      }, req.ip, req.get('User-Agent'));
      
      res.status(500).json({
        success: false,
        message: 'Failed to verify OTP. Please try again.',
        debug: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Resend OTP (with additional security checks)
   */
  static async resendOTP(req, res) {
    try {
      const { email, userId } = req.body;
      const clientIP = req.ip || req.connection.remoteAddress;
      
      // Input validation
      if (!email || !userId) {
        return res.status(400).json({
          success: false,
          message: 'Email and user ID are required'
        });
      }
      
      // Stricter rate limiting for resend
      if (!OTPController.checkRateLimit(`${email}_resend`, 2, 300000)) { // 2 resends per 5 minutes
        return res.status(429).json({
          success: false,
          message: 'Too many resend requests. Please wait before trying again.',
          retryAfter: 300
        });
      }
      
      // Check if there's an existing OTP that hasn't expired
      const hasActiveOTP = await OTPService.hasActiveOTP(email);
      if (hasActiveOTP) {
        return res.status(429).json({
          success: false,
          message: 'An OTP is already active. Please check your email or wait for it to expire.',
          retryAfter: 60
        });
      }
      
      // Get user data for resend
      const { query } = require('../config/database');
      const users = await query(
        'SELECT id FROM users WHERE email = ? AND is_active = 1',
        [email]
      );
      
      if (users.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email address'
        });
      }
      
      // Prepare login context for personalization
      const loginContext = {
        ipAddress: clientIP,
        userAgent: req.get('User-Agent')
      };

      // Generate and send new OTP with dynamic personalization
      const result = await OTPService.generateAndSendOTP(email, users[0].id, loginContext);
      
      // Log successful OTP resend
      await auditLog(users[0].id, 'OTP_RESENT', 'otp_records', null, null, { email, loginContext }, clientIP, req.get('User-Agent'));
      
      res.json({
        success: true,
        message: 'OTP resent successfully to your email',
        expiresAt: result.expiresAt,
        emailMask: email.replace(/(.{2}).*(@.*)/, '$1***$2')
      });
      
    } catch (error) {
      console.error('Resend OTP error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to resend OTP. Please try again.'
      });
    }
  }

  /**
   * Check OTP status (for frontend polling if needed)
   */
  static async checkOTPStatus(req, res) {
    try {
      const { email } = req.params;
      
      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required'
        });
      }
      
      const hasActiveOTP = await OTPService.hasActiveOTP(email);
      
      res.json({
        success: true,
        hasActiveOTP,
        message: hasActiveOTP ? 'OTP is active' : 'No active OTP found'
      });
      
    } catch (error) {
      console.error('Check OTP status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check OTP status'
      });
    }
  }

  /**
   * Cleanup expired OTPs (admin/maintenance endpoint)
   */
  static async cleanupExpiredOTPs(req, res) {
    try {
      const cleanedCount = await OTPService.cleanupExpiredOTPs();
      
      res.json({
        success: true,
        message: `Cleaned up ${cleanedCount} expired OTP records`,
        cleanedCount
      });
      
    } catch (error) {
      console.error('Cleanup OTPs error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cleanup expired OTPs'
      });
    }
  }
}

module.exports = OTPController;
