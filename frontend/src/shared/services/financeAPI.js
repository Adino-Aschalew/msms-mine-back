import apiClient from '../services/api';

// Finance API
export const financeAPI = {
  // Get financial overview
  getFinancialOverview: async (period = 'MONTHLY') => {
    const response = await apiClient.get('/api/finance/overview', { period });
    return response.data;
  },

  // Payroll Management
  uploadPayroll: async (file) => {
    const response = await apiClient.upload('/api/finance/payroll/upload', file);
    return response.data;
  },

  processPayroll: async (payrollData) => {
    const response = await apiClient.post('/api/finance/payroll', payrollData);
    return response.data;
  },

  getPayrollBatches: async (page = 1, limit = 10, filters = {}) => {
    const params = { page, limit, ...filters };
    const response = await apiClient.get('/api/finance/payroll/batches', params);
    return response.data;
  },

  getPayrollBatchDetails: async (batchId) => {
    const response = await apiClient.get(`/api/finance/payroll/batches/${batchId}`);
    return response.data;
  },

  // Get dashboard data
  getDashboardData: async (params = {}) => {
    const response = await apiClient.get('/api/finance/dashboard', params);
    return response.data;
  },

  // Get revenue data
  getRevenueData: async (period = 'month') => {
    const response = await apiClient.get(`/api/finance/revenue?period=${period}`);
    return response.data;
  },

  // Get expense data
  getExpenseData: async (period = 'month') => {
    const response = await apiClient.get(`/api/finance/expenses?period=${period}`);
    return response.data;
  },

  // Get cash flow data
  getCashFlowData: async (period = 'month') => {
    const response = await apiClient.get(`/api/finance/cash-flow?period=${period}`);
    return response.data;
  },

  // Get recent transactions
  getRecentTransactions: async (limit = 10) => {
    const response = await apiClient.get(`/api/finance/transactions?limit=${limit}`);
    return response.data;
  },

  // Get accounts overview
  getAccountsOverview: async () => {
    const response = await apiClient.get('/api/finance/accounts');
    return response.data;
  },

  getPayrollHistory: async (userId, page = 1, limit = 10) => {
    const params = { page, limit };
    const response = await apiClient.get(`/api/finance/payroll/history/${userId}`, params);
    return response.data;
  },

  // Financial Reports
  getFinancialReports: async (reportType, period = 'MONTHLY', filters = {}) => {
    const params = { period, ...filters };
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
    const response = await apiClient.get(`/api/finance/export/${reportType}`, params);
    return response;
  },

  // System Health
  getSystemHealth: async () => {
    const response = await apiClient.get('/api/finance/health');
    return response.data;
  }
};
