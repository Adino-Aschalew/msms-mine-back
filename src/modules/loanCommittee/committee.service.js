const { query } = require('../../config/database');
const { auditLog } = require('../../middleware/audit');
const NotificationService = require('../../services/notification.service');

class CommitteeService {
  static async getPendingApplications(page = 1, limit = 10, filters = {}) {
    try {
      console.log('🔍 getPendingApplications called with:', { page, limit, filters });
      const offset = (page - 1) * limit;
      let whereClause = 'WHERE la.status IN ("PENDING", "UNDER_REVIEW")';
      const params = [];

      if (filters.department && filters.department !== 'undefined') {
        whereClause += ' AND ep.department = ?';
        params.push(filters.department);
      }

      if (filters.min_amount && filters.min_amount !== 'undefined') {
        whereClause += ' AND la.requested_amount >= ?';
        params.push(filters.min_amount);
      }

      if (filters.max_amount && filters.max_amount !== 'undefined') {
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
          ep.salary as monthly_income,
          DATEDIFF(NOW(), ep.hire_date) as days_employed,
          (SELECT current_balance FROM savings_accounts WHERE user_id = la.user_id LIMIT 1) as savings_balance,
          (SELECT COUNT(*) FROM loans WHERE user_id = la.user_id AND status IN ('ACTIVE', 'OVERDUE')) as existing_loans,
          (SELECT AVG(outstanding_balance) FROM loans WHERE user_id = la.user_id AND status IN ('ACTIVE', 'OVERDUE')) as avg_balance,
          (SELECT COUNT(*) FROM loan_applications WHERE user_id = la.user_id AND status = 'APPROVED') as approved_count
        FROM loan_applications la
        LEFT JOIN users u ON la.user_id = u.id
        LEFT JOIN employee_profiles ep ON u.id = ep.user_id
        ${whereClause}
        ORDER BY la.created_at ASC
        LIMIT ? OFFSET ?
      `;

      console.log('🔍 SQL Query:', selectQuery);
      console.log('🔍 SQL Params:', [...params, limit, offset]);

      const [countResult, applications] = await Promise.all([
        query(countQuery, params),
        query(selectQuery, [...params, limit, offset])
      ]);

      console.log('🔍 Pending applications count:', countResult[0].total);
      console.log('🔍 Pending applications found:', applications.length);

      const applicationsWithRisk = applications.length > 0 ? await Promise.all(
        applications.map(async (app) => {
          const riskScore = await this.calculateRiskScore(app);
          return { ...app, risk_score: riskScore.score, risk_level: riskScore.level };
        })
      ) : [];

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
          (SELECT AVG(outstanding_balance) FROM loans WHERE user_id = la.user_id AND status IN ('ACTIVE', 'OVERDUE')) as avg_balance,
          (SELECT COUNT(*) FROM loan_applications WHERE user_id = la.user_id AND status = 'APPROVED') as approved_count
        FROM loan_applications la
        LEFT JOIN users u ON la.user_id = u.id
        LEFT JOIN employee_profiles ep ON u.id = ep.user_id
        WHERE la.id = ?
        LIMIT 1
      `;

      const applications = await query(selectQuery, [applicationId]);
      const application = applications[0];

      if (!application) {
        throw new Error('Loan application not found');
      }

      const guarantorsQuery = `
        SELECT
          g.id,
          g.guarantor_name,
          g.guarantor_id as guarantor_employee_id,
          g.relationship,
          g.status as guarantor_status,
          g.contact_email,
          g.contact_phone,
          g.monthly_income as guarantor_monthly_income,
          (SELECT current_balance FROM savings_accounts WHERE user_id = g.user_id LIMIT 1) as guarantor_savings_balance,
          ep.first_name as guarantor_first_name,
          ep.last_name as guarantor_last_name
        FROM guarantors g
        LEFT JOIN employee_profiles ep ON g.guarantor_id = ep.employee_id
        WHERE g.loan_application_id = ?
      `;

      const guarantors = await query(guarantorsQuery, [applicationId]);
      application.guarantors = guarantors;

      if (application.guarantor_details) {
        application.guarantor_details = JSON.parse(application.guarantor_details);
      }


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


      if (application.employment_status === 'ACTIVE') {
        score += 30;
      } else {
        deductions.push('Not actively employed');
      }


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


      const monthlyIncomeForRisk = parseFloat(application.monthly_income || 1000);
      const loanRatio = application.requested_amount / (monthlyIncomeForRisk * 12);

      if (loanRatio <= 0.3) {
        score += 15;
      } else if (loanRatio <= 0.5) {
        score += 10;
      } else if (loanRatio <= 0.8) {
        score += 5;
      } else {
        deductions.push('Requested amount too high for income');
      }


      if (application.existing_loans === 0) {
        score += 10;
      } else if (application.existing_loans === 1) {
        score += 5;
      } else {
        score += 0;
        deductions.push('Multiple existing loans');
      }


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
      let { decision, action, notes, approved_amount, approved_term_months, approved_interest_rate, conditions } = reviewData;


      const actionType = (decision || action || '').toString().toLowerCase();

      const application = await this.getApplicationById(applicationId);

      if (application.status !== 'PENDING' && application.status !== 'UNDER_REVIEW') {
        throw new Error('Application is not pending review');
      }

      let result;

      switch (actionType) {
        case 'approve':
        case 'approved':
          result = await this.approveApplication(applicationId, approved_amount, approved_term_months, approved_interest_rate, conditions, reviewedBy, ip, userAgent);
          break;

        case 'reject':
        case 'rejected':
          result = await this.rejectApplication(applicationId, notes, reviewedBy, ip, userAgent);
          break;

        case 'request_more_info':
        case 'more_info':
          result = await this.requestMoreInfo(applicationId, notes, reviewedBy, ip, userAgent);
          break;

        default:
          throw new Error('Invalid decision: ' + actionType);
      }

      return result;
    } catch (error) {
      throw error;
    }
  }

  static async approveApplication(applicationId, approvedAmount, approvedTerm, approvedRate, conditions, reviewedBy, ip, userAgent) {
    try {
      const { query, transaction } = require('../../config/database');

      console.log('Approving application:', {
        applicationId,
        approvedAmount,
        approvedTerm,
        approvedRate,
        conditions,
        reviewedBy
      });

      const result = await transaction(async (connection) => {

        const [applications] = await connection.execute('SELECT * FROM loan_applications WHERE id = ?', [applicationId]);
        const application = applications[0];

        if (!application) {
          throw new Error('Application not found');
        }

        const [guarantors] = await connection.execute(
          'SELECT status FROM guarantors WHERE loan_application_id = ?',
          [applicationId]
        );

        // Only block if a guarantor has explicitly REJECTED the request
        const rejectedGuarantors = guarantors.filter(g => g.status === 'REJECTED');
        if (rejectedGuarantors.length > 0) {
          throw new Error('Cannot approve loan: One or more guarantors have rejected the request.');
        }
        // No guarantors, or pending guarantors — committee can still approve


        const finalAmount = approvedAmount || application.requested_amount;
        const finalTerm = approvedTerm || application.repayment_duration_months;
        const finalRate = approvedRate || 5.0;
        const finalConditions = conditions || [];

        console.log('Using values:', {
          finalAmount,
          finalTerm,
          finalRate,
          finalConditions
        });


        const updateQuery = `
          UPDATE loan_applications
          SET status = 'APPROVED',
              reviewed_by = ?,
              review_date = NOW(),
              review_comments = ?,
              approved_amount = ?,
              approved_term_months = ?
          WHERE id = ?
        `;
        const updateParams = [
          reviewedBy,
          JSON.stringify({ approved_amount: finalAmount, approved_term: finalTerm, approved_rate: finalRate, conditions: finalConditions }),
          finalAmount,
          finalTerm,
          applicationId
        ];

        console.log('Update query:', updateQuery);
        console.log('Update params:', updateParams);

        await connection.execute(updateQuery, updateParams);

        console.log('Application approved, ready for disbursement');

        return {
          applicationId,
          application,
          message: 'Loan application approved successfully. Ready for disbursement.'
        };
      });

      const application = result.application;


      await auditLog(reviewedBy, 'LOAN_COMMITTEE_APPROVED', 'loan_applications', applicationId, null, {
        approved_amount: approvedAmount,
        approved_term_months: approvedTerm,
        approved_interest_rate: approvedRate,
        conditions
      }, ip, userAgent);


      await NotificationService.createNotification(
        application.user_id,
        'Loan Application Approved by Committee',
        `Your loan application for ${approvedAmount} has been approved by the loan committee.`,
        'SUCCESS'
      );


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
        loanId: result.loanId,
        approvedAmount,
        approvedTerm,
        approvedRate
      };
    } catch (error) {
      throw error;
    }
  }

