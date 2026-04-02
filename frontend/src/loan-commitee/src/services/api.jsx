import axios from 'axios';


const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:9999/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});


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


api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);


export const loanAPI = {
  
  getLoanRequests: (params = {}) => {
    return api.get('/loans/applications', { params });
  },

  
  getLoanById: (id) => {
    return api.get(`/loans/applications/${id}`);
  },

  
  createLoanRequest: (loanData) => {
    return api.post('/loans/apply', loanData);
  },

  
  updateLoanRequest: (id, loanData) => {
    return api.put(`/loans/applications/${id}`, loanData);
  },

  
  approveLoan: (id, approvalData) => {
    
    return api.put(`/loans/applications/${id}/review`, { 
      action: 'APPROVE', 
      notes: approvalData.notes || 'Approved by Loan Committee' 
    });
  },

  
  rejectLoan: (id, rejectionData) => {
    return api.put(`/loans/applications/${id}/review`, { 
      action: 'REJECT', 
      notes: rejectionData.notes || rejectionData.reason || 'Rejected by Loan Committee' 
    });
  },

  
  suspendLoan: (id, suspensionData) => {
    return api.put(`/loans/${id}/status`, { 
      status: 'SUSPENDED',
      notes: suspensionData.reason || 'Suspended by system'
    });
  },

  
  getLoanStats: (params = {}) => {
    return api.get('/loans/stats', { params });
  },
};


export const disbursementAPI = {
  
  getDisbursements: (params = {}) => {
    return api.get('/loans', { params });
  },

  
  getDisbursementById: (id) => {
    return api.get(`/loans/${id}`);
  },

  
  processDisbursement: (id, disbursementData) => {
    return api.put(`/loans/${id}/disburse`, disbursementData);
  },

  
  getRepaymentSchedule: (loanId) => {
    return api.get(`/loans/calculate-schedule`, { params: { loanId } });
  },

  
  updateRepaymentStatus: (loanId, statusData) => {
    return api.post(`/loans/${loanId}/pay`, statusData);
  },
};


export const reportsAPI = {
  
  getDashboardAnalytics: (params = {}) => {
    return api.get('/reports/dashboard', { params });
  },

  
  getLoanDistribution: (params = {}) => {
    return api.get('/reports/distribution', { params });
  },

  
  getApprovalRates: (params = {}) => {
    return api.get('/reports/approval-rates', { params });
  },

  
  getTopBorrowers: (params = {}) => {
    return api.get('/reports/top-borrowers', { params });
  },

  
  getGuarantorExposure: (params = {}) => {
    return api.get('/reports/guarantor-exposure', { params });
  },

  
  exportReport: (reportType, params = {}) => {
    return api.get(`/reports/export/${reportType}`, { 
      params,
      responseType: 'blob'
    });
  },
};


export const notificationAPI = {
  
  getNotifications: (params = {}) => {
    return api.get('/notifications', { params });
  },

  
  markAsRead: (notificationId) => {
    return api.put(`/notifications/${notificationId}/read`);
  },

  
  markAllAsRead: () => {
    return api.put('/notifications/read-all');
  },

  
  deleteNotification: (notificationId) => {
    return api.delete(`/notifications/${notificationId}`);
  },

  
  clearAllNotifications: () => {
    return api.delete('/notifications/clear-all');
  },

  
  updatePreferences: (preferences) => {
    return api.put('/notifications/preferences', preferences);
  },
};


export const settingsAPI = {
  
  getLoanRules: () => {
    return api.get('/settings/loan-rules');
  },

  
  updateLoanRules: (rules) => {
    return api.put('/settings/loan-rules', rules);
  },

  
  getEligibilityRules: () => {
    return api.get('/settings/eligibility-rules');
  },

  
  updateEligibilityRules: (rules) => {
    return api.put('/settings/eligibility-rules', rules);
  },

  
  resetToDefaults: () => {
    return api.post('/settings/reset-defaults');
  },
};


export const accountAPI = {
  
  getProfile: () => {
    return api.get('/account/profile');
  },

  
  updateProfile: (profileData) => {
    return api.put('/account/profile', profileData);
  },

  
  uploadAvatar: (formData) => {
    return api.post('/account/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  
  changePassword: (passwordData) => {
    return api.post('/account/change-password', passwordData);
  },

  
  enable2FA: () => {
    return api.post('/account/enable-2fa');
  },

  
  disable2FA: () => {
    return api.post('/account/disable-2fa');
  },

  
  getSessions: () => {
    return api.get('/account/sessions');
  },

  
  revokeSession: (sessionId) => {
    return api.delete(`/account/sessions/${sessionId}`);
  },

  
  revokeAllSessions: () => {
    return api.post('/account/revoke-all-sessions');
  },

  
  getActivity: (params = {}) => {
    return api.get('/account/activity', { params });
  },

  
  getPreferences: () => {
    return api.get('/account/preferences');
  },

  
  updatePreferences: (preferences) => {
    return api.put('/account/preferences', preferences);
  },
};


export const authAPI = {
  
  login: (credentials) => {
    return api.post('/auth/login', credentials);
  },

  
  logout: () => {
    return api.post('/auth/logout');
  },

  
  refreshToken: () => {
    return api.post('/auth/refresh');
  },

  
  forgotPassword: (email) => {
    return api.post('/auth/forgot-password', { email });
  },

  
  resetPassword: (token, newPassword) => {
    return api.post('/auth/reset-password', { token, newPassword });
  },

  
  verify2FA: (code) => {
    return api.post('/auth/verify-2fa', { code });
  },
};


export default api;
