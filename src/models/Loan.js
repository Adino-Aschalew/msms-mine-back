const { query, transaction } = require('../config/database');
const moment = require('moment');

class Loan {
  static async checkLoanEligibility(userId) {
    const eligibilityQuery = `
      SELECT 
        sa.current_balance as total_savings,
        sa.created_at as account_created_date,
        COUNT(CASE WHEN st.transaction_type = 'CONTRIBUTION' AND st.transaction_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH) THEN 1 END) as monthly_contributions,
        EXISTS(SELECT 1 FROM loans l WHERE l.user_id = ? AND l.status = 'ACTIVE') as has_active_loan,
        EXISTS(SELECT 1 FROM penalties p WHERE p.user_id = ? AND p.status = 'ACTIVE') as has_unpaid_penalties,
        ep.employment_status
      FROM savings_accounts sa
      JOIN users u ON sa.user_id = u.id
      JOIN employee_profiles ep ON u.id = ep.user_id
      LEFT JOIN savings_transactions st ON sa.id = st.savings_account_id
      WHERE sa.user_id = ? AND sa.account_status = 'ACTIVE'
      GROUP BY sa.id, sa.current_balance, sa.created_at, ep.employment_status
    `;
    
    const result = await query(eligibilityQuery, [userId, userId, userId]);
    
    if (!result[0]) {
      return { eligible: false, reason: 'No active savings account found' };
    }
    
    const data = result[0];
    const configQuery = `
      SELECT config_key, config_value FROM system_configuration 
      WHERE config_key IN ('min_loan_eligibility_months', 'max_loan_multiplier') AND is_active = true
    `;
    
    const configs = await query(configQuery);
    const config = {};
    configs.forEach(c => config[c.config_key] = c.config_value);
    
    // TEMPORARILY DISABLED: const minMonths = parseInt(config.min_loan_eligibility_months || '6');
    const minMonths = 0; // Bypass minimum months requirement for now
    const maxMultiplier = parseFloat(config.max_loan_multiplier || '6');
    
    const accountAgeMonths = moment().diff(moment(data.account_created_date), 'months');
    
    if (data.employment_status !== 'ACTIVE') {
      return { eligible: false, reason: 'Employment status is not active' };
    }
    
    if (data.has_active_loan) {
      return { eligible: false, reason: 'Already has an active loan' };
    }
    
    if (data.has_unpaid_penalties) {
      return { eligible: false, reason: 'Has unpaid penalties' };
    }
    
    // TEMPORARILY DISABLED: Account age requirement
    if (false && accountAgeMonths < minMonths) {
      return { eligible: false, reason: `Account must be at least ${minMonths} months old` };
    }
    
    // TEMPORARILY DISABLED: Monthly contributions requirement
    if (false && data.monthly_contributions < minMonths) {
      return { eligible: false, reason: `Must have at least ${minMonths} consecutive monthly contributions` };
    }
    
    const maxLoanAmount = data.total_savings * maxMultiplier;
    
    return {
      eligible: true,
      total_savings: data.total_savings,
      max_loan_amount: maxLoanAmount,
      account_age_months: accountAgeMonths,
      monthly_contributions: data.monthly_contributions
    };
  }
  
  static async createLoanApplication(userId, employeeId, applicationData) {
    const { requested_amount, purpose, repayment_duration_months, monthly_income } = applicationData;
    
    const eligibility = await this.checkLoanEligibility(userId);
    
    if (!eligibility.eligible) {
      throw new Error(eligibility.reason);
    }
    
    if (requested_amount > eligibility.max_loan_amount) {
      throw new Error(`Requested amount exceeds maximum loan amount of ${eligibility.max_loan_amount}`);
    }
    
    const insertQuery = `
      INSERT INTO loan_applications 
      (user_id, employee_id, requested_amount, purpose, repayment_duration_months, monthly_income, status)
      VALUES (?, ?, ?, ?, ?, ?, 'PENDING')
    `;
    
    const result = await query(insertQuery, [
      userId, employeeId, requested_amount, purpose, repayment_duration_months, monthly_income
    ]);
    
    return result.insertId;
  }
  
