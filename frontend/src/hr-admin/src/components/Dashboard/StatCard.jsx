import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const StatCard = ({ title, value, change, changeType, icon, color }) => {
  const getChangeIcon = () => {
    if (changeType === 'increase') return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (changeType === 'decrease') return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-600" />;
  };

  const getChangeColor = () => {
    if (changeType === 'increase') return 'text-green-600';
    if (changeType === 'decrease') return 'text-red-600';
    return 'text-gray-600';
  };

  const getIconBgColor = () => {
    switch (color) {
      case 'blue':
        return 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400';
      case 'green':
        return 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400';
      case 'purple':
        return 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all duration-200 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">{title}</p>
          <p className="mt-3 text-4xl font-bold text-gray-900 dark:text-white">{value}</p>
          <div className="mt-3 flex items-center gap-2">
            {getChangeIcon()}
            <span className={`text-sm font-medium ${getChangeColor()}`}>
              {change}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">from last month</span>
          </div>
        </div>
        <div className={`rounded-xl p-4 ${getIconBgColor()} ml-4`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
