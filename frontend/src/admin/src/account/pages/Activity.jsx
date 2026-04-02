import React, { useState } from 'react';
import { 
  LogIn, 
  LogOut, 
  Key, 
  User, 
  Settings, 
  Shield,
  Calendar,
  Filter
} from 'lucide-react';

const Activity = () => {
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState('30days');

  const activities = [
    {
      id: 1,
      type: 'login',
      action: 'Logged in to account',
      timestamp: '2024-03-15 10:30:00',
      ip: '192.168.1.1',
      location: 'New York, USA',
      device: 'Chrome on Windows'
    },
    {
      id: 2,
      type: 'password_change',
      action: 'Changed password',
      timestamp: '2024-03-14 15:45:00',
      ip: '192.168.1.1',
      location: 'New York, USA',
      device: 'Chrome on Windows'
    },
    {
      id: 3,
      type: 'profile_update',
      action: 'Updated profile information',
      timestamp: '2024-03-13 09:20:00',
      ip: '192.168.1.2',
      location: 'Los Angeles, USA',
      device: 'Safari on iPhone'
    },
    {
      id: 4,
      type: 'login',
      action: 'Logged in to account',
      timestamp: '2024-03-12 14:15:00',
      ip: '192.168.1.2',
      location: 'Los Angeles, USA',
      device: 'Safari on iPhone'
    },
    {
      id: 5,
      type: 'security_setting',
      action: 'Enabled two-factor authentication',
      timestamp: '2024-03-11 11:00:00',
      ip: '192.168.1.1',
      location: 'New York, USA',
      device: 'Chrome on Windows'
    },
    {
      id: 6,
      type: 'login',
      action: 'Logged in to account',
      timestamp: '2024-03-10 08:30:00',
      ip: '192.168.1.3',
      location: 'Chicago, USA',
      device: 'Firefox on Mac'
    },
    {
      id: 7,
      type: 'profile_update',
      action: 'Updated email address',
      timestamp: '2024-03-09 16:20:00',
      ip: '192.168.1.1',
      location: 'New York, USA',
      device: 'Chrome on Windows'
    },
    {
      id: 8,
      type: 'login',
      action: 'Logged in to account',
      timestamp: '2024-03-08 13:45:00',
      ip: '192.168.1.4',
      location: 'London, UK',
      device: 'Edge on Windows'
    },
    {
      id: 9,
      type: 'password_change',
      action: 'Changed password',
      timestamp: '2024-03-07 10:00:00',
      ip: '192.168.1.1',
      location: 'New York, USA',
      device: 'Chrome on Windows'
    },
    {
      id: 10,
      type: 'login',
      action: 'Logged in to account',
      timestamp: '2024-03-06 09:15:00',
      ip: '192.168.1.5',
      location: 'Tokyo, Japan',
      device: 'Chrome on Android'
    }
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'login':
        return <LogIn className="h-4 w-4 text-green-600" />;
      case 'logout':
        return <LogOut className="h-4 w-4 text-red-600" />;
      case 'password_change':
        return <Key className="h-4 w-4 text-blue-600" />;
      case 'profile_update':
        return <User className="h-4 w-4 text-purple-600" />;
      case 'security_setting':
        return <Shield className="h-4 w-4 text-yellow-600" />;
      default:
        return <Settings className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'login':
        return 'bg-green-100 dark:bg-green-900/20';
      case 'logout':
        return 'bg-red-100 dark:bg-red-900/20';
      case 'password_change':
        return 'bg-blue-100 dark:bg-blue-900/20';
      case 'profile_update':
        return 'bg-purple-100 dark:bg-purple-900/20';
      case 'security_setting':
        return 'bg-yellow-100 dark:bg-yellow-900/20';
      default:
        return 'bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getTimeAgo = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now - date;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
  };

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true;
    return activity.type === filter;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Account Activity</h1>
        <p className="text-gray-600 dark:text-gray-400">View your account activity history and login logs.</p>
      </div>

      {}
      <div className="card p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters:</span>
          </div>
          
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input text-sm"
            >
              <option value="all">All Activities</option>
              <option value="login">Logins</option>
              <option value="password_change">Password Changes</option>
              <option value="profile_update">Profile Updates</option>
              <option value="security_setting">Security Settings</option>
            </select>
            
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="input text-sm"
            >
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="90days">Last 90 days</option>
              <option value="all">All time</option>
            </select>
          </div>
        </div>
      </div>

      {}
      <div className="card">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Activity Timeline
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Showing {filteredActivities.length} activities
          </p>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredActivities.map((activity, index) => (
            <div key={activity.id} className="p-6">
              <div className="flex gap-4">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full ${getActivityColor(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {activity.action}
                      </h3>
                      <div className="mt-1 space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="h-3 w-3" />
                          <span>{formatTimestamp(activity.timestamp)}</span>
                          <span className="text-gray-400">•</span>
                          <span>{getTimeAgo(activity.timestamp)}</span>
                        </div>
                        
                        <div className="text-sm text-gray-500">
                          <span>IP: {activity.ip}</span>
                          <span className="mx-2">•</span>
                          <span>{activity.location}</span>
                          <span className="mx-2">•</span>
                          <span>{activity.device}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredActivities.length === 0 && (
          <div className="p-12 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              No activities found
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Try adjusting your filters to see more activities.
            </p>
          </div>
        )}
      </div>

      {}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-3 dark:bg-green-900/20">
              <LogIn className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Logins</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {activities.filter(a => a.type === 'login').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/20">
              <Key className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Password Changes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {activities.filter(a => a.type === 'password_change').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900/20">
              <User className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Profile Updates</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {activities.filter(a => a.type === 'profile_update').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-yellow-100 p-3 dark:bg-yellow-900/20">
              <Shield className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Security Changes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {activities.filter(a => a.type === 'security_setting').length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Activity;
