import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Users,
  CreditCard,
  Wallet,
  FileText,
  Settings,
  Activity,
  UserCheck,
  Shield,
  AlertCircle,
  Menu,
  X,
  LogOut,
  Bell,
  Search,
  ChevronRight,
  ChevronDown,
  Plus,
  BarChart3,
  Clock,
  CheckCircle,
  Database,
  Zap,
  UserPlus,
  ClipboardList,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Download,
  Filter,
  LayoutDashboard,
  Gauge,
  History,
  UserCog,
  ShieldCheck,
  XCircle,
  AlertTriangle,
  Info,
  UserCircle,
  Settings as SettingsIcon,
  Key,
  Moon,
  Sun
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import adminService from '../../services/adminService';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark, colors } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);
  const [systemStats, setSystemStats] = useState(null);
  const [registeredUsers, setRegisteredUsers] = useState(null);
  const [hrAdmins, setHrAdmins] = useState([]);
  const [loanCommitteeAdmins, setLoanCommitteeAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState('overview');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'info', title: 'New HR Admin Added', message: 'John Doe was added as HR Admin', time: '5 min ago', read: false },
    { id: 2, type: 'success', title: 'System Backup Complete', message: 'Daily backup completed successfully', time: '1 hour ago', read: false },
    { id: 3, type: 'warning', title: 'High Server Load', message: 'Server CPU usage at 85%', time: '2 hours ago', read: true },
    { id: 4, type: 'error', title: 'Database Connection Issue', message: 'Intermittent connection drops detected', time: '3 hours ago', read: true },
  ]);

  useEffect(() => {
    fetchAllData();
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      clearInterval(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [dashboardRes, healthRes, statsRes, usersRes, hrRes, loanRes] = await Promise.allSettled([
        adminService.getDashboard(),
        adminService.getSystemHealth(),
        adminService.getSystemStats(),
        adminService.getRegisteredUsers({ limit: 10 }),
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
      if (usersRes.status === 'fulfilled') {
        setRegisteredUsers(usersRes.value);
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

  const markNotificationRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllNotificationsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const getUnreadNotificationsCount = () => {
    return notifications.filter(n => !n.read).length;
  };

  const navigation = [
    { name: 'Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'HR Admins', href: '/admin/hr-admins', icon: UserCog },
    { name: 'Loan Committee', href: '/admin/loan-committee-admins', icon: ShieldCheck },
    { name: 'System Health', href: '/admin/system/health', icon: Gauge },
    { name: 'Activity Logs', href: '/admin/activity', icon: History },
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

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  if (loading) {
    return (
      <div className="font-display min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-teal-400 via-teal-500 to-teal-600 flex items-center justify-center shadow-2xl shadow-teal-500/30 animate-pulse">
              <Shield className="h-12 w-12 text-white" />
            </div>
            <div className="absolute inset-0 rounded-2xl animate-ping bg-teal-400 opacity-30"></div>
          </div>
          <div className="text-center">
            <p className="text-white font-semibold text-xl">Loading Admin Console</p>
            <p className="text-slate-400 text-sm mt-2">Initializing dashboard components...</p>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="font-display min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700 p-8 max-w-md w-full text-center">
          <div className="bg-red-500/20 rounded-2xl p-5 w-24 h-24 mx-auto mb-6 flex items-center justify-center border border-red-500/30">
            <AlertCircle className="h-12 w-12 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Dashboard Error</h2>
          <p className="text-slate-400 mb-8">{error}</p>
          <button
            onClick={fetchAllData}
            className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white px-6 py-4 rounded-2xl font-bold hover:from-teal-600 hover:to-teal-700 transition-all shadow-lg shadow-teal-500/25 flex items-center justify-center gap-2"
          >
            <RefreshCw className="h-5 w-5" />
            Retry Connection
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
      lightColor: 'from-blue-500/20 to-blue-600/10',
      textColor: 'text-blue-400',
      bgGradient: 'bg-gradient-to-br from-blue-500/10 to-blue-600/5'
    },
    {
      title: 'Active Loans',
      value: overview?.totalLoans || 0,
      change: '+8%',
      changeType: 'positive',
      icon: CreditCard,
      color: 'from-emerald-500 to-emerald-600',
      lightColor: 'from-emerald-500/20 to-emerald-600/10',
      textColor: 'text-emerald-400',
      bgGradient: 'bg-gradient-to-br from-emerald-500/10 to-emerald-600/5'
    },
    {
      title: 'Total Savings',
      value: `$${(overview?.totalSavings || 0).toLocaleString()}`,
      change: '+15%',
      changeType: 'positive',
      icon: Wallet,
      color: 'from-violet-500 to-violet-600',
      lightColor: 'from-violet-500/20 to-violet-600/10',
      textColor: 'text-violet-400',
      bgGradient: 'bg-gradient-to-br from-violet-500/10 to-violet-600/5'
    },
    {
      title: 'Pending',
      value: overview?.pendingApplications || 0,
      change: '-3%',
      changeType: 'negative',
      icon: FileText,
      color: 'from-amber-500 to-amber-600',
      lightColor: 'from-amber-500/20 to-amber-600/10',
      textColor: 'text-amber-400',
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
      lightColor: 'from-blue-500/20 to-blue-600/10',
      hoverColor: 'hover:border-blue-500/50 hover:bg-blue-500/10'
    },
    {
      name: 'Loan Committee',
      description: 'Add committee member',
      href: '/admin/loan-committee-admins/create',
      icon: Shield,
      color: 'from-emerald-500 to-emerald-600',
      lightColor: 'from-emerald-500/20 to-emerald-600/10',
      hoverColor: 'hover:border-emerald-500/50 hover:bg-emerald-500/10'
    },
    {
      name: 'System Logs',
      description: 'Monitor activity',
      href: '/admin/system/logs',
      icon: ClipboardList,
      color: 'from-violet-500 to-violet-600',
      lightColor: 'from-violet-500/20 to-violet-600/10',
      hoverColor: 'hover:border-violet-500/50 hover:bg-violet-500/10'
    },
    {
      name: 'Settings',
      description: 'Configure system',
      href: '/admin/settings',
      icon: Settings,
      color: 'from-amber-500 to-amber-600',
      lightColor: 'from-amber-500/20 to-amber-600/10',
      hoverColor: 'hover:border-amber-500/50 hover:bg-amber-500/10'
    }
  ];

  const systemMetrics = [
    { name: 'CPU Usage', value: 45, max: 100, color: 'from-emerald-500 to-teal-500', status: 'Normal' },
    { name: 'Memory', value: 62, max: 100, color: 'from-blue-500 to-cyan-500', status: 'Normal' },
    { name: 'Disk', value: 38, max: 100, color: 'from-violet-500 to-purple-500', status: 'Normal' },
    { name: 'Network', value: 28, max: 100, color: 'from-amber-500 to-orange-500', status: 'Normal' },
  ];

  return (
    <div className={`font-display min-h-screen ${colors.backgroundGradient}`}>
      {/* Modern Glassmorphism Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 lg:px-6">
        <div className={`max-w-[1600px] mx-auto mt-3 rounded-2xl px-5 py-2.5 flex items-center justify-between ${colors.cardBg} backdrop-blur-2xl ${colors.cardBorder} ${colors.cardShadow}`}>
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h2 className={`text-lg font-bold tracking-tight ${colors.text}`}>Admin Console</h2>
              <p className={`text-xs -mt-0.5 ${colors.textMuted}`}>System Management</p>
            </div>
          </div>


          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Time Display */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-700/50 rounded-full border border-slate-600/30">
              <Clock className="h-4 w-4 text-slate-400" />
              <span className="text-sm font-semibold text-slate-200">
                {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="text-slate-500 text-xs">
                {currentTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/30 text-slate-300 hover:text-white transition-all"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/30 text-slate-300 hover:text-white transition-all"
              >
                <Bell className="h-4 w-4" />
                {getUnreadNotificationsCount() > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
                    <h3 className="text-white font-semibold">Notifications</h3>
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-xs text-teal-400 hover:text-teal-300"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => markNotificationRead(notification.id)}
                        className={`px-4 py-3 border-b border-slate-700/50 hover:bg-slate-700/30 cursor-pointer transition-all ${!notification.read ? 'bg-slate-700/20' : ''}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white">{notification.title}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{notification.message}</p>
                            <p className="text-xs text-slate-500 mt-1">{notification.time}</p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-teal-500 rounded-full mt-1.5"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-3 bg-slate-800 border-t border-slate-700">
                    <button className="w-full text-center text-sm text-teal-400 hover:text-teal-300">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="hidden md:flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-slate-700/50 transition-all"
              >
                <div className="h-8 w-8 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-sm font-bold">
                    {user?.first_name?.charAt(0) || 'A'}
                  </span>
                </div>
                <span className="text-white text-sm font-medium">
                  {user?.first_name || 'Admin'}
                </span>
                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50">
                  {/* User Info */}
                  <div className="px-4 py-3 bg-gradient-to-r from-slate-700/50 to-slate-800 border-b border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white text-sm font-bold">
                          {user?.first_name?.charAt(0) || 'A'}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">
                          {user?.first_name || 'Admin'} {user?.last_name || ''}
                        </p>
                        <p className="text-slate-400 text-xs">{user?.email || 'admin@company.com'}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Menu Items */}
                  <div className="py-2">
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        navigate('/admin/profile');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors"
                    >
                      <UserCircle className="h-5 w-5 text-slate-400" />
                      <span className="text-sm font-medium">Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        navigate('/admin/settings');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors"
                    >
                      <SettingsIcon className="h-5 w-5 text-slate-400" />
                      <span className="text-sm font-medium">Settings</span>
                    </button>
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        navigate('/admin/security');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors"
                    >
                      <Key className="h-5 w-5 text-slate-400" />
                      <span className="text-sm font-medium">Security</span>
                    </button>
                  </div>
                  
                  {/* Sign Out */}
                  <div className="border-t border-slate-700 py-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="h-5 w-5" />
                      <span className="text-sm font-medium">Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/30 text-slate-300 transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/30 text-slate-300 transition-colors"
            >
              <Menu className="h-5 w-5" />
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-white font-bold text-lg">Admin Console</span>
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
      <main className="pt-24 pb-8 px-4 lg:px-6">
        <div className="max-w-[1600px] mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black text-white mb-1">
                  Welcome back, {user?.first_name} 👋
                </h1>
                <p className="text-slate-400">Here's what's happening with your system today.</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleRefresh}
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/30 rounded-xl text-slate-300 hover:text-white transition-all"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span className="text-sm font-medium">Refresh</span>
                </button>
                <button
                  onClick={() => navigate('/admin/hr-admins/create')}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl font-medium hover:from-teal-600 hover:to-teal-700 transition-all shadow-lg shadow-teal-500/20"
                >
                  <Plus className="h-4 w-4" />
                  <span className="text-sm font-medium">New Admin</span>
                </button>
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
                  className={`group ${colors.card} backdrop-blur-xl rounded-2xl ${colors.cardBorder} p-5 hover:border-teal-500/30 hover:bg-slate-800/60 transition-all duration-300 hover:-translate-y-1 ${colors.cardShadow}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${stat.bgGradient} border border-slate-700/30`}>
                      <Icon className={`h-6 w-6 ${stat.textColor}`} />
                    </div>
                    <div className={`flex items-center gap-1 text-sm font-bold ${
                      stat.changeType === 'positive' ? colors.success : colors.error
                    }`}>
                      <ChangeIcon className="h-4 w-4" />
                      {stat.change}
                    </div>
                  </div>
                  <div>
                    <p className="text-3xl font-black text-white">{stat.value}</p>
                    <p className={`text-sm ${colors.textSecondary} font-medium mt-1`}>{stat.title}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Admin Overview - Horizontal Display with Good Looking Cards */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-purple-500/25">
                <PieChart className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-black text-white">Admin Overview</h2>
            </div>
            
            {/* Horizontal Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* HR Admins Card */}
              <div className="group relative overflow-hidden bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-5 hover:border-blue-500/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full blur-2xl group-hover:from-blue-500/30 transition-all"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25">
                      <UserCheck className="h-6 w-6 text-white" />
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">Active</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-4xl font-black text-white">{overview?.activeHRAdmins || 0}</p>
                    <p className="text-sm font-bold text-slate-300">HR Admins</p>
                    <p className="text-xs text-slate-500">System administrators</p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center justify-between">
                    <Link to="/admin/hr-admins" className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1">
                      View all <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Loan Committee Card */}
              <div className="group relative overflow-hidden bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-5 hover:border-emerald-500/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/10">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/20 to-transparent rounded-full blur-2xl group-hover:from-emerald-500/30 transition-all"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/25">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Active</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-4xl font-black text-white">{overview?.activeLoanCommitteeAdmins || 0}</p>
                    <p className="text-sm font-bold text-slate-300">Loan Committee</p>
                    <p className="text-xs text-slate-500">Committee members</p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center justify-between">
                    <Link to="/admin/loan-committee-admins" className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                      View all <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Total Admins Card */}
              <div className="group relative overflow-hidden bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-5 hover:border-violet-500/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-500/10">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-violet-500/20 to-transparent rounded-full blur-2xl group-hover:from-violet-500/30 transition-all"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 shadow-lg shadow-violet-500/25">
                      <Activity className="h-6 w-6 text-white" />
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-violet-500/20 text-violet-400 border border-violet-500/30">Total</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-4xl font-black text-white">{(overview?.activeHRAdmins || 0) + (overview?.activeLoanCommitteeAdmins || 0)}</p>
                    <p className="text-sm font-bold text-slate-300">Total Admins</p>
                    <p className="text-xs text-slate-500">All roles combined</p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center justify-between">
                    <Link to="/admin/all-admins" className="text-xs font-semibold text-violet-400 hover:text-violet-300 flex items-center gap-1">
                      View all <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* System Health Card */}
              <div className="group relative overflow-hidden bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-5 hover:border-teal-500/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-teal-500/10">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-teal-500/20 to-transparent rounded-full blur-2xl group-hover:from-teal-500/30 transition-all"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 shadow-lg shadow-teal-500/25">
                      <Gauge className="h-6 w-6 text-white" />
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-teal-500/20 text-teal-400 border border-teal-500/30">Online</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-4xl font-black text-white">98%</p>
                    <p className="text-sm font-bold text-slate-300">System Health</p>
                    <p className="text-xs text-slate-500">All systems operational</p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center justify-between">
                    <Link to="/admin/system/health" className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1">
                      Details <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Create Admin Button */}
            <div className="mt-6">
              <Link
                to="/admin/hr-admins/create"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl font-bold hover:from-teal-600 hover:to-teal-700 transition-all shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40"
              >
                <Plus className="h-5 w-5" />
                Create New Admin
              </Link>
            </div>
          </div>

          {/* Registered Users Table */}
          <div className="bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-700/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-lg font-bold text-white">Registered Users</h2>
              </div>
              <div className="flex items-center gap-2">
                <button className="text-sm font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1">
                  <Download className="h-4 w-4" />
                  Export
                </button>
                <Link
                  to="/admin/registered-users"
                  className="text-sm font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1"
                >
                  View all
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="overflow-x-auto">
              {registeredUsers && (registeredUsers.data || registeredUsers.length) > 0 ? (
                <table className="w-full">
                  <thead className="bg-slate-700/30">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Joined Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {(registeredUsers.data || registeredUsers).slice(0, 10).map((user, index) => (
                      <tr key={index} className="hover:bg-slate-700/20 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                              <span className="text-white font-bold text-sm">
                                {user.first_name?.[0] || ''}{user.last_name?.[0] || ''}
                              </span>
                            </div>
                            <span className="text-sm font-bold text-white">
                              {user.first_name} {user.last_name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-400 font-medium">
                            {user.email || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-violet-500/20 text-violet-400 border border-violet-500/30">
                            {user.role || 'EMPLOYEE'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                            user.is_verified || user.status === 'active' 
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}>
                            <CheckCircle className="h-3 w-3" />
                            {user.is_verified || user.status === 'active' ? 'Active' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-500">
                            {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="px-6 py-16 text-center">
                  <div className="bg-slate-700/30 rounded-2xl p-5 w-20 h-20 mx-auto mb-5 flex items-center justify-center border border-slate-600/30">
                    <Users className="h-10 w-10 text-slate-500" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">No registered users</h3>
                  <p className="text-slate-400 max-w-sm mx-auto">Registered users will appear here.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
