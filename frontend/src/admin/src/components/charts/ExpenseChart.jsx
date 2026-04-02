import React from 'react';
import { PieChart, TrendingUp } from 'lucide-react';

const ExpenseChart = ({ categories }) => {
  const totalExpenses = categories?.reduce((sum, cat) => sum + cat.value, 0) || 0;

  const colors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6b7280'
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Expense Breakdown</h2>
        <button className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
          View Details
        </button>
      </div>

      {}
      <div className="h-48 flex items-center justify-center text-gray-500 dark:text-gray-400 mb-6">
        <div className="text-center">
          <PieChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Interactive pie chart</p>
          <p className="text-xs">Expense category distribution</p>
        </div>
      </div>

      {}
      <div className="space-y-3">
        {categories?.map((category, index) => (
          <div key={category.name} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <span className="text-sm font-medium text-gray-900 dark:text-white">{category.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                ${category.value.toLocaleString()}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-500">
                ({category.percentage}%)
              </span>
            </div>
          </div>
        ))}
      </div>

      {}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Expenses</span>
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            ${totalExpenses.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ExpenseChart;
