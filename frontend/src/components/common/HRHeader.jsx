import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { Moon, Sun } from 'lucide-react'

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
  theme: headerTheme = {
    icon: 'groups',
    iconBg: 'from-blue-500 to-blue-700',
    subtitle: 'Human Resources Management',
    activeButton: 'from-blue-500 to-blue-600',
    shadow: 'shadow-blue-500/30'
  }
}) => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { theme, toggleTheme, colors } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const dropdownRef = useRef(null)
  const notificationRef = useRef(null)
  
  // Sample notifications - in real app, this would come from an API
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'New Employee Registered',
      message: 'John Doe has completed registration and awaits verification.',
      time: '5 min ago',
      read: false,
      type: 'info'
    },
    {
      id: 2,
      title: 'Leave Request Pending',
      message: 'Sarah Williams has submitted a leave request for approval.',
      time: '1 hour ago',
      read: false,
      type: 'warning'
    },
    {
      id: 3,
      title: 'Payroll Processed',
      message: 'March 2026 payroll has been successfully processed.',
      time: '2 hours ago',
      read: true,
      type: 'success'
    },
    {
      id: 4,
      title: 'Employee Verified',
      message: 'Michael Johnson has been verified and activated.',
      time: '1 day ago',
      read: true,
      type: 'success'
    }
  ])
  
  const unreadCount = notifications.filter(n => !n.read).length
  
  // Use dynamic colors based on theme
  const isDark = theme === 'dark'
  const dynamicColors = isDark ? {
    header: 'bg-gray-800/80 border-gray-700/50',
    text: 'text-gray-100',
    textMuted: 'text-gray-400',
    textInverse: 'text-gray-900',
    hover: 'hover:bg-gray-700/50',
    dropdown: 'bg-gray-800 border-gray-700',
    dropdownHover: 'hover:bg-gray-700/50',
  } : {
    header: 'bg-white/80 border-white/40',
    text: 'text-gray-800',
    textMuted: 'text-gray-500',
    textInverse: 'text-white',
    hover: 'hover:bg-gray-100',
    dropdown: 'bg-white border-gray-100',
    dropdownHover: 'hover:bg-gray-50',
  }

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
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const markNotificationRead = (id) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ))
  }

  const markAllNotificationsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <span className="material-symbols-outlined text-green-500">check_circle</span>
      case 'warning':
        return <span className="material-symbols-outlined text-yellow-500">warning</span>
      case 'error':
        return <span className="material-symbols-outlined text-red-500">error</span>
      default:
        return <span className="material-symbols-outlined text-blue-500">info</span>
    }
  }

  return (
    <>
      {/* Fixed Header */}
      <div className="fixed top-4 left-0 right-0 z-50 px-4 sm:px-6">
        <header className={`max-w-[1600px] mx-auto rounded-2xl px-6 py-3 flex items-center justify-between ${dynamicColors.header} backdrop-blur-xl ${isDark ? 'border-gray-700/50' : 'border-white/40'} shadow-xl`}>
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className={`bg-gradient-to-br ${headerTheme.iconBg} p-2.5 rounded-2xl shadow-lg`}>
              <span className="material-symbols-outlined text-white text-2xl">{headerTheme.icon}</span>
            </div>
            <div>
              <h2 className={`${dynamicColors.text} text-xl font-bold tracking-tight`}>HR Portal</h2>
              <p className={`${dynamicColors.textMuted} text-xs`}>{headerTheme.subtitle}</p>
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
                    ? `bg-gradient-to-r ${headerTheme.activeButton} text-white shadow-lg ${headerTheme.shadow}`
                    : `${dynamicColors.text} ${dynamicColors.hover}`
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* User & Actions */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl transition-all ${isDark ? 'bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600/30 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'} `}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            
            {/* Notification Bell */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setNotificationOpen(!notificationOpen)}
                className={`relative p-2 rounded-xl transition-all ${isDark ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                title="Notifications"
              >
                <span className="material-symbols-outlined">notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {notificationOpen && (
                <div className={`absolute right-0 mt-2 w-80 ${dynamicColors.dropdown} rounded-2xl shadow-xl border overflow-hidden z-50`}>
                  <div className={`px-4 py-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'} flex items-center justify-between`}>
                    <h3 className={`${dynamicColors.text} font-semibold`}>Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-xs text-teal-500 hover:text-teal-400"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className={`px-4 py-6 text-center ${dynamicColors.textMuted}`}>
                        <span className="material-symbols-outlined text-3xl mb-2">notifications_off</span>
                        <p className="text-sm">No notifications</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => markNotificationRead(notification.id)}
                          className={`px-4 py-3 border-b ${isDark ? 'border-gray-700/50' : 'border-gray-100'} hover:bg-gray-500/10 cursor-pointer transition-all ${!notification.read ? (isDark ? 'bg-gray-700/20' : 'bg-blue-50') : ''}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium ${dynamicColors.text}`}>{notification.title}</p>
                              <p className={`text-xs ${dynamicColors.textMuted} mt-0.5`}>{notification.message}</p>
                              <p className={`text-xs ${dynamicColors.textMuted} mt-1`}>{notification.time}</p>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-teal-500 rounded-full mt-1.5"></div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`hidden sm:flex items-center gap-2 p-1.5 pr-3 rounded-xl transition-all ${isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-100'}`}
              >
                <div className={`w-8 h-8 bg-gradient-to-br ${headerTheme.iconBg} rounded-full flex items-center justify-center shadow-lg`}>
                  <span className="text-white text-sm font-bold">
                    {user?.first_name?.charAt(0) || 'A'}
                  </span>
                </div>
                <span className={`${dynamicColors.text} text-sm font-medium`}>
                  {user?.first_name || 'Admin'}
                </span>
                <span className={`material-symbols-outlined ${dynamicColors.textMuted} transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className={`absolute right-0 mt-2 w-64 ${dynamicColors.dropdown} rounded-2xl shadow-xl border overflow-hidden z-50`}>
                  {/* User Info */}
                  <div className={`px-4 py-3 ${isDark ? 'bg-gradient-to-r from-gray-700/50 to-gray-800 border-b border-gray-700' : 'bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-100'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 bg-gradient-to-br ${headerTheme.iconBg} rounded-full flex items-center justify-center shadow-lg`}>
                        <span className="text-white text-sm font-bold">
                          {user?.first_name?.charAt(0) || 'A'}
                        </span>
                      </div>
                      <div>
                        <p className={`${dynamicColors.text} font-semibold text-sm`}>
                          {user?.first_name || 'Admin'} {user?.last_name || ''}
                        </p>
                        <p className={`${dynamicColors.textMuted} text-xs`}>{user?.email || 'admin@company.com'}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Menu Items */}
                  <div className="py-2">
                    <button
                      onClick={() => {
                        setDropdownOpen(false)
                        navigate('/hr/profile')
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors ${isDark ? 'text-gray-300 hover:bg-gray-700/50' : 'text-gray-700 hover:bg-gray-50'}`}
                    >
                      <span className={`material-symbols-outlined ${dynamicColors.textMuted}`}>person</span>
                      <span className="text-sm font-medium">Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        setDropdownOpen(false)
                        navigate('/hr/settings')
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors ${isDark ? 'text-gray-300 hover:bg-gray-700/50' : 'text-gray-700 hover:bg-gray-50'}`}
                    >
                      <span className={`material-symbols-outlined ${dynamicColors.textMuted}`}>settings</span>
                      <span className="text-sm font-medium">Settings</span>
                    </button>
                  </div>
                  
                  {/* Sign Out */}
                  <div className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-100'} py-2`}>
                    <button
                      onClick={handleLogout}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors ${isDark ? 'text-red-400 hover:bg-red-500/10' : 'text-red-600 hover:bg-red-50'}`}
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
              className={`sm:hidden flex items-center justify-center w-10 h-10 rounded-xl transition-all ${isDark ? 'bg-gray-700/50 hover:bg-gray-600/50' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              <div className={`w-8 h-8 bg-gradient-to-br ${headerTheme.iconBg} rounded-full flex items-center justify-center shadow-lg`}>
                <span className="text-white text-sm font-bold">
                  {user?.first_name?.charAt(0) || 'A'}
                </span>
              </div>
            </button>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`lg:hidden flex items-center justify-center w-10 h-10 rounded-xl transition-all ${isDark ? 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
            >
              <span className="material-symbols-outlined text-xl">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </header>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="fixed top-20 left-0 right-0 z-40 px-4">
            <div className={`max-w-[1600px] mx-auto rounded-2xl p-5 ${isDark ? 'bg-gray-800/95 border-gray-700/50' : 'bg-white/95 border-white/40'} backdrop-blur-xl shadow-xl`}>
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
                        ? `bg-gradient-to-r ${headerTheme.activeButton} text-white`
                        : `${dynamicColors.text} ${dynamicColors.hover}`
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
                <button
                  onClick={handleLogout}
                  className={`font-medium py-3 px-4 rounded-xl text-left border-t mt-2 ${isDark ? 'text-red-400 hover:bg-red-500/10' : 'text-red-500 hover:bg-red-50'}`}
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
