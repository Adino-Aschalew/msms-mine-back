import React, { useState, useEffect } from 'react';
import { FiBell, FiCheck, FiX, FiFilter, FiTrash2, FiMail, FiDollarSign, FiCreditCard, FiAlertCircle, FiSearch, FiCalendar, FiCheckCircle, FiInfo, FiMessageSquare, FiClock, FiTrendingUp, FiShield, FiSettings, FiArchive, FiStar } from 'react-icons/fi';
import { notificationsAPI } from '../../../shared/services/notificationsAPI';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationsAPI.getNotifications();
      if (res.success && res.data) {
        setNotifications(res.data.notifications || []);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'loan_approval':
        return <FiCheckCircle className="w-5 h-5" />;
      case 'loan_rejection':
        return <FiX className="w-5 h-5" />;
      case 'savings_deduction':
        return <FiDollarSign className="w-5 h-5" />;
      case 'savings_rate_update':
        return <FiTrendingUp className="w-5 h-5" />;
      case 'loan_repayment':
        return <FiCreditCard className="w-5 h-5" />;
      case 'withdrawal_request':
        return <FiArchive className="w-5 h-5" />;
      case 'system_update':
        return <FiInfo className="w-5 h-5" />;
      case 'guarantor_required':
        return <FiMessageSquare className="w-5 h-5" />;
      default:
        return <FiBell className="w-5 h-5" />;
    }
  };

  const getNotificationColor = (type, priority) => {
    const colorMap = {
      'loan_approval': 'green',
      'loan_rejection': 'red',
      'savings_deduction': 'blue',
      'savings_rate_update': 'purple',
      'loan_repayment': 'orange',
      'withdrawal_request': 'indigo',
      'system_update': 'gray',
      'guarantor_required': 'yellow'
    };
    
    const color = colorMap[type] || 'gray';
    
    if (priority === 'high') {
      return {
        bg: `bg-${color}-100 dark:bg-${color}-900`,
        text: `text-${color}-600 dark:text-${color}-400`,
        border: `border-${color}-200 dark:border-${color}-700`
      };
    }
    
    return {
      bg: `bg-${color}-50 dark:bg-${color}-900/20`,
      text: `text-${color}-600 dark:text-${color}-400`,
      border: `border-${color}-200 dark:border-${color}-700`
    };
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border border-red-200 dark:border-red-700';
      case 'medium':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-700';
      case 'low':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 border border-gray-200 dark:border-gray-700';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 border border-gray-200 dark:border-gray-700';
    }
  };

  const getCategoryStats = () => {
    const stats = {
      loans: notifications.filter(n => n.notification_type?.toLowerCase().includes('loan') || n.title?.toLowerCase().includes('loan')).length,
      savings: notifications.filter(n => n.notification_type?.toLowerCase().includes('savings') || n.title?.toLowerCase().includes('savings')).length,
      system: notifications.filter(n => n.notification_type === 'INFO').length,
      actions: 0
    };
    return stats;
  };

  const stats = getCategoryStats();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) {
        return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
      } else {
        return date.toLocaleDateString();
      }
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id ? { ...notification, is_read: true } : notification
        )
      );
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, is_read: true }))
      );
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await notificationsAPI.deleteNotification(id);
      setNotifications(prev => prev.filter(notification => notification.id !== id));
    } catch (error) {
      console.error('Failed to delete notification', error);
    }
  };

  const clearAllNotifications = async () => {
    try {
      // Best effort parallel deletion since API doesn't have clear all
      await Promise.all(notifications.map(n => notificationsAPI.deleteNotification(n.id)));
      setNotifications([]);
    } catch (error) {
      console.error('Error clearing notifications', error);
      fetchNotifications(); // Refresh to ensure valid state
    }
  };

  const toggleSelection = (id) => {
    // Selection functionality removed
  };

  const selectAllNotifications = () => {
    // Selection functionality removed
  };

  const deleteSelected = () => {
    // Bulk delete functionality removed
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = () => {
      if (filter === 'all') return true;
      if (filter === 'unread') return !notification.is_read;
      if (filter === 'read') return notification.is_read;
      if (filter === 'high') return notification.priority === 'high' || notification.notification_type === 'ERROR';
      if (filter === 'action_required') return false; // Action required not in backend model
      if (filter === 'loans') return notification.title?.toLowerCase().includes('loan');
      if (filter === 'savings') return notification.title?.toLowerCase().includes('savings');
      if (filter === 'system') return notification.notification_type === 'INFO';
      return true;
    };
    
    const matchesSearch = searchQuery === '' || 
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter() && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header Section */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <FiBell className="mr-3 text-blue-600" />
                Notifications Center
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All notifications read'}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  <FiCheck className="w-4 h-4 mr-2" />
                  Mark All Read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAllNotifications}
                  className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  <FiTrash2 className="w-4 h-4 mr-2" />
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="stat-card border-violet-500/50">
            <div className="flex items-center justify-between w-full">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Notifications</p>
                <p className="text-3xl text-violet-600 font-bold mt-2">{notifications.length}</p>
                <div className="flex items-center mt-2 text-gray-500 text-sm">
                  <FiBell className="mr-1 text-violet-600" />
                  <span>All time</span>
                </div>
              </div>
              <div className="p-3 bg-violet-100 dark:bg-violet-900 rounded-lg">
                <FiBell className="w-8 h-8 text-violet-600" />
              </div>
            </div>
          </div>

          <div className="stat-card border-green-500/50">
            <div className="flex items-center justify-between w-full">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Unread</p>
                <p className="text-3xl text-green-600 font-bold mt-2">{unreadCount}</p>
                <div className="flex items-center mt-2 text-gray-500 text-sm">
                  <FiAlertCircle className="mr-1 text-green-600" />
                  <span>Need attention</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <FiAlertCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="stat-card border-blue-500/50">
            <div className="flex items-center justify-between w-full">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">High Priority</p>
                <p className="text-3xl text-blue-600 font-bold mt-2">{notifications.filter(n => n.priority === 'high').length}</p>
                <div className="flex items-center mt-2 text-gray-500 text-sm">
                  <FiStar className="mr-1 text-blue-600" />
                  <span>Important</span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <FiStar className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="stat-card border-yellow-500/50">
            <div className="flex items-center justify-between w-full">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Action Required</p>
                <p className="text-3xl text-yellow-600 font-bold mt-2">{notifications.filter(n => n.actionRequired).length}</p>
                <div className="flex items-center mt-2 text-gray-500 text-sm">
                  <FiSettings className="mr-1 text-yellow-600" />
                  <span>Pending actions</span>
                </div>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <FiSettings className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              {/* Search */}
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                />
              </div>
              
              {/* Filter Dropdown */}
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Notifications</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
                <option value="high">High Priority</option>
                <option value="action_required">Action Required</option>
                <option value="loans">Loans</option>
                <option value="savings">Savings</option>
                <option value="system">System</option>
              </select>
            </div>
            
            {/* Bulk Actions */}
            <div className="flex items-center space-x-3">
              {/* Bulk actions removed - no more checkboxes */}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden w-full">
          {filteredNotifications.length === 0 ? (
            <div className="p-12 text-center w-full">
              <FiBell className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No notifications found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery ? 'Try adjusting your search terms' : 
                 filter === 'all' ? "You're all caught up! No new notifications." :
                 `No ${filter.replace('_', ' ')} notifications found.`}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700 w-full">
              {filteredNotifications.map((notification, index) => {
                const colors = getNotificationColor(notification.type, notification.priority);
                const Icon = getNotificationIcon(notification.type);
                
                return (
                  <div
                    key={notification.id}
                    className={`block w-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 ${
                      !notification.is_read ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500' : ''
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="p-6 w-full block">
                      <div className="flex items-start space-x-4 w-full">
                        {/* Notification Icon */}
                        <div className={`p-3 rounded-xl ${colors.bg} ${colors.border} border flex-shrink-0`}>
                          <div className={colors.text}>
                            {typeof Icon === 'function' ? <Icon /> : Icon}
                          </div>
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0 w-full">
                          <div className="flex flex-col w-full space-y-3">
                            {/* Header with Title and Badges */}
                            <div className="w-full">
                              <div className="flex items-start justify-between w-full mb-2">
                                <h3 className={`text-base font-semibold text-gray-900 dark:text-white pr-2 ${
                                  !notification.is_read ? 'font-bold' : ''
                                }`}>
                                  {notification.title}
                                </h3>
                                <div className="flex items-center space-x-2 flex-shrink-0">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(notification.notification_type === 'ERROR' ? 'high' : 'medium')}`}>
                                    {notification.notification_type}
                                  </span>
                                  {!notification.is_read && (
                                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {/* Message */}
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed w-full">
                              {notification.message}
                            </p>
                            
                            {/* Footer with Time and Actions */}
                            <div className="flex items-center justify-between w-full pt-2 border-t border-gray-100 dark:border-gray-700">
                              <div className="flex items-center space-x-4">
                                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                                  <FiClock className="w-3 h-3 mr-1" />
                                  {formatDate(notification.created_at)}
                                </span>
                              </div>
                              
                              <div className="flex items-center space-x-2 flex-shrink-0">
                                {!notification.is_read && (
                                  <button
                                    onClick={() => markAsRead(notification.id)}
                                    className="btn inline-flex items-center px-3 py-3 text-xs bg-white hover:bg-blue-100 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-600 dark:text-blue-400 rounded-lg transition-colors duration-150"
                                  >
                                    <FiCheck className="w-3 h-3 mr-1" />
                                    Mark as read
                                  </button>
                                )}
                                <button
                                  onClick={() => deleteNotification(notification.id)}
                                  className="btn py-3 inline-flex items-center px-3 text-xs bg-red-600 hover:text-black hover:bg-red-100 dark:bg-gray-700 dark:hover:bg-gray-600 text-white dark:text-gray-400 rounded-lg transition-colors duration-150"
                                >
                                  <FiX className="w-3 h-3 mr-1" />
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
