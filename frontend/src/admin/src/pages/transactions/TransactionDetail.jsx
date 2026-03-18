import React, { useState } from 'react';
import { 
  ArrowLeft,
  DollarSign,
  Calendar,
  Building,
  CreditCard,
  ShoppingCart,
  Home,
  Car,
  Utensils,
  Briefcase,
  Edit,
  Save,
  X,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  User,
  TrendingUp,
  TrendingDown,
  Receipt,
  Tag
} from 'lucide-react';

const TransactionDetail = ({ transactionId, onBack }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  const [transaction, setTransaction] = useState({
    id: transactionId,
    date: '2024-03-15',
    description: 'Client Payment - Tech Solutions Inc',
    type: 'Income',
    category: 'Sales',
    account: 'Business Checking',
    amount: 12500,
    status: 'completed',
    reference: 'INV-2024-045',
    paymentMethod: 'wire_transfer',
    notes: 'Payment for software development services - Q1 2024 project completion',
    tags: ['client', 'software', 'q1-2024'],
    attachments: [
      { id: 1, name: 'Invoice_INV-2024-045.pdf', type: 'pdf', size: '245 KB' },
      { id: 2, name: 'Receipt_WIRE_03152024.pdf', type: 'pdf', size: '189 KB' }
    ],
    relatedTransactions: [
      { id: 'TXN002', description: 'Monthly Payroll - March 2024', amount: -8500, date: '2024-03-15' },
      { id: 'TXN003', description: 'Office Rent - March 2024', amount: -2500, date: '2024-03-01' }
    ],
    metadata: {
      createdBy: 'John Smith',
      createdAt: '2024-03-15 09:30:00',
      lastModified: '2024-03-15 14:22:00',
      modifiedBy: 'Jane Doe',
      approvedBy: 'Finance Manager',
      approvedAt: '2024-03-15 16:45:00'
    },
    tax: {
      taxable: true,
      taxRate: 0.08,
      taxAmount: 1000,
      taxCategory: 'Business Income'
    },
    reconciliation: {
      reconciled: true,
      reconciledAt: '2024-03-16',
      reconciledBy: 'Accounting Department',
      bankStatement: 'STMT-2024-03-001'
    }
  });

  const [formData, setFormData] = useState({ ...transaction });

  const handleSave = () => {
    setTransaction({ ...formData, metadata: { ...formData.metadata, lastModified: new Date().toISOString().slice(0, 19).replace('T', ' '), modifiedBy: 'Current User' } });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({ ...transaction });
    setIsEditing(false);
  };

  const getCategoryIcon = (category) => {
    switch (category.toLowerCase()) {
      case 'sales':
        return <TrendingUp className="h-5 w-5" />;
      case 'payroll':
        return <User className="h-5 w-5" />;
      case 'rent':
      case 'utilities':
        return <Building className="h-5 w-5" />;
      case 'food':
      case 'restaurants':
        return <Utensils className="h-5 w-5" />;
      case 'transport':
        return <Car className="h-5 w-5" />;
      case 'shopping':
        return <ShoppingCart className="h-5 w-5" />;
      case 'home':
        return <Home className="h-5 w-5" />;
      case 'business':
        return <Briefcase className="h-5 w-5" />;
      default:
        return <CreditCard className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'failed':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
      case 'cancelled':
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
      default:
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400';
    }
  };

  const getTypeColor = (type) => {
    return type === 'Income' 
      ? 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400'
      : 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
  };

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
              Transaction {transaction.id}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(transaction.type)}`}>
                {transaction.type}
              </span>
            </div>
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
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit
              </button>
              <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Export
              </button>
            </>
          )}
        </div>
      </div>

      {/* Amount Display */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-lg mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Transaction Amount</p>
            <p className={`text-3xl font-bold ${transaction.type === 'Income' ? 'text-green-600' : 'text-red-600'}`}>
              {transaction.type === 'Income' ? '+' : ''}${transaction.amount.toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400">Account</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{transaction.account}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="flex space-x-8">
          {['overview', 'details', 'attachments', 'related'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Transaction Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400">Date</p>
                  <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                    {transaction.date}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400">Category</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getCategoryIcon(transaction.category)}
                    <span className="text-lg font-bold text-green-900 dark:text-green-100">
                      {transaction.category}
                    </span>
                  </div>
                </div>
                <Tag className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 dark:text-purple-400">Reference</p>
                  <p className="text-lg font-bold text-purple-900 dark:text-purple-100">
                    {transaction.reference}
                  </p>
                </div>
                <Receipt className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">Payment Method</p>
                  <p className="text-lg font-bold text-yellow-900 dark:text-yellow-100 capitalize">
                    {transaction.paymentMethod.replace('_', ' ')}
                  </p>
                </div>
                <CreditCard className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Description</h3>
            {isEditing ? (
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            ) : (
              <p className="text-gray-900 dark:text-white">{transaction.description}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Notes</h3>
            {isEditing ? (
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            ) : (
              <p className="text-gray-900 dark:text-white">{transaction.notes}</p>
            )}
          </div>

          {/* Tags */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {transaction.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300 rounded-full text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'details' && (
        <div className="space-y-6">
          {/* Transaction Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Transaction Date
                  </label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">{transaction.date}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Type
                  </label>
                  {isEditing ? (
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="Income">Income</option>
                      <option value="Expense">Expense</option>
                    </select>
                  ) : (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(transaction.type)}`}>
                      {transaction.type}
                    </span>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  {isEditing ? (
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="Sales">Sales</option>
                      <option value="Payroll">Payroll</option>
                      <option value="Rent">Rent</option>
                      <option value="Utilities">Utilities</option>
                      <option value="Food">Food</option>
                      <option value="Transport">Transport</option>
                      <option value="Shopping">Shopping</option>
                      <option value="Home">Home</option>
                      <option value="Business">Business</option>
                    </select>
                  ) : (
                    <p className="text-gray-900 dark:text-white">{transaction.category}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Account
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.account}
                      onChange={(e) => setFormData({ ...formData, account: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">{transaction.account}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Financial Details</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Amount
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  ) : (
                    <p className={`text-lg font-bold ${transaction.type === 'Income' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'Income' ? '+' : ''}${transaction.amount.toLocaleString()}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Reference Number
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.reference}
                      onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">{transaction.reference}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Payment Method
                  </label>
                  {isEditing ? (
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="wire_transfer">Wire Transfer</option>
                      <option value="ach">ACH</option>
                      <option value="check">Check</option>
                      <option value="credit_card">Credit Card</option>
                      <option value="debit_card">Debit Card</option>
                      <option value="cash">Cash</option>
                    </select>
                  ) : (
                    <p className="text-gray-900 dark:text-white capitalize">
                      {transaction.paymentMethod.replace('_', ' ')}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  {isEditing ? (
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="failed">Failed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  ) : (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tax Information */}
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tax Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Taxable
                </label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.tax.taxable}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      tax: { ...formData.tax, taxable: e.target.checked }
                    })}
                    disabled={!isEditing}
                    className="mr-2"
                  />
                  <span className="text-gray-900 dark:text-white">
                    {transaction.tax.taxable ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tax Rate
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    step="0.01"
                    value={formData.tax.taxRate}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      tax: { ...formData.tax, taxRate: Number(e.target.value) }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">{(transaction.tax.taxRate * 100).toFixed(1)}%</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tax Amount
                </label>
                <p className="text-gray-900 dark:text-white">${transaction.tax.taxAmount.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Metadata</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Created By:</span>
                <span className="ml-2 text-gray-900 dark:text-white">{transaction.metadata.createdBy}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Created At:</span>
                <span className="ml-2 text-gray-900 dark:text-white">{transaction.metadata.createdAt}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Last Modified By:</span>
                <span className="ml-2 text-gray-900 dark:text-white">{transaction.metadata.modifiedBy}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Last Modified:</span>
                <span className="ml-2 text-gray-900 dark:text-white">{transaction.metadata.lastModified}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Approved By:</span>
                <span className="ml-2 text-gray-900 dark:text-white">{transaction.metadata.approvedBy}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Approved At:</span>
                <span className="ml-2 text-gray-900 dark:text-white">{transaction.metadata.approvedAt}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'attachments' && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Attachments</h3>
          <div className="space-y-3">
            {transaction.attachments.map((attachment) => (
              <div key={attachment.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{attachment.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{attachment.type.toUpperCase()} • {attachment.size}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300">
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'related' && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Related Transactions</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {transaction.relatedTransactions.map((related) => (
                  <tr key={related.id}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                      {related.id}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {related.description}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {related.date}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`font-medium ${related.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {related.amount > 0 ? '+' : ''}${related.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionDetail;
