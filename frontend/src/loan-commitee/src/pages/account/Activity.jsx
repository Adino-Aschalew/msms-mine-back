import React, { useState } from 'react';
import {
  Clock,
  Search,
  Filter,
  Calendar,
  User,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  DollarSign,
  Settings,
  Shield,
  ChevronDown,
  Download
} from 'lucide-react';

const Activity = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [showFilters, setShowFilters] = useState(false);

  const filters = [
    { value: 'all', label: 'All Activities' },
    { value: 'login', label: 'Login Activity' },
    { value: 'loan', label: 'Loan Actions' },
    { value: 'security', label: 'Security Events' },
    { value: 'system', label: 'System Events' }
  ];

  const periods = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'Last Week' },
    { value: 'month', label: 'Last Month' },
    { value: 'year', label: 'Last Year' }
  ];

  const activities = [
    {
      id: 1,
      type: 'loan',
      action: 'loan_approved',
      description: 'Approved loan request LN-2024-002 for Jane Smith',
      timestamp: '2024-03-15 14:30:00',
      ip: '192.168.1.100',
      device: 'Chrome on Windows',
      user: 'John Committee',
      details: {
        loanId: 'LN-2024-002',
        amount: '$8,000',
        employee: 'Jane Smith',
        department: 'Marketing'
      }
    },
    {
      id: 2,
      type: 'loan',
      action: 'loan_reviewed',
      description: 'Reviewed loan request LN-2024-001 from John Doe',
      timestamp: '2024-03-15 13:45:00',
      ip: '192.168.1.100',
      device: 'Chrome on Windows',
      user: 'John Committee',
      details: {
        loanId: 'LN-2024-001',
        amount: '$15,000',
        employee: 'John Doe',
        department: 'Engineering'
      }
    },
    {
      id: 3,
      type: 'security',
      action: 'password_changed',
      description: 'Changed account password',
      timestamp: '2024-03-15 12:00:00',
      ip: '192.168.1.100',
      device: 'Chrome on Windows',
      user: 'John Committee',
      details: {
        method: 'web',
        strength: 'strong'
      }
    },
    {
      id: 4,
      type: 'login',
      action: 'login_success',
      description: 'Successfully logged in to the system',
      timestamp: '2024-03-15 09:00:00',
      ip: '192.168.1.100',
      device: 'Chrome on Windows',
      user: 'John Committee',
      details: {
        method: 'password',
        location: 'New York, NY'
      }
    },
    {
      id: 5,
      type: 'loan',
      action: 'loan_rejected',
      description: 'Rejected loan request LN-2024-004 for Sarah Williams',
      timestamp: '2024-03-14 16:20:00',
      ip: '192.168.1.100',
      device: 'Chrome on Windows',
      user: 'John Committee',
      details: {
        loanId: 'LN-2024-004',
        amount: '$12,000',
        employee: 'Sarah Williams',
        reason: 'Insufficient savings balance'
      }
    },
    {
      id: 6,
      type: 'system',
      action: 'settings_updated',
      description: 'Updated loan system settings',
      timestamp: '2024-03-14 11:30:00',
      ip: '192.168.1.100',
      device: 'Chrome on Windows',
      user: 'John Committee',
      details: {
        setting: 'Maximum loan amount',
        oldValue: '$45,000',
        newValue: '$50,000'
      }
    },
    {
      id: 7,
      type: 'security',
      action: 'two_factor_enabled',
      description: 'Enabled two-factor authentication',
      timestamp: '2024-03-13 15:45:00',
      ip: '192.168.1.100',
      device: 'Chrome on Windows',
      user: 'John Committee',
      details: {
        method: 'authenticator_app'
      }
    },
    {
      id: 8,
      type: 'loan',
      action: 'disbursement_processed',
      description: 'Processed loan disbursement for LN-2024-001',
      timestamp: '2024-03-13 10:15:00',
      ip: '192.168.1.100',
      device: 'Chrome on Windows',
      user: 'John Committee',
      details: {
        loanId: 'LN-2024-001',
        amount: '$15,000',
        employee: 'John Doe',
        method: 'bank_transfer'
      }
    },
    {
      id: 9,
      type: 'login',
      action: 'login_failed',
      description: 'Failed login attempt detected',
      timestamp: '2024-03-12 18:30:00',
      ip: '192.168.1.250',
      device: 'Unknown',
      user: 'Unknown',
      details: {
        reason: 'invalid_credentials',
        attempts: 3
      }
    },
    {
      id: 10,
      type: 'system',
      action: 'report_generated',
      description: 'Generated monthly loan report',
      timestamp: '2024-03-10 14:00:00',
      ip: '192.168.1.100',
      device: 'Chrome on Windows',
      user: 'John Committee',
      details: {
        reportType: 'monthly_summary',
        period: 'February 2024',
        format: 'PDF'
      }
    }
  ];

  const filteredActivities = activities.filter(activity => {
    const matchesFilter = selectedFilter === 'all' || activity.type === selectedFilter;
    const matchesSearch = activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.user.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getActivityIcon = (type, action) => {
    if (type === 'loan') {
      if (action === 'loan_approved') return <CheckCircle className="w-4 h-4 text-success-600" />;
      if (action === 'loan_rejected') return <XCircle className="w-4 h-4 text-danger-600" />;
      return <FileText className="w-4 h-4 text-primary-600" />;
    }
    if (type === 'security') {
      if (action === 'login_failed') return <AlertTriangle className="w-4 h-4 text-warning-600" />;
      return <Shield className="w-4 h-4 text-warning-600" />;
    }
    if (type === 'login') {
      if (action === 'login_failed') return <XCircle className="w-4 h-4 text-danger-600" />;
      return <User className="w-4 h-4 text-success-600" />;
    }
    if (type === 'system') {
      return <Settings className="w-4 h-4 text-gray-600" />;
    }
    return <Clock className="w-4 h-4 text-gray-600" />;
  };

  const getActivityColor = (type) => {
    const colors = {
      loan: 'bg-primary-100 text-primary-700',
      security: 'bg-warning-100 text-warning-700',
      login: 'bg-success-100 text-success-700',
      system: 'bg-gray-100 text-gray-700'
    };
    return colors[type] || colors.system;
  };

  const handleExportActivity = () => {
    console.log('Exporting activity log');
    // Implementation for exporting activity log
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Account Activity</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View your account activity and system interactions
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={handleExportActivity}
            className="btn btn-secondary"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Activity
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>

          {/* Period Filter */}
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="input w-auto"
          >
            {periods.map(period => (
              <option key={period.value} value={period.value}>{period.label}</option>
            ))}
          </select>

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
          Showing {filteredActivities.length} activities
        </p>
      </div>

      {/* Activity Timeline */}
      <div className="space-y-4">
        {filteredActivities.map((activity) => (
          <div key={activity.id} className="card p-4">
            <div className="flex items-start space-x-4">
              {/* Activity Icon */}
              <div className="flex-shrink-0">
                <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  {getActivityIcon(activity.type, activity.action)}
                </div>
              </div>

              {/* Activity Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        {activity.description}
                      </h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${getActivityColor(activity.type)}`}>
                        {activity.type}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      {/* Basic Info */}
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatTimestamp(activity.timestamp)}
                        </span>
                        <span className="flex items-center">
                          <User className="w-3 h-3 mr-1" />
                          {activity.user}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {activity.ip}
                        </span>
                      </div>

                      {/* Device Info */}
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Device: {activity.device}
                      </div>

                      {/* Activity Details */}
                      {activity.details && (
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mt-2">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            {Object.entries(activity.details).map(([key, value]) => (
                              <div key={key} className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400 capitalize">
                                  {key.replace(/_/g, ' ')}:
                                </span>
                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                  {typeof value === 'object' ? JSON.stringify(value) : value}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredActivities.length === 0 && (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No activity found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {selectedFilter !== 'all' || searchTerm
              ? 'Try adjusting your search or filter criteria'
              : 'No activity recorded in the selected period.'
            }
          </p>
        </div>
      )}

      {/* Activity Statistics */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Activity Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-primary-600">
              {activities.filter(a => a.type === 'loan').length}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Loan Actions</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-success-600">
              {activities.filter(a => a.type === 'login').length}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Login Events</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-warning-600">
              {activities.filter(a => a.type === 'security').length}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Security Events</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-gray-600">
              {activities.filter(a => a.type === 'system').length}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">System Events</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Activity;
