import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Shield,
  Clock,
  Users,
  Save,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Info,
  Calculator,
  FileText,
  TrendingUp,
  Lock,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react';
import { committeeAPI } from '../services/committeeAPI';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('loan-rules');
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const [loanRules, setLoanRules] = useState({
    maxLoanAmount: 100000,
    savingsMultiplier: 6,
    maxLoanDuration: 36,
    interestRate: 7,
    salaryDeductionLimit: 30,
    latePaymentPenalty: 1.5
  });

  const [eligibilityRules, setEligibilityRules] = useState({
    minEmploymentPeriod: 12,
    requiredGuarantors: 1,
    maxActiveLoans: 1,
    savingsRequirement: 10000,
    guarantorSavingsRatio: 0.5,
    minCreditScore: 650,
    maxDebtToIncomeRatio: 40
  });

  const [systemInfo, setSystemInfo] = useState({
    version: 'v1.0.0',
    lastUpdated: new Date().toLocaleDateString(),
    environment: 'Development'
  });

  const [apiLoanExample, setApiLoanExample] = useState({
    loanAmount: 0,
    monthlyPayment: '0.00',
    totalPayment: '0.00',
    totalInterest: '0.00'
  });

  // Fetch settings on component mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await committeeAPI.getLoanSettings();
      
      if (response.data?.success && response.data?.data) {
        const settings = response.data.data;
        
        // Update loan rules if available
        if (settings.loanRules) {
          setLoanRules(prev => ({ ...prev, ...settings.loanRules }));
        }
        
        // Update eligibility rules if available
        if (settings.eligibilityRules) {
          setEligibilityRules(prev => ({ ...prev, ...settings.eligibilityRules }));
        }
        
        // Update system info if available
        if (settings.systemInfo) {
          setSystemInfo(prev => ({ ...prev, ...settings.systemInfo }));
        }
        
        // Update loan example if available
        if (settings.loanExample) {
          setApiLoanExample(settings.loanExample);
        }
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError('Failed to load settings. Using default values.');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { 
      id: 'loan-rules', 
      label: 'Loan Rules', 
      icon: <Calculator className="w-4 h-4" />,
      description: 'Configure loan amounts, rates, and terms'
    },
    { 
      id: 'eligibility-rules', 
      label: 'Eligibility', 
      icon: <Shield className="w-4 h-4" />,
      description: 'Set employee eligibility criteria'
    },
    { 
      id: 'advanced-settings', 
      label: 'Advanced', 
      icon: <SettingsIcon className="w-4 h-4" />,
      description: 'Advanced configuration options'
    }
  ];

  const handleLoanRuleChange = (field, value) => {
    setLoanRules(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
    setSuccessMessage(null);
  };

  const handleEligibilityRuleChange = (field, value) => {
    setEligibilityRules(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
    setSuccessMessage(null);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);
      
      const settingsData = {
        loanRules,
        eligibilityRules
      };
      
      const response = await committeeAPI.saveLoanSettings(settingsData);
      
      if (response.data?.success) {
        setHasChanges(false);
        setSuccessMessage('Settings saved successfully!');
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } else {
        setError('Failed to save settings. Please try again.');
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings. Please check your connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm('Are you sure you want to reset all settings to defaults?')) {
      try {
        setLoading(true);
        
        // Reset to default values
        const defaultLoanRules = {
          maxLoanAmount: 100000,
          savingsMultiplier: 6,
          maxLoanDuration: 36,
          interestRate: 7,
          salaryDeductionLimit: 30,
          latePaymentPenalty: 1.5
        };
        
        const defaultEligibilityRules = {
          minEmploymentPeriod: 12,
          requiredGuarantors: 1,
          maxActiveLoans: 1,
          savingsRequirement: 10000,
          guarantorSavingsRatio: 0.5,
          minCreditScore: 650,
          maxDebtToIncomeRatio: 40
        };
        
        // Save defaults to backend
        await committeeAPI.saveLoanSettings({
          loanRules: defaultLoanRules,
          eligibilityRules: defaultEligibilityRules
        });
        
        setLoanRules(defaultLoanRules);
        setEligibilityRules(defaultEligibilityRules);
        setHasChanges(false);
        setSuccessMessage('Settings reset to defaults successfully!');
        
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } catch (err) {
        console.error('Error resetting settings:', err);
        setError('Failed to reset settings.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <SettingsIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Loan Settings</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Configure loan system parameters and eligibility criteria
                </p>
              </div>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <button
                onClick={handleReset}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset to Defaults
              </button>
              <button
                onClick={handleSave}
                disabled={!hasChanges}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Unsaved Changes Alert */}
      {hasChanges && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-amber-800 dark:text-amber-200 font-medium">
                  You have unsaved changes
                </p>
                <p className="text-amber-700 dark:text-amber-300 text-sm mt-1">
                  Remember to save your settings to apply them to the loan system.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Settings Categories</h3>
                <nav className="space-y-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-l-4 border-blue-500'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
                      }`}
                    >
                      {tab.icon}
                      <div className="text-left">
                        <div>{tab.label}</div>
                        <div className="text-xs opacity-75">{tab.description}</div>
                      </div>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mt-6">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Preview</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Max Loan</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    ETB {loanRules.maxLoanAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Interest Rate</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {loanRules.interestRate}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Max Duration</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {loanRules.maxLoanDuration} months
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'loan-rules' && (
              <div className="space-y-6">
                {/* Basic Settings */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <Calculator className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Basic Loan Settings</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Core loan parameters and limits</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Maximum Loan Amount
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm font-medium">ETB</span>
                          <input
                            type="number"
                            value={loanRules.maxLoanAmount}
                            onChange={(e) => handleLoanRuleChange('maxLoanAmount', parseInt(e.target.value))}
                            className="w-full pl-12 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
                          />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Maximum amount an employee can borrow
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Interest Rate (%)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">%</span>
                          <input
                            type="number"
                            step="0.1"
                            value={loanRules.interestRate}
                            onChange={(e) => handleLoanRuleChange('interestRate', parseFloat(e.target.value))}
                            className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
                          />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Annual interest rate for all loans
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Maximum Loan Duration
                        </label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="number"
                            value={loanRules.maxLoanDuration}
                            onChange={(e) => handleLoanRuleChange('maxLoanDuration', parseInt(e.target.value))}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
                          />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Maximum repayment period in months
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Salary Deduction Limit
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">%</span>
                          <input
                            type="number"
                            value={loanRules.salaryDeductionLimit}
                            onChange={(e) => handleLoanRuleChange('salaryDeductionLimit', parseInt(e.target.value))}
                            className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
                          />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Maximum percentage of salary for deductions
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Savings Multiplier
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={loanRules.savingsMultiplier}
                          onChange={(e) => handleLoanRuleChange('savingsMultiplier', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Loan amount must be ≤ savings × multiplier
                        </p>
                      </div>

                    </div>
                  </div>
                </div>

                {/* Loan Calculator Preview */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                        <Calculator className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Loan Calculator Preview</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Example based on current settings</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Loan Amount</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            ETB {apiLoanExample.loanAmount.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Monthly Payment</p>
                          <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                            ETB {apiLoanExample.monthlyPayment}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Payment</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            ETB {apiLoanExample.totalPayment}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Interest</p>
                          <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                            ETB {apiLoanExample.totalInterest}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'eligibility-rules' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                        <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Eligibility Criteria</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Requirements for loan applicants</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Minimum Employment Period
                        </label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="number"
                            value={eligibilityRules.minEmploymentPeriod}
                            onChange={(e) => handleEligibilityRuleChange('minEmploymentPeriod', parseInt(e.target.value))}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
                          />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Minimum months of employment required
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Maximum Active Loans
                        </label>
                        <div className="relative">
                          <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="number"
                            value={eligibilityRules.maxActiveLoans}
                            onChange={(e) => handleEligibilityRuleChange('maxActiveLoans', parseInt(e.target.value))}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
                          />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Maximum concurrent loans per employee
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Required Guarantors
                        </label>
                        <div className="relative">
                          <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="number"
                            value={eligibilityRules.requiredGuarantors}
                            onChange={(e) => handleEligibilityRuleChange('requiredGuarantors', parseInt(e.target.value))}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
                          />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Number of guarantors required
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Minimum Savings Requirement
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm font-medium">ETB</span>
                          <input
                            type="number"
                            value={eligibilityRules.savingsRequirement}
                            onChange={(e) => handleEligibilityRuleChange('savingsRequirement', parseInt(e.target.value))}
                            className="w-full pl-12 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
                          />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Minimum savings balance to apply
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Guarantor Savings Ratio
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={eligibilityRules.guarantorSavingsRatio}
                          onChange={(e) => handleEligibilityRuleChange('guarantorSavingsRatio', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Ratio of loan amount guarantor must have in savings
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Minimum Credit Score
                        </label>
                        <input
                          type="number"
                          value={eligibilityRules.minCreditScore}
                          onChange={(e) => handleEligibilityRuleChange('minCreditScore', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Minimum credit score required
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Eligibility Summary */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Current Eligibility Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">Employment Requirements</h4>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Minimum {eligibilityRules.minEmploymentPeriod} months employment
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Maximum {eligibilityRules.maxActiveLoans} active loans
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Credit score ≥ {eligibilityRules.minCreditScore}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">Financial Requirements</h4>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              ETB {eligibilityRules.savingsRequirement.toLocaleString()} minimum savings
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {eligibilityRules.requiredGuarantors} guarantor(s) required
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {(eligibilityRules.guarantorSavingsRatio * 100).toFixed(0)}% guarantor savings ratio
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'advanced-settings' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
                        <SettingsIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Advanced Settings</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Additional configuration options</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Late Payment Penalty (%)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">%</span>
                          <input
                            type="number"
                            step="0.1"
                            value={loanRules.latePaymentPenalty}
                            onChange={(e) => handleLoanRuleChange('latePaymentPenalty', parseFloat(e.target.value))}
                            className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
                          />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Monthly penalty for late payments
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Max Debt-to-Income Ratio (%)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">%</span>
                          <input
                            type="number"
                            value={eligibilityRules.maxDebtToIncomeRatio}
                            onChange={(e) => handleEligibilityRuleChange('maxDebtToIncomeRatio', parseInt(e.target.value))}
                            className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
                          />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Maximum debt-to-income ratio allowed
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* System Information */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">System Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Version</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{systemInfo.version}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Last Updated</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{systemInfo.lastUpdated}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Environment</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{systemInfo.environment}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
