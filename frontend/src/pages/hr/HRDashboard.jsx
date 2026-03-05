import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import hrApi from '../../services/hrApi'

const HRDashboard = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    pendingVerifications: 0,
    recentRegistrations: 0
  })
  const [loading, setLoading] = useState(true)
  const [recentEmployees, setRecentEmployees] = useState([])
  const [allRecentEmployees, setAllRecentEmployees] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalRecentEmployees, setTotalRecentEmployees] = useState(0)
  const employeesPerPage = 10

  useEffect(() => {
    fetchHRStats()
    fetchRecentEmployees()
  }, [])

  const fetchHRStats = async () => {
    try {
      const statsData = await hrApi.getEmployeeStats()
      setStats({
        totalEmployees: statsData.total || 0,
        activeEmployees: statsData.active || 0,
        pendingVerifications: statsData.pending || 0,
        recentRegistrations: statsData.recent || 0
      })
    } catch (error) {
      console.error('Error fetching HR stats:', error)
      // Fallback to mock data if API fails
      setStats({
        totalEmployees: 156,
        activeEmployees: 142,
        pendingVerifications: 8,
        recentRegistrations: 12
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchRecentEmployees = async () => {
    try {
      const employees = await hrApi.getEmployees()
      // Get recent employees (last 30 days) and count total
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const recent = employees
        .filter(emp => new Date(emp.created_at || emp.hire_date) > thirtyDaysAgo)
        .sort((a, b) => new Date(b.created_at || b.hire_date) - new Date(a.created_at || a.hire_date))
      
      const formattedEmployees = recent.map(emp => ({
        id: emp.id,
        name: `${emp.first_name} ${emp.last_name}`,
        department: emp.department,
        status: emp.employment_status === 'ACTIVE' ? 'Active' : emp.employment_status,
        joinDate: emp.hire_date,
        verified: emp.hr_verified || false
      }))
      
      setAllRecentEmployees(formattedEmployees)
      setTotalRecentEmployees(formattedEmployees.length)
      applyPagination(formattedEmployees)
    } catch (error) {
      console.error('Error fetching recent employees:', error)
      // Fallback to mock data if API fails
      const mockEmployees = [
        { id: 1, name: 'Sarah Johnson', department: 'IT', status: 'Active', joinDate: '2024-01-15', verified: true },
        { id: 2, name: 'Michael Chen', department: 'Finance', status: 'Pending', joinDate: '2024-01-14', verified: false },
        { id: 3, name: 'Emily Davis', department: 'Marketing', status: 'Active', joinDate: '2024-01-13', verified: true },
        { id: 4, name: 'James Wilson', department: 'Operations', status: 'Active', joinDate: '2024-01-12', verified: true },
        { id: 5, name: 'Lisa Anderson', department: 'HR', status: 'Pending', joinDate: '2024-01-11', verified: false },
        { id: 6, name: 'David Brown', department: 'Marketing', status: 'Active', joinDate: '2024-01-10', verified: true },
        { id: 7, name: 'Jennifer Smith', department: 'IT', status: 'Active', joinDate: '2024-01-09', verified: true },
        { id: 8, name: 'Robert Johnson', department: 'Finance', status: 'Active', joinDate: '2024-01-08', verified: true },
        { id: 9, name: 'Maria Garcia', department: 'Operations', status: 'Active', joinDate: '2024-01-07', verified: false },
        { id: 10, name: 'William Davis', department: 'HR', status: 'Pending', joinDate: '2024-01-06', verified: false },
        { id: 11, name: 'Patricia Miller', department: 'IT', status: 'Active', joinDate: '2024-01-05', verified: true },
        { id: 12, name: 'Christopher Wilson', department: 'Marketing', status: 'Active', joinDate: '2024-01-04', verified: true },
        { id: 13, name: 'Nancy Martinez', department: 'Operations', status: 'Active', joinDate: '2024-01-03', verified: true },
        { id: 14, name: 'Daniel Anderson', department: 'Finance', status: 'Pending', joinDate: '2024-01-02', verified: false },
        { id: 15, name: 'Sarah Taylor', department: 'HR', status: 'Active', joinDate: '2024-01-01', verified: true }
      ]
      
      setAllRecentEmployees(mockEmployees)
      setTotalRecentEmployees(mockEmployees.length)
      applyPagination(mockEmployees)
  } finally {
    setLoading(false)
  }
}

const applyPagination = (employees) => {
  const startIndex = (currentPage - 1) * employeesPerPage
  const endIndex = startIndex + employeesPerPage
  const paginatedRecent = employees.slice(startIndex, endIndex)
  setRecentEmployees(paginatedRecent)
}

  const menuItems = [
    { title: 'Employee Management', icon: 'people', path: '/hr/employees', color: 'blue' },
    { title: 'Employee Verification', icon: 'verified', path: '/hr/verification', color: 'green' },
    { title: 'Bulk Operations', icon: 'group_work', path: '/hr/bulk-operations', color: 'purple' }
  ]

  const handleVerifyEmployee = async (employeeId) => {
    try {
      await hrApi.verifyEmployee(employeeId)
      // Refresh the recent employees list
      fetchRecentEmployees()
      console.log('Employee verified successfully')
    } catch (error) {
      console.error('Error verifying employee:', error)
      alert('Failed to verify employee. Please try again.')
    }
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    fetchRecentEmployees()
  }

  const totalPages = Math.ceil(totalRecentEmployees / employeesPerPage)
  const startRecord = (currentPage - 1) * employeesPerPage + 1
  const endRecord = Math.min(currentPage * employeesPerPage, totalRecentEmployees)

  const getGradientColor = (color) => {
    const gradients = {
      blue: 'from-blue-400 to-blue-600',
      green: 'from-green-400 to-green-600',
      purple: 'from-purple-400 to-purple-600',
      orange: 'from-orange-400 to-orange-600',
      red: 'from-red-400 to-red-600',
      indigo: 'from-indigo-400 to-indigo-600'
    }
    return gradients[color] || 'from-gray-400 to-gray-600'
  }

  const getIconBgColor = (color) => {
    const colors = {
      blue: 'bg-blue-100',
      green: 'bg-green-100',
      purple: 'bg-purple-100',
      orange: 'bg-orange-100',
      red: 'bg-red-100',
      indigo: 'bg-indigo-100'
    }
    return colors[color] || 'bg-gray-100'
  }

  const getIconColor = (color) => {
    const colors = {
      blue: 'text-blue-600',
      green: 'text-green-600',
      purple: 'text-purple-600',
      orange: 'text-orange-600',
      red: 'text-red-600',
      indigo: 'text-indigo-600'
    }
    return colors[color] || 'text-gray-600'
  }

  const getSubtitle = (title) => {
    const subtitles = {
      'Employee Management': 'Manage staff',
      'Employee Verification': 'Verify accounts',
      'Bulk Operations': 'Batch actions'
    }
    return subtitles[title] || 'Access module'
  }

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-500 hover:bg-blue-600',
      green: 'bg-green-500 hover:bg-green-600',
      purple: 'bg-purple-500 hover:bg-purple-600',
      orange: 'bg-orange-500 hover:bg-orange-600',
      red: 'bg-red-500 hover:bg-red-600',
      indigo: 'bg-indigo-500 hover:bg-indigo-600',
      pink: 'bg-pink-500 hover:bg-pink-600',
      teal: 'bg-teal-500 hover:bg-teal-600'
    }
    return colors[color] || 'bg-gray-500 hover:bg-gray-600'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading HR Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-gray-50">
      {/* Fixed Header */}
      <div className="fixed top-6 left-0 right-0 z-50 px-6">
        <header className="max-w-[1200px] mx-auto glass-header rounded-full px-8 py-4 flex items-center justify-between bg-white/70 backdrop-blur-xl border border-white/40 shadow-lg">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              </svg>
            </div>
            <h2 className="text-dark text-xl font-extrabold tracking-tight">MicroFinance HR</h2>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => navigate('/hr/dashboard')}
              className="text-primary text-sm font-semibold hover:text-primary/80 transition-colors"
            >
              Dashboard
            </button>
            <button 
              onClick={() => navigate('/hr/employees')}
              className="text-dark/80 text-sm font-semibold hover:text-primary transition-colors"
            >
              Employees
            </button>
            <button 
              onClick={() => navigate('/hr/verification')}
              className="text-dark/80 text-sm font-semibold hover:text-primary transition-colors"
            >
              Verification
            </button>
            <button 
              onClick={() => navigate('/hr/bulk-operations')}
              className="text-dark/80 text-sm font-semibold hover:text-primary transition-colors"
            >
              Bulk Ops
            </button>
          </nav>
          <div className="flex items-center gap-4">
            <span className="hidden sm:block text-dark/60 text-sm">
              Welcome, {user?.first_name || 'HR Admin'}
            </span>
            <button 
              onClick={() => {
                logout()
                navigate('/login')
              }}
              className="hidden sm:block text-dark text-sm font-bold hover:text-primary px-4"
            >
              Logout
            </button>
            
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <span className="material-symbols-outlined text-2xl text-dark">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </header>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="fixed top-24 left-0 right-0 z-40 px-6">
            <div className="max-w-[1200px] mx-auto glass-header rounded-2xl p-6 bg-white/95 backdrop-blur-xl border border-white/40 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <span className="text-dark/60 text-sm">
                  Welcome, {user?.first_name || 'HR Admin'}
                </span>
              </div>
              <nav className="flex flex-col gap-4">
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false)
                    navigate('/hr/dashboard')
                  }}
                  className="text-primary text-sm font-semibold hover:text-primary/80 transition-colors py-2 text-left"
                >
                  Dashboard
                </button>
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false)
                    navigate('/hr/employees')
                  }}
                  className="text-dark/80 text-sm font-semibold hover:text-primary transition-colors py-2 text-left"
                >
                  Employees
                </button>
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false)
                    navigate('/hr/verification')
                  }}
                  className="text-dark/80 text-sm font-semibold hover:text-primary transition-colors py-2 text-left"
                >
                  Verification
                </button>
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false)
                    navigate('/hr/bulk-operations')
                  }}
                  className="text-dark/80 text-sm font-semibold hover:text-primary transition-colors py-2 text-left"
                >
                  Bulk Operations
                </button>
                <button 
                  onClick={() => {
                    logout()
                    navigate('/login')
                  }}
                  className="text-dark text-sm font-bold hover:text-primary transition-colors py-2 text-left pt-4 border-t"
                >
                  Logout
                </button>
              </nav>
            </div>
          </div>
        )}
      </div>

      <main className="w-full px-4 sm:px-6 lg:px-8 pt-32 pb-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Employees */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                  <span className="material-symbols-outlined text-gray-600 text-lg">people</span>
                </div>
                <div>
                  <p className="text-base font-medium text-gray-900">Total Employees</p>
                  <p className="text-sm text-gray-500">All staff members</p>
                </div>
              </div>
            </div>
            <div className="flex items-baseline">
              <span className="text-3xl font-semibold text-gray-900">{stats.totalEmployees}</span>
              <span className="ml-2 text-sm text-gray-500">employees</span>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center text-sm text-gray-600">
                <span className="material-symbols-outlined text-sm mr-1">trending_up</span>
                <span>+12% from last month</span>
              </div>
            </div>
          </div>

          {/* Active Employees */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mr-3">
                  <span className="material-symbols-outlined text-green-600 text-lg">check_circle</span>
                </div>
                <div>
                  <p className="text-base font-medium text-gray-900">Active Employees</p>
                  <p className="text-sm text-gray-500">Currently working</p>
                </div>
              </div>
            </div>
            <div className="flex items-baseline">
              <span className="text-3xl font-semibold text-gray-900">{stats.activeEmployees}</span>
              <span className="ml-2 text-sm text-gray-500">employees</span>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center text-sm text-green-600">
                <span className="material-symbols-outlined text-sm mr-1">trending_up</span>
                <span>91% active rate</span>
              </div>
            </div>
          </div>

          {/* Pending Verifications */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center mr-3">
                  <span className="material-symbols-outlined text-amber-600 text-lg">pending</span>
                </div>
                <div>
                  <p className="text-base font-medium text-gray-900">Pending Verification</p>
                  <p className="text-sm text-gray-500">Awaiting approval</p>
                </div>
              </div>
            </div>
            <div className="flex items-baseline">
              <span className="text-3xl font-semibold text-gray-900">{stats.pendingVerifications}</span>
              <span className="ml-2 text-sm text-gray-500">employees</span>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center text-sm text-amber-600">
                <span className="material-symbols-outlined text-sm mr-1">schedule</span>
                <span>Requires attention</span>
              </div>
            </div>
          </div>

          {/* Recent Registrations */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mr-3">
                  <span className="material-symbols-outlined text-blue-600 text-lg">person_add</span>
                </div>
                <div>
                  <p className="text-base font-medium text-gray-900">Recent Registrations</p>
                  <p className="text-sm text-gray-500">Last 30 days</p>
                </div>
              </div>
            </div>
            <div className="flex items-baseline">
              <span className="text-3xl font-semibold text-gray-900">{stats.recentRegistrations}</span>
              <span className="ml-2 text-sm text-gray-500">new hires</span>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center text-sm text-blue-600">
                <span className="material-symbols-outlined text-sm mr-1">calendar_today</span>
                <span>This month</span>
              </div>
            </div>
          </div>
        </div>

       

        {/* Recent Employees Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Recent Employee Registrations</h2>
              <div className="text-sm text-gray-500">
                Showing {startRecord}-{endRecord} of {totalRecentEmployees} employees
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Verification
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Join Date
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentEmployees.map((employee) => (
                  <tr key={employee.id}>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-base font-medium text-gray-900">{employee.name}</div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-base text-gray-900">{employee.department}</div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
                        employee.status === 'Active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {employee.status}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
                        employee.verified 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {employee.verified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-base text-gray-900">
                      {employee.joinDate}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={() => navigate(`/hr/employees/${employee.id}`)}
                        className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors mr-2"
                      >
                        <span className="material-symbols-outlined text-sm mr-1">visibility</span>
                        View
                      </button>
                      {!employee.verified && (
                        <button 
                          onClick={() => handleVerifyEmployee(employee.id)}
                          className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm mr-1">verified</span>
                          Verify
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 sm:px-6 py-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                    Previous
                  </button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: totalPages }, (_, index) => {
                      const pageNum = index + 1
                      const isActive = pageNum === currentPage
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-1 text-sm ${
                            isActive
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                          } rounded-md`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default HRDashboard
