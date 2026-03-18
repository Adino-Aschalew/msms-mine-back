import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/Shared/ToastContainer';
import ErrorBoundary from './components/ErrorBoundary';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import MyLoansPage from './pages/MyLoansPage';
import LoanRequestPage from './pages/LoanRequestPage';
import SavingsPage from './pages/SavingsPage';
import GuarantorsPage from './pages/GuarantorsPage';
import RepaymentsPage from './pages/RepaymentsPage';
import PayrollPage from './pages/PayrollPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import HelpPage from './pages/HelpPage';
import AccountSettingsPage from './pages/AccountSettingsPage';
import NotFoundPage from './pages/NotFoundPage';
import UnauthorizedPage from './pages/UnauthorizedPage';

function EmployeeApp() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Routes>
            <Route path="/" element={<DashboardLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="loans" element={<MyLoansPage />} />
              <Route path="loans/request" element={<LoanRequestPage />} />
              <Route path="savings" element={<SavingsPage />} />
              <Route path="guarantors" element={<GuarantorsPage />} />
              <Route path="repayments" element={<RepaymentsPage />} />
              <Route path="payroll" element={<PayrollPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<AccountSettingsPage />} />
              <Route path="help" element={<HelpPage />} />
            </Route>
            <Route path="unauthorized" element={<UnauthorizedPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default EmployeeApp;
