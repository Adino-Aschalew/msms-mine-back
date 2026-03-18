import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext2';
import { 
  Settings as SettingsIcon, 
  Shield, 
  Bell, 
  Palette, 
  Server,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('general');
  const [showPasswords, setShowPasswords] = useState({});

  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'Admin Dashboard',
    systemEmail: 'admin@example.com',
    adminContact: 'admin@example.com',
    timezone: 'UTC',
    language: 'en'
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: true,
    sessionTimeout: '30',
    passwordPolicy: 'strong',
    loginAlerts: true
  });

  const [notificationSettings, setNotificationSettings] = useState({
    newUserRegistration: true,
    adminLogin: true,
    systemErrors: true,
    backupCompletion: false
  });

  const [appearanceSettings, setAppearanceSettings] = useState({
    themeMode: theme,
    primaryColor: 'blue',
    sidebarStyle: 'dark'
  });

  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    debugMode: false,
    logLevel: 'info',
    backupFrequency: 'daily'
  });

  const tabs = [
    { id: 'general', label: 'General', icon: <SettingsIcon className="h-6 w-6" /> },
    { id: 'security', label: 'Security', icon: <Shield className="h-6 w-6" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="h-6 w-6" /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette className="h-6 w-6" /> },
    { id: 'system', label: 'System', icon: <Server className="h-6 w-6" /> }
  ];

  const handleSave = () => {
    // Save settings logic here
    console.log('Settings saved:', {
      general: generalSettings,
      security: securitySettings,
      notifications: notificationSettings,
      appearance: appearanceSettings,
      system: systemSettings
    });
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-xl font-medium text-gray-700 dark:text-gray-300 mb-1">
          Site Name
        </label>
        <input
          type="text"
          value={generalSettings.siteName}
          onChange={(e) => setGeneralSettings(prev => ({ ...prev, siteName: e.target.value }))}
          className="input border-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          System Email
        </label>
        <input
          type="email"
          value={generalSettings.systemEmail}
          onChange={(e) => setGeneralSettings(prev => ({ ...prev, systemEmail: e.target.value }))}
          className="input"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Admin Contact
        </label>
        <input
          type="email"
          value={generalSettings.adminContact}
          onChange={(e) => setGeneralSettings(prev => ({ ...prev, adminContact: e.target.value }))}
          className="input"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Timezone
        </label>
        <select
          value={generalSettings.timezone}
          onChange={(e) => setGeneralSettings(prev => ({ ...prev, timezone: e.target.value }))}
          className="input"
        >
          <option value="UTC">UTC</option>
          <option value="EST">EST</option>
          <option value="PST">PST</option>
          <option value="GMT">GMT</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Language
        </label>
        <select
          value={generalSettings.language}
          onChange={(e) => setGeneralSettings(prev => ({ ...prev, language: e.target.value }))}
          className="input"
        >
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
        </select>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Two Factor Authentication
          </label>
          <p className="text-sm text-gray-500">Require 2FA for all admin accounts</p>
        </div>
        <button
          onClick={() => setSecuritySettings(prev => ({ ...prev, twoFactorAuth: !prev.twoFactorAuth }))}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            securitySettings.twoFactorAuth ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              securitySettings.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Session Timeout (minutes)
        </label>
        <input
          type="number"
          value={securitySettings.sessionTimeout}
          onChange={(e) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: e.target.value }))}
          className="input"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Password Policy
        </label>
        <select
          value={securitySettings.passwordPolicy}
          onChange={(e) => setSecuritySettings(prev => ({ ...prev, passwordPolicy: e.target.value }))}
          className="input"
        >
          <option value="basic">Basic (8+ characters)</option>
          <option value="strong">Strong (8+ chars, uppercase, number, symbol)</option>
          <option value="very-strong">Very Strong (12+ chars, mixed case, numbers, symbols)</option>
        </select>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Login Alerts
          </label>
          <p className="text-sm text-gray-500">Notify admins of new login attempts</p>
        </div>
        <button
          onClick={() => setSecuritySettings(prev => ({ ...prev, loginAlerts: !prev.loginAlerts }))}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            securitySettings.loginAlerts ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              securitySettings.loginAlerts ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            New User Registration Alerts
          </label>
          <p className="text-sm text-gray-500">Notify when new users register</p>
        </div>
        <button
          onClick={() => setNotificationSettings(prev => ({ ...prev, newUserRegistration: !prev.newUserRegistration }))}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            notificationSettings.newUserRegistration ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              notificationSettings.newUserRegistration ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Admin Login Alerts
          </label>
          <p className="text-sm text-gray-500">Notify when admins log in</p>
        </div>
        <button
          onClick={() => setNotificationSettings(prev => ({ ...prev, adminLogin: !prev.adminLogin }))}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            notificationSettings.adminLogin ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              notificationSettings.adminLogin ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            System Error Notifications
          </label>
          <p className="text-sm text-gray-500">Notify of system errors</p>
        </div>
        <button
          onClick={() => setNotificationSettings(prev => ({ ...prev, systemErrors: !prev.systemErrors }))}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            notificationSettings.systemErrors ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              notificationSettings.systemErrors ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Backup Completion Alerts
          </label>
          <p className="text-sm text-gray-500">Notify when backups complete</p>
        </div>
        <button
          onClick={() => setNotificationSettings(prev => ({ ...prev, backupCompletion: !prev.backupCompletion }))}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            notificationSettings.backupCompletion ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              notificationSettings.backupCompletion ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Theme Mode
        </label>
        <select
          value={appearanceSettings.themeMode}
          onChange={(e) => {
            setAppearanceSettings(prev => ({ ...prev, themeMode: e.target.value }));
            toggleTheme(e.target.value);
          }}
          className="input"
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="system">System</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Sidebar Style
        </label>
        <div className="grid gap-2">
          {['dark', 'light', 'transparent'].map(style => (
            <button
              key={style}
              onClick={() => setAppearanceSettings(prev => ({ ...prev, sidebarStyle: style }))}
              className={`p-3 rounded-lg border-2 capitalize ${
                appearanceSettings.sidebarStyle === style
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              {style}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Maintenance Mode
          </label>
          <p className="text-sm text-gray-500">Put the system in maintenance mode</p>
        </div>
        <button
          onClick={() => setSystemSettings(prev => ({ ...prev, maintenanceMode: !prev.maintenanceMode }))}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            systemSettings.maintenanceMode ? 'bg-red-600' : 'bg-gray-200 dark:bg-gray-700'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              systemSettings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Debug Mode
          </label>
          <p className="text-sm text-gray-500">Enable debug logging</p>
        </div>
        <button
          onClick={() => setSystemSettings(prev => ({ ...prev, debugMode: !prev.debugMode }))}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            systemSettings.debugMode ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              systemSettings.debugMode ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Log Level
        </label>
        <select
          value={systemSettings.logLevel}
          onChange={(e) => setSystemSettings(prev => ({ ...prev, logLevel: e.target.value }))}
          className="input"
        >
          <option value="error">Error</option>
          <option value="warn">Warning</option>
          <option value="info">Info</option>
          <option value="debug">Debug</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Backup Frequency
        </label>
        <select
          value={systemSettings.backupFrequency}
          onChange={(e) => setSystemSettings(prev => ({ ...prev, backupFrequency: e.target.value }))}
          className="input"
        >
          <option value="hourly">Hourly</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'security':
        return renderSecuritySettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'appearance':
        return renderAppearanceSettings();
      case 'system':
        return renderSystemSettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your system settings and preferences.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card p-4">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 capitalize">
              {activeTab} Settings
            </h2>
            
            {renderTabContent()}

            <div className="mt-8 flex justify-end">
              <button onClick={handleSave} className="px-2 py-3 btn-primary flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
