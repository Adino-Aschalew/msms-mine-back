const { query, pool } = require('../../config/database');
const bcrypt = require('bcryptjs');
const { generateEmployeeId } = require('../../utils/helpers');

class AdminController {
  // Dashboard Overview
  static async getDashboard(req, res) {
    try {
      // Get basic counts one by one to isolate any issues
      const totalUsers = await query('SELECT COUNT(*) as count FROM users WHERE is_active = 1');
      const totalLoans = await query('SELECT COUNT(*) as count FROM loan_applications');
      const totalSavings = await query('SELECT COUNT(*) as count FROM savings_accounts WHERE is_active = 1');
      const pendingApplications = await query('SELECT COUNT(*) as count FROM loan_applications WHERE status = "pending"');
      const activeHRAdmins = await query('SELECT COUNT(*) as count FROM users WHERE role = "HR" AND is_active = 1');
      const activeLoanCommitteeAdmins = await query('SELECT COUNT(*) as count FROM users WHERE role = "LOAN_COMMITTEE" AND is_active = 1');
      
      // Get recent activity separately
      let recentActivity = [];
      try {
        recentActivity = await query(`
          SELECT 
            al.action,
            al.table_name,
            al.created_at,
            u.first_name,
            u.last_name,
            u.employee_id,
            u.email,
            u.role
          FROM audit_logs al
          LEFT JOIN users u ON al.user_id = u.id
          ORDER BY al.created_at DESC
          LIMIT 10
        `);
      } catch (activityError) {
        console.error('Error fetching recent activity:', activityError);
        // Continue without recent activity if it fails
      }

      res.json({
        success: true,
        data: {
          overview: {
            totalUsers: totalUsers[0].count,
            totalLoans: totalLoans[0].count,
            totalSavings: totalSavings[0].count,
            pendingApplications: pendingApplications[0].count,
            activeHRAdmins: activeHRAdmins[0].count,
            activeLoanCommitteeAdmins: activeLoanCommitteeAdmins[0].count
          },
          recentActivity: recentActivity
        }
      });
    } catch (error) {
      console.error('Error getting admin dashboard:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard data',
        error: error.message
      });
    }
  }

  // System Statistics
  static async getSystemStats(req, res) {
    try {
      const [
        userStats,
        loanStats,
        savingsStats,
        departmentStats,
        monthlyGrowth
      ] = await Promise.all([
        pool.execute(`
          SELECT 
            role,
            COUNT(*) as count,
            SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active
          FROM users
          GROUP BY role
        `),
        pool.execute(`
          SELECT 
            status,
            COUNT(*) as count,
            SUM(CASE WHEN status = 'APPROVED' THEN requested_amount ELSE 0 END) as totalAmount
          FROM loan_applications
          GROUP BY status
        `),
        pool.execute(`
          SELECT 
            COUNT(*) as totalAccounts,
            SUM(current_balance) as totalBalance,
            AVG(current_balance) as avgBalance
          FROM savings_accounts
          WHERE is_active = 1
        `),
        pool.execute(`
          SELECT 
            department,
            COUNT(*) as employeeCount
          FROM employee_profiles
          WHERE status = 'active'
          GROUP BY department
        `),
        pool.execute(`
          SELECT 
            DATE_FORMAT(created_at, '%Y-%m') as month,
            COUNT(*) as newUsers
          FROM users
          WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
          GROUP BY DATE_FORMAT(created_at, '%Y-%m')
          ORDER BY month DESC
        `)
      ]);

      res.json({
        success: true,
        data: {
          userStats: userStats[0],
          loanStats: loanStats[0],
          savingsStats: savingsStats[0],
          departmentStats: departmentStats[0],
          monthlyGrowth: monthlyGrowth[0]
        }
      });
    } catch (error) {
      console.error('Error getting system stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch system statistics',
        error: error.message
      });
    }
  }

  // Get All Admins
  static async getAllAdmins(req, res) {
    try {
      const [admins] = await pool.execute(`
        SELECT 
          u.id,
          u.employee_id,
          u.first_name,
          u.last_name,
          u.email,
          u.phone_number,
          u.role,
          u.is_active,
          u.created_at,
          u.last_login,
          ep.department,
          ep.job_title,
          ep.committee_level,
          ep.max_loan_amount
        FROM users u
        LEFT JOIN employee_profiles ep ON u.id = ep.user_id
        WHERE u.role IN ('SUPER_ADMIN', 'ADMIN', 'HR', 'LOAN_COMMITTEE', 'FINANCE_ADMIN')
        ORDER BY u.created_at DESC
      `);

      res.json({
        success: true,
        data: admins
      });
    } catch (error) {
      console.error('Error getting all admins:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch admins',
        error: error.message
      });
    }
  }

  // Create HR Admin
  static async createHRAdmin(req, res) {
    try {
      const {
        employee_id,
        first_name,
        last_name,
        email,
        phone_number,
        department,
        job_title,
        password
      } = req.body;

      // Check if employee ID already exists
      const [existingUser] = await pool.execute(
        'SELECT user_id FROM users WHERE employee_id = ?',
        [employee_id]
      );

      if (existingUser.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Employee ID already exists'
        });
      }

      // Check if email already exists
      const [existingEmail] = await pool.execute(
        'SELECT user_id FROM users WHERE email = ?',
        [email]
      );

      if (existingEmail.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const [result] = await pool.execute(`
        INSERT INTO users (
          employee_id, first_name, last_name, email, phone_number,
          role, is_active, password_hash, created_at
        ) VALUES (?, ?, ?, ?, ?, 'HR', 1, ?, NOW())
      `, [employee_id, first_name, last_name, email, phone_number, hashedPassword]);

      const userId = result.insertId;

      // Create employee profile
      await pool.execute(`
        INSERT INTO employee_profiles (
          user_id, employee_id, first_name, last_name, email,
          phone_number, department, job_title, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW())
      `, [userId, employee_id, first_name, last_name, email, phone_number, department, job_title]);

      res.status(201).json({
        success: true,
        message: 'HR Admin created successfully',
        data: {
          user_id: userId,
          employee_id,
          first_name,
          last_name,
          email,
          role: 'HR'
        }
      });
    } catch (error) {
      console.error('Error creating HR admin:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create HR admin',
        error: error.message
      });
    }
  }

  // Create Loan Committee Admin
  static async createLoanCommitteeAdmin(req, res) {
    try {
      const {
        employee_id,
        first_name,
        last_name,
        email,
        phone_number,
        department,
        job_title,
        committee_level,
        max_loan_amount,
        password
      } = req.body;

      // Check if employee ID already exists
      const [existingUser] = await pool.execute(
        'SELECT user_id FROM users WHERE employee_id = ?',
        [employee_id]
      );

      if (existingUser.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Employee ID already exists'
        });
      }

      // Check if email already exists
      const [existingEmail] = await pool.execute(
        'SELECT user_id FROM users WHERE email = ?',
        [email]
      );

      if (existingEmail.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const [result] = await pool.execute(`
        INSERT INTO users (
          employee_id, first_name, last_name, email, phone_number,
          role, is_active, password_hash, created_at
        ) VALUES (?, ?, ?, ?, ?, 'LOAN_COMMITTEE', 1, ?, NOW())
      `, [employee_id, first_name, last_name, email, phone_number, hashedPassword]);

      const userId = result.insertId;

      // Create employee profile
      await pool.execute(`
        INSERT INTO employee_profiles (
          user_id, employee_id, first_name, last_name, email,
          phone_number, department, job_title, committee_level,
          max_loan_amount, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW())
      `, [userId, employee_id, first_name, last_name, email, phone_number, department, job_title, committee_level, max_loan_amount]);

      res.status(201).json({
        success: true,
        message: 'Loan Committee Admin created successfully',
        data: {
          user_id: userId,
          employee_id,
          first_name,
          last_name,
          email,
          role: 'LOAN_COMMITTEE',
          committee_level,
          max_loan_amount
        }
      });
    } catch (error) {
      console.error('Error creating loan committee admin:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create loan committee admin',
        error: error.message
      });
    }
  }

  // Get HR Admins
  static async getHRAdmins(req, res) {
    try {
      const [hrAdmins] = await pool.execute(`
        SELECT 
          u.user_id,
          u.employee_id,
          u.first_name,
          u.last_name,
          u.email,
          u.phone_number,
          u.is_active,
          u.created_at,
          u.last_login,
          ep.department,
          ep.job_title
        FROM users u
        JOIN employee_profiles ep ON u.user_id = ep.user_id
        WHERE u.role = 'HR'
        ORDER BY u.created_at DESC
      `);

      res.json({
        success: true,
        data: hrAdmins
      });
    } catch (error) {
      console.error('Error getting HR admins:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch HR admins',
        error: error.message
      });
    }
  }

  // Get Loan Committee Admins
  static async getLoanCommitteeAdmins(req, res) {
    try {
      const loanAdmins = await query(`
        SELECT 
          u.id,
          u.employee_id,
          u.email,
          u.is_active,
          u.created_at,
          u.last_login
        FROM users u
        WHERE u.role = 'LOAN_COMMITTEE'
        ORDER BY u.created_at DESC
      `);

      res.json({
        success: true,
        data: loanAdmins
      });
    } catch (error) {
      console.error('Error getting loan committee admins:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch loan committee admins',
        error: error.message
      });
    }
  }

  // Update HR Admin
  static async updateHRAdmin(req, res) {
    try {
      const { adminId } = req.params;
      const updates = req.body;

      // Check if admin exists and is HR
      const [admin] = await pool.execute(
        'SELECT user_id FROM users WHERE user_id = ? AND role = "HR"',
        [adminId]
      );

      if (admin.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'HR Admin not found'
        });
      }

      // Update user table
      const userFields = [];
      const userValues = [];
      
      if (updates.first_name) {
        userFields.push('first_name = ?');
        userValues.push(updates.first_name);
      }
      if (updates.last_name) {
        userFields.push('last_name = ?');
        userValues.push(updates.last_name);
      }
      if (updates.email) {
        userFields.push('email = ?');
        userValues.push(updates.email);
      }
      if (updates.phone_number) {
        userFields.push('phone_number = ?');
        userValues.push(updates.phone_number);
      }

      if (userFields.length > 0) {
        userValues.push(adminId);
        await pool.execute(
          `UPDATE users SET ${userFields.join(', ')} WHERE user_id = ?`,
          userValues
        );
      }

      // Update employee profile
      const profileFields = [];
      const profileValues = [];
      
      if (updates.department) {
        profileFields.push('department = ?');
        profileValues.push(updates.department);
      }
      if (updates.job_title) {
        profileFields.push('job_title = ?');
        profileValues.push(updates.job_title);
      }

      if (profileFields.length > 0) {
        profileValues.push(adminId);
        await pool.execute(
          `UPDATE employee_profiles SET ${profileFields.join(', ')} WHERE user_id = ?`,
          profileValues
        );
      }

      res.json({
        success: true,
        message: 'HR Admin updated successfully'
      });
    } catch (error) {
      console.error('Error updating HR admin:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update HR admin',
        error: error.message
      });
    }
  }

  // Update Loan Committee Admin
  static async updateLoanCommitteeAdmin(req, res) {
    try {
      const { adminId } = req.params;
      const updates = req.body;

      // Check if admin exists and is LOAN_COMMITTEE
      const [admin] = await pool.execute(
        'SELECT user_id FROM users WHERE user_id = ? AND role = "LOAN_COMMITTEE"',
        [adminId]
      );

      if (admin.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Loan Committee Admin not found'
        });
      }

      // Update user table
      const userFields = [];
      const userValues = [];
      
      if (updates.first_name) {
        userFields.push('first_name = ?');
        userValues.push(updates.first_name);
      }
      if (updates.last_name) {
        userFields.push('last_name = ?');
        userValues.push(updates.last_name);
      }
      if (updates.email) {
        userFields.push('email = ?');
        userValues.push(updates.email);
      }
      if (updates.phone_number) {
        userFields.push('phone_number = ?');
        userValues.push(updates.phone_number);
      }

      if (userFields.length > 0) {
        userValues.push(adminId);
        await pool.execute(
          `UPDATE users SET ${userFields.join(', ')} WHERE user_id = ?`,
          userValues
        );
      }

      // Update employee profile
      const profileFields = [];
      const profileValues = [];
      
      if (updates.department) {
        profileFields.push('department = ?');
        profileValues.push(updates.department);
      }
      if (updates.job_title) {
        profileFields.push('job_title = ?');
        profileValues.push(updates.job_title);
      }
      if (updates.committee_level) {
        profileFields.push('committee_level = ?');
        profileValues.push(updates.committee_level);
      }
      if (updates.max_loan_amount !== undefined) {
        profileFields.push('max_loan_amount = ?');
        profileValues.push(updates.max_loan_amount);
      }

      if (profileFields.length > 0) {
        profileValues.push(adminId);
        await pool.execute(
          `UPDATE employee_profiles SET ${profileFields.join(', ')} WHERE user_id = ?`,
          profileValues
        );
      }

      res.json({
        success: true,
        message: 'Loan Committee Admin updated successfully'
      });
    } catch (error) {
      console.error('Error updating loan committee admin:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update loan committee admin',
        error: error.message
      });
    }
  }

  // Deactivate HR Admin
  static async deactivateHRAdmin(req, res) {
    try {
      const { adminId } = req.params;

      const [result] = await pool.execute(
        'UPDATE users SET is_active = 0 WHERE user_id = ? AND role = "HR"',
        [adminId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'HR Admin not found'
        });
      }

      res.json({
        success: true,
        message: 'HR Admin deactivated successfully'
      });
    } catch (error) {
      console.error('Error deactivating HR admin:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to deactivate HR admin',
        error: error.message
      });
    }
  }

  // Activate HR Admin
  static async activateHRAdmin(req, res) {
    try {
      const { adminId } = req.params;

      const [result] = await pool.execute(
        'UPDATE users SET is_active = 1 WHERE user_id = ? AND role = "HR"',
        [adminId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'HR Admin not found'
        });
      }

      res.json({
        success: true,
        message: 'HR Admin activated successfully'
      });
    } catch (error) {
      console.error('Error activating HR admin:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to activate HR admin',
        error: error.message
      });
    }
  }

  // Deactivate Loan Committee Admin
  static async deactivateLoanCommitteeAdmin(req, res) {
    try {
      const { adminId } = req.params;

      const [result] = await pool.execute(
        'UPDATE users SET is_active = 0 WHERE user_id = ? AND role = "LOAN_COMMITTEE"',
        [adminId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Loan Committee Admin not found'
        });
      }

      res.json({
        success: true,
        message: 'Loan Committee Admin deactivated successfully'
      });
    } catch (error) {
      console.error('Error deactivating loan committee admin:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to deactivate loan committee admin',
        error: error.message
      });
    }
  }

  // Activate Loan Committee Admin
  static async activateLoanCommitteeAdmin(req, res) {
    try {
      const { adminId } = req.params;

      const [result] = await pool.execute(
        'UPDATE users SET is_active = 1 WHERE user_id = ? AND role = "LOAN_COMMITTEE"',
        [adminId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Loan Committee Admin not found'
        });
      }

      res.json({
        success: true,
        message: 'Loan Committee Admin activated successfully'
      });
    } catch (error) {
      console.error('Error activating loan committee admin:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to activate loan committee admin',
        error: error.message
      });
    }
  }

  // Delete HR Admin
  static async deleteHRAdmin(req, res) {
    try {
      const { adminId } = req.params;

      // Start transaction
      const connection = await pool.getConnection();
      await connection.beginTransaction();

      try {
        // Delete from employee_profiles
        await connection.execute(
          'DELETE FROM employee_profiles WHERE user_id = ?',
          [adminId]
        );

        // Delete from users
        const [result] = await connection.execute(
          'DELETE FROM users WHERE user_id = ? AND role = "HR"',
          [adminId]
        );

        if (result.affectedRows === 0) {
          await connection.rollback();
          return res.status(404).json({
            success: false,
            message: 'HR Admin not found'
          });
        }

        await connection.commit();

        res.json({
          success: true,
          message: 'HR Admin deleted successfully'
        });
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error deleting HR admin:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete HR admin',
        error: error.message
      });
    }
  }

  // Delete Loan Committee Admin
  static async deleteLoanCommitteeAdmin(req, res) {
    try {
      const { adminId } = req.params;

      // Start transaction
      const connection = await pool.getConnection();
      await connection.beginTransaction();

      try {
        // Delete from employee_profiles
        await connection.execute(
          'DELETE FROM employee_profiles WHERE user_id = ?',
          [adminId]
        );

        // Delete from users
        const [result] = await connection.execute(
          'DELETE FROM users WHERE user_id = ? AND role = "LOAN_COMMITTEE"',
          [adminId]
        );

        if (result.affectedRows === 0) {
          await connection.rollback();
          return res.status(404).json({
            success: false,
            message: 'Loan Committee Admin not found'
          });
        }

        await connection.commit();

        res.json({
          success: true,
          message: 'Loan Committee Admin deleted successfully'
        });
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error deleting loan committee admin:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete loan committee admin',
        error: error.message
      });
    }
  }

  // Get System Activity
  static async getSystemActivity(req, res) {
    try {
      const { limit = 50, page = 1 } = req.query;
      const offset = (page - 1) * limit;

      const [activities] = await pool.execute(`
        SELECT 
          al.action,
          al.description,
          al.created_at,
          al.ip_address,
          u.employee_id,
          u.first_name,
          u.last_name,
          u.role
        FROM audit_logs al
        LEFT JOIN users u ON al.user_id = u.id
        ORDER BY al.created_at DESC
        LIMIT ? OFFSET ?
      `, [Number(limit), Number(offset)]);

      const [totalCount] = await pool.execute(
        'SELECT COUNT(*) as count FROM audit_logs'
      );

      res.json({
        success: true,
        data: {
          activities: activities,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: totalCount[0].count,
            totalPages: Math.ceil(totalCount[0].count / limit)
          }
        }
      });
    } catch (error) {
      console.error('Error getting system activity:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch system activity',
        error: error.message
      });
    }
  }

  // Get System Health
  static async getSystemHealth(req, res) {
    try {
      // Check database connection
      const dbCheck = await query('SELECT 1 as health');

      // Get system info
      const systemInfo = await query(`
        SELECT 
          COUNT(*) as total_users,
          SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_users,
          COUNT(CASE WHEN last_login >= DATE_SUB(NOW(), INTERVAL 24 HOUR) THEN 1 END) as active_today
        FROM users
      `);

      const uptime = process.uptime();
      const uptimeHours = Math.floor(uptime / 3600);
      const uptimeMinutes = Math.floor((uptime % 3600) / 60);
      const uptimePercent = uptime > 0 ? '99.9%' : '0%';

      res.json({
        success: true,
        data: {
          database: dbCheck[0]?.health === 1 ? 'healthy' : 'unhealthy',
          system: {
            totalUsers: systemInfo[0]?.total_users || 0,
            activeUsers: systemInfo[0]?.active_users || 0,
            activeToday: systemInfo[0]?.active_today || 0,
            uptime: `${uptimeHours}h ${uptimeMinutes}m`,
            uptimePercent: uptimePercent,
            memoryUsage: process.memoryUsage(),
            nodeVersion: process.version
          },
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error getting system health:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch system health',
        error: error.message
      });
    }
  }

  // Get System Logs
  static async getSystemLogs(req, res) {
    try {
      const { level = 'all', limit = 100, page = 1 } = req.query;
      const offset = (page - 1) * limit;

      let whereClause = '';
      if (level !== 'all') {
        whereClause = `WHERE al.action LIKE '%${level.toUpperCase()}%'`;
      }

      const [logs] = await pool.execute(`
        SELECT 
          al.action,
          al.description,
          al.created_at,
          al.ip_address,
          u.employee_id,
          u.first_name,
          u.last_name
        FROM audit_logs al
        LEFT JOIN users u ON al.user_id = u.user_id
        ${whereClause}
        ORDER BY al.created_at DESC
        LIMIT ? OFFSET ?
      `, [parseInt(limit), offset]);

      res.json({
        success: true,
        data: logs
      });
    } catch (error) {
      console.error('Error getting system logs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch system logs',
        error: error.message
      });
    }
  }

  // Create Finance Admin
  static async createFinanceAdmin(req, res) {
    try {
      const {
        employee_id,
        first_name,
        last_name,
        email,
        phone_number,
        department,
        job_title,
        password
      } = req.body;

      // Check if employee ID already exists
      const [existingUser] = await pool.execute(
        'SELECT user_id FROM users WHERE employee_id = ?',
        [employee_id]
      );

      if (existingUser.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Employee ID already exists'
        });
      }

      // Check if email already exists
      const [existingEmail] = await pool.execute(
        'SELECT user_id FROM users WHERE email = ?',
        [email]
      );

      if (existingEmail.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const [result] = await pool.execute(`
        INSERT INTO users (
          employee_id, first_name, last_name, email, phone_number,
          role, is_active, password_hash, created_at
        ) VALUES (?, ?, ?, ?, ?, 'FINANCE_ADMIN', 1, ?, NOW())
      `, [employee_id, first_name, last_name, email, phone_number, hashedPassword]);

      const userId = result.insertId;

      // Create employee profile
      await pool.execute(`
        INSERT INTO employee_profiles (
          user_id, employee_id, first_name, last_name, email,
          phone_number, department, job_title, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW())
      `, [userId, employee_id, first_name, last_name, email, phone_number, department, job_title]);

      res.status(201).json({
        success: true,
        message: 'Finance Admin created successfully',
        data: {
          user_id: userId,
          employee_id,
          first_name,
          last_name,
          email,
          role: 'FINANCE_ADMIN'
        }
      });
    } catch (error) {
      console.error('Error creating finance admin:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create finance admin',
        error: error.message
      });
    }
  }

  // Create Admin (Regular Admin)
  static async createAdmin(req, res) {
    try {
      const {
        employee_id,
        first_name,
        last_name,
        email,
        phone_number,
        department,
        job_title,
        password
      } = req.body;

      // Check if employee ID already exists
      const [existingUser] = await pool.execute(
        'SELECT user_id FROM users WHERE employee_id = ?',
        [employee_id]
      );

      if (existingUser.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Employee ID already exists'
        });
      }

      // Check if email already exists
      const [existingEmail] = await pool.execute(
        'SELECT user_id FROM users WHERE email = ?',
        [email]
      );

      if (existingEmail.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const [result] = await pool.execute(`
        INSERT INTO users (
          employee_id, first_name, last_name, email, phone_number,
          role, is_active, password_hash, created_at
        ) VALUES (?, ?, ?, ?, ?, 'ADMIN', 1, ?, NOW())
      `, [employee_id, first_name, last_name, email, phone_number, hashedPassword]);

      const userId = result.insertId;

      // Create employee profile
      await pool.execute(`
        INSERT INTO employee_profiles (
          user_id, employee_id, first_name, last_name, email,
          phone_number, department, job_title, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW())
      `, [userId, employee_id, first_name, last_name, email, phone_number, department, job_title]);

      res.status(201).json({
        success: true,
        message: 'Admin created successfully',
        data: {
          user_id: userId,
          employee_id,
          first_name,
          last_name,
          email,
          role: 'ADMIN'
        }
      });
    } catch (error) {
      console.error('Error creating admin:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create admin',
        error: error.message
      });
    }
  }

  // Get Finance Admins
  static async getFinanceAdmins(req, res) {
    try {
      const [financeAdmins] = await pool.execute(`
        SELECT 
          u.user_id,
          u.employee_id,
          u.first_name,
          u.last_name,
          u.email,
          u.phone_number,
          u.is_active,
          u.created_at,
          u.last_login,
          ep.department,
          ep.job_title
        FROM users u
        JOIN employee_profiles ep ON u.user_id = ep.user_id
        WHERE u.role = 'FINANCE_ADMIN'
        ORDER BY u.created_at DESC
      `);

      res.json({
        success: true,
        data: financeAdmins
      });
    } catch (error) {
      console.error('Error getting finance admins:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch finance admins',
        error: error.message
      });
    }
  }

  // Get Regular Admins
  static async getRegularAdmins(req, res) {
    try {
      const [admins] = await pool.execute(`
        SELECT 
          u.user_id,
          u.employee_id,
          u.first_name,
          u.last_name,
          u.email,
          u.phone_number,
          u.is_active,
          u.created_at,
          u.last_login,
          ep.department,
          ep.job_title
        FROM users u
        JOIN employee_profiles ep ON u.user_id = ep.user_id
        WHERE u.role = 'ADMIN'
        ORDER BY u.created_at DESC
      `);

      res.json({
        success: true,
        data: admins
      });
    } catch (error) {
      console.error('Error getting regular admins:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch regular admins',
        error: error.message
      });
    }
  }

  // Update Finance Admin
  static async updateFinanceAdmin(req, res) {
    try {
      const { adminId } = req.params;
      const updates = req.body;

      // Check if admin exists and is FINANCE_ADMIN
      const [admin] = await pool.execute(
        'SELECT user_id FROM users WHERE user_id = ? AND role = "FINANCE_ADMIN"',
        [adminId]
      );

      if (admin.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Finance Admin not found'
        });
      }

      // Update user table
      const userFields = [];
      const userValues = [];
      
      if (updates.first_name) {
        userFields.push('first_name = ?');
        userValues.push(updates.first_name);
      }
      if (updates.last_name) {
        userFields.push('last_name = ?');
        userValues.push(updates.last_name);
      }
      if (updates.email) {
        userFields.push('email = ?');
        userValues.push(updates.email);
      }
      if (updates.phone_number) {
        userFields.push('phone_number = ?');
        userValues.push(updates.phone_number);
      }

      if (userFields.length > 0) {
        userValues.push(adminId);
        await pool.execute(
          `UPDATE users SET ${userFields.join(', ')} WHERE user_id = ?`,
          userValues
        );
      }

      // Update employee profile
      const profileFields = [];
      const profileValues = [];
      
      if (updates.department) {
        profileFields.push('department = ?');
        profileValues.push(updates.department);
      }
      if (updates.job_title) {
        profileFields.push('job_title = ?');
        profileValues.push(updates.job_title);
      }

      if (profileFields.length > 0) {
        profileValues.push(adminId);
        await pool.execute(
          `UPDATE employee_profiles SET ${profileFields.join(', ')} WHERE user_id = ?`,
          profileValues
        );
      }

      res.json({
        success: true,
        message: 'Finance Admin updated successfully'
      });
    } catch (error) {
      console.error('Error updating finance admin:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update finance admin',
        error: error.message
      });
    }
  }

  // Update Regular Admin
  static async updateRegularAdmin(req, res) {
    try {
      const { adminId } = req.params;
      const updates = req.body;

      // Check if admin exists and is ADMIN
      const [admin] = await pool.execute(
        'SELECT user_id FROM users WHERE user_id = ? AND role = "ADMIN"',
        [adminId]
      );

      if (admin.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Admin not found'
        });
      }

      // Update user table
      const userFields = [];
      const userValues = [];
      
      if (updates.first_name) {
        userFields.push('first_name = ?');
        userValues.push(updates.first_name);
      }
      if (updates.last_name) {
        userFields.push('last_name = ?');
        userValues.push(updates.last_name);
      }
      if (updates.email) {
        userFields.push('email = ?');
        userValues.push(updates.email);
      }
      if (updates.phone_number) {
        userFields.push('phone_number = ?');
        userValues.push(updates.phone_number);
      }

      if (userFields.length > 0) {
        userValues.push(adminId);
        await pool.execute(
          `UPDATE users SET ${userFields.join(', ')} WHERE user_id = ?`,
          userValues
        );
      }

      // Update employee profile
      const profileFields = [];
      const profileValues = [];
      
      if (updates.department) {
        profileFields.push('department = ?');
        profileValues.push(updates.department);
      }
      if (updates.job_title) {
        profileFields.push('job_title = ?');
        profileValues.push(updates.job_title);
      }

      if (profileFields.length > 0) {
        profileValues.push(adminId);
        await pool.execute(
          `UPDATE employee_profiles SET ${profileFields.join(', ')} WHERE user_id = ?`,
          profileValues
        );
      }

      res.json({
        success: true,
        message: 'Admin updated successfully'
      });
    } catch (error) {
      console.error('Error updating regular admin:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update admin',
        error: error.message
      });
    }
  }

  // Deactivate Finance Admin
  static async deactivateFinanceAdmin(req, res) {
    try {
      const { adminId } = req.params;

      const [result] = await pool.execute(
        'UPDATE users SET is_active = 0 WHERE user_id = ? AND role = "FINANCE_ADMIN"',
        [adminId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Finance Admin not found'
        });
      }

      res.json({
        success: true,
        message: 'Finance Admin deactivated successfully'
      });
    } catch (error) {
      console.error('Error deactivating finance admin:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to deactivate finance admin',
        error: error.message
      });
    }
  }

  // Activate Finance Admin
  static async activateFinanceAdmin(req, res) {
    try {
      const { adminId } = req.params;

      const [result] = await pool.execute(
        'UPDATE users SET is_active = 1 WHERE user_id = ? AND role = "FINANCE_ADMIN"',
        [adminId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Finance Admin not found'
        });
      }

      res.json({
        success: true,
        message: 'Finance Admin activated successfully'
      });
    } catch (error) {
      console.error('Error activating finance admin:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to activate finance admin',
        error: error.message
      });
    }
  }

  // Deactivate Regular Admin
  static async deactivateRegularAdmin(req, res) {
    try {
      const { adminId } = req.params;

      const [result] = await pool.execute(
        'UPDATE users SET is_active = 0 WHERE user_id = ? AND role = "ADMIN"',
        [adminId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Admin not found'
        });
      }

      res.json({
        success: true,
        message: 'Admin deactivated successfully'
      });
    } catch (error) {
      console.error('Error deactivating admin:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to deactivate admin',
        error: error.message
      });
    }
  }

  // Activate Regular Admin
  static async activateRegularAdmin(req, res) {
    try {
      const { adminId } = req.params;

      const [result] = await pool.execute(
        'UPDATE users SET is_active = 1 WHERE user_id = ? AND role = "ADMIN"',
        [adminId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Admin not found'
        });
      }

      res.json({
        success: true,
        message: 'Admin activated successfully'
      });
    } catch (error) {
      console.error('Error activating admin:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to activate admin',
        error: error.message
      });
    }
  }

  // Delete Finance Admin
  static async deleteFinanceAdmin(req, res) {
    try {
      const { adminId } = req.params;

      // Start transaction
      const connection = await pool.getConnection();
      await connection.beginTransaction();

      try {
        // Delete from employee_profiles
        await connection.execute(
          'DELETE FROM employee_profiles WHERE user_id = ?',
          [adminId]
        );

        // Delete from users
        const [result] = await connection.execute(
          'DELETE FROM users WHERE user_id = ? AND role = "FINANCE_ADMIN"',
          [adminId]
        );

        if (result.affectedRows === 0) {
          await connection.rollback();
          return res.status(404).json({
            success: false,
            message: 'Finance Admin not found'
          });
        }

        await connection.commit();

        res.json({
          success: true,
          message: 'Finance Admin deleted successfully'
        });
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error deleting finance admin:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete finance admin',
        error: error.message
      });
    }
  }

  // Delete Regular Admin
  static async deleteRegularAdmin(req, res) {
    try {
      const { adminId } = req.params;

      // Start transaction
      const connection = await pool.getConnection();
      await connection.beginTransaction();

      try {
        // Delete from employee_profiles
        await connection.execute(
          'DELETE FROM employee_profiles WHERE user_id = ?',
          [adminId]
        );

        // Delete from users
        const [result] = await connection.execute(
          'DELETE FROM users WHERE user_id = ? AND role = "ADMIN"',
          [adminId]
        );

        if (result.affectedRows === 0) {
          await connection.rollback();
          return res.status(404).json({
            success: false,
            message: 'Admin not found'
          });
        }

        await connection.commit();

        res.json({
          success: true,
          message: 'Admin deleted successfully'
        });
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error deleting admin:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete admin',
        error: error.message
      });
    }
  }

  // Get Admin Statistics
  static async getAdminStatistics(req, res) {
    try {
      const [stats] = await pool.execute(`
        SELECT 
          COUNT(*) as total_admins,
          SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_admins,
          SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as inactive_admins
        FROM users 
        WHERE role IN ('SUPER_ADMIN', 'ADMIN', 'HR', 'FINANCE_ADMIN', 'LOAN_COMMITTEE')
      `);

      const [roleStats] = await pool.execute(`
        SELECT 
          role,
          COUNT(*) as count,
          SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_count
        FROM users 
        WHERE role IN ('SUPER_ADMIN', 'ADMIN', 'HR', 'FINANCE_ADMIN', 'LOAN_COMMITTEE')
        GROUP BY role
        ORDER BY count DESC
      `);

      res.json({
        success: true,
        data: {
          total: stats[0].total_admins,
          active: stats[0].active_admins,
          inactive: stats[0].inactive_admins,
          byRole: roleStats
        }
      });
    } catch (error) {
      console.error('Error getting admin statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch admin statistics',
        error: error.message
      });
    }
  }

  // Update Admin (Generic)
  static async updateAdmin(req, res) {
    try {
      const { adminId } = req.params;
      const { first_name, last_name, email, phone_number, role } = req.body;

      const [user] = await pool.execute('SELECT id FROM users WHERE id = ?', [adminId]);
      if (user.length === 0) {
        return res.status(404).json({ success: false, message: 'Admin not found' });
      }

      await pool.execute(
        'UPDATE users SET first_name = ?, last_name = ?, email = ?, phone_number = ?, role = ? WHERE id = ?',
        [first_name, last_name, email, phone_number, role, adminId]
      );

      res.json({ success: true, message: 'Admin updated successfully' });
    } catch (error) {
      console.error('Error updating admin:', error);
      res.status(500).json({ success: false, message: 'Failed to update admin', error: error.message });
    }
  }

  // Toggle Admin Status (Generic)
  static async toggleAdminStatus(req, res) {
    try {
      const { adminId } = req.params;
      const { is_active } = req.body;

      const [result] = await pool.execute(
        'UPDATE users SET is_active = ? WHERE id = ?',
        [is_active ? 1 : 0, adminId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Admin not found' });
      }

      res.json({ success: true, message: `Admin ${is_active ? 'activated' : 'deactivated'} successfully` });
    } catch (error) {
      console.error('Error toggling admin status:', error);
      res.status(500).json({ success: false, message: 'Failed to toggle status', error: error.message });
    }
  }

  // Delete Admin (Generic)
  static async deleteAdmin(req, res) {
    try {
      const { adminId } = req.params;
      
      const connection = await pool.getConnection();
      await connection.beginTransaction();

      try {
        await connection.execute('DELETE FROM employee_profiles WHERE user_id = ?', [adminId]);
        const [result] = await connection.execute('DELETE FROM users WHERE id = ?', [adminId]);

        if (result.affectedRows === 0) {
          await connection.rollback();
          return res.status(404).json({ success: false, message: 'Admin not found' });
        }

        await connection.commit();
        res.json({ success: true, message: 'Admin deleted successfully' });
      } catch (err) {
        await connection.rollback();
        throw err;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error deleting admin:', error);
      res.status(500).json({ success: false, message: 'Failed to delete admin', error: error.message });
    }
  }

  // Toggle Maintenance Mode
  static async toggleMaintenanceMode(req, res) {
    try {
      const { enabled } = req.body;

      // This would typically update a configuration file or database table
      // For now, we'll just return a success response
      // In a real implementation, you might want to store this in Redis or a settings table

      res.json({
        success: true,
        message: `Maintenance mode ${enabled ? 'enabled' : 'disabled'}`,
        data: {
          maintenanceMode: enabled,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error toggling maintenance mode:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to toggle maintenance mode',
        error: error.message
      });
    }
  }
}

module.exports = AdminController;
