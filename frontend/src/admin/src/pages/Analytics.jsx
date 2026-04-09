import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Activity, Heart } from 'lucide-react';
import LineChart from '../components/charts/LineChart';
import PieChart from '../components/charts/PieChart';
import BarChart from '../components/charts/BarChart';
import { adminAPI } from '../../../shared/services/adminAPI';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('30days');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statsData, setStatsData] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      console.log('Fetching analytics data...');
      
      // Get real stats from the API
      const response = await adminAPI.getSystemStats();
      console.log('Analytics API response:', response);
      console.log('Response type:', typeof response);
      console.log('Response success:', response?.success);
      console.log('Response data:', response?.data);
      
      if (response && response.success && response.data) {
        console.log('Using real API data');
        setStatsData(response.data);
      } else {
        console.log('API returned non-success response, using minimal fallback');
        // Minimal fallback with proper structure for charts
        setStatsData({
          userStats: [],
          loanStats: [],
          savingsStats: [{ totalAccounts: 0, totalBalance: 0, avgBalance: 0 }],
          departmentStats: [],
          monthlyGrowth: []
        });
        setError('Unable to load analytics data');
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
      console.error('Error status:', err.response?.status);
      console.error('Error data:', err.response?.data);
      
      // Minimal fallback with proper structure
      setStatsData({
        userStats: [],
        loanStats: [],
        savingsStats: [{ totalAccounts: 0, totalBalance: 0, avgBalance: 0 }],
        departmentStats: [],
        monthlyGrowth: []
      });
      setError('Failed to load system analytics');
    } finally {
      setLoading(false);
    }
  };

  const getUserGrowthData = () => {
    if (!statsData?.monthlyGrowth || statsData.monthlyGrowth.length === 0) {
      // Return empty data structure if no data available
      return {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'New Users',
            data: [0, 0, 0, 0, 0, 0],
            borderColor: 'rgba(59, 130, 246, 1)',
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            tension: 0.6,
            fill: true,
            borderWidth: 3,
            pointRadius: 5,
            pointHoverRadius: 8,
            pointBackgroundColor: 'rgba(59, 130, 246, 1)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
          },
          {
            label: 'Active Users',
            data: [0, 0, 0, 0, 0, 0],
            borderColor: 'rgba(34, 197, 94, 1)',
            backgroundColor: 'rgba(34, 197, 94, 0.2)',
            tension: 0.6,
            fill: true,
            borderWidth: 3,
            pointRadius: 5,
            pointHoverRadius: 8,
            pointBackgroundColor: 'rgba(34, 197, 94, 1)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
          },
        ],
      };
    }
    
    // Backend returns data in descending order, so we need to reverse it for chronological display
    const sortedData = [...statsData.monthlyGrowth].reverse();
    
    // Format month names to be more readable
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const labels = sortedData.map(d => {
      const [year, month] = d.month.split('-');
      return monthNames[parseInt(month) - 1];
    });
    
    const newUsersData = sortedData.map(d => d.newUsers || 0);
    const activeUsersData = sortedData.map(d => d.activeUsers || 0);
    
    // Create responsive gradient function
    const createGradient = (ctx, chartArea, color1, color2) => {
      const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
      gradient.addColorStop(0, color1);
      gradient.addColorStop(0.5, color1.replace('0.1', '0.2'));
      gradient.addColorStop(1, color2);
      return gradient;
    };

    // Responsive point sizes based on screen width
    const getResponsivePointSize = () => {
      if (typeof window !== 'undefined') {
        if (window.innerWidth < 640) return 8; // Mobile
        if (window.innerWidth < 1024) return 6; // Tablet
        return 5; // Desktop
      }
      return 5;
    };

    const pointRadius = getResponsivePointSize();
    const pointHoverRadius = pointRadius + 3;

    return {
      labels,
      datasets: [
        {
          label: 'New Users',
          data: newUsersData,
          borderColor: 'rgba(59, 130, 246, 1)',
          backgroundColor: (context) => {
            const chart = context.chart;
            const {ctx, chartArea} = chart;
            if (!chartArea) return 'rgba(59, 130, 246, 0.2)';
            return createGradient(ctx, chartArea, 'rgba(59, 130, 246, 0.05)', 'rgba(59, 130, 246, 0.3)');
          },
          tension: 0.6, // Wave-like smooth curves
          fill: true,
          borderWidth: 3,
          pointRadius: pointRadius,
          pointHoverRadius: pointHoverRadius,
          pointBackgroundColor: 'rgba(59, 130, 246, 1)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(59, 130, 246, 1)',
          pointHoverBorderWidth: 3,
          // Touch-friendly interactions
          hitRadius: pointHoverRadius + 5,
          hoverBackgroundColor: 'rgba(59, 130, 246, 0.1)',
        },
        {
          label: 'Active Users',
          data: activeUsersData,
          borderColor: 'rgba(34, 197, 94, 1)',
          backgroundColor: (context) => {
            const chart = context.chart;
            const {ctx, chartArea} = chart;
            if (!chartArea) return 'rgba(34, 197, 94, 0.2)';
            return createGradient(ctx, chartArea, 'rgba(34, 197, 94, 0.05)', 'rgba(34, 197, 94, 0.3)');
          },
          tension: 0.6, // Wave-like smooth curves
          fill: true,
          borderWidth: 3,
          pointRadius: pointRadius,
          pointHoverRadius: pointHoverRadius,
          pointBackgroundColor: 'rgba(34, 197, 94, 1)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(34, 197, 94, 1)',
          pointHoverBorderWidth: 3,
          // Touch-friendly interactions
          hitRadius: pointHoverRadius + 5,
          hoverBackgroundColor: 'rgba(34, 197, 94, 0.1)',
        },
      ],
    };
  };

  const getRoleDistributionData = () => {
    if (!statsData?.userStats) return { labels: [], datasets: [] };
    
    const labels = statsData.userStats.map(s => s.role.replace('_', ' '));
    const data = statsData.userStats.map(s => s.count);

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: [
            'rgba(239, 68, 68, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(34, 197, 94, 0.8)',
            'rgba(168, 85, 247, 0.8)',
            'rgba(251, 146, 60, 0.8)'
          ],
          borderColor: [
            'rgba(239, 68, 68, 1)',
            'rgba(59, 130, 246, 1)',
            'rgba(34, 197, 94, 1)',
            'rgba(168, 85, 247, 1)',
            'rgba(251, 146, 60, 1)'
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  const getAdminActivityData = () => {
    if (!statsData?.userStats) return { labels: [], datasets: [] };
    
    // Filter for admin roles only
    const adminRoles = ['ADMIN', 'SUPER_ADMIN', 'HR', 'FINANCE_ADMIN', 'LOAN_COMMITTEE'];
    const adminStats = statsData.userStats.filter(s => adminRoles.includes(s.role));
    
    if (adminStats.length === 0) {
      return {
        labels: ['No Admin Data'],
        datasets: [{
          label: 'Admin Users',
          data: [0],
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1,
        }]
      };
    }
    
    const labels = adminStats.map(s => s.role.replace('_', ' '));
    const data = adminStats.map(s => s.count || 0);
    const activeData = adminStats.map(s => s.active || 0);

    return {
      labels,
      datasets: [
        {
          label: 'Total Admin Users',
          data,
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1,
        },
        {
          label: 'Active Admin Users',
          data: activeData,
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgba(34, 197, 94, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

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

  const totalUsersCount = statsData?.userStats?.reduce((acc, s) => acc + (s.count || 0), 0) || 0;
  const activeAdmins = statsData?.userStats?.filter(s => ['ADMIN', 'SUPER_ADMIN'].includes(s.role)).reduce((acc, s) => acc + (s.active || 0), 0) || 0;
  const totalActiveUsers = statsData?.userStats?.reduce((acc, s) => acc + (s.active || 0), 0) || 0;
  
  // Calculate activity rate properly
  const activityRate = totalUsersCount > 0 ? Math.round((totalActiveUsers / totalUsersCount) * 100) : 0;
  
  // Determine system health based on real data
  let systemHealthStatus = 'Warning';
  let statusText = 'Check Needed';
  if (totalActiveUsers > 0) {
    systemHealthStatus = 'Excellent';
    statusText = 'Operational';
  } else if (totalUsersCount > 0) {
    systemHealthStatus = 'Good';
    statusText = 'Stable';
  }

  console.log('System Health Calculations:', {
    totalUsersCount,
    totalActiveUsers,
    activeAdmins,
    activityRate,
    systemHealthStatus,
    userStats: statsData?.userStats
  });

  const analyticsCards = [
    {
      title: 'Total System Users',
      value: totalUsersCount.toLocaleString(),
      change: '+4.3%',
      icon: <Users className="h-6 w-6" />,
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
    },
    {
      title: 'Active Administrators',
      value: activeAdmins.toLocaleString(),
      change: '+2.1%',
      icon: <Activity className="h-6 w-6" />,
      color: 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
    },
    {
      title: 'Monthly New Users',
      value: statsData?.monthlyGrowth?.[0]?.newUsers?.toLocaleString() || '0',
      change: '+1.5%',
      icon: <TrendingUp className="h-6 w-6" />,
      color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'
    },
    {
      title: 'System Health',
      value: systemHealthStatus,
      change: statusText,
      icon: <Heart className="h-6 w-6" />,
      color: systemHealthStatus === 'Excellent' ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 
              systemHealthStatus === 'Good' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400' : 
              'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-800">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400">Track system performance and user behavior.</p>
      </div>

      {}
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

      {}
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
            {}
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

      {}
      <div className="card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">User Growth</h3>
          <div className="flex gap-2">
            {}
          </div>
        </div>
        <LineChart data={getUserGrowthData()} />
      </div>

      {}
      <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
        {}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">User Role Distribution</h3>
          <PieChart data={getRoleDistributionData()} />
        </div>

        {}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Admin Activity</h3>
          <BarChart data={getAdminActivityData()} />
        </div>
      </div>

      {}
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
