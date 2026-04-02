import React, { useState } from 'react';
import { Plus, TrendingUp, TrendingDown, DollarSign, Target, Calendar, Filter, Download, Eye, AlertCircle, CheckCircle } from 'lucide-react';

const Budgets = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const budgets = [
    {
      id: 1,
      name: 'Marketing Budget Q1 2024',
      category: 'Marketing',
      allocated: 25000,
      spent: 18750,
      remaining: 6250,
      status: 'on-track',
      period: 'quarterly',
      startDate: '2024-01-01',
      endDate: '2024-03-31',
      manager: 'Emily Rodriguez',
      alertThreshold: 80
    },
    {
      id: 2,
      name: 'Operations Monthly',
      category: 'Operations',
      allocated: 15000,
      spent: 16200,
      remaining: -1200,
      status: 'over-budget',
      period: 'monthly',
      startDate: '2024-03-01',
      endDate: '2024-03-31',
      manager: 'David Kim',
      alertThreshold: 90
    },
    {
      id: 3,
      name: 'Technology Annual',
      category: 'Technology',
      allocated: 120000,
      spent: 45000,
      remaining: 75000,
      status: 'on-track',
      period: 'yearly',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      manager: 'Sarah Johnson',
      alertThreshold: 75
    },
    {
      id: 4,
      name: 'Payroll Monthly',
      category: 'Payroll',
      allocated: 45000,
      spent: 43200,
      remaining: 1800,
      status: 'on-track',
      period: 'monthly',
      startDate: '2024-03-01',
      endDate: '2024-03-31',
      manager: 'Jessica Taylor',
      alertThreshold: 95
    },
    {
      id: 5,
      name: 'Research & Development',
      category: 'R&D',
      allocated: 35000,
      spent: 28000,
      remaining: 7000,
      status: 'warning',
      period: 'quarterly',
      startDate: '2024-01-01',
      endDate: '2024-03-31',
      manager: 'Michael Chen',
      alertThreshold: 85
    },
    {
      id: 6,
      name: 'Client Entertainment',
      category: 'Sales',
      allocated: 8000,
      spent: 3200,
      remaining: 4800,
      status: 'on-track',
      period: 'monthly',
      startDate: '2024-03-01',
      endDate: '2024-03-31',
      manager: 'Robert Wilson',
      alertThreshold: 80
    }
  ];

  const filteredBudgets = budgets.filter(budget => {
    const matchesStatus = selectedStatus === 'all' || budget.status === selectedStatus;
    const matchesPeriod = selectedPeriod === 'all' || budget.period === selectedPeriod;
    return matchesStatus && matchesPeriod;
  });

  const totalAllocated = filteredBudgets.reduce((sum, budget) => sum + budget.allocated, 0);
  const totalSpent = filteredBudgets.reduce((sum, budget) => sum + budget.spent, 0);
  const totalRemaining = filteredBudgets.reduce((sum, budget) => sum + budget.remaining, 0);

  const getStatusColor = (status) => {
    switch (status) {
      case 'on-track': return 'green';
      case 'warning': return 'yellow';
      case 'over-budget': return 'red';
      default: return 'gray';
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-6">
      {}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Budgets
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Create and manage budget plans
        </p>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Allocated</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${(totalAllocated / 1000).toFixed(0)}K
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Spent</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                ${(totalSpent / 1000).toFixed(0)}K
              </p>
            </div>
            <TrendingDown className="h-8 w-8 text-red-500" />
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Remaining</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                ${(totalRemaining / 1000).toFixed(0)}K
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Budgets</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {filteredBudgets.length}
              </p>
            </div>
            <Target className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="all">All Periods</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="on-track">On Track</option>
            <option value="warning">Warning</option>
            <option value="over-budget">Over Budget</option>
          </select>
          
          <button className="btn btn-outline">
            <Calendar className="h-4 w-4 mr-2" />
            Date Range
          </button>
          <button className="btn btn-outline">
            <Filter className="h-4 w-4 mr-2" />
            Advanced Filter
          </button>
          <button className="btn btn-outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button className="btn btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            New Budget
          </button>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBudgets.map((budget) => {
          const percentageSpent = (budget.spent / budget.allocated) * 100;
          const statusColor = getStatusColor(budget.status);
          
          return (
            <div key={budget.id} className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {budget.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {budget.category}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  statusColor === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  statusColor === 'yellow' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                  'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {budget.status === 'on-track' ? 'On Track' :
                   budget.status === 'warning' ? 'Warning' : 'Over Budget'}
                </span>
              </div>
              
              {}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Spent</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {percentageSpent.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getProgressColor(percentageSpent)}`}
                    style={{ width: `${Math.min(percentageSpent, 100)}%` }}
                  />
                </div>
              </div>
              
              {}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Allocated</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    ${budget.allocated.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Spent</span>
                  <span className="font-medium text-red-600 dark:text-red-400">
                    ${budget.spent.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Remaining</span>
                  <span className={`font-medium ${
                    budget.remaining >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    ${budget.remaining.toLocaleString()}
                  </span>
                </div>
              </div>
              
              {}
              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1 mb-4">
                <div className="flex justify-between">
                  <span>Period:</span>
                  <span className="capitalize">{budget.period}</span>
                </div>
                <div className="flex justify-between">
                  <span>Manager:</span>
                  <span>{budget.manager}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ends:</span>
                  <span>{budget.endDate}</span>
                </div>
              </div>
              
              {}
              {percentageSpent >= budget.alertThreshold && (
                <div className="flex items-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg mb-4">
                  <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mr-2" />
                  <span className="text-xs text-yellow-800 dark:text-yellow-200">
                    Alert threshold ({budget.alertThreshold}%) reached
                  </span>
                </div>
              )}
              
              {}
              <div className="flex gap-2">
                <button className="flex-1 btn btn-outline text-sm">
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </button>
                <button className="flex-1 btn btn-outline text-sm">
                  Edit
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Budget Performance Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { category: 'Marketing', allocated: 25000, spent: 18750, efficiency: 75 },
            { category: 'Operations', allocated: 15000, spent: 16200, efficiency: 108 },
            { category: 'Technology', allocated: 120000, spent: 45000, efficiency: 38 }
          ].map((cat, index) => (
            <div key={index} className="text-center">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                {cat.category}
              </h3>
              <div className="mb-2">
                <div className="text-xs text-gray-500 dark:text-gray-400">Efficiency</div>
                <div className={`text-lg font-bold ${
                  cat.efficiency <= 80 ? 'text-green-600 dark:text-green-400' :
                  cat.efficiency <= 100 ? 'text-yellow-600 dark:text-yellow-400' :
                  'text-red-600 dark:text-red-400'
                }`}>
                  {cat.efficiency}%
                </div>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    cat.efficiency <= 80 ? 'bg-green-500' :
                    cat.efficiency <= 100 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(cat.efficiency, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>${(cat.spent / 1000).toFixed(0)}K spent</span>
                <span>${(cat.allocated / 1000).toFixed(0)}K total</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Budgets;
