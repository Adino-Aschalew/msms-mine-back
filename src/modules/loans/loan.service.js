const LoanModel = require('./loan.model');
const { auditLog } = require('../../middleware/audit');
const NotificationService = require('../../services/notification.service');

class LoanService {
  static async applyForLoan(applicationData, userId, ip, userAgent) {
    try {
      // Check eligibility first
      const eligibility = await LoanModel.checkEligibility(userId);
      if (!eligibility.eligible) {
        throw new Error(eligibility.reason);
      }
      
      // Calculate loan details
      const { loan_amount, interest_rate, loan_term_months } = applicationData;
      const calculation = await LoanModel.calculateLoanAmount(loan_amount, interest_rate, loan_term_months);
      
      // Get employee_id from eligibility check result
      const employee_id = eligibility.employee_id;
      
      // Create loan application
      const applicationId = await LoanModel.createLoanApplication({
        ...applicationData,
        user_id: userId,
        employee_id: employee_id,
        created_by: userId
      });
      
      // Log application
      await auditLog(userId, 'LOAN_APPLICATION_CREATED', 'loan_applications', applicationId, null, applicationData, ip, userAgent);
      
      // Send notification to user
      await NotificationService.createNotification(
        userId,
        'Loan Application Submitted',
        `Your loan application for ${loan_amount} has been submitted for review.`,
        'INFO'
      );
      
      // Send notification to loan committee
      await NotificationService.createNotification(
        null, // System notification
        'New Loan Application',
        `New loan application submitted for ${loan_amount}.`,
        'INFO'
      );
      
      return {
        applicationId,
        message: 'Loan application submitted successfully',
        calculation
      };
    } catch (error) {
      throw error;
    }
  }

