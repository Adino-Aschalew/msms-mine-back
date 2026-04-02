import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  ChevronDown,
  User,
  Building2,
  CreditCard,
  Calendar,
  Coins,
  RefreshCw,
  Info,
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
  ChevronRight
} from 'lucide-react';
import { handleButtonClick, approveLoan, rejectLoan, suspendLoan } from '../utils/actionHandlers';
import { exportLoanReport } from '../utils/exportUtils';
import { committeeAPI } from '../services/committeeAPI';

// Compact money formatter for large amounts
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

const LoanRequests = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedLoanType, setSelectedLoanType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [amountRange, setAmountRange] = useState({ min: '', max: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [processingActions, setProcessingActions] = useState(new Set());
  const [modal, setModal] = useState({ show: false, type: '', data: null });
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'
  const [selectedRequests, setSelectedRequests] = useState(new Set());
  const [loanRequests, setLoanRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await committeeAPI.getPendingApplications({
        page: 1,
        limit: 100,
        search: searchTerm,
        department: selectedDepartment !== 'all' ? selectedDepartment : undefined,
        min_amount: amountRange.min || undefined,
        max_amount: amountRange.max || undefined
      });
      
      if (res && res.data && res.data.success) {
        // Map backend response to frontend expected fields
        const mappedData = res.data.data.map(app => ({
          id: app.id,
          employeeName: `${app.first_name || ''} ${app.last_name || ''}`.trim() || 'Unknown',
          employeeId: app.employee_id || 'N/A',
          department: app.department || 'Not specified',
          loanType: app.purpose || 'Personal',
          requestedAmount: parseFloat(app.requested_amount || 0),
          monthlyInstallment: parseFloat(app.monthly_repayment || 0),
          tenure: app.approved_term_months || app.repayment_duration_months || 0,
          approvalDate: app.review_date?.split('T')[0] || new Date().toISOString().split('T')[0],
          status: app.status?.toLowerCase() || 'approved',
          nextPaymentDate: app.next_payment_date || 'N/A',
          outstandingBalance: parseFloat(app.outstanding_balance || 0)
        }));
        setLoanRequests(mappedData);
      }
    } catch (error) {
      console.error('Error fetching loan applications:', error);
      setModal({ show: true, type: 'error', data: { message: 'Failed to fetch applications.' } });
    } finally {
      setLoading(false);
    }
  };

  // Functional handlers
  const handleSearch = (term) => {
    setSearchTerm(term);
    handleButtonClick('searchData', term);
  };

  const handleFilter = () => {
    const filters = {
      department: selectedDepartment,
      loanType: selectedLoanType,
      status: selectedStatus,
      amountRange
    };
    handleButtonClick('filterData', filters);
  };

  const handleRefresh = () => {
    fetchApplications();
    handleButtonClick('refreshData', 'loanRequests');
  };

  const departments = [
    { value: 'all', label: 'All Departments' },
    { value: 'engineering', label: 'Engineering' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'sales', label: 'Sales' },
    { value: 'hr', label: 'Human Resources' },
    { value: 'finance', label: 'Finance' },
    { value: 'operations', label: 'Operations' }
  ];

  const loanTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'personal', label: 'Personal' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'education', label: 'Education' },
    { value: 'housing', label: 'Housing' },
    { value: 'medical', label: 'Medical' }
  ];

  const statuses = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'suspended', label: 'Suspended' }
  ];

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'status-pending',
      approved: 'status-approved',
      rejected: 'status-rejected',
      suspended: 'status-suspended'
    };
    return badges[status] || 'status-pending';
  };

  const getEligibilityBadge = (status) => {
    const badges = {
      eligible: 'status-approved',
      'not-eligible': 'status-rejected'
    };
    return badges[status] || 'status-pending';
  };

  const handleApprove = async (id) => {
    console.log('Approving loan:', id);
    
    // Show confirmation modal
    setModal({
      show: true,
      type: 'approve',
      data: { id }
    });
  };

  const handleReject = async (id) => {
    console.log('Rejecting loan:', id);
    
    // Show reject modal with reason input
    setModal({
      show: true,
      type: 'reject',
      data: { id, reason: '' }
    });
  };

  const handleSuspend = async (id) => {
    console.log('Suspending loan:', id);
    
    // Find the loan request to check if it can be suspended
    const loan = loanRequests.find(req => req.id === id);
    if (!loan) {
      console.error('Loan not found:', id);
      return;
    }

    // Only suspend approved loans
    if (loan.status !== 'approved') {
      setModal({
        show: true,
        type: 'error',
        data: { message: `Cannot suspend loan ${id} - only approved loans can be suspended` }
      });
      return;
    }

    // Show suspend modal with reason input
    setModal({
      show: true,
      type: 'suspend',
      data: { id, reason: '' }
    });
  };

  const confirmApprove = async (id) => {
    // Add to processing set
    setProcessingActions(prev => new Set(prev).add(`${id}-approve`));
    
    try {
      // Find the loan request
      const loan = loanRequests.find(req => req.id === id);
      if (!loan) {
        console.error('Loan not found:', id);
        return;
      }

      // Update loan status to approved using state setter
      setLoanRequests(prev => prev.map(req => 
        req.id === id 
          ? { ...req, status: 'approved', approvalDate: new Date().toISOString().split('T')[0] }
          : req
      ));
      
      // Call the centralized action handler
      const result = await approveLoan(id);
      if (result.success) {
        console.log(`Loan ${id} approved successfully`);
        setModal({
          show: true,
          type: 'success',
          data: { message: `Loan ${id} has been approved successfully!` }
        });
      } else {
        console.error('Failed to approve loan:', result.error);
        // Revert on failure
        setLoanRequests(prev => prev.map(req => 
          req.id === id 
            ? { ...req, status: 'pending' }
            : req
        ));
        setModal({
          show: true,
          type: 'error',
          data: { message: `Failed to approve loan ${id}: ${result.error}` }
        });
      }
    } catch (error) {
      console.error('Error approving loan:', error);
      // Revert on error
      setLoanRequests(prev => prev.map(req => 
        req.id === id 
          ? { ...req, status: 'pending' }
          : req
      ));
      setModal({
        show: true,
        type: 'error',
        data: { message: `Error approving loan ${id}: ${error.message}` }
      });
    } finally {
      // Remove from processing set
      setProcessingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(`${id}-approve`);
        return newSet;
      });
    }
  };

  const confirmReject = async (id, reason) => {
    // Add to processing set
    setProcessingActions(prev => new Set(prev).add(`${id}-reject`));
    
    try {
      // Update loan status to rejected using state setter
      setLoanRequests(prev => prev.map(req => 
        req.id === id 
          ? { ...req, status: 'rejected', rejectionDate: new Date().toISOString().split('T')[0], rejectionReason: reason }
          : req
      ));
      
      // Call the centralized action handler
      const result = await rejectLoan(id, reason);
      if (result.success) {
        console.log(`Loan ${id} rejected successfully`);
        setModal({
          show: true,
          type: 'success',
          data: { message: `Loan ${id} has been rejected successfully!` }
        });
      } else {
        console.error('Failed to reject loan:', result.error);
        // Revert on failure
        setLoanRequests(prev => prev.map(req => 
          req.id === id 
            ? { ...req, status: 'pending' }
            : req
        ));
        setModal({
          show: true,
          type: 'error',
          data: { message: `Failed to reject loan ${id}: ${result.error}` }
        });
      }
    } catch (error) {
      console.error('Error rejecting loan:', error);
      // Revert on error
      setLoanRequests(prev => prev.map(req => 
        req.id === id 
          ? { ...req, status: 'pending' }
          : req
      ));
      setModal({
        show: true,
        type: 'error',
        data: { message: `Error rejecting loan ${id}: ${error.message}` }
      });
    } finally {
      // Remove from processing set
      setProcessingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(`${id}-reject`);
        return newSet;
      });
    }
  };

  const confirmSuspend = async (id, reason) => {
    // Add to processing set
    setProcessingActions(prev => new Set(prev).add(`${id}-suspend`));
    
    try {
      // Update loan status to suspended using state setter
      setLoanRequests(prev => prev.map(req => 
        req.id === id 
          ? { ...req, status: 'suspended', suspensionDate: new Date().toISOString().split('T')[0], suspensionReason: reason }
          : req
      ));
      
      // Call the centralized action handler
      const result = await suspendLoan(id);
      if (result.success) {
        console.log(`Loan ${id} suspended successfully`);
        setModal({
          show: true,
          type: 'success',
          data: { message: `Loan ${id} has been suspended successfully!` }
        });
      } else {
        console.error('Failed to suspend loan:', result.error);
        // Revert on failure
        setLoanRequests(prev => prev.map(req => 
          req.id === id 
            ? { ...req, status: 'approved' }
            : req
        ));
        setModal({
          show: true,
          type: 'error',
          data: { message: `Failed to suspend loan ${id}: ${result.error}` }
        });
      }
    } catch (error) {
      console.error('Error suspending loan:', error);
      // Revert on error
      setLoanRequests(prev => prev.map(req => 
        req.id === id 
          ? { ...req, status: 'approved' }
          : req
      ));
      setModal({
        show: true,
        type: 'error',
        data: { message: `Error suspending loan ${id}: ${error.message}` }
      });
    } finally {
      // Remove from processing set
      setProcessingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(`${id}-suspend`);
        return newSet;
      });
    }
  };

  const closeModal = () => {
    setModal({ show: false, type: '', data: null });
  };

  const handleViewDetails = (id) => {
    console.log('Viewing loan details:', id);
    navigate(`/loan-requests/${id}`);
  };

  const handleExport = () => {
    console.log('Exporting loan requests');
    
    // Prepare export data with current filters
    const exportData = {
      generatedAt: new Date().toISOString(),
      filters: {
        searchTerm,
        department: selectedDepartment,
        loanType: selectedLoanType,
        status: selectedStatus,
        amountRange
      },
      loanRequests: getFilteredRequests(), // Use the filtered requests
      summary: {
        totalRequests: loanRequests.length,
        filteredRequests: getFilteredRequests().length,
        exportTimestamp: new Date().toISOString()
      }
    };

    // Call the centralized export utility
    exportLoanReport(exportData);
    
    console.log(`Exported ${getFilteredRequests().length} loan requests`);
  };

  // Filter function for loan requests
  const getFilteredRequests = () => {
    return loanRequests.filter(request => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          request.id.toLowerCase().includes(searchLower) ||
          request.employeeName.toLowerCase().includes(searchLower) ||
          request.department.toLowerCase().includes(searchLower) ||
          request.loanType.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      // Department filter
      if (selectedDepartment !== 'all' && request.department.toLowerCase() !== selectedDepartment.toLowerCase()) {
        return false;
      }

      // Loan type filter
      if (selectedLoanType !== 'all' && request.loanType.toLowerCase() !== selectedLoanType.toLowerCase()) {
        return false;
      }

      // Status filter
      if (selectedStatus !== 'all' && request.status !== selectedStatus) {
        return false;
      }

      // Amount range filter
      if (amountRange.min && request.requestedAmount < parseFloat(amountRange.min)) {
        return false;
      }
      if (amountRange.max && request.requestedAmount > parseFloat(amountRange.max)) {
        return false;
      }

      return true;
    });
  };

  const filteredRequests = getFilteredRequests();

  // Calculate statistics
  const stats = {
    total: filteredRequests.length,
    pending: filteredRequests.filter(r => r.status === 'pending').length,
    approved: filteredRequests.filter(r => r.status === 'approved').length,
    rejected: filteredRequests.filter(r => r.status === 'rejected').length,
    suspended: filteredRequests.filter(r => r.status === 'suspended').length,
    totalAmount: filteredRequests.reduce((sum, r) => sum + r.requestedAmount, 0),
    avgAmount: filteredRequests.length > 0 ? filteredRequests.reduce((sum, r) => sum + r.requestedAmount, 0) / filteredRequests.length : 0
  };

  const handleSelectRequest = (id) => {
    setSelectedRequests(prev => {
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
    if (selectedRequests.size === filteredRequests.length) {
      setSelectedRequests(new Set());
    } else {
      setSelectedRequests(new Set(filteredRequests.map(r => r.id)));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Loan Requests</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Manage and review employee loan applications</p>
            </div>
            <div className="flex items-center space-x-3">
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
              <button
                onClick={handleExport}
                className="btn btn-primary flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Approved</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{stats.approved}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{formatCompactMoney(stats.totalAmount)}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <Coins className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Filters Section */}
      <div className="px-6 pb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Filter Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <Filter className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Filters</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Refine your loan requests search</p>
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

          {/* Search Bar */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by employee name, loan ID, department, or loan type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Filters */}
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-gray-500" />
                  Status
                </label>
                <div className="relative">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer"
                  >
                    {statuses.map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Loan Type Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                  <CreditCard className="w-4 h-4 mr-2 text-gray-500" />
                  Loan Type
                </label>
                <div className="relative">
                  <select
                    value={selectedLoanType}
                    onChange={(e) => setSelectedLoanType(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer"
                  >
                    {loanTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Quick Actions</label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      console.log('Clear All clicked');
                      setSearchTerm('');
                      setSelectedLoanType('all');
                      setSelectedStatus('all');
                      setAmountRange({ min: '', max: '' });
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

          {/* Advanced Filters */}
          {showFilters && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Advanced Filters</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Min Amount */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                      <Coins className="w-4 h-4 mr-2 text-gray-500" />
                      Minimum Amount
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={amountRange.min}
                        onChange={(e) => setAmountRange(prev => ({ ...prev, min: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-gray-100"
                        placeholder="0"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">USD</span>
                    </div>
                  </div>

                  {/* Max Amount */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                      <Coins className="w-4 h-4 mr-2 text-gray-500" />
                      Maximum Amount
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={amountRange.max}
                        onChange={(e) => setAmountRange(prev => ({ ...prev, max: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-gray-100"
                        placeholder="50000"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">USD</span>
                    </div>
                  </div>

                  {/* Date Range */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                      Date Range
                    </label>
                    <select
                      className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer"
                    >
                      <option value="">All dates</option>
                      <option value="today">Today</option>
                      <option value="week">This week</option>
                      <option value="month">This month</option>
                      <option value="quarter">This quarter</option>
                      <option value="year">This year</option>
                    </select>
                  </div>
                </div>

                {/* Filter Tags */}
                <div className="flex flex-wrap gap-2 pt-4">
                  {(selectedStatus !== 'all' || selectedLoanType !== 'all' || amountRange.min || amountRange.max) && (
                    <>
                      {selectedStatus !== 'all' && (
                        <div className="inline-flex items-center px-3 py-1.5 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-sm">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {statuses.find(s => s.value === selectedStatus)?.label}
                          <button
                            onClick={() => setSelectedStatus('all')}
                            className="ml-2 text-green-500 hover:text-green-700"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                      {selectedLoanType !== 'all' && (
                        <div className="inline-flex items-center px-3 py-1.5 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-full text-sm">
                          <CreditCard className="w-3 h-3 mr-1" />
                          {loanTypes.find(t => t.value === selectedLoanType)?.label}
                          <button
                            onClick={() => setSelectedLoanType('all')}
                            className="ml-2 text-purple-500 hover:text-purple-700"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                      {amountRange.min && (
                        <div className="inline-flex items-center px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded-full text-sm">
                          <Coins className="w-3 h-3 mr-1" />
                          Min: {amountRange.min}
                          <button
                            onClick={() => setAmountRange(prev => ({ ...prev, min: '' }))}
                            className="ml-2 text-yellow-500 hover:text-yellow-700"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                      {amountRange.max && (
                        <div className="inline-flex items-center px-3 py-1.5 bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 rounded-full text-sm">
                          <Coins className="w-3 h-3 mr-1" />
                          Max: {amountRange.max}
                          <button
                            onClick={() => setAmountRange(prev => ({ ...prev, max: '' }))}
                            className="ml-2 text-orange-500 hover:text-orange-700"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Filter Footer */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {filteredRequests.length} results found
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    console.log('Reset filters clicked');
                    setSearchTerm('');
                    setSelectedLoanType('all');
                    setSelectedStatus('all');
                    setAmountRange({ min: '', max: '' });
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

      {/* Results */}
      <div className="px-6 pb-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredRequests.length} of {loanRequests.length} requests
          </p>
          {selectedRequests.size > 0 && (
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedRequests.size} selected
              </span>
              <button
                onClick={() => setSelectedRequests(new Set())}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Clear selection
              </button>
            </div>
          )}
        </div>

        {/* Table View */}
        {viewMode === 'table' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left">
                      <input
                        type="checkbox"
                        checked={selectedRequests.size === filteredRequests.length && filteredRequests.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Loan Request
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Loan Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedRequests.has(request.id)}
                          onChange={() => handleSelectRequest(request.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{request.id}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{request.loanType}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{request.employeeName}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{request.department}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <CreditCard className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="text-sm text-gray-900 dark:text-gray-100">{request.loanType}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {formatCompactMoney(request.requestedAmount)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {formatCompactMoney(request.monthlySalary)}/month
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          request.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                          request.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                          request.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                        }`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {request.submissionDate}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleViewDetails(request.id)}
                            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          {request.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(request.id)}
                                disabled={processingActions.has(`${request.id}-approve`)}
                                className={`p-2 rounded-lg transition-colors ${
                                  processingActions.has(`${request.id}-approve`)
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                                }`}
                                title="Approve"
                              >
                                {processingActions.has(`${request.id}-approve`) ? (
                                  <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                  <CheckCircle className="w-4 h-4" />
                                )}
                              </button>
                              <button
                                onClick={() => handleReject(request.id)}
                                disabled={processingActions.has(`${request.id}-reject`)}
                                className={`p-2 rounded-lg transition-colors ${
                                  processingActions.has(`${request.id}-reject`)
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                                }`}
                                title="Reject"
                              >
                                {processingActions.has(`${request.id}-reject`) ? (
                                  <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                  <XCircle className="w-4 h-4" />
                                )}
                              </button>
                            </>
                          )}
                          
                          {request.status === 'approved' && (
                            <button
                              onClick={() => handleSuspend(request.id)}
                              disabled={processingActions.has(`${request.id}-suspend`)}
                              className={`p-2 rounded-lg transition-colors ${
                                processingActions.has(`${request.id}-suspend`)
                                  ? 'text-gray-400 cursor-not-allowed'
                                  : 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50'
                              }`}
                              title="Suspend"
                            >
                              {processingActions.has(`${request.id}-suspend`) ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <AlertCircle className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Card View */}
        {viewMode === 'card' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRequests.map((request) => (
              <div key={request.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{request.id}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{request.loanType}</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedRequests.has(request.id)}
                    onChange={() => handleSelectRequest(request.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Employee</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{request.employeeName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Department</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{request.department}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Amount</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">${request.requestedAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Monthly Salary</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">${request.monthlySalary.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    request.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                    request.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                    request.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                  }`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleViewDetails(request.id)}
                      className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    {request.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(request.id)}
                          disabled={processingActions.has(`${request.id}-approve`)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            processingActions.has(`${request.id}-approve`)
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                          }`}
                          title="Approve"
                        >
                          {processingActions.has(`${request.id}-approve`) ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleReject(request.id)}
                          disabled={processingActions.has(`${request.id}-reject`)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            processingActions.has(`${request.id}-reject`)
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                          }`}
                          title="Reject"
                        >
                          {processingActions.has(`${request.id}-reject`) ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                        </button>
                      </>
                    )}
                    
                    {request.status === 'approved' && (
                      <button
                        onClick={() => handleSuspend(request.id)}
                        disabled={processingActions.has(`${request.id}-suspend`)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          processingActions.has(`${request.id}-suspend`)
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50'
                        }`}
                        title="Suspend"
                      >
                        {processingActions.has(`${request.id}-suspend`) ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <AlertCircle className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredRequests.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No loan requests found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
            {/* Approve Modal */}
            {modal.type === 'approve' && (
              <>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Approve Loan
                    </h3>
                    <button
                      onClick={closeModal}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="mb-6">
                    <p className="text-gray-600 dark:text-gray-400">
                      Are you sure you want to approve loan <span className="font-medium">{modal.data.id}</span>?
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                      This action will update the loan status to "Approved" and notify the employee.
                    </p>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={closeModal}
                      className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        confirmApprove(modal.data.id);
                        closeModal();
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Approve Loan
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Reject Modal */}
            {modal.type === 'reject' && (
              <>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Reject Loan
                    </h3>
                    <button
                      onClick={closeModal}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="mb-4">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Reject loan <span className="font-medium">{modal.data.id}</span>
                    </p>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Rejection Reason
                    </label>
                    <textarea
                      value={modal.data.reason}
                      onChange={(e) => setModal(prev => ({
                        ...prev,
                        data: { ...prev.data, reason: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-gray-100"
                      rows="3"
                      placeholder="Enter reason for rejection..."
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={closeModal}
                      className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (!modal.data.reason.trim()) {
                          return;
                        }
                        confirmReject(modal.data.id, modal.data.reason);
                        closeModal();
                      }}
                      disabled={!modal.data.reason.trim()}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Reject Loan
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Suspend Modal */}
            {modal.type === 'suspend' && (
              <>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Suspend Loan
                    </h3>
                    <button
                      onClick={closeModal}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="mb-4">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Suspend loan <span className="font-medium">{modal.data.id}</span>
                    </p>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Suspension Reason
                    </label>
                    <textarea
                      value={modal.data.reason}
                      onChange={(e) => setModal(prev => ({
                        ...prev,
                        data: { ...prev.data, reason: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-gray-100"
                      rows="3"
                      placeholder="Enter reason for suspension..."
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={closeModal}
                      className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (!modal.data.reason.trim()) {
                          return;
                        }
                        confirmSuspend(modal.data.id, modal.data.reason);
                        closeModal();
                      }}
                      disabled={!modal.data.reason.trim()}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Suspend Loan
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Success Modal */}
            {modal.type === 'success' && (
              <>
                <div className="p-6">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 text-center mb-2">
                    Success!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                    {modal.data.message}
                  </p>
                  <div className="flex justify-center">
                    <button
                      onClick={closeModal}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      OK
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Error Modal */}
            {modal.type === 'error' && (
              <>
                <div className="p-6">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                      <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 text-center mb-2">
                    Error
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                    {modal.data.message}
                  </p>
                  <div className="flex justify-center">
                    <button
                      onClick={closeModal}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      OK
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanRequests;
