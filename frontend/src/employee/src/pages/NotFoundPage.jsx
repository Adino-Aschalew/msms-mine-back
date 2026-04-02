import React from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiSearch, FiArrowLeft, FiHelpCircle, FiMail, FiPhone } from 'react-icons/fi';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">EMS</span>
              </div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Employee Management System
              </h1>
            </div>
            <Link
              to="/dashboard"
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              <FiArrowLeft className="w-4 h-4 mr-1" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      {}
      <div className="flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="w-full max-w-md sm:max-w-lg lg:max-w-2xl mx-auto text-center">

          {}
          <div className="relative mb-8 sm:mb-12">
            <div className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto shadow-2xl">
              <span className="text-white text-3xl sm:text-4xl lg:text-6xl font-bold">404</span>
            </div>
            <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 w-8 h-8 sm:w-10 sm:h-10 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
              <FiHelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
          </div>

          {}
          <div className="mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Page Not Found
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-6 max-w-lg mx-auto">
              The page you're looking for doesn't exist or has been moved.
            </p>
            <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto"></div>
          </div>

          {}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-8 sm:mb-12 w-full max-w-xs sm:max-w-md mx-auto">
            <Link
              to="/dashboard"
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 sm:py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-center"
            >
              <FiHome className="w-5 h-5 inline mr-2" />
              Go to Dashboard
            </Link>
            <button
              onClick={() => window.history.back()}
              className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 sm:py-4 px-6 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Go Back
            </button>
          </div>

          {}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
            <div className="text-center mb-6">
              <FiHelpCircle className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Need Help?
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Find answers or contact our support team
              </p>
            </div>

            {}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <Link
                to="/help"
                className="flex items-center justify-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors group"
              >
                <FiHelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3 group-hover:scale-110 transition-transform" />
                <span className="font-medium text-blue-700 dark:text-blue-300">Help Center</span>
              </Link>

              <a
                href="mailto:support@company.com"
                className="flex items-center justify-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors group"
              >
                <FiMail className="w-5 h-5 text-green-600 dark:text-green-400 mr-3 group-hover:scale-110 transition-transform" />
                <span className="font-medium text-green-700 dark:text-green-300">Email Support</span>
              </a>
            </div>

            {}
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 text-center">
                Or search for what you need:
              </p>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search help articles..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
            </div>
          </div>

          {}
          <div className="mt-8 sm:mt-12 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              If you believe this is an error, please contact our support team.
            </p>
            <div className="flex items-center justify-center mt-4 space-x-6">
              <a
                href="tel:+1234567890"
                className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                <FiPhone className="w-4 h-4 mr-2" />
                Call Support
              </a>
              <span className="text-gray-300 dark:text-gray-600">•</span>
              <a
                href="mailto:support@company.com"
                className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                <FiMail className="w-4 h-4 mr-2" />
                Email Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
