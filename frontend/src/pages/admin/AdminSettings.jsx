import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Settings,
  Bell,
  Shield,
  Palette,
  Globe,
  Save,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

const AdminSettings = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    weeklyReports: true,
    systemAlerts: true,
    darkMode: true,
    language: 'en',
    timezone: 'Africa/Nairobi',
    sessionTimeout: 30,
    twoFactorAuth: false
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error('Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700/50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-5">
            <button
              onClick={() => navigate('/admin')}
              className="mr-4 p-2 rounded-xl bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/30 text-slate-300 hover:text-white transition-all"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Settings className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Settings</h1>
                <p className="text-sm text-slate-400 mt-0.5">Configure system preferences</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Success Alert */}
          {success && (
            <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-2xl p-4 mb-6 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/20">
                  <CheckCircle className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-emerald-400">Success!</h3>
                  <p className="text-sm text-emerald-300/80">Settings saved successfully.</p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Notifications */}
            <div className="bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
                  <Bell className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white">Notifications</h3>
              </div>
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl cursor-pointer hover:bg-slate-700/50 transition-all">
                  <div>
                    <p className="text-white font-medium">Email Notifications</p>
                    <p className="text-sm text-slate-400">Receive email notifications for important updates</p>
                  </div>
                  <input
                    type="checkbox"
                    name="emailNotifications"
                    checked={settings.emailNotifications}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500/50"
                  />
                </label>
                <label className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl cursor-pointer hover:bg-slate-700/50 transition-all">
                  <div>
                    <p className="text-white font-medium">Push Notifications</p>
                    <p className="text-sm text-slate-400">Receive push notifications in your browser</p>
                  </div>
                  <input
                    type="checkbox"
                    name="pushNotifications"
                    checked={settings.pushNotifications}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500/50"
                  />
                </label>
                <label className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl cursor-pointer hover:bg-slate-700/50 transition-all">
                  <div>
                    <p className="text-white font-medium">Weekly Reports</p>
                    <p className="text-sm text-slate-400">Receive weekly summary reports via email</p>
                  </div>
                  <input
                    type="checkbox"
                    name="weeklyReports"
                    checked={settings.weeklyReports}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500/50"
                  />
                </label>
                <label className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl cursor-pointer hover:bg-slate-700/50 transition-all">
                  <div>
                    <p className="text-white font-medium">System Alerts</p>
                    <p className="text-sm text-slate-400">Get notified about system events and errors</p>
                  </div>
                  <input
                    type="checkbox"
                    name="systemAlerts"
                    checked={settings.systemAlerts}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500/50"
                  />
                </label>
              </div>
            </div>

            {/* Appearance */}
            <div className="bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600">
                  <Palette className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white">Appearance</h3>
              </div>
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl cursor-pointer hover:bg-slate-700/50 transition-all">
                  <div>
                    <p className="text-white font-medium">Dark Mode</p>
                    <p className="text-sm text-slate-400">Use dark theme for the dashboard</p>
                  </div>
                  <input
                    type="checkbox"
                    name="darkMode"
                    checked={settings.darkMode}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-violet-500 focus:ring-violet-500/50"
                  />
                </label>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Language</label>
                  <select
                    name="language"
                    value={settings.language}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  >
                    <option value="en">English</option>
                    <option value="am">Amharic</option>
                    <option value="sw">Swahili</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white">Security</h3>
              </div>
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl cursor-pointer hover:bg-slate-700/50 transition-all">
                  <div>
                    <p className="text-white font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-slate-400">Add an extra layer of security to your account</p>
                  </div>
                  <input
                    type="checkbox"
                    name="twoFactorAuth"
                    checked={settings.twoFactorAuth}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-emerald-500 focus:ring-emerald-500/50"
                  />
                </label>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Session Timeout (minutes)</label>
                  <select
                    name="sessionTimeout"
                    value={settings.sessionTimeout}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={120}>2 hours</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="px-6 py-3 border border-slate-600/50 rounded-xl text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 flex items-center gap-2 font-medium shadow-lg shadow-amber-500/25 transition-all"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    Save Settings
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AdminSettings
