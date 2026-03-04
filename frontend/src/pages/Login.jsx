import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await login(formData.email, formData.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="font-display bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 antialiased min-h-screen">
      <div className="flex min-h-screen w-full flex-col">
        {/* Header */}
        <header className="absolute top-0 left-0 right-0 flex items-center justify-between px-8 py-6 z-20">
          <div className="flex items-center gap-2">
            <div className="size-9 text-primary">
            </div>
            <h2 className="text-xl font-bold tracking-tight flex justify-center items-center text-slate-800 text-white">MicroFinance</h2>
          </div>
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/')}
              className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              Back to Website
            </button>
            <button 
              onClick={() => navigate('/register')}
              className="hidden sm:block text-sm font-bold px-5 py-2.5 rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all"
            >
              Create Account
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex flex-1 min-h-screen">
          {/* Left Side - Modern Design Section */}
          <div className="hidden lg:flex w-[45%] relative bg-gradient-to-br from-blue-600 via-blue-700 to-teal-800">
            <div className="absolute inset-0 bg-black/10"></div>
            
            {/* Geometric Pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white/30 rounded-full"></div>
              <div className="absolute top-40 right-20 w-24 h-24 border-2 border-white/20 rounded-lg rotate-45"></div>
              <div className="absolute bottom-20 left-20 w-40 h-40 border-2 border-white/25 rounded-full"></div>
              <div className="absolute bottom-40 right-10 w-16 h-16 border-2 border-white/30 rounded-lg rotate-12"></div>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute top-20 right-16 w-3 h-3 bg-cyan-300/90 rounded-full animate-pulse"></div>
            <div className="absolute top-32 left-24 w-2 h-2 bg-emerald-300/80 rounded-full animate-pulse delay-75"></div>
            <div className="absolute bottom-32 right-32 w-4 h-4 bg-sky-300/85 rounded-full animate-pulse delay-150"></div>
            <div className="absolute bottom-20 left-16 w-2 h-2 bg-teal-300/90 rounded-full animate-pulse delay-300"></div>
            
            {/* Content */}
            <div className="relative z-20 flex flex-col justify-center items-center h-full p-16 text-center">
              <div className="mb-8">
                <div className="inline-flex p-4 rounded-2xl bg-white/20 backdrop-blur-lg border border-white/30 shadow-2xl">
                  <span className="material-symbols-outlined text-4xl text-white">rocket_launch</span>
                </div>
              </div>
              
              <h1 className="text-5xl font-black text-white mb-6 leading-tight text-center">
                Welcome to the Future of Finance
              </h1>
              
              <p className="text-xl text-white/90 mb-12 max-w-md leading-relaxed text-center">
                Experience seamless banking with cutting-edge technology designed for your success
              </p>
              
              {/* Feature Pills */}
              <div className="flex flex-wrap gap-3 justify-center mb-12">
                <div className="px-4 py-2 bg-white/20 backdrop-blur-lg rounded-full border border-white/30">
                  <span className="text-white text-sm font-medium text-center flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">rocket_launch</span> Smart Banking
                  </span>
                </div>
                <div className="px-4 py-2 bg-white/20 backdrop-blur-lg rounded-full border border-white/30">
                  <span className="text-white text-sm font-medium text-center flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">shield</span> 100% Secure
                  </span>
                </div>
                <div className="px-4 py-2 bg-white/20 backdrop-blur-lg rounded-full border border-white/30">
                  <span className="text-white text-sm font-medium text-center flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">bolt</span> Instant Access
                  </span>
                </div>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-3xl font-black text-white mb-1 text-center">50K+</div>
                  <div className="text-sm text-white/70 text-center">Users</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-white mb-1 text-center">$2M+</div>
                  <div className="text-sm text-white/70 text-center">Transactions</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-white mb-1 text-center">99.9%</div>
                  <div className="text-sm text-white/70 text-center">Uptime</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-background-dark px-6 py-20">
            <div className="w-full max-w-[420px]">
              <div className="mb-12 text-center lg:text-left">
                <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">Welcome back</h2>
                <p className="mt-4 text-slate-500 dark:text-slate-400 text-lg">Enter your credentials to manage your account.</p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
                  <p className="text-red-600 text-sm font-medium">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Email Field */}
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 ml-1" htmlFor="email">
                    Employee ID
                  </label>
                  <input 
                    className="block w-full rounded-full border-black dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-5 py-4 text-base transition-all placeholder:text-slate-400 focus:ring-0 border-primary"
                    id="text"
                    name="text"
                    type="text"
                    placeholder="EMP001"
                    value={formData.text}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-3">
                  <div className="flex justify-between items-ycenter px-1">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-200" htmlFor="password">
                      Password
                    </label>
                    <a className="text-xs font-bold text-primary hover:text-primary-hover transition-colors" href="#">
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <input 
                      className="block w-full rounded-full border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-5 py-4 text-base transition-all placeholder:text-slate-400 focus:ring-0 border-primary"
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <span className="material-symbols-outlined">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      className="h-4 w-4 rounded-full border-slate-300 dark:border-slate-700 text-primary focus:ring-0 transition-all cursor-pointer"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">
                      Keep me logged in for 30 days
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full h-16 rounded-full bg-primary text-white text-lg font-bold shadow-xl shadow-primary/20 hover:bg-primary-hover hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <span className="material-symbols-outlined animate-spin">refresh</span>
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign in to Account</span>
                        <span className="material-symbols-outlined">arrow_forward</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Create Account Link */}
              <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
                <p className="text-slate-500 dark:text-slate-400 font-medium">
                  New to the platform? 
                  <button 
                    onClick={() => navigate('/register')}
                    className="ml-1 inline-flex items-center font-extrabold text-primary hover:text-primary-hover group"
                  >
                    Create an account
                    <span className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-1">chevron_right</span>
                  </button>
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="lg:absolute bottom-0 right-0 w-full lg:w-[55%] py-6 px-10 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-widest font-bold text-slate-400 dark:text-slate-600 bg-white dark:bg-background-dark border-t border-slate-50 lg:border-none">
          <div>© {new Date().getFullYear()} MicroFinance Inc.</div>
          <div className="flex gap-6">
            <a className="hover:text-primary transition-colors" href="#">Privacy Policy</a>
            <a className="hover:text-primary transition-colors" href="#">Security Standards</a>
            <a className="hover:text-primary transition-colors" href="#">Support</a>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default Login
