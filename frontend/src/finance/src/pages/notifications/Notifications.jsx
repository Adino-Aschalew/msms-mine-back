import React, { useState } from 'react';
import { Bell, CheckCircle, AlertCircle, Info, X, Settings, Filter, Search, Trash2, Mail, Smartphone, Globe, Clock, TrendingUp, DollarSign, Users } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const Notifications = () => {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [activeTab, setActiveTab] = useState('notifications');

  const notifications = [
    {
      id: 1,
      title: 'Budget Alert: Marketing Budget',
      message: 'Marketing budget has reached 85% of allocated amount',
      type: 'warning',
      category: 'budget',
      timestamp: '2024-03-15 10:30 AM',
      read: false,
      priority: 'high',
      icon: AlertCircle,
      actionUrl: '/budgets'
    },
    {
      id: 2,
      title: 'Invoice Payment Received',
      message: 'Tech Solutions Inc. paid invoice INV-2024-001 ($15,000)',
      type: 'success',
      category: 'invoice',
      timestamp: '2024-03-15 09:45 AM',
      read: false,
      priority: 'medium',
      icon: CheckCircle,
      actionUrl: '/invoices'
    },
    {
      id: 3,
      title: 'Payroll Import Completed',
      message: 'March payroll data has been successfully processed',
      type: 'success',
      category: 'payroll',
      timestamp: '2024-03-15 08:20 AM',
      read: true,
      priority: 'medium',
      icon: CheckCircle,
      actionUrl: '/payroll/import'
    },
    {
      id: 4,
      title: 'System Maintenance Scheduled',
      message: 'System will be down for maintenance on March 20, 2024',
      type: 'info',
      category: 'system',
      timestamp: '2024-03-14 04:15 PM',
      read: true,
      priority: 'low',
      icon: Info,
      actionUrl: null
    },
    {
      id: 5,
      title: 'Overdue Invoice Alert',
      message: 'Invoice INV-2024-003 is 5 days overdue ($25,000)',
      type: 'error',
      category: 'invoice',
      timestamp: '2024-03-14 02:30 PM',
      read: false,
      priority: 'high',
      icon: AlertCircle,
      actionUrl: '/invoices'
    },
    {
      id: 6,
      title: 'New User Registration',
      message: 'David Kim has been added as a Viewer role',
      type: 'info',
      category: 'user',
      timestamp: '2024-03-14 11:00 AM',
      read: true,
      priority: 'low',
      icon: Users,
      actionUrl: '/users'
    },
    {
      id: 7,
      title: 'Monthly Report Available',
      message: 'February financial report is ready for review',
      type: 'info',
      category: 'report',
      timestamp: '2024-03-13 03:45 PM',
      read: true,
      priority: 'medium',
      icon: TrendingUp,
      actionUrl: '/reports'
    },
    {
      id: 8,
      title: 'Expense Limit Warning',
      message: 'Operations expenses exceeded monthly budget by 8%',
      type: 'warning',
      category: 'expense',
      timestamp: '2024-03-13 01:20 PM',
      read: true,
      priority: 'medium',
      icon: AlertCircle,
      actionUrl: '/expenses'
    }
  ];

  const notificationSettings = [
    {
      id: 1,
      category: 'Budget Alerts',
      description: 'Notifications for budget thresholds and warnings',
      icon: DollarSign,
      email: true,
      push: true,
      inApp: true,
      frequency: 'immediate'
    },
    {
      id: 2,
      category: 'Invoice Updates',
      description: 'Payment received and overdue invoice notifications',
      icon: TrendingUp,
      email: true,
      push: false,
      inApp: true,
      frequency: 'immediate'
    },
    {
      id: 3,
      category: 'Payroll Processing',
      description: 'Payroll import and processing status updates',
      icon: Users,
      email: false,
      push: true,
      inApp: true,
      frequency: 'immediate'
    },
    {
      id: 4,
      category: 'System Updates',
      description: 'Maintenance schedules and system notifications',
      icon: Settings,
      email: true,
      push: false,
      inApp: true,
      frequency: 'daily'
    },
    {
      id: 5,
      category: 'User Management',
      description: 'New user registrations and role changes',
      icon: Users,
      email: false,
      push: false,
      inApp: true,
      frequency: 'immediate'
    },
    {
      id: 6,
      category: 'Report Generation',
      description: 'Monthly and quarterly report availability',
      icon: TrendingUp,
      email: true,
      push: false,
      inApp: true,
      frequency: 'weekly'
    }
  ];

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || notification.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || 
                         (selectedStatus === 'read' && notification.read) ||
                         (selectedStatus === 'unread' && !notification.read);
    return matchesSearch && matchesType && matchesStatus;
  });

  const getTypeColor = (type) => {
    switch (type) {
      case 'success': return 'green';
      case 'warning': return 'yellow';
      case 'error': return 'red';
      case 'info': return 'blue';
      default: return 'gray';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'success': return CheckCircle;
      case 'warning': return AlertCircle;
      case 'error': return AlertCircle;
      case 'info': return Info;
      default: return Bell;
    }
  };

  const markAsRead = (id) => {
    // Implementation for marking notification as read
    console.log('Mark as read:', id);
  };

  const deleteNotification = (id) => {
    // Implementation for deleting notification
    console.log('Delete notification:', id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Notifications
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Manage system notifications and alerts
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{notifications.length}</p>
            </div>
            <Bell className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Unread</p>
              <p className="text-2xl font-bold text-blue-600">{notifications.filter(n => !n.read).length}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today</p>
              <p className="text-2xl font-bold text-green-600">{notifications.filter(n => n.timestamp.includes('2024-03-15')).length}</p>
            </div>
            <Clock className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Priority</p>
              <p className="text-2xl font-bold text-orange-600">{notifications.filter(n => n.priority === 'high').length}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'notifications'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Bell className="h-4 w-4 mr-2 inline" />
            Notifications
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'settings'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Settings className="h-4 w-4 mr-2 inline" />
            Settings
          </button>
        </div>
      </div>

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <>
          {/* Controls */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Types</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
                <option value="info">Info</option>
              </select>
              
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="read">Read</option>
                <option value="unread">Unread</option>
              </select>
              
              <button className="flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-md transition-colors">
                <Filter className="h-4 w-4 mr-2" />
                Advanced Filter
              </button>
              <button className="flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-md transition-colors">
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </button>
              <button className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors">
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark All Read
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="divide-y divide-gray-200">
              {filteredNotifications.map((notification) => {
                const Icon = notification.icon;
                const typeColor = getTypeColor(notification.type);
                
                return (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full ${
                        typeColor === 'green' ? 'bg-green-100' :
                        typeColor === 'yellow' ? 'bg-yellow-100' :
                        typeColor === 'red' ? 'bg-red-100' :
                        typeColor === 'blue' ? 'bg-blue-100' :
                        'bg-gray-100'
                      }`}>
                        <Icon className={`h-5 w-5 ${
                          typeColor === 'green' ? 'text-green-600' :
                          typeColor === 'yellow' ? 'text-yellow-600' :
                          typeColor === 'red' ? 'text-red-600' :
                          typeColor === 'blue' ? 'text-blue-600' :
                          'text-gray-600'
                        }`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className={`text-sm font-medium text-gray-900 ${
                            !notification.read ? 'font-semibold' : ''
                          }`}>
                            {notification.title}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              notification.priority === 'high' ? 'bg-red-100 text-red-800' :
                              notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {notification.priority}
                            </span>
                            <span className="text-xs text-gray-500">
                              {notification.timestamp}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className={`text-xs px-2 py-1 rounded ${
                            typeColor === 'green' ? 'bg-green-100 text-green-800' :
                            typeColor === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                            typeColor === 'red' ? 'bg-red-100 text-red-800' :
                            typeColor === 'blue' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {notification.category}
                          </span>
                          <div className="flex space-x-2">
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="text-blue-600 hover:text-blue-900 text-xs"
                              >
                                Mark as read
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="text-red-600 hover:text-red-900 text-xs"
                            >
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
          </div>
        </>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Notification Settings
          </h2>
          <div className="space-y-4">
            {notificationSettings.map((setting) => {
              const Icon = setting.icon;
              return (
                <div key={setting.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5 text-gray-600" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{setting.category}</h3>
                      <p className="text-xs text-gray-500">{setting.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input type="checkbox" checked={setting.email} className="mr-2" readOnly />
                      <span className="text-sm text-gray-600">Email</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" checked={setting.push} className="mr-2" readOnly />
                      <span className="text-sm text-gray-600">Push</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" checked={setting.inApp} className="mr-2" readOnly />
                      <span className="text-sm text-gray-600">In-App</span>
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
