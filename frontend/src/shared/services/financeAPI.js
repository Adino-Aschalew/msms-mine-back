import apiClient from '../services/api';

// Finance API
export const financeAPI = {
  // Get dashboard data
  getDashboardData: async (params = {}) => {
    const response = await apiClient.get('/api/finance/analytics', params);
    return response.data;
  },

  // Get financial overview
  getFinancialOverview: async (period = 'MONTHLY') => {
    const response = await apiClient.get('/api/finance/overview', { period });
    return response.data;
  },

  // Payroll Management
  uploadPayroll: async (file) => {
    const formData = new FormData();
    formData.append('payroll', file);
    const response = await apiClient.post('/api/finance/payroll/upload', formData);
    return response;
  },

  validatePayroll: async (batchId) => {
    const response = await apiClient.put(`/api/finance/payroll/batches/${batchId}/validate`);
    return response.data;
  },

  approvePayroll: async (batchId) => {
    const response = await apiClient.put(`/api/finance/payroll/batches/${batchId}/approve`);
    return response.data;
  },

  processPayroll: async (batchId) => {
    const response = await apiClient.put(`/api/finance/payroll/batches/${batchId}/process`);
    return response.data;
  },

  reversePayroll: async (batchId) => {
    const response = await apiClient.put(`/api/finance/payroll/batches/${batchId}/reverse`);
    return response.data;
  },

  getPayrollBatches: async (params = {}) => {
    const response = await apiClient.get('/api/finance/payroll/batches', params);
    return response.data;
  },

  getPayrollBatchDetails: async (batchId, page = 1, limit = 10) => {
    const response = await apiClient.get(`/api/finance/payroll/batches/${batchId}/details`, { page, limit });
    return response.data;
  },

  getPayrollStats: async () => {
    const response = await apiClient.get('/api/finance/payroll/stats');
    return response.data;
  },

  // Get recent transactions
  getRecentTransactions: async (limit = 10) => {
    const response = await apiClient.get('/api/finance/transactions', { limit });
    return response.data;
  },

  getEmployees: async (params = {}) => {
    const response = await apiClient.get('/api/finance/employees', params);
    return response.data;
  },

  getTransactionsList: async (params = {}) => {
    const response = await apiClient.get('/api/finance/transactions-list', params);
    return response.data;
  },

  getAnalytics: async (params = {}) => {
    const response = await apiClient.get('/api/finance/analytics', params);
    return response.data;
  },

  getBudgets: async () => {
    const response = await apiClient.get('/api/finance/budgets/overview');
    return response.data;
  },

  getDepartments: async () => {
    const response = await apiClient.get('/api/hr/departments'); // Assuming this exists or used by finance too
    return response.data;
  },

  getPayrollHistory: async (userId, params = {}) => {
    const response = await apiClient.get(`/api/finance/payroll/history/${userId}`, params);
    return response.data;
  },

  // Financial Reports
  getFinancialReports: async (reportType, params = {}) => {
    const response = await apiClient.get(`/api/finance/reports/${reportType}`, params);
    return response.data;
  },

  getCashFlowReport: async (period = 'MONTHLY') => {
    const response = await apiClient.get('/api/finance/reports/cash-flow', { period });
    return response.data;
  },

  getProfitLossReport: async (period = 'MONTHLY') => {
    const response = await apiClient.get('/api/finance/reports/profit-loss', { period });
    return response.data;
  },

  getLoanPortfolio: async (filters = {}) => {
    const response = await apiClient.get('/api/finance/reports/loan-portfolio', filters);
    return response.data;
  },

  getSavingsSummary: async (period = 'MONTHLY') => {
    const response = await apiClient.get('/api/finance/reports/savings-summary', { period });
    return response.data;
  },

  // Export Reports
  exportFinancialReport: async (reportType, period = 'MONTHLY', format = 'json') => {
    const params = { period, format };
    const response = await apiClient.get(`/api/finance/export/${reportType}`, params, {
      responseType: format === 'json' ? 'json' : 'blob'
    });
    return response;
  },

  // System Health
  getSystemHealth: async () => {
    const response = await apiClient.get('/api/finance/health');
    return response.data;
  }
};
