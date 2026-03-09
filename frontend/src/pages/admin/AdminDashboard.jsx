import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Users,
  CreditCard,
  Wallet,
  FileText,
  Settings,
  Activity,
  TrendingUp,
  TrendingDown,
  UserCheck,
  Shield,
  AlertCircle,
  Menu,
  X,
  LogOut,
  Bell,
  Search,
  ChevronRight,
  Plus,
  BarChart3,
  Clock,
  CheckCircle,
  MoreVertical,
  Database,
  Server,
  HardDrive,
  Zap,
  Calendar,
  DollarSign,
  UserPlus,
  ClipboardList,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Edit,
  Trash2,
  Power,
  PowerOff,
  RefreshCw,
  Download,
  Filter,
  User,
  Mail,
  Phone,
  Building,
  Briefcase,
  MapPin,
  CalendarDays,
  AlertTriangle,
  CheckSquare
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import adminService from '../../services/adminService';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);
  const [systemStats, setSystemStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState(null);
  const [hrAdmins, setHrAdmins] = useState([]);
  const [loanCommitteeAdmins, setLoanCommitteeAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState('overview');
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  useEffect(() => {
    fetchAllData();
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [dashboardRes, healthRes, statsRes, activityRes, hrRes, loanRes] = await Promise.allSettled([
        adminService.getDashboard(),
        adminService.getSystemHealth(),
        adminService.getSystemStats(),
        adminService.getSystemActivity({ limit: 10 }),
        adminService.getHRAdmins(),
        adminService.getLoanCommitteeAdmins()
      ]);

      if (dashboardRes.status === 'fulfilled') {
        setDashboardData(dashboardRes.value);
      }
      if (healthRes.status === 'fulfilled') {
        setSystemHealth(healthRes.value);
      }
      if (statsRes.status === 'fulfilled') {
        setSystemStats(statsRes.value);
      }
      if (activityRes.status === 'fulfilled') {
        setRecentActivity(activityRes.value);
      }
      if (hrRes.status === 'fulfilled') {
        setHrAdmins(hrRes.value?.data || []);
      }
      if (loanRes.status === 'fulfilled') {
        setLoanCommitteeAdmins(loanRes.value?.data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleToggleMaintenance = async () => {
    try {
      await adminService.toggleMaintenanceMode();
      setMaintenanceMode(!maintenanceMode);
    } catch (err) {
      console.error('Failed to toggle maintenance mode:', err);
    }
  };

  const handleRefresh = () => {
    fetchAllData();
  };

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: BarChart3 },
    { name: 'HR Admins', href: '/admin/hr-admins', icon: UserCheck },
    { name: 'Loan Committee', href: '/admin/loan-committee-admins', icon: Shield },
    { name: 'System Health', href: '/admin/system/health', icon: Activity },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const isActiveRoute = (href) => location.pathname === href;

  const formatUptime = (seconds) => {
    if (!seconds) return 'N/A';
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${mins}m`;
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="font-display min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-xl shadow-teal-500/30">
              <Shield className="h-10 w-10 text-white" />
            </div>
            <div className="absolute inset-0 rounded-2xl animate-ping bg-teal-400 opacity-20"></div>
          </div>
          <div className="text-center">
            <p className="text-slate-700 font-semibold text-lg">Loading Admin Panel</p>
            <p className="text-slate-500 text-sm mt-1">Fetching dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="font-display min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border border-slate-100">
          <div className="bg-red-50 rounded-2xl p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <AlertCircle className="h-10 w-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Error Loading Dashboard</h2>
          <p className="text-slate-500 mb-8">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white px-6 py-4 rounded-2xl font-bold hover:from-teal-600 hover:to-teal-700 transition-all shadow-lg shadow-teal-500/25 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">refresh</span>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { overview } = dashboardData || {};

  const stats = [
    {
      title: 'Total Users',
      value: overview?.totalUsers || 0,
      change: '+12%',
      changeType: 'positive',
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      lightColor: 'from-blue-50 to-blue-100',
      textColor: 'text-blue-600',
      bgGradient: 'bg-gradient-to-br from-blue-500/10 to-blue-600/5'
    },
    {
      title: 'Active Loans',
      value: overview?.totalLoans || 0,
      change: '+8%',
      changeType: 'positive',
      icon: CreditCard,
      color: 'from-emerald-500 to-emerald-600',
      lightColor: 'from-emerald-50 to-emerald-100',
      textColor: 'text-emerald-600',
      bgGradient: 'bg-gradient-to-br from-emerald-500/10 to-emerald-600/5'
    },
    {
      title: 'Total Savings',
      value: `$${(overview?.totalSavings || 0).toLocaleString()}`,
      change: '+15%',
      changeType: 'positive',
      icon: Wallet,
      color: 'from-violet-500 to-violet-600',
      lightColor: 'from-violet-50 to-violet-100',
      textColor: 'text-violet-600',
      bgGradient: 'bg-gradient-to-br from-violet-500/10 to-violet-600/5'
    },
    {
      title: 'Pending',
      value: overview?.pendingApplications || 0,
      change: '-3%',
      changeType: 'negative',
      icon: FileText,
      color: 'from-amber-500 to-amber-600',
      lightColor: 'from-amber-50 to-amber-100',
      textColor: 'text-amber-600',
      bgGradient: 'bg-gradient-to-br from-amber-500/10 to-amber-600/5'
    }
  ];

  const quickActions = [
    {
      name: 'Create HR Admin',
      description: 'Add new HR administrator',
      href: '/admin/hr-admins/create',
      icon: UserPlus,
      color: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100'
    },
    {
      name: 'Loan Committee',
      description: 'Add committee member',
      href: '/admin/loan-committee-admins/create',
      icon: Shield,
      color: 'from-emerald-500 to-emerald-600',
      bgGradient: 'from-emerald-50 to-emerald-100'
    },
    {
      name: 'System Logs',
      description: 'Monitor activity',
      href: '/admin/system/logs',
      icon: ClipboardList,
      color: 'from-violet-500 to-violet-600',
      bgGradient: 'from-violet-50 to-violet-100'
    },
    {
      name: 'Settings',
      description: 'Configure system',
      href: '/admin/settings',
      icon: Settings,
      color: 'from-amber-500 to-amber-600',
      bgGradient: 'from-amber-50 to-amber-100'
    }
  ];

  return (
    <div className="font-display min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/20">
      {/* Modern Glassmorphism Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 lg:px-8">
        <div className="max-w-[1400px] mx-auto mt-4 rounded-2xl px-6 py-3 flex items-center justify-between bg-white/80 backdrop-blur-2xl border border-white/40 shadow-xl shadow-slate-200/50">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/25">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h2 className="text-slate-800 text-lg font-bold tracking-tight">Admin Panel</h2>
              <p className="text-slate-400 text-xs -mt-0.5">Management Console</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActiveRoute(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    active
                      ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/25'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Time Display */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full">
              <Clock className="h-4 w-4 text-slate-500" />
              <span className="text-sm font-semibold text-slate-700">
                {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            {/* Notifications */}
            <button className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors">
              <Bell className="h-5 w-5 text-slate-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Info */}
            <div className="hidden md:flex items-center gap-3 pl-3 border-l border-slate-200">
              <div className="text-right">
                <p className="text-slate-800 text-sm font-bold">{user?.first_name} {user?.last_name}</p>
                <p className="text-slate-500 text-xs">{user?.role}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-sm">
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </span>
              </div>
            </div>

            {/* Sign Out */}
            <button
              onClick={handleLogout}
              className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <Menu className="h-5 w-5 text-slate-700" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-slate-900 to-slate-950 transform transition-transform duration-300 ease-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-white font-bold text-lg">Admin</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActiveRoute(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  active
                    ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/25'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-4 py-3 mb-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">{user?.first_name} {user?.last_name}</p>
              <p className="text-slate-500 text-xs">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="pt-28 pb-8 px-4 lg:px-8">
        <div className="max-w-[1400px] mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-black text-slate-800 mb-2">
              Welcome back, {user?.first_name} 👋
            </h1>
            <p className="text-slate-500">Here's what's happening with your system today.</p>
          </div>

          {/* System Status Bar - Modern Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/40 shadow-xl shadow-slate-200/50 p-5 mb-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${systemHealth?.database === 'healthy' ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`}></div>
                  <span className="text-sm font-semibold text-slate-700">Database</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${systemHealth?.database === 'healthy' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {systemHealth?.database === 'healthy' ? 'Healthy' : 'Issues'}
                  </span>
                </div>
                <div className="w-px h-6 bg-slate-200 hidden sm:block"></div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Zap className="h-4 w-4 text-amber-500" />
                  <span className="font-medium">Uptime:</span>
                  <span className="text-slate-800">{formatUptime(systemHealth?.system?.uptime)}</span>
                </div>
                <div className="w-px h-6 bg-slate-200 hidden sm:block"></div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Database className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">Last backup:</span>
                  <span className="text-slate-800">2 hours ago</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full">
                <Users className="h-4 w-4 text-teal-500" />
                <span className="font-medium">{systemHealth?.system?.activeUsers || 0}</span>
                <span className="text-slate-500">active users</span>
              </div>
            </div>
          </div>

          {/* Stats Grid - Modern Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              const ChangeIcon = stat.changeType === 'positive' ? ArrowUpRight : ArrowDownRight;
              return (
                <div
                  key={index}
                  className="group bg-white/80 backdrop-blur-xl rounded-2xl border border-white/40 shadow-xl shadow-slate-200/50 p-5 hover:shadow-2xl hover:shadow-slate-300/30 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${stat.bgGradient}`}>
                      <Icon className={`h-6 w-6 ${stat.textColor}`} />
                    </div>
                    <div className={`flex items-center gap-1 text-sm font-bold ${
                      stat.changeType === 'positive' ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      <ChangeIcon className="h-4 w-4" />
                      {stat.change}
                    </div>
                  </div>
                  <div>
                    <p className="text-3xl font-black text-slate-800">{stat.value}</p>
                    <p className="text-sm text-slate-500 font-medium mt-1">{stat.title}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-8">
            {/* Quick Actions */}
            <div className="lg:col-span-2">
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/40 shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600">
                      <Zap className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-800">Quick Actions</h2>
                  </div>
                  <Link to="/admin/actions" className="text-sm font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1">
                    View all
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {quickActions.map((action, index) => {
                      const Icon = action.icon;
                      return (
                        <Link
                          key={index}
                          to={action.href}
                          className="flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-100 hover:border-teal-200 hover:bg-gradient-to-br hover:from-teal-50 hover:to-white transition-all group"
                        >
                          <div className={`p-3 rounded-xl bg-gradient-to-br ${action.bgGradient}`}>
                            <Icon className={`h-6 w-6 bg-gradient-to-r ${action.color} bg-clip-text text-transparent`} style={{ backgroundImage: `linear-gradient(to right, ${action.color.replace('from-', '').split(' to-')[0]}, ${action.color.split(' to-')[1]})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-slate-800">{action.name}</h3>
                            <p className="text-sm text-slate-500">{action.description}</p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Summary */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/40 shadow-xl shadow-slate-200/50 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600">
                    <PieChart className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-800">Admin Summary</h2>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-white shadow-sm">
                      <UserCheck className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">HR Admins</p>
                      <p className="text-xs text-slate-500">Active now</p>
                    </div>
                  </div>
                  <span className="text-2xl font-black text-slate-800">{overview?.activeHRAdmins || 0}</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-white shadow-sm">
                      <Shield className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">Loan Committee</p>
                      <p className="text-xs text-slate-500">Active members</p>
                    </div>
                  </div>
                  <span className="text-2xl font-black text-slate-800">{overview?.activeLoanCommitteeAdmins || 0}</span>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <Link
                    to="/admin/hr-admins/create"
                    className="flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl font-bold hover:from-teal-600 hover:to-teal-700 transition-all shadow-lg shadow-teal-500/25"
                  >
                    <Plus className="h-5 w-5" />
                    Create New Admin
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity - Modern Table */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/40 shadow-xl shadow-slate-200/50 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-lg font-bold text-slate-800">Recent Activity</h2>
              </div>
              <Link
                to="/admin/activity"
                className="text-sm font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
              >
                View all
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              {recentActivity && recentActivity.length > 0 ? (
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Action
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Details
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentActivity.slice(0, 5).map((activity, index) => (
                      <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-teal-50">
                              <Activity className="h-4 w-4 text-teal-600" />
                            </div>
                            <span className="text-sm font-bold text-slate-800">
                              {activity.action}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-600 font-medium">
                            {activity.table_name || 'System'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-500">
                            {new Date(activity.created_at).toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                            <CheckCircle className="h-3 w-3" />
                            Success
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="px-6 py-16 text-center">
                  <div className="bg-slate-100 rounded-2xl p-5 w-20 h-20 mx-auto mb-5 flex items-center justify-center">
                    <Activity className="h-10 w-10 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">No recent activity</h3>
                  <p className="text-slate-500 max-w-sm mx-auto">Activity will appear here when admins perform actions.</p>
                </div>
              )}
            </div>
          </div>
          {/* Activity Tab Content */}
          {activeTab === 'activity' && (
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/40 shadow-xl shadow-slate-200/50">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
                    <Activity className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-800">System Activity Log</h2>
                </div>
                <div className="flex items-center gap-3">
                  <button className="text-sm font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1">
                    <Download className="h-4 w-4" />
                    Export
                  </button>
                  <button className="text-sm font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1">
                    <Filter className="h-4 w-4" />
                    Filter
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                {recentActivity?.data && recentActivity.data.length > 0 ? (
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Timestamp
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Action
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Table
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {recentActivity.data.map((activity, index) => (
                        <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 text-sm text-slate-500">
                            {new Date(activity.created_at).toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                                <span className="text-white font-bold text-xs">
                                  {activity.user_name?.[0] || 'U'}
                                </span>
                              </div>
                              <span className="text-sm font-medium text-slate-800">{activity.user_name || 'System'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-medium text-slate-800">{activity.action}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-slate-600">{activity.table_name || 'System'}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                              <CheckCircle className="h-3 w-3" />
                              Success
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="px-6 py-16 text-center">
                    <div className="bg-slate-100 rounded-2xl p-5 w-20 h-20 mx-auto mb-5 flex items-center justify-center">
                      <Activity className="h-10 w-10 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">No recent activity</h3>
                    <p className="text-slate-500 max-w-sm mx-auto">System activity will appear here when actions are performed.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
