import apiClient from '../services/api';


export const financeAPI = {
  
  getDashboardData: async (params = {}) => {
    const response = await apiClient.get('/finance/analytics', params);
    return response.data;
  },

  
  getFinancialOverview: async (period = 'MONTHLY') => {
    const response = await apiClient.get('/finance/overview', { period });
    return response.data;
  },

  
  uploadPayroll: async (file) => {
    const formData = new FormData();
    formData.append('payroll', file);
    const response = await apiClient.post('/finance/payroll/upload', formData);
    return response;
  },

  validatePayroll: async (batchId) => {
    const response = await apiClient.put(`/finance/payroll/batches/${batchId}/validate`);
    return response.data;
  },

  approvePayroll: async (batchId) => {
    const response = await apiClient.put(`/finance/payroll/batches/${batchId}/approve`);
    return response.data;
  },

  processPayroll: async (batchId) => {
    const response = await apiClient.put(`/finance/payroll/batches/${batchId}/process`);
    return response.data;
  },

  reversePayroll: async (batchId) => {
    const response = await apiClient.put(`/finance/payroll/batches/${batchId}/reverse`);
    return response.data;
  },

  getPayrollBatches: async (params = {}) => {
    const response = await apiClient.get('/finance/payroll/batches', params);
    return response.data;
  },

  getPayrollBatchDetails: async (batchId, page = 1, limit = 10) => {
    const response = await apiClient.get(`/finance/payroll/batches/${batchId}/details`, { page, limit });
    return response.data;
  },

  
  getPayrollReport: async (filters = {}) => {
    const response = await apiClient.get('/finance/reports/payroll', filters);
    return response.data;
  },

  downloadPayrollReport: async (format = 'csv', filters = {}) => {
    const response = await apiClient.get('/finance/reports/payroll/download', { 
      format, 
      ...filters 
    }, {
      responseType: 'blob'
    });
    return response;
  },

  getPayrollStats: async () => {
    const response = await apiClient.get('/finance/payroll/stats');
    return response.data;
  },

  
  getSavingsStats: async () => {
    const response = await apiClient.get('/savings/statistics');
    return response.data;
  },

  
  getRecentTransactions: async (limit = 10) => {
    const response = await apiClient.get('/finance/transactions', { limit });
    return response.data;
  },

  getEmployees: async (params = {}) => {
    const response = await apiClient.get('/finance/employees', params);
    return response.data;
  },

  getTransactionsList: async (params = {}) => {
    const response = await apiClient.get('/finance/transactions-list', params);
    return response.data;
  },

  getAnalytics: async (params = {}) => {
    const response = await apiClient.get('/finance/analytics', params);
    return response.data;
  },

  getBudgets: async () => {
    const response = await apiClient.get('/finance/budgets/overview');
    return response.data;
  },

  getDepartments: async () => {
    const response = await apiClient.get('/hr/departments'); 
    return response.data;
  },

  getPayrollHistory: async (userId, params = {}) => {
    const response = await apiClient.get(`/finance/payroll/history/${userId}`, params);
    return response.data;
  },

  
  getFinancialReports: async (reportType, params = {}) => {
    const response = await apiClient.get(`/finance/reports/${reportType}`, params);
    return response.data;
  },

  getCashFlowReport: async (period = 'MONTHLY') => {
    const response = await apiClient.get('/finance/reports/cash-flow', { period });
    return response.data;
  },

  getProfitLossReport: async (period = 'MONTHLY') => {
    const response = await apiClient.get('/finance/reports/profit-loss', { period });
    return response.data;
  },

  getLoanPortfolio: async (filters = {}) => {
    const response = await apiClient.get('/finance/reports/loan-portfolio', filters);
    return response.data;
  },

  getSavingsSummary: async (period = 'MONTHLY') => {
    const response = await apiClient.get('/finance/reports/savings-summary', { period });
    return response.data;
  },

  
  exportFinancialReport: async (reportType, period = 'MONTHLY', format = 'json') => {
    const params = { period, format };
    const response = await apiClient.get(`/finance/export/${reportType}`, params, {
      responseType: format === 'json' ? 'json' : 'blob'
    });
    return response;
  },

  
  getSystemHealth: async () => {
    const response = await apiClient.get('/finance/health');
    return response.data;
  }
};
