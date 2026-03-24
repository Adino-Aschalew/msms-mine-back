import React, { useState, useCallback } from 'react';
import { Upload, Download, FileText, CheckCircle, AlertCircle, X, Users, DollarSign, Calendar, Clock, FileSpreadsheet, Database, TrendingUp, Settings } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { financeAPI } from '../../../../shared/services/financeAPI';
import Papa from 'papaparse';

const PayrollImport = () => {
  const [dragActive, setDragActive] = useState(false);
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
        successful: response.successful_employees || 0,
        failed: response.failed_employees || 0,
        data: response.payroll_details || [],
        batchId: response.batch_id
      });

      addNotification({
        type: response.failed_employees > 0 ? 'warning' : 'success',
        title: 'Payroll Import Completed',
        message: `Processed ${response.successful_employees || 0} successful, ${response.failed_employees || 0} failed records`,
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

  const resetImport = () => {
    setFile(null);
    setPreview(null);
    setResults(null);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="w-full">
        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <Upload className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Payroll Import
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Upload CSV files to process payroll data
                </p>
              </div>
            </div>
            <button
              onClick={downloadTemplate}
              className="flex items-center px-4 py-2 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Template
            </button>
          </div>
        </div>

        {!results ? (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            {!file ? (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Upload File
                </h2>
                
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive
                      ? 'border-gray-400 bg-gray-50'
                      : 'border-gray-300 bg-white hover:border-gray-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className="p-4 bg-gray-100 rounded-lg w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Upload className="h-8 w-8 text-gray-600" />
                  </div>
                  <p className="text-base font-medium text-gray-900 mb-2">
                    Drop CSV file here or{' '}
                    <label className="text-gray-600 hover:text-gray-800 cursor-pointer">
                      browse
                      <input
                        type="file"
                        accept=".csv"
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
                  <h2 className="text-lg font-medium text-gray-900">
                    File Selected
                  </h2>
                  <button
                    onClick={resetImport}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 rounded">
                      <FileText className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024).toFixed(2)} KB • CSV
                      </p>
                    </div>
                  </div>
                </div>

                {preview && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">
                      Preview ({preview.length} rows)
                    </h3>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="min-w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              {Object.keys(preview[0] || {}).map((key) => (
                                <th key={key} className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                                  {key}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {preview.slice(0, 3).map((row, index) => (
                              <tr key={index}>
                                {Object.values(row).map((value, cellIndex) => (
                                  <td key={cellIndex} className="px-3 py-2 text-xs text-gray-900">
                                    {value}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {preview.length > 3 && (
                        <div className="px-3 py-2 bg-gray-50 text-xs text-gray-500 text-center">
                          ... and {preview.length - 3} more rows
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={resetImport}
                    className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={processPayroll}
                    disabled={uploading}
                    className="px-4 py-2 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-700 disabled:opacity-50"
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
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Import Results
              </h2>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-semibold text-gray-900 mb-1">
                    {results.successful}
                  </div>
                  <div className="text-sm text-gray-600">Successful</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-semibold text-gray-900 mb-1">
                    {results.failed}
                  </div>
                  <div className="text-sm text-gray-600">Failed</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-semibold text-gray-900 mb-1">
                    {results.total}
                  </div>
                  <div className="text-sm text-gray-600">Total</div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Row</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Employee ID</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Name</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Salary</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {results.data.map((row, index) => (
                        <tr key={index}>
                          <td className="px-3 py-2 text-xs text-gray-900">{row.row}</td>
                          <td className="px-3 py-2 text-xs text-gray-900">{row['Employee ID']}</td>
                          <td className="px-3 py-2 text-xs text-gray-900">{row['Employee Name']}</td>
                          <td className="px-3 py-2 text-xs text-gray-900">${row['Salary']}</td>
                          <td className="px-3 py-2">
                            {row.valid ? (
                              <div className="flex items-center text-gray-600">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                <span className="text-xs">Success</span>
                              </div>
                            ) : (
                              <div className="flex items-center text-gray-600">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                <span className="text-xs">Failed</span>
                              </div>
                            )}
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-500">
                            {row.error || 'Processed'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={resetImport}
                className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50"
              >
                New Import
              </button>
              <button className="px-4 py-2 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-700">
                <FileText className="h-4 w-4 inline mr-2" />
                View History
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PayrollImport;
