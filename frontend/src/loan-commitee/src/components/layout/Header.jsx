import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FiMenu,
  FiSearch,
  FiBell,
  FiMoon,
  FiSun,
  FiMonitor,
  FiUser,
  FiSettings,
  FiLogOut,
  FiChevronDown,
  FiChevronRight,
  FiShield,
  FiCreditCard,
  FiHelpCircle,
  FiFileText,
  FiActivity,
  FiGlobe,
  FiEye,
  FiEyeOff,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCheckCircle,
} from 'react-icons/fi';
import { useAuth } from '../../../../shared/contexts/AuthContext';
import { useTheme } from '../../../../shared/contexts/ThemeContext';
import { committeeAPI } from '../../services/committeeAPI';
import {
  Calendar,
  Star,
  Award,
  Zap,
  Target,
  TrendingUp,
  Users,
  Briefcase,
  Building,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  ExternalLink,
  Menu,
  FileText,
  Activity,
  Bell,
  CheckCircle as CheckCircleIcon,
} from 'lucide-react';

const Header = ({ sidebarCollapsed, toggleSidebar, mobileSidebarOpen, toggleMobileSidebar }) => {
  const { theme, toggleTheme } = useTheme();
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [notificationDropdown, setNotificationDropdown] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [committeeStats, setCommitteeStats] = useState(null);

  // Fetch profile and stats data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch profile data
        const profileRes = await committeeAPI.getProfile();
        if (profileRes.data?.success && profileRes.data?.data) {
          setProfileData(profileRes.data.data);
        }

        // Fetch committee stats
        const statsRes = await committeeAPI.getCommitteeStats();
        if (statsRes.data?.success && statsRes.data?.data) {
          setCommitteeStats(statsRes.data.data);
        }
      } catch (error) {
        console.error('Error fetching header data:', error);
      }
    };

    fetchData();
  }, []);

  const notifications = [
    { 
      id: 1, 
      text: 'New loan request from John Doe', 
      time: '5 min ago', 
      read: false,
      type: 'loan_request',
      loanId: 'LR-2024-001',
      applicant: 'John Doe',
      amount: '$25,000',
      priority: 'high'
    },
    { 
      id: 2, 
      text: 'Loan #1234 has been approved', 
      time: '1 hour ago', 
      read: false,
      type: 'loan_approved',
      loanId: 'LR-2024-002',
      applicant: 'Jane Smith',
      amount: '$15,000',
      priority: 'medium'
    },
    { 
      id: 3, 
      text: 'Monthly report is ready', 
      time: '2 hours ago', 
      read: true,
      type: 'report',
      reportId: 'RPT-2024-03',
      reportType: 'Monthly Summary',
      priority: 'low'
    },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleViewDetails = (notification) => {
    // Mark as read
    notification.read = true;
    
    // Navigate based on notification type
    switch (notification.type) {
      case 'loan_request':
      case 'loan_approved':
        // Navigate to loan details page
        window.location.href = `/loan-requests/${notification.loanId}`;
        break;
      case 'report':
        // Navigate to reports page
        window.location.href = '/reports';
        break;
      default:
        console.log('View details for:', notification);
    }
    
    // Close dropdown
    setNotificationDropdown(false);
  };

  const handleReview = (notification) => {
    // Mark as read
    notification.read = true;
    
    // Navigate based on notification type
    switch (notification.type) {
      case 'loan_request':
        // Navigate to loan review page
        window.location.href = `/loan-requests/${notification.loanId}?action=review`;
        break;
      case 'loan_approved':
        // Navigate to loan details for review
        window.location.href = `/loan-requests/${notification.loanId}?action=review`;
        break;
      case 'report':
        // Navigate to report review page
        window.location.href = `/reports/${notification.reportId}?action=review`;
        break;
      default:
        console.log('Review:', notification);
    }
    
    // Close dropdown
    setNotificationDropdown(false);
  };

  const handleMarkAsRead = (notificationId) => {
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleViewAllNotifications = () => {
    navigate('/notifications');
    setNotificationDropdown(false);
  };

  const handleSearchSubmit = (query) => {
    if (!query.trim()) return;

    // Close any open dropdowns
    setNotificationDropdown(false);
    setProfileDropdown(false);

    // Navigate based on current page and search query
    const currentPath = location.pathname;
    
    if (currentPath.includes('/loan-requests')) {
      navigate(`/loan-requests?search=${encodeURIComponent(query)}`);
    } else if (currentPath.includes('/disbursements')) {
      navigate(`/disbursements?search=${encodeURIComponent(query)}`);
    } else if (currentPath.includes('/reports')) {
      navigate(`/reports?search=${encodeURIComponent(query)}`);
    } else if (currentPath.includes('/notifications')) {
      navigate(`/notifications?search=${encodeURIComponent(query)}`);
    } else {
      // Default to loan requests search
      navigate(`/loan-requests?search=${encodeURIComponent(query)}`);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'loan_request': return <FileText className="w-4 h-4" />;
      case 'loan_approved': return <CheckCircle className="w-4 h-4" />;
      case 'report': return <Activity className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-3 sm:px-5 lg:px-5 h-10 sm:h-20 lg:h-19 flex items-center justify-between">
      
      {/* Left Section */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Mobile Menu Toggle */}
        <button
          onClick={toggleMobileSidebar}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <FiMenu className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300" />
        </button>

        {/* Welcome Message - Desktop Only */}
        <div className="hidden lg:block">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Welcome back, {profileData ? `${profileData.first_name}` : (user?.username || 'User')}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {profileData?.role || user?.role || 'Committee Administrator'}
          </p>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-1 sm:space-x-3">
        
        {/* Theme Toggle */}
        <div className="hidden sm:flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => theme !== 'light' && toggleTheme('light')}
            className={`p-1.5 rounded ${theme === 'light' ? 'bg-white dark:bg-gray-600 shadow-sm' : ''}`}
          >
            <FiSun className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
          <button
            onClick={() => theme !== 'dark' && toggleTheme('dark')}
            className={`p-1.5 rounded ${theme === 'dark' ? 'bg-white dark:bg-gray-600 shadow-sm' : ''}`}
          >
            <FiMoon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
          <button
            onClick={() => theme !== 'system' && toggleTheme('system')}
            className={`p-1.5 rounded ${theme === 'system' ? 'bg-white dark:bg-gray-600 shadow-sm' : ''}`}
          >
            <FiMonitor className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Mobile Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="sm:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          {theme === 'light' ? (
            <FiMoon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          ) : theme === 'dark' ? (
            <FiSun className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          ) : (
            <FiMonitor className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          )}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotificationDropdown(!notificationDropdown)}
            className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <FiBell className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-danger-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {notificationDropdown && (
            <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Notifications</h3>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {unreadCount} unread
                  </span>
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700 last:border-b-0 transition-colors ${
                      !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${getPriorityColor(notification.priority)}`}>
                        {getTypeIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {notification.text}
                          </p>
                          {!notification.read && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              Mark as read
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{notification.time}</p>
                        
                        {/* Additional notification details */}
                        {(notification.type === 'loan_request' || notification.type === 'loan_approved') && (
                          <div className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                            <div>Applicant: {notification.applicant}</div>
                            <div>Amount: {notification.amount}</div>
                            <div>Loan ID: {notification.loanId}</div>
                          </div>
                        )}
                        
                        {notification.type === 'report' && (
                          <div className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                            <div>Report Type: {notification.reportType}</div>
                            <div>Report ID: {notification.reportId}</div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewDetails(notification)}
                            className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <FiEye className="w-3 h-3" />
                            <span>View Details</span>
                          </button>
                          
                          {(notification.type === 'loan_request' || notification.type === 'loan_approved') && (
                            <button
                              onClick={() => handleReview(notification)}
                              className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors"
                            >
                               <FiFileText className="w-3 h-3" />
                              <span>Review</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Footer */}
              <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                <button 
                  onClick={handleViewAllNotifications}
                  className="w-full text-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                >
                  View All Notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdown(!profileDropdown)}
            className="flex items-center space-x-2 sm:space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 group"
          >
            <div className="relative">
              <div className="w-7 h-7 sm:w-9 sm:h-9 bg-blue-500 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-gray-800 group-hover:ring-blue-500 transition-all duration-200">
                <FiUser className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {profileData ? `${profileData.first_name} ${profileData.last_name}` : (user?.username || 'Loading...')}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {profileData?.role || user?.role || 'Loading...'}
              </p>
            </div>
            <FiChevronDown className={`w-4 h-4 text-gray-600 dark:text-gray-300 transition-transform duration-200 ${profileDropdown ? 'rotate-180' : ''}`} />
          </button>

          {profileDropdown && (
            <div className="absolute right-0 mt-2 sm:mt-3 w-72 sm:w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
              {/* Profile Header */}
              <div className="bg-blue-500 dark:bg-gray-700 p-4 sm:p-6 text-white dark:text-gray-100">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                    <FiUser className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-base sm:text-lg">
                      {profileData ? `${profileData.first_name} ${profileData.last_name}` : (user?.username || 'Loading...')}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-10 tracking-tight dark:text-gray-100">
                      {profileData?.email || user?.email || 'Loading...'}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="px-2 py-1 bg-white/20 backdrop-blur rounded-full text-xs font-medium">
                        {profileData?.role || user?.role || 'Loading...'}
                      </span>
                      <span className="px-2 py-1 bg-green-700 rounded-full text-xs font-medium flex items-center">
                        <FiCheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {committeeStats?.totalLoansReviewed || '0'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Loans Reviewed</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {committeeStats?.accuracyRate || '0%'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Approval Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {committeeStats?.yearsOfService || '0'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Years Service</div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-2">
                <div className="space-y-1">
                  <Link
                    to="/account/profile"
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                  >
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-900/30 transition-colors">
                      <FiUser className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Profile</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Manage your personal information</p>
                    </div>
                    <FiChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                  </Link>

                  <Link
                    to="/account/security"
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                  >
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-900/30 transition-colors">
                      <FiShield className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Security</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Password and authentication settings</p>
                    </div>
                    <FiChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                  </Link>

                  <Link
                    to="/account/preferences"
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                  >
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center group-hover:bg-purple-200 dark:group-hover:bg-purple-900/30 transition-colors">
                      <FiSettings className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Preferences</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Customize your experience</p>
                    </div>
                    <FiChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                  </Link>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

                <div className="space-y-1">
                  <button 
                    onClick={logout}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group w-full text-left"
                  >
                    <div className="w-8 h-8 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center group-hover:bg-red-200 dark:group-hover:bg-red-900/30 transition-colors">
                      <FiLogOut className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-600 dark:text-red-400">Logout</p>
                      <p className="text-xs text-red-500 dark:text-red-400">Sign out of your account</p>
                    </div>
                    <FiChevronRight className="w-4 h-4 text-red-400 group-hover:text-red-600 dark:group-hover:text-red-300" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
