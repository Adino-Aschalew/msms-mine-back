import React, { useState, useRef } from 'react';
import { 
  Upload,
  Download,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  DollarSign,
  Calendar,
  TrendingUp,
  FileSpreadsheet,
  ChevronRight,
  ChevronDown,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';

const FinancePayrollImport = () => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, success, error
  const [validationResults, setValidationResults] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const fileInputRef = useRef(null);

  // Mock payroll data template
  const payrollTemplate = [
    ['Employee ID', 'Employee Name', 'Salary', 'Savings Contribution', 'Tax', 'Net Pay', 'Payroll Date'],
    ['EMP001', 'John Smith', '5000', '500', '750', '3750', '2024-03-15'],
    ['EMP002', 'Sarah Johnson', '6000', '600', '900', '4500', '2024-03-15'],
    ['EMP003', 'Mike Davis', '4500', '450', '675', '3375', '2024-03-15']
  ];

  // Mock employee database
  const employeeDatabase = [
    { id: 'EMP001', name: 'John Smith', currentSavings: 12500 },
    { id: 'EMP002', name: 'Sarah Johnson', currentSavings: 18750 },
    { id: 'EMP003', name: 'Mike Davis', currentSavings: 8900 },
    { id: 'EMP004', name: 'Emily Chen', currentSavings: 15600 },
    { id: 'EMP005', name: 'David Wilson', currentSavings: 22100 }
  ];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (file) => {
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
      setUploadStatus('idle');
      setValidationResults(null);
    } else {
      alert('Please upload a CSV file');
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const validateAndProcessPayroll = async () => {
    if (!selectedFile) return;

    setUploadStatus('uploading');

    // Simulate file processing
    setTimeout(() => {
      // Mock validation results
      const mockValidationResults = {
        totalRecords: 150,
        successful: 147,
        failed: 3,
        failedRecords: [
          { row: 45, error: 'Employee ID not found', data: { employeeId: 'EMP999', name: 'Invalid Employee' } },
          { row: 89, error: 'Invalid salary amount', data: { employeeId: 'EMP002', salary: 'invalid' } },
          { row: 123, error: 'Invalid payroll date', data: { employeeId: 'EMP003', date: '2024-13-45' } }
        ],
        processedRecords: [
          { employeeId: 'EMP001', name: 'John Smith', previousSavings: 12500, newSavings: 13000, contribution: 500 },
          { employeeId: 'EMP002', name: 'Sarah Johnson', previousSavings: 18750, newSavings: 19350, contribution: 600 },
          { employeeId: 'EMP003', name: 'Mike Davis', previousSavings: 8900, newSavings: 9350, contribution: 450 }
        ]
      };

      setValidationResults(mockValidationResults);
      setUploadStatus('success');
    }, 2000);
  };

  const downloadTemplate = () => {
    const csvContent = payrollTemplate.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'payroll_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadErrorReport = () => {
    if (!validationResults) return;

    const errorHeaders = ['Row Number', 'Error', 'Employee ID', 'Employee Name', 'Salary', 'Savings', 'Tax', 'Net Pay', 'Payroll Date'];
    const errorRows = validationResults.failedRecords.map(record => [
      record.row,
      record.error,
      record.data.employeeId || '',
      record.data.name || '',
      record.data.salary || '',
      record.data.savings || '',
      record.data.tax || '',
      record.data.netPay || '',
      record.data.date || ''
    ]);

    const csvContent = [errorHeaders, ...errorRows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'payroll_import_errors.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setUploadStatus('idle');
    setValidationResults(null);
    setShowDetails(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Import Payroll</h1>
          <p className="text-gray-600 dark:text-gray-400">Upload CSV files to process payroll and update employee savings</p>
        </div>
        <button
          onClick={downloadTemplate}
          className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <Download className="h-4 w-4" />
          Download Template
        </button>
      </div>

      {/* Upload Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-8 dark:bg-gray-800 dark:border-gray-700">
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                dragActive
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center">
                <div className={`p-4 rounded-full mb-4 ${
                  dragActive ? 'bg-blue-100 dark:bg-blue-900/20' : 'bg-gray-100 dark:bg-gray-700'
                }`}>
                  <Upload className={`h-8 w-8 ${
                    dragActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'
                  }`} />
                </div>
                
                {selectedFile ? (
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                    <div className="flex items-center gap-2">
                      {uploadStatus === 'success' && (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm">Upload successful</span>
                        </div>
                      )}
                      {uploadStatus === 'error' && (
                        <div className="flex items-center gap-1 text-red-600">
                          <XCircle className="h-4 w-4" />
                          <span className="text-sm">Upload failed</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      Drop your CSV file here, or{' '}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        browse
                      </button>
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Supports CSV files up to 10MB
                    </p>
                  </div>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>

            {selectedFile && (
              <div className="mt-6 flex items-center gap-4">
                <button
                  onClick={validateAndProcessPayroll}
                  disabled={uploadStatus === 'uploading'}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 rounded-lg text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadStatus === 'uploading' ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className="h-4 w-4" />
                      Process Payroll
                    </>
                  )}
                </button>
                <button
                  onClick={resetUpload}
                  className="px-6 py-3 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Import Instructions</h3>
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">1.</span>
                <span>Download the CSV template and fill it with your payroll data</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">2.</span>
                <span>Ensure all Employee IDs exist in the system</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">3.</span>
                <span>Validate salary and contribution amounts are positive numbers</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">4.</span>
                <span>Use valid date format (YYYY-MM-DD)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">5.</span>
                <span>Upload the CSV file for processing</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Required Columns</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Employee ID</span>
                <span className="text-red-500">*</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Employee Name</span>
                <span className="text-red-500">*</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Salary</span>
                <span className="text-red-500">*</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Savings Contribution</span>
                <span className="text-red-500">*</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Tax</span>
                <span className="text-red-500">*</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Net Pay</span>
                <span className="text-red-500">*</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Payroll Date</span>
                <span className="text-red-500">*</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Validation Results */}
      {validationResults && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Records</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{validationResults.totalRecords}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg dark:bg-blue-900/20">
                  <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Successful</p>
                  <p className="text-2xl font-bold text-green-600">{validationResults.successful}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg dark:bg-green-900/20">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Failed</p>
                  <p className="text-2xl font-bold text-red-600">{validationResults.failed}</p>
                </div>
                <div className="bg-red-100 p-3 rounded-lg dark:bg-red-900/20">
                  <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Success Rate</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {((validationResults.successful / validationResults.totalRecords) * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg dark:bg-blue-900/20">
                  <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Failed Records */}
          {validationResults.failed.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Failed Records</h3>
                  <button
                    onClick={downloadErrorReport}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 rounded-lg text-sm font-medium text-white hover:bg-red-600"
                  >
                    <Download className="h-4 w-4" />
                    Download Error Report
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                        Row
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                        Error
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                        Employee ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {validationResults.failedRecords.map((record, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {record.row}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                            {record.error}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {record.data.employeeId || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {JSON.stringify(record.data)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Successful Records */}
          {validationResults.processedRecords.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Processed Records</h3>
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    {showDetails ? 'Hide' : 'Show'} Details
                  </button>
                </div>
              </div>
              
              {showDetails && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                          Employee
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                          Previous Savings
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                          Contribution
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                          New Savings
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {validationResults.processedRecords.map((record, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {record.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {record.employeeId}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                            ${record.previousSavings.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                            +${record.contribution.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-bold">
                            ${record.newSavings.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                              Updated
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FinancePayrollImport;
