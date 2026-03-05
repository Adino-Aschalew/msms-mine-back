import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { 
  Home, 
  Users, 
  CreditCard, 
  TrendingUp, 
  FileText, 
  BarChart3, 
  Settings, 
  LogOut 
} from 'lucide-react'

const Layout = () => {
  const { user, logout, isHR } = useAuth()
  const location = useLocation()

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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-8">Microfinance</h1>
          
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="p-4 border-t">
          <button
            onClick={logout}
            className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">
              {menuItems.find(item => isActive(item.path))?.label || 'Dashboard'}
            </h2>
            {user && (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Welcome, {user.first_name || 'User'}</span>
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
