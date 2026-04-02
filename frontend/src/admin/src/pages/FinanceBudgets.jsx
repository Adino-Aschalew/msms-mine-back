import React, { useState, useEffect } from 'react';
import { 
  Target,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  Calendar,
  Plus,
  Filter,
  Download,
  Loader2
} from 'lucide-react';
import { financeAPI } from '../../../shared/services/financeAPI';

const FinanceBudgets = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('current');
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const response = await financeAPI.getBudgets();
      if (response.success) {
        setBudgets(response.data || []);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching budgets:', error);
      setLoading(false);
    }
  };

  const totalAllocated = budgets.reduce((sum, budget) => sum + parseFloat(budget.allocated || 0), 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + parseFloat(budget.spent || 0), 0);
  const totalRemaining = totalAllocated - totalSpent;

  const getBudgetStatus = (budget) => {
    const percentageSpent = (budget.spent / budget.allocated) * 100;
    
    if (percentageSpent > 100) return { status: 'over-budget', color: 'red', icon: TrendingUp };
    if (percentageSpent > 90) return { status: 'warning', color: 'yellow', icon: AlertTriangle };
    return { status: 'on-track', color: 'green', icon: TrendingDown };
  };

  const BudgetCard = ({ budget }) => {
    const statusInfo = getBudgetStatus(budget);
    const percentageSpent = (budget.spent / budget.allocated) * 100;
    const StatusIcon = statusInfo.icon;

    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{budget.department}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{budget.category}</p>
          </div>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            statusInfo.color === 'red' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
            statusInfo.color === 'yellow' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
            'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
          }`}>
            <StatusIcon className="h-3 w-3" />
            {statusInfo.status.replace('-', ' ')}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Allocated</span>
            <span className="text-lg font-bold text-gray-900 dark:text-white">${budget.allocated.toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Spent</span>
            <span className={`text-lg font-bold ${
              budget.spent > budget.allocated ? 'text-red-600' : 'text-gray-900 dark:text-white'
            }`}>
              ${budget.spent.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Remaining</span>
            <span className={`text-lg font-bold ${
              budget.remaining < 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              ${budget.remaining.toLocaleString()}
            </span>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">Usage</span>
              <span className="text-xs font-medium text-gray-900 dark:text-white">{percentageSpent.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
              <div 
                className={`h-2 rounded-full ${
                  percentageSpent > 100 ? 'bg-red-500' :
                  percentageSpent > 90 ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}
                style={{ width: `${Math.min(percentageSpent, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Budget Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Track and manage departmental budgets</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 rounded-lg text-sm font-medium text-white hover:bg-blue-600">
            <Plus className="h-4 w-4" />
            Create Budget
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700">
            <Download className="h-4 w-4" />
            Export Report
          </button>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Allocated</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">${totalAllocated.toLocaleString()}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg dark:bg-blue-900/20">
              <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">${totalSpent.toLocaleString()}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg dark:bg-orange-900/20">
              <DollarSign className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Remaining</p>
              <p className={`text-2xl font-bold ${totalRemaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                ${totalRemaining.toLocaleString()}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg dark:bg-green-900/20">
              <TrendingDown className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Usage Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalAllocated > 0 ? ((totalSpent / totalAllocated) * 100).toFixed(1) : 0}%
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg dark:bg-purple-900/20">
              <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500 mb-4" />
          <p className="text-gray-500">Loading budgets...</p>
        </div>
      ) : budgets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((budget) => (
            <BudgetCard key={budget.id} budget={budget} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center dark:bg-gray-800 dark:border-gray-700">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No budgets found</h3>
          <p className="text-gray-500">Departmental budgets haven't been defined yet.</p>
        </div>
      )}
    </div>
  );
};

export default FinanceBudgets;
