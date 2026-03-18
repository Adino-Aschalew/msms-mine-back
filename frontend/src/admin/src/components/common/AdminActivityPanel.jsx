import React from 'react';
import { Settings, Trash2, UserPlus, Activity } from 'lucide-react';

const AdminActivityPanel = ({ activities }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'settings_updated':
        return <Settings className="h-4 w-4 text-purple-600" />;
      case 'user_deleted':
        return <Trash2 className="h-4 w-4 text-red-600" />;
      case 'admin_added':
        return <UserPlus className="h-4 w-4 text-green-600" />;
      default:
        return <Activity className="h-4 w-4 text-blue-600" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'settings_updated':
        return 'bg-purple-100 dark:bg-purple-900/20';
      case 'user_deleted':
        return 'bg-red-100 dark:bg-red-900/20';
      case 'admin_added':
        return 'bg-green-100 dark:bg-green-900/20';
      default:
        return 'bg-blue-100 dark:bg-blue-900/20';
    }
  };

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Admin Activity</h3>
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
    </div>
  );
};

export default AdminActivityPanel;
