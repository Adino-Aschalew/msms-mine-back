import React from 'react';
import { ArrowUpRight, ArrowDownRight, ArrowRightLeft, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const RecentTransactionsTable = ({ limit = 10 }) => {
  const transactions = [
    {
      id: 'TRX001',
      date: new Date(Date.now() - 1000 * 60 * 30),
      type: 'income',
      category: 'Salary',
      account: 'Business Account',
      amount: 45000,
      status: 'completed',
      description: 'Monthly salary payment',
    },
    {
      id: 'TRX002',
      date: new Date(Date.now() - 1000 * 60 * 60 * 2),
      type: 'expense',
      category: 'Office Rent',
      account: 'Business Account',
      amount: 5000,
      status: 'completed',
      description: 'Monthly office rent',
    },
    {
      id: 'TRX003',
      date: new Date(Date.now() - 1000 * 60 * 60 * 4),
      type: 'expense',
      category: 'Software',
      account: 'Credit Card',
      amount: 1200,
      status: 'completed',
      description: 'Annual software license',
    },
    {
      id: 'TRX004',
      date: new Date(Date.now() - 1000 * 60 * 60 * 6),
      type: 'income',
      category: 'Client Payment',
      account: 'Business Account',
      amount: 15000,
      status: 'completed',
      description: 'Project payment - ABC Corp',
    },
    {
      id: 'TRX005',
      date: new Date(Date.now() - 1000 * 60 * 60 * 8),
      type: 'transfer',
      category: 'Transfer',
      account: 'Business Account',
      amount: 3000,
      status: 'pending',
      description: 'Transfer to savings account',
    },
  ].slice(0, limit);

  const getTypeIcon = (type) => {
    switch (type) {
      case 'income':
        return <ArrowUpRight className="h-4 w-4 text-green-500" />;
      case 'expense':
        return <ArrowDownRight className="h-4 w-4 text-red-500" />;
      case 'transfer':
        return <ArrowRightLeft className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status] || styles.pending}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            <th className="pb-3">Transaction</th>
            <th className="pb-3">Category</th>
            <th className="pb-3">Account</th>
            <th className="pb-3 text-right">Amount</th>
            <th className="pb-3">Status</th>
            <th className="pb-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td className="py-3">
                <div className="flex items-center space-x-3">
                  {getTypeIcon(transaction.type)}
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {transaction.id}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDistanceToNow(transaction.date, { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </td>
              <td className="py-3">
                <p className="text-sm text-gray-900 dark:text-white">
                  {transaction.category}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {transaction.description}
                </p>
              </td>
              <td className="py-3">
                <p className="text-sm text-gray-900 dark:text-white">
                  {transaction.account}
                </p>
              </td>
              <td className="py-3 text-right">
                <p className={`text-sm font-medium ${
                  transaction.type === 'income' 
                    ? 'text-green-600 dark:text-green-400' 
                    : transaction.type === 'expense'
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-blue-600 dark:text-blue-400'
                }`}>
                  {transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '-' : ''}
                  ${transaction.amount.toLocaleString()}
                </p>
              </td>
              <td className="py-3">
                {getStatusBadge(transaction.status)}
              </td>
              <td className="py-3">
                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecentTransactionsTable;
