import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import FinanceLayout from '../../finance/src/components/layout/Layout';
import { ThemeProvider } from '../../finance/src/contexts/ThemeContext';
import { NotificationProvider } from '../../finance/src/contexts/NotificationContext';
import { AuthProvider } from '../../finance/src/contexts/AuthContext';
import Dashboard from '../../finance/src/pages/dashboard/Dashboard';
import Transactions from '../../finance/src/pages/transactions/Transactions';
import PayrollImport from '../../finance/src/pages/payroll/PayrollImport';
import PayrollHistory from '../../finance/src/pages/payroll/PayrollHistory';
import Payroll from '../../finance/src/pages/payroll/Payroll';
import Employees from '../../finance/src/pages/employees/Employees';
import Analytics from '../../finance/src/pages/analytics/Analytics';
import Reports from '../../finance/src/pages/reports/Reports';
import Users from '../../finance/src/pages/users/Users';
import Settings from '../../finance/src/pages/settings/Settings';
import AccountProfile from '../../finance/src/pages/account/AccountProfile';
import AccountSecurity from '../../finance/src/pages/account/AccountSecurity';
import Accounts from '../../finance/src/pages/accounts/Accounts';
import Budgets from '../../finance/src/pages/budgets/Budgets';
import Invoices from '../../finance/src/pages/invoices/Invoices';
import PayrollReports from '../../finance/src/pages/payroll/PayrollReports';
import Notifications from '../../finance/src/pages/notifications/Notifications';
import Help from '../../finance/src/pages/help/Help';

const FinanceModule = () => {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AuthProvider>
          <Routes>
            <Route element={<FinanceLayout />}>
              <Route index element={<Navigate to="/finance/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="transactions/income" element={<Transactions filter="income" />} />
              <Route path="transactions/expenses" element={<Transactions filter="expenses" />} />
              <Route path="transactions/transfers" element={<Transactions filter="transfers" />} />
              <Route path="accounts" element={<Accounts />} />
              <Route path="payroll" element={<Payroll />} />
              <Route path="payroll/import" element={<PayrollImport />} />
              <Route path="payroll/history" element={<PayrollHistory />} />
              <Route path="payroll/reports" element={<PayrollReports />} />
              <Route path="employees" element={<Employees />} />
              <Route path="budgets" element={<Budgets />} />
              <Route path="invoices" element={<Invoices />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="reports" element={<Reports />} />
              <Route path="users" element={<Users />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="settings" element={<Settings />} />
              <Route path="account/profile" element={<AccountProfile />} />
              <Route path="account/security" element={<AccountSecurity />} />
              <Route path="help" element={<Help />} />
            </Route>
            <Route path="*" element={<Navigate to="/finance/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
};

export default FinanceModule;
