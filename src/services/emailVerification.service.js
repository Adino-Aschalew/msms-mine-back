const crypto = require('crypto');
const { query } = require('../config/database');
const NotificationService = require('./notification.service');

class EmailVerificationService {
  static generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static async sendVerificationCode(email, userId) {
    try {
      const code = this.generateVerificationCode();
      const expiresAt = new Date(Date.now() + 60 * 1000); // 60 seconds

      // Store verification code in database
      await query(
        `UPDATE users SET 
         email_verification_code = ?, 
         email_verification_expires = ? 
         WHERE id = ?`,
        [code, expiresAt, userId]
      );

      // Send email with verification code
      const subject = 'Email Verification Code - Loan & Savings Management System';
      const message = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1e40af; color: white; padding: 20px; text-align: center;">
            <h2>Loan & Savings Management System</h2>
            <p>Email Verification</p>
          </div>
          <div style="padding: 30px; background: #f9fafb;">
            <h3 style="color: #1f2937;">Verify Your Email Address</h3>
            <p style="color: #4b5563; line-height: 1.6;">
              Thank you for logging in! To complete your first-time login verification, 
              please use the following 6-digit verification code:
            </p>
            <div style="background: white; border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1e40af;">
                ${code}
              </span>
            </div>
            <p style="color: #6b7280; font-size: 14px;">
              <strong>Important:</strong> This code will expire in 60 seconds for security reasons.
              If you don't receive the code, please check your spam folder.
            </p>
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #92400e;">
                <strong>Security Notice:</strong> Never share this verification code with anyone. 
                Our staff will never ask for your verification code.
              </p>
            </div>
          </div>
          <div style="background: #1f2937; color: white; padding: 20px; text-align: center; font-size: 12px;">
            <p>&copy; 2024 Loan & Savings Management System. All rights reserved.</p>
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      `;

      console.log('[EmailVerification] Attempting to send email to:', email);
      const emailResult = await NotificationService.sendEmail(email, subject, message);
      console.log('[EmailVerification] Email service result:', emailResult);

      if (!emailResult.success) {
        console.error('[EmailVerification] Failed to send email:', emailResult.message);
        throw new Error(emailResult.message);
      }

      return {
        success: true,
        message: 'Verification code sent successfully',
        expiresIn: 60
      };

    } catch (error) {
      console.error('Error sending verification code:', error);
      throw new Error('Failed to send verification code');
    }
  }

  static async verifyCode(email, code) {
    try {
      const user = await query(
        `SELECT id, email_verification_code, email_verification_expires 
         FROM users 
         WHERE email = ? AND is_active = 1`,
        [email]
      );

      if (!user || user.length === 0) {
        throw new Error('User not found');
      }

      const userData = user[0];

      // Check if code matches
      if (userData.email_verification_code !== code) {
        throw new Error('Invalid verification code');
      }

      // Check if code has expired
      const now = new Date();
      const expiresAt = new Date(userData.email_verification_expires);
      
      if (now > expiresAt) {
        throw new Error('Verification code has expired. Please request a new code.');
      }

      // Mark email as verified and clear verification code
      await query(
        `UPDATE users SET 
         email_verified = TRUE,
         email_verification_code = NULL,
         email_verification_expires = NULL,
         updated_at = NOW()
         WHERE id = ?`,
        [userData.id]
      );

      return {
        success: true,
        message: 'Email verified successfully'
      };

    } catch (error) {
      console.error('Error verifying code:', error);
      throw error;
    }
  }

  static async cleanupExpiredCodes() {
    try {
      await query(
        `UPDATE users SET 
         email_verification_code = NULL,
         email_verification_expires = NULL
         WHERE email_verification_expires < NOW()`
      );
    } catch (error) {
      console.error('Error cleaning up expired codes:', error);
    }
  }

  static async hasPendingVerification(email) {
    try {
      const user = await query(
        `SELECT email_verification_code, email_verification_expires 
         FROM users 
         WHERE email = ? AND is_active = 1`,
        [email]
      );

      if (!user || user.length === 0) {
        return false;
      }

      const userData = user[0];
      
      if (!userData.email_verification_code) {
        return false;
      }

      const now = new Date();
      const expiresAt = new Date(userData.email_verification_expires);
      
      return now <= expiresAt;

    } catch (error) {
      console.error('Error checking pending verification:', error);
      return false;
    }
  }
}

module.exports = EmailVerificationService;
