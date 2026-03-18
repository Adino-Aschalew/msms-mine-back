import React from 'react';

const ProgressBar = ({
  value = 0,
  max = 100,
  size = 'md',
  variant = 'primary',
  showLabel = false,
  showPercentage = false,
  animated = false,
  className = '',
  ...props
}) => {
  const percentage = Math.min((value / max) * 100, 100);

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
    xl: 'h-4',
  };

  const variantClasses = {
    primary: 'bg-primary-600',
    success: 'bg-success-600',
    danger: 'bg-danger-600',
    warning: 'bg-warning-600',
    info: 'bg-blue-600',
    gray: 'bg-gray-600',
  };

  const containerClasses = `
    w-full bg-gray-200 rounded-full dark:bg-gray-700
    ${sizeClasses[size]}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  const barClasses = `
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    rounded-full transition-all duration-300 ease-out
    ${animated ? 'animate-pulse' : ''}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className="w-full">
      {(showLabel || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {showLabel && (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Progress
            </span>
          )}
          {showPercentage && (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {percentage.toFixed(1)}%
            </span>
          )}
        </div>
      )}
      
      <div className={containerClasses} {...props}>
        <div
          className={barClasses}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
      
      {showLabel && (
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {value} / {max}
          </span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
