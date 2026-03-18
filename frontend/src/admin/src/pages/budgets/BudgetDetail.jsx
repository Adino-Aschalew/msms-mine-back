import React, { useState } from 'react';
import { 
  ArrowLeft,
  Target,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  Calendar,
  Edit,
  Save,
  X,
  BarChart3,
  PieChart
} from 'lucide-react';

const BudgetDetail = ({ budgetId, onBack }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [budget, setBudget] = useState({
    id: budgetId,
    department: 'Engineering',
    category: 'Salaries',
    allocated: 500000,
    spent: 425000,
    remaining: 75000,
    period: 'Q1 2024',
    status: 'on-track',
    notes: 'Quarterly budget for engineering team salaries and benefits',
    manager: 'Jane Doe',
    createdDate: '2024-01-01',
    lastModified: '2024-03-10'
  });

  const [formData, setFormData] = useState({ ...budget });

  const handleSave = () => {
    setBudget({ ...formData, lastModified: new Date().toISOString().split('T')[0] });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({ ...budget });
    setIsEditing(false);
  };

  const percentageUsed = (budget.spent / budget.allocated) * 100;
  const statusColor = budget.status === 'on-track' ? 'text-green-600' : 
                      budget.status === 'over-budget' ? 'text-red-600' : 'text-yellow-600';

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {budget.department} - {budget.category}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Budget Period: {budget.period}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit
            </button>
          )}
        </div>
      </div>

      {/* Budget Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 dark:text-blue-400">Allocated</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                ${budget.allocated.toLocaleString()}
              </p>
            </div>
            <Target className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 dark:text-green-400">Spent</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                ${budget.spent.toLocaleString()}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 dark:text-yellow-400">Remaining</p>
              <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                ${budget.remaining.toLocaleString()}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 dark:text-purple-400">Usage</p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {percentageUsed.toFixed(1)}%
              </p>
            </div>
            <PieChart className="h-8 w-8 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Budget Utilization
          </span>
          <span className={`text-sm font-medium ${statusColor}`}>
            {budget.status.charAt(0).toUpperCase() + budget.status.slice(1).replace('-', ' ')}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${
              percentageUsed > 90 ? 'bg-red-500' :
              percentageUsed > 75 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(percentageUsed, 100)}%` }}
          />
        </div>
      </div>

      {/* Budget Details Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Department
          </label>
          {isEditing ? (
            <input
              type="text"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          ) : (
            <p className="text-gray-900 dark:text-white">{budget.department}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category
          </label>
          {isEditing ? (
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          ) : (
            <p className="text-gray-900 dark:text-white">{budget.category}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Allocated Amount
          </label>
          {isEditing ? (
            <input
              type="number"
              value={formData.allocated}
              onChange={(e) => setFormData({ ...formData, allocated: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          ) : (
            <p className="text-gray-900 dark:text-white">${budget.allocated.toLocaleString()}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Budget Manager
          </label>
          {isEditing ? (
            <input
              type="text"
              value={formData.manager}
              onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          ) : (
            <p className="text-gray-900 dark:text-white">{budget.manager}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Notes
          </label>
          {isEditing ? (
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          ) : (
            <p className="text-gray-900 dark:text-white">{budget.notes}</p>
          )}
        </div>
      </div>

      {/* Metadata */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-500 dark:text-gray-400">Created:</span>
            <span className="ml-2 text-gray-900 dark:text-white">{budget.createdDate}</span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Last Modified:</span>
            <span className="ml-2 text-gray-900 dark:text-white">{budget.lastModified}</span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Budget ID:</span>
            <span className="ml-2 text-gray-900 dark:text-white">{budget.id}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetDetail;
