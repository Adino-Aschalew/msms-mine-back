import React, { useState } from 'react';
import { FiMenu, FiBell, FiUser, FiMoon, FiSun, FiMonitor, FiLogOut, FiSettings, FiChevronDown, FiSearch } from 'react-icons/fi';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotifications } from '../../contexts/NotificationContext.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import NotificationDropdown from '../widgets/NotificationDropdown.jsx';
import SearchBar from '../widgets/SearchBar.jsx';

const Header = ({ sidebarOpen, setSidebarOpen }) => {
  const { theme, toggleTheme } = useTheme();
  const { notifications, unreadCount } = useNotifications();
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  return (
    <>
      {/* Header */}
      <header className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side */}
            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400 transition-colors"
              >
                <FiMenu className="h-6 w-6" />
              </button>
              
              {/* FiSearch Bar - Desktop */}
              <div className="hidden md:block">
                 <h1 className='font-bold text-2xl'>Welcome Back,<span className='text-blue-600'>{user.firstName}</span></h1>
              </div>
              
              {/* Mobile FiSearch Button */}
              <button
                onClick={() => setShowSearch(true)}
                className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400 transition-colors"
              >
                <FiSearch className="h-5 w-5" />
              </button>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-2">
              {/* Theme Toggle Button */}
              <div className="relative">
                <button
                  onClick={toggleTheme}
                  className="flex items-center space-x-1 sm:space-x-2 p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
                  title="Toggle theme"
                >
                  {theme === 'light' && (
                    <FiMoon className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-500" />
                  )}
                  {theme === 'dark' && (
                    <FiSun className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
                  )}
                  <span className="hidden sm:inline text-sm font-medium">
                    {theme === 'light' ? 'Dark' : 'Light'}
                  </span>
                </button>
              </div>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400 transition-colors duration-200"
                >
                  <FiBell className="h-4 w-4 sm:h-5 sm:w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                
                {showNotifications && (
                  <NotificationDropdown
                    notifications={notifications}
                    onClose={() => setShowNotifications(false)}
                  />
                )}
              </div>

              {/* User Profile */}
              <div className="relative">
                <button
                  onClick={() => setShowProfile(!showProfile)}
                  className="flex items-center space-x-1 sm:space-x-2 p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
                >
                  <div className="relative">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-6 w-6 sm:h-8 sm:w-8 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                    />
                    <div className="absolute -bottom-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-200">
                    {user.name}
                  </span>
                  <FiChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>
                
                {showProfile && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-black rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                    {/* Profile Header */}
                    <div className="px-4 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-3">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="h-12 w-12 rounded-full object-cover border-2 border-white dark:border-gray-600"
                        />
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {user.email}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-xs text-green-600 dark:text-green-400 font-medium">Online</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* FiMenu Items */}
                    <div className="py-2">
                      <a
                        href="/account/profile"
                        className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors duration-200"
                      >
                        <FiUser className="h-4 w-4 mr-3 text-blue-500" />
                        <span>My Profile</span>
                      </a>
                      <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                      <button
                        onClick={logout}
                        className="flex items-center px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200 w-full"
                      >
                        <FiLogOut className="h-4 w-4 mr-3" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Global FiSearch Modal */}
      {showSearch && (
        <SearchBar
          isOpen={showSearch}
          onClose={() => setShowSearch(false)}
          isModal={true}
        />
      )}
    </>
  );
};

export default Header;
