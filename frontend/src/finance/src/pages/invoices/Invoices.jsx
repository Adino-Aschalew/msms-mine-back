import React, { useState } from 'react';
import { Plus, Search, Filter, Download, Eye, Edit, Send, CheckCircle, Clock, AlertCircle, FileText, DollarSign, TrendingUp, Calendar } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const Invoices = () => {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  const invoices = [
    {
      id: 'INV-2024-001',
      client: 'Tech Solutions Inc.',
      email: 'billing@techsolutions.com',
      amount: 15000,
      dueDate: '2024-04-15',
      issueDate: '2024-03-15',
      status: 'paid',
      description: 'Q1 Consulting Services',
      paymentMethod: 'Bank Transfer',
      paymentDate: '2024-04-10',
      lateFee: 0
    },
    {
      id: 'INV-2024-002',
      client: 'Global Marketing Ltd.',
      email: 'accounts@globalmarketing.com',
      amount: 8500,
      dueDate: '2024-04-20',
      issueDate: '2024-03-20',
      status: 'pending',
      description: 'Marketing Campaign Setup',
      paymentMethod: 'Credit Card',
      paymentDate: null,
      lateFee: 0
    },
    {
      id: 'INV-2024-003',
      client: 'Innovation Systems',
      email: 'finance@innovationsystems.com',
      amount: 25000,
      dueDate: '2024-03-25',
      issueDate: '2024-02-25',
      status: 'overdue',
      description: 'Software Development Project',
      paymentMethod: 'Wire Transfer',
      paymentDate: null,
      lateFee: 500
    },
    {
      id: 'INV-2024-004',
      client: 'Digital Dynamics',
      email: 'billing@digitaldynamics.com',
      amount: 12000,
      dueDate: '2024-05-01',
      issueDate: '2024-04-01',
      status: 'sent',
      description: 'Web Development Services',
      paymentMethod: 'Check',
      paymentDate: null,
      lateFee: 0
    },
    {
      id: 'INV-2024-005',
      client: 'Strategic Partners',
      email: 'accounts@strategicpartners.com',
      amount: 18000,
      dueDate: '2024-03-30',
      issueDate: '2024-03-01',
      status: 'paid',
      description: 'Business Consulting Package',
      paymentMethod: 'Bank Transfer',
      paymentDate: '2024-03-28',
      lateFee: 0
    },
    {
      id: 'INV-2024-006',
      client: 'Creative Agency',
      email: 'finance@creativeagency.com',
      amount: 7500,
      dueDate: '2024-04-25',
      issueDate: '2024-03-25',
      status: 'draft',
      description: 'Design Services Retainer',
      paymentMethod: 'PayPal',
      paymentDate: null,
      lateFee: 0
    }
  ];

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || invoice.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const totalAmount = filteredInvoices.reduce((sum, invoice) => sum + invoice.amount + invoice.lateFee, 0);
  const paidAmount = filteredInvoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0);
  const pendingAmount = filteredInvoices.filter(inv => inv.status === 'pending' || inv.status === 'sent').reduce((sum, inv) => sum + inv.amount, 0);
  const overdueAmount = filteredInvoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.amount + inv.lateFee, 0);

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'green';
      case 'pending': return 'yellow';
      case 'overdue': return 'red';
      case 'sent': return 'blue';
      case 'draft': return 'gray';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid': return CheckCircle;
      case 'pending': return Clock;
      case 'overdue': return AlertCircle;
      case 'sent': return Send;
      case 'draft': return FileText;
      default: return FileText;
    }
  };

  const getDaysOverdue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = today - due;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <div className="space-y-6">
      {}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Invoices
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Manage customer invoices and payments
        </p>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Invoices</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredInvoices.length}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Amount</p>
              <p className="text-2xl font-bold text-green-600">${totalAmount.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Paid</p>
              <p className="text-2xl font-bold text-blue-600">${paidAmount.toLocaleString()}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overdue</p>
              <p className="text-2xl font-bold text-red-600">${overdueAmount.toLocaleString()}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
        </div>
      </div>

      {}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
          
          <button className="flex items-center px-4 py-2 bg-gray-600 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600 text-white text-sm font-medium rounded-md transition-colors">
            <Calendar className="h-4 w-4 mr-2" />
            Date Range
          </button>
          <button className="flex items-center px-4 py-2 bg-gray-600 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600 text-white text-sm font-medium rounded-md transition-colors">
            <Filter className="h-4 w-4 mr-2" />
            Advanced Filter
          </button>
          <button className="flex items-center px-4 py-2 bg-gray-600 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600 text-white text-sm font-medium rounded-md transition-colors">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors shadow-lg shadow-blue-500/20">
            <Plus className="h-4 w-4 mr-2" />
            New Invoice
          </button>
        </div>
      </div>

      {}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Invoice
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredInvoices.map((invoice) => {
                const StatusIcon = getStatusIcon(invoice.status);
                const statusColor = getStatusColor(invoice.status);
                const daysOverdue = getDaysOverdue(invoice.dueDate);

                return (
                  <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {invoice.id}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">
                          {invoice.issueDate}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {invoice.client}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">
                          {invoice.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                      {invoice.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          ${invoice.amount.toLocaleString()}
                        </div>
                        {invoice.lateFee > 0 && (
                          <div className="text-red-600 dark:text-red-400">
                            +${invoice.lateFee} late fee
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className={`font-medium ${
                          invoice.status === 'overdue' ? 'text-red-600 dark:text-red-400' :
                          invoice.status === 'pending' ? 'text-yellow-600 dark:text-yellow-400' :
                          'text-gray-900 dark:text-gray-100'
                        }`}>
                          {invoice.dueDate}
                        </div>
                        {invoice.status === 'overdue' && (
                          <div className="text-red-600 dark:text-red-400">
                            {daysOverdue} days overdue
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        statusColor === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        statusColor === 'yellow' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        statusColor === 'red' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                        statusColor === 'blue' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                      }`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="p-2 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300">
                          <Send className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Payment Trends
          </h3>
          <div className="space-y-3">
            {[
              { month: 'January', paid: 45000, pending: 12000 },
              { month: 'February', paid: 52000, pending: 8000 },
              { month: 'March', paid: 33000, pending: 18000 }
            ].map((month, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">{month.month}</span>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-green-600 dark:text-green-400">
                    ${(month.paid / 1000).toFixed(0)}K
                  </span>
                  <span className="text-sm text-yellow-600 dark:text-yellow-400">
                    ${(month.pending / 1000).toFixed(0)}K
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Top Clients
          </h3>
          <div className="space-y-3">
            {[
              { client: 'Tech Solutions Inc.', amount: 45000, invoices: 3 },
              { client: 'Global Marketing Ltd.', amount: 28000, invoices: 2 },
              { client: 'Innovation Systems', amount: 25000, invoices: 1 }
            ].map((client, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {client.client}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {client.invoices} invoices
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  ${(client.amount / 1000).toFixed(0)}K
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Upcoming Payments
          </h3>
          <div className="space-y-3">
            {filteredInvoices
              .filter(inv => inv.status === 'pending' || inv.status === 'sent')
              .slice(0, 3)
              .map((invoice, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {invoice.client}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Due {invoice.dueDate}
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    ${(invoice.amount / 1000).toFixed(1)}K
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoices;
