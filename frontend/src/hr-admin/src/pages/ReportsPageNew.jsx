import { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter, 
  Search,
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  PieChart,
  FileSpreadsheet,
  Printer,
  Mail,
  Share2
} from 'lucide-react';
import { hrAPI } from '../../../shared/services/hrAPI';
import { reportsAPI } from '../../../shared/services/reportsAPI';

export default function ReportsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('last30days');
  const [reportType, setReportType] = useState('all');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportStats, setReportStats] = useState({
    total: 0,
    thisMonth: 0,
    processing: 0,
    failed: 0
  });

  useEffect(() => {
    fetchReportsData();
    fetchReportsList();
  }, []);

  const fetchReportsData = async () => {
    try {
      const response = await reportsAPI.getStats();
      if (response && response.data) {
        setReportStats({
          total: response.data.totalReports || reportStats.total,
          thisMonth: response.data.thisMonth || reportStats.thisMonth,
          processing: response.data.processing || reportStats.processing,
          failed: response.data.failed || reportStats.failed
        });
      }
    } catch (error) {
      console.error('Failed to fetch reports stats:', error);
    }
  };

  const fetchReportsList = async () => {
    try {
      setLoading(true);
      const response = await reportsAPI.getHistory(1, 100);
      if (response && response.data) {
        // Controller returns { success, data: reports, pagination }
        const historyData = Array.isArray(response.data) ? response.data
          : (response.data.reports || response.data.history || []);
        
        const formattedReports = historyData.map(report => ({
          id: report.id.toString(),
          name: report.report_name || `${report.report_type} Report`,
          type: report.report_type,
          department: 'All', 
          generatedDate: new Date(report.generation_date || report.created_at).toLocaleDateString(),
          status: report.status || 'Completed',
          size: report.file_size ? `${Math.round(report.file_size / 1024)} KB` : '142 KB',
          format: report.file_format || 'JSON'
        }));
        
        setReports(formattedReports);
      } else {
        setReports([]);
      }
    } catch (error) {
      console.error('Failed to fetch reports list:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      setIsGenerating(true);
    const typeMap = {
      'all': 'employee_summary',
      'Performance': 'employee_summary',
      'Attendance': 'employee_summary',
      'Analytics': 'financial_overview',
      'Finance': 'loan_portfolio',
      'Training': 'audit_trail'
    };
    const payloadType = typeMap[reportType] || 'financial_overview';
    await reportsAPI.generateReport(payloadType, 'json', { search: searchTerm });
      await fetchReportsList();
      await fetchReportsData();
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (report) => {
    try {
      const response = await reportsAPI.getReportById(report.id);
      const dataStr = JSON.stringify(response.data || response, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.name.replace(/\s+/g, '_')}_${report.id}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download report:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Processing': return 'bg-yellow-100 text-yellow-800';
      case 'Failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Performance': return 'bg-blue-100 text-blue-800';
      case 'Attendance': return 'bg-purple-100 text-purple-800';
      case 'Analytics': return 'bg-green-100 text-green-800';
      case 'Finance': return 'bg-orange-100 text-orange-800';
      case 'Training': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = reportType === 'all' || report.type === reportType;
    return matchesSearch && matchesType;
  });

  const quickStats = [
    {
      title: 'Total Reports',
      value: reportStats.total.toString(),
      icon: FileText,
      color: 'blue'
    },
    {
      title: 'This Month',
      value: reportStats.thisMonth.toString(),
      icon: Calendar,
      color: 'green'
    },
    {
      title: 'Processing',
      value: reportStats.processing.toString(),
      icon: Clock,
      color: 'yellow'
    },
    {
      title: 'Failed',
      value: reportStats.failed.toString(),
      icon: AlertTriangle,
      color: 'red'
    }
  ];

  const getStatColor = (color) => {
    const colors = {
      blue: 'bg-blue-500 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
      green: 'bg-green-500 text-green-600 dark:bg-green-500/10 dark:text-green-400',
      yellow: 'bg-yellow-500 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-400',
      red: 'bg-red-500 text-red-600 dark:bg-red-500/10 dark:text-red-400'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            Generate, view, and manage organizational reports
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
            <Share2 size={18} />
            <span className="hidden sm:inline">Share</span>
          </button>
          <button 
            disabled={isGenerating}
            onClick={handleGenerateReport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors shadow-sm font-medium text-sm"
          >
            {isGenerating ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <FileText size={18} />}
            <span>{isGenerating ? 'Generating...' : 'Generate Report'}</span>
          </button>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${getStatColor(stat.color)}`}>
                <stat.icon size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FileSpreadsheet className="text-green-500" size={20} />
              Generated Reports
            </h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Search reports..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <select 
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="all">All Types</option>
                <option value="Performance">Performance</option>
                <option value="Attendance">Attendance</option>
                <option value="Analytics">Analytics</option>
                <option value="Finance">Finance</option>
                <option value="Training">Training</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Report Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Generated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
              {filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{report.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{report.id}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(report.type)}`}>
                      {report.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">{report.department}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">{report.generatedDate}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.status)}`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">{report.size}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleDownload(report)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      >
                        <Download size={16} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors">
                        <Mail size={16} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors">
                        <Printer size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
