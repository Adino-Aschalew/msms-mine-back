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

// Loan Committee API endpoints
export const committeeAPI = {
  // Application management
  getPendingApplications: (params = {}) => {
    return api.get('/loan-committee/applications/pending', { params });
  },

  getApprovedApplications: (params = {}) => {
    return api.get('/loan-committee/applications/approved', { params });
  },

  getApplicationById: (applicationId) => {
    return api.get(`/loan-committee/applications/${applicationId}`);
  },

  reviewApplication: (applicationId, reviewData) => {
    return api.put(`/loan-committee/applications/${applicationId}/review`, reviewData);
  },

  approveLoan: (applicationId, data = {}) => {
    return api.put(`/loan-committee/applications/${applicationId}/review`, { 
      action: 'APPROVE',
      ...data 
    });
  },

  rejectLoan: (applicationId, data = {}) => {
    return api.put(`/loan-committee/applications/${applicationId}/review`, { 
      action: 'REJECT',
      ...data 
    });
  },

  disburseLoan: (applicationId, disbursementData) => {
    return api.post(`/loan-committee/applications/${applicationId}/disburse`, disbursementData);
  },

  bulkReviewApplications: (reviewData) => {
    return api.post('/loan-committee/applications/bulk-review', reviewData);
  },

  // Application analysis
  getRiskAnalysis: (params = {}) => {
    return api.get('/loan-committee/applications/risk-analysis', { params });
  },

  getApprovalTrends: (params = {}) => {
    return api.get('/loan-committee/applications/trends', { params });
  },

  exportApplications: (params = {}) => {
    return api.get('/loan-committee/applications/export', { 
      params,
      responseType: 'blob'
    });
  },

  // Dashboard & Reports
  getDashboardData: (params = {}) => {
    return api.get('/loan-committee/dashboard', { params });
  },

  getReportsData: (params = {}) => {
    return api.get('/loan-committee/reports', { params });
  },

  // Committee meetings
  getCommitteeMeetings: (params = {}) => {
    return api.get('/loan-committee/meetings', { params });
  },

  createMeeting: (meetingData) => {
    return api.post('/loan-committee/meetings', meetingData);
  },

  getCommitteeMeetingById: (meetingId) => {
    return api.get(`/loan-committee/meetings/${meetingId}`);
  },

  // Committee management
  getCommitteeMembers: (params = {}) => {
    return api.get('/loan-committee/members', { params });
  },

  getProfile: () => {
    return api.get('/loan-committee/profile');
  },

  updateProfile: (profileData) => {
    return api.put('/loan-committee/profile', profileData);
  },

  getCommitteeStats: (params = {}) => {
    return api.get('/loan-committee/stats', { params });
  },

  getCommitteeWorkload: (params = {}) => {
    return api.get('/loan-committee/workload', { params });
  },

  // Application history
  getApplicationHistory: (applicationId) => {
    return api.get(`/loan-committee/applications/${applicationId}/history`);
  }
};

// Export default API instance
export default api;
