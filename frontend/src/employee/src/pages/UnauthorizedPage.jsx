import React from 'react';
import { Link } from 'react-router-dom';
import { FiLock, FiHome, FiShield } from 'react-icons/fi';

const UnauthorizedPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-warning-100 dark:bg-warning-900">
            <FiLock className="h-6 w-6 text-warning-600 dark:text-warning-400" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-gray-100">
            Access Denied
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            You don't have permission to access this page.
          </p>
          <div className="mt-6 space-y-4">
            <Link
              to="/dashboard"
              className="btn-primary w-full inline-flex items-center justify-center"
            >
              <FiHome className="w-4 h-4 mr-2" />
              Go back home
            </Link>
            <button
              onClick={() => window.history.back()}
              className="btn-secondary w-full inline-flex items-center justify-center"
            >
              Go back
            </button>
          </div>
          <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="flex items-start">
              <FiShield className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-2" />
              <div className="text-left">
                <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                  Need access?
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Contact your administrator if you believe this is an error.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
