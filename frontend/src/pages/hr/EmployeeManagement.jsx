import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import hrApi from '../../services/hrApi'

const EmployeeManagement = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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
      const employeesData = await hrApi.getEmployees()
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
      // Fallback to mock data if API fails
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
        // Refresh employee list
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
      'Active': 'bg-green-100 text-green-800',
      'On Leave': 'bg-yellow-100 text-yellow-800',
      'Pending': 'bg-orange-100 text-orange-800',
      'Inactive': 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
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
              className="text-dark/80 text-sm font-semibold hover:text-primary transition-colors"
            >
              Dashboard
            </button>
            <button 
              onClick={() => navigate('/hr/employees')}
              className="text-primary text-sm font-semibold hover:text-primary/80 transition-colors"
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
                  className="text-dark/80 text-sm font-semibold hover:text-primary transition-colors py-2 text-left"
                >
                  Dashboard
                </button>
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false)
                    navigate('/hr/employees')
                  }}
                  className="text-primary text-sm font-semibold hover:text-primary/80 transition-colors py-2 text-left"
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
        {/* Filters */}
        <div className="flex justify-center mb-6">
          <div className="w-full max-w-4xl">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100/50 p-8 backdrop-blur-sm bg-white/95">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-lg">filter_alt</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Filters</h3>
                </div>
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setFilterStatus('all')
                  }}
                  className="group inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200"
                >
                  <span className="material-symbols-outlined text-lg group-hover:rotate-180 transition-transform duration-300">refresh</span>
                  <span>Clear Filters</span>
                </button>
              </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-primary">search</span>
                Search
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-gray-400 text-xs group-focus-within:text-primary transition-colors">search</span>
                </div>
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-7 pr-2.5 py-2 text-sm text-gray-900 placeholder-gray-500 border border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                />
              </div>
            </div>
            
            {/* Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-primary">toggle_on</span>
                Status
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-gray-400 text-xs group-focus-within:text-primary transition-colors">toggle_on</span>
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full pl-7 pr-6 py-2 text-sm text-gray-900 border border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-200 appearance-none bg-white/50 backdrop-blur-sm cursor-pointer"
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>
                      {status === 'all' ? 'All Statuses' : status}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-gray-400 text-xs group-focus-within:text-primary transition-transform duration-200">expand_more</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Active Filters Display */}
          {(searchTerm || filterStatus !== 'all') && (
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Active Filters</span>
                <div className="h-px bg-gray-200 flex-1"></div>
              </div>
              <div className="flex flex-wrap gap-3">
                {searchTerm && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-primary/5 text-primary rounded-full text-sm font-medium border border-primary/20 shadow-sm">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-base">search</span>
                      <span>Search: {searchTerm}</span>
                    </div>
                    <button
                      onClick={() => setSearchTerm('')}
                      className="ml-1 p-1 hover:bg-primary/20 rounded-full transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                )}
                {filterStatus !== 'all' && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-primary/5 text-primary rounded-full text-sm font-medium border border-primary/20 shadow-sm">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-base">toggle_on</span>
                      <span>Status: {filterStatus}</span>
                    </div>
                    <button
                      onClick={() => setFilterStatus('all')}
                      className="ml-1 p-1 hover:bg-primary/20 rounded-full transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        </div>
        </div>

        {/* Employee Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Employees ({filteredEmployees.length})
              </h2>
              <div className="text-sm text-gray-500">
                {filteredEmployees.length} of {employees.length} total
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Salary
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Join Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {employee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                          <div className="text-sm text-gray-500 font-mono">{employee.employeeId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="text-gray-900 font-medium">{employee.email}</div>
                        <div className="text-gray-500">{employee.phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{employee.position}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{employee.department}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900">
                        {employee.salary.toLocaleString()} ETB
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(employee.status)}`}>
                        {employee.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">{employee.joinDate}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewEmployee(employee)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm mr-1">visibility</span>
                          View
                        </button>
                        <button
                          onClick={() => handleEditEmployee(employee)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm mr-1">edit</span>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteEmployee(employee)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm mr-1">delete</span>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Add New Employee</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            {/* Add Employee Form */}
            <div className="text-center text-gray-500">
              Employee addition form would go here...
            </div>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Edit Employee</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            {/* Edit Employee Form */}
            <div className="text-center text-gray-500">
              Edit employee form would go here...
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EmployeeManagement
