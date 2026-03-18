import React, { useState } from 'react';
import { 
  ArrowLeft,
  FileText,
  Download,
  Eye,
  Share2,
  Edit,
  Save,
  X,
  Calendar,
  User,
  FileSpreadsheet,
  FileImage,
  Filter,
  Search,
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const ReportDetail = ({ reportId, onBack }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  const [report, setReport] = useState({
    id: reportId,
    name: 'Payroll Report - March 2024',
    type: 'payroll',
    generatedDate: '2024-03-16',
    period: 'March 2024',
    format: 'PDF',
    size: '2.4 MB',
    description: 'Comprehensive payroll report including all employee contributions and tax deductions',
    status: 'completed',
    generatedBy: 'HR Department',
    approvedBy: 'John Manager',
    category: 'Financial',
    priority: 'normal',
    tags: ['payroll', 'monthly', '2024'],
    metrics: {
      totalEmployees: 45,
      totalPayroll: 285000,
      totalDeductions: 72500,
      totalSavings: 14250,
      averageSalary: 6333,
      processingTime: '2 hours 15 minutes'
    },
    charts: [
      {
        id: 1,
        type: 'bar',
        title: 'Department-wise Payroll Distribution',
        data: [
          { name: 'Engineering', value: 125000 },
          { name: 'Marketing', value: 75000 },
          { name: 'Sales', value: 60000 },
          { name: 'Operations', value: 25000 }
        ]
      },
      {
        id: 2,
        type: 'pie',
        title: 'Deduction Breakdown',
        data: [
          { name: 'Taxes', value: 42750 },
          { name: 'Insurance', value: 14250 },
          { name: 'Retirement', value: 8500 },
          { name: 'Other', value: 7000 }
        ]
      }
    ],
    schedule: {
      frequency: 'monthly',
      nextRun: '2024-04-15',
      recipients: ['manager@company.com', 'hr@company.com'],
      autoGenerate: true
    }
  });

  const [formData, setFormData] = useState({ ...report });

  const handleSave = () => {
    setReport({ ...formData });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({ ...report });
    setIsEditing(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      case 'processing':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'failed':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getFormatIcon = (format) => {
    switch (format.toLowerCase()) {
      case 'pdf':
        return <FileText className="h-4 w-4" />;
      case 'excel':
      case 'xlsx':
        return <FileSpreadsheet className="h-4 w-4" />;
      case 'png':
      case 'jpg':
        return <FileImage className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {report.name}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                Report ID: {report.id}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit
              </button>
              <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2">
                <Share2 className="h-4 w-4" />
                Share
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
                <Download className="h-4 w-4" />
                Download
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="flex space-x-8">
          {['overview', 'metrics', 'charts', 'schedule'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Report Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400">Format</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getFormatIcon(report.format)}
                    <span className="text-lg font-bold text-blue-900 dark:text-blue-100">
                      {report.format}
                    </span>
                  </div>
                </div>
                <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400">File Size</p>
                  <p className="text-lg font-bold text-green-900 dark:text-green-100">
                    {report.size}
                  </p>
                </div>
                <FileSpreadsheet className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 dark:text-purple-400">Period</p>
                  <p className="text-lg font-bold text-purple-900 dark:text-purple-100">
                    {report.period}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">Generated</p>
                  <p className="text-lg font-bold text-yellow-900 dark:text-yellow-100">
                    {report.generatedDate}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>

          {/* Report Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Report Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Report Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">{report.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Type
                  </label>
                  {isEditing ? (
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="payroll">Payroll</option>
                      <option value="expense">Expense</option>
                      <option value="profit-loss">Profit & Loss</option>
                      <option value="budget">Budget</option>
                      <option value="analytics">Analytics</option>
                    </select>
                  ) : (
                    <p className="text-gray-900 dark:text-white capitalize">{report.type}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">{report.category}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">People Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Generated By
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.generatedBy}
                      onChange={(e) => setFormData({ ...formData, generatedBy: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">{report.generatedBy}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Approved By
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.approvedBy}
                      onChange={(e) => setFormData({ ...formData, approvedBy: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">{report.approvedBy}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Priority
                  </label>
                  {isEditing ? (
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  ) : (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      report.priority === 'urgent' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                      report.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' :
                      report.priority === 'low' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400' :
                      'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                    }`}>
                      {report.priority.charAt(0).toUpperCase() + report.priority.slice(1)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Description</h3>
            {isEditing ? (
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            ) : (
              <p className="text-gray-900 dark:text-white">{report.description}</p>
            )}
          </div>

          {/* Tags */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {report.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300 rounded-full text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'metrics' && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Key Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400">Total Employees</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {report.metrics.totalEmployees}
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400">Total Payroll</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    ${report.metrics.totalPayroll.toLocaleString()}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">Average Salary</p>
                  <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                    ${report.metrics.averageSalary.toLocaleString()}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600 dark:text-red-400">Total Deductions</p>
                  <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                    ${report.metrics.totalDeductions.toLocaleString()}
                  </p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 dark:text-purple-400">Total Savings</p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    ${report.metrics.totalSavings.toLocaleString()}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Processing Time</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {report.metrics.processingTime}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'charts' && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Visualizations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {report.charts.map((chart) => (
              <div key={chart.id} className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
                  {chart.title}
                </h4>
                <div className="space-y-2">
                  {chart.data.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300">{item.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              chart.type === 'bar' ? 'bg-blue-500' : 'bg-green-500'
                            }`}
                            style={{ 
                              width: `${(item.value / Math.max(...chart.data.map(d => d.value))) * 100}%` 
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white min-w-[60px] text-right">
                          ${item.value.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'schedule' && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Schedule Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Frequency
                </label>
                {isEditing ? (
                  <select
                    value={formData.schedule.frequency}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      schedule: { ...formData.schedule, frequency: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                ) : (
                  <p className="text-gray-900 dark:text-white capitalize">{report.schedule.frequency}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Next Run Date
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    value={formData.schedule.nextRun}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      schedule: { ...formData.schedule, nextRun: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">{report.schedule.nextRun}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Auto Generate
                </label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.schedule.autoGenerate}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      schedule: { ...formData.schedule, autoGenerate: e.target.checked }
                    })}
                    disabled={!isEditing}
                    className="mr-2"
                  />
                  <span className="text-gray-900 dark:text-white">
                    {report.schedule.autoGenerate ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Recipients
                </label>
                {isEditing ? (
                  <textarea
                    value={formData.schedule.recipients.join(', ')}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      schedule: { 
                        ...formData.schedule, 
                        recipients: e.target.value.split(',').map(r => r.trim()).filter(r => r)
                      }
                    })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                ) : (
                  <div className="space-y-1">
                    {report.schedule.recipients.map((recipient, index) => (
                      <p key={index} className="text-gray-900 dark:text-white">{recipient}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportDetail;
