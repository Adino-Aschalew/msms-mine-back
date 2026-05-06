import { notificationsAPI } from './notificationsAPI';

export const notificationService = {
  createNotification: async (type, title, message, priority = 'medium') => {
    try {
      await notificationsAPI.createNotification({
        type,
        title,
        message,
        priority,
        notification_type: type.toUpperCase()
      });
    } catch (error) {
      console.error('Failed to create notification:', error);
    }
  },

  // Predefined notification templates
  templates: {
    profile_updated: (fields) => ({
      title: 'Profile Updated',
      message: `Your profile has been updated: ${fields.join(', ')}`,
      priority: 'low'
    }),
    
    password_change: () => ({
      title: 'Password Changed',
      message: 'Your password has been successfully changed for security',
      priority: 'high'
    }),
    
    loan_apply_pending: (loanData) => ({
      title: 'Loan Application Submitted',
      message: `Your ${loanData.type} loan application for $${loanData.amount} is being reviewed`,
      priority: 'medium'
    }),
    
    saving_activated: () => ({
      title: 'Savings Account Activated',
      message: 'Your savings account has been successfully activated',
      priority: 'medium'
    }),
    
    salary_updated: (salaryData) => ({
      title: 'Salary Updated',
      message: `Your monthly salary of $${salaryData.amount} has been processed`,
      priority: 'high'
    }),
    
    payroll_deduction: (deductionData) => ({
      title: 'Payroll Deduction',
      message: `A deduction of $${deductionData.amount} has been processed`,
      priority: 'medium'
    }),
    
    export_completed: (exportData) => ({
      title: 'Export Completed',
      message: `Your ${exportData.format} file is ready for download`,
      priority: 'low'
    }),

    loan_approval: (loanData) => ({
      title: 'Loan Approved',
      message: `Your ${loanData.type} loan for $${loanData.amount} has been approved`,
      priority: 'high'
    }),

    loan_rejection: (loanData) => ({
      title: 'Loan Application Rejected',
      message: `Your ${loanData.type} loan application was not approved`,
      priority: 'high'
    }),

    savings_rate_update: (rateData) => ({
      title: 'Savings Rate Updated',
      message: `Savings interest rate has been updated to ${rateData.rate}%`,
      priority: 'medium'
    }),

    system_update: (updateData) => ({
      title: 'System Update',
      message: updateData.message || 'System maintenance completed successfully',
      priority: 'medium'
    }),

    // Savings request templates
    savings_request_submitted: (requestData) => ({
      title: 'Savings Request Submitted',
      message: `${requestData.employeeName} from ${requestData.department} has requested a savings rate change from ${requestData.oldRate}% to ${requestData.newRate}%`,
      priority: 'medium'
    }),

    savings_request_approved: (requestData) => ({
      title: 'Savings Request Approved',
      message: `Your savings rate change request has been approved. Your rate is now ${requestData.newRate}%`,
      priority: 'high'
    }),

    savings_request_rejected: (requestData) => ({
      title: 'Savings Request Rejected',
      message: `Your savings rate change request was rejected. Reason: ${requestData.comments || 'No reason provided'}`,
      priority: 'high'
    }),

    savings_rate_updated: (requestData) => ({
      title: 'Savings Rate Updated',
      message: `Your savings rate has been updated to ${requestData.newRate}%`,
      priority: 'medium'
    }),

    // Finance admin notifications
    savings_account_activated: (employeeData) => ({
      title: 'Savings Account Activated',
      message: `${employeeData.name} from ${employeeData.department} has activated their savings account at ${employeeData.rate}% rate. Projected annual savings: ${employeeData.projectedAnnualSavings}`,
      priority: 'medium'
    })
  },

  // Helper methods for common notifications
  notifyProfileUpdate: async (fields) => {
    const template = notificationService.templates.profile_updated(fields);
    await notificationService.createNotification('profile_updated', template.title, template.message, template.priority);
  },

  notifyPasswordChange: async () => {
    const template = notificationService.templates.password_change();
    await notificationService.createNotification('password_change', template.title, template.message, template.priority);
  },

  notifyLoanApplication: async (loanData) => {
    const template = notificationService.templates.loan_apply_pending(loanData);
    await notificationService.createNotification('loan_apply_pending', template.title, template.message, template.priority);
  },

  notifySavingActivated: async () => {
    const template = notificationService.templates.saving_activated();
    await notificationService.createNotification('saving_activated', template.title, template.message, template.priority);
  },

  notifySalaryUpdated: async (salaryData) => {
    const template = notificationService.templates.salary_updated(salaryData);
    await notificationService.createNotification('salary_updated', template.title, template.message, template.priority);
  },

  notifyPayrollDeduction: async (deductionData) => {
    const template = notificationService.templates.payroll_deduction(deductionData);
    await notificationService.createNotification('payroll_deduction', template.title, template.message, template.priority);
  },

  notifyExportCompleted: async (exportData) => {
    const template = notificationService.templates.export_completed(exportData);
    await notificationService.createNotification('export_completed', template.title, template.message, template.priority);
  },

  // Savings request notification methods
  notifySavingsRequestSubmitted: async (requestData) => {
    const template = notificationService.templates.savings_request_submitted(requestData);
    await notificationService.createNotification('savings_request_submitted', template.title, template.message, template.priority);
  },

  notifySavingsRequestApproved: async (requestData) => {
    const template = notificationService.templates.savings_request_approved(requestData);
    await notificationService.createNotification('savings_request_approved', template.title, template.message, template.priority);
  },

  notifySavingsRequestRejected: async (requestData) => {
    const template = notificationService.templates.savings_request_rejected(requestData);
    await notificationService.createNotification('savings_request_rejected', template.title, template.message, template.priority);
  },

  notifySavingsRateUpdated: async (requestData) => {
    const template = notificationService.templates.savings_rate_updated(requestData);
    await notificationService.createNotification('savings_rate_updated', template.title, template.message, template.priority);
  },

  // Finance admin notification methods
  notifySavingsAccountActivated: async (employeeData) => {
    const template = notificationService.templates.savings_account_activated(employeeData);
    await notificationService.createNotification('savings_account_activated', template.title, template.message, template.priority);
  },

  // Helper method to refresh employee dashboard
  refreshEmployeeDashboard: async () => {
    // Trigger a custom event that employee dashboard can listen to
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('savingsUpdated', {
        detail: { timestamp: Date.now() }
      }));
    }
  }
};
