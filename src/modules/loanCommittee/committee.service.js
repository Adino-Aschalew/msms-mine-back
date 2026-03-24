const { query } = require('../../config/database');
const { auditLog } = require('../../middleware/audit');
const NotificationService = require('../../services/notification.service');

class CommitteeService {
  static async getPendingApplications(page = 1, limit = 10, filters = {}) {
    try {
      const offset = (page - 1) * limit;
      let whereClause = 'WHERE la.status = "PENDING"';
      const params = [];
      
      if (filters.department) {
        whereClause += ' AND ep.department = ?';
        params.push(filters.department);
      }
      
      if (filters.min_amount) {
        whereClause += ' AND la.requested_amount >= ?';
        params.push(filters.min_amount);
      }
      
      if (filters.max_amount) {
        whereClause += ' AND la.requested_amount <= ?';
        params.push(filters.max_amount);
      }
      
      if (filters.risk_level) {
        whereClause += ' AND la.risk_level = ?';
        params.push(filters.risk_level);
      }
      
      if (filters.search) {
        whereClause += ' AND (la.purpose LIKE ? OR ep.first_name LIKE ? OR ep.last_name LIKE ? OR la.employee_id LIKE ?)';
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm);
      }
      
      const countQuery = `
        SELECT COUNT(*) as total
        FROM loan_applications la
        LEFT JOIN users u ON la.user_id = u.id
        LEFT JOIN employee_profiles ep ON u.id = ep.user_id
        ${whereClause}
      `;
      
      const selectQuery = `
        SELECT 
          la.*,
          u.username,
          u.email,
          ep.first_name,
          ep.last_name,
          ep.department,
          ep.job_grade,
          ep.employment_status,
          ep.hire_date,
          DATEDIFF(NOW(), ep.hire_date) as days_employed,
          (SELECT current_balance FROM savings_accounts WHERE user_id = la.user_id LIMIT 1) as savings_balance,
          (SELECT COUNT(*) FROM loans WHERE user_id = la.user_id AND status IN ('ACTIVE', 'OVERDUE')) as existing_loans,
          (SELECT AVG(l.outstanding_balance) FROM loans WHERE user_id = la.user_id AND status IN ('ACTIVE', 'OVERDUE')) as avg_balance,
          (SELECT COUNT(*) FROM loan_applications WHERE user_id = la.user_id AND status = 'APPROVED') as approved_count
        FROM loan_applications la
        LEFT JOIN users u ON la.user_id = u.id
        LEFT JOIN employee_profiles ep ON u.id = ep.user_id
        ${whereClause}
        ORDER BY la.created_at ASC
        LIMIT ? OFFSET ?
      `;
      
      const [countResult, applications] = await Promise.all([
        query(countQuery, params),
        query(selectQuery, [...params, limit, offset])
      ]);
      
      // Calculate risk scores for each application
      const applicationsWithRisk = await Promise.all(
        applications.map(async (app) => {
          const riskScore = await this.calculateRiskScore(app);
          return { ...app, risk_score: riskScore.score, risk_level: riskScore.level };
        })
      );
      
      return {
        applications: applicationsWithRisk,
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

  static async getApplicationById(applicationId) {
    try {
      const selectQuery = `
        SELECT 
          la.*,
          u.username,
          u.email,
          ep.first_name,
          ep.last_name,
          ep.department,
          ep.job_grade,
          ep.employment_status,
          ep.hire_date,
          ep.phone,
          ep.address,
          DATEDIFF(NOW(), ep.hire_date) as days_employed,
          (SELECT current_balance FROM savings_accounts WHERE user_id = la.user_id LIMIT 1) as savings_balance,
          (SELECT SUM(amount) FROM savings_transactions WHERE user_id = la.user_id AND transaction_type = 'CONTRIBUTION') as total_savings_contributions,
          (SELECT COUNT(*) FROM savings_transactions WHERE user_id = la.user_id AND transaction_type = 'WITHDRAWAL') as savings_withdrawals_count,
          (SELECT COUNT(*) FROM loans WHERE user_id = la.user_id AND status IN ('ACTIVE', 'OVERDUE')) as existing_loans,
          (SELECT AVG(l.outstanding_balance) FROM loans WHERE user_id = la.user_id AND status IN ('ACTIVE', 'OVERDUE')) as avg_balance,
          (SELECT COUNT(*) FROM loan_applications WHERE user_id = la.user_id AND status = 'APPROVED') as approved_count,
          g.guarantor_name,
          g.guarantor_id as guarantor_employee_id,
          g.monthly_income as guarantor_monthly_income,
          (SELECT current_balance FROM savings_accounts WHERE user_id = g.user_id LIMIT 1) as guarantor_savings_balance
        FROM loan_applications la
        LEFT JOIN users u ON la.user_id = u.id
        LEFT JOIN employee_profiles ep ON u.id = ep.user_id
        LEFT JOIN guarantors g ON la.id = g.loan_application_id
        WHERE la.id = ?
      `;
      
      const [applications] = await query(selectQuery, [applicationId]);
      const application = applications[0];
      
      if (!application) {
        throw new Error('Loan application not found');
      }
      
      // Parse guarantor details
      if (application.guarantor_details) {
        application.guarantor_details = JSON.parse(application.guarantor_details);
      }
      
      // Calculate risk score
      const riskScore = await this.calculateRiskScore(application);
      application.risk_score = riskScore.score;
      application.risk_level = riskScore.level;
      
      return application;
    } catch (error) {
      throw error;
    }
  }

  static async calculateRiskScore(application) {
    try {
      let score = 0;
      let deductions = [];
      
      // Employment stability (30 points)
      if (application.employment_status === 'ACTIVE') {
        score += 30;
      } else {
        deductions.push('Not actively employed');
      }
      
      // Employment duration (25 points)
      if (application.days_employed >= 365) {
        score += 25;
      } else if (application.days_employed >= 180) {
        score += 20;
      } else if (application.days_employed >= 90) {
        score += 15;
      } else if (application.days_employed >= 30) {
        score += 10;
      } else {
        deductions.push('Insufficient employment duration');
      }
      
      // Salary/Income Grade mapping (20 points)
      const monthlyIncome = parseFloat(application.monthly_income || 0);
      let incomeGrade = 0;
      if (monthlyIncome >= 20000) incomeGrade = 5;
      else if (monthlyIncome >= 15000) incomeGrade = 4;
      else if (monthlyIncome >= 10000) incomeGrade = 3;
      else if (monthlyIncome >= 5000) incomeGrade = 2;
      else if (monthlyIncome > 0) incomeGrade = 1;

      if (incomeGrade >= 5) {
        score += 20;
      } else if (incomeGrade >= 3) {
        score += 15;
      } else if (incomeGrade >= 2) {
        score += 10;
      } else if (incomeGrade >= 1) {
        score += 5;
      } else {
        deductions.push('Low salary grade');
      }
      
      // Loan amount ratio (15 points)
      const monthlyIncomeForRisk = parseFloat(application.monthly_income || 1000);
      const loanRatio = application.requested_amount / (monthlyIncomeForRisk * 12); // Ratio against annual income
      
      if (loanRatio <= 0.3) {
        score += 15;
      } else if (loanRatio <= 0.5) {
        score += 10;
      } else if (loanRatio <= 0.8) {
        score += 5;
      } else {
        deductions.push('Requested amount too high for income');
      }
      
      // Existing loans (10 points)
      if (application.existing_loans === 0) {
        score += 10;
      } else if (application.existing_loans === 1) {
        score += 5;
      } else {
        score += 0;
        deductions.push('Multiple existing loans');
      }
      
      // Payment history (10 points)
      if (application.approved_count > 0) {
        if (application.avg_balance < 5000) {
          score += 10;
        } else if (application.avg_balance < 20000) {
          score += 5;
        } else {
          score += 0;
          deductions.push('High outstanding balance on existing loans');
        }
      }
      
      // Determine risk level
      let level;
      if (score >= 80) {
        level = 'LOW';
      } else if (score >= 60) {
        level = 'MEDIUM';
      } else if (score >= 40) {
        level = 'HIGH';
      } else {
        level = 'CRITICAL';
      }
      
      return { score, level, deductions };
    } catch (error) {
      throw error;
    }
  }

  static async reviewApplication(applicationId, reviewData, reviewedBy, ip, userAgent) {
    try {
      const { decision, notes, approved_amount, approved_term_months, approved_interest_rate, conditions } = reviewData;
      
      const application = await this.getApplicationById(applicationId);
      
      if (application.status !== 'PENDING') {
        throw new Error('Application is not pending review');
      }
      
      let result;
      
      switch (decision) {
        case 'approve':
          result = await this.approveApplication(applicationId, approved_amount, approved_term_months, approved_interest_rate, conditions, reviewedBy, ip, userAgent);
          break;
          
        case 'reject':
          result = await this.rejectApplication(applicationId, notes, reviewedBy, ip, userAgent);
          break;
          
        case 'request_more_info':
          result = await this.requestMoreInfo(applicationId, notes, reviewedBy, ip, userAgent);
          break;
          
        default:
          throw new Error('Invalid decision');
      }
      
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async approveApplication(applicationId, approvedAmount, approvedTerm, approvedRate, conditions, reviewedBy, ip, userAgent) {
    try {
      const connection = require('../../config/database').transaction();
      
      try {
        // Update application status
        await connection.execute(`
          UPDATE loan_applications 
          SET status = 'APPROVED', reviewed_by = ?, reviewed_at = NOW(), review_notes = ?,
              approved_amount = ?, approved_term_months = ?, approved_interest_rate = ?, conditions = ?
          WHERE id = ?
        `, [reviewedBy, JSON.stringify({ conditions }), approvedAmount, approvedTerm, approvedRate, JSON.stringify(conditions || []), applicationId]);
        
        // Create loan record
        const nextPaymentDate = new Date();
        nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
        
        const [loanResult] = await connection.execute(`
          INSERT INTO loans (
            loan_application_id, user_id, employee_id, principal_amount, loan_amount, interest_rate,
            duration_months, monthly_repayment, remaining_balance, outstanding_balance, 
            next_payment_date, status, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 1 MONTH), 'ACTIVE', NOW())
        `, [
          applicationId, application.user_id, application.employee_id, approvedAmount, approvedAmount, approvedRate,
          approvedTerm, (approvedAmount * (1 + approvedRate/100) / approvedTerm), approvedAmount, approvedAmount
        ]);
        
        await connection.commit();
        
        // Log approval
        await auditLog(reviewedBy, 'LOAN_COMMITTEE_APPROVED', 'loan_applications', applicationId, null, {
          approved_amount: approvedAmount,
          approved_term_months: approvedTerm,
          approved_interest_rate: approvedRate,
          conditions
        }, ip, userAgent);
        
        // Send notifications
        await NotificationService.createNotification(
          application.user_id,
          'Loan Application Approved by Committee',
          `Your loan application for ${approvedAmount} has been approved by the loan committee.`,
          'SUCCESS'
        );
        
        // Send email
        if (application.email) {
          await NotificationService.sendEmail(
            application.email,
            'Loan Application Approved by Committee',
            `
              <h2>Loan Application Approved!</h2>
              <p>Dear ${application.first_name} ${application.last_name},</p>
              <p>Your loan application has been approved by the loan committee.</p>
              <p><strong>Approved Details:</strong></p>
              <ul>
                <li>Amount: ${approvedAmount}</li>
                <li>Term: ${approvedTerm} months</li>
                <li>Interest Rate: ${approvedRate}%</li>
                <li>Monthly Payment: ${application.monthly_payment}</li>
                ${conditions && conditions.length > 0 ? `<li>Conditions: ${conditions.join(', ')}</li>` : ''}
              </ul>
              <p>The funds will be disbursed to your account shortly.</p>
              <p>Best regards,<br>Loan Committee</p>
            `
          );
        }
        
        return {
          message: 'Application approved successfully',
          loanId: loanResult.insertId,
          approvedAmount,
          approvedTerm,
          approvedRate
        };
      } catch (error) {
        await connection.rollback();
        throw error;
      }
    } catch (error) {
      throw error;
    }
  }

  static async rejectApplication(applicationId, reason, reviewedBy, ip, userAgent) {
    try {
      const updated = await query(`
        UPDATE loan_applications 
        SET status = 'REJECTED', reviewed_by = ?, reviewed_at = NOW(), review_notes = ?
        WHERE id = ?
      `, [reviewedBy, reason, applicationId]);
      
      if (!updated) {
        throw new Error('Failed to reject application');
      }
      
      const application = await this.getApplicationById(applicationId);
      
      // Log rejection
      await auditLog(reviewedBy, 'LOAN_COMMITTEE_REJECTED', 'loan_applications', applicationId, null, { reason }, ip, userAgent);
      
      // Send notification to user
      await NotificationService.createNotification(
        application.user_id,
        'Loan Application Rejected by Committee',
        `Your loan application was rejected by the loan committee. Reason: ${reason}`,
        'ERROR'
      );
      
      // Send email
      if (application.email) {
        await NotificationService.sendEmail(
          application.email,
          'Loan Application Rejected by Committee',
          `
            <h2>Loan Application Rejected</h2>
            <p>Dear ${application.first_name} ${application.last_name},</p>
            <p>We regret to inform you that your loan application has been rejected by the loan committee.</p>
            <p><strong>Reason:</strong> ${reason}</p>
            <p>If you have any questions or would like to discuss this decision, please contact the loan committee.</p>
            <p>Best regards,<br>Loan Committee</p>
          `
        );
      }
      
      return { message: 'Application rejected successfully' };
    } catch (error) {
      throw error;
    }
  }

  static async requestMoreInfo(applicationId, requestedInfo, reviewedBy, ip, userAgent) {
    try {
      const updated = await query(`
        UPDATE loan_applications 
        SET status = 'UNDER_REVIEW', reviewed_by = ?, reviewed_at = NOW(), review_notes = ?
        WHERE id = ?
      `, [reviewedBy, JSON.stringify({ requested_info }), applicationId]);
      
      if (!updated) {
        throw new Error('Failed to request more information');
      }
      
      const application = await this.getApplicationById(applicationId);
      
      // Log request
      await auditLog(reviewedBy, 'LOAN_COMMITTEE_MORE_INFO', 'loan_applications', applicationId, null, { requestedInfo }, ip, userAgent);
      
      // Send notification to user
      await NotificationService.createNotification(
        application.user_id,
        'Additional Information Requested',
        'The loan committee has requested additional information for your application.',
        'INFO'
      );
      
      return { message: 'Additional information requested successfully' };
    } catch (error) {
      throw error;
    }
  }

  static async getCommitteeMeetings(page = 1, limit = 10, filters = {}) {
    try {
      const offset = (page - 1) * limit;
      let whereClause = 'WHERE 1=1';
      const params = [];
      
      if (filters.status) {
        whereClause += ' AND status = ?';
        params.push(filters.status);
      }
      
      if (filters.date_from) {
        whereClause += ' AND meeting_date >= ?';
        params.push(filters.date_from);
      }
      
      if (filters.date_to) {
        whereClause += ' AND meeting_date <= ?';
        params.push(filters.date_to);
      }
      
      const countQuery = `SELECT COUNT(*) as total FROM committee_meetings ${whereClause}`;
      
      const selectQuery = `
        SELECT 
          cm.*,
          u.username as created_by_name,
          ep.first_name as created_by_first_name,
          ep.last_name as created_by_last_name
        FROM committee_meetings cm
        LEFT JOIN users u ON cm.created_by = u.id
        LEFT JOIN employee_profiles ep ON u.id = ep.user_id
        ${whereClause}
        ORDER BY cm.meeting_date DESC
        LIMIT ? OFFSET ?
      `;
      
      const [countResult, meetings] = await Promise.all([
        query(countQuery, params),
        query(selectQuery, [...params, limit, offset])
      ]);
      
      return {
        meetings,
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

  static async createMeeting(meetingData, createdBy, ip, userAgent) {
    try {
      const { title, description, meeting_date, location, agenda } = meetingData;
      
      const insertQuery = `
        INSERT INTO committee_meetings (title, description, meeting_date, location, agenda, status, created_by, created_at)
        VALUES (?, ?, ?, ?, ?, 'SCHEDULED', ?, NOW())
      `;
      
      const result = await query(insertQuery, [title, description, meeting_date, location, JSON.stringify(agenda || []), createdBy]);
      
      // Log meeting creation
      await auditLog(createdBy, 'COMMITTEE_MEETING_CREATED', 'committee_meetings', result.insertId, null, meetingData, ip, userAgent);
      
      // Send notifications to committee members
      const committeeMembers = await this.getCommitteeMembers();
      
      for (const member of committeeMembers) {
        await NotificationService.createNotification(
          member.user_id,
          'Committee Meeting Scheduled',
          `A committee meeting has been scheduled: ${title} on ${meeting_date}`,
          'INFO'
        );
      }
      
      return {
        meetingId: result.insertId,
        message: 'Committee meeting scheduled successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  static async getCommitteeMembers() {
    try {
      const [members] = await query(`
        SELECT 
          u.id as user_id,
          u.username,
          u.email,
          ep.first_name,
          ep.last_name,
          ep.department,
          ep.job_grade
        FROM users u
        LEFT JOIN employee_profiles ep ON u.id = ep.user_id
        WHERE u.role = 'LOAN_COMMITTEE'
        AND u.is_active = TRUE
        ORDER BY ep.last_name, ep.first_name
      `);
      
      return members;
    } catch (error) {
      throw error;
    }
  }

  static async getCommitteeStats() {
    try {
      const [stats] = await query(`
        SELECT 
          COUNT(*) as total_members,
          COUNT(CASE WHEN u.is_active = TRUE THEN 1 END) as active_members
        FROM users u
        WHERE u.role = 'LOAN_COMMITTEE'
      `);
      
      const [meetingStats] = await query(`
        SELECT 
          COUNT(*) as total_meetings,
          COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed_meetings,
          COUNT(CASE WHEN status = 'SCHEDULED' THEN 1 END) as scheduled_meetings,
          COUNT(CASE WHEN status = 'CANCELLED' THEN 1 END) as cancelled_meetings
        FROM committee_meetings
      `);
      
      const [applicationStats] = await query(`
        SELECT 
          COUNT(*) as total_applications,
          COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending_applications,
          COUNT(CASE WHEN status = 'APPROVED' THEN 1 END) as approved_applications,
          COUNT(CASE WHEN status = 'REJECTED' THEN 1 END) as rejected_applications
        FROM loan_applications
      `);
      
      return {
        members: stats[0],
        meetings: meetingStats[0],
        applications: applicationStats[0]
      };
    } catch (error) {
      throw error;
    }
  }

  static async getApplicationHistory(applicationId) {
    try {
      const [history] = await query(`
        SELECT 
          la.*,
          u.username as reviewer_name,
          ep.first_name as reviewer_first_name,
          ep.last_name as reviewer_last_name
        FROM audit_logs la
        LEFT JOIN users u ON la.user_id = u.id
        LEFT JOIN employee_profiles ep ON u.id = ep.user_id
        WHERE la.record_id = ? AND la.table_name = 'loan_applications'
        ORDER BY la.created_at DESC
      `, [applicationId]);
      
      return history;
    } catch (error) {
      throw error;
    }
  }

  static async getCommitteeWorkload(memberId, period = 'MONTHLY') {
    try {
      const dateFilter = this.getDateFilter(period);
      
      const [workload] = await query(`
        SELECT 
          COUNT(*) as applications_reviewed,
          COUNT(CASE WHEN la.action = 'APPROVED' THEN 1 END) as applications_approved,
          COUNT(CASE WHEN la.action = 'REJECTED' THEN 1 END) as applications_rejected,
          COUNT(CASE WHEN la.action = 'REQUEST_MORE_INFO' THEN 1 END) as info_requested
        FROM audit_logs la
        WHERE la.user_id = ? AND la.table_name = 'loan_applications'
        ${dateFilter}
      `, [memberId]);
      
      return workload[0] || {
        applications_reviewed: 0,
        applications_approved: 0,
        applications_rejected: 0,
        info_requested: 0
      };
    } catch (error) {
      throw error;
    }
  }

  static async getApprovedApplications(page = 1, limit = 10, filters = {}) {
    try {
      const offset = (page - 1) * limit;
      let whereClause = "WHERE la.status = 'APPROVED'";
      const params = [];

      const selectQuery = `
        SELECT 
          la.id,
          CONCAT(ep.first_name, ' ', ep.last_name) as employee,
          ep.department,
          la.approved_amount as approvedAmount,
          la.reviewed_at as approvedDate,
          l.monthly_repayment as installmentAmount,
          l.duration_months as repaymentPeriod,
          la.status
        FROM loan_applications la
        LEFT JOIN employee_profiles ep ON la.user_id = ep.user_id
        LEFT JOIN loans l ON la.id = l.loan_application_id
        ${whereClause}
        ORDER BY la.reviewed_at DESC
        LIMIT ? OFFSET ?
      `;

      const applications = await query(selectQuery, [...params, limit, offset]);
      return applications;
    } catch (error) {
      throw error;
    }
  }

  static async disburseLoan(applicationId, reviewedBy, ip, userAgent) {
    try {
      const connection = require('../../config/database').transaction();
      try {
        await connection.execute(`
          UPDATE loan_applications SET status = 'DISBURSED' WHERE id = ?
        `, [applicationId]);

        await connection.execute(`
          UPDATE loans SET disbursement_date = NOW() WHERE loan_application_id = ?
        `, [applicationId]);

        await connection.commit();

        await auditLog(reviewedBy, 'LOAN_DISBURSED', 'loan_applications', applicationId, null, { action: 'DISBURSE' }, ip, userAgent);

        return { message: 'Loan disbursed successfully' };
      } catch (error) {
        await connection.rollback();
        throw error;
      }
    } catch (error) {
      throw error;
    }
  }

  static getDateFilter(period) {
    switch (period) {
      case 'DAILY':
        return 'AND DATE(la.created_at) = CURDATE()';
      case 'WEEKLY':
        return 'AND YEARWEEK(la.created_at) = YEARWEEK(CURDATE()) AND WEEK(la.created_at) = YEARWEEK(CURDATE())';
      case 'MONTHLY':
        return 'AND DATE_FORMAT(la.created_at, "%Y-%m") = DATE_FORMAT(CURDATE(), "%Y-%m")';
      case 'QUARTERLY':
        return 'AND QUARTER(la.created_at) = QUARTER(CURDATE(), YEAR(CURDATE()))';
      case 'YEARLY':
        return 'AND YEAR(la.created_at) = YEAR(CURDATE())';
      default:
        return '';
    }
  }
}

module.exports = CommitteeService;
