import apiClient from '../services/api';


export const savingsAPI = {
  
  getSavingsAccount: async () => {
    const response = await apiClient.get('/savings/account');
    return response.data;
  },

  
  createSavingsAccount: async (savingPercentage = null) => {
    const requestBody = savingPercentage ? { saving_percentage: savingPercentage } : {};
    const response = await apiClient.post('/savings/account', requestBody);
    return response.data;
  },

  
  updateSavingPercentage: async (savingPercentage, reason) => {
    const response = await apiClient.put('/savings/account/percentage', {
      saving_percentage: savingPercentage,
      reason: reason
    });
    return response.data;
  },

  
  getSavingsTransactions: async (page = 1, limit = 10, filters = {}) => {
    const params = { page, limit, ...filters };
    const response = await apiClient.get('/savings/transactions', params);
    return response.data;
  },

  
  addContribution: async (amount, description) => {
    const response = await apiClient.post('/savings/contribute', {
      amount,
      description
    });
    return response.data;
  },

  
  async withdrawSavings(amount, reason) {
    const response = await apiClient.post('/savings/withdraw', {
      amount,
      reason
    });
    return response.data;
  },

  
  getSavingsStats: async (period = 'MONTHLY') => {
    const response = await apiClient.get('/savings/stats', { period });
    return response.data;
  },

  
  getSavingsRequests: async () => {
    const response = await apiClient.get('/savings/requests');
    return response.data;
  },

  
  handleSavingsRequest: async (requestId, status, comments) => {
    const response = await apiClient.put(`/savings/requests/${requestId}/handle`, {
      status,
      comments
    });
    return response.data;
  }
};
