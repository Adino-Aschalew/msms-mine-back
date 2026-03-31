import React, { useState } from 'react';
import { FileText, Download, Calendar, Filter, TrendingUp, DollarSign, PieChart, BarChart, Eye, Users } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const Reports = () => {
  const { theme } = useTheme();
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedReport, setSelectedReport] = useState('all');

  const reports = [
    {
      id: 1,
      name: 'Profit & Loss Statement',
      description: 'Comprehensive income and expense analysis',
      type: 'financial',
      icon: TrendingUp,
      lastGenerated: '2024-03-15',
      format: ['PDF', 'Excel'],
      period: 'monthly'
    },
    {
      id: 2,
      name: 'Cash Flow Report',
      description: 'Detailed cash inflow and outflow tracking',
      type: 'financial',
      icon: DollarSign,
      lastGenerated: '2024-03-14',
      format: ['PDF', 'Excel', 'CSV'],
      period: 'weekly'
    },
    {
      id: 3,
      name: 'Payroll Summary',
      description: 'Employee payroll and tax contributions',
      type: 'payroll',
      icon: Users,
      lastGenerated: '2024-03-15',
      format: ['PDF', 'CSV'],
      period: 'monthly'
    },
    {
      id: 4,
      name: 'Expense Breakdown',
      description: 'Categorized expense analysis',
      type: 'expense',
      icon: PieChart,
      lastGenerated: '2024-03-13',
      format: ['PDF', 'Excel'],
      period: 'monthly'
    },
    {
      id: 5,
      name: 'Revenue Analysis',
      description: 'Income sources and trends',
      type: 'revenue',
      icon: BarChart,
      lastGenerated: '2024-03-15',
      format: ['PDF', 'Excel'],
      period: 'monthly'
    },
    {
      id: 6,
      name: 'Balance Sheet',
      description: 'Assets, liabilities, and equity overview',
      type: 'financial',
      icon: FileText,
      lastGenerated: '2024-03-10',
      format: ['PDF', 'Excel'],
      period: 'quarterly'
    }
  ];

  const filteredReports = reports.filter(report => {
    const matchesType = selectedReport === 'all' || report.type === selectedReport;
    const matchesPeriod = selectedPeriod === 'all' || report.period === selectedPeriod;
    return matchesType && matchesPeriod;
  });

  const reportTypes = ['all', 'financial', 'payroll', 'expense', 'revenue'];
  const periods = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'all'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Financial Reports
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Generate and manage comprehensive financial reports
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Reports</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {reports.length}
              </p>
            </div>
            <FileText className="h-10 w-10 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Generated Today</p>
              <p className="text-3xl font-bold text-green-600">
                3
              </p>
            </div>
            <TrendingUp className="h-10 w-10 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Scheduled</p>
              <p className="text-3xl font-bold text-blue-600">
                8
              </p>
            </div>
            <Calendar className="h-10 w-10 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Exports</p>
              <p className="text-3xl font-bold text-purple-600">
                24
              </p>
            </div>
            <Download className="h-10 w-10 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={selectedReport}
            onChange={(e) => setSelectedReport(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {reportTypes.map(type => (
              <option key={type} value={type}>
                {type === 'all' ? 'All Reports' : type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
          
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {periods.map(period => (
              <option key={period} value={period}>
                {period === 'all' ? 'All Periods' : period.charAt(0).toUpperCase() + period.slice(1)}
              </option>
            ))}
          </select>
          
          <button className="flex items-center px-4 py-2 bg-gray-600 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600 text-white text-sm font-medium rounded-md transition-colors">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Report
          </button>
          <button className="flex items-center px-4 py-2 bg-gray-600 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600 text-white text-sm font-medium rounded-md transition-colors">
            <Filter className="h-4 w-4 mr-2" />
            Advanced Filter
          </button>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map((report) => {
          const Icon = report.icon;
          return (
            <div key={report.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-500">
                  {report.period}
                </span>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {report.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {report.description}
              </p>
              
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500 mb-4">
                <span>Last: {report.lastGenerated}</span>
                <span>{report.format.join(', ')}</span>
              </div>
              
              <div className="flex gap-2">
                <button className="flex-1 flex items-center px-3 py-2 bg-gray-600 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600 text-white text-sm font-medium rounded-md transition-colors">
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </button>
                <button className="flex-1 flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors">
                  <Download className="h-4 w-4 mr-1" />
                  Generate
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Report Activity
        </h2>
        <div className="space-y-3">
          {[
            { action: 'Generated', report: 'Profit & Loss Statement', time: '2 hours ago', user: 'Sarah Johnson' },
            { action: 'Exported', report: 'Cash Flow Report', time: '4 hours ago', user: 'Michael Chen' },
            { action: 'Scheduled', report: 'Payroll Summary', time: '1 day ago', user: 'Emily Rodriguez' },
            { action: 'Generated', report: 'Expense Breakdown', time: '2 days ago', user: 'David Kim' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  activity.action === 'Generated' ? 'bg-green-500' :
                  activity.action === 'Exported' ? 'bg-blue-500' : 'bg-yellow-500'
                }`} />
                <span className="text-sm text-gray-900 dark:text-gray-300">
                  {activity.user} {activity.action.toLowerCase()} "{activity.report}"
                </span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-500">
                {activity.time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reports;
