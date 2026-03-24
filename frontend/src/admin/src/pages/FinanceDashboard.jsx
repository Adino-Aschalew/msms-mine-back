import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Download,
  Filter,
  BarChart3,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { financeAPI } from '../../../shared/services/financeAPI';

const FinanceDashboard = () => {
  const [dateRange, setDateRange] = useState('MONTHLY');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [overview, transactions] = await Promise.all([
        financeAPI.getFinancialOverview(dateRange),
        financeAPI.getRecentTransactions(5)
      ]);
      setData(overview);
      setRecentTransactions(transactions);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load financial data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // KPI mapping from real data
  const getKpiData = () => {
    if (!data) return [];

    const revenue = data.transactions.savings.total_contributions + data.transactions.loans.total_payments;
    const expenses = data.transactions.savings.total_withdrawals + data.payroll.total_amount;
    const profit = revenue - expenses;

    return [
      {
        title: 'Total Revenue',
        value: `$${revenue.toLocaleString()}`,
        change: '+0.0%',
        changeType: 'increase',
        icon: DollarSign,
        color: 'blue',
        trend: [revenue * 0.8, revenue * 0.9, revenue]
      },
      {
        title: 'Total Expenses',
        value: `$${expenses.toLocaleString()}`,
        change: '+0.0%',
        changeType: 'increase',
        icon: Wallet,
        color: 'red',
        trend: [expenses * 0.7, expenses * 0.85, expenses]
      },
      {
        title: 'Net Profit',
        value: `$${profit.toLocaleString()}`,
        change: '+0.0%',
        changeType: profit >= 0 ? 'increase' : 'decrease',
        icon: TrendingUp,
        color: 'green',
        trend: [profit * 0.5, profit * 0.75, profit]
      },
      {
        title: 'Total Savings',
        value: `$${data.savings.total_savings.toLocaleString()}`,
        change: '+0.0%',
        changeType: 'increase',
        icon: Wallet,
        color: 'purple',
        trend: [data.savings.total_savings * 0.9, data.savings.total_savings]
      },
      {
        title: 'Active Loans',
        value: `$${data.loans.total_loans.toLocaleString()}`,
        change: '+0.0%',
        changeType: 'increase',
        icon: ArrowUpRight,
        color: 'orange',
        trend: [data.loans.total_loans * 0.8, data.loans.total_loans]
      },
      {
        title: 'Payroll Amount',
        value: `$${data.payroll.total_amount.toLocaleString()}`,
        change: '+0.0%',
        changeType: 'increase',
        icon: ArrowDownRight,
        color: 'yellow',
        trend: [data.payroll.total_amount * 0.95, data.payroll.total_amount]
      }
    ];
  };

  // Filter out accounts overview as those aren't readily available in getFinancialOverview
  // Use mock or partial data if available
  const accounts = data ? [
    { name: 'Savings Accounts', balance: data.savings.total_savings, type: 'savings', count: data.savings.active_accounts },
    { name: 'Loan Portfolio', balance: data.loans.total_loans, type: 'loans', count: data.loans.active_loans },
    { name: 'Recent Payroll', balance: -data.payroll.total_amount, type: 'payroll', count: data.payroll.total_payrolls }
  ] : [];

  const KPICard = ({ kpi }) => {
    const getIconBgColor = () => {
      switch (kpi.color) {
        case 'blue': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400';
        case 'red': return 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400';
        case 'green': return 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400';
        case 'purple': return 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400';
        case 'orange': return 'bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400';
        case 'yellow': return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400';
        default: return 'bg-gray-100 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400';
      }
    };

    const getChangeColor = () => {
      return kpi.changeType === 'increase' ? 'text-green-600' : 'text-red-600';
    };

    const getChangeIcon = () => {
      return kpi.changeType === 'increase' ? TrendingUp : TrendingDown;
    };

    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-200 dark:bg-gray-800 dark:border-gray-700 font-inter">
        <div className="flex items-center justify-between mb-4">
          <div className={`rounded-lg p-3 ${getIconBgColor()}`}>
            <kpi.icon className="h-6 w-6" />
          </div>
          <div className={`flex items-center gap-1 text-sm font-medium ${getChangeColor()}`}>
            <getChangeIcon className="h-4 w-4" />
            {kpi.change}
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{kpi.value}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{kpi.title}</p>
        </div>

        {/* Mini trend chart */}
        <div className="h-12 flex items-end gap-1">
          {kpi.trend.map((value, index) => (
            <div
              key={index}
              className="flex-1 bg-blue-500/20 dark:bg-blue-400/20 rounded-t"
              style={{ height: `${(value / Math.max(...kpi.trend, 1)) * 100}%` }}
            />
          ))}
        </div>
      </div>
    );
  };

  if (loading && !data) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
        <p className="text-gray-600 dark:text-gray-400">Fetching latest financial records...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center dark:bg-red-900/20 dark:border-red-900/30">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Something went wrong</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
        <button 
          onClick={fetchDashboardData}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Financial Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Welcome back! Real-time summary of microfinance performance.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
            {[
              { label: 'Daily', value: 'DAILY' },
              { label: 'Weekly', value: 'WEEKLY' },
              { label: 'Monthly', value: 'MONTHLY' },
              { label: 'Yearly', value: 'YEARLY' }
            ].map((p) => (
              <button
                key={p.value}
                onClick={() => setDateRange(p.value)}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  dateRange === p.value 
                    ? 'bg-blue-500 text-white first:rounded-l-lg last:rounded-r-lg' 
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700">
            <Filter className="h-4 w-4" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 rounded-lg text-sm font-medium text-white hover:bg-blue-600">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {getKpiData().map((kpi) => (
          <KPICard key={kpi.title} kpi={kpi} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue vs Expenses Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Financial Summary ({dateRange})</h2>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Savings</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Loan Portfolio</span>
              </div>
            </div>
          </div>
          <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
            {loading ? <Loader2 className="h-8 w-8 animate-spin" /> : (
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Data successfully retrieved for {dateRange}</p>
                <div className="mt-4 flex gap-4 text-xs font-mono">
                   <div className="p-2 border rounded">Savings: {data?.savings.total_savings}</div>
                   <div className="p-2 border rounded">Loans: {data?.loans.total_loans}</div>
                   <div className="p-2 border rounded">Payroll: {data?.payroll.total_amount}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Accounts Summary */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Module Overview</h2>
          <div className="space-y-4">
            {accounts.map((account) => (
              <div key={account.name} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{account.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{account.count} active items</p>
                </div>
                <p className={`text-sm font-black ${
                  account.balance >= 0 ? 'text-green-600' : 'text-orange-500'
                }`}>
                  {account.balance >= 0 ? '+' : ''}${Math.abs(account.balance).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Transactions</h2>
          <button className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
            View All
          </button>
        </div>
        <div className="overflow-x-auto">
          {recentTransactions && recentTransactions.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left font-medium text-gray-900 dark:text-white py-3 px-4">Date</th>
                  <th className="text-left font-medium text-gray-900 dark:text-white py-3 px-4">Name</th>
                  <th className="text-left font-medium text-gray-900 dark:text-white py-3 px-4">Type</th>
                  <th className="text-left font-medium text-gray-900 dark:text-white py-3 px-4">Category</th>
                  <th className="text-right font-medium text-gray-900 dark:text-white py-3 px-4">Amount</th>
                  <th className="text-left font-medium text-gray-900 dark:text-white py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{new Date(transaction.date).toLocaleDateString()}</td>
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{transaction.user_name}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">
                        {transaction.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{transaction.category}</td>
                    <td className={`py-3 px-4 text-right font-medium ${
                      transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.amount >= 0 ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        transaction.status === 'completed' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                      }`}>
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-12 text-center text-gray-500">
               <p>No recent transactions found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinanceDashboard;
