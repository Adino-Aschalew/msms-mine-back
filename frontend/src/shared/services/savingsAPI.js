import apiClient from '../services/api';

// Savings API
export const savingsAPI = {
  // Get savings account
  getSavingsAccount: async () => {
    const response = await apiClient.get('/api/savings/account');
    return response.data;
  },

  // Create savings account
  createSavingsAccount: async (savingPercentage) => {
    const response = await apiClient.post('/api/savings/account', {
      saving_percentage: savingPercentage
    });
    return response.data;
  },

  // Update saving percentage
  updateSavingPercentage: async (savingPercentage) => {
    const response = await apiClient.put('/api/savings/account/percentage', {
      saving_percentage: savingPercentage
    });
    return response.data;
  },

  // Get savings transactions
  getSavingsTransactions: async (page = 1, limit = 10, filters = {}) => {
    const params = { page, limit, ...filters };
    const response = await apiClient.get('/api/savings/transactions', params);
    return response.data;
  },

  // Add savings contribution
  addContribution: async (amount, description) => {
    const response = await apiClient.post('/api/savings/contribute', {
      amount,
      description
    });
    return response.data;
  },

  // Withdraw savings
  withdrawSavings: async (amount, reason, supportingDocument = null) => {
    const formData = new FormData();
    formData.append('amount', amount);
    formData.append('reason', reason);
    if (supportingDocument) {
      formData.append('supporting_document', supportingDocument);
    }

    const response = await apiClient.upload('/api/savings/withdraw', formData.get('file'), {
      amount,
      reason
    });
    return response.data;
  },

  // Get savings statistics
  getSavingsStats: async (period = 'MONTHLY') => {
    const response = await apiClient.get('/api/savings/stats', { period });
    return response.data;
  }
};
