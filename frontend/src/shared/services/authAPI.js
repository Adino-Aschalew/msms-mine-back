import apiClient from '../services/api';

// Authentication API
export const authAPI = {
  // Login
  login: async (identifier, password, role) => {
    const response = await apiClient.post('/auth/login', {
      identifier,
      password,
      role
    });
    return response.data;
  },

  // Refresh token
  refreshToken: async (refreshToken) => {
    const response = await apiClient.post('/auth/refresh-token', {
      refreshToken
    });
    return response.data;
  },

  // Get user profile
  getProfile: async () => {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  },

  // Update profile
  updateProfile: async (profileData) => {
    const response = await apiClient.put('/api/auth/profile', profileData);
    return response.data;
  },

  // Change password
  changePassword: async (passwordData) => {
    const response = await apiClient.post('/api/auth/change-password', passwordData);
    return response.data;
  },

  // Force change password (for first-time login)
  forceChangePassword: async (newPassword) => {
    const response = await apiClient.post('/api/auth/force-change-password', {
      newPassword
    });
    return response.data;
  },

  // Forgot password
  forgotPassword: async (email) => {
    const response = await apiClient.post('/api/auth/forgot-password', { email });
    return response.data;
  },

  // Reset password
  resetPassword: async (token, newPassword) => {
    const response = await apiClient.post('/api/auth/reset-password', {
      token,
      newPassword
    });
    return response.data;
  }
};
