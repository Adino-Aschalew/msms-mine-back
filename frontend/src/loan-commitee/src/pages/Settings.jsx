import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  DollarSign,
  Shield,
  Clock,
  Users,
  Save,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('loan-rules');
  const [hasChanges, setHasChanges] = useState(false);

  
  const [loanRules, setLoanRules] = useState({
    maxLoanAmount: 50000,
    savingsMultiplier: 3,
    maxLoanDuration: 36,
    interestRate: 5.5,
    salaryDeductionLimit: 30
  });

  
  const [eligibilityRules, setEligibilityRules] = useState({
    minEmploymentPeriod: 12,
    requiredGuarantors: 1,
    maxActiveLoans: 1,
    savingsRequirement: 5000,
    guarantorSavingsRatio: 0.5
  });

  const tabs = [
    { id: 'loan-rules', label: 'Loan Rules', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'eligibility-rules', label: 'Eligibility Rules', icon: <Shield className="w-4 h-4" /> },
  ];

  const handleLoanRuleChange = (field, value) => {
    setLoanRules(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleEligibilityRuleChange = (field, value) => {
    setEligibilityRules(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    console.log('Saving settings:', { loanRules, eligibilityRules });
    setHasChanges(false);
    
  };

  const handleReset = () => {
    console.log('Resetting to defaults');
    setHasChanges(false);
    
  };

  return (
    <div className="space-y-6">
      {}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configure loan system rules and eligibility criteria
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={handleReset}
            className="btn btn-secondary"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </button>
        </div>
      </div>

      {}
      {hasChanges && (
        <div className="bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-warning-600 mr-2" />
            <p className="text-warning-800 dark:text-warning-200">
              You have unsaved changes. Remember to save your settings.
            </p>
          </div>
        </div>
      )}

      {}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {}
      <div className="space-y-6">
        {activeTab === 'loan-rules' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
                Basic Loan Settings
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Maximum Loan Amount ($)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      value={loanRules.maxLoanAmount}
                      onChange={(e) => handleLoanRuleChange('maxLoanAmount', parseInt(e.target.value))}
                      className="input pl-10"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Maximum amount an employee can borrow
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
                    className="input"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Loan amount must be ≤ savings × multiplier
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Maximum Loan Duration (months)
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      value={loanRules.maxLoanDuration}
                      onChange={(e) => handleLoanRuleChange('maxLoanDuration', parseInt(e.target.value))}
                      className="input pl-10"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Maximum repayment period in months
                  </p>
                </div>
              </div>
            </div>

            {}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
                Financial Settings
              </h3>
              
              <div className="space-y-6">
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
                      className="input pl-8"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Annual interest rate for loans
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Salary Deduction Limit (%)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">%</span>
                    <input
                      type="number"
                      value={loanRules.salaryDeductionLimit}
                      onChange={(e) => handleLoanRuleChange('salaryDeductionLimit', parseInt(e.target.value))}
                      className="input pl-8"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Maximum percentage of salary that can be deducted
                  </p>
                </div>

                {}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mt-6">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                    Current Rules Summary
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li>• Max loan: ${loanRules.maxLoanAmount.toLocaleString()}</li>
                    <li>• Loan ≤ ${loanRules.savingsMultiplier}× savings</li>
                    <li>• Max duration: {loanRules.maxLoanDuration} months</li>
                    <li>• Interest: {loanRules.interestRate}% annually</li>
                    <li>• Max deduction: {loanRules.salaryDeductionLimit}% of salary</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'eligibility-rules' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
                Employment Requirements
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Minimum Employment Period (months)
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      value={eligibilityRules.minEmploymentPeriod}
                      onChange={(e) => handleEligibilityRuleChange('minEmploymentPeriod', parseInt(e.target.value))}
                      className="input pl-10"
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
                      className="input pl-10"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Maximum number of active loans per employee
                  </p>
                </div>
              </div>
            </div>

            {}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
                Guarantor & Savings Requirements
              </h3>
              
              <div className="space-y-6">
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
                      className="input pl-10"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Number of guarantors required for loan approval
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Minimum Savings Requirement ($)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      value={eligibilityRules.savingsRequirement}
                      onChange={(e) => handleEligibilityRuleChange('savingsRequirement', parseInt(e.target.value))}
                      className="input pl-10"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Minimum savings balance required to apply
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
                    className="input"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Guarantor must have at least this ratio of loan amount in savings
                  </p>
                </div>
              </div>
            </div>

            {}
            <div className="card p-6 lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Current Eligibility Criteria
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                    Employment Criteria
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li>• Minimum employment: {eligibilityRules.minEmploymentPeriod} months</li>
                    <li>• Maximum active loans: {eligibilityRules.maxActiveLoans}</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                    Financial Requirements
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li>• Required guarantors: {eligibilityRules.requiredGuarantors}</li>
                    <li>• Minimum savings: ${eligibilityRules.savingsRequirement.toLocaleString()}</li>
                    <li>• Guarantor savings ratio: {(eligibilityRules.guarantorSavingsRatio * 100).toFixed(0)}%</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          System Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Version</p>
            <p className="font-medium text-gray-900 dark:text-gray-100">v2.1.0</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Last Updated</p>
            <p className="font-medium text-gray-900 dark:text-gray-100">March 15, 2024</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Environment</p>
            <p className="font-medium text-gray-900 dark:text-gray-100">Production</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
