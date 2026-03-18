import React, { useState, useEffect } from 'react';
import {
  FiDollarSign,
  FiUsers,
  FiFileText,
  FiUpload,
  FiCheck,
  FiX,
  FiAlertCircle,
  FiInfo,
  FiTrendingUp,
  FiShield,
  FiClock,
  FiChevronRight,
  FiArrowRight,
  FiCreditCard,
  FiCalendar,
  FiTarget,
  FiZap,
  FiAward,
  FiBriefcase,
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { loansAPI } from '../../../shared/services/loansAPI';

/* ─── Reusable field label ─────────────────────────────────────────────── */
const FieldLabel = ({ children, required }) => (
  <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1.5">
    {children}{required && <span className="text-red-500 ml-0.5">*</span>}
  </label>
);

const inputCls =
  'w-full px-3 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors placeholder-gray-400';

const SectionCard = ({ title, children }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
    {title && (
      <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40">
        <p className="text-[11px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">{title}</p>
      </div>
    )}
    <div className="p-5">{children}</div>
  </div>
);

/* ─── Component ────────────────────────────────────────────────────────── */
const LoanRequestPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedLoanType, setSelectedLoanType] = useState(null);
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
    supportingDocument: null,
  });

  const [eligibility, setEligibility] = useState({
    savingsBalance: false,
    salaryRule: false,
    employmentDuration: false,
    guarantorInfo: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState('pending');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const employeeData = {
    savingsBalance: 45000,
    salary: 10000,
    employmentDuration: 24,
  };

  const loanTypes = [
    {
      id: 'emergency',
      name: 'Emergency Loan',
      maxAmount: 10000,
      maxDuration: 12,
      icon: FiZap,
      description: 'Quick access funds for urgent situations',
      features: ['Fast approval', 'Minimal documentation', '24-hour processing'],
      apr: '8.5%',
    },
    {
      id: 'personal',
      name: 'Personal Loan',
      maxAmount: 25000,
      maxDuration: 36,
      icon: FiUsers,
      description: 'Flexible funding for personal needs and goals',
      features: ['Flexible terms', 'Competitive rates', 'No collateral required'],
      apr: '6.8%',
    },
    {
      id: 'education',
      name: 'Education Loan',
      maxAmount: 20000,
      maxDuration: 24,
      icon: FiAward,
      description: 'Invest in your education and future growth',
      features: ['Career development', 'Skill enhancement', 'Academic support'],
      apr: '5.2%',
    },
    {
      id: 'medical',
      name: 'Medical Loan',
      maxAmount: 15000,
      maxDuration: 18,
      icon: FiShield,
      description: 'Healthcare financing when you need it most',
      features: ['Healthcare coverage', 'Medical procedures', 'Wellness programs'],
      apr: '7.1%',
    },
  ];

  const steps = [
    { id: 1, title: 'Loan Type', icon: FiTarget },
    { id: 2, title: 'Details', icon: FiFileText },
    { id: 3, title: 'Guarantor', icon: FiUsers },
    { id: 4, title: 'Review', icon: FiCheck },
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
  const canSubmit =
    eligibility.savingsBalance && eligibility.salaryRule && eligibility.employmentDuration && eligibility.guarantorInfo;

  const handleInputChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
  const handleGuarantorChange = (field, value) =>
    setFormData(prev => ({ ...prev, guarantor: { ...prev.guarantor, [field]: value } }));

  const handleFileUpload = (field, file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('File size must be less than 5MB'); return; }
    const allowed = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowed.includes(file.type)) { alert('Only PDF, JPG, JPEG, PNG allowed'); return; }
    handleGuarantorChange(field, file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setIsSubmitting(true);
    
    try {
      const payload = {
        loan_amount: parseFloat(formData.requestedAmount),
        loan_purpose: formData.loanPurpose,
        loan_term_months: parseInt(formData.loanDuration),
        interest_rate: parseFloat((selectedLoanType?.apr || '5').replace('%', '')),
        monthly_payment: parseFloat(calculateMonthlyInstallment()),
        guarantor_details: JSON.stringify(formData.guarantorType === 'internal' 
          ? { type: 'internal', employeeId: formData.guarantor.employeeId, email: formData.guarantor.email }
          : { type: 'external', fullName: formData.guarantor.fullName, employer: formData.guarantor.employer, email: formData.guarantor.email }
        )
      };
      
      await loansAPI.applyForLoan(payload);
      
      setApplicationStatus('pending');
      setSubmitSuccess(true);
    } catch (error) {
      console.error('Error applying for loan:', error);
      alert('Failed to submit loan request: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproval = (status) => {
    if (status === 'approved' && formData.guarantorType === 'external') {
      if (!formData.guarantor.idDocument || !formData.guarantor.employmentProof) {
        alert('External guarantor documents must be uploaded before approval.');
        return;
      }
    }
    setApplicationStatus(status);
    setTimeout(() => setIsSubmitted(true), 1500);
  };

  const calculateMonthlyInstallment = () => {
    const a = parseFloat(formData.requestedAmount) || 0;
    const d = parseInt(formData.loanDuration) || 0;
    return a > 0 && d > 0 ? (a / d).toFixed(2) : '0.00';
  };

  const nextStep = () => currentStep < steps.length && setCurrentStep(s => s + 1);
  const prevStep = () => currentStep > 1 && setCurrentStep(s => s - 1);

  const canProceedToNext = () => {
    if (currentStep === 1) return selectedLoanType !== null;
    if (currentStep === 2) return !!(formData.requestedAmount && formData.loanDuration && formData.loanPurpose);
    if (currentStep === 3) return eligibility.guarantorInfo;
    if (currentStep === 4) return isEligible;
    return false;
  };

  /* ─────────────────────────────────────────────────────────────────────── */
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Loan Application</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Complete your application in 4 steps</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Available Credit</p>
          <p className="text-xl font-black text-gray-900 dark:text-white">
            ${(employeeData.savingsBalance * 2).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const done = currentStep > step.id;
            const active = currentStep === step.id;
            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                      done
                        ? 'bg-emerald-600 text-white'
                        : active
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                    }`}
                  >
                    {done ? <FiCheck className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <div className="hidden sm:block">
                    <p className={`text-xs font-black uppercase tracking-wider ${active || done ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                      {step.title}
                    </p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                      {done ? 'Done' : active ? 'In Progress' : 'Pending'}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-px mx-4 ${done ? 'bg-emerald-400' : 'bg-gray-200 dark:bg-gray-700'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Form Area */}
        <div className="lg:col-span-3">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* ── STEP 1: Loan Type ── */}
            {currentStep === 1 && (
              <SectionCard title="Step 1 — Select Loan Type">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {loanTypes.map((type) => {
                    const Icon = type.icon;
                    const selected = selectedLoanType?.id === type.id;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setSelectedLoanType(type)}
                        className={`text-left p-4 rounded-xl border-2 transition-all ${
                          selected
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/15'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className={`p-2 rounded-lg ${selected ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          {selected && <FiCheck className="w-4 h-4 text-blue-600" />}
                        </div>
                        <p className={`font-black text-sm uppercase tracking-tight mb-1 ${selected ? 'text-blue-700 dark:text-blue-400' : 'text-gray-800 dark:text-gray-200'}`}>
                          {type.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{type.description}</p>
                        <div className="space-y-1 mb-3">
                          {type.features.map((f, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                              <FiCheck className="w-3 h-3 text-emerald-500" />
                              {f}
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest">Max Amount</p>
                            <p className="text-sm font-black text-gray-900 dark:text-white">${type.maxAmount.toLocaleString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest">APR</p>
                            <p className="text-sm font-black text-gray-900 dark:text-white">{type.apr}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </SectionCard>
            )}

            {/* ── STEP 2: Loan Details ── */}
            {currentStep === 2 && (
              <SectionCard title="Step 2 — Loan Details">
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <FieldLabel required>Requested Amount</FieldLabel>
                      <div className="relative">
                        <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="number"
                          value={formData.requestedAmount}
                          onChange={e => handleInputChange('requestedAmount', e.target.value)}
                          className={`${inputCls} pl-9`}
                          placeholder="10,000"
                          max={selectedLoanType?.maxAmount}
                          required
                        />
                      </div>
                      {selectedLoanType && (
                        <p className="text-[10px] text-gray-400 mt-1">Max: ${selectedLoanType.maxAmount.toLocaleString()}</p>
                      )}
                    </div>

                    <div>
                      <FieldLabel required>Loan Duration (months)</FieldLabel>
                      <div className="relative">
                        <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="number"
                          value={formData.loanDuration}
                          onChange={e => handleInputChange('loanDuration', e.target.value)}
                          className={`${inputCls} pl-9`}
                          placeholder="12"
                          min="1"
                          max={selectedLoanType?.maxDuration}
                          required
                        />
                      </div>
                      {selectedLoanType && (
                        <p className="text-[10px] text-gray-400 mt-1">Max: {selectedLoanType.maxDuration} months</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <FieldLabel required>Loan Purpose</FieldLabel>
                    <textarea
                      value={formData.loanPurpose}
                      onChange={e => handleInputChange('loanPurpose', e.target.value)}
                      className={inputCls}
                      rows={4}
                      placeholder="Describe how you plan to use this loan..."
                      required
                    />
                  </div>

                  {/* Live Calculator */}
                  {formData.requestedAmount && formData.loanDuration && (
                    <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-100 dark:border-gray-700">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Monthly Installment</p>
                        <p className="text-xl font-black text-gray-900 dark:text-white">${calculateMonthlyInstallment()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Salary Threshold (40%)</p>
                        <p className={`text-sm font-black ${
                          parseFloat(calculateMonthlyInstallment()) <= employeeData.salary * 0.4
                            ? 'text-emerald-600'
                            : 'text-red-500'
                        }`}>
                          {parseFloat(calculateMonthlyInstallment()) <= employeeData.salary * 0.4
                            ? '✓ Within limit'
                            : '✗ Exceeds 40%'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </SectionCard>
            )}

            {/* ── STEP 3: Guarantor ── */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <SectionCard title="Step 3 — Guarantor Type">
                  <div className="grid grid-cols-2 gap-4">
                    {['internal', 'external'].map(type => (
                      <label key={type} className="relative cursor-pointer">
                        <input
                          type="radio"
                          value={type}
                          checked={formData.guarantorType === type}
                          onChange={e => handleInputChange('guarantorType', e.target.value)}
                          className="sr-only peer"
                        />
                        <div className="flex items-center gap-3 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl peer-checked:border-blue-600 peer-checked:bg-blue-50 dark:peer-checked:bg-blue-900/15 transition-all">
                          {type === 'internal' ? (
                            <FiBriefcase className="w-5 h-5 text-gray-500 peer-checked:text-blue-600" />
                          ) : (
                            <FiUsers className="w-5 h-5 text-gray-500 peer-checked:text-blue-600" />
                          )}
                          <div>
                            <p className="text-sm font-bold text-gray-800 dark:text-gray-200 capitalize">
                              {type === 'internal' ? 'Internal Employee' : 'External Guarantor'}
                            </p>
                            <p className="text-xs text-gray-400">
                              {type === 'internal' ? 'Company employee' : 'Outside company'}
                            </p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </SectionCard>

                {/* Internal Fields */}
                {formData.guarantorType === 'internal' && (
                  <SectionCard title="Internal Employee Details">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { label: 'Employee ID', field: 'employeeId', placeholder: 'EMP001', required: true },
                        { label: 'Full Name', field: 'fullName', placeholder: 'John Doe', required: true },
                        { label: 'Email', field: 'email', placeholder: 'john@company.com', type: 'email', required: true },
                        { label: 'Phone Number', field: 'phoneNumber', placeholder: '+1234567890', type: 'tel', required: true },
                        { label: 'Department', field: 'department', placeholder: 'Engineering' },
                        { label: 'Position', field: 'position', placeholder: 'Senior Developer' },
                      ].map(({ label, field, placeholder, type = 'text', required }) => (
                        <div key={field}>
                          <FieldLabel required={required}>{label}</FieldLabel>
                          <input
                            type={type}
                            value={formData.guarantor[field]}
                            onChange={e => handleGuarantorChange(field, e.target.value)}
                            className={inputCls}
                            placeholder={placeholder}
                          />
                        </div>
                      ))}
                      <div className="md:col-span-2">
                        <FieldLabel required>Relationship to Borrower</FieldLabel>
                        <input
                          type="text"
                          value={formData.guarantor.relationship}
                          onChange={e => handleGuarantorChange('relationship', e.target.value)}
                          className={inputCls}
                          placeholder="Colleague, Friend, Family"
                        />
                      </div>
                    </div>
                  </SectionCard>
                )}

                {/* External Fields */}
                {formData.guarantorType === 'external' && (
                  <SectionCard title="External Guarantor Details">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { label: 'Full Name', field: 'fullName', placeholder: 'Jane Smith', required: true },
                          { label: 'Email', field: 'email', placeholder: 'jane@email.com', type: 'email', required: true },
                          { label: 'Phone Number', field: 'phoneNumber', placeholder: '+1234567890', type: 'tel', required: true },
                          { label: 'Employer', field: 'employer', placeholder: 'Tech Solutions Inc.', required: true },
                          { label: 'Job Position', field: 'jobPosition', placeholder: 'Software Engineer', required: true },
                          { label: 'Monthly Salary', field: 'monthlySalary', placeholder: '5000', type: 'number', required: true },
                          { label: 'Work Address', field: 'workAddress', placeholder: '123 Business St', required: true },
                          { label: 'Home Address', field: 'homeAddress', placeholder: '456 Home Ave', required: true },
                        ].map(({ label, field, placeholder, type = 'text', required }) => (
                          <div key={field}>
                            <FieldLabel required={required}>{label}</FieldLabel>
                            <input
                              type={type}
                              value={formData.guarantor[field]}
                              onChange={e => handleGuarantorChange(field, e.target.value)}
                              className={inputCls}
                              placeholder={placeholder}
                            />
                          </div>
                        ))}
                        <div className="md:col-span-2">
                          <FieldLabel required>Relationship to Borrower</FieldLabel>
                          <input
                            type="text"
                            value={formData.guarantor.relationship}
                            onChange={e => handleGuarantorChange('relationship', e.target.value)}
                            className={inputCls}
                            placeholder="Family Friend, Relative, etc."
                          />
                        </div>
                      </div>

                      {/* Document Uploads */}
                      <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-2 mb-3">
                          <FiAlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                          <p className="text-[11px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                            Required Documents — ID &amp; Employment Proof
                          </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            { label: 'ID Document', field: 'idDocument' },
                            { label: 'Employment Proof', field: 'employmentProof' },
                          ].map(({ label, field }) => (
                            <div key={field}>
                              <FieldLabel required>{label}</FieldLabel>
                              <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={e => handleFileUpload(field, e.target.files[0])}
                                className="sr-only"
                                id={field}
                              />
                              <label
                                htmlFor={field}
                                className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                                  formData.guarantor[field]
                                    ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/10'
                                    : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/30 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                              >
                                {formData.guarantor[field] ? (
                                  <>
                                    <FiCheck className="w-6 h-6 text-emerald-600 mb-1" />
                                    <p className="text-xs font-bold text-emerald-600 text-center px-3 truncate max-w-full">
                                      {formData.guarantor[field].name}
                                    </p>
                                  </>
                                ) : (
                                  <>
                                    <FiUpload className="w-6 h-6 text-gray-400 mb-1" />
                                    <p className="text-xs text-gray-500 text-center">Click to upload</p>
                                    <p className="text-[10px] text-gray-400">PDF, JPG, PNG — max 5MB</p>
                                  </>
                                )}
                              </label>
                              {formData.guarantor[field] && (
                                <button
                                  type="button"
                                  onClick={() => handleGuarantorChange(field, null)}
                                  className="flex items-center gap-1 text-[10px] text-red-500 hover:text-red-700 mt-1 font-bold uppercase"
                                >
                                  <FiX className="w-3 h-3" /> Remove
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </SectionCard>
                )}
              </div>
            )}

            {/* ── STEP 4: Review ── */}
            {currentStep === 4 && (
              <div className="space-y-4">
                {/* Application Status Banner */}
                {submitSuccess && !isSubmitted && (
                  <div className={`p-4 rounded-xl border flex items-start gap-4 ${
                    applicationStatus === 'pending'
                      ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800'
                      : applicationStatus === 'approved'
                      ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800'
                      : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
                  }`}>
                    <div className={`p-2 rounded-lg flex-shrink-0 ${
                      applicationStatus === 'pending' ? 'bg-amber-100 dark:bg-amber-900/30'
                      : applicationStatus === 'approved' ? 'bg-emerald-100 dark:bg-emerald-900/30'
                      : 'bg-red-100 dark:bg-red-900/30'
                    }`}>
                      {applicationStatus === 'pending' ? (
                        <FiClock className="w-5 h-5 text-amber-600" />
                      ) : applicationStatus === 'approved' ? (
                        <FiCheck className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <FiX className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-black uppercase tracking-tight ${
                        applicationStatus === 'pending' ? 'text-amber-800 dark:text-amber-300'
                        : applicationStatus === 'approved' ? 'text-emerald-800 dark:text-emerald-300'
                        : 'text-red-800 dark:text-red-300'
                      }`}>
                        {applicationStatus === 'pending'
                          ? 'Submitted — Awaiting Approval'
                          : applicationStatus === 'approved'
                          ? 'Application Approved'
                          : 'Application Rejected'}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {applicationStatus === 'pending'
                          ? 'Your application has been submitted and is pending review.'
                          : applicationStatus === 'approved'
                          ? 'Congratulations! Your loan has been approved.'
                          : 'Your loan application could not be approved at this time.'}
                      </p>
                    </div>
                    {applicationStatus === 'pending' && (
                      <div className="flex gap-2 flex-shrink-0">
                        <button type="button" onClick={() => handleApproval('approved')}
                          className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors">
                          Approve
                        </button>
                        <button type="button" onClick={() => handleApproval('rejected')}
                          className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-colors">
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Final State */}
                {isSubmitted && (
                  <div className={`p-6 rounded-xl border text-center ${
                    applicationStatus === 'approved'
                      ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800'
                      : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
                  }`}>
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 ${
                      applicationStatus === 'approved'
                        ? 'bg-emerald-100 dark:bg-emerald-900/40'
                        : 'bg-red-100 dark:bg-red-900/40'
                    }`}>
                      {applicationStatus === 'approved'
                        ? <FiCheck className="w-7 h-7 text-emerald-600" />
                        : <FiX className="w-7 h-7 text-red-600" />}
                    </div>
                    <h3 className={`text-lg font-black mb-1 ${
                      applicationStatus === 'approved' ? 'text-emerald-800 dark:text-emerald-300' : 'text-red-800 dark:text-red-300'
                    }`}>
                      {applicationStatus === 'approved' ? 'Application Approved & Recorded' : 'Application Rejected & Recorded'}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      {applicationStatus === 'approved'
                        ? 'All guarantor records and loan data have been updated in the system.'
                        : 'The rejection has been recorded in the system.'}
                    </p>
                    <div className="flex gap-3 justify-center">
                      <button type="button" onClick={() => navigate('/employee/loans')}
                        className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors">
                        View All Loans
                      </button>
                      <button type="button" onClick={() => window.location.reload()}
                        className="px-5 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                        New Application
                      </button>
                    </div>
                  </div>
                )}

                {/* Summary Cards */}
                {!isSubmitted && (
                  <>
                    {/* Loan Summary */}
                    <SectionCard title="Loan Summary">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {[
                          { label: 'Loan Type', value: selectedLoanType?.name || '—' },
                          { label: 'Requested Amount', value: `$${parseFloat(formData.requestedAmount || 0).toLocaleString()}` },
                          { label: 'Duration', value: `${formData.loanDuration || 0} months` },
                          { label: 'Monthly Installment', value: `$${calculateMonthlyInstallment()}` },
                          { label: 'APR', value: selectedLoanType?.apr || 'N/A' },
                          { label: 'Total Repayment', value: `$${(parseFloat(calculateMonthlyInstallment()) * parseInt(formData.loanDuration || 0)).toFixed(2)}` },
                        ].map(({ label, value }) => (
                          <div key={label} className="p-3 bg-gray-50 dark:bg-gray-900/40 rounded-lg border border-gray-100 dark:border-gray-700">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</p>
                            <p className="text-sm font-black text-gray-900 dark:text-white mt-0.5">{value}</p>
                          </div>
                        ))}
                      </div>
                    </SectionCard>

                    {/* Loan Purpose */}
                    <SectionCard title="Loan Purpose">
                      <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/40 rounded-lg p-3 border border-gray-100 dark:border-gray-700">
                        {formData.loanPurpose || 'No purpose provided'}
                      </p>
                    </SectionCard>

                    {/* Guarantor Summary */}
                    <SectionCard title="Guarantor Information">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/40 rounded-lg border border-gray-100 dark:border-gray-700">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                            {formData.guarantorType === 'internal'
                              ? <FiBriefcase className="w-4 h-4 text-blue-600" />
                              : <FiUsers className="w-4 h-4 text-blue-600" />}
                          </div>
                          <div>
                            <p className="text-xs font-black uppercase tracking-tight text-gray-700 dark:text-gray-300">
                              {formData.guarantorType === 'internal' ? 'Internal Employee' : 'External Guarantor'}
                            </p>
                            <p className="text-sm text-gray-500">{formData.guarantor.fullName || 'Not provided'}</p>
                          </div>
                          {!submitSuccess && (
                            <button type="button" onClick={() => setCurrentStep(3)}
                              className="ml-auto text-xs text-blue-600 font-bold hover:underline">
                              Edit
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { label: 'Email', value: formData.guarantor.email },
                            { label: 'Phone', value: formData.guarantor.phoneNumber },
                            ...(formData.guarantorType === 'internal'
                              ? [{ label: 'Employee ID', value: formData.guarantor.employeeId },
                                 { label: 'Department', value: formData.guarantor.department }]
                              : [{ label: 'Employer', value: formData.guarantor.employer },
                                 { label: 'Job Position', value: formData.guarantor.jobPosition }]),
                          ].map(({ label, value }) => (
                            <div key={label} className="p-3 bg-gray-50 dark:bg-gray-900/40 rounded-lg border border-gray-100 dark:border-gray-700">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</p>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">{value || '—'}</p>
                            </div>
                          ))}
                        </div>
                        {formData.guarantorType === 'external' && (
                          <div className="p-3 bg-gray-50 dark:bg-gray-900/40 rounded-lg border border-gray-100 dark:border-gray-700">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Uploaded Documents</p>
                            <div className="flex gap-4">
                              {['idDocument', 'employmentProof'].map(f => (
                                <div key={f} className="flex items-center gap-1.5 text-xs">
                                  {formData.guarantor[f]
                                    ? <><FiCheck className="w-3.5 h-3.5 text-emerald-600" /><span className="text-emerald-700 dark:text-emerald-400 font-bold">
                                        {f === 'idDocument' ? 'ID Doc' : 'Employment Proof'}
                                      </span></>
                                    : <><FiX className="w-3.5 h-3.5 text-red-500" /><span className="text-red-500 font-bold">
                                        {f === 'idDocument' ? 'ID Doc Missing' : 'Employment Proof Missing'}
                                      </span></>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </SectionCard>

                    {/* Eligibility */}
                    <SectionCard title="Eligibility Status">
                      <div className="space-y-2">
                        {Object.entries({
                          'Sufficient Savings Balance': eligibility.savingsBalance,
                          'Monthly Installment Within 40% Limit': eligibility.salaryRule,
                          'Minimum Employment Duration (6 months)': eligibility.employmentDuration,
                          'Complete Guarantor Information': eligibility.guarantorInfo,
                        }).map(([key, value]) => (
                          <div key={key} className={`flex items-center justify-between p-3 rounded-lg border ${
                            value
                              ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30'
                              : 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30'
                          }`}>
                            <span className="text-sm text-gray-700 dark:text-gray-300">{key}</span>
                            <span className={`flex items-center gap-1 text-xs font-black uppercase ${value ? 'text-emerald-600' : 'text-red-500'}`}>
                              {value ? <FiCheck className="w-3.5 h-3.5" /> : <FiX className="w-3.5 h-3.5" />}
                              {value ? 'Passed' : 'Failed'}
                            </span>
                          </div>
                        ))}
                      </div>
                      {!isEligible && !submitSuccess && (
                        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
                          <FiAlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-red-600 dark:text-red-400 font-bold">
                            Please address the eligibility issues before submitting.
                          </p>
                        </div>
                      )}
                    </SectionCard>
                  </>
                )}
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                  currentStep === 1
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <FiChevronRight className="w-4 h-4 rotate-180" />
                Previous
              </button>

              {currentStep < steps.length ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!canProceedToNext()}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                    canProceedToNext()
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Next Step
                  <FiChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!isEligible || isSubmitting || submitSuccess}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                    isEligible && !isSubmitting && !submitSuccess
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Processing...</>
                  ) : (
                    <>Submit Application<FiArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-4">
          {/* Profile Summary */}
          <SectionCard title="Your Profile">
            <div className="space-y-2">
              {[
                { label: 'Savings Balance', value: `$${employeeData.savingsBalance.toLocaleString()}`, Icon: FiDollarSign, color: 'blue' },
                { label: 'Monthly Salary', value: `$${employeeData.salary.toLocaleString()}`, Icon: FiCreditCard, color: 'emerald' },
                { label: 'Employment', value: `${employeeData.employmentDuration} months`, Icon: FiCalendar, color: 'purple' },
              ].map(({ label, value, Icon, color }) => (
                <div key={label} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/40 rounded-lg">
                  <div className={`p-2 bg-${color}-100 dark:bg-${color}-900/30 rounded-lg`}>
                    <Icon className={`w-4 h-4 text-${color}-600 dark:text-${color}-400`} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</p>
                    <p className="text-sm font-black text-gray-900 dark:text-white">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Tips */}
          <SectionCard title="Application Tips">
            <ul className="space-y-2">
              {[
                'Keep monthly installments below 40% of your salary',
                'Savings balance must be ≥ 2× loan amount',
                'Choose duration for manageable payments',
                'Ensure guarantor information is complete',
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <FiCheck className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </SectionCard>

          {/* Support */}
          <SectionCard title="Need Help?">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Our loan specialists are here to assist you through the application process.
            </p>
            <button className="w-full py-2.5 rounded-lg text-sm font-bold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              Contact Support
            </button>
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

export default LoanRequestPage;