  static async rejectApplication(applicationId, reason, reviewedBy, ip, userAgent) {
    try {
      const updated = await query(`
        UPDATE loan_applications 
        SET status = 'REJECTED', reviewed_by = ?, review_date = NOW(), review_comments = ?
        WHERE id = ?
      `, [reviewedBy, reason, applicationId]);

      if (!updated) {
        throw new Error('Failed to reject application');
      }

      const application = await this.getApplicationById(applicationId);


      await auditLog(reviewedBy, 'LOAN_COMMITTEE_REJECTED', 'loan_applications', applicationId, null, { reason }, ip, userAgent);


      await NotificationService.createNotification(
        application.user_id,
        'Loan Application Rejected by Committee',
        `Your loan application was rejected by the loan committee. Reason: ${reason}`,
        'ERROR'
      );


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
        SET status = 'UNDER_REVIEW', reviewed_by = ?, review_date = NOW(), review_comments = ?
        WHERE id = ?
      `, [reviewedBy, JSON.stringify({ requested_info: requestedInfo }), applicationId]);

      if (!updated) {
        throw new Error('Failed to request more information');
      }

      const application = await this.getApplicationById(applicationId);


      await auditLog(reviewedBy, 'LOAN_COMMITTEE_MORE_INFO', 'loan_applications', applicationId, null, { requestedInfo }, ip, userAgent);


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


      await auditLog(createdBy, 'COMMITTEE_MEETING_CREATED', 'committee_meetings', result.insertId, null, meetingData, ip, userAgent);


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
      const members = await query(`
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
      const stats = await query(`
        SELECT 
          COUNT(*) as total_members,
          COUNT(CASE WHEN u.is_active = TRUE THEN 1 END) as active_members
        FROM users u
        WHERE u.role = 'LOAN_COMMITTEE'
      `);

      const meetingStats = await query(`
        SELECT 
          COUNT(*) as total_meetings,
          COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed_meetings,
          COUNT(CASE WHEN status = 'SCHEDULED' THEN 1 END) as scheduled_meetings,
          COUNT(CASE WHEN status = 'CANCELLED' THEN 1 END) as cancelled_meetings
        FROM committee_meetings
      `);

      const applicationStats = await query(`
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
      const history = await query(`
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

      const workload = await query(`
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
          la.*,
          u.username,
          u.email,
          ep.first_name,
          ep.last_name,
          ep.department,
          ep.job_grade,
          ep.employment_status,
          ep.hire_date,
          ep.salary as monthly_income,
          DATEDIFF(NOW(), ep.hire_date) as days_employed,
          (SELECT current_balance FROM savings_accounts WHERE user_id = la.user_id LIMIT 1) as savings_balance,
          (SELECT COUNT(*) FROM loans WHERE user_id = la.user_id AND status IN ('ACTIVE', 'OVERDUE')) as existing_loans,
          (SELECT AVG(outstanding_balance) FROM loans WHERE user_id = la.user_id AND status IN ('ACTIVE', 'OVERDUE')) as avg_balance,
          (SELECT COUNT(*) FROM loan_applications WHERE user_id = la.user_id AND status = 'APPROVED') as approved_count,
          l.monthly_repayment,
          l.duration_months,
          l.outstanding_balance
        FROM loan_applications la
        LEFT JOIN users u ON la.user_id = u.id
        LEFT JOIN employee_profiles ep ON u.id = ep.user_id
        LEFT JOIN loans l ON la.id = l.loan_application_id
        ${whereClause}
        ORDER BY la.review_date DESC
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
      const { query, transaction } = require('../../config/database');

      const result = await transaction(async (connection) => {
        const [applications] = await connection.execute(
          'SELECT * FROM loan_applications WHERE id = ?',
          [applicationId]
        );
        const application = applications[0];

        if (!application) {
          throw new Error('Application not found');
        }

        if (application.status !== 'APPROVED') {
          throw new Error('Loan application must be approved before disbursement');
        }

        const approvedAmount = parseFloat(application.approved_amount || application.requested_amount || 0);
        const approvedTerm = parseInt(application.approved_term_months || application.repayment_duration_months || 0);
        const approvedRate = parseFloat(application.approved_interest_rate || 5.0);

        if (approvedTerm <= 0) {
          throw new Error('Invalid loan term (must be greater than 0)');
        }

        const monthlyRepayment = approvedAmount * (1 + approvedRate / 100) / approvedTerm;
        const totalInterest = approvedAmount * (approvedRate / 100);
        const totalRepayment = approvedAmount + totalInterest;
        const maturityDate = new Date();
        maturityDate.setMonth(maturityDate.getMonth() + approvedTerm);

        const loanQuery = `
          INSERT INTO loans (
            loan_application_id, user_id, employee_id, principal_amount, interest_rate,
            total_interest, total_repayment, monthly_repayment, remaining_balance,
            disbursement_date, maturity_date, status, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, 'ACTIVE', NOW())
        `;
        const loanParams = [
          applicationId,
          application.user_id,
          application.employee_id,
          approvedAmount,
          approvedRate,
          totalInterest,
          totalRepayment,
          monthlyRepayment,
          approvedAmount,
          maturityDate.toISOString().split('T')[0]
        ];

        const [loanResult] = await connection.execute(loanQuery, loanParams);

        await connection.execute(`
          UPDATE loan_applications SET status = 'DISBURSED', disbursement_date = NOW() WHERE id = ?
        `, [applicationId]);

        return {
          loanId: loanResult.insertId,
          applicationId,
          userId: application.user_id,
          approvedAmount,
          message: 'Loan disbursed successfully'
        };
      });

      await auditLog(reviewedBy, 'LOAN_DISBURSED', 'loan_applications', applicationId, null, {
        loanId: result.loanId,
        approvedAmount: result.approvedAmount
      }, ip, userAgent);

      await NotificationService.createNotification(
        result.userId,
        'Loan Disbursed',
        `Your loan of ${result.approvedAmount} ETB has been disbursed successfully.`,
        'SUCCESS'
      );

      return result;
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
      case 'ALL_TIME':
        return '';
      default:
        return '';
    }
  }

  static async getRepaymentSchedule(loanId) {
    try {
      // First get the loan details
      const loanRows = await query(`
        SELECT l.*, la.purpose, la.requested_amount,
          CONCAT(ep.first_name, ' ', ep.last_name) as employee_name
        FROM loans l
        LEFT JOIN loan_applications la ON l.loan_application_id = la.id
        LEFT JOIN users u ON l.user_id = u.id
        LEFT JOIN employee_profiles ep ON u.id = ep.user_id
        WHERE l.id = ? OR l.loan_application_id = ?
        LIMIT 1
      `, [loanId, loanId]);

      const loan = loanRows[0];
      if (!loan) {
        return { loan: null, schedule: [] };
      }

      // Get actual repayment records
      const repayments = await query(`
        SELECT 
          lr.id,
          lr.repayment_date as due_date,
          lr.amount,
          lr.interest_amount,
          lr.principal_amount,
          lr.status,
          lr.payment_date,
          lr.remaining_balance as balance
        FROM loan_repayments lr
        WHERE lr.loan_id = ?
        ORDER BY lr.repayment_date ASC
      `, [loan.id]);

      // If no repayment records exist, generate a projected schedule
      if (repayments.length === 0) {
        const termMonths = parseInt(loan.duration_months || loan.loan_term_months || 12);
        const principal = parseFloat(loan.principal_amount || loan.remaining_balance || 0);
        const monthlyPayment = parseFloat(loan.monthly_repayment || (principal / termMonths));
        const schedule = [];
        let runningBalance = principal;

        for (let i = 1; i <= termMonths; i++) {
          const dueDate = new Date(loan.disbursement_date || loan.created_at);
          dueDate.setMonth(dueDate.getMonth() + i);
          runningBalance = Math.max(0, runningBalance - monthlyPayment);

          schedule.push({
            month: i,
            due_date: dueDate.toISOString().split('T')[0],
            amount: Math.round(monthlyPayment * 100) / 100,
            status: 'pending',
            balance: Math.round(runningBalance * 100) / 100
          });
        }
        return { loan, schedule };
      }

      // Map actual repayments with month numbers
      const schedule = repayments.map((r, idx) => ({
        month: idx + 1,
        due_date: r.due_date ? new Date(r.due_date).toISOString().split('T')[0] : 'N/A',
        amount: parseFloat(r.amount || 0),
        interest: parseFloat(r.interest_amount || 0),
        principal: parseFloat(r.principal_amount || 0),
        status: (r.status || 'pending').toLowerCase(),
        payment_date: r.payment_date ? new Date(r.payment_date).toISOString().split('T')[0] : null,
        balance: parseFloat(r.balance || 0)
      }));

      return { loan, schedule };
    } catch (error) {
      console.error('Error fetching repayment schedule:', error);
      throw error;
    }
  }

  static async getGuarantorExposure() {
    try {
      const exposure = await query(`
        SELECT 
          g.user_id,
          g.guarantor_name as name,
          ep.department,
          SUM(g.guarantee_amount) as guaranteed_amount,
          COUNT(CASE WHEN g.status IN ('ACTIVE', 'APPROVED', 'PENDING') THEN 1 END) as active_guarantees,
          COUNT(*) as total_guarantees
        FROM guarantors g
        LEFT JOIN users u ON g.user_id = u.id
        LEFT JOIN employee_profiles ep ON u.id = ep.user_id
        GROUP BY g.user_id, g.guarantor_name, ep.department
        ORDER BY guaranteed_amount DESC
      `);

      return exposure.map(row => ({
        name: row.name || 'Unknown',
        department: row.department || 'Not specified',
        guaranteedAmount: parseFloat(row.guaranteed_amount || 0),
        activeGuarantees: parseInt(row.active_guarantees || 0),
        totalGuarantees: parseInt(row.total_guarantees || 0)
      }));
    } catch (error) {
      console.error('Error fetching guarantor exposure:', error);
      throw error;
    }
  }

  static async getSecurityOverview(userId) {
    try {
      const stats = await query(`
        SELECT 
          COUNT(CASE WHEN action = 'LOGIN_SUCCESS' THEN 1 END) as successfulLogins,
          COUNT(CASE WHEN action = 'LOGIN_FAILED' THEN 1 END) as failedLogins,
          COUNT(DISTINCT user_agent) as uniqueDevices,
          COUNT(DISTINCT ip_address) as uniqueLocations,
          COUNT(CASE WHEN action IN ('PASSWORD_CHANGE', '2FA_ENABLED', '2FA_DISABLED', 'PASSWORD_RESET') THEN 1 END) as securityEvents,
          (SELECT created_at FROM audit_logs WHERE user_id = ? AND action = 'SECURITY_SCAN' ORDER BY created_at DESC LIMIT 1) as lastSecurityScan,
          (SELECT created_at FROM audit_logs WHERE user_id = ? AND action = 'PASSWORD_CHANGE' ORDER BY created_at DESC LIMIT 1) as lastPasswordChange
        FROM audit_logs
        WHERE user_id = ?
      `, [userId, userId, userId]);

      const failedLogins = stats[0]?.failedLogins || 0;
      const securityEvents = stats[0]?.securityEvents || 0;
      let securityScore = 100 - (failedLogins * 2) - (securityEvents * 5);
      securityScore = Math.max(0, Math.min(100, securityScore));

      const recentActivity = await query(`
        SELECT 
          id, action, created_at as timestamp, ip_address as ip, user_agent as device, action as details
        FROM audit_logs
        WHERE user_id = ? AND (action LIKE '%LOGIN%' OR action LIKE '%PASSWORD%' OR action LIKE '%2FA%')
        ORDER BY created_at DESC
        LIMIT 5
      `, [userId]);

      return {
        metrics: {
          successfulLogins: stats[0]?.successfulLogins || 0,
          failedLogins: failedLogins,
          uniqueDevices: stats[0]?.uniqueDevices || 0,
          uniqueLocations: stats[0]?.uniqueLocations || 0,
          securityEvents: securityEvents,
          lastSecurityScan: stats[0]?.lastSecurityScan || null,
          lastPasswordChange: stats[0]?.lastPasswordChange || 'Never',
          securityScore: securityScore
        },
        recentActivity: recentActivity.map(row => ({
          ...row,
          status: row.action.includes('SUCCESS') ? 'success' : (row.action.includes('FAILED') ? 'failed' : 'info'),
          severity: row.action.includes('FAILED') ? 'danger' : (row.action.includes('CHANGE') ? 'warning' : 'info')
        }))
      };
    } catch (error) {
      throw error;
    }
  }

  static async getActivityLog(userId, page = 1, limit = 20, filters = {}) {
    try {
      const offset = (page - 1) * limit;
      let whereClause = 'WHERE al.user_id = ?';
      const params = [userId];

      if (filters.type && filters.type !== 'all') {
        if (filters.type === 'login') {
          whereClause += " AND al.action LIKE '%LOGIN%'";
        } else if (filters.type === 'loan') {
          whereClause += " AND al.action LIKE '%LOAN%'";
        } else if (filters.type === 'security') {
          whereClause += " AND (al.action LIKE '%PASSWORD%' OR al.action LIKE '%2FA%' OR al.action LIKE '%SECURITY%')";
        }
      }

      if (filters.search) {
        whereClause += " AND (al.action LIKE ? OR al.table_name LIKE ?)";
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm);
      }

      const activities = await query(`
        SELECT 
          al.*,
          u.username as user
        FROM audit_logs al
        LEFT JOIN users u ON al.user_id = u.id
        ${whereClause}
        ORDER BY al.created_at DESC
        LIMIT ? OFFSET ?
      `, [...params, limit, offset]);

      return activities.map(al => {
        let details = null;
        try {
          details = al.new_values ? (typeof al.new_values === 'string' ? JSON.parse(al.new_values) : al.new_values) : null;
        } catch (e) {
          details = al.new_values;
        }

        return {
          id: al.id,
          type: al.action.includes('LOAN') ? 'loan' : (al.action.includes('LOGIN') ? 'login' : (al.action.includes('SECURITY') ? 'security' : 'system')),
          action: al.action.toLowerCase(),
          description: al.action.replace(/_/g, ' ').toLowerCase(),
          timestamp: al.created_at,
          ip: al.ip_address,
          device: al.user_agent,
          user: al.user || 'Unknown',
          details: details
        };
      });
    } catch (error) {
      throw error;
    }
  }
}
module.exports = CommitteeService;
