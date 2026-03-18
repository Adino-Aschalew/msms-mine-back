import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '../../shared/contexts/ThemeContext';
import Layout from '../../loan-commitee/src/components/layout/Layout';
import Dashboard from '../../loan-commitee/src/pages/Dashboard';
import LoanRequests from '../../loan-commitee/src/pages/LoanRequests';
import LoanDetails from '../../loan-commitee/src/pages/LoanDetails';
import Disbursements from '../../loan-commitee/src/pages/Disbursements';
import ReportsAnalytics from '../../loan-commitee/src/pages/ReportsAnalytics';
import Notifications from '../../loan-commitee/src/pages/Notifications';
import Settings from '../../loan-commitee/src/pages/Settings';
import AccountProfile from '../../loan-commitee/src/pages/account/Profile';
import AccountSecurity from '../../loan-commitee/src/pages/account/Security';
import AccountActivity from '../../loan-commitee/src/pages/account/Activity';
import AccountPreferences from '../../loan-commitee/src/pages/account/Preferences';

const LoanModule = () => {
  const [theme, setTheme] = React.useState('light');
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/loan-committee/dashboard" replace />} />
        <Route path="/dashboard" element={
          <Layout
            theme={theme}
            toggleTheme={toggleTheme}
            sidebarCollapsed={sidebarCollapsed}
            toggleSidebar={toggleSidebar}
            mobileSidebarOpen={mobileSidebarOpen}
            toggleMobileSidebar={toggleMobileSidebar}
          >
            <Dashboard />
          </Layout>
        } />
        <Route path="/loan-requests" element={
          <Layout
            theme={theme}
            toggleTheme={toggleTheme}
            sidebarCollapsed={sidebarCollapsed}
            toggleSidebar={toggleSidebar}
            mobileSidebarOpen={mobileSidebarOpen}
            toggleMobileSidebar={toggleMobileSidebar}
          >
            <LoanRequests />
          </Layout>
        } />
        <Route path="/loan-requests/:id" element={
          <Layout
            theme={theme}
            toggleTheme={toggleTheme}
            sidebarCollapsed={sidebarCollapsed}
            toggleSidebar={toggleSidebar}
            mobileSidebarOpen={mobileSidebarOpen}
            toggleMobileSidebar={toggleMobileSidebar}
          >
            <LoanDetails />
          </Layout>
        } />
        <Route path="/disbursements" element={
          <Layout
            theme={theme}
            toggleTheme={toggleTheme}
            sidebarCollapsed={sidebarCollapsed}
            toggleSidebar={toggleSidebar}
            mobileSidebarOpen={mobileSidebarOpen}
            toggleMobileSidebar={toggleMobileSidebar}
          >
            <Disbursements />
          </Layout>
        } />
        <Route path="/reports" element={
          <Layout
            theme={theme}
            toggleTheme={toggleTheme}
            sidebarCollapsed={sidebarCollapsed}
            toggleSidebar={toggleSidebar}
            mobileSidebarOpen={mobileSidebarOpen}
            toggleMobileSidebar={toggleMobileSidebar}
          >
            <ReportsAnalytics />
          </Layout>
        } />
        <Route path="/notifications" element={
          <Layout
            theme={theme}
            toggleTheme={toggleTheme}
            sidebarCollapsed={sidebarCollapsed}
            toggleSidebar={toggleSidebar}
            mobileSidebarOpen={mobileSidebarOpen}
            toggleMobileSidebar={toggleMobileSidebar}
          >
            <Notifications />
          </Layout>
        } />
        <Route path="/settings" element={
          <Layout
            theme={theme}
            toggleTheme={toggleTheme}
            sidebarCollapsed={sidebarCollapsed}
            toggleSidebar={toggleSidebar}
            mobileSidebarOpen={mobileSidebarOpen}
            toggleMobileSidebar={toggleMobileSidebar}
          >
            <Settings />
          </Layout>
        } />
        <Route path="/account/profile" element={
          <Layout
            theme={theme}
            toggleTheme={toggleTheme}
            sidebarCollapsed={sidebarCollapsed}
            toggleSidebar={toggleSidebar}
            mobileSidebarOpen={mobileSidebarOpen}
            toggleMobileSidebar={toggleMobileSidebar}
          >
            <AccountProfile />
          </Layout>
        } />
        <Route path="/account/security" element={
          <Layout
            theme={theme}
            toggleTheme={toggleTheme}
            sidebarCollapsed={sidebarCollapsed}
            toggleSidebar={toggleSidebar}
            mobileSidebarOpen={mobileSidebarOpen}
            toggleMobileSidebar={toggleMobileSidebar}
          >
            <AccountSecurity />
          </Layout>
        } />
        <Route path="/account/activity" element={
          <Layout
            theme={theme}
            toggleTheme={toggleTheme}
            sidebarCollapsed={sidebarCollapsed}
            toggleSidebar={toggleSidebar}
            mobileSidebarOpen={mobileSidebarOpen}
            toggleMobileSidebar={toggleMobileSidebar}
          >
            <AccountActivity />
          </Layout>
        } />
        <Route path="/account/preferences" element={
          <Layout
            theme={theme}
            toggleTheme={toggleTheme}
            sidebarCollapsed={sidebarCollapsed}
            toggleSidebar={toggleSidebar}
            mobileSidebarOpen={mobileSidebarOpen}
            toggleMobileSidebar={toggleMobileSidebar}
          >
            <AccountPreferences />
          </Layout>
        } />
        <Route path="*" element={<Navigate to="/loan-committee/dashboard" replace />} />
      </Routes>
    </ThemeProvider>
  );
};

export default LoanModule;
