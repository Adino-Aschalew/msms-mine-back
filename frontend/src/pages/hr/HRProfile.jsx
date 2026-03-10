import React, { useState, useRef } from 'react'
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
  Users,
  FileText,
  Award,
  Upload,
  X
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import HRHeader from '../../components/common/HRHeader'
import api from '../../services/api'

const HRProfile = () => {
  const { user, setUser } = useAuth()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [uploadingPicture, setUploadingPicture] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [profilePicture, setProfilePicture] = useState(user?.profile_picture || null)
  const [formData, setFormData] = useState({
    first_name: user?.first_name || 'HR',
    last_name: user?.last_name || 'Manager',
    email: user?.email || 'hr@company.com',
    phone_number: user?.phone_number || '+1 234 567 890',
    department: user?.department || 'Human Resources',
    job_title: user?.job_title || 'HR Manager',
    location: 'Nairobi, Kenya',
    website: 'www.company.com',
    bio: 'Human resources professional with expertise in employee management.',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Dynamic color classes based on theme
  const colors = isDark ? {
    bg: 'bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800',
    cardBg: 'bg-slate-800/60',
    cardBg2: 'bg-slate-800/40',
    cardBorder: 'border-slate-700/50',
    cardShadow: 'shadow-xl shadow-black/10',
    text: 'text-white',
    textSecondary: 'text-slate-300',
    textMuted: 'text-slate-400',
    inputBg: 'bg-slate-700/50',
    inputBorder: 'border-slate-600/50',
    hoverBg: 'hover:bg-slate-700/50',
    border: 'border-slate-600/30',
    divider: 'border-slate-700/50',
    tabActive: 'bg-slate-700/30 text-white',
    tabInactive: 'text-slate-400 hover:text-white hover:bg-slate-700/20',
  } : {
    bg: 'bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200',
    cardBg: 'bg-white/80',
    cardBg2: 'bg-white/60',
    cardBorder: 'border-gray-200/50',
    cardShadow: 'shadow-xl shadow-gray-200/50',
    text: 'text-gray-800',
    textSecondary: 'text-gray-600',
    textMuted: 'text-gray-500',
    inputBg: 'bg-gray-50',
    inputBorder: 'border-gray-200',
    hoverBg: 'hover:bg-gray-100',
    border: 'border-gray-200',
    divider: 'border-gray-200',
    tabActive: 'bg-gray-100 text-gray-800',
    tabInactive: 'text-gray-500 hover:text-gray-800 hover:bg-gray-50',
  }

  // Sample activity data
  const activities = [
    { id: 1, type: 'employee', title: 'Verified new employee', time: '1 hour ago' },
    { id: 2, type: 'payroll', title: 'Processed monthly payroll', time: '3 hours ago' },
    { id: 3, type: 'leave', title: 'Approved leave request', time: '5 hours ago' },
    { id: 4, type: 'record', title: 'Updated employee records', time: '1 day ago' },
    { id: 5, type: 'report', title: 'Generated HR report', time: '2 days ago' },
  ]

  // Sample HR stats
  const stats = [
    { label: 'Total Employees', value: '156', color: 'blue' },
    { label: 'Pending Requests', value: '23', color: 'amber' },
    { label: 'Verified This Month', value: '42', color: 'green' },
    { label: 'Active Departments', value: '8', color: 'purple' },
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
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
      case 'employee': return <Users className="h-4 w-4" />
      case 'payroll': return <CreditCard className="h-4 w-4" />
      case 'leave': return <Calendar className="h-4 w-4" />
      case 'record': return <Edit3 className="h-4 w-4" />
      case 'report': return <FileText className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  const getActivityColor = (type) => {
    switch (type) {
      case 'employee': return 'text-blue-500 bg-blue-500/10'
      case 'payroll': return 'text-emerald-500 bg-emerald-500/10'
      case 'leave': return 'text-amber-500 bg-amber-500/10'
      case 'record': return 'text-violet-500 bg-violet-500/10'
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
      case 'blue': return isDark ? 'from-blue-500/20 to-blue-600/10 border-blue-500/30' : 'from-blue-100 to-blue-50 border-blue-200'
      case 'green': return isDark ? 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30' : 'from-emerald-100 to-emerald-50 border-emerald-200'
      case 'amber': return isDark ? 'from-amber-500/20 to-amber-600/10 border-amber-500/30' : 'from-amber-100 to-amber-50 border-amber-200'
      case 'purple': return isDark ? 'from-violet-500/20 to-violet-600/10 border-violet-500/30' : 'from-violet-100 to-violet-50 border-violet-200'
      default: return isDark ? 'from-gray-500/20 to-gray-600/10 border-gray-500/30' : 'from-gray-100 to-gray-50 border-gray-200'
    }
  }

  const handleProfilePictureClick = () => {
    fileInputRef.current?.click()
  }

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File too large. Maximum size is 5MB.')
      return
    }

    setUploadingPicture(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('profile_picture', file)

      const response = await api.post('/auth/profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data.success) {
        const fullPictureUrl = response.data.data.profile_picture
        setProfilePicture(fullPictureUrl)
        
        // Update user context if available
        if (setUser) {
          setUser(prev => ({
            ...prev,
            profile_picture: fullPictureUrl
          }))
        }
        
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch (err) {
      console.error('Profile picture upload error:', err)
      setError(err.response?.data?.message || 'Failed to upload profile picture')
    } finally {
      setUploadingPicture(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Get the full profile picture URL
  const getProfilePictureUrl = () => {
    if (!profilePicture) return null
    // If it's already a full URL, return it
    if (profilePicture.startsWith('http')) return profilePicture
    // Otherwise, prepend the API base URL
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:9999'
    return `${apiUrl}${profilePicture}`
  }

  const profilePictureUrl = getProfilePictureUrl()

  return (
    <div className={`min-h-screen ${colors.bg}`}>
      <HRHeader 
        currentPage="profile"
        theme={{
          icon: 'person',
          iconBg: 'from-blue-500 to-blue-700',
          subtitle: 'HR Profile & Settings',
          activeButton: 'from-blue-500 to-blue-600',
          shadow: 'shadow-blue-500/30'
        }}
      />

      <div className="pt-28 px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-5xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate('/hr')}
            className={`flex items-center gap-2 mb-6 ${isDark ? 'text-slate-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'} transition-colors`}
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Back to HR Dashboard</span>
          </button>

          {/* Hero Section */}
          <div className="relative mb-8">
            <div className="h-32 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-t-3xl"></div>
            <div className={`${colors.cardBg} backdrop-blur-xl border-x border-b ${colors.cardBorder} rounded-b-3xl p-6`}>
              <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-20">
                <div className="relative group">
                  {/* Hidden file input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleProfilePictureChange}
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="hidden"
                  />
                  
                  {/* Profile Picture Display */}
                  {profilePictureUrl ? (
                    <div className="relative">
                      <img
                        src={profilePictureUrl}
                        alt="Profile"
                        className={`w-28 h-28 rounded-3xl object-cover shadow-2xl border-4 ${isDark ? 'border-slate-800' : 'border-white'}`}
                      />
                      {uploadingPicture && (
                        <div className={`absolute inset-0 rounded-3xl bg-black/50 flex items-center justify-center`}>
                          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className={`w-28 h-28 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-4xl font-bold shadow-2xl border-4 ${isDark ? 'border-slate-800' : 'border-white'}`}>
                      {formData.first_name?.charAt(0) || 'H'}{formData.last_name?.charAt(0) || 'R'}
                    </div>
                  )}
                  
                  {/* Camera button to trigger file input */}
                  <button 
                    onClick={handleProfilePictureClick}
                    disabled={uploadingPicture}
                    className={`absolute bottom-0 right-0 p-2 bg-emerald-600 rounded-xl text-white shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {uploadingPicture ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                  </button>
                  <div className={`absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 ${isDark ? 'border-slate-800' : 'border-white'} rounded-full`}></div>
                </div>
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h2 className={`text-2xl font-bold ${colors.text}`}>{formData.first_name} {formData.last_name}</h2>
                      <p className={colors.textMuted}>{formData.job_title}</p>
                      <div className={`flex items-center gap-4 mt-2 text-sm ${colors.textMuted}`}>
                        <span className="flex items-center gap-1"><Building className="h-4 w-4" />{formData.department}</span>
                        <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{formData.location}</span>
                        <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />Joined Jan 2024</span>
                      </div>
                    </div>
                    <button className={`px-4 py-2 ${isDark ? 'bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/30' : 'bg-gray-100 hover:bg-gray-200 border border-gray-200'} rounded-xl ${isDark ? 'text-slate-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'} transition-all flex items-center gap-2`}>
                      <Settings className="h-4 w-4" />Settings
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className={`bg-gradient-to-br ${getStatsColor(stat.color)} backdrop-blur-xl rounded-2xl p-4 border`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={colors.textMuted}>{stat.label}</p>
                    <p className={`text-2xl font-bold ${colors.text} mt-1`}>{stat.value}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    stat.color === 'blue' ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 
                    stat.color === 'green' ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' :
                    stat.color === 'amber' ? 'bg-gradient-to-br from-amber-500 to-amber-600' :
                    'bg-gradient-to-br from-violet-500 to-violet-600'
                  }`}>
                    {stat.color === 'blue' ? <Users className="h-5 w-5 text-white" /> :
                     stat.color === 'green' ? <Award className="h-5 w-5 text-white" /> :
                     stat.color === 'amber' ? <Clock className="h-5 w-5 text-white" /> :
                     <Building className="h-5 w-5 text-white" />}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Alerts */}
          {success && (
            <div className={`bg-emerald-500/20 border border-emerald-500/30 rounded-2xl p-4 mb-6 backdrop-blur-xl`}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/20"><CheckCircle className="h-5 w-5 text-emerald-400" /></div>
                <div><h3 className="text-sm font-semibold text-emerald-400">Success!</h3><p className="text-sm text-emerald-300/80">Profile updated successfully.</p></div>
              </div>
            </div>
          )}

          {error && (
            <div className={`bg-red-500/20 border border-red-500/30 rounded-2xl p-4 mb-6 backdrop-blur-xl`}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-red-500/20"><AlertCircle className="h-5 w-5 text-red-400" /></div>
                <div><h3 className="text-sm font-semibold text-red-400">Error</h3><p className="text-sm text-red-300/80">{error}</p></div>
              </div>
            </div>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className={`${colors.cardBg2} backdrop-blur-xl rounded-2xl border ${colors.cardBorder} ${colors.cardShadow} overflow-hidden`}>
                <div className={`flex border-b ${colors.divider}`}>
                  {tabs.map((tab) => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 transition-all ${
                        activeTab === tab.id ? `${colors.tabActive} border-b-2 border-emerald-500` : colors.tabInactive
                      }`}>
                      <tab.icon className="h-4 w-4" /><span className="font-medium">{tab.label}</span>
                    </button>
                  ))}
                </div>

                <div className="p-6">
                  {activeTab === 'profile' && (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <div className="flex items-center gap-3 mb-5">
                          <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600"><User className="h-5 w-5 text-white" /></div>
                          <h3 className={`text-lg font-bold ${colors.text}`}>Personal Information</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div>
                            <label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>First Name</label>
                            <input type="text" name="first_name" value={formData.first_name} onChange={handleChange}
                              className={`w-full px-4 py-3 ${colors.inputBg} border ${colors.inputBorder} rounded-xl ${isDark ? 'text-white' : 'text-gray-800'} focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all`} />
                          </div>
                          <div>
                            <label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>Last Name</label>
                            <input type="text" name="last_name" value={formData.last_name} onChange={handleChange}
                              className={`w-full px-4 py-3 ${colors.inputBg} border ${colors.inputBorder} rounded-xl ${isDark ? 'text-white' : 'text-gray-800'} focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all`} />
                          </div>
                          <div>
                            <label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>Email Address</label>
                            <div className="relative">
                              <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 ${colors.textMuted}`} />
                              <input type="email" name="email" value={formData.email} onChange={handleChange}
                                className={`w-full pl-10 pr-4 py-3 ${colors.inputBg} border ${colors.inputBorder} rounded-xl ${isDark ? 'text-white' : 'text-gray-800'} focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all`} />
                            </div>
                          </div>
                          <div>
                            <label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>Phone Number</label>
                            <div className="relative">
                              <Phone className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 ${colors.textMuted}`} />
                              <input type="tel" name="phone_number" value={formData.phone_number} onChange={handleChange}
                                className={`w-full pl-10 pr-4 py-3 ${colors.inputBg} border ${colors.inputBorder} rounded-xl ${isDark ? 'text-white' : 'text-gray-800'} focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all`} />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className={`pt-6 border-t ${colors.divider}`}>
                        <div className="flex items-center gap-3 mb-5">
                          <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600"><Briefcase className="h-5 w-5 text-white" /></div>
                          <h3 className={`text-lg font-bold ${colors.text}`}>Job Information</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div>
                            <label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>Department</label>
                            <div className="relative">
                              <Building className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 ${colors.textMuted}`} />
                              <input type="text" name="department" value={formData.department} onChange={handleChange}
                                className={`w-full pl-10 pr-4 py-3 ${colors.inputBg} border ${colors.inputBorder} rounded-xl ${isDark ? 'text-white' : 'text-gray-800'} focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all`} />
                            </div>
                          </div>
                          <div>
                            <label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>Job Title</label>
                            <div className="relative">
                              <Briefcase className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 ${colors.textMuted}`} />
                              <input type="text" name="job_title" value={formData.job_title} onChange={handleChange}
                                className={`w-full pl-10 pr-4 py-3 ${colors.inputBg} border ${colors.inputBorder} rounded-xl ${isDark ? 'text-white' : 'text-gray-800'} focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all`} />
                            </div>
                          </div>
                          <div>
                            <label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>Location</label>
                            <div className="relative">
                              <MapPin className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 ${colors.textMuted}`} />
                              <input type="text" name="location" value={formData.location} onChange={handleChange}
                                className={`w-full pl-10 pr-4 py-3 ${colors.inputBg} border ${colors.inputBorder} rounded-xl ${isDark ? 'text-white' : 'text-gray-800'} focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all`} />
                            </div>
                          </div>
                          <div>
                            <label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>Website</label>
                            <div className="relative">
                              <Globe className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 ${colors.textMuted}`} />
                              <input type="text" name="website" value={formData.website} onChange={handleChange}
                                className={`w-full pl-10 pr-4 py-3 ${colors.inputBg} border ${colors.inputBorder} rounded-xl ${isDark ? 'text-white' : 'text-gray-800'} focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all`} />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className={`pt-6 border-t ${colors.divider}`}>
                        <label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>Bio</label>
                        <textarea name="bio" value={formData.bio} onChange={handleChange} rows={3}
                          className={`w-full px-4 py-3 ${colors.inputBg} border ${colors.inputBorder} rounded-xl ${isDark ? 'text-white' : 'text-gray-800'} focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all resize-none`} />
                      </div>

                      <div className={`flex justify-end gap-3 pt-6 border-t ${colors.divider}`}>
                        <button type="button" onClick={() => navigate('/hr')}
                          className={`px-6 py-3 border ${colors.border} rounded-xl ${isDark ? 'text-slate-300 hover:bg-slate-700/50 hover:text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'} transition-all font-medium`}>
                          Cancel
                        </button>
                        <button type="submit" disabled={loading}
                          className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 flex items-center gap-2 font-medium shadow-lg shadow-emerald-500/25 transition-all">
                          {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>Saving...</> : <><Save className="h-5 w-5" />Save Changes</>}
                        </button>
                      </div>
                    </form>
                  )}

                  {activeTab === 'security' && (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="flex items-center gap-3 mb-5">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600"><Shield className="h-5 w-5 text-white" /></div>
                        <h3 className={`text-lg font-bold ${colors.text}`}>Change Password</h3>
                      </div>
                      <div className="space-y-5">
                        <div>
                          <label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>Current Password</label>
                          <div className="relative">
                            <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 ${colors.textMuted}`} />
                            <input type={showPassword ? "text" : "password"} name="currentPassword" value={formData.currentPassword} onChange={handleChange}
                              className={`w-full pl-10 pr-12 py-3 ${colors.inputBg} border ${colors.inputBorder} rounded-xl ${isDark ? 'text-white' : 'text-gray-800'} focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all`} placeholder="Enter current password" />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className={`absolute right-3 top-1/2 -translate-y-1/2 ${colors.textMuted} hover:${colors.text}`}>
                              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>New Password</label>
                          <div className="relative">
                            <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 ${colors.textMuted}`} />
                            <input type={showPassword ? "text" : "password"} name="newPassword" value={formData.newPassword} onChange={handleChange}
                              className={`w-full pl-10 pr-12 py-3 ${colors.inputBg} border ${colors.inputBorder} rounded-xl ${isDark ? 'text-white' : 'text-gray-800'} focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all`} placeholder="Enter new password" />
                          </div>
                        </div>
                        <div>
                          <label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>Confirm New Password</label>
                          <div className="relative">
                            <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 ${colors.textMuted}`} />
                            <input type={showPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                              className={`w-full pl-10 pr-12 py-3 ${colors.inputBg} border ${colors.inputBorder} rounded-xl ${isDark ? 'text-white' : 'text-gray-800'} focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all`} placeholder="Confirm new password" />
                          </div>
                        </div>
                      </div>
                      <div className={`flex justify-end gap-3 pt-6 border-t ${colors.divider}`}>
                        <button type="submit" disabled={loading}
                          className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 flex items-center gap-2 font-medium shadow-lg shadow-amber-500/25 transition-all">
                          {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>Updating...</> : <><Shield className="h-5 w-5" />Update Password</>}
                        </button>
                      </div>
                    </form>
                  )}

                  {activeTab === 'activity' && (
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600"><Clock className="h-5 w-5 text-white" /></div>
                          <h3 className={`text-lg font-bold ${colors.text}`}>Recent Activity</h3>
                        </div>
                        <button className="text-sm text-cyan-400 hover:text-cyan-300">View All</button>
                      </div>
                      <div className="space-y-4">
                        {activities.map((activity) => (
                          <div key={activity.id} className={`flex items-start gap-4 p-4 ${isDark ? 'bg-slate-700/20 hover:bg-slate-700/30' : 'bg-gray-100 hover:bg-gray-200'} rounded-xl transition-all`}>
                            <div className={`p-2 rounded-xl ${getActivityColor(activity.type)}`}>{getActivityIcon(activity.type)}</div>
                            <div className="flex-1">
                              <p className={`${colors.text} font-medium`}>{activity.title}</p>
                              <p className={`text-sm ${colors.textMuted} mt-1`}>{activity.time}</p>
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
              <div className={`${colors.cardBg2} backdrop-blur-xl rounded-2xl border ${colors.cardBorder} ${colors.cardShadow} p-6`}>
                <h3 className={`text-lg font-bold ${colors.text} mb-4`}>Quick Actions</h3>
                <div className="space-y-3">
                  <button className={`w-full flex items-center gap-3 p-3 ${isDark ? 'bg-slate-700/30 hover:bg-slate-700/50' : 'bg-gray-100 hover:bg-gray-200'} rounded-xl transition-all ${isDark ? 'text-slate-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}>
                    <div className="p-2 rounded-lg bg-blue-500/20"><Bell className="h-4 w-4 text-blue-400" /></div><span className="text-sm font-medium">Notification Settings</span>
                  </button>
                  <button className={`w-full flex items-center gap-3 p-3 ${isDark ? 'bg-slate-700/30 hover:bg-slate-700/50' : 'bg-gray-100 hover:bg-gray-200'} rounded-xl transition-all ${isDark ? 'text-slate-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}>
                    <div className="p-2 rounded-lg bg-violet-500/20"><CreditCard className="h-4 w-4 text-violet-400" /></div><span className="text-sm font-medium">Payment Methods</span>
                  </button>
                  <button className={`w-full flex items-center gap-3 p-3 ${isDark ? 'bg-slate-700/30 hover:bg-slate-700/50' : 'bg-gray-100 hover:bg-gray-200'} rounded-xl transition-all ${isDark ? 'text-slate-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}>
                    <div className="p-2 rounded-lg bg-emerald-500/20"><Shield className="h-4 w-4 text-emerald-400" /></div><span className="text-sm font-medium">Privacy Settings</span>
                  </button>
                </div>
              </div>

              <div className={`${colors.cardBg2} backdrop-blur-xl rounded-2xl border ${colors.cardBorder} ${colors.cardShadow} p-6`}>
                <h3 className={`text-lg font-bold ${colors.text} mb-4`}>Account Status</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between"><span className={`${colors.textMuted} text-sm`}>Status</span><span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-sm font-medium rounded-full">Active</span></div>
                  <div className="flex items-center justify-between"><span className={`${colors.textMuted} text-sm`}>Role</span><span className={`${colors.text} text-sm font-medium`}>HR Manager</span></div>
                  <div className="flex items-center justify-between"><span className={`${colors.textMuted} text-sm`}>Last Login</span><span className={`${colors.text} text-sm font-medium`}>Today, 2:30 PM</span></div>
                  <div className="flex items-center justify-between"><span className={`${colors.textMuted} text-sm`}>2FA Enabled</span><span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-sm font-medium rounded-full">No</span></div>
                </div>
                <button className={`w-full mt-4 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all text-sm font-medium`}>
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

export default HRProfile
