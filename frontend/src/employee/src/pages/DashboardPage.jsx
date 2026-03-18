import React, { useState, useEffect } from 'react';
import { FiTrendingUp, FiDollarSign, FiCreditCard, FiActivity, FiCalendar } from 'react-icons/fi';
import StatCard from '../components/Shared/StatCard';
import { LineChart, BarChart } from '../components/Shared/Chart';
import { loansAPI } from '../services/api';

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState({
    stats: {
      savingsBalance: 0,
      currentSavingRate: 0,
      activeLoans: 0,
      outstandingLoanBalance: 0,
      monthlyPayrollDeduction: 0,
    },
    savingsGrowthData: {
      labels: [],
      datasets: [],
    },
    loanBalanceData: {
      labels: [],
      datasets: [],
    },
    recentActivity: [],
    recentTransactions: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setDashboardData(prev => ({ ...prev, loading: true, error: null }));
      
      // Fetch loans data
      const loansRes = await loansAPI.getMyLoans();
      const applicationsRes = await loansAPI.getMyApplications();
      
      const loans = loansRes?.data || [];
      const applications = applicationsRes?.data || [];
      
      // Calculate stats from real data
      const activeLoans = loans.filter(loan => loan.status === 'ACTIVE').length;
      const totalLoanBalance = loans.reduce((sum, loan) => sum + parseFloat(loan.outstanding_balance || 0), 0);
      const monthlyDeduction = loans.reduce((sum, loan) => sum + parseFloat(loan.monthly_deduction || 0), 0);
      
      // Generate chart data
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const savingsGrowthData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          {
            label: 'Savings Balance',
            data: Array(12).fill(45000 + Math.random() * 5000), // Simulated growth data
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            fill: true,
          },
        ],
      };

      const loanBalanceData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          {
            label: 'Loan Balance',
            data: Array(12).fill(15000 - Math.random() * 2000), // Simulated repayment data
            borderColor: 'rgb(239, 68, 68)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            tension: 0.4,
            fill: true,
          },
        ],
      };

      // Create recent activity from real data
      const recentActivity = [
        ...(applications.slice(0, 2).map(app => ({
          id: app.id,
          type: 'loan_request',
          title: 'Loan Request Submitted',
          description: `Loan request of $${app.requested_amount}`,
          date: app.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
          status: app.status.toLowerCase(),
        }))),
        ...(loans.slice(0, 2).map(loan => ({
          id: loan.id,
          type: 'loan_approval',
          title: 'Loan Status Update',
          description: `Loan ${loan.status}`,
          date: loan.start_date?.split('T')[0] || new Date().toISOString().split('T')[0],
          status: loan.status.toLowerCase(),
        }))),
      ];

      const recentTransactions = [
        ...(applications.slice(0, 3).map(app => ({
          id: app.id,
          date: app.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
          type: 'Loan Request',
          amount: `$${app.requested_amount}`,
          status: app.status,
        }))),
        ...(loans.slice(0, 3).map(loan => ({
          id: loan.id,
          date: loan.start_date?.split('T')[0] || new Date().toISOString().split('T')[0],
          type: 'Loan Disbursement',
          amount: `$${loan.loan_amount}`,
          status: 'Completed',
        }))),
      ];

      setDashboardData({
        stats: {
          savingsBalance: 45000, // This would come from savings API
          currentSavingRate: 25,
          activeLoans,
          outstandingLoanBalance: totalLoanBalance,
          monthlyPayrollDeduction: monthlyDeduction,
        },
        savingsGrowthData: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: [{
            label: 'Savings Balance',
            data: Array(12).fill(45000 + Math.random() * 5000), // Simulated growth data
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            fill: true,
          }]
        },
        loanBalanceData: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: [{
            label: 'Loan Balance',
            data: Array(12).fill(15000 - Math.random() * 2000), // Simulated repayment data
            borderColor: 'rgb(239, 68, 68)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            tension: 0.4,
            fill: true,
          }]
        },
        recentActivity,
        recentTransactions,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setDashboardData(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Failed to load dashboard data' 
      }));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200';
      case 'pending':
        return 'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200';
      case 'rejected':
        return 'bg-danger-100 text-danger-800 dark:bg-danger-900 dark:text-danger-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (dashboardData.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (dashboardData.error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{dashboardData.error}</p>
      </div>
    );
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'loan_request':
        return <FiDollarSign className="w-5 h-5" />;
      case 'savings_deduction':
        return <FiTrendingUp className="w-5 h-5" />;
      case 'loan_approval':
        return <FiCreditCard className="w-5 h-5" />;
      case 'repayment':
        return <FiActivity className="w-5 h-5" />;
      default:
        return <FiCalendar className="w-5 h-5" />;
    }
  };

  if (dashboardData.loading) return <div className="p-6">Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome back! Here's your financial overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          title="Savings Balance"
          value={`$${dashboardData.stats.savingsBalance.toLocaleString()}`}
          change="+$2,500 this month"
          changeType="positive"
          icon={<FiTrendingUp className="w-6 h-6" />}
          color="success"
        />
        <StatCard
          title="Current Saving Rate"
          value={`${dashboardData.stats.currentSavingRate}%`}
          change="of monthly salary"
          changeType="neutral"
          icon={<FiActivity className="w-6 h-6" />}
          color="primary"
        />
        <StatCard
          title="Active Loans"
          value={dashboardData.stats.activeLoans}
          change="2 active loans"
          changeType="neutral"
          icon={<FiCreditCard className="w-6 h-6" />}
          color="warning"
        />
        <StatCard
          title="Outstanding Balance"
          value={`$${dashboardData.stats.outstandingLoanBalance.toLocaleString()}`}
          change="-$1,000 this month"
          changeType="positive"
          icon={<FiDollarSign className="w-6 h-6" />}
          color="danger"
        />
        <StatCard
          title="Monthly Deduction"
          value={`$${dashboardData.stats.monthlyPayrollDeduction.toLocaleString()}`}
          change="Next: March 31"
          changeType="neutral"
          icon={<FiCalendar className="w-6 h-6" />}
          color="primary"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Savings Growth</h2>
          <LineChart data={dashboardData.savingsGrowthData} height={250} />
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Loan Balance Over Time</h2>
          <LineChart data={dashboardData.loanBalanceData} height={250} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {dashboardData.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {activity.title}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {activity.description}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {new Date(activity.date).toLocaleDateString()}
                    </p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                      {activity.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Transactions</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {dashboardData.recentTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {transaction.type}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                      {transaction.amount}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status.toLowerCase())}`}>
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
