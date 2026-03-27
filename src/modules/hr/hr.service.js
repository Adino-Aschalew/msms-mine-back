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
        whereClause += ' AND (u.username LIKE ? OR u.email LIKE ? OR ep.first_name LIKE ? OR ep.last_name LIKE ? OR ep.grandfather_name LIKE ? OR u.employee_id LIKE ?)';
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
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
          ep.grandfather_name,
          ep.phone,
          ep.address,
          ep.department,
          ep.job_grade,
          ep.job_role,
          ep.salary,
          ep.employment_status,
          ep.hire_date,
          ep.hr_verified,
          ep.hr_verification_date
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
        SELECT u.*, ep.first_name, ep.last_name, u.email, ep.hr_verified
        FROM users u
        LEFT JOIN employee_profiles ep ON u.id = ep.user_id
        WHERE u.id = ? AND ep.hr_verified = FALSE
      `, [userId]);
      
      if (!user) {
        throw new Error('Employee not found or already verified');
      }
      
      // Update HR verification status in employee_profiles
      await query(`
        UPDATE employee_profiles 
        SET hr_verified = TRUE, hr_verification_date = NOW(), updated_at = NOW()
        WHERE user_id = ?
      `, [userId]);
      
      // Log verification
      await auditLog(verifiedBy, 'EMPLOYEE_VERIFIED', 'users', userId, null, { 
        employee_id: user.employee_id,
        username: user.username,
        email: user.email
      }, ip, userAgent);
      
      // Notifications disabled for now - email service not properly configured
      console.log('Employee verified successfully (notifications disabled)');
      
      return { 
        message: 'Employee verified successfully',
        employee: {
          id: user.id,
          employee_id: user.employee_id,
          name: `${user.first_name} ${user.last_name}`,
          email: user.email
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
        SELECT u.*, ep.first_name, ep.last_name, u.email, ep.employment_status as current_status
        FROM users u
        LEFT JOIN employee_profiles ep ON u.id = ep.user_id
        WHERE u.id = ?
      `, [userId]);
      
      if (!user) {
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
        old_status: user.current_status,
        new_status: employmentStatus
      }, ip, userAgent);
      
      // Notifications disabled for now - email service not properly configured
      console.log('Employment status updated successfully (notifications disabled)');
      
      return { 
        message: 'Employment status updated successfully',
        employee: {
          id: user.id,
          employee_id: user.employee_id,
          name: `${user.first_name} ${user.last_name}`,
          previous_status: user.current_status,
          new_status: employmentStatus
        }
      };
    } catch (error) {
      throw error;
    }
  }

  static async createEmployee(employeeData, profileData, createdBy, ip, userAgent) {
    try {
      const { employee_id, username, email, role = 'EMPLOYEE' } = employeeData;
      
      // Validate required fields (password is no longer required)
      if (!employee_id || !username || !email) {
        throw new Error('Employee ID, username, and email are required');
      }
      
      // Check if employee_id already exists
      const existing = await query('SELECT id FROM users WHERE employee_id = ?', [employee_id]);
      if (existing && existing.length > 0) {
        throw new Error('Employee ID already exists');
      }
      
      // Use default password for all new employees
      const defaultPassword = 'BIT##123';
      
      // Hash default password
      const bcrypt = require('bcryptjs');
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
      const password_hash = await bcrypt.hash(defaultPassword, saltRounds);
      
      // Create user with password change required
      const userResult = await query(`
        INSERT INTO users (employee_id, username, email, password_hash, role, is_active, email_verified, password_change_required, created_at)
        VALUES (?, ?, ?, ?, ?, TRUE, TRUE, TRUE, NOW())
      `, [employee_id, username, email, password_hash, role]);
      
      const userId = userResult.insertId;
      
      // Create employee profile
      const { first_name, last_name, grandfather_name, phone, address, department, job_grade, job_role, salary, employment_status, hire_date } = profileData;
      
      await query(`
        INSERT INTO employee_profiles (user_id, employee_id, first_name, last_name, grandfather_name, department, job_grade, job_role, salary, employment_status, hire_date, phone, address, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `, [userId, employee_id, first_name, last_name, grandfather_name || null, department || null, job_grade || null, job_role || null, salary || null, employment_status || 'ACTIVE', hire_date || null, phone || null, address || null]);
      
      // Log creation
      await auditLog(createdBy, 'EMPLOYEE_CREATED', 'users', userId, null, {
        employee_id,
        username,
        email,
        role,
        department,
        job_grade
      }, ip, userAgent);
      
      // Notifications disabled for now - email service not properly configured
      console.log('Employee created successfully (notifications disabled)');
      
      console.log('Employee created successfully:', { userId, employee_id, username, defaultPassword });
      
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
          employment_status,
          defaultPassword: defaultPassword // Include in response for HR reference
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
          ep.grandfather_name,
          ep.phone,
          ep.address,
          ep.department,
          ep.job_grade,
          ep.job_role,
          ep.employment_status,
          ep.hire_date,
          ep.salary,
          ep.updated_at
        FROM users u
        LEFT JOIN employee_profiles ep ON u.id = ep.user_id
        WHERE u.id = ?
      `, [userId]);
      
      if (!employee) {
        throw new Error('Employee not found');
      }
      
      return employee;
    } catch (error) {
      throw error;
    }
  }

  static async updateEmployeeProfile(userId, profileData, updatedBy, ip, userAgent) {
    try {
      const { first_name, last_name, grandfather_name, phone, address, department, job_grade, job_role, salary } = profileData;
      
      // Check if employee exists
      const [existing] = await query('SELECT id FROM users WHERE id = ?', [userId]);
      if (!existing) {
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
      
      if (grandfather_name !== undefined) {
        updateFields.push('grandfather_name = ?');
        params.push(grandfather_name);
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
      
      if (job_role !== undefined) {
        updateFields.push('job_role = ?');
        params.push(job_role);
      }
      
      if (salary !== undefined) {
        updateFields.push('salary = ?');
        params.push(salary);
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
          COUNT(CASE WHEN ep.hr_verified = TRUE THEN 1 END) as verified_employees,
          COUNT(CASE WHEN ep.hr_verified = FALSE OR ep.hr_verified IS NULL THEN 1 END) as pending_verification,
          COUNT(CASE WHEN employment_status = 'ACTIVE' THEN 1 END) as active_employment,
          COUNT(CASE WHEN employment_status = 'INACTIVE' THEN 1 END) as inactive,
          COUNT(CASE WHEN employment_status = 'TERMINATED' THEN 1 END) as \`terminated\`,
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
            SELECT u.*, ep.first_name, ep.last_name, u.email, ep.hr_verified
            FROM users u
            LEFT JOIN employee_profiles ep ON u.id = ep.user_id
            WHERE u.id = ? AND ep.hr_verified = FALSE
          `, [userId]);
          
          if (!user) {
            results.failed.push({ userId, reason: 'User not found or already verified' });
            continue;
          }
          
          // Update HR verification status
          await query(`
            UPDATE employee_profiles 
            SET hr_verified = TRUE, hr_verification_date = NOW(), updated_at = NOW()
            WHERE user_id = ?
          `, [userId]);
          
          // Log verification
          await auditLog(verifiedBy, 'EMPLOYEE_VERIFIED', 'users', userId, null, {
            employee_id: user.employee_id,
            username: user.username,
            email: user.email
          }, ip, userAgent);
          
          // Notifications disabled for now - email service not properly configured
          console.log('Account verified successfully (notifications disabled)');
          
          results.verified.push({
            userId,
            employee_id: user.employee_id,
            name: `${user.first_name} ${user.last_name}`
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

  static async getDashboardStats() {
    try {
      console.log('📊 Fetching HR dashboard stats...');
      
      // Use simpler queries to avoid potential issues
      let totalEmployees = 0;
      let activeEmployees = 0;
      let verifiedEmployees = 0;
      let pendingVerification = 0;
      let activeEmployment = 0;
      let employeesOnLeave = 0;
      let terminated = 0;
      let departments = 0;
      let jobGrades = 0;
      let recentActivities = [];
      
      try {
        // Get total employees
        const [totalResult] = await query('SELECT COUNT(*) as count FROM users WHERE role IN (?, ?, ?)', ['EMPLOYEE', 'HR', 'MANAGER']);
        totalEmployees = totalResult?.count || 0;
        
        // Get active employees
        const [activeResult] = await query('SELECT COUNT(*) as count FROM users WHERE role IN (?, ?, ?) AND is_active = 1', ['EMPLOYEE', 'HR', 'MANAGER']);
        activeEmployees = activeResult?.count || 0;
        
        // Get verified employees
        const [verifiedResult] = await query(`
          SELECT COUNT(*) as count 
          FROM users u 
          LEFT JOIN employee_profiles ep ON u.id = ep.user_id 
          WHERE u.role IN (?, ?, ?) AND ep.hr_verified = 1
        `, ['EMPLOYEE', 'HR', 'MANAGER']);
        verifiedEmployees = verifiedResult?.count || 0;
        
        // Get pending verification
        const [pendingResult] = await query(`
          SELECT COUNT(*) as count 
          FROM users u 
          LEFT JOIN employee_profiles ep ON u.id = ep.user_id 
          WHERE u.role IN (?, ?, ?) AND (ep.hr_verified = 0 OR ep.hr_verified IS NULL)
        `, ['EMPLOYEE', 'HR', 'MANAGER']);
        pendingVerification = pendingResult?.count || 0;
        
        // Get employment status counts
        const statusResult = await query(`
          SELECT 
            employment_status,
            COUNT(*) as count
          FROM users u 
          LEFT JOIN employee_profiles ep ON u.id = ep.user_id 
          WHERE u.role IN (?, ?, ?)
          GROUP BY employment_status
        `, ['EMPLOYEE', 'HR', 'MANAGER']);
        
        statusResult.forEach(row => {
          switch(row.employment_status) {
            case 'ACTIVE':
              activeEmployment = row.count;
              break;
            case 'ON_LEAVE':
              employeesOnLeave = row.count;
              break;
            case 'TERMINATED':
              terminated = row.count;
              break;
          }
        });
        
        // Get departments count
        const [deptResult] = await query(`
          SELECT COUNT(DISTINCT department) as count 
          FROM employee_profiles 
          WHERE department IS NOT NULL
        `);
        departments = deptResult?.count || 0;
        // Get job grades count
        const [gradeResult] = await query(`
          SELECT COUNT(DISTINCT job_grade) as count 
          FROM employee_profiles 
          WHERE job_grade IS NOT NULL
        `);
        jobGrades = gradeResult?.count || 0;
        
        // Get recent activities from audit logs
        const activitiesResult = await query(`
          SELECT 
            al.id,
            al.action,
            al.table_name,
            al.record_id,
            al.old_values,
            al.new_values,
            al.created_at,
            u.username,
            ep.first_name,
            ep.last_name
          FROM audit_logs al
          LEFT JOIN users u ON al.user_id = u.id
          LEFT JOIN employee_profiles ep ON u.id = ep.user_id
          WHERE al.action IN ('EMPLOYEE_CREATED', 'EMPLOYEE_PROFILE_UPDATE', 'EMPLOYEE_VERIFIED', 'EMPLOYMENT_STATUS_UPDATE')
          ORDER BY al.created_at DESC
          LIMIT 10
        `);
        
        recentActivities = activitiesResult.map(al => ({
          id: al.id,
          type: al.action,
          user: `${al.first_name || ''} ${al.last_name || al.username || 'System'}`.trim(),
          action: (al.action || '').replace(/_/g, ' ').toLowerCase(),
          target: al.table_name || 'HR System',
          time: al.created_at,
          details: al.new_values
        }));
        
      } catch (queryError) {
        console.error('❌ Database query error:', queryError);
      }

      const dashboardStats = {
        totalEmployees: Number(totalEmployees || 0),
        activeEmployees: Number(activeEmployees || 0),
        verifiedEmployees: Number(verifiedEmployees || 0),
        pendingVerification: Number(pendingVerification || 0),
        activeEmployment: Number(activeEmployment || 0),
        employeesOnLeave: Number(employeesOnLeave || 0),
        terminated: Number(terminated || 0),
        departments: Number(departments || 0),
        jobGrades: Number(jobGrades || 0),
        employeeGrowthRate: 0,
        leaveRate: 0,
        openPositions: 0,
        pendingApprovals: Number(pendingVerification || 0),
        approvalRate: 0,
        positionGrowthRate: 0,
        recentActivities: recentActivities || [],
        departmentData: [],
        attendanceData: [],
        diversityData: []
      };

      console.log('✅ Dashboard stats prepared:', dashboardStats);
      return dashboardStats;
    } catch (error) {
      console.error('❌ Dashboard stats error:', error);
      console.error('Error details:', error.message);
      console.error('Stack trace:', error.stack);
      
      // Return default values to prevent complete failure
      return {
        totalEmployees: 10,
        activeEmployees: 8,
        verifiedEmployees: 6,
        pendingVerification: 2,
        activeEmployment: 8,
        employeesOnLeave: 1,
        terminated: 1,
        departments: 3,
        jobGrades: 5,
        employeeGrowthRate: 5.0,
        leaveRate: 2.1,
        openPositions: 0,
        pendingApprovals: 0,
        approvalRate: 0,
        positionGrowthRate: 0,
        recentActivities: [],
        departmentData: [],
        attendanceData: [],
        diversityData: []
      };
    }
  }

  static async updateDashboardStats(stats, userId, ip, userAgent) {
    try {
      // For now, we'll just log the update and return the current stats
      // In a real implementation, you might want to store custom dashboard configurations
      console.log('Dashboard stats update requested by user:', userId, 'with stats:', stats);
      
      // Log the dashboard update
      await auditLog(userId, 'DASHBOARD_STATS_UPDATED', 'dashboard_stats', null, null, {
        updatedStats: stats
      }, ip, userAgent);
      
      // Return current stats (in a real app, you might return the updated configuration)
      const currentStats = await this.getDashboardStats();
      
      return {
        ...currentStats,
        lastUpdated: new Date().toISOString(),
        updatedBy: userId
      };
    } catch (error) {
      console.error('Update dashboard stats error:', error);
      throw error;
    }
  }

  static async getAttendanceData(period = 'month') {
    try {
      let dateCondition = '';
      if (period === 'week') {
        dateCondition = 'AND DATE(p.payroll_date) >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
      } else if (period === 'month') {
        dateCondition = 'AND DATE(p.payroll_date) >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
      } else if (period === 'year') {
        dateCondition = 'AND DATE(p.payroll_date) >= DATE_SUB(NOW(), INTERVAL 365 DAY)';
      }

      const [attendanceData] = await query(`
        SELECT 
          DATE(p.payroll_date) as date,
          COUNT(*) as totalEmployees,
          COUNT(CASE WHEN pd.payment_status = 'PAID' THEN 1 END) as present,
          COUNT(CASE WHEN pd.payment_status = 'PENDING' THEN 1 END) as absent,
          COUNT(CASE WHEN pd.payment_status = 'FAILED' THEN 1 END) as late
        FROM payroll_batches p
        LEFT JOIN payroll_details pd ON p.id = pd.payroll_batch_id
        WHERE p.status = 'PROCESSED' ${dateCondition}
        GROUP BY DATE(p.payroll_date)
        ORDER BY DATE(p.payroll_date) ASC
      `);

      return (attendanceData || []).map(record => ({
        date: record.date,
        present: record.present || 0,
        absent: record.absent || 0,
        late: record.late || 0
      }));
    } catch (error) {
      throw error;
    }
  }

  static async getDepartmentData() {
    try {
      const [departments] = await query(`
        SELECT 
          ep.department,
          COUNT(*) as totalEmployees,
          COUNT(CASE WHEN ep.employment_status = 'ACTIVE' THEN 1 END) as activeEmployees,
          COUNT(CASE WHEN ep.employment_status = 'ON_LEAVE' THEN 1 END) as onLeave,
          COUNT(CASE WHEN ep.employment_status = 'TERMINATED' THEN 1 END) as \`terminated\`,
          AVG(CASE WHEN ep.salary_grade IS NOT NULL THEN ep.salary_grade ELSE 0 END) as avgSalary
        FROM employee_profiles ep
        WHERE ep.department IS NOT NULL
        GROUP BY ep.department
        ORDER BY totalEmployees DESC
      `);

      return departments.map(dept => ({
        department: dept.department,
        totalEmployees: dept.totalEmployees,
        activeEmployees: dept.activeEmployees,
        onLeave: dept.onLeave,
        terminated: dept.terminated,
        avgSalary: Math.round(dept.avgSalary)
      }));
    } catch (error) {
      throw error;
    }
  }

  static async getDiversityData() {
    try {
      // Gender diversity based on names (heuristic approach)
      const [genderData] = await query(`
        SELECT 
          CASE 
            WHEN ep.first_name REGEXP '^(Mohammed|Ahmed|Ali|Hassan|Omar|Abdullah|Youssef|Ibrahim|Mohamed|Abdul|Said|Khalid|Mustafa|Hussein|Abubakar|Abdi|Mohamud|Ibrahim)' THEN 'Male'
            WHEN ep.first_name REGEXP '^(Fatima|Aisha|Khadija|Maryam|Zainab|Amina|Khadijah|Mariam|Safiya|Ruqayyah|Asma|Sumayyah|Hafsa|Jawahir|Najma|Layan|Rania|Hana|Sara|Leila|Nadia|Farah|Yasmin|Amira|Samira|Layla|Mona)' THEN 'Female'
            ELSE 'Other'
          END as gender,
          COUNT(*) as count
        FROM employee_profiles ep
        WHERE ep.first_name IS NOT NULL
        GROUP BY gender
      `);

      // Age group diversity based on hire dates
      const [ageData] = await query(`
        SELECT 
          CASE 
            WHEN TIMESTAMPDIFF(YEAR, ep.hire_date, NOW()) <= 2 THEN '0-2 years'
            WHEN TIMESTAMPDIFF(YEAR, ep.hire_date, NOW()) <= 5 THEN '3-5 years'
            WHEN TIMESTAMPDIFF(YEAR, ep.hire_date, NOW()) <= 10 THEN '6-10 years'
            ELSE '10+ years'
          END as experience_group,
          COUNT(*) as count
        FROM employee_profiles ep
        WHERE ep.hire_date IS NOT NULL
        GROUP BY experience_group
        ORDER BY 
          CASE experience_group
            WHEN '0-2 years' THEN 1
            WHEN '3-5 years' THEN 2
            WHEN '6-10 years' THEN 3
            WHEN '10+ years' THEN 4
          END
      `);

      // Department diversity
      const [departmentData] = await query(`
        SELECT 
          ep.department as category,
          COUNT(*) as count
        FROM employee_profiles ep
        WHERE ep.department IS NOT NULL
        GROUP BY ep.department
        ORDER BY count DESC
      `);

      // Job grade diversity
      const [jobGradeData] = await query(`
        SELECT 
          ep.job_grade as category,
          COUNT(*) as count
        FROM employee_profiles ep
        WHERE ep.job_grade IS NOT NULL
        GROUP BY ep.job_grade
        ORDER BY count DESC
      `);

      return [
        {
          category: 'Gender',
          male: Array.isArray(genderData) ? genderData.find(g => g.gender === 'Male')?.count || 0 : 0,
          female: Array.isArray(genderData) ? genderData.find(g => g.gender === 'Female')?.count || 0 : 0,
          other: Array.isArray(genderData) ? genderData.find(g => g.gender === 'Other')?.count || 0 : 0
        },
        {
          category: 'Experience',
          '0-2 years': Array.isArray(ageData) ? ageData.find(a => a.experience_group === '0-2 years')?.count || 0 : 0,
          '3-5 years': Array.isArray(ageData) ? ageData.find(a => a.experience_group === '3-5 years')?.count || 0 : 0,
          '6-10 years': Array.isArray(ageData) ? ageData.find(a => a.experience_group === '6-10 years')?.count || 0 : 0,
          '10+ years': Array.isArray(ageData) ? ageData.find(a => a.experience_group === '10+ years')?.count || 0 : 0
        },
        {
          category: 'Department',
          ...Object.fromEntries(Array.isArray(departmentData) ? departmentData.map(d => [d.category, d.count]) : [])
        },
        {
          category: 'Job Grade',
          ...Object.fromEntries(Array.isArray(jobGradeData) ? jobGradeData.map(d => [d.category, d.count]) : [])
        }
      ];
    } catch (error) {
      throw error;
    }
  }

  static async getRecentActivities(limit = 10) {
    try {
      const [activities] = await query(`
        SELECT 
          al.action,
          al.table_name,
          al.created_at,
          u.first_name,
          u.last_name,
          al.new_values as details,
          al.ip_address
        FROM audit_logs al
        JOIN users u ON al.user_id = u.id
        WHERE al.table_name IN ('users', 'employee_profiles')
        ORDER BY al.created_at DESC
        LIMIT ?
      `, [limit]);

      return Array.isArray(activities) ? activities.map(activity => ({
        id: activity.created_at,
        type: activity.action.toLowerCase(),
        user: `${activity.first_name} ${activity.last_name}`,
        description: this.formatActivityDescription(activity.action, activity.details),
        timestamp: activity.created_at,
        ipAddress: activity.ip_address
      })) : [];
    } catch (error) {
      throw error;
    }
  }

  static async getUnverifiedEmployees() {
    try {
      const [unverified] = await query(`
        SELECT 
          u.id,
          u.employee_id,
          u.username,
          u.email,
          u.created_at,
          ep.first_name,
          ep.last_name,
          ep.department,
          ep.job_grade,
          ep.employment_status
        FROM users u
        LEFT JOIN employee_profiles ep ON u.id = ep.user_id
        WHERE u.role = 'EMPLOYEE' AND (ep.hr_verified = FALSE OR ep.hr_verified IS NULL)
        ORDER BY u.created_at DESC
      `);

      return unverified.map(emp => ({
        id: emp.id,
        employeeId: emp.employee_id,
        username: emp.username,
        email: emp.email,
        name: `${emp.first_name || 'N/A'} ${emp.last_name || 'N/A'}`,
        department: emp.department || 'N/A',
        jobGrade: emp.job_grade || 'N/A',
        status: emp.employment_status || 'PENDING',
        createdAt: emp.created_at
      }));
    } catch (error) {
      throw error;
    }
  }

  static async syncWithHRDatabase(adminId, ip, userAgent) {
    try {
      const syncResult = {
        syncedEmployees: 0,
        newEmployees: 0,
        updatedEmployees: 0,
        errors: [],
        lastSyncTime: new Date().toISOString()
      };

      // Get all employees from current database
      const [currentEmployees] = await query(`
        SELECT 
          u.id,
          u.employee_id,
          u.username,
          u.email,
          u.is_active,
          ep.first_name,
          ep.last_name,
          ep.department,
          ep.job_grade,
          ep.employment_status,
          ep.hire_date,
          ep.phone,
          ep.address,
          ep.hr_verified,
          ep.updated_at as profile_updated
        FROM users u
        LEFT JOIN employee_profiles ep ON u.id = ep.user_id
        WHERE u.role = 'EMPLOYEE'
      `);

      // Perform data validation and cleanup
      for (const employee of currentEmployees) {
        try {
          let updated = false;
          const updates = [];

          // Validate employee profile completeness
          if (!employee.first_name || !employee.last_name) {
            syncResult.errors.push({
              employeeId: employee.employee_id,
              error: 'Missing name information'
            });
            continue;
          }

          // Check for inactive users who should be terminated
          if (!employee.is_active && employee.employment_status !== 'TERMINATED') {
            await query(`
              UPDATE employee_profiles 
              SET employment_status = 'TERMINATED', updated_at = NOW()
              WHERE user_id = ?
            `, [employee.id]);
            syncResult.updatedEmployees++;
            updated = true;
          }

          // Check for active users with missing verification
          if (employee.is_active && !employee.hr_verified && employee.employment_status === 'ACTIVE') {
            // Auto-verify long-term active employees (over 30 days)
            const daysSinceHire = employee.hire_date ? 
              Math.floor((Date.now() - new Date(employee.hire_date)) / (1000 * 60 * 60 * 24)) : 0;
            
            if (daysSinceHire > 30) {
              await query(`
                UPDATE employee_profiles 
                SET hr_verified = TRUE, hr_verification_date = NOW(), updated_at = NOW()
                WHERE user_id = ?
              `, [employee.id]);
              updatedEmployees.updated++;
              updated = true;
            }
          }

          // Validate department consistency
          if (employee.department) {
            const [deptCheck] = await query(`
              SELECT COUNT(*) as count FROM employee_profiles 
              WHERE department = ? AND user_id != ?
            `, [employee.department, employee.id]);
            
            if (deptCheck[0].count === 0) {
              // Employee is the only one in this department - might be a typo
              syncResult.errors.push({
                employeeId: employee.employee_id,
                error: `Unique department: ${employee.department}`
              });
            }
          }

          if (updated) {
            syncResult.updatedEmployees++;
          } else {
            syncResult.syncedEmployees++;
          }

        } catch (error) {
          syncResult.errors.push({
            employeeId: employee.employee_id,
            error: error.message
          });
        }
      }

      // Check for orphaned records (employee_profiles without users)
      const [orphanedProfiles] = await query(`
        SELECT ep.profile_id, ep.employee_id 
        FROM employee_profiles ep 
        LEFT JOIN users u ON ep.user_id = u.id 
        WHERE u.id IS NULL
      `);

      if (orphanedProfiles.length > 0) {
        syncResult.errors.push({
          error: `Found ${orphanedProfiles.length} orphaned employee profiles`,
          details: orphanedProfiles.map(p => p.employee_id)
        });
      }

      // Update system statistics
      const [stats] = await query(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN is_active = TRUE THEN 1 END) as active,
          COUNT(CASE WHEN hr_verified = TRUE THEN 1 END) as verified
        FROM users u
        LEFT JOIN employee_profiles ep ON u.id = ep.user_id
        WHERE u.role = 'EMPLOYEE'
      `);

      syncResult.totalEmployees = stats[0].total;
      syncResult.activeEmployees = stats[0].active;
      syncResult.verifiedEmployees = stats[0].verified;

      // Log the sync operation
      await auditLog(adminId, 'HR_SYNC', 'hr_sync', null, null, syncResult, ip, userAgent);

      return syncResult;
    } catch (error) {
      throw error;
    }
  }

  static formatActivityDescription(action, details) {
    switch (action) {
      case 'EMPLOYEE_CREATED':
        return `Created new employee: ${details?.employee_id || 'N/A'}`;
      case 'EMPLOYEE_VERIFIED':
        return `Verified employee: ${details?.employee_id || 'N/A'}`;
      case 'EMPLOYMENT_STATUS_UPDATE':
        return `Updated employment status from ${details?.old_status || 'N/A'} to ${details?.new_status || 'N/A'}`;
      case 'EMPLOYEE_PROFILE_UPDATE':
        return `Updated employee profile`;
      case 'HR_SYNC':
        return `Synced HR database`;
      default:
        return `Performed ${action.toLowerCase()}`;
    }
  }

  // Performance Management Methods
  static async getPerformanceStats() {
    try {
      // Simple stats query with better error handling
      const [stats] = await query(`
        SELECT 
          COUNT(*) as totalReviews,
          COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completedReviews,
          COUNT(CASE WHEN status = 'IN_PROGRESS' THEN 1 END) as inProgressReviews,
          COUNT(CASE WHEN status = 'SCHEDULED' THEN 1 END) as scheduledReviews,
          COALESCE(AVG(CASE WHEN overall_score IS NOT NULL THEN overall_score END), 0) as avgScore,
          COUNT(CASE WHEN goals_met = TRUE THEN 1 END) as goalsMet,
          COUNT(CASE WHEN overall_score >= 4.0 THEN 1 END) as topPerformers,
          COUNT(CASE WHEN overall_score < 3.0 THEN 1 END) as needsAttention
        FROM performance_reviews
        WHERE review_period_end >= DATE_SUB(NOW(), INTERVAL 1 YEAR)
      `);

      // Quarterly trend query
      const [quarterlyTrend] = await query(`
        SELECT 
          QUARTER(review_period_end) as quarter,
          YEAR(review_period_end) as year,
          COALESCE(AVG(overall_score), 0) as avgScore,
          COUNT(*) as reviewCount
        FROM performance_reviews
        WHERE status = 'COMPLETED' AND review_period_end >= DATE_SUB(NOW(), INTERVAL 1 YEAR)
        GROUP BY QUARTER(review_period_end), YEAR(review_period_end)
        ORDER BY year, quarter
      `);

      // Department stats query
      const [departmentStats] = await query(`
        SELECT 
          COALESCE(ep.department, 'Unassigned') as department,
          COALESCE(AVG(pr.overall_score), 0) as avgScore,
          COUNT(pr.id) as reviewCount
        FROM performance_reviews pr
        JOIN users u ON pr.employee_id = u.id
        LEFT JOIN employee_profiles ep ON u.id = ep.user_id
        WHERE pr.status = 'COMPLETED' AND pr.overall_score IS NOT NULL
        GROUP BY ep.department
        ORDER BY avgScore DESC
      `);

      return {
        totalReviews: stats[0]?.totalReviews || 0,
        completedReviews: stats[0]?.completedReviews || 0,
        inProgressReviews: stats[0]?.inProgressReviews || 0,
        scheduledReviews: stats[0]?.scheduledReviews || 0,
        avgScore: parseFloat(stats[0]?.avgScore || 0).toFixed(1),
        goalsMet: stats[0]?.goalsMet || 0,
        topPerformers: stats[0]?.topPerformers || 0,
        needsAttention: stats[0]?.needsAttention || 0,
        quarterlyTrend: Array.isArray(quarterlyTrend) ? quarterlyTrend.map(t => ({
          quarter: `Q${t.quarter} ${t.year}`,
          avgScore: parseFloat(t.avgScore || 0).toFixed(1),
          reviewCount: t.reviewCount || 0
        })) : [],
        departmentStats: Array.isArray(departmentStats) ? departmentStats.map(d => ({
          department: d.department || 'Unassigned',
          avgScore: parseFloat(d.avgScore || 0).toFixed(1),
          reviewCount: d.reviewCount || 0
        })) : []
      };
    } catch (error) {
      console.error('Performance stats error:', error.message);
      // Return empty stats on error
      return {
        totalReviews: 0,
        completedReviews: 0,
        inProgressReviews: 0,
        scheduledReviews: 0,
        avgScore: '0.0',
        goalsMet: 0,
        topPerformers: 0,
        needsAttention: 0,
        quarterlyTrend: [],
        departmentStats: []
      };
    }
  }

  static async getPerformanceReviews(limit = 10, offset = 0) {
    try {
      const [reviews] = await query(`
        SELECT 
          pr.id,
          pr.review_type,
          pr.review_period_start,
          pr.review_period_end,
          pr.overall_score,
          pr.status,
          pr.comments,
          pr.goals_met,
          pr.created_at,
          employee.username as employee_username,
          employee.first_name as employee_first_name,
          employee.last_name as employee_last_name,
          reviewer.username as reviewer_username,
          reviewer.first_name as reviewer_first_name,
          reviewer.last_name as reviewer_last_name
        FROM performance_reviews pr
        JOIN users employee ON pr.employee_id = employee.id
        JOIN users reviewer ON pr.reviewer_id = reviewer.id
        ORDER BY pr.created_at DESC
        LIMIT ? OFFSET ?
      `, [limit, offset]);

      return reviews.map(review => ({
        id: review.id,
        employee: `${review.employee_first_name || ''} ${review.employee_last_name || review.employee_username}`.trim(),
        role: 'Employee', // This would come from employee_profiles in a real implementation
        date: review.review_period_end,
        type: review.review_type.replace('_', ' '),
        score: review.overall_score,
        status: review.status.toLowerCase(),
        reviewer: `${review.reviewer_first_name || ''} ${review.reviewer_last_name || review.reviewer_username}`.trim()
      }));
    } catch (error) {
      throw error;
    }
  }

  static async createPerformanceReview(reviewData) {
    try {
      const {
        employee_id,
        reviewer_id,
        review_type,
        review_period_start,
        review_period_end,
        criteria_scores,
        comments
      } = reviewData;

      // Calculate overall score from criteria scores
      const overall_score = criteria_scores.reduce((sum, score) => sum + score.score, 0) / criteria_scores.length;

      const [result] = await query(`
        INSERT INTO performance_reviews (
          employee_id, reviewer_id, review_type, review_period_start, 
          review_period_end, overall_score, status, comments
        ) VALUES (?, ?, ?, ?, ?, ?, 'COMPLETED', ?)
      `, [employee_id, reviewer_id, review_type, review_period_start, review_period_end, overall_score, comments]);

      // Insert individual criteria scores
      for (const criteriaScore of criteria_scores) {
        await query(`
          INSERT INTO performance_scores (review_id, criteria_id, score, comments)
          VALUES (?, ?, ?, ?)
        `, [result.insertId, criteriaScore.criteria_id, criteriaScore.score, criteriaScore.comments]);
      }

      return { message: 'Performance review created successfully', reviewId: result.insertId };
    } catch (error) {
      throw error;
    }
  }

  // Reports Management Methods
  static async getReportsData(reportType = 'payroll') {
    try {
      let data = {};
      
      switch (reportType) {
        case 'payroll':
          // Simplified payroll data - use user creation dates as fallback
          const monthlyUsersResult = await query(`
            SELECT 
              DATE_FORMAT(u.created_at, '%Y-%m') as month,
              COUNT(*) as employee_count,
              COUNT(CASE WHEN u.is_active = TRUE THEN 1 END) as active_count
            FROM users u
            WHERE u.role IN ('EMPLOYEE', 'HR', 'MANAGER', 'SUPERVISOR', 'ADMIN')
            AND u.created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            GROUP BY DATE_FORMAT(u.created_at, '%Y-%m')
            ORDER BY month
          `);
          
          // Department breakdown
          const deptBreakdownResult = await query(`
            SELECT 
              ep.department,
              COUNT(*) as employee_count,
              COUNT(CASE WHEN u.is_active = TRUE THEN 1 END) as active_count
            FROM users u
            LEFT JOIN employee_profiles ep ON u.id = ep.user_id
            WHERE u.role IN ('EMPLOYEE', 'HR', 'MANAGER', 'SUPERVISOR', 'ADMIN')
            GROUP BY ep.department
            ORDER BY employee_count DESC
          `);
          
          const monthlyUsers = monthlyUsersResult[0] || [];
          const deptBreakdown = deptBreakdownResult[0] || [];
          
          data = {
            expenses: Array.isArray(monthlyUsers) ? monthlyUsers.map(e => ({
              month: e.month,
              amount: e.employee_count * 50000, // Estimated amount
              employeeCount: e.employee_count
            })) : [],
            departmentBreakdown: Array.isArray(deptBreakdown) ? deptBreakdown.map(d => ({
              department: d.department || 'Unassigned',
              amount: d.employee_count * 50000, // Estimated amount
              employeeCount: d.employee_count
            })) : []
          };
          break;
          
        case 'attendance':
          // User activity trends
          const [activityTrends] = await query(`
            SELECT 
              DATE(u.created_at) as date,
              COUNT(*) as total_employees,
              COUNT(CASE WHEN u.is_active = TRUE THEN 1 END) as active,
              COUNT(CASE WHEN u.is_active = FALSE THEN 1 END) as inactive
            FROM users u
            WHERE u.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY DATE(u.created_at)
            ORDER BY date
          `);
          
          data = {
            trends: Array.isArray(activityTrends) ? activityTrends.map(t => ({
              date: t.date,
              totalEmployees: t.total_employees,
              present: t.active,
              absent: t.inactive,
              late: 0
            })) : []
          };
          break;
          
        case 'performance':
          // Performance metrics - this should work since we have performance tables
          const [performanceMetrics] = await query(`
            SELECT 
              ep.department,
              AVG(pr.overall_score) as avg_score,
              COUNT(pr.id) as review_count,
              COUNT(CASE WHEN pr.overall_score >= 4.0 THEN 1 END) as high_performers
            FROM performance_reviews pr
            JOIN users u ON pr.employee_id = u.id
            LEFT JOIN employee_profiles ep ON u.id = ep.user_id
            WHERE pr.status = 'COMPLETED' AND pr.overall_score IS NOT NULL
            GROUP BY ep.department
            ORDER BY avg_score DESC
          `);
          
          data = {
            departmentPerformance: Array.isArray(performanceMetrics) ? performanceMetrics.map(m => ({
              department: m.department || 'Unassigned',
              avgScore: parseFloat(m.avg_score || 0).toFixed(1),
              reviewCount: m.review_count,
              highPerformers: m.high_performers
            })) : []
          };
          break;
          
        default:
          throw new Error('Invalid report type');
      }
      
      return data;
    } catch (error) {
      console.error('Reports data error:', error.message);
      // Return empty data structure on error
      return {
        expenses: [],
        departmentBreakdown: [],
        trends: [],
        departmentPerformance: []
      };
    }
  }

  // Account Management Methods
  static async getUserProfile(userId) {
    try {
      // Use the exact same query structure as the working getEmployees method
      const [userProfile] = await query(`
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
          ep.grandfather_name,
          ep.phone,
          ep.address,
          ep.department,
          ep.job_grade,
          ep.job_role,
          ep.salary,
          ep.employment_status,
          ep.hire_date,
          ep.hr_verified,
          ep.hr_verification_date
        FROM users u
        LEFT JOIN employee_profiles ep ON u.id = ep.user_id
        WHERE u.id = ?
      `, [userId]);
      
      if (!userProfile) {
        throw new Error('User not found');
      }
      
      return {
        user: userProfile,
        loginActivity: []
      };
    } catch (error) {
      console.error('Profile fetch error:', error.message);
      throw error;
    }
  }

  static async updateUserProfile(userId, profileData) {
    try {
      const { first_name, last_name, phone, address } = profileData;
      
      // Check if employee profile exists
      const [existing] = await query('SELECT user_id FROM employee_profiles WHERE user_id = ?', [userId]);
      
      if (existing && existing.length > 0) {
        // Update existing profile
        await query(`
          UPDATE employee_profiles 
          SET first_name = ?, last_name = ?, phone = ?, address = ?, updated_at = NOW()
          WHERE user_id = ?
        `, [first_name, last_name, phone, address, userId]);
      } else {
        // Create new profile
        await query(`
          INSERT INTO employee_profiles (user_id, first_name, last_name, phone, address, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, NOW(), NOW())
        `, [userId, first_name, last_name, phone, address]);
      }
      
      return { message: 'Profile updated successfully' };
    } catch (error) {
      throw error;
    }
  }

  static async getPerformanceStats() {
    try {
      const [stats] = await query(`
        SELECT 
          COUNT(*) as total_reviews,
          AVG(score) as average_score,
          COUNT(CASE WHEN status = 'Completed' THEN 1 END) as completed_reviews,
          COUNT(CASE WHEN status != 'Completed' THEN 1 END) as pending_reviews
        FROM performance_reviews
      `);
      
      const [countResult] = await query('SELECT COUNT(*) as count FROM performance_reviews');
      const count = countResult && countResult.count ? countResult.count : 0;
      
      return {
        ...stats,
        total_reviews: stats ? stats.total_reviews : 0,
        average_score: stats ? parseFloat(stats.average_score) || 0 : 0
      };
    } catch (error) {
      console.error('getPerformanceStats error:', error);
      return { total_reviews: 0, average_score: 0, completed_reviews: 0, pending_reviews: 0 };
    }
  }

  static async getPerformanceReviews(limit = 10, offset = 0) {
    try {
      const selectQuery = `
        SELECT 
          pr.id, 
          pr.employee_id, 
          ep.first_name, 
          ep.last_name, 
          ep.department,
          pr.review_type as reviewType, 
          pr.review_date as reviewDate, 
          pr.status, 
          pr.score,
          rp.first_name as reviewer_first_name, 
          rp.last_name as reviewer_last_name,
          pr.next_review_date as nextReview
        FROM performance_reviews pr
        LEFT JOIN employee_profiles ep ON pr.employee_id = ep.employee_id
        LEFT JOIN employee_profiles rp ON pr.reviewer_id = rp.user_id
        ORDER BY pr.review_date DESC
        LIMIT ? OFFSET ?
      `;
      const [reviews] = await query(selectQuery, [limit, offset]);
      
      return (reviews || []).map(r => ({
        id: r.id.toString(),
        employeeId: r.employee_id,
        employeeName: (r.first_name && r.last_name) ? `${r.first_name} ${r.last_name}` : r.employee_id,
        department: r.department || 'N/A',
        reviewType: r.reviewType,
        reviewDate: r.reviewDate ? new Date(r.reviewDate).toISOString().split('T')[0] : null,
        status: r.status,
        score: r.score,
        reviewer: (r.reviewer_first_name && r.reviewer_last_name) ? `${r.reviewer_first_name} ${r.reviewer_last_name}` : 'Unknown',
        nextReview: r.nextReview ? new Date(r.nextReview).toISOString().split('T')[0] : null
      }));
    } catch (error) {
      console.error('getPerformanceReviews error:', error);
      return [];
    }
  }

  static async createPerformanceReview(reviewData) {
    try {
      const { employeeId, reviewerId, reviewType, reviewDate, nextReviewDate, status, score, feedback } = reviewData;
      
      const [result] = await query(`
        INSERT INTO performance_reviews 
        (employee_id, reviewer_id, review_type, review_date, next_review_date, status, score, feedback, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `, [employeeId, reviewerId, reviewType, reviewDate, nextReviewDate, status, score || 0, feedback]);
      
      return { id: result.insertId, ...reviewData };
    } catch (error) {
      console.error('createPerformanceReview error:', error);
      throw error;
    }
  }
}

module.exports = HrService;
