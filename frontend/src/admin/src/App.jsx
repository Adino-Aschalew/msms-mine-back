import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/common/ErrorBoundary.jsx';
import Layout from './components/layout/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AdminManagement from './pages/AdminManagement.jsx';
import Analytics from './pages/Analytics.jsx';
import Settings from './pages/Settings.jsx';
import Account from './pages/Account.jsx';
import Security from './account/pages/Security.jsx';
import Sessions from './account/pages/Sessions.jsx';
import Activity from './account/pages/Activity.jsx';
import Preferences from './account/pages/Preferences.jsx';
import DangerZone from './account/pages/DangerZone.jsx';
import Reports from './pages/Reports.jsx';

function AdminApp() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
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
        <Route path="account" element={<Account />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default AdminApp;
