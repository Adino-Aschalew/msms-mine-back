import React from 'react';
import { AlertTriangle, Shield, AlertCircle, CheckCircle } from 'lucide-react';

const Danger = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 mb-8">
            <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Danger Zone</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
            This area contains sensitive administrative functions. Access is restricted to authorized personnel only.
          </p>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8">
            <div className="flex items-center gap-4 mb-6">
              <Shield className="h-12 w-12 text-red-600 dark:text-red-400" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Access Restricted</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  You don't have the necessary permissions to access this area. Please contact your system administrator if you believe this is an error.
                </p>
                <div className="flex gap-4">
                  <button className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200">
                    Go Back
                  </button>
                  <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200">
                    Contact Admin
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Danger;
