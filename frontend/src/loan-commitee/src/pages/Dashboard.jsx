import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LoanChart from '../components/charts/LoanChart';
import StatCard from '../components/widgets/StatCard';
import {
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  TrendingUp,
  Eye,
  User,
  Calendar,
  CreditCard,
  RefreshCw,
  Download,
  Filter,
  Search
} from 'lucide-react';
import { handleButtonClick } from '../utils/actionHandlers';
import { exportDashboardReport as exportUtil } from '../utils/exportUtils';
import { loanCommitteeAPI } from '../../../shared/services/loansAPI';

const Dashboard = () => {
  // Compact number formatting function
  const formatCompactNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'METB';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'KETB';
    }
    return num.toString();
  };

  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [selectedPeriod]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await loanCommitteeAPI.getDashboardData();
      if (res && res.data) {
        setDashboardData(res.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to fetch loan committee dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Functional handlers
  const handleRefresh = () => {
    fetchDashboardData();
    handleButtonClick('refreshData', 'dashboard');
  };

  const handleExport = () => {
    console.log('Export button clicked');
    try {
      const dashboardData = {
        stats,
        monthlyDistributionData,
        loanGrowthData,
        loanSizeDistributionData,
        recentRequests,
        activityFeed,
        selectedPeriod,
        generatedAt: new Date().toISOString()
      };
      console.log('Dashboard data prepared:', dashboardData);
      exportUtil(dashboardData, 'dashboard-report');
      console.log('Export completed successfully');
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleFilter = (filters) => {
    handleButtonClick('filterData', filters);
  };

  const handleSearch = (query) => {
    handleButtonClick('searchData', query);
  };

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    console.log(`Period changed to: ${period}`);
    // In a real app, this would fetch new data
  };

  const stats = [
    {
      title: 'Total Loan Requests',
      value: dashboardData?.stats?.total_requests || '0',
      change: 'Active tracking',
      changeType: 'neutral',
      icon: <FileText className="w-6 h-6" />,
      color: 'primary'
    },
    {
      title: 'Pending Reviews',
      value: dashboardData?.stats?.pending_reviews || '0',
      change: 'Needs action',
      changeType: 'warning',
      icon: <AlertCircle className="w-6 h-6" />,
      color: 'warning'
    },
    {
      title: 'Approved Loans',
      value: dashboardData?.stats?.approved_loans || '0',
      change: 'Approved',
      changeType: 'success',
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'success'
    },
    {
      title: 'Rejected Loans',
      value: dashboardData?.stats?.rejected_loans || '0',
      change: 'Rejected',
      changeType: 'neutral',
      icon: <XCircle className="w-6 h-6" />,
      color: 'danger'
    },
    {
      title: 'Suspended Requests',
      value: dashboardData?.stats?.suspended_requests || '0',
      change: 'On Hold',
      changeType: 'warning',
      icon: <AlertCircle className="w-6 h-6" />,
      color: 'warning'
    },
    {
      title: 'Total Loan Portfolio',
      value: formatCompactNumber(dashboardData?.stats?.total_portfolio || 0),
      change: 'Active Value',
      changeType: 'increase',
      icon: <DollarSign className="w-6 h-6" />,
      color: 'primary'
    }
  ];

  const monthlyDistributionData = {
    labels: dashboardData?.trends?.map(t => t.label) || ['Jan', 'Feb', 'Mar'],
    datasets: [
      {
        label: 'Loan Requests',
        data: dashboardData?.trends?.map(t => t.total_requests) || [0, 0, 0],
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
      },
      {
        label: 'Approved Loans',
        data: dashboardData?.trends?.map(t => t.approved_loans) || [0, 0, 0],
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 2,
      }
    ]
  };

  const loanGrowthData = {
    labels: dashboardData?.growth?.map(g => g.label) || ['Jan', 'Feb', 'Mar'],
    datasets: [
      {
        label: 'Portfolio Growth',
        data: dashboardData?.growth?.map(g => g.amount) || [0, 0, 0],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      }
    ]
  };

  const calculateSizeDist = () => {
    if (!dashboardData?.sizeDistribution) return { labels: [], dataset: [] };
    const order = ['< $5K', '$5K-$10K', '$10K-$20K', '$20K-$50K', '> $50K'];
    // Merge backend data with default zeros
    const distMap = { '< $5K': 0, '$5K-$10K': 0, '$10K-$20K': 0, '$20K-$50K': 0, '> $50K': 0 };
    let total = 0;
    dashboardData.sizeDistribution.forEach(d => {
      distMap[d.category] = d.count;
      total += d.count;
    });
    
    return {
      labels: order,
      dataset: order.map(k => total > 0 ? Math.round((distMap[k] / total) * 100) : 0)
    };
  };

  const sizeDistCalculated = calculateSizeDist();

  const loanSizeDistributionData = {
    labels: sizeDistCalculated.labels,
    datasets: [
      {
        data: sizeDistCalculated.dataset.length > 0 ? sizeDistCalculated.dataset : [0,0,0,0,0],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
      }
    ]
  };

  const recentRequests = dashboardData?.recentRequests?.map(req => ({
    id: req.id,
    employee: req.employee,
    department: req.department || 'Not specified',
    loanType: req.loanType || 'Personal',
    amount: `$${req.amount}`,
    submissionDate: req.submissionDate?.split('T')[0],
    status: req.status.toLowerCase()
  })) || [];

  // Real activity feed from backend
  const activityFeed = dashboardData?.recentActivity?.map((activity, index) => ({
    id: index + 1,
    type: activity.action?.toLowerCase() || 'unknown',
    message: activity.description || `${activity.action} by ${activity.user_name || 'User'}`,
    time: activity.created_at ? new Date(activity.created_at).toLocaleString() : 'Unknown',
    icon: getActivityIcon(activity.action?.toLowerCase())
  })) || [
    {
      id: 1,
      type: 'new_request',
      message: 'No recent activity available',
      time: 'Now',
      icon: <FileText className="w-4 h-4" />
    }
  ];

  const getActivityIcon = (type) => {
    const icons = {
      new_request: <FileText className="w-4 h-4" />,
      approved: <CheckCircle className="w-4 h-4" />,
      rejected: <XCircle className="w-4 h-4" />,
      disbursed: <DollarSign className="w-4 h-4" />,
      suspended: <AlertCircle className="w-4 h-4" />,
      created: <User className="w-4 h-4" />,
      updated: <RefreshCw className="w-4 h-4" />
    };
    return icons[type] || icons.new_request;
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'status-pending',
      approved: 'status-approved',
      rejected: 'status-rejected',
      suspended: 'status-suspended'
    };
    return badges[status] || 'status-pending';
  };

  const getActivityIconColor = (type) => {
    const colors = {
      new_request: 'text-primary-600 bg-primary-100',
      approved: 'text-success-600 bg-success-100',
      rejected: 'text-danger-600 bg-danger-100',
      disbursed: 'text-warning-600 bg-warning-100',
      suspended: 'text-gray-600 bg-gray-100'
    };
    return colors[type] || colors.new_request;
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Loan Committee Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome back, {user?.first_name || 'Committee Member'}. Loan committee overview and analytics</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => handlePeriodChange(e.target.value)}
            className="input w-auto"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
          <button
            onClick={handleRefresh}
            className="btn btn-secondary"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleExport}
            className="btn btn-secondary"
            title="Export Report"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Distribution */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Monthly Loan Distribution
          </h3>
          <div className="h-64">
            <LoanChart type="bar" data={monthlyDistributionData} />
          </div>
        </div>

        {/* Loan Growth Trend */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Portfolio Growth Trend
          </h3>
          <div className="h-64">
            <LoanChart type="line" data={loanGrowthData} />
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Loan Requests */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Recent Loan Requests
            </h3>
            <Link
              to="/loan-requests"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <th className="pb-3">Employee</th>
                  <th className="pb-3">Department</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {recentRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="py-3">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                          <User className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {request.employee}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{request.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-sm text-gray-600 dark:text-gray-400">
                      {request.department}
                    </td>
                    <td className="py-3 text-sm text-gray-600 dark:text-gray-400">
                      {request.loanType}
                    </td>
                    <td className="py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                      {request.amount}
                    </td>
                    <td className="py-3">
                      <span className={`status-badge ${getStatusBadge(request.status)}`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3">
                      <Link
                        to={`/loan-requests/${request.id}`}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Recent Activity
          </h3>
          <div className="space-y-3">
            {activityFeed.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${getActivityIconColor(activity.type)}`}>
                  {activity.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {activity.message}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Loan Size Distribution */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Loan Size Distribution
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64">
            <LoanChart type="doughnut" data={loanSizeDistributionData} />
          </div>
          <div className="flex flex-col justify-center space-y-3">
            {loanSizeDistributionData.labels.map((label, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: loanSizeDistributionData.datasets[0].backgroundColor[index] }}
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {loanSizeDistributionData.datasets[0].data[index]}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
