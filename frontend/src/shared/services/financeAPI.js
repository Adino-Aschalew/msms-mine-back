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

  exportPayrollBatch: async (batchId) => {
    const response = await apiClient.get(`/finance/payroll/batches/${batchId}/export`, {}, { responseType: 'blob' });
    return response;
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
    const payload = response?.data ?? response;
    if (payload?.employees) return payload;
    if (response?.success && response?.data?.employees) return response.data;
    return { employees: [], pagination: { page: 1, limit: 0, total: 0, pages: 0 } };
  },

  exportEmployees: async (params = {}) => {
    const response = await apiClient.get('/finance/employees/export', params, { responseType: 'blob' });
    return response;
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
    const response = await apiClient.get('/hr/employees/departments'); 
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
  },

  getUnreadNotificationsCount: async () => {
    const response = await apiClient.get('/notifications/unread-count');
    return response.data;
  },

  getNotifications: async (params = {}) => {
    const response = await apiClient.get('/notifications', params);
    return response.data;
  },

  markNotificationAsRead: async (id) => {
    const response = await apiClient.put(`/notifications/${id}/read`);
    return response.data;
  },

  markAllNotificationsAsRead: async () => {
    const response = await apiClient.put('/notifications/mark-all-read');
    return response.data;
  }
};
