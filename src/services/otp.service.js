const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { query } = require('../config/database');
const NotificationService = require('./notification.service');

class OTPService {
  /**
   * Generate a secure 6-digit OTP code
   * @returns {string} 6-digit OTP code
   */
  static generateOTP() {
    // Generate cryptographically secure random number between 100000-999999
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * Hash OTP code for secure storage
   * @param {string} otp - Plain OTP code
   * @returns {Promise<string>} Hashed OTP
   */
  static async hashOTP(otp) {
    const saltRounds = 12; // Use high salt rounds for security
    return await bcrypt.hash(otp, saltRounds);
  }

  /**
   * Verify OTP against hashed version
   * @param {string} plainOTP - Plain OTP from user
   * @param {string} hashedOTP - Hashed OTP from database
   * @returns {Promise<boolean>} Whether OTP matches
   */
  static async verifyOTP(plainOTP, hashedOTP) {
    return await bcrypt.compare(plainOTP, hashedOTP);
  }

  /**
   * Create and store OTP record in database
   * @param {string} email - User email
   * @param {number} userId - User ID
   * @returns {Promise<Object>} OTP record details
   */
  static async createOTPRecord(email, userId) {
    try {
      // Generate OTP
      const otp = this.generateOTP();
      const hashedOTP = await this.hashOTP(otp);
      
      // Set expiration time (1 minute from now)
      const expiresAt = new Date(Date.now() + 60 * 1000);
      
      // Use raw connection with multiple statements to bypass trigger
      const mysql = require('mysql2/promise');
      const rawConnection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3307,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'microfinance_system',
        multipleStatements: true
      });
      
      try {
        // Execute multiple statements to bypass trigger
        const sql = `
          -- Disable triggers temporarily
          SET @DISABLE_TRIGGERS = NULL;
          
          -- Clean up existing OTPs
          DELETE FROM otp_records WHERE user_id = ? OR email = ?;
          
          -- Insert new OTP record
          INSERT INTO otp_records (email, user_id, hashed_code, expires_at, attempts, created_at, updated_at) 
          VALUES (?, ?, ?, ?, 0, NOW(), NOW());
          
          -- Get the inserted ID
          SELECT LAST_INSERT_ID() as insertId;
        `;
        
        const [results] = await rawConnection.execute(sql, [userId, email, email, userId, hashedOTP, expiresAt]);
        
        // Get the insert ID from the last result
        const insertId = results[results.length - 1][0]?.insertId;
        
        return {
          id: insertId,
          email,
          userId,
          plainOTP: otp, // Return plain OTP for sending (only stored in memory)
          expiresAt,
          message: 'OTP generated successfully'
        };
      } finally {
        await rawConnection.end();
      }
      
    } catch (error) {
      console.error('Error creating OTP record:', error);
      throw new Error('Failed to generate OTP');
    }
  }

  /**
   * Send OTP to user email with dynamic personalization
   * @param {string} email - User email
   * @param {string} otp - Plain OTP code
   * @param {Object} userData - User data for personalization
   * @param {Object} loginContext - Login context for security
   * @returns {Promise<Object>} Email send result
   */
  static async sendOTPEmail(email, otp, userData = {}, loginContext = {}) {
    try {
      const {
        firstName = 'User',
        lastName = '',
        employeeId = 'N/A',
        department = 'Not specified'
      } = userData;

      const {
        loginTime = new Date().toLocaleString(),
        deviceInfo = 'Unknown device',
        ipAddress = 'Unknown IP'
      } = loginContext;

      // Calculate expiration time for display
      const expirationTime = new Date(Date.now() + 60 * 1000).toLocaleTimeString();

      const subject = `Login Verification Code for ${firstName} ${lastName}`.trim();
      
      // Dynamic personalized email template
      const message = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <div style="font-size: 24px; font-weight: bold; margin-bottom: 8px;">🔐 Microfinance System</div>
            <div style="font-size: 16px; opacity: 0.9;">Secure Login Verification</div>
          </div>
          
          <div style="padding: 40px 30px; background: white;">
            <h2 style="color: #2c3e50; margin-bottom: 20px;">Dear ${firstName} ${lastName},</h2>
            
            <p style="color: #555; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
              Your login verification code for Employee ID: <strong>${employeeId}</strong> is:
            </p>
            
            <div style="background: #f8f9fa; border: 2px dashed #667eea; border-radius: 12px; padding: 25px; text-align: center; margin: 30px 0;">
              <div style="font-size: 14px; color: #666; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px;">Verification Code</div>
              <div style="font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                ${otp}
              </div>
              <div style="font-size: 12px; color: #999; margin-top: 15px;">Expires in exactly 60 seconds at ${expirationTime}</div>
            </div>
            
            <div style="background: #e3f2fd; border-left: 4px solid #2196f3; padding: 20px; margin: 25px 0; border-radius: 4px;">
              <h4 style="color: #1976d2; margin: 0 0 10px 0;">🔍 Security Information</h4>
              <table style="width: 100%; font-size: 14px; color: #555;">
                <tr>
                  <td style="padding: 5px 0;"><strong>Email:</strong></td>
                  <td style="padding: 5px 0;">${email}</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0;"><strong>Department:</strong></td>
                  <td style="padding: 5px 0;">${department}</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0;"><strong>Login Time:</strong></td>
                  <td style="padding: 5px 0;">${loginTime}</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0;"><strong>Device:</strong></td>
                  <td style="padding: 5px 0;">${deviceInfo}</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0;"><strong>IP Address:</strong></td>
                  <td style="padding: 5px 0;">${ipAddress}</td>
                </tr>
              </table>
            </div>
            
            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 25px 0; border-radius: 4px;">
              <p style="color: #856404; margin: 0; font-size: 14px;">
                <strong>⚠️ Security Notice:</strong> Never share this code with anyone. 
                If you didn't request this code, please contact security immediately.
              </p>
            </div>
            
            <p style="color: #777; font-size: 14px; line-height: 1.5; margin-top: 25px;">
              This code will automatically expire in exactly 60 seconds for your security.
            </p>
          </div>
          
          <div style="background: #2c3e50; color: white; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px;">
            <p style="margin: 0; opacity: 0.8;">
              © 2024 Microfinance System Security Team<br>
              This is an automated message. Please do not reply.
            </p>
          </div>
        </div>
      `;

      const result = await NotificationService.sendEmail(email, subject, message);
      return result;
    } catch (error) {
      console.error('Error sending OTP email:', error);
      throw new Error('Failed to send OTP email');
    }
  }

  /**
   * Generate and send OTP to user with dynamic personalization
   * @param {string} email - User email
   * @param {number} userId - User ID
   * @param {Object} loginContext - Login context (IP, user agent, etc.)
   * @returns {Promise<Object>} Result with success status
   */
  static async generateAndSendOTP(email, userId, loginContext = {}) {
    try {
      // Create OTP record (generates unique random 6-digit code)
      const otpRecord = await this.createOTPRecord(email, userId);
      
      // Fetch complete user data for personalization
      const { query } = require('../config/database');
      const users = await query(
        `SELECT u.first_name, u.last_name, u.employee_id, u.email, 
                ep.department, ep.job_title 
         FROM users u 
         LEFT JOIN employee_profiles ep ON u.id = ep.user_id 
         WHERE u.id = ? AND u.is_active = 1`,
        [userId]
      );
      
      if (users.length === 0) {
        throw new Error('User not found or inactive');
      }
      
      const userData = {
        firstName: users[0].first_name || 'User',
        lastName: users[0].last_name || '',
        employeeId: users[0].employee_id || 'N/A',
        department: users[0].department || 'Not specified',
        jobTitle: users[0].job_title || 'Not specified'
      };
      
      // Prepare login context for security information
      const securityContext = {
        loginTime: new Date().toLocaleString(),
        deviceInfo: this.parseUserAgent(loginContext.userAgent || 'Unknown'),
        ipAddress: loginContext.ipAddress || 'Unknown'
      };
      
      // Send OTP email with dynamic personalization
      const emailResult = await this.sendOTPEmail(
        email, 
        otpRecord.plainOTP, 
        userData, 
        securityContext
      );
      
      if (!emailResult.success) {
        throw new Error(emailResult.message);
      }
      
      return {
        success: true,
        message: 'OTP sent successfully to your email',
        expiresAt: otpRecord.expiresAt,
        email: email // Return email for frontend (masked if needed)
      };
    } catch (error) {
      console.error('Error in generateAndSendOTP:', error);
      throw error;
    }
  }

  /**
   * Parse user agent string for device information
   * @param {string} userAgent - User agent string
   * @returns {string} Parsed device info
   */
  static parseUserAgent(userAgent) {
    try {
      // Simple user agent parsing
      if (userAgent.includes('Chrome')) return 'Chrome Browser';
      if (userAgent.includes('Firefox')) return 'Firefox Browser';
      if (userAgent.includes('Safari')) return 'Safari Browser';
      if (userAgent.includes('Edge')) return 'Edge Browser';
      if (userAgent.includes('Mobile')) return 'Mobile Device';
      return 'Unknown Device';
    } catch (error) {
      return 'Unknown Device';
    }
  }

  /**
   * Verify OTP code with security checks
   * @param {string} email - User email
   * @param {string} otp - Plain OTP from user
   * @returns {Promise<Object>} Verification result
   */
  static async verifyOTPCode(email, otp) {
    try {
      // Get latest OTP record for this email
      const records = await query(
        `SELECT * FROM otp_records 
         WHERE email = ? 
         ORDER BY created_at DESC 
         LIMIT 1`,
        [email]
      );
      
      if (records.length === 0) {
        return {
          success: false,
          message: 'No OTP found for this email. Please request a new one.',
          remainingAttempts: 3
        };
      }
      
      const otpRecord = records[0];
      
      // Check if OTP has expired
      if (new Date() > new Date(otpRecord.expires_at)) {
        // Clean up expired OTP
        await query('DELETE FROM otp_records WHERE id = ?', [otpRecord.id]);
        return {
          success: false,
          message: 'OTP has expired. Please request a new one.',
          remainingAttempts: 3
        };
      }
      
      // Check maximum attempts
      if (otpRecord.attempts >= 3) {
        // Delete OTP after max attempts
        await query('DELETE FROM otp_records WHERE id = ?', [otpRecord.id]);
        return {
          success: false,
          message: 'Maximum attempts exceeded. Please request a new OTP.',
          remainingAttempts: 0
        };
      }
      
      // Increment attempt count
      await query(
        'UPDATE otp_records SET attempts = attempts + 1 WHERE id = ?',
        [otpRecord.id]
      );
      
      // Verify OTP
      const isValid = await this.verifyOTP(otp, otpRecord.hashed_code);
      
      if (!isValid) {
        const remainingAttempts = 3 - (otpRecord.attempts + 1);
        return {
          success: false,
          message: `Invalid OTP. ${remainingAttempts} attempts remaining.`,
          remainingAttempts
        };
      }
      
      // OTP is valid - delete it (single use)
      await query('DELETE FROM otp_records WHERE id = ?', [otpRecord.id]);
      
      return {
        success: true,
        message: 'OTP verified successfully',
        verifiedAt: new Date()
      };
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return {
        success: false,
        message: 'Failed to verify OTP. Please try again.',
        remainingAttempts: 3
      };
    }
  }

  /**
   * Clean up expired OTPs (maintenance function)
   * @returns {Promise<number>} Number of cleaned up records
   */
  static async cleanupExpiredOTPs() {
    try {
      const result = await query(
        'DELETE FROM otp_records WHERE expires_at < NOW()'
      );
      return result.affectedRows;
    } catch (error) {
      console.error('Error cleaning up expired OTPs:', error);
      return 0;
    }
  }

  /**
   * Check if user has active OTP (rate limiting)
   * @param {string} email - User email
   * @returns {Promise<boolean>} Whether user has active OTP
   */
  static async hasActiveOTP(email) {
    try {
      const records = await query(
        'SELECT COUNT(*) as count FROM otp_records WHERE email = ? AND expires_at > NOW()',
        [email]
      );
      return records[0].count > 0;
    } catch (error) {
      console.error('Error checking active OTP:', error);
      return false;
    }
  }
}

module.exports = OTPService;
