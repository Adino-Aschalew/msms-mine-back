import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../../employee/src/layouts/DashboardLayout';
import DashboardPage from '../../employee/src/pages/DashboardPage';
import MyLoansPage from '../../employee/src/pages/MyLoansPage';
import LoanRequestPage from '../../employee/src/pages/LoanRequestPage';
import SavingsPage from '../../employee/src/pages/SavingsPage';
import GuarantorsPage from '../../employee/src/pages/GuarantorsPage';
import RepaymentsPage from '../../employee/src/pages/RepaymentsPage';
import PayrollPage from '../../employee/src/pages/PayrollPage';
import NotificationsPage from '../../employee/src/pages/NotificationsPage';
import ProfilePage from '../../employee/src/pages/ProfilePage';
import HelpPage from '../../employee/src/pages/HelpPage';
import AccountSettingsPage from '../../employee/src/pages/AccountSettingsPage';

const EmployeeModule = () => {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route index element={<Navigate to="/employee/dashboard" replace />} />
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
      <Route path="*" element={<Navigate to="/employee/dashboard" replace />} />
    </Routes>
  );
};

export default EmployeeModule;
