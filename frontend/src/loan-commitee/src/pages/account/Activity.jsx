import React, { useState, useEffect } from 'react';
import { committeeAPI } from '../../services/committeeAPI';
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

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, [selectedFilter, selectedPeriod, searchTerm]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const params = {
        type: selectedFilter,
        period: selectedPeriod,
        search: searchTerm
      };
      const res = await committeeAPI.getActivityLog(params);
      if (res.success && res.data) {
        setActivities(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredActivities = activities; // Filtering is handled by backend now

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
    
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="space-y-6">
      {}
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

      {}
      <div className="card p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {}
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

          {}
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="input w-auto"
          >
            {periods.map(period => (
              <option key={period.value} value={period.value}>{period.label}</option>
            ))}
          </select>

          {}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-secondary"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            <ChevronDown className={`w-4 h-4 ml-2 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {}
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

      {}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredActivities.length} activities
        </p>
      </div>

      {}
      <div className="space-y-4">
        {filteredActivities.map((activity) => (
          <div key={activity.id} className="card p-4">
            <div className="flex items-start space-x-4">
              {}
              <div className="flex-shrink-0">
                <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  {getActivityIcon(activity.type, activity.action)}
                </div>
              </div>

              {}
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
                      {}
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

                      {}
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Device: {activity.device}
                      </div>

                      {}
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

      {}
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

      {}
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
