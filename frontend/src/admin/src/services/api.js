import axios from 'axios';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:9999/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API service methods
export const apiService = {
  // Transactions
  getTransactions: (params) => api.get('/transactions', { params }),
  createTransaction: (data) => api.post('/transactions', data),
  updateTransaction: (id, data) => api.put(`/transactions/${id}`, data),
  deleteTransaction: (id) => api.delete(`/transactions/${id}`),

  // Payroll
  uploadPayroll: (formData) => api.post('/payroll/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getPayrollHistory: (params) => api.get('/payroll/history', { params }),
  getPayrollReports: (params) => api.get('/payroll/reports', { params }),

  // Employees
  getEmployees: (params) => api.get('/employees', { params }),
  createEmployee: (data) => api.post('/employees', data),
  updateEmployee: (id, data) => api.put(`/employees/${id}`, data),
  getEmployeeProfile: (id) => api.get(`/employees/${id}/profile`),

  // Budgets
  getBudgets: (params) => api.get('/budgets', { params }),
  createBudget: (data) => api.post('/budgets', data),
  updateBudget: (id, data) => api.put(`/budgets/${id}`, data),

  // Invoices
  getInvoices: (params) => api.get('/invoices', { params }),
  createInvoice: (data) => api.post('/invoices', data),
  sendInvoice: (id) => api.post(`/invoices/${id}/send`),
  updateInvoiceStatus: (id, status) => api.patch(`/invoices/${id}/status`, { status }),

  // Analytics
  getAnalytics: (params) => api.get('/analytics', { params }),
  getRevenueData: (params) => api.get('/analytics/revenue', { params }),
  getExpenseData: (params) => api.get('/analytics/expenses', { params }),

  // Reports
  getReports: (params) => api.get('/reports', { params }),
  generateReport: (type, params) => api.post(`/reports/generate/${type}`, params),
  downloadReport: (id) => api.get(`/reports/${id}/download`, { responseType: 'blob' }),

  // Notifications
  getNotifications: (params) => api.get('/notifications', { params }),
  markNotificationRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllNotificationsRead: () => api.patch('/notifications/read-all'),

  // User Management
  getUsers: (params) => api.get('/users', { params }),
  createUser: (data) => api.post('/users', data),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),

  // Account
  updateProfile: (data) => api.put('/account/profile', data),
  changePassword: (data) => api.put('/account/password', data),
  updatePreferences: (data) => api.put('/account/preferences', data),
  getActiveSessions: () => api.get('/account/sessions'),
  revokeSession: (id) => api.delete(`/account/sessions/${id}`),
};

export default api;
