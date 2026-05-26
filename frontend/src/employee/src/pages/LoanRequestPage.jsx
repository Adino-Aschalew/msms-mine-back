import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loansAPI } from '../../../shared/services/loansAPI';
import { employeeAPI } from '../../../shared/services/employeeAPI';
import { DollarSign, Calendar, FileText, User, Briefcase, CheckCircle, XCircle, AlertCircle, TrendingUp, Search, Info, Shield, ChevronRight, Printer, Download, Save, RefreshCcw } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const FieldLabel = ({ children, required, icon }) => (
  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
    {icon && <span className="text-gray-400">{icon}</span>}
    {children} {required && <span className="text-red-500 ml-1">*</span>}
  </label>
);

const inputCls =
  'w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-gray-100 placeholder-gray-400 transition-all duration-200';

const cardCls = 'bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden';

const LoanRequestPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showActiveLoanModal, setShowActiveLoanModal] = useState(false);
  const [profile, setProfile] = useState(null);

  const [financials, setFinancials] = useState({
    salary: 0,
    savings_balance: 0,
    max_loan_by_savings: 0,
    max_monthly_repayment: 0,
    has_active_loan: false,
    loading: true
  });

  const [formData, setFormData] = useState({
    requestedAmount: '',
    loanPurpose: '',
    loanDuration: '',
    startDeductionDate: '',
    guarantor: {
      employeeId: '',
      fullName: '',
      department: '',
      relationship: '',
      isValid: false,
      validating: false,
      error: ''
    },
    guarantors: []
  });

  const [calcResult, setCalcResult] = useState({
    monthlyPayment: 0,
    totalInterest: 0,
    totalPayment: 0,
    schedule: [],
    loading: false
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        console.log('🔍 Fetching initial data...');
        const [eligibilityRes, profileRes] = await Promise.all([
          loansAPI.getLoanEligibility(),
          employeeAPI.getProfile()
        ]);

        console.log('🔍 Eligibility response:', eligibilityRes);
        console.log('🔍 Profile response:', profileRes);

        if (eligibilityRes.eligible) {
          const { financials: f, user_data: u } = eligibilityRes;
          console.log('🔍 Financials data received:', f);
          console.log('🔍 User data received:', u);
          setFinancials({
            salary: f.salary,
            savings_balance: f.savings_balance,
            max_loan_by_savings: f.max_loan_by_savings,
            max_monthly_repayment: f.max_monthly_repayment,
            has_active_loan: (u.active_loans > 0 || u.pending_applications > 0),
            loading: false
          });

          if (u.active_loans > 0 || u.pending_applications > 0) {
            setShowActiveLoanModal(true);
          }
        }

        if (profileRes.success || profileRes.data) {
          const profileData = profileRes.data || profileRes;
          // Flatten the structure for easier access if it's nested
          setProfile({
            ...(profileData.user || {}),
            ...(profileData.employeeProfile || profileData.employee_profile || profileData || {})
          });
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setFinancials(prev => ({ ...prev, loading: false }));
      }
    };
    fetchInitialData();
  }, []);

  // Real-time calculator trigger
  useEffect(() => {
    const calculate = async () => {
      if (formData.requestedAmount > 0 && formData.loanDuration > 0) {
        setCalcResult(prev => ({ ...prev, loading: true }));
        try {
          // Simple local calculation for live feel, could also call API
          const amount = parseFloat(formData.requestedAmount);
          const months = parseInt(formData.loanDuration);
          const monthlyPayment = amount / months;

          // Generate schedule
          const schedule = [];
          let balance = amount;
          for (let i = 1; i <= months; i++) {
            balance -= monthlyPayment;
            schedule.push({
              month: `Month ${i}`,
              deduction: monthlyPayment.toFixed(2),
              remaining: Math.max(0, balance).toFixed(2)
            });
          }

          setCalcResult({
            monthlyPayment: Math.round(monthlyPayment * 100) / 100,
            totalInterest: 0, // Interest-free as per basic formula: Amount / Months
            totalPayment: amount,
            schedule,
            loading: false
          });
        } catch (error) {
          console.error('Calculation error:', error);
          setCalcResult(prev => ({ ...prev, loading: false }));
        }
      }
    };
    calculate();
  }, [formData.requestedAmount, formData.loanDuration]);

  const handleInputChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const validateGuarantor = async (employeeId) => {
    if (!employeeId) return;
    if (employeeId === profile?.employee_id || employeeId === profile?.employeeProfile?.employee_id) {
      setFormData(prev => ({ ...prev, guarantor: { ...prev.guarantor, isValid: false, validating: false, error: 'You cannot be your own guarantor' } }));
      return;
    }

    setFormData(prev => ({ ...prev, guarantor: { ...prev.guarantor, validating: true, error: '', isValid: false } }));
    try {
      const res = await loansAPI.checkGuarantorCapacity(employeeId, formData.requestedAmount);
      console.log('🔍 Guarantor validation response:', res);

      if (res.eligible) {
        setFormData(prev => ({
          ...prev,
          guarantor: {
            ...prev.guarantor,
            isValid: true,
            validating: false,
            fullName: res.guarantor_data?.name || '',
            department: res.guarantor_data?.department || ''
          }
        }));
      } else {
        console.log('❌ Guarantor validation failed:', res);
        setFormData(prev => ({ ...prev, guarantor: { ...prev.guarantor, isValid: false, validating: false, error: res.reason || 'Invalid guarantor' } }));
      }
    } catch (error) {
      console.error('Guarantor validation error:', error);
      const errorMessage = error.data?.message || error.message || 'Validation failed';
      setFormData(prev => ({ 
        ...prev, 
        guarantor: { 
          ...prev.guarantor, 
          validating: false, 
          error: errorMessage 
        } 
      }));
    }
  };

  const addGuarantor = () => {
    if (!formData.guarantor.isValid) {
      return;
    }
    if (!formData.guarantor.relationship) {
      setFormData(prev => ({ ...prev, guarantor: { ...prev.guarantor, error: 'Please enter relationship' } }));
      return;
    }
    const existingIndex = formData.guarantors.findIndex(g => g.employeeId === formData.guarantor.employeeId);
    if (existingIndex !== -1) {
      setFormData(prev => ({ ...prev, guarantor: { ...prev.guarantor, error: 'This guarantor is already added' } }));
      return;
    }
    setFormData(prev => ({
      ...prev,
      guarantors: [...prev.guarantors, {
        employeeId: prev.guarantor.employeeId,
        fullName: prev.guarantor.fullName,
        department: prev.guarantor.department,
        relationship: prev.guarantor.relationship
      }],
      guarantor: {
        employeeId: '',
        fullName: '',
        department: '',
        relationship: '',
        isValid: false,
        validating: false,
        error: ''
      }
    }));
  };

  const removeGuarantor = (employeeId) => {
    setFormData(prev => ({
      ...prev,
      guarantors: prev.guarantors.filter(g => g.employeeId !== employeeId)
    }));
  };

  const isEligible =
    formData.requestedAmount > 0 &&
    formData.requestedAmount <= financials.max_loan_by_savings &&
    calcResult.monthlyPayment <= financials.max_monthly_repayment &&
    !financials.has_active_loan &&
    formData.guarantors.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEligible || formData.guarantors.length === 0) return;

    setIsSubmitting(true);
    try {
      const guarantorsData = formData.guarantors.map(g => ({
        type: 'internal',
        employeeId: g.employeeId,
        relationship: g.relationship
      }));
      await loansAPI.applyForLoan({
        loan_amount: parseFloat(formData.requestedAmount),
        loan_purpose: formData.loanPurpose,
        loan_term_months: parseInt(formData.loanDuration),
        start_deduction_date: formData.startDeductionDate,
        guarantor_details: JSON.stringify(guarantorsData)
      });
      setSubmitSuccess(true);
    } catch (error) {
      setErrorMsg(error.data?.message || 'Failed to submit loan request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveDraft = () => {
    localStorage.setItem('loan_draft', JSON.stringify(formData));
    alert('Draft saved temporarily to your browser.');
  };

  const loadDraft = () => {
    const draft = localStorage.getItem('loan_draft');
    if (draft) {
      setFormData(JSON.parse(draft));
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to clear all form data?')) {
      setFormData({
        requestedAmount: '',
        loanPurpose: '',
        loanDuration: '',
        startDeductionDate: '',
        guarantor: {
          employeeId: '',
          fullName: '',
          department: '',
          relationship: '',
          isValid: false,
          validating: false,
          error: ''
        },
        guarantors: []
      });
      setErrorMsg('');
    }
  };

  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      const eProfile = profile?.employeeProfile || profile?.employee_profile || profile || {};

      console.log('Generating PDF with profile:', eProfile);

      // Header
      doc.setFontSize(20);
      doc.text('Loan Application Report', 105, 15, { align: 'center' });
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 22, { align: 'center' });

      // Employee Info
      doc.setFontSize(12);
      doc.text('Employee Information', 14, 35);
      autoTable(doc, {
        startY: 38,
        body: [
          ['Name', `${profile?.first_name || 'N/A'} ${profile?.last_name || ''}`],
          ['Employee ID', profile?.employee_id || 'N/A'],
          ['Department', profile?.department || 'N/A'],
          ['Monthly Salary', `${profile?.salary || 0} ETB`]
        ],
        theme: 'grid'
      });

      // Guarantor Info
      if (formData.guarantors.length > 0) {
        doc.text('Guarantor Information', 14, (doc.lastAutoTable?.finalY || 80) + 10);
        const guarantorRows = formData.guarantors.map((g, index) => [
          `${index + 1}. ${g.fullName}`,
          g.employeeId,
          g.department,
          g.relationship || 'N/A'
        ]);
        autoTable(doc, {
          startY: (doc.lastAutoTable?.finalY || 80) + 13,
          head: [['Name', 'Employee ID', 'Department', 'Relationship']],
          body: guarantorRows,
          theme: 'grid'
        });
      }

      // Loan Details
      doc.text('Loan Details', 14, (doc.lastAutoTable?.finalY || 120) + 10);
      autoTable(doc, {
        startY: (doc.lastAutoTable?.finalY || 120) + 13,
        body: [
          ['Requested Amount', `${formData.requestedAmount} ETB`],
          ['Loan Purpose', formData.loanPurpose || 'N/A'],
          ['Repayment Period', `${formData.loanDuration} Months`],
          ['Monthly Deduction', `${calcResult.monthlyPayment} ETB`],
          ['Total Repayment', `${calcResult.totalPayment} ETB`]
        ],
        theme: 'grid'
      });

      // Repayment Schedule
      if (calcResult.schedule && calcResult.schedule.length > 0) {
        doc.addPage();
        doc.text('Repayment Schedule', 14, 15);
        autoTable(doc, {
          startY: 20,
          head: [['Month', 'Monthly Deduction (ETB)', 'Remaining Balance (ETB)']],
          body: calcResult.schedule.map(row => [row.month, row.deduction, row.remaining]),
        });
      }

      doc.save(`Loan_Application_${eProfile?.employee_id || 'unverified'}.pdf`);
    } catch (error) {
      console.error('PDF Generation Error:', error);
      alert('Failed to generate PDF. Please check if all fields are filled correctly.');
    }
  };

  if (submitSuccess) {
    return (
      <div className="w-full px-4 py-12 max-w-2xl mx-auto text-center">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Application Submitted Successfully</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">Your request is now pending verification. Once approved, you can download the formal agreement.</p>

          <div className="flex flex-col gap-3">
            <button onClick={generatePDF} className="w-full py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 flex items-center justify-center gap-2">
              <Download className="w-4 h-4" /> Download Application PDF
            </button>
            <button onClick={() => navigate('/employee/loans')} className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700">
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-8 max-w-7xl mx-auto">
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Loan Request Management</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={loadDraft} className="px-4 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg flex items-center gap-2 hover:bg-blue-100 text-sm font-medium">
             <RefreshCcw className="w-4 h-4" /> Load Draft
          </button>
          <button onClick={handleReset} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg flex items-center gap-2 hover:bg-gray-200 text-sm font-medium">
            <RefreshCcw className="w-4 h-4" /> Reset
          </button>
          <button onClick={generatePDF} disabled={!formData.requestedAmount || !formData.loanDuration} className="px-4 py-2 bg-green-50 text-green-600 border border-green-200 rounded-lg flex items-center gap-2 hover:bg-green-100 disabled:opacity-50 text-sm font-medium">
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {/* Loan Request Section */}
          <div className={`${cardCls}`}>
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <FileText className="w-4 h-4" /> 2. Loan Request Section
              </h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <FieldLabel required icon={<DollarSign className="w-4 h-4" />}>Requested Amount (ETB)</FieldLabel>
                <input
                  type="number"
                  min="1"
                  value={formData.requestedAmount}
                  onChange={e => {
                    const val = e.target.value;
                    if (val === "" || parseFloat(val) >= 0) {
                      handleInputChange('requestedAmount', val);
                    }
                  }}
                  className={`${inputCls} ${formData.requestedAmount && parseFloat(formData.requestedAmount) <= 0 ? 'border-red-500' : ''}`}
                  placeholder="Enter amount (Greater than 0)"
                  required
                />
                {formData.requestedAmount && parseFloat(formData.requestedAmount) <= 0 && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1 font-medium">
                    <XCircle className="w-3 h-3" /> Amount must be greater than zero
                  </p>
                )}
                {formData.requestedAmount > financials.max_loan_by_savings && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1 font-medium">
                    <XCircle className="w-3 h-3" /> Exceeds 2x savings limit ({financials.max_loan_by_savings.toLocaleString()} ETB)
                  </p>
                )}
              </div>

              <div>
                <FieldLabel required icon={<Calendar className="w-4 h-4" />}>Repayment Period (Months)</FieldLabel>
                <input
                  type="number"
                  min="1"
                  value={formData.loanDuration}
                  onChange={e => {
                    const val = e.target.value;
                    if (val === "" || parseInt(val) >= 0) {
                      handleInputChange('loanDuration', val);
                    }
                  }}
                  className={`${inputCls} ${formData.loanDuration && parseInt(formData.loanDuration) <= 0 ? 'border-red-500' : ''}`}
                  placeholder="e.g., 12 (Greater than 0)"
                  required
                />
                {formData.loanDuration && parseInt(formData.loanDuration) <= 0 && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1 font-medium">
                    <XCircle className="w-3 h-3" /> Period must be greater than zero
                  </p>
                )}
                {calcResult.monthlyPayment > financials.max_monthly_repayment && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1 font-medium">
                    <XCircle className="w-3 h-3" /> Exceeds 33% salary limit ({financials.max_monthly_repayment.toFixed(2)} ETB)
                  </p>
                )}
              </div>

              <div>
                <FieldLabel required icon={<Calendar className="w-4 h-4" />}>Start Deduction Date</FieldLabel>
                <input
                  type="date"
                  value={formData.startDeductionDate}
                  onChange={e => handleInputChange('startDeductionDate', e.target.value)}
                  className={inputCls}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <FieldLabel required icon={<FileText className="w-4 h-4" />}>Loan Purpose</FieldLabel>
                <textarea
                  value={formData.loanPurpose}
                  onChange={e => handleInputChange('loanPurpose', e.target.value)}
                  className={`${inputCls} h-24 resize-none`}
                  placeholder="Provide a reason for the loan request"
                  required
                />
              </div>
            </div>
          </div>

          {/* Internal Guarantor Section */}
          <div className={`${cardCls}`}>
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <Shield className="w-4 h-4" /> 3. Internal Guarantor Section
              </h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <FieldLabel required icon={<Search className="w-4 h-4" />}>Guarantor Employee ID</FieldLabel>
                  <input
                    type="text"
                    value={formData.guarantor.employeeId}
                    onChange={e => handleInputChange('guarantor', { ...formData.guarantor, employeeId: e.target.value.toUpperCase() })}
                    className={inputCls}
                    placeholder="EMP001"
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={() => validateGuarantor(formData.guarantor.employeeId)}
                  className="h-11 px-6 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all flex items-center gap-2"
                >
                  {formData.guarantor.validating ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} Verify
                </button>
              </div>

              <div>
                <FieldLabel required icon={<User className="w-4 h-4" />}>Relationship</FieldLabel>
                <input
                  type="text"
                  value={formData.guarantor.relationship}
                  onChange={e => handleInputChange('guarantor', { ...formData.guarantor, relationship: e.target.value })}
                  className={inputCls}
                  placeholder="e.g., Colleague"
                  required
                />
              </div>

              {formData.guarantor.isValid && (
                <div className="md:col-span-2 bg-green-50 dark:bg-green-900/20 p-4 rounded-lg flex justify-between items-center border border-green-100 dark:border-green-800">
                  <div>
                    <p className="text-xs text-green-600 font-bold uppercase">Verified Employee Found</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{formData.guarantor.fullName} — {formData.guarantor.department}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={addGuarantor}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all text-sm"
                    >
                      Add Guarantor
                    </button>
                    <CheckCircle className="text-green-500 w-6 h-6" />
                  </div>
                </div>
              )}
              {formData.guarantor.error && <p className="text-red-500 text-xs mt-1 md:col-span-2 flex items-center gap-1 font-medium"><XCircle className="w-3 h-3" /> {formData.guarantor.error}</p>}

              {/* Added Guarantors List */}
              {formData.guarantors.length > 0 && (
                <div className="md:col-span-2 mt-4">
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Added Guarantors ({formData.guarantors.length})</p>
                  <div className="space-y-2">
                    {formData.guarantors.map((g, index) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg flex justify-between items-center border border-gray-200 dark:border-gray-700">
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{g.fullName}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">ID: {g.employeeId} • {g.relationship}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeGuarantor(g.employeeId)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Repayment Schedule Table */}
          <div className={`${cardCls}`}>
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20 flex justify-between items-center">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> 6. Repayment Schedule
              </h2>
              <span className="text-xs font-medium text-gray-400">Fixed Monthly Deduction</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900/40 text-gray-500 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="px-6 py-3 font-bold">Month</th>
                    <th className="px-6 py-3 font-bold">Monthly Deduction</th>
                    <th className="px-6 py-3 font-bold">Remaining Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {calcResult.schedule.length > 0 ? (
                    calcResult.schedule.slice(0, 5).map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{row.month}</td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{row.deduction} ETB</td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{row.remaining} ETB</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="px-6 py-10 text-center text-gray-400 italic">Enter loan amount and period to generate schedule</td>
                    </tr>
                  )}
                  {calcResult.schedule.length > 5 && (
                    <tr>
                      <td colSpan="3" className="px-6 py-3 text-center text-blue-600 text-xs font-bold cursor-pointer hover:underline">
                        + {calcResult.schedule.length - 5} More Months (View in PDF)
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Summary & Workflow */}
        <div className="lg:col-span-4 space-y-6">
          <div className={`${cardCls} p-6 border-l-4 border-blue-600`}>
            <h3 className="font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Loan Calculation Section
            </h3>
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
                <p className="text-xs text-blue-600 font-bold uppercase mb-1">Monthly Deduction</p>
                <div className="text-3xl font-black text-blue-700 dark:text-blue-400">
                  {calcResult.monthlyPayment.toLocaleString()} <span className="text-sm font-normal">ETB</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Loan Amount</span>
                  <span className="font-bold text-gray-900 dark:text-white">{(parseFloat(formData.requestedAmount) || 0).toLocaleString()} ETB</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Repayment Months</span>
                  <span className="font-bold text-gray-900 dark:text-white">{formData.loanDuration || 0}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-gray-100 dark:border-gray-700 pt-3">
                  <span className="text-gray-700 dark:text-gray-300 font-bold">Total Payable</span>
                  <span className="font-black text-gray-900 dark:text-white">{calcResult.totalPayment.toLocaleString()} ETB</span>
                </div>
              </div>
            </div>
          </div>

          <div className={`${cardCls} p-6`}>
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">5. Validation Rules</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Active Employee Status</span>
                <CheckCircle className="text-green-500 w-4 h-4" />
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex flex-col">
                  <span className="text-gray-500">Salary Rule (≤33%)</span>
                  <p className="text-[10px] text-gray-400">Max: {financials.max_monthly_repayment.toFixed(2)} ETB</p>
                </div>
                {calcResult.monthlyPayment <= financials.max_monthly_repayment ? <CheckCircle className="text-green-500 w-4 h-4" /> : <XCircle className="text-red-400 w-4 h-4" />}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Guarantors Added ({formData.guarantors.length})</span>
                {formData.guarantors.length > 0 ? <CheckCircle className="text-green-500 w-4 h-4" /> : <XCircle className="text-gray-300 w-4 h-4" />}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">No Active Loan Processes</span>
                {!financials.has_active_loan ? <CheckCircle className="text-green-500 w-4 h-4" /> : <XCircle className="text-red-400 w-4 h-4" />}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={saveDraft}
              className="w-full py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-all"
            >
              <Save className="w-5 h-5 text-gray-400" /> Save Draft
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isEligible || formData.guarantors.length === 0 || isSubmitting}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${isEligible && formData.guarantors.length > 0 && !isSubmitting
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
            >
              {isSubmitting ? 'Submitting...' : <><CheckCircle className="w-5 h-5" /> Submit Request</>}
            </button>
            <p className="text-[10px] text-gray-400 text-center">
              Deductions will begin automatically via payroll once fully approved.
            </p>
          </div>
        </div>
      </div>

      {/* Active Loan Modal */}
      {showActiveLoanModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 max-w-md w-full p-8 rounded-2xl text-center shadow-2xl animate-in zoom-in duration-300">
            <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Active Application Found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Organizational policy prevents multiple active loan requests. Please complete or cancel your current process before starting a new one.
            </p>
            <div className="flex gap-3">
              <button onClick={() => navigate('/employee/loans')} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700">
                Track Application
              </button>
              <button onClick={generatePDF} className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200">
                Print Summary
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanRequestPage;
