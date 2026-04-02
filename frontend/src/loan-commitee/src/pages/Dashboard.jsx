import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LoanChart from '../components/charts/LoanChart';
import StatCard from '../components/widgets/StatCard';
import Modal from '../components/ui/Modal';
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
  Search,
  Briefcase,
  Hash,
  Clock
} from 'lucide-react';
import { handleButtonClick } from '../utils/actionHandlers';
import { exportDashboardReport as exportUtil } from '../utils/exportUtils';
import { committeeAPI } from '../services/committeeAPI';
import { formatETB } from '../utils/helpers';

const Dashboard = () => {
  // Compact number formatting function using ETB
  const formatCompactNumber = (num) => formatETB(num);

  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState({ isOpen: false, type: '', title: '', message: '' });

  useEffect(() => {
    fetchDashboardData();
  }, [selectedPeriod]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching dashboard data...');
      const res = await committeeAPI.getDashboardData({ period: selectedPeriod });
      console.log('Dashboard API response:', res);
      console.log('Response data:', res.data);
      
      if (res && res.data && res.data.success) {
        console.log('Setting dashboard data:', res.data.data);
        setDashboardData(res.data.data);
      } else {
        console.error('Unexpected response format:', res);
        setError('Failed to fetch dashboard data: Unexpected response format');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      console.error('Error response:', error.response);
      setError('Failed to fetch dashboard data. Please try again.');
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

  // Quick action handlers for loan requests
  const handleQuickApprove = async (loanId) => {
    try {
      await committeeAPI.approveLoan(loanId, { quick_approve: true });
      fetchDashboardData(); // Refresh data
      setFeedbackModal({
        isOpen: true,
        type: 'success',
        title: 'Loan Approved',
        message: 'The loan has been approved successfully.'
      });
    } catch (error) {
      console.error('Failed to approve loan:', error);
      setFeedbackModal({
        isOpen: true,
        type: 'error',
        title: 'Approval Failed',
        message: 'Failed to approve the loan. Please try again.'
      });
    }
  };

  const handleQuickReject = async (loanId) => {
    try {
      await committeeAPI.rejectLoan(loanId, { quick_reject: true });
      fetchDashboardData(); // Refresh data
      setFeedbackModal({
        isOpen: true,
        type: 'success',
        title: 'Loan Rejected',
        message: 'The loan has been rejected successfully.'
      });
    } catch (error) {
      console.error('Failed to reject loan:', error);
      setFeedbackModal({
        isOpen: true,
        type: 'error',
        title: 'Rejection Failed',
        message: 'Failed to reject the loan. Please try again.'
      });
    }
  };

  const closeFeedbackModal = () => {
    setFeedbackModal({ isOpen: false, type: '', title: '', message: '' });
  };

  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
  };

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    handleButtonClick('changePeriod', period);
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
    labels: Array.isArray(dashboardData?.trends) ? dashboardData.trends.map(t => t.label) : ['Jan', 'Feb', 'Mar'],
    datasets: [
      {
        label: 'Loan Requests',
        data: Array.isArray(dashboardData?.trends) ? dashboardData.trends.map(t => t.total_requests) : [0, 0, 0],
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
      },
      {
        label: 'Approved Loans',
        data: Array.isArray(dashboardData?.trends) ? dashboardData.trends.map(t => t.approved_loans) : [0, 0, 0],
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 2,
      }
    ]
  };

  const loanGrowthData = {
    labels: Array.isArray(dashboardData?.growth) ? dashboardData.growth.map(g => g.label) : ['Jan', 'Feb', 'Mar'],
    datasets: [
      {
        label: 'Portfolio Growth',
        data: Array.isArray(dashboardData?.growth) ? dashboardData.growth.map(g => g.amount) : [0, 0, 0],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      }
    ]
  };

  const calculateSizeDist = () => {
    if (!Array.isArray(dashboardData?.sizeDistribution)) return { labels: [], dataset: [] };
    const order = ['< 5K ETB', '5K-10K ETB', '10K-20K ETB', '20K-50K ETB', '> 50K ETB'];
    // Merge backend data with default zeros
    const distMap = { '< 5K ETB': 0, '5K-10K ETB': 0, '10K-20K ETB': 0, '20K-50K ETB': 0, '> 50K ETB': 0 };
    let total = 0;
    dashboardData.sizeDistribution.forEach(d => {
      // Map old dollar categories to new ETB categories
      const categoryMap = {
        '< $5K': '< 5K ETB',
        '$5K-$10K': '5K-10K ETB',
        '$10K-$20K': '10K-20K ETB',
        '$20K-$50K': '20K-50K ETB',
        '> $50K': '> 50K ETB'
      };
      const mappedCategory = categoryMap[d.category] || d.category;
      distMap[mappedCategory] = d.count;
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

  // Format amount to ETB with K/M suffix
  const formatETBLocal = (amount) => formatETB(amount);

  const recentRequests = Array.isArray(dashboardData?.recentRequests) ? dashboardData.recentRequests.map(req => ({
    id: req.id,
    employee: req.employee,
    department: req.department || 'Not specified',
    loanType: req.loan_type || 'Personal',
    reason: req.reason || '-',
    guarantorName: req.guarantor_name || 'No guarantor',
    guarantorPhone: req.guarantor_phone || '-',
    amount: formatETBLocal(req.amount),
    submissionDate: req.submissionDate?.split('T')[0],
    status: req.status.toLowerCase()
  })) : [];

  // Real activity feed from backend
  const activityFeed = Array.isArray(dashboardData?.recentActivity) ? dashboardData.recentActivity.map((activity, index) => ({
    id: index + 1,
    type: activity.action?.toLowerCase() || 'unknown',
    message: activity.description || `${activity.action} by ${activity.user_name || 'User'}`,
    time: activity.created_at ? new Date(activity.created_at).toLocaleString() : 'Unknown',
    icon: getActivityIcon(activity.action?.toLowerCase())
  })) : [
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20">
      {/* System-Level Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
                <Briefcase className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Loan Committee Dashboard</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Enterprise Loan Management System • Real-time Analytics</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700 dark:text-green-300">System Active</span>
              </div>
              <select
                value={selectedPeriod}
                onChange={(e) => handlePeriodChange(e.target.value)}
                className="px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="quarter">Last Quarter</option>
                <option value="year">Last Year</option>
              </select>
              <button
                onClick={handleRefresh}
                className="p-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-all hover:scale-105 active:scale-95"
                title="Refresh Data"
              >
                <RefreshCw className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              <button
                onClick={handleExport}
                className="p-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all hover:scale-105 active:scale-95"
                title="Export Report"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 py-6">
        <div className="space-y-6">

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-6 gap-4">
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
                  <th className="pb-3">Reason</th>
                  <th className="pb-3">Guarantor</th>
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
                    <td className="py-3 text-sm text-gray-600 dark:text-gray-400 max-w-[150px] truncate" title={request.reason}>
                      {request.reason}
                    </td>
                    <td className="py-3 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex flex-col">
                        <span>{request.guarantorName}</span>
                        {request.guarantorPhone !== '-' && (
                          <span className="text-xs text-gray-400">{request.guarantorPhone}</span>
                        )}
                      </div>
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
                      <div className="flex items-center flex-wrap gap-1 sm:gap-2">
                        <button
                          onClick={() => handleViewRequest(request)}
                          className="p-1 sm:p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                        {request.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleQuickApprove(request.id)}
                              className="p-1 sm:p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded transition-colors"
                              title="Quick Approve"
                            >
                              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                            <button
                              onClick={() => handleQuickReject(request.id)}
                              className="p-1 sm:p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                              title="Quick Reject"
                            >
                              <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                          </>
                        )}
                      </div>
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
    </div>

    {/* Request Detail Modal */}
    <Modal
      isOpen={isModalOpen}
      onClose={handleCloseModal}
      title="Loan Request Details"
      size="large"
    >
      {selectedRequest && (
        <div className="space-y-6">
          {/* Request ID and Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Hash className="w-5 h-5 text-gray-500" />
              <span className="text-sm text-gray-500">Request ID:</span>
              <span className="font-mono text-sm font-medium">{selectedRequest.id}</span>
            </div>
            <span className={`status-badge ${getStatusBadge(selectedRequest.status)}`}>
              {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
            </span>
          </div>

          {/* Employee Info */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <User className="w-4 h-4" />
              Employee Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500">Name</label>
                <p className="font-medium">{selectedRequest.employee}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500">Department</label>
                <p className="font-medium">{selectedRequest.department}</p>
              </div>
            </div>
          </div>

          {/* Loan Details */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Loan Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500">Loan Type</label>
                <p className="font-medium">{selectedRequest.loanType}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500">Reason</label>
                <p className="font-medium">{selectedRequest.reason}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500">Guarantor</label>
                <p className="font-medium">{selectedRequest.guarantorName}</p>
                {selectedRequest.guarantorPhone !== '-' && (
                  <p className="text-xs text-gray-400">{selectedRequest.guarantorPhone}</p>
                )}
              </div>
              <div>
                <label className="text-xs text-gray-500">Amount</label>
                <p className="font-medium text-lg text-primary-600">{selectedRequest.amount}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500">Submission Date</label>
                <p className="font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {selectedRequest.submissionDate}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {selectedRequest.status === 'pending' && (
            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={() => {
                  handleQuickApprove(selectedRequest.id);
                  handleCloseModal();
                }}
                className="flex-1 btn btn-primary flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Approve Request
              </button>
              <button
                onClick={() => {
                  handleQuickReject(selectedRequest.id);
                  handleCloseModal();
                }}
                className="flex-1 btn btn-outline border-red-300 text-red-600 hover:bg-red-50 flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Reject Request
              </button>
            </div>
          )}
        </div>
      )}
    </Modal>

    {/* Feedback Modal */}
    <Modal
      isOpen={feedbackModal.isOpen}
      onClose={closeFeedbackModal}
      title={feedbackModal.title}
      size="small"
    >
      <div className="text-center py-4">
        <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
          feedbackModal.type === 'success' ? 'bg-emerald-100' : 'bg-red-100'
        }`}>
          {feedbackModal.type === 'success' ? (
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          ) : (
            <XCircle className="w-8 h-8 text-red-600" />
          )}
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {feedbackModal.message}
        </p>
        <button
          onClick={closeFeedbackModal}
          className={`btn ${feedbackModal.type === 'success' ? 'btn-primary' : 'btn-outline border-red-300 text-red-600 hover:bg-red-50'}`}
        >
          {feedbackModal.type === 'success' ? 'Continue' : 'Try Again'}
        </button>
      </div>
    </Modal>
    </div>
  );
};

export default Dashboard;
