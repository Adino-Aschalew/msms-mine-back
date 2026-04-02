import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/authAPI';


export const ROLES = {
  ADMIN: 'admin',
  HR: 'hr',
  FINANCE: 'finance',
  LOAN_COMMITTEE: 'loan_committee',
  EMPLOYEE: 'employee'
};


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
      console.log('[auth] login start', { identifier, role });
      const response = await authAPI.login(identifier, password, role);
      console.log('[auth] login success', {
        hasToken: !!response?.token,
        hasRefreshToken: !!response?.refreshToken,
        userRole: response?.user?.role,
        userId: response?.user?.id,
      });
      
      
      const apiClient = (await import('../services/api')).default;
      apiClient.setTokens(response.token, response.refreshToken);
      console.log('[auth] tokens saved to api client + localStorage');
      
      
      setUser(response.user);
      console.log('[auth] user state scheduled', { role: response?.user?.role });
      
      
      if (response.user.password_change_required) {
        setIsForcedPasswordChange(true);
        setShowPasswordChangeModal(true);
      }
      
      return response.user;
    } catch (err) {
      console.log('[auth] login error', err);
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('[auth] logout called');
      
      const apiClient = (await import('../services/api')).default;
      apiClient.clearTokens();
      console.log('[auth] tokens cleared');
      
      
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
      
      
      if (response && response.data) {
        
        setUser(response.data);
      } else if (response) {
        
        setUser(response);
      } else {
        
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
      console.log('[auth] refreshUserProfile start');
      const response = await authAPI.getProfile();
      console.log('[auth] refreshUserProfile success', { role: response?.role, id: response?.id });
      setUser(response);
      return response;
    } catch (err) {
      console.error('Profile refresh error:', err);
      console.log('[auth] refreshUserProfile failed -> logout', err);
      
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
