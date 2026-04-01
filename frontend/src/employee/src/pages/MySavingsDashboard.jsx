import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  Shield,
  Activity,
  Target,
  Clock,
  FileText,
  Settings,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  Calculator,
  History,
  Bell
} from 'lucide-react';
import EnterpriseSavingsAPI from '../../../shared/services/enterpriseSavingsAPI';

const MySavingsDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [simulationData, setSimulationData] = useState(null);
  const [constraints, setConstraints] = useState(null);

  useEffect(() => {
    loadDashboardData();
    loadConstraints();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await EnterpriseSavingsAPI.getSavingsDashboard();
      setDashboardData(data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadConstraints = async () => {
    try {
      const data = await EnterpriseSavingsAPI.getSavingsConstraints();
      setConstraints(data);
    } catch (err) {
      console.error('Failed to load constraints:', err);
    }
  };

  const handleSimulate = async (newValue, savingsType, effectiveDate) => {
    try {
      const simulation = await EnterpriseSavingsAPI.simulateSavingsChange(
        newValue, 
        savingsType, 
        effectiveDate
      );
      setSimulationData(simulation);
    } catch (err) {
      setError(err.message || 'Simulation failed');
    }
  };

  const handleSubmitRequest = async (requestData) => {
    try {
      await EnterpriseSavingsAPI.submitSavingsRequest(requestData);
      setShowRequestForm(false);
      setSimulationData(null);
      loadDashboardData(); // Refresh data
    } catch (err) {
      setError(err.message || 'Failed to submit request');
    }
  };

  const handleActivate = async () => {
    try {
      setLoading(true);
      const result = await EnterpriseSavingsAPI.createSavingsAccount(); // Use default 15%
      
      // Show success message with applied percentage
      const message = result.is_default 
        ? `Savings account activated successfully with ${result.saving_percentage}% default contribution rate!` 
        : `Savings account activated successfully with ${result.saving_percentage}% contribution rate!`;
      
      // You could add a toast notification here if you have one
      console.log(message);
      
      await loadDashboardData();
    } catch (err) {
      setError(err.message || 'Failed to activate account');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
          <span className="text-red-800">{error}</span>
        </div>
      </div>
    );
  }

  if (!dashboardData?.hasAccount) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Setup Your Savings Account</h3>
            <p className="text-blue-700">You haven't activated your payroll-deducted savings account yet.</p>
          </div>
          <button 
            onClick={handleActivate}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Activating...
              </>
            ) : (
              'Activate Now'
            )}
          </button>
        </div>
      </div>
    );
  }

  const { account, insights, financialHealth, employee, restrictions } = dashboardData;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'insights', label: 'Insights', icon: TrendingUp },
    { id: 'history', label: 'History', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Savings Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your payroll-deducted savings and track your financial progress
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {restrictions.hasPendingRequest && (
            <div className="flex items-center px-3 py-2 bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700/50 rounded-lg">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 mr-2" />
              <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Pending Request
              </span>
            </div>
          )}
          <button
            onClick={() => setShowRequestForm(true)}
            disabled={!restrictions.canModify}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <Settings className="w-4 h-4 mr-2" />
            Request Change
          </button>
        </div>
      </div>

      {/* Current Savings Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Current</span>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {account.savingsType === 'PERCENTAGE' ? `${account.currentValue}%` : EnterpriseSavingsAPI.formatCurrency(account.currentValue)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {account.savingsType === 'PERCENTAGE' ? 'of salary' : 'fixed amount'}
            </p>
          </div>
          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            Effective: {account.effectiveDate ? new Date(account.effectiveDate).toLocaleDateString() : 'Not set'}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Balance</span>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {EnterpriseSavingsAPI.formatCompactCurrency(account.currentBalance)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total accumulated</p>
          </div>
          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            Last updated: {new Date().toLocaleDateString()}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">YTD</span>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {EnterpriseSavingsAPI.formatCompactCurrency(insights.ytdContributions)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {insights.contributionCount} contributions
            </p>
          </div>
          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            +{EnterpriseSavingsAPI.formatCurrency(insights.ytdInterest)} interest
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Target className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Projected</span>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {EnterpriseSavingsAPI.formatCompactCurrency(insights.projectedAnnualSavings)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Annual projection</p>
          </div>
          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            Based on current rate
          </div>
        </div>
      </div>

      {/* Financial Health Indicator */}
      <div className={`bg-white dark:bg-gray-800 rounded-xl border p-6 ${
        financialHealth.status === 'SAFE' ? 'border-emerald-200 dark:border-emerald-700/50' :
        financialHealth.status === 'MODERATE' ? 'border-amber-200 dark:border-amber-700/50' :
        'border-rose-200 dark:border-rose-700/50'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg mr-3 ${
              financialHealth.status === 'SAFE' ? 'bg-emerald-100 dark:bg-emerald-900/30' :
              financialHealth.status === 'MODERATE' ? 'bg-amber-100 dark:bg-amber-900/30' :
              'bg-rose-100 dark:bg-rose-900/30'
            }`}>
              <Shield className={`w-5 h-5 ${
                financialHealth.status === 'SAFE' ? 'text-emerald-600 dark:text-emerald-400' :
                financialHealth.status === 'MODERATE' ? 'text-amber-600 dark:text-amber-400' :
                'text-rose-600 dark:text-rose-400'
              }`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Financial Health: {financialHealth.status}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Deduction Ratio: {EnterpriseSavingsAPI.formatPercentage(financialHealth.deductionRatio)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400">Net Salary</p>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {EnterpriseSavingsAPI.formatCurrency(financialHealth.netSalaryAfterDeductions)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Gross Salary</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {EnterpriseSavingsAPI.formatCurrency(financialHealth.grossSalary)}
            </p>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Deductions</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {EnterpriseSavingsAPI.formatCurrency(financialHealth.totalDeductions)}
            </p>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Deduction Ratio</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {EnterpriseSavingsAPI.formatPercentage(financialHealth.deductionRatio)}
            </p>
          </div>
        </div>

        {financialHealth.status !== 'SAFE' && (
          <div className={`mt-4 p-3 rounded-lg flex items-start ${
            financialHealth.status === 'MODERATE' ? 'bg-amber-50 dark:bg-amber-900/20' :
            'bg-rose-50 dark:bg-rose-900/20'
          }`}>
            <Info className={`w-4 h-4 mr-2 mt-0.5 ${
              financialHealth.status === 'MODERATE' ? 'text-amber-600 dark:text-amber-400' :
              'text-rose-600 dark:text-rose-400'
            }`} />
            <p className={`text-sm ${
              financialHealth.status === 'MODERATE' ? 'text-amber-800 dark:text-amber-200' :
              'text-rose-800 dark:text-rose-200'
            }`}>
              {financialHealth.status === 'MODERATE' 
                ? 'Your deduction ratio is moderate. Consider monitoring your overall financial commitments.'
                : 'Your deduction ratio is high. Review your financial obligations and consider reducing deductions.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Recent Contributions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Recent Contributions
          </h3>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
            View All
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
        
        {insights.recentContributions.length > 0 ? (
          <div className="space-y-3">
            {insights.recentContributions.map((contribution, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <div className="flex items-center">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg mr-3">
                    <ArrowDownRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {EnterpriseSavingsAPI.formatCurrency(contribution.amount)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {contribution.date ? new Date(contribution.date).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Balance</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {EnterpriseSavingsAPI.formatCurrency(contribution.balance)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No contributions yet</p>
          </div>
        )}
      </div>

      {/* Request Form Modal */}
      {showRequestForm && (
        <SavingsRequestForm
          onClose={() => setShowRequestForm(false)}
          onSubmit={handleSubmitRequest}
          onSimulate={handleSimulate}
          currentData={dashboardData}
          constraints={constraints}
          simulationData={simulationData}
        />
      )}
    </div>
  );
};

// Savings Request Form Component
const SavingsRequestForm = ({ onClose, onSubmit, onSimulate, currentData, constraints, simulationData }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    newValue: '',
    savingsType: currentData?.account?.savingsType || 'PERCENTAGE',
    effectiveDate: EnterpriseSavingsAPI.getEffectiveDateOptions()[0].value,
    reason: '',
    urgency: 'NORMAL',
    customDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.newValue || formData.newValue <= 0) {
      newErrors.newValue = 'Please enter a valid amount';
    }
    
    if (formData.savingsType === 'PERCENTAGE') {
      const value = parseFloat(formData.newValue);
      if (value < 15 || value > 65) {
        newErrors.newValue = 'Percentage must be between 15% and 65%';
      }
    }
    
    if (!formData.reason || formData.reason.length < 10) {
      newErrors.reason = 'Please provide a detailed reason (minimum 10 characters)';
    }
    
    if (formData.effectiveDate === 'custom' && !formData.customDate) {
      newErrors.customDate = 'Please select a specific date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateForm()) return;
    
    if (step === 1) {
      setLoading(true);
      const effectiveDate = formData.effectiveDate === 'custom' ? formData.customDate : formData.effectiveDate;
      await onSimulate(formData.newValue, formData.savingsType, effectiveDate);
      setLoading(false);
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    const effectiveDate = formData.effectiveDate === 'custom' ? formData.customDate : formData.effectiveDate;
    await onSubmit({
      ...formData,
      effectiveDate,
      simulationResult: simulationData
    });
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Request Savings Change</h2>
              <p className="text-blue-100 mt-1">
                {step === 1 && 'Configure your new savings settings'}
                {step === 2 && 'Review the impact of your changes'}
                {step === 3 && 'Confirm and submit your request'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Progress Indicator */}
          <div className="flex items-center space-x-2 mt-6">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                  s <= step 
                    ? 'bg-white text-blue-600' 
                    : 'bg-white/20 text-white/60'
                }`}>
                  {s < step ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    s
                  )}
                </div>
                {s < 3 && (
                  <div className={`flex-1 h-1 transition-colors ${
                    s < step ? 'bg-white' : 'bg-white/20'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 && (
            <div className="space-y-6">
              {/* Savings Type Selection */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Savings Configuration
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Savings Type
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {['PERCENTAGE', 'FIXED_AMOUNT'].map((type) => (
                        <button
                          key={type}
                          onClick={() => setFormData({...formData, savingsType: type, newValue: ''})}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            formData.savingsType === type
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                          }`}
                        >
                          <div className="text-sm font-medium">
                            {type === 'PERCENTAGE' ? 'Percentage' : 'Fixed Amount'}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {type === 'PERCENTAGE' ? '% of salary' : 'ETB per month'}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      New {formData.savingsType === 'PERCENTAGE' ? 'Percentage' : 'Amount'}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.newValue}
                        onChange={(e) => setFormData({...formData, newValue: e.target.value})}
                        className={`w-full px-4 py-3 border-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.newValue ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        }`}
                        placeholder={formData.savingsType === 'PERCENTAGE' ? 'e.g. 25' : 'e.g. 5000'}
                        min={formData.savingsType === 'PERCENTAGE' ? '15' : '100'}
                        max={formData.savingsType === 'PERCENTAGE' ? '65' : '50000'}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                        {formData.savingsType === 'PERCENTAGE' ? '%' : 'ETB'}
                      </span>
                    </div>
                    {errors.newValue && (
                      <p className="text-red-500 text-sm mt-2">{errors.newValue}</p>
                    )}
                    {formData.savingsType === 'PERCENTAGE' && (
                      <p className="text-gray-500 text-sm mt-2">
                        Range: 15% - 65% of monthly salary
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Effective Date */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Effective Date
                </h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {EnterpriseSavingsAPI.getEffectiveDateOptions().slice(0, 2).map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setFormData({...formData, effectiveDate: option.value, customDate: ''})}
                        className={`p-3 rounded-lg border-2 transition-all text-left ${
                          formData.effectiveDate === option.value
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        <div className="font-medium">{option.label}</div>
                      </button>
                    ))}
                    <button
                      onClick={() => setFormData({...formData, effectiveDate: 'custom'})}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        formData.effectiveDate === 'custom'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      <div className="font-medium">Specific Date</div>
                    </button>
                  </div>
                  
                  {formData.effectiveDate === 'custom' && (
                    <div>
                      <input
                        type="date"
                        value={formData.customDate}
                        onChange={(e) => setFormData({...formData, customDate: e.target.value})}
                        className={`w-full px-4 py-3 border-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.customDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        }`}
                        min={new Date().toISOString().split('T')[0]}
                      />
                      {errors.customDate && (
                        <p className="text-red-500 text-sm mt-2">{errors.customDate}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Reason and Urgency */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Request Details
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Reason for Change
                    </label>
                    <textarea
                      value={formData.reason}
                      onChange={(e) => setFormData({...formData, reason: e.target.value})}
                      className={`w-full px-4 py-3 border-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                        errors.reason ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      rows={4}
                      placeholder="Please explain why you want to change your savings configuration (e.g., financial goals, increased expenses, career changes, etc.)"
                    />
                    {errors.reason && (
                      <p className="text-red-500 text-sm mt-2">{errors.reason}</p>
                    )}
                    <p className="text-gray-500 text-sm mt-2">
                      {formData.reason.length}/500 characters
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Urgency Level
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'NORMAL', label: 'Normal', color: 'green' },
                        { value: 'URGENT', label: 'Urgent', color: 'yellow' },
                        { value: 'CRITICAL', label: 'Critical', color: 'red' }
                      ].map((urgency) => (
                        <button
                          key={urgency.value}
                          onClick={() => setFormData({...formData, urgency: urgency.value})}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            formData.urgency === urgency.value
                              ? `border-${urgency.color}-500 bg-${urgency.color}-50 dark:bg-${urgency.color}-900/20 text-${urgency.color}-700 dark:text-${urgency.color}-300`
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                          }`}
                        >
                          <div className="font-medium">{urgency.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && simulationData && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Impact Analysis
              </h3>
              
              {/* Comparison Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 p-6 rounded-xl border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Deduction</h4>
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {EnterpriseSavingsAPI.formatCurrency(simulationData.current.deduction)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {formData.savingsType === 'PERCENTAGE' ? `${currentData?.account?.currentValue}% of salary` : 'Fixed amount'}
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-6 rounded-xl border border-blue-200 dark:border-blue-600">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-medium text-blue-600 dark:text-blue-400">New Deduction</h4>
                    <div className="w-8 h-8 bg-blue-200 dark:bg-blue-600 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {EnterpriseSavingsAPI.formatCurrency(simulationData.proposed.deduction)}
                  </p>
                  <p className="text-sm text-blue-500 dark:text-blue-400 mt-1">
                    {formData.newValue}{formData.savingsType === 'PERCENTAGE' ? '% of salary' : ' ETB fixed'}
                  </p>
                </div>
              </div>

              {/* Monthly Impact */}
              <div className={`p-6 rounded-xl border-2 ${
                simulationData.impact.monthlyDifference > 0 
                  ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-700' 
                  : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Monthly Impact</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {simulationData.impact.monthlyDifference > 0 ? 'Additional deduction' : 'Reduced deduction'}
                    </p>
                  </div>
                  <div className={`text-3xl font-bold ${
                    simulationData.impact.monthlyDifference > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {simulationData.impact.monthlyDifference > 0 ? '+' : ''}
                    {EnterpriseSavingsAPI.formatCurrency(simulationData.impact.monthlyDifference)}
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                  Annual impact: {EnterpriseSavingsAPI.formatCurrency(simulationData.impact.annualDifference)}
                </div>
              </div>

              {/* Financial Health Warning */}
              {simulationData.validation && !simulationData.validation.isValid && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-700 p-6 rounded-xl">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-amber-200 dark:bg-amber-700 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">Financial Health Considerations</h4>
                      <ul className="space-y-1">
                        {simulationData.validation.violations?.map((violation, index) => (
                          <li key={index} className="text-sm text-amber-700 dark:text-amber-300">
                            • {violation.message}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Projected Annual Savings */}
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 p-6 rounded-xl border border-purple-200 dark:border-purple-600">
                <h4 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">Projected Annual Savings</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-purple-600 dark:text-purple-400">Current Year</p>
                    <p className="text-xl font-bold text-purple-900 dark:text-purple-100">
                      {EnterpriseSavingsAPI.formatCurrency(simulationData.current.annualSavings)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-purple-600 dark:text-purple-400">With New Rate</p>
                    <p className="text-xl font-bold text-purple-900 dark:text-purple-100">
                      {EnterpriseSavingsAPI.formatCurrency(simulationData.proposed.annualSavings)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Confirm Your Request
              </h3>
              
              {/* Request Summary */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Request Summary</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                    <span className="text-gray-600 dark:text-gray-400">Change Type</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {formData.savingsType === 'PERCENTAGE' ? 'Percentage' : 'Fixed Amount'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                    <span className="text-gray-600 dark:text-gray-400">From</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {currentData?.account?.currentValue}{currentData?.account?.savingsType === 'PERCENTAGE' ? '%' : ' ETB'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                    <span className="text-gray-600 dark:text-gray-400">To</span>
                    <span className="font-medium text-blue-600 dark:text-blue-400">
                      {formData.newValue}{formData.savingsType === 'PERCENTAGE' ? '%' : ' ETB'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                    <span className="text-gray-600 dark:text-gray-400">Effective Date</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {(formData.effectiveDate === 'custom' ? formData.customDate : formData.effectiveDate) ? 
                        new Date(formData.effectiveDate === 'custom' ? formData.customDate : formData.effectiveDate).toLocaleDateString('en-US', { 
                          month: 'long', 
                          day: 'numeric', 
                          year: 'numeric' 
                        }) : 'Not selected'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                    <span className="text-gray-600 dark:text-gray-400">Urgency</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      formData.urgency === 'NORMAL' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                      formData.urgency === 'URGENT' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                      'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                    }`}>
                      {formData.urgency}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 dark:text-gray-400">Monthly Impact</span>
                    <span className={`font-bold ${
                      simulationData?.impact?.monthlyDifference > 0 ? 'text-rose-600' : 'text-emerald-600'
                    }`}>
                      {simulationData?.impact?.monthlyDifference > 0 ? '+' : ''}
                      {EnterpriseSavingsAPI.formatCurrency(simulationData?.impact?.monthlyDifference || 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Important Notes */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 p-6 rounded-xl">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">Important Information</h4>
                <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                  <li className="flex items-start">
                    <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    This request will be reviewed by the finance team
                  </li>
                  <li className="flex items-start">
                    <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Changes will take effect on the specified date
                  </li>
                  <li className="flex items-start">
                    <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    You cannot submit another request while this one is pending
                  </li>
                  <li className="flex items-start">
                    <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Request processing typically takes 2-3 business days
                  </li>
                </ul>
              </div>

              {/* Reason Confirmation */}
              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Reason:</p>
                <p className="text-gray-900 dark:text-gray-100 italic">"{formData.reason}"</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center">
            <button
              onClick={onClose}
              className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors"
            >
              Cancel Request
            </button>
            <div className="flex items-center space-x-3">
              {step > 1 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors"
                >
                  Back
                </button>
              )}
              <button
                onClick={step === 3 ? handleSubmit : handleNext}
                disabled={loading || (step === 2 && simulationData?.validation && !simulationData.validation.isValid)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading && (
                  <svg className="animate-spin w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
                <span>{loading ? 'Processing...' : step === 3 ? 'Submit Request' : 'Continue'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MySavingsDashboard;
