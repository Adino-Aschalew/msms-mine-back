import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import LoanRequests from './pages/LoanRequests';
import LoanDetails from './pages/LoanDetails';
import Disbursements from './pages/Disbursements';
import ReportsAnalytics from './pages/ReportsAnalytics';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import AccountProfile from './pages/account/Profile';
import AccountSecurity from './pages/account/Security';
import AccountActivity from './pages/account/Activity';
import AccountPreferences from './pages/account/Preferences';

function App() {
  const [theme, setTheme] = useState('light');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  return (
    <Router>
      <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
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
        </Routes>
      </div>
    </Router>
  );
}

export default App;
