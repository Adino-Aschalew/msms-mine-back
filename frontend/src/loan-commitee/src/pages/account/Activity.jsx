import React, { useState, useEffect } from 'react';
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
import { committeeAPI } from '../../services/committeeAPI';

const Activity = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [showFilters, setShowFilters] = useState(false);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchActivities();
  }, [selectedPeriod, selectedFilter]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Activity endpoint not implemented yet - skip API call
      // TODO: Uncomment when backend endpoint is ready
      /*
      const params = {
        period: selectedPeriod,
        type: selectedFilter === 'all' ? undefined : selectedFilter
      };
      
      const response = await committeeAPI.getRecentActivity(params);
      if (response.data?.success && response.data?.data) {
        setActivities(response.data.data);
      } else {
        setActivities([]);
      }
      */
      
      // Temporary: Use empty array until endpoint is implemented
      setActivities([]);
      
    } catch (error) {
      console.log('Activity endpoint not available:', error.message);
      // Activity endpoint not implemented yet - show empty state instead of error
      setActivities([]);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

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
    try {
      // Create CSV content from filtered activities
      const headers = [
        'Timestamp',
        'Type',
        'Action',
        'Description',
        'User',
        'IP Address',
        'Device',
        'Details'
      ];
      
      const csvContent = [
        headers.join(','),
        ...filteredActivities.map(activity => {
          const details = activity.details 
            ? JSON.stringify(activity.details).replace(/"/g, '""')
            : '';
          
          return [
            `"${formatTimestamp(activity.timestamp)}"`,
            `"${activity.type}"`,
            `"${activity.action}"`,
            `"${activity.description}"`,
            `"${activity.user}"`,
            `"${activity.ip}"`,
            `"${activity.device}"`,
            `"${details}"`
          ].join(',');
        })
      ].join('\n');
      
      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      // Generate filename with current date
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD format
      const filename = `activity-log-${dateStr}.csv`;
      
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Show success message
      console.log('Activity log exported successfully');
      
      // Optional: Show a success notification
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2';
      successMessage.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span>Activity log exported successfully!</span>
      `;
      document.body.appendChild(successMessage);
      
      // Remove success message after 3 seconds
      setTimeout(() => {
        document.body.removeChild(successMessage);
      }, 3000);
      
    } catch (error) {
      console.error('Error exporting activity log:', error);
      
      // Show error message
      const errorMessage = document.createElement('div');
      errorMessage.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2';
      errorMessage.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
        <span>Failed to export activity log</span>
      `;
      document.body.appendChild(errorMessage);
      
      // Remove error message after 3 seconds
      setTimeout(() => {
        document.body.removeChild(errorMessage);
      }, 3000);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/50 dark:from-gray-900 dark:via-blue-900/10 dark:to-indigo-900/10 p-6">
      {}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Account Activity</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Monitor your account activity and system interactions
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              onClick={handleExportActivity}
              className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm"
            >
              <Download className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" />
              <span className="text-gray-700 dark:text-gray-300 font-medium">Export Activity</span>
            </button>
          </div>
        </div>

        {}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </div>

            {}
            <div className="flex gap-3">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white font-medium"
              >
                {periods.map(period => (
                  <option key={period.value} value={period.value}>{period.label}</option>
                ))}
              </select>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                  showFilters 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' 
                    : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                <ChevronDown className={`w-4 h-4 ml-2 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {filters.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setSelectedFilter(filter.value)}
                    className={`px-4 py-2 text-sm rounded-xl font-medium transition-all duration-200 ${
                      selectedFilter === filter.value
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                        : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
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
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {loading ? 'Loading activities...' : `Showing ${filteredActivities.length} activities`}
          </p>
        </div>

        {}
        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">Loading activities...</p>
          </div>
        ) : error ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-12 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Error loading activities
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <button onClick={fetchActivities} className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium">
              Try Again
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {filteredActivities.map((activity) => (
                <div key={activity.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 hover:shadow-2xl transition-all duration-300">
                  <div className="flex items-start space-x-4">
                    {}
                    <div className="flex-shrink-0">
                      <div className={`p-3 rounded-xl ${
                        activity.type === 'loan' ? 'bg-blue-100 dark:bg-blue-900/30' :
                        activity.type === 'security' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                        activity.type === 'login' ? 'bg-green-100 dark:bg-green-900/30' :
                        'bg-gray-100 dark:bg-gray-700'
                      }`}>
                        {getActivityIcon(activity.type, activity.action)}
                      </div>
                    </div>

                    {}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {activity.description}
                            </h4>
                            <span className={`text-xs px-3 py-1 rounded-full font-medium ${getActivityColor(activity.type)}`}>
                              {activity.type}
                            </span>
                          </div>
                          
                          <div className="space-y-3">
                            {}
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                              <span className="flex items-center">
                                <Clock className="w-4 h-4 mr-2" />
                                {formatTimestamp(activity.timestamp)}
                              </span>
                              <span className="flex items-center">
                                <User className="w-4 h-4 mr-2" />
                                {activity.user}
                              </span>
                              <span className="flex items-center">
                                <Calendar className="w-4 h-4 mr-2" />
                                {activity.ip}
                              </span>
                            </div>

                            {}
                            <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-2 inline-block">
                              <span className="font-medium">Device:</span> {activity.device}
                            </div>

                            {}
                            {activity.details && (
                              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mt-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                  {Object.entries(activity.details).map(([key, value]) => (
                                    <div key={key} className="flex justify-between items-center">
                                      <span className="text-gray-600 dark:text-gray-400 font-medium capitalize">
                                        {key.replace(/_/g, ' ')}:
                                      </span>
                                      <span className="font-semibold text-gray-900 dark:text-gray-100">
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
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clock className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  No activity found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                  {selectedFilter !== 'all' || searchTerm
                    ? 'Try adjusting your search or filter criteria to see more results.'
                    : 'No activity recorded in the selected period. Check back later for updates.'
                  }
                </p>
              </div>
            )}
          </>
        )}

        {}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Activity Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 text-center border border-blue-200 dark:border-blue-800">
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {activities.filter(a => a.type === 'loan').length}
              </p>
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Loan Actions</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-6 text-center border border-green-200 dark:border-green-800">
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                {activities.filter(a => a.type === 'login').length}
              </p>
              <p className="text-sm font-medium text-green-700 dark:text-green-300">Login Events</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-xl p-6 text-center border border-yellow-200 dark:border-yellow-800">
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">
                {activities.filter(a => a.type === 'security').length}
              </p>
              <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Security Events</p>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-600/50 rounded-xl p-6 text-center border border-gray-200 dark:border-gray-600">
              <p className="text-3xl font-bold text-gray-600 dark:text-gray-400 mb-2">
                {activities.filter(a => a.type === 'system').length}
              </p>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">System Events</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Activity;
