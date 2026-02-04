const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query, transaction } = require('../config/database');

class User {
  static async create(userData) {
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
  
  static async findByEmployeeId(employeeId) {
    const selectQuery = `
      SELECT u.*, ep.first_name, ep.last_name, ep.department, ep.job_grade, ep.employment_status
      FROM users u
      LEFT JOIN employee_profiles ep ON u.id = ep.user_id
      WHERE u.employee_id = ?
    `;
    
    const users = await query(selectQuery, [employeeId]);
    return users[0] || null;
  }
  
  static async findByUsername(username) {
    const selectQuery = `
      SELECT u.*, ep.first_name, ep.last_name, ep.department, ep.job_grade
      FROM users u
      LEFT JOIN employee_profiles ep ON u.id = ep.user_id
      WHERE u.username = ?
    `;
    
    const users = await query(selectQuery, [username]);
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
  
  static async authenticate(employeeId, password) {
    const user = await this.findByEmployeeId(employeeId);
    
    if (!user || !user.is_active) {
      return null;
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return null;
    }
    
    await this.updateLastLogin(user.id);
    
    const token = jwt.sign(
      { userId: user.id, employeeId: user.employee_id, role: user.role },
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
        job_grade: user.job_grade
      },
      token,
      refreshToken
    };
  }
  
  static async updateLastLogin(userId) {
    const updateQuery = `UPDATE users SET last_login = NOW() WHERE id = ?`;
    await query(updateQuery, [userId]);
  }
  
  static async updatePassword(userId, newPassword) {
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const password_hash = await bcrypt.hash(newPassword, saltRounds);
    
    const updateQuery = `UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?`;
    await query(updateQuery, [password_hash, userId]);
  }
  
  static async updateProfile(userId, profileData) {
    const { first_name, last_name, phone, address } = profileData;
    
    const updateQuery = `
      UPDATE employee_profiles 
      SET first_name = ?, last_name = ?, phone = ?, address = ?, updated_at = NOW()
      WHERE user_id = ?
    `;
    
    await query(updateQuery, [first_name, last_name, phone, address, userId]);
  }
  
  static async getAllUsers(page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;
    let whereClause = 'WHERE u.is_active = true';
    const params = [];
    
    if (filters.role) {
      whereClause += ' AND u.role = ?';
      params.push(filters.role);
    }
    
    if (filters.department) {
      whereClause += ' AND ep.department = ?';
      params.push(filters.department);
    }
    
    const countQuery = `
      SELECT COUNT(*) as total
      FROM users u
      LEFT JOIN employee_profiles ep ON u.id = ep.user_id
      ${whereClause}
    `;
    
    const selectQuery = `
      SELECT u.id, u.employee_id, u.username, u.email, u.role, u.is_active, u.created_at, u.last_login,
             ep.first_name, ep.last_name, ep.department, ep.job_grade, ep.employment_status
      FROM users u
      LEFT JOIN employee_profiles ep ON u.id = ep.user_id
      ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const [countResult, users] = await Promise.all([
      query(countQuery, params),
      query(selectQuery, [...params, limit, offset])
    ]);
    
    return {
      users,
      pagination: {
        page,
        limit,
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit)
      }
    };
  }
  
  static async deactivateUser(userId) {
    const updateQuery = `UPDATE users SET is_active = false, updated_at = NOW() WHERE id = ?`;
    await query(updateQuery, [userId]);
  }
}

module.exports = User;
