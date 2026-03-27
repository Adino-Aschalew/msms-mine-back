import { useState, useEffect } from 'react';
import { 
  Target, 
  TrendingUp, 
  Users, 
  Calendar, 
  Award, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  BarChart3, 
  PieChart, 
  Activity,
  Plus,
  Search,
  Filter,
  Download,
  Edit,
  Eye,
  Star,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal
} from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line, Pie, Bar } from 'react-chartjs-2';
import ScheduleReviewModal from '../components/Performance/ScheduleReviewModal';
import { useTheme } from '../contexts/ThemeContext';
import { hrAPI } from '../../../shared/services/hrAPI';

export default function PerformancePage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  const [performanceReviews, setPerformanceReviews] = useState([]);
  const [kpiData, setKpiData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Register Chart.js components once
  useEffect(() => {
    ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, reviewsRes] = await Promise.all([
        hrAPI.getPerformanceStats(),
        hrAPI.getPerformanceReviews(1, 100)
      ]);
      
      const r_data = Array.isArray(reviewsRes) ? reviewsRes : (reviewsRes?.data || []);
      setPerformanceReviews(r_data);
      
      const s_data = statsRes?.data || {};
      
      setKpiData([
        {
          title: 'Overall Performance',
          value: s_data.average_score ? s_data.average_score.toFixed(1) + '%' : '0%',
          change: '+0%',
          trend: 'up',
          icon: Target,
          color: 'blue',
          description: 'Company-wide average'
        },
        {
          title: 'Total Reviews',
          value: (s_data.total_reviews || 0).toString(),
          change: '+0',
          trend: 'up',
          icon: Target,
          color: 'purple',
          description: 'All time'
        },
        {
          title: 'Completed',
          value: (s_data.completed_reviews || 0).toString(),
          change: '+0',
          trend: 'up',
          icon: CheckCircle,
          color: 'green',
          description: 'Successfully finished'
        },
        {
          title: 'Pending',
          value: (s_data.pending_reviews || 0).toString(),
          change: '-0',
          trend: 'down',
          icon: AlertTriangle,
          color: 'orange',
          description: 'Awaiting action'
        }
      ]);
    } catch (err) {
      console.error('Failed to fetch performance data', err);
    } finally {
      setLoading(false);
    }
  };

  // Chart data for performance trends
  const performanceTrendsData = {
    labels: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
    datasets: [
      {
        label: 'Engineering',
        data: [85, 87, 86, 88, 90, 92],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Sales',
        data: [78, 80, 82, 81, 85, 88],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Marketing',
        data: [82, 84, 83, 87, 89, 95],
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'HR',
        data: [75, 77, 76, 78, 80, 80],
        borderColor: 'rgb(139, 92, 246)',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  // Chart data for department performance
  const departmentPerformanceData = {
    labels: ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations'],
    datasets: [{
      label: 'Average Performance Score',
      data: [92, 88, 95, 80, 85, 87],
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(236, 72, 153, 0.8)',
        'rgba(34, 197, 94, 0.8)'
      ],
      borderColor: [
        'rgb(59, 130, 246)',
        'rgb(16, 185, 129)',
        'rgb(245, 158, 11)',
        'rgb(139, 92, 246)',
        'rgb(236, 72, 153)',
        'rgb(34, 197, 94)'
      ],
      borderWidth: 2
    }]
  };

  // Chart options for dark/light theme
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: isDark ? '#e5e7eb' : '#374151',
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: isDark ? '#1f2937' : '#ffffff',
        titleColor: isDark ? '#e5e7eb' : '#111827',
        bodyColor: isDark ? '#e5e7eb' : '#111827',
        borderColor: isDark ? '#374151' : '#e5e7eb'
      }
    },
    scales: {
      x: {
        grid: {
          color: isDark ? '#374151' : '#e5e7eb'
        },
        ticks: {
          color: isDark ? '#9ca3af' : '#6b7280'
        }
      },
      y: {
        grid: {
          color: isDark ? '#374151' : '#e5e7eb'
        },
        ticks: {
          color: isDark ? '#9ca3af' : '#6b7280'
        }
      }
    }
  };

  const barChartOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: isDark ? '#9ca3af' : '#6b7280'
        }
      },
      y: {
        grid: {
          color: isDark ? '#374151' : '#e5e7eb'
        },
        ticks: {
          color: isDark ? '#9ca3af' : '#6b7280'
        },
        beginAtZero: true,
        max: 100
      }
    }
  };

  const handleScheduleReview = (data) => {
    console.log('New review scheduled:', data);
  };

  // Dynamic data fetched from hrAPI

  const getKpiColor = (color) => {
    const colors = {
      blue: 'bg-blue-500 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
      green: 'bg-green-500 text-green-600 dark:bg-green-500/10 dark:text-green-400',
      purple: 'bg-purple-500 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400',
      orange: 'bg-orange-500 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400'
    };
    return colors[color] || colors.blue;
  };

  const getTrendColor = (trend) => {
    return trend === 'up' ? 'text-green-600' : 'text-red-600';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 80) return 'bg-blue-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const filteredReviews = performanceReviews.filter(review => {
    const matchesSearch = review.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === 'all' || review.department === departmentFilter;
    const matchesStatus = statusFilter === 'all' || review.status === statusFilter;
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Performance Management</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            Track employee performance, reviews, and organizational KPIs
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
            <Download size={18} />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button 
            onClick={() => setIsScheduleOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm font-medium text-sm"
          >
            <Plus size={18} />
            <span>Schedule Review</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi, index) => (
          <div key={index} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{kpi.title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{kpi.value}</p>
                <div className="flex items-center mt-2">
                  <span className={`text-sm font-medium ${getTrendColor(kpi.trend)}`}>
                    {kpi.change}
                  </span>
                  {kpi.trend === 'up' ? (
                    <ArrowUpRight className="ml-1 text-green-600" size={16} />
                  ) : (
                    <ArrowDownRight className="ml-1 text-red-600" size={16} />
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{kpi.description}</p>
              </div>
              <div className={`p-3 rounded-lg ${getKpiColor(kpi.color)}`}>
                <kpi.icon size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Performance Reviews Section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Activity className="text-blue-500" size={20} />
              Performance Reviews
            </h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Search reviews..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <select 
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="all">All Departments</option>
                <option value="Engineering">Engineering</option>
                <option value="Sales">Sales</option>
                <option value="Marketing">Marketing</option>
                <option value="HR">HR</option>
              </select>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="Completed">Completed</option>
                <option value="In Progress">In Progress</option>
                <option value="Pending">Pending</option>
                <option value="Overdue">Overdue</option>
              </select>
              <div className="flex items-center border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'text-gray-400'}`}
                >
                  <BarChart3 size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'text-gray-400'}`}
                >
                  <Activity size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Grid View */}
        {viewMode === 'grid' ? (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredReviews.map((review) => (
                <div key={review.id} className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-6 border border-gray-200 dark:border-slate-600 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                        {review.employeeName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{review.employeeName}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{review.employeeId}</p>
                      </div>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(review.status)}`}>
                      {review.status}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Department</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{review.department}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Review Type</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{review.reviewType}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Review Date</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{review.reviewDate}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Reviewer</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{review.reviewer}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Performance Score</span>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={16}
                              className={star <= Math.round(review.score / 20) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{review.score}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-slate-600">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Next: {review.nextReview}
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                        <Eye size={16} />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-green-600 transition-colors">
                        <Edit size={16} />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* List View */
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Review Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Review Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                {filteredReviews.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                          {review.employeeName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{review.employeeName}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{review.employeeId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">{review.department}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">{review.reviewType}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(review.status)}`}>
                        {review.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex mr-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={14}
                              className={star <= Math.round(review.score / 20) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{review.score}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">{review.reviewDate}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                          <Eye size={16} />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors">
                          <Edit size={16} />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg transition-colors">
                          <MoreHorizontal size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Performance Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="text-blue-500" size={20} />
              Monthly Progress Bars
            </h2>
            <select className="px-3 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700">
              Last 6 Months
            </select>
          </div>
          <div className="h-64">
            <Bar 
              key="performance-bars"
              data={{
                labels: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
                datasets: [
                  {
                    label: 'Engineering',
                    data: [85, 87, 86, 88, 90, 92],
                    backgroundColor: 'rgba(59, 130, 246, 0.8)',
                    borderColor: 'rgb(59, 130, 246)',
                    borderWidth: 2,
                    borderRadius: 8,
                    barThickness: 40
                  },
                  {
                    label: 'Sales',
                    data: [78, 80, 82, 81, 85, 88],
                    backgroundColor: 'rgba(16, 185, 129, 0.8)',
                    borderColor: 'rgb(16, 185, 129)',
                    borderWidth: 2,
                    borderRadius: 8,
                    barThickness: 40
                  },
                  {
                    label: 'Marketing',
                    data: [82, 84, 83, 87, 89, 95],
                    backgroundColor: 'rgba(245, 158, 11, 0.8)',
                    borderColor: 'rgb(245, 158, 11)',
                    borderWidth: 2,
                    borderRadius: 8,
                    barThickness: 40
                  }
                ]
              }} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                    labels: {
                      color: isDark ? '#e5e7eb' : '#374151',
                      font: {
                        size: 12
                      },
                      padding: 15
                    }
                  },
                  tooltip: {
                    backgroundColor: isDark ? '#1f2937' : '#ffffff',
                    titleColor: isDark ? '#e5e7eb' : '#111827',
                    bodyColor: isDark ? '#e5e7eb' : '#111827',
                    borderColor: isDark ? '#374151' : '#e5e7eb',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: true,
                    callbacks: {
                      label: function(context) {
                        return context.dataset.label + ': ' + context.parsed.y + '%';
                      }
                    }
                  }
                },
                scales: {
                  x: {
                    grid: {
                      display: false
                    },
                    ticks: {
                      color: isDark ? '#9ca3af' : '#6b7280',
                      font: {
                        size: 12,
                        weight: '500'
                      }
                    },
                    title: {
                      display: true,
                      text: 'Months',
                      color: isDark ? '#e5e7eb' : '#374151',
                      font: {
                        size: 14,
                        weight: 'bold'
                      }
                    }
                  },
                  y: {
                    grid: {
                      color: isDark ? '#374151' : '#e5e7eb',
                      drawBorder: false
                    },
                    ticks: {
                      color: isDark ? '#9ca3af' : '#6b7280',
                      font: {
                        size: 12
                      },
                      callback: function(value) {
                        return value + '%';
                      }
                    },
                    title: {
                      display: true,
                      text: 'Performance Score',
                      color: isDark ? '#e5e7eb' : '#374151',
                      font: {
                        size: 14,
                        weight: 'bold'
                      }
                    },
                    beginAtZero: true,
                    max: 100
                  }
                },
                animation: {
                  duration: 1000,
                  easing: 'easeInOutQuart'
                }
              }} 
            />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <PieChart className="text-green-500" size={20} />
              Department Performance
            </h2>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View Details
            </button>
          </div>
          <div className="h-64">
            <Pie 
              key="department-pie"
              data={departmentPerformanceData} 
              options={chartOptions} 
            />
          </div>
        </div>
      </div>

      {/* Schedule Review Modal */}
      <ScheduleReviewModal 
        isOpen={isScheduleOpen} 
        onClose={() => setIsScheduleOpen(false)} 
        onSchedule={handleScheduleReview}
      />
    </div>
  );
}
