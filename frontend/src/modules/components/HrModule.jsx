import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HrLayout from '../../hr-admin/src/components/Shared/Layout';
import { ThemeProvider } from '../../hr-admin/src/contexts/ThemeContext';
import DashboardPage from '../../hr-admin/src/pages/DashboardPage';
import EmployeesPage from '../../hr-admin/src/pages/EmployeesPage';
import PerformancePage from '../../hr-admin/src/pages/PerformancePageSystem';
import ReportsPage from '../../hr-admin/src/pages/ReportsPageNew';
import NotificationsPage from '../../hr-admin/src/pages/NotificationsPage';
import SettingsPage from '../../hr-admin/src/pages/SettingsPageNew';
import AccountPage from '../../hr-admin/src/pages/AccountPageNew';

const HrModule = () => {
  return (
    <ThemeProvider>
      <Routes>
        <Route element={<HrLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="employees" element={<EmployeesPage />} />
          <Route path="performance" element={<PerformancePage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="account" element={<AccountPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/hr/dashboard" replace />} />
      </Routes>
    </ThemeProvider>
  );
};

export default HrModule;
