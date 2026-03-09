import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  User,
  Wallet,
  CreditCard,
  FileText,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Menu,
  X,
  LogOut,
  Bell,
  ChevronRight,
  Plus,
  BarChart3,
  Clock,
  CheckCircle,
  MoreVertical,
  Calendar,
  DollarSign,
  PiggyBank,
  Target,
  Award,
  Shield,
  Calculator,
  Download,
  Upload,
  Eye,
  Edit,
  Settings,
  Home,
  Briefcase,
  Building,
  Phone,
  Mail,
  MapPin,
  UserCheck,
  AlertTriangle,
  CheckSquare,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Filter,
  Search,
  Percent,
  History,
  Receipt,
  BanknoteIcon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import employeeService from '../../services/employeeService';

const EmployeeDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState('overview');
  const [showLoanCalculator, setShowLoanCalculator] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await employeeService.getDashboardData();
      setDashboardData(data);
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

  const handleRefresh = () => {
    fetchDashboardData();
  };

  const navigation = [
    { name: 'Dashboard', href: '/employee', icon: Home },
    { name: 'Profile', href: '/employee/profile', icon: User },
    { name: 'Loans', href: '/employee/loans', icon: CreditCard },
    { name: 'Savings', href: '/employee/savings', icon: Wallet },
    { name: 'Applications', href: '/employee/applications', icon: FileText },
    { name: 'Settings', href: '/employee/settings', icon: Settings },
  ];

  const isActiveRoute = (href) => location.pathname === href;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="font-display min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-500/30">
              <Briefcase className="h-10 w-10 text-white" />
            </div>
            <div className="absolute inset-0 rounded-2xl animate-ping bg-blue-400 opacity-20"></div>
          </div>
          <div className="text-center">
            <p className="text-slate-700 font-semibold text-lg">Loading Employee Portal</p>
            <p className="text-slate-500 text-sm mt-1">Fetching your dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="font-display min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border border-slate-100">
          <div className="bg-red-50 rounded-2xl p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <AlertCircle className="h-10 w-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Error Loading Dashboard</h2>
          <p className="text-slate-500 mb-8">{error}</p>
          <button
            onClick={handleRefresh}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-4 rounded-2xl font-bold hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
          >
            <RefreshCw className="h-5 w-5" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { profile, loans, applications, savings, eligibility } = dashboardData || {};

  // Calculate stats
  const stats = [
    {
      title: 'Active Loans',
      value: loans?.filter(loan => loan.status === 'ACTIVE').length || 0,
      change: loans?.length > 0 ? '+1' : '0',
      changeType: 'positive',
      icon: CreditCard,
      color: 'from-blue-500 to-blue-600',
      bgGradient: 'bg-gradient-to-br from-blue-500/10 to-blue-600/5'
    },
    {
      title: 'Total Savings',
      value: formatCurrency(savings?.current_balance || 0),
      change: '+12%',
      changeType: 'positive',
      icon: Wallet,
      color: 'from-emerald-500 to-emerald-600',
      bgGradient: 'bg-gradient-to-br from-emerald-500/10 to-emerald-600/5'
    },
    {
      title: 'Pending Applications',
      value: applications?.filter(app => app.status === 'PENDING').length || 0,
      change: applications?.length > 0 ? '+1' : '0',
      changeType: 'neutral',
      icon: FileText,
      color: 'from-amber-500 to-amber-600',
      bgGradient: 'bg-gradient-to-br from-amber-500/10 to-amber-600/5'
    },
    {
      title: 'Credit Score',
      value: eligibility?.credit_score || 'N/A',
      change: eligibility?.credit_score > 700 ? '+15' : eligibility?.credit_score > 600 ? '+5' : '0',
      changeType: eligibility?.credit_score > 700 ? 'positive' : eligibility?.credit_score > 600 ? 'neutral' : 'negative',
      icon: Award,
      color: 'from-purple-500 to-purple-600',
      bgGradient: 'bg-gradient-to-br from-purple-500/10 to-purple-600/5'
    }
  ];

  const quickActions = [
    {
      name: 'Apply for Loan',
      description: 'Submit a new loan application',
      href: '/employee/loans/apply',
      icon: Plus,
      color: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100'
    },
    {
      name: 'Add Savings',
      description: 'Contribute to your savings',
      href: '/employee/savings/contribute',
      icon: Upload,
      color: 'from-emerald-500 to-emerald-600',
      bgGradient: 'from-emerald-50 to-emerald-100'
    },
    {
      name: 'View Statements',
      description: 'Download your statements',
      href: '/employee/statements',
      icon: Download,
      color: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100'
    },
    {
      name: 'Update Profile',
      description: 'Manage your information',
      href: '/employee/profile',
      icon: Edit,
      color: 'from-amber-500 to-amber-600',
      bgGradient: 'from-amber-50 to-amber-100'
    }
  ];

  return (
    <div className="font-display min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/30 to-purple-50/20">
      {/* Modern Glassmorphism Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 lg:px-8">
        <div className="max-w-[1400px] mx-auto mt-4 rounded-2xl px-6 py-3 flex items-center justify-between bg-white/80 backdrop-blur-2xl border border-white/40 shadow-xl shadow-slate-200/50">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h2 className="text-slate-800 text-lg font-bold tracking-tight">Employee Portal</h2>
              <p className="text-slate-400 text-xs -mt-0.5">Financial Dashboard</p>
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
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
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
              {(applications?.filter(app => app.status === 'PENDING').length || 0) > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>

            {/* User Info */}
            <div className="hidden md:flex items-center gap-3 pl-3 border-l border-slate-200">
              <div className="text-right">
                <p className="text-slate-800 text-sm font-bold">{profile?.first_name} {profile?.last_name}</p>
                <p className="text-slate-500 text-xs">{profile?.job_title || 'Employee'}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-sm">
                  {profile?.first_name?.[0]}{profile?.last_name?.[0]}
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <span className="text-white font-bold text-lg">Employee</span>
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
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
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
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {profile?.first_name?.[0]}{profile?.last_name?.[0]}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">{profile?.first_name} {profile?.last_name}</p>
              <p className="text-slate-500 text-xs">{profile?.job_title || 'Employee'}</p>
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
              Welcome back, {profile?.first_name} 👋
            </h1>
            <p className="text-slate-500">Here's your financial overview and quick actions.</p>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1 mb-8 bg-white/60 backdrop-blur-xl rounded-2xl p-1 shadow-lg shadow-slate-200/50">
            {['overview', 'loans', 'savings', 'applications'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all capitalize ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab === 'overview' && <BarChart3 className="h-4 w-4" />}
                {tab === 'loans' && <CreditCard className="h-4 w-4" />}
                {tab === 'savings' && <Wallet className="h-4 w-4" />}
                {tab === 'applications' && <FileText className="h-4 w-4" />}
                {tab}
              </button>
            ))}
          </div>

          {/* Overview Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  const ChangeIcon = stat.changeType === 'positive' ? ArrowUpRight : stat.changeType === 'negative' ? ArrowDownRight : ArrowUpRight;
                  return (
                    <div
                      key={index}
                      className="group bg-white/80 backdrop-blur-xl rounded-2xl border border-white/40 shadow-xl shadow-slate-200/50 p-5 hover:shadow-2xl hover:shadow-slate-300/30 transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-xl ${stat.bgGradient}`}>
                          <Icon className={`h-6 w-6 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`} style={{ backgroundImage: `linear-gradient(to right, ${stat.color.replace('from-', '').split(' to-')[0]}, ${stat.color.split(' to-')[1]})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} />
                        </div>
                        <div className={`flex items-center gap-1 text-sm font-bold ${
                          stat.changeType === 'positive' ? 'text-emerald-600' : stat.changeType === 'negative' ? 'text-red-600' : 'text-slate-600'
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

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                {/* Quick Actions */}
                <div className="lg:col-span-2">
                  <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/40 shadow-xl shadow-slate-200/50 overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
                          <Zap className="h-5 w-5 text-white" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-800">Quick Actions</h2>
                      </div>
                      <Link to="/employee/actions" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
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
                              className="flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-100 hover:border-blue-200 hover:bg-gradient-to-br hover:from-blue-50 hover:to-white transition-all group"
                            >
                              <div className={`p-3 rounded-xl bg-gradient-to-br ${action.bgGradient}`}>
                                <Icon className={`h-6 w-6 bg-gradient-to-r ${action.color} bg-clip-text text-transparent`} style={{ backgroundImage: `linear-gradient(to right, ${action.color.replace('from-', '').split(' to-')[0]}, ${action.color.split(' to-')[1]})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-bold text-slate-800">{action.name}</h3>
                                <p className="text-sm text-slate-500">{action.description}</p>
                              </div>
                              <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profile Summary */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/40 shadow-xl shadow-slate-200/50 overflow-hidden">
                  <div className="px-6 py-5 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <h2 className="text-lg font-bold text-slate-800">Profile Summary</h2>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center">
                        <span className="text-white font-bold text-xl">
                          {profile?.first_name?.[0]}{profile?.last_name?.[0]}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800">{profile?.first_name} {profile?.last_name}</h3>
                        <p className="text-sm text-slate-500">{profile?.job_title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            profile?.employment_status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {profile?.employment_status || 'Active'}
                          </span>
                          <span className="text-xs text-slate-500">ID: {profile?.employee_id}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <Building className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-600">{profile?.department}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Mail className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-600">{profile?.email}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Phone className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-600">{profile?.phone}</span>
                      </div>
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-100">
                      <Link
                        to="/employee/profile"
                        className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25"
                      >
                        <Edit className="h-4 w-4" />
                        Edit Profile
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/40 shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
                      <History className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-800">Recent Activity</h2>
                  </div>
                  <Link
                    to="/employee/activity"
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    View all
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {/* Sample recent activities */}
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                      <div className="p-2 rounded-xl bg-blue-50">
                        <CreditCard className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-800">Loan Application Submitted</p>
                        <p className="text-sm text-slate-500">Personal loan for $5,000</p>
                      </div>
                      <span className="text-sm text-slate-500">2 days ago</span>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                      <div className="p-2 rounded-xl bg-emerald-50">
                        <Wallet className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-800">Savings Contribution</p>
                        <p className="text-sm text-slate-500">Added $500 to savings</p>
                      </div>
                      <span className="text-sm text-slate-500">1 week ago</span>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                      <div className="p-2 rounded-xl bg-purple-50">
                        <User className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-800">Profile Updated</p>
                        <p className="text-sm text-slate-500">Updated contact information</p>
                      </div>
                      <span className="text-sm text-slate-500">2 weeks ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Loans Tab Content */}
          {activeTab === 'loans' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Active Loans */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/40 shadow-xl shadow-slate-200/50">
                  <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
                        <CreditCard className="h-5 w-5 text-white" />
                      </div>
                      <h2 className="text-lg font-bold text-slate-800">Active Loans</h2>
                    </div>
                    <Link to="/employee/loans" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                      View all
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                  <div className="p-6">
                    {loans?.filter(loan => loan.status === 'ACTIVE').length > 0 ? (
                      <div className="space-y-4">
                        {loans.filter(loan => loan.status === 'ACTIVE').slice(0, 3).map((loan, index) => (
                          <div key={index} className="border border-slate-200 rounded-xl p-4 hover:bg-slate-50 transition-colors">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <h4 className="font-semibold text-slate-800">{loan.loan_type}</h4>
                                <p className="text-sm text-slate-500">Loan #{loan.id}</p>
                              </div>
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                {loan.status}
                              </span>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-600">Principal:</span>
                                <span className="font-semibold text-slate-800">{formatCurrency(loan.principal_amount)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-600">Monthly Payment:</span>
                                <span className="font-semibold text-slate-800">{formatCurrency(loan.monthly_payment)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-600">Next Payment:</span>
                                <span className="font-semibold text-slate-800">{formatDate(loan.next_payment_date)}</span>
                              </div>
                            </div>
                            <div className="mt-3 pt-3 border-t border-slate-100">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-600">Progress:</span>
                                <span className="text-sm font-semibold text-slate-800">{loan.progress || '45%'}</span>
                              </div>
                              <div className="mt-2 w-full bg-slate-200 rounded-full h-2">
                                <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full" style={{ width: loan.progress || '45%' }}></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="bg-slate-100 rounded-2xl p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                          <CreditCard className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">No Active Loans</h3>
                        <p className="text-slate-500 mb-4">You don't have any active loans at the moment.</p>
                        <Link
                          to="/employee/loans/apply"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all"
                        >
                          <Plus className="h-4 w-4" />
                          Apply for Loan
                        </Link>
                      </div>
                    )}
                  </div>
                </div>

                {/* Loan Calculator */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/40 shadow-xl shadow-slate-200/50">
                  <div className="px-6 py-5 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600">
                        <Calculator className="h-5 w-5 text-white" />
                      </div>
                      <h2 className="text-lg font-bold text-slate-800">Loan Calculator</h2>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Loan Amount</label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <input
                            type="number"
                            className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter amount"
                            defaultValue="5000"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Loan Term (months)</label>
                        <select className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                          <option value="6">6 months</option>
                          <option value="12" selected>12 months</option>
                          <option value="24">24 months</option>
                          <option value="36">36 months</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Interest Rate</label>
                        <div className="relative">
                          <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <input
                            type="number"
                            className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Interest rate"
                            defaultValue="10"
                            step="0.1"
                          />
                        </div>
                      </div>
                      <button className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all">
                        Calculate Payment
                      </button>
                    </div>
                    <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                      <h4 className="font-semibold text-slate-800 mb-3">Estimated Monthly Payment</h4>
                      <div className="text-3xl font-bold text-blue-600 mb-2">$416.67</div>
                      <div className="space-y-1 text-sm text-slate-600">
                        <div className="flex justify-between">
                          <span>Total Interest:</span>
                          <span className="font-medium">$500.00</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Amount:</span>
                          <span className="font-medium">$5,500.00</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Savings Tab Content */}
          {activeTab === 'savings' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Savings Account */}
                <div className="lg:col-span-2">
                  <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/40 shadow-xl shadow-slate-200/50">
                    <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600">
                          <Wallet className="h-5 w-5 text-white" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-800">Savings Account</h2>
                      </div>
                      <Link to="/employee/savings" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                        View details
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100">
                          <div className="text-4xl font-black text-emerald-600 mb-2">
                            {formatCurrency(savings?.current_balance || 0)}
                          </div>
                          <p className="text-sm text-slate-600 font-medium">Current Balance</p>
                        </div>
                        <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                          <div className="text-4xl font-black text-blue-600 mb-2">
                            {savings?.monthly_contribution || '10'}%
                          </div>
                          <p className="text-sm text-slate-600 font-medium">Monthly Contribution</p>
                        </div>
                      </div>
                      <div className="mt-6 space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-white shadow-sm">
                              <TrendingUp className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800">Interest Earned</p>
                              <p className="text-xs text-slate-500">This year</p>
                            </div>
                          </div>
                          <span className="text-xl font-black text-slate-800">
                            {formatCurrency(savings?.interest_earned || 0)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-white shadow-sm">
                              <Target className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800">Savings Goal</p>
                              <p className="text-xs text-slate-500">Target amount</p>
                            </div>
                          </div>
                          <span className="text-xl font-black text-slate-800">
                            {formatCurrency(savings?.savings_goal || 10000)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-6 flex gap-3">
                        <Link
                          to="/employee/savings/contribute"
                          className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-emerald-700 transition-all"
                        >
                          <Upload className="h-4 w-4" />
                          Add Funds
                        </Link>
                        <Link
                          to="/employee/savings/withdraw"
                          className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-amber-700 transition-all"
                        >
                          <Download className="h-4 w-4" />
                          Withdraw
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Transactions */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/40 shadow-xl shadow-slate-200/50">
                  <div className="px-6 py-5 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600">
                        <Receipt className="h-5 w-5 text-white" />
                      </div>
                      <h2 className="text-lg font-bold text-slate-800">Recent Transactions</h2>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-emerald-50">
                            <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">Monthly Contribution</p>
                            <p className="text-xs text-slate-500">Auto-deposit</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-emerald-600">+$500</p>
                          <p className="text-xs text-slate-500">Oct 1</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-emerald-50">
                            <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">Interest Credit</p>
                            <p className="text-xs text-slate-500">Monthly interest</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-emerald-600">+$25</p>
                          <p className="text-xs text-slate-500">Sep 30</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-amber-50">
                            <ArrowDownRight className="h-4 w-4 text-amber-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">Withdrawal</p>
                            <p className="text-xs text-slate-500">Emergency fund</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-amber-600">-$200</p>
                          <p className="text-xs text-slate-500">Sep 15</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-100">
                      <Link
                        to="/employee/savings/transactions"
                        className="flex items-center justify-center gap-2 w-full py-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
                      >
                        View all transactions
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Applications Tab Content */}
          {activeTab === 'applications' && (
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/40 shadow-xl shadow-slate-200/50">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-800">Loan Applications</h2>
                </div>
                <Link
                  to="/employee/loans/apply"
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  New Application
                  <Plus className="h-4 w-4" />
                </Link>
              </div>
              <div className="overflow-x-auto">
                {applications && applications.length > 0 ? (
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Application ID
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Loan Type
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Applied Date
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {applications.map((application, index) => (
                        <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <span className="text-sm font-bold text-slate-800">#{application.id}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-slate-600">{application.loan_type}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-semibold text-slate-800">{formatCurrency(application.requested_amount)}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                              application.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                              application.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                              application.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {application.status === 'APPROVED' && <CheckCircle className="h-3 w-3" />}
                              {application.status === 'PENDING' && <Clock className="h-3 w-3" />}
                              {application.status === 'REJECTED' && <X className="h-3 w-3" />}
                              {application.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-slate-500">{formatDate(application.created_at)}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button className="p-1 text-slate-400 hover:text-blue-600">
                                <Eye className="h-4 w-4" />
                              </button>
                              <button className="p-1 text-slate-400 hover:text-slate-600">
                                <Download className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="px-6 py-16 text-center">
                    <div className="bg-slate-100 rounded-2xl p-5 w-20 h-20 mx-auto mb-5 flex items-center justify-center">
                      <FileText className="h-10 w-10 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">No Applications</h3>
                    <p className="text-slate-500 max-w-sm mx-auto mb-6">You haven't submitted any loan applications yet.</p>
                    <Link
                      to="/employee/loans/apply"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all"
                    >
                      <Plus className="h-5 w-5" />
                      Apply for Loan
                    </Link>
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

export default EmployeeDashboard;
