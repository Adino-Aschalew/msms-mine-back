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
  const [viewMode, setViewMode] = useState('list'); 

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
      
      await Promise.all(notifications.map(n => notificationsAPI.deleteNotification(n.id)));
      setNotifications([]);
    } catch (error) {
      console.error('Error clearing notifications', error);
      fetchNotifications(); 
    }
  };

  const toggleSelection = (id) => {
    
  };

  const selectAllNotifications = () => {
    
  };

  const deleteSelected = () => {
    
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = () => {
      if (filter === 'all') return true;
      if (filter === 'unread') return !notification.is_read;
      if (filter === 'read') return notification.is_read;
      if (filter === 'high') return notification.priority === 'high' || notification.notification_type === 'ERROR';
      if (filter === 'action_required') return false; 
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 sticky top-0 z-20">
        <div className="w-full mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-600 flex items-center justify-center text-white rounded-lg shadow-lg shadow-purple-500/20">
                <FiBell className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Notifications</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All notifications read'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="h-12 px-6 flex items-center gap-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  <FiCheck className="w-5 h-5" />
                  <span>Mark All Read</span>
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAllNotifications}
                  className="h-12 px-6 flex items-center gap-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                >
                  <FiTrash2 className="w-5 h-5" />
                  <span>Clear All</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full mx-auto px-6 py-8">
        {}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Notifications', value: notifications.length, color: 'purple', icon: FiBell },
            { label: 'Unread', value: unreadCount, color: 'emerald', icon: FiAlertCircle },
            { label: 'High Priority', value: notifications.filter(n => n.priority === 'high').length, color: 'orange', icon: FiStar },
            { label: 'Action Required', value: notifications.filter(n => n.actionRequired).length, color: 'red', icon: FiSettings },
          ].map((stat, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/20 text-${stat.color}-600 dark:text-${stat.color}-400`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              {}
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full sm:w-64"
                />
              </div>
              
              {}
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Notifications</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
                <option value="high">High Priority</option>
                <option value="loans">Loans</option>
                <option value="savings">Savings</option>
                <option value="system">System</option>
              </select>
            </div>
          </div>
        </div>

        {}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {filteredNotifications.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiBell className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No notifications found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {searchQuery ? 'Try adjusting your search terms' : 
                 filter === 'all' ? "You're all caught up! No new notifications." :
                 `No ${filter.replace('_', ' ')} notifications found.`}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredNotifications.map((notification) => {
                const colors = getNotificationColor(notification.type, notification.priority);
                const Icon = getNotificationIcon(notification.type);
                
                return (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      !notification.is_read ? 'bg-purple-50/50 dark:bg-purple-900/10 border-l-4 border-l-purple-500' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {}
                      <div className={`p-2 rounded-lg ${colors.bg} flex-shrink-0`}>
                        <div className={colors.text}>
                          <Icon />
                        </div>
                      </div>
                      
                      {}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className={`text-sm font-semibold text-gray-900 dark:text-white ${
                              !notification.is_read ? 'font-bold' : ''
                            }`}>
                              {notification.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                              {notification.message}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(notification.notification_type === 'ERROR' ? 'high' : 'medium')}`}>
                              {notification.notification_type}
                            </span>
                            {!notification.is_read && (
                              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                            )}
                          </div>
                        </div>
                        
                        {}
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                            <FiClock className="w-3 h-3 mr-1" />
                            {formatDate(notification.created_at)}
                          </span>
                          
                          <div className="flex items-center gap-2">
                            {!notification.is_read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                              >
                                <FiCheck className="w-3 h-3 mr-1" />
                                Mark as read
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            >
                              <FiTrash2 className="w-3 h-3 mr-1" />
                              Delete
                            </button>
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
