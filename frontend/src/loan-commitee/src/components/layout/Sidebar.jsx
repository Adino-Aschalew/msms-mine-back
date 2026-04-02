import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import {
  FiGrid,
  FiFileText,
  FiDollarSign,
  FiBarChart,
  FiBell,
  FiSettings,
  FiUser,
  FiLogOut,
  FiX
} from 'react-icons/fi';

const menuItems = [
  { path: '/loan-committee/dashboard', label: 'Dashboard', icon: FiGrid },
  { path: '/loan-committee/loan-requests', label: 'Loan Requests', icon: FiFileText },
  { path: '/loan-committee/disbursements', label: 'Disbursements', icon: FiDollarSign },
  { path: '/loan-committee/reports', label: 'Reports & Analytics', icon: FiBarChart },
  { path: '/loan-committee/notifications', label: 'Notifications', icon: FiBell },
  { path: '/loan-committee/settings', label: 'Settings', icon: FiSettings },
];

const accountItems = [
  { path: '/loan-committee/account/profile', label: 'Profile', icon: FiUser },
  { path: '/loan-committee/account/security', label: 'Security', icon: FiSettings },
  { path: '/loan-committee/account/activity', label: 'Activity', icon: FiFileText },
  { path: '/loan-committee/account/preferences', label: 'Preferences', icon: FiSettings },
];

const Sidebar = ({ collapsed, mobileOpen, onMobileClose }) => {
  const location = useLocation();

  const sidebarClasses = clsx(
    'fixed lg:relative inset-y-0 left-0 z-50 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out',
    {
      'w-64': !collapsed,
      'w-20': collapsed,
      'translate-x-0': mobileOpen,
      '-translate-x-full': !mobileOpen,
      'lg:translate-x-0': true,
    }
  );

  return (
    <>
    {}
    <aside className={sidebarClasses}>
        <div className="flex flex-col h-full">
          {}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <FiDollarSign className="w-5 h-5 text-white" />
              </div>
              {!collapsed && (
                <div>
                  <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">Loan Committee</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Management System</p>
                </div>
              )}
            </div>
            
            {}
            <button
              onClick={onMobileClose}
              className="lg:hidden p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <FiX className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          {}
          <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
            {}
            <div className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onMobileClose}
                    className={({ isActive }) => clsx(
                      'sidebar-item group',
                      {
                        'active': isActive,
                        'justify-center': collapsed,
                      }
                    )}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span className="ml-3">{item.label}</span>}
                    
                    {}
                    {collapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                        {item.label}
                      </div>
                    )}
                  </NavLink>
                );
              })}
            </div>

            {}
            {!collapsed && (
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Account
                </p>
                <div className="space-y-1">
                  {accountItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={onMobileClose}
                        className={({ isActive }) => clsx(
                          'sidebar-item',
                          {
                            'active': isActive,
                          }
                        )}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span className="ml-3">{item.label}</span>
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            )}
          </nav>

          {}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            {!collapsed ? (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <FiUser className="w-4 h-4 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">John Committee</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Committee Member</p>
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <FiUser className="w-4 h-4 text-gray-600" />
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
