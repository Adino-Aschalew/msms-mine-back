import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const StatCard = ({ title, value, change, changeType, icon, color = 'primary' }) => {
  const getTrendIcon = () => {
    if (changeType === 'increase') return <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />;
    if (changeType === 'decrease') return <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />;
    return <Minus className="w-3 h-3 sm:w-4 sm:h-4" />;
  };

  const getTrendColor = () => {
    if (changeType === 'increase') return 'text-success-600';
    if (changeType === 'decrease') return 'text-danger-600';
    return 'text-gray-600';
  };

  const getIconBgColor = () => {
    const colors = {
      primary: 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300',
      success: 'bg-success-100 text-success-600 dark:bg-success-900 dark:text-success-300',
      warning: 'bg-warning-100 text-warning-600 dark:bg-warning-900 dark:text-warning-300',
      danger: 'bg-danger-100 text-danger-600 dark:bg-danger-900 dark:text-danger-300',
    };
    return colors[color] || colors.primary;
  };

  const getStatusColor = () => {
    if (changeType === 'increase') return 'text-green-600 dark:text-green-400';
    if (changeType === 'decrease') return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  return (
    <div className="stat-card bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700">
      <div className="flex items-start justify-between gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 sm:mb-2 leading-tight">
            {title}
          </p>
          <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3 break-words">
            {value}
          </p>
          {change && (
            <div className={`flex items-center gap-1.5 sm:gap-2 ${getTrendColor()}`}>
              <div className={`p-1 rounded-full ${getStatusColor()}`}>
                {getTrendIcon()}
              </div>
              <div className="flex flex-col sm:flex-col sm:items-start gap-0.5">
                <span className="text-xs sm:text-sm font-semibold">{change}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  vs last month
                </span>
              </div>
            </div>
          )}
        </div>
        <div className={`w-8 h-8 sm:w-10 sm:h-12 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center shrink-0 ${getIconBgColor()}`}>
          {React.cloneElement(icon, { className: "w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" })}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
