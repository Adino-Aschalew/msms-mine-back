import React, { useState, useEffect } from 'react';
import { Users, UserPlus, TrendingUp, Calendar } from 'lucide-react';
import StatCard from '../components/Dashboard/StatCard';
import PieChart from '../components/charts/PieChart';
import LineChart from '../components/charts/LineChart';
import BarChart from '../components/charts/BarChart';
import ProgressBar from '../components/common/ProgressBar';
import ActivityFeed from '../components/Dashboard/ActivityFeed';
import { hrAPI } from '../../../shared/services/hrAPI';
import { useAuth } from '../../../shared/contexts/AuthContext';

const DashboardPage = () => {
  const formatCompactNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'METB';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'KETB';
    }
    return num.toString();
  };

  const [dateRange, setDateRange] = useState('30days');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching HR dashboard stats...');
      const response = await hrAPI.getDashboardStats();
      console.log('HR dashboard response:', response);
      
      const stats = response?.success ? response.data : (response?.data || response);
      console.log('Parsed stats:', stats);
      setDashboardData(stats || {});
    } catch (err) {
      console.error('HR Dashboard error:', err);
      console.error('Error response:', err.response);
      console.error('Error status:', err.response?.status);
      console.error('Error data:', err.response?.data);
      
      // Check if it's an authentication error
      if (err.message?.includes('Invalid token') || err.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
        // Redirect to login after a short delay
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        return;
      }
      
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch HR dashboard data. Please try again.';
      setError(errorMessage);
      
      setDashboardData({
        totalEmployees: 0,
        activeEmployees: 0,
        terminated: 0,
        pendingApprovals: 0,
        employeeGrowthRate: 0,
        terminatedRate: 0,
        activeRate: 0,
        departmentData: [],
        attendanceData: [],
        diversityData: []
      });
    } finally {
      setLoading(false);
    }
  };

  
  const statsData = [
    {
      title: 'Total Employees',
      value: formatCompactNumber(dashboardData?.totalEmployees || 0),
      change: dashboardData?.employeeGrowthRate || '+0%',
      changeType: (dashboardData?.employeeGrowthRate || '').startsWith('+') ? 'increase' : 'decrease',
      icon: <Users className="h-6 w-6" />,
      color: 'blue'
    },
    {
      title: 'Active Employees',
      value: formatCompactNumber(dashboardData?.activeEmployees || 0),
      change: dashboardData?.activeRate || '+0%',
      changeType: (dashboardData?.activeRate || '').startsWith('+') ? 'increase' : 'decrease',
      icon: <UserPlus className="h-6 w-6" />,
      color: 'green'
    },
    {
      title: 'Pending Approvals',
      value: formatCompactNumber(dashboardData?.pendingApprovals || 0),
      change: dashboardData?.approvalRate || '+0%',
      changeType: (dashboardData?.approvalRate || '').startsWith('+') ? 'increase' : 'decrease',
      icon: <Calendar className="h-6 w-6" />,
      color: 'yellow'
    },
    {
      title: 'Growth Rate',
      value: dashboardData?.employeeGrowthRate || '0%',
      change: dashboardData?.employeeGrowthRate || '+0%',
      changeType: (dashboardData?.employeeGrowthRate || '').startsWith('+') ? 'increase' : 'decrease',
      icon: <TrendingUp className="h-6 w-6" />,
      color: 'purple'
    }
  ];

  
  const pieChartData = {
    labels: ['Active Employees', 'Terminated', 'Pending'],
    datasets: [
      {
        data: [
          dashboardData?.activeEmployees || 0,
          dashboardData?.terminated || 0,
          dashboardData?.pendingApprovals || 0
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.9)',
          'rgba(239, 68, 68, 0.9)',
          'rgba(168, 85, 247, 0.9)'
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(168, 85, 247, 1)'
        ],
        borderWidth: 2,
        hoverOffset: 4
      },
    ],
  };

  
  const progressData = [
    { label: 'Active Rate', value: parseFloat(dashboardData?.activeRate) || 0, color: 'purple' },
    { label: 'Growth Rate', value: parseFloat(dashboardData?.employeeGrowthRate) || 0, color: 'blue' },
    { label: 'Approval Rate', value: parseFloat(dashboardData?.approvalRate) || 0, color: 'green' },
    { label: 'Termination Rate', value: parseFloat(dashboardData?.terminatedRate) || 0, color: 'red' }
  ];

  
  const getLineChartData = () => {
    const labels = dateRange === '7days' 
      ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      : dateRange === '30days'
      ? Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`)
      : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const baseValue = dashboardData?.totalEmployees || 1000;
    
    return {
      labels,
      datasets: [
        {
          label: 'Employees',
          data: labels.map((_, index) => Math.floor(baseValue + (index * baseValue * 0.02))),
          borderColor: 'rgba(59, 130, 246, 1)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true,
        },
      ],
    };
  };

  
  const barChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Activity Level',
        data: [
          (dashboardData?.totalEmployees || 100) * 0.08,
          (dashboardData?.totalEmployees || 100) * 0.09,
          (dashboardData?.totalEmployees || 100) * 0.07,
          (dashboardData?.totalEmployees || 100) * 0.09,
          (dashboardData?.totalEmployees || 100) * 0.10,
          (dashboardData?.totalEmployees || 100) * 0.05,
          (dashboardData?.totalEmployees || 100) * 0.04
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(156, 163, 175, 0.8)',
          'rgba(107, 114, 128, 0.8)'
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(168, 85, 247, 1)',
          'rgba(251, 146, 60, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(156, 163, 175, 1)',
          'rgba(107, 114, 128, 1)'
        ],
        borderWidth: 2,
        borderRadius: 8,
        barThickness: 40
      },
    ],
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, <span className='text-blue-600'>{user?.first_name || 'HR Admin'}.</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Here's what's happening with your HR dashboard today.
          </p>
          <div className="mt-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">System Active</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </div>
      </div>

      {}
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {statsData.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {}
      <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
        {}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Employee Distribution</h3>
          <PieChart data={pieChartData} />
        </div>

        {}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Activity Analytics</h3>
          <div className="space-y-2">
            {progressData.map((item, index) => (
              <ProgressBar key={index} {...item} />
            ))}
          </div>
          <div className="mt-4">
            <BarChart data={barChartData} />
          </div>
        </div>
      </div>

      {}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Employee Growth</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setDateRange('7days')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                dateRange === '7days' 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setDateRange('30days')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                dateRange === '30days' 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setDateRange('year')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                dateRange === 'year' 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              Year
            </button>
          </div>
        </div>
        <LineChart data={getLineChartData()} />
      </div>

      {}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700">
        <ActivityFeed activities={dashboardData?.recentActivities} />
      </div>
    </div>
  );
}

export default DashboardPage;
