import axios from 'axios';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:9999/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Loan API endpoints
export const loanAPI = {
  // Get all loan requests
  getLoanRequests: (params = {}) => {
    return api.get('/loans', { params });
  },

  // Get loan request by ID
  getLoanById: (id) => {
    return api.get(`/loans/${id}`);
  },

  // Create new loan request
  createLoanRequest: (loanData) => {
    return api.post('/loans', loanData);
  },

  // Update loan request
  updateLoanRequest: (id, loanData) => {
    return api.put(`/loans/${id}`, loanData);
  },

  // Approve loan
  approveLoan: (id, approvalData) => {
    return api.post(`/loans/${id}/approve`, approvalData);
  },

  // Reject loan
  rejectLoan: (id, rejectionData) => {
    return api.post(`/loans/${id}/reject`, rejectionData);
  },

  // Suspend loan
  suspendLoan: (id, suspensionData) => {
    return api.post(`/loans/${id}/suspend`, suspensionData);
  },

  // Get loan statistics
  getLoanStats: (params = {}) => {
    return api.get('/loans/stats', { params });
  },
};

// Disbursement API endpoints
export const disbursementAPI = {
  // Get all disbursements
  getDisbursements: (params = {}) => {
    return api.get('/disbursements', { params });
  },

  // Get disbursement by ID
  getDisbursementById: (id) => {
    return api.get(`/disbursements/${id}`);
  },

  // Process disbursement
  processDisbursement: (id, disbursementData) => {
    return api.post(`/disbursements/${id}/process`, disbursementData);
  },

  // Get repayment schedule
  getRepaymentSchedule: (loanId) => {
    return api.get(`/disbursements/${loanId}/schedule`);
  },

  // Update repayment status
  updateRepaymentStatus: (paymentId, statusData) => {
    return api.put(`/repayments/${paymentId}`, statusData);
  },
};

// Reports API endpoints
export const reportsAPI = {
  // Get dashboard analytics
  getDashboardAnalytics: (params = {}) => {
    return api.get('/reports/dashboard', { params });
  },

  // Get loan distribution data
  getLoanDistribution: (params = {}) => {
    return api.get('/reports/distribution', { params });
  },

  // Get approval rates
  getApprovalRates: (params = {}) => {
    return api.get('/reports/approval-rates', { params });
  },

  // Get top borrowers
  getTopBorrowers: (params = {}) => {
    return api.get('/reports/top-borrowers', { params });
  },

  // Get guarantor exposure
  getGuarantorExposure: (params = {}) => {
    return api.get('/reports/guarantor-exposure', { params });
  },

  // Export report
  exportReport: (reportType, params = {}) => {
    return api.get(`/reports/export/${reportType}`, { 
      params,
      responseType: 'blob'
    });
  },
};

// Notification API endpoints
export const notificationAPI = {
  // Get user notifications
  getNotifications: (params = {}) => {
    return api.get('/notifications', { params });
  },

  // Mark notification as read
  markAsRead: (notificationId) => {
    return api.put(`/notifications/${notificationId}/read`);
  },

  // Mark all notifications as read
  markAllAsRead: () => {
    return api.put('/notifications/read-all');
  },

  // Delete notification
  deleteNotification: (notificationId) => {
    return api.delete(`/notifications/${notificationId}`);
  },

  // Clear all notifications
  clearAllNotifications: () => {
    return api.delete('/notifications/clear-all');
  },

  // Update notification preferences
  updatePreferences: (preferences) => {
    return api.put('/notifications/preferences', preferences);
  },
};

// Settings API endpoints
export const settingsAPI = {
  // Get loan rules
  getLoanRules: () => {
    return api.get('/settings/loan-rules');
  },

  // Update loan rules
  updateLoanRules: (rules) => {
    return api.put('/settings/loan-rules', rules);
  },

  // Get eligibility rules
  getEligibilityRules: () => {
    return api.get('/settings/eligibility-rules');
  },

  // Update eligibility rules
  updateEligibilityRules: (rules) => {
    return api.put('/settings/eligibility-rules', rules);
  },

  // Reset to defaults
  resetToDefaults: () => {
    return api.post('/settings/reset-defaults');
  },
};

// Account API endpoints
export const accountAPI = {
  // Get user profile
  getProfile: () => {
    return api.get('/account/profile');
  },

  // Update profile
  updateProfile: (profileData) => {
    return api.put('/account/profile', profileData);
  },

  // Upload avatar
  uploadAvatar: (formData) => {
    return api.post('/account/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Change password
  changePassword: (passwordData) => {
    return api.post('/account/change-password', passwordData);
  },

  // Enable 2FA
  enable2FA: () => {
    return api.post('/account/enable-2fa');
  },

  // Disable 2FA
  disable2FA: () => {
    return api.post('/account/disable-2fa');
  },

  // Get active sessions
  getSessions: () => {
    return api.get('/account/sessions');
  },

  // Revoke session
  revokeSession: (sessionId) => {
    return api.delete(`/account/sessions/${sessionId}`);
  },

  // Revoke all sessions except current
  revokeAllSessions: () => {
    return api.post('/account/revoke-all-sessions');
  },

  // Get account activity
  getActivity: (params = {}) => {
    return api.get('/account/activity', { params });
  },

  // Get preferences
  getPreferences: () => {
    return api.get('/account/preferences');
  },

  // Update preferences
  updatePreferences: (preferences) => {
    return api.put('/account/preferences', preferences);
  },
};

// Authentication API endpoints
export const authAPI = {
  // Login
  login: (credentials) => {
    return api.post('/auth/login', credentials);
  },

  // Logout
  logout: () => {
    return api.post('/auth/logout');
  },

  // Refresh token
  refreshToken: () => {
    return api.post('/auth/refresh');
  },

  // Forgot password
  forgotPassword: (email) => {
    return api.post('/auth/forgot-password', { email });
  },

  // Reset password
  resetPassword: (token, newPassword) => {
    return api.post('/auth/reset-password', { token, newPassword });
  },

  // Verify 2FA
  verify2FA: (code) => {
    return api.post('/auth/verify-2fa', { code });
  },
};

// Export default API instance
export default api;
