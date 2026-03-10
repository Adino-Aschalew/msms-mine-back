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
import { useTheme } from '../../context/ThemeContext'
import HRHeader from '../../components/common/HRHeader'

const HRSettings = () => {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
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

  // Dynamic color classes based on theme
  const colors = isDark ? {
    bg: 'bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800',
    cardBg: 'bg-slate-800/40',
    cardBorder: 'border-slate-700/50',
    cardShadow: 'shadow-xl shadow-black/10',
    text: 'text-white',
    textSecondary: 'text-slate-300',
    textMuted: 'text-slate-400',
    itemBg: 'bg-slate-700/30',
    inputBg: 'bg-slate-700/50',
    inputBorder: 'border-slate-600/50',
    inputText: 'text-white',
    border: 'border-slate-600/50',
    hoverBg: 'hover:bg-slate-700/50',
  } : {
    bg: 'bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200',
    cardBg: 'bg-white/80',
    cardBorder: 'border-gray-200/50',
    cardShadow: 'shadow-xl shadow-gray-200/50',
    text: 'text-gray-800',
    textSecondary: 'text-gray-600',
    textMuted: 'text-gray-500',
    itemBg: 'bg-gray-100/50',
    inputBg: 'bg-gray-50',
    inputBorder: 'border-gray-200',
    inputText: 'text-gray-800',
    border: 'border-gray-300',
    hoverBg: 'hover:bg-gray-100',
  }

  return (
    <div className={`min-h-screen ${colors.bg}`}>
      {/* HR Header */}
      <HRHeader 
        currentPage="settings"
        theme={{
          icon: 'settings',
          iconBg: 'from-amber-500 to-amber-700',
          subtitle: 'HR Settings',
          activeButton: 'from-amber-500 to-amber-600',
          shadow: 'shadow-amber-500/30'
        }}
      />

      <div className="pt-24 px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-2xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate('/hr')}
            className={`flex items-center gap-2 ${isDark ? 'text-slate-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'} mb-6 transition-colors`}
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Back to HR Dashboard</span>
          </button>

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
            <div className={`${colors.cardBg} backdrop-blur-xl rounded-2xl border ${colors.cardBorder} p-6`}>
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
                  <Bell className="h-5 w-5 text-white" />
                </div>
                <h3 className={`text-lg font-bold ${colors.text}`}>Notifications</h3>
              </div>
              <div className="space-y-4">
                <label className={`flex items-center justify-between p-4 ${colors.itemBg} rounded-xl cursor-pointer ${colors.hoverBg} transition-all`}>
                  <div>
                    <p className={`${colors.text} font-medium`}>Email Notifications</p>
                    <p className={`text-sm ${colors.textMuted}`}>Receive email notifications for important updates</p>
                  </div>
                  <input
                    type="checkbox"
                    name="emailNotifications"
                    checked={settings.emailNotifications}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500/50"
                  />
                </label>
                <label className={`flex items-center justify-between p-4 ${colors.itemBg} rounded-xl cursor-pointer ${colors.hoverBg} transition-all`}>
                  <div>
                    <p className={`${colors.text} font-medium`}>Push Notifications</p>
                    <p className={`text-sm ${colors.textMuted}`}>Receive push notifications in your browser</p>
                  </div>
                  <input
                    type="checkbox"
                    name="pushNotifications"
                    checked={settings.pushNotifications}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500/50"
                  />
                </label>
                <label className={`flex items-center justify-between p-4 ${colors.itemBg} rounded-xl cursor-pointer ${colors.hoverBg} transition-all`}>
                  <div>
                    <p className={`${colors.text} font-medium`}>Weekly Reports</p>
                    <p className={`text-sm ${colors.textMuted}`}>Receive weekly summary reports via email</p>
                  </div>
                  <input
                    type="checkbox"
                    name="weeklyReports"
                    checked={settings.weeklyReports}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500/50"
                  />
                </label>
                <label className={`flex items-center justify-between p-4 ${colors.itemBg} rounded-xl cursor-pointer ${colors.hoverBg} transition-all`}>
                  <div>
                    <p className={`${colors.text} font-medium`}>System Alerts</p>
                    <p className={`text-sm ${colors.textMuted}`}>Get notified about system events and errors</p>
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
            <div className={`${colors.cardBg} backdrop-blur-xl rounded-2xl border ${colors.cardBorder} p-6`}>
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600">
                  <Palette className="h-5 w-5 text-white" />
                </div>
                <h3 className={`text-lg font-bold ${colors.text}`}>Appearance</h3>
              </div>
              <div className="space-y-4">
                <label className={`flex items-center justify-between p-4 ${colors.itemBg} rounded-xl cursor-pointer ${colors.hoverBg} transition-all`}>
                  <div>
                    <p className={`${colors.text} font-medium`}>Dark Mode</p>
                    <p className={`text-sm ${colors.textMuted}`}>Use dark theme for the dashboard</p>
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
                  <label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>Language</label>
                  <select
                    name="language"
                    value={settings.language}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 ${colors.inputBg} border ${colors.inputBorder} rounded-xl ${isDark ? colors.inputText : colors.inputText} focus:outline-none focus:ring-2 focus:ring-violet-500/50`}
                  >
                    <option value="en">English</option>
                    <option value="am">Amharic</option>
                    <option value="sw">Swahili</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Security */}
            <div className={`${colors.cardBg} backdrop-blur-xl rounded-2xl border ${colors.cardBorder} p-6`}>
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <h3 className={`text-lg font-bold ${colors.text}`}>Security</h3>
              </div>
              <div className="space-y-4">
                <label className={`flex items-center justify-between p-4 ${colors.itemBg} rounded-xl cursor-pointer ${colors.hoverBg} transition-all`}>
                  <div>
                    <p className={`${colors.text} font-medium`}>Two-Factor Authentication</p>
                    <p className={`text-sm ${colors.textMuted}`}>Add an extra layer of security to your account</p>
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
                  <label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>Session Timeout (minutes)</label>
                  <select
                    name="sessionTimeout"
                    value={settings.sessionTimeout}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 ${colors.inputBg} border ${colors.inputBorder} rounded-xl ${isDark ? colors.inputText : colors.inputText} focus:outline-none focus:ring-2 focus:ring-emerald-500/50`}
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
                onClick={() => navigate('/hr')}
                className={`px-6 py-3 border ${colors.border} rounded-xl ${isDark ? 'text-slate-300 hover:bg-slate-700/50 hover:text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'} transition-all font-medium`}
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

export default HRSettings
