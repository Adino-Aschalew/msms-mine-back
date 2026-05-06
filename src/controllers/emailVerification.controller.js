const EmailVerificationService = require('../services/emailVerification.service');
const AuthService = require('../modules/auth/auth.service');
const { auditLog } = require('../middleware/audit');

class EmailVerificationController {
  static async sendVerificationCode(req, res) {
    try {
      console.log('[EmailVerificationController] sendVerificationCode called with:', req.body);
      const { email, userId } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required'
        });
      }

      // Check if there's already a pending verification
      const hasPending = await EmailVerificationService.hasPendingVerification(email);
      if (hasPending) {
        return res.status(429).json({
          success: false,
          message: 'A verification code has already been sent. Please wait for it to expire before requesting a new one.',
          resendAfter: 60
        });
      }

      const result = await EmailVerificationService.sendVerificationCode(email, userId);

      // Log the verification code send
      if (userId) {
        await auditLog(userId, 'EMAIL_VERIFICATION_SENT', 'users', userId, null, { email }, req.ip, req.get('User-Agent'));
      }

      res.json({
        success: true,
        message: result.message,
        expiresIn: result.expiresIn
      });

    } catch (error) {
      console.error('Send verification code error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to send verification code'
      });
    }
  }

  static async verifyCode(req, res) {
    try {
      const { email, code, userId } = req.body;

      if (!email || !code) {
        return res.status(400).json({
          success: false,
          message: 'Email and verification code are required'
        });
      }

      if (code.length !== 6 || !/^\d{6}$/.test(code)) {
        return res.status(400).json({
          success: false,
          message: 'Verification code must be 6 digits'
        });
      }

      const result = await EmailVerificationService.verifyCode(email, code);

      // Log successful verification
      if (userId) {
        await auditLog(userId, 'EMAIL_VERIFIED', 'users', userId, null, { email }, req.ip, req.get('User-Agent'));
      }

      // Complete the email verification process and get tokens
      const authResult = await AuthService.completeEmailVerification(userId, req.ip, req.get('User-Agent'));

      res.json({
        success: true,
        message: result.message,
        user: authResult.user,
        token: authResult.token,
        refreshToken: authResult.refreshToken
      });

    } catch (error) {
      console.error('Verify code error:', error);
      
      // Log failed verification attempt
      if (userId) {
        await auditLog(userId, 'EMAIL_VERIFICATION_FAILED', 'users', userId, null, { email, error: error.message }, req.ip, req.get('User-Agent'));
      }

      res.status(400).json({
        success: false,
        message: error.message || 'Verification failed'
      });
    }
  }

  static async resendVerificationCode(req, res) {
    try {
      const { email, userId } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required'
        });
      }

      // Check if there's a pending verification that hasn't expired
      const hasPending = await EmailVerificationService.hasPendingVerification(email);
      if (hasPending) {
        return res.status(429).json({
          success: false,
          message: 'Current verification code is still valid. Please wait for it to expire before requesting a new one.',
          resendAfter: 60
        });
      }

      const result = await EmailVerificationService.sendVerificationCode(email, userId);

      // Log the resend
      if (userId) {
        await auditLog(userId, 'EMAIL_VERIFICATION_RESENT', 'users', userId, null, { email }, req.ip, req.get('User-Agent'));
      }

      res.json({
        success: true,
        message: 'Verification code resent successfully',
        expiresIn: result.expiresIn
      });

    } catch (error) {
      console.error('Resend verification code error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to resend verification code'
      });
    }
  }

  static async checkVerificationStatus(req, res) {
    try {
      const { email } = req.params;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required'
        });
      }

      const hasPending = await EmailVerificationService.hasPendingVerification(email);

      res.json({
        success: true,
        hasPendingVerification: hasPending
      });

    } catch (error) {
      console.error('Check verification status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check verification status'
      });
    }
  }
}

module.exports = EmailVerificationController;
