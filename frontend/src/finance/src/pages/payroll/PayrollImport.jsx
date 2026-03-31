import React, { useState, useCallback, useRef } from 'react';
import { Upload, Download, FileText, CheckCircle, AlertCircle, X, Users, DollarSign, Calendar, Clock, FileSpreadsheet, Database, TrendingUp, Settings } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { financeAPI } from '../../../../shared/services/financeAPI';
import Papa from 'papaparse';

const PayrollImport = () => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [results, setResults] = useState(null);
  const { addNotification } = useNotifications();

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFile = (uploadedFile) => {
    const allowedTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    
    if (!allowedTypes.includes(uploadedFile.type)) {
      addNotification({
        type: 'error',
        title: 'Invalid File Type',
        message: 'Please upload a CSV or Excel file',
      });
      return;
    }

    setFile(uploadedFile);
    
    // Parse CSV/Excel for preview
    if (uploadedFile.type === 'text/csv') {
      Papa.parse(uploadedFile, {
        header: true,
        complete: (results) => {
          setPreview(results.data);
        },
        error: (error) => {
          addNotification({
            type: 'error',
            title: 'Parse Error',
            message: 'Failed to parse CSV file',
          });
        },
      });
    } else {
      // For Excel files, we'll show file info and let backend handle parsing
      setPreview([{ 'Employee ID': 'Will be parsed by backend', 'Gross Salary': 'Will be parsed by backend', 'Net Salary': 'Will be parsed by backend' }]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        'Employee ID': 'EMP034',
        'Gross Salary': '50000',
        'Savings Deduction': '5000',
        'Loan Deduction': '2000',
        'Net Salary': '43000'
      }
    ];

    const csv = Papa.unparse(template);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'payroll_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const processPayroll = async () => {
    if (!file) return;

    setUploading(true);
    
    try {
      const response = await financeAPI.uploadPayroll(file);
      
      setResults({
        total: response.total_employees || 0,
        amount: response.total_amount || 0,
        batchId: response.batch_id,
        status: response.status,
        data: response.payroll_details || [],
        summary: response.summary || null
      });

      const isValidationError = response.success === false;
      const hasErrors = response.errors && response.errors.length > 0;

      addNotification({
        type: isValidationError ? 'error' : (hasErrors ? 'warning' : 'success'),
        title: isValidationError ? 'Validation Failed' : 'Payroll Uploaded',
        message: isValidationError 
          ? (response.message || `Found ${response.errors.length} validation errors.`)
          : (hasErrors 
              ? `Uploaded with ${response.errors.length} validation errors.` 
              : 'Payroll uploaded and ready for validation.'),
      });

    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Upload Failed',
        message: error.message || 'Failed to upload payroll file',
      });
    } finally {
      setUploading(false);
    }
  };

  const validatePayroll = async () => {
    if (!results?.batchId) return;
    setUploading(true);
    try {
      const response = await financeAPI.validatePayroll(results.batchId);
      setResults(prev => ({ ...prev, status: 'VALIDATED' }));
      addNotification({ type: 'success', title: 'Validated', message: 'Payroll batch validated successfully.' });
    } catch (error) {
      addNotification({ type: 'error', title: 'Validation Failed', message: error.message });
    } finally {
      setUploading(false);
    }
  };

  const approvePayroll = async () => {
    if (!results?.batchId) return;
    setUploading(true);
    try {
      await financeAPI.approvePayroll(results.batchId);
      setResults(prev => ({ ...prev, status: 'CONFIRMED' }));
      addNotification({ type: 'success', title: 'Approved', message: 'Payroll batch approved for processing.' });
    } catch (error) {
      addNotification({ type: 'error', title: 'Approval Failed', message: error.message });
    } finally {
      setUploading(false);
    }
  };

  const resetImport = () => {
    setFile(null);
    setPreview(null);
    setResults(null);
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-slate-900 min-h-screen">
      <div className="w-full">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <Upload className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Payroll Import
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Upload CSV files to process payroll data
                </p>
              </div>
            </div>
            <button
              onClick={downloadTemplate}
              className="flex items-center px-4 py-2 bg-gray-800 dark:bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600"
            >
              <Download className="h-4 w-4 mr-2" />
              Template
            </button>
          </div>
        </div>

        {!results ? (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            {!file ? (
              <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Upload File
                </h2>
                
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    dragActive
                      ? 'border-gray-400 dark:border-gray-500 bg-gray-50 dark:bg-gray-700/50'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Upload className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                  </div>
                  <p className="text-base font-medium text-gray-900 dark:text-white mb-2">
                    Drop CSV file here or{' '}
                    <label className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 cursor-pointer">
                      browse
                      <input
                        type="file"
                        accept=".csv"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </p>
                  <p className="text-sm text-gray-500">
                    CSV files only, max 10MB
                  </p>
                  
                  <div className="flex items-center justify-center space-x-6 mt-6 text-xs text-gray-500">
                    <div className="flex items-center">
                      <FileSpreadsheet className="h-4 w-4 mr-1" />
                      CSV Format
                    </div>
                    <div className="flex items-center">
                      <Database className="h-4 w-4 mr-1" />
                      Auto Validation
                    </div>
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      Quick Processing
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                    File Selected
                  </h2>
                  <button
                    onClick={resetImport}
                    className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
                      <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {(file.size / 1024).toFixed(2)} KB • CSV
                      </p>
                    </div>
                  </div>
                </div>

                {preview && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                      Preview ({preview.length} rows)
                    </h3>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="min-w-full">
                          <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                              {Object.keys(preview[0] || {}).map((key) => (
                                <th key={key} className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                                  {key}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {preview.slice(0, 3).map((row, index) => (
                              <tr key={index}>
                                {Object.values(row).map((value, cellIndex) => (
                                  <td key={cellIndex} className="px-3 py-2 text-xs text-gray-900 dark:text-gray-300">
                                    {value}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {preview.length > 3 && (
                        <div className="px-3 py-2 bg-gray-50 dark:bg-gray-900 text-xs text-gray-500 dark:text-gray-400 text-center border-t border-gray-200 dark:border-gray-700">
                          ... and {preview.length - 3} more rows
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={resetImport}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={processPayroll}
                    disabled={uploading}
                    className="px-4 py-2 bg-gray-800 dark:bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-50"
                  >
                    {uploading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Settings className="h-4 w-4 mr-2" />
                        Process
                      </div>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Results Summary */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Import Results
              </h2>
              
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">
                    {results.total}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Employees</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">
                    {results.amount.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Net Amount</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">
                    {results.status}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Current Status</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">
                    #{results.batchId}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Batch ID</div>
                </div>
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Row</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Employee ID</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Name</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Salary</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Status</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {results.data.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <td className="px-3 py-2 text-xs text-gray-900 dark:text-gray-300 font-medium">{row.row}</td>
                          <td className="px-3 py-2 text-xs text-gray-900 dark:text-gray-300">{row['Employee ID']}</td>
                          <td className="px-3 py-2 text-xs text-gray-900 dark:text-gray-300">{row['Employee Name']}</td>
                          <td className="px-3 py-2 text-xs text-gray-900 dark:text-gray-300">${row['Salary']}</td>
                          <td className="px-3 py-2">
                            {row.valid ? (
                              <div className="flex items-center text-green-600 dark:text-green-400 font-medium">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                <span className="text-xs">Success</span>
                              </div>
                            ) : (
                              <div className="flex items-center text-red-600 dark:text-red-400 font-medium">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                <span className="text-xs">Failed</span>
                              </div>
                            )}
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 italic">
                            {row.error || 'Processed'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={resetImport}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              
              {results.status === 'UPLOADED' && (
                <button
                  onClick={validatePayroll}
                  disabled={uploading}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                >
                  Validate Payroll
                </button>
              )}

              {results.status === 'VALIDATED' && (
                <button
                  onClick={approvePayroll}
                  disabled={uploading}
                  className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                >
                  Approve for Processing
                </button>
              )}

              {(results.status === 'CONFIRMED' || results.status === 'PROCESSED') && (
                <button className="px-4 py-2 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-700">
                  <FileText className="h-4 w-4 inline mr-2" />
                  View in History
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PayrollImport;
