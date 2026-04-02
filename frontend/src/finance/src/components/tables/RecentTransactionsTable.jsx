import React from 'react';
import { ArrowUpRight, ArrowDownRight, ArrowRightLeft, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow, isValid, parseISO } from 'date-fns';
import { financeAPI } from '../../../../shared/services/financeAPI';

const RecentTransactionsTable = ({ limit = 10 }) => {
  
  const formatCompactNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'METB';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'KETB';
    }
    return num.toString();
  };

  const [transactions, setTransactions] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const response = await financeAPI.getRecentTransactions(limit);
        
        const transactionData = response?.data || response || [];
        setTransactions(Array.isArray(transactionData) ? transactionData : []);
      } catch (err) {
        console.error('Failed to fetch transactions:', err);
        setTransactions([]); 
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [limit]);

  if (loading) return <div className="p-4 text-center">Loading transactions...</div>;

  const getTypeIcon = (type) => {
    const normalizedType = String(type).toLowerCase();
    switch (normalizedType) {
      case 'income':
      case 'contribution':
        return <ArrowUpRight className="h-4 w-4 text-green-500" />;
      case 'expense':
      case 'withdrawal':
      case 'payment':
        return <ArrowDownRight className="h-4 w-4 text-red-500" />;
      case 'transfer':
        return <ArrowRightLeft className="h-4 w-4 text-blue-500" />;
      default:
        return <ArrowRightLeft className="h-4 w-4 text-gray-500" />;
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
          {Array.isArray(transactions) && transactions.map((transaction) => (
            <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td className="py-3">
                <div className="flex items-center space-x-3">
                  {getTypeIcon(transaction.type)}
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      TXN-{transaction.id}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {transaction.date ? formatDistanceToNow(new Date(transaction.date), { addSuffix: true }) : 'N/A'}
                    </p>
                  </div>
                </div>
              </td>
              <td className="py-3">
                <p className="text-sm text-gray-900 dark:text-white">
                  {transaction.category}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {transaction.user_name}
                </p>
              </td>
              <td className="py-3">
                <p className="text-sm text-gray-900 dark:text-white">
                  {transaction.account}
                </p>
              </td>
              <td className="py-3 text-right">
                <p className={`text-sm font-medium ${
                  ['income', 'contribution'].includes(String(transaction.type).toLowerCase())
                    ? 'text-green-600 dark:text-green-400' 
                    : ['expense', 'withdrawal', 'payment'].includes(String(transaction.type).toLowerCase())
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-blue-600 dark:text-blue-400'
                }`}>
                  {['income', 'contribution'].includes(String(transaction.type).toLowerCase()) ? '+' : ['expense', 'withdrawal', 'payment'].includes(String(transaction.type).toLowerCase()) ? '-' : ''}
                  {formatCompactNumber(parseFloat(transaction.amount || 0))}
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
          {!Array.isArray(transactions) || transactions.length === 0 ? (
            <tr>
              <td colSpan="6" className="py-8 text-center text-gray-500 dark:text-gray-400">
                No transactions found
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
};

export default RecentTransactionsTable;
