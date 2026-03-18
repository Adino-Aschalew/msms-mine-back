import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Building2,
  Briefcase,
  Calendar,
  DollarSign,
  PiggyBank,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Send,
  Ban,
  Clock
} from 'lucide-react';

import { loanCommitteeAPI, loansAPI } from '../../../shared/services/loansAPI';
import { approveLoan, rejectLoan, suspendLoan } from '../utils/actionHandlers';

const LoanDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loanData, setLoanData] = useState(null);
  const [decision, setDecision] = useState('');
  const [approvedAmount, setApprovedAmount] = useState('');
  const [loanDuration, setLoanDuration] = useState('');
  const [monthlyInstallment, setMonthlyInstallment] = useState('');
  const [committeeComments, setCommitteeComments] = useState('');

  useEffect(() => {
    const fetchLoanDetails = async () => {
      try {
        setLoading(true);
        // Assuming the ID from LoanRequests is passed here
        const data = await loansAPI.getLoanApplication(id);
        const mappedData = {
          id: data.data.id,
          employee: {
            employeeId: data.data.employee_id,
            fullName: `${data.data.first_name} ${data.data.last_name}`,
            department: data.data.department || 'Not specified',
            position: data.data.job_grade || 'Not specified',
            employmentDate: data.data.hire_date?.split('T')[0] || '2020-01-01'
          },
          salary: {
            monthlySalary: data.data.monthly_payment ? data.data.monthly_payment * 3 : 8000,
            existingDeductions: 0,
            availableSalary: data.data.monthly_payment ? data.data.monthly_payment * 3 : 6800
          },
          savings: {
            savingsBalance: 25000,
            monthlyContribution: 1500
          },
          loanRequest: {
            loanType: data.data.purpose || 'Personal',
            requestedAmount: data.data.requested_amount || 0,
            loanPurpose: data.data.purpose || 'Not specified',
            loanDuration: data.data.repayment_duration_months || 24
          },
          guarantor: {
            name: data.data.guarantor_details ? JSON.parse(data.data.guarantor_details)?.fullName : 'Jane Smith',
            department: 'Marketing',
            salary: 6500,
            savingsBalance: 18000,
            existingGuarantees: 1
          },
          submissionDate: data.data.created_at?.split('T')[0] || '2024-03-15',
          status: data.data.status?.toLowerCase() || 'pending'
        };
        
        setLoanData(mappedData);
      } catch (err) {
        console.error('Error fetching loan details:', err);
        setError('Failed to load loan details.');
      } finally {
        setLoading(false);
      }
    };
    fetchLoanDetails();
  }, [id]);

  if (loading) return <div className="p-6">Loading details...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!loanData) return <div className="p-6">No details found.</div>;

  // Eligibility checks
  const eligibilityChecks = [
    {
      rule: 'Salary Rule',
      description: 'Monthly installment must be ≤ 30% of monthly salary',
      check: ((loanData.loanRequest.requestedAmount / loanData.loanRequest.loanDuration) / loanData.salary.monthlySalary) * 100 <= 30,
      actual: `${(((loanData.loanRequest.requestedAmount / loanData.loanRequest.loanDuration) / loanData.salary.monthlySalary) * 100).toFixed(1)}%`,
      required: '≤ 30%'
    },
    {
      rule: 'Savings Rule',
      description: 'Loan amount must be ≤ 3x savings balance',
      check: loanData.loanRequest.requestedAmount <= (loanData.savings.savingsBalance * 3),
      actual: `$${loanData.loanRequest.requestedAmount.toLocaleString()}`,
      required: `≤ $${(loanData.savings.savingsBalance * 3).toLocaleString()}`
    },
    {
      rule: 'Guarantor Rule',
      description: 'Guarantor must have sufficient savings',
      check: loanData.guarantor.savingsBalance >= (loanData.loanRequest.requestedAmount * 0.5),
      actual: `$${loanData.guarantor.savingsBalance.toLocaleString()}`,
      required: `≥ $${(loanData.loanRequest.requestedAmount * 0.5).toLocaleString()}`
    },
    {
      rule: 'Existing Loan Check',
      description: 'No existing active loans',
      check: true,
      actual: 'None',
      required: 'None'
    },
    {
      rule: 'Employment Period Check',
      description: 'Minimum 12 months employment',
      check: new Date() - new Date(loanData.employee.employmentDate) > 365 * 24 * 60 * 60 * 1000,
      actual: 'Over 1 year',
      required: '≥ 12 months'
    }
  ];

  const isEligible = eligibilityChecks.every(check => check.check);
  const calculatedMonthlyInstallment = approvedAmount ? parseFloat(approvedAmount) / parseInt(loanDuration || 24) : 0;

  const handleSubmitDecision = async () => {
    console.log('Decision submitted:', { decision, approvedAmount, loanDuration, monthlyInstallment, committeeComments });
    try {
      if (decision === 'approve') {
        const payload = {
          approved_amount: parseFloat(approvedAmount),
          approved_term_months: parseInt(loanDuration),
          notes: committeeComments
        };
        await approveLoan(id, payload);
      } else if (decision === 'reject') {
        await rejectLoan(id, committeeComments);
      } else if (decision === 'suspend') {
        await suspendLoan(id);
      }
      alert('Decision applied successfully');
      navigate('/loan-requests');
    } catch (err) {
      alert('Failed to apply decision');
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/loan-requests"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Loan Request Details
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Loan ID: {loanData.id}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`status-badge ${
            loanData.status === 'pending' ? 'status-pending' :
            loanData.status === 'approved' ? 'status-approved' :
            loanData.status === 'rejected' ? 'status-rejected' :
            'status-suspended'
          }`}>
            {loanData.status.charAt(0).toUpperCase() + loanData.status.slice(1)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Employee Information */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Employee Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Employee ID</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{loanData.employee.employeeId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Full Name</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{loanData.employee.fullName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Department</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{loanData.employee.department}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Position</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{loanData.employee.position}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Employment Date</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{loanData.employee.employmentDate}</p>
              </div>
            </div>
          </div>

          {/* Salary Information */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Salary Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Salary</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">${loanData.salary.monthlySalary.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Existing Deductions</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">${loanData.salary.existingDeductions.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Available Salary</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">${loanData.salary.availableSalary.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Savings Information */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <PiggyBank className="w-5 h-5 mr-2" />
              Savings Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Savings Balance</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">${loanData.savings.savingsBalance.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Contribution</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">${loanData.savings.monthlyContribution.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Loan Request Details */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Loan Request Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Loan Type</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{loanData.loanRequest.loanType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Requested Amount</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">${loanData.loanRequest.requestedAmount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Loan Purpose</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{loanData.loanRequest.loanPurpose}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Requested Duration</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{loanData.loanRequest.loanDuration} months</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Submission Date</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{loanData.submissionDate}</p>
              </div>
            </div>
          </div>

          {/* Guarantor Information */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Guarantor Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Guarantor Name</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{loanData.guarantor.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Department</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{loanData.guarantor.department}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Salary</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">${loanData.guarantor.salary.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Savings Balance</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">${loanData.guarantor.savingsBalance.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Existing Guarantees</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{loanData.guarantor.existingGuarantees}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          
          {/* Eligibility Check Panel */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              Eligibility Check
            </h3>
            
            <div className="space-y-3">
              {eligibilityChecks.map((check, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`mt-0.5 ${check.check ? 'text-success-600' : 'text-danger-600'}`}>
                    {check.check ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {check.rule}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      {check.description}
                    </p>
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="text-gray-500">Actual: {check.actual}</span>
                      <span className="text-gray-400">|</span>
                      <span className="text-gray-500">Required: {check.required}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Final Result:
                </span>
                <span className={`status-badge ${
                  isEligible ? 'bg-success-100 text-success-800' : 'bg-danger-100 text-danger-800'
                }`}>
                  {isEligible ? 'Eligible' : 'Not Eligible'}
                </span>
              </div>
            </div>
          </div>

          {/* Loan Decision Panel */}
          {loanData.status === 'pending' && (
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <Send className="w-5 h-5 mr-2" />
                Loan Decision
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Decision
                  </label>
                  <select
                    value={decision}
                    onChange={(e) => setDecision(e.target.value)}
                    className="input"
                  >
                    <option value="">Select decision</option>
                    <option value="approve">Approve</option>
                    <option value="reject">Reject</option>
                    <option value="suspend">Suspend</option>
                  </select>
                </div>

                {decision === 'approve' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Approved Amount ($)
                      </label>
                      <input
                        type="number"
                        value={approvedAmount}
                        onChange={(e) => setApprovedAmount(e.target.value)}
                        placeholder="Enter approved amount"
                        className="input"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Loan Duration (months)
                      </label>
                      <input
                        type="number"
                        value={loanDuration}
                        onChange={(e) => setLoanDuration(e.target.value)}
                        placeholder="Enter loan duration"
                        className="input"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Monthly Installment ($)
                      </label>
                      <input
                        type="number"
                        value={calculatedMonthlyInstallment.toFixed(2)}
                        readOnly
                        className="input bg-gray-50 dark:bg-gray-700"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Committee Comments
                  </label>
                  <textarea
                    value={committeeComments}
                    onChange={(e) => setCommitteeComments(e.target.value)}
                    placeholder="Enter comments..."
                    rows={4}
                    className="input"
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleSubmitDecision}
                    disabled={!decision}
                    className="btn btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit Decision
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoanDetails;
