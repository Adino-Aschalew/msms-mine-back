import React, { useState } from 'react';
import { 
  Search,
  Filter,
  Download,
  Plus,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const TransactionsTable = ({ transactions, onAddTransaction }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [dateRange, setDateRange] = useState('30days');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');

  const itemsPerPage = 10;
  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTransactions = transactions.slice(startIndex, endIndex);

  const categories = [
    { name: 'Sales', color: 'blue' },
    { name: 'Services', color: 'green' },
    { name: 'Payroll', color: 'purple' },
    { name: 'Office Supplies', color: 'gray' },
    { name: 'Software', color: 'indigo' },
    { name: 'Marketing', color: 'pink' },
    { name: 'Rent', color: 'yellow' },
    { name: 'Investments', color: 'emerald' }
  ];

  const getCategoryColor = (categoryName) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category ? category.color : 'gray';
  };

  const getCategoryClasses = (categoryName) => {
    const color = getCategoryColor(categoryName);
    return `inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${color}-100 text-${color}-800 dark:bg-${color}-900/20 dark:text-${color}-400`;
  };

  const getCategoryClassesStatic = (categoryName) => {
    const color = getCategoryColor(categoryName);
    switch (color) {
      case 'blue':
        return 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'green':
        return 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'red':
        return 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'purple':
        return 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'indigo':
        return 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400';
      case 'pink':
        return 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400';
      case 'yellow':
        return 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'emerald':
        return 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400';
      default:
        return 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? ChevronUp : ChevronDown;
  };

  const filteredTransactions = paginatedTransactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transaction.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transaction.reference.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === 'all' || transaction.type === filterType;
    const matchesCategory = filterCategory === 'all' || transaction.category === filterCategory;
    
    return matchesSearch && matchesType && matchesCategory;
  });

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'Income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = Math.abs(filteredTransactions
    .filter(t => t.type === 'Expense')
    .reduce((sum, t) => sum + t.amount, 0));

  const totalIncomeFormatted = totalIncome.toLocaleString();
  const totalExpensesFormatted = totalExpenses.toLocaleString();
  const netAmount = Math.abs(totalIncome - totalExpenses).toLocaleString();

  const formatAmount = (amount) => {
    const formatted = Math.abs(amount).toLocaleString();
    return amount >= 0 ? `+${formatted}` : `-${formatted}`;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
      {}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm"
            >
              <option value="all">All Types</option>
              <option value="Income">Income</option>
              <option value="Expense">Expenses</option>
            </select>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.name} value={category.name}>{category.name}</option>
              ))}
            </select>

            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>

            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
              <Download className="h-4 w-4" />
              Export
            </button>

            <button 
              onClick={onAddTransaction}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 rounded-lg text-sm font-medium text-white hover:bg-blue-600"
            >
              <Plus className="h-4 w-4" />
              Add Transaction
            </button>
          </div>
        </div>
      </div>

      {}
      <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-600 dark:text-gray-400">Total Income:</span>
            <span className="font-bold text-green-600">${totalIncomeFormatted}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600 dark:text-gray-400">Total Expenses:</span>
            <span className="font-bold text-red-600">${totalExpensesFormatted}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600 dark:text-gray-400">Net:</span>
            <span className={`font-bold ${totalIncome - totalExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${netAmount}
            </span>
          </div>
        </div>
      </div>

      {}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th 
                onClick={() => handleSort('id')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <div className="flex items-center gap-1">
                  Transaction ID
                  {(() => {
                    const SortIcon = getSortIcon('id');
                    return SortIcon && <SortIcon className="h-4 w-4" />;
                  })()}
                </div>
              </th>
              <th 
                onClick={() => handleSort('date')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <div className="flex items-center gap-1">
                  Date
                  {(() => {
                    const SortIcon = getSortIcon('date');
                    return SortIcon && <SortIcon className="h-4 w-4" />;
                  })()}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Description
              </th>
              <th 
                onClick={() => handleSort('type')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <div className="flex items-center gap-1">
                  Type
                  {(() => {
                    const SortIcon = getSortIcon('type');
                    return SortIcon && <SortIcon className="h-4 w-4" />;
                  })()}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Account
              </th>
              <th 
                onClick={() => handleSort('amount')}
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <div className="flex items-center gap-1 justify-end">
                  Amount
                  {(() => {
                    const SortIcon = getSortIcon('amount');
                    return SortIcon && <SortIcon className="h-4 w-4" />;
                  })()}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredTransactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {transaction.id}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {transaction.reference}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                  {transaction.date}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">
                    {transaction.description}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    transaction.type === 'Income' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {transaction.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={getCategoryClassesStatic(transaction.category)}>
                    {transaction.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                  {transaction.account}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className={`text-sm font-bold ${
                    transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    ${formatAmount(transaction.amount)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    transaction.status === 'completed' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                  }`}>
                    {transaction.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {}
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {startIndex + 1} to {Math.min(endIndex, transactions.length)} of {transactions.length} results
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionsTable;
