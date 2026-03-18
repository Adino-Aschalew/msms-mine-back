import React, { useState } from 'react';
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
  BarChart3
} from 'lucide-react';

const FinanceDashboard = () => {
  const [dateRange, setDateRange] = useState('30days');

  // Mock KPI data
  const kpiData = [
    {
      title: 'Revenue',
      value: '$847,250',
      change: '+12.5%',
      changeType: 'increase',
      icon: DollarSign,
      color: 'blue',
      trend: [65000, 72000, 68000, 75000, 82000, 78000, 85000]
    },
    {
      title: 'Expenses',
      value: '$523,180',
      change: '+8.2%',
      changeType: 'increase',
      icon: Wallet,
      color: 'red',
      trend: [45000, 48000, 46000, 52000, 49000, 51000, 53000]
    },
    {
      title: 'Net Profit',
      value: '$324,070',
      change: '+18.7%',
      changeType: 'increase',
      icon: TrendingUp,
      color: 'green',
      trend: [20000, 24000, 22000, 23000, 33000, 27000, 32000]
    },
    {
      title: 'Cash Balance',
      value: '$1,245,680',
      change: '+5.3%',
      changeType: 'increase',
      icon: Wallet,
      color: 'purple',
      trend: [1100000, 1150000, 1120000, 1180000, 1200000, 1220000, 1240000]
    },
    {
      title: 'Accounts Receivable',
      value: '$187,450',
      change: '-3.2%',
      changeType: 'decrease',
      icon: ArrowUpRight,
      color: 'orange',
      trend: [195000, 192000, 198000, 190000, 188000, 185000, 187000]
    },
    {
      title: 'Accounts Payable',
      value: '$92,340',
      change: '+2.1%',
      changeType: 'increase',
      icon: ArrowDownRight,
      color: 'yellow',
      trend: [85000, 88000, 86000, 90000, 87000, 91000, 92000]
    }
  ];

  // Mock recent transactions
  const recentTransactions = [
    { id: 'TXN001', date: '2024-03-15', type: 'Income', category: 'Sales', account: 'Business Account', amount: 12500, status: 'completed' },
    { id: 'TXN002', date: '2024-03-15', type: 'Expense', category: 'Payroll', account: 'Business Account', amount: -8500, status: 'completed' },
    { id: 'TXN003', date: '2024-03-14', type: 'Income', category: 'Services', account: 'Business Account', amount: 8750, status: 'completed' },
    { id: 'TXN004', date: '2024-03-14', type: 'Expense', category: 'Office Supplies', account: 'Business Account', amount: -450, status: 'pending' },
    { id: 'TXN005', date: '2024-03-13', type: 'Income', category: 'Investments', account: 'Investment Account', amount: 15000, status: 'completed' }
  ];

  // Mock accounts data
  const accounts = [
    { name: 'Business Checking', balance: 845680, lastTransaction: '2024-03-15', type: 'checking' },
    { name: 'Business Savings', balance: 400000, lastTransaction: '2024-03-14', type: 'savings' },
    { name: 'Investment Account', balance: 1250000, lastTransaction: '2024-03-13', type: 'investment' },
    { name: 'Corporate Credit Card', balance: -45200, lastTransaction: '2024-03-15', type: 'credit' }
  ];

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
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-200 dark:bg-gray-800 dark:border-gray-700">
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
              style={{ height: `${(value / Math.max(...kpi.trend)) * 100}%` }}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Financial Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Welcome back! Here's your financial overview.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
            <button
              onClick={() => setDateRange('7days')}
              className={`px-3 py-2 text-sm font-medium rounded-l-lg transition-colors ${
                dateRange === '7days' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setDateRange('30days')}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                dateRange === '30days' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setDateRange('quarter')}
              className={`px-3 py-2 text-sm font-medium rounded-r-lg transition-colors ${
                dateRange === 'quarter' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              Quarter
            </button>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {kpiData.map((kpi) => (
          <KPICard key={kpi.title} kpi={kpi} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue vs Expenses Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue vs Expenses</h2>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Revenue</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Expenses</span>
              </div>
            </div>
          </div>
          <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Chart visualization would go here</p>
              <p className="text-sm">Revenue and expense trends over time</p>
            </div>
          </div>
        </div>

        {/* Accounts Overview */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Accounts Overview</h2>
          <div className="space-y-4">
            {accounts.map((account) => (
              <div key={account.name} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{account.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Last: {account.lastTransaction}</p>
                </div>
                <p className={`text-sm font-bold ${
                  account.balance >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {account.balance >= 0 ? '+' : ''}${Math.abs(account.balance).toLocaleString()}
                </p>
              </div>
            ))}
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
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Transaction ID</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Type</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Category</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Account</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white">Amount</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((transaction) => (
                <tr key={transaction.id} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{transaction.id}</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{transaction.date}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      transaction.type === 'Income' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {transaction.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{transaction.category}</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{transaction.account}</td>
                  <td className={`py-3 px-4 text-right font-medium ${
                    transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.amount >= 0 ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
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
        </div>
      </div>
    </div>
  );
};

export default FinanceDashboard;
