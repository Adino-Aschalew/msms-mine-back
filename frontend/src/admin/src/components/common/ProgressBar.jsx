import React from 'react';

const ProgressBar = ({ label, value, color, max = 100, icon }) => {
  const getProgressColor = () => {
    switch (color) {
      case 'green':
        return 'bg-gradient-to-r from-green-400 to-green-600';
      case 'yellow':
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
      case 'red':
        return 'bg-gradient-to-r from-red-400 to-red-600';
      case 'blue':
        return 'bg-gradient-to-r from-blue-400 to-blue-600';
      case 'purple':
        return 'bg-gradient-to-r from-purple-400 to-purple-600';
      case 'orange':
        return 'bg-gradient-to-r from-orange-400 to-orange-600';
      default:
        return 'bg-gradient-to-r from-blue-400 to-blue-600';
    }
  };

  const getProgressBgColor = () => {
    switch (color) {
      case 'green':
        return 'bg-green-100 dark:bg-green-900/20';
      case 'yellow':
        return 'bg-yellow-100 dark:bg-yellow-900/20';
      case 'red':
        return 'bg-red-100 dark:bg-red-900/20';
      case 'blue':
        return 'bg-blue-100 dark:bg-blue-900/20';
      case 'purple':
        return 'bg-purple-100 dark:bg-purple-900/20';
      case 'orange':
        return 'bg-orange-100 dark:bg-orange-900/20';
      default:
        return 'bg-blue-100 dark:bg-blue-900/20';
    }
  };

  return (
    <div className="space-y-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
      <div className="flex justify-between items-center">
        <span className="font-medium text-gray-800 dark:text-gray-200 text-sm">{label}</span>
        <span className="text-xs font-bold text-gray-600 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded">
          {value}%
        </span>
      </div>
      <div className={`h-2 w-full rounded-full ${getProgressBgColor()} overflow-hidden`}>
        <div
          className={`h-2 rounded-full transition-all duration-700 ease-out ${getProgressColor()} shadow-lg`}
          style={{ width: `${Math.min(value, max)}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
