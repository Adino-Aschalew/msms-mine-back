import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext2';
import { 
  Settings as SettingsIcon, 
  Shield, 
  Bell, 
  Palette, 
  Server,
  Save,
  Globe,
  Clock,
  Mail,
  Lock,
  Database,
  Users,
  AlertTriangle
} from 'lucide-react';

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);

  const [systemConfig, setSystemConfig] = useState({
    systemName: 'Microfinance Management System',
    organizationName: 'MSMS Organization',
    adminEmail: 'admin@msms.com',
    supportEmail: 'support@msms.com',
    timezone: 'UTC+3',
    dateFormat: 'YYYY-MM-DD',
    currency: 'USD',
    fiscalYearStart: 'January'
  });

  const [securityConfig, setSecurityConfig] = useState({
    sessionTimeout: 30,
    passwordMinLength: 8,
    passwordExpiry: 90,
    maxLoginAttempts: 5,
    lockoutDuration: 15,
    requireTwoFactor: false,
    ipRestriction: false,
    allowedIPs: ''
  });

  const [notificationConfig, setNotificationConfig] = useState({
    emailNotifications: true,
    systemAlerts: true,
    userActivityLogs: true,
    backupNotifications: true,
    loanNotifications: true,
    paymentNotifications: true
  });

  const [systemConfig2, setSystemConfig2] = useState({
    maintenanceMode: false,
    debugMode: false,
    logLevel: 'INFO',
    backupSchedule: 'daily',
    dataRetention: '7years',
    maxFileSize: 10,
    allowedFileTypes: 'pdf,doc,docx,xls,xlsx,csv'
  });

  const tabs = [
    { id: 'general', label: 'System Configuration', icon: SettingsIcon },
    { id: 'security', label: 'Security Settings', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'system', label: 'System Operations', icon: Server }
  ];

  const handleSave = async () => {
    setLoading(true);
    try {
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Settings saved:', {
        systemConfig,
        securityConfig,
        notificationConfig,
        systemConfig2
      });
      alert('Settings saved successfully');
    } catch (error) {
      alert('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="border-b pb-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">System Information</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">Basic system configuration and organization details</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            System Name
          </label>
          <input
            type="text"
            value={systemConfig.systemName}
            onChange={(e) => setSystemConfig(prev => ({ ...prev, systemName: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Organization Name
          </label>
          <input
            type="text"
            value={systemConfig.organizationName}
            onChange={(e) => setSystemConfig(prev => ({ ...prev, organizationName: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Administrator Email
          </label>
          <input
            type="email"
            value={systemConfig.adminEmail}
            onChange={(e) => setSystemConfig(prev => ({ ...prev, adminEmail: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Support Email
          </label>
          <input
            type="email"
            value={systemConfig.supportEmail}
            onChange={(e) => setSystemConfig(prev => ({ ...prev, supportEmail: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Timezone
          </label>
          <select
            value={systemConfig.timezone}
            onChange={(e) => setSystemConfig(prev => ({ ...prev, timezone: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="UTC">UTC</option>
            <option value="UTC+1">UTC+1 (Central European)</option>
            <option value="UTC+3">UTC+3 (East Africa)</option>
            <option value="UTC+5">UTC+5 (Pakistan)</option>
            <option value="UTC-5">UTC-5 (Eastern US)</option>
            <option value="UTC-8">UTC-8 (Pacific US)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Date Format
          </label>
          <select
            value={systemConfig.dateFormat}
            onChange={(e) => setSystemConfig(prev => ({ ...prev, dateFormat: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Default Currency
          </label>
          <select
            value={systemConfig.currency}
            onChange={(e) => setSystemConfig(prev => ({ ...prev, currency: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="USD">USD - US Dollar</option>
            <option value="EUR">EUR - Euro</option>
            <option value="GBP">GBP - British Pound</option>
            <option value="KES">KES - Kenyan Shilling</option>
            <option value="UGX">UGX - Ugandan Shilling</option>
            <option value="TZS">TZS - Tanzanian Shilling</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Fiscal Year Start
          </label>
          <select
            value={systemConfig.fiscalYearStart}
            onChange={(e) => setSystemConfig(prev => ({ ...prev, fiscalYearStart: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="January">January</option>
            <option value="February">February</option>
            <option value="March">March</option>
            <option value="April">April</option>
            <option value="May">May</option>
            <option value="June">June</option>
            <option value="July">July</option>
            <option value="August">August</option>
            <option value="September">September</option>
            <option value="October">October</option>
            <option value="November">November</option>
            <option value="December">December</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="border-b pb-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Security Configuration</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">Authentication and access control settings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Session Timeout (minutes)
          </label>
          <input
            type="number"
            value={securityConfig.sessionTimeout}
            onChange={(e) => setSecurityConfig(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            min="5"
            max="480"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Minimum Password Length
          </label>
          <input
            type="number"
            value={securityConfig.passwordMinLength}
            onChange={(e) => setSecurityConfig(prev => ({ ...prev, passwordMinLength: parseInt(e.target.value) }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            min="6"
            max="20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Password Expiry (days)
          </label>
          <input
            type="number"
            value={securityConfig.passwordExpiry}
            onChange={(e) => setSecurityConfig(prev => ({ ...prev, passwordExpiry: parseInt(e.target.value) }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            min="0"
            max="365"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Maximum Login Attempts
          </label>
          <input
            type="number"
            value={securityConfig.maxLoginAttempts}
            onChange={(e) => setSecurityConfig(prev => ({ ...prev, maxLoginAttempts: parseInt(e.target.value) }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            min="3"
            max="10"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Lockout Duration (minutes)
          </label>
          <input
            type="number"
            value={securityConfig.lockoutDuration}
            onChange={(e) => setSecurityConfig(prev => ({ ...prev, lockoutDuration: parseInt(e.target.value) }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            min="5"
            max="1440"
          />
        </div>
      </div>

      <div className="space-y-4 mt-8">
        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">Require Two-Factor Authentication</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Enforce 2FA for all admin accounts</p>
          </div>
          <input
            type="checkbox"
            checked={securityConfig.requireTwoFactor}
            onChange={(e) => setSecurityConfig(prev => ({ ...prev, requireTwoFactor: e.target.checked }))}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">IP Address Restriction</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Limit access to specific IP addresses</p>
          </div>
          <input
            type="checkbox"
            checked={securityConfig.ipRestriction}
            onChange={(e) => setSecurityConfig(prev => ({ ...prev, ipRestriction: e.target.checked }))}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
        </div>

        {securityConfig.ipRestriction && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Allowed IP Addresses (comma-separated)
            </label>
            <textarea
              value={securityConfig.allowedIPs}
              onChange={(e) => setSecurityConfig(prev => ({ ...prev, allowedIPs: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              rows={3}
              placeholder="192.168.1.100, 10.0.0.50, 203.0.113.0"
            />
          </div>
        )}
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="border-b pb-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notification Settings</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">Configure system notifications and alerts</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">Email Notifications</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Send notifications via email</p>
          </div>
          <input
            type="checkbox"
            checked={notificationConfig.emailNotifications}
            onChange={(e) => setNotificationConfig(prev => ({ ...prev, emailNotifications: e.target.checked }))}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">System Alerts</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Critical system error notifications</p>
          </div>
          <input
            type="checkbox"
            checked={notificationConfig.systemAlerts}
            onChange={(e) => setNotificationConfig(prev => ({ ...prev, systemAlerts: e.target.checked }))}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">User Activity Logs</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Log all user activities</p>
          </div>
          <input
            type="checkbox"
            checked={notificationConfig.userActivityLogs}
            onChange={(e) => setNotificationConfig(prev => ({ ...prev, userActivityLogs: e.target.checked }))}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">Backup Notifications</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Notify on backup completion/failure</p>
          </div>
          <input
            type="checkbox"
            checked={notificationConfig.backupNotifications}
            onChange={(e) => setNotificationConfig(prev => ({ ...prev, backupNotifications: e.target.checked }))}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">Loan Notifications</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Loan application and approval alerts</p>
          </div>
          <input
            type="checkbox"
            checked={notificationConfig.loanNotifications}
            onChange={(e) => setNotificationConfig(prev => ({ ...prev, loanNotifications: e.target.checked }))}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">Payment Notifications</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Payment processing notifications</p>
          </div>
          <input
            type="checkbox"
            checked={notificationConfig.paymentNotifications}
            onChange={(e) => setNotificationConfig(prev => ({ ...prev, paymentNotifications: e.target.checked }))}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <div className="border-b pb-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">System Operations</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">System maintenance and operational settings</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-600 rounded-lg bg-red-50 dark:bg-red-900/20">
          <div>
            <h4 className="font-medium text-red-900 dark:text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Maintenance Mode
            </h4>
            <p className="text-sm text-red-700 dark:text-red-300">
              When enabled, users cannot access the system except administrators
            </p>
          </div>
          <input
            type="checkbox"
            checked={systemConfig2.maintenanceMode}
            onChange={(e) => setSystemConfig2(prev => ({ ...prev, maintenanceMode: e.target.checked }))}
            className="w-4 h-4 text-red-600 border-red-300 rounded focus:ring-red-500"
          />
        </div>

        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">Debug Mode</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Enable detailed error logging</p>
          </div>
          <input
            type="checkbox"
            checked={systemConfig2.debugMode}
            onChange={(e) => setSystemConfig2(prev => ({ ...prev, debugMode: e.target.checked }))}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Log Level
          </label>
          <select
            value={systemConfig2.logLevel}
            onChange={(e) => setSystemConfig2(prev => ({ ...prev, logLevel: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="ERROR">Error Only</option>
            <option value="WARN">Warning and Above</option>
            <option value="INFO">Info and Above</option>
            <option value="DEBUG">Debug (All Logs)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Backup Schedule
          </label>
          <select
            value={systemConfig2.backupSchedule}
            onChange={(e) => setSystemConfig2(prev => ({ ...prev, backupSchedule: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="hourly">Hourly</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Data Retention Period
          </label>
          <select
            value={systemConfig2.dataRetention}
            onChange={(e) => setSystemConfig2(prev => ({ ...prev, dataRetention: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="1year">1 Year</option>
            <option value="3years">3 Years</option>
            <option value="5years">5 Years</option>
            <option value="7years">7 Years</option>
            <option value="10years">10 Years</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Maximum File Size (MB)
          </label>
          <input
            type="number"
            value={systemConfig2.maxFileSize}
            onChange={(e) => setSystemConfig2(prev => ({ ...prev, maxFileSize: parseInt(e.target.value) }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            min="1"
            max="100"
          />
        </div>
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Allowed File Types
        </label>
        <input
          type="text"
          value={systemConfig2.allowedFileTypes}
          onChange={(e) => setSystemConfig2(prev => ({ ...prev, allowedFileTypes: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="pdf,doc,docx,xls,xlsx,csv"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Comma-separated list of file extensions
        </p>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Configure system-wide settings and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {}
        <div className="lg:w-64">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="p-4">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Categories</h2>
            </div>
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-r-2 border-blue-600'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {}
        <div className="flex-1">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="p-6">
              {activeTab === 'general' && renderGeneralSettings()}
              {activeTab === 'security' && renderSecuritySettings()}
              {activeTab === 'notifications' && renderNotificationSettings()}
              {activeTab === 'system' && renderSystemSettings()}
            </div>

            {}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Last saved: Never
                </div>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className={`flex items-center gap-2 px-6 py-2 rounded-md font-medium transition-colors ${
                    loading
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
