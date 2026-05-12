import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../shared/contexts/AuthContext';
import AdminLayout from '../../admin/src/components/layout/Layout.jsx';
import Dashboard from '../../admin/src/pages/Dashboard.jsx';
import AdminManagement from '../../admin/src/pages/AdminManagement.jsx';
import Analytics from '../../admin/src/pages/Analytics.jsx';
import Settings from '../../admin/src/pages/Settings.jsx';
import Account from '../../admin/src/pages/Account.jsx';
import Security from '../../admin/src/account/pages/Security.jsx';
import Sessions from '../../admin/src/account/pages/Sessions.jsx';
import Activity from '../../admin/src/account/pages/Activity.jsx';
import Preferences from '../../admin/src/account/pages/Preferences.jsx';
import DangerZone from '../../admin/src/account/pages/DangerZone.jsx';
import Reports from '../../admin/src/pages/Reports.jsx';

import { ThemeProvider } from '../../admin/src/contexts/ThemeContext2.jsx';

const AdminModule = () => {
  const { user } = useAuth();

  return (
    <ThemeProvider>
      <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="admin-management" element={<AdminManagement />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
        <Route path="account/profile" element={<Account />} />
        <Route path="account/security" element={<Security />} />
        <Route path="account/sessions" element={<Sessions />} />
        <Route path="account/activity" element={<Activity />} />
        <Route path="account/preferences" element={<Preferences />} />
        <Route path="account/danger" element={<DangerZone />} />
      </Route>

      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
    </ThemeProvider>
  );
};

export default AdminModule;
