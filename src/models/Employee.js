const { query, transaction } = require('../config/database');

class Employee {
  static async verifyEmployeeFromHR(employeeId) {
    const hrQuery = `
      SELECT employee_id, first_name, last_name, department, job_grade, 
             employment_status, hire_date, email, phone, salary
      FROM hr_database 
      WHERE employee_id = ? AND employment_status = 'ACTIVE'
    `;
    
    try {
      const hrData = await query(hrQuery, [employeeId]);
      return hrData[0] || null;
    } catch (error) {
      console.error('HR database verification error:', error);
      return null;
    }
  }
  
  static async createEmployeeProfile(userId, employeeData) {
    const { employee_id, first_name, last_name, department, job_grade, employment_status, hire_date, phone, address, salary } = employeeData;
    
    const insertQuery = `
      INSERT INTO employee_profiles 
      (user_id, employee_id, first_name, last_name, department, job_grade, employment_status, hire_date, phone, address, salary)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    try {
      const result = await query(insertQuery, [
        userId, employee_id, first_name, last_name, department, job_grade, employment_status, hire_date, phone, address, salary
      ]);
      return result.insertId;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Employee profile already exists');
      }
      throw error;
    }
  }
  
  static async updateHRVerification(userId, verified = true) {
    const updateQuery = `
      UPDATE employee_profiles 
      SET hr_verified = ?, hr_verification_date = NOW(), updated_at = NOW()
      WHERE user_id = ?
    `;
    
    await query(updateQuery, [verified, userId]);
  }
  
  static async getEmployeeProfile(userId) {
    const selectQuery = `
      SELECT ep.*, u.username, u.email, u.role, u.is_active, u.created_at
      FROM employee_profiles ep
      JOIN users u ON ep.user_id = u.id
      WHERE ep.user_id = ?
    `;
    
    const profiles = await query(selectQuery, [userId]);
    return profiles[0] || null;
  }
  
  static async getEmployeeProfileByEmployeeId(employeeId) {
    const selectQuery = `
      SELECT ep.*, u.username, u.email, u.role, u.is_active, u.created_at
      FROM employee_profiles ep
      JOIN users u ON ep.user_id = u.id
      WHERE ep.employee_id = ?
    `;
    
    const profiles = await query(selectQuery, [employeeId]);
    return profiles[0] || null;
  }
  
  static async getAllEmployees(page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;
    let whereClause = 'WHERE u.is_active = true';
    const params = [];
    
    if (filters.department) {
      whereClause += ' AND ep.department = ?';
      params.push(filters.department);
    }
    
    if (filters.job_grade) {
      whereClause += ' AND ep.job_grade = ?';
      params.push(filters.job_grade);
    }
    
    if (filters.employment_status) {
      whereClause += ' AND ep.employment_status = ?';
      params.push(filters.employment_status);
    }
    
    if (filters.hr_verified !== undefined) {
      whereClause += ' AND ep.hr_verified = ?';
      params.push(filters.hr_verified);
    }
    
    const countQuery = `
      SELECT COUNT(*) as total
      FROM employee_profiles ep
      JOIN users u ON ep.user_id = u.id
      ${whereClause}
    `;
    
    const selectQuery = `
      SELECT ep.*, u.username, u.email, u.role, u.is_active, u.created_at
      FROM employee_profiles ep
      JOIN users u ON ep.user_id = u.id
      ${whereClause}
      ORDER BY ep.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const [countResult, employees] = await Promise.all([
      query(countQuery, params),
      query(selectQuery, [...params, limit, offset])
    ]);
    
    return {
      employees,
      pagination: {
        page,
        limit,
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit)
      }
    };
  }
  
  static async updateEmployeeStatus(userId, employmentStatus) {
    const updateQuery = `
      UPDATE employee_profiles 
      SET employment_status = ?, updated_at = NOW()
      WHERE user_id = ?
    `;
    
    await query(updateQuery, [employmentStatus, userId]);
  }
  
  static async getUnverifiedEmployees() {
    const selectQuery = `
      SELECT ep.*, u.username, u.email, u.created_at
      FROM employee_profiles ep
      JOIN users u ON ep.user_id = u.id
      WHERE ep.hr_verified = false AND u.is_active = true
      ORDER BY ep.created_at ASC
    `;
    
    return await query(selectQuery);
  }
  
  static async bulkVerifyEmployees(employeeIds, verifiedBy) {
    return await transaction(async (connection) => {
      const results = [];
      
      for (const employeeId of employeeIds) {
        try {
          const updateQuery = `
            UPDATE employee_profiles 
            SET hr_verified = true, hr_verification_date = NOW(), updated_at = NOW()
            WHERE employee_id = ?
          `;
          
          const [result] = await connection.execute(updateQuery, [employeeId]);
          results.push({ employeeId, success: result.affectedRows > 0 });
        } catch (error) {
          results.push({ employeeId, success: false, error: error.message });
        }
      }
      
      return results;
    });
  }
  
  static async getEmployeeStats() {
    const statsQuery = `
      SELECT 
        COUNT(*) as total_employees,
        COUNT(CASE WHEN ep.hr_verified = true THEN 1 END) as verified_employees,
        COUNT(CASE WHEN ep.hr_verified = false THEN 1 END) as pending_verification,
        COUNT(CASE WHEN ep.employment_status = 'ACTIVE' THEN 1 END) as active_employees,
        COUNT(CASE WHEN ep.employment_status = 'INACTIVE' THEN 1 END) as inactive_employees,
        COUNT(CASE WHEN ep.employment_status = 'TERMINATED' THEN 1 END) as terminated_employees,
        COUNT(DISTINCT ep.department) as total_departments
      FROM employee_profiles ep
      JOIN users u ON ep.user_id = u.id
      WHERE u.is_active = true
    `;
    
    const departmentQuery = `
      SELECT ep.department, COUNT(*) as count
      FROM employee_profiles ep
      JOIN users u ON ep.user_id = u.id
      WHERE u.is_active = true AND ep.employment_status = 'ACTIVE'
      GROUP BY ep.department
      ORDER BY count DESC
    `;
    
    const [stats, departments] = await Promise.all([
      query(statsQuery),
      query(departmentQuery)
    ]);
    
    return {
      ...stats[0],
      departments
    };
  }
}

module.exports = Employee;
