import React, { useState, useEffect } from 'react';
import { FiTrendingUp, FiDollarSign, FiCreditCard, FiActivity, FiCalendar } from 'react-icons/fi';
import StatCard from '../components/Shared/StatCard';
import { LineChart, BarChart } from '../components/Shared/Chart';
import { loansAPI } from '../services/api';

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState({
    stats: {
      savingsBalance: 45000,
      currentSavingRate: 25,
      activeLoans: 2,
      outstandingLoanBalance: 15000,
      monthlyPayrollDeduction: 2500,
    },
    savingsGrowthData: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        {
          label: 'Savings Balance',
          data: [35000, 36500, 38000, 39500, 41000, 42500, 43500, 44000, 44500, 45000, 45500, 46000],
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true,
        },
      ],
    },
    loanBalanceData: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        {
          label: 'Loan Balance',
          data: [25000, 23500, 22000, 20500, 19000, 17500, 16000, 15000, 14000, 13000, 12000, 11000],
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.4,
          fill: true,
        },
      ],
    },
    recentActivity: [
      {
        id: 1,
        type: 'loan_request',
        title: 'Loan Request Submitted',
        description: 'Emergency loan request of $5,000',
        date: '2024-03-15',
        status: 'pending',
      },
      {
        id: 2,
        type: 'savings_deduction',
        title: 'Monthly Savings Deduction',
        description: '$1,250 deducted from March payroll',
        date: '2024-03-01',
        status: 'completed',
      },
      {
        id: 3,
        type: 'loan_approval',
        title: 'Loan Approved',
        description: 'Personal loan of $10,000 approved',
        date: '2024-02-28',
        status: 'completed',
      },
      {
        id: 4,
        type: 'repayment',
        title: 'Loan Repayment',
        description: '$500 loan repayment processed',
        date: '2024-03-01',
        status: 'completed',
      },
    ],
    recentTransactions: [
      {
        id: 1,
        date: '2024-03-15',
        type: 'Loan Request',
        amount: '$5,000',
        status: 'Pending',
      },
      {
        id: 2,
        date: '2024-03-01',
        type: 'Savings Deduction',
        amount: '$1,250',
        status: 'Completed',
      },
      {
        id: 3,
        date: '2024-03-01',
        type: 'Loan Repayment',
        amount: '$500',
        status: 'Completed',
      },
      {
        id: 4,
        date: '2024-02-28',
        type: 'Loan Approval',
        amount: '$10,000',
        status: 'Completed',
      },
      {
        id: 5,
        date: '2024-02-01',
        type: 'Savings Deduction',
        amount: '$1,250',
        status: 'Completed',
      },
    ],
  });

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

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await loansAPI.getDashboardData();
      if (res && res.data) {
        setDashboardData(prev => ({
          ...prev,
          stats: {
            ...prev.stats,
            activeLoans: res.data.stats.activeLoans,
            outstandingLoanBalance: res.data.stats.outstandingLoanBalance,
            monthlyPayrollDeduction: res.data.stats.monthlyPayrollDeduction
          },
          loanBalanceData: {
            labels: res.data.loanBalanceGrowth?.map(l => l.label) || ['Jan', 'Feb', 'Mar'],
            datasets: [{
              label: 'Loan Balance',
              data: res.data.loanBalanceGrowth?.map(l => l.total) || [0, 0, 0],
              borderColor: 'rgb(239, 68, 68)',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              tension: 0.4,
              fill: true,
            }]
          },
          recentActivity: res.data.recentActivity?.map(act => ({
            id: act.id,
            type: act.type,
            title: act.title,
            description: act.description,
            date: act.date?.split('T')[0],
            status: act.status?.toLowerCase()
          })) || []
        }));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) return <div className="p-6">Loading dashboard...</div>;

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
