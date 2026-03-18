import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({ title, value, change, changeType, icon, color, trend }) => {
  const getIconBgColor = () => {
    switch (color) {
      case 'blue': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400';
      case 'red': return 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400';
      case 'green': return 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400';
      case 'purple': return 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400';
      case 'orange': return 'bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400';
      case 'yellow': return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getChangeColor = () => {
    return changeType === 'increase' ? 'text-green-600' : 'text-red-600';
  };

  const getChangeIcon = () => {
    return changeType === 'increase' ? TrendingUp : TrendingDown;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-200 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className={`rounded-lg p-3 ${getIconBgColor()}`}>
          <icon className="h-6 w-6" />
        </div>
        <div className={`flex items-center gap-1 text-sm font-medium ${getChangeColor()}`}>
          <getChangeIcon className="h-4 w-4" />
          {change}
        </div>
      </div>
      
      <div className="mb-4">
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
      </div>

      {/* Mini trend chart */}
      <div className="h-12 flex items-end gap-1">
        {trend.map((value, index) => (
          <div
            key={index}
            className="flex-1 bg-blue-500/20 dark:bg-blue-400/20 rounded-t"
            style={{ height: `${(value / Math.max(...trend)) * 100}%` }}
          />
        ))}
      </div>
    </div>
  );
};

export default StatCard;
