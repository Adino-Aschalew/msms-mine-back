import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/authAPI';

// Role definitions
export const ROLES = {
  ADMIN: 'admin',
  HR: 'hr',
  FINANCE: 'finance',
  LOAN_COMMITTEE: 'loan_committee',
  EMPLOYEE: 'employee'
};

// Role permissions for routing
export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: ['/admin/*'],
  [ROLES.HR]: ['/hr/*'],
  [ROLES.FINANCE]: ['/finance/*'],
  [ROLES.LOAN_COMMITTEE]: ['/loan-committee/*'],
  [ROLES.EMPLOYEE]: ['/employee/*']
};

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('authUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);
  const [isForcedPasswordChange, setIsForcedPasswordChange] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('authUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('authUser');
    }
  }, [user]);

  const login = async (credentials, role) => {
    const { identifier, password } = credentials;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await authAPI.login(identifier, password, role);
      
      // Set tokens in API client
      const apiClient = (await import('../services/api')).default;
      apiClient.setTokens(response.token, response.refreshToken);
      
      // Set user data
      setUser(response.user);
      
      // Check if password change is required
      if (response.user.password_change_required) {
        setIsForcedPasswordChange(true);
        setShowPasswordChangeModal(true);
      }
      
      return response.user;
    } catch (err) {
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Clear tokens from API client
      const apiClient = (await import('../services/api')).default;
      apiClient.clearTokens();
      
      // Clear user state
      setUser(null);
      setError(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const updateProfile = async (updates) => {
    try {
      setLoading(true);
      const response = await authAPI.updateProfile(updates);
      
      // The API client returns the data directly, not wrapped in a response object
      if (response && response.data) {
        // If response has data property, use it
        setUser(response.data);
      } else if (response) {
        // If response is the user data directly, use it
        setUser(response);
      } else {
        // Fallback: refresh the user profile from server
        await refreshUserProfile();
      }
      
      return response;
    } catch (err) {
      const errorMessage = err.message || 'Profile update failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (passwordData) => {
    try {
      setLoading(true);
      await authAPI.changePassword(passwordData);
    } catch (err) {
      const errorMessage = err.message || 'Password change failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const refreshUserProfile = async () => {
    try {
      const response = await authAPI.getProfile();
      setUser(response);
      return response;
    } catch (err) {
      console.error('Profile refresh error:', err);
      // If token refresh fails, logout user
      await logout();
    }
  };

  const hasPermission = (path) => {
    console.log('hasPermission check for path:', path, 'user role:', user?.role);
    
    if (!user) {
      console.log('No user found, permission denied');
      return false;
    }
    
    const allowedPaths = ROLE_PERMISSIONS[user.role.toLowerCase()];
    console.log('Allowed paths for role:', user.role, allowedPaths);
    
    if (!allowedPaths) {
      console.log('No allowed paths found for role:', user.role);
      return false;
    }
    
    const hasAccess = allowedPaths.some(allowedPath => {
      if (allowedPath.endsWith('/*')) {
        const matches = path.startsWith(allowedPath.slice(0, -2));
        console.log('Wildcard path check:', allowedPath, 'vs', path, 'matches:', matches);
        return matches;
      }
      const matches = path === allowedPath;
      console.log('Exact path check:', allowedPath, 'vs', path, 'matches:', matches);
      return matches;
    });
    
    console.log('Final permission result for', path, ':', hasAccess);
    return hasAccess;
  };

  const getRoleRedirectPath = () => {
    if (!user) return '/login';
    
    switch (user.role.toUpperCase()) {
      case 'ADMIN':
      case 'SUPER_ADMIN':
        return '/admin';
      case 'HR':
        return '/hr';
      case 'FINANCE_ADMIN':
      case 'FINANCE':
        return '/finance';
      case 'LOAN_COMMITTEE':
        return '/loan-committee';
      case 'EMPLOYEE':
        return '/employee';
      default:
        return '/login';
    }
  };

  const value = {
    user,
    login,
    logout,
    updateProfile,
    changePassword,
    refreshUserProfile,
    hasPermission,
    getRoleRedirectPath,
    isAuthenticated: !!user,
    loading,
    error,
    clearError: () => setError(null),
    showPasswordChangeModal,
    setShowPasswordChangeModal,
    isForcedPasswordChange,
    setIsForcedPasswordChange,
    ROLES
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
