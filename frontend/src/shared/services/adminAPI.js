import apiClient from '../services/api';

// Admin API
export const adminAPI = {
  // Get system overview
  getSystemOverview: async () => {
    const response = await apiClient.get('/api/admin/overview');
    return response.data;
  },

  // User Management
  getAllUsers: async (page = 1, limit = 10, filters = {}) => {
    const params = { page, limit, ...filters };
    const response = await apiClient.get('/api/admin/users', params);
    return response.data;
  },

  // Create user
  createUser: async (userData) => {
    const response = await apiClient.post('/api/admin/users', userData);
    return response.data;
  },

  // Update user
  updateUser: async (userId, userData) => {
    const response = await apiClient.put(`/api/admin/users/${userId}`, userData);
    return response.data;
  },

  // Delete user
  deleteUser: async (userId) => {
    const response = await apiClient.delete(`/api/admin/users/${userId}`);
    return response.data;
  },

  // Get user details
  getUser: async (userId) => {
    const response = await apiClient.get(`/api/admin/users/${userId}`);
    return response.data;
  },

  // Toggle user status
  toggleUserStatus: async (userId, isActive) => {
    const response = await apiClient.put(`/api/admin/users/${userId}/status`, {
      is_active: isActive
    });
    return response.data;
  },

  // System Configuration
  getSystemConfig: async () => {
    const response = await apiClient.get('/api/admin/config');
    return response.data;
  },

  // Update system config
  updateSystemConfig: async (configData) => {
    const response = await apiClient.put('/api/admin/config', configData);
    return response.data;
  },

  // Audit Logs
  getAuditLogs: async (page = 1, limit = 10, filters = {}) => {
    const params = { page, limit, ...filters };
    const response = await apiClient.get('/api/admin/audit-logs', params);
    return response.data;
  },

  // System Health
  getSystemHealth: async () => {
    const response = await apiClient.get('/api/admin/health');
    return response.data;
  },

  // Reports
  getSystemReports: async (reportType, period = 'MONTHLY') => {
    const params = { period };
    const response = await apiClient.get(`/api/admin/reports/${reportType}`, params);
    return response.data;
  },

  // Export reports
  exportReport: async (reportType, period = 'MONTHLY', format = 'json') => {
    const params = { period, format };
    const response = await apiClient.get(`/api/admin/export/${reportType}`, params);
    return response;
  },

  // Statistics
  getSystemStats: async () => {
    const response = await apiClient.get('/api/admin/stats');
    return response.data;
  },

  // Database Management
  getDatabaseInfo: async () => {
    const response = await apiClient.get('/api/admin/database');
    return response.data;
  },

  // Backup database
  backupDatabase: async () => {
    const response = await apiClient.post('/api/admin/backup');
    return response.data;
  },

  // Admin Management - Get All Admins
  getAllAdmins: async () => {
    const response = await apiClient.get('/api/admin/admins');
    return response.data;
  },

  getAdminStatistics: async () => {
    const response = await apiClient.get('/api/admin/statistics');
    return response.data;
  },

  getSystemActivity: async (params = {}) => {
    const response = await apiClient.get('/api/admin/activity', { params });
    return response.data;
  },

  // Generic Admin Actions
  updateAdminStatus: async (adminId, isActive) => {
    const response = await apiClient.put(`/api/admin/admins/${adminId}/status`, { is_active: isActive });
    return response.data;
  },

  updateAdmin: async (adminId, adminData) => {
    const response = await apiClient.put(`/api/admin/admins/${adminId}`, adminData);
    return response.data;
  },

  deleteAdmin: async (adminId) => {
    const response = await apiClient.delete(`/api/admin/admins/${adminId}`);
    return response.data;
  },

  // HR Admin Management
  getHRAdmins: async () => {
    const response = await apiClient.get('/api/admin/hr-admins');
    return response.data;
  },

  createHRAdmin: async (adminData) => {
    const response = await apiClient.post('/api/admin/hr-admins', adminData);
    return response.data;
  },

  updateHRAdmin: async (adminId, updateData) => {
    const response = await apiClient.put(`/api/admin/hr-admins/${adminId}`, updateData);
    return response.data;
  },

  activateHRAdmin: async (adminId) => {
    const response = await apiClient.put(`/api/admin/hr-admins/${adminId}/activate`);
    return response.data;
  },

  deactivateHRAdmin: async (adminId) => {
    const response = await apiClient.put(`/api/admin/hr-admins/${adminId}/deactivate`);
    return response.data;
  },

  deleteHRAdmin: async (adminId) => {
    const response = await apiClient.delete(`/api/admin/hr-admins/${adminId}`);
    return response.data;
  },

  // Finance Admin Management
  getFinanceAdmins: async () => {
    const response = await apiClient.get('/api/admin/finance-admins');
    return response.data;
  },

  createFinanceAdmin: async (adminData) => {
    const response = await apiClient.post('/api/admin/finance-admins', adminData);
    return response.data;
  },

  updateFinanceAdmin: async (adminId, updateData) => {
    const response = await apiClient.put(`/api/admin/finance-admins/${adminId}`, updateData);
    return response.data;
  },

  activateFinanceAdmin: async (adminId) => {
    const response = await apiClient.put(`/api/admin/finance-admins/${adminId}/activate`);
    return response.data;
  },

  deactivateFinanceAdmin: async (adminId) => {
    const response = await apiClient.put(`/api/admin/finance-admins/${adminId}/deactivate`);
    return response.data;
  },

  deleteFinanceAdmin: async (adminId) => {
    const response = await apiClient.delete(`/api/admin/finance-admins/${adminId}`);
    return response.data;
  },

  // Regular Admin Management
  getRegularAdmins: async () => {
    const response = await apiClient.get('/api/admin/regular-admins');
    return response.data;
  },

  createRegularAdmin: async (adminData) => {
    const response = await apiClient.post('/api/admin/regular-admins', adminData);
    return response.data;
  },

  updateRegularAdmin: async (adminId, updateData) => {
    const response = await apiClient.put(`/api/admin/regular-admins/${adminId}`, updateData);
    return response.data;
  },

  activateRegularAdmin: async (adminId) => {
    const response = await apiClient.put(`/api/admin/regular-admins/${adminId}/activate`);
    return response.data;
  },

  deactivateRegularAdmin: async (adminId) => {
    const response = await apiClient.put(`/api/admin/regular-admins/${adminId}/deactivate`);
    return response.data;
  },

  deleteRegularAdmin: async (adminId) => {
    const response = await apiClient.delete(`/api/admin/regular-admins/${adminId}`);
    return response.data;
  },

  // Loan Committee Admin Management
  getLoanCommitteeAdmins: async () => {
    const response = await apiClient.get('/api/admin/loan-committee-admins');
    return response.data;
  },

  createLoanCommitteeAdmin: async (adminData) => {
    const response = await apiClient.post('/api/admin/loan-committee-admins', adminData);
    return response.data;
  },

  updateLoanCommitteeAdmin: async (adminId, updateData) => {
    const response = await apiClient.put(`/api/admin/loan-committee-admins/${adminId}`, updateData);
    return response.data;
  },

  activateLoanCommitteeAdmin: async (adminId) => {
    const response = await apiClient.put(`/api/admin/loan-committee-admins/${adminId}/activate`);
    return response.data;
  },

  deactivateLoanCommitteeAdmin: async (adminId) => {
    const response = await apiClient.put(`/api/admin/loan-committee-admins/${adminId}/deactivate`);
    return response.data;
  },

  deleteLoanCommitteeAdmin: async (adminId) => {
    const response = await apiClient.delete(`/api/admin/loan-committee-admins/${adminId}`);
    return response.data;
  },

  // Dashboard and System Stats
  getDashboard: async () => {
    const response = await apiClient.get('/api/admin/dashboard');
    return response.data;
  },

  getSystemActivity: async (params = {}) => {
    const response = await apiClient.get('/api/admin/activity', { params });
    return response.data;
  },

  getSystemHealth: async () => {
    const response = await apiClient.get('/api/admin/system/health');
    return response.data;
  },

  getSystemLogs: async (params = {}) => {
    const response = await apiClient.get('/api/admin/system/logs', { params });
    return response.data;
  },

  toggleMaintenanceMode: async (enabled) => {
    const response = await apiClient.post('/api/admin/system/maintenance', { enabled });
    return response.data;
  }
};
