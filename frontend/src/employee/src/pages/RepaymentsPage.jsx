import React, { useState } from 'react';
import { FiCreditCard, FiTrendingDown, FiCalendar, FiDownload, FiEye } from 'react-icons/fi';
import { LineChart } from '../components/Shared/Chart';

const RepaymentsPage = () => {
  const [activeTab, setActiveTab] = useState('summary');
  const [selectedLoan, setSelectedLoan] = useState(null);

  const repaymentSummary = {
    totalLoanBalance: 15000,
    totalRepaid: 10000,
    remainingBalance: 15000,
    monthlyDeduction: 916.67,
  };

  const activeLoans = [
    {
      id: 'LN001',
      loanType: 'Emergency',
      approvedAmount: 5000,
      remainingBalance: 2500,
      monthlyInstallment: 416.67,
      interestRate: 5,
      startDate: '2024-01-15',
      endDate: '2025-01-15',
      status: 'active',
    },
    {
      id: 'LN002',
      loanType: 'Personal',
      approvedAmount: 10000,
      remainingBalance: 12500,
      monthlyInstallment: 500,
      interestRate: 5,
      startDate: '2023-12-01',
      endDate: '2025-12-01',
      status: 'active',
    },
  ];

  const repaymentHistory = [
    {
      id: 1,
      date: '2024-03-01',
      loanId: 'LN001',
      installmentAmount: 416.67,
      principal: 395.83,
      interest: 20.84,
      remainingBalance: 2500,
      status: 'paid',
    },
    {
      id: 2,
      date: '2024-03-01',
      loanId: 'LN002',
      installmentAmount: 500,
      principal: 479.17,
      interest: 20.83,
      remainingBalance: 12500,
      status: 'paid',
    },
    {
      id: 3,
      date: '2024-02-01',
      loanId: 'LN001',
      installmentAmount: 416.67,
      principal: 395.83,
      interest: 20.84,
      remainingBalance: 2916.67,
      status: 'paid',
    },
    {
      id: 4,
      date: '2024-02-01',
      loanId: 'LN002',
      installmentAmount: 500,
      principal: 479.17,
      interest: 20.83,
      remainingBalance: 13000,
      status: 'paid',
    },
    {
      id: 5,
      date: '2024-01-01',
      loanId: 'LN001',
      installmentAmount: 416.67,
      principal: 395.83,
      interest: 20.84,
      remainingBalance: 3333.33,
      status: 'paid',
    },
  ];

  const repaymentSchedule = [
    {
      month: 'April 2024',
      installment: 416.67,
      principal: 395.83,
      interest: 20.84,
      balance: 2083.33,
      loanId: 'LN001',
    },
    {
      month: 'May 2024',
      installment: 416.67,
      principal: 395.83,
      interest: 20.84,
      balance: 1666.67,
      loanId: 'LN001',
    },
    {
      month: 'June 2024',
      installment: 416.67,
      principal: 395.83,
      interest: 20.84,
      balance: 1250,
      loanId: 'LN001',
    },
    {
      month: 'July 2024',
      installment: 416.67,
      principal: 395.83,
      interest: 20.84,
      balance: 833.33,
      loanId: 'LN001',
    },
    {
      month: 'August 2024',
      installment: 416.67,
      principal: 395.83,
      interest: 20.84,
      balance: 416.67,
      loanId: 'LN001',
    },
    {
      month: 'September 2024',
      installment: 416.67,
      principal: 395.83,
      interest: 20.84,
      balance: 0,
      loanId: 'LN001',
    },
  ];

  const loanBalanceData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Emergency Loan',
        data: [5000, 4583.33, 4166.67, 3750, 3333.33, 2916.67, 2500, 2083.33, 1666.67, 1250, 833.33, 416.67],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Personal Loan',
        data: [15000, 14500, 14000, 13500, 13000, 12500, 12000, 11500, 11000, 10500, 10000, 9500],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const calculateProgress = (approvedAmount, remainingBalance) => {
    if (approvedAmount === 0) return 0;
    return ((approvedAmount - remainingBalance) / approvedAmount) * 100;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200';
      case 'pending':
        return 'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200';
      case 'overdue':
        return 'bg-danger-100 text-danger-800 dark:bg-danger-900 dark:text-danger-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const tabs = [
    { id: 'summary', label: 'Summary', icon: FiCreditCard },
    { id: 'history', label: 'Repayment History', icon: FiCalendar },
    { id: 'schedule', label: 'Repayment Schedule', icon: FiCalendar },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Repayments</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Track your loan repayments and schedule</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Loan Balance</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                ${repaymentSummary.totalLoanBalance.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-danger-100 text-danger-600 dark:bg-danger-900 dark:text-danger-400 rounded-lg">
              <FiCreditCard className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Repaid</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                ${repaymentSummary.totalRepaid.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-success-100 text-success-600 dark:bg-success-900 dark:text-success-400 rounded-lg">
              <FiTrendingDown className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Remaining Balance</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                ${repaymentSummary.remainingBalance.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-warning-100 text-warning-600 dark:bg-warning-900 dark:text-warning-400 rounded-lg">
              <FiCreditCard className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Deduction</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                ${repaymentSummary.monthlyDeduction.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400 rounded-lg">
              <FiCalendar className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2
                    ${activeTab === tab.id
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'summary' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Loan Balance Over Time</h3>
                <LineChart data={loanBalanceData} height={300} />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Repayment Progress</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeLoans.map((loan) => (
                    <div key={loan.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                          {loan.loanType} Loan ({loan.id})
                        </h4>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {calculateProgress(loan.approvedAmount, loan.remainingBalance).toFixed(1)}% repaid
                        </span>
                      </div>
                      <div className="mb-2">
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                          <span>Progress</span>
                          <span>${(loan.approvedAmount - loan.remainingBalance).toLocaleString()} / ${loan.approvedAmount.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{ width: `${calculateProgress(loan.approvedAmount, loan.remainingBalance)}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Monthly:</span>
                          <span className="ml-1 font-medium text-gray-900 dark:text-gray-100">${loan.monthlyInstallment}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Remaining:</span>
                          <span className="ml-1 font-medium text-gray-900 dark:text-gray-100">${loan.remainingBalance.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Repayment History</h3>
                <button className="btn-secondary flex items-center space-x-2">
                  <FiDownload className="w-4 h-4" />
                  <span>Export</span>
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Loan ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Installment Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Principal
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Interest
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Remaining Balance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {repaymentHistory.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {new Date(payment.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                          {payment.loanId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          ${payment.installmentAmount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          ${payment.principal.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          ${payment.interest.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          ${payment.remainingBalance.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                            {payment.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Repayment Schedule</h3>
                <button className="btn-secondary flex items-center space-x-2">
                  <FiDownload className="w-4 h-4" />
                  <span>Export Schedule</span>
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Month
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Loan ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Installment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Principal
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Interest
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Balance
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {repaymentSchedule.map((payment, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {payment.month}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                          {payment.loanId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          ${payment.installment.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          ${payment.principal.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          ${payment.interest.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          ${payment.balance.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RepaymentsPage;
