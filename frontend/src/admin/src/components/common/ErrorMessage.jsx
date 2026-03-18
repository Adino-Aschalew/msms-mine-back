import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

const ErrorMessage = ({ 
  message = 'Failed to load data', 
  onRetry, 
  showRetry = true,
  variant = 'default' 
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'inline':
        return 'text-sm p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'card':
        return 'card p-6 text-center';
      default:
        return 'text-center py-12';
    }
  };

  const getIconSize = () => {
    switch (variant) {
      case 'inline':
        return 'h-4 w-4';
      case 'card':
        return 'h-8 w-8';
      default:
        return 'h-12 w-12';
    }
  };

  return (
    <div className={getVariantStyles()}>
      <div className="flex items-center gap-3">
        {variant !== 'inline' && (
          <div className={`mx-auto rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center ${
            variant === 'card' ? 'h-16 w-16 mb-4' : 'mb-4'
          }`}>
            <AlertTriangle className={`${getIconSize()} text-red-600 dark:text-red-400`} />
          </div>
        )}
        
        <div className={variant === 'inline' ? 'flex-1' : ''}>
          {variant !== 'inline' && (
            <h3 className={`font-semibold text-gray-900 dark:text-white mb-2 ${
              variant === 'card' ? 'text-lg' : 'text-xl'
            }`}>
              Error
            </h3>
          )}
          
          <p className={`${variant === 'inline' ? '' : 'text-gray-600 dark:text-gray-400 mb-6'}`}>
            {message}
          </p>
          
          {showRetry && onRetry && (
            <div className={variant === 'inline' ? '' : 'space-y-2'}>
              <button
                onClick={onRetry}
                className={`btn-primary flex items-center justify-center gap-2 ${
                  variant === 'inline' ? 'text-sm' : 'w-full'
                }`}
              >
                <RefreshCw className="h-4 w-4" />
                Retry
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;
