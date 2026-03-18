import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../../../../shared/contexts/AuthContext';
import {
  FiMenu,
  FiX,
  FiBell,
  FiSearch,
  FiSun,
  FiMoon,
  FiMonitor,
  FiUser,
  FiSettings,
  FiLogOut,
  FiChevronDown,
  FiShield,
  FiHelpCircle,
  FiActivity,
  FiTrendingUp,
  FiCreditCard,
  FiAward,
  FiCheck,
  FiX as FiCloseIcon,
  FiClock,
  FiDollarSign,
  FiAlertCircle,
  FiCheckCircle,
  FiInfo,
  FiMessageSquare,
  FiFilter,
  FiCheckSquare,
  FiSquare
} from 'react-icons/fi';

const Navbar = ({ sidebarOpen, setSidebarOpen }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <FiSun className="w-4 h-4" />;
      case 'dark':
        return <FiMoon className="w-4 h-4" />;
      default:
        return <FiMonitor className="w-4 h-4" />;
    }
  };

  const unreadNotifications = 3;

  // Mock notifications for demonstration
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'loan_approval',
      title: 'Loan Approved',
      message: 'Your emergency loan of $5,000 has been approved',
      time: '2 hours ago',
      read: false,
      icon: FiCheckCircle,
      color: 'green',
      action: 'View Loan Details'
    },
    {
      id: 2,
      type: 'savings_deduction',
      title: 'Savings Deduction',
      message: 'Monthly savings of $2,500 deducted from salary',
      time: '1 day ago',
      read: false,
      icon: FiDollarSign,
      color: 'blue',
      action: 'View Payroll'
    },
    {
      id: 3,
      type: 'payment_reminder',
      title: 'Loan Payment Due',
      message: 'Your loan payment of $916.67 is due in 3 days',
      time: '2 days ago',
      read: false,
      icon: FiClock,
      color: 'orange',
      action: 'Make Payment'
    },
    {
      id: 4,
      type: 'system_update',
      title: 'System Update',
      message: 'New features have been added to your dashboard',
      time: '3 days ago',
      read: true,
      icon: FiInfo,
      color: 'purple',
      action: 'Learn More'
    },
    {
      id: 5,
      type: 'guarantor_request',
      title: 'Guarantor Request',
      message: 'John Doe has requested you to be a guarantor',
      time: '1 week ago',
      read: true,
      icon: FiMessageSquare,
      color: 'indigo',
      action: 'Review Request'
    }
  ]);

  const [filterType, setFilterType] = useState('all');

  const getNotificationIcon = (color) => {
    switch (color) {
      case 'green': return 'text-green-500';
      case 'blue': return 'text-blue-500';
      case 'orange': return 'text-orange-500';
      case 'purple': return 'text-purple-500';
      case 'indigo': return 'text-indigo-500';
      default: return 'text-gray-500';
    }
  };

  const getNotificationBg = (color) => {
    switch (color) {
      case 'green': return 'bg-green-100 dark:bg-green-900';
      case 'blue': return 'bg-blue-100 dark:bg-blue-900';
      case 'orange': return 'bg-orange-100 dark:bg-orange-900';
      case 'purple': return 'bg-purple-100 dark:bg-purple-900';
      case 'indigo': return 'bg-indigo-100 dark:bg-indigo-900';
      default: return 'bg-gray-100 dark:bg-gray-900';
    }
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(notif =>
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  const filteredNotifications = filterType === 'all'
    ? notifications
    : notifications.filter(notif => notif.type === filterType);

  const unreadCount = notifications.filter(notif => !notif.read).length;

  // Mock user stats for demonstration
  const userStats = {
    savingsRate: 25,
    loanProgress: 68,
    creditScore: 750,
    memberSince: '2022'
  };

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 w-full">
      <div className="flex items-center justify-between h-full">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
          >
            {sidebarOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
          </button>

          <div className="relative hidden md:block">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 w-64"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            title={`Current theme: ${theme}`}
          >
            {getThemeIcon()}
          </button>

          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)}
              className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 group"
            >
              <FiBell className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-200" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-sm animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Enhanced Notification Dropdown */}
            {notificationDropdownOpen && (
              <div className="absolute right-0 mt-3 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 transform transition-all duration-200 origin-top-right">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
                    <div className="flex items-center space-x-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                        >
                          Mark all read
                        </button>
                      )}
                      <button
                        onClick={() => setNotificationDropdownOpen(false)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-150"
                      >
                        <FiCloseIcon className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </div>

                  {/* Filter Tabs */}
                  <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                    <button
                      onClick={() => setFilterType('all')}
                      className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors duration-150 ${filterType === 'all'
                          ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                    >
                      All ({notifications.length})
                    </button>
                    <button
                      onClick={() => setFilterType('loan_approval')}
                      className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors duration-150 ${filterType === 'loan_approval'
                          ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                    >
                      Loans
                    </button>
                    <button
                      onClick={() => setFilterType('savings_deduction')}
                      className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors duration-150 ${filterType === 'savings_deduction'
                          ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                    >
                      Savings
                    </button>
                  </div>
                </div>

                {/* Notifications List */}
                <div className="max-h-96 overflow-y-auto">
                  {filteredNotifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <FiBell className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-500 dark:text-gray-400 text-sm">No notifications to show</p>
                    </div>
                  ) : (
                    filteredNotifications.map((notification) => {
                      const Icon = notification.icon;
                      return (
                        <div
                          key={notification.id}
                          className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 ${!notification.read ? 'bg-blue-50 dark:bg-blue-900 bg-opacity-30' : ''
                            }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`w-10 h-10 ${getNotificationBg(notification.color)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                              <Icon className={`w-5 h-5 ${getNotificationIcon(notification.color)}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {notification.title}
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {notification.message}
                                  </p>
                                  <div className="flex items-center justify-between mt-2">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {notification.time}
                                    </span>
                                    <button
                                      onClick={() => markAsRead(notification.id)}
                                      className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                                    >
                                      {notification.action}
                                    </button>
                                  </div>
                                </div>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <Link
                    to="/employee/notifications"
                    onClick={() => setNotificationDropdownOpen(false)}
                    className="flex items-center justify-center w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors duration-150 text-sm font-medium"
                  >
                    View All Notifications
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 group"
            >
              <div className="relative">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-200 overflow-hidden">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white text-sm font-bold">
                      {user?.name?.charAt(0) || 'U'}
                    </span>
                  )}
                </div>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.role || 'Employee'}
                </p>
              </div>
              <FiChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Enhanced Profile Dropdown */}
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 transform transition-all duration-200 origin-top-right">
                {/* User Profile Header */}
                <div className="bg-blue-500 p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center overflow-hidden">
                      {user?.avatar ? (
                        <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white text-lg font-bold">
                          {user?.name?.charAt(0) || 'U'}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-semibold">
                        {user?.name || 'User'}
                      </p>
                      <p className="text-blue-100 text-sm">
                        {user?.email || 'user@example.com'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <Link
                    to="/employee/profile"
                    className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <FiUser className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Profile</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Manage your information</p>
                    </div>
                  </Link>

                  <Link
                    to="/employee/settings"
                    className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <FiSettings className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Account Settings</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Preferences and security</p>
                    </div>
                  </Link>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Member since {userStats.memberSince}</span>
                    <div className="flex items-center space-x-1 text-xs text-green-600 dark:text-green-400">
                      <FiShield className="w-3 h-3" />
                      <span>Verified</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      logout();
                      setProfileDropdownOpen(false);
                    }}
                    className="flex items-center justify-center space-x-2 w-full px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900 dark:hover:bg-red-800 text-red-600 dark:text-red-400 rounded-lg transition-colors duration-150"
                  >
                    <FiLogOut className="w-4 h-4" />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
