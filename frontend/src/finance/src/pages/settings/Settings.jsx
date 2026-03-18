import React, { useState } from 'react';
import { Bell, Shield, Database, Globe, Palette, Users, Clock, Download, Save, RotateCcw, Building2, Mail, Smartphone, CreditCard, FileText, Lock, Eye, EyeOff, ChevronRight, Settings as SettingsIcon, Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('general');
  const [activeSubTab, setActiveSubTab] = useState('company');
  const [showPassword, setShowPassword] = useState(false);
  const [settings, setSettings] = useState({
    // Company Settings
    companyName: 'FinanceHub',
    companyEmail: 'contact@financehub.com',
    companyPhone: '+1 (555) 123-4567',
    companyAddress: '123 Business Ave, Suite 100, New York, NY 10001',
    taxId: '12-3456789',
    
    // General Settings
    currency: 'USD',
    timezone: 'America/New_York',
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    
    // Notification Settings
    emailNotifications: true,
    pushNotifications: false,
    smsNotifications: false,
    weeklyReports: true,
    monthlyReports: true,
    budgetAlerts: true,
    invoiceAlerts: true,
    payrollAlerts: true,
    
    // Security Settings
    twoFactorAuth: false,
    sessionTimeout: '30min',
    passwordMinLength: 8,
    requirePasswordChange: false,
    ipWhitelist: '',
    loginNotifications: true,
    
    // Data & Backup Settings
    dataRetention: '2years',
    autoBackup: true,
    backupFrequency: 'daily',
    backupLocation: 'cloud',
    encryptionEnabled: true,
    
    // Appearance Settings
    theme: 'light',
    accentColor: 'blue',
    sidebarCollapsed: false,
    compactMode: false,
    showAnimations: true
  });

  const navigationStructure = {
    general: {
      name: 'General',
      icon: Globe,
      color: 'blue',
      subTabs: [
        { id: 'company', name: 'Company', icon: Building2 },
        { id: 'preferences', name: 'Preferences', icon: SettingsIcon }
      ]
    },
    notifications: {
      name: 'Notifications',
      icon: Bell,
      color: 'green',
      subTabs: [
        { id: 'email', name: 'Email', icon: Mail },
        { id: 'push', name: 'Push', icon: Smartphone },
        { id: 'sms', name: 'SMS', icon: Smartphone },
        { id: 'alerts', name: 'Alerts', icon: Bell }
      ]
    },
    security: {
      name: 'Security',
      icon: Shield,
      color: 'red',
      subTabs: [
        { id: 'authentication', name: 'Authentication', icon: Lock },
        { id: 'privacy', name: 'Privacy', icon: Eye },
        { id: 'access', name: 'Access Control', icon: Shield }
      ]
    },
    data: {
      name: 'Data & Backup',
      icon: Database,
      color: 'purple',
      subTabs: [
        { id: 'retention', name: 'Data Retention', icon: Clock },
        { id: 'backup', name: 'Backup', icon: Download },
        { id: 'encryption', name: 'Encryption', icon: Lock }
      ]
    },
    appearance: {
      name: 'Appearance',
      icon: Palette,
      color: 'indigo',
      subTabs: [
        { id: 'theme', name: 'Theme', icon: Palette },
        { id: 'layout', name: 'Layout', icon: SettingsIcon },
        { id: 'display', name: 'Display', icon: Eye }
      ]
    },
    billing: {
      name: 'Billing',
      icon: CreditCard,
      color: 'yellow',
      subTabs: [
        { id: 'subscription', name: 'Subscription', icon: CreditCard },
        { id: 'invoices', name: 'Invoices', icon: FileText },
        { id: 'payment', name: 'Payment Methods', icon: CreditCard }
      ]
    }
  };

  const saveSettings = () => {
    console.log('Settings saved:', settings);
  };

  const resetSettings = () => {
    if (confirm('Are you sure you want to reset all settings to default?')) {
      setSettings({
        companyName: 'FinanceHub',
        companyEmail: 'contact@financehub.com',
        companyPhone: '+1 (555) 123-4567',
        companyAddress: '123 Business Ave, Suite 100, New York, NY 10001',
        taxId: '12-3456789',
        currency: 'USD',
        timezone: 'America/New_York',
        language: 'en',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        emailNotifications: true,
        pushNotifications: false,
        smsNotifications: false,
        weeklyReports: true,
        monthlyReports: true,
        budgetAlerts: true,
        invoiceAlerts: true,
        payrollAlerts: true,
        twoFactorAuth: false,
        sessionTimeout: '30min',
        passwordMinLength: 8,
        requirePasswordChange: false,
        ipWhitelist: '',
        loginNotifications: true,
        dataRetention: '2years',
        autoBackup: true,
        backupFrequency: 'daily',
        backupLocation: 'cloud',
        encryptionEnabled: true,
        theme: 'light',
        accentColor: 'blue',
        sidebarCollapsed: false,
        compactMode: false,
        showAnimations: true
      });
    }
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-700 border-blue-200',
      green: 'bg-green-100 text-green-700 border-green-200',
      red: 'bg-red-100 text-red-700 border-red-200',
      purple: 'bg-purple-100 text-purple-700 border-purple-200',
      indigo: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200'
    };
    return colors[color] || colors.blue;
  };

  const getIconColorClasses = (color) => {
    const colors = {
      blue: 'text-blue-600',
      green: 'text-green-600',
      red: 'text-red-600',
      purple: 'text-purple-600',
      indigo: 'text-indigo-600',
      yellow: 'text-yellow-600'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="p-8 min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="w-full">
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center space-x-6">
            <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
              <SettingsIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Settings
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                Manage your application settings and preferences
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Navigation */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Categories</h3>
              <nav className="space-y-2">
                {Object.entries(navigationStructure).map(([key, section]) => {
                  const Icon = section.icon;
                  const isActive = activeTab === key;
                  return (
                    <div key={key} className="mb-4">
                      <button
                        onClick={() => {
                          setActiveTab(key);
                          setActiveSubTab(section.subTabs[0].id);
                        }}
                        className={`w-full flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                          isActive
                            ? getColorClasses(section.color)
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className={`h-5 w-5 mr-3 ${isActive ? '' : getIconColorClasses(section.color)}`} />
                        {section.name}
                      </button>
                      
                      {/* Sub Navigation */}
                      {isActive && (
                        <div className="ml-8 mt-2 space-y-1">
                          {section.subTabs.map((subTab) => {
                            const SubIcon = subTab.icon;
                            const isSubActive = activeSubTab === subTab.id;
                            return (
                              <button
                                key={subTab.id}
                                onClick={() => setActiveSubTab(subTab.id)}
                                className={`w-full flex items-center px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                                  isSubActive
                                    ? 'bg-gray-100 text-gray-900'
                                    : 'text-gray-500 hover:bg-gray-50'
                                }`}
                              >
                                <SubIcon className={`h-3 w-3 mr-2 ${isSubActive ? 'text-gray-700' : 'text-gray-400'}`} />
                                {subTab.name}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-9">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              {/* Company Settings */}
              {activeTab === 'general' && activeSubTab === 'company' && (
                <div className="space-y-8">
                  <div className="flex items-center space-x-4 pb-6 border-b border-gray-200">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <Building2 className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        Company Information
                      </h2>
                      <p className="text-gray-600">Update your company details and contact information</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={settings.companyName}
                        onChange={(e) => setSettings({...settings, companyName: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Company Email
                      </label>
                      <input
                        type="email"
                        value={settings.companyEmail}
                        onChange={(e) => setSettings({...settings, companyEmail: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Company Phone
                      </label>
                      <input
                        type="tel"
                        value={settings.companyPhone}
                        onChange={(e) => setSettings({...settings, companyPhone: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Tax ID
                      </label>
                      <input
                        type="text"
                        value={settings.taxId}
                        onChange={(e) => setSettings({...settings, taxId: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Company Address
                    </label>
                    <textarea
                      value={settings.companyAddress}
                      onChange={(e) => setSettings({...settings, companyAddress: e.target.value})}
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Preferences Settings */}
              {activeTab === 'general' && activeSubTab === 'preferences' && (
                <div className="space-y-8">
                  <div className="flex items-center space-x-4 pb-6 border-b border-gray-200">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <SettingsIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        General Preferences
                      </h2>
                      <p className="text-gray-600">Configure your regional and display preferences</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Default Currency
                      </label>
                      <select
                        value={settings.currency}
                        onChange={(e) => setSettings({...settings, currency: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                      >
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GBP">GBP - British Pound</option>
                        <option value="JPY">JPY - Japanese Yen</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Timezone
                      </label>
                      <select
                        value={settings.timezone}
                        onChange={(e) => setSettings({...settings, timezone: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                      >
                        <option value="America/New_York">Eastern Time</option>
                        <option value="America/Chicago">Central Time</option>
                        <option value="America/Denver">Mountain Time</option>
                        <option value="America/Los_Angeles">Pacific Time</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Language
                      </label>
                      <select
                        value={settings.language}
                        onChange={(e) => setSettings({...settings, language: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Date Format
                      </label>
                      <select
                        value={settings.dateFormat}
                        onChange={(e) => setSettings({...settings, dateFormat: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                      >
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Time Format
                      </label>
                      <select
                        value={settings.timeFormat}
                        onChange={(e) => setSettings({...settings, timeFormat: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                      >
                        <option value="12h">12-hour</option>
                        <option value="24h">24-hour</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Email Notifications */}
              {activeTab === 'notifications' && activeSubTab === 'email' && (
                <div className="space-y-8">
                  <div className="flex items-center space-x-4 pb-6 border-b border-gray-200">
                    <div className="p-3 bg-green-100 rounded-xl">
                      <Mail className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        Email Notifications
                      </h2>
                      <p className="text-gray-600">Manage your email notification preferences</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          General Email Notifications
                        </h3>
                        <p className="text-gray-600">
                          Receive important updates via email
                        </p>
                      </div>
                      <button
                        onClick={() => setSettings({...settings, emailNotifications: !settings.emailNotifications})}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                          settings.emailNotifications ? 'bg-green-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                            settings.emailNotifications ? 'translate-x-7' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Weekly Reports
                        </h3>
                        <p className="text-gray-600">
                          Receive weekly financial summary reports
                        </p>
                      </div>
                      <button
                        onClick={() => setSettings({...settings, weeklyReports: !settings.weeklyReports})}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                          settings.weeklyReports ? 'bg-green-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                            settings.weeklyReports ? 'translate-x-7' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Monthly Reports
                        </h3>
                        <p className="text-gray-600">
                          Receive monthly comprehensive reports
                        </p>
                      </div>
                      <button
                        onClick={() => setSettings({...settings, monthlyReports: !settings.monthlyReports})}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                          settings.monthlyReports ? 'bg-green-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                            settings.monthlyReports ? 'translate-x-7' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && activeSubTab === 'authentication' && (
                <div className="space-y-8">
                  <div className="flex items-center space-x-4 pb-6 border-b border-gray-200">
                    <div className="p-3 bg-red-100 rounded-xl">
                      <Lock className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        Authentication Settings
                      </h2>
                      <p className="text-gray-600">Manage your security and authentication preferences</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-6 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-200">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Two-Factor Authentication
                        </h3>
                        <p className="text-gray-600">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <button
                        onClick={() => setSettings({...settings, twoFactorAuth: !settings.twoFactorAuth})}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                          settings.twoFactorAuth ? 'bg-red-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                            settings.twoFactorAuth ? 'translate-x-7' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Session Timeout
                        </label>
                        <select
                          value={settings.sessionTimeout}
                          onChange={(e) => setSettings({...settings, sessionTimeout: e.target.value})}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 text-lg"
                        >
                          <option value="15min">15 minutes</option>
                          <option value="30min">30 minutes</option>
                          <option value="1hour">1 hour</option>
                          <option value="4hours">4 hours</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Minimum Password Length
                        </label>
                        <input
                          type="number"
                          value={settings.passwordMinLength}
                          onChange={(e) => setSettings({...settings, passwordMinLength: parseInt(e.target.value)})}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 text-lg"
                          min="6"
                          max="20"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Theme Settings */}
              {activeTab === 'appearance' && activeSubTab === 'theme' && (
                <div className="space-y-8">
                  <div className="flex items-center space-x-4 pb-6 border-b border-gray-200">
                    <div className="p-3 bg-indigo-100 rounded-xl">
                      <Palette className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        Theme Settings
                      </h2>
                      <p className="text-gray-600">Customize your application appearance</p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Theme
                      </label>
                      <div className="grid grid-cols-3 gap-4">
                        <button
                          onClick={() => setSettings({...settings, theme: 'light'})}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            settings.theme === 'light' 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <Sun className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
                          <span className="text-sm font-medium">Light</span>
                        </button>
                        <button
                          onClick={() => setSettings({...settings, theme: 'dark'})}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            settings.theme === 'dark' 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <Moon className="h-6 w-6 mx-auto mb-2 text-indigo-600" />
                          <span className="text-sm font-medium">Dark</span>
                        </button>
                        <button
                          onClick={() => setSettings({...settings, theme: 'system'})}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            settings.theme === 'system' 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <Monitor className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                          <span className="text-sm font-medium">System</span>
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Accent Color
                      </label>
                      <div className="flex gap-3">
                        {['blue', 'green', 'purple', 'red', 'orange', 'yellow'].map((color) => (
                          <button
                            key={color}
                            onClick={() => setSettings({...settings, accentColor: color})}
                            className={`w-12 h-12 rounded-full bg-${color}-500 transition-all ${
                              settings.accentColor === color ? 'ring-4 ring-offset-2 ring-' + color + '-500 scale-110' : 'hover:scale-105'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between pt-8 border-t border-gray-200">
                <button
                  onClick={resetSettings}
                  className="flex items-center px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  <RotateCcw className="h-5 w-5 mr-2" />
                  Reset to Default
                </button>
                <button
                  onClick={saveSettings}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  <Save className="h-5 w-5 mr-2" />
                  Save Changes
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
