import apiClient from '../services/api';

// Admin API
export const adminAPI = {
  // Get system overview
  getSystemOverview: async () => {
    const response = await apiClient.get('/api/admin/overview');
    return response;
  },

  // User Management
  getAllUsers: async (page = 1, limit = 10, filters = {}) => {
    const params = { page, limit, ...filters };
    const response = await apiClient.get('/api/admin/users', params);
    return response;
  },

  // Create user
  createUser: async (userData) => {
    const response = await apiClient.post('/api/admin/users', userData);
    return response;
  },

  // Update user
  updateUser: async (userId, userData) => {
    const response = await apiClient.put(`/api/admin/users/${userId}`, userData);
    return response;
  },

  // Delete user
  deleteUser: async (userId) => {
    const response = await apiClient.delete(`/api/admin/users/${userId}`);
    return response;
  },

  // Get user details
  getUser: async (userId) => {
    const response = await apiClient.get(`/api/admin/users/${userId}`);
    return response;
  },

  // Toggle user status
  toggleUserStatus: async (userId, isActive) => {
    const response = await apiClient.put(`/api/admin/users/${userId}/status`, {
      is_active: isActive
    });
    return response;
  },

  // System Configuration
  getSystemConfig: async () => {
    const response = await apiClient.get('/api/admin/config');
    return response;
  },

  // Update system config
  updateSystemConfig: async (configData) => {
    const response = await apiClient.put('/api/admin/config', configData);
    return response;
  },

  // Audit Logs
  getAuditLogs: async (page = 1, limit = 10, filters = {}) => {
    const params = { page, limit, ...filters };
    const response = await apiClient.get('/api/admin/audit-logs', params);
    return response;
  },

  // System Health
  getSystemHealth: async () => {
    const response = await apiClient.get('/api/admin/health');
    return response;
  },

  // Reports
  getSystemReports: async (reportType, period = 'MONTHLY') => {
    const params = { period };
    const response = await apiClient.get(`/api/admin/reports/${reportType}`, params);
    return response;
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
    return response;
  },

  // Database Management
  getDatabaseInfo: async () => {
    const response = await apiClient.get('/api/admin/database');
    return response;
  },

  // Backup database
  backupDatabase: async () => {
    const response = await apiClient.post('/api/admin/backup');
    return response;
  },

  // Admin Management - Get All Admins
  getAllAdmins: async () => {
    const response = await apiClient.get('/api/admin/admins');
    return response;
  },

  getAdminStatistics: async () => {
    const response = await apiClient.get('/api/admin/statistics');
    return response;
  },

  getSystemActivity: async (params = {}) => {
    const response = await apiClient.get('/api/admin/activity', params);
    return response;
  },

  // Generic Admin Actions
  updateAdminStatus: async (adminId, isActive) => {
    const response = await apiClient.put(`/api/admin/admins/${adminId}/status`, { is_active: isActive });
    return response;
  },

  updateAdmin: async (adminId, adminData) => {
    const response = await apiClient.put(`/api/admin/admins/${adminId}`, adminData);
    return response;
  },

  deleteAdmin: async (adminId) => {
    const response = await apiClient.delete(`/api/admin/admins/${adminId}`);
    return response;
  },

  // HR Admin Management
  getHRAdmins: async () => {
    const response = await apiClient.get('/api/admin/hr-admins');
    return response;
  },

  createHRAdmin: async (adminData) => {
    const response = await apiClient.post('/api/admin/hr-admins', adminData);
    return response;
  },

  updateHRAdmin: async (adminId, updateData) => {
    const response = await apiClient.put(`/api/admin/hr-admins/${adminId}`, updateData);
    return response;
  },

  activateHRAdmin: async (adminId) => {
    const response = await apiClient.put(`/api/admin/hr-admins/${adminId}/activate`);
    return response;
  },

  deactivateHRAdmin: async (adminId) => {
    const response = await apiClient.put(`/api/admin/hr-admins/${adminId}/deactivate`);
    return response;
  },

  deleteHRAdmin: async (adminId) => {
    const response = await apiClient.delete(`/api/admin/hr-admins/${adminId}`);
    return response;
  },

  // Finance Admin Management
  getFinanceAdmins: async () => {
    const response = await apiClient.get('/api/admin/finance-admins');
    return response;
  },

  createFinanceAdmin: async (adminData) => {
    const response = await apiClient.post('/api/admin/finance-admins', adminData);
    return response;
  },

  updateFinanceAdmin: async (adminId, updateData) => {
    const response = await apiClient.put(`/api/admin/finance-admins/${adminId}`, updateData);
    return response;
  },

  activateFinanceAdmin: async (adminId) => {
    const response = await apiClient.put(`/api/admin/finance-admins/${adminId}/activate`);
    return response;
  },

  deactivateFinanceAdmin: async (adminId) => {
    const response = await apiClient.put(`/api/admin/finance-admins/${adminId}/deactivate`);
    return response;
  },

  deleteFinanceAdmin: async (adminId) => {
    const response = await apiClient.delete(`/api/admin/finance-admins/${adminId}`);
    return response;
  },

  // Regular Admin Management
  getRegularAdmins: async () => {
    const response = await apiClient.get('/api/admin/regular-admins');
    return response;
  },

  createRegularAdmin: async (adminData) => {
    const response = await apiClient.post('/api/admin/regular-admins', adminData);
    return response;
  },

  updateRegularAdmin: async (adminId, updateData) => {
    const response = await apiClient.put(`/api/admin/regular-admins/${adminId}`, updateData);
    return response;
  },

  activateRegularAdmin: async (adminId) => {
    const response = await apiClient.put(`/api/admin/regular-admins/${adminId}/activate`);
    return response;
  },

  deactivateRegularAdmin: async (adminId) => {
    const response = await apiClient.put(`/api/admin/regular-admins/${adminId}/deactivate`);
    return response;
  },

  deleteRegularAdmin: async (adminId) => {
    const response = await apiClient.delete(`/api/admin/regular-admins/${adminId}`);
    return response;
  },

  // Loan Committee Admin Management
  getLoanCommitteeAdmins: async () => {
    const response = await apiClient.get('/api/admin/loan-committee-admins');
    return response;
  },

  createLoanCommitteeAdmin: async (adminData) => {
    const response = await apiClient.post('/api/admin/loan-committee-admins', adminData);
    return response;
  },

  updateLoanCommitteeAdmin: async (adminId, updateData) => {
    const response = await apiClient.put(`/api/admin/loan-committee-admins/${adminId}`, updateData);
    return response;
  },

  activateLoanCommitteeAdmin: async (adminId) => {
    const response = await apiClient.put(`/api/admin/loan-committee-admins/${adminId}/activate`);
    return response;
  },

  deactivateLoanCommitteeAdmin: async (adminId) => {
    const response = await apiClient.put(`/api/admin/loan-committee-admins/${adminId}/deactivate`);
    return response;
  },

  deleteLoanCommitteeAdmin: async (adminId) => {
    const response = await apiClient.delete(`/api/admin/loan-committee-admins/${adminId}`);
    return response;
  },

  // Dashboard and System Stats
  getDashboard: async () => {
    const response = await apiClient.get('/api/admin/dashboard');
    return response;
  },


  getSystemHealth: async () => {
    const response = await apiClient.get('/api/admin/system/health');
    return response;
  },

  getSystemLogs: async (params = {}) => {
    const response = await apiClient.get('/api/admin/system/logs', params);
    return response;
  },

  toggleMaintenanceMode: async (enabled) => {
    const response = await apiClient.post('/api/admin/system/maintenance', { enabled });
    return response;
  }
};
