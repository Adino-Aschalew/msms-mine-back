import apiClient from '../services/api';


export const authAPI = {
  
  login: async (identifier, password, role) => {
    const response = await apiClient.post('/auth/login', {
      identifier,
      password,
      role
    });
    return response.data;
  },

  
  refreshToken: async (refreshToken) => {
    const response = await apiClient.post('/auth/refresh-token', {
      refreshToken
    });
    return response.data;
  },

  
  getProfile: async () => {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  },

  
  updateProfile: async (profileData) => {
    const response = await apiClient.put('/auth/profile', profileData);
    return response.data;
  },

  
  changePassword: async (passwordData) => {
    const response = await apiClient.post('/auth/change-password', passwordData);
    return response.data;
  },

  
  forceChangePassword: async (newPassword) => {
    const response = await apiClient.post('/auth/force-change-password', {
      newPassword
    });
    return response.data;
  },

  
  forgotPassword: async (email) => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  
  resetPassword: async (token, newPassword) => {
    const response = await apiClient.post('/auth/reset-password', {
      token,
      newPassword
    });
    return response.data;
  }
};
