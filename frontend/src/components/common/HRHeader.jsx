import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

/**
 * Consistent HR Header Component
 * Used across all HR portal pages for consistent navigation and branding
 * 
 * @param {string} currentPage - The current active page identifier
 * @param {object} theme - Theme configuration for the page
 * @param {string} theme.icon - Material symbol icon name
 * @param {string} theme.iconBg - Background gradient for icon
 * @param {string} theme.subtitle - Subtitle text for the header
 * @param {string} theme.activeButton - Background class for active nav button
 * @param {string} theme.shadow - Shadow class for icon background
 */
const HRHeader = ({ 
  currentPage = 'dashboard',
  theme = {
    icon: 'groups',
    iconBg: 'from-blue-500 to-blue-700',
    subtitle: 'Human Resources Management',
    activeButton: 'from-blue-500 to-blue-600',
    shadow: 'shadow-blue-500/30'
  }
}) => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', path: '/hr' },
    { id: 'employees', label: 'Employees', path: '/hr/employees' },
    { id: 'verification', label: 'Verification', path: '/hr/verification' },
    { id: 'bulk-operations', label: 'Bulk Ops', path: '/hr/bulk-operations' },
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (id) => currentPage === id

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <>
      {/* Fixed Header */}
      <div className="fixed top-4 left-0 right-0 z-50 px-4 sm:px-6">
        <header className="max-w-[1600px] mx-auto rounded-2xl px-6 py-3 flex items-center justify-between bg-white/80 backdrop-blur-xl border border-white/40 shadow-xl">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className={`bg-gradient-to-br ${theme.iconBg} p-2.5 rounded-2xl shadow-lg`}>
              <span className="material-symbols-outlined text-white text-2xl">{theme.icon}</span>
            </div>
            <div>
              <h2 className="text-gray-800 text-xl font-bold tracking-tight">HR Portal</h2>
              <p className="text-gray-400 text-xs">{theme.subtitle}</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
                  isActive(item.id)
                    ? `bg-gradient-to-r ${theme.activeButton} text-white shadow-lg ${theme.shadow}`
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* User & Actions */}
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <button
              className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
              title="Notifications"
            >
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="hidden sm:flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-gray-100 transition-all"
              >
                <div className={`w-8 h-8 bg-gradient-to-br ${theme.iconBg} rounded-full flex items-center justify-center shadow-lg`}>
                  <span className="text-white text-sm font-bold">
                    {user?.first_name?.charAt(0) || 'A'}
                  </span>
                </div>
                <span className="text-gray-600 text-sm font-medium">
                  {user?.first_name || 'Admin'}
                </span>
                <span className={`material-symbols-outlined text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                  {/* User Info */}
                  <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 bg-gradient-to-br ${theme.iconBg} rounded-full flex items-center justify-center shadow-lg`}>
                        <span className="text-white text-sm font-bold">
                          {user?.first_name?.charAt(0) || 'A'}
                        </span>
                      </div>
                      <div>
                        <p className="text-gray-800 font-semibold text-sm">
                          {user?.first_name || 'Admin'} {user?.last_name || ''}
                        </p>
                        <p className="text-gray-500 text-xs">{user?.email || 'admin@company.com'}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Menu Items */}
                  <div className="py-2">
                    <button
                      onClick={() => {
                        setDropdownOpen(false)
                        // Navigate to profile
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <span className="material-symbols-outlined text-gray-500">person</span>
                      <span className="text-sm font-medium">Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        setDropdownOpen(false)
                        // Navigate to settings
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <span className="material-symbols-outlined text-gray-500">settings</span>
                      <span className="text-sm font-medium">Settings</span>
                    </button>
                  </div>
                  
                  {/* Sign Out */}
                  <div className="border-t border-gray-100 py-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <span className="material-symbols-outlined">logout</span>
                      <span className="text-sm font-medium">Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Profile Button (for small screens) */}
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="sm:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all"
            >
              <div className={`w-8 h-8 bg-gradient-to-br ${theme.iconBg} rounded-full flex items-center justify-center shadow-lg`}>
                <span className="text-white text-sm font-bold">
                  {user?.first_name?.charAt(0) || 'A'}
                </span>
              </div>
            </button>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all"
            >
              <span className="material-symbols-outlined text-xl text-gray-700">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </header>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="fixed top-20 left-0 right-0 z-40 px-4">
            <div className="max-w-[1600px] mx-auto rounded-2xl p-5 bg-white/95 backdrop-blur-xl border border-white/40 shadow-xl">
              <nav className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setMobileMenuOpen(false)
                      navigate(item.path)
                    }}
                    className={`font-medium py-3 px-4 rounded-xl text-left transition-all ${
                      isActive(item.id)
                        ? `bg-gradient-to-r ${theme.activeButton} text-white`
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
                <button
                  onClick={handleLogout}
                  className="text-red-500 font-medium py-3 px-4 rounded-xl hover:bg-red-50 text-left border-t mt-2"
                >
                  Sign Out
                </button>
              </nav>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default HRHeader
