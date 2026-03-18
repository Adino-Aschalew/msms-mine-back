import React from 'react';
import { UserPlus, Settings, UserCheck, Clock } from 'lucide-react';

const ActivityFeed = ({ activities }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'admin_added':
        return <UserPlus className="h-4 w-4 text-blue-600" />;
      case 'user_registered':
        return <UserCheck className="h-4 w-4 text-green-600" />;
      case 'settings_updated':
        return <Settings className="h-4 w-4 text-purple-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'admin_added':
        return 'bg-blue-100 dark:bg-blue-900/20';
      case 'user_registered':
        return 'bg-green-100 dark:bg-green-900/20';
      case 'settings_updated':
        return 'bg-purple-100 dark:bg-purple-900/20';
      default:
        return 'bg-gray-100 dark:bg-gray-900/20';
    }
  };

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <div key={index} className="flex gap-3">
          <div className={`flex h-8 w-8 items-center justify-center rounded-full ${getActivityColor(activity.type)}`}>
            {getActivityIcon(activity.type)}
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-900 dark:text-white">{activity.text}</p>
            <p className="text-xs text-gray-500">{activity.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityFeed;
