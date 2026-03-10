import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Save, 
  UserPlus,
  Building,
  Briefcase,
  Mail,
  Phone,
  User,
  Shield,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react'
import adminService from '../../services/adminService'

const CreateHRAdmin = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    employee_id: '',
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    department: 'HR',
    job_title: '',
    password: '',
    confirmPassword: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateForm = () => {
    const errors = []

    if (!formData.employee_id.trim()) {
      errors.push('Employee ID is required')
    } else if (!/^[A-Z0-9]+$/.test(formData.employee_id)) {
      errors.push('Employee ID must contain only uppercase letters and numbers')
    }

    if (!formData.first_name.trim()) {
      errors.push('First name is required')
    } else if (!/^[a-zA-Z\s]+$/.test(formData.first_name)) {
      errors.push('First name must contain only letters and spaces')
    }

    if (!formData.last_name.trim()) {
      errors.push('Last name is required')
    } else if (!/^[a-zA-Z\s]+$/.test(formData.last_name)) {
      errors.push('Last name must contain only letters and spaces')
    }

    if (!formData.email.trim()) {
      errors.push('Email is required')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push('Invalid email format')
    }

    if (!formData.phone_number.trim()) {
      errors.push('Phone number is required')
    }

    if (!formData.job_title.trim()) {
      errors.push('Job title is required')
    }

    if (!formData.password) {
      errors.push('Password is required')
    } else if (formData.password.length < 8) {
      errors.push('Password must be at least 8 characters long')
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.push('Password must contain at least one uppercase letter, one lowercase letter, and one number')
    }

    if (formData.password !== formData.confirmPassword) {
      errors.push('Passwords do not match')
    }

    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '))
      setSuccess(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { confirmPassword, ...adminData } = formData
      await adminService.createHRAdmin(adminData)
      setSuccess(true)
      setTimeout(() => {
        navigate('/admin/hr-admins', { 
          state: { message: 'HR Admin created successfully' } 
        })
      }, 1500)
    } catch (err) {
      setError(err.message || 'Failed to create HR admin')
      setSuccess(false)
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
              onClick={() => navigate('/admin/hr-admins')}
              className="mr-4 p-2 rounded-xl bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/30 text-slate-300 hover:text-white transition-all"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <UserPlus className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Create HR Admin</h1>
                <p className="text-sm text-slate-400 mt-0.5">Add a new HR administrator to the system</p>
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
                  <p className="text-sm text-emerald-300/80">HR Admin created successfully. Redirecting...</p>
                </div>
              </div>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-4 mb-6 backdrop-blur-xl">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-red-500/20 mt-0.5">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-red-400">Error</h3>
                  <p className="text-sm text-red-300/80 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <div className="bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-xl shadow-black/10">
            <form onSubmit={handleSubmit} className="p-6 space-y-8">
              {/* Basic Information */}
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Basic Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Employee ID
                    </label>
                    <input
                      type="text"
                      name="employee_id"
                      value={formData.employee_id}
                      onChange={handleChange}
                      placeholder="e.g., HR001"
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="hr.admin@company.com"
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      placeholder="John"
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                      required
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
                      placeholder="Doe"
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="pt-6 border-t border-slate-700/50">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600">
                    <Phone className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Contact Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleChange}
                      placeholder="+1234567890"
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      <Mail className="inline h-4 w-4 mr-1" />
                      Email (confirm)
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="w-full px-4 py-3 bg-slate-700/30 border border-slate-600/30 rounded-xl text-slate-400 cursor-not-allowed"
                    />
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
                      <Building className="inline h-4 w-4 mr-1" />
                      Department
                    </label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
                      required
                    >
                      <option value="HR">Human Resources</option>
                      <option value="Human Resources">Human Resources</option>
                      <option value="Administration">Administration</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Job Title
                    </label>
                    <input
                      type="text"
                      name="job_title"
                      value={formData.job_title}
                      onChange={handleChange}
                      placeholder="HR Manager"
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Security */}
              <div className="pt-6 border-t border-slate-700/50">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Security</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="relative">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Password
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Min. 8 characters"
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all pr-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-9 text-slate-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Re-enter password"
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                      required
                    />
                  </div>
                </div>
                <div className="mt-4 p-4 bg-slate-700/30 rounded-xl border border-slate-600/30">
                  <p className="text-xs text-slate-400 mb-2 font-medium">Password requirements:</p>
                  <ul className="text-xs text-slate-500 space-y-1">
                    <li className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${formData.password.length >= 8 ? 'bg-emerald-500' : 'bg-slate-500'}`}></span>
                      At least 8 characters
                    </li>
                    <li className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${/[A-Z]/.test(formData.password) ? 'bg-emerald-500' : 'bg-slate-500'}`}></span>
                      One uppercase letter
                    </li>
                    <li className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${/[a-z]/.test(formData.password) ? 'bg-emerald-500' : 'bg-slate-500'}`}></span>
                      One lowercase letter
                    </li>
                    <li className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${/\d/.test(formData.password) ? 'bg-emerald-500' : 'bg-slate-500'}`}></span>
                      One number
                    </li>
                  </ul>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-700/50">
                <button
                  type="button"
                  onClick={() => navigate('/admin/hr-admins')}
                  disabled={loading}
                  className="px-6 py-3 border border-slate-600/50 rounded-xl text-slate-300 hover:bg-slate-700/50 hover:text-white disabled:opacity-50 transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || success}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 flex items-center gap-2 font-medium shadow-lg shadow-blue-500/25 transition-all"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creating...
                    </>
                  ) : success ? (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      Created!
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-5 w-5" />
                      Create HR Admin
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateHRAdmin
