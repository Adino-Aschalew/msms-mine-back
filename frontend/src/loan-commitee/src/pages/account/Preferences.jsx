import React, { useState } from 'react';
import {
  Bell,
  Mail,
  Smartphone,
  Monitor,
  Moon,
  Sun,
  Globe,
  Volume2,
  VolumeX,
  Save,
  RotateCcw,
  Shield,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Database,
  Wifi,
  WifiOff,
  Clock,
  Calendar,
  Languages,
  Palette,
  Zap,
  Cpu,
  HardDrive,
  Cloud,
  Download,
  Upload,
  RefreshCw,
  Settings,
  User,
  Users,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  HelpCircle,
  Terminal,
  Code,
  GitBranch,
  Activity,
  BarChart3,
  TrendingUp,
  Filter,
  Search,
  Grid3X3,
  List,
  LayoutGrid,
  Monitor as MonitorIcon,
  Smartphone as SmartphoneIcon,
  Tablet,
  Trash2,
  Keyboard
} from 'lucide-react';

const Preferences = () => {
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const [preferences, setPreferences] = useState({
    
    theme: 'light',

    
    emailNotifications: true,
    pushNotifications: false,
    inAppNotifications: true,
    
    notifyLoanRequests: true,
    notifyApprovals: true,
    notifyRejections: true,
    notifyDisbursements: true,
    notifyOverduePayments: true,
    notifySystemAlerts: true,
    notifySecurityAlerts: true,
    notifyCommitteeUpdates: true,
    notifyReportGenerated: true,
    notifyDeadlineReminders: true,
    notifyMaintenanceAlerts: true,

    
    sidebarCollapsed: false,
    showAnimations: true,
    showTooltips: true,
    showKeyboardShortcuts: true,
    defaultView: 'grid',
    itemsPerPage: 25,
    showQuickActions: true,
    showStatusIndicators: true,
    compactTableRows: false,

    
    twoFactorAuth: false,
    sessionTimeout: 60,
    autoLock: false,
    autoLockTimeout: 15,
    privacyMode: false,
    hideSensitiveData: false,
    allowDataCollection: true,
    shareAnalytics: false,
    publicProfile: false,

    
    autoRefresh: true,
    refreshInterval: 30,
    cacheEnabled: true,
    cacheSize: 100,
    compressionEnabled: true,
    lazyLoading: true,
    prefetchData: false,
    backgroundSync: true,

    
    developerMode: false,
    debugMode: false,
    betaFeatures: false,
    experimentalFeatures: false,
    customCSS: false,
    customJS: false,
    apiRateLimiting: true,
    advancedLogging: false,

    
    screenReader: false,
    keyboardNavigation: true,
    focusVisible: true,
    skipLinks: true,
    ariaLabels: true,
    colorBlindFriendly: false,
    largeText: false,
    highDPI: true,

    
    autoBackup: true,
    backupInterval: 'daily',
    backupLocation: 'cloud',
    syncAcrossDevices: true,
    exportFormat: 'json',
    compressionLevel: 'medium'
  });

  const systemInfo = {
    version: '2.4.1',
    buildDate: '2024-03-15',
    lastSync: '2024-03-16 13:45:22',
    storageUsed: '245 MB',
    storageAvailable: '5.8 GB',
    cacheSize: '45 MB',
    activeSessions: 3,
    apiCalls: 1247,
    uptime: '14 days, 3 hours'
  };

  const handlePreferenceChange = (category, field, value) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    console.log('Saving preferences:', preferences);
    setHasChanges(false);
  };

  const handleReset = () => {
    console.log('Resetting preferences to defaults');
    setHasChanges(false);
  };

  const handleExport = () => {
    console.log('Exporting preferences');
  };

  const handleImport = () => {
    console.log('Importing preferences');
  };

  const getNotificationIcon = (enabled) => {
    return enabled ? <Bell className="w-4 h-4" /> : <Bell className="w-4 h-4 text-gray-400" />;
  };

  const getSecurityIcon = (enabled) => {
    return enabled ? <Shield className="w-4 h-4 text-success-600" /> : <Shield className="w-4 h-4 text-gray-400" />;
  };

  const getThemeIcon = (theme) => {
    switch (theme) {
      case 'light': return <Sun className="w-4 h-4" />;
      case 'dark': return <Moon className="w-4 h-4" />;
      case 'system': return <Monitor className="w-4 h-4" />;
      default: return <Sun className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">System Preferences</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive system configuration and personalization settings
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={handleExport}
            className="btn btn-secondary"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button
            onClick={handleImport}
            className="btn btn-secondary"
          >
            <Upload className="w-4 h-4 mr-2" />
            Import
          </button>
          {!hasChanges ? (
            <button
              onClick={handleReset}
              className="btn btn-secondary"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="btn btn-primary"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </button>
          )}
        </div>
      </div>

      {}
      {hasChanges && (
        <div className="card p-4 bg-warning-50 dark:bg-warning-900/20 border-warning-200 dark:border-warning-800">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-warning-600 mr-2" />
            <p className="text-warning-800 dark:text-warning-200">
              You have unsaved changes. Remember to save your preferences.
            </p>
          </div>
        </div>
      )}

      {}
      <div className="card p-4 bg-info-50 dark:bg-info-900/20 border-info-200 dark:border-info-800">
        <div className="flex flex-wrap items-center justify-between">
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <Info className="w-4 h-4 text-info-600" />
              <span className="text-info-800 dark:text-info-200">
                Version {systemInfo.version} • Build {systemInfo.buildDate}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-info-600" />
              <span className="text-info-800 dark:text-info-200">
                Uptime: {systemInfo.uptime}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 text-info-600" />
              <span className="text-info-800 dark:text-info-200">
                Storage: {systemInfo.storageUsed} / {systemInfo.storageAvailable}
              </span>
            </div>
          </div>
          <button className="text-info-600 hover:text-info-700">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-1 overflow-x-auto">
          {[
            { id: 'general', label: 'General', icon: Settings },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'display', label: 'Display', icon: Monitor }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-2 px-4 border-b-2 font-medium text-sm whitespace-nowrap ${
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

      {}
      {activeTab === 'general' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
              <Palette className="w-5 h-5 mr-2" />
              Theme Settings
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Theme Mode
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['light', 'dark', 'system'].map((theme) => (
                    <button
                      key={theme}
                      onClick={() => handlePreferenceChange('general', 'theme', theme)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        preferences.theme === theme
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        {getThemeIcon(theme)}
                        <span className="text-sm font-medium capitalize">{theme}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>


        </div>
      )}

      {}
      {activeTab === 'notifications' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              Notification Channels
            </h3>
            <div className="space-y-4">
              <label className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Email Notifications</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Receive updates via email</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.emailNotifications}
                  onChange={(e) => handlePreferenceChange('notifications', 'emailNotifications', e.target.checked)}
                  className="toggle"
                />
              </label>

              <label className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Smartphone className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Push Notifications</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Mobile app notifications</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.pushNotifications}
                  onChange={(e) => handlePreferenceChange('notifications', 'pushNotifications', e.target.checked)}
                  className="toggle"
                />
              </label>

              <label className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Monitor className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Desktop Notifications</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Browser desktop alerts</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.desktopNotifications}
                  onChange={(e) => handlePreferenceChange('notifications', 'desktopNotifications', e.target.checked)}
                  className="toggle"
                />
              </label>

              <label className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Volume2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Notification Sound</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Play sound for notifications</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.notificationSound}
                  onChange={(e) => handlePreferenceChange('notifications', 'notificationSound', e.target.checked)}
                  className="toggle"
                />
              </label>

              {preferences.notificationSound && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sound Volume
                  </label>
                  <div className="flex items-center space-x-3">
                    <VolumeX className="w-4 h-4 text-gray-400" />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={preferences.soundVolume}
                      onChange={(e) => handlePreferenceChange('notifications', 'soundVolume', e.target.value)}
                      className="flex-1"
                    />
                    <Volume2 className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400 w-10">{preferences.soundVolume}%</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Notification Types
            </h3>
            <div className="space-y-3">
              {[
                { key: 'notifyLoanRequests', label: 'New Loan Requests', desc: 'When new loan applications are submitted' },
                { key: 'notifyApprovals', label: 'Loan Approvals', desc: 'When loans are approved by committee' },
                { key: 'notifyRejections', label: 'Loan Rejections', desc: 'When loans are rejected' },
                { key: 'notifyDisbursements', label: 'Loan Disbursements', desc: 'When approved loans are disbursed' },
                { key: 'notifyOverduePayments', label: 'Overdue Payments', desc: 'When payments are overdue' },
                { key: 'notifySystemAlerts', label: 'System Alerts', desc: 'Important system notifications' },
                { key: 'notifySecurityAlerts', label: 'Security Alerts', desc: 'Security-related notifications' },
                { key: 'notifyCommitteeUpdates', label: 'Committee Updates', desc: 'Committee meeting and decision updates' },
                { key: 'notifyReportGenerated', label: 'Report Generated', desc: 'When reports are ready for download' },
                { key: 'notifyDeadlineReminders', label: 'Deadline Reminders', desc: 'Important deadline reminders' }
              ].map((notification) => (
                <label key={notification.key} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{notification.label}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{notification.desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences[notification.key]}
                    onChange={(e) => handlePreferenceChange('notifications', notification.key, e.target.checked)}
                    className="toggle"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Preferences;
