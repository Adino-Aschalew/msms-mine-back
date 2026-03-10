import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  User,
  Mail,
  Phone,
  Building,
  Briefcase,
  Shield,
  Save,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Camera,
  Edit3,
  Clock,
  MapPin,
  Globe,
  Calendar,
  Activity,
  Lock,
  Bell,
  CreditCard,
  Settings,
  LogOut
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const AdminProfile = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    first_name: user?.first_name || 'Admin',
    last_name: user?.last_name || 'User',
    email: user?.email || 'admin@company.com',
    phone_number: user?.phone_number || '+1 234 567 890',
    department: user?.department || 'Administration',
    job_title: user?.job_title || 'System Administrator',
    location: 'Nairobi, Kenya',
    website: 'www.company.com',
    bio: 'System administrator with 5+ years of experience managing microfinance operations.',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Sample activity data
  const activities = [
    { id: 1, type: 'login', title: 'Logged in successfully', time: '2 hours ago', icon: 'login' },
    { id: 2, type: 'update', title: 'Updated employee records', time: '5 hours ago', icon: 'edit' },
    { id: 3, type: 'system', title: 'System backup completed', time: '1 day ago', icon: 'backup' },
    { id: 4, type: 'security', title: 'Password changed', time: '3 days ago', icon: 'lock' },
    { id: 5, type: 'report', title: 'Monthly report generated', time: '1 week ago', icon: 'report' },
  ]

  // Sample stats
  const stats = [
    { label: 'Total Logins', value: '1,247', icon: 'login', color: 'blue' },
    { label: 'Active Sessions', value: '3', icon: 'activity', color: 'green' },
    { label: 'Pending Tasks', value: '12', icon: 'task', color: 'amber' },
    { label: 'System Alerts', value: '0', icon: 'alert', color: 'red' },
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'login': return <LogOut className="h-4 w-4" />
      case 'update': return <Edit3 className="h-4 w-4" />
      case 'system': return <Activity className="h-4 w-4" />
      case 'security': return <Lock className="h-4 w-4" />
      case 'report': return <CreditCard className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  const getActivityColor = (type) => {
    switch (type) {
      case 'login': return 'text-blue-500 bg-blue-500/10'
      case 'update': return 'text-amber-500 bg-amber-500/10'
      case 'system': return 'text-green-500 bg-green-500/10'
      case 'security': return 'text-purple-500 bg-purple-500/10'
      case 'report': return 'text-cyan-500 bg-cyan-500/10'
      default: return 'text-gray-500 bg-gray-500/10'
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'activity', label: 'Activity', icon: Clock },
  ]

  const getStatsColor = (color) => {
    switch (color) {
      case 'blue': return 'from-blue-500/20 to-blue-600/10 border-blue-500/30'
      case 'green': return 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30'
      case 'amber': return 'from-amber-500/20 to-amber-600/10 border-amber-500/30'
      case 'red': return 'from-red-500/20 to-red-600/10 border-red-500/30'
      default: return 'from-gray-500/20 to-gray-600/10 border-gray-500/30'
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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">My Profile</h1>
                <p className="text-sm text-slate-400 mt-0.5">Manage your account information</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Hero Section with Avatar */}
          <div className="relative mb-8">
            {/* Cover Banner */}
            <div className="h-32 bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 rounded-t-3xl"></div>
            
            {/* Profile Card */}
            <div className="bg-slate-800/60 backdrop-blur-xl border-x border-b border-slate-700/50 rounded-b-3xl p-6">
              <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-20">
                {/* Avatar */}
                <div className="relative group">
                  <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-4xl font-bold shadow-2xl border-4 border-slate-800">
                    {formData.first_name?.charAt(0) || 'A'}{formData.last_name?.charAt(0) || 'U'}
                  </div>
                  <button className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-xl text-white shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-blue-500">
                    <Camera className="h-4 w-4" />
                  </button>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-slate-800 rounded-full"></div>
                </div>
                
                {/* User Info */}
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-white">{formData.first_name} {formData.last_name}</h2>
                      <p className="text-slate-400">{formData.job_title}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                        <span className="flex items-center gap-1">
                          <Building className="h-4 w-4" />
                          {formData.department}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {formData.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Joined Jan 2024
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/30 rounded-xl text-slate-300 hover:text-white transition-all flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Settings
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`bg-gradient-to-br ${getStatsColor(stat.color)} backdrop-blur-xl rounded-2xl p-4 border`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">{stat.label}</p>
                    <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color === 'blue' ? 'from-blue-500 to-blue-600' : stat.color === 'green' ? 'from-emerald-500 to-emerald-600' : stat.color === 'amber' ? 'from-amber-500 to-amber-600' : 'from-red-500 to-red-600'} flex items-center justify-center`}>
                    <Activity className="h-5 w-5 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Success/Error Alerts */}
          {success && (
            <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-2xl p-4 mb-6 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/20">
                  <CheckCircle className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-emerald-400">Success!</h3>
                  <p className="text-sm text-emerald-300/80">Profile updated successfully.</p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-4 mb-6 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-red-500/20">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-red-400">Error</h3>
                  <p className="text-sm text-red-300/80">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Form/Content */}
            <div className="lg:col-span-2">
              {/* Tabs */}
              <div className="bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-xl shadow-black/10 overflow-hidden">
                {/* Tab Navigation */}
                <div className="flex border-b border-slate-700/50">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 transition-all ${
                        activeTab === tab.id
                          ? 'bg-slate-700/30 text-white border-b-2 border-blue-500'
                          : 'text-slate-400 hover:text-white hover:bg-slate-700/20'
                      }`}
                    >
                      <tab.icon className="h-4 w-4" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="p-6">
                  {activeTab === 'profile' && (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Basic Information */}
                      <div>
                        <div className="flex items-center gap-3 mb-5">
                          <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
                            <User className="h-5 w-5 text-white" />
                          </div>
                          <h3 className="text-lg font-bold text-white">Personal Information</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                              First Name
                            </label>
                            <input
                              type="text"
                              name="first_name"
                              value={formData.first_name}
                              onChange={handleChange}
                              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                              Last Name
                            </label>
                            <input
                              type="text"
                              name="last_name"
                              value={formData.last_name}
                              onChange={handleChange}
                              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                              Email Address
                            </label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                              <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                              Phone Number
                            </label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                              <input
                                type="tel"
                                name="phone_number"
                                value={formData.phone_number}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Job Information */}
                      <div className="pt-6 border-t border-slate-700/50">
                        <div className="flex items-center gap-3 mb-5">
                          <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600">
                            <Briefcase className="h-5 w-5 text-white" />
                          </div>
                          <h3 className="text-lg font-bold text-white">Job Information</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                              Department
                            </label>
                            <div className="relative">
                              <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                              <input
                                type="text"
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                              Job Title
                            </label>
                            <div className="relative">
                              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                              <input
                                type="text"
                                name="job_title"
                                value={formData.job_title}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                              Location
                            </label>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                              <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                              Website
                            </label>
                            <div className="relative">
                              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                              <input
                                type="text"
                                name="website"
                                value={formData.website}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Bio */}
                      <div className="pt-6 border-t border-slate-700/50">
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Bio
                        </label>
                        <textarea
                          name="bio"
                          value={formData.bio}
                          onChange={handleChange}
                          rows={3}
                          className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all resize-none"
                        />
                      </div>

                      {/* Actions */}
                      <div className="flex justify-end gap-3 pt-6 border-t border-slate-700/50">
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
                          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 flex items-center gap-2 font-medium shadow-lg shadow-blue-500/25 transition-all"
                        >
                          {loading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-5 w-5" />
                              Save Changes
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )}

                  {activeTab === 'security' && (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="flex items-center gap-3 mb-5">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600">
                          <Shield className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-white">Change Password</h3>
                      </div>

                      <div className="space-y-5">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Current Password
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <input
                              type={showPassword ? "text" : "password"}
                              name="currentPassword"
                              value={formData.currentPassword}
                              onChange={handleChange}
                              className="w-full pl-10 pr-12 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                              placeholder="Enter current password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                            >
                              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            New Password
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <input
                              type={showPassword ? "text" : "password"}
                              name="newPassword"
                              value={formData.newPassword}
                              onChange={handleChange}
                              className="w-full pl-10 pr-12 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                              placeholder="Enter new password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                            >
                              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Confirm New Password
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <input
                              type={showPassword ? "text" : "password"}
                              name="confirmPassword"
                              value={formData.confirmPassword}
                              onChange={handleChange}
                              className="w-full pl-10 pr-12 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                              placeholder="Confirm new password"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-6 border-t border-slate-700/50">
                        <button
                          type="submit"
                          disabled={loading}
                          className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 flex items-center gap-2 font-medium shadow-lg shadow-amber-500/25 transition-all"
                        >
                          {loading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              Updating...
                            </>
                          ) : (
                            <>
                              <Shield className="h-5 w-5" />
                              Update Password
                            </>
                          )}
                        </button>
                      </div>

                      {/* Security Info */}
                      <div className="mt-8 p-4 bg-slate-700/30 rounded-xl border border-slate-600/30">
                        <h4 className="text-sm font-semibold text-white mb-2">Security Tips</h4>
                        <ul className="text-sm text-slate-400 space-y-1">
                          <li>• Use at least 8 characters</li>
                          <li>• Include uppercase and lowercase letters</li>
                          <li>• Add numbers and special characters</li>
                          <li>• Don't use easily guessable passwords</li>
                        </ul>
                      </div>
                    </form>
                  )}

                  {activeTab === 'activity' && (
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600">
                            <Clock className="h-5 w-5 text-white" />
                          </div>
                          <h3 className="text-lg font-bold text-white">Recent Activity</h3>
                        </div>
                        <button className="text-sm text-cyan-400 hover:text-cyan-300">
                          View All
                        </button>
                      </div>

                      <div className="space-y-4">
                        {activities.map((activity, index) => (
                          <div
                            key={activity.id}
                            className="flex items-start gap-4 p-4 bg-slate-700/20 rounded-xl hover:bg-slate-700/30 transition-all"
                          >
                            <div className={`p-2 rounded-xl ${getActivityColor(activity.type)}`}>
                              {getActivityIcon(activity.type)}
                            </div>
                            <div className="flex-1">
                              <p className="text-white font-medium">{activity.title}</p>
                              <p className="text-sm text-slate-400 mt-1">{activity.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-xl shadow-black/10 p-6">
                <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center gap-3 p-3 bg-slate-700/30 hover:bg-slate-700/50 rounded-xl transition-all text-slate-300 hover:text-white">
                    <div className="p-2 rounded-lg bg-blue-500/20">
                      <Bell className="h-4 w-4 text-blue-400" />
                    </div>
                    <span className="text-sm font-medium">Notification Settings</span>
                  </button>
                  <button className="w-full flex items-center gap-3 p-3 bg-slate-700/30 hover:bg-slate-700/50 rounded-xl transition-all text-slate-300 hover:text-white">
                    <div className="p-2 rounded-lg bg-violet-500/20">
                      <CreditCard className="h-4 w-4 text-violet-400" />
                    </div>
                    <span className="text-sm font-medium">Payment Methods</span>
                  </button>
                  <button className="w-full flex items-center gap-3 p-3 bg-slate-700/30 hover:bg-slate-700/50 rounded-xl transition-all text-slate-300 hover:text-white">
                    <div className="p-2 rounded-lg bg-emerald-500/20">
                      <Shield className="h-4 w-4 text-emerald-400" />
                    </div>
                    <span className="text-sm font-medium">Privacy Settings</span>
                  </button>
                  <button className="w-full flex items-center gap-3 p-3 bg-slate-700/30 hover:bg-slate-700/50 rounded-xl transition-all text-slate-300 hover:text-white">
                    <div className="p-2 rounded-lg bg-amber-500/20">
                      <Settings className="h-4 w-4 text-amber-400" />
                    </div>
                    <span className="text-sm font-medium">Account Settings</span>
                  </button>
                </div>
              </div>

              {/* Account Status */}
              <div className="bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-xl shadow-black/10 p-6">
                <h3 className="text-lg font-bold text-white mb-4">Account Status</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">Status</span>
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-sm font-medium rounded-full">Active</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">Role</span>
                    <span className="text-white text-sm font-medium">Administrator</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">Last Login</span>
                    <span className="text-white text-sm font-medium">Today, 2:30 PM</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">2FA Enabled</span>
                    <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-sm font-medium rounded-full">No</span>
                  </div>
                </div>
                <button className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all text-sm font-medium">
                  Enable Two-Factor Auth
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminProfile
