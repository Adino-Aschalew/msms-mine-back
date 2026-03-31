import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  FiGrid,
  FiUsers,
  FiFileText,
  FiSettings,
  FiLogOut,
  FiX,
  FiUpload,
  FiTrendingUp,
  FiBell,
  FiHome,
  FiCreditCard,
  FiShield,
  FiChevronLeft,
  FiArrowRight,
} from 'react-icons/fi';

const navigation = [
  {
    name: 'Dashboard',
    href: '/finance/dashboard',
    icon: FiHome,
  },
  {
    name: 'Transactions',
    href: '/finance/transactions',
    icon: FiArrowRight,
  },
  {
    name: 'Savings Adjustments',
    href: '/finance/savings/requests',
    icon: FiTrendingUp,
  },
  {
    name: 'Profile',
    href: '/finance/account/profile',
    icon: FiShield,
  },
  {
    name: 'Payroll',
    href: '/finance/payroll',
    icon: FiUsers,
    children: [
      {
        name: 'Import',
        href: '/finance/payroll/import',
        icon: FiUpload,
      },
      {
        name: 'History',
        href: '/finance/payroll/history',
        icon: FiGrid,
      },
      {
        name: 'Reports',
        href: '/finance/payroll/reports',
        icon: FiFileText,
      },
    ],
  },
  {
    name: 'Employees',
    href: '/finance/employees',
    icon: FiUsers,
  },
  {
    name: 'Invoices',
    href: '/finance/invoices',
    icon: FiCreditCard,
  },
  {
    name: 'Reports',
    href: '/finance/reports',
    icon: FiFileText,
  },
  {
    name: 'Notifications',
    href: '/finance/notifications',
    icon: FiBell,
  },
  {
    name: 'Settings',
    href: '/finance/settings',
    icon: FiSettings,
  },
];

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = React.useState(new Set(['Payroll']));

  const toggleExpanded = (name) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(name)) {
      newExpanded.delete(name);
    } else {
      newExpanded.add(name);
    }
    setExpandedItems(newExpanded);
  };


  const handleCloseSidebar = () => {
    console.log('Closing sidebar, current state:', isOpen);
    if (setIsOpen && typeof setIsOpen === 'function') {
      setIsOpen(false);
    } else {
      console.error('setIsOpen is not a function:', setIsOpen);
    }
  };

  const handleTopCloseClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Top close button clicked');
    handleCloseSidebar();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={handleCloseSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 w-64 h-full bg-white dark:bg-black border-r border-gray-200 dark:border-gray-700 lg:static lg:z-auto transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex flex-col h-full">
          {/* Logo and close button */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <FiTrendingUp className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">
                FinanceHub
              </span>
              <span className="text-xl font-bold text-gray-900 dark:text-white sm:hidden">
                FH
              </span>
            </div>
            <button
              onClick={handleTopCloseClick}
              className="lg:hidden p-3 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400 transition-colors shadow-md hover:shadow-lg relative z-60"
              aria-label="Close sidebar"
              type="button"
            >
              <FiX className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const hasChildren = item.children && item.children.length > 0;
              const isExpanded = expandedItems.has(item.name);

              return (
                <div key={item.name}>
                  <NavLink
                    to={item.href}
                    onClick={() => {
                      if (hasChildren) {
                        toggleExpanded(item.name);
                      } else {
                        handleCloseSidebar();
                      }
                    }}
                    className={({ isActive }) => `flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' 
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span className="ml-3 flex-1 text-left hidden sm:block">{item.name}</span>
                    {hasChildren && (
                      <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
                        <FiChevronLeft className="h-4 w-4 hidden sm:block"/>
                        <svg
                          className="h-4 w-4 hidden sm:block"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    )}
                  </NavLink>

                  {/* Submenu */}
                  {hasChildren && isExpanded && (
                    <div className="overflow-hidden">
                      <div className="ml-4 sm:ml-8 mt-1 space-y-1">
                        {item.children.map((child) => (
                          <NavLink
                            key={child.name}
                            to={child.href}
                            onClick={handleCloseSidebar}
                            className={({ isActive }) => `flex items-center w-full px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                            isActive 
                              ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' 
                              : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                          }`}
                          >
                            <span className="hidden sm:block">{child.name}</span>
                            <span className="sm:hidden text-xs">{child.name.length > 15 ? child.name.substring(0, 15) + '...' : child.name}</span>
                          </NavLink>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Sign out button */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
            <button className="sidebar-item sidebar-item-inactive w-full">
              <FiLogOut className="h-5 w-5" />
              <span className="ml-3 hidden sm:block">Sign Out</span>
              <span className="sm:hidden">Sign Out</span>
            </button>
            
            {/* Mobile close button */}
            <button
              onClick={handleCloseSidebar}
              className="lg:hidden w-full flex items-center justify-center px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <FiX className="h-5 w-5 mr-2" />
              <span className="text-sm font-medium">Close Menu</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
