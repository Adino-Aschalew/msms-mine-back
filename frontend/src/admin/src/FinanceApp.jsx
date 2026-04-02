import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FinanceHeader from './components/layout/FinanceHeader';
import FinanceSidebar from './components/layout/FinanceSidebar';
import FinanceDashboard from './pages/FinanceDashboard';
import FinanceAdminDashboard from './pages/FinanceAdminDashboard';
import FinanceAdminManagement from './pages/FinanceAdminManagement';
import Transactions from './pages/FinanceTransactions';
import PayrollImport from './pages/FinancePayrollImport';
import Employees from './pages/FinanceEmployees';
import Budgets from './pages/FinanceBudgets';
import Invoices from './pages/FinanceInvoices';
import Analytics from './pages/FinanceAnalytics';
import Reports from './pages/FinanceReports';
import Users from './pages/FinanceUsers';
import Settings from './pages/FinanceSettings';
import AccountProfile from './pages/FinanceAccountProfile';

function FinanceApp() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <FinanceHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <FinanceSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        {}
        <main className="lg:pl-64">
          <div className="px-4 py-6 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/finance" element={<FinanceDashboard />} />
              <Route path="/finance/dashboard" element={<FinanceDashboard />} />
              <Route path="/finance/transactions" element={<Transactions />} />
              <Route path="/finance/transactions/income" element={<Transactions />} />
              <Route path="/finance/transactions/expenses" element={<Transactions />} />
              <Route path="/finance/transactions/transfers" element={<Transactions />} />
              <Route path="/finance/accounts" element={<div className="p-8"><h1 className="text-2xl font-bold">Accounts</h1></div>} />
              <Route path="/finance/payroll/import" element={<PayrollImport />} />
              <Route path="/finance/payroll/history" element={<div className="p-8"><h1 className="text-2xl font-bold">Payroll History</h1></div>} />
              <Route path="/finance/payroll/reports" element={<div className="p-8"><h1 className="text-2xl font-bold">Payroll Reports</h1></div>} />
              <Route path="/finance/employees" element={<Employees />} />
              <Route path="/finance/budgets" element={<Budgets />} />
              <Route path="/finance/invoices" element={<Invoices />} />
              <Route path="/finance/analytics" element={<Analytics />} />
              <Route path="/finance/reports" element={<Reports />} />
              <Route path="/finance/users" element={<Users />} />
              <Route path="/finance/settings" element={<Settings />} />
              <Route path="/finance/notifications" element={<div className="p-8"><h1 className="text-2xl font-bold">Notifications</h1></div>} />
              <Route path="/finance/account/profile" element={<AccountProfile />} />
              <Route path="/finance/account/security" element={<div className="p-8"><h1 className="text-2xl font-bold">Security</h1></div>} />
              <Route path="/finance/account/sessions" element={<div className="p-8"><h1 className="text-2xl font-bold">Sessions</h1></div>} />
              <Route path="/finance/account/preferences" element={<div className="p-8"><h1 className="text-2xl font-bold">Preferences</h1></div>} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default FinanceApp;
