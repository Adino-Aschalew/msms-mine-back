import React, { useState } from 'react';
import { FileText, Download, Calendar, Filter, TrendingUp, DollarSign, Users, BarChart, PieChart, Eye, Plus, Search, Printer, Mail, Clock, CheckCircle, AlertCircle, Heart } from 'lucide-react';

const PayrollReports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedReportType, setSelectedReportType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const payrollReports = [
    {
      id: 1,
      name: 'Monthly Payroll Summary',
      type: 'summary',
      period: 'March 2024',
      generatedDate: '2024-03-15',
      status: 'completed',
      totalEmployees: 45,
      totalPayroll: 285000,
      totalTaxes: 42000,
      netPayroll: 243000,
      format: 'PDF',
      size: '2.4 MB'
    },
    {
      id: 2,
      name: 'Department Payroll Breakdown',
      type: 'department',
      period: 'March 2024',
      generatedDate: '2024-03-15',
      status: 'completed',
      departments: 6,
      totalPayroll: 285000,
      format: 'PDF',
      size: '3.1 MB'
    },
    {
      id: 3,
      name: 'Overtime Analysis Report',
      type: 'overtime',
      period: 'March 2024',
      generatedDate: '2024-03-15',
      status: 'completed',
      totalEmployees: 12,
      totalOvertimeHours: 156,
      overtimeCost: 12480,
      format: 'PDF',
      size: '1.2 MB'
    },
    {
      id: 4,
      name: 'Year-to-Date Payroll Report',
      type: 'ytd',
      period: '2024 YTD',
      generatedDate: '2024-03-15',
      status: 'completed',
      totalPayroll: 855000,
      totalTaxes: 126000,
      netPayroll: 729000,
      format: 'PDF',
      size: '4.2 MB'
    }
  ];

  const reportTypes = [
    { id: 'all', name: 'All Reports', icon: FileText },
    { id: 'summary', name: 'Summary Reports', icon: BarChart },
    { id: 'ytd', name: 'YTD Reports', icon: TrendingUp },
  ];

  const filteredReports = payrollReports.filter(report => {
    const matchesType = selectedReportType === 'all' || report.type === selectedReportType;
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.period.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'green';
      case 'processing': return 'yellow';
      case 'failed': return 'red';
      default: return 'gray';
    }
  };

  const getReportTypeColor = (type) => {
    switch (type) {
      case 'summary': return 'blue';
      case 'ytd': return 'indigo';
      default: return 'gray';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Payroll Reports
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Generate and analyze payroll reports
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6  hover:shadow-xl transition-shadow duration-300">
          <div className="flex flex-col items-center text-center">
            <div className="p-3 bg-blue-100 rounded-xl mb-4">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Total Reports</h3>
            <p className="text-4xl font-bold text-blue-600 mb-1">
              {payrollReports.length}
            </p>
            <p className="text-xs text-gray-500">Available reports</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6  hover:shadow-xl transition-shadow duration-300">
          <div className="flex flex-col items-center text-center">
            <div className="p-3 bg-green-100 rounded-xl mb-4">
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-sm font-semibold text-gray-600 mb-2">This Month</h3>
            <p className="text-4xl font-bold text-green-600 mb-1">
              {payrollReports.filter(r => r.period.includes('March')).length}
            </p>
            <p className="text-xs text-gray-500">Generated reports</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6  hover:shadow-xl transition-shadow duration-300">
          <div className="flex flex-col items-center text-center">
            <div className="p-3 bg-blue-100 rounded-xl mb-4">
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Total Payroll</h3>
            <p className="text-4xl font-bold text-blue-600 mb-1">
              ${(payrollReports.reduce((sum, r) => sum + (r.totalPayroll || 0), 0) / 1000).toFixed(0)}K
            </p>
            <p className="text-xs text-gray-500">Total amount</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex flex-col items-center text-center">
            <div className="p-3 bg-orange-100 rounded-xl mb-4">
              <Users className="h-8 w-8 text-orange-600" />
            </div>
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Employees</h3>
            <p className="text-4xl font-bold text-orange-600 mb-1">
              {Math.max(...payrollReports.map(r => r.totalEmployees || 0))}
            </p>
            <p className="text-xs text-gray-500">Total employees</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-4 w-full border border-gray-300 rounded-md focus:border-blue-500"
              />
            </div>
          </div>
          
          <select
            value={selectedReportType}
            onChange={(e) => setSelectedReportType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:border-blue-500"
          >
            {reportTypes.map(type => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
          
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:border-blue-500"
          >
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
            <option value="ytd">Year-to-Date</option>
          </select>
          <button className="px-2 py-1 btn btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Generate Report
          </button>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map((report) => {
          const typeColor = getReportTypeColor(report.type);
          
          return (
            <div key={report.id} className="card p-6 flex flex-col h-full">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {report.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {report.period}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  typeColor === 'blue' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                  typeColor === 'red' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                  typeColor === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  typeColor === 'yellow' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                  typeColor === 'purple' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                  typeColor === 'indigo' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                }`}>
                  {report.type.charAt(0).toUpperCase() + report.type.slice(1)}
                </span>
              </div>
              
              {/* Report Details */}
              <div className="space-y-3 flex-grow">
                {report.totalPayroll && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Total Payroll</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      ${(report.totalPayroll / 1000).toFixed(0)}K
                    </span>
                  </div>
                )}
                
                {report.totalEmployees && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Employees</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {report.totalEmployees}
                    </span>
                  </div>
                )}
                
                {report.totalTaxes && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Total Taxes</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      ${(report.totalTaxes / 1000).toFixed(0)}K
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Generated</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {new Date(report.generatedDate).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Format</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {report.format}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Size</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {report.size}
                  </span>
                </div>
              </div>
              
              {/* Action Buttons - Always at Bottom */}
              <div className="flex justify-around mt-auto pt-4">
                <button className="flex text-center justify-center items-center gap-2 px-10 py-2 bg-blue-600 text-white font-medium rounded-md shadow hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 text-sm">
                  <Eye className="h-4 w-4" />
                  View
                </button>
                <button className="flex text-center justify-center items-center gap-2 px-10 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-md shadow hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 text-sm">
                  <Download className="h-4 w-4" />
                  Download
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PayrollReports;
