import React, { useState, useEffect } from 'react';
import { 
  FiCalendar, 
  FiDollarSign, 
  FiDownload, 
  FiSearch, 
  FiFilter, 
  FiTrendingUp, 
  FiPieChart, 
  FiActivity, 
  FiCreditCard, 
  FiShield, 
  FiTarget, 
  FiBarChart2,
  FiFileText,
  FiEye,
  FiPrinter,
  FiMail,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiUsers,
  FiBriefcase,
  FiAward,
  FiTrendingDown,
  FiInfo,
  FiChevronRight,
  FiChevronDown,
  FiRefreshCw
} from 'react-icons/fi';
import { employeeAPI } from '../../../shared/services/employeeAPI';
import { savingsAPI } from '../../../shared/services/savingsAPI';
import { loansAPI } from '../../../shared/services/loansAPI';
import { notificationService } from '../../../shared/services/notificationService';

const PayrollPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());
  const [selectedPeriod, setSelectedPeriod] = useState('current');
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [salaryData, setSalaryData] = useState({
    salary: 0,
    savingsRate: 0,
    loanDeduction: 0,
    taxRate: 0,
    insuranceRate: 0,
    loading: true
  });

  const [history, setHistory] = useState([]);
  const [analytics, setAnalytics] = useState({
    ytdEarnings: 0,
    ytdDeductions: 0,
    ytdNetPay: 0,
    avgMonthlyNet: 0,
    totalSavings: 0,
    totalLoanPayments: 0
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatCompactNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // Generate dynamic year options (current year and 3 previous years)
  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 20; i++) {
      years.push(currentYear - i);
    }
    return years;
  };

  useEffect(() => {
    fetchPayrollData();
  }, [yearFilter, selectedPeriod]);

  const fetchPayrollData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [profileRes, savingsRes, loansRes] = await Promise.all([
        employeeAPI.getProfile(),
        savingsAPI.getSavingsAccount().catch(() => null),
        loansAPI.getUserLoans().catch(() => [])
      ]);

      const profileData = profileRes?.data || profileRes;
      const eProfile = profileData?.employeeProfile || profileData?.employee_profile || {};
      
      const savingsData = savingsRes?.data || savingsRes;
      const activeLoans = loansRes?.data || loansRes || [];

      const salary = parseFloat(eProfile.salary || 0);
      const savingsRate = parseFloat(savingsData?.saving_percentage || 0);
      const loanDeduction = activeLoans.filter(l => l.status === 'ACTIVE').reduce((sum, l) => sum + parseFloat(l.monthly_repayment || l.monthly_payment || 0), 0);
      
      // Standard tax and insurance rates (could be made configurable)
      const taxRate = 0.15; // 15% tax
      const insuranceRate = 0.05; // 5% insurance

      setSalaryData({
        salary,
        savingsRate,
        loanDeduction,
        taxRate,
        insuranceRate,
        loading: false
      });

      // Generate realistic payroll history
      const hireDate = new Date(eProfile.hire_date || new Date());
      const monthsSinceHire = Math.min(24, Math.floor((new Date() - hireDate) / (1000 * 60 * 60 * 24 * 30)));
      
      const simulatedHistory = [];
      let cumulativeSavings = 0;
      let cumulativeLoanPayments = 0;

      for (let i = 0; i < monthsSinceHire; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        
        const monthlySavings = (salary * savingsRate) / 100;
        const monthlyTax = salary * taxRate;
        const monthlyInsurance = salary * insuranceRate;
        const totalDeductions = monthlySavings + loanDeduction + monthlyTax + monthlyInsurance;
        const netPay = salary - totalDeductions;

        cumulativeSavings += monthlySavings;
        if (i === 0) cumulativeLoanPayments += loanDeduction;

        simulatedHistory.push({
          id: i,
          month: date.toLocaleString('default', { month: 'long', year: 'numeric' }),
          year: date.getFullYear(),
          salary,
          savingsDeduction: monthlySavings,
          loanDeduction: i === 0 ? loanDeduction : 0,
          taxDeduction: monthlyTax,
          insuranceDeduction: monthlyInsurance,
          otherDeductions: 0,
          totalDeductions,
          netPay,
          payDate: new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0],
          status: i === 0 ? 'processed' : 'completed',
          processedDate: date.toISOString(),
          cumulativeSavings,
          cumulativeLoanPayments
        });
      }

      setHistory(simulatedHistory);

      // Calculate analytics
      const ytdEarnings = simulatedHistory.reduce((sum, h) => sum + h.salary, 0);
      const ytdDeductions = simulatedHistory.reduce((sum, h) => sum + h.totalDeductions, 0);
      const ytdNetPay = simulatedHistory.reduce((sum, h) => sum + h.netPay, 0);
      const avgMonthlyNet = simulatedHistory.length > 0 ? ytdNetPay / simulatedHistory.length : 0;

      setAnalytics({
        ytdEarnings,
        ytdDeductions,
        ytdNetPay,
        avgMonthlyNet,
        totalSavings: cumulativeSavings,
        totalLoanPayments: cumulativeLoanPayments
      });

      // Trigger notifications for current month salary and deductions
      if (simulatedHistory.length > 0) {
        const currentMonth = simulatedHistory[0];
        
        // Salary update notification
        await notificationService.notifySalaryUpdated({
          amount: currentMonth.salary
        });
        
        // Payroll deduction notification if there are deductions
        if (currentMonth.totalDeductions > 0) {
          await notificationService.notifyPayrollDeduction({
            amount: currentMonth.totalDeductions
          });
        }
      }

    } catch (error) {
      console.error('Error fetching payroll data:', error);
      setError('Failed to load payroll data. Please try again.');
      setSalaryData(prev => ({ ...prev, loading: false }));
    } finally {
      setLoading(false);
    }
  };

  const currentMonthStats = {
    salary: salaryData.salary,
    savingsDeduction: (salaryData.salary * salaryData.savingsRate) / 100,
    loanDeduction: salaryData.loanDeduction,
    taxDeduction: salaryData.salary * salaryData.taxRate,
    insuranceDeduction: salaryData.salary * salaryData.insuranceRate,
    otherDeductions: 0,
    totalDeductions: ((salaryData.salary * salaryData.savingsRate) / 100) + salaryData.loanDeduction + (salaryData.salary * salaryData.taxRate) + (salaryData.salary * salaryData.insuranceRate),
    netPay: salaryData.salary - (((salaryData.salary * salaryData.savingsRate) / 100) + salaryData.loanDeduction + (salaryData.salary * salaryData.taxRate) + (salaryData.salary * salaryData.insuranceRate))
  };

  const filteredPayrollData = history.filter(payroll => {
    const matchesSearch = payroll.month.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = payroll.year.toString() === yearFilter;
    const matchesMonth = !monthFilter || payroll.month.toLowerCase().includes(monthFilter.toLowerCase());
    return matchesSearch && matchesYear && matchesMonth;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'processed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const exportPayrollStatement = () => {
    // Create CSV content
    const headers = ['Month', 'Salary', 'Savings', 'Loan', 'Tax', 'Insurance', 'Total Deductions', 'Net Pay', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredPayrollData.map(payroll => [
        payroll.month,
        payroll.salary,
        payroll.savingsDeduction.toFixed(2),
        payroll.loanDeduction.toFixed(2),
        payroll.taxDeduction.toFixed(2),
        payroll.insuranceDeduction.toFixed(2),
        payroll.totalDeductions.toFixed(2),
        payroll.netPay.toFixed(2),
        payroll.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payroll-statement-${yearFilter}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    // Trigger notification for export completion
    notificationService.notifyExportCompleted({
      format: 'CSV',
      filename: `payroll-statement-${yearFilter}.csv`
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <FiRefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading payroll data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <FiAlertCircle className="w-8 h-8 text-red-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={fetchPayrollData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                Payroll Management System
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Comprehensive salary, deductions, and financial insights
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <FiEye className="mr-2" />
                {showDetails ? 'Simple View' : 'Detailed View'}
              </button>
              <button
                onClick={exportPayrollStatement}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                <FiDownload className="mr-2" />
                Export Statement
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">YTD Earnings</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {formatCurrency(analytics.ytdEarnings)}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <FiTrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">YTD Net Pay</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {formatCurrency(analytics.ytdNetPay)}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <FiDollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Savings</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {formatCurrency(analytics.totalSavings)}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <FiShield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Monthly Net</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {formatCurrency(analytics.avgMonthlyNet)}
                </p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <FiBarChart2 className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Current Month Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <FiCalendar className="mr-2" />
            Current Month Breakdown
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Earnings */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Earnings</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300">Base Salary</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {formatCurrency(currentMonthStats.salary)}
                  </span>
                </div>
              </div>
            </div>

            {/* Deductions */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Deductions</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300">Savings ({salaryData.savingsRate}%)</span>
                  <span className="font-semibold text-red-600 dark:text-red-400">
                    -{formatCurrency(currentMonthStats.savingsDeduction)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300">Loan Payments</span>
                  <span className="font-semibold text-red-600 dark:text-red-400">
                    -{formatCurrency(currentMonthStats.loanDeduction)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300">Tax ({(salaryData.taxRate * 100).toFixed(0)}%)</span>
                  <span className="font-semibold text-red-600 dark:text-red-400">
                    -{formatCurrency(currentMonthStats.taxDeduction)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300">Insurance ({(salaryData.insuranceRate * 100).toFixed(0)}%)</span>
                  <span className="font-semibold text-red-600 dark:text-red-400">
                    -{formatCurrency(currentMonthStats.insuranceDeduction)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Net Pay */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-gray-900 dark:text-white">Net Pay</span>
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(currentMonthStats.netPay)}
              </span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by month..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="px-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {getYearOptions().map(year => (
                <option key={year} value={year.toString()}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Payroll History Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <FiFileText className="mr-2" />
              Payroll History
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Salary
                  </th>
                  {showDetails && (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Savings
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Loan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Tax
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Insurance
                      </th>
                    </>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Net Pay
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredPayrollData.map((payroll) => (
                  <tr key={payroll.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {payroll.month}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {payroll.payDate}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {formatCurrency(payroll.salary)}
                      </div>
                    </td>
                    {showDetails && (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {formatCurrency(payroll.savingsDeduction)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {formatCurrency(payroll.loanDeduction)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {formatCurrency(payroll.taxDeduction)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {formatCurrency(payroll.insuranceDeduction)}
                          </div>
                        </td>
                      </>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                        {formatCurrency(payroll.netPay)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payroll.status)}`}>
                        {payroll.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayrollPage;
