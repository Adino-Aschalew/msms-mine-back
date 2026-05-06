import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Lock, 
  User,
  Download,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  Smartphone
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import SettingsAPI from '../services/settingsAPI';

const UnifiedSettings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });

  // Settings state
  const [personalSettings, setPersonalSettings] = useState({
    theme: 'light',
    emailNotifications: true,
    pushNotifications: false
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailAlerts: true,
    systemUpdates: true,
    securityAlerts: true,
    weeklyReports: false
  });

  const [systemSettings, setSystemSettings] = useState({
    sessionTimeout: 30,
    maxFileSize: 10
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [loginAttempts, setLoginAttempts] = useState([]);

  // Load settings on component mount
  useEffect(() => {
    loadAllSettings();
    if (user?.role === 'ADMIN' || user?.role === 'HR') {
      loadSystemSettings();
    }
  }, [user]);

  const loadAllSettings = async () => {
    try {
      setLoading(true);
      const response = await SettingsAPI.getAllUserPreferences();
      
      if (response.success) {
        setPersonalSettings(response.data.personal || {});
        setSecuritySettings(response.data.security || {});
        setNotificationSettings(response.data.notifications || {});
      }
    } catch (error) {
      showMessage('error', 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const loadSystemSettings = async () => {
    try {
      const response = await SettingsAPI.getSystemSettings('system');
      if (response.success) {
        setSystemSettings(response.data);
      }
    } catch (error) {
      console.error('Failed to load system settings:', error);
    }
  };

  const loadLoginAttempts = async () => {
    try {
      const response = await SettingsAPI.getLoginAttempts();
      if (response.success) {
        setLoginAttempts(response.data);
      }
    } catch (error) {
      console.error('Failed to load login attempts:', error);
    }
  };

  const savePersonalSettings = async () => {
    try {
      setSaving(true);
      const response = await SettingsAPI.updatePersonalSettings(personalSettings);
      if (response.success) {
        showMessage('success', 'Personal settings saved successfully');
      }
    } catch (error) {
      showMessage('error', 'Failed to save personal settings');
    } finally {
      setSaving(false);
    }
  };

  const saveSecuritySettings = async () => {
    try {
      setSaving(true);
      const response = await SettingsAPI.updateSecuritySettings(securitySettings);
      if (response.success) {
        showMessage('success', 'Security settings saved successfully');
      }
    } catch (error) {
      showMessage('error', 'Failed to save security settings');
    } finally {
      setSaving(false);
    }
  };

  const saveNotificationSettings = async () => {
    try {
      setSaving(true);
      const response = await SettingsAPI.updateNotificationSettings(notificationSettings);
      if (response.success) {
        showMessage('success', 'Notification settings saved successfully');
      }
    } catch (error) {
      showMessage('error', 'Failed to save notification settings');
    } finally {
      setSaving(false);
    }
  };

  const saveSystemSettings = async () => {
    try {
      setSaving(true);
      const response = await SettingsAPI.updateSystemSettingsAdmin(systemSettings);
      if (response.success) {
        showMessage('success', 'System settings saved successfully');
      }
    } catch (error) {
      showMessage('error', 'Failed to save system settings');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    const validation = SettingsAPI.validatePasswordChange(passwordData);
    if (!validation.isValid) {
      showMessage('error', validation.errors.join(', '));
      return;
    }

    try {
      setSaving(true);
      const response = await SettingsAPI.changePassword(passwordData);
      if (response.success) {
        showMessage('success', 'Password changed successfully');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      showMessage('error', 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const exportLoginAttempts = async () => {
    try {
      const response = await SettingsAPI.getLoginAttempts({ export: 'true' });
      if (response.success && response.isCSV) {
        // Create download link
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'login-attempts.csv';
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      showMessage('error', 'Failed to export login attempts');
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const isAdminOrHR = user?.role === 'ADMIN' || user?.role === 'HR';

  const tabs = [
    { id: 'personal', label: 'Personal', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    ...(isAdminOrHR ? [{ id: 'system', label: 'System', icon: SettingsIcon }] : [])
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600 dark:text-gray-400">Loading settings...</span>
            </div>
          ) : (
            <>
              {/* Personal Settings */}
              {activeTab === 'personal' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Personal Settings
                  </h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Theme
                    </label>
                    <select
                      value={personalSettings.theme}
                      onChange={(e) => setPersonalSettings({ ...personalSettings, theme: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="system">System</option>
                    </select>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Email Notifications</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications via email</p>
                      </div>
                      <button
                        onClick={() => setPersonalSettings({ ...personalSettings, emailNotifications: !personalSettings.emailNotifications })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          personalSettings.emailNotifications ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            personalSettings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Push Notifications</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Browser push notifications</p>
                      </div>
                      <button
                        onClick={() => setPersonalSettings({ ...personalSettings, pushNotifications: !personalSettings.pushNotifications })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          personalSettings.pushNotifications ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            personalSettings.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={savePersonalSettings}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Personal Settings
                  </button>
                </div>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Security Settings
                  </h2>

                  {/* Password Change */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Change Password</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.current ? 'text' : 'password'}
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                            className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.new ? 'text' : 'password'}
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                            className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.confirm ? 'text' : 'password'}
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                            className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={changePassword}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                        Change Password
                      </button>
                    </div>
                  </div>

                  {/* Login Attempts */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Login Attempts</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={loadLoginAttempts}
                          className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Refresh
                        </button>
                        <button
                          onClick={exportLoginAttempts}
                          className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/50"
                        >
                          <Download className="w-4 h-4" />
                          Export CSV
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {loginAttempts.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                          No login attempts found
                        </p>
                      ) : (
                        loginAttempts.map((attempt, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${
                                attempt.action === 'LOGIN_SUCCESS' ? 'bg-green-500' : 'bg-red-500'
                              }`} />
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {attempt.action === 'LOGIN_SUCCESS' ? 'Successful Login' : 'Failed Login'}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(attempt.created_at).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {attempt.ip_address}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Notification Settings */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Notification Preferences
                  </h2>

                  <div className="space-y-4">
                    {Object.entries({
                      emailAlerts: { label: 'Email Alerts', description: 'Receive important updates via email' },
                      systemUpdates: { label: 'System Updates', description: 'Notifications about system changes' },
                      securityAlerts: { label: 'Security Alerts', description: 'Important security notifications' },
                      weeklyReports: { label: 'Weekly Reports', description: 'Summary of weekly activities' }
                    }).map(([key, config]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white">{config.label}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{config.description}</p>
                        </div>
                        <button
                          onClick={() => setNotificationSettings({ ...notificationSettings, [key]: !notificationSettings[key] })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            notificationSettings[key] ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              notificationSettings[key] ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={saveNotificationSettings}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Notification Settings
                  </button>
                </div>
              )}

              {/* System Settings (Admin/HR only) */}
              {activeTab === 'system' && isAdminOrHR && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    System Settings
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Session Timeout (minutes)
                      </label>
                      <input
                        type="number"
                        min="5"
                        max="480"
                        value={systemSettings.sessionTimeout}
                        onChange={(e) => setSystemSettings({ ...systemSettings, sessionTimeout: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Auto-logout after period of inactivity (5-480 minutes)
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Max File Size (MB)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={systemSettings.maxFileSize}
                        onChange={(e) => setSystemSettings({ ...systemSettings, maxFileSize: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Maximum upload file size (1-100 MB)
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={saveSystemSettings}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save System Settings
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UnifiedSettings;
