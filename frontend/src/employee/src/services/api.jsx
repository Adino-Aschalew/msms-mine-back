import axios from 'axios';
import apiClient from '../../../shared/services/api';

const API_BASE_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:9999/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    
    const token = localStorage.getItem('authToken');
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
      
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('authUser');
      
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
  
  refreshToken: async () => {
    const response = await api.post('/auth/refresh');
    return response.data;
  },
  
  updateProfile: async (userData) => {
    const response = await api.put('/auth/profile', userData);
    return response.data;
  },
};

export const loansAPI = {
  getLoans: async (params = {}) => {
    const response = await apiClient.get('/loans', { params });
    return response.data;
  },

  getMyLoans: async (params = {}) => {
    const response = await apiClient.get('/loans/my-loans', { params });
    return response.data;
  },

  getMyApplications: async (params = {}) => {
    const response = await apiClient.get('/loans/my-applications', { params });
    return response.data;
  },

  getMyTransactions: async (params = {}) => {
    // This endpoint doesn't exist, so return empty data
    return { data: [] };
  },

  getDashboardData: async () => {
    const response = await api.get('/loans/dashboard');
    return response.data;
  },
  
  getLoanById: async (id) => {
    const response = await api.get(`/loans/${id}`);
    return response.data;
  },
  
  createLoan: async (loanData) => {
    const response = await api.post('/loans', loanData);
    return response.data;
  },
  
  updateLoan: async (id, loanData) => {
    const response = await api.put(`/loans/${id}`, loanData);
    return response.data;
  },
  
  deleteLoan: async (id) => {
    const response = await api.delete(`/loans/${id}`);
    return response.data;
  },
  
  getLoanEligibility: async (loanData) => {
    const response = await api.post('/loans/eligibility', loanData);
    return response.data;
  },
};

export const savingsAPI = {
  getSavings: async () => {
    const response = await api.get('/savings');
    return response.data;
  },
  
  updateSavingRate: async (rate) => {
    const response = await api.put('/savings/rate', { rate });
    return response.data;
  },
  
  getPayrollHistory: async (params = {}) => {
    const response = await api.get('/savings/payroll-history', { params });
    return response.data;
  },
  
  createWithdrawalRequest: async (withdrawalData) => {
    const response = await api.post('/savings/withdrawal', withdrawalData);
    return response.data;
  },
  
  getWithdrawalRequests: async (params = {}) => {
    const response = await api.get('/savings/withdrawal', { params });
    return response.data;
  },
};

export const guarantorsAPI = {
  getGuarantors: async (params = {}) => {
    const response = await api.get('/guarantors', { params });
    return response.data;
  },
  
  createGuarantor: async (guarantorData) => {
    const response = await api.post('/guarantors', guarantorData);
    return response.data;
  },
  
  updateGuarantor: async (id, guarantorData) => {
    const response = await api.put(`/guarantors/${id}`, guarantorData);
    return response.data;
  },
  
  deleteGuarantor: async (id) => {
    const response = await api.delete(`/guarantors/${id}`);
    return response.data;
  },
  
  searchInternalEmployee: async (employeeId) => {
    const response = await api.get(`/guarantors/search-employee/${employeeId}`);
    return response.data;
  },
};

export const repaymentsAPI = {
  getRepaymentSummary: async () => {
    const response = await api.get('/repayments/summary');
    return response.data;
  },
  
  getRepaymentHistory: async (params = {}) => {
    const response = await api.get('/repayments/history', { params });
    return response.data;
  },
  
  getRepaymentSchedule: async (params = {}) => {
    const response = await api.get('/repayments/schedule', { params });
    return response.data;
  },
  
  getLoanRepayments: async (loanId) => {
    const response = await api.get(`/repayments/loan/${loanId}`);
    return response.data;
  },
};

export const payrollAPI = {
  getPayrollHistory: async (params = {}) => {
    const response = await api.get('/payroll/history', { params });
    return response.data;
  },
  
  getCurrentPayroll: async () => {
    const response = await api.get('/payroll/current');
    return response.data;
  },
  
  getPayrollStats: async (params = {}) => {
    const response = await api.get('/payroll/stats', { params });
    return response.data;
  },
};

export const notificationsAPI = {
  getNotifications: async (params = {}) => {
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },
  
  markAsRead: async (id) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },
  
  markAllAsRead: async () => {
    const response = await api.put('/notifications/mark-all-read');
    return response.data;
  },
  
  deleteNotification: async (id) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },
};

export const dashboardAPI = {
  getDashboardData: async () => {
    const response = await api.get('/dashboard');
    return response.data;
  },
  
  getStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },
  
  getChartData: async (type, params = {}) => {
    const response = await api.get(`/dashboard/charts/${type}`, { params });
    return response.data;
  },
  
  getRecentActivity: async (params = {}) => {
    const response = await api.get('/dashboard/activity', { params });
    return response.data;
  },
};

export const uploadAPI = {
  uploadFile: async (file, type) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  deleteFile: async (fileId) => {
    const response = await api.delete(`/upload/${fileId}`);
    return response.data;
  },
};

export default api;
