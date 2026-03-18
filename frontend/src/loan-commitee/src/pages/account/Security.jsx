import React, { useState } from 'react';
import {
  Shield,
  Key,
  Smartphone,
  Mail,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Save,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  User,
  Users,
  Activity,
  Clock,
  MapPin,
  Monitor,
  Tablet,
  Wifi,
  WifiOff,
  RefreshCw,
  Download,
  Upload,
  Settings,
  Bell,
  Globe,
  Fingerprint,
  CreditCard,
  ShieldCheck,
  ShieldAlert,
  ShieldOff,
  Ban,
  Info,
  Zap,
  Database,
  HardDrive,
  Cpu,
  Terminal,
  Code,
  Bug,
  ChevronRight,
  ChevronDown,
  MoreVertical,
  Trash2,
  Edit,
  Copy,
  ExternalLink
} from 'lucide-react';
import { exportSecurityReport, getExportOptions, getReportDescription } from '../../utils/exportUtils';

const Security = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [expandedActivity, setExpandedActivity] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState('json');

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);

  const securitySettings = {
    passwordStrength: 'strong',
    lastPasswordChange: '2024-03-10',
    twoFactorEnabled: false,
    loginAttempts: 0,
    sessionTimeout: 60,
    autoLock: true,
    encryptionEnabled: true,
    backupEnabled: true,
    securityScore: 85,
    riskLevel: 'low'
  };

  const securityMetrics = {
    totalLogins: 1247,
    successfulLogins: 1245,
    failedLogins: 2,
    uniqueDevices: 8,
    uniqueLocations: 5,
    securityEvents: 3,
    blockedAttempts: 12,
    lastSecurityScan: '2024-03-16 08:00:00'
  };

  const recentActivity = [
    {
      id: 1,
      action: 'Password changed',
      timestamp: '2024-03-10 14:30:22',
      ip: '192.168.1.100',
      device: 'Chrome on Windows',
      location: 'New York, NY',
      status: 'success',
      severity: 'info',
      details: 'Password successfully updated via secure portal'
    },
    {
      id: 2,
      action: 'Login from new device',
      timestamp: '2024-03-08 09:15:45',
      ip: '192.168.1.105',
      device: 'Safari on iPhone',
      location: 'Boston, MA',
      status: 'success',
      severity: 'warning',
      details: 'First login from this device - verification required'
    },
    {
      id: 3,
      action: 'Failed login attempt',
      timestamp: '2024-03-07 16:45:12',
      ip: '192.168.1.200',
      device: 'Unknown',
      location: 'Unknown',
      status: 'failed',
      severity: 'danger',
      details: 'Invalid credentials - account temporarily locked'
    },
    {
      id: 4,
      action: 'Two-factor authentication disabled',
      timestamp: '2024-03-05 11:20:33',
      ip: '192.168.1.100',
      device: 'Chrome on Windows',
      location: 'New York, NY',
      status: 'success',
      severity: 'warning',
      details: '2FA disabled by user - security reduced'
    },
    {
      id: 5,
      action: 'Security scan completed',
      timestamp: '2024-03-16 08:00:00',
      ip: 'System',
      device: 'Security System',
      location: 'System',
      status: 'success',
      severity: 'info',
      details: 'Automated security scan completed - no threats found'
    }
  ];

  const securityFeatures = [
    {
      name: 'Two-Factor Authentication',
      description: 'Add an extra layer of security to your account',
      status: 'inactive',
      icon: <Smartphone className="w-5 h-5" />
    },
    {
      name: 'Session Management',
      description: 'View and manage active sessions across devices',
      status: 'active',
      icon: <Monitor className="w-5 h-5" />
    },
    {
      name: 'Encryption',
      description: 'End-to-end encryption for sensitive data',
      status: 'active',
      icon: <Lock className="w-5 h-5" />
    },
    {
      name: 'Security Alerts',
      description: 'Real-time notifications for security events',
      status: 'active',
      icon: <Bell className="w-5 h-5" />
    }
  ];

  const securityRecommendations = [
    {
      type: 'warning',
      title: 'Enable Two-Factor Authentication',
      description: 'Add an extra layer of security to prevent unauthorized access',
      action: 'Enable 2FA',
      priority: 'high'
    },
    {
      type: 'info',
      title: 'Review Active Sessions',
      description: 'Check all devices that have access to your account',
      action: 'Review Sessions',
      priority: 'medium'
    },
    {
      type: 'success',
      title: 'Password is Strong',
      description: 'Your current password meets all security requirements',
      action: null,
      priority: 'low'
    }
  ];

  const handlePasswordChange = (field, value) => {
    setPasswordForm(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    
    // Validate passwords
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    
    if (passwordForm.newPassword.length < 8) {
      alert('Password must be at least 8 characters long!');
      return;
    }
    
    // Simulate password change
    console.log('Password change submitted:', passwordForm);
    setShowPasswordForm(false);
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setShowPasswordModal(true); // Show success modal
    
    // Update last password change date
    securitySettings.lastPasswordChange = new Date().toISOString().split('T')[0];
  };

  const handleTwoFactorToggle = () => {
    if (!twoFactorEnabled) {
      setShowTwoFactorSetup(true);
    } else {
      setTwoFactorEnabled(false);
    }
  };

  const handleTwoFactorSetup = () => {
    setTwoFactorEnabled(true);
    setShowTwoFactorSetup(false);
  };

  const handleSessionTerminate = (sessionId) => {
    console.log('Terminating session:', sessionId);
    // Remove session from activeSessions
    const sessionIndex = activeSessions.findIndex(s => s.id === sessionId);
    if (sessionIndex > -1) {
      activeSessions.splice(sessionIndex, 1);
    }
  };

  const handleExportReport = () => {
    setShowExportModal(true);
  };

  const generateReport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      securityMetrics,
      recentActivity,
      activeSessions,
      securitySettings
    };

    exportSecurityReport(reportData, exportFormat);
    setShowExportModal(false);
  };

  const getActivityIcon = (severity) => {
    const icons = {
      info: <Info className="w-4 h-4 text-info-600" />,
      warning: <AlertTriangle className="w-4 h-4 text-warning-600" />,
      danger: <XCircle className="w-4 h-4 text-danger-600" />,
      success: <CheckCircle className="w-4 h-4 text-success-600" />
    };
    return icons[severity] || icons.info;
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: 'status-approved',
      inactive: 'status-pending',
      current: 'status-approved',
      failed: 'status-rejected',
      success: 'status-approved'
    };
    return badges[status] || 'status-pending';
  };

  const getSecurityScore = (score) => {
    if (score >= 80) return { color: 'text-success-600', label: 'Excellent' };
    if (score >= 60) return { color: 'text-warning-600', label: 'Good' };
    if (score >= 40) return { color: 'text-warning-600', label: 'Fair' };
    return { color: 'text-danger-600', label: 'Poor' };
  };

  const scoreColor = getSecurityScore(securitySettings.securityScore);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Security Center</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive security management and threat monitoring
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button onClick={handleExportReport} className="btn btn-secondary">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
          <button className="btn btn-primary">
            <Shield className="w-4 h-4 mr-2" />
            Security Scan
          </button>
        </div>
      </div>

      {/* Security Score Overview */}
      <div className="card p-6 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border-primary-200 dark:border-primary-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Security Score</h3>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Overall account security assessment</p>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${scoreColor.color}`}>
              {securitySettings.securityScore}/100
            </div>
            <div className={`text-sm font-medium ${scoreColor.color}`}>
              {scoreColor.label}
            </div>
          </div>
        </div>
        <div className="mt-4">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                securitySettings.securityScore >= 80 ? 'bg-success-500' :
                securitySettings.securityScore >= 60 ? 'bg-warning-500' : 'bg-danger-500'
              }`}
              style={{ width: `${securitySettings.securityScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: Shield },
            { id: 'authentication', label: 'Authentication', icon: Key },
            { id: 'activity', label: 'Activity', icon: Activity },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Security Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-5 h-5 text-success-600" />
                <span className="text-xs text-success-600 font-medium">Healthy</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {securityMetrics.successfulLogins}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Successful Logins</p>
            </div>

            <div className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <XCircle className="w-5 h-5 text-danger-600" />
                <span className="text-xs text-danger-600 font-medium">Alert</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {securityMetrics.failedLogins}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Failed Attempts</p>
            </div>

            <div className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <Monitor className="w-5 h-5 text-primary-600" />
                <span className="text-xs text-primary-600 font-medium">Active</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {securityMetrics.uniqueDevices}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Unique Devices</p>
            </div>

            <div className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <MapPin className="w-5 h-5 text-warning-600" />
                <span className="text-xs text-warning-600 font-medium">Tracked</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {securityMetrics.uniqueLocations}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Unique Locations</p>
            </div>
          </div>

          {/* Security Features */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
                Security Features
              </h3>
              <div className="space-y-4">
                {securityFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        feature.status === 'active' 
                          ? 'bg-success-100 text-success-600' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {feature.icon}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {feature.title}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        feature.status === 'active' ? 'bg-success-500' : 'bg-gray-300'
                      }`} />
                      <button className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                        {feature.action}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Security Recommendations */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
                Security Recommendations
              </h3>
              <div className="space-y-4">
                {securityRecommendations.map((rec, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${
                    rec.type === 'warning' ? 'bg-warning-50 border-warning-200 dark:bg-warning-900/20 dark:border-warning-800' :
                    rec.type === 'info' ? 'bg-info-50 border-info-200 dark:bg-info-900/20 dark:border-info-800' :
                    'bg-success-50 border-success-200 dark:bg-success-900/20 dark:border-success-800'
                  }`}>
                    <div className="flex items-start space-x-3">
                      {rec.type === 'warning' && <AlertTriangle className="w-5 h-5 text-warning-600 mt-0.5" />}
                      {rec.type === 'info' && <Info className="w-5 h-5 text-info-600 mt-0.5" />}
                      {rec.type === 'success' && <CheckCircle className="w-5 h-5 text-success-600 mt-0.5" />}
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {rec.title}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {rec.description}
                        </p>
                        {rec.action && (
                          <button className="text-xs text-primary-600 hover:text-primary-700 mt-2 font-medium">
                            {rec.action}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Authentication Tab */}
      {activeTab === 'authentication' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Password Management */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Password Management
              </h3>
              <Shield className="w-5 h-5 text-gray-400" />
            </div>

            {!showPasswordForm ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Key className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  Last password change: {securitySettings.lastPasswordChange}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Password strength: {securitySettings.passwordStrength}
                </p>
                <button
                  onClick={() => setShowPasswordForm(true)}
                  className="btn btn-primary"
                >
                  Change Password
                </button>
              </div>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordForm.currentPassword}
                      onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                      className="input pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                      className="input pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Must be at least 8 characters with uppercase, lowercase, and numbers
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                      className="input pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowPasswordForm(false)}
                    className="btn btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary flex-1"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Two-Factor Authentication */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Two-Factor Authentication
              </h3>
              <Smartphone className="w-5 h-5 text-gray-400" />
            </div>

            {!showTwoFactorSetup ? (
              <div className="text-center py-8">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  twoFactorEnabled 
                    ? 'bg-success-100 text-success-600' 
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {twoFactorEnabled ? <ShieldCheck className="w-8 h-8" /> : <ShieldOff className="w-8 h-8" />}
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {twoFactorEnabled 
                    ? '2FA is currently enabled for your account'
                    : 'Add an extra layer of security to your account'
                  }
                </p>
                <button
                  onClick={handleTwoFactorToggle}
                  className={`btn ${twoFactorEnabled ? 'btn-danger' : 'btn-primary'}`}
                >
                  {twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Smartphone className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Set Up Two-Factor Authentication
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Scan the QR code below with your authenticator app
                  </p>
                </div>

                <div className="bg-gray-100 dark:bg-gray-700 p-8 rounded-lg text-center">
                  <div className="w-32 h-32 bg-white dark:bg-gray-800 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <Smartphone className="w-24 h-24 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    QR Code for 2FA Setup
                  </p>
                </div>

                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Enter 6-digit code"
                    className="input text-center text-2xl tracking-widest"
                    maxLength={6}
                  />
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowTwoFactorSetup(false)}
                      className="btn btn-secondary flex-1"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleTwoFactorSetup}
                      className="btn btn-primary flex-1"
                    >
                      Verify & Enable
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sessions Tab */}
      {activeTab === 'sessions' && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Active Sessions
            </h3>
            <button className="btn btn-secondary btn-sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>

          <div className="space-y-4">
            {activeSessions.map((session) => (
              <div key={session.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${
                      session.status === 'current' 
                        ? 'bg-success-100 text-success-600' 
                        : session.status === 'active'
                        ? 'bg-primary-100 text-primary-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {session.device.includes('iPhone') ? <Smartphone className="w-5 h-5" /> :
                       session.device.includes('MacBook') ? <Monitor className="w-5 h-5" /> :
                       <Monitor className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {session.device}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {session.browser} • {session.os}
                      </p>
                      <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                        <span className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {session.location}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {session.lastActive}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`status-badge ${getStatusBadge(session.status)}`}>
                      {session.status}
                    </span>
                    {session.status !== 'current' && (
                      <button
                        onClick={() => handleSessionTerminate(session.id)}
                        className="text-danger-600 hover:text-danger-700"
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button className="btn btn-danger w-full">
              <Ban className="w-4 h-4 mr-2" />
              Terminate All Other Sessions
            </button>
          </div>
        </div>
      )}

      {/* Activity Tab */}
      {activeTab === 'activity' && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Security Activity Log
            </h3>
            <div className="flex space-x-2">
              <button onClick={handleExportReport} className="btn btn-secondary btn-sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
              <button className="btn btn-secondary btn-sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <tr>
                  <th className="pb-3">Action</th>
                  <th className="pb-3">Timestamp</th>
                  <th className="pb-3">IP Address</th>
                  <th className="pb-3">Device</th>
                  <th className="pb-3">Location</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {recentActivity.map((activity) => (
                  <tr key={activity.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="py-3">
                      <div className="flex items-center space-x-2">
                        {getActivityIcon(activity.severity)}
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                          {activity.action}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-sm text-gray-600 dark:text-gray-400">
                      {activity.timestamp}
                    </td>
                    <td className="py-3 text-sm text-gray-600 dark:text-gray-400">
                      {activity.ip}
                    </td>
                    <td className="py-3 text-sm text-gray-600 dark:text-gray-400">
                      {activity.device}
                    </td>
                    <td className="py-3 text-sm text-gray-600 dark:text-gray-400">
                      {activity.location}
                    </td>
                    <td className="py-3">
                      <span className={`status-badge ${getStatusBadge(activity.status)}`}>
                        {activity.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => setExpandedActivity(expandedActivity === activity.id ? null : activity.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {expandedActivity === activity.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {expandedActivity && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-start space-x-2">
                <Info className="w-4 h-4 text-info-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Activity Details
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {recentActivity.find(a => a.id === expandedActivity)?.details}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Threats Tab */}
      {activeTab === 'threats' && (
        <div className="space-y-6">
          {/* Threat Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card p-4 border-danger-200 dark:border-danger-800">
              <div className="flex items-center justify-between mb-2">
                <AlertOctagon className="w-5 h-5 text-danger-600" />
                <span className="text-xs text-danger-600 font-medium">Critical</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">0</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Critical Threats</p>
            </div>

            <div className="card p-4 border-warning-200 dark:border-warning-800">
              <div className="flex items-center justify-between mb-2">
                <AlertTriangle className="w-5 h-5 text-warning-600" />
                <span className="text-xs text-warning-600 font-medium">Warning</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">2</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Potential Threats</p>
            </div>

            <div className="card p-4 border-info-200 dark:border-info-800">
              <div className="flex items-center justify-between mb-2">
                <Bug className="w-5 h-5 text-info-600" />
                <span className="text-xs text-info-600 font-medium">Info</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">5</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Security Events</p>
            </div>
          </div>

          {/* Recent Threats */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Recent Security Events
              </h3>
              <button className="btn btn-secondary btn-sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Scan Now
              </button>
            </div>

            <div className="space-y-4">
              <div className="border border-warning-200 dark:border-warning-800 bg-warning-50 dark:bg-warning-900/20 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-warning-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      Login from Unrecognized Device
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      A login attempt was made from a device not previously associated with your account.
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>IP: 192.168.1.200</span>
                      <span>Time: 2024-03-07 16:45:12</span>
                      <span>Status: Blocked</span>
                    </div>
                  </div>
                  <button className="text-warning-600 hover:text-warning-700">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="border border-info-200 dark:border-info-800 bg-info-50 dark:bg-info-900/20 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Info className="w-5 h-5 text-info-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      Security Scan Completed
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Automated security scan completed successfully. No threats detected.
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>Time: 2024-03-16 08:00:00</span>
                      <span>Duration: 2.3 seconds</span>
                      <span>Status: Clean</span>
                    </div>
                  </div>
                  <button className="text-info-600 hover:text-info-700">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Password Success Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-success-100 text-success-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Password Changed Successfully!
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Your password has been updated. You can now use your new password to log in.
              </p>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="btn btn-primary w-full"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Report Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Export Security Report
              </h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Export Format
                </label>
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="input"
                >
                  {getExportOptions().map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label} - {option.description}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>{getReportDescription('security')}</p>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={generateReport}
                  className="btn btn-primary flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Security;
