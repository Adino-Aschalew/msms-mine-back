import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Shield,
  Key,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Save
} from 'lucide-react'

const AdminSecurity = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validatePassword = (password) => {
    const errors = []
    if (password.length < 8) {
      errors.push('At least 8 characters')
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('One uppercase letter')
    }
    if (!/[a-z]/.test(password)) {
      errors.push('One lowercase letter')
    }
    if (!/\d/.test(password)) {
      errors.push('One number')
    }
    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!formData.currentPassword) {
      setError('Current password is required')
      return
    }

    if (!formData.newPassword) {
      setError('New password is required')
      return
    }

    const passwordErrors = validatePassword(formData.newPassword)
    if (passwordErrors.length > 0) {
      setError(`Password must have: ${passwordErrors.join(', ')}`)
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match')
      return
    }

    if (formData.currentPassword === formData.newPassword) {
      setError('New password must be different from current password')
      return
    }

    setLoading(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      setSuccess(true)
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.message || 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  const passwordStrength = () => {
    if (!formData.newPassword) return { strength: 0, label: 'None', color: 'bg-slate-500' }
    
    let score = 0
    if (formData.newPassword.length >= 8) score++
    if (formData.newPassword.length >= 12) score++
    if (/[A-Z]/.test(formData.newPassword)) score++
    if (/[a-z]/.test(formData.newPassword)) score++
    if (/\d/.test(formData.newPassword)) score++
    if (/[^A-Za-z0-9]/.test(formData.newPassword)) score++

    if (score <= 2) return { strength: score, label: 'Weak', color: 'bg-red-500' }
    if (score <= 4) return { strength: score, label: 'Medium', color: 'bg-amber-500' }
    return { strength: score, label: 'Strong', color: 'bg-emerald-500' }
  }

  const strength = passwordStrength()

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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Security</h1>
                <p className="text-sm text-slate-400 mt-0.5">Manage your password and security settings</p>
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
                  <p className="text-sm text-emerald-300/80">Password updated successfully.</p>
                </div>
              </div>
            </div>
          )}

          {/* Error Alert */}
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

          {/* Change Password */}
          <div className="bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-xl shadow-black/10">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600">
                  <Key className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white">Change Password</h3>
              </div>

              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    placeholder="Enter current password"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    placeholder="Enter new password"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                
                {/* Password Strength */}
                {formData.newPassword && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-400">Password strength:</span>
                      <span className={`text-xs font-medium ${strength.color.replace('bg-', 'text-').replace('500', '400')}`}>
                        {strength.label}
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${strength.color} transition-all duration-300`}
                        style={{ width: `${(strength.strength / 6) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm new password"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {formData.confirmPassword && formData.newPassword === formData.confirmPassword && (
                  <div className="flex items-center gap-2 mt-2 text-emerald-400">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-xs">Passwords match</span>
                  </div>
                )}
              </div>

              {/* Password Requirements */}
              <div className="p-4 bg-slate-700/30 rounded-xl border border-slate-600/30">
                <p className="text-xs text-slate-400 mb-2 font-medium">Password requirements:</p>
                <ul className="text-xs text-slate-500 space-y-1">
                  <li className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${formData.newPassword.length >= 8 ? 'bg-emerald-500' : 'bg-slate-500'}`}></span>
                    At least 8 characters
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${/[A-Z]/.test(formData.newPassword) ? 'bg-emerald-500' : 'bg-slate-500'}`}></span>
                    One uppercase letter
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${/[a-z]/.test(formData.newPassword) ? 'bg-emerald-500' : 'bg-slate-500'}`}></span>
                    One lowercase letter
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${/\d/.test(formData.newPassword) ? 'bg-emerald-500' : 'bg-slate-500'}`}></span>
                    One number
                  </li>
                </ul>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-700/50">
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
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 flex items-center gap-2 font-medium shadow-lg shadow-emerald-500/25 transition-all"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Lock className="h-5 w-5" />
                      Update Password
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

export default AdminSecurity
