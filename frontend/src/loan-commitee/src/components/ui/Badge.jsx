import React from 'react';
import clsx from 'clsx';

const Badge = ({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  className = '',
  ...props 
}) => {
  const variants = {
    primary: 'bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-300',
    secondary: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    success: 'bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-300',
    warning: 'bg-warning-100 text-warning-800 dark:bg-warning-900/20 dark:text-warning-300',
    danger: 'bg-danger-100 text-danger-800 dark:bg-danger-900/20 dark:text-danger-300',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
  };

  const sizes = {
    small: 'px-2 py-0.5 text-xs',
    medium: 'px-2.5 py-0.5 text-sm',
    large: 'px-3 py-1 text-base'
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full font-medium',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
