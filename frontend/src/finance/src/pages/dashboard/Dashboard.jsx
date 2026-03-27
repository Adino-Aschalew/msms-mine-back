import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Download,
  Eye,
} from 'lucide-react';
import KPICard from '../../components/widgets/KPICard';
import RevenueChart from '../../components/charts/RevenueChart';
import ExpenseChart from '../../components/charts/ExpenseChart';
import CashFlowChart from '../../components/charts/CashFlowChart';
import RecentTransactionsTable from '../../components/tables/RecentTransactionsTable';
import AccountsOverview from '../../components/widgets/AccountsOverview';
import DateFilter from '../../components/widgets/DateFilter';
import { financeAPI } from '../../../../shared/services/financeAPI';
import { useAuth } from '../../../../shared/contexts/AuthContext';

const Dashboard = () => {
  const [dateRange, setDateRange] = useState('30days');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await financeAPI.getDashboardData({ period: dateRange });
      setDashboardData(response);
    } catch (err) {
      setError('Failed to fetch finance dashboard data');
      console.error('Finance Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Real KPI data from backend
  const kpiData = [
    {
      title: 'Revenue',
      value: `${(dashboardData?.revenue || 0).toLocaleString()} ETB`,
      change: `+${dashboardData?.revenueGrowth || '0'}%`,
      trend: dashboardData?.revenueGrowth >= 0 ? 'up' : 'down',
      icon: DollarSign,
      color: 'green',
    },
    {
      title: 'Expenses',
      value: `${(dashboardData?.expenses || 0).toLocaleString()} ETB`,
      change: `+${dashboardData?.expensesGrowth || '0'}%`,
      trend: dashboardData?.expensesGrowth >= 0 ? 'up' : 'down',
      icon: CreditCard,
      color: 'red',
    },
    {
      title: 'Net Profit',
      value: `${(dashboardData?.netProfit || 0).toLocaleString()} ETB`,
      change: `+${dashboardData?.profitGrowth || '0'}%`,
      trend: dashboardData?.profitGrowth >= 0 ? 'up' : 'down',
      icon: TrendingUp,
      color: 'blue',
    },
    {
      title: 'Cash Balance',
      value: `${(dashboardData?.cashBalance || 0).toLocaleString()} ETB`,
      change: `${dashboardData?.cashChange >= 0 ? '+' : ''}${dashboardData?.cashChange || '0'}%`,
      trend: dashboardData?.cashChange >= 0 ? 'up' : 'down',
      icon: Wallet,
      color: 'purple',
    },
    {
      title: 'Accounts Receivable',
      value: `${(dashboardData?.accountsReceivable || 0).toLocaleString()} ETB`,
      change: `${dashboardData?.receivableChange >= 0 ? '+' : ''}${dashboardData?.receivableChange || '0'}%`,
      trend: dashboardData?.receivableChange >= 0 ? 'up' : 'down',
      icon: ArrowUpRight,
      color: 'orange',
    },
    {
      title: 'Accounts Payable',
      value: `${(dashboardData?.accountsPayable || 0).toLocaleString()} ETB`,
      change: `+${dashboardData?.payableChange || '0'}%`,
      trend: dashboardData?.payableChange >= 0 ? 'up' : 'down',
      icon: ArrowDownRight,
      color: 'yellow',
    },
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Finance Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-white">
            Welcome back, {user?.first_name || 'Finance Admin'}. Financial health overview and key metrics
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <DateFilter value={dateRange} onChange={setDateRange} />
          <button className="px-3 py-2 btn btn-outline bg-blue-600 text-white">
            <Download className="h-4 w-4 mr-2 text-white" />
            Export
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4"
      >
        {kpiData.map((kpi, index) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <KPICard {...kpi} />
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="card p-4 sm:p-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Revenue vs Expenses
            </h2>
            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <Eye className="h-4 w-4" />
            </button>
          </div>
          <div className="h-48 sm:h-64">
            <RevenueChart dateRange={dateRange} dashboardData={dashboardData} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="card p-4 sm:p-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Expense Breakdown
            </h2>
            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <Eye className="h-4 w-4" />
            </button>
          </div>
          <div className="h-48 sm:h-64">
            <ExpenseChart dateRange={dateRange} dashboardData={dashboardData} />
          </div>
        </motion.div>
      </div>

      {/* Cash Flow Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="card p-4 sm:p-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Cash Flow Analysis
          </h2>
          <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <Eye className="h-4 w-4" />
          </button>
        </div>
        <div className="h-48 sm:h-64">
          <CashFlowChart dateRange={dateRange} dashboardData={dashboardData} />
        </div>
      </motion.div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="xl:col-span-2 card p-4 sm:p-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Transactions
            </h2>
            <button className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400">
              View all
            </button>
          </div>
          <div className="overflow-x-auto">
            <RecentTransactionsTable limit={5} />
          </div>
        </motion.div>

        {/* Accounts Overview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="card p-4 sm:p-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Accounts Overview
            </h2>
            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <Eye className="h-4 w-4" />
            </button>
          </div>
          <AccountsOverview />
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
