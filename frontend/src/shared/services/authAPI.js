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

  uploadProfilePicture: async (file) => {
    const formData = new FormData();
    formData.append('profile_picture', file);
    const response = await apiClient.post('/auth/profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },


  changePassword: async (passwordData) => {
    const response = await apiClient.post('/auth/change-password', passwordData);
    return response;
  },


  forceChangePassword: async (newPassword) => {
    const response = await apiClient.post('/auth/force-change-password', {
      newPassword
    });
    return response;
  },


  forgotPassword: async (email) => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response;
  },


  resetPassword: async (token, newPassword) => {
    const response = await apiClient.post('/auth/reset-password', {
      token,
      newPassword
    });
    return response;
  },

  requestOTP: async () => {
    const response = await apiClient.post('/auth/request-otp');
    return response;
  },

  verifyOTP: async (otpCode) => {
    const response = await apiClient.post('/auth/verify-otp', { otpCode });
    return response;
  }
};
