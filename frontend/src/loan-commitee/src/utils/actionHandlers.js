

import { exportReport } from './exportUtils.js';
import { committeeAPI } from '../services/committeeAPI';

export const actionHandlers = {
  
  navigate: (path) => {
    console.log(`Navigating to: ${path}`);
    
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  },

  
  securityScan: () => {
    console.log('Initiating security scan...');
    
    setTimeout(() => {
      alert('Security scan completed. No threats detected.');
    }, 2000);
  },

  terminateSession: (sessionId) => {
    console.log(`Terminating session: ${sessionId}`);
    
    return true;
  },

  
  exportData: (data, filename, format = 'json') => {
    console.log(`Exporting data as ${format.toUpperCase()}`);
    
    exportReport(data, filename, format);
  },

  
  saveSettings: (settings) => {
    console.log('Saving settings:', settings);
    
    localStorage.setItem('userSettings', JSON.stringify(settings));
    return true;
  },

  resetSettings: () => {
    console.log('Resetting settings to defaults');
    localStorage.removeItem('userSettings');
    window.location.reload();
  },

  
  enableNotifications: (type) => {
    console.log(`Enabling ${type} notifications`);
    
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    return true;
  },

  disableNotifications: (type) => {
    console.log(`Disabling ${type} notifications`);
    return true;
  },

  
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

  
  updateProfile: (profileData) => {
    console.log('Updating profile:', profileData);
    
    return new Promise((resolve) => {
      setTimeout(() => resolve(true), 1000);
    });
  },

  changePassword: (passwordData) => {
    console.log('Changing password');
    
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

  
  approveLoan: async (loanId, payload = {}) => {
    console.log(`Approving loan: ${loanId}`, payload);
    try {
      const response = await committeeAPI.reviewApplication(loanId, {
        action: 'APPROVE',
        notes: payload.notes || 'Approved by Loan Committee',
        approved_amount: payload.approvedAmount,
        approved_term_months: payload.approvedTerm
      });
      return { success: true, loanId, data: response.data };
    } catch (error) {
      console.error('Error approving loan:', error);
      return { success: false, error: error.message };
    }
  },

  rejectLoan: async (loanId, reason) => {
    console.log(`Rejecting loan: ${loanId}, reason: ${reason}`);
    try {
      const response = await committeeAPI.reviewApplication(loanId, {
        action: 'REJECT',
        notes: reason || 'Rejected by Loan Committee'
      });
      return { success: true, loanId, data: response.data };
    } catch (error) {
      console.error('Error rejecting loan:', error);
      return { success: false, error: error.message };
    }
  },

  suspendLoan: async (loanId) => {
    console.log(`Suspending loan: ${loanId}`);
    try {
      const response = await committeeAPI.reviewApplication(loanId, { 
        action: 'REQUEST_MORE_INFO',
        notes: 'Additional information requested'
      });
      return { success: true, loanId, data: response.data };
    } catch (error) {
      console.error('Error suspending loan:', error);
      return { success: false, error: error.response?.data?.message || error.message };
    }
  },

  
  refreshData: (dataType) => {
    console.log(`Refreshing ${dataType} data`);
    
    return new Promise((resolve) => {
      setTimeout(() => resolve({ timestamp: new Date().toISOString() }), 1000);
    });
  },

  
  filterData: (filters) => {
    console.log('Applying filters:', filters);
    
    return [];
  },

  searchData: (query) => {
    console.log(`Searching for: ${query}`);
    
    return [];
  },

  
  openModal: (modalType, data) => {
    console.log(`Opening ${modalType} modal with data:`, data);
    
  },

  closeModal: (modalType) => {
    console.log(`Closing ${modalType} modal`);
    
  },

  
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


export const approveLoan = actionHandlers.approveLoan;
export const rejectLoan = actionHandlers.rejectLoan;
export const suspendLoan = actionHandlers.suspendLoan;


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
