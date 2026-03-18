import React from 'react';

const StatCard = ({ title, value, change, changeType, icon, color = 'primary' }) => {
  const colorClasses = {
    primary: 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400',
    success: 'bg-success-100 text-success-600 dark:bg-success-900 dark:text-success-400',
    warning: 'bg-warning-100 text-warning-600 dark:bg-warning-900 dark:text-warning-400',
    danger: 'bg-danger-100 text-danger-600 dark:bg-danger-900 dark:text-danger-400',
  };

  const changeColorClasses = {
    positive: 'text-success-600 dark:text-success-400',
    negative: 'text-danger-600 dark:text-danger-400',
    neutral: 'text-gray-600 dark:text-gray-400',
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">{value}</p>
          {change && (
            <div className={`flex items-center mt-2 text-sm ${changeColorClasses[changeType]}`}>
              <span>{change}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
