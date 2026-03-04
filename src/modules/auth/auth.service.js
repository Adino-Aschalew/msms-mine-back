const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const { query } = require('../../config/database');
const { auditLog } = require('../../middleware/audit');

// Load environment variables from project root
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

class AuthService {
  static async login(employee_id, password, ip, userAgent) {
    try {
      console.log('Login attempt for employee_id:', employee_id);
      
      if (!employee_id || !password) {
        throw new Error('Employee ID and password are required');
      }

      const user = await this.findByEmployeeId(employee_id);
      console.log('Found user:', user ? 'YES' : 'NO');
      console.log('User is_active:', user?.is_active);
      
      if (!user || !user.is_active) {
        console.log('Login failed: User not found or not active');
        await auditLog(null, 'LOGIN_FAILED', 'users', null, null, { employee_id: employee_id }, ip, userAgent);
        throw new Error('Invalid credentials');
      }

      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      console.log('Password valid:', isValidPassword);
      
      if (!isValidPassword) {
        console.log('Login failed: Invalid password');
        await auditLog(null, 'LOGIN_FAILED', 'users', null, null, { employee_id: employee_id }, ip, userAgent);
        throw new Error('Invalid credentials');
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
          job_grade: user.job_grade
        },
        token,
        refreshToken
      };
    } catch (error) {
      throw error;
    }
  }

  static async register(userData, ip, userAgent) {
    try {
      const { employee_id, username, email, password, confirm_password } = userData;
      
      if (!employee_id || !username || !email || !password || !confirm_password) {
        throw new Error('All fields are required');
      }
      
      if (password !== confirm_password) {
        throw new Error('Passwords do not match');
      }
      
      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      const userId = await this.createUser({
        employee_id,
        username,
        email,
        password
      });

      await auditLog(userId, 'USER_REGISTER', 'users', userId, null, { employee_id, username, email }, ip, userAgent);
      
      return { userId };
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

  static async changePassword(userId, passwordData, ip, userAgent) {
    try {
      const { current_password, new_password, confirm_password } = passwordData;
      
      if (!current_password || !new_password || !confirm_password) {
        throw new Error('All password fields are required');
      }
      
      if (new_password !== confirm_password) {
        throw new Error('New passwords do not match');
      }
      
      if (new_password.length < 8) {
        throw new Error('New password must be at least 8 characters long');
      }

      const user = await this.findById(userId);
      const isValidPassword = await bcrypt.compare(current_password, user.password_hash);

      if (!isValidPassword) {
        throw new Error('Current password is incorrect');
      }

      await this.updateUserPassword(userId, new_password);
      await auditLog(userId, 'PASSWORD_CHANGE', 'users', userId, null, null, ip, userAgent);

      return { message: 'Password changed successfully' };
    } catch (error) {
      throw error;
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

  static async findById(userId) {
    const selectQuery = `
      SELECT u.*, ep.first_name, ep.last_name, ep.department, ep.job_grade, ep.employment_status
      FROM users u
      LEFT JOIN employee_profiles ep ON u.id = ep.user_id
      WHERE u.id = ? AND u.is_active = true
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

  static async updateUserProfile(userId, profileData) {
    const { first_name, last_name, phone, address } = profileData;
    
    const updateQuery = `
      UPDATE employee_profiles 
      SET first_name = ?, last_name = ?, phone = ?, address = ?, updated_at = NOW()
      WHERE user_id = ?
    `;
    
    await query(updateQuery, [first_name, last_name, phone, address, userId]);
  }
}

module.exports = AuthService;
