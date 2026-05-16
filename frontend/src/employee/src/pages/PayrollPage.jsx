import React, { useState, useEffect } from 'react';
import { FiCalendar, FiDollarSign, FiDownload, FiSearch, FiFilter, FiTrendingUp, FiPieChart, FiActivity, FiCreditCard, FiShield, FiTarget, FiBarChart2 } from 'react-icons/fi';
import { employeeAPI } from '../../../shared/services/employeeAPI';
import { savingsAPI } from '../../../shared/services/savingsAPI';
import { loansAPI } from '../../../shared/services/loansAPI';

const PayrollPage = () => {
  
  const formatCompactNumber = (num) => {
    const val = Number(num);
    if (isNaN(val)) return '0.00 ETB';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val) + ' ETB';
  };

  const currentYear = new Date().getFullYear();
  const [searchTerm, setSearchTerm] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [yearFilter, setYearFilter] = useState(currentYear.toString());

  const [salaryData, setSalaryData] = useState({
    salary: 0,
    savingsRate: 0,
    loanDeduction: 0,
    loading: true
  });
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchPayrollData = async () => {
      try {
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

        setSalaryData({
          salary,
          savingsRate,
          loanDeduction,
          activeLoans,
          savingsData,
          loading: false
        });

        const payrollRes = await employeeAPI.getPayrollHistory(1, 20);
        const payrollHistory = payrollRes?.data?.history || payrollRes?.history || [];
        
        setHistory(payrollHistory.map(p => ({
          id: p.id,
          month: p.payroll_date ? new Date(p.payroll_date).toLocaleString('default', { month: 'long', year: 'numeric' }) : 'Unknown',
          salary: parseFloat(p.gross_salary || 0),
          savingsDeduction: parseFloat(p.savings_deduction || 0),
          loanDeduction: parseFloat(p.loan_repayment_deduction || 0),
          otherDeductions: 0,
          netPay: parseFloat(p.net_salary || 0),
          payDate: p.payroll_date || p.created_at,
          status: p.batch_status?.toLowerCase() || 'processed'
        })));
        
      } catch (error) {
        console.error('Error fetching payroll data:', error);
        setSalaryData(prev => ({ ...prev, loading: false }));
      }
    };
    fetchPayrollData();
  }, []);

  const latestPayroll = history.find(p => p.status === 'processed');
  const currentMonthStats = latestPayroll ? {
    salary: latestPayroll.salary,
    savingsDeduction: latestPayroll.savingsDeduction,
    loanDeduction: latestPayroll.loanDeduction,
    otherDeductions: latestPayroll.otherDeductions,
    totalDeductions: latestPayroll.savingsDeduction + latestPayroll.loanDeduction + latestPayroll.otherDeductions,
    netPay: latestPayroll.netPay
  } : {
    salary: salaryData.salary,
    savingsDeduction: (salaryData.salary * salaryData.savingsRate) / 100,
    loanDeduction: salaryData.loanDeduction,
    otherDeductions: 0,
    totalDeductions: ((salaryData.salary * salaryData.savingsRate) / 100) + salaryData.loanDeduction,
    netPay: salaryData.salary - ((salaryData.salary * salaryData.savingsRate) / 100) - salaryData.loanDeduction,
  };

  const payrollForYear = history.filter(p => p.month.includes(yearFilter) && p.status !== 'failed');
  const yearStats = {
    totalSalary: payrollForYear.reduce((sum, p) => sum + p.salary, 0),
    totalSavings: payrollForYear.reduce((sum, p) => sum + p.savingsDeduction, 0),
    totalLoanRepayments: payrollForYear.reduce((sum, p) => sum + p.loanDeduction, 0),
    totalNetPay: payrollForYear.reduce((sum, p) => sum + p.netPay, 0),
  };

  const filteredPayrollData = history.filter(payroll => {
    const matchesSearch = payroll.month.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = payroll.month.includes(yearFilter);
    const matchesMonth = !monthFilter || payroll.month.toLowerCase().includes(monthFilter.toLowerCase());
    return matchesSearch && matchesYear && matchesMonth;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'processed':
        return 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200';
      case 'pending':
        return 'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200';
      case 'failed':
        return 'bg-danger-100 text-danger-800 dark:bg-danger-900 dark:text-danger-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentMonthLabel = latestPayroll ? latestPayroll.month : 'Current Month';
  const years = Array.from({length: 5}, (_, i) => (currentYear - i).toString());

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {}
      <div className="w-full bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <FiDollarSign className="mr-3 text-blue-600" />
                Payroll Dashboard
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Track your salary, deductions, and financial insights</p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="inline-flex items-center px-5 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-medium rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg">
                <FiDownload className="mr-2" />
                Download Statement
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {}
        <div className="grid grid-cols-1 gap-8">
          {}
          <div className="w-full">
            <div className="card shadow-lg">
              <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 border-b border-gray-200 dark:border-gray-600">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                    <FiBarChart2 className="mr-2 text-blue-600" />
                    Payroll History
                  </h3>
                  <button className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-all duration-200 shadow">
                    <FiDownload className="w-4 h-4 mr-2" />
                    Export CSV
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 mt-6">
                  <div className="relative flex-1">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search payroll records..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full transition-all duration-200"
                    />
                  </div>

                  <div className="flex space-x-2 sm:ml-4">
                    <select
                      value={monthFilter}
                      onChange={(e) => setMonthFilter(e.target.value)}
                      className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="">All Months</option>
                      {months.map(month => (
                        <option key={month} value={month}>{month}</option>
                      ))}
                    </select>

                    <select
                      value={yearFilter}
                      onChange={(e) => setYearFilter(e.target.value)}
                      className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Month</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Salary</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Deductions</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Net Pay</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredPayrollData.map((payroll, index) => (
                      <tr key={payroll.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{payroll.month}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{new Date(payroll.payDate).toLocaleDateString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                          {formatCompactNumber(payroll.salary)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            <div>Savings: {formatCompactNumber(payroll.savingsDeduction)}</div>
                            <div>Loan: {formatCompactNumber(payroll.loanDeduction)}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-green-600 dark:text-green-400">
                            {formatCompactNumber(payroll.netPay)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(payroll.status)}`}>
                            {payroll.status === 'processed' ? '✓' : payroll.status === 'pending' ? '⏳' : '✗'} {payroll.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {}
            <div className="card p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <FiPieChart className="mr-2 text-blue-600 dark:text-blue-400" />
                Breakdown ({currentMonthLabel})
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Gross Salary</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {formatCompactNumber(currentMonthStats.salary)}
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Savings</span>
                    <span className="font-medium text-red-600 dark:text-red-400">
                      -{formatCompactNumber(currentMonthStats.savingsDeduction)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div className="bg-blue-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${salaryData.salary > 0 ? (currentMonthStats.savingsDeduction / salaryData.salary) * 100 : 0}%` }}></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Loan Repayment</span>
                    <span className="font-medium text-red-600 dark:text-red-400">
                      -{formatCompactNumber(currentMonthStats.loanDeduction)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div className="bg-orange-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${salaryData.salary > 0 ? (currentMonthStats.loanDeduction / salaryData.salary) * 100 : 0}%` }}></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Other Deductions</span>
                    <span className="font-medium text-red-600 dark:text-red-400">
                      -{formatCompactNumber(currentMonthStats.otherDeductions)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div className="bg-purple-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${salaryData.salary > 0 ? (currentMonthStats.otherDeductions / salaryData.salary) * 100 : 0}%` }}></div>
                  </div>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-900/50">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">Net Pay</span>
                    <span className="text-xl font-bold text-green-600 dark:text-green-400">
                      {formatCompactNumber(currentMonthStats.netPay)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {}
            <div className="card p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <FiBarChart2 className="mr-2 text-green-600 dark:text-green-400" />
                Yearly Summary ({yearFilter})
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900/50">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Salary</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {formatCompactNumber(yearStats.totalSalary)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-900/50">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Savings</span>
                  <span className="font-bold text-green-600 dark:text-green-400">
                    {formatCompactNumber(yearStats.totalSavings)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-100 dark:border-orange-900/50">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Loan Repayments</span>
                  <span className="font-bold text-orange-600 dark:text-orange-400">
                    {formatCompactNumber(yearStats.totalLoanRepayments)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-900/50">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Net Pay</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">
                    {formatCompactNumber(yearStats.totalNetPay)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {}
          <div className="w-full">
            <div className="card p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <FiTrendingUp className="mr-2 text-indigo-600 dark:text-indigo-400" />
                Financial Insights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 rounded-lg p-6 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Savings Balance</span>
                    <span className="text-sm font-bold text-green-600 dark:text-green-400">{formatCompactNumber(salaryData.savingsData?.current_balance || 0)} ETB</span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">From {salaryData.savingsRate}% monthly deduction</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 rounded-lg p-6 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Loans</span>
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{salaryData.activeLoans?.length || 0}</span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Monthly repayment: {formatCompactNumber(salaryData.loanDeduction)}</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 rounded-lg p-6 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Repaid Year</span>
                    <span className="text-sm font-bold text-purple-600 dark:text-purple-400">{formatCompactNumber(yearStats.totalLoanRepayments)} ETB</span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Keep up the great work!</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayrollPage;
