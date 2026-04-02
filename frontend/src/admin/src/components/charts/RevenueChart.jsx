import React from 'react';
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react';

const RevenueChart = ({ data, dateRange }) => {
  const totalRevenue = data?.revenue?.reduce((sum, item) => sum + item.value, 0) || 0;
  const totalExpenses = data?.expenses?.reduce((sum, item) => sum + item.value, 0) || 0;
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue vs Expenses</h2>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">Revenue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">Expenses</span>
          </div>
        </div>
      </div>

      {}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
          <p className="text-xl font-bold text-green-600">${totalRevenue.toLocaleString()}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Expenses</p>
          <p className="text-xl font-bold text-red-600">${totalExpenses.toLocaleString()}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">Net Profit</p>
          <p className={`text-xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${netProfit.toLocaleString()}
          </p>
        </div>
      </div>

      {}
      <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Interactive chart visualization</p>
          <p className="text-xs">Revenue and expense trends over {dateRange}</p>
        </div>
      </div>

      {}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Profit Margin</span>
          <span className={`text-sm font-bold ${profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {profitMargin}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700 mt-2">
          <div 
            className={`h-2 rounded-full ${profitMargin >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
            style={{ width: `${Math.abs(profitMargin)}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default RevenueChart;
