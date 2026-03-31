import React, { useState } from 'react';
import { DollarSign, Users, Calendar, TrendingUp, FileText, Upload, Download, Clock, CheckCircle, AlertCircle, BarChart, PieChart, ArrowUpRight, ArrowDownRight, Plus, Search, Filter, X, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { financeAPI } from '../../../../shared/services/financeAPI';
import { useNotifications } from '../../contexts/NotificationContext';

const Payroll = () => {
  const { theme } = useTheme();
  const [selectedPeriod, setSelectedPeriod] = useState('current');
  const [searchTerm, setSearchTerm] = useState('');
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [processingPayroll, setProcessingPayroll] = useState(null);
  const [completedPayroll, setCompletedPayroll] = useState(null);
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    currentMonth: { totalPayroll: 0, totalEmployees: 0, averageSalary: 0, netPayroll: 0, overtimeCost: 0 },
    lastMonth: { totalPayroll: 0, totalEmployees: 0, averageSalary: 0, netPayroll: 0, overtimeCost: 0 },
    trend: []
  });
  const [recentPayrollsList, setRecentPayrollsList] = useState([]);
  const [upcomingPayrollsList, setUpcomingPayrollsList] = useState([]);

  React.useEffect(() => {
    fetchPayrollData();
  }, []);

  const fetchPayrollData = async () => {
    try {
      setLoading(true);
      const [statsRes, batchesRes] = await Promise.all([
        financeAPI.getPayrollStats(),
        financeAPI.getPayrollBatches({ limit: 10 })
      ]);
      
      if (statsRes.success) setStats(statsRes.data);
      if (batchesRes.success) {
        const allBatches = batchesRes.data.batches || [];
        setRecentPayrollsList(allBatches.filter(b => b.status === 'PROCESSED' || b.status === 'REVERSED'));
        setUpcomingPayrollsList(allBatches.filter(b => ['UPLOADED', 'VALIDATED', 'CONFIRMED'].includes(b.status)));
      }
    } catch (error) {
      addNotification({ type: 'error', title: 'Error', message: 'Failed to fetch payroll data' });
    } finally {
      setLoading(false);
    }
  };

  const currentStats = stats.currentMonth;
  const lastStats = stats.lastMonth;
  const monthlyTrendData = stats.trend;

  const getChangePercentage = (current, previous) => {
    if (!previous || previous === 0) return '0.0';
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PROCESSED': case 'completed': return 'green';
      case 'VALIDATED': case 'processing': return 'yellow';
      case 'CONFIRMED': case 'pending': return 'blue';
      case 'REVERSED': case 'failed': return 'red';
      default: return 'gray';
    }
  };

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
    window.location.href = '/finance/payroll/import';
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
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium rounded-md transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </button>
          <button 
            onClick={processPayroll}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors shadow-lg shadow-blue-500/20"
          >
            <Plus className="h-4 w-4 mr-2" />
            Process Payroll
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-medium text-gray-600 dark:text-gray-400">Total Payroll</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white font-black">
                {(currentStats.totalPayroll).toLocaleString()} <span className="text-sm">ETB</span>
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
        
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-medium text-gray-600 dark:text-gray-400">Active Employees</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
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
        
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-medium text-gray-600 dark:text-gray-400">Average Salary</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
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
        
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-medium text-gray-600 dark:text-gray-400">Overtime Cost</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
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
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button 
            onClick={handleImportPayroll}
            className="flex items-center justify-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
          >
            <Upload className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 group-hover:scale-110 transition-transform" />
            <span className="text-base font-medium text-gray-900 dark:text-gray-100">Import Payroll</span>
          </button>
          <button 
            onClick={handleGenerateReports}
            className="flex items-center justify-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
          >
            <FileText className="h-5 w-5 text-green-600 dark:text-green-400 mr-2 group-hover:scale-110 transition-transform" />
            <span className="text-base font-medium text-gray-900 dark:text-gray-100">Generate Reports</span>
          </button>
          <button 
            onClick={handleManageEmployees}
            className="flex items-center justify-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
          >
            <Users className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-2 group-hover:scale-110 transition-transform" />
            <span className="text-base font-medium text-gray-900 dark:text-gray-100">Manage Employees</span>
          </button>
          <button 
            onClick={handleSchedulePayroll}
            className="flex items-center justify-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
          >
            <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400 mr-2 group-hover:scale-110 transition-transform" />
            <span className="text-base font-medium text-gray-900 dark:text-gray-100">Schedule Payroll</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payrolls */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Recent Payrolls
              </h3>
              <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
                View All
              </button>
            </div>
            <div className="space-y-3">
              {recentPayrollsList.map((payroll) => (
                <div key={payroll.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50/50 dark:bg-gray-900/30">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      getStatusColor(payroll.status) === 'green' ? 'bg-green-100 dark:bg-green-900/30' :
                      getStatusColor(payroll.status) === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                      getStatusColor(payroll.status) === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' :
                      'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      {getStatusColor(payroll.status) === 'green' ? (
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                      ) : getStatusColor(payroll.status) === 'yellow' ? (
                        <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                      ) : getStatusColor(payroll.status) === 'blue' ? (
                        <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                        {payroll.batch_name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {payroll.total_employees} employees • {parseFloat(payroll.total_amount).toLocaleString()} ETB
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 text-sm font-medium rounded-full ${
                      getStatusColor(payroll.status) === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' :
                      getStatusColor(payroll.status) === 'yellow' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300' :
                      getStatusColor(payroll.status) === 'blue' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {payroll.status.charAt(0).toUpperCase() + payroll.status.slice(1)}
                    </span>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(payroll.payroll_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Payrolls */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Upcoming Payrolls
              </h3>
              <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
                Schedule New
              </button>
            </div>
            <div className="space-y-3">
              {upcomingPayrollsList.map((payroll) => (
                <div key={payroll.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50/50 dark:bg-gray-900/30">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                      <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                        {payroll.batch_name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {payroll.total_employees} employees • {parseFloat(payroll.total_amount).toLocaleString()} ETB
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                      {payroll.status}
                    </span>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(payroll.payroll_date || payroll.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Payroll Analytics */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Payroll Analytics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Monthly Trend Chart */}
            <div className="text-center">
              <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                <h4 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-3">
                  Monthly Trend
                </h4>
                <div className="h-32 flex items-end justify-center space-x-2 p-2">
                  {monthlyTrendData.map((data, index) => {
                    const maxAmount = Math.max(...monthlyTrendData.map(d => d.amount));
                    const heightPercentage = (data.amount / maxAmount) * 100;
                    const colorIntensity = index === 2 ? 'bg-blue-500 dark:bg-blue-400' : 
                                        index === 4 ? 'bg-blue-400 dark:bg-blue-500' : 
                                        index === 1 ? 'bg-blue-300 dark:bg-blue-600' : 'bg-blue-200 dark:bg-blue-700';
                    
                    return (
                      <div key={data.month} className="flex flex-col items-center flex-1">
                        <div 
                          className={`w-full ${colorIntensity} rounded-t transition-all duration-300 hover:opacity-80`}
                          style={{ height: `${heightPercentage * 0.8}px`, minHeight: '10px' }}
                          title={`${data.month}: $${(data.amount / 1000).toFixed(0)}K`}
                        ></div>
                        <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">{data.month}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
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
              <div className="p-4 bg-green-50/50 dark:bg-emerald-900/10 rounded-lg border border-green-100 dark:border-emerald-900/20">
                <h4 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-3">
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
                    <div className="absolute inset-4 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center border border-green-100 dark:border-emerald-900/20 shadow-inner">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">$285K</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                    <span className="text-gray-600 dark:text-gray-400">Sales 25%</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
                    <span className="text-gray-600 dark:text-gray-400">Tech 25%</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-amber-500 rounded-full mr-1"></div>
                    <span className="text-gray-600 dark:text-gray-400">HR 25%</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
                    <span className="text-gray-600 dark:text-gray-400">Admin 25%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cost Analysis Progress Chart */}
            <div className="text-center">
              <div className="p-4 bg-purple-50/50 dark:bg-purple-900/10 rounded-lg border border-purple-100 dark:border-purple-900/20">
                <h4 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-3">
                  Cost Analysis
                </h4>
                <div className="space-y-3 p-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600 dark:text-gray-400">Base Salary</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">85%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full shadow-sm" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600 dark:text-gray-400">Overtime</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">4%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-amber-500 h-2 rounded-full shadow-sm" style={{ width: '4%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600 dark:text-gray-400">Benefits</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">8%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full shadow-sm" style={{ width: '8%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600 dark:text-gray-400">Taxes</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">15%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full shadow-sm" style={{ width: '15%' }}></div>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                  Comprehensive cost breakdown
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Processing Modal */}
      {showProcessModal && processingPayroll && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-md w-full shadow-2xl border border-gray-100 dark:border-gray-700 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-blue-400/20 rounded-full animate-ping"></div>
                <div className="relative animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-b-transparent"></div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Processing Payroll</h3>
              <p className="text-base text-gray-500 dark:text-gray-400 mt-1">Please wait while we finalize calculations...</p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 mb-6 border border-gray-100 dark:border-gray-700/50">
              <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                <div>
                  <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Period</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{processingPayroll.period}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Employees</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{processingPayroll.employees}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Estimated Total</p>
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">${processingPayroll.totalPayroll.toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 mb-2 overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full transition-all duration-300 w-3/4 animate-pulse"></div>
            </div>
            <p className="text-center text-xs text-blue-600 dark:text-blue-400 font-medium">Step 3 of 4: Generating Slips...</p>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && completedPayroll && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-md w-full shadow-2xl border border-gray-100 dark:border-gray-700 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="bg-green-100 dark:bg-green-900/40 rounded-full p-4 mb-4 ring-8 ring-green-50 dark:ring-green-900/20">
                <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Payroll Completed!</h3>
              <p className="text-base text-gray-500 dark:text-gray-400 mt-1">Funds have been successfully allocated</p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 mb-8 border border-gray-100 dark:border-gray-700/50">
              <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                <div>
                  <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Period</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{completedPayroll.period}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Employees</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{completedPayroll.employees}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Gross Amount</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">${completedPayroll.totalPayroll.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Net Allocation</p>
                  <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">${completedPayroll.netPayroll.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-95"
            >
              Continue to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payroll;
