import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import hrApi from '../../services/hrApi'
import HRHeader from '../../components/common/HRHeader'

const EmployeeManagement = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { theme, colors } = useTheme()
  const isDark = theme === 'dark'
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDepartment, setFilterDepartment] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [employeeToDelete, setEmployeeToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Dynamic color classes based on theme
  const cardColors = isDark ? {
    bg: 'bg-gray-800',
    bg80: 'bg-gray-800/80',
    border: 'border-gray-700',
    border100: 'border-gray-100',
    hover: 'hover:shadow-lg hover:border-gray-600',
    text: 'text-gray-100',
    textSecondary: 'text-gray-300',
    textMuted: 'text-gray-400',
    inputBg: 'bg-gray-700',
    inputBorder: 'border-gray-600',
    tableHover: 'hover:bg-gray-700/50',
    tableBorder: 'divide-gray-700',
  } : {
    bg: 'bg-white',
    bg80: 'bg-white/80',
    border: 'border-gray-100',
    border100: 'border-gray-100',
    hover: 'hover:shadow-md',
    text: 'text-gray-800',
    textSecondary: 'text-gray-600',
    textMuted: 'text-gray-500',
    inputBg: 'bg-gray-50',
    inputBorder: 'border-gray-100',
    tableHover: 'hover:bg-gray-50',
    tableBorder: 'divide-gray-100',
  }

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      const response = await hrApi.getEmployees()
      const employeesData = response.data || []
      const formattedEmployees = employeesData.map(emp => ({
        id: emp.id,
        employeeId: emp.employee_id,
        name: `${emp.first_name} ${emp.last_name}`,
        email: emp.email,
        department: emp.department,
        position: emp.job_grade,
        status: emp.employment_status === 'ACTIVE' ? 'Active' : emp.employment_status,
        joinDate: emp.hire_date,
        phone: emp.phone,
        salary: emp.salary || 0
      }))
      setEmployees(formattedEmployees)
    } catch (error) {
      console.error('Error fetching employees:', error)
      const mockEmployees = [
        { id: 1, employeeId: 'EMP001', name: 'John Doe', email: 'john.doe@company.com', department: 'IT', position: 'Senior Developer', status: 'Active', joinDate: '2022-01-15', phone: '+251911234567', salary: 25000 },
        { id: 2, employeeId: 'EMP002', name: 'Jane Smith', email: 'jane.smith@company.com', department: 'Finance', position: 'Accountant', status: 'Active', joinDate: '2021-06-01', phone: '+251912345678', salary: 18000 },
        { id: 3, employeeId: 'EMP003', name: 'Michael Johnson', email: 'michael.johnson@company.com', department: 'HR', position: 'HR Manager', status: 'Active', joinDate: '2020-03-10', phone: '+251913345679', salary: 22000 },
        { id: 4, employeeId: 'EMP004', name: 'Sarah Williams', email: 'sarah.williams@company.com', department: 'Operations', position: 'Operations Manager', status: 'On Leave', joinDate: '2019-11-20', phone: '+251914345680', salary: 20000 },
        { id: 5, employeeId: 'EMP005', name: 'David Brown', email: 'david.brown@company.com', department: 'Marketing', position: 'Marketing Specialist', status: 'Active', joinDate: '2021-09-15', phone: '+251915345681', salary: 16000 },
        { id: 6, employeeId: 'EMP006', name: 'Emily Davis', email: 'emily.davis@company.com', department: 'IT', position: 'Junior Developer', status: 'Pending', joinDate: '2024-01-10', phone: '+251916345682', salary: 12000 }
      ]
      setEmployees(mockEmployees)
    } finally {
      setLoading(false)
    }
  }

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = filterDepartment === 'all' || employee.department === filterDepartment
    const matchesStatus = filterStatus === 'all' || employee.status === filterStatus
    return matchesSearch && matchesDepartment && matchesStatus
  })

  const departments = ['all', 'IT', 'Finance', 'HR', 'Operations', 'Marketing']
  const statuses = ['all', 'Active', 'On Leave', 'Pending', 'Inactive']

  const handleViewEmployee = (employee) => {
    setSelectedEmployee(employee)
    navigate(`/hr/employees/${employee.id}`)
  }

  const handleEditEmployee = (employee) => {
    setSelectedEmployee(employee)
    setShowEditModal(true)
  }

  const handleDeleteEmployee = (employee) => {
    setEmployeeToDelete(employee)
    setShowDeleteModal(true)
  }

  const confirmDeleteEmployee = async () => {
    if (!employeeToDelete) return
    
    setIsDeleting(true)
    try {
      await hrApi.deleteEmployee(employeeToDelete.id)
      fetchEmployees()
      setShowDeleteModal(false)
      setEmployeeToDelete(null)
    } catch (error) {
      console.error('Error deleting employee:', error)
      alert('Failed to delete employee. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const cancelDelete = () => {
    setShowDeleteModal(false)
    setEmployeeToDelete(null)
  }

  const handleAddEmployee = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const employeeData = {
      first_name: formData.get('first_name'),
      last_name: formData.get('last_name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      employee_id: formData.get('employee_id'),
      username: formData.get('username'),
      department: formData.get('department'),
      job_grade: formData.get('job_grade'),
      employment_status: formData.get('employment_status'),
      hire_date: formData.get('hire_date'),
      salary: formData.get('salary'),
      password: formData.get('password'),
      role: 'EMPLOYEE'
    }
    
    try {
      await hrApi.createEmployee(employeeData)
      setShowAddModal(false)
      fetchEmployees()
      alert('Employee created successfully')
    } catch (error) {
      console.error('Error creating employee:', error)
      alert(error.response?.data?.message || 'Failed to create employee. Please try again.')
    }
  }

  const handleEditEmployeeSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const employeeData = {
      first_name: formData.get('first_name'),
      last_name: formData.get('last_name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      department: formData.get('department'),
      job_grade: formData.get('position'),
      employment_status: formData.get('status'),
      hire_date: selectedEmployee.joinDate,
      salary: parseFloat(formData.get('salary')) || 0
    }
    
    try {
      await hrApi.updateEmployee(selectedEmployee.id, employeeData)
      setShowEditModal(false)
      fetchEmployees()
      alert('Employee updated successfully')
    } catch (error) {
      console.error('Error updating employee:', error)
      alert(error.response?.data?.message || 'Failed to update employee. Please try again.')
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      'Active': 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-emerald-500/30',
      'On Leave': 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-amber-500/30',
      'Pending': 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-orange-500/30',
      'Inactive': 'bg-gradient-to-r from-gray-500 to-slate-600 text-white shadow-gray-500/30'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusColorDark = (status) => {
    const colors = {
      'Active': 'bg-emerald-900/50 text-emerald-400 border border-emerald-700',
      'On Leave': 'bg-amber-900/50 text-amber-400 border border-amber-700',
      'Pending': 'bg-orange-900/50 text-orange-400 border border-orange-700',
      'Inactive': 'bg-gray-700/50 text-gray-400 border border-gray-600'
    }
    return colors[status] || 'bg-gray-700 text-gray-300'
  }

  const getDepartmentIcon = (dept) => {
    const icons = {
      'IT': 'computer',
      'Finance': 'account_balance',
      'HR': 'groups',
      'Operations': 'settings',
      'Marketing': 'campaign'
    }
    return icons[dept] || 'person'
  }

  const stats = {
    total: employees.length,
    active: employees.filter(e => e.status === 'Active').length,
    onLeave: employees.filter(e => e.status === 'On Leave').length,
    pending: employees.filter(e => e.status === 'Pending').length
  }

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className={`mt-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Loading employees...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative flex min-h-screen w-full flex-col overflow-x-hidden ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Consistent HR Header */}
      <HRHeader 
        currentPage="employees"
        theme={{
          icon: 'groups',
          iconBg: 'from-blue-500 to-blue-700',
          subtitle: 'Human Resources Management',
          activeButton: 'from-blue-500 to-blue-700',
          shadow: 'shadow-blue-500/30'
        }}
      />

      <main className="w-full px-4 sm:px-6 lg:px-8 pt-28 pb-8 max-w-[1600px] mx-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className={`${cardColors.bg80} backdrop-blur-xl rounded-2xl p-5 shadow-lg ${cardColors.border} ${cardColors.hover} transition-all group`}>
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-white text-xl">people</span>
              </div>
              <span className={`${isDark ? 'bg-indigo-900/50 text-indigo-400' : 'bg-indigo-100 text-indigo-700'} text-xs font-bold px-2 py-1 rounded-full`}>+12%</span>
            </div>
            <p className={`${cardColors.textMuted} text-sm mt-4`}>Total Employees</p>
            <p className={`text-3xl font-bold ${cardColors.text}`}>{stats.total}</p>
          </div>

          <div className={`${cardColors.bg80} backdrop-blur-xl rounded-2xl p-5 shadow-lg ${cardColors.border} ${cardColors.hover} transition-all group`}>
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-white text-xl">check_circle</span>
              </div>
              <span className={`${isDark ? 'bg-emerald-900/50 text-emerald-400' : 'bg-emerald-100 text-emerald-700'} text-xs font-bold px-2 py-1 rounded-full`}>Active</span>
            </div>
            <p className={`${cardColors.textMuted} text-sm mt-4`}>Active Employees</p>
            <p className={`text-3xl font-bold ${cardColors.text}`}>{stats.active}</p>
          </div>

          <div className={`${cardColors.bg80} backdrop-blur-xl rounded-2xl p-5 shadow-lg ${cardColors.border} ${cardColors.hover} transition-all group`}>
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-white text-xl">event_busy</span>
              </div>
              <span className={`${isDark ? 'bg-amber-900/50 text-amber-400' : 'bg-amber-100 text-amber-700'} text-xs font-bold px-2 py-1 rounded-full`}>Leave</span>
            </div>
            <p className={`${cardColors.textMuted} text-sm mt-4`}>On Leave</p>
            <p className={`text-3xl font-bold ${cardColors.text}`}>{stats.onLeave}</p>
          </div>

          <div className={`${cardColors.bg80} backdrop-blur-xl rounded-2xl p-5 shadow-lg ${cardColors.border} ${cardColors.hover} transition-all group`}>
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-white text-xl">pending</span>
              </div>
              <span className={`${isDark ? 'bg-purple-900/50 text-purple-400' : 'bg-purple-100 text-purple-700'} text-xs font-bold px-2 py-1 rounded-full`}>New</span>
            </div>
            <p className={`${cardColors.textMuted} text-sm mt-4`}>Pending</p>
            <p className={`text-3xl font-bold ${cardColors.text}`}>{stats.pending}</p>
          </div>
        </div>

        {/* Filters Card */}
        <div className={`${cardColors.bg80} backdrop-blur-xl rounded-2xl shadow-lg ${cardColors.border} mb-6 overflow-hidden`}>
          <div className={`px-6 py-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 ${cardColors.border}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-indigo-600 text-xl">filter_list</span>
                <h3 className={`text-lg font-bold ${cardColors.text}`}>Filter Employees</h3>
              </div>
              <button
                onClick={() => { setSearchTerm(''); setFilterDepartment('all'); setFilterStatus('all'); }}
                className={`${isDark ? 'text-indigo-400 hover:text-indigo-300 hover:bg-indigo-900/30' : 'text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50'} text-sm font-semibold flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all`}
              >
                <span className="material-symbols-outlined text-sm">refresh</span>
                Reset
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative group">
                <label className={`text-xs font-bold ${cardColors.textMuted} uppercase tracking-wider mb-2 block`}>
                  <span className="material-symbols-outlined text-sm align-middle mr-1">search</span>
                  Search
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors">search</span>
                  <input
                    type="text"
                    placeholder="Name, ID, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 text-sm ${cardColors.inputBg} border-2 ${cardColors.inputBorder} rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all ${isDark ? 'text-gray-100' : 'text-gray-800'} ${isDark ? 'placeholder-gray-500' : 'placeholder-gray-400'}`}
                  />
                </div>
              </div>
              
              {/* Department */}
              <div className="relative group">
                <label className={`text-xs font-bold ${cardColors.textMuted} uppercase tracking-wider mb-2 block`}>
                  <span className="material-symbols-outlined text-sm align-middle mr-1">business</span>
                  Department
                </label>
                <div className="relative">
                  <select
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
                    className={`w-full px-4 py-3 text-sm ${cardColors.inputBg} border-2 ${cardColors.inputBorder} rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 appearance-none cursor-pointer transition-all ${isDark ? 'text-gray-100' : 'text-gray-800'}`}
                  >
                    {departments.map(dept => (
                      <option key={dept} value={dept}>
                        {dept === 'all' ? 'All Departments' : dept}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                </div>
              </div>
              
              {/* Status */}
              <div className="relative group">
                <label className={`text-xs font-bold ${cardColors.textMuted} uppercase tracking-wider mb-2 block`}>
                  <span className="material-symbols-outlined text-sm align-middle mr-1">toggle_on</span>
                  Status
                </label>
                <div className="relative">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className={`w-full px-4 py-3 text-sm ${cardColors.inputBg} border-2 ${cardColors.inputBorder} rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 appearance-none cursor-pointer transition-all ${isDark ? 'text-gray-100' : 'text-gray-800'}`}
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>
                        {status === 'all' ? 'All Statuses' : status}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                </div>
              </div>
            </div>
            
            {/* Active Filters */}
            {(searchTerm || filterDepartment !== 'all' || filterStatus !== 'all') && (
              <div className={`mt-4 pt-4 ${cardColors.border}`}>
                <div className="flex flex-wrap gap-2">
                  {searchTerm && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold">
                      <span className="material-symbols-outlined text-sm">search</span>
                      <span>{searchTerm}</span>
                      <button onClick={() => setSearchTerm('')} className="hover:bg-indigo-200 rounded-full p-0.5">
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                  )}
                  {filterDepartment !== 'all' && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                      <span className="material-symbols-outlined text-sm">business</span>
                      <span>{filterDepartment}</span>
                      <button onClick={() => setFilterDepartment('all')} className="hover:bg-purple-200 rounded-full p-0.5">
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                  )}
                  {filterStatus !== 'all' && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold">
                      <span className="material-symbols-outlined text-sm">toggle_on</span>
                      <span>{filterStatus}</span>
                      <button onClick={() => setFilterStatus('all')} className="hover:bg-emerald-200 rounded-full p-0.5">
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Employee Table Card */}
        <div className={`${cardColors.bg80} backdrop-blur-xl rounded-2xl shadow-lg ${cardColors.border} overflow-hidden`}>
          <div className={`px-6 py-4 ${cardColors.border} flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${isDark ? 'bg-gray-800' : 'bg-gradient-to-r from-gray-50 to-white'}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="material-symbols-outlined text-white">person_pin</span>
              </div>
              <div>
                <h2 className={`text-lg font-bold ${cardColors.text}`}>All Employees</h2>
                <p className={`${cardColors.textMuted} text-sm`}>{filteredEmployees.length} of {employees.length} shown</p>
              </div>
            </div>
            <button 
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 transition-all"
            >
              <span className="material-symbols-outlined">person_add</span>
              Add Employee
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className={isDark ? 'bg-gray-700/50' : 'bg-gray-50/50'}>
                <tr>
                  <th className={`px-6 py-4 text-left text-xs font-bold ${cardColors.textMuted} uppercase tracking-wider`}>
                    Employee
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-bold ${cardColors.textMuted} uppercase tracking-wider`}>
                    Contact
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-bold ${cardColors.textMuted} uppercase tracking-wider`}>
                    Position
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-bold ${cardColors.textMuted} uppercase tracking-wider`}>
                    Department
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-bold ${cardColors.textMuted} uppercase tracking-wider`}>
                    Salary
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-bold ${cardColors.textMuted} uppercase tracking-wider`}>
                    Status
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-bold ${cardColors.textMuted} uppercase tracking-wider`}>
                    Join Date
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-bold ${cardColors.textMuted} uppercase tracking-wider`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={cardColors.tableBorder}>
                {filteredEmployees.map((employee, index) => (
                  <tr key={employee.id} className={`${cardColors.tableHover} transition-all group`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                          {employee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                        <div>
                          <div className={`font-bold ${cardColors.text}`}>{employee.name}</div>
                          <div className={`${cardColors.textMuted} text-xs font-mono`}>{employee.employeeId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className={`${cardColors.text} font-medium`}>{employee.email}</div>
                        <div className={`${cardColors.textMuted} text-xs`}>{employee.phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`text-sm ${cardColors.text} font-medium`}>{employee.position}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`material-symbols-outlined ${cardColors.textMuted} text-lg`}>{getDepartmentIcon(employee.department)}</span>
                        <span className={`text-sm ${cardColors.text}`}>{employee.department}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`text-sm font-bold ${cardColors.text}`}>
                        {employee.salary.toLocaleString()} <span className={cardColors.textMuted}>ETB</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1.5 text-xs font-bold rounded-full shadow-md ${isDark ? getStatusColorDark(employee.status) : getStatusColor(employee.status)}`}>
                        {employee.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`text-sm ${cardColors.textMuted}`}>
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">calendar_today</span>
                          {employee.joinDate}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleViewEmployee(employee)}
                          className={`p-2 ${cardColors.textMuted} hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all`}
                          title="View"
                        >
                          <span className="material-symbols-outlined">visibility</span>
                        </button>
                        <button
                          onClick={() => handleEditEmployee(employee)}
                          className={`p-2 ${cardColors.textMuted} hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all`}
                          title="Edit"
                        >
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteEmployee(employee)}
                          className={`p-2 ${cardColors.textMuted} hover:text-red-600 hover:bg-red-50 rounded-lg transition-all`}
                          title="Delete"
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredEmployees.length === 0 && (
            <div className="p-12 text-center">
              <div className={`w-20 h-20 ${isDark ? 'bg-gray-700' : 'bg-gray-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <span className={`material-symbols-outlined ${cardColors.textMuted} text-4xl`}>search_off</span>
              </div>
              <h3 className={`text-lg font-bold ${cardColors.text} mb-2`}>No employees found</h3>
              <p className={cardColors.textMuted}>Try adjusting your filters or search term</p>
            </div>
          )}
        </div>
      </main>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl`}>
            <div className="px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined">person_add</span>
                  Add New Employee
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-1 transition-all"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
            <div className="p-6">
              <form onSubmit={handleAddEmployee} className="space-y-4">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className={`text-sm font-bold ${isDark ? 'text-indigo-400' : 'text-indigo-600'} uppercase tracking-wider`}>Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>First Name *</label>
                      <input
                        type="text"
                        name="first_name"
                        required
                        className={`w-full px-4 py-2.5 rounded-xl border-2 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400'}`}
                        placeholder="Enter first name"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Last Name *</label>
                      <input
                        type="text"
                        name="last_name"
                        required
                        className={`w-full px-4 py-2.5 rounded-xl border-2 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400'}`}
                        placeholder="Enter last name"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Email *</label>
                      <input
                        type="email"
                        name="email"
                        required
                        className={`w-full px-4 py-2.5 rounded-xl border-2 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400'}`}
                        placeholder="employee@company.com"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        className={`w-full px-4 py-2.5 rounded-xl border-2 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400'}`}
                        placeholder="+251911234567"
                      />
                    </div>
                  </div>
                </div>

                {/* Employment Information */}
                <div className={`pt-4 space-y-4 ${isDark ? 'border-t border-gray-700' : 'border-t border-gray-200'}`}>
                  <h3 className={`text-sm font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'} uppercase tracking-wider`}>Employment Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Employee ID *</label>
                      <input
                        type="text"
                        name="employee_id"
                        required
                        className={`w-full px-4 py-2.5 rounded-xl border-2 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400'}`}
                        placeholder="EMP001"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Username *</label>
                      <input
                        type="text"
                        name="username"
                        required
                        className={`w-full px-4 py-2.5 rounded-xl border-2 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400'}`}
                        placeholder="johndoe"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Department *</label>
                      <select
                        name="department"
                        required
                        className={`w-full px-4 py-2.5 rounded-xl border-2 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'}`}
                      >
                        <option value="">Select Department</option>
                        <option value="IT">IT</option>
                        <option value="Finance">Finance</option>
                        <option value="HR">Human Resources</option>
                        <option value="Operations">Operations</option>
                        <option value="Marketing">Marketing</option>
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Job Grade *</label>
                      <select
                        name="job_grade"
                        required
                        className={`w-full px-4 py-2.5 rounded-xl border-2 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'}`}
                      >
                        <option value="">Select Job Grade</option>
                        <option value="JUNIOR">Junior</option>
                        <option value="MID">Mid-Level</option>
                        <option value="SENIOR">Senior</option>
                        <option value="SUPERVISOR">Supervisor</option>
                        <option value="MANAGER">Manager</option>
                        <option value="DIRECTOR">Director</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Employment Status *</label>
                      <select
                        name="employment_status"
                        required
                        className={`w-full px-4 py-2.5 rounded-xl border-2 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'}`}
                      >
                        <option value="">Select Status</option>
                        <option value="ACTIVE">Active</option>
                        <option value="ON_LEAVE">On Leave</option>
                        <option value="INACTIVE">Inactive</option>
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Hire Date *</label>
                      <input
                        type="date"
                        name="hire_date"
                        required
                        className={`w-full px-4 py-2.5 rounded-xl border-2 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'}`}
                      />
                    </div>
                  </div>
                </div>

                {/* Salary Information */}
                <div className={`pt-4 space-y-4 ${isDark ? 'border-t border-gray-700' : 'border-t border-gray-200'}`}>
                  <h3 className={`text-sm font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'} uppercase tracking-wider`}>Salary Information</h3>
                  <div>
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Basic Salary (ETB)</label>
                    <input
                      type="number"
                      name="salary"
                      className={`w-full px-4 py-2.5 rounded-xl border-2 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400'}`}
                      placeholder="15000"
                    />
                  </div>
                </div>

                {/* Account Credentials */}
                <div className={`pt-4 space-y-4 ${isDark ? 'border-t border-gray-700' : 'border-t border-gray-200'}`}>
                  <h3 className={`text-sm font-bold ${isDark ? 'text-amber-400' : 'text-amber-600'} uppercase tracking-wider`}>Account Credentials</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Password *</label>
                      <input
                        type="password"
                        name="password"
                        required
                        className={`w-full px-4 py-2.5 rounded-xl border-2 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400'}`}
                        placeholder="Enter password"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Confirm Password *</label>
                      <input
                        type="password"
                        name="confirm_password"
                        required
                        className={`w-full px-4 py-2.5 rounded-xl border-2 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400'}`}
                        placeholder="Confirm password"
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className={`flex justify-end gap-3 pt-6 ${isDark ? 'border-t border-gray-700' : 'border-t border-gray-200'}`}>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className={`px-6 py-2.5 rounded-xl font-semibold transition-all ${isDark ? 'border border-gray-600 text-gray-300 hover:bg-gray-700' : 'border border-gray-300 text-gray-600 hover:bg-gray-100'}`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined">save</span>
                      Save Employee
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl`}>
            <div className="px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined">edit</span>
                  Edit Employee
                </h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-1 transition-all"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
            <div className="p-6">
              <form onSubmit={handleEditEmployeeSubmit} className="space-y-4">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className={`text-sm font-bold ${isDark ? 'text-amber-400' : 'text-amber-600'} uppercase tracking-wider`}>Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>First Name *</label>
                      <input
                        type="text"
                        name="first_name"
                        defaultValue={selectedEmployee.name.split(' ')[0]}
                        required
                        className={`w-full px-4 py-2.5 rounded-xl border-2 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400'}`}
                        placeholder="Enter first name"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Last Name *</label>
                      <input
                        type="text"
                        name="last_name"
                        defaultValue={selectedEmployee.name.split(' ')[1] || ''}
                        required
                        className={`w-full px-4 py-2.5 rounded-xl border-2 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400'}`}
                        placeholder="Enter last name"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Email *</label>
                      <input
                        type="email"
                        name="email"
                        defaultValue={selectedEmployee.email}
                        required
                        className={`w-full px-4 py-2.5 rounded-xl border-2 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400'}`}
                        placeholder="employee@company.com"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        defaultValue={selectedEmployee.phone}
                        className={`w-full px-4 py-2.5 rounded-xl border-2 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400'}`}
                        placeholder="+251911234567"
                      />
                    </div>
                  </div>
                </div>

                {/* Employment Information */}
                <div className={`pt-4 space-y-4 ${isDark ? 'border-t border-gray-700' : 'border-t border-gray-200'}`}>
                  <h3 className={`text-sm font-bold ${isDark ? 'text-orange-400' : 'text-orange-600'} uppercase tracking-wider`}>Employment Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Employee ID</label>
                      <input
                        type="text"
                        name="employeeId"
                        defaultValue={selectedEmployee.employeeId}
                        disabled
                        className={`w-full px-4 py-2.5 rounded-xl border-2 ${isDark ? 'bg-gray-800 border-gray-700 text-gray-500' : 'bg-gray-100 border-gray-200 text-gray-500'} cursor-not-allowed`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Department *</label>
                      <select
                        name="department"
                        defaultValue={selectedEmployee.department}
                        required
                        className={`w-full px-4 py-2.5 rounded-xl border-2 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'}`}
                      >
                        <option value="IT">IT</option>
                        <option value="Finance">Finance</option>
                        <option value="HR">Human Resources</option>
                        <option value="Operations">Operations</option>
                        <option value="Marketing">Marketing</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Position</label>
                      <input
                        type="text"
                        name="position"
                        defaultValue={selectedEmployee.position}
                        className={`w-full px-4 py-2.5 rounded-xl border-2 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400'}`}
                        placeholder="Job title"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Status *</label>
                      <select
                        name="status"
                        defaultValue={selectedEmployee.status}
                        required
                        className={`w-full px-4 py-2.5 rounded-xl border-2 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'}`}
                      >
                        <option value="Active">Active</option>
                        <option value="On Leave">On Leave</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Pending">Pending</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Salary Information */}
                <div className={`pt-4 space-y-4 ${isDark ? 'border-t border-gray-700' : 'border-t border-gray-200'}`}>
                  <h3 className={`text-sm font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'} uppercase tracking-wider`}>Salary Information</h3>
                  <div>
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Basic Salary (ETB)</label>
                    <input
                      type="number"
                      name="salary"
                      defaultValue={selectedEmployee.salary}
                      className={`w-full px-4 py-2.5 rounded-xl border-2 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400'}`}
                      placeholder="15000"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className={`flex justify-end gap-3 pt-6 ${isDark ? 'border-t border-gray-700' : 'border-t border-gray-200'}`}>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className={`px-6 py-2.5 rounded-xl font-semibold transition-all ${isDark ? 'border border-gray-600 text-gray-300 hover:bg-gray-700' : 'border border-gray-300 text-gray-600 hover:bg-gray-100'}`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-105 transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined">save</span>
                      Update Employee
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && employeeToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl w-full max-w-md shadow-2xl`}>
            <div className="px-6 py-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined">warning</span>
                  Delete Employee
                </h2>
                <button
                  onClick={cancelDelete}
                  className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-1 transition-all"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="text-center mb-6">
                <div className={`w-16 h-16 ${isDark ? 'bg-red-900/50' : 'bg-red-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <span className="material-symbols-outlined text-red-500 text-3xl">person_remove</span>
                </div>
                <h3 className={`text-lg font-bold ${isDark ? 'text-gray-100' : 'text-gray-800'} mb-2`}>
                  Are you sure you want to delete this employee?
                </h3>
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  This action cannot be undone. This will permanently delete the employee record for:
                </p>
                <div className={`mt-4 p-4 ${isDark ? 'bg-gray-700' : 'bg-gray-100'} rounded-xl`}>
                  <p className={`font-bold ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>{employeeToDelete.name}</p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{employeeToDelete.email}</p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{employeeToDelete.employeeId}</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={cancelDelete}
                  disabled={isDeleting}
                  className={`flex-1 px-6 py-2.5 rounded-xl font-semibold transition-all ${
                    isDark 
                      ? 'border border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border border-gray-300 text-gray-600 hover:bg-gray-100'
                  } ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteEmployee}
                  disabled={isDeleting}
                  className={`flex-1 px-6 py-2.5 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:scale-105 transition-all flex items-center justify-center gap-2 ${
                    isDeleting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined">delete</span>
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EmployeeManagement
