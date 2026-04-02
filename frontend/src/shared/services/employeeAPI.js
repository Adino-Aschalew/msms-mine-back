import apiClient from '../services/api';


export const employeeAPI = {
  
  getProfile: async () => {
    const response = await apiClient.get('/users/profile');
    return response.data;
  },

  
  getAllEmployees: async (page = 1, limit = 10, filters = {}) => {
    const params = { page, limit, ...filters };
    const response = await apiClient.get('/hr/employees', params);
    return response.data;
  },

  
  getUnverifiedEmployees: async () => {
    const response = await apiClient.get('/hr/employees?status=unverified');
    return response.data;
  },

  
  verifyEmployee: async (employeeId, verificationData) => {
    const response = await apiClient.put(`/hr/employees/${employeeId}/verify`, verificationData);
    return response.data;
  },

  
  validateEmployee: async (employeeId) => {
    const response = await apiClient.get(`/hr/validate/${employeeId}`);
    return response.data;
  },

  
  updateProfile: async (profileData) => {
    const response = await apiClient.put('/users/profile', profileData);
    return response.data;
  },

  
  getPayrollHistory: async (page = 1, limit = 10) => {
    
    return { transactions: [], pagination: { page, limit, total: 0, pages: 0 } };
  }
};
