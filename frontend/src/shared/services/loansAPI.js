import apiClient from '../services/api';


export const loansAPI = {
  
  applyForLoan: async (loanData) => {
    const response = await apiClient.post('/loans/apply', loanData);
    return response.data;
  },

  
  getLoanApplications: async (page = 1, limit = 10, filters = {}) => {
    const params = { page, limit, ...filters };
    const response = await apiClient.get('/loans/my-applications', params);
    return response.data;
  },

  
  getLoanApplication: async (applicationId) => {
    const response = await apiClient.get(`/loans/applications/${applicationId}`);
    return response.data;
  },

  
  getUserLoans: async (page = 1, limit = 10) => {
    const params = { page, limit };
    const response = await apiClient.get('/loans/my-loans', params);
    return response.data;
  },

  
  getLoanDetails: async (loanId) => {
    const response = await apiClient.get(`/loans/${loanId}`);
    return response.data;
  },

  
  getUserLoanTransactions: async (page = 1, limit = 20) => {
    const params = { page, limit };
    const response = await apiClient.get('/loans/my-transactions', params);
    return response.data;
  },

  
  getLoanRepayments: async (loanId, page = 1, limit = 10) => {
    const params = { page, limit };
    const response = await apiClient.get(`/loans/${loanId}/repayments`, params);
    return response.data;
  },

  
  makeLoanPayment: async (loanId, paymentData) => {
    const response = await apiClient.post(`/loans/${loanId}/payment`, paymentData);
    return response.data;
  },

  
  getLoanEligibility: async () => {
    const response = await apiClient.get('/loans/eligibility');
    return response.data;
  },

  
  calculateLoanEstimate: async (amount, termMonths) => {
    const response = await apiClient.post('/loans/calculate', {
      amount,
      term_months: termMonths
    });
    return response.data;
  }
};


export const loanCommitteeAPI = {
  
  getPendingApplications: async (page = 1, limit = 10) => {
    const params = { page, limit, status: 'pending' };
    const response = await apiClient.get('/loan-committee/applications', params);
    return response.data;
  },

  
  reviewApplication: async (applicationId, reviewData) => {
    const response = await apiClient.put(`/loan-committee/applications/${applicationId}/review`, reviewData);
    return response.data;
  },
  
  
  getApprovedApplications: async (page = 1, limit = 10) => {
    const params = { page, limit };
    const response = await apiClient.get('/loan-committee/applications/approved', params);
    return response.data;
  },

  
  disburseLoan: async (applicationId) => {
    const response = await apiClient.post(`/loan-committee/applications/${applicationId}/disburse`);
    return response.data;
  },

  
  approveLoan: async (applicationId, approvalData = {}) => {
    const response = await apiClient.put(`/loan-committee/applications/${applicationId}/review`, {
      decision: 'approve',
      ...approvalData
    });
    return response.data;
  },

  
  rejectLoan: async (applicationId, rejectionData = {}) => {
    const response = await apiClient.put(`/loan-committee/applications/${applicationId}/review`, {
      decision: 'reject',
      ...rejectionData
    });
    return response.data;
  },

  
  getGuarantorInfo: async (guarantorId) => {
    const response = await apiClient.get(`/loan-committee/guarantors/${guarantorId}`);
    return response.data;
  },

  
  verifyGuarantor: async (guarantorId, verificationData) => {
    const response = await apiClient.post(`/loan-committee/guarantors/${guarantorId}/verify`, verificationData);
    return response.data;
  },

  
  getDashboardData: async () => {
    const response = await apiClient.get('/loan-committee/dashboard');
    return response.data;
  },

  
  getReportsData: async () => {
    const response = await apiClient.get('/loan-committee/reports');
    return response.data;
  }
};
