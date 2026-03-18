import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  FiGrid, 
  FiUsers, 
  FiBarChart, 
  FiFileText, 
  FiSettings, 
  FiUser,
  FiLogOut,
  FiMenu
} from 'react-icons/fi';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: FiGrid },
    { name: 'Admin Management', href: '/admin/admin-management', icon: FiUsers },
    { name: 'Analytics', href: '/admin/analytics', icon: FiBarChart },
    { name: 'Reports', href: '/admin/reports', icon: FiFileText },
    { name: 'Settings', href: '/admin/settings', icon: FiSettings },
    { name: 'Account', href: '/admin/account/profile', icon: FiUser },
  ];


  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 z-50 h-screen w-64 transform border-r border-gray-200 bg-white transition-transform duration-300 ease-in-out dark:border-gray-700 dark:bg-gray-900 lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
          <button
            onClick={() => setIsOpen(false)}
            className="btn-outline h-8 w-8 p-0 lg:hidden"
          >
            <FiMenu className="h-4 w-4" />
          </button>
        </div>
        <nav className="flex h-full flex-col">
          <div className="flex-1 space-y-1 p-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) => `
                    sidebar-item
                    ${isActive ? 'sidebar-item-active' : ''}
                  `}
                  onClick={() => {
                    console.log('Sidebar navigation clicked:', item.name, item.href);
                    setIsOpen(false);
                  }}
                >
                  <Icon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                  <span className="text-gray-900 dark:text-white">{item.name}</span>
                </NavLink>
              );
            })}
          </div>
          <div className="border-t border-gray-200 p-4 dark:border-gray-700">
            <button 
              onClick={() => {
                console.log('Logout clicked');
                // Handle logout logic here
                setIsOpen(false);
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-all hover:bg-red-50 dark:hover:bg-red-900/10"
            >
              <FiLogOut className="h-5 w-5" />
              <span className="text-gray-900 dark:text-white">Sign Out</span>
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
