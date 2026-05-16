const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const path = require('path');
const { query } = require('../../config/database');
const { auditLog } = require('../../middleware/audit');
const HrService = require('../hr/hr.service');


require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

class AuthService {
  static async forgotPassword(email, ip, userAgent) {
    try {
      if (!email) {
        throw new Error('Email address is required');
      }

      
      const user = await this.findByEmail(email);
      if (!user) {
        
        return {
          success: true,
          message: 'If an account with this email exists, password reset instructions have been sent.'
        };
      }

      
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000); 

      
      await query(`
        UPDATE users 
        SET reset_token = ?, reset_token_expiry = ? 
        WHERE id = ?
      `, [resetToken, resetTokenExpiry, user.id]);

      
      
      console.log(`Password reset token for ${email}: ${resetToken}`);
      console.log(`Reset link: http://localhost:3000/reset-password?token=${resetToken}`);

      
      await auditLog(user.id, 'PASSWORD_RESET_REQUEST', 'users', user.id, null, { email }, ip, userAgent);

      return {
        success: true,
        message: 'Password reset instructions have been sent to your email.'
      };

    } catch (error) {
      console.error('Forgot password error:', error);
      throw new Error('Failed to process password reset request');
    }
  }

  static async resetPassword(token, newPassword, ip, userAgent) {
    try {
      if (!token || !newPassword) {
        throw new Error('Reset token and new password are required');
      }

      if (newPassword.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      
      const users = await query(`
        SELECT id, email, reset_token_expiry 
        FROM users 
        WHERE reset_token = ? AND reset_token_expiry > NOW()
      `, [token]);

      if (users.length === 0) {
        throw new Error('Invalid or expired reset token');
      }

      const user = users[0];

      
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      
      await query(`
        UPDATE users 
        SET password_hash = ?, reset_token = NULL, reset_token_expiry = NULL, updated_at = NOW()
        WHERE id = ?
      `, [hashedPassword, user.id]);

      
      await auditLog(user.id, 'PASSWORD_RESET', 'users', user.id, null, { email: user.email }, ip, userAgent);

      return {
        success: true,
        message: 'Password has been reset successfully'
      };

    } catch (error) {
      console.error('Reset password error:', error);
      throw new Error(error.message || 'Failed to reset password');
    }
  }

  static async login(identifier, password, role, ip, userAgent) {
    try {
      console.log('Login attempt - identifier:', identifier);
      
      if (!identifier || !password) {
        throw new Error('Username/ID and password are required');
      }

      let user;
      
      
      if (identifier.includes('@')) {
        
        console.log('Attempting email-based login for:', identifier);
        user = await this.findByEmail(identifier);
        console.log('Email-based login, found user:', user ? `YES (role: ${user.role})` : 'NO');
        
        // Employees are now allowed to login with email
      } else {
        
        console.log('Attempting employee ID login for:', identifier);
        user = await this.findByEmployeeId(identifier.toUpperCase());
        console.log('Employee ID login, found user:', user ? `YES (role: ${user.role})` : 'NO');
        
        if (user && user.role === 'EMPLOYEE') {
          console.log('Employee ID login successful for:', identifier);
        } else if (user) {
          console.log('Staff ID login successful for:', identifier);
        }
      }
      
      if (!user || !user.is_active) {
        console.log('Login failed: User not found or not active');
        await auditLog(null, 'LOGIN_FAILED', 'users', null, null, { identifier }, ip, userAgent);
        throw new Error('Invalid credentials. Please check your username/ID and password.');
      }
      
      
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      
      if (!isValidPassword) {
        console.log('Login failed: Invalid password');
        await auditLog(user.id, 'LOGIN_FAILED', 'users', null, null, { identifier }, ip, userAgent);
        throw new Error('Invalid credentials. Please check your username/ID and password.');
      }
      
      console.log('Login successful for user:', user.id, 'role:', user.role);
      
      
      await query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);
      
      
      await auditLog(user.id, 'LOGIN_SUCCESS', 'users', null, null, { identifier }, ip, userAgent);
      
      const token = jwt.sign(
        { userId: user.id, employee_id: user.employee_id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );
      
      const refreshToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
      );

      return {
        user: {
          id: user.id,
          employee_id: user.employee_id,
          username: user.username,
          email: user.email,
          role: user.role,
          first_name: user.first_name,
          last_name: user.last_name,
          department: user.department,
          job_grade: user.job_grade,
          email_verified: user.email_verified || false,
          password_change_required: user.password_change_required || false,
          created_at: user.created_at
        },
        token,
        refreshToken
      };
    } catch (error) {
      throw error;
    }
  }

  static async refreshToken(refreshToken, ip, userAgent) {
    try {
      if (!refreshToken) {
        throw new Error('Refresh token is required');
      }

      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
      const user = await this.findById(decoded.userId);

      if (!user) {
        throw new Error('Invalid refresh token');
      }

      const newToken = jwt.sign(
        { userId: user.id, employee_id: user.employee_id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      await auditLog(user.id, 'TOKEN_REFRESH', 'users', user.id, null, null, ip, userAgent);

      return { token: newToken };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }



  static async getProfile(userId) {
    try {
      
      const user = await this.findById(userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      
      const employeeProfile = await query(`
        SELECT phone_number, address, department, job_title
        FROM employee_profiles 
        WHERE user_id = ?
      `, [userId]);

      const profile = employeeProfile.length > 0 ? employeeProfile[0] : {};

      return {
        id: user.id,
        employee_id: user.employee_id,
        username: user.username,
        email: user.email,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name,
        phone_number: profile.phone_number || '',
        address: profile.address || '',
        department: profile.department || user.department || '',
        job_title: profile.job_title || '',
        job_grade: user.job_grade,
        employment_status: user.employment_status,
        profile_picture: user.profile_picture || null,
        created_at: user.created_at,
        last_login: user.last_login
      };
    } catch (error) {
      throw error;
    }
  }


  static async findByEmployeeId(employee_id) {
    const selectQuery = `
      SELECT u.*, ep.first_name, ep.last_name, ep.department, ep.job_grade, ep.employment_status, ep.profile_picture
      FROM users u
      LEFT JOIN employee_profiles ep ON u.id = ep.user_id
      WHERE u.employee_id = ?
    `;
    const users = await query(selectQuery, [employee_id]);
    return users[0] || null;
  }

  static async findByEmail(email) {
    try {
      console.log('Finding user by email:', email);
      const selectQuery = `
        SELECT u.*, ep.first_name, ep.last_name, ep.department, ep.job_grade, ep.employment_status, ep.profile_picture
        FROM users u
        LEFT JOIN employee_profiles ep ON u.id = ep.user_id
        WHERE u.email = ?
      `;
      const users = await query(selectQuery, [email]);
      console.log('Query result:', users);
      return users[0] || null;
    } catch (error) {
      console.error('Database error in findByEmail:', error);
      throw error;
    }
  }

  static async findById(userId) {
    const selectQuery = `
      SELECT u.*, ep.first_name, ep.last_name, ep.department, ep.job_grade, ep.employment_status, ep.profile_picture
      FROM users u
      LEFT JOIN employee_profiles ep ON u.id = ep.user_id
      WHERE u.id = ?
    `;
    
    const users = await query(selectQuery, [userId]);
    return users[0] || null;
  }

  static async createUser(userData) {
    const { employee_id, username, email, password, role = 'EMPLOYEE' } = userData;
    
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const password_hash = await bcrypt.hash(password, saltRounds);
    
    const insertQuery = `
      INSERT INTO users (employee_id, username, email, password_hash, role)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    try {
      const result = await query(insertQuery, [employee_id, username, email, password_hash, role]);
      return result.insertId;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        if (error.message.includes('employee_id')) {
          throw new Error('Employee ID already exists');
        } else if (error.message.includes('username')) {
          throw new Error('Username already exists');
        } else if (error.message.includes('email')) {
          throw new Error('Email already exists');
        }
      }
      throw error;
    }
  }

  static async updateLastLogin(userId) {
    const updateQuery = `UPDATE users SET last_login = NOW() WHERE id = ?`;
    await query(updateQuery, [userId]);
  }

  static async updateUserPassword(userId, newPassword) {
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const password_hash = await bcrypt.hash(newPassword, saltRounds);
    
    const updateQuery = `UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?`;
    await query(updateQuery, [password_hash, userId]);
  }

  static async createEmployeeProfile(userId, profileData) {
    const {
      employee_id,
      first_name,
      last_name,
      department,
      job_grade,
      employment_status,
      hire_date,
      phone,
      address = null,
      hr_verified = false,
      hr_verification_date = null
    } = profileData;
    
    const insertQuery = `
      INSERT INTO employee_profiles (
        user_id, employee_id, first_name, last_name, department, 
        job_grade, employment_status, hire_date, phone, address, 
        hr_verified, hr_verification_date
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    try {
      const result = await query(insertQuery, [
        userId, employee_id, first_name, last_name, department,
        job_grade, employment_status, hire_date, phone, address,
        hr_verified, hr_verification_date
      ]);
      return result.insertId;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Employee profile already exists');
      }
      throw error;
    }
  }

  static async updateProfile(userId, profileData, ip, userAgent) {
    try {
      const { first_name, last_name, phone_number, address } = profileData;
      
      await query(`
        UPDATE users 
        SET first_name = ?, last_name = ?, updated_at = NOW()
        WHERE id = ?
      `, [first_name, last_name, userId]);
      
      const profiles = await query('SELECT user_id FROM employee_profiles WHERE user_id = ?', [userId]);
      
      if (profiles.length > 0) {
        await query(`
          UPDATE employee_profiles 
          SET first_name = ?, last_name = ?, phone = ?, address = ?, updated_at = NOW()
          WHERE user_id = ?
        `, [first_name, last_name, phone_number || null, address || null, userId]);
      } else {
        
        await query(`
          INSERT INTO employee_profiles (user_id, first_name, last_name, phone, address)
          VALUES (?, ?, ?, ?, ?)
        `, [userId, first_name, last_name, phone_number || null, address || null]);
      }

      
      await auditLog(userId, 'PROFILE_UPDATED', 'users', userId, null, { 
        updated_fields: Object.keys(profileData) 
      }, ip, userAgent);

      return {
        success: true,
        message: 'Profile updated successfully'
      };
    } catch (error) {
      console.error('Update profile service error:', error);
      throw error;
    }
  }

  static async updateProfilePicture(userId, profilePicturePath, ip, userAgent) {
    try {
      await query(`
        UPDATE employee_profiles 
        SET profile_picture = ?, updated_at = NOW()
        WHERE user_id = ?
      `, [profilePicturePath, userId]);

      await auditLog(userId, 'PROFILE_PICTURE_UPDATED', 'employee_profiles', userId, null, { 
        profile_picture: profilePicturePath 
      }, ip, userAgent);

      return {
        success: true,
        message: 'Profile picture updated successfully'
      };
    } catch (error) {
      console.error('Update profile picture service error:', error);
      throw error;
    }
  }

  static async changePassword(userId, currentPassword, newPassword, ip, userAgent) {
    try {
      if (!currentPassword || !newPassword) {
        throw new Error('Current password and new password are required');
      }

      if (newPassword.length < 8) {
        throw new Error('New password must be at least 8 characters long');
      }

      
      const users = await query(`
        SELECT id, password_hash, password_change_required
        FROM users 
        WHERE id = ? AND is_active = TRUE
      `, [userId]);

      if (users.length === 0) {
        throw new Error('User not found');
      }

      const user = users[0];

      
      const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isValidPassword) {
        throw new Error('Current password is incorrect');
      }

      
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

      
      await query(`
        UPDATE users 
        SET password_hash = ?, password_change_required = FALSE, updated_at = NOW()
        WHERE id = ?
      `, [newPasswordHash, userId]);

      return {
        success: true,
        message: 'Password changed successfully'
      };

    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  }

  static async forceChangePassword(userId, newPassword, ip, userAgent) {
    try {
      if (!newPassword) {
        throw new Error('New password is required');
      }

      if (newPassword.length < 8) {
        throw new Error('New password must be at least 8 characters long');
      }

      
      const users = await query(`
        SELECT id, password_change_required
        FROM users 
        WHERE id = ? AND is_active = TRUE
      `, [userId]);

      if (users.length === 0) {
        throw new Error('User not found');
      }

      
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

      
      await query(`
        UPDATE users 
        SET password_hash = ?, password_change_required = FALSE, updated_at = NOW()
        WHERE id = ?
      `, [newPasswordHash, userId]);

      
      await auditLog(userId, 'PASSWORD_CHANGED', 'users', userId, null, { 
        password_change_required: false,
        forced_change: true
      }, ip, userAgent);

      
      console.log('Password force changed successfully (notifications disabled)');

      return {
        success: true,
        message: 'Password changed successfully'
      };

    } catch (error) {
      console.error('Force change password error:', error);
      throw error;
    }
  }

  static async requestOTP(userId, ip, userAgent) {
    try {
      const user = await this.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (user.role !== 'EMPLOYEE') {
        throw new Error('Verification is only required for employees');
      }

      // Generate 6-digit OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 1 * 60 * 1000); // 1 minute expiry (60 seconds)

      // Save to database
      await query(`
        INSERT INTO otp_verifications (user_id, otp_code, expires_at)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE otp_code = VALUES(otp_code), expires_at = VALUES(expires_at)
      `, [userId, otpCode, expiresAt]);

      // Send email
      const NotificationService = require('../../services/notification.service');
      const subject = 'Your MSMS Verification Code';
      const message = `
        <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #2563eb; text-align: center;">Email Verification</h2>
          <p>Dear ${user.first_name},</p>
          <p>Please use the following 6-digit verification code to verify your MSMS account:</p>
          <div style="background: #f8fafc; padding: 15px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e293b; border-radius: 8px; margin: 20px 0;">
            ${otpCode}
          </div>
          <p>This code will expire in 60 seconds.</p>
          <p>If you did not request this code, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #64748b; text-align: center;">MSMS Team</p>
        </div>
      `;

      await NotificationService.sendEmail(user.email, subject, message);
      await auditLog(userId, 'OTP_REQUESTED', 'users', userId, null, { email: user.email }, ip, userAgent);

      return { success: true, message: 'Verification code sent to your email' };
    } catch (error) {
      console.error('Request OTP error:', error);
      throw error;
    }
  }

  static async verifyOTP(userId, otpCode, ip, userAgent) {
    try {
      const [otpRecord] = await query(`
        SELECT * FROM otp_verifications 
        WHERE user_id = ? AND otp_code = ?
        ORDER BY created_at DESC LIMIT 1
      `, [userId, otpCode]);

      if (!otpRecord) {
        throw new Error('Invalid verification code');
      }

      const now = new Date();
      if (new Date(otpRecord.expires_at) < now) {
        throw new Error('Verification code has expired. Please request a new one.');
      }

      // Mark as verified
      await query('UPDATE users SET email_verified = TRUE, updated_at = NOW() WHERE id = ?', [userId]);
      
      // Delete OTP records for this user
      await query('DELETE FROM otp_verifications WHERE user_id = ?', [userId]);

      await auditLog(userId, 'EMAIL_VERIFIED', 'users', userId, null, null, ip, userAgent);

      return { success: true, message: 'Email verified successfully' };
    } catch (error) {
      console.error('Verify OTP error:', error);
      throw error;
    }
  }
}

module.exports = AuthService;
