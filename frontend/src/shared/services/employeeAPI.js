import apiClient from '../services/api';

// Employee API
export const employeeAPI = {
  // Get employee profile
  getProfile: async () => {
    const response = await apiClient.get('/api/users/profile');
    return response.data;
  },

  // Get all employees (Admin only)
  getAllEmployees: async (page = 1, limit = 10, filters = {}) => {
    const params = { page, limit, ...filters };
    const response = await apiClient.get('/api/hr/employees', params);
    return response.data;
  },

  // Get unverified employees (Admin only)
  getUnverifiedEmployees: async () => {
    const response = await apiClient.get('/api/hr/employees?status=unverified');
    return response.data;
  },

  // Verify employee (HR only)
  verifyEmployee: async (employeeId, verificationData) => {
    const response = await apiClient.put(`/api/hr/employees/${employeeId}/verify`, verificationData);
    return response.data;
  },

  // Update employee profile
  updateProfile: async (profileData) => {
    const response = await apiClient.put('/api/users/profile', profileData);
    return response.data;
  },

  // Get employee payroll history (placeholder - not implemented yet)
  getPayrollHistory: async (page = 1, limit = 10) => {
    // This endpoint doesn't exist yet, return empty data
    return { transactions: [], pagination: { page, limit, total: 0, pages: 0 } };
  }
};
