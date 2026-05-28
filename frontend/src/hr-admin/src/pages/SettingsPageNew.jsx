import { useState } from 'react';
import { 
  Settings, 
  Bell, 
  Shield, 
  Database, 
  Mail, 
  Globe, 
  Palette, 
  Lock,
  Users,
  FileText,
  Zap,
  Clock,
  CheckCircle,
  AlertTriangle,
  Save,
  RefreshCw,
  Download,
  Upload
} from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('security');

  const [systemSettings, setSystemSettings] = useState({
    twoFactorAuth: false,
    maxFileSize: 10
  });

  const handleSystemChange = (key, value) => {
    setSystemSettings(prev => ({ ...prev, [key]: value }));
  };

  const tabs = [
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'system', label: 'System', icon: Database },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'security':
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Security Settings</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Add an extra layer of security</p>
                  </div>
                  <button
                    onClick={() => handleSystemChange('twoFactorAuth', !systemSettings.twoFactorAuth)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      systemSettings.twoFactorAuth ? 'bg-blue-600' : 'bg-gray-200 dark:bg-slate-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        systemSettings.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Max File Size (MB)</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Maximum upload file size</p>
                  </div>
                  <input
                    type="number"
                    value={systemSettings.maxFileSize}
                    onChange={(e) => handleSystemChange('maxFileSize', e.target.value)}
                    className="w-20 px-3 py-1 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Password Policy</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-green-500" size={16} />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Minimum 8 characters</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-green-500" size={16} />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Include uppercase and lowercase</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-green-500" size={16} />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Include numbers and symbols</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-green-500" size={16} />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Change every 90 days</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'system':
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">System Maintenance</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button className="p-4 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-left">
                  <div className="flex items-center gap-3 mb-2">
                    <RefreshCw className="text-blue-500" size={20} />
                    <span className="font-medium text-gray-900 dark:text-white">Clear Cache</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Clear system cache and temporary files</p>
                </button>
                <button className="p-4 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-left">
                  <div className="flex items-center gap-3 mb-2">
                    <Download className="text-green-500" size={20} />
                    <span className="font-medium text-gray-900 dark:text-white">Export Data</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Export all system data</p>
                </button>
                <button className="p-4 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-left">
                  <div className="flex items-center gap-3 mb-2">
                    <Upload className="text-purple-500" size={20} />
                    <span className="font-medium text-gray-900 dark:text-white">Import Data</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Import data from backup</p>
                </button>
                <button className="p-4 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-left">
                  <div className="flex items-center gap-3 mb-2">
                    <Database className="text-orange-500" size={20} />
                    <span className="font-medium text-gray-900 dark:text-white">Database Backup</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Create database backup</p>
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">System Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Version</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">v2.1.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Last Updated</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">March 15, 2026</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Database Size</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">2.4 GB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Active Users</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">156</span>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            Manage your system preferences and configuration
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
            <RefreshCw size={18} />
            <span className="hidden sm:inline">Reset</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm font-medium text-sm">
            <Save size={18} />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {}
        <div className="lg:w-64">
          <nav className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'
                }`}
              >
                <tab.icon size={20} />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {}
        <div className="flex-1">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}
