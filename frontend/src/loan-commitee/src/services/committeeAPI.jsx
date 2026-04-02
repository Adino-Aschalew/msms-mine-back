import apiClient from '../../../shared/services/api';

export const committeeAPI = {
  
  getPendingApplications: (params = {}) => {
    return apiClient.get('/loan-committee/applications/pending', { params });
  },

  getApprovedApplications: (params = {}) => {
    return apiClient.get('/loan-committee/applications/approved', { params });
  },

  getApplicationById: (applicationId) => {
    return apiClient.get(`/loan-committee/applications/${applicationId}`);
  },

  reviewApplication: (applicationId, reviewData) => {
    return apiClient.put(`/loan-committee/applications/${applicationId}/review`, reviewData);
  },

  approveLoan: (applicationId, data = {}) => {
    return apiClient.put(`/loan-committee/applications/${applicationId}/review`, { 
      action: 'APPROVE',
      ...data 
    });
  },

  rejectLoan: (applicationId, data = {}) => {
    return apiClient.put(`/loan-committee/applications/${applicationId}/review`, { 
      action: 'REJECT',
      ...data 
    });
  },

  disburseLoan: (applicationId, disbursementData) => {
    return apiClient.post(`/loan-committee/applications/${applicationId}/disburse`, disbursementData);
  },

  bulkReviewApplications: (reviewData) => {
    return apiClient.post('/loan-committee/applications/bulk-review', reviewData);
  },

  
  getRiskAnalysis: (params = {}) => {
    return apiClient.get('/loan-committee/applications/risk-analysis', { params });
  },

  getApprovalTrends: (params = {}) => {
    return apiClient.get('/loan-committee/applications/trends', { params });
  },

  exportApplications: (params = {}) => {
    return apiClient.get('/loan-committee/applications/export', { 
      params,
      responseType: 'blob'
    });
  },

  
  getDashboardData: (params = {}) => {
    return apiClient.get('/loan-committee/dashboard', { params });
  },

  getReportsData: (params = {}) => {
    return apiClient.get('/loan-committee/reports', { params });
  },

  
  getCommitteeMeetings: (params = {}) => {
    return apiClient.get('/loan-committee/meetings', { params });
  },

  createMeeting: (meetingData) => {
    return apiClient.post('/loan-committee/meetings', meetingData);
  },

  getCommitteeMeetingById: (meetingId) => {
    return apiClient.get(`/loan-committee/meetings/${meetingId}`);
  },

  
  getCommitteeMembers: (params = {}) => {
    return apiClient.get('/loan-committee/members', { params });
  },

  getProfile: () => {
    return apiClient.get('/loan-committee/profile');
  },

  updateProfile: (profileData) => {
    return apiClient.put('/loan-committee/profile', profileData);
  },

  getCommitteeStats: (params = {}) => {
    return apiClient.get('/loan-committee/stats', { params });
  },

  getCommitteeWorkload: (params = {}) => {
    return apiClient.get('/loan-committee/workload', { params });
  },

  
  getApplicationHistory: (applicationId) => {
    return apiClient.get(`/loan-committee/applications/${applicationId}/history`);
  }
};
