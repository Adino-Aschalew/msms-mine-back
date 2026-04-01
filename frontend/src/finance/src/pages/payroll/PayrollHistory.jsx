import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Download, Eye, CheckCircle, AlertCircle, Clock, FileText, Users, DollarSign, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { financeAPI } from '../../../../shared/services/financeAPI';
import { useNotifications } from '../../contexts/NotificationContext';

const PayrollHistory = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedImport, setSelectedImport] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [showReverseModal, setShowReverseModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [payrollBatches, setPayrollBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [pagination, setPagination] = useState(null);
  const { addNotification } = useNotifications();
  const itemsPerPage = 10;

  // Fetch payroll batches from backend
  const fetchPayrollBatches = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchQuery && { search: searchQuery }),
        ...(dateFilter !== 'all' && { dateFilter })
      };

      const response = await financeAPI.getPayrollBatches(params);
      setPayrollBatches(response.batches || []);
      setPagination(response.pagination || null);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Failed to Load',
        message: 'Could not load payroll history. Please try again.',
      });
      console.error('Error fetching payroll batches:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount and when filters change
  useEffect(() => {
    fetchPayrollBatches();
  }, [currentPage, statusFilter, searchQuery, dateFilter]);

  // Helper functions
  const formatCurrency = (amount) => {
    if (amount >= 1000000) {
      return `METB ${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `KETB ${(amount / 1000).toFixed(1)}K`;
    } else {
      return `ETB ${amount.toLocaleString()}`;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'UPLOADED':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'VALIDATED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'CONFIRMED':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'PROCESSED':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'REVERSED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'UPLOADED':
        return <Clock className="h-4 w-4" />;
      case 'VALIDATED':
        return <Eye className="h-4 w-4" />;
      case 'CONFIRMED':
        return <CheckCircle className="h-4 w-4" />;
      case 'PROCESSED':
        return <CheckCircle className="h-4 w-4" />;
      case 'REVERSED':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  // Filter and pagination logic (backend handles filtering, so just apply search if needed)
  const displayData = payrollBatches.filter(batch => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      batch.batch_name?.toLowerCase().includes(searchLower) ||
      batch.upload_username?.toLowerCase().includes(searchLower) ||
      batch.upload_first_name?.toLowerCase().includes(searchLower) ||
      batch.upload_last_name?.toLowerCase().includes(searchLower) ||
      batch.id?.toString().includes(searchLower)
    );
  });

  // Pagination calculations
  const totalPages = pagination ? pagination.pages : Math.ceil(displayData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = displayData.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      processing: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    };

    const icons = {
      completed: <CheckCircle className="h-3 w-3 mr-1" />,
      failed: <AlertCircle className="h-3 w-3 mr-1" />,
      processing: <Clock className="h-3 w-3 mr-1" />,
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${styles[status] || styles.processing}`}>
        {icons[status] || icons.processing}
        {status}
      </span>
    );
  };

  const exportResults = (format) => {
    if (format === 'csv') {
      // Create CSV headers
      const headers = [
        'Import ID',
        'File Name', 
        'Uploaded By',
        'Upload Date',
        'Total Records',
        'Successful Records',
        'Failed Records',
        'Success Rate',
        'Status',
        'Processing Time'
      ];
      
      // Create CSV rows from filtered data
      const csvRows = filteredHistory.map(item => [
        item.id,
        item.fileName,
        item.uploadedBy,
        item.uploadDate.toLocaleString(),
        item.totalRecords,
        item.successfulRecords,
        item.totalRecords - item.successfulRecords,
        `${((item.successfulRecords / item.totalRecords) * 100).toFixed(1)}%`,
        item.status,
        item.processingTime
      ]);
      
      // Combine headers and rows
      const csvContent = [headers, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');
      
      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().split('T')[0];
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `payroll_history_export_${timestamp}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const handleViewDetails = async (batch) => {
    try {
      // Fetch detailed information for this batch
      const details = await financeAPI.getPayrollBatchDetails(batch.id);
      setSelectedImport({ ...batch, details });
      setShowDetailsModal(true);
    } catch (error) {
      addNotification({ type: 'error', title: 'Failed to Load Details', message: 'Could not load batch details.' });
    }
  };

  const handleApprove = async (batch) => {
    setSelectedBatch(batch);
    setShowApproveModal(true);
  };

  const confirmApprove = async () => {
    try {
      setActionLoading(true);
      await financeAPI.approvePayroll(selectedBatch.id);
      addNotification({ type: 'success', title: 'Approved', message: 'Payroll batch approved successfully.' });
      setShowApproveModal(false);
      setSelectedBatch(null);
      fetchPayrollBatches(); // Refresh data
    } catch (error) {
      addNotification({ type: 'error', title: 'Approval Failed', message: error.message || 'Failed to approve payroll batch' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleProcess = async (batch) => {
    setSelectedBatch(batch);
    setShowProcessModal(true);
  };

  const confirmProcess = async () => {
    try {
      setActionLoading(true);
      await financeAPI.processPayroll(selectedBatch.id);
      addNotification({ type: 'success', title: 'Processed', message: 'Payroll batch processed successfully. Deductions applied to employee accounts.' });
      setShowProcessModal(false);
      setSelectedBatch(null);
      fetchPayrollBatches(); // Refresh data
    } catch (error) {
      addNotification({ type: 'error', title: 'Processing Failed', message: error.message || 'Failed to process payroll batch' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReverse = async (batch) => {
    setSelectedBatch(batch);
    setShowReverseModal(true);
  };

  const confirmReverse = async () => {
    try {
      setActionLoading(true);
      await financeAPI.reversePayroll(selectedBatch.id);
      addNotification({ type: 'success', title: 'Reversed', message: 'Payroll batch reversed successfully. All deductions have been undone.' });
      setShowReverseModal(false);
      setSelectedBatch(null);
      fetchPayrollBatches(); // Refresh data
    } catch (error) {
      addNotification({ type: 'error', title: 'Reversal Failed', message: error.message || 'Failed to reverse payroll batch' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownload = async (batch) => {
    try {
      // Fetch real payroll details for this batch
      const details = await financeAPI.getPayrollBatchDetails(batch.id);
      
      // Create CSV headers
      const headers = [
        'Employee ID',
        'First Name',
        'Last Name',
        'Gross Salary',
        'Saving Amount',
        'Deduction Amount',
        'Net Salary',
        'Date'
      ];
      
      // Create CSV rows from real payroll data
      const csvRows = details.details.map((detail) => [
        detail.employee_id || '',
        detail.first_name || '',
        detail.last_name || '',
        detail.gross_salary || 0,
        detail.savings_deduction || 0,
        detail.loan_repayment_deduction || 0,
        detail.net_salary || 0,
        selectedImport?.payroll_date ? new Date(selectedImport.payroll_date).toLocaleDateString() : 
        selectedImport?.created_at ? new Date(selectedImport.created_at).toLocaleDateString() : 'N/A'
      ]);
      
      // Combine headers and rows
      const csvContent = [headers, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');
      
      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${batch.batch_name}_details.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      addNotification({ 
        type: 'success', 
        title: 'Download Complete', 
        message: `Payroll details for ${batch.batch_name} downloaded successfully.` 
      });
      
    } catch (error) {
      addNotification({ 
        type: 'error', 
        title: 'Download Failed', 
        message: 'Could not download payroll details.' 
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Payroll History
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            View and manage historical payroll imports
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <button 
            onClick={() => exportResults('csv')}
            className="flex items-center px-4 py-2 bg-gray-600 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600 text-white text-sm font-medium rounded-md transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="flex-1">
            <div className="relative">
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search imports..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="processing">Processing</option>
            </select>
          </div>
          <div className="relative">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Time</option>
              <option value="oldest">Oldest First</option>
              <option value="recent">Most Recent</option>
              <option value="new">Newest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  <div className="flex items-center">
                    Import ID
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  <div className="flex items-center">
                    Batch Name
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  <div className="flex items-center">
                    Uploaded By
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  <div className="flex items-center">
                    Employees
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  <div className="flex items-center">
                    Total Amount
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  <div className="flex items-center">
                    Upload Date
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  <div className="flex items-center">
                    Status
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  <div className="flex items-center">
                    Actions
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {currentItems.map((batch) => (
                <tr key={batch.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-blue-800 dark:text-blue-400">BAT</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {batch.id}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white font-medium">
                      {batch.batch_name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {batch.original_name || 'Payroll file'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {batch.upload_first_name && batch.upload_last_name 
                        ? `${batch.upload_first_name} ${batch.upload_last_name}`
                        : batch.upload_username || 'Unknown'
                      }
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900 dark:text-white">
                    {batch.total_employees || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900 dark:text-white">
                    {formatCurrency(batch.total_amount || 0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900 dark:text-white">
                    {new Date(batch.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(batch.status)}`}>
                      {getStatusIcon(batch.status)}
                      <span className="ml-1">{batch.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button 
                        onClick={() => handleViewDetails(batch)}
                        className="flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={actionLoading}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </button>
                      {batch.status === 'VALIDATED' && (
                        <button 
                          onClick={() => handleApprove(batch)}
                          className="flex items-center px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={actionLoading}
                        >
                          {actionLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                              Approving...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Approve
                            </>
                          )}
                        </button>
                      )}
                      {batch.status === 'CONFIRMED' && (
                        <button 
                          onClick={() => handleProcess(batch)}
                          className="flex items-center px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={actionLoading}
                        >
                          {actionLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                              Processing...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Process
                            </>
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

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading payroll history...</p>
        </div>
      ) : payrollBatches.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No payroll batches found
          </p>
        </div>
      ) : null}
      
      {/* Pagination */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing <span className="font-medium text-gray-900 dark:text-white">{displayData.length}</span> of <span className="font-medium text-gray-900 dark:text-white">{pagination?.total || payrollBatches.length}</span> results
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              className="flex items-center px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-sm font-medium rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handlePrevious}
              disabled={currentPage === 1}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7 7" />
              </svg>
              Previous
            </button>
            
            {/* Page Numbers */}
            <div className="flex items-center space-x-1">
              {[...Array(totalPages).keys()].map((page) => {
                const pageNum = page + 1;
                return (
                  <button 
                    key={pageNum}
                    className={`flex items-center justify-center w-8 h-8 text-sm font-medium rounded-md transition-colors ${
                      pageNum === currentPage 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button 
              className="flex items-center px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-sm font-medium rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleNext}
              disabled={currentPage === totalPages}
            >
              Next
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedImport && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xl p-6 w-full max-w-2xl mx-4 transform transition-all">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Payroll Import Details</h3>
              <button 
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Batch ID</label>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedImport.id}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Batch Name</label>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedImport.batch_name}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Uploaded By</label>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {selectedImport.upload_first_name && selectedImport.upload_last_name 
                      ? `${selectedImport.upload_first_name} ${selectedImport.upload_last_name}`
                      : selectedImport.upload_username || 'Unknown'
                    }
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Upload Date</label>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(selectedImport.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Status</label>
                  <div className="mt-1">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedImport.status)}`}>
                      {getStatusIcon(selectedImport.status)}
                      <span className="ml-1">{selectedImport.status}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Total Employees</label>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedImport.total_employees || 0}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Total Amount</label>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(selectedImport.total_amount || 0)}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Payroll Date</label>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {selectedImport.payroll_date ? new Date(selectedImport.payroll_date).toLocaleDateString() : 
                     selectedImport.created_at ? new Date(selectedImport.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-10 pt-6 border-t border-gray-100 dark:border-gray-700">
              <button 
                onClick={() => setShowDetailsModal(false)}
                className="px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-bold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  handleDownload(selectedImport);
                  setShowDetailsModal(false);
                }}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-lg shadow-blue-500/20 transition-all"
              >
                Download File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Confirmation Modal */}
      {showApproveModal && selectedBatch && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xl p-6 w-full max-w-md mx-4 transform transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Approve Payroll Batch</h3>
              <button 
                onClick={() => setShowApproveModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Are you sure you want to approve payroll batch <span className="font-semibold">{selectedBatch.batch_name}</span>? This will move the batch to confirmed status and make it ready for processing.
              </p>
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-xs text-gray-500 dark:text-gray-400">Batch Details:</div>
                <div className="text-sm text-gray-900 dark:text-white mt-1">
                  <div>• {selectedBatch.total_employees || 0} employees</div>
                  <div>• {formatCurrency(selectedBatch.total_amount || 0)} total amount</div>
                  <div>• Status: {selectedBatch.status}</div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowApproveModal(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmApprove}
                disabled={actionLoading}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Approving...
                  </>
                ) : (
                  'Approve'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Process Confirmation Modal */}
      {showProcessModal && selectedBatch && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xl p-6 w-full max-w-md mx-4 transform transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Process Payroll Batch</h3>
              <button 
                onClick={() => setShowProcessModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Are you sure you want to process payroll batch <span className="font-semibold">{selectedBatch.batch_name}</span>? This will apply all deductions to employee accounts and cannot be undone without reversing the batch.
              </p>
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                <div className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">⚠️ Important:</div>
                <div className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
                  • Savings deductions will be added to employee accounts<br/>
                  • Loan repayments will be processed<br/>
                  • This action affects real financial data
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowProcessModal(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmProcess}
                disabled={actionLoading}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  'Process'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reverse Confirmation Modal */}
      {showReverseModal && selectedBatch && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xl p-6 w-full max-w-md mx-4 transform transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Reverse Payroll Batch</h3>
              <button 
                onClick={() => setShowReverseModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Are you sure you want to reverse payroll batch <span className="font-semibold">{selectedBatch.batch_name}</span>? This will undo all deductions and transactions.
              </p>
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                <div className="text-xs text-red-600 dark:text-red-400 font-medium">⚠️ Warning:</div>
                <div className="text-sm text-red-800 dark:text-red-200 mt-1">
                  • All savings deductions will be reversed<br/>
                  • All loan repayments will be reversed<br/>
                  • Employee account balances will be restored<br/>
                  • This action cannot be undone
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowReverseModal(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmReverse}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Reversing...
                  </>
                ) : (
                  'Reverse'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollHistory;
