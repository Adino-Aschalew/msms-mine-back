import React, { useState, useEffect } from 'react';
import { FiDollarSign, FiCalendar, FiFilter, FiSearch, FiEye, FiDownload, FiCreditCard } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { loansAPI } from '../../../shared/services/loansAPI';

const MyLoansPage = () => {
  // Compact number formatting function
  const formatCompactNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'METB';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'KETB';
    }
    return num.toString();
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchLoansData();
  }, []);

  const fetchLoansData = async () => {
    try {
      setLoading(true);
      const appsRes = await loansAPI.getLoanApplications();
      const loansRes = await loansAPI.getUserLoans();

      const realApps = appsRes?.data || appsRes || [];
      const realLoans = loansRes?.data || loansRes || [];

      const combined = realApps.map(app => {
        const appId = Number(app.id);
        const activeLoan = realLoans.find(l =>
          Number(l.loan_application_id) === appId ||
          Number(l.application_id) === appId
        );

        const status = activeLoan ? activeLoan.status.toLowerCase() : app.status.toLowerCase();
        const requestedAmount = parseFloat(app.requested_amount || 0);
        const approvedAmount = activeLoan ? parseFloat(activeLoan.loan_amount) : (app.status === 'APPROVED' ? parseFloat(app.approved_amount || app.requested_amount) : 0);
        const duration = activeLoan ? activeLoan.duration_months : (app.approved_term_months || app.repayment_duration_months || 0);

        // Calculate a projected installment if approved but no active loan record yet
        const projectedInstallment = status === 'approved' && duration > 0 ? (approvedAmount / duration) : 0;

        return {
          id: app.id.toString(),
          loanType: app.purpose || 'Personal',
          requestedAmount,
          approvedAmount,
          loanDuration: duration,
          monthlyInstallment: activeLoan ? parseFloat(activeLoan.monthly_repayment || activeLoan.monthly_deduction || 0) : (projectedInstallment || 0),
          remainingBalance: activeLoan ? parseFloat(activeLoan.outstanding_balance || activeLoan.remaining_balance || 0) : (status === 'approved' ? approvedAmount : 0),
          status,
          approvalDate: activeLoan ? activeLoan.created_at?.split('T')[0] : (app.created_at?.split('T')[0] || null),
          interestRate: activeLoan ? activeLoan.interest_rate : 5,
        };
      });

      setLoans(combined);
    } catch (error) {
      console.error('Error fetching combined loans:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
      case 'approved':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'pending':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'rejected':
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getLoanTypeColor = (type) => {
    switch (type) {
      case 'Emergency':
        return 'bg-danger-100 text-danger-800 dark:bg-danger-900 dark:text-danger-200';
      case 'Personal':
        return 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200';
      case 'Education':
        return 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200';
      case 'Medical':
        return 'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const filteredLoans = loans.filter(loan => {
    const matchesSearch = loan.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.loanType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || loan.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredLoans.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLoans = filteredLoans.slice(startIndex, startIndex + itemsPerPage);

  const calculateProgress = (approvedAmount, remainingBalance) => {
    if (approvedAmount === 0) return 0;
    return ((approvedAmount - remainingBalance) / approvedAmount) * 100;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Loans</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Track and manage your loan applications</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Loans</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                {loading ? '...' : loans.filter(loan => loan.status === 'active' || loan.status === 'approved').length}
              </p>
            </div>
            <div className="p-3 bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400 rounded-lg">
              <FiDollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Outstanding</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                {loading ? '...' : formatCompactNumber(loans.reduce((sum, loan) => sum + loan.remainingBalance, 0))}
              </p>
            </div>
            <div className="p-3 bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-400 rounded-lg">
              <FiCreditCard className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Payment</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                {loading ? '...' : formatCompactNumber(loans.reduce((sum, loan) => sum + loan.monthlyInstallment, 0))}
              </p>
            </div>
            <div className="p-3 bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-400 rounded-lg">
              <FiCalendar className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Requests</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                {loading ? '...' : loans.filter(loan => loan.status === 'pending').length}
              </p>
            </div>
            <div className="p-3 bg-warning-100 text-warning-600 dark:bg-warning-900 dark:text-warning-400 rounded-lg">
              <FiFilter className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search loans..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 w-64"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
                <option value="completed">Completed</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            <button className="btn-secondary flex items-center space-x-2">
              <FiDownload className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Loan ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Requested Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Approved Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Monthly Installment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Remaining Balance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedLoans.map((loan) => (
                <tr key={loan.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                    {loan.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getLoanTypeColor(loan.loanType)}`}>
                      {loan.loanType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {formatCompactNumber(loan.requestedAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {formatCompactNumber(loan.approvedAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {loan.loanDuration} months
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {formatCompactNumber(loan.monthlyInstallment)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    <div>
                      <div className="text-sm font-medium">{formatCompactNumber(loan.remainingBalance)}</div>
                      {loan.status === 'active' && (
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                          <div
                            className="bg-primary-600 h-1.5 rounded-full"
                            style={{ width: `${calculateProgress(loan.approvedAmount, loan.remainingBalance)}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(loan.status)}`}>
                      {loan.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <button className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300">
                      <FiEye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredLoans.length)} of{' '}
                {filteredLoans.length} results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyLoansPage;
