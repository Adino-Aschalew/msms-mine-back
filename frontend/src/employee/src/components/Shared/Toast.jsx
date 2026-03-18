import React, { useEffect } from 'react';
import { FiCheck, FiX, FiAlertCircle, FiAlertTriangle, FiInfo } from 'react-icons/fi';

const Toast = ({ 
  type = 'info', 
  message, 
  duration = 5000, 
  onClose, 
  persistent = false 
}) => {
  useEffect(() => {
    if (!persistent && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose, persistent]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FiCheck className="w-5 h-5" />;
      case 'error':
        return <FiX className="w-5 h-5" />;
      case 'warning':
        return <FiAlertTriangle className="w-5 h-5" />;
      case 'info':
      default:
        return <FiInfo className="w-5 h-5" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-success-100 text-success-800 border-success-200 dark:bg-success-900 dark:text-success-200 dark:border-success-800';
      case 'error':
        return 'bg-danger-100 text-danger-800 border-danger-200 dark:bg-danger-900 dark:text-danger-200 dark:border-danger-800';
      case 'warning':
        return 'bg-warning-100 text-warning-800 border-warning-200 dark:bg-warning-900 dark:text-warning-200 dark:border-warning-800';
      case 'info':
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-800';
    }
  };

  return (
    <div className={`
      max-w-sm w-full rounded-lg border p-4 shadow-lg
      transform transition-all duration-300 ease-in-out
      ${getStyles()}
    `}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium">
            {message}
          </p>
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={onClose}
            className="inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
          >
            <span className="sr-only">Dismiss</span>
            <FiX className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toast;
