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
  CheckSquare,
  AlertTriangle
} from 'lucide-react';
import KPICard from '../../components/widgets/KPICard';
import RevenueChart from '../../components/charts/RevenueChart';
import SavingAnalyzer from '../../components/charts/SavingAnalyzer';
import CashFlowChart from '../../components/charts/CashFlowChart';
import RecentTransactionsTable from '../../components/tables/RecentTransactionsTable';
import AccountsOverview from '../../components/widgets/AccountsOverview';
import DateFilter from '../../components/widgets/DateFilter';
import { financeAPI } from '../../../../shared/services/financeAPI';
import { useAuth } from '../../../../shared/contexts/AuthContext';
import appEvents from '../../../../shared/utils/eventEmitter';

const Dashboard = () => {
  
  const formatCompactNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'METB';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'KETB';
    }
    return num.toString();
  };

  const [dateRange, setDateRange] = useState('30days');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [overviewData, setOverviewData] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
    
    
    const handlePayrollUpdate = (payrollData) => {
      console.log('Finance Dashboard: Payroll data updated, refreshing...', payrollData);
      fetchDashboardData();
    };
    
    appEvents.on('payrollDataUpdated', handlePayrollUpdate);
    
    
    return () => {
      appEvents.off('payrollDataUpdated', handlePayrollUpdate);
    };
  }, [dateRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Finance Dashboard: Fetching data...');
      const response = await financeAPI.getFinancialOverview(dateRange);
      console.log('📊 Finance Dashboard Response:', response);
      console.log('📊 Response structure:', JSON.stringify(response, null, 2));
      
      
      const data = response.data || response;
      console.log('✅ Processed Overview Data:', data);
      console.log('💰 Revenue:', data?.revenue);
      console.log('💸 Expenses:', data?.expenses);
      console.log('📈 Net Profit:', data?.netProfit);
      console.log('💵 Cash Balance:', data?.cashBalance);
      console.log('💳 Accounts Receivable:', data?.accountsReceivable);
      console.log('💼 Accounts Payable:', data?.accountsPayable);
      setDashboardData(data);
      setOverviewData(data);
    } catch (err) {
      
      if (err.message.includes('Failed to fetch') || err.message.includes('ERR_CONNECTION_REFUSED')) {
        setError('Unable to connect to the server. Please check if the backend is running.');
      } else {
        setError('Failed to fetch finance dashboard data');
      }
      console.error('Finance Dashboard error:', err);
      
      
      setDashboardData({
        revenue: 0,
        expenses: 0,
        netProfit: 0,
        revenueGrowth: 0,
        expensesGrowth: 0,
        profitGrowth: 0,
        cashBalance: 0,
        cashChange: 0,
        accountsReceivable: 0,
        receivableChange: 0,
        accountsPayable: 0,
        payableChange: 0,
        expenseBreakdown: [],
        monthlyCashFlow: []
      });
    } finally {
      setLoading(false);
    }
  };

  
  const kpiData = [
    {
      title: 'Total Revenue',
      value: formatCompactNumber((overviewData?.savings?.total_savings || 0) + (overviewData?.loans?.total_payments || 0)),
      change: `+${(overviewData?.revenueGrowth || '0')}%`,
      trend: overviewData?.revenueGrowth >= 0 ? 'up' : 'down',
      icon: DollarSign,
      color: 'green',
    },
    {
      title: 'Total Expenses',
      value: formatCompactNumber((overviewData?.savings?.total_withdrawals || 0) + (overviewData?.payroll?.total_amount || 0)),
      change: `+${(overviewData?.expensesGrowth || '0')}%`,
      trend: overviewData?.expensesGrowth >= 0 ? 'up' : 'down',
      icon: Wallet,
      color: 'red',
    },
    {
      title: 'Net Profit',
      value: formatCompactNumber(((overviewData?.savings?.total_savings || 0) + (overviewData?.loans?.total_payments || 0)) - ((overviewData?.savings?.total_withdrawals || 0) + (overviewData?.payroll?.total_amount || 0))),
      change: `+${(overviewData?.profitGrowth || '0')}%`,
      trend: overviewData?.profitGrowth >= 0 ? 'up' : 'down',
      icon: TrendingUp,
      color: 'green',
    },
    {
      title: 'Cash Balance',
      value: formatCompactNumber(overviewData?.savings?.total_savings || 0),
      change: `+${(overviewData?.cashChange || '0')}%`,
      trend: overviewData?.cashChange >= 0 ? 'up' : 'down',
      icon: Wallet,
      color: 'purple',
    },
    {
      title: 'Accounts Receivable',
      value: formatCompactNumber(overviewData?.loans?.total_loans || 0),
      change: (overviewData?.receivableChange >= 0 ? '+' : '') + Math.abs(overviewData?.receivableChange || 0) + '%',
      trend: overviewData?.receivableChange >= 0 ? 'up' : 'down',
      icon: ArrowUpRight,
      color: 'orange',
    },
    {
      title: 'Accounts Payable',
      value: formatCompactNumber(overviewData?.payroll?.total_amount || 0),
      change: `+${(overviewData?.payableChange || '0')}%`,
      trend: overviewData?.payableChange >= 0 ? 'up' : 'down',
      icon: ArrowDownRight,
      color: 'yellow',
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
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const pendingPayroll = dashboardData?.pendingApprovals?.payroll || 0;
  const pendingSavings = dashboardData?.pendingApprovals?.savingsRequests || 0;

  return (
    <div className="space-y-6">
      {}
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

      {}
      {(pendingPayroll > 0 || pendingSavings > 0) && (
        <div className="flex flex-col md:flex-row gap-4">
          {pendingPayroll > 0 && (
            <div className="flex-1 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-amber-900">{pendingPayroll} Payroll Batches Pending</p>
                  <p className="text-xs text-amber-600">Action required for salary disbursement</p>
                </div>
              </div>
              <a href="/finance/payroll/import" className="text-sm font-bold text-amber-600 hover:text-amber-700 underline">Review Now</a>
            </div>
          )}
          {pendingSavings > 0 && (
            <div className="flex-1 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CheckSquare className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-900">{pendingSavings} Savings Adjustments Pending</p>
                  <p className="text-xs text-blue-600">Employee percentage changes await approval</p>
                </div>
              </div>
              <a href="/finance/savings/requests" className="text-sm font-bold text-blue-600 hover:text-blue-700 underline">Approve</a>
            </div>
          )}
        </div>
      )}

      {}
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

      {}
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
              Saving Analyzer (Savings vs Loans)
            </h2>
            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <Eye className="h-4 w-4" />
            </button>
          </div>
          <div className="h-64 sm:h-[300px]">
            <SavingAnalyzer dashboardData={dashboardData} />
          </div>
        </motion.div>
      </div>

      {}
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

      {}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {}
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

        {}
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
