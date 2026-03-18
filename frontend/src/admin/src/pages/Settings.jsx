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
  Zap,
  HardDrive
} from 'lucide-react';

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);

  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'MSMS Admin Panel',
    systemEmail: 'admin@msms.com',
    adminContact: 'support@msms.com',
    timezone: 'UTC+3 (East Africa)',
    language: 'en'
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: true,
    sessionTimeout: '30',
    passwordPolicy: 'strong',
    loginAlerts: true,
    ipWhitelisting: false
  });

  const [notificationSettings, setNotificationSettings] = useState({
    newUserRegistration: true,
    adminLogin: true,
    systemErrors: true,
    backupCompletion: true
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
    { id: 'general', label: 'General Configuration', icon: <SettingsIcon className="h-4 w-4" />, description: 'Core system identity and regional settings' },
    { id: 'security', label: 'Security & Access', icon: <Shield className="h-4 w-4" />, description: 'Authentication policies and access control' },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" />, description: 'Global alert and dispatch preferences' },
    { id: 'appearance', label: 'Interface Styling', icon: <Palette className="h-4 w-4" />, description: 'Visual parameters and theme options' },
    { id: 'system', label: 'Infrastructure', icon: <Server className="h-4 w-4" />, description: 'Maintenance, logs, and system health' }
  ];

  const handleSave = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    console.log('Settings persisted to database');
    setLoading(false);
  };

  const SectionTitle = ({ title, subtitle }) => (
    <div className="mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
      <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white">{title}</h3>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );

  const renderGeneralSettings = () => (
    <div className="space-y-8">
      <SectionTitle title="System Identity" subtitle="Configure base branding and contact points" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2">System Title</label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={generalSettings.siteName}
              onChange={(e) => setGeneralSettings(prev => ({ ...prev, siteName: e.target.value }))}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-1 focus:ring-blue-500 font-medium"
            />
          </div>
        </div>
        <div>
          <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2">System Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="email"
              value={generalSettings.systemEmail}
              onChange={(e) => setGeneralSettings(prev => ({ ...prev, systemEmail: e.target.value }))}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-1 focus:ring-blue-500 font-medium"
            />
          </div>
        </div>
      </div>

      <SectionTitle title="Regional Preferences" subtitle="Time and locale standards" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2">Timezone Standard</label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={generalSettings.timezone}
              onChange={(e) => setGeneralSettings(prev => ({ ...prev, timezone: e.target.value }))}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-1 focus:ring-blue-500 font-medium"
            >
              <option value="UTC">UTC (Universal)</option>
              <option value="UTC+3 (East Africa)">UTC+3 (East Africa)</option>
              <option value="EST">EST (Eastern Standard)</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2">System Language</label>
          <select
            value={generalSettings.language}
            onChange={(e) => setGeneralSettings(prev => ({ ...prev, language: e.target.value }))}
            className="w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-1 focus:ring-blue-500 font-medium"
          >
            <option value="en">English (International)</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-8">
      <SectionTitle title="Access Control" subtitle="Multi-factor and session parameters" />
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700/50">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">Strict Two-Factor Authentication</p>
              <p className="text-xs text-gray-500">Require MFA verification for every login attempt</p>
            </div>
          </div>
          <button
            onClick={() => setSecuritySettings(prev => ({ ...prev, twoFactorAuth: !prev.twoFactorAuth }))}
            className={`w-12 h-6 rounded-full transition-colors relative ${securitySettings.twoFactorAuth ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'}`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${securitySettings.twoFactorAuth ? 'right-1' : 'left-1'}`} />
          </button>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700/50">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-red-100 dark:bg-red-900/40 flex items-center justify-center text-red-600">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">IP Whitelisting</p>
              <p className="text-xs text-gray-500">Only allow connections from approved static IP addresses</p>
            </div>
          </div>
          <button
            onClick={() => setSecuritySettings(prev => ({ ...prev, ipWhitelisting: !prev.ipWhitelisting }))}
            className={`w-12 h-6 rounded-full transition-colors relative ${securitySettings.ipWhitelisting ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'}`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${securitySettings.ipWhitelisting ? 'right-1' : 'left-1'}`} />
          </button>
        </div>
      </div>

      <SectionTitle title="Policy Definition" subtitle="Account lifecycle and complexity standards" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2">Session Timeout (Min)</label>
          <input
            type="number"
            value={securitySettings.sessionTimeout}
            onChange={(e) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: e.target.value }))}
            className="w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-1 focus:ring-blue-500 font-medium"
          />
        </div>
        <div>
          <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2">Complexity Requirement</label>
          <select
            value={securitySettings.passwordPolicy}
            onChange={(e) => setSecuritySettings(prev => ({ ...prev, passwordPolicy: e.target.value }))}
            className="w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-1 focus:ring-blue-500 font-medium"
          >
            <option value="basic">Standard Level</option>
            <option value="strong">High Security (Recommended)</option>
            <option value="very-strong">Enterprise Level</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-8">
      <SectionTitle title="Global Alerts" subtitle="Control when the system broadcasts messages" />
      <div className="grid gap-3">
        {[
          { key: 'newUserRegistration', label: 'New Registrations', desc: 'Alert when a new user enters the system' },
          { key: 'adminLogin', label: 'Admin Activity', desc: 'Alert for every system administration login' },
          { key: 'systemErrors', label: 'Failure Conditions', desc: 'Critical alert for application-level errors' },
          { key: 'backupCompletion', label: 'Backup Status', desc: 'Confirm successful automated state backups' }
        ].map(item => (
          <div key={item.key} className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 last:border-0">
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{item.label}</p>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </div>
            <button
              onClick={() => setNotificationSettings(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
              className={`w-10 h-5 rounded-full transition-colors relative ${notificationSettings[item.key] ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${notificationSettings[item.key] ? 'right-0.5' : 'left-0.5'}`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-8">
      <SectionTitle title="Visual Environment" subtitle="Interface modes and color standards" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-3 text-center">Base Theme</label>
          <div className="grid grid-cols-2 gap-3">
            {['light', 'dark'].map(m => (
              <button
                key={m}
                onClick={() => toggleTheme(m)}
                className={`py-6 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${theme === m ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/10' : 'border-gray-100 dark:border-gray-800 hover:border-gray-300'}`}
              >
                <div className={`h-8 w-12 rounded shadow-sm ${m === 'light' ? 'bg-white' : 'bg-gray-900'}`} />
                <span className="text-[10px] font-black uppercase tracking-widest">{m}</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-3 text-center">Navigation Style</label>
          <div className="grid grid-cols-3 gap-2">
            {['compact', 'expanded', 'minimal'].map(style => (
              <button
                key={style}
                className="py-3 px-2 rounded-lg border border-gray-100 dark:border-gray-800 text-[10px] font-bold uppercase hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
              >
                {style}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="space-y-8">
      <SectionTitle title="Maintenance & Diagnostics" subtitle="Infrastructure-level controls" />
      <div className="p-6 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20 mb-8">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 shrink-0">
            <Lock className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-black text-red-900 dark:text-red-400 uppercase tracking-tight">System Lock (Maintenance)</h4>
            <p className="text-xs text-red-700 dark:text-red-300 mt-1 leading-relaxed">
              Enabling maintenance mode will restrict all user access and show a bypass screen. Only administrators with 
              override permissions will be able to login during this state.
            </p>
            <button
              onClick={() => setSystemSettings(prev => ({ ...prev, maintenanceMode: !prev.maintenanceMode }))}
              className={`mt-4 px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${systemSettings.maintenanceMode ? 'bg-red-600 text-white shadow-lg shadow-red-500/30' : 'bg-white text-red-600 border border-red-200'}`}
            >
              {systemSettings.maintenanceMode ? 'Maintenance Active' : 'Enable Lockdown'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2">Log Persistence Mode</label>
          <div className="relative">
            <HardDrive className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={systemSettings.logLevel}
              onChange={(e) => setSystemSettings(prev => ({ ...prev, logLevel: e.target.value }))}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-1 focus:ring-blue-500 font-medium"
            >
              <option value="info">Production (Standard)</option>
              <option value="debug">Verbose (Diagnostics)</option>
              <option value="error">Critical Only</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2">Backup Scheduling</label>
          <select
            value={systemSettings.backupFrequency}
            onChange={(e) => setSystemSettings(prev => ({ ...prev, backupFrequency: e.target.value }))}
            className="w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-1 focus:ring-blue-500 font-medium"
          >
            <option value="daily">Daily Cron @ 00:00</option>
            <option value="weekly">Weekly Routine</option>
            <option value="hourly">High Availability (Hourly)</option>
          </select>
        </div>
      </div>
    </div>
  );

  return (
    <div className="px-4 py-4 max-w-[1600px] mx-auto">
      {/* Header section moved to the top bar level conceptually */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">System Configuration</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Global State: Operational</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block mr-4 border-r border-gray-200 dark:border-gray-700 pr-6">
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest leading-none mb-1">Last Deployment</p>
            <p className="text-xs text-gray-600 dark:text-gray-300 font-black tracking-tight">{new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          <button 
            onClick={handleSave} 
            disabled={loading}
            className={`flex items-center gap-3 px-8 py-3.5 rounded-xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 shadow-xl ${loading ? 'bg-gray-100 text-gray-400' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20'}`}
          >
            {loading ? <Zap className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {loading ? 'Persisting...' : 'Save Configuration'}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Persistent Navigation */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden p-3 sticky top-24">
            <div className="px-4 py-4 mb-2">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cluster Registry</p>
            </div>
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex w-full items-start gap-4 rounded-xl px-4 py-4 transition-all group ${
                    activeTab === tab.id
                      ? 'bg-blue-50 dark:bg-blue-900/10 text-blue-600'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  <div className={`p-2 rounded-lg shrink-0 transition-colors ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-gray-200'}`}>
                    {tab.icon}
                  </div>
                  <div className="text-left">
                    <p className={`text-sm font-bold leading-none ${activeTab === tab.id ? 'text-gray-900 dark:text-white' : ''}`}>{tab.label}</p>
                    <p className="text-[10px] text-gray-400 mt-1 line-clamp-1">{tab.description}</p>
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Dynamic Config Context */}
        <div className="flex-1 w-full">
          <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm min-h-[600px] flex flex-col">
            <div className="px-8 py-8 flex-1">
              <div className="mb-10">
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-[10px] font-black uppercase text-gray-500 dark:text-gray-400 rounded-full">
                  Scope: {activeTab}
                </span>
              </div>
              
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                {activeTab === 'general' && renderGeneralSettings()}
                {activeTab === 'security' && renderSecuritySettings()}
                {activeTab === 'notifications' && renderNotificationSettings()}
                {activeTab === 'appearance' && renderAppearanceSettings()}
                {activeTab === 'system' && renderSystemSettings()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
