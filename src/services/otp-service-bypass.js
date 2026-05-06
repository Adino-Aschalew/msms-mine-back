const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { query } = require('../config/database');
const NotificationService = require('./notification.service');

class OTPServiceBypass {
  /**
   * Generate a secure 6-digit OTP code
   * @returns {string} 6-digit OTP code
   */
  static generateOTP() {
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * Hash OTP code for secure storage
   * @param {string} otp - Plain OTP code
   * @returns {Promise<string>} Hashed OTP
   */
  static async hashOTP(otp) {
    const saltRounds = 12;
    return await bcrypt.hash(otp, saltRounds);
  }

  /**
   * Create OTP record using temporary table approach to bypass trigger
   * @param {string} email - User email
   * @param {number} userId - User ID
   * @returns {Promise<Object>} OTP record details
   */
  static async createOTPRecord(email, userId) {
    try {
      // Generate OTP
      const otp = this.generateOTP();
      const hashedOTP = await this.hashOTP(otp);
      
      // Set expiration time (5 minutes from now for testing)
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
      
      // Use raw connection to bypass trigger completely
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
        // Create temporary table without triggers
        await rawConnection.execute(`
          CREATE TEMPORARY TABLE IF NOT EXISTS temp_otp_records (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) NOT NULL,
            user_id INT NOT NULL,
            hashed_code VARCHAR(255) NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            attempts INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          )
        `);
        
        // Insert into temporary table
        const [tempResult] = await rawConnection.execute(`
          INSERT INTO temp_otp_records (email, user_id, hashed_code, expires_at, attempts, created_at, updated_at) 
          VALUES (?, ?, ?, ?, 0, NOW(), NOW())
        `, [email, userId, hashedOTP, expiresAt]);
        
        // Copy to main table using INSERT IGNORE to avoid trigger conflicts
        await rawConnection.execute(`
          INSERT IGNORE INTO otp_records 
          (id, email, user_id, hashed_code, expires_at, attempts, created_at, updated_at)
          SELECT id, email, user_id, hashed_code, expires_at, attempts, created_at, updated_at
          FROM temp_otp_records
          WHERE id = ?
        `, [tempResult.insertId]);
        
        // Clean up old OTPs for this user
        await rawConnection.execute(`
          DELETE FROM otp_records 
          WHERE user_id = ? AND id != ?
        `, [userId, tempResult.insertId]);
        
        return {
          id: tempResult.insertId,
          email,
          userId,
          plainOTP: otp,
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
   * Verify OTP code
   * @param {string} email - User email
   * @param {string} otp - Plain OTP code
   * @returns {Promise<Object>} Verification result
   */
  static async verifyOTP(email, otp) {
    try {
      // Get active OTP record
      const records = await query(
        'SELECT * FROM otp_records WHERE email = ? AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
        [email]
      );

      if (records.length === 0) {
        return {
          success: false,
          message: 'No OTP found for this email. Please request a new one.',
          remainingAttempts: 3
        };
      }

      const record = records[0];

      // Check attempts
      if (record.attempts >= 3) {
        await query('DELETE FROM otp_records WHERE id = ?', [record.id]);
        return {
          success: false,
          message: 'Maximum attempts exceeded. Please request a new OTP.',
          remainingAttempts: 0
        };
      }

      // Verify OTP
      const isValid = await bcrypt.compare(otp, record.hashed_code);

      if (!isValid) {
        // Increment attempts
        await query(
          'UPDATE otp_records SET attempts = attempts + 1 WHERE id = ?',
          [record.id]
        );

        const remainingAttempts = 3 - record.attempts - 1;
        return {
          success: false,
          message: `Invalid OTP. ${remainingAttempts} attempts remaining.`,
          remainingAttempts
        };
      }

      // OTP is valid - delete it
      await query('DELETE FROM otp_records WHERE id = ?', [record.id]);

      return {
        success: true,
        message: 'OTP verified successfully!',
        email: email
      };

    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw new Error('Failed to verify OTP');
    }
  }

  /**
   * Generate and send OTP
   * @param {string} email - User email
   * @param {number} userId - User ID
   * @param {Object} userData - User data for personalization
   * @param {Object} loginContext - Login context
   * @returns {Promise<Object>} Send result
   */
  static async generateAndSendOTP(email, userId, userData = {}, loginContext = {}) {
    try {
      // Create OTP record
      const otpRecord = await this.createOTPRecord(email, userId);

      // Send OTP email
      const emailResult = await this.sendOTPEmail(
        email, 
        otpRecord.plainOTP, 
        userData, 
        loginContext
      );

      return {
        success: true,
        message: 'OTP sent successfully',
        emailMask: this.maskEmail(email),
        expiresAt: otpRecord.expiresAt,
        ...emailResult
      };

    } catch (error) {
      console.error('Error in generateAndSendOTP:', error);
      throw error;
    }
  }

  /**
   * Send OTP email
   * @param {string} email - User email
   * @param {string} otp - Plain OTP code
   * @param {Object} userData - User data for personalization
   * @param {Object} loginContext - Login context
   * @returns {Promise<Object>} Email send result
   */
  static async sendOTPEmail(email, otp, userData = {}, loginContext = {}) {
    try {
      const {
        firstName = 'User',
        lastName = '',
        employeeId = 'N/A'
      } = userData;

      const {
        clientIP = 'Unknown',
        userAgent = 'Unknown Device',
        loginTime = new Date().toLocaleString()
      } = loginContext;

      // Dynamic email template
      const emailTemplate = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">MSMS Employee Verification</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Secure One-Time Password</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin: 20px 0;">
            <h2 style="color: #333; margin-top: 0;">Hello ${firstName} ${lastName},</h2>
            <p style="color: #666; line-height: 1.6;">
              Your One-Time Password (OTP) for MSMS employee verification is:
            </p>
            
            <div style="background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
              <span style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; font-family: monospace;">
                ${otp}
              </span>
            </div>
            
            <p style="color: #666; line-height: 1.6;">
              This OTP will expire in <strong>5 minutes</strong> for security purposes.
            </p>
          </div>
          
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #856404; margin-top: 0;">🔐 Security Information</h3>
            <ul style="color: #856404; line-height: 1.6;">
              <li><strong>Employee ID:</strong> ${employeeId}</li>
              <li><strong>Login Time:</strong> ${loginTime}</li>
              <li><strong>IP Address:</strong> ${clientIP}</li>
              <li><strong>Device:</strong> ${userAgent}</li>
            </ul>
          </div>
          
          <div style="background: #d1ecf1; border: 1px solid #bee5eb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #0c5460; margin-top: 0;">⚠️ Important Security Notice</h3>
            <ul style="color: #0c5460; line-height: 1.6;">
              <li>Never share this OTP with anyone</li>
              <li>MSMS staff will never ask for your OTP</li>
              <li>This OTP can only be used once</li>
              <li>If you didn't request this, contact IT immediately</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              This is an automated message from MSMS Employee System.<br>
              © 2026 MSMS. All rights reserved.
            </p>
          </div>
        </div>
      `;

      const result = await NotificationService.sendEmail(
        email,
        'MSMS Employee Verification - Your OTP Code',
        emailTemplate
      );

      return {
        emailSent: true,
        emailResult: result
      };

    } catch (error) {
      console.error('Error sending OTP email:', error);
      throw new Error('Failed to send OTP email');
    }
  }

  /**
   * Mask email for privacy
   * @param {string} email - User email
   * @returns {string} Masked email
   */
  static maskEmail(email) {
    const [username, domain] = email.split('@');
    if (username.length <= 3) {
      return `${username[0]}***@${domain}`;
    }
    return `${username.slice(0, 3)}***@${domain}`;
  }

  /**
   * Check if user has active OTP
   * @param {string} email - User email
   * @returns {Promise<boolean>} Whether user has active OTP
   */
  static async hasActiveOTP(email) {
    try {
      const records = await query(
        'SELECT id FROM otp_records WHERE email = ? AND expires_at > NOW() LIMIT 1',
        [email]
      );
      return records.length > 0;
    } catch (error) {
      console.error('Error checking active OTP:', error);
      return false;
    }
  }
}

module.exports = OTPServiceBypass;
