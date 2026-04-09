import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationsAPI } from '../../../shared/services/notificationsAPI';
import {
  Bell,
  CheckCircle,
  XCircle,
  AlertTriangle,
  DollarSign,
  FileText,
  Calendar,
  Filter,
  Trash2,
  Check,
  Search,
  ChevronDown,
  Clock,
  Eye,
  ExternalLink,
  User,
  CreditCard,
  TrendingUp,
  Shield,
  Mail,
  Phone,
  Download,
  Star,
  Award,
  Activity,
  Settings,
  HelpCircle,
  Info,
  ChevronRight,
  X,
  MoreVertical,
  Archive,
  Settings2,
  Volume2,
  VolumeX,
  RefreshCw,
  Loader2
} from 'lucide-react';

const Notifications = () => {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showPreferences, setShowPreferences] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [notifications, setNotifications] = useState([]);
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: false,
    criticalAlertsOnly: false,
    soundEnabled: true,
    digestMode: false
  });

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

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setTimeout(() => setRefreshing(false), 500);
  };

  const filterCategories = [
    { value: 'all', label: 'All Notifications', icon: Bell, count: null },
    { value: 'new_request', label: 'New Requests', icon: FileText, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { value: 'approved', label: 'Approvals', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100' },
    { value: 'rejected', label: 'Rejections', icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-100' },
    { value: 'suspended', label: 'Suspensions', icon: AlertTriangle, color: 'text-amber-600', bgColor: 'bg-amber-100' },
    { value: 'disbursed', label: 'Disbursements', icon: DollarSign, color: 'text-purple-600', bgColor: 'bg-purple-100' },
    { value: 'overdue', label: 'Overdue', icon: Clock, color: 'text-red-600', bgColor: 'bg-red-100' },
    { value: 'system', label: 'System', icon: Settings, color: 'text-gray-600', bgColor: 'bg-gray-100' }
  ];

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = selectedFilter === 'all' || notification.type === selectedFilter;
    const matchesSearch = notification.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const filteredUnreadCount = filteredNotifications.filter(n => !n.is_read).length;

  const getNotificationStats = () => {
    const stats = {};
    filterCategories.forEach(cat => {
      if (cat.value !== 'all') {
        stats[cat.value] = notifications.filter(n => n.type === cat.value && !n.is_read).length;
      }
    });
    return stats;
  };

  const notificationStats = getNotificationStats();

  const handleMarkAsRead = async (id) => {
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

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, is_read: true }))
      );
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  const handleArchive = async (id) => {
    try {
      await notificationsAPI.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Failed to archive notification', error);
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      try {
        await Promise.all(notifications.map(n => notificationsAPI.deleteNotification(n.id)));
        setNotifications([]);
      } catch (error) {
        console.error('Error clearing notifications', error);
      }
    }
  };

  const handleAction = (notification, action) => {
    handleMarkAsRead(notification.id);
    
    switch (action) {
      case 'View Details':
        navigate(notification.loanId ? `/loan-requests/${notification.loanId}` : '/dashboard');
        break;
      case 'Review':
        navigate(notification.loanId ? `/loan-requests/${notification.loanId}?action=review` : '/dashboard');
        break;
      case 'Download Receipt':
      case 'Download':
        alert(`Downloading ${notification.loanId ? 'receipt for loan ' + notification.loanId : 'report'}`);
        break;
      case 'Contact':
      case 'Contact Applicant':
        alert(`Contact ${notification.applicant || notification.user || 'applicant'}`);
        break;
      case 'View Profile':
        navigate(`/account/profile?user=${notification.user || notification.applicant}`);
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  const getNotificationIcon = (type) => {
    const category = filterCategories.find(c => c.value === type);
    return category ? category.icon : Bell;
  };

  const getNotificationColors = (type) => {
    const colors = {
      new_request: { icon: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-500' },
      approved: { icon: 'text-green-600', bg: 'bg-green-100', border: 'border-green-500' },
      rejected: { icon: 'text-red-600', bg: 'bg-red-100', border: 'border-red-500' },
      suspended: { icon: 'text-amber-600', bg: 'bg-amber-100', border: 'border-amber-500' },
      disbursed: { icon: 'text-purple-600', bg: 'bg-purple-100', border: 'border-purple-500' },
      overdue: { icon: 'text-red-600', bg: 'bg-red-100', border: 'border-red-500' },
      system: { icon: 'text-gray-600', bg: 'bg-gray-100', border: 'border-gray-500' }
    };
    return colors[type] || colors.system;
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
                  <Bell className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Notifications</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : "You're all caught up!"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => setShowPreferences(!showPreferences)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Preferences"
              >
                <Settings2 className="w-5 h-5" />
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span className="hidden sm:inline">Mark all read</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Categories</h3>
              </div>
              <nav className="p-2 space-y-1">
                {filterCategories.map((filter) => {
                  const Icon = filter.icon;
                  const count = filter.value === 'all' ? unreadCount : notificationStats[filter.value] || 0;
                  
                  return (
                    <button
                      key={filter.value}
                      onClick={() => setSelectedFilter(filter.value)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedFilter === filter.value
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className={`w-4 h-4 ${filter.color || 'text-gray-500'}`} />
                        <span>{filter.label}</span>
                      </div>
                      {count > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Quick Stats Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mt-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Overview</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{notifications.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Unread</span>
                  <span className="font-semibold text-blue-600">{unreadCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Today</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {notifications.filter(n => new Date(n.created_at).toDateString() === new Date().toDateString()).length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-4">
            {/* Search and Filter Bar */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center space-x-2 px-4 py-2.5 border rounded-lg transition-colors ${
                      showFilters
                        ? 'border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Filter className="w-4 h-4" />
                    <span>Filters</span>
                    <ChevronDown className={`w-4 h-4 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                  </button>
                  {notifications.length > 0 && (
                    <button
                      onClick={handleClearAll}
                      className="p-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Clear all notifications"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded Filters */}
              {showFilters && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex flex-wrap gap-2">
                    {filterCategories.slice(1).map((filter) => (
                      <button
                        key={filter.value}
                        onClick={() => setSelectedFilter(filter.value)}
                        className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                          selectedFilter === filter.value
                            ? `${filter.bgColor} ${filter.color} border-transparent`
                            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Notifications List */}
            {loading ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12">
                <div className="flex flex-col items-center justify-center">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">Loading notifications...</p>
                </div>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12">
                <div className="flex flex-col items-center justify-center">
                  <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                    <Bell className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    No notifications found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
                    {searchTerm || selectedFilter !== 'all'
                      ? 'Try adjusting your search or filter criteria to see more results.'
                      : "You're all caught up! Check back later for new notifications."
                    }
                  </p>
                  {(searchTerm || selectedFilter !== 'all') && (
                    <button
                      onClick={() => { setSearchTerm(''); setSelectedFilter('all'); }}
                      className="mt-4 px-4 py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredNotifications.map((notification) => {
                  const colors = getNotificationColors(notification.type);
                  const Icon = getNotificationIcon(notification.type);
                  
                  return (
                    <div
                      key={notification.id}
                      onClick={() => setSelectedNotification(notification)}
                      className={`group bg-white dark:bg-gray-800 rounded-xl shadow-sm border transition-all cursor-pointer hover:shadow-md ${
                        !notification.is_read 
                          ? `border-l-4 ${colors.border} bg-blue-50/50 dark:bg-blue-900/5` 
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <div className="p-4 sm:p-5">
                        <div className="flex items-start space-x-4">
                          {/* Icon */}
                          <div className={`p-2.5 rounded-xl flex-shrink-0 ${colors.bg}`}>
                            <Icon className={`w-5 h-5 ${colors.icon}`} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className={`text-sm font-semibold ${!notification.is_read ? 'text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'}`}>
                                    {notification.title}
                                  </h4>
                                  {!notification.is_read && (
                                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                  {notification.message}
                                </p>

                                {/* Metadata */}
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-gray-500 dark:text-gray-400">
                                  <span className="flex items-center">
                                    <Clock className="w-3.5 h-3.5 mr-1" />
                                    {formatTimeAgo(notification.created_at)}
                                  </span>
                                  {notification.loanId && (
                                    <span className="flex items-center">
                                      <FileText className="w-3.5 h-3.5 mr-1" />
                                      Loan #{notification.loanId}
                                    </span>
                                  )}
                                  {notification.amount && (
                                    <span className="flex items-center font-medium text-gray-700 dark:text-gray-300">
                                      <DollarSign className="w-3.5 h-3.5 mr-1" />
                                      ${notification.amount.toLocaleString()}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {!notification.is_read && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleMarkAsRead(notification.id); }}
                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                    title="Mark as read"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleArchive(notification.id); }}
                                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                  title="Archive"
                                >
                                  <Archive className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            {(notification.actions || []).length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-3">
                                {notification.actions.map((action, index) => (
                                  <button
                                    key={index}
                                    onClick={(e) => { e.stopPropagation(); handleAction(notification, action); }}
                                    className="px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                  >
                                    {action}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Results Summary */}
            {!loading && filteredNotifications.length > 0 && (
              <div className="text-center text-sm text-gray-600 dark:text-gray-400 py-4">
                Showing {filteredNotifications.length} of {notifications.length} notifications
                {filteredUnreadCount > 0 && ` • ${filteredUnreadCount} unread`}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notification Detail Modal */}
      {selectedNotification && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedNotification(null)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-xl ${getNotificationColors(selectedNotification.type).bg}`}>
                    {React.createElement(getNotificationIcon(selectedNotification.type), {
                      className: `w-5 h-5 ${getNotificationColors(selectedNotification.type).icon}`
                    })}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{selectedNotification.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatTimeAgo(selectedNotification.created_at)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedNotification(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {selectedNotification.message}
              </p>

              {/* Details */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2 mb-4">
                {selectedNotification.loanId && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Loan ID</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">#{selectedNotification.loanId}</span>
                  </div>
                )}
                {selectedNotification.amount && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Amount</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      ${selectedNotification.amount.toLocaleString()}
                    </span>
                  </div>
                )}
                {selectedNotification.applicant && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Applicant</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedNotification.applicant}</span>
                  </div>
                )}
                {selectedNotification.department && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Department</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedNotification.department}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                {(selectedNotification.actions || []).map((action, index) => (
                  <button
                    key={index}
                    onClick={() => { handleAction(selectedNotification, action); setSelectedNotification(null); }}
                    className="flex-1 min-w-[120px] px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    {action}
                  </button>
                ))}
                <button
                  onClick={() => setSelectedNotification(null)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preferences Panel */}
      {showPreferences && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowPreferences(false)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Notification Preferences</h3>
                <button
                  onClick={() => setShowPreferences(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {[
                  { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive notifications via email', icon: Mail },
                  { key: 'pushNotifications', label: 'Push Notifications', description: 'Browser push notifications', icon: Bell },
                  { key: 'criticalAlertsOnly', label: 'Critical Alerts Only', description: 'Only urgent notifications', icon: AlertTriangle },
                  { key: 'soundEnabled', label: 'Sound Alerts', description: 'Play sound for new notifications', icon: Volume2 }
                ].map(({ key, label, description, icon: Icon }) => (
                  <div key={key} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{label}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setPreferences(prev => ({ ...prev, [key]: !prev[key] }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        preferences[key] ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        preferences[key] ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowPreferences(false)}
                className="w-full mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
