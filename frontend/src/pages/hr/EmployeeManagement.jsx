import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import hrApi from '../../services/hrApi'
import HRHeader from '../../components/common/HRHeader'

const EmployeeManagement = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDepartment, setFilterDepartment] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)

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

  const handleDeleteEmployee = async (employee) => {
    if (window.confirm(`Are you sure you want to delete ${employee.name}?`)) {
      try {
        await hrApi.updateEmploymentStatus(employee.id, 'INACTIVE')
        fetchEmployees()
        console.log('Employee deleted successfully')
      } catch (error) {
        console.error('Error deleting employee:', error)
        alert('Failed to delete employee. Please try again.')
      }
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading employees...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-gray-50">
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
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-white/40 hover:shadow-xl transition-all group">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-white text-xl">people</span>
              </div>
              <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded-full">+12%</span>
            </div>
            <p className="text-gray-500 text-sm mt-4">Total Employees</p>
            <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-white/40 hover:shadow-xl transition-all group">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-white text-xl">check_circle</span>
              </div>
              <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-full">Active</span>
            </div>
            <p className="text-gray-500 text-sm mt-4">Active Employees</p>
            <p className="text-3xl font-bold text-gray-800">{stats.active}</p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-white/40 hover:shadow-xl transition-all group">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-white text-xl">event_busy</span>
              </div>
              <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded-full">Leave</span>
            </div>
            <p className="text-gray-500 text-sm mt-4">On Leave</p>
            <p className="text-3xl font-bold text-gray-800">{stats.onLeave}</p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-white/40 hover:shadow-xl transition-all group">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-white text-xl">pending</span>
              </div>
              <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded-full">New</span>
            </div>
            <p className="text-gray-500 text-sm mt-4">Pending</p>
            <p className="text-3xl font-bold text-gray-800">{stats.pending}</p>
          </div>
        </div>

        {/* Filters Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/40 mb-6 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-indigo-600 text-xl">filter_list</span>
                <h3 className="text-lg font-bold text-gray-800">Filter Employees</h3>
              </div>
              <button
                onClick={() => { setSearchTerm(''); setFilterDepartment('all'); setFilterStatus('all'); }}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold flex items-center gap-1 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-all"
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
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
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
                    className="w-full pl-10 pr-4 py-3 text-sm bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all"
                  />
                </div>
              </div>
              
              {/* Department */}
              <div className="relative group">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                  <span className="material-symbols-outlined text-sm align-middle mr-1">business</span>
                  Department
                </label>
                <div className="relative">
                  <select
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
                    className="w-full px-4 py-3 text-sm bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 appearance-none cursor-pointer transition-all"
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
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                  <span className="material-symbols-outlined text-sm align-middle mr-1">toggle_on</span>
                  Status
                </label>
                <div className="relative">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-4 py-3 text-sm bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 appearance-none cursor-pointer transition-all"
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
              <div className="mt-4 pt-4 border-t border-gray-100">
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
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/40 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="material-symbols-outlined text-white">person_pin</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">All Employees</h2>
                <p className="text-gray-500 text-sm">{filteredEmployees.length} of {employees.length} shown</p>
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
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Salary
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Join Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredEmployees.map((employee, index) => (
                  <tr key={employee.id} className="hover:bg-indigo-50/30 transition-all group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                          {employee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-gray-800">{employee.name}</div>
                          <div className="text-gray-400 text-xs font-mono">{employee.employeeId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="text-gray-800 font-medium">{employee.email}</div>
                        <div className="text-gray-400 text-xs">{employee.phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-800 font-medium">{employee.position}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-gray-400 text-lg">{getDepartmentIcon(employee.department)}</span>
                        <span className="text-sm text-gray-800">{employee.department}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-800">
                        {employee.salary.toLocaleString()} <span className="text-gray-400 font-normal">ETB</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1.5 text-xs font-bold rounded-full shadow-md ${getStatusColor(employee.status)}`}>
                        {employee.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">
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
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          title="View"
                        >
                          <span className="material-symbols-outlined">visibility</span>
                        </button>
                        <button
                          onClick={() => handleEditEmployee(employee)}
                          className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                          title="Edit"
                        >
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteEmployee(employee)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
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
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-gray-400 text-4xl">search_off</span>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">No employees found</h3>
              <p className="text-gray-500">Try adjusting your filters or search term</p>
            </div>
          )}
        </div>
      </main>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined">person_add</span>
                  Add New Employee
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-1"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="text-center text-gray-500 py-8">
                Employee addition form would go here...
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined">edit</span>
                  Edit Employee
                </h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-1"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="text-center text-gray-500 py-8">
                Edit employee form would go here...
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EmployeeManagement
