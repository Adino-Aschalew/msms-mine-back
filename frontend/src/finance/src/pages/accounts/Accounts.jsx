import React, { useState } from 'react';
import { FiPlus, FiSearch, FiFilter, FiMoreVertical } from 'react-icons/fi';

const Accounts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Mock data
  const accounts = [
    {
      id: 1,
      name: 'Main Checking Account',
      type: 'Checking',
      balance: 25000.00,
      currency: 'USD',
      status: 'Active',
      lastTransaction: '2024-01-15'
    },
    {
      id: 2,
      name: 'Business Savings',
      type: 'Savings',
      balance: 150000.00,
      currency: 'USD',
      status: 'Active',
      lastTransaction: '2024-01-14'
    },
    {
      id: 3,
      name: 'Emergency Fund',
      type: 'Savings',
      balance: 50000.00,
      currency: 'USD',
      status: 'Active',
      lastTransaction: '2024-01-10'
    }
  ];

  const filteredAccounts = accounts.filter(account =>
    account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Accounts</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your financial accounts</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <FiPlus className="w-4 h-4" />
          Add Account
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search accounts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <FiFilter className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAccounts.map((account) => (
          <div key={account.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{account.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{account.type}</p>
              </div>
              <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <FiMoreVertical className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-gray-600 dark:text-gray-400">Balance</span>
                <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  ${account.balance.toLocaleString()}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  account.status === 'Active' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                }`}>
                  {account.status}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Last Transaction</span>
                <span className="text-sm text-gray-900 dark:text-gray-100">{account.lastTransaction}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAccounts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">No accounts found matching your search.</p>
        </div>
      )}
    </div>
  );
};

export default Accounts;
