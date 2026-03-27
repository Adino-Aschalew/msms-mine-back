import React, { useState, useEffect } from 'react';
import { Wallet, CreditCard, DollarSign, Smartphone, TrendingUp, TrendingDown, Users, Briefcase } from 'lucide-react';
import { financeAPI } from '../../../../shared/services/financeAPI';

const AccountsOverview = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await financeAPI.getFinancialOverview('MONTHLY');
        setData(response);
      } catch (err) {
        console.error('Failed to fetch accounts overview:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-4 text-center">Loading accounts...</div>;

  const accounts = [
    {
      name: 'Total Savings',
      type: 'savings',
      balance: data?.savings?.total_savings || 0,
      change: 0,
      icon: DollarSign,
      color: 'green',
    },
    {
      name: 'Total Loans',
      type: 'loans',
      balance: data?.loans?.total_loans || 0,
      change: 0,
      icon: Briefcase,
      color: 'blue',
    },
    {
      name: 'Active Members',
      type: 'members',
      balance: data?.savings?.active_accounts || 0,
      change: 0,
      icon: Users,
      color: 'orange',
    },
    {
      name: 'Monthly Payroll',
      type: 'payroll',
      balance: data?.payroll?.total_amount || 0,
      change: 0,
      icon: Wallet,
      color: 'purple',
    },
  ];

  const getIconBackground = (color) => {
    const backgrounds = {
      blue: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
      green: 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400',
      purple: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
      orange: 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
    };
    return backgrounds[color] || backgrounds.blue;
  };

  return (
    <div className="space-y-3">
      {accounts.map((account) => {
        const Icon = account.icon;
        return (
          <div
            key={account.name}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${getIconBackground(account.color)}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {account.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {account.type}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {account.balance >= 0 ? '' : '-'}
                {Math.abs(account.balance).toLocaleString()} ETB
              </p>
              <div className="flex items-center justify-end space-x-1">
                {account.change >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <span
                  className={`text-xs ${
                    account.change >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {Math.abs(account.change)}%
                </span>
              </div>
            </div>
          </div>
        );
      })}
      
      <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            Net Position
          </p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {((data?.savings?.total_savings || 0) - (data?.loans?.total_loans || 0)).toLocaleString()} ETB
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccountsOverview;
