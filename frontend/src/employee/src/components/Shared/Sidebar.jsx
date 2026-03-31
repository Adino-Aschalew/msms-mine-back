import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  FiGrid, 
  FiDollarSign, 
  FiFileText, 
  FiUsers, 
  FiCreditCard, 
  FiCalendar, 
  FiBell, 
  FiUser,
  FiSettings,
  FiLogOut,
  FiHelpCircle,
  FiTrendingUp,
  FiTarget
} from 'react-icons/fi';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/employee/dashboard', icon: FiGrid, label: 'Dashboard' },
    { path: '/employee/loans', icon: FiDollarSign, label: 'My Loans' },
    { path: '/employee/loans/request', icon: FiFileText, label: 'Loan Request' },
    { path: '/employee/savings', icon: FiTarget, label: 'My Savings' },
    { path: '/employee/guarantors', icon: FiUsers, label: 'Guarantors' },
    { path: '/employee/repayments', icon: FiCreditCard, label: 'Repayments' },
    { path: '/employee/payroll', icon: FiCalendar, label: 'Payroll' },
    { path: '/employee/notifications', icon: FiBell, label: 'Notifications' },
    { path: '/employee/profile', icon: FiUser, label: 'Profile' },
    { path: '/employee/help', icon: FiHelpCircle, label: 'Help & Support' },
  ];


  return (
    <aside className={`
        w-64 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:fixed lg:z-40 lg:flex lg:flex-col
      `}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 px-6 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">
              Employee Portal
            </h1>
          </div>
          
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) => `
                    flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md transition-colors
                    ${isActive 
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' 
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
          
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button className="text-red-600 bg-red-100 flex items-center space-x-3 w-full px-3 py-2 text-sm font-medium dark:bg-red-100 dark:text-red-600 rounded-md hover:bg-red-50 dark:hover:bg-gray-700">
              <FiLogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
    );
};

export default Sidebar;
