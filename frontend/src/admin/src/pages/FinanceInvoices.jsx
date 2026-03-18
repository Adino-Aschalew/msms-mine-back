import React, { useState } from 'react';
import { 
  FileText,
  Plus,
  Search,
  Filter,
  Download,
  Send,
  CheckCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  Calendar,
  Mail,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';

const FinanceInvoices = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock invoices data
  const invoices = [
    {
      id: 'INV-2024-045',
      client: 'Tech Solutions Inc',
      email: 'billing@techsolutions.com',
      amount: 25750,
      dueDate: '2024-03-30',
      issueDate: '2024-03-01',
      status: 'sent',
      items: ['Software Development Services', 'Technical Support'],
      description: 'Q1 2024 Development Services'
    },
    {
      id: 'INV-2024-044',
      client: 'ABC Corporation',
      email: 'accounts@abccorp.com',
      amount: 18500,
      dueDate: '2024-03-25',
      issueDate: '2024-02-25',
      status: 'paid',
      items: ['Consulting Services'],
      description: 'February Consulting Services'
    },
    {
      id: 'INV-2024-043',
      client: 'Global Industries Ltd',
      email: 'finance@globalind.com',
      amount: 32100,
      dueDate: '2024-03-15',
      issueDate: '2024-02-15',
      status: 'overdue',
      items: ['Enterprise Software License', 'Implementation Services'],
      description: 'Annual License and Implementation'
    }
  ];

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         invoice.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         invoice.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || invoice.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const totalAmount = filteredInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const overdueAmount = filteredInvoices
    .filter(inv => inv.status === 'overdue')
    .reduce((sum, invoice) => sum + invoice.amount, 0);
  const paidAmount = filteredInvoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, invoice) => sum + invoice.amount, 0);

  const getStatusInfo = (status) => {
    switch (status) {
      case 'draft':
        return { color: 'gray', icon: FileText, label: 'Draft' };
      case 'sent':
        return { color: 'blue', icon: Send, label: 'Sent' };
      case 'paid':
        return { color: 'green', icon: CheckCircle, label: 'Paid' };
      case 'overdue':
        return { color: 'red', icon: AlertTriangle, label: 'Overdue' };
      default:
        return { color: 'gray', icon: Clock, label: 'Unknown' };
    }
  };

  const InvoiceCard = ({ invoice }) => {
    const statusInfo = getStatusInfo(invoice.status);
    const StatusIcon = statusInfo.icon;
    const daysUntilDue = Math.ceil((new Date(invoice.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
    
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{invoice.id}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{invoice.client}</p>
          </div>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            statusInfo.color === 'gray' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400' :
            statusInfo.color === 'blue' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
            statusInfo.color === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
            'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
          }`}>
            <StatusIcon className="h-3 w-3" />
            {statusInfo.label}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Amount</span>
            <span className="text-lg font-bold text-gray-900 dark:text-white">${invoice.amount.toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Due Date</span>
            <span className={`text-sm font-medium ${
              daysUntilDue < 0 ? 'text-red-600' : 
              daysUntilDue <= 7 ? 'text-yellow-600' : 
              'text-gray-900 dark:text-white'
            }`}>
              {invoice.dueDate}
              {daysUntilDue < 0 && ' (Overdue)'}
              {daysUntilDue >= 0 && daysUntilDue <= 7 && ` (${daysUntilDue} days)`}
            </span>
          </div>

          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p className="truncate">{invoice.description}</p>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Mail className="h-3 w-3" />
            <span className="truncate">{invoice.email}</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2">
          <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30">
            <Eye className="h-4 w-4" />
            View
          </button>
          {invoice.status === 'draft' && (
            <button className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-600 rounded-lg text-sm font-medium hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30">
              <Send className="h-4 w-4" />
              Send
            </button>
          )}
          <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <Edit className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Invoices</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage billing and invoice operations</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 rounded-lg text-sm font-medium text-white hover:bg-blue-600">
            <Plus className="h-4 w-4" />
            Create Invoice
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Invoices</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredInvoices.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg dark:bg-blue-900/20">
              <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">${totalAmount.toLocaleString()}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg dark:bg-green-900/20">
              <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Paid Amount</p>
              <p className="text-2xl font-bold text-green-600">${paidAmount.toLocaleString()}</p>
            </div>
            <div className="bg-emerald-100 p-3 rounded-lg dark:bg-emerald-900/20">
              <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overdue Amount</p>
              <p className="text-2xl font-bold text-red-600">${overdueAmount.toLocaleString()}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg dark:bg-red-900/20">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInvoices.map((invoice) => (
          <InvoiceCard key={invoice.id} invoice={invoice} />
        ))}
      </div>
    </div>
  );
};

export default FinanceInvoices;
