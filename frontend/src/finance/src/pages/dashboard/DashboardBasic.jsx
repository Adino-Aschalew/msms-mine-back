import React from 'react';

const DashboardBasic = () => {
  return (
    <div className="p-6 space-y-6">
      {}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard Overview
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Financial health overview and key metrics
        </p>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue</h3>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">$124,563</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">+12.5% vs last period</p>
        </div>
        
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Expenses</h3>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">$89,432</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">+8.2% vs last period</p>
        </div>
        
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Net Profit</h3>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">$35,131</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">+18.7% vs last period</p>
        </div>
      </div>

      {}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Dashboard is Working!
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          If you can see this content with the header and sidebar, the layout is working correctly.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Current time: {new Date().toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default DashboardBasic;
