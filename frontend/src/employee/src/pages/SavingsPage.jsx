import React, { useState, useEffect } from 'react';
import { FiTrendingUp, FiDollarSign, FiCalendar, FiDownload, FiUpload, FiEdit2, FiAlertCircle, FiInfo } from 'react-icons/fi';
import StatCard from '../components/Shared/StatCard';
import { LineChart } from '../components/Shared/Chart';
import { savingsAPI } from '../../../shared/services/savingsAPI';

const SavingsPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [savingRate, setSavingRate] = useState(25);
  const [savingInput, setSavingInput] = useState('25');
  const [showSavingSuccess, setShowSavingSuccess] = useState(false);
  const [showWithdrawalForm, setShowWithdrawalForm] = useState(false);
  const [withdrawalForm, setWithdrawalForm] = useState({
    reason: '',
    supportingDocument: null,
    confirmation: false,
  });
  const [showWithdrawalSuccess, setShowWithdrawalSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savingsData, setSavingsData] = useState({
    totalBalance: 0,
    currentRate: 25,
    monthlyDeduction: 0,
    totalContributions: 0,
    salary: 0,
  });
  const [payrollHistory, setPayrollHistory] = useState([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [savingsGrowthData, setSavingsGrowthData] = useState({
    labels: [],
    datasets: []
  });
  
  const parsedRate = parseInt(savingInput);
  const isRateValid = !isNaN(parsedRate) && parsedRate >= 15 && parsedRate <= 65;
  const estimatedDeduction = isRateValid ? (savingsData.salary * parsedRate / 100) : 0;

  useEffect(() => {
    loadSavingsData();
  }, []);

  const loadSavingsData = async () => {
    try {
      setLoading(true);
      
      try {
        // Get savings account data
        const accountData = await savingsAPI.getSavingsAccount();
        if (accountData) {
          setSavingsData({
            totalBalance: accountData.total_balance || 0,
            currentRate: accountData.saving_percentage || 25,
            monthlyDeduction: accountData.monthly_deduction || 0,
            totalContributions: accountData.total_contributions || 0,
            salary: accountData.salary || 0,
          });
          setSavingRate(accountData.saving_percentage || 25);
          setSavingInput(String(accountData.saving_percentage || 25));
        }
      } catch (accountError) {
        console.log('No savings account found, using defaults');
        // User doesn't have a savings account yet, use defaults
        setSavingsData({
          totalBalance: 0,
          currentRate: 25,
          monthlyDeduction: 0,
          totalContributions: 0,
          salary: 0,
        });
        setSavingRate(25);
        setSavingInput('25');
      }

      try {
        // Get payroll history
        const historyData = await savingsAPI.getSavingsTransactions(1, 10);
        setPayrollHistory(historyData.transactions || []);
      } catch (historyError) {
        console.log('No transaction history found');
        setPayrollHistory([]);
      }

      try {
        // Get withdrawal requests
        console.log('Fetching withdrawal requests...');
        const withdrawalData = await savingsAPI.getSavingsTransactions(1, 10, { transaction_type: 'withdrawal' });
        console.log('Withdrawal data received:', withdrawalData);
        setWithdrawalRequests(withdrawalData.transactions || []);
      } catch (withdrawalError) {
        console.log('No withdrawal requests found, using empty array:', withdrawalError);
        setWithdrawalRequests([]);
      }

      // Generate growth data (mock for now)
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const currentBalance = savingsData.totalBalance || 0;
      const growthData = months.map((month, index) => {
        const balance = currentBalance - (11 - index) * 1000;
        return Math.max(0, balance + Math.random() * 500);
      });

      setSavingsGrowthData({
        labels: months,
        datasets: [
          {
            label: 'Savings Balance',
            data: growthData,
            borderColor: 'rgb(34, 197, 94)',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            tension: 0.4,
            fill: true,
          },
        ],
      });

    } catch (error) {
      console.error('Failed to load savings data:', error);
      // Could show error message in UI instead
    } finally {
      setLoading(false);
    }
  };

  const handleSavingRateChange = (newRate) => {
    if (newRate >= 15 && newRate <= 65) {
      setSavingRate(newRate);
    }
  };

  const handleSavingConfirm = async () => {
    if (!isRateValid) return;
    
    try {
      setLoading(true);
      await savingsAPI.updateSavingPercentage(parsedRate);
      
      setSavingRate(parsedRate);
      setShowSavingSuccess(true);
      
      // Update local data
      setSavingsData(prev => ({
        ...prev,
        currentRate: parsedRate,
        monthlyDeduction: (prev.salary * parsedRate / 100)
      }));
      
      console.log(`Saving rate updated to ${parsedRate}%`);
      
    } catch (error) {
      console.error('Failed to update saving rate:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawalSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      await savingsAPI.withdrawSavings(
        savingsData.totalBalance,
        withdrawalForm.reason,
        withdrawalForm.supportingDocument
      );
      
      setShowWithdrawalForm(false);
      setWithdrawalForm({ reason: '', supportingDocument: null, confirmation: false });
      setShowWithdrawalSuccess(true);
      
      console.log('Withdrawal request submitted successfully');
      
      await loadSavingsData();
      
    } catch (error) {
      console.error('Failed to submit withdrawal request:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200';
      case 'pending':
        return 'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200';
      case 'rejected':
        return 'bg-danger-100 text-danger-800 dark:bg-danger-900 dark:text-danger-200';
      case 'paid':
        return 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FiTrendingUp },
    { id: 'withdrawal', label: 'Withdrawal Request', icon: FiUpload },
    { id: 'history', label: 'Payroll History', icon: FiCalendar },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Savings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your payroll-deducted savings</p>
      </div>

      {/* Show message if no savings account exists */}
      {savingsData.totalBalance === 0 && savingsData.salary === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <FiInfo className="w-6 h-6 text-blue-600" />
            <div>
              <h3 className="text-lg font-medium text-blue-900">No Savings Account Found</h3>
              <p className="text-blue-700 mt-1">
                You don't have a savings account yet. Contact HR to set up your payroll-deducted savings account.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Savings Balance"
          value={`$${savingsData.totalBalance.toLocaleString()}`}
          change={savingsData.totalBalance > 0 ? "+$2,500 this month" : "No activity yet"}
          changeType={savingsData.totalBalance > 0 ? "positive" : "neutral"}
          icon={<FiTrendingUp className="w-6 h-6" />}
          color="success"
        />
        <StatCard
          title="Current Saving Rate"
          value={`${savingsData.currentRate}%`}
          change="of monthly salary"
          changeType="neutral"
          icon={<FiDollarSign className="w-6 h-6" />}
          color="primary"
        />
        <StatCard
          title="Monthly Deduction"
          value={`$${savingsData.monthlyDeduction.toLocaleString()}`}
          change={savingsData.monthlyDeduction > 0 ? "Next: March 31" : "No deductions yet"}
          changeType="neutral"
          icon={<FiCalendar className="w-6 h-6" />}
          color="warning"
        />
        <StatCard
          title="Total Contributions"
          value={`$${savingsData.totalContributions.toLocaleString()}`}
          change={savingsData.totalContributions > 0 ? "Since joining" : "No contributions yet"}
          changeType="neutral"
          icon={<FiDownload className="w-6 h-6" />}
          color="primary"
        />
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
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Savings Growth</h3>
                <LineChart data={savingsGrowthData} height={300} />
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 p-8 w-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-blue-600 rounded-xl">
                    <FiTrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-tight">Update Saving Rate</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Configuration Panel</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[11px] font-bold uppercase text-gray-400 tracking-widest">Saving Percentage (%)</label>
                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-tighter bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded">Min 15% – Max 65%</span>
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          min="15"
                          max="65"
                          value={savingInput}
                          onChange={(e) => setSavingInput(e.target.value)}
                          onBlur={() => {
                            const val = parseInt(savingInput);
                            if (!isNaN(val)) {
                              setSavingInput(String(Math.min(65, Math.max(15, val))));
                            }
                          }}
                          className={`w-full px-4 py-3 bg-white dark:bg-gray-900 border rounded-xl focus:ring-4 focus:ring-blue-500/10 outline-none text-xl font-black text-gray-900 dark:text-white pr-10 ${
                            savingInput !== '' && !isRateValid
                              ? 'border-red-400 focus:ring-red-400/10'
                              : 'border-gray-200 dark:border-gray-700'
                          }`}
                          placeholder="e.g. 25"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
                      </div>
                      {savingInput !== '' && !isRateValid && (
                        <p className="text-[10px] text-red-500 font-bold uppercase tracking-tighter">Must be between 15% and 65%</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase text-gray-400 tracking-widest">Estimated Monthly Deduction</label>
                      <div className="px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                        <p className={`text-xl font-black ${isRateValid ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`}>
                          {isRateValid ? `$${estimatedDeduction.toLocaleString()}` : '—'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-xl flex items-start gap-3">
                    <FiAlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <p className="text-[11px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-tight leading-relaxed">
                      Important: Changes submitted now will be processed and applied starting from the next payroll cycle.
                    </p>
                  </div>

                  <button
                    onClick={handleSavingConfirm}
                    disabled={!isRateValid || savingInput === ''}
                    className="w-full py-4 rounded-2xl font-black uppercase tracking-widest transition-all
                      bg-gray-900 dark:bg-white text-white dark:text-gray-900
                      hover:scale-[1.01] active:scale-[0.98]
                      shadow-xl shadow-gray-200 dark:shadow-none
                      disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:active:scale-100"
                  >
                    Confirm Rate Update
                  </button>
                </div>
              </div>

              {/* Success Modal */}
              {showSavingSuccess && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200">
                  <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-10 max-w-sm w-full mx-4 text-center animate-in zoom-in-95 duration-200">
                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2">Rate Updated!</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      Your saving rate has been set to
                    </p>
                    <p className="text-4xl font-black text-blue-600 dark:text-blue-400 mb-1">{savingRate}%</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
                      Monthly deduction: <span className="font-bold text-emerald-600">${(10000 * savingRate / 100).toLocaleString()}</span>
                    </p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">Changes apply in the next payroll cycle</p>
                    <button
                      onClick={() => setShowSavingSuccess(false)}
                      className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-black uppercase tracking-widest hover:opacity-90 transition-opacity"
                    >
                      Got it
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'withdrawal' && (
            <div className="space-y-8">
              {/* Hero Section */}
              <div className="bg-gray-800 rounded-2xl shadow-lg p-8 text-white">
                <div className="text-center">
                  <div className="mb-6">
                    <h2 className="text-3xl font-bold mb-2">Savings Withdrawal</h2>
                    <p className="text-gray-300">Request access to your accumulated savings</p>
                  </div>
                  
                  <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                    <div className="text-center">
                      <p className="text-sm text-gray-300 mb-1">Available Balance</p>
                      <p className="text-4xl font-bold mb-2">${savingsData.totalBalance.toLocaleString()}</p>
                      <div className="flex items-center justify-center space-x-6 text-sm">
                        <div className="text-center">
                          <p className="text-gray-300">Monthly Contribution</p>
                          <p className="font-semibold">${(savingsData.salary * savingRate / 100).toLocaleString()}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-300">Interest Rate</p>
                          <p className="font-semibold">2.5%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Important Notice */}
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
                    <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">Important Withdrawal Information</h3>
                    <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                      <li>• Full balance withdrawal only - partial withdrawals are not allowed</li>
                      <li>• All requests require admin approval and processing</li>
                      <li>• Processing typically takes 3-5 business days</li>
                      <li>• Funds will be transferred to your primary bank account</li>
                    </ul>
                  </div>
                </div>
              </div>

              {!showWithdrawalForm ? (
                <div className="text-center py-12">
                  <div className="max-w-md mx-auto">
                    <div className="mb-8">
                      <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Ready to Withdraw?</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                        You can request a full withdrawal of your savings balance. This action cannot be undone.
                      </p>
                    </div>
                    
                    <button
                      onClick={() => setShowWithdrawalForm(true)}
                      className="w-full bg-blue-600 text-white py-4 px-8 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Start Withdrawal Request
                    </button>
                    
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                      By proceeding, you acknowledge that this is a full withdrawal request.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="max-w-2xl mx-auto">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="bg-gray-100 dark:bg-gray-700 p-6 border-b border-gray-200 dark:border-gray-600">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Withdrawal Request Form</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Complete the form below to submit your request</p>
                    </div>

                    <form onSubmit={handleWithdrawalSubmit} className="p-6 space-y-6">
                      {/* Current Balance Display */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          Current Savings Balance
                        </label>
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Available for Withdrawal</p>
                              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                ${savingsData.totalBalance.toLocaleString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500 dark:text-gray-400">Interest Earned</p>
                              <p className="text-sm font-medium text-green-600 dark:text-green-400">
                                ${(savingsData.totalBalance * 0.025).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Reason for Withdrawal */}
                      <div>
                        <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          Reason for Withdrawal <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <textarea
                            id="reason"
                            rows={4}
                            required
                            value={withdrawalForm.reason}
                            onChange={(e) => setWithdrawalForm({ ...withdrawalForm, reason: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            placeholder="Please provide a detailed explanation of why you need to withdraw your savings..."
                          />
                          <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                            {withdrawalForm.reason.length}/500
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          Be specific about your financial needs. This helps with processing your request.
                        </p>
                      </div>

                      {/* Supporting Document */}
                      <div>
                        <label htmlFor="document" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          Supporting Document <span className="text-gray-500">(Optional)</span>
                        </label>
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
                          <input
                            type="file"
                            id="document"
                            onChange={(e) => setWithdrawalForm({ ...withdrawalForm, supportingDocument: e.target.files[0] })}
                            className="hidden"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          />
                          <label htmlFor="document" className="cursor-pointer">
                            <div className="flex flex-col items-center">
                              <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                                {withdrawalForm.supportingDocument ? withdrawalForm.supportingDocument.name : 'Click to upload document'}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                PDF, DOC, DOCX, JPG, PNG - Max 5MB
                              </p>
                            </div>
                          </label>
                        </div>
                      </div>

                      {/* Bank Account Confirmation */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          Bank Account Confirmation
                        </label>
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                          <div className="flex items-start space-x-3">
                            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                              <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">Please Confirm</p>
                              <p className="text-xs text-blue-600 dark:text-blue-400">
                                Funds will be transferred to your primary bank account on file. If you need to update your banking information, please contact HR.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Terms and Conditions */}
                      <div>
                        <label className="flex items-start space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            required
                            checked={withdrawalForm.confirmation}
                            onChange={(e) => setWithdrawalForm({ ...withdrawalForm, confirmation: e.target.checked })}
                            className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                          />
                          <div>
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              I understand that this is a full withdrawal request and my savings balance will be reset to zero upon approval. 
                              I also acknowledge that this action cannot be undone and future contributions will start a new savings cycle.
                            </span>
                            <span className="text-red-500 ml-1">*</span>
                          </div>
                        </label>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-4 pt-4">
                        <button
                          type="button"
                          onClick={() => setShowWithdrawalForm(false)}
                          className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-6 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          Cancel Request
                        </button>
                        <button
                          type="submit"
                          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                          Submit Withdrawal Request
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Withdrawal Requests History */}
              {withdrawalRequests.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Withdrawal Request History</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Track the status of your withdrawal requests</p>
                  </div>

                  <div className="p-6">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Request ID
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Amount
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Notes
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                          {withdrawalRequests.map((request) => (
                            <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                {request.id}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                {new Date(request.date).toLocaleDateString()}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                ${request.amount.toLocaleString()}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(request.status)}`}>
                                  {request.status === 'pending' && (
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                  )}
                                  {request.status === 'approved' && (
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                  {request.status === 'rejected' && (
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  )}
                                  {request.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                                {request.adminNotes || 'No notes available'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Payroll Deduction History</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Payroll Month
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Salary
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Saving %
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Deduction
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Balance
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {payrollHistory.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {new Date(record.date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {record.payrollMonth}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          ${record.salary.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {record.savingPercentage}%
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                          ${record.deductionAmount.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                          ${record.balance.toLocaleString()}
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

export default SavingsPage;
