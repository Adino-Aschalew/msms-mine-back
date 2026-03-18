// Central action handlers for all website functionality

import { exportReport } from './exportUtils.js';
import { loanCommitteeAPI } from '../../../shared/services/loansAPI';

export const actionHandlers = {
  // Navigation actions
  navigate: (path) => {
    console.log(`Navigating to: ${path}`);
    // In a real app, this would use React Router's navigate
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  },

  // Security actions
  securityScan: () => {
    console.log('Initiating security scan...');
    // Simulate security scan
    setTimeout(() => {
      alert('Security scan completed. No threats detected.');
    }, 2000);
  },

  terminateSession: (sessionId) => {
    console.log(`Terminating session: ${sessionId}`);
    // In a real app, this would call an API
    return true;
  },

  // Export actions
  exportData: (data, filename, format = 'json') => {
    console.log(`Exporting data as ${format.toUpperCase()}`);
    // Use the export utilities
    exportReport(data, filename, format);
  },

  // Settings actions
  saveSettings: (settings) => {
    console.log('Saving settings:', settings);
    // In a real app, this would save to backend
    localStorage.setItem('userSettings', JSON.stringify(settings));
    return true;
  },

  resetSettings: () => {
    console.log('Resetting settings to defaults');
    localStorage.removeItem('userSettings');
    window.location.reload();
  },

  // Notification actions
  enableNotifications: (type) => {
    console.log(`Enabling ${type} notifications`);
    // In a real app, this would request permission and update settings
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    return true;
  },

  disableNotifications: (type) => {
    console.log(`Disabling ${type} notifications`);
    return true;
  },

  // Theme actions
  changeTheme: (theme) => {
    console.log(`Changing theme to: ${theme}`);
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  },

  toggleAutoTheme: (enabled) => {
    console.log(`Auto-theme ${enabled ? 'enabled' : 'disabled'}`);
    if (enabled) {
      const hour = new Date().getHours();
      const theme = hour >= 6 && hour < 18 ? 'light' : 'dark';
      actionHandlers.changeTheme(theme);
    }
  },

  // User actions
  updateProfile: (profileData) => {
    console.log('Updating profile:', profileData);
    // In a real app, this would call an API
    return new Promise((resolve) => {
      setTimeout(() => resolve(true), 1000);
    });
  },

  changePassword: (passwordData) => {
    console.log('Changing password');
    // In a real app, this would validate and call API
    return new Promise((resolve) => {
      setTimeout(() => {
        if (passwordData.newPassword === passwordData.confirmPassword) {
          resolve(true);
        } else {
          resolve(false);
        }
      }, 1000);
    });
  },

  // Loan actions
  approveLoan: async (loanId, payload = {}) => {
    console.log(`Approving loan: ${loanId}`, payload);
    try {
      const response = await loanCommitteeAPI.approveLoan(loanId, payload);
      return { success: true, loanId };
    } catch (error) {
      console.error('Error approving loan:', error);
      return { success: false, error: error.response?.data?.message || error.message };
    }
  },

  rejectLoan: async (loanId, reason) => {
    console.log(`Rejecting loan: ${loanId}, reason: ${reason}`);
    try {
      const response = await loanCommitteeAPI.rejectLoan(loanId, { notes: reason });
      return { success: true, loanId };
    } catch (error) {
      console.error('Error rejecting loan:', error);
      return { success: false, error: error.response?.data?.message || error.message };
    }
  },

  suspendLoan: async (loanId) => {
    console.log(`Suspending loan: ${loanId}`);
    try {
      const response = await loanCommitteeAPI.reviewApplication(loanId, { decision: 'request_more_info' });
      return { success: true, loanId };
    } catch (error) {
      console.error('Error suspending loan:', error);
      return { success: false, error: error.response?.data?.message || error.message };
    }
  },

  // Dashboard actions
  refreshData: (dataType) => {
    console.log(`Refreshing ${dataType} data`);
    // Simulate data refresh
    return new Promise((resolve) => {
      setTimeout(() => resolve({ timestamp: new Date().toISOString() }), 1000);
    });
  },

  // Filter and search actions
  filterData: (filters) => {
    console.log('Applying filters:', filters);
    // In a real app, this would filter the data
    return [];
  },

  searchData: (query) => {
    console.log(`Searching for: ${query}`);
    // In a real app, this would search the data
    return [];
  },

  // Modal actions
  openModal: (modalType, data) => {
    console.log(`Opening ${modalType} modal with data:`, data);
    // This would be handled by component state
  },

  closeModal: (modalType) => {
    console.log(`Closing ${modalType} modal`);
    // This would be handled by component state
  },

  // Utility actions
  copyToClipboard: (text) => {
    console.log(`Copying to clipboard: ${text}`);
    navigator.clipboard.writeText(text).then(() => {
      console.log('Copied successfully');
    });
  },

  printPage: () => {
    console.log('Printing page');
    window.print();
  },

  downloadFile: (url, filename) => {
    console.log(`Downloading file: ${filename}`);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  },

  // Form actions
  validateForm: (formData, rules) => {
    console.log('Validating form:', formData);
    const errors = {};
    
    Object.keys(rules).forEach(field => {
      const rule = rules[field];
      const value = formData[field];
      
      if (rule.required && !value) {
        errors[field] = `${field} is required`;
      }
      
      if (rule.minLength && value.length < rule.minLength) {
        errors[field] = `${field} must be at least ${rule.minLength} characters`;
      }
      
      if (rule.pattern && !rule.pattern.test(value)) {
        errors[field] = `${field} format is invalid`;
      }
    });
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  // API simulation actions
  simulateApiCall: (endpoint, method = 'GET', data = null) => {
    console.log(`API Call: ${method} ${endpoint}`, data);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: data || { message: 'Operation successful' },
          timestamp: new Date().toISOString()
        });
      }, 1000);
    });
  }
};

// Button click handler wrapper
export const handleButtonClick = (action, data = null, callback = null) => {
  console.log(`Button clicked: ${action}`, data);
  
  if (typeof action === 'string' && actionHandlers[action]) {
    const result = actionHandlers[action](data);
    
    if (result instanceof Promise) {
      result.then(response => {
        if (callback) callback(response);
      }).catch(error => {
        console.error(`Error in ${action}:`, error);
        if (callback) callback({ error });
      });
    } else {
      if (callback) callback(result);
    }
  } else if (typeof action === 'function') {
    action(data);
  } else {
    console.warn(`Unknown action: ${action}`);
  }
};

// Direct exports for commonly used functions
export const approveLoan = actionHandlers.approveLoan;
export const rejectLoan = actionHandlers.rejectLoan;
export const suspendLoan = actionHandlers.suspendLoan;

// Common button configurations
export const buttonConfigs = {
  primary: {
    className: 'btn btn-primary',
    onClick: handleButtonClick
  },
  secondary: {
    className: 'btn btn-secondary',
    onClick: handleButtonClick
  },
  danger: {
    className: 'btn btn-danger',
    onClick: handleButtonClick
  },
  success: {
    className: 'btn btn-success',
    onClick: handleButtonClick
  },
  outline: {
    className: 'btn btn-outline',
    onClick: handleButtonClick
  }
};
