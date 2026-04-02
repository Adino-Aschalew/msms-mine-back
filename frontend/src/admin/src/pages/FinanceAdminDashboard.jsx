import React, { useState } from 'react';
import { 
  Users,
  UserPlus,
  DollarSign,
  TrendingUp,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Activity,
  Settings,
  Eye,
  Download,
  Calendar,
  Filter,
  Search,
  BarChart3,
  PieChart,
  TrendingDown,
  Briefcase,
  Building,
  CreditCard,
  Target,
  Award
} from 'lucide-react';
import KPICard from '../components/widgets/KPICard';
import AdminActivityPanel from '../components/common/AdminActivityPanel';

const FinanceAdminDashboard = () => {
  const [dateRange, setDateRange] = useState('30days');
  const [searchQuery, setSearchQuery] = useState('');

  
  const adminKpiData = [
    {
      title: 'Total Finance Users',
      value: '247',
      change: '+18.2%',
      changeType: 'increase',
      icon: Users,
      color: 'blue',
      trend: [180, 195, 210, 225, 240, 235, 247]
    },
    {
      title: 'Pending Approvals',
      value: '23',
      change: '-12.5%',
      changeType: 'decrease',
      icon: Clock,
      color: 'yellow',
      trend: [35, 32, 30, 28, 26, 25, 23]
    },
    {
      title: 'Monthly Transactions',
      value: '1,847',
      change: '+24.3%',
      changeType: 'increase',
      icon: CreditCard,
      color: 'green',
      trend: [1200, 1350, 1400, 1550, 1650, 1750, 1847]
    },
    {
      title: 'Active Payroll Cycles',
      value: '12',
      change: '+8.7%',
      changeType: 'increase',
      icon: Briefcase,
      color: 'purple',
      trend: [8, 9, 10, 10, 11, 11, 12]
    },
    {
      title: 'Budget Utilization',
      value: '74.2%',
      change: '+5.1%',
      changeType: 'increase',
      icon: Target,
      color: 'orange',
      trend: [65, 68, 70, 71, 72, 73, 74.2]
    },
    {
      title: 'Compliance Score',
      value: '96.8%',
      change: '+2.3%',
      changeType: 'increase',
      icon: Award,
      color: 'green',
      trend: [92, 93, 94, 95, 95.5, 96, 96.8]
    }
  ];

  
  const adminActivities = [
    {
      type: 'admin_added',
      text: 'New finance admin added: Sarah Johnson',
      time: '2 hours ago'
    },
    {
      type: 'settings_updated',
      text: 'Payroll settings updated for Q2 2024',
      time: '4 hours ago'
    },
    {
      type: 'user_deleted',
      text: 'Employee account removed: Mike Davis',
      time: '6 hours ago'
    },
    {
      type: 'admin_added',
      text: 'Budget approval completed for Marketing department',
      time: '8 hours ago'
    },
    {
      type: 'settings_updated',
      text: 'Tax rates updated for new fiscal year',
      time: '12 hours ago'
    }
  ];

  
  const pendingApprovals = [
    {
      id: 'APP001',
      type: 'Payroll',
      description: 'March 2024 Payroll Processing',
      amount: '$285,000',
      requestedBy: 'HR Department',
      requestedAt: '2024-03-15 09:30',
      priority: 'high'
    },
    {
      id: 'APP002',
      type: 'Budget',
      description: 'Q2 Marketing Budget Increase',
      amount: '$50,000',
      requestedBy: 'Marketing Manager',
      requestedAt: '2024-03-15 10:15',
      priority: 'medium'
    },
    {
      id: 'APP003',
      type: 'Expense',
      description: 'Office Equipment Purchase',
      amount: '$12,500',
      requestedBy: 'Operations',
      requestedAt: '2024-03-15 11:00',
      priority: 'low'
    }
  ];

  
  const departmentPerformance = [
    {
      name: 'Engineering',
      budget: '$500,000',
      spent: '$425,000',
      utilization: '85%',
      efficiency: '92%',
      trend: 'up'
    },
    {
      name: 'Marketing',
      budget: '$150,000',
      spent: '$142,000',
      utilization: '95%',
      efficiency: '88%',
      trend: 'up'
    },
    {
      name: 'Sales',
      budget: '$200,000',
      spent: '$180,000',
      utilization: '90%',
      efficiency: '95%',
      trend: 'stable'
    },
    {
      name: 'Operations',
      budget: '$100,000',
      spent: '$95,000',
      utilization: '95%',
      efficiency: '87%',
      trend: 'down'
    }
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
    }
  };

  return (
    <div className="p-6">
      {}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Finance Admin Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage finance operations, approvals, and administrative tasks
            </p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="1year">Last Year</option>
            </select>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Report
            </button>
          </div>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {adminKpiData.map((kpi, index) => (
          <KPICard key={index} {...kpi} />
        ))}
      </div>

      {}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {}
        <div className="lg:col-span-2 space-y-6">
          {}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Pending Approvals</h2>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 rounded-full text-xs font-medium">
                    {pendingApprovals.length} Pending
                  </span>
                  <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {pendingApprovals.map((approval) => (
                  <div key={approval.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {approval.id}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(approval.priority)}`}>
                          {approval.priority}
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded-full text-xs font-medium">
                          {approval.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-900 dark:text-white mb-1">
                        {approval.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>Amount: {approval.amount}</span>
                        <span>By: {approval.requestedBy}</span>
                        <span>{approval.requestedAt}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                        Approve
                      </button>
                      <button className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm">
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Department Performance</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {departmentPerformance.map((dept, index) => (
                  <div key={index} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Building className="h-5 w-5 text-gray-400" />
                        <span className="font-medium text-gray-900 dark:text-white">{dept.name}</span>
                        {getTrendIcon(dept.trend)}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Efficiency:</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{dept.efficiency}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Budget:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{dept.budget}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Spent:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{dept.spent}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Utilization:</span>
                        <span className="ml-2 font-medium text-gray-900 dark:text-white">{dept.utilization}</span>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            parseInt(dept.utilization) > 90 ? 'bg-red-500' :
                            parseInt(dept.utilization) > 75 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${dept.utilization}` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                  <UserPlus className="h-6 w-6 text-blue-600 dark:text-blue-400 mb-2" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Add User</span>
                </button>
                <button className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                  <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400 mb-2" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Process Payroll</span>
                </button>
                <button className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
                  <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400 mb-2" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Generate Report</span>
                </button>
                <button className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors">
                  <Settings className="h-6 w-6 text-orange-600 dark:text-orange-400 mb-2" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Settings</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {}
        <div className="space-y-6">
          {}
          <AdminActivityPanel activities={adminActivities} />

          {}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">System Status</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Database</span>
                  </div>
                  <span className="text-sm font-medium text-green-600">Operational</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">API Services</span>
                  </div>
                  <span className="text-sm font-medium text-green-600">Running</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Backup</span>
                  </div>
                  <span className="text-sm font-medium text-yellow-600">Scheduled</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Security</span>
                  </div>
                  <span className="text-sm font-medium text-green-600">Secure</span>
                </div>
              </div>
            </div>
          </div>

          {}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Alerts</h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-900 dark:text-white">Budget limit approaching for Engineering</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">85% utilized</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-900 dark:text-white">Payroll processing completed</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">All employees paid</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-900 dark:text-white">Failed transaction detected</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Requires review</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceAdminDashboard;
