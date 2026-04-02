import apiClient from './api';

class EnterpriseSavingsAPI {
  
  static async getSavingsDashboard() {
    const response = await apiClient.get('/savings/dashboard');
    return response.data;
  }

  
  static async createSavingsAccount(savingPercentage = null) {
    const requestBody = savingPercentage ? { saving_percentage: savingPercentage } : {};
    const response = await apiClient.post('/savings/account', requestBody);
    return response.data;
  }

  
  static async getSavingsStatistics() {
    const response = await apiClient.get('/savings/statistics');
    return response.data;
  }

  
  static async simulateSavingsChange(newValue, savingsType, effectiveDate) {
    const response = await apiClient.post('/savings/simulate', {
      newValue,
      savingsType,
      effectiveDate
    });
    return response.data;
  }

  
  static async submitSavingsRequest(requestData) {
    const response = await apiClient.post('/savings/requests', requestData);
    return response.data;
  }

  
  static async getSavingsHistory(page = 1, limit = 20) {
    const response = await apiClient.get('/savings/history', {
      params: { page, limit }
    });
    return response.data;
  }

  
  static async getSavingsConstraints() {
    const response = await apiClient.get('/savings/constraints');
    return response.data;
  }

  
  static async getPendingRequests() {
    const response = await apiClient.get('/savings/requests/pending');
    return response.data;
  }

  
  static async cancelRequest(requestId) {
    const response = await apiClient.delete(`/savings/requests/${requestId}`);
    return response.data;
  }

  
  static formatCurrency(amount) {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  
  static formatCompactCurrency(amount) {
    if (amount >= 1000000) {
      return (amount / 1000000).toFixed(2).replace(/\.00$/, '') + 'M ETB';
    }
    if (amount >= 1000) {
      return (amount / 1000).toFixed(1).replace(/\.0$/, '') + 'K ETB';
    }
    return this.formatCurrency(amount);
  }

  
  static getNextPayrollDate() {
    const now = new Date();
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return lastDayOfMonth.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }

  
  static getEffectiveDateOptions() {
    const options = [];
    const now = new Date();
    
    
    const nextPayroll = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    options.push({
      value: nextPayroll.toISOString().split('T')[0],
      label: `Next Payroll (${nextPayroll.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`,
      default: true
    });
    
    
    const followingMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0);
    options.push({
      value: followingMonth.toISOString().split('T')[0],
      label: `Following Month (${followingMonth.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`
    });
    
    
    options.push({
      value: 'custom',
      label: 'Specific Date',
      custom: true
    });
    
    return options;
  }

  
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

  
  static formatPercentage(value) {
    return `${parseFloat(value).toFixed(1)}%`;
  }

  
  static calculateProjectedAnnual(monthlyAmount) {
    return monthlyAmount * 12;
  }

  
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