  static async getLoanApplications(page = 1, limit = 10, filters = {}) {
    try {
      const result = await LoanModel.getLoanApplications(page, limit, filters);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async getLoanApplicationById(applicationId) {
    try {
      const application = await LoanModel.getLoanApplicationById(applicationId);
      
      if (!application) {
        throw new Error('Loan application not found');
      }
      
      // Parse guarantor details if exists
      if (application.guarantor_details) {
        application.guarantor_details = JSON.parse(application.guarantor_details);
      }
      
      return application;
    } catch (error) {
      throw error;
    }
  }

  static async reviewLoanApplication(applicationId, action, reviewedBy, notes = null, ip, userAgent) {
    try {
      const application = await LoanModel.getLoanApplicationById(applicationId);
      
      if (!application) {
        throw new Error('Loan application not found');
      }
      
      if (application.status !== 'PENDING') {
        throw new Error('Application is not pending review');
      }
      
      let result;
      
      switch (action) {
        case 'approve':
          const { approved_amount, approved_term_months, approved_interest_rate } = notes;
          result = await this.approveLoanApplication(
            applicationId, approved_amount, approved_term_months, approved_interest_rate, reviewedBy, ip, userAgent
          );
          break;
          
        case 'reject':
          result = await this.rejectLoanApplication(applicationId, notes, reviewedBy, ip, userAgent);
          break;
          
        default:
          throw new Error('Invalid action');
      }
      
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async approveLoanApplication(applicationId, approvedAmount, approvedTerm, approvedRate, reviewedBy, ip, userAgent) {
    try {
      const result = await LoanModel.approveLoanApplication(
        applicationId, approvedAmount, approvedTerm, approvedRate, reviewedBy
      );
      
      const application = await LoanModel.getLoanApplicationById(applicationId);
      
      // Log approval
      await auditLog(reviewedBy, 'LOAN_APPLICATION_APPROVED', 'loan_applications', applicationId, null, {
        approved_amount: approvedAmount,
        approved_term_months: approvedTerm,
        approved_interest_rate: approvedRate
      }, ip, userAgent);
      
      // Send notification to user
      await NotificationService.createNotification(
        application.user_id,
        'Loan Application Approved',
        `Your loan application for ${approvedAmount} has been approved.`,
        'SUCCESS'
      );
      
      // Send email notification
      if (application.email) {
        await NotificationService.sendEmail(
          application.email,
          'Loan Application Approved',
          `
            <h2>Loan Application Approved!</h2>
            <p>Dear ${application.first_name} ${application.last_name},</p>
            <p>Your loan application has been approved with the following details:</p>
            <ul>
              <li>Amount: ${approvedAmount}</li>
              <li>Term: ${approvedTerm} months</li>
              <li>Interest Rate: ${approvedRate}%</li>
              <li>Monthly Payment: ${application.monthly_payment}</li>
            </ul>
            <p>The funds will be disbursed to your account shortly.</p>
            <p>Best regards,<br>Loan Committee</p>
          `
        );
      }
      
      return {
        message: 'Loan application approved successfully',
        loanId: result.loanId,
        approvedAmount,
        approvedTerm,
        approvedRate
      };
    } catch (error) {
      throw error;
    }
  }

  static async rejectLoanApplication(applicationId, reason, reviewedBy, ip, userAgent) {
    try {
      const updated = await LoanModel.rejectLoanApplication(applicationId, reason, reviewedBy);
      
      if (!updated) {
        throw new Error('Failed to reject loan application');
      }
      
      const application = await LoanModel.getLoanApplicationById(applicationId);
      
      // Log rejection
      await auditLog(reviewedBy, 'LOAN_APPLICATION_REJECTED', 'loan_applications', applicationId, null, { reason }, ip, userAgent);
      
      // Send notification to user
      await NotificationService.createNotification(
        application.user_id,
        'Loan Application Rejected',
        `Your loan application was rejected. Reason: ${reason}`,
        'ERROR'
      );
      
      // Send email notification
      if (application.email) {
        await NotificationService.sendEmail(
          application.email,
          'Loan Application Rejected',
          `
            <h2>Loan Application Rejected</h2>
            <p>Dear ${application.first_name} ${application.last_name},</p>
            <p>We regret to inform you that your loan application has been rejected.</p>
            <p><strong>Reason:</strong> ${reason}</p>
            <p>If you have any questions or would like to discuss this decision, please contact the loan committee.</p>
            <p>Best regards,<br>Loan Committee</p>
          `
        );
      }
      
      return { message: 'Loan application rejected successfully' };
    } catch (error) {
      throw error;
    }
  }

  static async getLoans(page = 1, limit = 10, filters = {}) {
    try {
      const result = await LoanModel.getLoans(page, limit, filters);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async getLoanById(loanId) {
    try {
      const loan = await LoanModel.getLoanById(loanId);
      
      if (!loan) {
        throw new Error('Loan not found');
      }
      
      return loan;
    } catch (error) {
      throw error;
    }
  }

  static async disburseLoan(loanId, disbursedBy, ip, userAgent) {
    try {
      const loan = await LoanModel.getLoanById(loanId);
      
      if (!loan) {
        throw new Error('Loan not found');
      }
      
      if (loan.status !== 'ACTIVE') {
        throw new Error('Loan is not in active status');
      }
      
      if (loan.disbursement_date) {
        throw new Error('Loan has already been disbursed');
      }
      
      // Add disbursement transaction
      const transaction = await LoanModel.addLoanTransaction(
        loanId, 'DISBURSEMENT', loan.loan_amount, `DISBURSEMENT_${Date.now()}`, 'Loan disbursement'
      );
      
      // Update loan status
      await LoanModel.updateLoanStatus(loanId, 'DISBURSED');
      
      // Log disbursement
      await auditLog(disbursedBy, 'LOAN_DISBURSED', 'loans', loanId, null, { amount: loan.loan_amount }, ip, userAgent);
      
      // Send notification to user
      await NotificationService.createNotification(
        loan.user_id,
        'Loan Disbursed',
        `Your loan of ${loan.loan_amount} has been disbursed to your account.`,
        'SUCCESS'
      );
      
      return {
        message: 'Loan disbursed successfully',
        transactionId: transaction.transactionId,
        amount: loan.loan_amount
      };
    } catch (error) {
      throw error;
    }
  }

  static async makeLoanPayment(loanId, paymentAmount, paymentMethod, userId, ip, userAgent) {
    try {
      const loan = await LoanModel.getLoanById(loanId);
      
      if (!loan) {
        throw new Error('Loan not found');
      }
      
      if (loan.status !== 'ACTIVE' && loan.status !== 'OVERDUE') {
        throw new Error('Loan is not in payable status');
      }
      
      if (paymentAmount <= 0) {
        throw new Error('Payment amount must be greater than 0');
      }
      
      if (paymentAmount > loan.outstanding_balance) {
        throw new Error('Payment amount exceeds outstanding balance');
      }
      
      // Add payment transaction
      const transaction = await LoanModel.addLoanTransaction(
        loanId, 'PAYMENT', paymentAmount, `PAYMENT_${Date.now()}`, `Loan payment via ${paymentMethod}`
      );
      
      // Update next payment date if not fully paid
      if (transaction.newBalance > 0) {
        const nextPaymentDate = new Date(loan.next_payment_date);
        nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
        
        await query('UPDATE loans SET next_payment_date = ? WHERE id = ?', [nextPaymentDate, loanId]);
      }
      
      // Log payment
      await auditLog(userId, 'LOAN_PAYMENT', 'loan_transactions', transaction.transactionId, null, { 
        amount: paymentAmount, 
        payment_method: paymentMethod 
      }, ip, userAgent);
      
      // Send notification to user
      await NotificationService.createNotification(
        loan.user_id,
        'Loan Payment Received',
        `Payment of ${paymentAmount} received. Remaining balance: ${transaction.newBalance}`,
        'SUCCESS'
      );
      
      return {
        message: 'Payment processed successfully',
        transactionId: transaction.transactionId,
        paymentAmount,
        remainingBalance: transaction.newBalance
      };
    } catch (error) {
      throw error;
    }
  }

  static async getLoanTransactions(loanId, page = 1, limit = 10, filters = {}) {
    try {
      const result = await LoanModel.getLoanTransactions(loanId, page, limit, filters);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async getLoanStats() {
    try {
      const stats = await LoanModel.getLoanStats();
      return stats;
    } catch (error) {
      throw error;
    }
  }

  static async getOverdueLoans() {
    try {
      const overdueLoans = await LoanModel.getOverdueLoans();
      return overdueLoans;
    } catch (error) {
      throw error;
    }
  }

  static async getLoanPortfolio() {
    try {
      const [statusPortfolio, departmentPortfolio] = await Promise.all([
        LoanModel.getLoanPortfolioByStatus(),
        LoanModel.getLoanPortfolioByDepartment()
      ]);
      
      return {
        by_status: statusPortfolio,
        by_department: departmentPortfolio
      };
    } catch (error) {
      throw error;
    }
  }

  static async calculateLoanSchedule(loanAmount, interestRate, termMonths) {
    try {
      const calculation = await LoanModel.calculateLoanAmount(loanAmount, interestRate, termMonths);
      
      // Generate amortization schedule
      const schedule = [];
      let balance = loanAmount;
      const monthlyRate = interestRate / 100 / 12;
      const monthlyPayment = calculation.monthlyPayment;
      
      for (let month = 1; month <= termMonths; month++) {
        const interestPayment = balance * monthlyRate;
        const principalPayment = monthlyPayment - interestPayment;
        balance -= principalPayment;
        
        schedule.push({
          month,
          payment: monthlyPayment,
          principal: principalPayment,
          interest: interestPayment,
          balance: Math.max(0, balance)
        });
      }
      
      return {
        calculation,
        schedule
      };
    } catch (error) {
      throw error;
    }
  }

  static async checkEligibility(userId) {
    try {
      const eligibility = await LoanModel.checkEligibility(userId);
      return eligibility;
    } catch (error) {
      throw error;
    }
  }

  static async getUserLoans(userId, page = 1, limit = 10) {
    try {
      const result = await LoanModel.getLoans(page, limit, { user_id: userId });
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async getUserLoanApplications(userId, page = 1, limit = 10) {
    try {
      const result = await LoanModel.getLoanApplications(page, limit, { user_id: userId });
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateLoanStatus(loanId, status, updatedBy, ip, userAgent) {
    try {
      const loan = await LoanModel.getLoanById(loanId);
      
      if (!loan) {
        throw new Error('Loan not found');
      }
      
      const updated = await LoanModel.updateLoanStatus(loanId, status);
      
      if (!updated) {
        throw new Error('Failed to update loan status');
      }
      
      // Log status change
      await auditLog(updatedBy, 'LOAN_STATUS_UPDATE', 'loans', loanId, null, { 
        old_status: loan.status, 
        new_status: status 
      }, ip, userAgent);
      
      // Send notification to user
      await NotificationService.createNotification(
        loan.user_id,
        'Loan Status Updated',
        `Your loan status has been updated to: ${status}`,
        'INFO'
      );
      
      return { message: 'Loan status updated successfully' };
    } catch (error) {
      throw error;
    }
  }

  static async calculateLoanEligibilityScore(userId) {
    try {
      const [user] = await query(`
        SELECT 
          u.id,
          u.is_active,
          u.email_verified,
          ep.employment_status,
          ep.hire_date,
          ep.salary_grade,
          DATEDIFF(NOW(), ep.hire_date) as days_employed,
          (SELECT COUNT(*) FROM loans WHERE user_id = ? AND status IN ('ACTIVE', 'OVERDUE')) as active_loans,
          (SELECT COUNT(*) FROM loan_applications WHERE user_id = ? AND status = 'APPROVED') as approved_loans,
          (SELECT AVG(l.outstanding_balance) FROM loans WHERE user_id = ? AND status IN ('ACTIVE', 'OVERDUE')) as avg_balance
        FROM users u
        LEFT JOIN employee_profiles ep ON u.id = ep.user_id
        WHERE u.id = ?
      `, [userId, userId, userId, userId]);
      
      if (!user || !user[0]) {
        return { score: 0, reason: 'User not found' };
      }
      
      const userData = user[0];
      let score = 0;
      let deductions = [];
      
      // Employment status (30 points)
      if (userData.is_active && userData.email_verified && userData.employment_status === 'ACTIVE') {
        score += 30;
      } else {
        deductions.push('Not eligible for employment status');
      }
      
      // Employment duration (25 points)
      if (userData.days_employed >= 365) {
        score += 25;
      } else if (userData.days_employed >= 180) {
        score += 20;
      } else if (userData.days_employed >= 90) {
        score += 15;
      } else {
        deductions.push('Insufficient employment duration');
      }
      
      // Salary grade (20 points)
      if (userData.salary_grade >= 5) {
        score += 20;
      } else if (userData.salary_grade >= 3) {
        score += 15;
      } else if (userData.salary_grade >= 2) {
        score += 10;
      } else {
        deductions.push('Low salary grade');
      }
      
      // Current loans (15 points)
      if (userData.active_loans === 0) {
        score += 15;
      } else if (userData.active_loans === 1) {
        score += 10;
      } else {
        score += 5;
        deductions.push('Multiple active loans');
      }
      
      // Payment history (10 points)
      if (userData.approved_loans > 0 && userData.avg_balance < 10000) {
        score += 10;
      } else if (userData.approved_loans > 0 && userData.avg_balance < 50000) {
        score += 5;
      } else {
        deductions.push('High outstanding balance');
      }
      
      return {
        score: Math.max(0, Math.min(100, score)),
        max_score: 100,
        deductions,
        eligibility: score >= 50
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = LoanService;
