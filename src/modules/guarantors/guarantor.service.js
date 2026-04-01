const { query } = require('../../config/database');
const { auditLog } = require('../../middleware/audit');
const NotificationService = require('../../services/notification.service');

class GuarantorService {
  static async addGuarantor(loanApplicationId, guarantorDetails, userId, ip, userAgent) {
    try {
      // Validate guarantor details
      const validation = await this.validateGuarantor(guarantorDetails);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }
      
      // Add guarantor to database
      const insertQuery = `
        INSERT INTO guarantors (loan_application_id, user_id, guarantor_name, guarantor_email, guarantor_phone, guarantor_address, guarantor_relationship, guarantee_amount, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', NOW())
      `;
      
      const result = await query(insertQuery, [
        loanApplicationId,
        userId,
        guarantorDetails.guarantor_name,
        guarantorDetails.guarantor_email,
        guarantorDetails.guarantor_phone,
        guarantorDetails.guarantor_address,
        guarantorDetails.guarantor_relationship,
        guarantorDetails.guarantee_amount
      ]);
      
      // Update loan application with guarantor
      const application = await query('SELECT guarantor_details FROM loan_applications WHERE id = ?', [loanApplicationId]);
      const existingGuarantors = JSON.parse(application[0]?.guarantor_details || '[]');
      existingGuarantors.push({
        guarantor_id: result.insertId,
        ...guarantorDetails
      });
      
      await query(
        'UPDATE loan_applications SET guarantor_details = ? WHERE id = ?',
        [JSON.stringify(existingGuarantors), loanApplicationId]
      );
      
      // Log guarantor addition
      await auditLog(userId, 'GUARANTOR_ADDED', 'guarantors', result.insertId, null, guarantorDetails, ip, userAgent);
      
      // Send notification to user
      await NotificationService.createNotification(
        userId,
        'Guarantor Added',
        `A guarantor has been added to your loan application.`,
        'INFO'
      );
      
      // Send notification to guarantor
      await NotificationService.createNotification(
        null, // System notification
        'Guarantor Request',
        `You have been requested to be a guarantor for a loan application.`,
        'INFO'
      );
      
      // Send email to guarantor
      await NotificationService.sendEmail(
        guarantorDetails.guarantor_email,
        'Guarantor Request - Microfinance System',
        `
          <h2>Guarantor Request</h2>
          <p>Dear ${guarantorDetails.guarantor_name},</p>
          <p>You have been requested to act as a guarantor for a loan application in the microfinance system.</p>
          <p><strong>Details:</strong></p>
          <ul>
            <li>Relationship: ${guarantorDetails.guarantor_relationship}</li>
            <li>Guarantee Amount: ${guarantorDetails.guarantee_amount}</li>
            <li>Applicant: ${guarantorDetails.applicant_name || 'Loan Applicant'}</li>
          </ul>
          <p>Please review this request and contact us if you have any questions.</p>
          <p>Best regards,<br>Microfinance System</p>
        `
      );
      
      return {
        message: 'Guarantor added successfully',
        guarantorId: result.insertId
      };
    } catch (error) {
      throw error;
    }
  }

  static async getGuarantors(page = 1, limit = 10, filters = {}) {
    try {
      const offset = (page - 1) * limit;
      let whereClause = 'WHERE 1=1';
      const params = [];
      
      if (filters.status) {
        whereClause += ' AND status = ?';
        params.push(filters.status);
      }
      
      if (filters.loan_application_id) {
        whereClause += ' AND loan_application_id = ?';
        params.push(filters.loan_application_id);
      }
      
      if (filters.search) {
        whereClause += ' AND (guarantor_name LIKE ? OR guarantor_email LIKE ? OR guarantor_phone LIKE ?)';
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }
      
      const countQuery = `SELECT COUNT(*) as total FROM guarantors ${whereClause}`;
      
      const selectQuery = `
        SELECT 
          g.*,
          la.requested_amount,
          la.purpose,
          u.username as applicant_username,
          ep.first_name as applicant_first_name,
          ep.last_name as applicant_last_name
        FROM guarantors g
        LEFT JOIN loan_applications la ON g.loan_application_id = la.id
        LEFT JOIN users u ON la.user_id = u.id
        LEFT JOIN employee_profiles ep ON u.id = ep.user_id
        ${whereClause}
        ORDER BY g.created_at DESC
        LIMIT ? OFFSET ?
      `;
      
      const [countResult, guarantors] = await Promise.all([
        query(countQuery, params),
        query(selectQuery, [...params, limit, offset])
      ]);
      
      return {
        guarantors,
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

  static async getGuarantorById(guarantorId) {
    try {
      const selectQuery = `
        SELECT 
          g.*,
          la.requested_amount,
          la.purpose,
          la.status as application_status,
          u.username as applicant_username,
          ep.first_name as applicant_first_name,
          ep.last_name as applicant_last_name
        FROM guarantors g
        LEFT JOIN loan_applications la ON g.loan_application_id = la.id
        LEFT JOIN users u ON la.user_id = u.id
        LEFT JOIN employee_profiles ep ON u.id = ep.user_id
        WHERE g.id = ?
      `;
      
      const [guarantors] = await query(selectQuery, [guarantorId]);
      
      return guarantors[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async updateGuarantorStatus(guarantorId, status, updatedBy, ip, userAgent) {
    try {
      const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'RELEASED'];
      if (!validStatuses.includes(status)) {
        throw new Error('Invalid guarantor status');
      }
      
      // Check if guarantor exists
      const guarantor = await this.getGuarantorById(guarantorId);
      if (!guarantor) {
        throw new Error('Guarantor not found');
      }
      
      // Update status
      await query(`
        UPDATE guarantors 
        SET status = ?, updated_at = NOW()
        WHERE id = ?
      `, [status, guarantorId]);
      
      // Log status change
      await auditLog(updatedBy, 'GUARANTOR_STATUS_UPDATE', 'guarantors', guarantorId, null, { 
        old_status: guarantor.status, 
        new_status: status 
      }, ip, userAgent);
      
      // Send notification to user
      await NotificationService.createNotification(
        guarantor.user_id,
        'Guarantor Status Updated',
        `Guarantor status has been updated to: ${status}`,
        'INFO'
      );
      
      // Send notification to guarantor
      if (guarantor.guarantor_email) {
        const emailSubject = `Guarantor Status Update - ${status}`;
        const emailContent = `
          <h2>Guarantor Status Update</h2>
          <p>Dear ${guarantor.guarantor_name},</p>
          <p>Your guarantor status has been updated to: <strong>${status}</strong>.</p>
          <p>If you have any questions about this change, please contact the microfinance system.</p>
          <p>Best regards,<br>Microfinance System</p>
        `;
        
        await NotificationService.sendEmail(guarantor.guarantor_email, emailSubject, emailContent);
      }
      
      return { message: 'Guarantor status updated successfully' };
    } catch (error) {
      throw error;
    }
  }

  static async getGuantorStats() {
    try {
      const [stats] = await query(`
        SELECT 
          COUNT(*) as total_guarantors,
          COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending_guarantors,
          COUNT(CASE WHEN status = 'APPROVED' THEN 1 END) as approved_guarantors,
          COUNT(CASE WHEN status = 'REJECTED' THEN 1 END) as rejected_guarantors,
          COUNT(CASE WHEN status = 'RELEASED' THEN 1 END) as released_guarantors,
          SUM(guarantee_amount) as total_guarantee_amount,
          AVG(guarantee_amount) as average_guarantee_amount
        FROM guarantors
      `);
      
      return stats[0];
    } catch (error) {
      throw error;
    }
  }

  static async validateGuarantor(guarantorDetails) {
    try {
      const errors = [];
      
      // Required fields validation
      if (!guarantorDetails.guarantor_name || guarantorDetails.guarantor_name.trim() === '') {
        errors.push('Guarantor name is required');
      }
      
      if (!guarantorDetails.guarantor_email || guarantorDetails.guarantor_email.trim() === '') {
        errors.push('Guarantor email is required');
      }
      
      if (!guarantorDetails.guarantor_phone || guarantorDetails.guarantor_phone.trim() === '') {
        errors.push('Guarantor phone is required');
      }
      
      if (!guarantorDetails.guarantor_address || guarantorDetails.guarantor_address.trim() === '') {
        errors.push('Guarantor address is required');
      }
      
      if (!guarantorDetails.guarantor_relationship || guarantor_details.guarantor_relationship.trim() === '') {
        errors.push('Guarantor relationship is required');
      }
      
      if (!guarantorDetails.guarantee_amount || guarantorDetails.guarantee_amount <= 0) {
        errors.push('Guarantee amount must be greater than 0');
      }
      
      // Email validation
      if (guarantorDetails.guarantor_email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(guarantorDetails.guarantor_email)) {
          errors.push('Invalid email format');
        }
      }
      
      // Phone validation
      if (guarantorDetails.guarantor_phone) {
        const phoneRegex = /^[+]?[\d\s\-\(\)]+$/;
        if (!phoneRegex.test(guarantorDetails.guarantor_phone)) {
          errors.push('Invalid phone number format');
        }
      }
      
      return {
        isValid: errors.length === 0,
        errors
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [error.message]
      };
    }
  }

  static async getGuarantorsByApplication(loanApplicationId) {
    try {
      const [guarantors] = await query(`
        SELECT 
          g.*,
          u.username as applicant_username,
          ep.first_name as applicant_first_name,
          ep.last_name as applicant_last_name
        FROM guarantors g
        LEFT JOIN loan_applications la ON g.loan_application_id = la.id
        LEFT JOIN users u ON la.user_id = u.id
        LEFT JOIN employee_profiles ep ON u.id = ep.user_id
        WHERE g.loan_application_id = ?
        ORDER BY g.created_at ASC
      `, [loanApplicationId]);
      
      return guarantors;
    } catch (error) {
      throw error;
    }
  }

  static async getGuarantorsByStatus(status) {
    try {
      const [guarantors] = await query(`
        SELECT 
          g.*,
          la.requested_amount,
          la.purpose,
          u.username as applicant_username,
          ep.first_name as applicant_first_name,
          ep.last_name as applicant_last_name
        FROM guarantors g
        LEFT JOIN loan_applications la ON g.loan_application_id = la.id
        LEFT JOIN users u ON la.user_id = u.id
        LEFT JOIN employee_profiles ep ON u.id = ep.user_id
        WHERE g.status = ?
        ORDER BY g.created_at DESC
      `, [status]);
      
      return guarantors;
    } catch (error) {
      throw error;
    }
  }

  static async releaseGuarantor(guarantorId, reason, releasedBy, ip, userAgent) {
    try {
      const guarantor = await this.getGuarantorById(guarantorId);
      
      if (!guarantor) {
        throw new Error('Guarantor not found');
      }
      
      // Update status to released
      await this.updateGuarantorStatus(guarantorId, 'RELEASED', releasedBy, ip, userAgent);
      
      // Add release reason to notes
      await query(`
        UPDATE guarantors 
        SET notes = ?, updated_at = NOW()
        WHERE id = ?
      `, [reason, guarantorId]);
      
      // Log release
      await auditLog(releasedBy, 'GUARANTOR_RELEASED', 'guarantors', guarantorId, null, { reason }, ip, userAgent);
      
      // Send notification to user
      await NotificationService.createNotification(
        guarantor.user_id,
        'Guarantor Released',
        `A guarantor has been released from your loan application.`,
        'INFO'
      );
      
      // Send notification to guarantor
      if (guarantor.guarantor_email) {
        await NotificationService.sendEmail(
          guarantor.guarantor_email,
          'Guarantor Released - Microfinance System',
          `
            <h2>Guarantor Released</h2>
            <p>Dear ${guarantor.guarantor_name},</p>
            <p>Your guarantor obligations have been released.</p>
            <p><strong>Reason:</strong> ${reason}</p>
            <p>If you have any questions about this change, please contact the microfinance system.</p>
            <p>Best regards,<br>Microfinance System</p>
          `
        );
      }
      
      return { message: 'Guarantor released successfully' };
    } catch (error) {
      throw error;
    }
  }

  static async checkGuarantorEligibility(userId, loanAmount) {
    try {
      // Check if user has existing active loans
      const [activeLoans] = await query(`
        SELECT COUNT(*) as count, SUM(outstanding_balance) as total_balance
        FROM loans
        WHERE user_id = ? AND status IN ('ACTIVE', 'OVERDUE')
      `, [userId]);
      
      // Check if user has pending applications
      const [pendingApplications] = await query(`
        SELECT COUNT(*) as count, SUM(requested_amount) as total_amount
        FROM loan_applications
        WHERE user_id = ? AND status IN ('PENDING', 'UNDER_REVIEW')
      `, [userId]);
      
      const totalActiveBalance = parseFloat(activeLoans[0]?.total_balance || 0);
      const totalPendingAmount = parseFloat(pendingApplications[0]?.total_amount || 0);
      const totalObligations = totalActiveBalance + totalPendingAmount;
      
      // Check if user can be a guarantor
      const maxGuaranteeRatio = 0.5; // Maximum 50% of monthly income
      const monthlyIncome = 5000; // Simplified calculation
      
      const maxGuaranteeAmount = monthlyIncome * maxGuaranteeRatio;
      
      return {
        can_be_guarantor: totalObligations < maxGuaranteeAmount,
        current_obligations: totalObligations,
        max_guarantee_amount: maxGuaranteeAmount,
        requested_amount: loanAmount,
        remaining_capacity: Math.max(0, maxGuaranteeAmount - totalObligations)
      };
    } catch (error) {
      throw error;
    }
  }

  static async sendGuarantorReminder(guarantorId, daysBeforeExpiry) {
    try {
      const guarantor = await this.getGuantorById(guarantorId);
      
      if (!guarantor) {
        throw new Error('Guarantor not found');
      }
      
      // Send reminder to guarantor
      if (guarantor.guarantor_email) {
        await NotificationService.sendEmail(
          guarantor.guarantor_email,
          'Guarantor Reminder - Microfinance System',
          `
            <h2>Guarantor Reminder</h2>
            <p>Dear ${guarantor.guarantor_name},</p>
            <p>This is a reminder about your guarantor obligations with the microfinance system.</p>
            <p><strong>Guarantee Amount:</strong> ${guarantor.guarantee_amount}</p>
            <p>Please ensure you fulfill your guarantor obligations.</p>
            <p>Best regards,<br>Microfinance System</p>
          `
        );
      }
      
      return { message: 'Reminder sent successfully' };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = GuarantorService;
