import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Download, Eye, CheckCircle, AlertCircle, Clock, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const PayrollHistory = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedImport, setSelectedImport] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const itemsPerPage = 10;

  const payrollHistory = [
    {
      id: 'IMP001',
      fileName: 'payroll_march_2024.csv',
      uploadedBy: 'Sarah Johnson',
      uploadDate: new Date(Date.now() - 1000 * 60 * 60 * 2),
      totalRecords: 150,
      successfulRecords: 148,
      failedRecords: 2,
      status: 'completed',
      processingTime: '2.3s',
    },
    {
      id: 'IMP002',
      fileName: 'payroll_february_2024.csv',
      uploadedBy: 'Mike Chen',
      uploadDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
      totalRecords: 145,
      successfulRecords: 145,
      failedRecords: 0,
      status: 'completed',
      processingTime: '1.8s',
    },
    {
      id: 'IMP003',
      fileName: 'payroll_january_2024.csv',
      uploadedBy: 'Emily Davis',
      uploadDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
      totalRecords: 142,
      successfulRecords: 140,
      failedRecords: 2,
      status: 'completed',
      processingTime: '2.1s',
    },
    {
      id: 'IMP004',
      fileName: 'payroll_december_2023.csv',
      uploadedBy: 'Sarah Johnson',
      uploadDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 21),
      totalRecords: 138,
      successfulRecords: 135,
      failedRecords: 3,
      status: 'completed',
      processingTime: '2.5s',
    },
    {
      id: 'IMP005',
      fileName: 'payroll_november_2023.csv',
      uploadedBy: 'Mike Chen',
      uploadDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 28),
      totalRecords: 135,
      successfulRecords: 0,
      failedRecords: 135,
      status: 'failed',
      processingTime: '0.5s',
    },
  ];

  const filteredHistory = payrollHistory.filter(item => {
    const matchesSearch = item.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.uploadedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    
    const matchesDate = dateFilter === 'all' || 
      (dateFilter === 'oldest' && item.uploadDate <= new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)) ||
      (dateFilter === 'recent' && item.uploadDate >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
      (dateFilter === 'new' && item.uploadDate >= new Date(Date.now() - 24 * 60 * 60 * 1000));
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredHistory.slice(startIndex, endIndex);

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

  const handleViewDetails = (item) => {
    setSelectedImport(item);
    setShowDetailsModal(true);
  };

  const handleDownload = (item) => {
    // Create sample CSV content for the payroll file
    const csvContent = `Import ID,Employee ID,Employee Name,Salary,Department,Status
${item.id},EMP001,John Doe,5000,Engineering,Active
${item.id},EMP002,Jane Smith,5500,Marketing,Active
${item.id},EMP003,Bob Johnson,4800,Finance,Active
${item.id},EMP004,Alice Brown,5200,HR,Active
${item.id},EMP005,Charlie Wilson,4900,Operations,Active`;

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', item.fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payroll History
          </h1>
          <p className="text-lg text-gray-600">
            View and manage historical payroll imports
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <button 
            onClick={() => exportResults('csv')}
            className="flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-md transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="flex-1">
            <div className="relative">
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search imports..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  <div className="flex items-center">
                    Import ID
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  <div className="flex items-center">
                    File Name
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  <div className="flex items-center">
                    Uploaded By
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  <div className="flex items-center">
                    Upload Date
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  <div className="flex items-center">
                    Records
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  <div className="flex items-center">
                    Success Rate
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  <div className="flex items-center">
                    Processing Time
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  <div className="flex items-center">
                    Actions
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-blue-800">IMP</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {item.id.slice(-3)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {item.fileName}
                        </p>
                        <p className="text-xs text-gray-500">
                          CSV • {item.totalRecords} records
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium text-gray-700">
                          {item.uploadedBy.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {item.uploadedBy}
                        </p>
                        <p className="text-xs text-gray-500">
                          Payroll Administrator
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm text-gray-900">
                      {item.uploadDate.toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.uploadDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900">
                          {item.totalRecords}
                        </p>
                        <p className="text-xs text-gray-500">
                          total records
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-900">
                          {item.successfulRecords}
                        </p>
                        <p className="text-xs text-gray-500">
                          successful
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-red-600">
                          {item.totalRecords - item.successfulRecords}
                        </p>
                        <p className="text-xs text-gray-500">
                          failed
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        <div className={`w-2 h-2 rounded-full ${
                          item.status === 'completed' ? 'bg-green-500' :
                          item.status === 'failed' ? 'bg-red-500' :
                          'bg-yellow-500'
                        }`} />
                        <span className={`text-sm font-medium ${
                          item.status === 'completed' ? 'text-green-800' :
                          item.status === 'failed' ? 'text-red-800' :
                          'text-yellow-800'
                        }`}>
                          {((item.successfulRecords / item.totalRecords) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        item.status === 'completed' 
                          ? 'bg-green-100 text-green-800'
                          : item.status === 'failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {getStatusBadge(item.status)}
                        {item.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm text-gray-900">
                      {item.processingTime}
                    </p>
                    <div className={`w-full bg-gray-200 rounded-full h-2 mt-1 ${
                      parseFloat(item.processingTime) <= 1 ? 'bg-green-500' :
                      parseFloat(item.processingTime) <= 2 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}>
                      <div className="h-2 bg-green-500 rounded-full" style={{ width: `${(parseFloat(item.processingTime) / 3) * 100}%` }} />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleViewDetails(item)}
                        className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View Details
                      </button>
                      <button 
                        onClick={() => handleDownload(item)}
                        className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-md transition-colors"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredHistory.length === 0 && (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No payroll imports found matching your criteria
          </p>
        </div>
      )}
      
      {/* Pagination */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <p className="text-sm text-gray-600">
              Showing <span className="font-medium text-gray-900">{filteredHistory.length}</span> of <span className="font-medium text-gray-900">{payrollHistory.length}</span> results
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              className="flex items-center px-3 py-2 bg-white border border-gray-300 text-gray-500 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                        : 'bg-white border border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button 
              className="flex items-center px-3 py-2 bg-white border border-gray-300 text-gray-500 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Payroll Import Details</h3>
              <button 
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Import ID</label>
                  <p className="text-sm text-gray-900">{selectedImport.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">File Name</label>
                  <p className="text-sm text-gray-900">{selectedImport.fileName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Uploaded By</label>
                  <p className="text-sm text-gray-900">{selectedImport.uploadedBy}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload Date</label>
                  <p className="text-sm text-gray-900">{selectedImport.uploadDate.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    selectedImport.status === 'completed' 
                      ? 'bg-green-100 text-green-800'
                      : selectedImport.status === 'failed'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {getStatusBadge(selectedImport.status)}
                    {selectedImport.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Records</label>
                  <p className="text-sm text-gray-900">{selectedImport.totalRecords}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Successful Records</label>
                  <p className="text-sm text-green-600">{selectedImport.successfulRecords}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Processing Time</label>
                  <p className="text-sm text-gray-900">{selectedImport.processingTime}</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button 
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-md transition-colors"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  handleDownload(selectedImport);
                  setShowDetailsModal(false);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
              >
                Download File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollHistory;
