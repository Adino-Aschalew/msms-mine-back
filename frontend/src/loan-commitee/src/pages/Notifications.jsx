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
  ChevronRight
} from 'lucide-react';

const Notifications = () => {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
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

  const filters = [
    { value: 'all', label: 'All Notifications' },
    { value: 'new_request', label: 'New Requests' },
    { value: 'approved', label: 'Approvals' },
    { value: 'rejected', label: 'Rejections' },
    { value: 'suspended', label: 'Suspensions' },
    { value: 'disbursed', label: 'Disbursements' },
    { value: 'overdue', label: 'Overdue Payments' },
    { value: 'system', label: 'System Alerts' }
  ];

  // Dynamic list fetched from backend

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = selectedFilter === 'all' || notification.type === selectedFilter;
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const unreadCount = filteredNotifications.filter(n => !n.is_read).length;

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

  const handleClearNotifications = async () => {
    try {
      await Promise.all(notifications.map(n => notificationsAPI.deleteNotification(n.id)));
      setNotifications([]);
    } catch (error) {
      console.error('Error clearing notifications', error);
      fetchNotifications();
    }
  };

  const handleAction = (notification, action) => {
    console.log('Action clicked:', action, notification.id);
    
    // Mark as read when action is clicked
    handleMarkAsRead(notification.id);
    
    // Navigate based on notification type and action
    switch (action) {
      case 'View Details':
        handleViewDetails(notification);
        break;
      case 'Review':
        handleReview(notification);
        break;
      case 'Download Receipt':
        handleDownloadReceipt(notification);
        break;
      case 'Download':
        handleDownloadReport(notification);
        break;
      case 'Contact':
      case 'Contact Applicant':
        handleContact(notification);
        break;
      case 'View Profile':
        handleViewProfile(notification);
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  const handleViewDetails = (notification) => {
    if (notification.loanId) {
      // Navigate to loan details page
      navigate(`/loan-requests/${notification.loanId}`);
    } else if (notification.reportId) {
      // Navigate to report details page
      navigate(`/reports/${notification.reportId}`);
    } else {
      // Default navigation
      navigate('/dashboard');
    }
  };

  const handleReview = (notification) => {
    if (notification.loanId) {
      // Navigate to loan review page
      navigate(`/loan-requests/${notification.loanId}?action=review`);
    } else if (notification.user) {
      // Navigate to user profile for review
      navigate(`/account/profile?user=${notification.user}`);
    } else {
      // Default to dashboard
      navigate('/dashboard');
    }
  };

  const handleDownloadReceipt = (notification) => {
    if (notification.loanId) {
      console.log('Downloading receipt for loan:', notification.loanId);
      // In a real app, this would trigger a file download
      alert(`Downloading receipt for loan ${notification.loanId}`);
    }
  };

  const handleDownloadReport = (notification) => {
    if (notification.reportId) {
      console.log('Downloading report:', notification.reportId);
      // In a real app, this would trigger a file download
      alert(`Downloading report ${notification.reportId}`);
    }
  };

  const handleContact = (notification) => {
    if (notification.applicant || notification.user) {
      const person = notification.applicant || notification.user;
      console.log('Contacting:', person);
      // In a real app, this could open a contact modal or email client
      alert(`Contact ${person} regarding ${notification.loanId || 'this matter'}`);
    }
  };

  const handleViewProfile = (notification) => {
    if (notification.user) {
      // Navigate to user profile
      navigate(`/account/profile?user=${notification.user}`);
    } else if (notification.applicant) {
      // Navigate to applicant profile
      navigate(`/account/profile?user=${notification.applicant}`);
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'View Details': return <Eye className="w-3 h-3" />;
      case 'Review': return <FileText className="w-3 h-3" />;
      case 'Download Receipt':
      case 'Download': return <Download className="w-3 h-3" />;
      case 'Contact':
      case 'Contact Applicant': return <Mail className="w-3 h-3" />;
      case 'View Profile': return <User className="w-3 h-3" />;
      default: return <ChevronRight className="w-3 h-3" />;
    }
  };

  const getActionButtonClass = (action) => {
    switch (action) {
      case 'View Details': return 'bg-blue-600 hover:bg-blue-700 text-white';
      case 'Review': return 'bg-green-600 hover:bg-green-700 text-white';
      case 'Download Receipt':
      case 'Download': return 'bg-purple-600 hover:bg-purple-700 text-white';
      case 'Contact':
      case 'Contact Applicant': return 'bg-orange-600 hover:bg-orange-700 text-white';
      case 'View Profile': return 'bg-gray-600 hover:bg-gray-700 text-white';
      default: return 'bg-gray-600 hover:bg-gray-700 text-white';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Notifications</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">
                Stay updated with loan system alerts and activities
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3">
              <button
                onClick={handleMarkAllAsRead}
                className="btn bg-blue-600 text-white"
                disabled={unreadCount === 0}
              >
                <Check className="w-4 h-4 mr-2" />
                Mark All as Read
              </button>
              <button
                onClick={handleClearNotifications}
                className="bg-red-600 text-white btn"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 py-6">
        <div className="space-y-6">

      {/* Search and Filters */}
      <div className="card p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-secondary"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            <ChevronDown className={`w-4 h-4 ml-2 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setSelectedFilter(filter.value)}
                  className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                    selectedFilter === filter.value
                      ? 'bg-primary-100 text-primary-700 border-primary-300'
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

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredNotifications.length} notifications
          {unreadCount > 0 && (
            <span className="ml-2 text-primary-600 font-medium">
              ({unreadCount} unread)
            </span>
          )}
        </p>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.map((notification) => (
          <div
            key={notification.id}
            className={`card p-4 transition-all ${
                            !notification.is_read ? 'border-l-4 border-l-primary-500 bg-primary-50 dark:bg-primary-900/10' : ''
                          }`}
                        >
                          <div className="flex items-start space-x-4">
                            {/* Icon */}
                            <div className="p-2 rounded-lg text-primary-600 bg-primary-100 flex-shrink-0">
                              <Bell className="w-4 h-4" />
                            </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {notification.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {notification.message}
                    </p>
                    
                    {/* Additional Details */}
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 space-y-1">
                      {notification.loanId && (
                        <div>Loan ID: <span className="font-medium">{notification.loanId}</span></div>
                      )}
                      {notification.amount && (
                        <div>Amount: <span className="font-medium">${notification.amount.toLocaleString()}</span></div>
                      )}
                      {notification.applicant && (
                        <div>Applicant: <span className="font-medium">{notification.applicant}</span></div>
                      )}
                      {notification.department && (
                        <div>Department: <span className="font-medium">{notification.department}</span></div>
                      )}
                      {notification.reason && (
                        <div>Reason: <span className="font-medium">{notification.reason}</span></div>
                      )}
                      {notification.overdueAmount && (
                        <div>Overdue Amount: <span className="font-medium text-red-600">${notification.overdueAmount.toLocaleString()}</span></div>
                      )}
                      {notification.reportType && (
                        <div>Report Type: <span className="font-medium">{notification.reportType}</span></div>
                      )}
                    </div>
                    
                            <div className="flex items-center mt-3 space-x-4">
                                <span className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {new Date(notification.created_at).toLocaleString()}
                                </span>
                                {!notification.is_read && (
                                  <span className="text-xs font-medium text-primary-600">
                                    Unread
                                  </span>
                                )}
                              </div>
                            </div>
          
                            {/* Actions */}
                            <div className="flex flex-col items-end space-y-2 ml-4">
                              {!notification.is_read && (
                                <button
                                  onClick={() => handleMarkAsRead(notification.id)}
                                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                  title="Mark as read"
                                >
                                  <Check className="w-4 h-4 text-gray-400" />
                                </button>
                              )}
                    
                  <div className="flex flex-col space-y-1">
                                {(notification.actions || []).map((action, index) => (
                                  <button
                                    key={index}
                                    onClick={() => handleAction(notification, action)}
                                    className={`flex items-center space-x-1 px-3 py-1.5 text-xs rounded-lg transition-colors ${getActionButtonClass(action)}`}
                                  >
                                    {getActionIcon(action)}
                                    <span>{action}</span>
                                  </button>
                                ))}
                              </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredNotifications.length === 0 && (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No notifications found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {selectedFilter !== 'all' || searchTerm
              ? 'Try adjusting your search or filter criteria'
              : 'You\'re all caught up! No new notifications.'
            }
          </p>
        </div>
      )}

      {/* Notification Settings */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Notification Preferences
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">Email Notifications</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Receive notifications via email</p>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary-600">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6"></span>
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">Push Notifications</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Receive browser push notifications</p>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-1"></span>
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">Critical Alerts Only</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Only notify for urgent matters</p>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-1"></span>
            </button>
          </div>
        </div>
      </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
