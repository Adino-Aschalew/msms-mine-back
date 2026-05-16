import React, { useState, useEffect } from 'react';
import { FiTrendingUp, FiDollarSign, FiCreditCard, FiActivity, FiCalendar, FiAlertCircle } from 'react-icons/fi';
import StatCard from '../components/Shared/StatCard';
import { LineChart } from '../components/Shared/Chart';
import { loansAPI } from '../services/api';
import EnterpriseSavingsAPI from '../../../shared/services/enterpriseSavingsAPI';
import apiClient from '../../../shared/services/api';
import appEvents from '../../../shared/utils/eventEmitter';

const DashboardPage = () => {

  const formatCompactNumber = (num) => {
    if (!num || isNaN(num)) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'METB';
    if (num >= 10000) return (num / 1000).toFixed(1) + 'KETB';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'KETB';
    return Number(num).toFixed(0);
  };

  const formatCurrency = (num) => {
    if (!num || isNaN(num)) return '0.00 ETB';
    return new Intl.NumberFormat('en-ET', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num) + ' ETB';
  };

  const [dashboardData, setDashboardData] = useState({
    stats: {
      savingsBalance: 0,
      currentSavingRate: 0,
      activeLoans: 0,
      outstandingLoanBalance: 0,
      monthlyPayrollDeduction: 0,
      salary: 0,
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


    const handleLoanApproved = () => {
      console.log('🔄 Loan approved event received, refreshing dashboard...');
      fetchDashboardData();
    };

    appEvents.on('loanApproved', handleLoanApproved);

    return () => {
      appEvents.off('loanApproved', handleLoanApproved);
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      setDashboardData(prev => ({ ...prev, loading: true, error: null }));

      // --- 1. Enterprise Savings Dashboard ---
      let savingsDashboard = null;
      try {
        const savRes = await EnterpriseSavingsAPI.getSavingsDashboard();
        savingsDashboard = savRes?.data || savRes || null;
      } catch (err) {
        console.warn('Savings dashboard not available:', err.message);
      }

      // --- 2. Loans ---
      let loansData = [], applicationsData = [];
      try {
        const loansRes = await loansAPI.getMyLoans();
        loansData = loansRes?.data?.data || loansRes?.data || loansRes || [];
        loansData = Array.isArray(loansData) ? loansData : [];
      } catch (err) { console.warn('Loans fetch failed:', err.message); }

      try {
        const appRes = await loansAPI.getMyApplications();
        applicationsData = appRes?.data?.data || appRes?.data || appRes || [];
        applicationsData = Array.isArray(applicationsData) ? applicationsData : [];
      } catch (err) { console.warn('Applications fetch failed:', err.message); }

      // --- 3. Payroll (for gross salary) ---
      let latestPayroll = null;
      try {
        const payrollRes = await apiClient.get('/users/me/payroll', { page: 1, limit: 1 });
        const payrollList = payrollRes?.data?.data || payrollRes?.data || payrollRes || [];
        latestPayroll = Array.isArray(payrollList) ? payrollList[0] : null;
      } catch (err) { console.warn('Payroll fetch failed:', err.message); }

      // --- Compute stats ---
      const account = savingsDashboard?.account || {};
      const savingsBalance = parseFloat(account.current_balance || savingsDashboard?.totalContributions || 0);
      const savingRate = parseFloat(account.saving_percentage || 0);
      const grossSalary = parseFloat(latestPayroll?.gross_salary || account.salary || 0);

      const activeLoansCount = loansData.filter(l => ['ACTIVE', 'active'].includes(l.status)).length;
      const totalLoanBalance = loansData.reduce((s, l) => s + parseFloat(l.outstanding_balance || 0), 0);
      const loanMonthlyDeduction = loansData.reduce((s, l) => s + parseFloat(l.monthly_deduction || 0), 0);
      const savingsMonthlyDeduction = grossSalary * savingRate / 100;

      // --- Recent Activity ---
      const recentActivity = [
        ...applicationsData.map(app => ({
          id: `app-${app.id}`,
          type: 'loan_request',
          title: 'Loan Application',
          description: `${app.purpose || 'Loan'} — ${formatCurrency(app.requested_amount)}`,
          date: app.created_at,
          status: (app.status || '').toLowerCase(),
        })),
        ...loansData.map(loan => ({
          id: `loan-${loan.id}`,
          type: 'loan_approval',
          title: 'Active Loan',
          description: `Disbursed ${formatCurrency(loan.loan_amount)}`,
          date: loan.disbursement_date || loan.created_at,
          status: 'completed',
        }))
      ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

      // --- Recent Transactions (savings) ---
      const savingsTrans = savingsDashboard?.recentTransactions || [];
      const recentTransactions = savingsTrans.slice(0, 5).map((st, i) => ({
        id: `sav-t-${st.transaction_id || st.id || i}`,
        date: st.transaction_date || st.created_at,
        type: st.transaction_type === 'CONTRIBUTION' ? 'Savings Contribution' : (st.transaction_type || 'Transaction'),
        amount: formatCurrency(st.amount),
        status: 'Completed',
        rawDate: new Date(st.transaction_date || st.created_at)
      }));

      // --- Chart data ---
      const generateMonthLabels = () => {
        const labels = [], now = new Date();
        for (let i = 11; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          labels.push(d.toLocaleString('default', { month: 'short' }));
        }
        return labels;
      };
      const monthLabels = generateMonthLabels();

      setDashboardData({
        stats: {
          savingsBalance,
          currentSavingRate: savingRate,
          activeLoans: activeLoansCount,
          outstandingLoanBalance: totalLoanBalance,
          monthlyPayrollDeduction: loanMonthlyDeduction + savingsMonthlyDeduction,
          salary: grossSalary,
        },
        savingsGrowthData: {
          labels: monthLabels,
          datasets: [{
            label: 'Savings Balance',
            data: Array(12).fill(savingsBalance),
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            fill: true,
          }]
        },
        loanBalanceData: {
          labels: monthLabels,
          datasets: [{
            label: 'Loan Balance',
            data: Array(12).fill(totalLoanBalance),
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
      console.error('Dashboard fetch error:', error);
      setDashboardData(prev => ({ ...prev, loading: false, error: 'Failed to load dashboard data' }));
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Monthly Salary"
          value={formatCompactNumber(dashboardData.stats.salary)}
          change="Your gross monthly income"
          changeType="neutral"
          icon={<FiDollarSign className="w-6 h-6" />}
          color="primary"
        />
        <StatCard
          title="Savings Balance"
          value={formatCompactNumber(dashboardData.stats.savingsBalance)}
          change={dashboardData.stats.savingsBalance > 0 ? 'Total accumulated savings' : 'Start your savings today'}
          changeType="positive"
          icon={<FiTrendingUp className="w-6 h-6" />}
          color="success"
        />
        <StatCard
          title="Saving Rate"
          value={`${dashboardData.stats.currentSavingRate}%`}
          change="of your monthly salary"
          changeType="neutral"
          icon={<FiActivity className="w-6 h-6" />}
          color="primary"
        />
        <StatCard
          title="Active Loans"
          value={dashboardData.stats.activeLoans}
          change={`${dashboardData.stats.activeLoans} active loan${dashboardData.stats.activeLoans !== 1 ? 's' : ''}`}
          changeType="neutral"
          icon={<FiCreditCard className="w-6 h-6" />}
          color="warning"
        />
        <StatCard
          title="Outstanding Balance"
          value={formatCompactNumber(dashboardData.stats.outstandingLoanBalance)}
          change={dashboardData.stats.outstandingLoanBalance > 0 ? 'Remaining principal + interest' : 'No active loan debt'}
          changeType={dashboardData.stats.outstandingLoanBalance > 0 ? 'negative' : 'positive'}
          icon={<FiDollarSign className="w-6 h-6" />}
          color="danger"
        />
        <StatCard
          title="Monthly Deduction"
          value={formatCompactNumber(dashboardData.stats.monthlyPayrollDeduction)}
          change={`Savings + Loan repayments`}
          changeType="neutral"
          icon={<FiCalendar className="w-6 h-6" />}
          color="warning"
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
