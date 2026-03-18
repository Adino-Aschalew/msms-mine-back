import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext2';
import { 
  Globe, 
  Palette, 
  Bell, 
  Clock, 
  Save,
  Moon,
  Sun,
  Monitor
} from 'lucide-react';

const Preferences = () => {
  const { theme, toggleTheme } = useTheme();
  
  const [preferences, setPreferences] = useState({
    language: 'en',
    theme: theme,
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    emailNotifications: true,
    pushNotifications: false,
    smsNotifications: false,
    weeklyDigest: true,
    securityAlerts: true,
    marketingEmails: false
  });

  const [saveMessage, setSaveMessage] = useState('');

  const handlePreferenceChange = (category, field, value) => {
    setPreferences(prev => ({
      ...prev,
      [category === 'general' ? field : category]: value
    }));
  };

  const handleSave = () => {
    // Save preferences logic here
    console.log('Preferences saved:', preferences);
    setSaveMessage('Preferences saved successfully!');
    
    // Clear message after 3 seconds
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'ja', name: 'Japanese' },
    { code: 'zh', name: 'Chinese' }
  ];

  const timezones = [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
    { value: 'EST', label: 'EST (Eastern Standard Time)' },
    { value: 'PST', label: 'PST (Pacific Standard Time)' },
    { value: 'GMT', label: 'GMT (Greenwich Mean Time)' },
    { value: 'CET', label: 'CET (Central European Time)' },
    { value: 'JST', label: 'JST (Japan Standard Time)' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Preferences</h1>
        <p className="text-gray-600 dark:text-gray-400">Customize your account preferences and settings.</p>
      </div>

      {saveMessage && (
        <div className="rounded-lg bg-green-50 p-4 text-green-700 dark:bg-green-900/20 dark:text-green-400">
          {saveMessage}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* General Preferences */}
        <div className="lg:col-span-2">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">General Preferences</h2>
            
            <div className="space-y-6">
              {/* Language */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <Globe className="inline h-4 w-4 mr-2" />
                  Language
                </label>
                <select
                  value={preferences.language}
                  onChange={(e) => handlePreferenceChange('general', 'language', e.target.value)}
                  className="input"
                >
                  {languages.map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Theme */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <Palette className="inline h-4 w-4 mr-2" />
                  Theme Preference
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'light', label: 'Light', icon: <Sun className="h-4 w-4" /> },
                    { value: 'dark', label: 'Dark', icon: <Moon className="h-4 w-4" /> },
                    { value: 'system', label: 'System', icon: <Monitor className="h-4 w-4" /> }
                  ].map(themeOption => (
                    <button
                      key={themeOption.value}
                      onClick={() => {
                        handlePreferenceChange('general', 'theme', themeOption.value);
                        toggleTheme(themeOption.value);
                      }}
                      className={`flex items-center justify-center gap-2 rounded-lg border-2 p-3 transition-colors ${
                        preferences.theme === themeOption.value
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {themeOption.icon}
                      <span className="text-sm font-medium">{themeOption.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Timezone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <Clock className="inline h-4 w-4 mr-2" />
                  Timezone
                </label>
                <select
                  value={preferences.timezone}
                  onChange={(e) => handlePreferenceChange('general', 'timezone', e.target.value)}
                  className="input"
                >
                  {timezones.map(tz => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Format */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date Format
                </label>
                <select
                  value={preferences.dateFormat}
                  onChange={(e) => handlePreferenceChange('general', 'dateFormat', e.target.value)}
                  className="input"
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  <option value="DD.MM.YYYY">DD.MM.YYYY</option>
                </select>
              </div>

              {/* Time Format */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Time Format
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: '12h', label: '12-hour (AM/PM)' },
                    { value: '24h', label: '24-hour' }
                  ].map(format => (
                    <button
                      key={format.value}
                      onClick={() => handlePreferenceChange('general', 'timeFormat', format.value)}
                      className={`rounded-lg border-2 p-3 text-sm font-medium transition-colors ${
                        preferences.timeFormat === format.value
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {format.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="card p-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              <Bell className="inline h-5 w-5 mr-2" />
              Notification Preferences
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Email Notifications</h3>
                  <p className="text-sm text-gray-500">Receive notifications via email</p>
                </div>
                <button
                  onClick={() => handlePreferenceChange('emailNotifications', null, !preferences.emailNotifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.emailNotifications ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Push Notifications</h3>
                  <p className="text-sm text-gray-500">Receive push notifications in browser</p>
                </div>
                <button
                  onClick={() => handlePreferenceChange('pushNotifications', null, !preferences.pushNotifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.pushNotifications ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">SMS Notifications</h3>
                  <p className="text-sm text-gray-500">Receive notifications via SMS</p>
                </div>
                <button
                  onClick={() => handlePreferenceChange('smsNotifications', null, !preferences.smsNotifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.smsNotifications ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.smsNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Weekly Digest</h3>
                  <p className="text-sm text-gray-500">Receive weekly activity summary</p>
                </div>
                <button
                  onClick={() => handlePreferenceChange('weeklyDigest', null, !preferences.weeklyDigest)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.weeklyDigest ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.weeklyDigest ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Security Alerts</h3>
                  <p className="text-sm text-gray-500">Get notified about security events</p>
                </div>
                <button
                  onClick={() => handlePreferenceChange('securityAlerts', null, !preferences.securityAlerts)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.securityAlerts ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.securityAlerts ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Marketing Emails</h3>
                  <p className="text-sm text-gray-500">Receive product updates and promotions</p>
                </div>
                <button
                  onClick={() => handlePreferenceChange('marketingEmails', null, !preferences.marketingEmails)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.marketingEmails ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.marketingEmails ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
            
            <div className="space-y-3">
              <button className="btn-secondary w-full text-left">
                Export Preferences
              </button>
              <button className="btn-secondary w-full text-left">
                Reset to Defaults
              </button>
              <button className="btn-secondary w-full text-left">
                Download Data
              </button>
            </div>
          </div>

          <div className="card p-6 mt-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Current Settings</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Language:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {languages.find(l => l.code === preferences.language)?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Theme:</span>
                <span className="font-medium text-gray-900 dark:text-white capitalize">
                  {preferences.theme}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Timezone:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {preferences.timezone}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date Format:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {preferences.dateFormat}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Time Format:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {preferences.timeFormat === '12h' ? '12-hour' : '24-hour'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleSave}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Preferences;
