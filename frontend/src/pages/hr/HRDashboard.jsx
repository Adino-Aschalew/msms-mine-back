import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import hrApi from '../../services/hrApi'
import HRHeader from '../../components/common/HRHeader'

const HRDashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
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
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-600 text-2xl">people</span>
              </div>
              <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">+12%</span>
            </div>
            <p className="text-gray-500 text-sm">Total Employees</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{stats.totalEmployees}</p>
            <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: '75%' }}></div>
            </div>
          </div>

          {/* Active Employees */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-green-600 text-2xl">check_circle</span>
              </div>
              <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full">{getActiveRate()}%</span>
            </div>
            <p className="text-gray-500 text-sm">Active Employees</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{stats.activeEmployees}</p>
            <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full" style={{ width: `${getActiveRate()}%` }}></div>
            </div>
          </div>

          {/* Pending Verifications */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-amber-600 text-2xl">pending</span>
              </div>
              <span className="bg-amber-100 text-amber-700 text-xs font-medium px-2 py-1 rounded-full">Action needed</span>
            </div>
            <p className="text-gray-500 text-sm">Pending Verification</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{stats.pendingVerifications}</p>
            <button onClick={() => navigate('/hr/verification')} className="mt-3 text-sm text-blue-600 font-medium hover:text-blue-700 flex items-center gap-1">
              Review now <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>

          {/* Recent Registrations */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-purple-600 text-2xl">person_add</span>
              </div>
              <span className="bg-purple-100 text-purple-700 text-xs font-medium px-2 py-1 rounded-full">This month</span>
            </div>
            <p className="text-gray-500 text-sm">New Hires (30 days)</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{stats.recentRegistrations}</p>
            <button onClick={() => navigate('/hr/employees')} className="mt-3 text-sm text-blue-600 font-medium hover:text-blue-700 flex items-center gap-1">
              View all <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Secondary Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Today's Attendance */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-indigo-600">how_to_reg</span>
              </div>
              <h3 className="font-semibold text-gray-800">Today's Attendance</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600 text-sm">Present</span>
                </div>
                <span className="font-semibold text-gray-800">{attendanceToday.present}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-gray-600 text-sm">Absent</span>
                </div>
                <span className="font-semibold text-gray-800">{attendanceToday.absent}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span className="text-gray-600 text-sm">Late</span>
                </div>
                <span className="font-semibold text-gray-800">{attendanceToday.late}</span>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden flex">
                  <div className="h-full bg-green-500" style={{ width: `${(attendanceToday.present / getMaxAttendance()) * 100}%` }}></div>
                  <div className="h-full bg-red-500" style={{ width: `${(attendanceToday.absent / getMaxAttendance()) * 100}%` }}></div>
                  <div className="h-full bg-amber-500" style={{ width: `${(attendanceToday.late / getMaxAttendance()) * 100}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Leave Requests */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-orange-600">event_available</span>
              </div>
              <h3 className="font-semibold text-gray-800">Leave Requests</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span className="text-gray-600 text-sm">Pending</span>
                </div>
                <span className="font-semibold text-gray-800">{leaveStats.pending}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600 text-sm">Approved</span>
                </div>
                <span className="font-semibold text-gray-800">{leaveStats.approved}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-gray-600 text-sm">Rejected</span>
                </div>
                <span className="font-semibold text-gray-800">{leaveStats.rejected}</span>
              </div>
              <button onClick={() => navigate('/hr/leave')} className="mt-3 w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium rounded-lg transition-colors">
                Manage Leave
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-cyan-50 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-cyan-600">bolt</span>
              </div>
              <h3 className="font-semibold text-gray-800">Quick Actions</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => navigate('/hr/employees')} className="p-2 bg-blue-50 hover:bg-blue-100 rounded-lg text-center transition-colors">
                <span className="material-symbols-outlined text-blue-600 text-xl">person_add</span>
                <p className="text-xs text-blue-700 font-medium mt-1">Add Employee</p>
              </button>
              <button onClick={() => navigate('/hr/verification')} className="p-2 bg-green-50 hover:bg-green-100 rounded-lg text-center transition-colors">
                <span className="material-symbols-outlined text-green-600 text-xl">verified</span>
                <p className="text-xs text-green-700 font-medium mt-1">Verify</p>
              </button>
              <button onClick={() => navigate('/hr/bulk-operations')} className="p-2 bg-purple-50 hover:bg-purple-100 rounded-lg text-center transition-colors">
                <span className="material-symbols-outlined text-purple-600 text-xl">group_work</span>
                <p className="text-xs text-purple-700 font-medium mt-1">Bulk Ops</p>
              </button>
              <button onClick={() => navigate('/hr/payroll')} className="p-2 bg-teal-50 hover:bg-teal-100 rounded-lg text-center transition-colors">
                <span className="material-symbols-outlined text-teal-600 text-xl">payments</span>
                <p className="text-xs text-teal-700 font-medium mt-1">Payroll</p>
              </button>
            </div>
          </div>
        </div>

        {/* Department Overview */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Department Overview</h2>
            <button onClick={() => navigate('/hr/employees')} className="text-sm text-blue-600 font-medium hover:text-blue-700 flex items-center gap-1">
              View all <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {departmentStats.map((dept, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-800">{dept.name}</span>
                    <span className="text-sm text-gray-500">{dept.total} employees</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500" 
                      style={{ width: `${(dept.total / getMaxDepartmentCount()) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs">
                    <span className="text-green-600 font-medium">{dept.active} active</span>
                    <span className="text-gray-400">{dept.inactive} inactive</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Employees Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="text-lg font-semibold text-gray-800">Recent Employee Registrations</h2>
            <div className="text-sm text-gray-500">
              Showing {startRecord}-{endRecord} of {totalRecentEmployees}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Verification</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Join Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {employee.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="font-medium text-gray-800">{employee.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600">{employee.department}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 inline-flex text-xs font-semibold rounded-full ${
                        employee.status === 'Active' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {employee.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 inline-flex text-xs font-semibold rounded-full ${
                        employee.verified 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {employee.verified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600 text-sm">{employee.joinDate}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => navigate(`/hr/employees/${employee.id}`)}
                          className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                          title="View"
                        >
                          <span className="material-symbols-outlined text-lg">visibility</span>
                        </button>
                        {!employee.verified && (
                          <button 
                            onClick={() => handleVerifyEmployee(employee.id)}
                            className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
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
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                  className="px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
