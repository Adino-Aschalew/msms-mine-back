import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loansAPI } from '../../../shared/services/loansAPI';
import { savingsAPI } from '../../../shared/services/savingsAPI';
import { employeeAPI } from '../../../shared/services/employeeAPI';
import { DollarSign, Calendar, FileText, User, Building, Phone, Mail, Briefcase, CheckCircle, XCircle, AlertCircle, ChevronRight, Upload, CreditCard, Shield, TrendingUp } from 'lucide-react';

const FieldLabel = ({ children, required, icon }) => (
  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
    {icon && <span className="text-gray-400">{icon}</span>}
    {children} {required && <span className="text-red-500 ml-1">*</span>}
  </label>
);

const inputCls =
  'w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-gray-100 placeholder-gray-400 disabled:bg-gray-50 disabled:text-gray-500 dark:disabled:bg-gray-900 transition-all duration-200';

const cardCls = 'bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden';
const headerCls = 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 px-6 py-4 border-b border-gray-100 dark:border-gray-700';
const sectionTitleCls = 'text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2';

const LoanRequestPage = () => {
  const navigate = useNavigate();
  const [selectedLoanType, setSelectedLoanType] = useState(null);

  // Compact number formatting function
  const formatCompactNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'METB';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'KETB';
    }
    return num.toString();
  };

  const [formData, setFormData] = useState({
    requestedAmount: '',
    loanPurpose: '',
    loanDuration: '',
    guarantorType: 'internal',
    guarantor: {
      employeeId: '',
      fullName: '',
      email: '',
      department: '',
      position: '',
      phoneNumber: '',
      relationship: '',
      employer: '',
      jobPosition: '',
      monthlySalary: '',
      workAddress: '',
      homeAddress: '',
    },
  });

  const [eligibility, setEligibility] = useState({
    savingsBalance: false,
    salaryRule: false,
    employmentDuration: false,
    guarantorInfo: false,
  });

  const [employeeData, setEmployeeData] = useState({
    savingsBalance: 0,
    salary: 0,
    employmentDuration: 0,
    loading: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  useEffect(() => {
    const fetchProfileAndSavings = async () => {
      try {
        const [profileRes, savingsRes] = await Promise.all([
          employeeAPI.getProfile(),
          savingsAPI.getSavingsAccount().catch(() => null),
        ]);

        const profileData = profileRes?.data || profileRes;
        const eProfile = profileData?.employeeProfile || profileData?.employee_profile || {};
        const savingsData = savingsRes?.data || savingsRes;

        const hireDateStr = eProfile.hire_date || eProfile.created_at;
        const hireDate = hireDateStr ? new Date(hireDateStr) : new Date();
        const daysEmployed = Math.floor((new Date() - hireDate) / (1000 * 60 * 60 * 24));

        setEmployeeData({
          savingsBalance: parseFloat(savingsData?.current_balance || 0),
          salary: parseFloat(eProfile.salary || 0),
          employmentDuration: Math.floor(daysEmployed / 30),
          loading: false,
        });
      } catch (error) {
        console.error('Error fetching profile for loan request:', error);
        setEmployeeData((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchProfileAndSavings();
  }, []);

  const loanTypes = [
    { id: 'emergency', name: 'Emergency Loan', maxAmount: 10000, maxDuration: 12, apr: '8.5%', icon: AlertCircle, color: 'red' },
    { id: 'personal', name: 'Personal Loan', maxAmount: 25000, maxDuration: 36, apr: '6.8%', icon: User, color: 'blue' },
    { id: 'education', name: 'Education Loan', maxAmount: 20000, maxDuration: 24, apr: '5.2%', icon: FileText, color: 'green' },
    { id: 'medical', name: 'Medical Loan', maxAmount: 15000, maxDuration: 18, apr: '7.1%', icon: Shield, color: 'purple' },
  ];

  useEffect(() => {
    checkEligibility();
  }, [formData.requestedAmount, formData.loanDuration, formData.guarantorType, formData.guarantor]);

  const checkEligibility = () => {
    const amount = parseFloat(formData.requestedAmount) || 0;
    const duration = parseInt(formData.loanDuration) || 0;
    const monthlyInstallment = amount > 0 && duration > 0 ? amount / duration : 0;
    setEligibility({
      savingsBalance: amount <= employeeData.savingsBalance * 2,
      salaryRule: monthlyInstallment <= employeeData.salary * 0.4,
      employmentDuration: employeeData.employmentDuration >= 6,
      guarantorInfo:
        formData.guarantorType === 'internal'
          ? !!(formData.guarantor.employeeId && formData.guarantor.fullName && formData.guarantor.email)
          : !!(formData.guarantor.fullName && formData.guarantor.email && formData.guarantor.employer),
    });
  };

  const isEligible = Object.values(eligibility).every(Boolean);

  const handleInputChange = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));
  const handleGuarantorChange = (field, value) =>
    setFormData((prev) => ({ ...prev, guarantor: { ...prev.guarantor, [field]: value } }));

  const handleFileUpload = (field, file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('File size must be less than 5MB'); return; }
    handleGuarantorChange(field, file);
  };

  const calculateMonthlyInstallment = () => {
    const a = parseFloat(formData.requestedAmount) || 0;
    const d = parseInt(formData.loanDuration) || 0;
    return a > 0 && d > 0 ? (a / d).toFixed(2) : '0.00';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!isEligible || !selectedLoanType) return;
    setIsSubmitting(true);

    try {
      const payload = {
        loan_amount: parseFloat(formData.requestedAmount),
        loan_purpose: formData.loanPurpose,
        loan_term_months: parseInt(formData.loanDuration),
        interest_rate: parseFloat((selectedLoanType?.apr || '5').replace('%', '')),
        monthly_payment: parseFloat(calculateMonthlyInstallment()),
        guarantor_details: JSON.stringify(
          formData.guarantorType === 'internal'
            ? { type: 'internal', employeeId: formData.guarantor.employeeId, email: formData.guarantor.email }
            : { type: 'external', fullName: formData.guarantor.fullName, employer: formData.guarantor.employer, email: formData.guarantor.email }
        ),
      };

      await loansAPI.applyForLoan(payload);
      setSubmitSuccess(true);
    } catch (error) {
      console.error('Error applying for loan:', error);
      setErrorMsg(error.response?.data?.message || error.message || 'Failed to submit loan request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="w-full px-4 py-8">
        <div className={`${cardCls} text-center p-8 max-w-4xl mx-auto`}>
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-3">Loan Request Submitted Successfully!</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
            Your loan request has been successfully recorded and is now pending review by the loan committee. You will receive an update once a decision has been made.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/employee/loans')}
              className="px-6 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 rounded-lg flex items-center justify-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              View My Loans
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all duration-200 rounded-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              <FileText className="w-4 h-4" />
              New Application
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Loan Application</h1>
            <p className="text-gray-600 dark:text-gray-400">Apply for a loan in just a few simple steps</p>
          </div>
        </div>
        
        {/* Progress Indicator */}
        <div className="mt-6">
          <div className="flex items-center px-60 mb-4">
            <div className={`flex items-center justify-center w-12 h-12 rounded-full font-semibold text-lg transition-all duration-300 z-10 ${
              1 <= currentStep
                ? 'bg-blue-600 text-white shadow-lg transform scale-110'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
            }`}>
              {1 < currentStep ? (
                <CheckCircle className="w-6 h-6" />
              ) : (
                <span>1</span>
              )}
            </div>
            <div className={`flex-1 h-1 bg-gradient-to-r rounded-[33px] ${
              1 < currentStep 
                ? 'from-blue-500 to-blue-600' 
                : 'from-gray-300 to-gray-400'
            }`} />
            <div className={`flex items-center justify-center w-12 h-12 rounded-full font-semibold text-lg transition-all duration-300 z-10 ${
              2 <= currentStep
                ? 'bg-blue-600 text-white shadow-lg transform scale-110'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
            }`}>
              {2 < currentStep ? (
                <CheckCircle className="w-6 h-6" />
              ) : (
                <span>2</span>
              )}
            </div>
            <div className={`flex-1 h-1 bg-gradient-to-r rounded-[33px] ${
              2 < currentStep 
                ? 'from-blue-500 to-blue-600' 
                : 'from-gray-300 to-gray-400'
            }`} />
            <div className={`flex items-center justify-center w-12 h-12 rounded-full font-semibold text-lg transition-all duration-300 z-10 ${
              3 <= currentStep
                ? 'bg-blue-600 text-white shadow-lg transform scale-110'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
            }`}>
              {3 < currentStep ? (
                <CheckCircle className="w-6 h-6" />
              ) : (
                <span>3</span>
              )}
            </div>
          </div>
          <div className="flex justify-between items-center px-55 text-sm font-medium">
            <div className={`text-center ${
              currentStep >= 1 ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-500 dark:text-gray-400'
            }`}>
              <span>Loan Details</span>
            </div>
            <div className={`text-center ${
              currentStep >= 2 ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-500 dark:text-gray-400'
            }`}>
              <span>Guarantor Info</span>
            </div>
            <div className={`text-center ${
              currentStep >= 3 ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-500 dark:text-gray-400'
            }`}>
              <span>Review & Submit</span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Profile Stats Overview */}
        <div className={`${cardCls} mb-8`}>
          <div className={headerCls}>
            <h2 className={sectionTitleCls}>
              <TrendingUp className="w-5 h-5" />
              Your Financial Profile
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg border border-green-100 dark:border-green-800">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wider">Available Savings</span>
                </div>
                <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {formatCompactNumber(employeeData.savingsBalance)} ETB
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">Monthly Salary</span>
                </div>
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {formatCompactNumber(employeeData.salary)} ETB
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 p-4 rounded-lg border border-purple-100 dark:border-purple-800">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-800 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-xs font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wider">Employment Duration</span>
                </div>
                <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {employeeData.employmentDuration} months
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Loan Information Category */}
        <div className={`${cardCls} mb-6`}>
          <div className={headerCls}>
            <h2 className={sectionTitleCls}>
              <DollarSign className="w-5 h-5" />
              Loan Details
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <FieldLabel required icon={<DollarSign />}>Loan Type</FieldLabel>
                <select
                  className={inputCls}
                  value={selectedLoanType?.id || ''}
                  onChange={(e) => {
                    const type = loanTypes.find((t) => t.id === e.target.value);
                    setSelectedLoanType(type);
                  }}
                  required
                >
                  <option value="" disabled>Select Loan Type</option>
                  {loanTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name} - {type.apr} APR
                    </option>
                  ))}
                </select>
              </div>

              {selectedLoanType && (
                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Loan Limits</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Maximum Amount:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{formatCompactNumber(selectedLoanType.maxAmount)} ETB</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Maximum Duration:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{selectedLoanType.maxDuration} months</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Interest Rate:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{selectedLoanType.apr}</span>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <FieldLabel required icon={<DollarSign />}>Requested Amount (ETB)</FieldLabel>
                <input
                  type="number"
                  value={formData.requestedAmount}
                  onChange={e => handleInputChange('requestedAmount', e.target.value)}
                  className={inputCls}
                  max={selectedLoanType?.maxAmount}
                  placeholder="e.g. 5000"
                  required
                />
              </div>

              <div>
                <FieldLabel required icon={<Calendar />}>Loan Duration (Months)</FieldLabel>
                <input
                  type="number"
                  value={formData.loanDuration}
                  onChange={e => handleInputChange('loanDuration', e.target.value)}
                  className={inputCls}
                  min="1"
                  max={selectedLoanType?.maxDuration}
                  placeholder="e.g. 12"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <FieldLabel required icon={<FileText />}>Loan Purpose</FieldLabel>
                <textarea
                  value={formData.loanPurpose}
                  onChange={e => handleInputChange('loanPurpose', e.target.value)}
                  className={inputCls}
                  rows={3}
                  placeholder="Detailed reason for the loan request..."
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Guarantor Details Category */}
        <div className={`${cardCls} mb-6`}>
          <div className={headerCls}>
            <h2 className={sectionTitleCls}>
              <User className="w-5 h-5" />
              Guarantor Information
            </h2>
          </div>
          <div className="p-6">
            <div className="flex gap-6 mb-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="radio" 
                  value="internal" 
                  checked={formData.guarantorType === 'internal'} 
                  onChange={e => handleInputChange('guarantorType', e.target.value)} 
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500" 
                />
                <Building className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Internal Employee</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="radio" 
                  value="external" 
                  checked={formData.guarantorType === 'external'} 
                  onChange={e => handleInputChange('guarantorType', e.target.value)} 
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500" 
                />
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">External Party</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {formData.guarantorType === 'internal' ? (
                <>
                  <div>
                    <FieldLabel required icon={<Briefcase />}>Employee ID</FieldLabel>
                    <input 
                      type="text" 
                      value={formData.guarantor.employeeId} 
                      onChange={e => handleGuarantorChange('employeeId', e.target.value)} 
                      className={inputCls} 
                      required 
                    />
                  </div>
                  <div>
                    <FieldLabel required icon={<User />}>Full Name</FieldLabel>
                    <input 
                      type="text" 
                      value={formData.guarantor.fullName} 
                      onChange={e => handleGuarantorChange('fullName', e.target.value)} 
                      className={inputCls} 
                      required 
                    />
                  </div>
                  <div>
                    <FieldLabel required icon={<Mail />}>Email</FieldLabel>
                    <input 
                      type="email" 
                      value={formData.guarantor.email} 
                      onChange={e => handleGuarantorChange('email', e.target.value)} 
                      className={inputCls} 
                      required 
                    />
                  </div>
                  <div>
                    <FieldLabel required icon={<Phone />}>Phone Number</FieldLabel>
                    <input 
                      type="tel" 
                      value={formData.guarantor.phoneNumber} 
                      onChange={e => handleGuarantorChange('phoneNumber', e.target.value)} 
                      className={inputCls} 
                      required 
                    />
                  </div>
                  <div>
                    <FieldLabel icon={<Building />}>Department</FieldLabel>
                    <input 
                      type="text" 
                      value={formData.guarantor.department} 
                      onChange={e => handleGuarantorChange('department', e.target.value)} 
                      className={inputCls} 
                    />
                  </div>
                  <div>
                    <FieldLabel icon={<Briefcase />}>Position</FieldLabel>
                    <input 
                      type="text" 
                      value={formData.guarantor.position} 
                      onChange={e => handleGuarantorChange('position', e.target.value)} 
                      className={inputCls} 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <FieldLabel required icon={<User />}>Relationship to Applicant</FieldLabel>
                    <input 
                      type="text" 
                      value={formData.guarantor.relationship} 
                      onChange={e => handleGuarantorChange('relationship', e.target.value)} 
                      className={inputCls} 
                      required 
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <FieldLabel required icon={<User />}>Full Name</FieldLabel>
                    <input 
                      type="text" 
                      value={formData.guarantor.fullName} 
                      onChange={e => handleGuarantorChange('fullName', e.target.value)} 
                      className={inputCls} 
                      required 
                    />
                  </div>
                  <div>
                    <FieldLabel required icon={<Mail />}>Email</FieldLabel>
                    <input 
                      type="email" 
                      value={formData.guarantor.email} 
                      onChange={e => handleGuarantorChange('email', e.target.value)} 
                      className={inputCls} 
                      required 
                    />
                  </div>
                  <div>
                    <FieldLabel required icon={<Phone />}>Phone Number</FieldLabel>
                    <input 
                      type="tel" 
                      value={formData.guarantor.phoneNumber} 
                      onChange={e => handleGuarantorChange('phoneNumber', e.target.value)} 
                      className={inputCls} 
                      required 
                    />
                  </div>
                  <div>
                    <FieldLabel required icon={<Building />}>Employer</FieldLabel>
                    <input 
                      type="text" 
                      value={formData.guarantor.employer} 
                      onChange={e => handleGuarantorChange('employer', e.target.value)} 
                      className={inputCls} 
                      required 
                    />
                  </div>
                  <div>
                    <FieldLabel required icon={<Briefcase />}>Job Position</FieldLabel>
                    <input 
                      type="text" 
                      value={formData.guarantor.jobPosition} 
                      onChange={e => handleGuarantorChange('jobPosition', e.target.value)} 
                      className={inputCls} 
                      required 
                    />
                  </div>
                  <div>
                    <FieldLabel required icon={<DollarSign />}>Monthly Salary</FieldLabel>
                    <input 
                      type="number" 
                      value={formData.guarantor.monthlySalary} 
                      onChange={e => handleGuarantorChange('monthlySalary', e.target.value)} 
                      className={inputCls} 
                      required 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <FieldLabel required icon={<User />}>Relationship to Applicant</FieldLabel>
                    <input 
                      type="text" 
                      value={formData.guarantor.relationship} 
                      onChange={e => handleGuarantorChange('relationship', e.target.value)} 
                      className={inputCls} 
                      required 
                    />
                  </div>

                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div>
                      <FieldLabel icon={<Upload />}>ID Document</FieldLabel>
                      <div className="relative">
                        <input 
                          type="file" 
                          onChange={e => handleFileUpload('idDocument', e.target.files[0])} 
                          className={`${inputCls} !pr-12`} 
                          accept=".pdf,.jpg,.jpeg,.png" 
                        />
                        <Upload className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                    <div>
                      <FieldLabel icon={<Upload />}>Employment Proof</FieldLabel>
                      <div className="relative">
                        <input 
                          type="file" 
                          onChange={e => handleFileUpload('employmentProof', e.target.files[0])} 
                          className={`${inputCls} !pr-12`} 
                          accept=".pdf,.jpg,.jpeg,.png" 
                        />
                        <Upload className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Verification & Action Bar */}
        <div className={`${cardCls} p-6`}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Application Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Monthly Installment</span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{formatCompactNumber(calculateMonthlyInstallment())} ETB</span>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Eligibility Check</h4>
                  <div className="space-y-2">
                    <div className={`flex items-center gap-2 text-sm ${
                      eligibility.savingsBalance ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'
                    }`}>
                      {eligibility.savingsBalance ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      <span>Savings Balance Requirement</span>
                    </div>
                    <div className={`flex items-center gap-2 text-sm ${
                      eligibility.salaryRule ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'
                    }`}>
                      {eligibility.salaryRule ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      <span>Within 40% Salary Limit</span>
                    </div>
                    <div className={`flex items-center gap-2 text-sm ${
                      eligibility.employmentDuration ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'
                    }`}>
                      {eligibility.employmentDuration ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      <span>Minimum 6 Months Employment</span>
                    </div>
                    <div className={`flex items-center gap-2 text-sm ${
                      eligibility.guarantorInfo ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'
                    }`}>
                      {eligibility.guarantorInfo ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      <span>Guarantor Information Complete</span>
                    </div>
                  </div>
                </div>
                {!isEligible && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded-lg">
                    <p className="text-sm text-red-700 dark:text-red-400 font-medium">
                      ⚠️ All eligibility requirements must be met to submit the application.
                    </p>
                  </div>
                )}
                {errorMsg && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded-lg">
                    <p className="text-sm text-red-700 dark:text-red-400 font-medium">
                      Error: {errorMsg}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-col justify-center">
              <button
                type="submit"
                disabled={!isEligible || !selectedLoanType || isSubmitting}
                className={`w-full px-8 py-4 font-semibold text-lg transition-all duration-200 rounded-xl ${
                  isEligible && selectedLoanType && !isSubmitting
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing Application...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <FileText className="w-5 h-5" />
                    Submit Loan Application
                  </div>
                )}
              </button>
              
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
                By submitting, you confirm that all information provided is accurate and complete.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LoanRequestPage;
