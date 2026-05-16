import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Shared/Layout';

import DashboardPage from './pages/DashboardPage';
import EmployeesPage from './pages/EmployeesPage';
import PerformancePage from './pages/PerformancePage';
import ReportsPage from './pages/ReportsPage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';
import AccountPage from './pages/AccountPage';

import { AuthProvider } from '../../../shared/contexts/AuthContext';
import { ThemeProvider } from '../../../shared/contexts/ThemeContext';

function HrApp() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<DashboardPage />} />
            <Route path="employees" element={<EmployeesPage />} />
            <Route path="performance" element={<PerformancePage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="account" element={<AccountPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default HrApp;
