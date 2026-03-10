import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import hrApi from '../../services/hrApi'
import HRHeader from '../../components/common/HRHeader'

const HRDashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { theme, colors } = useTheme()
  const isDark = theme === 'dark'
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
  const [departmentStats, setDepartmentStats] = useState([])
  const [leaveStats, setLeaveStats] = useState({ pending: 0, approved: 0, rejected: 0 })
  const [attendanceToday, setAttendanceToday] = useState({ present: 0, absent: 0, late: 0 })
  const employeesPerPage = 10

  useEffect(() => {
    fetchHRStats()
    fetchRecentEmployees()
    fetchDepartmentStats()
    fetchLeaveStats()
    fetchAttendanceToday()
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

  const fetchDepartmentStats = async () => {
    try {
      const response = await hrApi.getEmployeeStats()
      if (response.byDepartment) {
        setDepartmentStats(response.byDepartment)
      } else {
        // Fallback mock data
        setDepartmentStats([
          { name: 'IT', total: 25, active: 23, inactive: 2 },
          { name: 'Finance', total: 18, active: 17, inactive: 1 },
          { name: 'HR', total: 12, active: 12, inactive: 0 },
          { name: 'Operations', total: 30, active: 28, inactive: 2 },
          { name: 'Marketing', total: 15, active: 14, inactive: 1 },
          { name: 'Sales', total: 56, active: 48, inactive: 8 }
        ])
      }
    } catch (error) {
      console.error('Error fetching department stats:', error)
      setDepartmentStats([
        { name: 'IT', total: 25, active: 23, inactive: 2 },
        { name: 'Finance', total: 18, active: 17, inactive: 1 },
        { name: 'HR', total: 12, active: 12, inactive: 0 },
        { name: 'Operations', total: 30, active: 28, inactive: 2 },
        { name: 'Marketing', total: 15, active: 14, inactive: 1 },
        { name: 'Sales', total: 56, active: 48, inactive: 8 }
      ])
    }
  }

  const fetchLeaveStats = async () => {
    try {
      const response = await hrApi.getLeaveStats()
      setLeaveStats({
        pending: response.pending || 3,
        approved: response.approved || 12,
        rejected: response.rejected || 1
      })
    } catch (error) {
      console.error('Error fetching leave stats:', error)
      setLeaveStats({ pending: 3, approved: 12, rejected: 1 })
    }
  }

  const fetchAttendanceToday = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const response = await hrApi.getAttendanceStats(today)
      setAttendanceToday({
        present: response.present || 128,
        absent: response.absent || 8,
        late: response.late || 6
      })
    } catch (error) {
      console.error('Error fetching attendance:', error)
      setAttendanceToday({ present: 128, absent: 8, late: 6 })
    }
  }

  const fetchRecentEmployees = async () => {
    try {
      const response = await hrApi.getEmployees()
      const employees = response.data || []
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

  const quickActions = [
    { title: 'Employee Management', icon: 'people', path: '/hr/employees', color: 'blue', subtitle: 'Manage staff' },
    { title: 'Employee Verification', icon: 'verified', path: '/hr/verification', color: 'green', subtitle: 'Verify accounts' },
    { title: 'Bulk Operations', icon: 'group_work', path: '/hr/bulk-operations', color: 'purple', subtitle: 'Batch actions' },
    { title: 'Leave Management', icon: 'event_available', path: '/hr/leave', color: 'orange', subtitle: 'Manage leave' },
    { title: 'Attendance', icon: 'how_to_reg', path: '/hr/attendance', color: 'indigo', subtitle: 'Track attendance' },
    { title: 'Payroll', icon: 'payments', path: '/hr/payroll', color: 'teal', subtitle: 'Process salary' }
  ]

  const handleVerifyEmployee = async (employeeId) => {
    try {
      await hrApi.verifyEmployee(employeeId)
      fetchRecentEmployees()
      console.log('Employee verified successfully')
    } catch (error) {
      console.error('Error verifying employee:', error)
      alert('Failed to verify employee. Please try again.')
    }
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    applyPagination(allRecentEmployees)
  }

  const totalPages = Math.ceil(totalRecentEmployees / employeesPerPage)
  const startRecord = (currentPage - 1) * employeesPerPage + 1
  const endRecord = Math.min(currentPage * employeesPerPage, totalRecentEmployees)

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

  const getIconColor = (color) => {
    const colors = {
      blue: 'text-blue-600',
      green: 'text-green-600',
      purple: 'text-purple-600',
      orange: 'text-orange-600',
      red: 'text-red-600',
      indigo: 'text-indigo-600',
      teal: 'text-teal-600'
    }
    return colors[color] || 'text-gray-600'
  }

  const getIconBg = (color) => {
    const colors = {
      blue: 'bg-blue-50',
      green: 'bg-green-50',
      purple: 'bg-purple-50',
      orange: 'bg-orange-50',
      red: 'bg-red-50',
      indigo: 'bg-indigo-50',
      teal: 'bg-teal-50'
    }
    return colors[color] || 'bg-gray-50'
  }

  const getMaxDepartmentCount = () => {
    return Math.max(...departmentStats.map(d => d.total), 1)
  }

  const getMaxAttendance = () => {
    return Math.max(attendanceToday.present, attendanceToday.absent, attendanceToday.late, 1)
  }

  const getActiveRate = () => {
    if (stats.totalEmployees === 0) return 0
    return Math.round((stats.activeEmployees / stats.totalEmployees) * 100)
  }

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className={`mt-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Loading HR Dashboard...</p>
        </div>
      </div>
    )
  }

  // Dynamic color classes based on theme
  const cardColors = isDark ? {
    bg: 'bg-gray-800',
    border: 'border-gray-700',
    hover: 'hover:shadow-lg hover:border-gray-600',
    text: 'text-gray-100',
    textSecondary: 'text-gray-300',
    textMuted: 'text-gray-400',
  } : {
    bg: 'bg-white',
    border: 'border-gray-100',
    hover: 'hover:shadow-md',
    text: 'text-gray-800',
    textSecondary: 'text-gray-600',
    textMuted: 'text-gray-500',
  }

  return (
    <div className={`relative flex min-h-screen w-full flex-col overflow-x-hidden ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Consistent HR Header */}
      <HRHeader 
        currentPage="dashboard"
        theme={{
          icon: 'groups',
          iconBg: 'from-blue-500 to-blue-700',
          subtitle: 'Human Resources Management',
          activeButton: 'from-blue-500 to-blue-700',
          shadow: 'shadow-blue-500/30'
        }}
      />

      <main className="w-full px-4 sm:px-6 lg:px-8 pt-28 pb-8 max-w-[1600px] mx-auto">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 mb-6 text-white shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Welcome back, {user?.first_name || 'HR Admin'}! 👋</h1>
              <p className="text-blue-100 mt-1">Here's what's happening with your workforce today.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => navigate('/hr/employees')} className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">person_add</span>
                Add Employee
              </button>
              <button onClick={() => navigate('/hr/verification')} className="bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">verified</span>
                Verify Pending
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Employees */}
          <div className={`${cardColors.bg} rounded-2xl p-5 shadow-sm ${cardColors.border} ${cardColors.hover} transition-all`}>
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 ${isDark ? 'bg-blue-900/30' : 'bg-blue-50'} rounded-xl flex items-center justify-center`}>
                <span className={`material-symbols-outlined text-2xl ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>people</span>
              </div>
              <span className={`${isDark ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-700'} text-xs font-medium px-2 py-1 rounded-full`}>+12%</span>
            </div>
            <p className={`${cardColors.textMuted} text-sm`}>Total Employees</p>
            <p className={`text-3xl font-bold ${cardColors.text} mt-1`}>{stats.totalEmployees}</p>
            <div className={`mt-3 h-1.5 ${isDark ? 'bg-gray-700' : 'bg-gray-100'} rounded-full overflow-hidden`}>
              <div className="h-full bg-blue-500 rounded-full" style={{ width: '75%' }}></div>
            </div>
          </div>

          {/* Active Employees */}
          <div className={`${cardColors.bg} rounded-2xl p-5 shadow-sm ${cardColors.border} ${cardColors.hover} transition-all`}>
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 ${isDark ? 'bg-green-900/30' : 'bg-green-50'} rounded-xl flex items-center justify-center`}>
                <span className={`material-symbols-outlined text-2xl ${isDark ? 'text-green-400' : 'text-green-600'}`}>check_circle</span>
              </div>
              <span className={`${isDark ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-700'} text-xs font-medium px-2 py-1 rounded-full`}>{getActiveRate()}%</span>
            </div>
            <p className={`${cardColors.textMuted} text-sm`}>Active Employees</p>
            <p className={`text-3xl font-bold ${cardColors.text} mt-1`}>{stats.activeEmployees}</p>
            <div className={`mt-3 h-1.5 ${isDark ? 'bg-gray-700' : 'bg-gray-100'} rounded-full overflow-hidden`}>
              <div className="h-full bg-green-500 rounded-full" style={{ width: `${getActiveRate()}%` }}></div>
            </div>
          </div>

          {/* Pending Verifications */}
          <div className={`${cardColors.bg} rounded-2xl p-5 shadow-sm ${cardColors.border} ${cardColors.hover} transition-all`}>
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 ${isDark ? 'bg-amber-900/30' : 'bg-amber-50'} rounded-xl flex items-center justify-center`}>
                <span className={`material-symbols-outlined text-2xl ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>pending</span>
              </div>
              <span className={`${isDark ? 'bg-amber-900/50 text-amber-400' : 'bg-amber-100 text-amber-700'} text-xs font-medium px-2 py-1 rounded-full`}>Action needed</span>
            </div>
            <p className={`${cardColors.textMuted} text-sm`}>Pending Verification</p>
            <p className={`text-3xl font-bold ${cardColors.text} mt-1`}>{stats.pendingVerifications}</p>
            <button onClick={() => navigate('/hr/verification')} className={`mt-3 text-sm font-medium flex items-center gap-1 ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}>
              Review now <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>

          {/* Recent Registrations */}
          <div className={`${cardColors.bg} rounded-2xl p-5 shadow-sm ${cardColors.border} ${cardColors.hover} transition-all`}>
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 ${isDark ? 'bg-purple-900/30' : 'bg-purple-50'} rounded-xl flex items-center justify-center`}>
                <span className={`material-symbols-outlined text-2xl ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>person_add</span>
              </div>
              <span className={`${isDark ? 'bg-purple-900/50 text-purple-400' : 'bg-purple-100 text-purple-700'} text-xs font-medium px-2 py-1 rounded-full`}>This month</span>
            </div>
            <p className={`${cardColors.textMuted} text-sm`}>New Hires (30 days)</p>
            <p className={`text-3xl font-bold ${cardColors.text} mt-1`}>{stats.recentRegistrations}</p>
            <button onClick={() => navigate('/hr/employees')} className={`mt-3 text-sm font-medium flex items-center gap-1 ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}>
              View all <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
        {/* Recent Employees Table */}
        <div className={`${cardColors.bg} rounded-2xl shadow-sm ${cardColors.border} overflow-hidden`}>
          <div className={`px-6 py-4 ${cardColors.border} flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3`}>
            <h2 className={`text-lg font-semibold ${cardColors.text}`}>Recent Employee Registrations</h2>
            <div className={`text-sm ${cardColors.textMuted}`}>
              Showing {startRecord}-{endRecord} of {totalRecentEmployees}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className={isDark ? 'bg-gray-700/50' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Employee</th>
                  <th className={`px-6 py-3 text-left text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Department</th>
                  <th className={`px-6 py-3 text-left text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Status</th>
                  <th className={`px-6 py-3 text-left text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Verification</th>
                  <th className={`px-6 py-3 text-left text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Join Date</th>
                  <th className={`px-6 py-3 text-left text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-100'}`}>
                {recentEmployees.map((employee) => (
                  <tr key={employee.id} className={`${isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'} transition-colors`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {employee.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className={`font-medium ${cardColors.text}`}>{employee.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cardColors.textSecondary}>{employee.department}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 inline-flex text-xs font-semibold rounded-full ${
                        employee.status === 'Active' 
                          ? isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700' 
                          : isDark ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {employee.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 inline-flex text-xs font-semibold rounded-full ${
                        employee.verified 
                          ? isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700' 
                          : isDark ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {employee.verified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`${cardColors.textSecondary} text-sm`}>{employee.joinDate}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => navigate(`/hr/employees/${employee.id}`)}
                          className={`p-1.5 ${isDark ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'} rounded-lg transition-colors`}
                          title="View"
                        >
                          <span className="material-symbols-outlined text-lg">visibility</span>
                        </button>
                        {!employee.verified && (
                          <button 
                            onClick={() => handleVerifyEmployee(employee.id)}
                            className={`p-1.5 ${isDark ? 'bg-green-900/30 text-green-400 hover:bg-green-900/50' : 'bg-green-100 text-green-600 hover:bg-green-200'} rounded-lg transition-colors`}
                            title="Verify"
                          >
                            <span className="material-symbols-outlined text-lg">verified</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className={`px-6 py-4 ${cardColors.border} flex items-center justify-between`}>
              <div className={`text-sm ${cardColors.textMuted}`}>
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    isDark 
                      ? 'text-gray-300 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800' 
                      : 'text-gray-600 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, index) => {
                  const pageNum = index + 1
                  const isActive = pageNum === currentPage
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : isDark
                            ? 'text-gray-300 bg-gray-700 hover:bg-gray-600'
                            : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    isDark 
                      ? 'text-gray-300 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800' 
                      : 'text-gray-600 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default HRDashboard
