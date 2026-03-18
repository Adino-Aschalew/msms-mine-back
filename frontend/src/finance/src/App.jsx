import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout.jsx';
import Header from './components/layout/Header.jsx';
import Sidebar from './components/layout/Sidebar.jsx';
import Dashboard from './pages/dashboard/Dashboard.jsx';
import Transactions from './pages/transactions/Transactions.jsx';
import PayrollImport from './pages/payroll/PayrollImport.jsx';
import PayrollHistory from './pages/payroll/PayrollHistory.jsx';
import Payroll from './pages/payroll/Payroll.jsx';
import Employees from './pages/employees/Employees.jsx';
import Analytics from './pages/analytics/Analytics.jsx';
import Reports from './pages/reports/Reports.jsx';
import Users from './pages/users/Users.jsx';
import Settings from './pages/settings/Settings.jsx';
import AccountProfile from './pages/account/AccountProfile.jsx';
import AccountSecurity from './pages/account/AccountSecurity.jsx';
import Accounts from './pages/accounts/Accounts.jsx';
import Budgets from './pages/budgets/Budgets.jsx';
import Invoices from './pages/invoices/Invoices.jsx';
import PayrollReports from './pages/payroll/PayrollReports.jsx';
import Notifications from './pages/notifications/Notifications.jsx';
import Help from './pages/help/Help.jsx';
import { NotificationProvider } from './contexts/NotificationContext.jsx';

function FinanceApp() {
  console.log('FinanceApp component is rendering');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <NotificationProvider>
      <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-black">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-black">
            <div className="p-4 sm:p-6 lg:p-8">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/transactions/income" element={<Transactions filter="income" />} />
                <Route path="/transactions/expenses" element={<Transactions filter="expenses" />} />
                <Route path="/transactions/transfers" element={<Transactions filter="transfers" />} />
                <Route path="/accounts" element={<Accounts />} />
                <Route path="/payroll" element={<Payroll />} />
                <Route path="/payroll/import" element={<PayrollImport />} />
                <Route path="/payroll/history" element={<PayrollHistory />} />
                <Route path="/payroll/reports" element={<PayrollReports />} />
                <Route path="/employees" element={<Employees />} />
                <Route path="/budgets" element={<Budgets />} />
                <Route path="/invoices" element={<Invoices />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/users" element={<Users />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/account/profile" element={<AccountProfile />} />
                <Route path="/account/security" element={<AccountSecurity />} />
                <Route path="/help" element={<Help />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </NotificationProvider>
  );
}

export default FinanceApp;
