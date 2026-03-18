const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const path = require('path');
const { query } = require('../../config/database');
const { auditLog } = require('../../middleware/audit');
const HrService = require('../hr/hr.service');

// Load environment variables from project root
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

class AuthService {
  static async forgotPassword(email, ip, userAgent) {
    try {
      if (!email) {
        throw new Error('Email address is required');
      }

      // Find user by email
      const user = await this.findByEmail(email);
      if (!user) {
        // Don't reveal if email exists or not for security
        return {
          success: true,
          message: 'If an account with this email exists, password reset instructions have been sent.'
        };
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Store reset token in database
      await query(`
        UPDATE users 
        SET reset_token = ?, reset_token_expiry = ? 
        WHERE id = ?
      `, [resetToken, resetTokenExpiry, user.id]);

      // TODO: Send email with reset token
      // For now, just log it (in production, use email service)
      console.log(`Password reset token for ${email}: ${resetToken}`);
      console.log(`Reset link: http://localhost:3000/reset-password?token=${resetToken}`);

      // Log the password reset request
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

      // Find user by reset token
      const users = await query(`
        SELECT id, email, reset_token_expiry 
        FROM users 
        WHERE reset_token = ? AND reset_token_expiry > NOW()
      `, [token]);

      if (users.length === 0) {
        throw new Error('Invalid or expired reset token');
      }

      const user = users[0];

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password and clear reset token
      await query(`
        UPDATE users 
        SET password = ?, reset_token = NULL, reset_token_expiry = NULL, updated_at = NOW()
        WHERE id = ?
      `, [hashedPassword, user.id]);

      // Log the password reset
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
      
      // Auto-detect login mode: email => admin/staff, employee_id => employee
      if (identifier.includes('@')) {
        // Email login: HR, ADMIN, FINANCE_ADMIN, LOAN_COMMITTEE
        user = await this.findByEmail(identifier);
        console.log('Email-based login, found user:', user ? `YES (role: ${user.role})` : 'NO');
        
        if (user && user.role === 'EMPLOYEE') {
          throw new Error('Employees must log in with their Employee ID, not email');
        }
      } else {
        // Employee ID login
        user = await this.findByEmployeeId(identifier.toUpperCase());
        console.log('Employee ID login, found user:', user ? `YES (role: ${user.role})` : 'NO');
        
        if (user && user.role !== 'EMPLOYEE') {
          throw new Error('Staff and administrators must log in with their email address');
        }
      }
      
      if (!user || !user.is_active) {
        console.log('Login failed: User not found or not active');
        await auditLog(null, 'LOGIN_FAILED', 'users', null, null, { identifier }, ip, userAgent);
        throw new Error('Invalid credentials. Please check your username/ID and password.');
      }

      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      console.log('Password valid:', isValidPassword);
      
      if (!isValidPassword) {
        console.log('Login failed: Invalid password');
        await auditLog(null, 'LOGIN_FAILED', 'users', null, null, { identifier }, ip, userAgent);
        throw new Error('Invalid credentials. Please check your username/ID and password.');
      }

      await this.updateLastLogin(user.id);
      
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

      await auditLog(user.id, 'LOGIN_SUCCESS', 'users', user.id, null, null, ip, userAgent);

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
          password_change_required: user.password_change_required || false
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

      return {
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
      };
    } catch (error) {
      throw error;
    }
  }

  static async updateProfile(userId, profileData, ip, userAgent) {
    try {
      const { first_name, last_name, phone, address } = profileData;
      
      await this.updateUserProfile(userId, {
        first_name,
        last_name,
        phone,
        address
      });

      await auditLog(userId, 'PROFILE_UPDATE', 'employee_profiles', userId, null, { first_name, last_name, phone, address }, ip, userAgent);

      return { message: 'Profile updated successfully' };
    } catch (error) {
      throw error;
    }
  }

  // Helper methods
  static async findByEmployeeId(employee_id) {
    const selectQuery = `
      SELECT u.*, ep.first_name, ep.last_name, ep.department, ep.job_grade, ep.employment_status
      FROM users u
      LEFT JOIN employee_profiles ep ON u.id = ep.user_id
      WHERE u.employee_id = ?
    `;
    const users = await query(selectQuery, [employee_id]);
    return users[0] || null;
  }

  static async findByEmail(email) {
    const selectQuery = `
      SELECT u.*, ep.first_name, ep.last_name, ep.department, ep.job_grade, ep.employment_status
      FROM users u
      LEFT JOIN employee_profiles ep ON u.id = ep.user_id
      WHERE u.email = ?
    `;
    const users = await query(selectQuery, [email]);
    return users[0] || null;
  }

  static async findById(userId) {
    const selectQuery = `
      SELECT u.*, ep.first_name, ep.last_name, ep.department, ep.job_grade, ep.employment_status
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
    const { 
      first_name, 
      last_name, 
      email, 
      phone_number, 
      role 
    } = profileData;

    try {
      // 1. Update the users table (email, role, names)
      await query(`
        UPDATE users 
        SET first_name = ?, last_name = ?, email = ?, role = ?, updated_at = NOW()
        WHERE id = ?
      `, [first_name, last_name, email, role, userId]);

      // 2. Update the employee_profiles table (phone, names)
      // Check if profile exists first
      const profiles = await query('SELECT user_id FROM employee_profiles WHERE user_id = ?', [userId]);
      
      if (profiles.length > 0) {
        await query(`
          UPDATE employee_profiles 
          SET first_name = ?, last_name = ?, phone = ?, updated_at = NOW()
          WHERE user_id = ?
        `, [first_name, last_name, phone_number, userId]);
      } else {
        // If profile doesn't exist, create it (should not happen if user is an employee)
        await query(`
          INSERT INTO employee_profiles (user_id, first_name, last_name, phone)
          VALUES (?, ?, ?, ?)
        `, [userId, first_name, last_name, phone_number]);
      }

      // 3. Log the change
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

  static async changePassword(userId, currentPassword, newPassword, ip, userAgent) {
    try {
      if (!currentPassword || !newPassword) {
        throw new Error('Current password and new password are required');
      }

      if (newPassword.length < 8) {
        throw new Error('New password must be at least 8 characters long');
      }

      // Get user with current password
      const users = await query(`
        SELECT id, password_hash, password_change_required
        FROM users 
        WHERE id = ? AND is_active = TRUE
      `, [userId]);

      if (users.length === 0) {
        throw new Error('User not found');
      }

      const user = users[0];

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isValidPassword) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

      // Update password and remove password change requirement
      await query(`
        UPDATE users 
        SET password_hash = ?, password_change_required = FALSE, updated_at = NOW()
        WHERE id = ?
      `, [newPasswordHash, userId]);

      // Log the password change
      await auditLog(userId, 'PASSWORD_CHANGED', 'users', userId, null, { 
        password_change_required: false 
      }, ip, userAgent);

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

      // Get user
      const users = await query(`
        SELECT id, password_change_required
        FROM users 
        WHERE id = ? AND is_active = TRUE
      `, [userId]);

      if (users.length === 0) {
        throw new Error('User not found');
      }

      // Hash new password
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

      // Update password and remove password change requirement
      await query(`
        UPDATE users 
        SET password_hash = ?, password_change_required = FALSE, updated_at = NOW()
        WHERE id = ?
      `, [newPasswordHash, userId]);

      // Log the password change
      await auditLog(userId, 'PASSWORD_CHANGED', 'users', userId, null, { 
        password_change_required: false,
        forced_change: true
      }, ip, userAgent);

      return {
        success: true,
        message: 'Password changed successfully'
      };

    } catch (error) {
      console.error('Force change password error:', error);
      throw error;
    }
  }
}

module.exports = AuthService;
