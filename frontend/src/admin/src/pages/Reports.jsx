import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext2';
import { 
  FileText, 
  Download, 
  Calendar,
  Filter,
  Search,
  ChevronDown,
  Eye,
  Edit,
  Trash2,
  Plus,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  FileDown,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { reportsAPI } from '../../../shared/services/reportsAPI';

const Reports = () => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('30days');
  const [selectedReport, setSelectedReport] = useState('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [reportStats, setReportStats] = useState({
    totalReports: 0,
    thisMonthReports: 0,
    totalDownloads: 0,
    activeUsers: 0,
    reportsChange: '+0%',
    thisMonthChange: '+0%',
    downloadsChange: '+0%',
    activeUsersChange: '+0%'
  });

  
  const fetchReportStats = async () => {
    try {
      console.log('Fetching report stats from API...');
      const stats = await reportsAPI.getStats();
      console.log('Report stats API response:', stats);
      
      // Handle different response formats
      if (stats && stats.success && stats.data) {
        console.log('Using stats.data:', stats.data);
        setReportStats(stats.data);
      } else if (stats && typeof stats === 'object' && !stats.success) {
        console.log('API returned non-success, using fallback zeros');
        // Use zero-based fallback for non-success responses
        setReportStats({
          totalReports: 0,
          thisMonthReports: 0,
          totalDownloads: 0,
          activeUsers: 0,
          reportsChange: '0%',
          thisMonthChange: '0%',
          downloadsChange: '0%',
          activeUsersChange: '0%'
        });
      } else if (stats && typeof stats === 'object') {
        console.log('Using stats object directly:', stats);
        setReportStats(stats);
      } else {
        console.error('Unexpected stats format:', stats);
        // Set zero-based fallback
        setReportStats({
          totalReports: 0,
          thisMonthReports: 0,
          totalDownloads: 0,
          activeUsers: 0,
          reportsChange: '0%',
          thisMonthChange: '0%',
          downloadsChange: '0%',
          activeUsersChange: '0%'
        });
      }
    } catch (error) {
      console.error('Error fetching report stats:', error);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      
      // Set zero-based fallback on error
      setReportStats({
        totalReports: 0,
        thisMonthReports: 0,
        totalDownloads: 0,
        activeUsers: 0,
        reportsChange: '0%',
        thisMonthChange: '0%',
        downloadsChange: '0%',
        activeUsersChange: '0%'
      });
      setNotification({ type: 'error', message: 'Failed to fetch report statistics' });
    }
  };

  
  const fetchReports = async () => {
    try {
      setLoading(true);
      console.log('Fetching reports with filters:', { selectedReport, selectedPeriod, searchQuery });
      
      const filters = {
        type: selectedReport,
        period: selectedPeriod,
        search: searchQuery
      };
      
      const reportsData = await reportsAPI.getReports(filters);
      console.log('Reports API response:', reportsData);
      console.log('Response type:', typeof reportsData);
      console.log('Response success:', reportsData?.success);
      console.log('Response data:', reportsData?.data);
      
      // Handle different response formats
      if (reportsData && reportsData.success && reportsData.data) {
        console.log('Using reports.data, count:', reportsData.data.length);
        setReports(reportsData.data);
      } else if (reportsData && Array.isArray(reportsData)) {
        console.log('Using reports array directly, count:', reportsData.length);
        setReports(reportsData);
      } else if (reportsData && typeof reportsData === 'object' && !reportsData.success) {
        console.log('API returned non-success for reports, using empty array');
        setReports([]);
      } else if (reportsData && typeof reportsData === 'object') {
        console.log('Using reports object directly:', reportsData);
        setReports(Array.isArray(reportsData) ? reportsData : []);
      } else {
        console.error('Unexpected reports format:', reportsData);
        setReports([]);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      
      setReports([]);
      setNotification({ type: 'error', message: 'Failed to fetch reports' });
    } finally {
      setLoading(false);
    }
  };

  
  useEffect(() => {
    fetchReportStats();
    fetchReports();
  }, []);

  
  useEffect(() => {
    fetchReports();
  }, [selectedReport, selectedPeriod, searchQuery]);

  const handleGenerateReport = async () => {
    if (selectedReport === 'all') {
      setNotification({ type: 'error', message: 'Please select a specific report type' });
      return;
    }

    try {
      setIsGenerating(true);
      setNotification({ type: 'info', message: 'Generating report...' });
      
      await reportsAPI.generateReport(selectedReport, 'json');
      
      
      await fetchReports();
      await fetchReportStats();
      
      setIsGenerating(false);
      setNotification({ type: 'success', message: 'Report generated successfully!' });
      
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error('Error generating report:', error);
      setIsGenerating(false);
      setNotification({ type: 'error', message: 'Failed to generate report' });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleExportAll = () => {
    setIsExporting(true);
    setNotification({ type: 'info', message: 'Exporting all reports...' });
    
    setTimeout(() => {
      
      const csvContent = reports.map(report => 
        `${report.title},${report.type},${report.date},${report.status},${report.generated_by},${report.size},${report.downloads}`
      ).join('\n');
      
      
      const blob = new Blob([`Report Name,Type,Date,Status,Generated By,Size,Downloads\n${csvContent}`], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reports-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      setIsExporting(false);
      setNotification({ type: 'success', message: 'Reports exported successfully!' });
      
      setTimeout(() => setNotification(null), 3000);
    }, 1500);
  };

  const handleExportSingle = (report) => {
    setNotification({ type: 'info', message: `Exporting ${report.title}...` });
    
    setTimeout(() => {
      const csvContent = `${report.title},${report.type},${report.date},${report.status},${report.generated_by},${report.size},${report.downloads}`;
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.title.replace(/\s+/g, '-').toLowerCase()}-${report.date}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      setNotification({ type: 'success', message: 'Report exported successfully!' });
      setTimeout(() => setNotification(null), 3000);
    }, 1000);
  };

  const handleDeleteReport = async (reportId) => {
    try {
      await reportsAPI.deleteReport(reportId);
      setReports(reports.filter(r => r.id !== reportId));
      await fetchReportStats();
      setNotification({ type: 'success', message: 'Report deleted successfully!' });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error('Error deleting report:', error);
      setNotification({ type: 'error', message: 'Failed to delete report' });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const statsData = [
    {
      title: 'Total Reports',
      value: reportStats.totalReports.toString(),
      change: reportStats.reportsChange,
      icon: <FileText className="h-6 w-6" />,
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
    },
    {
      title: 'This Month',
      value: reportStats.thisMonthReports.toString(),
      change: reportStats.thisMonthChange,
      icon: <Calendar className="h-6 w-6" />,
      color: 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
    },
    {
      title: 'Downloads',
      value: reportStats.totalDownloads.toString(),
      change: reportStats.downloadsChange,
      icon: <Download className="h-6 w-6" />,
      color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'
    },
    {
      title: 'Active Users',
      value: reportStats.activeUsers.toString(),
      change: reportStats.activeUsersChange,
      icon: <Users className="h-6 w-6" />,
      color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getReportTypeIcon = (type) => {
    switch (type) {
      case 'user-activity':
        return <Users className="h-5 w-5 text-blue-500" />;
      case 'security':
        return <BarChart3 className="h-5 w-5 text-red-500" />;
      case 'performance':
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'access':
        return <FileText className="h-5 w-5 text-purple-500" />;
      case 'health':
        return <BarChart3 className="h-5 w-5 text-orange-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 w-full">
      <div className="w-full max-w-full px-4 py-8">
        {}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Reports</h1>
          <p className="text-gray-600 dark:text-gray-400">Generate and manage system reports and analytics.</p>
        </div>

        {}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-8">
          {statsData.map((stat, index) => (
            <div key={index} className="card p-6 transition-all hover:shadow-lg w-full">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  <div className={`flex items-center mt-2 ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change.startsWith('+') ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    <span className="ml-2 text-sm font-medium">{stat.change}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">from last month</span>
                  </div>
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center flex-wrap">
              {}
              <div className="relative flex-shrink-0">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white w-full sm:w-64"
                />
              </div>

              {}
              <div className="relative flex-shrink-0">
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="appearance-none pl-10 pr-10 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white w-full sm:w-50"
                >
                  <option value="7days">Last 7 Days</option>
                  <option value="30days">Last 30 Days</option>
                  <option value="90days">Last 90 Days</option>
                  <option value="year">Last Year</option>
                </select>
                <Calendar className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <ChevronDown className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              {}
              <div className="relative flex-shrink-0">
                <select
                  value={selectedReport}
                  onChange={(e) => setSelectedReport(e.target.value)}
                  className="appearance-none pl-10 pr-10 py-2 border border-gray-300 rounded-lg  focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white w-full sm:w-50"
                >
                  <option value="all">All Reports</option>
                  <option value="loan_portfolio">Loan Portfolio</option>
                  <option value="savings_summary">Savings Summary</option>
                  <option value="financial_overview">Financial Overview</option>
                  <option value="employee_summary">Employee Summary</option>
                  <option value="transaction_history">Transaction History</option>
                  <option value="audit_trail">Audit Trail</option>
                  <option value="risk_assessment">Risk Assessment</option>
                </select>
                <Filter className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <ChevronDown className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {}
            <div className="flex gap-3 flex-shrink-0">
              <button 
                onClick={handleGenerateReport}
                disabled={isGenerating}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  isGenerating 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400' 
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                }`}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Generate Report
                  </>
                )}
              </button>
              
              <button 
                onClick={handleExportAll}
                disabled={isExporting}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  isExporting 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400' 
                    : 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                }`}
              >
                {isExporting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <FileDown className="h-4 w-4" />
                    Export All Reports
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border transition-all duration-300 transform ${
            notification.type === 'success' 
              ? 'bg-green-100 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200'
              : notification.type === 'error'
              ? 'bg-red-100 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200'
              : 'bg-blue-100 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200'
          }`}>
            <div className="flex items-center gap-3">
              {notification.type === 'success' ? (
                <CheckCircle className="h-5 w-5" />
              ) : notification.type === 'error' ? (
                <AlertCircle className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
              <p className="font-medium">{notification.message}</p>
            </div>
          </div>
        )}

        {}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600 dark:text-gray-400">Loading reports...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
                <table className="w-full min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Report Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Generated By</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Size</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Downloads</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {reports.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                          No reports found. Generate your first report to get started.
                        </td>
                      </tr>
                    ) : (
                      reports.map((report) => (
                        <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              {getReportTypeIcon(report.type)}
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">{report.title}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">ID: #{report.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900 dark:text-white capitalize">{report.type.replace('-', ' ')}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900 dark:text-white">{report.date}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}>
                              {report.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900 dark:text-white">{report.generated_by}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900 dark:text-white">{report.size}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900 dark:text-white">{report.downloads}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => console.log('View report:', report.title)}
                                className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200 hover:scale-105"
                                title="View Report"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => handleExportSingle(report)}
                                className="p-2 text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20 rounded-lg transition-all duration-200 hover:scale-105"
                                title="Export Report"
                              >
                                <FileDown className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => {
                                  if (window.confirm(`Are you sure you want to delete "${report.title}"?`)) {
                                    handleDeleteReport(report.id);
                                  }
                                }}
                                className="p-2 text-yellow-600 hover:bg-yellow-50 dark:text-yellow-400 dark:hover:bg-yellow-900/20 rounded-lg transition-all duration-200 hover:scale-105"
                                title="Delete Report"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
