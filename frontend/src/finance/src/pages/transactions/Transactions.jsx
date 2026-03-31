import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, ArrowRightLeft, Search, Filter, Download, Plus } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const Transactions = ({ filter = 'all' }) => {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState(filter);

  // Compact number formatting function
  const formatCompactNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'METB';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'KETB';
    }
    return num.toString();
  };

  const transactions = [
    { id: 1, description: 'Client Payment - Tech Solutions', amount: 15000, type: 'income', status: 'completed', date: '2024-03-15', category: 'Sales' },
    { id: 2, description: 'Office Rent Payment', amount: -3500, type: 'expense', status: 'completed', date: '2024-03-14', category: 'Operations' },
    { id: 3, description: 'Software License Renewal', amount: -1200, type: 'expense', status: 'pending', date: '2024-03-13', category: 'Technology' },
    { id: 4, description: 'Consulting Services', amount: 8500, type: 'income', status: 'completed', date: '2024-03-12', category: 'Services' },
    { id: 5, description: 'Marketing Campaign', amount: -2500, type: 'expense', status: 'completed', date: '2024-03-11', category: 'Marketing' },
    { id: 6, description: 'Product Sales - Enterprise Client', amount: 25000, type: 'income', status: 'completed', date: '2024-03-10', category: 'Sales' },
    { id: 7, description: 'Employee Salaries', amount: -18000, type: 'expense', status: 'completed', date: '2024-03-09', category: 'Payroll' },
    { id: 8, description: 'Equipment Purchase', amount: -3200, type: 'expense', status: 'pending', date: '2024-03-08', category: 'Assets' },
  ];

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || 
      (selectedFilter === 'income' && transaction.type === 'income') ||
      (selectedFilter === 'expenses' && transaction.type === 'expense') ||
      (selectedFilter === 'transfers' && transaction.type === 'transfer');
    return matchesSearch && matchesFilter;
  });

  const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = Math.abs(filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>
          Transactions
        </h1>
        <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Manage and track all financial transactions
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`bg-white ${theme === 'dark' ? 'dark:bg-slate-800' : ''} border border-gray-200 ${theme === 'dark' ? 'dark:border-slate-600' : ''} rounded-lg p-6 shadow-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Total Balance</p>
              <p className="text-3xl font-bold text-blue-600">
                {formatCompactNumber(totalIncome - totalExpenses)}
              </p>
            </div>
            <ArrowRightLeft className="h-10 w-10 text-blue-500" />
          </div>
        </div>
        
        <div className={`bg-white ${theme === 'dark' ? 'dark:bg-slate-800' : ''} border border-gray-200 ${theme === 'dark' ? 'dark:border-slate-600' : ''} rounded-lg p-6 shadow-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Total Income</p>
              <p className="text-3xl font-bold text-green-600">
                {formatCompactNumber(totalIncome)}
              </p>
            </div>
            <ArrowUpRight className="h-10 w-10 text-green-500" />
          </div>
        </div>
        
        <div className={`bg-white ${theme === 'dark' ? 'dark:bg-slate-800' : ''} border border-gray-200 ${theme === 'dark' ? 'dark:border-slate-600' : ''} rounded-lg p-6 shadow-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Total Expenses</p>
              <p className="text-3xl font-bold text-red-600">
                {formatCompactNumber(totalExpenses)}
              </p>
            </div>
            <ArrowDownRight className="h-10 w-10 text-red-500" />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <button className="flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-md transition-colors">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </button>
            <button className="flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-md transition-colors">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
            <button className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors">
              <Plus className="h-4 w-4 mr-2" />
              Add Transaction
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`font-medium ${
                      transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.amount > 0 ? '+' : ''}{formatCompactNumber(Math.abs(transaction.amount))}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      transaction.status === 'completed' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
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

export default Transactions;
