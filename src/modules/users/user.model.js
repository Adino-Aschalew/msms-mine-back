const { query, transaction, getConnection } = require('../../config/database');

class UserModel {
  static async create(userData) {
    const { employee_id, username, email, password_hash, role = 'EMPLOYEE' } = userData;
    
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

  static async createWithProfile(userData, profileData) {
    return await transaction(async (connection) => {
      
      const { employee_id, username, email, password_hash, role = 'EMPLOYEE' } = userData;
      const insertUserQuery = `
        INSERT INTO users (employee_id, username, email, password_hash, role)
        VALUES (?, ?, ?, ?, ?)
      `;
      
      const [userResult] = await connection.execute(insertUserQuery, [employee_id, username, email, password_hash, role]);
      const userId = userResult.insertId;
      
      
      const { first_name, last_name, phone, address, department, job_grade, employment_status } = profileData;
      const insertProfileQuery = `
        INSERT INTO employee_profiles (user_id, employee_id, first_name, last_name, phone, address, department, job_grade, employment_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      await connection.execute(insertProfileQuery, [
        userId, employee_id, first_name, last_name, phone, address, department, job_grade, employment_status
      ]);
      
      return userId;
    });
  }
  
  static async findByEmployeeId(employeeId) {
    const selectQuery = `
      SELECT u.*, ep.first_name, ep.last_name, ep.department, ep.job_grade, ep.employment_status, ep.phone, ep.address
      FROM users u
      LEFT JOIN employee_profiles ep ON u.id = ep.user_id
      WHERE u.employee_id = ?
    `;
    
    const users = await query(selectQuery, [employeeId]);
    return users[0] || null;
  }
  
  static async findByUsername(username) {
    const selectQuery = `
      SELECT u.*, ep.first_name, ep.last_name, ep.department, ep.job_grade, ep.phone, ep.address
      FROM users u
      LEFT JOIN employee_profiles ep ON u.id = ep.user_id
      WHERE u.username = ?
    `;
    
    const users = await query(selectQuery, [username]);
    return users[0] || null;
  }
  
  static async findById(userId) {
    const selectQuery = `
      SELECT u.*, ep.first_name, ep.last_name, ep.department, ep.job_grade, ep.employment_status, ep.phone, ep.address
      FROM users u
      LEFT JOIN employee_profiles ep ON u.id = ep.user_id
      WHERE u.id = ? AND u.is_active = true
    `;
    
    const users = await query(selectQuery, [userId]);
    return users[0] || null;
  }

  static async findByIdWithProfile(userId) {
    try {
      console.log('findByIdWithProfile - Starting query for userId:', userId);
      
      const sql = `
        SELECT 
          u.id, u.username, u.email, u.password_hash, u.role, u.created_at, u.is_active,
          ep.employee_id, ep.first_name, ep.last_name, ep.grandfather_name, ep.department, 
          ep.job_role as position, ep.hire_date, ep.phone, ep.address, 
          ep.job_grade as employment_type, ep.salary, ep.employment_status
        FROM users u 
        LEFT JOIN employee_profiles ep ON u.id = ep.user_id 
        WHERE u.id = ? AND u.is_active = true
      `;
      
      console.log('findByIdWithProfile - Executing query for ID:', userId);
      
      const result = await query(sql, [userId]);
      console.log('findByIdWithProfile - Query result:', result);
      console.log('findByIdWithProfile - Result length:', result.length);
      
      if (result.length === 0) {
        console.log('findByIdWithProfile - No user found');
        return null;
      }

      const user = result[0];
      console.log('findByIdWithProfile - Raw user data:', user);
      
      
      const transformedUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        password_hash: user.password_hash,
        role: user.role,
        created_at: user.created_at,
        employee_profile: user.employee_id ? {
          employee_id: user.employee_id,
          first_name: user.first_name,
          last_name: user.last_name,
          grandfather_name: user.grandfather_name,
          department: user.department,
          position: user.position,
          hire_date: user.hire_date,
          phone: user.phone,
          address: user.address,
          employment_type: user.employment_type,
          salary: user.salary,
          employment_status: user.employment_status
        } : null
      };
      
      console.log('findByIdWithProfile - Transformed user data:', transformedUser);
      return transformedUser;
      
    } catch (error) {
      console.error('findByIdWithProfile - Database error:', error);
      console.error('findByIdWithProfile - Error stack:', error.stack);
      throw error;
    }
  }

  static async updateLastLogin(userId) {
    const updateQuery = `UPDATE users SET last_login = NOW() WHERE id = ?`;
    await query(updateQuery, [userId]);
  }
  
  static async updatePassword(userId, password_hash) {
    const updateQuery = `UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?`;
    await query(updateQuery, [password_hash, userId]);
  }
  
  static async updateProfile(userId, profileData) {
    const { first_name, last_name, phone, address, department, job_grade, employment_status } = profileData;
    
    const updateQuery = `
      UPDATE employee_profiles 
      SET first_name = ?, last_name = ?, phone = ?, address = ?, department = ?, job_grade = ?, employment_status = ?, updated_at = NOW()
      WHERE user_id = ?
    `;
    
    await query(updateQuery, [first_name, last_name, phone, address, department, job_grade, employment_status, userId]);
  }

  static async updateUser(userId, userData) {
    const { username, email, role, is_active } = userData;
    const updateFields = [];
    const params = [];
    
    if (username !== undefined) {
      updateFields.push('username = ?');
      params.push(username);
    }
    
    if (email !== undefined) {
      updateFields.push('email = ?');
      params.push(email);
    }
    
    if (role !== undefined) {
      updateFields.push('role = ?');
      params.push(role);
    }
    
    if (is_active !== undefined) {
      updateFields.push('is_active = ?');
      params.push(is_active);
    }
    
    if (updateFields.length === 0) {
      return;
    }
    
    updateFields.push('updated_at = NOW()');
    params.push(userId);
    
    const updateQuery = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
    await query(updateQuery, params);
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

    if (filters.employment_status) {
      whereClause += ' AND ep.employment_status = ?';
      params.push(filters.employment_status);
    }

    if (filters.search) {
      whereClause += ' AND (u.username LIKE ? OR u.email LIKE ? OR ep.first_name LIKE ? OR ep.last_name LIKE ? OR u.employee_id LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    const countQuery = `
      SELECT COUNT(*) as total
      FROM users u
      LEFT JOIN employee_profiles ep ON u.id = ep.user_id
      ${whereClause}
    `;
    
    const selectQuery = `
      SELECT u.id, u.employee_id, u.username, u.email, u.role, u.is_active, u.created_at, u.last_login,
             ep.first_name, ep.last_name, ep.department, ep.job_grade, ep.employment_status, ep.phone, ep.address
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

  static async getAllUsersWithInactive(page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;
    let whereClause = 'WHERE 1=1';
    const params = [];
    
    if (filters.role) {
      whereClause += ' AND u.role = ?';
      params.push(filters.role);
    }
    
    if (filters.department) {
      whereClause += ' AND ep.department = ?';
      params.push(filters.department);
    }

    if (filters.employment_status) {
      whereClause += ' AND ep.employment_status = ?';
      params.push(filters.employment_status);
    }

    if (filters.is_active !== undefined) {
      whereClause += ' AND u.is_active = ?';
      params.push(filters.is_active);
    }

    if (filters.search) {
      whereClause += ' AND (u.username LIKE ? OR u.email LIKE ? OR ep.first_name LIKE ? OR ep.last_name LIKE ? OR u.employee_id LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    const countQuery = `
      SELECT COUNT(*) as total
      FROM users u
      LEFT JOIN employee_profiles ep ON u.id = ep.user_id
      ${whereClause}
    `;
    
    const selectQuery = `
      SELECT u.id, u.employee_id, u.username, u.email, u.role, u.is_active, u.created_at, u.last_login,
             ep.first_name, ep.last_name, ep.department, ep.job_grade, ep.employment_status, ep.phone, ep.address
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

  static async activateUser(userId) {
    const updateQuery = `UPDATE users SET is_active = true, updated_at = NOW() WHERE id = ?`;
    await query(updateQuery, [userId]);
  }

  static async deleteUser(userId) {
    const connection = await transaction();
    
    try {
      
      await connection.execute('DELETE FROM employee_profiles WHERE user_id = ?', [userId]);
      await connection.execute('DELETE FROM users WHERE id = ?', [userId]);
      
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  }

  static async getUserStats() {
    const statsQuery = `
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_users,
        COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_users,
        COUNT(CASE WHEN role = 'ADMIN' THEN 1 END) as admin_users,
        COUNT(CASE WHEN role = 'HR' THEN 1 END) as hr_users,
        COUNT(CASE WHEN role = 'EMPLOYEE' THEN 1 END) as employee_users,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as new_users_30_days
      FROM users
    `;
    
    const result = await query(statsQuery);
    return result[0];
  }

  static async getUsersByDepartment() {
    const deptQuery = `
      SELECT ep.department, COUNT(*) as count
      FROM users u
      LEFT JOIN employee_profiles ep ON u.id = ep.user_id
      WHERE u.is_active = true AND ep.department IS NOT NULL
      GROUP BY ep.department
      ORDER BY count DESC
    `;
    
    return await query(deptQuery);
  }
}

module.exports = UserModel;
