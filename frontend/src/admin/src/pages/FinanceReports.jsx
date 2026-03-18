import React, { useState } from 'react';
import { 
  FileSpreadsheet,
  Download,
  Calendar,
  Filter,
  Search,
  Plus,
  Eye,
  FileText,
  DollarSign,
  Users,
  TrendingUp
} from 'lucide-react';

const FinanceReports = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Mock reports data
  const reports = [
    {
      id: 'RPT-2024-001',
      name: 'Payroll Report - March 2024',
      type: 'payroll',
      generatedDate: '2024-03-16',
      period: 'March 2024',
      format: 'PDF',
      size: '2.4 MB',
      description: 'Comprehensive payroll report including all employee contributions and tax deductions'
    },
    {
      id: 'RPT-2024-002',
      name: 'Expense Report - Q1 2024',
      type: 'expense',
      generatedDate: '2024-04-01',
      period: 'Q1 2024',
      format: 'Excel',
      size: '1.8 MB',
      description: 'Detailed expense breakdown by category and department for Q1 2024'
    },
    {
      id: 'RPT-2024-003',
      name: 'Profit & Loss Statement - March 2024',
      type: 'profit-loss',
      generatedDate: '2024-04-02',
      period: 'March 2024',
      format: 'PDF',
      size: '3.1 MB',
      description: 'Monthly profit and loss statement with revenue and expense analysis'
    }
  ];

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === 'all' || report.type === filterType;
    
    return matchesSearch && matchesType;
  });

  const getReportTypeInfo = (type) => {
    switch (type) {
      case 'payroll':
        return { color: 'blue', icon: Users, label: 'Payroll' };
      case 'expense':
        return { color: 'red', icon: DollarSign, label: 'Expense' };
      case 'profit-loss':
        return { color: 'green', icon: TrendingUp, label: 'P&L' };
      case 'cash-flow':
        return { color: 'purple', icon: FileSpreadsheet, label: 'Cash Flow' };
      case 'savings':
        return { color: 'emerald', icon: DollarSign, label: 'Savings' };
      default:
        return { color: 'gray', icon: FileText, label: 'Other' };
    }
  };

  const ReportCard = ({ report }) => {
    const typeInfo = getReportTypeInfo(report.type);
    const TypeIcon = typeInfo.icon;

    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-${typeInfo.color}-100 dark:bg-${typeInfo.color}-900/20`}>
              <TypeIcon className={`h-5 w-5 text-${typeInfo.color}-600 dark:text-${typeInfo.color}-400`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{report.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{report.id}</p>
            </div>
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${typeInfo.color}-100 text-${typeInfo.color}-800 dark:bg-${typeInfo.color}-900/20 dark:text-${typeInfo.color}-400`}>
            {typeInfo.label}
          </span>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {report.description}
          </p>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Period:</span>
              <span className="ml-2 text-gray-900 dark:text-white">{report.period}</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Format:</span>
              <span className="ml-2 text-gray-900 dark:text-white">{report.format}</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Generated:</span>
              <span className="ml-2 text-gray-900 dark:text-white">{report.generatedDate}</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Size:</span>
              <span className="ml-2 text-gray-900 dark:text-white">{report.size}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2">
          <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30">
            <Eye className="h-4 w-4" />
            View
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-600 rounded-lg text-sm font-medium hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30">
            <Download className="h-4 w-4" />
            Download
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Financial Reports</h1>
          <p className="text-gray-600 dark:text-gray-400">Generate and manage financial reports</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 rounded-lg text-sm font-medium text-white hover:bg-blue-600">
            <Plus className="h-4 w-4" />
            Generate Report
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <button className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700 text-left">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">Monthly</span>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Payroll Report</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Generate monthly payroll summary</p>
        </button>

        <button className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700 text-left">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">Monthly</span>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white">P&L Statement</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Profit and loss analysis</p>
        </button>

        <button className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700 text-left">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20">
              <FileSpreadsheet className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">Quarterly</span>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Cash Flow Report</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Cash flow analysis</p>
        </button>

        <button className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700 text-left">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/20">
              <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">Monthly</span>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Savings Report</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Employee savings overview</p>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Types</option>
              <option value="payroll">Payroll</option>
              <option value="expense">Expense</option>
              <option value="profit-loss">P&L</option>
              <option value="cash-flow">Cash Flow</option>
              <option value="savings">Savings</option>
            </select>

            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
              <Filter className="h-4 w-4" />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map((report) => (
          <ReportCard key={report.id} report={report} />
        ))}
      </div>
    </div>
  );
};

export default FinanceReports;
