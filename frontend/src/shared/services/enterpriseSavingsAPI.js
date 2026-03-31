import apiClient from './api';

class EnterpriseSavingsAPI {
  // Get complete savings dashboard data
  static async getSavingsDashboard() {
    const response = await apiClient.get('/api/savings/dashboard');
    return response.data;
  }

  // Create savings account
  static async createSavingsAccount(savingPercentage) {
    const response = await apiClient.post('/api/savings/account', {
      saving_percentage: savingPercentage
    });
    return response.data;
  }

  // Get savings statistics for widgets
  static async getSavingsStatistics() {
    const response = await apiClient.get('/api/savings/statistics');
    return response.data;
  }

  // Simulate savings changes
  static async simulateSavingsChange(newValue, savingsType, effectiveDate) {
    const response = await apiClient.post('/api/savings/simulate', {
      newValue,
      savingsType,
      effectiveDate
    });
    return response.data;
  }

  // Submit savings change request
  static async submitSavingsRequest(requestData) {
    const response = await apiClient.post('/api/savings/requests', requestData);
    return response.data;
  }

  // Get savings history
  static async getSavingsHistory(page = 1, limit = 20) {
    const response = await apiClient.get('/api/savings/history', {
      params: { page, limit }
    });
    return response.data;
  }

  // Get system constraints
  static async getSavingsConstraints() {
    const response = await apiClient.get('/api/savings/constraints');
    return response.data;
  }

  // Get pending requests
  static async getPendingRequests() {
    const response = await apiClient.get('/api/savings/requests/pending');
    return response.data;
  }

  // Cancel a request
  static async cancelRequest(requestId) {
    const response = await apiClient.delete(`/api/savings/requests/${requestId}`);
    return response.data;
  }

  // Format currency values
  static formatCurrency(amount) {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  // Format compact currency for large numbers
  static formatCompactCurrency(amount) {
    if (amount >= 1000000) {
      return (amount / 1000000).toFixed(2).replace(/\.00$/, '') + 'M ETB';
    }
    if (amount >= 1000) {
      return (amount / 1000).toFixed(1).replace(/\.0$/, '') + 'K ETB';
    }
    return this.formatCurrency(amount);
  }

  // Calculate next payroll date
  static getNextPayrollDate() {
    const now = new Date();
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return lastDayOfMonth.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }

  // Get effective date options
  static getEffectiveDateOptions() {
    const options = [];
    const now = new Date();
    
    // Next payroll cycle
    const nextPayroll = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    options.push({
      value: nextPayroll.toISOString().split('T')[0],
      label: `Next Payroll (${nextPayroll.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`,
      default: true
    });
    
    // Following month
    const followingMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0);
    options.push({
      value: followingMonth.toISOString().split('T')[0],
      label: `Following Month (${followingMonth.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`
    });
    
    // Add specific date option
    options.push({
      value: 'custom',
      label: 'Specific Date',
      custom: true
    });
    
    return options;
  }

  // Validate savings input
  static validateSavingsInput(value, type, constraints) {
    const numValue = parseFloat(value);
    
    if (isNaN(numValue) || numValue <= 0) {
      return {
        isValid: false,
        message: 'Value must be a positive number'
      };
    }
    
    if (type === 'PERCENTAGE') {
      if (numValue < constraints.minSavingsPercentage || numValue > constraints.maxSavingsPercentage) {
        return {
          isValid: false,
          message: `Percentage must be between ${constraints.minSavingsPercentage}% and ${constraints.maxSavingsPercentage}%`
        };
      }
    }
    
    return {
      isValid: true,
      message: ''
    };
  }

  // Get financial health status color and icon
  static getFinancialHealthStatus(status) {
    const statusConfig = {
      SAFE: {
        color: 'text-emerald-600 dark:text-emerald-400',
        bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
        borderColor: 'border-emerald-200 dark:border-emerald-700/50',
        icon: '✓',
        label: 'Safe',
        description: 'Healthy deduction ratio'
      },
      MODERATE: {
        color: 'text-amber-600 dark:text-amber-400',
        bgColor: 'bg-amber-100 dark:bg-amber-900/30',
        borderColor: 'border-amber-200 dark:border-amber-700/50',
        icon: '⚠',
        label: 'Moderate',
        description: 'Monitor your deductions'
      },
      RISKY: {
        color: 'text-rose-600 dark:text-rose-400',
        bgColor: 'bg-rose-100 dark:bg-rose-900/30',
        borderColor: 'border-rose-200 dark:border-rose-700/50',
        icon: '⚠',
        label: 'Risky',
        description: 'High deduction ratio'
      }
    };
    
    return statusConfig[status] || statusConfig.SAFE;
  }

  // Format percentage display
  static formatPercentage(value) {
    return `${parseFloat(value).toFixed(1)}%`;
  }

  // Calculate projected annual savings
  static calculateProjectedAnnual(monthlyAmount) {
    return monthlyAmount * 12;
  }

  // Get request status configuration
  static getRequestStatusConfig(status) {
    const statusConfig = {
      PENDING: {
        color: 'text-amber-600 dark:text-amber-400',
        bgColor: 'bg-amber-100 dark:bg-amber-900/30',
        borderColor: 'border-amber-200 dark:border-amber-700/50',
        label: 'Pending',
        description: 'Awaiting review'
      },
      UNDER_REVIEW: {
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        borderColor: 'border-blue-200 dark:border-blue-700/50',
        label: 'Under Review',
        description: 'Being processed'
      },
      APPROVED: {
        color: 'text-emerald-600 dark:text-emerald-400',
        bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
        borderColor: 'border-emerald-200 dark:border-emerald-700/50',
        label: 'Approved',
        description: 'Request approved'
      },
      REJECTED: {
        color: 'text-rose-600 dark:text-rose-400',
        bgColor: 'bg-rose-100 dark:bg-rose-900/30',
        borderColor: 'border-rose-200 dark:border-rose-700/50',
        label: 'Rejected',
        description: 'Request rejected'
      },
      APPLIED: {
        color: 'text-purple-600 dark:text-purple-400',
        bgColor: 'bg-purple-100 dark:bg-purple-900/30',
        borderColor: 'border-purple-200 dark:border-purple-700/50',
        label: 'Applied',
        description: 'Changes applied'
      },
      CANCELLED: {
        color: 'text-gray-600 dark:text-gray-400',
        bgColor: 'bg-gray-100 dark:bg-gray-900/30',
        borderColor: 'border-gray-200 dark:border-gray-700/50',
        label: 'Cancelled',
        description: 'Request cancelled'
      }
    };
    
    return statusConfig[status] || statusConfig.PENDING;
  }
}

export default EnterpriseSavingsAPI;
