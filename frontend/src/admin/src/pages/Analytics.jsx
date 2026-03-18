import React, { useState } from 'react';
import { TrendingUp, Users, Activity, Zap } from 'lucide-react';
import LineChart from '../components/charts/LineChart';
import PieChart from '../components/charts/PieChart';
import BarChart from '../components/charts/BarChart';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('30days');

  const getUserGrowthData = () => {
    let labels, data;
    
    if (timeRange === '7days') {
      labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      data = [245, 252, 248, 255, 261, 268, 272, 278, 285];
    } else if (timeRange === '30days') {
      labels = Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`);
      data = Array.from({ length: 30 }, () => Math.floor(Math.random() * 50) + 240);
    } else if (timeRange === 'year') {
      labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      data = [2200, 2280, 2350, 2420, 2480, 2550, 2620, 2680, 2750, 2820, 2890, 2950, 3020];
    } else {
      labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      data = Array.from({ length: 30 }, () => Math.floor(Math.random() * 50) + 240);
    }

    return {
      labels,
      datasets: [
        {
          label: 'New Users',
          data: data,
          borderColor: 'rgba(59, 130, 246, 1)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true,
        },
        {
          label: 'Active Users',
          data: data.map(val => val + Math.floor(Math.random() * 200) + 200),
          borderColor: 'rgba(34, 197, 94, 1)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          tension: 0.4,
          fill: true,
        },
      ],
    };
  };

  const getRoleDistributionData = () => ({
    labels: ['Super Admins', 'Admins', 'Moderators', 'Users'],
    datasets: [
      {
        data: [5, 15, 25, 55],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(168, 85, 247, 0.8)'
        ],
        borderColor: [
          'rgba(239, 68, 68, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(168, 85, 247, 1)'
        ],
        borderWidth: 1,
      },
    ],
  });

  const getAdminActivityData = () => ({
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Admin Actions',
        data: [45, 52, 38, 65, 48, 32, 28],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  });

  const getSystemPerformanceData = () => ({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Response Time (ms)',
        data: [120, 115, 125, 110, 108, 105],
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'CPU Usage (%)',
        data: [65, 68, 62, 70, 58, 55],
        borderColor: 'rgba(34, 197, 94, 1)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  });

  const analyticsCards = [
    {
      title: 'Total Users',
      value: '24,567',
      change: '+12.5%',
      icon: <Users className="h-6 w-6" />,
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
    },
    {
      title: 'Active Sessions',
      value: '1,234',
      change: '+8.2%',
      icon: <Activity className="h-6 w-6" />,
      color: 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
    },
    {
      title: 'Growth Rate',
      value: '23.4%',
      change: '+3.1%',
      icon: <TrendingUp className="h-6 w-6" />,
      color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'
    },
    {
      title: 'System Health',
      value: '98.5%',
      change: '+0.5%',
      icon: <Zap className="h-6 w-6" />,
      color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400">Track system performance and user behavior.</p>
      </div>

      {/* Date Range Selector */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTimeRange('7days')}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            timeRange === '7days' 
              ? 'bg-blue-600 text-white shadow-md' 
              : 'bg-white dark:bg-gray-800 text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          Last 7 Days
        </button>
        <button
          onClick={() => setTimeRange('30days')}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            timeRange === '30days' 
              ? 'bg-blue-600 text-white shadow-md' 
              : 'bg-white dark:bg-gray-800 text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          Last 30 Days
        </button>
        <button
          onClick={() => setTimeRange('year')}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            timeRange === 'year' 
              ? 'bg-blue-600 text-white shadow-md' 
              : 'bg-white dark:bg-gray-800 text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          Last Year
        </button>
      </div>

      {/* Analytics Cards */}
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {analyticsCards.map((card, index) => (
          <div key={index} className="card p-8 transition-all hover:shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{card.title}</p>
                <p className="text-4xl font-bold text-gray-900 dark:text-white leading-tight">{card.value}</p>
                <div className="mt-3 flex items-center gap-2">
                  <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                    card.change.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>{card.change}</span>
                  <span className="text-sm text-gray-500">from last month</span>
                </div>
              </div>
              <div className={`rounded-2xl p-4 ${card.color}`}>
                {card.icon}
              </div>
            </div>
            {/* Enhanced Details Section */}
            {card.details && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-2 gap-6 text-sm">
                  {Object.entries(card.details).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400 capitalize">{key}:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* User Growth Chart */}
      <div className="card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">User Growth</h3>
          <div className="flex gap-2">
            {/* Date range buttons are already in the main selector above */}
          </div>
        </div>
        <LineChart data={getUserGrowthData()} />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
        {/* User Role Distribution */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">User Role Distribution</h3>
          <PieChart data={getRoleDistributionData()} />
        </div>

        {/* Admin Activity */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Admin Activity</h3>
          <BarChart data={getAdminActivityData()} />
        </div>
      </div>

      {/* System Performance */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">System Performance</h3>
        <LineChart 
          data={getSystemPerformanceData()} 
          options={{
            plugins: {
              legend: {
                display: true,
                position: 'bottom'
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  borderDash: [5, 5]
                }
              }
            }
          }}
        />
      </div>
    </div>
  );
};

export default Analytics;
