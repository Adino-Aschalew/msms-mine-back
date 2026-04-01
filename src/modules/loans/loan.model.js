const { query, transaction } = require('../../config/database');

class LoanModel {
  static async createLoanApplication(applicationData) {
    const {
      user_id,
      employee_id,
      loan_amount,
      loan_purpose,
      loan_term_months,
      interest_rate,
      monthly_payment,
      monthly_income,
      collateral_description,
      guarantor_details = null,
      reviewed_by = null
    } = applicationData;
    
    const insertQuery = `
      INSERT INTO loan_applications (
        user_id, employee_id, requested_amount, purpose, repayment_duration_months,
        monthly_income, status, reviewed_by, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'PENDING', ?, NOW())
    `;
    
    try {
      const result = await query(insertQuery, [
        user_id, employee_id, loan_amount, loan_purpose, loan_term_months, 
        monthly_income, reviewed_by
      ]);
      
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  static async getLoanApplications(page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;
    let whereClause = 'WHERE 1=1';
    const params = [];
    
    if (filters.status) {
      whereClause += ' AND la.status = ?';
      params.push(filters.status);
    }
    
    if (filters.department) {
      whereClause += ' AND ep.department = ?';
      params.push(filters.department);
    }
    
    if (filters.user_id) {
      whereClause += ' AND la.user_id = ?';
      params.push(filters.user_id);
    }
    
    if (filters.search) {
      whereClause += ' AND (la.loan_purpose LIKE ? OR ep.first_name LIKE ? OR ep.last_name LIKE ? OR la.employee_id LIKE ?)';
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
        ep.job_grade
      FROM loan_applications la
      LEFT JOIN users u ON la.user_id = u.id
      LEFT JOIN employee_profiles ep ON u.id = ep.user_id
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

  static async getLoanApplicationById(applicationId) {
    const selectQuery = `
      SELECT 
        la.*,
        u.username,
        u.email,
        ep.first_name,
        ep.last_name,
        ep.department,
        ep.job_grade,
        ep.employment_status
      FROM loan_applications la
      LEFT JOIN users u ON la.user_id = u.id
      LEFT JOIN employee_profiles ep ON u.id = ep.user_id
      WHERE la.id = ?
    `;
    
    const [applications] = await query(selectQuery, [applicationId]);
    return applications[0] || null;
  }

  static async updateLoanApplicationStatus(applicationId, status, reviewedBy, notes = null) {
    const updateQuery = `
      UPDATE loan_applications 
      SET status = ?, reviewed_by = ?, reviewed_at = NOW(), review_notes = ?
      WHERE id = ?
    `;
    
    const result = await query(updateQuery, [status, reviewedBy, notes, applicationId]);
    return result.affectedRows > 0;
  }

  static async approveLoanApplication(applicationId, approvedAmount, approvedTerm, approvedRate, reviewedBy) {
    const connection = await transaction();
    
    try {
      // Update application status
      await connection.execute(`
        UPDATE loan_applications 
        SET status = 'APPROVED', reviewed_by = ?, reviewed_at = NOW(),
            approved_amount = ?, approved_term_months = ?, approved_interest_rate = ?
        WHERE id = ?
      `, [reviewedBy, approvedAmount, approvedTerm, approvedRate, applicationId]);
      
      // Get application details
      const [application] = await connection.execute(
        'SELECT * FROM loan_applications WHERE id = ?',
        [applicationId]
      );
      
      if (!application || !application[0]) {
        throw new Error('Application not found');
      }
      
      const appData = application[0];
      
      // Create loan record
      const nextPaymentDate = new Date();
      nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
      
      const insertLoanQuery = `
        INSERT INTO loans (
          application_id, user_id, employee_id, loan_amount, interest_rate,
          loan_term_months, monthly_payment, outstanding_balance, amount_due,
          next_payment_date, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', NOW())
      `;
      
      const [loanResult] = await connection.execute(insertLoanQuery, [
        applicationId, appData.user_id, appData.employee_id, approvedAmount, approvedRate,
        approvedTerm, appData.monthly_payment, approvedAmount, appData.monthly_payment,
        nextPaymentDate
      ]);
      
      await connection.commit();
      
      return {
        loanId: loanResult.insertId,
        applicationId,
        approvedAmount,
        approvedTerm,
        approvedRate
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  }

  static async rejectLoanApplication(applicationId, reason, reviewedBy) {
    const updateQuery = `
      UPDATE loan_applications 
      SET status = 'REJECTED', reviewed_by = ?, reviewed_at = NOW(), review_notes = ?
      WHERE id = ?
    `;
    
    const result = await query(updateQuery, [reviewedBy, reason, applicationId]);
    return result.affectedRows > 0;
  }

  static async getLoans(page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;
    let whereClause = 'WHERE 1=1';
    const params = [];
    
    if (filters.status) {
      whereClause += ' AND l.status = ?';
      params.push(filters.status);
    }
    
    if (filters.department) {
      whereClause += ' AND ep.department = ?';
      params.push(filters.department);
    }
    
    if (filters.user_id) {
      whereClause += ' AND l.user_id = ?';
      params.push(filters.user_id);
    }
    
    if (filters.search) {
      whereClause += ' AND (l.employee_id LIKE ? OR ep.first_name LIKE ? OR ep.last_name LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    const countQuery = `
      SELECT COUNT(*) as total
      FROM loans l
      LEFT JOIN users u ON l.user_id = u.id
      LEFT JOIN employee_profiles ep ON u.id = ep.user_id
      ${whereClause}
    `;
    
    const selectQuery = `
      SELECT 
        l.*,
        u.username,
        u.email,
        ep.first_name,
        ep.last_name,
        ep.department,
        ep.job_grade,
        ep.employment_status
      FROM loans l
      LEFT JOIN users u ON l.user_id = u.id
      LEFT JOIN employee_profiles ep ON u.id = ep.user_id
      ${whereClause}
      ORDER BY l.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const [countResult, loans] = await Promise.all([
      query(countQuery, params),
      query(selectQuery, [...params, limit, offset])
    ]);
    
    return {
      loans,
      pagination: {
        page,
        limit,
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit)
      }
    };
  }

  static async getLoanById(loanId) {
    const selectQuery = `
      SELECT 
        l.*,
        u.username,
        u.email,
        ep.first_name,
        ep.last_name,
        ep.department,
        ep.job_grade,
        ep.employment_status
      FROM loans l
      LEFT JOIN users u ON l.user_id = u.id
      LEFT JOIN employee_profiles ep ON u.id = ep.user_id
      WHERE l.id = ?
    `;
    
    const loans = await query(selectQuery, [loanId]);
    return loans[0] || null;
  }

  static async addLoanTransaction(loanId, transactionType, amount, referenceId, description) {
    const connection = await transaction();
    
    try {
      // Get current loan balance
      const [loan] = await connection.execute(
        'SELECT outstanding_balance FROM loans WHERE id = ? FOR UPDATE',
        [loanId]
      );
      
      if (!loan || !loan[0]) {
        throw new Error('Loan not found');
      }
      
      const currentBalance = parseFloat(loan[0].outstanding_balance);
      let newBalance;
      
      if (transactionType === 'DISBURSEMENT') {
        newBalance = currentBalance + amount;
      } else if (transactionType === 'PAYMENT') {
        newBalance = currentBalance - amount;
        if (newBalance < 0) {
          throw new Error('Payment exceeds outstanding balance');
        }
      } else if (transactionType === 'INTEREST') {
        newBalance = currentBalance + amount;
      } else if (transactionType === 'PENALTY') {
        newBalance = currentBalance + amount;
      } else {
        throw new Error('Invalid transaction type');
      }
      
      // Add transaction
      const insertQuery = `
        INSERT INTO loan_transactions (
          loan_id, user_id, transaction_type, amount, balance_before, balance_after,
          reference_id, description, transaction_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `;
      
      const [transactionResult] = await connection.execute(insertQuery, [
        loanId, null, transactionType, amount, currentBalance, newBalance, referenceId, description
      ]);
      
      // Update loan balance
      await connection.execute(
        'UPDATE loans SET outstanding_balance = ?, updated_at = NOW() WHERE id = ?',
        [newBalance, loanId]
      );
      
      // Update loan status if paid off
      if (newBalance <= 0) {
        await connection.execute(
          'UPDATE loans SET status = "COMPLETED", completion_date = NOW() WHERE id = ?',
          [loanId]
        );
      }
      
      await connection.commit();
      
      return {
        transactionId: transactionResult.insertId,
        newBalance
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  }

  static async getLoanTransactions(loanId, page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;
    let whereClause = 'WHERE loan_id = ?';
    const params = [loanId];
    
    if (filters.transaction_type) {
      whereClause += ' AND transaction_type = ?';
      params.push(filters.transaction_type);
    }
    
    if (filters.start_date) {
      whereClause += ' AND transaction_date >= ?';
      params.push(filters.start_date);
    }
    
    if (filters.end_date) {
      whereClause += ' AND transaction_date <= ?';
      params.push(filters.end_date);
    }
    
    const countQuery = `
      SELECT COUNT(*) as total FROM loan_transactions ${whereClause}
    `;
    
    const selectQuery = `
      SELECT * FROM loan_transactions ${whereClause}
      ORDER BY transaction_date DESC
      LIMIT ? OFFSET ?
    `;
    
    const [countResult, transactions] = await Promise.all([
      query(countQuery, params),
      query(selectQuery, [...params, limit, offset])
    ]);
    
    return {
      transactions,
      pagination: {
        page,
        limit,
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit)
      }
    };
  }

  static async getUserLoanTransactions(userId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const selectQuery = `
      SELECT lt.*, l.loan_amount, l.employee_id
      FROM loan_transactions lt
      JOIN loans l ON lt.loan_id = l.id
      WHERE l.user_id = ?
      ORDER BY lt.transaction_date DESC
      LIMIT ? OFFSET ?
    `;
    
    const countQuery = `
      SELECT COUNT(*) as total
      FROM loan_transactions lt
      JOIN loans l ON lt.loan_id = l.id
      WHERE l.user_id = ?
    `;
    
    const [transactions, countResult] = await Promise.all([
      query(selectQuery, [userId, limit, offset]),
      query(countQuery, [userId])
    ]);
    
    return {
      transactions,
      pagination: {
        page,
        limit,
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit)
      }
    };
  }

  static async updateLoanStatus(loanId, status) {
    const updateQuery = `
      UPDATE loans 
      SET status = ?, updated_at = NOW()
      WHERE id = ?
    `;
    
    const result = await query(updateQuery, [status, loanId]);
    return result.affectedRows > 0;
  }

  static async calculateLoanAmount(loanAmount, interestRate, termMonths) {
    const monthlyRate = interestRate / 100 / 12;
    const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
                         (Math.pow(1 + monthlyRate, termMonths) - 1);
    
    return {
      loanAmount,
      interestRate,
      termMonths,
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
      totalInterest: Math.round((monthlyPayment * termMonths - loanAmount) * 100) / 100,
      totalPayment: Math.round(monthlyPayment * termMonths * 100) / 100
    };
  }

  static async getLoanStats() {
    const [stats] = await query(`
      SELECT 
        COUNT(*) as total_applications,
        COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending_applications,
        COUNT(CASE WHEN status = 'APPROVED' THEN 1 END) as approved_applications,
        COUNT(CASE WHEN status = 'REJECTED' THEN 1 END) as rejected_applications,
        COUNT(CASE WHEN status = 'DISBURSED' THEN 1 END) as disbursed_applications
      FROM loan_applications
    `);
    
    const [loanStats] = await query(`
      SELECT 
        COUNT(*) as total_loans,
        COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END) as active_loans,
        COUNT(CASE WHEN status = 'OVERDUE' THEN 1 END) as overdue_loans,
        COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed_loans,
        SUM(outstanding_balance) as total_outstanding,
        AVG(outstanding_balance) as average_balance
      FROM loans
    `);
    
    return {
      applications: stats[0],
      loans: loanStats[0]
    };
  }

  static async getOverdueLoans() {
    const [loans] = await query(`
      SELECT 
        l.*,
        u.username,
        ep.first_name,
        ep.last_name,
        ep.department,
        DATEDIFF(NOW(), l.next_payment_date) as days_overdue
      FROM loans l
      LEFT JOIN users u ON l.user_id = u.id
      LEFT JOIN employee_profiles ep ON u.id = ep.user_id
      WHERE l.status IN ('ACTIVE', 'OVERDUE')
      AND l.next_payment_date < NOW()
      AND l.outstanding_balance > 0
      ORDER BY days_overdue DESC
    `);
    
    return loans;
  }

  static async getLoanPortfolioByStatus() {
    const [portfolio] = await query(`
      SELECT 
        status,
        COUNT(*) as count,
        SUM(outstanding_balance) as total_balance,
        AVG(outstanding_balance) as average_balance,
        SUM(loan_amount) as total_loan_amount
      FROM loans
      GROUP BY status
      ORDER BY status
    `);
    
    return portfolio;
  }

  static async getLoanPortfolioByDepartment() {
    const [portfolio] = await query(`
      SELECT 
        ep.department,
        COUNT(*) as count,
        SUM(l.outstanding_balance) as total_balance,
        AVG(l.outstanding_balance) as average_balance,
        SUM(l.loan_amount) as total_loan_amount
      FROM loans l
      LEFT JOIN users u ON l.user_id = u.id
      LEFT JOIN employee_profiles ep ON u.id = ep.user_id
      WHERE l.status IN ('ACTIVE', 'OVERDUE')
      GROUP BY ep.department
      ORDER BY total_balance DESC
    `);
    
    return portfolio;
  }

  static async getAllLoans() {
    const loansQuery = `
      SELECT l.*, u.employee_id, u.username, ep.first_name, ep.last_name
      FROM loans l
      JOIN users u ON l.user_id = u.id
      LEFT JOIN employee_profiles ep ON u.id = ep.user_id
      ORDER BY l.created_at DESC
    `;
    
    try {
      const loans = await query(loansQuery);
      return loans;
    } catch (error) {
      throw error;
    }
  }

  static async getLoanApplicationById(applicationId) {
    const applicationQuery = `
      SELECT la.*, u.employee_id, u.username, ep.first_name, ep.last_name
      FROM loan_applications la
      JOIN users u ON la.user_id = u.id
      LEFT JOIN employee_profiles ep ON u.id = ep.user_id
      WHERE la.id = ?
    `;
    
    try {
      const applications = await query(applicationQuery, [applicationId]);
      return applications[0];
    } catch (error) {
      throw error;
    }
  }

  static async reviewLoanApplication(applicationId, reviewComments, approved, reviewedBy) {
    const updateQuery = `
      UPDATE loan_applications 
      SET status = ?, review_comments = ?, review_date = NOW(), reviewed_by = ?
      WHERE id = ?
    `;
    
    try {
      await query(updateQuery, [approved ? 'APPROVED' : 'REJECTED', reviewComments, reviewedBy, applicationId]);
      return { message: `Loan application ${approved ? 'approved' : 'rejected'} successfully` };
    } catch (error) {
      throw error;
    }
  }

  static async getLoans() {
    const loansQuery = `
      SELECT l.*, u.employee_id, u.username, ep.first_name, ep.last_name
      FROM loans l
      JOIN users u ON l.user_id = u.id
      LEFT JOIN employee_profiles ep ON u.id = ep.user_id
      ORDER BY l.created_at DESC
    `;
    
    try {
      const loans = await query(loansQuery);
      return loans;
    } catch (error) {
      throw error;
    }
  }

  static async getLoanStats() {
    const statsQuery = `
      SELECT 
        COUNT(*) as total_loans,
        SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) as active_loans,
        SUM(CASE WHEN status = 'OVERDUE' THEN 1 ELSE 0 END) as overdue_loans,
        SUM(loan_amount) as total_loan_amount,
        SUM(CASE WHEN status = 'ACTIVE' THEN loan_amount ELSE 0 END) as active_loan_amount
      FROM loans
    `;
    
    try {
      const stats = await query(statsQuery);
      return stats[0];
    } catch (error) {
      throw error;
    }
  }

  static async getOverdueLoans() {
    const overdueQuery = `
      SELECT l.*, u.employee_id, u.username, ep.first_name, ep.last_name
      FROM loans l
      JOIN users u ON l.user_id = u.id
      LEFT JOIN employee_profiles ep ON u.id = ep.user_id
      WHERE l.status = 'OVERDUE' OR (l.due_date < NOW() AND l.status = 'ACTIVE')
      ORDER BY l.due_date ASC
    `;
    
    try {
      const overdueLoans = await query(overdueQuery);
      return overdueLoans;
    } catch (error) {
      throw error;
    }
  }

  static async getUserLoanById(loanId, userId) {
    const userLoanQuery = `
      SELECT l.*, u.employee_id, u.username, ep.first_name, ep.last_name
      FROM loans l
      JOIN users u ON l.user_id = u.id
      LEFT JOIN employee_profiles ep ON u.id = ep.user_id
      WHERE l.id = ? AND l.user_id = ?
    `;
    
    try {
      const loans = await query(userLoanQuery, [loanId, userId]);
      return loans[0];
    } catch (error) {
      throw error;
    }
  }

  static async disburseLoan(loanId, disbursementDate, disbursementMethod) {
    const disburseQuery = `
      UPDATE loans 
      SET status = 'DISBURSED', disbursement_date = ?, disbursement_method = ?, updated_at = NOW()
      WHERE id = ? AND status = 'APPROVED'
    `;
    
    try {
      await query(disburseQuery, [disbursementDate, disbursementMethod, loanId]);
      return { message: 'Loan disbursed successfully' };
    } catch (error) {
      throw error;
    }
  }

  static async updateLoanStatus(loanId, status, notes) {
    const statusUpdateQuery = `
      UPDATE loans 
      SET status = ?, notes = ?, updated_at = NOW()
      WHERE id = ?
    `;
    
    try {
      await query(statusUpdateQuery, [status, notes, loanId]);
      return { message: 'Loan status updated successfully' };
    } catch (error) {
      throw error;
    }
  }

  static async checkEligibility(userId) {
    console.log('Checking loan eligibility for userId:', userId);
    
    const user = await query(`
      SELECT 
        u.id,
        u.employee_id,
        u.is_active,
        u.email_verified,
        ep.employment_status,
        ep.hire_date,
        DATEDIFF(NOW(), ep.hire_date) as days_employed,
        (SELECT COUNT(*) FROM loans WHERE user_id = ? AND status IN ('ACTIVE', 'OVERDUE')) as active_loans,
        (SELECT COUNT(*) FROM loan_applications WHERE user_id = ? AND status = 'PENDING') as pending_applications
      FROM users u
      LEFT JOIN employee_profiles ep ON u.id = ep.user_id
      WHERE u.id = ?
    `, [userId, userId, userId]);
    
    console.log('Query result:', user);
    console.log('User found:', !user || user.length === 0 ? 'NO' : 'YES');
    if (user && user.length > 0) {
      console.log('Employment status:', user[0].employment_status);
      console.log('Employee profile exists:', user[0].employment_status ? 'YES' : 'NO');
    }
    
    if (!user || user.length === 0) {
      return { eligible: false, reason: 'User not found or missing employee profile' };
    }
    
    const userData = user[0];
    
    // Check if user has employee profile
    if (!userData.employment_status) {
      return { eligible: false, reason: 'Employee profile required for loan application' };
    }
    
    // Check eligibility criteria
    if (!userData.is_active) {
      return { eligible: false, reason: 'User account is not active' };
    }
    
    if (!userData.email_verified) {
      return { eligible: false, reason: 'User account is not verified' };
    }
    
    if (userData.employment_status !== 'ACTIVE') {
      return { eligible: false, reason: 'Employment status is not active' };
    }
    
    if (userData.days_employed < 90 || userData.days_employed === null) {
      return { eligible: false, reason: 'Must be employed for at least 90 days' };
    }
    
    if (userData.active_loans >= 2) {
      return { eligible: false, reason: 'Maximum active loans reached (2)' };
    }
    
    if (userData.pending_applications > 0) {
      return { eligible: false, reason: 'Has pending loan applications' };
    }
    
    return { 
      eligible: true, 
      employee_id: userData.employee_id,
      user_data: userData 
    };
  }
}

module.exports = LoanModel;
