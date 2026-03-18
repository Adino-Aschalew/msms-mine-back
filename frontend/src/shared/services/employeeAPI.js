import apiClient from '../services/api';

// Employee API
export const employeeAPI = {
  // Get employee profile
  getProfile: async () => {
    const response = await apiClient.get('/api/employee/profile');
    return response.data;
  },

  // Get all employees (Admin only)
  getAllEmployees: async (page = 1, limit = 10, filters = {}) => {
    const params = { page, limit, ...filters };
    const response = await apiClient.get('/api/employee/all', params);
    return response.data;
  },

  // Get unverified employees (Admin only)
  getUnverifiedEmployees: async () => {
    const response = await apiClient.get('/api/employee/unverified');
    return response.data;
  },

  // Verify employee (HR only)
  verifyEmployee: async (employeeId, verificationData) => {
    const response = await apiClient.post('/api/employee/verify', {
      employee_id: employeeId,
      ...verificationData
    });
    return response.data;
  },

  // Update employee profile
  updateProfile: async (profileData) => {
    const response = await apiClient.put('/api/employee/profile', profileData);
    return response.data;
  },

  // Get employee payroll history
  getPayrollHistory: async (page = 1, limit = 10) => {
    const response = await apiClient.get('/api/employee/payroll-history', { page, limit });
    return response.data;
  }
};
