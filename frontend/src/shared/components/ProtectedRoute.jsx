import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';


const normalizeRole = (dbRole) => {
  if (!dbRole) return '';
  const r = dbRole.toLowerCase().trim();


  if (r === 'super_admin' || r === 'admin') return 'admin';
  if (r === 'finance_admin' || r === 'finance') return 'finance';
  if (r === 'loan_committee') return 'loan_committee';
  if (r === 'hr') return 'hr';
  if (r === 'employee') return 'employee';
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
  
  console.log('[route] auth check', {
    path: location.pathname,
    roleInState: user?.role,
    normalizedRole: userRole,
    required: requiredRole,
    isMatch: userRole === requiredRole?.toLowerCase()
  });

  // Email verification check for employees
  if (userRole === 'employee' && !user?.email_verified && location.pathname !== '/verify-email') {
    console.log('[route] redirecting to email verification');
    return <Navigate to="/verify-email" replace />;
  }

  if (requiredRole && userRole !== requiredRole.toLowerCase()) {
    console.log('[route] ACCESS DENIED: role mismatch', {
      path: location.pathname,
      userRole,
      requiredRole: requiredRole.toLowerCase()
    });
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
