import React, { useState } from 'react';

const Tabs = ({
  tabs,
  defaultTab = 0,
  onChange,
  variant = 'default',
  className = '',
  ...props
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleTabChange = (index) => {
    setActiveTab(index);
    if (onChange) {
      onChange(index, tabs[index]);
    }
  };

  const baseClasses = 'flex space-x-1';
  
  const variantClasses = {
    default: 'border-b border-gray-200 dark:border-gray-700',
    pills: '',
    cards: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4',
  };

  const tabClasses = {
    default: (isActive) => `
      py-4 px-1 border-b-2 font-medium text-sm transition-colors
      ${isActive
        ? 'border-primary-500 text-primary-600 dark:text-primary-400'
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
      }
    `,
    pills: (isActive) => `
      py-2 px-4 text-sm font-medium rounded-md transition-colors
      ${isActive
        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300'
      }
    `,
    cards: (isActive) => `
      p-4 border rounded-lg cursor-pointer transition-colors
      ${isActive
        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-400'
        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
      }
    `,
  };

  const classes = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div {...props}>
      {/* Tab Navigation */}
      <nav className={classes}>
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => handleTabChange(index)}
            className={tabClasses[variant](activeTab === index)}
          >
            {variant === 'cards' ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  {tab.icon && <tab.icon className="w-5 h-5" />}
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">
                    {tab.title}
                  </h3>
                </div>
                {tab.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {tab.description}
                  </p>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                {tab.icon && <tab.icon className="w-4 h-4" />}
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </div>
            )}
          </button>
        ))}
      </nav>

      {/* Tab Content */}
      <div className="mt-6">
        {tabs[activeTab]?.content}
      </div>
    </div>
  );
};

export default Tabs;
