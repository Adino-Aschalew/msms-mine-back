const { query, transaction } = require('../config/database');

class Guarantor {
  static async addGuarantor(loanApplicationId, userId, guarantorData) {
    const {
      guarantor_type,
      guarantor_name,
      guarantor_id,
      relationship,
      monthly_income,
      contact_phone,
      contact_email,
      address,
      id_document_path,
      income_proof_path
    } = guarantorData;
    
    const checkQuery = `
      SELECT COUNT(*) as count FROM guarantors WHERE loan_application_id = ?
    `;
    const [result] = await query(checkQuery, [loanApplicationId]);
    
    const configQuery = `
      SELECT config_value FROM system_configuration 
      WHERE config_key = 'max_guarantors_per_loan' AND is_active = true
    `;
    const [config] = await query(configQuery);
    const maxGuarantors = parseInt(config[0]?.config_value || '2');
    
    if (result.count >= maxGuarantors) {
      throw new Error(`Maximum ${maxGuarantors} guarantors allowed per loan`);
    }
    
    const insertQuery = `
      INSERT INTO guarantors 
      (loan_application_id, user_id, guarantor_type, guarantor_name, guarantor_id, relationship,
       monthly_income, contact_phone, contact_email, address, id_document_path, income_proof_path)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const insertResult = await query(insertQuery, [
      loanApplicationId, userId, guarantor_type, guarantor_name, guarantor_id, relationship,
      monthly_income, contact_phone, contact_email, address, id_document_path, income_proof_path
    ]);
    
    return insertResult.insertId;
  }
  
  static async getGuarantors(loanApplicationId) {
    const selectQuery = `
      SELECT g.*, u.username as applicant_username, ep.first_name as applicant_first_name, ep.last_name as applicant_last_name
      FROM guarantors g
      JOIN loan_applications la ON g.loan_application_id = la.id
      JOIN users u ON la.user_id = u.id
      JOIN employee_profiles ep ON la.user_id = ep.user_id
      WHERE g.loan_application_id = ?
      ORDER BY g.created_at ASC
    `;
    
    return await query(selectQuery, [loanApplicationId]);
  }
  
  static async getGuarantor(guarantorId) {
    const selectQuery = `
      SELECT g.*, la.requested_amount as loan_amount, la.purpose as loan_purpose,
             u.username as applicant_username, ep.first_name as applicant_first_name, ep.last_name as applicant_last_name
      FROM guarantors g
      JOIN loan_applications la ON g.loan_application_id = la.id
      JOIN users u ON la.user_id = u.id
      JOIN employee_profiles ep ON la.user_id = ep.user_id
      WHERE g.id = ?
    `;
    
    const guarantors = await query(selectQuery, [guarantorId]);
    return guarantors[0] || null;
  }
  
  static async updateGuarantor(guarantorId, guarantorData) {
    const {
      guarantor_name,
      relationship,
      monthly_income,
      contact_phone,
      contact_email,
      address
    } = guarantorData;
    
    const updateQuery = `
      UPDATE guarantors 
      SET guarantor_name = ?, relationship = ?, monthly_income = ?, 
          contact_phone = ?, contact_email = ?, address = ?, updated_at = NOW()
      WHERE id = ?
    `;
    
    await query(updateQuery, [
      guarantor_name, relationship, monthly_income, contact_phone, contact_email, address, guarantorId
    ]);
  }
  
  static async approveGuarantor(guarantorId, approvedBy) {
    const updateQuery = `
      UPDATE guarantors 
      SET is_approved = true, approved_by = ?, approval_date = NOW(), updated_at = NOW()
      WHERE id = ?
    `;
    
    await query(updateQuery, [approvedBy, guarantorId]);
  }
  
  static async rejectGuarantor(guarantorId, approvedBy) {
    const updateQuery = `
      UPDATE guarantors 
      SET is_approved = false, approved_by = ?, approval_date = NOW(), updated_at = NOW()
      WHERE id = ?
    `;
    
    await query(updateQuery, [approvedBy, guarantorId]);
  }
  
  static async deleteGuarantor(guarantorId, userId) {
    const checkQuery = `
      SELECT g.loan_application_id, la.status
      FROM guarantors g
      JOIN loan_applications la ON g.loan_application_id = la.id
      WHERE g.id = ? AND g.user_id = ?
    `;
    
    const [guarantor] = await query(checkQuery, [guarantorId, userId]);
    
    if (!guarantor) {
      throw new Error('Guarantor not found or access denied');
    }
    
    if (guarantor.status !== 'PENDING' && guarantor.status !== 'UNDER_REVIEW') {
      throw new Error('Cannot delete guarantor for processed loan application');
    }
    
    const deleteQuery = `DELETE FROM guarantors WHERE id = ?`;
    await query(deleteQuery, [guarantorId]);
  }
  
  static async validateGuarantorEligibility(guarantorId) {
    const guarantor = await this.getGuarantor(guarantorId);
    
    if (!guarantor) {
      throw new Error('Guarantor not found');
    }
    
    const configQuery = `
      SELECT config_value FROM system_configuration 
      WHERE config_key = 'min_guarantor_income_ratio' AND is_active = true
    `;
    const [config] = await query(configQuery);
    const minIncomeRatio = parseFloat(config[0]?.config_value || '0.5');
    
    const requiredMinIncome = guarantor.loan_amount * minIncomeRatio;
    
    if (guarantor.monthly_income < requiredMinIncome) {
      throw new Error(`Guarantor income must be at least ${minIncomeRatio * 100}% of loan amount (minimum: ${requiredMinIncome})`);
    }
    
    if (guarantor.guarantor_type === 'INTERNAL') {
      const internalCheckQuery = `
        SELECT COUNT(*) as active_loans
        FROM loans l
        JOIN guarantors g ON l.user_id = g.user_id
        WHERE g.guarantor_id = ? AND l.status = 'ACTIVE'
      `;
      
      const [internalCheck] = await query(internalCheckQuery, [guarantor.guarantor_id]);
      
      if (internalCheck.active_loans > 0) {
        throw new Error('Internal guarantor already has active loan commitments');
      }
    }
    
    return {
      eligible: true,
      requiredMinIncome,
      actualIncome: guarantor.monthly_income,
      incomeRatio: guarantor.monthly_income / guarantor.loan_amount
    };
  }
  
  static async getGuarantorExposure(guarantorId) {
    const guarantor = await this.getGuarantor(guarantorId);
    
    if (!guarantor) {
      throw new Error('Guarantor not found');
    }
    
    const exposureQuery = `
      SELECT 
        COUNT(*) as total_guarantees,
        SUM(la.requested_amount) as total_guaranteed_amount,
        COUNT(CASE WHEN la.status IN ('APPROVED', 'DISBURSED') THEN 1 END) as active_guarantees,
        SUM(CASE WHEN la.status IN ('APPROVED', 'DISBURSED') THEN la.requested_amount ELSE 0 END) as active_guaranteed_amount
      FROM guarantors g
      JOIN loan_applications la ON g.loan_application_id = la.id
      WHERE g.guarantor_id = ? AND g.is_approved = true
    `;
    
    const [exposure] = await query(exposureQuery, [guarantor.guarantor_id]);
    
    return {
      guarantorId: guarantor.guarantor_id,
      guarantorName: guarantor.guarantor_name,
      guarantorType: guarantor.guarantor_type,
      monthlyIncome: guarantor.monthly_income,
      totalGuarantees: exposure.total_guarantees || 0,
      totalGuaranteedAmount: exposure.total_guaranteed_amount || 0,
      activeGuarantees: exposure.active_guarantees || 0,
      activeGuaranteedAmount: exposure.active_guaranteed_amount || 0,
      exposureRatio: exposure.active_guaranteed_amount / guarantor.monthly_income
    };
  }
  
  static async getAllGuarantors(page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;
    let whereClause = 'WHERE 1=1';
    const params = [];
    
    if (filters.guarantor_type) {
      whereClause += ' AND g.guarantor_type = ?';
      params.push(filters.guarantor_type);
    }
    
    if (filters.is_approved !== undefined) {
      whereClause += ' AND g.is_approved = ?';
      params.push(filters.is_approved);
    }
    
    if (filters.guarantor_id) {
      whereClause += ' AND g.guarantor_id LIKE ?';
      params.push(`%${filters.guarantor_id}%`);
    }
    
    const countQuery = `
      SELECT COUNT(*) as total FROM guarantors g ${whereClause}
    `;
    
    const selectQuery = `
      SELECT g.*, la.requested_amount as loan_amount, la.status as loan_status,
             u.username as applicant_username, ep.first_name as applicant_first_name, ep.last_name as applicant_last_name,
             approver.username as approver_username
      FROM guarantors g
      JOIN loan_applications la ON g.loan_application_id = la.id
      JOIN users u ON la.user_id = u.id
      JOIN employee_profiles ep ON la.user_id = ep.user_id
      LEFT JOIN users approver ON g.approved_by = approver.id
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
  }
  
  static async getGuarantorStats() {
    const statsQuery = `
      SELECT 
        COUNT(*) as total_guarantors,
        COUNT(CASE WHEN g.guarantor_type = 'INTERNAL' THEN 1 END) as internal_guarantors,
        COUNT(CASE WHEN g.guarantor_type = 'EXTERNAL' THEN 1 END) as external_guarantors,
        COUNT(CASE WHEN g.is_approved = true THEN 1 END) as approved_guarantors,
        COUNT(CASE WHEN g.is_approved = false THEN 1 END) as pending_guarantors,
        AVG(g.monthly_income) as avg_monthly_income,
        SUM(g.monthly_income) as total_monthly_income
      FROM guarantors g
    `;
    
    const stats = await query(statsQuery);
    return stats[0];
  }
}

module.exports = Guarantor;
