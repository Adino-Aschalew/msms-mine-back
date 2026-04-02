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
      primary: 'bg-primary-100 text-primary-600',
      success: 'bg-success-100 text-success-600',
      warning: 'bg-warning-100 text-warning-600',
      danger: 'bg-danger-100 text-danger-600',
    };
    return colors[color] || colors.primary;
  };

  return (
    <div className="stat-card">
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">{title}</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1 truncate">{value}</p>
          {change && (
            <div className={`flex items-center mt-1 sm:mt-2 flex-wrap gap-1 ${getTrendColor()}`}>
              {getTrendIcon()}
              <span className="text-xs sm:text-sm font-medium">{change}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">vs last month</span>
            </div>
          )}
        </div>
        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center shrink-0 ${getIconBgColor()}`}>
          {React.cloneElement(icon, { className: "w-5 h-5 sm:w-6 sm:h-6" })}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
