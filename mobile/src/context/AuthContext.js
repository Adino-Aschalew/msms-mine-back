import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../api/axios';
import { API_BASE_URL } from '../api/axios';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for saved token when app starts
    const loadUser = async () => {
      try {
        const token = await SecureStore.getItemAsync('token');
        const savedUser = await SecureStore.getItemAsync('user');
        if (token && savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error('Failed to load user from SecureStore', error);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = async (identifier, password) => {
    try {
      const response = await api.post('/auth/login', { 
        identifier, 
        password,
        role: 'EMPLOYEE'
      });
      
      if (response.data && response.data.success) {
        const { token, user: userData } = response.data.data;
        
        // Normalize user data if nested
        const normalizedUser = userData.user ? { ...userData.user, ...userData.employeeProfile } : userData;
        
        await SecureStore.setItemAsync('token', token);
        await SecureStore.setItemAsync('user', JSON.stringify(normalizedUser));
        
        setUser(normalizedUser);
        return { success: true, data: normalizedUser };
      }
      return { success: false, message: 'Invalid credentials' };
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      const isNetwork = !error.response || error.message === 'Network Error';
      return { 
        success: false, 
        message: error.response?.data?.message || (isNetwork
          ? `Cannot reach server. Ensure the API is running at ${API_BASE_URL}`
          : 'Login failed.'),
      };
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('token');
      await SecureStore.deleteItemAsync('user');
      setUser(null);
    } catch (error) {
      console.error('Failed to logout', error);
    }
  };

  const requestOTP = async () => {
    try {
      const response = await api.post('/auth/request-otp');
      return { success: true, message: response.data.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to send code' 
      };
    }
  };

  const verifyOTP = async (otpCode) => {
    try {
      const response = await api.post('/auth/verify-otp', { otpCode });
      if (response.data && response.data.success) {
        const updatedUser = { ...user, email_verified: true };
        await SecureStore.setItemAsync('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        return { success: true };
      }
      return { success: false, message: 'Invalid code' };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Verification failed' 
      };
    }
  };

  const refreshProfile = async () => {
    try {
      const response = await api.get('/users/profile');
      if (response.data?.success && response.data.data) {
        const profileData = response.data.data;
        
        // Flatten nested structure: { user: {...}, employeeProfile: {...} }
        const normalizedUser = profileData.user ? { 
          ...profileData.user, 
          ...profileData.employeeProfile 
        } : profileData;
        
        // Preserve locally-set auth flags if the backend doesn't return them
        if (user) {
          if (normalizedUser.email_verified === undefined && user.email_verified !== undefined) {
            normalizedUser.email_verified = user.email_verified;
          }
          if (normalizedUser.password_change_required === undefined && user.password_change_required !== undefined) {
            normalizedUser.password_change_required = user.password_change_required;
          }
        }
        
        await SecureStore.setItemAsync('user', JSON.stringify(normalizedUser));
        setUser(normalizedUser);
        return normalizedUser;
      }
    } catch (error) {
      console.warn('Profile refresh failed:', error.message);
    }
    return null;
  };

  return (
    <AuthContext.Provider value={{ 
      user, loading, login, logout, setUser,
      requestOTP, verifyOTP, refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
