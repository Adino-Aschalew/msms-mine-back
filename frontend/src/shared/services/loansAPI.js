import apiClient from '../services/api';

// Loans API
export const loansAPI = {
  // Apply for loan
  applyForLoan: async (loanData) => {
    const response = await apiClient.post('/api/loans/apply', loanData);
    return response.data;
  },

  // Get loan applications
  getLoanApplications: async (page = 1, limit = 10, filters = {}) => {
    const params = { page, limit, ...filters };
    const response = await apiClient.get('/api/loans/applications', params);
    return response.data;
  },

  // Get loan application details
  getLoanApplication: async (applicationId) => {
    const response = await apiClient.get(`/api/loans/applications/${applicationId}`);
    return response.data;
  },

  // Get user's loans
  getUserLoans: async (page = 1, limit = 10) => {
    const params = { page, limit };
    const response = await apiClient.get('/api/loans/user', params);
    return response.data;
  },

  // Get loan details
  getLoanDetails: async (loanId) => {
    const response = await apiClient.get(`/api/loans/${loanId}`);
    return response.data;
  },

  // Get loan repayments
  getLoanRepayments: async (loanId, page = 1, limit = 10) => {
    const params = { page, limit };
    const response = await apiClient.get(`/api/loans/${loanId}/repayments`, params);
    return response.data;
  },

  // Make loan payment
  makeLoanPayment: async (loanId, paymentData) => {
    const response = await apiClient.post(`/api/loans/${loanId}/payment`, paymentData);
    return response.data;
  },

  // Get loan eligibility
  getLoanEligibility: async () => {
    const response = await apiClient.get('/api/loans/eligibility');
    return response.data;
  },

  // Calculate loan estimate
  calculateLoanEstimate: async (amount, termMonths) => {
    const response = await apiClient.post('/api/loans/calculate', {
      amount,
      term_months: termMonths
    });
    return response.data;
  }
};

// Loan Committee API
export const loanCommitteeAPI = {
  // Get pending applications
  getPendingApplications: async (page = 1, limit = 10) => {
    const params = { page, limit, status: 'pending' };
    const response = await apiClient.get('/api/loan-committee/applications', params);
    return response.data;
  },

  // Review loan application
  reviewApplication: async (applicationId, reviewData) => {
    const response = await apiClient.put(`/api/loan-committee/applications/${applicationId}/review`, reviewData);
    return response.data;
  },
  
  // Get approved applications for disbursement
  getApprovedApplications: async (page = 1, limit = 10) => {
    const params = { page, limit };
    const response = await apiClient.get('/api/loan-committee/applications/approved', params);
    return response.data;
  },

  // Disburse loan
  disburseLoan: async (applicationId) => {
    const response = await apiClient.post(`/api/loan-committee/applications/${applicationId}/disburse`);
    return response.data;
  },

  // Approve loan (wraps reviewApplication)
  approveLoan: async (applicationId, approvalData = {}) => {
    const response = await apiClient.put(`/api/loan-committee/applications/${applicationId}/review`, {
      decision: 'approve',
      ...approvalData
    });
    return response.data;
  },

  // Reject loan (wraps reviewApplication)
  rejectLoan: async (applicationId, rejectionData = {}) => {
    const response = await apiClient.put(`/api/loan-committee/applications/${applicationId}/review`, {
      decision: 'reject',
      ...rejectionData
    });
    return response.data;
  },

  // Get guarantor information
  getGuarantorInfo: async (guarantorId) => {
    const response = await apiClient.get(`/api/loan-committee/guarantors/${guarantorId}`);
    return response.data;
  },

  // Verify guarantor
  verifyGuarantor: async (guarantorId, verificationData) => {
    const response = await apiClient.post(`/api/loan-committee/guarantors/${guarantorId}/verify`, verificationData);
    return response.data;
  },

  // Get committee dashboard data
  getDashboardData: async () => {
    const response = await apiClient.get('/api/loan-committee/dashboard');
    return response.data;
  },

  // Get committee reports data
  getReportsData: async () => {
    const response = await apiClient.get('/api/loan-committee/reports');
    return response.data;
  }
};