  static async getLoanApplications(userId = null, page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;
    let whereClause = userId ? 'WHERE la.user_id = ?' : 'WHERE 1=1';
    const params = userId ? [userId] : [];
    
    if (filters.status) {
      whereClause += ' AND la.status = ?';
      params.push(filters.status);
    }
    
    if (filters.employee_id) {
      whereClause += ' AND la.employee_id LIKE ?';
      params.push(`%${filters.employee_id}%`);
    }
    
    const countQuery = `
      SELECT COUNT(*) as total
      FROM loan_applications la
      ${whereClause}
    `;
    
    const selectQuery = `
      SELECT la.*, u.username, u.email, ep.first_name, ep.last_name, ep.department,
             reviewer.username as reviewer_name, reviewer.first_name as reviewer_first_name
      FROM loan_applications la
      JOIN users u ON la.user_id = u.id
      JOIN employee_profiles ep ON la.user_id = ep.user_id
      LEFT JOIN users reviewer ON la.reviewed_by = reviewer.id
      ${whereClause}
      ORDER BY la.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const [countResult, applications] = await Promise.all([
      query(countQuery, params),
      query(selectQuery, [...params, limit, offset])
    ]);
    
    return {
      applications,
      pagination: {
        page,
        limit,
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit)
      }
    };
  }
  
  static async getLoanApplication(applicationId) {
    const selectQuery = `
      SELECT la.*, u.username, u.email, ep.first_name, ep.last_name, ep.department, ep.job_grade,
             reviewer.username as reviewer_name, reviewer.first_name as reviewer_first_name,
             sa.current_balance as savings_balance, sa.saving_percentage
      FROM loan_applications la
      JOIN users u ON la.user_id = u.id
      JOIN employee_profiles ep ON la.user_id = ep.user_id
      JOIN savings_accounts sa ON la.user_id = sa.user_id
      LEFT JOIN users reviewer ON la.reviewed_by = reviewer.id
      WHERE la.id = ?
    `;
    
    const applications = await query(selectQuery, [applicationId]);
    return applications[0] || null;
  }
  
  static async updateLoanApplicationStatus(applicationId, status, reviewedBy, reviewComments = null) {
    const updateQuery = `
      UPDATE loan_applications 
      SET status = ?, reviewed_by = ?, review_date = NOW(), review_comments = ?, updated_at = NOW()
      WHERE id = ?
    `;
    
    await query(updateQuery, [status, reviewedBy, reviewComments, applicationId]);
  }
  
  static async approveLoanApplication(applicationId, reviewedBy) {
    return await transaction(async (connection) => {
      const [application] = await connection.execute(
        'SELECT * FROM loan_applications WHERE id = ?',
        [applicationId]
      );
      
      if (!application[0]) {
        throw new Error('Loan application not found');
      }
      
      const app = application[0];
      
      const configQuery = `
        SELECT config_value FROM system_configuration 
        WHERE config_key = 'loan_interest_rate' AND is_active = true
      `;
      
      const [config] = await connection.execute(configQuery);
      const annualRate = parseFloat(config[0]?.config_value || '11.00');
      const monthlyRate = annualRate / 12 / 100;
      
      const totalInterest = app.requested_amount * monthlyRate * app.repayment_duration_months;
      const totalRepayment = app.requested_amount + totalInterest;
      const monthlyRepayment = totalRepayment / app.repayment_duration_months;
      
      const maturityDate = moment().add(app.repayment_duration_months, 'months').toDate();
      
      const [loanResult] = await connection.execute(`
        INSERT INTO loans 
        (loan_application_id, user_id, employee_id, principal_amount, interest_rate, total_interest, 
         total_repayment, monthly_repayment, remaining_balance, status, disbursement_date, maturity_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', NOW(), ?)
      `, [
        applicationId, app.user_id, app.employee_id, app.requested_amount, annualRate,
        totalInterest, totalRepayment, monthlyRepayment, totalRepayment, maturityDate
      ]);
      
      await connection.execute(`
        UPDATE loan_applications 
        SET status = 'APPROVED', reviewed_by = ?, review_date = NOW(), updated_at = NOW()
        WHERE id = ?
      `, [reviewedBy, applicationId]);
      
      return {
        loanId: loanResult.insertId,
        totalInterest,
        totalRepayment,
        monthlyRepayment,
        maturityDate
      };
    });
  }
  
  static async rejectLoanApplication(applicationId, reviewedBy, reviewComments) {
    await this.updateLoanApplicationStatus(applicationId, 'REJECTED', reviewedBy, reviewComments);
  }
  
  static async getActiveLoans(userId = null) {
    let whereClause = userId ? 'WHERE l.user_id = ?' : 'WHERE 1=1';
    const params = userId ? [userId] : [];
    
    const selectQuery = `
      SELECT l.*, la.purpose, u.username, u.email, ep.first_name, ep.last_name, ep.department
      FROM loans l
      JOIN loan_applications la ON l.loan_application_id = la.id
      JOIN users u ON l.user_id = u.id
      JOIN employee_profiles ep ON l.user_id = ep.user_id
      ${whereClause} AND l.status = 'ACTIVE'
      ORDER BY l.created_at DESC
    `;
    
    return await query(selectQuery, params);
  }
  
  static async getLoan(loanId) {
    const selectQuery = `
      SELECT l.*, la.purpose, u.username, u.email, ep.first_name, ep.last_name, ep.department
      FROM loans l
      JOIN loan_applications la ON l.loan_application_id = la.id
      JOIN users u ON l.user_id = u.id
      JOIN employee_profiles ep ON l.user_id = ep.user_id
      WHERE l.id = ?
    `;
    
    const loans = await query(selectQuery, [loanId]);
    return loans[0] || null;
  }
  
  static async makeLoanRepayment(loanId, userId, amount, referenceId = null, payrollBatchId = null) {
    return await transaction(async (connection) => {
      const [loan] = await connection.execute(
        'SELECT * FROM loans WHERE id = ? AND user_id = ? AND status = ?',
        [loanId, userId, 'ACTIVE']
      );
      
      if (!loan[0]) {
        throw new Error('Active loan not found');
      }
      
      const loanData = loan[0];
      
      if (amount > loanData.remaining_balance) {
        throw new Error('Repayment amount exceeds remaining balance');
      }
      
      const monthlyRate = loanData.interest_rate / 12 / 100;
      const interestAmount = Math.min(loanData.remaining_balance * monthlyRate, amount);
      const principalAmount = amount - interestAmount;
      
      const balanceBefore = loanData.remaining_balance;
      const balanceAfter = balanceBefore - amount;
      
      const [repaymentResult] = await connection.execute(`
        INSERT INTO loan_repayments 
        (loan_id, user_id, amount, principal_amount, interest_amount, balance_before, balance_after, reference_id, payroll_batch_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [loanId, userId, amount, principalAmount, interestAmount, balanceBefore, balanceAfter, referenceId, payrollBatchId]);
      
      const newStatus = balanceAfter <= 0 ? 'COMPLETED' : 'ACTIVE';
      
      await connection.execute(`
        UPDATE loans 
        SET remaining_balance = ?, paid_amount = paid_amount + ?, interest_paid = interest_paid + ?, 
            status = ?, updated_at = NOW()
        WHERE id = ?
      `, [balanceAfter, amount, interestAmount, newStatus, loanId]);
      
      if (newStatus === 'COMPLETED') {
        await connection.execute(`
          UPDATE loan_applications 
          SET status = 'COMPLETED', updated_at = NOW()
          WHERE id = ?
        `, [loanData.loan_application_id]);
      }
      
      return {
        repaymentId: repaymentResult.insertId,
        principalAmount,
        interestAmount,
        balanceAfter,
        loanCompleted: newStatus === 'COMPLETED'
      };
    });
  }
  
  static async getLoanRepayments(loanId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const countQuery = `
      SELECT COUNT(*) as total FROM loan_repayments WHERE loan_id = ?
    `;
    
    const selectQuery = `
      SELECT lr.*, u.username, u.email, ep.first_name, ep.last_name
      FROM loan_repayments lr
      JOIN users u ON lr.user_id = u.id
      JOIN employee_profiles ep ON lr.user_id = ep.user_id
      WHERE lr.loan_id = ?
      ORDER BY lr.repayment_date DESC
      LIMIT ? OFFSET ?
    `;
    
    const [countResult, repayments] = await Promise.all([
      query(countQuery, [loanId]),
      query(selectQuery, [loanId, limit, offset])
    ]);
    
    return {
      repayments,
      pagination: {
        page,
        limit,
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit)
      }
    };
  }
  
  static async getLoanStats(userId = null) {
    let whereClause = userId ? 'WHERE l.user_id = ?' : 'WHERE 1=1';
    const params = userId ? [userId] : [];
    
    const statsQuery = `
      SELECT 
        COUNT(*) as total_loans,
        SUM(principal_amount) as total_principal,
        SUM(total_interest) as total_interest,
        SUM(total_repayment) as total_repayment,
        SUM(paid_amount) as total_paid,
        SUM(remaining_balance) as total_remaining,
        COUNT(CASE WHEN l.status = 'ACTIVE' THEN 1 END) as active_loans,
        COUNT(CASE WHEN l.status = 'COMPLETED' THEN 1 END) as completed_loans,
        COUNT(CASE WHEN l.status = 'DEFAULTED' THEN 1 END) as defaulted_loans,
        AVG(monthly_repayment) as avg_monthly_repayment
      FROM loans l
      ${whereClause}
    `;
    
    const stats = await query(statsQuery, params);
    return stats[0];
  }
  
  static async checkLoanDefaults() {
    const defaultQuery = `
      SELECT l.id, l.user_id, l.employee_id, l.remaining_balance, l.monthly_repayment,
             DATEDIFF(NOW(), l.disbursement_date) as days_since_disbursement
      FROM loans l
      WHERE l.status = 'ACTIVE' 
        AND l.disbursement_date < DATE_SUB(NOW(), INTERVAL 30 DAY)
        AND NOT EXISTS (
          SELECT 1 FROM loan_repayments lr 
          WHERE lr.loan_id = l.id 
          AND lr.repayment_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        )
    `;
    
    const overdueLoans = await query(defaultQuery);
    const results = [];
    
    for (const loan of overdueLoans) {
      try {
        const penaltyAmount = loan.monthly_repayment * 0.05;
        
        await query(`
          INSERT INTO penalties (user_id, employee_id, penalty_type, amount, reason, due_date)
          VALUES (?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 15 DAY))
        `, [loan.user_id, loan.employee_id, 'LOAN_DEFAULT', penaltyAmount, `Loan repayment overdue for 30 days`]);
        
        results.push({
          loanId: loan.id,
          employeeId: loan.employee_id,
          penaltyAmount,
          success: true
        });
      } catch (error) {
        results.push({
          loanId: loan.id,
          employeeId: loan.employee_id,
          error: error.message,
          success: false
        });
      }
    }
    
    return results;
  }
}

module.exports = Loan;
