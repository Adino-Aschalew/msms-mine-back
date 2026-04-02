import React, { useState, useEffect } from 'react';
import { FiCreditCard, FiTrendingDown, FiCalendar, FiDownload, FiEye, FiCheck, FiX, FiAlertCircle } from 'react-icons/fi';
import { LineChart } from '../components/Shared/Chart';
import { loansAPI } from '../../../shared/services/loansAPI';
import appEvents from '../../../shared/utils/eventEmitter';

const RepaymentsPage = () => {
  
  const formatCompactNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'METB';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'KETB';
    }
    return num.toString();
  };

  const [activeTab, setActiveTab] = useState('summary');
  const [selectedLoan, setSelectedLoan] = useState(null);

  const [loans, setLoans] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    
    
    const handleLoanApproved = () => {
      console.log('🔄 Loan approved event received, refreshing repayments page...');
      fetchData();
    };
    
    appEvents.on('loanApproved', handleLoanApproved);
    
    return () => {
      appEvents.off('loanApproved', handleLoanApproved);
    };
  }, []);
  
  const fetchData = async () => {
      try {
        setLoading(true);
        const [loansRes, transRes] = await Promise.all([
          loansAPI.getUserLoans(),
          loansAPI.getUserLoanTransactions()
        ]);

        const realLoans = loansRes?.data || loansRes || [];
        const realTrans = transRes?.data || transRes || [];

        setLoans(realLoans);
        setHistory(realTrans);
      } catch (error) {
        console.error('Error fetching repayment data:', error);
      } finally {
        setLoading(false);
      }
    };

  const repaymentSummary = {
    totalLoanBalance: loans.reduce((sum, l) => sum + parseFloat(l.loan_amount || 0), 0),
    totalRepaid: loans.reduce((sum, l) => sum + parseFloat(l.paid_amount || 0), 0),
    remainingBalance: loans.reduce((sum, l) => sum + parseFloat(l.outstanding_balance || 0), 0),
    monthlyDeduction: loans.filter(l => l.status === 'ACTIVE').reduce((sum, l) => sum + parseFloat(l.monthly_repayment || l.monthly_payment || 0), 0),
  };

  const activeLoansList = loans.filter(l => l.status === 'ACTIVE').map(l => ({
    id: l.id.toString(),
    loanType: l.loan_type || 'Personal',
    approvedAmount: parseFloat(l.loan_amount || 0),
    remainingBalance: parseFloat(l.outstanding_balance || 0),
    monthlyInstallment: parseFloat(l.monthly_repayment || l.monthly_payment || 0),
    interestRate: l.interest_rate || 5,
    startDate: l.start_date || l.created_at,
    endDate: l.maturity_date || 'N/A',
  }));

  const repaymentHistory = history.map(t => ({
    id: t.id,
    date: t.transaction_date || t.created_at,
    loanId: t.loan_id.toString(),
    installmentAmount: parseFloat(t.amount),
    principal: parseFloat(t.amount) * 0.9, 
    interest: parseFloat(t.amount) * 0.1,  
    remainingBalance: parseFloat(t.balance_after_transaction || 0),
    status: 'paid',
  }));

  const repaymentSchedule = []; 

  
  const generateLoanBalanceData = () => {
    const activeLoansList = loans.filter(l => l.status === 'ACTIVE');
    if (activeLoansList.length === 0) {
      return { labels: [], datasets: [] };
    }
    
    
    const labels = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push(date.toLocaleString('default', { month: 'short' }));
    }
    
    const datasets = activeLoansList.map((l, index) => {
      const principal = parseFloat(l.loan_amount || 0);
      const remaining = parseFloat(l.outstanding_balance || 0);
      const monthlyPayment = parseFloat(l.monthly_repayment || l.monthly_payment || 0);
      const loanStartDate = new Date(l.created_at || l.disbursement_date);
      
      
      const data = labels.map((_, i) => {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        
        
        if (monthDate < loanStartDate) {
          return 0;
        }
        
        
        const monthsSinceStart = Math.max(0, 
          (monthDate.getFullYear() - loanStartDate.getFullYear()) * 12 + 
          (monthDate.getMonth() - loanStartDate.getMonth())
        );
        
        
        const repaymentsBeforeMonth = history.filter(t => {
          const transDate = new Date(t.transaction_date || t.created_at);
          return t.loan_id === l.id && 
                 t.transaction_type === 'REPAYMENT' &&
                 transDate <= monthDate;
        }).reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
        
        
        let balanceAtMonth = principal - repaymentsBeforeMonth;
        
        
        balanceAtMonth = Math.max(0, Math.max(remaining, balanceAtMonth));
        
        return balanceAtMonth;
      });
      
      return {
        label: `${l.purpose || 'Personal'} Loan`,
        data,
        borderColor: index === 0 ? 'rgb(59, 130, 246)' : 'rgb(16, 185, 129)',
        backgroundColor: index === 0 ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
      };
    });
    
    return { labels, datasets };
  };

  const loanBalanceData = generateLoanBalanceData();

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
                {formatCompactNumber(repaymentSummary.totalLoanBalance)}
              </p>
            </div>
            <div className="p-3 bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400 rounded-lg">
              <FiCreditCard className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Repaid</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                {formatCompactNumber(repaymentSummary.totalRepaid)}
              </p>
            </div>
            <div className="p-3 bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-400 rounded-lg">
              <FiTrendingDown className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Remaining Balance</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                {formatCompactNumber(repaymentSummary.remainingBalance)}
              </p>
            </div>
            <div className="p-3 bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-400 rounded-lg">
              <FiCreditCard className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Deduction</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                {formatCompactNumber(repaymentSummary.monthlyDeduction)}
              </p>
            </div>
            <div className="p-3 bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400 rounded-lg">
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
                  {activeLoansList.map((loan) => (
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
                          <span>{formatCompactNumber(loan.approvedAmount - loan.remainingBalance)} / {formatCompactNumber(loan.approvedAmount)}</span>
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
                          <span className="ml-1 font-medium text-gray-900 dark:text-gray-100">{formatCompactNumber(loan.monthlyInstallment)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Remaining:</span>
                          <span className="ml-1 font-medium text-gray-900 dark:text-gray-100">{formatCompactNumber(loan.remainingBalance)}</span>
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
                          {formatCompactNumber(payment.installmentAmount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {formatCompactNumber(payment.principal)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {formatCompactNumber(payment.interest)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {formatCompactNumber(payment.remainingBalance)}
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
                          {formatCompactNumber(payment.installment)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {formatCompactNumber(payment.principal)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {formatCompactNumber(payment.interest)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {formatCompactNumber(payment.balance)}
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
