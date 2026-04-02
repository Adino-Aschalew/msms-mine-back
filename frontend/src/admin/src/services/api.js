import axios from 'axios';


const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:9999/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});


api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);


export const apiService = {
  
  getTransactions: (params) => api.get('/transactions', { params }),
  createTransaction: (data) => api.post('/transactions', data),
  updateTransaction: (id, data) => api.put(`/transactions/${id}`, data),
  deleteTransaction: (id) => api.delete(`/transactions/${id}`),

  
  uploadPayroll: (formData) => api.post('/payroll/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getPayrollHistory: (params) => api.get('/payroll/history', { params }),
  getPayrollReports: (params) => api.get('/payroll/reports', { params }),

  
  getEmployees: (params) => api.get('/employees', { params }),
  createEmployee: (data) => api.post('/employees', data),
  updateEmployee: (id, data) => api.put(`/employees/${id}`, data),
  getEmployeeProfile: (id) => api.get(`/employees/${id}/profile`),

  
  getBudgets: (params) => api.get('/budgets', { params }),
  createBudget: (data) => api.post('/budgets', data),
  updateBudget: (id, data) => api.put(`/budgets/${id}`, data),

  
  getInvoices: (params) => api.get('/invoices', { params }),
  createInvoice: (data) => api.post('/invoices', data),
  sendInvoice: (id) => api.post(`/invoices/${id}/send`),
  updateInvoiceStatus: (id, status) => api.patch(`/invoices/${id}/status`, { status }),

  
  getAnalytics: (params) => api.get('/analytics', { params }),
  getRevenueData: (params) => api.get('/analytics/revenue', { params }),
  getExpenseData: (params) => api.get('/analytics/expenses', { params }),

  
  getReports: (params) => api.get('/reports', { params }),
  generateReport: (type, params) => api.post(`/reports/generate/${type}`, params),
  downloadReport: (id) => api.get(`/reports/${id}/download`, { responseType: 'blob' }),

  
  getNotifications: (params) => api.get('/notifications', { params }),
  markNotificationRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllNotificationsRead: () => api.patch('/notifications/read-all'),

  
  getUsers: (params) => api.get('/users', { params }),
  createUser: (data) => api.post('/users', data),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),

  
  updateProfile: (data) => api.put('/account/profile', data),
  changePassword: (data) => api.put('/account/password', data),
  updatePreferences: (data) => api.put('/account/preferences', data),
  getActiveSessions: () => api.get('/account/sessions'),
  revokeSession: (id) => api.delete(`/account/sessions/${id}`),
};

export default api;
