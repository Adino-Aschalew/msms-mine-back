import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';


const normalizeRole = (dbRole) => {
  if (!dbRole) return '';
  const r = dbRole.toLowerCase();
  
  if (r === 'finance_admin') return 'finance';
  if (r === 'super_admin')   return 'admin';
  if (r === 'loan_committee') return 'loan_committee';
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
  console.log('[route] role check', {
    pathname: location.pathname,
    requiredRole,
    userRole,
    rawRole: user?.role,
    requiredRoleLower: requiredRole?.toLowerCase(),
    comparison: userRole !== requiredRole?.toLowerCase()
  });

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
