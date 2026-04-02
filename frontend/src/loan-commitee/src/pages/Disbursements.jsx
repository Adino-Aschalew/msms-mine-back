import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Calendar,
  CreditCard,
  Eye,
  Download,
  Send,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronDown,
  User,
  Building2,
  X,
  Loader2,
  TrendingUp,
  Users,
  FileText,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Shield,
  Star,
  MoreVertical,
  Grid,
  List,
  ChevronRight,
  RefreshCw,
  Info,
  Coins
} from 'lucide-react';
import { committeeAPI } from '../services/committeeAPI';
import { useAuth } from '../../../shared/contexts/AuthContext';


const formatCompactMoney = (amount) => {
  if (amount === 0) return 'ETB 0';
  
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  
  if (absAmount >= 1000000) {
    return `${sign}ETB ${(absAmount / 1000000).toFixed(1)}M`;
  } else if (absAmount >= 1000) {
    return `${sign}ETB ${(absAmount / 1000).toFixed(1)}K`;
  } else {
    return `${sign}ETB ${absAmount.toLocaleString()}`;
  }
};


const formatMoney = (amount) => {
  if (amount === 0 || amount === '0') return 'ETB 0';
  
  const absAmount = Math.abs(parseFloat(amount || 0));
  const sign = amount < 0 ? '-' : '';
  
  if (absAmount >= 1000000) {
    return `${sign}ETB ${(absAmount / 1000000).toFixed(1)}M`;
  } else if (absAmount >= 1000) {
    return `${sign}ETB ${(absAmount / 1000).toFixed(1)}K`;
  } else {
    return `${sign}ETB ${absAmount.toLocaleString()}`;
  }
};

