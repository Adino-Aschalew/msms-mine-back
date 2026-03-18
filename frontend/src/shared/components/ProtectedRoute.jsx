import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Normalize DB role enum to frontend role string
const normalizeRole = (dbRole) => {
  if (!dbRole) return '';
  const r = dbRole.toLowerCase();
  // DB stores FINANCE_ADMIN, SUPER_ADMIN — map to frontend names
  if (r === 'finance_admin') return 'finance';
  if (r === 'super_admin')   return 'admin';
  return r;
};

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    console.log('[route] blocked: not authenticated', {
      pathname: location.pathname,
      requiredRole,
      user: user ? { id: user?.id, role: user?.role } : null,
    });
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRole = normalizeRole(user?.role);

  if (requiredRole && userRole !== requiredRole.toLowerCase()) {
    console.log('[route] blocked: role mismatch', {
      pathname: location.pathname,
      requiredRole,
      userRole,
      rawRole: user?.role,
    });
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
