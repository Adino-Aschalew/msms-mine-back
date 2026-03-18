import React, { useState } from 'react';
import { DollarSign, Users, Calendar, TrendingUp, FileText, Upload, Download, Clock, CheckCircle, AlertCircle, BarChart, PieChart, ArrowUpRight, ArrowDownRight, Plus, Search, Filter, X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const Payroll = () => {
  const { theme } = useTheme();
  const [selectedPeriod, setSelectedPeriod] = useState('current');
  const [searchTerm, setSearchTerm] = useState('');
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [processingPayroll, setProcessingPayroll] = useState(null);
  const [completedPayroll, setCompletedPayroll] = useState(null);
  const [upcomingPayrollsList, setUpcomingPayrollsList] = useState([
    {
      id: 1,
      period: 'April 2024',
      scheduledDate: '2024-04-15',
      status: 'pending',
      estimatedPayroll: 285000,
      employees: 45
    },
    {
      id: 2,
      period: 'May 2024',
      scheduledDate: '2024-05-15',
      status: 'pending',
      estimatedPayroll: 285000,
      employees: 45
    }
  ]);
  const [recentPayrollsList, setRecentPayrollsList] = useState([
    {
      id: 1,
      period: 'March 2024',
      status: 'completed',
      processedDate: '2024-03-15',
      totalPayroll: 285000,
      employees: 45,
      netPayroll: 243000
    },
    {
      id: 2,
      period: 'February 2024',
      status: 'completed',
      processedDate: '2024-02-15',
      totalPayroll: 278000,
      employees: 44,
      netPayroll: 237000
    },
    {
      id: 3,
      period: 'January 2024',
      status: 'completed',
      processedDate: '2024-01-15',
      totalPayroll: 292000,
      employees: 46,
      netPayroll: 249000
    }
  ]);

  const payrollStats = {
    currentMonth: {
      totalPayroll: 285000,
      totalEmployees: 45,
      averageSalary: 6333,
      overtimeCost: 12480,
      taxes: 42000,
      netPayroll: 243000
    },
    lastMonth: {
      totalPayroll: 278000,
      totalEmployees: 44,
      averageSalary: 6318,
      overtimeCost: 11200,
      taxes: 41000,
      netPayroll: 237000
    },
    yearToDate: {
      totalPayroll: 855000,
      totalEmployees: 45,
      averageSalary: 6333,
      overtimeCost: 37800,
      taxes: 126000,
      netPayroll: 729000
    }
  };

  const monthlyTrendData = [
    { month: 'Jan', amount: 265000 },
    { month: 'Feb', amount: 278000 },
    { month: 'Mar', amount: 285000 },
    { month: 'Apr', amount: 272000 },
    { month: 'May', amount: 290000 },
    { month: 'Jun', amount: 281000 }
  ];

  const getChangePercentage = (current, previous) => {
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'green';
      case 'processing': return 'yellow';
      case 'pending': return 'blue';
      case 'failed': return 'red';
      default: return 'gray';
    }
  };

  const currentStats = payrollStats.currentMonth;
  const lastStats = payrollStats.lastMonth;

  const exportData = () => {
    // Create CSV data for export
    const csvData = [
      ['Period', 'Status', 'Employees', 'Total Payroll', 'Net Payroll', 'Process Date'],
      ...recentPayrollsList.map(payroll => [
        payroll.period,
        payroll.status,
        payroll.employees,
        `$${payroll.totalPayroll.toLocaleString()}`,
        `$${payroll.netPayroll.toLocaleString()}`,
        new Date(payroll.processedDate).toLocaleDateString()
      ]),
      [],
      ['Payroll Statistics'],
      ['Current Month Total Payroll', `$${currentStats.totalPayroll.toLocaleString()}`],
      ['Current Month Employees', currentStats.totalEmployees],
      ['Average Salary', `$${currentStats.averageSalary.toLocaleString()}`],
      ['Overtime Cost', `$${currentStats.overtimeCost.toLocaleString()}`],
      ['Taxes', `$${currentStats.taxes.toLocaleString()}`],
      ['Net Payroll', `$${currentStats.netPayroll.toLocaleString()}`]
    ];

    // Convert to CSV string
    const csvString = csvData.map(row => row.join(',')).join('\n');

    // Create blob and download
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `payroll_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportPayroll = () => {
    // Navigate to payroll import page or open import modal
    window.location.href = '/payroll/import';
  };

  const handleGenerateReports = () => {
    // Create and download a sample report
    const reportData = [
      ['Payroll Report - ' + new Date().toLocaleDateString()],
      [],
      ['Summary Statistics'],
      ['Total Payroll', `$${currentStats.totalPayroll.toLocaleString()}`],
      ['Active Employees', currentStats.totalEmployees],
      ['Average Salary', `$${currentStats.averageSalary.toLocaleString()}`],
      ['Overtime Cost', `$${currentStats.overtimeCost.toLocaleString()}`],
      ['Taxes', `$${currentStats.taxes.toLocaleString()}`],
      ['Net Payroll', `$${currentStats.netPayroll.toLocaleString()}`],
      [],
      ['Recent Payrolls'],
      ['Period', 'Status', 'Employees', 'Total Payroll', 'Process Date'],
      ...recentPayrollsList.map(payroll => [
        payroll.period,
        payroll.status,
        payroll.employees,
        `$${payroll.totalPayroll.toLocaleString()}`,
        new Date(payroll.processedDate).toLocaleDateString()
      ])
    ];

    // Convert to CSV string
    const csvString = reportData.map(row => row.join(',')).join('\n');

    // Create blob and download
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `payroll_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleManageEmployees = () => {
    // Navigate to employee management page
    window.location.href = '/employees';
  };

  const handleSchedulePayroll = () => {
    // Add to upcoming payrolls
    const newScheduledPayroll = {
      id: upcomingPayrollsList.length + 1,
      period: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
      scheduledDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 15 days from now
      status: 'scheduled',
      estimatedPayroll: currentStats.totalPayroll,
      employees: currentStats.totalEmployees
    };

    // Update the state to trigger re-render
    setUpcomingPayrollsList([...upcomingPayrollsList, newScheduledPayroll]);

    // Show success message
    const successModal = document.createElement('div');
    successModal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    successModal.innerHTML = `
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div class="flex items-center mb-4">
          <div class="bg-green-100 rounded-full p-3 mr-4">
            <svg class="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900">Payroll Scheduled!</h3>
            <p class="text-sm text-gray-600">Payroll has been successfully scheduled</p>
          </div>
        </div>
        <div class="bg-gray-50 rounded-lg p-4 mb-4">
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p class="text-gray-600">Period</p>
              <p class="font-medium text-gray-900">${newScheduledPayroll.period}</p>
            </div>
            <div>
              <p class="text-gray-600">Scheduled Date</p>
              <p class="font-medium text-gray-900">${new Date(newScheduledPayroll.scheduledDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p class="text-gray-600">Employees</p>
              <p class="font-medium text-gray-900">${newScheduledPayroll.employees}</p>
            </div>
            <div>
              <p class="text-gray-600">Estimated Payroll</p>
              <p class="font-medium text-gray-900">$${newScheduledPayroll.estimatedPayroll.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div class="flex justify-center">
          <button class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors" onclick="this.closest('.fixed').remove()">
            Close
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(successModal);
  };

  const processPayroll = () => {
    // Simulate payroll processing
    const newPayroll = {
      id: recentPayrollsList.length + 1,
      period: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
      status: 'processing',
      processedDate: new Date().toISOString().split('T')[0],
      totalPayroll: currentStats.totalPayroll,
      employees: currentStats.totalEmployees,
      netPayroll: currentStats.netPayroll
    };

    // Add to recent payrolls state
    setRecentPayrollsList([newPayroll, ...recentPayrollsList]);
    setProcessingPayroll(newPayroll);
    setShowProcessModal(true);

    // Simulate completion after 3 seconds
    setTimeout(() => {
      const index = recentPayrollsList.findIndex(p => p.id === newPayroll.id);
      if (index !== -1) {
        const updatedPayrolls = [...recentPayrollsList];
        updatedPayrolls[index] = { ...newPayroll, status: 'completed' };
        setRecentPayrollsList(updatedPayrolls);
        setCompletedPayroll(updatedPayrolls[index]);
        setShowProcessModal(false);
        setShowSuccessModal(true);
      }
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Payroll Management
          </h1>
          <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
            Manage payroll processing, reports, and employee compensation
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={exportData}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-sm font-medium rounded-md transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </button>
          <button 
            onClick={processPayroll}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Process Payroll
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-medium text-gray-600">Total Payroll</p>
              <p className="text-3xl font-bold text-gray-900">
                ${(currentStats.totalPayroll / 1000).toFixed(0)}K
              </p>
              <div className="flex items-center mt-1">
                {parseFloat(getChangePercentage(currentStats.totalPayroll, lastStats.totalPayroll)) >= 0 ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm ${parseFloat(getChangePercentage(currentStats.totalPayroll, lastStats.totalPayroll)) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {getChangePercentage(currentStats.totalPayroll, lastStats.totalPayroll)}%
                </span>
              </div>
            </div>
            <DollarSign className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-medium text-gray-600">Active Employees</p>
              <p className="text-3xl font-bold text-gray-900">
                {currentStats.totalEmployees}
              </p>
              <div className="flex items-center mt-1">
                {currentStats.totalEmployees > lastStats.totalEmployees ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm ${currentStats.totalEmployees > lastStats.totalEmployees ? 'text-green-600' : 'text-red-600'}`}>
                  {currentStats.totalEmployees - lastStats.totalEmployees > 0 ? '+' : ''}{currentStats.totalEmployees - lastStats.totalEmployees}
                </span>
              </div>
            </div>
            <Users className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-medium text-gray-600">Average Salary</p>
              <p className="text-3xl font-bold text-gray-900">
                ${(currentStats.averageSalary / 1000).toFixed(1)}K
              </p>
              <div className="flex items-center mt-1">
                {parseFloat(getChangePercentage(currentStats.averageSalary, lastStats.averageSalary)) >= 0 ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm ${parseFloat(getChangePercentage(currentStats.averageSalary, lastStats.averageSalary)) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {getChangePercentage(currentStats.averageSalary, lastStats.averageSalary)}%
                </span>
              </div>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-medium text-gray-600">Overtime Cost</p>
              <p className="text-3xl font-bold text-gray-900">
                ${(currentStats.overtimeCost / 1000).toFixed(1)}K
              </p>
              <div className="flex items-center mt-1">
                {parseFloat(getChangePercentage(currentStats.overtimeCost, lastStats.overtimeCost)) >= 0 ? (
                  <ArrowUpRight className="h-4 w-4 text-orange-500 mr-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-green-500 mr-1" />
                )}
                <span className={`text-sm ${parseFloat(getChangePercentage(currentStats.overtimeCost, lastStats.overtimeCost)) >= 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  {getChangePercentage(currentStats.overtimeCost, lastStats.overtimeCost)}%
                </span>
              </div>
            </div>
            <Clock className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button 
            onClick={handleImportPayroll}
            className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Upload className="h-5 w-5 text-blue-600 mr-2" />
            <span className="text-base font-medium text-gray-900">Import Payroll</span>
          </button>
          <button 
            onClick={handleGenerateReports}
            className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FileText className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-base font-medium text-gray-900">Generate Reports</span>
          </button>
          <button 
            onClick={handleManageEmployees}
            className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Users className="h-5 w-5 text-purple-600 mr-2" />
            <span className="text-base font-medium text-gray-900">Manage Employees</span>
          </button>
          <button 
            onClick={handleSchedulePayroll}
            className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Calendar className="h-5 w-5 text-orange-600 mr-2" />
            <span className="text-base font-medium text-gray-900">Schedule Payroll</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payrolls */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Recent Payrolls
              </h3>
              <button className="text-sm text-blue-600 hover:text-blue-800">
                View All
              </button>
            </div>
            <div className="space-y-3">
              {recentPayrollsList.map((payroll) => (
                <div key={payroll.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      getStatusColor(payroll.status) === 'green' ? 'bg-green-100' :
                      getStatusColor(payroll.status) === 'yellow' ? 'bg-yellow-100' :
                      getStatusColor(payroll.status) === 'blue' ? 'bg-blue-100' :
                      'bg-gray-100'
                    }`}>
                      {getStatusColor(payroll.status) === 'green' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : getStatusColor(payroll.status) === 'yellow' ? (
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                      ) : getStatusColor(payroll.status) === 'blue' ? (
                        <Clock className="h-4 w-4 text-blue-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-gray-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-base font-medium text-gray-900">
                        {payroll.period}
                      </p>
                      <p className="text-sm text-gray-500">
                        {payroll.employees} employees • ${(payroll.totalPayroll / 1000).toFixed(0)}K
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 text-sm font-medium rounded-full ${
                      getStatusColor(payroll.status) === 'green' ? 'bg-green-100 text-green-800' :
                      getStatusColor(payroll.status) === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                      getStatusColor(payroll.status) === 'blue' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {payroll.status.charAt(0).toUpperCase() + payroll.status.slice(1)}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(payroll.processedDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Payrolls */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Upcoming Payrolls
              </h3>
              <button className="text-sm text-blue-600 hover:text-blue-800">
                Schedule New
              </button>
            </div>
            <div className="space-y-3">
              {upcomingPayrollsList.map((payroll) => (
                <div key={payroll.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Calendar className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-base font-medium text-gray-900">
                        {payroll.period}
                      </p>
                      <p className="text-sm text-gray-500">
                        {payroll.employees} employees • Est. ${(payroll.estimatedPayroll / 1000).toFixed(0)}K
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
                      {payroll.status.charAt(0).toUpperCase() + payroll.status.slice(1)}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(payroll.scheduledDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Payroll Analytics */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Payroll Analytics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Monthly Trend Chart */}
            <div className="text-center">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="text-base font-medium text-gray-900 mb-3">
                  Monthly Trend
                </h4>
                <div className="h-32 flex items-end justify-center space-x-2 p-2">
                  {monthlyTrendData.map((data, index) => {
                    const maxAmount = Math.max(...monthlyTrendData.map(d => d.amount));
                    const heightPercentage = (data.amount / maxAmount) * 100;
                    const colorIntensity = index === 2 ? 'bg-blue-500' : 
                                        index === 4 ? 'bg-blue-400' : 
                                        index === 1 ? 'bg-blue-300' : 'bg-blue-200';
                    
                    return (
                      <div key={data.month} className="flex flex-col items-center flex-1">
                        <div 
                          className={`w-full ${colorIntensity} rounded-t transition-all duration-300 hover:opacity-80`}
                          style={{ height: `${heightPercentage * 0.8}px`, minHeight: '10px' }}
                          title={`${data.month}: $${(data.amount / 1000).toFixed(0)}K`}
                        ></div>
                        <span className="text-xs text-gray-600 mt-1">{data.month}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 text-sm text-gray-600">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Min: $265K</span>
                    <span>Max: $290K</span>
                  </div>
                  <p>Track payroll changes over time</p>
                </div>
              </div>
            </div>

            {/* Department Breakdown Pie Chart */}
            <div className="text-center">
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="text-base font-medium text-gray-900 mb-3">
                  Department Breakdown
                </h4>
                <div className="relative h-32 flex items-center justify-center p-2">
                  <div className="relative w-32 h-32">
                    {/* Pie segments using conic gradient */}
                    <div 
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: 'conic-gradient(#10b981 0deg 90deg, #3b82f6 90deg 180deg, #f59e0b 180deg 270deg, #ef4444 270deg 360deg)'
                      }}
                    ></div>
                    {/* Center circle to create donut effect */}
                    <div className="absolute inset-4 bg-blue-50 rounded-full flex items-center justify-center">
                      <span className="text-lg font-bold text-gray-900">$285K</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                    <span className="text-gray-600">Sales 25%</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
                    <span className="text-gray-600">Tech 25%</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-amber-500 rounded-full mr-1"></div>
                    <span className="text-gray-600">HR 25%</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
                    <span className="text-gray-600">Admin 25%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cost Analysis Progress Chart */}
            <div className="text-center">
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="text-base font-medium text-gray-900 mb-3">
                  Cost Analysis
                </h4>
                <div className="space-y-3 p-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">Base Salary</span>
                      <span className="font-medium text-gray-900">85%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">Overtime</span>
                      <span className="font-medium text-gray-900">4%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-amber-500 h-2 rounded-full" style={{ width: '4%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">Benefits</span>
                      <span className="font-medium text-gray-900">8%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '8%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">Taxes</span>
                      <span className="font-medium text-gray-900">15%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  Comprehensive cost breakdown
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Processing Modal */}
      {showProcessModal && processingPayroll && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mr-4"></div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Processing Payroll</h3>
                <p className="text-sm text-gray-600">Please wait while we process the payroll...</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Period</p>
                  <p className="font-medium text-gray-900">{processingPayroll.period}</p>
                </div>
                <div>
                  <p className="text-gray-600">Employees</p>
                  <p className="font-medium text-gray-900">{processingPayroll.employees}</p>
                </div>
                <div>
                  <p className="text-gray-600">Total Payroll</p>
                  <p className="font-medium text-gray-900">${processingPayroll.totalPayroll.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Status</p>
                  <p className="font-medium text-blue-600">Processing...</p>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="text-sm text-gray-500">
                This will take approximately 3 seconds...
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && completedPayroll && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="bg-green-100 rounded-full p-3 mr-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Payroll Completed!</h3>
                <p className="text-sm text-gray-600">Payroll has been successfully processed</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Period</p>
                  <p className="font-medium text-gray-900">{completedPayroll.period}</p>
                </div>
                <div>
                  <p className="text-gray-600">Employees</p>
                  <p className="font-medium text-gray-900">{completedPayroll.employees}</p>
                </div>
                <div>
                  <p className="text-gray-600">Total Payroll</p>
                  <p className="font-medium text-gray-900">${completedPayroll.totalPayroll.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Net Payroll</p>
                  <p className="font-medium text-gray-900">${completedPayroll.netPayroll.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payroll;
