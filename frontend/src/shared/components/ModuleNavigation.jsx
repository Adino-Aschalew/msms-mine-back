import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth, ROLES } from '../contexts/AuthContext';
import { FiLogOut, FiUser } from 'react-icons/fi';

const ModuleNavigation = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const isActive = (path) => location.pathname.startsWith(path);

  const getModuleInfo = (role) => {
    const modules = {
      [ROLES.ADMIN]: {
        name: 'Admin',
        path: '../admin',
        color: 'purple'
      },
      [ROLES.HR]: {
        name: 'HR',
        path: '../hr',
        color: 'green'
      },
      [ROLES.FINANCE]: {
        name: 'Finance',
        path: '../finance',
        color: 'blue'
      },
      [ROLES.LOAN_COMMITTEE]: {
        name: 'Loan Committee',
        path: '../loan-committee',
        color: 'orange'
      },
      [ROLES.EMPLOYEE]: {
        name: 'Employee',
        path: '../employee',
        color: 'pink'
      }
    };
    return modules[role];
  };

  const currentModule = getModuleInfo(user.role);
  const allModules = Object.values(ROLES).map(role => getModuleInfo(role));

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            {}
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Microfinance
              </span>
            </div>

            {}
            <div className="hidden md:flex space-x-4">
              {allModules.map((module) => (
                <Link
                  key={module.path}
                  to={module.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(module.path)
                      ? `bg-${module.color}-100 dark:bg-${module.color}-900 text-${module.color}-700 dark:text-${module.color}-300`
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {module.name}
                </Link>
              ))}
            </div>
          </div>

          {}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                <FiUser className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {user.name}
              </span>
            </div>
            
            <button
              onClick={logout}
              className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <FiLogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default ModuleNavigation;
