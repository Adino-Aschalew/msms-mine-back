import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './shared/contexts/ThemeContext';
import { AuthProvider, useAuth } from './shared/contexts/AuthContext';
import ProtectedRoute from './shared/components/ProtectedRoute';
import PasswordChangeModal from './shared/components/PasswordChangeModal';


const AdminModule = React.lazy(() => import('./modules/components/AdminModule'));
const HrModule = React.lazy(() => import('./modules/components/HrModule'));
const FinanceModule = React.lazy(() => import('./modules/components/FinanceModule'));
const EmployeeModule = React.lazy(() => import('./modules/components/EmployeeModule'));
const LoanModule = React.lazy(() => import('./modules/components/LoanModule'));
const LoginPage = React.lazy(() => import('./shared/pages/LoginPage'));
const UnauthorizedPage = React.lazy(() => import('./shared/pages/UnauthorizedPage'));

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

function AppContent() {
  const {
    showPasswordChangeModal,
    setShowPasswordChangeModal,
    isForcedPasswordChange
  } = useAuth();

  return (
    <>
      <Router>
        <React.Suspense
          fallback={
            <div className="flex items-center justify-center min-h-screen">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          }
        >
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            <Route path="/" element={<Navigate to="/login" replace />} />

            <Route
              path="/admin/*"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminModule />
                </ProtectedRoute>
              }
            />

            <Route
              path="/hr/*"
              element={
                <ProtectedRoute requiredRole="hr">
                  <HrModule />
                </ProtectedRoute>
              }
            />

            <Route
              path="/finance/*"
              element={
                <ProtectedRoute requiredRole="finance">
                  <FinanceModule />
                </ProtectedRoute>
              }
            />

            <Route
              path="/employee/*"
              element={
                <ProtectedRoute requiredRole="employee">
                  <EmployeeModule />
                </ProtectedRoute>
              }
            />

            <Route
              path="/loan-committee/*"
              element={
                <ProtectedRoute requiredRole="loan_committee">
                  <LoanModule />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </React.Suspense>
      </Router>
      <PasswordChangeModal
        isOpen={showPasswordChangeModal}
        onClose={() => setShowPasswordChangeModal(false)}
        isForced={isForcedPasswordChange}
      />
    </>
  );
}

export default App;