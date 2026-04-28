import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext2';
import { useAuth } from '../../../shared/contexts/AuthContext';
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
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader
} from 'lucide-react';
import { adminAPI } from '../../../shared/services/adminAPI';

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [lastSaved, setLastSaved] = useState(null);

  const [systemConfig, setSystemConfig] = useState({
    systemName: '',
    organizationName: '',
    adminEmail: '',
    supportEmail: '',
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

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setFetching(true);
      const response = await adminAPI.getSystemConfig();
      const data = response?.success ? response.data : (response?.data || response || {});

      if (data && typeof data === 'object') {
        setSystemConfig(prev => ({
          ...prev,
          systemName: data.system_name !== undefined ? data.system_name : prev.systemName,
          organizationName: data.organization_name !== undefined ? data.organization_name : prev.organizationName,
          adminEmail: data.admin_email !== undefined ? data.admin_email : prev.adminEmail,
          supportEmail: data.support_email !== undefined ? data.support_email : prev.supportEmail,
          timezone: data.timezone !== undefined ? data.timezone : prev.timezone,
          dateFormat: data.date_format !== undefined ? data.date_format : prev.dateFormat,
          currency: data.currency !== undefined ? data.currency : prev.currency,
          fiscalYearStart: data.fiscal_year_start !== undefined ? data.fiscal_year_start : prev.fiscalYearStart
        }));

        setSecurityConfig(prev => ({
          ...prev,
          sessionTimeout: data.session_timeout_minutes !== undefined ? data.session_timeout_minutes : prev.sessionTimeout,
          passwordMinLength: data.password_min_length !== undefined ? data.password_min_length : prev.passwordMinLength,
          passwordExpiry: data.password_expiry_days !== undefined ? data.password_expiry_days : prev.passwordExpiry,
          maxLoginAttempts: data.max_login_attempts !== undefined ? data.max_login_attempts : prev.maxLoginAttempts,
          lockoutDuration: data.lockout_duration_minutes !== undefined ? data.lockout_duration_minutes : prev.lockoutDuration,
          requireTwoFactor: data.require_two_factor !== undefined ? data.require_two_factor : prev.requireTwoFactor,
          ipRestriction: data.ip_restriction !== undefined ? data.ip_restriction : prev.ipRestriction,
          allowedIPs: data.allowed_ips !== undefined ? data.allowed_ips : prev.allowedIPs
        }));

        setNotificationConfig(prev => ({
          ...prev,
          emailNotifications: data.email_notifications !== undefined ? data.email_notifications : prev.emailNotifications,
          systemAlerts: data.system_alerts !== undefined ? data.system_alerts : prev.systemAlerts,
          userActivityLogs: data.user_activity_logs !== undefined ? data.user_activity_logs : prev.userActivityLogs,
          backupNotifications: data.backup_notifications !== undefined ? data.backup_notifications : prev.backupNotifications,
          loanNotifications: data.loan_notifications !== undefined ? data.loan_notifications : prev.loanNotifications,
          paymentNotifications: data.payment_notifications !== undefined ? data.payment_notifications : prev.paymentNotifications
        }));

        setSystemConfig2(prev => ({
          ...prev,
          maintenanceMode: data.system_maintenance_mode !== undefined ? data.system_maintenance_mode : prev.maintenanceMode,
          debugMode: data.debug_mode !== undefined ? data.debug_mode : prev.debugMode,
          logLevel: data.log_level !== undefined ? data.log_level : prev.logLevel,
          backupSchedule: data.backup_schedule !== undefined ? data.backup_schedule : prev.backupSchedule,
          dataRetention: data.data_retention !== undefined ? data.data_retention : prev.dataRetention,
          maxFileSize: data.max_file_upload_size_mb !== undefined ? data.max_file_upload_size_mb : prev.maxFileSize,
          allowedFileTypes: data.allowed_file_types !== undefined ? data.allowed_file_types : prev.allowedFileTypes
        }));
      }
    } catch (err) {
      console.error('Failed to fetch config:', err);
    } finally {
      setFetching(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'System Configuration', icon: SettingsIcon },
    { id: 'security', label: 'Security Settings', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'system', label: 'System Operations', icon: Server }
  ];

  const handleSave = async () => {
    setLoading(true);
    setSaveSuccess(false);
    setSaveError('');
    try {
      const payload = {
        system_name: systemConfig.systemName || 'Microfinance Management System',
        organization_name: systemConfig.organizationName || 'BDU (Poly University)',
        admin_email: systemConfig.adminEmail !== undefined ? systemConfig.adminEmail : user?.email,
        support_email: systemConfig.supportEmail,
        date_format: systemConfig.dateFormat,
        session_timeout_minutes: securityConfig.sessionTimeout,
        password_min_length: securityConfig.passwordMinLength,
        password_expiry_days: securityConfig.passwordExpiry,
        max_login_attempts: securityConfig.maxLoginAttempts,
        lockout_duration_minutes: securityConfig.lockoutDuration,
        require_two_factor: securityConfig.requireTwoFactor,
        ip_restriction: securityConfig.ipRestriction,
        allowed_ips: securityConfig.allowedIPs,
        email_notifications: notificationConfig.emailNotifications,
        system_alerts: notificationConfig.systemAlerts,
        user_activity_logs: notificationConfig.userActivityLogs,
        backup_notifications: notificationConfig.backupNotifications,
        loan_notifications: notificationConfig.loanNotifications,
        payment_notifications: notificationConfig.paymentNotifications,
        system_maintenance_mode: systemConfig2.maintenanceMode,
        debug_mode: systemConfig2.debugMode,
        log_level: systemConfig2.logLevel,
        backup_schedule: systemConfig2.backupSchedule,
        data_retention: systemConfig2.dataRetention,
        max_file_upload_size_mb: systemConfig2.maxFileSize,
        allowed_file_types: systemConfig2.allowedFileTypes
      };

      await adminAPI.updateSystemConfig(payload);
      setSaveSuccess(true);
      setLastSaved(new Date().toLocaleString());
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      setSaveError(error.message || 'Failed to save settings');
      setTimeout(() => setSaveError(''), 5000);
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

      <div>
        {}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="flex gap-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {}
        <div>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="p-6">
              {fetching ? (
                <div className="flex items-center justify-center py-20">
                  <Loader className="w-8 h-8 animate-spin text-blue-500" />
                  <span className="ml-3 text-gray-500 dark:text-gray-400">Loading settings...</span>
                </div>
              ) : (
                <>
                  {activeTab === 'general' && renderGeneralSettings()}
                  {activeTab === 'security' && renderSecuritySettings()}
                  {activeTab === 'notifications' && renderNotificationSettings()}
                  {activeTab === 'system' && renderSystemSettings()}
                </>
              )}
            </div>

            {}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {lastSaved ? `Last saved: ${lastSaved}` : 'Not yet saved'}
                  {saveSuccess && (
                    <span className="ml-3 text-green-600 dark:text-green-400 flex items-center gap-1 inline-flex">
                      <CheckCircle className="w-3.5 h-3.5" /> Saved successfully
                    </span>
                  )}
                  {saveError && (
                    <span className="ml-3 text-red-600 dark:text-red-400 flex items-center gap-1 inline-flex">
                      <XCircle className="w-3.5 h-3.5" /> {saveError}
                    </span>
                  )}
                </div>
                <button
                  onClick={handleSave}
                  disabled={loading || fetching}
                  className={`flex items-center gap-2 px-6 py-2 rounded-md font-medium transition-colors ${
                    loading
                      ? 'bg-blue-400 text-white cursor-wait'
                      : fetching
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {loading ? 'Saving...' : fetching ? 'Loading...' : 'Save Settings'}
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
