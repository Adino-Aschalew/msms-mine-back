import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import ModuleNavigation from './ModuleNavigation';

const UnifiedLayout = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {}
      <ModuleNavigation />
      
      {}
      <div className="flex">
        {}
        <aside className={`w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 ${
          sidebarOpen ? 'block' : 'hidden lg:block'
        }`}>
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {user?.role === 'admin' && 'Admin Module'}
              {user?.role === 'hr' && 'HR Module'}
              {user?.role === 'finance' && 'Finance Module'}
              {user?.role === 'employee' && 'Employee Module'}
              {user?.role === 'loan_committee' && 'Loan Committee Module'}
            </h3>
            
            {}
            <nav className="space-y-2">
              {user?.role === 'admin' && (
                <>
                  <a href="/admin/dashboard" className="block px-3 py-2 rounded-md text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
                    Dashboard
                  </a>
                  <a href="/admin/admin-management" className="block px-3 py-2 rounded-md text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
                    Admin Management
                  </a>
                  <a href="/admin/analytics" className="block px-3 py-2 rounded-md text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
                    Analytics
                  </a>
                  <a href="/admin/reports" className="block px-3 py-2 rounded-md text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
                    Reports
                  </a>
                  <a href="/admin/settings" className="block px-3 py-2 rounded-md text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
                    Settings
                  </a>
                </>
              )}
              
              {user?.role === 'hr' && (
                <>
                  <a href="/hr/dashboard" className="block px-3 py-2 rounded-md text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
                    Dashboard
                  </a>
                  <a href="/hr/employees" className="block px-3 py-2 rounded-md text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
                    Employees
                  </a>
                  <a href="/hr/performance" className="block px-3 py-2 rounded-md text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
                    Performance
                  </a>
                  <a href="/hr/reports" className="block px-3 py-2 rounded-md text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
                    Reports
                  </a>
                  <a href="/hr/notifications" className="block px-3 py-2 rounded-md text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
                    Notifications
                  </a>
                  <a href="/hr/settings" className="block px-3 py-2 rounded-md text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
                    Settings
                  </a>
                </>
              )}
              
              {user?.role === 'finance' && (
                <>
                  <a href="/finance/dashboard" className="block px-3 py-2 rounded-md text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
                    Dashboard
                  </a>
                  <a href="/finance/transactions" className="block px-3 py-2 rounded-md text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
                    Transactions
                  </a>
                  <a href="/finance/accounts" className="block px-3 py-2 rounded-md text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
                    Accounts
                  </a>
                  <a href="/finance/payroll" className="block px-3 py-2 rounded-md text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
                    Payroll
                  </a>
                  <a href="/finance/employees" className="block px-3 py-2 rounded-md text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
                    Employees
                  </a>
                  <a href="/finance/budgets" className="block px-3 py-2 rounded-md text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
                    Budgets
                  </a>
                  <a href="/finance/analytics" className="block px-3 py-2 rounded-md text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
                    Analytics
                  </a>
                  <a href="/finance/reports" className="block px-3 py-2 rounded-md text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
                    Reports
                  </a>
                </>
              )}
              
              {user?.role === 'employee' && (
                <>
                  <a href="/employee/dashboard" className="block px-3 py-2 rounded-md text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
                    Dashboard
                  </a>
                  <a href="/employee/loans" className="block px-3 py-2 rounded-md text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
                    My Loans
                  </a>
                  <a href="/employee/loans/request" className="block px-3 py-2 rounded-md text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
                    Loan Request
                  </a>
                  <a href="/employee/savings" className="block px-3 py-2 rounded-md text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
                    Savings
                  </a>
                  <a href="/employee/guarantors" className="block px-3 py-2 rounded-md text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
                    Guarantors
                  </a>
                  <a href="/employee/repayments" className="block px-3 py-2 rounded-md text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
                    Repayments
                  </a>
                  <a href="/employee/payroll" className="block px-3 py-2 rounded-md text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
                    Payroll
                  </a>
                  <a href="/employee/notifications" className="block px-3 py-2 rounded-md text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
                    Notifications
                  </a>
                  <a href="/employee/profile" className="block px-3 py-2 rounded-md text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
                    Profile
                  </a>
                  <a href="/employee/help" className="block px-3 py-2 rounded-md text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
                    Help & Support
                  </a>
                </>
              )}
              
              {user?.role === 'loan_committee' && (
                <>
                  <a href="/loan-committee/dashboard" className="block px-3 py-2 rounded-md text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
                    Dashboard
                  </a>
                  <a href="/loan-committee/loan-requests" className="block px-3 py-2 rounded-md text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
                    Loan Requests
                  </a>
                  <a href="/loan-committee/disbursements" className="block px-3 py-2 rounded-md text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
                    Disbursements
                  </a>
                  <a href="/loan-committee/reports" className="block px-3 py-2 rounded-md text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
                    Reports
                  </a>
                  <a href="/loan-committee/notifications" className="block px-3 py-2 rounded-md text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
                    Notifications
                  </a>
                  <a href="/loan-committee/settings" className="block px-3 py-2 rounded-md text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
                    Settings
                  </a>
                </>
              )}
            </nav>
          </div>
        </aside>
        
        {}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default UnifiedLayout;
