import apiClient from '../services/api';

// Savings API
export const savingsAPI = {
  // Get savings account
  getSavingsAccount: async () => {
    const response = await apiClient.get('/savings/account');
    return response.data;
  },

  // Create savings account
  createSavingsAccount: async (savingPercentage = null) => {
    const requestBody = savingPercentage ? { saving_percentage: savingPercentage } : {};
    const response = await apiClient.post('/savings/account', requestBody);
    return response.data;
  },

  // Update saving percentage
  updateSavingPercentage: async (savingPercentage, reason) => {
    const response = await apiClient.put('/savings/account/percentage', {
      saving_percentage: savingPercentage,
      reason: reason
    });
    return response.data;
  },

  // Get savings transactions
  getSavingsTransactions: async (page = 1, limit = 10, filters = {}) => {
    const params = { page, limit, ...filters };
    const response = await apiClient.get('/savings/transactions', params);
    return response.data;
  },

  // Add savings contribution
  addContribution: async (amount, description) => {
    const response = await apiClient.post('/savings/contribute', {
      amount,
      description
    });
    return response.data;
  },

  // Withdraw savings
  async withdrawSavings(amount, reason) {
    const response = await apiClient.post('/savings/withdraw', {
      amount,
      reason
    });
    return response.data;
  },

  // Get savings statistics
  getSavingsStats: async (period = 'MONTHLY') => {
    const response = await apiClient.get('/savings/stats', { period });
    return response.data;
  },

  // Admin: Get all savings update requests
  getSavingsRequests: async () => {
    const response = await apiClient.get('/savings/requests');
    return response.data;
  },

  // Admin: Handle a savings update request
  handleSavingsRequest: async (requestId, status, comments) => {
    const response = await apiClient.put(`/savings/requests/${requestId}/handle`, {
      status,
      comments
    });
    return response.data;
  }
};
