import apiClient from '../services/api';

export const adminAPI = {
  
  getSystemOverview: async () => {
    const response = await apiClient.get('/admin/statistics');
    return response;
  },

  
  getAllUsers: async (page = 1, limit = 10, filters = {}) => {
    const params = { page, limit, ...filters };
    const response = await apiClient.get('/admin/admins', params);
    return response;
  },

  
  createUser: async (userData) => {
    const response = await apiClient.post('/admin/users', userData);
    return response;
  },

  
  updateUser: async (userId, userData) => {
    const response = await apiClient.put(`/admin/users/${userId}`, userData);
    return response;
  },

  
  deleteUser: async (userId) => {
    const response = await apiClient.delete(`/admin/users/${userId}`);
    return response;
  },

  
  getUser: async (userId) => {
    const response = await apiClient.get(`/admin/users/${userId}`);
    return response;
  },

  
  toggleUserStatus: async (userId, isActive) => {
    const response = await apiClient.put(`/admin/users/${userId}/status`, {
      is_active: isActive
    });
    return response;
  },

  
  getDashboard: async () => {
    const response = await apiClient.get('/admin/dashboard');
    return response;
  },

  getSystemStats: async () => {
    const response = await apiClient.get('/admin/stats');
    return response;
  },

  // Admin creation functions
  createHRAdmin: async (userData) => {
    const response = await apiClient.post('/admin/hr-admins', userData);
    return response;
  },

  createLoanCommitteeAdmin: async (userData) => {
    const response = await apiClient.post('/admin/loan-committee-admins', userData);
    return response;
  },

  createFinanceAdmin: async (userData) => {
    const response = await apiClient.post('/admin/finance-admins', userData);
    return response;
  },

  createRegularAdmin: async (userData) => {
    const response = await apiClient.post('/admin/regular-admins', userData);
    return response;
  }
};
