import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { 
  Home, 
  Users, 
  CreditCard, 
  TrendingUp, 
  FileText, 
  BarChart3, 
  Settings, 
  LogOut,
  Moon,
  Sun
} from 'lucide-react'

const Layout = () => {
  const { user, logout, isHR } = useAuth()
  const location = useLocation()
  const { theme, toggleTheme, colors } = useTheme()
  const isDark = theme === 'dark'
  
  // Dynamic colors based on theme
  const dynamicColors = isDark ? {
    background: 'bg-gray-900',
    sidebar: 'bg-gray-800',
    sidebarBorder: 'border-gray-700',
    text: 'text-gray-100',
    textSecondary: 'text-gray-300',
    textMuted: 'text-gray-400',
    hover: 'hover:bg-gray-700',
    active: 'bg-blue-600 text-white',
    border: 'border-gray-200',
  } : {
    background: 'bg-gray-50',
    sidebar: 'bg-white',
    sidebarBorder: 'border-gray-200',
    text: 'text-gray-800',
    textSecondary: 'text-gray-600',
    textMuted: 'text-gray-500',
    hover: 'hover:bg-gray-100',
    active: 'bg-blue-600 text-white',
    border: 'border-gray-200',
  }

  const regularMenuItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/loans', icon: CreditCard, label: 'Loans' },
    { path: '/savings', icon: TrendingUp, label: 'Savings' },
    { path: '/payroll', icon: FileText, label: 'Payroll' },
    { path: '/reports', icon: BarChart3, label: 'Reports' },
    { path: '/ai', icon: Settings, label: 'AI & Analytics' },
  ]

  const hrMenuItems = [
    { path: '/hr', icon: Home, label: 'HR Dashboard' },
    { path: '/hr/employees', icon: Users, label: 'Employee Management' },
    { path: '/hr/verification', icon: Settings, label: 'Employee Verification' },
    { path: '/hr/bulk-operations', icon: Users, label: 'Bulk Operations' },
    { path: '/hr/departments', icon: BarChart3, label: 'Departments' },
    { path: '/hr/job-grades', icon: FileText, label: 'Job Grades' },
    { path: '/hr/stats', icon: TrendingUp, label: 'Statistics' },
  ]

  const menuItems = isHR() ? hrMenuItems : regularMenuItems

  const isActive = (path) => location.pathname === path

  return (
    <div className={`min-h-screen ${dynamicColors.background} flex`}>
      {/* Sidebar */}
      <div className={`w-64 ${dynamicColors.sidebar} shadow-lg ${isDark ? '' : dynamicColors.sidebarBorder}`}>
        <div className="p-6">
          <h1 className={`text-2xl font-bold ${dynamicColors.text} mb-8`}>Microfinance</h1>
          
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-blue-600 text-white'
                    : `${dynamicColors.text} ${dynamicColors.hover}`
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        
        <div className={`p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`flex items-center w-full px-4 py-3 mb-2 rounded-lg transition-colors ${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            {isDark ? <Sun className="w-5 h-5 mr-3" /> : <Moon className="w-5 h-5 mr-3" />}
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button
            onClick={logout}
            className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className={`${dynamicColors.sidebar} shadow-sm ${isDark ? 'border-gray-700' : 'border-gray-200'} border-b`}>
          <div className="px-6 py-4 flex justify-between items-center">
            <h2 className={`text-xl font-semibold ${dynamicColors.text}`}>
              {menuItems.find(item => isActive(item.path))?.label || 'Dashboard'}
            </h2>
            {user && (
              <div className="flex items-center space-x-4">
                <span className={`text-sm ${dynamicColors.textSecondary}`}>Welcome, {user.first_name || 'User'}</span>
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {user.first_name?.[0] || 'U'}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
