import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';


const normalizeRole = (dbRole) => {
  if (!dbRole) return '';
  const r = dbRole.toLowerCase();
  
  if (r === 'finance_admin') return 'finance';
  if (r === 'admin')         return 'admin';
  if (r === 'loan_committee') return 'loan_committee';
  if (r === 'employee') return 'employee';
  return r;
};

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Wait for authentication to complete
  if (loading) {
    console.log('[route] waiting for authentication to complete');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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

  // Support multiple roles for admin access
  const hasAccess = requiredRole ? 
    (requiredRole.toLowerCase() === 'admin' && ['admin'].includes(userRole)) ||
    userRole === requiredRole.toLowerCase()
    : true;

  if (requiredRole && !hasAccess) {
    console.log('[route] blocked: role mismatch', {
      pathname: location.pathname,
      requiredRole,
      userRole,
      rawRole: user?.role,
      hasAccess
    });
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
