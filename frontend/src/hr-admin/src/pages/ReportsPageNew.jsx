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

export default function ReportsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('last30days');
  const [reportType, setReportType] = useState('all');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
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
      // Fetch real reports data from backend
      const response = await hrAPI.getReportsData('payroll');
      console.log('Reports data:', response.data);
    } catch (error) {
      console.error('Failed to fetch reports data:', error);
    }
  };

  const fetchReportsList = async () => {
    try {
      // Mock reports list for now - this can be enhanced later with real backend data
      const mockReports = [
        {
          id: 'RPT-001',
          name: 'Monthly Performance Report',
          type: 'Performance',
          department: 'All',
          generatedDate: '2026-03-15',
          status: 'Completed',
          size: '2.4 MB',
          format: 'PDF'
        },
        {
          id: 'RPT-002',
          name: 'Employee Attendance Summary',
          type: 'Attendance',
          department: 'All',
          generatedDate: '2026-03-14',
          status: 'Completed',
          size: '1.8 MB',
          format: 'Excel'
        },
        {
          id: 'RPT-003',
          name: 'Q1 Department Analytics',
          type: 'Analytics',
          department: 'Engineering',
          generatedDate: '2026-03-13',
          status: 'Processing',
          size: '-',
          format: 'PDF'
        },
        {
          id: 'RPT-004',
          name: 'Salary Structure Analysis',
          type: 'Finance',
          department: 'All',
          generatedDate: '2026-03-12',
          status: 'Completed',
          size: '3.1 MB',
          format: 'PDF'
        },
        {
          id: 'RPT-005',
          name: 'Training Completion Report',
          type: 'Training',
          department: 'HR',
          generatedDate: '2026-03-11',
          status: 'Completed',
          size: '1.2 MB',
          format: 'Excel'
        }
      ];
      
      setReports(mockReports);
      setReportStats({
        total: mockReports.length,
        thisMonth: mockReports.filter(r => r.status === 'Completed').length,
        processing: mockReports.filter(r => r.status === 'Processing').length,
        failed: mockReports.filter(r => r.status === 'Failed').length
      });
    } catch (error) {
      console.error('Failed to fetch reports list:', error);
    } finally {
      setLoading(false);
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
      {/* Header */}
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
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm font-medium text-sm">
            <FileText size={18} />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {/* Quick Stats */}
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

      {/* Report Generation Section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <FileText className="text-blue-500" size={20} />
          Quick Report Generation
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-left">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Users className="text-blue-600 dark:text-blue-400" size={20} />
              </div>
              <span className="font-medium text-gray-900 dark:text-white">Employee Report</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Complete employee overview</p>
          </button>
          
          <button className="p-4 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-left">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <TrendingUp className="text-green-600 dark:text-green-400" size={20} />
              </div>
              <span className="font-medium text-gray-900 dark:text-white">Performance</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Performance metrics</p>
          </button>
          
          <button className="p-4 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-left">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <DollarSign className="text-purple-600 dark:text-purple-400" size={20} />
              </div>
              <span className="font-medium text-gray-900 dark:text-white">Financial</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Salary & compensation</p>
          </button>
          
          <button className="p-4 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-left">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Calendar className="text-orange-600 dark:text-orange-400" size={20} />
              </div>
              <span className="font-medium text-gray-900 dark:text-white">Attendance</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Attendance records</p>
          </button>
        </div>
      </div>

      {/* Reports Table */}
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
                      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
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

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="text-blue-500" size={20} />
              Report Generation Trends
            </h2>
            <select className="px-3 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700">
              Last 6 Months
            </select>
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-slate-700 rounded-lg">
            <div className="text-center">
              <BarChart3 className="mx-auto text-gray-400 mb-2" size={48} />
              <p className="text-gray-500 dark:text-gray-400">Report generation trends chart</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <PieChart className="text-green-500" size={20} />
              Report Types Distribution
            </h2>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View Details
            </button>
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-slate-700 rounded-lg">
            <div className="text-center">
              <PieChart className="mx-auto text-gray-400 mb-2" size={48} />
              <p className="text-gray-500 dark:text-gray-400">Report types breakdown</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
