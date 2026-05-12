const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const path = require('path');
const { query, pool } = require('../../config/database');
const { auditLog } = require('../../middleware/audit');
const HrService = require('../hr/hr.service');


require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

class AuthService {
  static async getSecurityConfig() {
    try {
      const [configs] = await pool.execute(
        'SELECT config_key, config_value, config_type FROM system_configuration WHERE is_active = TRUE'
      );

      const configMap = {};
      configs.forEach(row => {
        let value = row.config_value;
        if (row.config_type === 'BOOLEAN') value = value === 'true';
        else if (row.config_type === 'NUMBER') value = parseFloat(value);
        configMap[row.config_key] = value;
      });

      // Merge with defaults for any missing keys
      const defaults = {
        session_timeout_minutes: 30,
        password_min_length: 8,
        password_expiry_days: 90,
        max_login_attempts: 5,
        lockout_duration_minutes: 15
      };

      Object.keys(defaults).forEach(key => {
        if (!(key in configMap)) {
          configMap[key] = defaults[key];
        }
      });

      return configMap;
    } catch (error) {
      console.error('Error fetching security config:', error);
      // Return defaults on error
      return {
        session_timeout_minutes: 30,
        password_min_length: 8,
        password_expiry_days: 90,
        max_login_attempts: 5,
        lockout_duration_minutes: 15
      };
    }
  }
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
        SET password = ?, reset_token = NULL, reset_token_expiry = NULL, updated_at = NOW()
        WHERE id = ?
      `, [hashedPassword, user.id]);

      
      await auditLog(user.id, 'PASSWORD_RESET', 'users', user.id, null, { email: user.email }, ip, userAgent);

      return {
        success: true,
        message: 'Password has been reset successfully'
      };

    } catch (err) {
      console.error('Reset password error details:', {
        message: err.message,
        stack: err.stack,
        code: err.code,
        errno: err.errno
      });
      throw new Error(err.message || 'Failed to reset password');
    }
  }

  static async login(identifier, password, ip, userAgent) {
    try {
      console.log('Login attempt - identifier:', identifier);
      
      if (!identifier || !password) {
        throw new Error('Email and password are required');
      }

      // Fetch security configuration
      const securityConfig = await this.getSecurityConfig();
      console.log('Security config loaded:', securityConfig);

      let user;
      
      
      if (identifier.includes('@')) {
        
        console.log('Attempting email-based login for:', identifier);
        user = await this.findByEmail(identifier);
        console.log('Email-based login, found user:', user ? `YES (role: ${user.role})` : 'NO');
        
        // Allow all roles to use email login
        if (user && ['ADMIN', 'SUPER_ADMIN', 'HR', 'FINANCE_ADMIN', 'LOAN_COMMITTEE', 'EMPLOYEE'].includes(user.role)) {
          console.log('Email login successful for role:', user.role);
        }
        
        if (user && ['ADMIN', 'SUPER_ADMIN', 'HR', 'FINANCE_ADMIN', 'LOAN_COMMITTEE'].includes(user.role)) {
          
          console.log('Admin/Staff login successful with email');
        }
      } else {
        
        console.log('Attempting employee ID login for:', identifier);
        user = await this.findByEmployeeId(identifier.toUpperCase());
        console.log('Employee ID login, found user:', user ? `YES (role: ${user.role})` : 'NO');
        
        // Allow all users to choose between email or employee ID
        if (user) {
          console.log('Employee ID login successful for role:', user.role);
        }
      }
      
      if (!user || !user.is_active) {
        console.log('Login failed: User not found or not active');
        await auditLog(null, 'LOGIN_FAILED', 'users', null, null, { identifier }, ip, userAgent);
        throw new Error('Invalid credentials. Please check your email and password.');
      }

      // Check if user is locked out due to too many failed attempts
      if (user.failed_login_attempts >= securityConfig.max_login_attempts) {
        const lockoutTime = new Date(user.last_failed_login);
        const lockoutDuration = securityConfig.lockout_duration_minutes * 60 * 1000;
        const timeSinceLockout = Date.now() - lockoutTime.getTime();
        
        if (timeSinceLockout < lockoutDuration) {
          const remainingMinutes = Math.ceil((lockoutDuration - timeSinceLockout) / 60000);
          throw new Error(`Account locked due to too many failed login attempts. Try again in ${remainingMinutes} minutes.`);
        } else {
          // Reset failed attempts if lockout period has passed
          await query('UPDATE users SET failed_login_attempts = 0, last_failed_login = NULL WHERE id = ?', [user.id]);
        }
      }
      
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      
      if (!isValidPassword) {
        console.log('Login failed: Invalid password');
        
        // Increment failed login attempts
        const newAttempts = (user.failed_login_attempts || 0) + 1;
        await query(
          'UPDATE users SET failed_login_attempts = ?, last_failed_login = NOW() WHERE id = ?',
          [newAttempts, user.id]
        );
        
        await auditLog(user.id, 'LOGIN_FAILED', 'users', null, null, { identifier, attempts: newAttempts }, ip, userAgent);
        
        if (newAttempts >= securityConfig.max_login_attempts) {
          throw new Error(`Account locked due to too many failed login attempts. Try again in ${securityConfig.lockout_duration_minutes} minutes.`);
        }
        
        const remainingAttempts = securityConfig.max_login_attempts - newAttempts;
        throw new Error(`Invalid credentials. ${remainingAttempts} attempts remaining before account lockout.`);
      }
      
      console.log('Login successful for user:', user.id, 'role:', user.role);
      console.log('Full user object from database:', user);
      console.log('User object keys:', Object.keys(user));
      console.log('Email verification fields from DB:', {
        email_verified: user.email_verified,
        is_first_login: user.is_first_login,
        type_of_email_verified: typeof user.email_verified,
        type_of_is_first_login: typeof user.is_first_login
      });
      
      // Reset failed login attempts on successful login
      await query('UPDATE users SET failed_login_attempts = 0, last_failed_login = NULL, last_login = NOW() WHERE id = ?', [user.id]);
      
      // Check password expiry
      if (user.password_changed_at) {
        const passwordAge = Date.now() - new Date(user.password_changed_at).getTime();
        const passwordExpiryDays = securityConfig.password_expiry_days;
        const passwordExpiryMs = passwordExpiryDays * 24 * 60 * 60 * 1000;
        
        if (passwordAge > passwordExpiryMs) {
          await auditLog(user.id, 'PASSWORD_EXPIRED', 'users', null, null, { identifier }, ip, userAgent);
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
              password_change_required: true,
              email_verified: user.email_verified,
              created_at: user.created_at
            },
            token: null,
            refreshToken: null,
            passwordExpired: true,
            message: 'Your password has expired. Please change your password to continue.'
          };
        }
      }
      
      await auditLog(user.id, 'LOGIN_SUCCESS', 'users', null, null, { identifier }, ip, userAgent);
      
      // Use configured session timeout for JWT token expiration
      const sessionTimeoutMinutes = securityConfig.session_timeout_minutes;
      const token = jwt.sign(
        { userId: user.id, employee_id: user.employee_id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: `${sessionTimeoutMinutes}m` }
      );
      
      const refreshToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
      );

      // Check if OTP verification is required for unverified employees only
      const requiresOTPVerification = user.role === 'EMPLOYEE' && !user.email_verified;
      
      console.log('[auth] OTP verification check:', {
        userRole: user.role,
        emailVerified: user.email_verified,
        requiresOTPVerification,
        userId: user.id,
        email: user.email
      });

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
          password_change_required: user.password_change_required || false,
          requires_otp_verification: requiresOTPVerification,
          email_verified: user.email_verified,
          created_at: user.created_at
        },
        token: requiresOTPVerification ? null : token, // Don't provide token until OTP verified
        refreshToken: requiresOTPVerification ? null : refreshToken
      };
    } catch (err) {
      console.error('Login error details:', {
        message: err.message,
        stack: err.stack,
        code: err.code,
        errno: err.errno
      });
      throw new Error(err.message || 'Login failed');
    }
  }

  static async completeEmailVerification(userId, ip, userAgent) {
    try {
      // Get user details
      const user = await query('SELECT * FROM users WHERE id = ? AND is_active = 1', [userId]);
      
      if (!user || user.length === 0) {
        throw new Error('User not found');
      }

      const userData = user[0];

      // Mark first login as completed
      await query(
        'UPDATE users SET is_first_login = FALSE, updated_at = NOW() WHERE id = ?',
        [userId]
      );

      // Fetch security configuration
      const securityConfig = await this.getSecurityConfig();

      // Generate tokens
      const sessionTimeoutMinutes = securityConfig.session_timeout_minutes;
      const token = jwt.sign(
        { userId: userData.id, employee_id: userData.employee_id, role: userData.role },
        process.env.JWT_SECRET,
        { expiresIn: `${sessionTimeoutMinutes}m` }
      );
      
      const refreshToken = jwt.sign(
        { userId: userData.id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
      );

      // Log successful login completion
      await auditLog(userId, 'LOGIN_COMPLETED', 'users', userId, null, { email: userData.email }, ip, userAgent);

      return {
        user: {
          id: userData.id,
          employee_id: userData.employee_id,
          username: userData.username,
          email: userData.email,
          role: userData.role,
          first_name: userData.first_name,
          last_name: userData.last_name,
          department: userData.department,
          job_grade: userData.job_grade,
          password_change_required: userData.password_change_required || false,
          requires_email_verification: false,
          is_first_login: false,
          email_verified: true
        },
        token,
        refreshToken
      };

    } catch (error) {
      console.error('Complete email verification error:', error);
      throw error;
    }
  }

  static async completeOTPVerification(userId, ip, userAgent) {
    try {
      // Get user details
      const user = await query('SELECT * FROM users WHERE id = ? AND is_active = 1', [userId]);
      
      if (!user || user.length === 0) {
        throw new Error('User not found');
      }

      const userData = user[0];

      // Mark user as email verified after successful OTP verification
      await query(
        'UPDATE users SET email_verified = TRUE, updated_at = NOW() WHERE id = ?',
        [userId]
      );

      console.log('[auth] User marked as email verified:', { userId, email: userData.email });

      // Fetch security configuration
      const securityConfig = await this.getSecurityConfig();

      // Generate tokens
      const sessionTimeoutMinutes = securityConfig.session_timeout_minutes;
      const token = jwt.sign(
        { userId: userData.id, employee_id: userData.employee_id, role: userData.role },
        process.env.JWT_SECRET,
        { expiresIn: `${sessionTimeoutMinutes}m` }
      );
      
      const refreshToken = jwt.sign(
        { userId: userData.id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
      );

      // Log successful login completion and email verification
      await auditLog(userId, 'LOGIN_COMPLETED', 'users', userId, null, { 
        email: userData.email, 
        email_verified: true 
      }, ip, userAgent);

      await auditLog(userId, 'EMAIL_VERIFIED', 'users', userId, null, { 
        email: userData.email 
      }, ip, userAgent);

      return {
        success: true,
        message: 'OTP verification completed successfully',
        user: {
          id: userData.id,
          employee_id: userData.employee_id,
          username: userData.username,
          email: userData.email,
          role: userData.role,
          first_name: userData.first_name,
          last_name: userData.last_name,
          department: userData.department,
          job_grade: userData.job_grade,
          password_change_required: userData.password_change_required || false,
          email_verified: true, // Include in response for frontend
          created_at: userData.created_at
        },
        token,
        refreshToken
      };
    } catch (error) {
      console.error('Complete OTP verification error:', error);
      throw new Error('Failed to complete OTP verification');
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
        SELECT phone_number, address, department, job_title, profile_picture
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
        profile_picture: profile.profile_picture || null,
        employment_status: user.employment_status,
        created_at: user.created_at,
        last_login: user.last_login
      };
    } catch (error) {
      throw error;
    }
  }



  
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
    try {
      console.log('Finding user by email:', email);
      const selectQuery = `
        SELECT u.*, ep.first_name, ep.last_name, ep.department, ep.job_grade, ep.employment_status
        FROM users u
        LEFT JOIN employee_profiles ep ON u.id = ep.user_id
        WHERE u.email = ?
      `;
      const users = await query(selectQuery, [email]);
      console.log('Query result:', users);
      if (users[0]) {
        console.log('User fields from DB:', Object.keys(users[0]));
        console.log('Email verification fields:', {
          is_first_login: users[0].is_first_login,
          email_verified: users[0].email_verified,
          role: users[0].role
        });
      }
      return users[0] || null;
    } catch (error) {
      console.error('Database error in findByEmail:', error);
      throw error;
    }
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
      phone_number,
      address,
      profile_picture
    } = profileData;

    try {
      
      await query(`
        UPDATE users 
        SET first_name = ?, last_name = ?, updated_at = NOW()
        WHERE id = ?
      `, [first_name, last_name, userId]);

      
      
      const profiles = await query('SELECT user_id FROM employee_profiles WHERE user_id = ?', [userId]);
      
      if (profiles.length > 0) {
        await query(`
          UPDATE employee_profiles 
          SET first_name = ?, last_name = ?, phone_number = ?, address = ?, profile_picture = ?, updated_at = NOW()
          WHERE user_id = ?
        `, [first_name, last_name, phone_number, address || null, profile_picture || null, userId]);
      } else {
        
        await query(`
          INSERT INTO employee_profiles (user_id, first_name, last_name, phone_number, address, profile_picture)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [userId, first_name, last_name, phone_number, address || null, profile_picture || null]);
      }

      
      await auditLog(userId, 'PROFILE_UPDATED', 'users', userId, null, { 
        updated_fields: Object.keys(profileData) 
      }, ip, userAgent);

      
      const updatedUserData = await this.getProfile(userId);

      return {
        success: true,
        message: 'Profile updated successfully',
        data: updatedUserData
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

      // Fetch security configuration for password validation
      const securityConfig = await this.getSecurityConfig();
      
      // Validate password against security configuration
      if (newPassword.length < securityConfig.password_min_length) {
        throw new Error(`New password must be at least ${securityConfig.password_min_length} characters long`);
      }

      // Validate password contains at least one letter, one number, and one special character
      const hasLetter = /[a-zA-Z]/.test(newPassword);
      const hasNumber = /[0-9]/.test(newPassword);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

      if (!hasLetter) {
        throw new Error('Password must contain at least one letter');
      }

      if (!hasNumber) {
        throw new Error('Password must contain at least one number');
      }

      if (!hasSpecialChar) {
        throw new Error('Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)');
      }

      
      const users = await query(`
        SELECT id, password_hash, password_change_required, email
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
        SET password_hash = ?, password_change_required = FALSE, password_changed_at = NOW(), updated_at = NOW()
        WHERE id = ?
      `, [newPasswordHash, userId]);

      // Log the password change
      await auditLog(userId, 'PASSWORD_CHANGED', 'users', userId, null, { email: user.email }, ip, userAgent);

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
}

module.exports = AuthService;
