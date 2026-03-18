import React from 'react';
import { Wallet, CreditCard, DollarSign, Smartphone, TrendingUp, TrendingDown } from 'lucide-react';

const AccountsOverview = () => {
  const accounts = [
    {
      name: 'Business Checking',
      type: 'bank',
      balance: 45892,
      change: 2.4,
      icon: Wallet,
      color: 'blue',
    },
    {
      name: 'Business Savings',
      type: 'savings',
      balance: 125000,
      change: 0.8,
      icon: DollarSign,
      color: 'green',
    },
    {
      name: 'Company Credit Card',
      type: 'credit',
      balance: -8500,
      change: -5.2,
      icon: CreditCard,
      color: 'purple',
    },
    {
      name: 'Digital Wallet',
      type: 'wallet',
      balance: 3200,
      change: 12.5,
      icon: Smartphone,
      color: 'orange',
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
                {account.balance >= 0 ? '' : '-'}$
                {Math.abs(account.balance).toLocaleString()}
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
            Total Balance
          </p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            ${(45892 + 125000 - 8500 + 3200).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccountsOverview;
