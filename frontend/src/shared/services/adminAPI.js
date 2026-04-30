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

  
  toggleUserStatus: async (userId, isActive, currentUserId) => {
    if (userId === currentUserId) {
      throw new Error('You cannot suspend yourself');
    }
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

  getSystemActivity: async (limit = 10) => {
    const response = await apiClient.get(`/admin/activity?limit=${limit}`);
    return response;
  },

  getUserActivity: async (limit = 10) => {
    const response = await apiClient.get(`/admin/activity?limit=${limit}`);
    return response;
  },

  getSystemConfig: async () => {
    const response = await apiClient.get('/admin/system/config');
    return response;
  },

  updateSystemConfig: async (configData) => {
    const response = await apiClient.put('/admin/system/config', configData);
    return response;
  },

  toggleMaintenanceMode: async (enabled) => {
    const response = await apiClient.post('/admin/system/maintenance', { enabled });
    return response;
  },

  changePassword: async (passwordData) => {
    const response = await apiClient.post('/auth/change-password', passwordData);
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
  },

  deleteAdmin: async (userId, currentUserId) => {
    if (userId === currentUserId) {
      throw new Error('You cannot delete yourself');
    }
    const response = await apiClient.delete(`/admin/admins/${userId}`);
    return response;
  }
};
