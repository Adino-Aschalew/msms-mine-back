import apiClient from '../services/api';

export const adminAPI = {
  // System Overview & Stats
  getSystemOverview: async () => {
    return await apiClient.get('/admin/overview');
  },

  getDashboard: async () => {
    return await apiClient.get('/admin/dashboard');
  },

  getSystemStats: async () => {
    return await apiClient.get('/admin/stats');
  },

  getAdminStatistics: async () => {
    return await apiClient.get('/admin/statistics');
  },

  // Admin User Management (General)
  getAllUsers: async (page = 1, limit = 10, filters = {}) => {
    const params = { page, limit, ...filters };
    return await apiClient.get('/admin/admins', params);
  },

  updateAdmin: async (adminId, userData) => {
    return await apiClient.put(`/admin/admins/${adminId}`, userData);
  },

  deleteAdmin: async (adminId) => {
    return await apiClient.delete(`/admin/admins/${adminId}`);
  },

  updateAdminStatus: async (adminId, isActive) => {
    return await apiClient.put(`/admin/admins/${adminId}/status`, {
      is_active: isActive
    });
  },

  // HR Admins
  getHRAdmins: async () => {
    return await apiClient.get('/admin/hr-admins');
  },

  createHRAdmin: async (userData) => {
    return await apiClient.post('/admin/hr-admins', userData);
  },

  updateHRAdmin: async (adminId, userData) => {
    return await apiClient.put(`/admin/hr-admins/${adminId}`, userData);
  },

  deactivateHRAdmin: async (adminId) => {
    return await apiClient.put(`/admin/hr-admins/${adminId}/deactivate`);
  },

  activateHRAdmin: async (adminId) => {
    return await apiClient.put(`/admin/hr-admins/${adminId}/activate`);
  },

  deleteHRAdmin: async (adminId) => {
    return await apiClient.delete(`/admin/hr-admins/${adminId}`);
  },

  // Loan Committee Admins
  getLoanCommitteeAdmins: async () => {
    return await apiClient.get('/admin/loan-committee-admins');
  },

  createLoanCommitteeAdmin: async (userData) => {
    return await apiClient.post('/admin/loan-committee-admins', userData);
  },

  updateLoanCommitteeAdmin: async (adminId, userData) => {
    return await apiClient.put(`/admin/loan-committee-admins/${adminId}`, userData);
  },

  deactivateLoanCommitteeAdmin: async (adminId) => {
    return await apiClient.put(`/admin/loan-committee-admins/${adminId}/deactivate`);
  },

  activateLoanCommitteeAdmin: async (adminId) => {
    return await apiClient.put(`/admin/loan-committee-admins/${adminId}/activate`);
  },

  deleteLoanCommitteeAdmin: async (adminId) => {
    return await apiClient.delete(`/admin/loan-committee-admins/${adminId}`);
  },

  // Finance Admins
  getFinanceAdmins: async () => {
    return await apiClient.get('/admin/finance-admins');
  },

  createFinanceAdmin: async (userData) => {
    return await apiClient.post('/admin/finance-admins', userData);
  },

  updateFinanceAdmin: async (adminId, userData) => {
    return await apiClient.put(`/admin/finance-admins/${adminId}`, userData);
  },

  deactivateFinanceAdmin: async (adminId) => {
    return await apiClient.put(`/admin/finance-admins/${adminId}/deactivate`);
  },

  activateFinanceAdmin: async (adminId) => {
    return await apiClient.put(`/admin/finance-admins/${adminId}/activate`);
  },

  deleteFinanceAdmin: async (adminId) => {
    return await apiClient.delete(`/admin/finance-admins/${adminId}`);
  },

  // Regular Admins
  getRegularAdmins: async () => {
    return await apiClient.get('/admin/regular-admins');
  },

  createRegularAdmin: async (userData) => {
    return await apiClient.post('/admin/regular-admins', userData);
  },

  updateRegularAdmin: async (adminId, userData) => {
    return await apiClient.put(`/admin/regular-admins/${adminId}`, userData);
  },

  deactivateRegularAdmin: async (adminId) => {
    return await apiClient.put(`/admin/regular-admins/${adminId}/deactivate`);
  },

  activateRegularAdmin: async (adminId) => {
    return await apiClient.put(`/admin/regular-admins/${adminId}/activate`);
  },

  deleteRegularAdmin: async (adminId) => {
    return await apiClient.delete(`/admin/regular-admins/${adminId}`);
  },

  // Legacy/Generic User methods (Mapping to admins for compatibility)
  createUser: async (userData) => {
    return await adminAPI.createRegularAdmin(userData);
  },

  updateUser: async (userId, userData) => {
    return await adminAPI.updateAdmin(userId, userData);
  },

  deleteUser: async (userId) => {
    return await adminAPI.deleteAdmin(userId);
  },

  getUser: async (userId) => {
    return await apiClient.get(`/admin/admins/${userId}`);
  },

  toggleUserStatus: async (userId, isActive) => {
    return await adminAPI.updateAdminStatus(userId, isActive);
  },

  // System Activity & Logs
  getSystemActivity: async (page = 1, limit = 50) => {
    return await apiClient.get('/admin/activity', { page, limit });
  },

  getSystemHealth: async () => {
    return await apiClient.get('/admin/health');
  },

  getSystemLogs: async (level = 'all', page = 1, limit = 100) => {
    return await apiClient.get('/admin/logs', { level, page, limit });
  }
};
