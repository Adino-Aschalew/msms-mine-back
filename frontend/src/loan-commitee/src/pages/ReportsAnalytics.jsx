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
  FileText
} from 'lucide-react';

const ReportsAnalytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedYear, setSelectedYear] = useState('2024');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedLoanType, setSelectedLoanType] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const periods = [
    { value: 'month', label: 'Monthly' },
    { value: 'quarter', label: 'Quarterly' },
    { value: 'year', label: 'Yearly' }
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
  const [loading, setLoading] = useState(true);

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

  
  const monthlyDistributionData = {
    labels: reportsData?.trends?.map(t => t.label) || ['Jan', 'Feb', 'Mar'],
    datasets: [
      {
        label: 'Loan Requests',
        data: reportsData?.trends?.map(t => t.total_requests) || [0,0,0],
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
      },
      {
        label: 'Approved Loans',
        data: reportsData?.trends?.map(t => t.approved_loans) || [0,0,0],
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 2,
      }
    ]
  };

  const yearlyDistributionData = {
    labels: reportsData?.yearlyDistribution?.map(y => y.label) || ['2023', '2024'],
    datasets: [
      {
        label: 'Total Loans',
        data: reportsData?.yearlyDistribution?.map(y => y.total_loans) || [0, 0],
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
      }
    ]
  };

  const loanRequestRateData = {
    labels: reportsData?.trends?.map(t => t.label) || ['Jan', 'Feb', 'Mar'],
    datasets: [
      {
        label: 'Request Rate',
        data: reportsData?.trends?.map(t => t.request_rate) || [0,0,0],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      }
    ]
  };

  const approvalRateData = {
    labels: reportsData?.trends?.map(t => t.label) || ['Jan', 'Feb', 'Mar'],
    datasets: [
      {
        label: 'Approval Rate (%)',
        data: reportsData?.trends?.map(t => t.approval_rate) || [0,0,0],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: true,
      }
    ]
  };

  const departmentDistributionData = {
    labels: reportsData?.departmentDistribution?.map(d => d.department) || ['Engineering', 'Marketing'],
    datasets: [
      {
        data: reportsData?.departmentDistribution?.map(d => d.count) || [0,0],
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
    const order = ['< $5K', '$5K-$10K', '$10K-$20K', '$20K-$50K', '> $50K'];
    const distMap = { '< $5K': 0, '$5K-$10K': 0, '$10K-$20K': 0, '$20K-$50K': 0, '> $50K': 0 };
    let total = 0;
    reportsData.sizeDistribution.forEach(d => { distMap[d.category] = d.count; total += d.count; });
    return { labels: order, dataset: order.map(k => total > 0 ? Math.round((distMap[k] / total) * 100) : 0) };
  };

  const sizeDistCalculated = calculateSizeDist();

  const loanSizeDistributionData = {
    labels: sizeDistCalculated.labels,
    datasets: [
      {
        data: sizeDistCalculated.dataset.length > 0 ? sizeDistCalculated.dataset : [0,0,0,0,0],
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
    labels: reportsData?.repaymentPerformanceData?.map(r => r.category) || ['On Time', 'Late', 'Default'],
    datasets: [
      {
        data: reportsData?.repaymentPerformanceData?.map(r => r.count) || [0,0,0],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(107, 114, 128, 0.8)',
        ],
      }
    ]
  };

  
  const summaryStats = [
    {
      title: 'Total Loans This Year',
      value: reportsData?.summaryStats?.total_loans_year || '0',
      change: 'Active',
      changeType: 'neutral',
      icon: <FileText className="w-6 h-6" />,
      color: 'primary'
    },
    {
      title: 'Total Portfolio Value',
      value: `$${(parseFloat(reportsData?.summaryStats?.total_portfolio || 0)).toLocaleString()}`,
      change: 'Tracked',
      changeType: 'neutral',
      icon: <DollarSign className="w-6 h-6" />,
      color: 'success'
    },
    {
      title: 'Average Loan Size',
      value: `$${(parseFloat(reportsData?.summaryStats?.avg_loan_size || 0)).toLocaleString()}`,
      change: 'Calculated',
      changeType: 'neutral',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'warning'
    },
    {
      title: 'Approval Rate',
      value: `${parseFloat(reportsData?.summaryStats?.approval_rate || 0).toFixed(1)}%`,
      change: 'Calculated',
      changeType: 'neutral',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'success'
    }
  ];

  
  const topBorrowers = reportsData?.topBorrowers?.map(tb => ({
    name: tb.name,
    department: tb.department || 'Unknown',
    totalLoans: tb.totalLoans,
    totalAmount: tb.totalAmount
  })) || [];

  
  const guarantorExposure = [
    { name: 'Jane Smith', department: 'Marketing', guaranteedAmount: 25000, activeGuarantees: 2 },
    { name: 'Mike Johnson', department: 'Sales', guaranteedAmount: 30000, activeGuarantees: 3 }
  ];

  const handleExport = (format) => {
    console.log(`Exporting report as ${format}`);
    
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Reports & Analytics</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">Comprehensive loan system analytics and reporting</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => handleExport('csv')}
                className="btn btn-secondary"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </button>
          <button
            onClick={() => handleExport('excel')}
            className="btn btn-secondary"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="btn btn-secondary"
          >
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </button>
        </div>
      </div>
      </div>
      </div>

      {}
      <div className="px-4 sm:px-6 py-6">
        <div className="space-y-6">

      {}
      <div className="card p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex items-center space-x-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="input w-auto"
            >
              {periods.map(period => (
                <option key={period.value} value={period.value}>{period.label}</option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="input w-auto"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-secondary"
          >
            <Filter className="w-4 h-4 mr-2" />
            Advanced Filters
            <ChevronDown className={`w-4 h-4 ml-2 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Department
                </label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="input"
                >
                  {departments.map(dept => (
                    <option key={dept.value} value={dept.value}>{dept.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Loan Type
                </label>
                <select
                  value={selectedLoanType}
                  onChange={(e) => setSelectedLoanType(e.target.value)}
                  className="input"
                >
                  {loanTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryStats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stat.value}</p>
                <div className={`flex items-center mt-2 ${
                  stat.changeType === 'increase' ? 'text-success-600' : 'text-danger-600'
                }`}>
                  {stat.changeType === 'increase' ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span className="text-sm font-medium ml-1">{stat.change}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">vs last year</span>
                </div>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                stat.color === 'primary' ? 'bg-primary-100 text-primary-600' :
                stat.color === 'success' ? 'bg-success-100 text-success-600' :
                stat.color === 'warning' ? 'bg-warning-100 text-warning-600' :
                'bg-gray-100 text-gray-600'
              }`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {selectedPeriod === 'month' ? 'Monthly' : 'Yearly'} Loan Distribution
          </h3>
          <div className="h-64">
            <LoanChart 
              type={selectedPeriod === 'month' ? 'bar' : 'line'} 
              data={selectedPeriod === 'month' ? monthlyDistributionData : yearlyDistributionData} 
            />
          </div>
        </div>

        {}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Loan Request Rate
          </h3>
          <div className="h-64">
            <LoanChart type="line" data={loanRequestRateData} />
          </div>
        </div>

        {}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Approval Rate Trend
          </h3>
          <div className="h-64">
            <LoanChart type="line" data={approvalRateData} />
          </div>
        </div>

        {}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Loan Distribution by Department
          </h3>
          <div className="h-64">
            <LoanChart type="doughnut" data={departmentDistributionData} />
          </div>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Loan Size Distribution
          </h3>
          <div className="h-48">
            <LoanChart type="pie" data={loanSizeDistributionData} />
          </div>
        </div>

        {}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Top Borrowers
          </h3>
          <div className="space-y-3">
            {topBorrowers.map((borrower, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {borrower.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {borrower.department}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    ${borrower.totalAmount.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {borrower.totalLoans} loans
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Guarantor Exposure
          </h3>
          <div className="space-y-3">
            {guarantorExposure.map((guarantor, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {guarantor.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {guarantor.department}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    ${guarantor.guaranteedAmount.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {guarantor.activeGuarantees} active
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Repayment Performance
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64">
            <LoanChart type="doughnut" data={repaymentPerformanceData} />
          </div>
          <div className="flex flex-col justify-center space-y-3">
            {repaymentPerformanceData.labels.map((label, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: repaymentPerformanceData.datasets[0].backgroundColor[index] }}
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {repaymentPerformanceData.datasets[0].data[index]}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    </div>
    </div>

  );
};

export default ReportsAnalytics;
