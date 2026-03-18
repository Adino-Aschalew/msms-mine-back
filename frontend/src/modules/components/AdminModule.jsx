import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../shared/contexts/AuthContext';
import AdminLayout from '../../admin/src/components/layout/Layout';
import Dashboard from '../../admin/src/pages/Dashboard';
import AdminManagement from '../../admin/src/pages/AdminManagement';
import Analytics from '../../admin/src/pages/Analytics';
import Settings from '../../admin/src/pages/Settings';
import Account from '../../admin/src/pages/Account';
import Security from '../../admin/src/account/pages/Security';
import Sessions from '../../admin/src/account/pages/Sessions';
import Activity from '../../admin/src/account/pages/Activity';
import Preferences from '../../admin/src/account/pages/Preferences';
import DangerZone from '../../admin/src/account/pages/DangerZone';
import Reports from '../../admin/src/pages/Reports';

import { ThemeProvider } from '../../admin/src/contexts/ThemeContext2';

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
