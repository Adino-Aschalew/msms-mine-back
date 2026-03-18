import React, { useState } from 'react';
import { 
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  BarChart3,
  Calendar,
  Download,
  Filter
} from 'lucide-react';

const FinanceAnalytics = () => {
  const [dateRange, setDateRange] = useState('30days');
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  // Mock analytics data
  const metrics = [
    {
      id: 'revenue',
      name: 'Revenue Growth',
      value: '$847,250',
      change: '+12.5%',
      trend: 'up',
      data: [65000, 72000, 68000, 75000, 82000, 78000, 85000]
    },
    {
      id: 'expenses',
      name: 'Expense Analysis',
      value: '$523,180',
      change: '+8.2%',
      trend: 'up',
      data: [45000, 48000, 46000, 52000, 49000, 51000, 53000]
    },
    {
      id: 'payroll',
      name: 'Payroll Trends',
      value: '$185,750',
      change: '+5.3%',
      trend: 'up',
      data: [17000, 17200, 17500, 17800, 18000, 18300, 18500]
    },
    {
      id: 'savings',
      name: 'Savings Contributions',
      value: '$42,340',
      change: '+18.7%',
      trend: 'up',
      data: [3500, 3700, 3600, 3900, 4100, 4000, 4200]
    }
  ];

  const expenseCategories = [
    { name: 'Salaries', value: 350000, percentage: 65 },
    { name: 'Office Rent', value: 75000, percentage: 14 },
    { name: 'Marketing', value: 45000, percentage: 8 },
    { name: 'Software', value: 30000, percentage: 6 },
    { name: 'Utilities', value: 15000, percentage: 3 },
    { name: 'Other', value: 18180, percentage: 4 }
  ];

  const MetricCard = ({ metric }) => {
    const TrendIcon = metric.trend === 'up' ? TrendingUp : TrendingDown;
    const trendColor = metric.trend === 'up' ? 'text-green-600' : 'text-red-600';
    
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{metric.name}</h3>
          <div className={`flex items-center gap-1 text-sm font-medium ${trendColor}`}>
            <TrendIcon className="h-4 w-4" />
            {metric.change}
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{metric.value}</p>
        </div>

        {/* Mini chart */}
        <div className="h-16 flex items-end gap-1">
          {metric.data.map((value, index) => (
            <div
              key={index}
              className="flex-1 bg-blue-500/20 dark:bg-blue-400/20 rounded-t"
              style={{ height: `${(value / Math.max(...metric.data)) * 100}%` }}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Financial Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400">Advanced financial insights and trends</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
            <button
              onClick={() => setDateRange('7days')}
              className={`px-3 py-2 text-sm font-medium rounded-l-lg transition-colors ${
                dateRange === '7days' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setDateRange('30days')}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                dateRange === '30days' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setDateRange('quarter')}
              className={`px-3 py-2 text-sm font-medium rounded-r-lg transition-colors ${
                dateRange === 'quarter' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              Quarter
            </button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 rounded-lg text-sm font-medium text-white hover:bg-blue-600">
            <Download className="h-4 w-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue vs Expenses Trend */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue vs Expenses Trend</h2>
            <button className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
              View Details
            </button>
          </div>
          <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Interactive chart visualization</p>
              <p className="text-sm">Revenue and expense trends over time</p>
            </div>
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Expense Breakdown</h2>
            <button className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
              View Details
            </button>
          </div>
          <div className="space-y-3">
            {expenseCategories.map((category, index) => (
              <div key={category.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ 
                    backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6b7280'][index] 
                  }} />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{category.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">${category.value.toLocaleString()}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-500">({category.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cash Flow Analysis */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Cash Flow Analysis</h2>
          <div className="flex items-center gap-2">
            <button className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
              Monthly View
            </button>
            <button className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
              Quarterly View
            </button>
          </div>
        </div>
        <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Cash flow visualization</p>
            <p className="text-sm">Monthly cash inflow and outflow trends</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceAnalytics;
