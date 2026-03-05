const { query } = require('../../config/database');
const { auditLog } = require('../../middleware/audit');

class HrService {
  static async getEmployees(filters = {}) {
    try {
      const page = parseInt(filters.page) || 1;
      const limit = parseInt(filters.limit) || 10;
      const offset = (page - 1) * limit;
      
      let whereClause = 'WHERE 1=1';
      const params = [];
      
      if (filters.department) {
        whereClause += ' AND ep.department = ?';
        params.push(filters.department);
      }
      
      if (filters.employment_status) {
        whereClause += ' AND ep.employment_status = ?';
        params.push(filters.employment_status);
      }
      
      if (filters.job_grade) {
        whereClause += ' AND ep.job_grade = ?';
        params.push(filters.job_grade);
      }
      
      if (filters.search) {
        whereClause += ' AND (u.username LIKE ? OR u.email LIKE ? OR ep.first_name LIKE ? OR ep.last_name LIKE ? OR u.employee_id LIKE ?)';
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
      }
      
      if (filters.is_active !== undefined) {
        whereClause += ' AND u.is_active = ?';
        params.push(filters.is_active);
      }
      
      const countQuery = `
        SELECT COUNT(*) as total
        FROM users u
        LEFT JOIN employee_profiles ep ON u.id = ep.user_id
        ${whereClause}
      `;
      
      const selectQuery = `
        SELECT 
          u.id,
          u.employee_id,
          u.username,
          u.email,
          u.role,
          u.is_active,
          u.email_verified,
          u.created_at,
          u.last_login,
          ep.first_name,
          ep.last_name,
          ep.phone,
          ep.address,
          ep.department,
          ep.job_grade,
          ep.employment_status,
          ep.hire_date
        FROM users u
        LEFT JOIN employee_profiles ep ON u.id = ep.user_id
        ${whereClause}
        ORDER BY u.created_at DESC
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
    } catch (error) {
      throw error;
    }
  }

  static async verifyEmployee(userId, verifiedBy, ip, userAgent) {
    try {
      // Check if user exists and is not already verified
      const [user] = await query(`
        SELECT u.*, ep.first_name, ep.last_name, ep.email
        FROM users u
        LEFT JOIN employee_profiles ep ON u.id = ep.user_id
        WHERE u.id = ? AND u.email_verified = FALSE
      `, [userId]);
      
      if (!user || !user[0]) {
        throw new Error('User not found or already verified');
      }
      
      // Update user verification status
      await query(`
        UPDATE users 
        SET email_verified = TRUE, updated_at = NOW()
        WHERE id = ?
      `, [userId]);
      
      // Log verification
      await auditLog(verifiedBy, 'EMPLOYEE_VERIFIED', 'users', userId, null, { 
        employee_id: user[0].employee_id,
        username: user[0].username,
        email: user[0].email
      }, ip, userAgent);
      
      // Send notification to employee
      const NotificationService = require('../../services/notification.service');
      await NotificationService.createNotification(
        userId,
        'Account Verified',
        'Your account has been verified by HR. You can now access all system features.',
        'SUCCESS'
      );
      
      // Send welcome email
      if (user[0].email) {
        await NotificationService.sendEmail(
          user[0].email,
          'Account Verified - Welcome to Microfinance System',
          `
            <h2>Welcome to the Microfinance System!</h2>
            <p>Dear ${user[0].first_name} ${user[0].last_name},</p>
            <p>Your account has been successfully verified. You now have full access to all system features including:</p>
            <ul>
              <li>Savings account management</li>
              <li>Loan applications</li>
              <li>Transaction history</li>
              <li>Profile management</li>
            </ul>
            <p>If you have any questions, please contact the HR department.</p>
            <p>Best regards,<br>Microfinance System Team</p>
          `
        );
      }
      
      return { 
        message: 'Employee verified successfully',
        employee: {
          id: user[0].id,
          employee_id: user[0].employee_id,
          name: `${user[0].first_name} ${user[0].last_name}`,
          email: user[0].email
        }
      };
    } catch (error) {
      throw error;
    }
  }

  static async updateEmploymentStatus(userId, employmentStatus, updatedBy, ip, userAgent) {
    try {
      const validStatuses = ['ACTIVE', 'ON_LEAVE', 'TERMINATED'];
      if (!validStatuses.includes(employmentStatus)) {
        throw new Error('Invalid employment status');
      }
      
      // Check if user exists
      const [user] = await query(`
        SELECT u.*, ep.first_name, ep.last_name, ep.email, ep.employment_status as current_status
        FROM users u
        LEFT JOIN employee_profiles ep ON u.id = ep.user_id
        WHERE u.id = ?
      `, [userId]);
      
      if (!user || !user[0]) {
        throw new Error('User not found');
      }
      
      // Update employment status
      await query(`
        UPDATE employee_profiles 
        SET employment_status = ?, updated_at = NOW()
        WHERE user_id = ?
      `, [employmentStatus, userId]);
      
      // If terminating, deactivate user account
      if (employmentStatus === 'TERMINATED') {
        await query(`
          UPDATE users 
          SET is_active = FALSE, updated_at = NOW()
          WHERE id = ?
        `, [userId]);
      }
      
      // Log status change
      await auditLog(updatedBy, 'EMPLOYMENT_STATUS_UPDATE', 'employee_profiles', userId, null, {
        old_status: user[0].current_status,
        new_status: employmentStatus
      }, ip, userAgent);
      
      // Send notification to user
      const NotificationService = require('../../services/notification.service');
      await NotificationService.createNotification(
        userId,
        'Employment Status Updated',
        `Your employment status has been updated to: ${employmentStatus}`,
        employmentStatus === 'TERMINATED' ? 'ERROR' : 'INFO'
      );
      
      // Send email notification
      if (user[0].email) {
        const emailSubject = employmentStatus === 'TERMINATED' ? 'Employment Terminated' : 'Employment Status Updated';
        const emailContent = `
          <h2>${emailSubject}</h2>
          <p>Dear ${user[0].first_name} ${user[0].last_name},</p>
          <p>Your employment status has been updated to <strong>${employmentStatus}</strong>.</p>
          ${employmentStatus === 'TERMINATED' ? 
            '<p>Your account access has been deactivated. Please contact HR for any questions.</p>' : 
            '<p>If you have any questions about this change, please contact the HR department.</p>'
          }
          <p>Best regards,<br>HR Department</p>
        `;
        
        await NotificationService.sendEmail(user[0].email, emailSubject, emailContent);
      }
      
      return { 
        message: 'Employment status updated successfully',
        employee: {
          id: user[0].id,
          employee_id: user[0].employee_id,
          name: `${user[0].first_name} ${user[0].last_name}`,
          previous_status: user[0].current_status,
          new_status: employmentStatus
        }
      };
    } catch (error) {
      throw error;
    }
  }

  static async createEmployee(employeeData, profileData, createdBy, ip, userAgent) {
    try {
      const { employee_id, username, email, password, role = 'EMPLOYEE' } = employeeData;
      
      // Validate required fields
      if (!employee_id || !username || !email || !password) {
        throw new Error('Employee ID, username, email, and password are required');
      }
      
      // Check if employee_id already exists
      const existing = await query('SELECT id FROM users WHERE employee_id = ?', [employee_id]);
      if (existing && existing.length > 0) {
        throw new Error('Employee ID already exists');
      }
      
      // Hash password
      const bcrypt = require('bcryptjs');
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
      const password_hash = await bcrypt.hash(password, saltRounds);
      
      // Create user
      const userResult = await query(`
        INSERT INTO users (employee_id, username, email, password_hash, role, is_active, email_verified, created_at)
        VALUES (?, ?, ?, ?, ?, TRUE, TRUE, NOW())
      `, [employee_id, username, email, password_hash, role]);
      
      const userId = userResult.insertId;
      
      // Create employee profile
      const { first_name, last_name, phone, address, department, job_grade, employment_status, hire_date } = profileData;
      
      await query(`
        INSERT INTO employee_profiles (user_id, employee_id, first_name, last_name, department, job_grade, employment_status, hire_date, phone, address, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `, [userId, employee_id, first_name, last_name, department || null, job_grade || null, employment_status || 'ACTIVE', hire_date || null, phone || null, address || null]);
      
      // Log creation
      await auditLog(createdBy, 'EMPLOYEE_CREATED', 'users', userId, null, {
        employee_id,
        username,
        email,
        role,
        department,
        job_grade
      }, ip, userAgent);
      
      // Send notification to HR (temporarily disabled for testing)
      // const NotificationService = require('../../services/notification.service');
      // await NotificationService.createNotification(
      //   createdBy,
      //   'New Employee Created',
      //   `New employee ${first_name} ${last_name} (${employee_id}) has been added to the system.`,
      //   'INFO'
      // );
      
      console.log('Employee created successfully:', { userId, employee_id, username });
      
      return {
        message: 'Employee created successfully',
        employee: {
          id: userId,
          employee_id,
          username,
          email,
          role,
          first_name,
          last_name,
          department,
          job_grade,
          employment_status
        }
      };
    } catch (error) {
      throw error;
    }
  }

  static async validateEmployee(employee_id) {
    try {
      // Mock HR data for demonstration - replace with actual HR database connection
      const mockHREmployees = [
        {
          employee_id: 'EMP001',
          first_name: 'John',
          last_name: 'Doe',
          department: 'IT',
          job_grade: 'SENIOR',
          employment_status: 'ACTIVE',
          hire_date: '2022-01-15',
          phone: '+251911234567',
          email: 'john.doe@company.com'
        },
        {
          employee_id: 'EMP002',
          first_name: 'Jane',
          last_name: 'Smith',
          department: 'Finance',
          job_grade: 'MID',
          employment_status: 'ACTIVE',
          hire_date: '2021-06-01',
          phone: '+251912345678',
          email: 'jane.smith@company.com'
        },
        {
          employee_id: 'EMP003',
          first_name: 'Michael',
          last_name: 'Johnson',
          department: 'HR',
          job_grade: 'MANAGER',
          employment_status: 'ACTIVE',
          hire_date: '2020-03-10',
          phone: '+251913345679',
          email: 'michael.johnson@company.com'
        },
        {
          employee_id: 'EMP004',
          first_name: 'Sarah',
          last_name: 'Williams',
          department: 'Operations',
          job_grade: 'SUPERVISOR',
          employment_status: 'ACTIVE',
          hire_date: '2019-11-20',
          phone: '+251914345680',
          email: 'sarah.williams@company.com'
        },
        {
          employee_id: 'EMP005',
          first_name: 'David',
          last_name: 'Brown',
          department: 'Marketing',
          job_grade: 'SPECIALIST',
          employment_status: 'ACTIVE',
          hire_date: '2021-09-15',
          phone: '+251915345681',
          email: 'david.brown@company.com'
        }
      ];
      
      const employee = mockHREmployees.find(emp => emp.employee_id === employee_id);
      if (!employee) {
        throw new Error('Employee not found in HR database or not active');
      }
      
      return employee;
    } catch (error) {
      throw error;
    }
  }

  static async getEmployeeById(userId) {
    try {
      const [employee] = await query(`
        SELECT 
          u.id,
          u.employee_id,
          u.username,
          u.email,
          u.role,
          u.is_active,
          u.email_verified,
          u.created_at,
          u.last_login,
          ep.first_name,
          ep.last_name,
          ep.phone,
          ep.address,
          ep.department,
          ep.job_grade,
          ep.employment_status,
          ep.hire_date,
          ep.salary_grade,
          ep.updated_at
        FROM users u
        LEFT JOIN employee_profiles ep ON u.id = ep.user_id
        WHERE u.id = ?
      `, [userId]);
      
      if (!employee || !employee[0]) {
        throw new Error('Employee not found');
      }
      
      return employee[0];
    } catch (error) {
      throw error;
    }
  }

  static async updateEmployeeProfile(userId, profileData, updatedBy, ip, userAgent) {
    try {
      const { first_name, last_name, phone, address, department, job_grade, salary_grade } = profileData;
      
      // Check if employee exists
      const [existing] = await query('SELECT id FROM users WHERE id = ?', [userId]);
      if (!existing || !existing[0]) {
        throw new Error('Employee not found');
      }
      
      // Build dynamic update query
      const updateFields = [];
      const params = [];
      
      if (first_name !== undefined) {
        updateFields.push('first_name = ?');
        params.push(first_name);
      }
      
      if (last_name !== undefined) {
        updateFields.push('last_name = ?');
        params.push(last_name);
      }
      
      if (phone !== undefined) {
        updateFields.push('phone = ?');
        params.push(phone);
      }
      
      if (address !== undefined) {
        updateFields.push('address = ?');
        params.push(address);
      }
      
      if (department !== undefined) {
        updateFields.push('department = ?');
        params.push(department);
      }
      
      if (job_grade !== undefined) {
        updateFields.push('job_grade = ?');
        params.push(job_grade);
      }
      
      if (salary_grade !== undefined) {
        updateFields.push('salary_grade = ?');
        params.push(salary_grade);
      }
      
      if (updateFields.length === 0) {
        throw new Error('No valid fields to update');
      }
      
      updateFields.push('updated_at = NOW()');
      params.push(userId);
      
      const updateQuery = `
        UPDATE employee_profiles 
        SET ${updateFields.join(', ')}
        WHERE user_id = ?
      `;
      
      await query(updateQuery, params);
      
      // Log update
      await auditLog(updatedBy, 'EMPLOYEE_PROFILE_UPDATE', 'employee_profiles', userId, null, profileData, ip, userAgent);
      
      return { message: 'Employee profile updated successfully' };
    } catch (error) {
      throw error;
    }
  }

  static async getDepartments() {
    try {
      const [departments] = await query(`
        SELECT 
          department,
          COUNT(*) as employee_count,
          COUNT(CASE WHEN employment_status = 'ACTIVE' THEN 1 END) as active_count
        FROM employee_profiles
        WHERE department IS NOT NULL
        GROUP BY department
        ORDER BY department
      `);
      
      return departments;
    } catch (error) {
      throw error;
    }
  }

  static async getJobGrades() {
    try {
      const [jobGrades] = await query(`
        SELECT 
          job_grade,
          COUNT(*) as employee_count,
          AVG(salary_grade) as avg_salary
        FROM employee_profiles
        WHERE job_grade IS NOT NULL
        GROUP BY job_grade
        ORDER BY job_grade
      `);
      
      return jobGrades;
    } catch (error) {
      throw error;
    }
  }

  static async getEmployeeStats() {
    try {
      const [stats] = await query(`
        SELECT 
          COUNT(*) as total_employees,
          COUNT(CASE WHEN is_active = TRUE THEN 1 END) as active_employees,
          COUNT(CASE WHEN email_verified = TRUE THEN 1 END) as verified_employees,
          COUNT(CASE WHEN employment_status = 'ACTIVE' THEN 1 END) as active_employment,
          COUNT(CASE WHEN employment_status = 'ON_LEAVE' THEN 1 END) as on_leave,
          COUNT(CASE WHEN employment_status = 'TERMINATED' THEN 1 END) as terminated,
          COUNT(DISTINCT department) as departments,
          COUNT(DISTINCT job_grade) as job_grades
        FROM users u
        LEFT JOIN employee_profiles ep ON u.id = ep.user_id
      `);
      
      return stats[0];
    } catch (error) {
      throw error;
    }
  }

  static async bulkVerifyEmployees(userIds, verifiedBy, ip, userAgent) {
    try {
      const results = {
        verified: [],
        failed: [],
        already_verified: []
      };
      
      for (const userId of userIds) {
        try {
          const [user] = await query(`
            SELECT u.*, ep.first_name, ep.last_name, ep.email
            FROM users u
            LEFT JOIN employee_profiles ep ON u.id = ep.user_id
            WHERE u.id = ? AND u.email_verified = FALSE
          `, [userId]);
          
          if (!user || !user[0]) {
            results.failed.push({ userId, reason: 'User not found' });
            continue;
          }
          
          // Update verification status
          await query(`
            UPDATE users 
            SET email_verified = TRUE, updated_at = NOW()
            WHERE id = ?
          `, [userId]);
          
          // Log verification
          await auditLog(verifiedBy, 'EMPLOYEE_VERIFIED', 'users', userId, null, {
            employee_id: user[0].employee_id,
            username: user[0].username,
            email: user[0].email
          }, ip, userAgent);
          
          // Send notification
          const NotificationService = require('../../services/notification.service');
          await NotificationService.createNotification(
            userId,
            'Account Verified',
            'Your account has been verified by HR. You can now access all system features.',
            'SUCCESS'
          );
          
          results.verified.push({
            userId,
            employee_id: user[0].employee_id,
            name: `${user[0].first_name} ${user[0].last_name}`
          });
          
        } catch (error) {
          results.failed.push({ userId, reason: error.message });
        }
      }
      
      return results;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = HrService;
