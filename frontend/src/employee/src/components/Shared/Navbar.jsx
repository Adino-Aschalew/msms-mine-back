import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../../../shared/contexts/AuthContext';
import { notificationsAPI } from '../../services/api';
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

  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  const [filterType, setFilterType] = useState('all');

  const typeToIconAndColor = (notificationType) => {
    const t = String(notificationType || '').toUpperCase();
    switch (t) {
      case 'SUCCESS':
        return { Icon: FiCheckCircle, color: 'green' };
      case 'WARNING':
        return { Icon: FiAlertCircle, color: 'orange' };
      case 'ERROR':
        return { Icon: FiX, color: 'red' };
      default:
        return { Icon: FiInfo, color: 'blue' };
    }
  };

  const getNotificationIcon = (color) => {
    switch (color) {
      case 'green': return 'text-green-500';
      case 'blue': return 'text-blue-500';
      case 'orange': return 'text-orange-500';
      case 'red': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getNotificationBg = (color) => {
    switch (color) {
      case 'green': return 'bg-green-100 dark:bg-green-900';
      case 'blue': return 'bg-blue-100 dark:bg-blue-900';
      case 'orange': return 'bg-orange-100 dark:bg-orange-900';
      case 'red': return 'bg-red-100 dark:bg-red-900';
      default: return 'bg-gray-100 dark:bg-gray-900';
    }
  };

  const toTimeLabel = (iso) => {
    if (!iso) return '';
    const ts = new Date(iso).getTime();
    if (Number.isNaN(ts)) return '';
    const diffMs = Date.now() - ts;
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hour${hrs === 1 ? '' : 's'} ago`;
    const days = Math.floor(hrs / 24);
    return `${days} day${days === 1 ? '' : 's'} ago`;
  };

  const fetchNotifications = async () => {
    setNotificationsLoading(true);
    try {
      const res = await notificationsAPI.getNotifications({ page: 1, limit: 20 });
      const items = res?.data?.notifications || res?.data?.notifications?.notifications || res?.data?.notifications || res?.data || [];
      // backend returns { success, data: { notifications, pagination } }
      const normalized = (res?.data?.notifications ? res.data.notifications : res?.data?.notifications?.notifications) || res?.data?.notifications || res?.data?.data?.notifications || res?.data?.data || [];
      const list = Array.isArray(normalized) ? normalized : items;
      setNotifications(list);
    } catch (e) {
      console.log('[employee] fetchNotifications failed', e);
    } finally {
      setNotificationsLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.id) return;
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const markAsRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n)));
    } catch (e) {
      console.log('[employee] markAsRead failed', e);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true, read_at: n.read_at || new Date().toISOString() })));
    } catch (e) {
      console.log('[employee] markAllAsRead failed', e);
    }
  };

  const filteredNotifications = filterType === 'all'
    ? notifications
    : notifications.filter((notif) => String(notif.notification_type || '').toUpperCase() === String(filterType || '').toUpperCase());

  const unreadCount = notifications.filter((notif) => !notif.is_read).length;

  // Mock user stats for demonstration
  const userStats = {
    savingsRate: 25,
    loanProgress: 68,
    creditScore: 750,
    memberSince: '2022'
  };

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-1 w-full">
      <div className="flex items-center justify-between h-full">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
          >
            {sidebarOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
          </button>

          <div className="relative hidden md:block">
            <div className="flex items-center space-x-2">
              <span className="text-gray-900 font-bold dark:text-gray-300 text-2xl">Welcome back,</span>
              <span className="text-blue-600 dark:text-white font-semibold text-2xl">
                {user?.first_name || user?.name || 'User'}
              </span>
            </div>
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
                      onClick={() => setFilterType('SUCCESS')}
                      className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors duration-150 ${filterType === 'SUCCESS'
                          ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                    >
                      Success
                    </button>
                    <button
                      onClick={() => setFilterType('ERROR')}
                      className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors duration-150 ${filterType === 'ERROR'
                          ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                    >
                      Errors
                    </button>
                  </div>
                </div>

                {/* Notifications List */}
                <div className="max-h-96 overflow-y-auto">
                  {notificationsLoading ? (
                    <div className="p-8 text-center">
                      <p className="text-gray-500 dark:text-gray-400 text-sm">Loading...</p>
                    </div>
                  ) : filteredNotifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <FiBell className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-500 dark:text-gray-400 text-sm">No notifications to show</p>
                    </div>
                  ) : (
                    filteredNotifications.map((notification) => {
                      const { Icon, color } = typeToIconAndColor(notification.notification_type);
                      return (
                        <div
                          key={notification.id}
                          className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 ${!notification.read ? 'bg-blue-50 dark:bg-blue-900 bg-opacity-30' : ''
                            }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`w-10 h-10 ${getNotificationBg(color)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                              <Icon className={`w-5 h-5 ${getNotificationIcon(color)}`} />
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
                                      {toTimeLabel(notification.created_at)}
                                    </span>
                                    <button
                                      onClick={() => markAsRead(notification.id)}
                                      className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                                    >
                                      Mark as read
                                    </button>
                                  </div>
                                </div>
                                {!notification.is_read && (
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