const Disbursements = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [showRepaymentSchedule, setShowRepaymentSchedule] = useState(false);
  const [viewMode, setViewMode] = useState('table'); 
  const [selectedDisbursements, setSelectedDisbursements] = useState(new Set());
  const [processingActions, setProcessingActions] = useState(new Set());
  const [modal, setModal] = useState({ show: false, type: '', data: null });
  const [disbursements, setDisbursements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDisbursements = async () => {
    try {
      setLoading(true);
      const res = await committeeAPI.getApprovedApplications();
      if (res && res.data && res.data.success) {
        
        const mappedData = res.data.data.map(app => ({
          id: app.id,
          employeeName: `${app.first_name || ''} ${app.last_name || ''}`.trim() || 'Unknown',
          employeeId: app.employee_id || 'N/A',
          department: app.department || 'Not specified',
          loanType: app.purpose || 'Personal',
          approvedAmount: parseFloat(app.approved_amount || app.requested_amount || 0),
          monthlyInstallment: parseFloat(app.monthly_repayment || 0),
          tenure: app.approved_term_months || app.repayment_duration_months || 0,
          approvalDate: app.review_date?.split('T')[0] || new Date().toISOString().split('T')[0],
          status: app.status?.toLowerCase() || 'approved',
          nextPaymentDate: app.next_payment_date || 'N/A',
          outstandingBalance: parseFloat(app.outstanding_balance || 0),
          disbursementDate: app.disbursement_date || app.review_date?.split('T')[0] || new Date().toISOString().split('T')[0]
        }));
        setDisbursements(mappedData);
      }
    } catch (error) {
      console.error('Error fetching disbursements:', error);
      setError('Failed to fetch disbursements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisbursements();
  }, []);

  const statuses = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'disbursed', label: 'Disbursed' },
    { value: 'failed', label: 'Failed' }
  ];

  const repaymentSchedule = [
    { month: 1, dueDate: '2024-04-20', amount: 625, status: 'pending', balance: 14375 },
    { month: 2, dueDate: '2024-05-20', amount: 625, status: 'pending', balance: 13750 },
    { month: 3, dueDate: '2024-06-20', amount: 625, status: 'pending', balance: 13125 },
    { month: 4, dueDate: '2024-07-20', amount: 625, status: 'pending', balance: 12500 },
    { month: 5, dueDate: '2024-08-20', amount: 625, status: 'pending', balance: 11875 },
    { month: 6, dueDate: '2024-09-20', amount: 625, status: 'pending', balance: 11250 }
  ];

  const filteredDisbursements = disbursements.filter(disbursement => {
    const matchesSearch = !searchTerm || 
      (disbursement.employeeName && disbursement.employeeName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (disbursement.id && disbursement.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (disbursement.department && disbursement.department.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = selectedStatus === 'all' || disbursement.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  
  const stats = {
    total: filteredDisbursements.length,
    pending: filteredDisbursements.filter(d => d.status === 'pending').length,
    disbursed: filteredDisbursements.filter(d => d.status === 'disbursed').length,
    failed: filteredDisbursements.filter(d => d.status === 'failed').length,
    totalAmount: filteredDisbursements.reduce((sum, d) => sum + d.approvedAmount, 0),
    avgAmount: filteredDisbursements.length > 0 ? filteredDisbursements.reduce((sum, d) => sum + d.approvedAmount, 0) / filteredDisbursements.length : 0
  };

  const handleSelectDisbursement = (id) => {
    setSelectedDisbursements(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedDisbursements.size === filteredDisbursements.length) {
      setSelectedDisbursements(new Set());
    } else {
      setSelectedDisbursements(new Set(filteredDisbursements.map(d => d.id)));
    }
  };

  const handleDisburse = async (id) => {
    
    setProcessingActions(prev => new Set(prev).add(`${id}-disburse`));
    
    try {
      await committeeAPI.disburseLoan(id, {
        disbursement_date: new Date().toISOString().split('T')[0],
        notes: 'Loan disbursed by committee'
      });
      
      
      setDisbursements(prev => prev.map(d => 
        d.id === id 
          ? { ...d, status: 'disbursed', disbursementDate: new Date().toISOString().split('T')[0] }
          : d
      ));
      
      
      setModal({
        show: true,
        type: 'success',
        data: { message: `Disbursement ${id} has been processed successfully!` }
      });
      
      console.log(`Disbursement ${id} processed successfully`);
    } catch (error) {
      console.error('Error processing disbursement:', error);
      
      setModal({
        show: true,
        type: 'error',
        data: { message: `Error processing disbursement ${id}: ${error.message}` }
      });
    } finally {
      
      setProcessingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(`${id}-disburse`);
        return newSet;
      });
    }
  };

  const closeModal = () => {
    setModal({ show: false, type: '', data: null });
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'status-pending',
      disbursed: 'status-approved',
      failed: 'status-rejected'
    };
    return badges[status] || 'status-pending';
  };

  const getPaymentMethodLabel = (method) => {
    const labels = {
      bank_transfer: 'Bank Transfer',
      check: 'Check',
      cash: 'Cash',
      mobile_money: 'Mobile Money'
    };
    return labels[method] || method;
  };

  const handleDownloadAgreement = (loanId) => {
    console.log('Downloading agreement for:', loanId);
    
  };

  const handleViewSchedule = (loan) => {
    setSelectedLoan(loan);
    setShowRepaymentSchedule(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Disbursements</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">Manage approved loan disbursements and repayment schedules</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3">
              <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded ${viewMode === 'table' ? 'bg-white dark:bg-gray-600 shadow-sm' : ''}`}
                >
                  <List className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </button>
                <button
                  onClick={() => setViewMode('card')}
                  className={`p-2 rounded ${viewMode === 'card' ? 'bg-white dark:bg-gray-600 shadow-sm' : ''}`}
                >
                  <Grid className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
              <button className="btn btn-primary flex items-center space-x-2 w-full sm:w-auto justify-center">
                <Download className="w-4 h-4" />
                <span>Export Report</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {}
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Disbursements</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stats.total}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-xl sm:text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">{stats.pending}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Disbursed</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{stats.disbursed}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{formatMoney(stats.totalAmount)}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <Coins className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {}
      <div className="px-4 sm:px-6 pb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {}
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <Filter className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Filters</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Refine your disbursement search</p>
                </div>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronDown className={`w-5 h-5 text-gray-600 dark:text-gray-300 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {}
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by employee name, loan ID, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 sm:pl-12 pr-10 sm:pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 text-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {}
          <div className="px-4 sm:px-6 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-gray-500" />
                  Status
                </label>
                <div className="relative">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer text-sm"
                  >
                    {statuses.map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Quick Actions</label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      console.log('Clear All clicked');
                      setSearchTerm('');
                      setSelectedStatus('all');
                      console.log('Filters cleared');
                    }}
                    className="flex-1 px-3 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex-1 px-3 py-2.5 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors text-sm font-medium"
                  >
                    Advanced
                  </button>
                </div>
              </div>
            </div>
          </div>

          {}
          <div className="px-4 sm:px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {filteredDisbursements.length} results found
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    console.log('Reset filters clicked');
                    setSearchTerm('');
                    setSelectedStatus('all');
                    console.log('Footer reset completed');
                  }}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                >
                  Reset filters
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                >
                  Apply filters
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {}
      <div className="px-4 sm:px-6 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-3 sm:space-y-0">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredDisbursements.length} of {disbursements.length} disbursements
          </p>
          {selectedDisbursements.size > 0 && (
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedDisbursements.size} selected
              </span>
              <button
                onClick={() => setSelectedDisbursements(new Set())}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Clear selection
              </button>
            </div>
          )}
        </div>

        {}
        {viewMode === 'table' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-full sm:min-w-[600px]">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-3 sm:px-6 py-4 text-left">
                      <input
                        type="checkbox"
                        checked={selectedDisbursements.size === filteredDisbursements.length && filteredDisbursements.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-3 sm:px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Disbursement
                    </th>
                    <th className="px-3 sm:px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                      Employee
                    </th>
                    <th className="px-3 sm:px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-3 sm:px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                      Date
                    </th>
                    <th className="px-3 sm:px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                      Installment
                    </th>
                    <th className="px-3 sm:px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-3 sm:px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredDisbursements.map((disbursement) => (
                    <tr key={disbursement.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-3 sm:px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedDisbursements.has(disbursement.id)}
                          onChange={() => handleSelectDisbursement(disbursement.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-3 sm:px-6 py-4">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">{disbursement.id}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">Disbursement</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 hidden sm:table-cell">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-300 rounded-full flex items-center justify-center">
                            <User className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">{disbursement.employee}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{disbursement.department}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4">
                        <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">
                          {formatMoney(disbursement.approvedAmount)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                          {formatMoney(disbursement.installmentAmount)}/month
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 hidden sm:table-cell">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            {disbursement.disbursementDate}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 hidden lg:table-cell">
                        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          ${(disbursement.installmentAmount || 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-4">
                        <span className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          disbursement.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                          disbursement.status === 'disbursed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                          disbursement.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                        }`}>
                          {disbursement.status.charAt(0).toUpperCase() + disbursement.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-4">
                        <div className="flex items-center justify-end space-x-1 sm:space-x-2">
                          <button
                            onClick={() => handleViewSchedule(disbursement)}
                            className="p-1.5 sm:p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Repayment Schedule"
                          >
                            <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                          {disbursement.status === 'pending' && (
                            <button
                              onClick={() => handleDisburse(disbursement.id)}
                              disabled={processingActions.has(`${disbursement.id}-disburse`)}
                              className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
                                processingActions.has(`${disbursement.id}-disburse`)
                                  ? 'text-gray-400 cursor-not-allowed'
                                  : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                              }`}
                              title="Disburse Loan"
                            >
                              {processingActions.has(`${disbursement.id}-disburse`) ? (
                                <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                              ) : (
                                <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => handleDownloadAgreement(disbursement.id)}
                            className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                            title="Download Agreement"
                          >
                            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {}
        {viewMode === 'card' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredDisbursements.map((disbursement) => (
              <div key={disbursement.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-100">{disbursement.id}</p>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Disbursement</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedDisbursements.has(disbursement.id)}
                    onChange={() => handleSelectDisbursement(disbursement.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2 sm:space-y-3 mb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Employee</span>
                    <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 text-right">{disbursement.employee}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Department</span>
                    <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 text-right">{disbursement.department}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Amount</span>
                    <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 text-right">${(disbursement.approvedAmount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Monthly Installment</span>
                    <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 text-right">${(disbursement.installmentAmount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Disbursement Date</span>
                    <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 text-right">{disbursement.disbursementDate}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Repayment Period</span>
                    <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 text-right">{disbursement.repaymentPeriod} months</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    disbursement.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                    disbursement.status === 'disbursed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                    disbursement.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                  }`}>
                    {disbursement.status.charAt(0).toUpperCase() + disbursement.status.slice(1)}
                  </span>
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <button
                      onClick={() => handleViewSchedule(disbursement)}
                      className="p-1.5 sm:p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Repayment Schedule"
                    >
                      <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                    {disbursement.status === 'pending' && (
                      <button
                        onClick={() => handleDisburse(disbursement.id)}
                        disabled={processingActions.has(`${disbursement.id}-disburse`)}
                        className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
                          processingActions.has(`${disbursement.id}-disburse`)
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                        }`}
                        title="Disburse Loan"
                      >
                        {processingActions.has(`${disbursement.id}-disburse`) ? (
                          <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                        ) : (
                          <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => handleDownloadAgreement(disbursement.id)}
                      className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      title="Download Agreement"
                    >
                      <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {}
        {filteredDisbursements.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No disbursements found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>

      {}
      {modal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
            {}
            {modal.type === 'success' && (
              <>
                <div className="p-6">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full mx-auto mb-4">
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 text-center mb-2">
                    Success!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-center">
                    {modal.data.message}
                  </p>
                </div>
                <div className="px-6 pb-6">
                  <button
                    onClick={closeModal}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    OK
                  </button>
                </div>
              </>
            )}

            {}
            {modal.type === 'error' && (
              <>
                <div className="p-6">
                  <div className="flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full mx-auto mb-4">
                    <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 text-center mb-2">
                    Error!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-center">
                    {modal.data.message}
                  </p>
                </div>
                <div className="px-6 pb-6">
                  <button
                    onClick={closeModal}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    OK
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <th className="px-6 py-3">Loan ID</th>
                <th className="px-6 py-3">Employee</th>
                <th className="px-6 py-3">Department</th>
                <th className="px-6 py-3">Approved Amount</th>
                <th className="px-6 py-3">Disbursement Date</th>
                <th className="px-6 py-3">Installment</th>
                <th className="px-6 py-3">Repayment Period</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredDisbursements.map((disbursement) => (
                <tr key={disbursement.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {disbursement.id}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                      <span className="text-sm text-gray-900 dark:text-gray-100">
                        {disbursement.employee}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Building2 className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {disbursement.department}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Coins className="w-4 h-4 text-gray-400 mr-1" />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {formatMoney(disbursement.approvedAmount)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {disbursement.disbursementDate}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {formatCompactMoney(disbursement.installmentAmount || 0)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {disbursement.repaymentPeriod} months
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`status-badge ${getStatusBadge(disbursement.status)}`}>
                      {disbursement.status.charAt(0).toUpperCase() + disbursement.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewSchedule(disbursement)}
                        className="text-primary-600 hover:text-primary-700"
                        title="View Repayment Schedule"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {disbursement.status === 'pending' && (
                        <button
                          onClick={() => handleDisburse(disbursement.id)}
                          className="text-success-600 hover:text-success-700"
                          title="Disburse Loan"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDownloadAgreement(disbursement.id)}
                        className="text-gray-600 hover:text-gray-700"
                        title="Download Agreement"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {}
      {showRepaymentSchedule && selectedLoan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Repayment Schedule
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Loan ID: {selectedLoan.id} - {selectedLoan.employee}
                  </p>
                </div>
                <button
                  onClick={() => setShowRepaymentSchedule(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <XCircle className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {formatMoney(selectedLoan.approvedAmount)}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Installment</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {formatMoney(selectedLoan.installmentAmount)}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Repayment Period</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {selectedLoan.repaymentPeriod} months
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Remaining Balance</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {formatMoney((selectedLoan.approvedAmount || 0) - ((selectedLoan.installmentAmount || 0) * 0))}
                  </p>
                </div>
              </div>

              {}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <th className="px-4 py-3">Month</th>
                      <th className="px-4 py-3">Due Date</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                    {repaymentSchedule.map((payment) => (
                      <tr key={payment.month} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                          {payment.month}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {payment.dueDate}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                          {formatMoney(payment.amount)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`status-badge ${getStatusBadge(payment.status)}`}>
                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {formatMoney(payment.balance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => handleDownloadAgreement(selectedLoan.id)}
                  className="btn btn-secondary"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Schedule
                </button>
                <button
                  onClick={() => setShowRepaymentSchedule(false)}
                  className="btn btn-primary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {}
      {filteredDisbursements.length === 0 && (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No disbursements found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your search criteria or filters
          </p>
        </div>
      )}
    </div>
  );
};

export default Disbursements;
