import React, { useState, useEffect } from 'react';
import { committeeAPI } from '../services/committeeAPI';
import LoanChart from '../components/charts/LoanChart';
import {
  Download,
  Calendar,
  Filter,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Building2,
  ChevronDown,
  FileText,
  BarChart3,
  PieChart,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  RefreshCw,
  Loader2,
  Target,
  Award,
  CreditCard,
  Clock,
  Shield,
  AlertCircle,
  CheckCircle2,
  X,
  Printer,
  Share2
} from 'lucide-react';
import { exportReport } from '../utils/exportUtils';

const ReportsAnalytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedYear, setSelectedYear] = useState('2024');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedLoanType, setSelectedLoanType] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const periods = [
    { value: 'month', label: 'Monthly', icon: Calendar },
    { value: 'quarter', label: 'Quarterly', icon: BarChart3 },
    { value: 'year', label: 'Yearly', icon: Activity }
  ];

  const years = ['2024', '2023', '2022', '2021', '2020'];

  const departments = [
    { value: 'all', label: 'All Departments' },
    { value: 'engineering', label: 'Engineering' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'sales', label: 'Sales' },
    { value: 'hr', label: 'HR' },
    { value: 'finance', label: 'Finance' },
    { value: 'operations', label: 'Operations' }
  ];

  const loanTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'personal', label: 'Personal' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'education', label: 'Education' },
    { value: 'housing', label: 'Housing' },
    { value: 'vehicle', label: 'Vehicle' }
  ];

  const [reportsData, setReportsData] = useState(null);

  useEffect(() => {
    fetchReportsData();
  }, [selectedPeriod, selectedYear, selectedDepartment, selectedLoanType]);

  const fetchReportsData = async () => {
    try {
      setLoading(true);
      const res = await committeeAPI.getReportsData();
      if (res && res.data) {
        setReportsData(res.data);
      }
    } catch (error) {
      console.error('Error fetching reports data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchReportsData();
    setTimeout(() => setRefreshing(false), 500);
  };

  // Calculate trend direction
  const getTrendDirection = (current, previous) => {
    if (!previous || previous === 0) return 'neutral';
    const change = ((current - previous) / previous) * 100;
    return change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';
  };

  
  const monthlyDistributionData = {
    labels: reportsData?.trends?.map(t => t.label) || [],
    datasets: [
      {
        label: 'Loan Requests',
        data: reportsData?.trends?.map(t => t.total_requests) || [],
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
      },
      {
        label: 'Approved Loans',
        data: reportsData?.trends?.map(t => t.approved_loans) || [],
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 2,
      }
    ]
  };

  const yearlyDistributionData = {
    labels: reportsData?.yearlyDistribution?.map(y => y.label) || [],
    datasets: [
      {
        label: 'Total Loans',
        data: reportsData?.yearlyDistribution?.map(y => y.total_loans) || [],
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
      }
    ]
  };

  const loanRequestRateData = {
    labels: reportsData?.trends?.map(t => t.label) || [],
    datasets: [
      {
        label: 'Request Rate',
        data: reportsData?.trends?.map(t => t.request_rate) || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      }
    ]
  };

  const approvalRateData = {
    labels: reportsData?.trends?.map(t => t.label) || [],
    datasets: [
      {
        label: 'Approval Rate (%)',
        data: reportsData?.trends?.map(t => t.approval_rate) || [],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: true,
      }
    ]
  };

  const departmentDistributionData = {
    labels: reportsData?.departmentDistribution?.map(d => d.department) || [],
    datasets: [
      {
        data: reportsData?.departmentDistribution?.map(d => d.count) || [],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
        ],
      }
    ]
  };

  const calculateSizeDist = () => {
    if (!reportsData?.sizeDistribution) return { labels: [], dataset: [] };
    const order = ['< 5K', '5K-10K', '10K-20K', '20K-50K', '> 50K'];
    const distMap = { '< 5K': 0, '5K-10K': 0, '10K-20K': 0, '20K-50K': 0, '> 50K': 0 };
    let total = 0;
    reportsData.sizeDistribution.forEach(d => { distMap[d.category] = d.count; total += d.count; });
    return { labels: order, dataset: order.map(k => total > 0 ? Math.round((distMap[k] / total) * 100) : 0) };
  };

  const sizeDistCalculated = calculateSizeDist();

  const calculateRepaymentPerformance = () => {
    const data = reportsData?.repaymentPerformanceData || [];
    if (data.length === 0) return [];
    
    const total = data.reduce((sum, item) => sum + item.count, 0);
    
    return data.map(item => ({
      label: item.category,
      value: total > 0 ? `${Math.round((item.count / total) * 100)}%` : '0%',
      count: `${item.count} loans`,
      color: item.category === 'On Time' ? 'bg-green-500' : 
             item.category === 'Late' ? 'bg-amber-500' : 
             item.category === 'Default' ? 'bg-red-500' : 'bg-gray-500',
      textColor: item.category === 'On Time' ? 'text-green-600' : 
                item.category === 'Late' ? 'text-amber-600' : 
                item.category === 'Default' ? 'text-red-600' : 'text-gray-600'
    }));
  };

  const repaymentPerformanceStats = calculateRepaymentPerformance();

  const loanSizeDistributionData = {
    labels: sizeDistCalculated.labels,
    datasets: [
      {
        data: sizeDistCalculated.dataset,
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
      }
    ]
  };

  const repaymentPerformanceData = {
    labels: reportsData?.repaymentPerformanceData?.map(r => r.category) || [],
    datasets: [
      {
        data: reportsData?.repaymentPerformanceData?.map(r => r.count) || [],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(107, 114, 128, 0.8)',
        ],
      }
    ]
  };

  // Summary stats with calculated trends
  const summaryStats = [
    {
      title: 'Total Loans',
      value: reportsData?.summaryStats?.total_loans_year || '0',
      subtitle: 'Active this year',
      change: reportsData?.summaryStats?.total_loans_change || '+0%',
      changeType: reportsData?.summaryStats?.total_loans_change_type || 'positive',
      icon: FileText,
      color: 'blue',
      trend: 'up'
    },
    {
      title: 'Portfolio Value',
      value: `ETB ${(parseFloat(reportsData?.summaryStats?.total_portfolio || 0)).toLocaleString()}`,
      subtitle: 'Total outstanding',
      change: reportsData?.summaryStats?.portfolio_change || '+0%',
      changeType: reportsData?.summaryStats?.portfolio_change_type || 'positive',
      icon: DollarSign,
      color: 'green',
      trend: 'up'
    },
    {
      title: 'Avg Loan Size',
      value: `ETB ${(parseFloat(reportsData?.summaryStats?.avg_loan_size || 0)).toLocaleString()}`,
      subtitle: 'Per application',
      change: reportsData?.summaryStats?.avg_loan_change || '+0%',
      changeType: reportsData?.summaryStats?.avg_loan_change_type || 'positive',
      icon: CreditCard,
      color: 'amber',
      trend: 'down'
    },
    {
      title: 'Approval Rate',
      value: `${parseFloat(reportsData?.summaryStats?.approval_rate || 0).toFixed(1)}%`,
      subtitle: 'Success rate',
      change: reportsData?.summaryStats?.approval_change || '+0%',
      changeType: reportsData?.summaryStats?.approval_change_type || 'positive',
      icon: CheckCircle2,
      color: 'purple',
      trend: 'up'
    }
  ];

  const topBorrowers = reportsData?.topBorrowers?.map(tb => ({
    name: tb.name,
    department: tb.department || 'Unknown',
    totalLoans: tb.totalLoans,
    totalAmount: tb.totalAmount,
    avatar: tb.name.charAt(0).toUpperCase()
  })) || [];

  const guarantorExposure = reportsData?.guarantorExposure || [];

  const handleExport = (format) => {
    try {
      console.log(`Exporting report as ${format}`);
      
      // Prepare comprehensive report data using dynamic data
      const exportData = {
        generatedAt: new Date().toISOString(),
        reportType: 'Analytics Dashboard',
        filters: {
          period: selectedPeriod,
          year: selectedYear,
          department: selectedDepartment,
          loanType: selectedLoanType
        },
        overview: reportsData?.overview || {
          totalLoans: 0,
          approvedLoans: 0,
          rejectedLoans: 0,
          pendingLoans: 0,
          totalAmount: 0,
          averageLoanAmount: 0,
          approvalRate: 0,
          repaymentRate: 0
        },
        departmentStats: reportsData?.departmentStats || [],
        loanTypes: reportsData?.loanTypes || [],
        topGuarantors: reportsData?.topGuarantors || [],
        monthlyTrends: reportsData?.monthlyTrends || [],
        exportTimestamp: new Date().toISOString()
      };

      // Export based on format
      if (format === 'csv') {
        const filename = `analytics-report-${new Date().toISOString().split('T')[0]}`;
        exportReport(exportData, filename, 'csv');
        console.log('Analytics report exported as CSV');
      } else if (format === 'excel') {
        // For now, export as CSV with a note that Excel format is coming soon
        const filename = `analytics-report-${new Date().toISOString().split('T')[0]}`;
        exportReport(exportData, filename, 'csv');
        console.log('Analytics report exported as CSV (Excel format coming soon)');
      } else if (format === 'pdf') {
        // For now, export as text with a note that PDF format is coming soon
        const filename = `analytics-report-${new Date().toISOString().split('T')[0]}`;
        exportReport(exportData, filename, 'txt');
        console.log('Analytics report exported as text (PDF format coming soon)');
      }

    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Failed to export report. Please try again.');
    }
  };

  const getTrendIcon = (trend) => {
    if (trend === 'up') return <ArrowUpRight className="w-4 h-4" />;
    if (trend === 'down') return <ArrowDownRight className="w-4 h-4" />;
    return <TrendingUp className="w-4 h-4" />;
  };

  const getTrendColor = (trend, changeType) => {
    if (changeType === 'positive') return 'text-green-600';
    if (changeType === 'negative') return 'text-red-600';
    return 'text-gray-600';
  };

  const getStatCardColor = (color) => {
    const colors = {
      blue: { bg: 'bg-blue-50', icon: 'text-blue-600', border: 'border-blue-200' },
      green: { bg: 'bg-green-50', icon: 'text-green-600', border: 'border-green-200' },
      amber: { bg: 'bg-amber-50', icon: 'text-amber-600', border: 'border-amber-200' },
      purple: { bg: 'bg-purple-50', icon: 'text-purple-600', border: 'border-purple-200' },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Modern Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
                <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Reports & Analytics</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Comprehensive loan system insights</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <div className="relative group">
                <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <button onClick={() => handleExport('csv')} className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-t-xl">Export as CSV</button>
                  <button onClick={() => handleExport('excel')} className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700">Export as Excel</button>
                  <button onClick={() => handleExport('pdf')} className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-b-xl">Export as PDF</button>
                </div>
              </div>
              <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <Printer className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Modern Filters Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Period Selector */}
            <div className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-700 rounded-lg p-1">
              {periods.map((period) => {
                const Icon = period.icon;
                return (
                  <button
                    key={period.value}
                    onClick={() => setSelectedPeriod(period.value)}
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      selectedPeriod === period.value
                        ? 'bg-white dark:bg-gray-600 text-blue-600 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{period.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex-1 flex flex-col sm:flex-row gap-3">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
              >
                {years.map(year => <option key={year} value={year}>{year}</option>)}
              </select>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center justify-center space-x-2 px-4 py-2 border rounded-lg transition-colors ${
                  showFilters
                    ? 'border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                <ChevronDown className={`w-4 h-4 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                >
                  {departments.map(dept => <option key={dept.value} value={dept.value}>{dept.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Loan Type</label>
                <select
                  value={selectedLoanType}
                  onChange={(e) => setSelectedLoanType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                >
                  {loanTypes.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12">
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Loading analytics data...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Modern Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {summaryStats.map((stat, index) => {
                const Icon = stat.icon;
                const colors = getStatCardColor(stat.color);
                
                return (
                  <div
                    key={index}
                    className={`bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border-l-4 ${colors.border} hover:shadow-md transition-shadow cursor-pointer`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stat.value}</p>
                        <div className={`flex items-center mt-2 ${getTrendColor(stat.trend, stat.changeType)}`}>
                          {getTrendIcon(stat.trend)}
                          <span className="text-sm font-medium ml-1">{stat.change}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">vs last period</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stat.subtitle}</p>
                      </div>
                      <div className={`p-3 rounded-xl ${colors.bg}`}>
                        <Icon className={`w-6 h-6 ${colors.icon}`} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Loan Distribution Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Loan Distribution</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Requests vs Approvals over time</p>
                  </div>
                  <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
                <div className="h-72">
                  <LoanChart type="bar" data={monthlyDistributionData} />
                </div>
              </div>

              {/* Approval Rate Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Approval Rate Trend</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Success rate over time</p>
                  </div>
                  <div className="flex items-center space-x-2 text-green-600">
                    <TrendingUp className="w-5 h-5" />
                    <span className="text-sm font-medium">+2.4%</span>
                  </div>
                </div>
                <div className="h-72">
                  <LoanChart type="line" data={approvalRateData} />
                </div>
              </div>

              {/* Department Distribution */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Department Distribution</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Loans by department</p>
                  </div>
                </div>
                <div className="h-72">
                  <LoanChart type="doughnut" data={departmentDistributionData} />
                </div>
              </div>

              {/* Loan Size Distribution */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Loan Size Distribution</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Percentage by loan amount</p>
                  </div>
                </div>
                <div className="h-72">
                  <LoanChart type="pie" data={loanSizeDistributionData} />
                </div>
              </div>
            </div>

            {/* Tables Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Top Borrowers Table */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Top Borrowers</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Highest loan volumes</p>
                  </div>
                  <Award className="w-5 h-5 text-amber-500" />
                </div>
                <div className="space-y-3">
                  {topBorrowers.map((borrower, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {borrower.avatar}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{borrower.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{borrower.department}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">ETB {borrower.totalAmount.toLocaleString()}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{borrower.totalLoans} loans</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Guarantor Exposure Table */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Guarantor Exposure</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Risk assessment</p>
                  </div>
                  <Shield className="w-5 h-5 text-blue-500" />
                </div>
                <div className="space-y-3">
                  {guarantorExposure.map((guarantor, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                          guarantor.riskLevel === 'low' ? 'bg-green-100 text-green-600' :
                          guarantor.riskLevel === 'medium' ? 'bg-amber-100 text-amber-600' :
                          'bg-red-100 text-red-600'
                        }`}>
                          {guarantor.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{guarantor.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{guarantor.department}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">ETB {guarantor.guaranteedAmount.toLocaleString()}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{guarantor.activeGuarantees} guarantees</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Repayment Performance */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Repayment Performance</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Loan repayment status distribution</p>
                </div>
                <div className="flex items-center space-x-4">
                  {repaymentPerformanceStats.slice(0, 2).map((item) => (
                    <div key={item.label} className="flex items-center space-x-2">
                      <div className={`w-3 h-3 ${item.color} rounded-full`}></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{item.label} ({item.value})</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 h-64">
                  <LoanChart type="doughnut" data={repaymentPerformanceData} />
                </div>
                <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                  {repaymentPerformanceStats.map((item, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className={`w-3 h-3 ${item.color} rounded-full`}></div>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.label}</span>
                      </div>
                      <p className={`text-2xl font-bold ${item.textColor}`}>{item.value}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{item.count}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Summary Footer */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center md:text-left">
                  <p className="text-blue-100 text-sm">Total Disbursed</p>
                  <p className="text-2xl font-bold">ETB {((parseFloat(reportsData?.summaryStats?.total_disbursed || 0) / 1000000).toFixed(1))}M</p>
                </div>
                <div className="text-center md:text-left">
                  <p className="text-blue-100 text-sm">Active Loans</p>
                  <p className="text-2xl font-bold">{reportsData?.summaryStats?.active_loans || 0}</p>
                </div>
                <div className="text-center md:text-left">
                  <p className="text-blue-100 text-sm">Repayment Rate</p>
                  <p className="text-2xl font-bold">{(parseFloat(reportsData?.summaryStats?.repayment_rate || 0)).toFixed(1)}%</p>
                </div>
                <div className="text-center md:text-left">
                  <p className="text-blue-100 text-sm">Avg Processing Time</p>
                  <p className="text-2xl font-bold">{(parseFloat(reportsData?.summaryStats?.avg_processing_time || 0)).toFixed(1)} days</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ReportsAnalytics;
