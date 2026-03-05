import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import hrApi from '../../services/hrApi'

const EmployeeVerification = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('pending')
  const [filterDepartment, setFilterDepartment] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEmployees, setSelectedEmployees] = useState([])
  const [showBulkVerify, setShowBulkVerify] = useState(false)

  useEffect(() => {
    fetchEmployees()
  }, [filterStatus])

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
        status: emp.employment_status,
        joinDate: emp.hire_date,
        phone: emp.phone,
        verified: emp.hr_verified || false,
        verificationDate: emp.hr_verification_date
      }))
      setEmployees(formattedEmployees)
    } catch (error) {
      console.error('Error fetching employees:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = searchTerm === '' || 
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'pending' && !employee.verified) ||
      (filterStatus === 'verified' && employee.verified)
    const matchesDepartment = filterDepartment === 'all' || employee.department === filterDepartment
    return matchesSearch && matchesStatus && matchesDepartment
  })

  const departments = ['all', 'IT', 'Finance', 'HR', 'Operations', 'Marketing']
  const statuses = ['all', 'pending', 'verified']

  const handleVerifyEmployee = async (employeeId) => {
    try {
      await hrApi.verifyEmployee(employeeId)
      fetchEmployees()
      console.log('Employee verified successfully')
    } catch (error) {
      console.error('Error verifying employee:', error)
      alert('Failed to verify employee. Please try again.')
    }
  }

  const handleBulkVerify = async () => {
    if (selectedEmployees.length === 0) {
      alert('Please select employees to verify')
      return
    }

    try {
      await hrApi.bulkVerifyEmployees(selectedEmployees)
      setSelectedEmployees([])
      fetchEmployees()
      setShowBulkVerify(false)
      console.log('Bulk verification successful')
    } catch (error) {
      console.error('Error bulk verifying employees:', error)
      alert('Failed to bulk verify employees. Please try again.')
    }
  }

  const handleSelectEmployee = (employeeId) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId) 
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    )
  }

  const handleSelectAll = () => {
    if (selectedEmployees.length === filteredEmployees.length) {
      setSelectedEmployees([])
    } else {
      setSelectedEmployees(filteredEmployees.map(emp => emp.id))
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

  const getVerificationColor = (verified) => {
    return verified 
      ? 'bg-green-100 text-green-800' 
      : 'bg-orange-100 text-orange-800'
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
              className="text-dark/80 text-sm font-semibold hover:text-primary transition-colors"
            >
              Employees
            </button>
            <button 
              onClick={() => navigate('/hr/verification')}
              className="text-primary text-sm font-semibold hover:text-primary/80 transition-colors"
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
            <button
              onClick={() => setShowBulkVerify(true)}
              disabled={selectedEmployees.length === 0}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <span className="material-symbols-outlined mr-2">verified</span>
              Verify Selected ({selectedEmployees.length})
            </button>
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
                  className="text-dark/80 text-sm font-semibold hover:text-primary transition-colors py-2 text-left"
                >
                  Employees
                </button>
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false)
                    navigate('/hr/verification')
                  }}
                  className="text-primary text-sm font-semibold hover:text-primary/80 transition-colors py-2 text-left"
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <span className="material-symbols-outlined text-blue-600">people</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Total Employees</p>
                <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <span className="material-symbols-outlined text-green-600">verified</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Verified</p>
                <p className="text-2xl font-bold text-gray-900">
                  {employees.filter(emp => emp.verified).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-full">
                <span className="material-symbols-outlined text-orange-600">pending</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Pending Verification</p>
                <p className="text-2xl font-bold text-gray-900">
                  {employees.filter(emp => !emp.verified).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <span className="material-symbols-outlined text-purple-600">percent</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Verification Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {employees.length > 0 
                    ? Math.round((employees.filter(emp => emp.verified).length / employees.length) * 100)
                    : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            <button
              onClick={() => {
                setSearchTerm('')
                setFilterStatus('all')
                setFilterDepartment('all')
              }}
              className="text-sm text-gray-500 hover:text-gray-700 font-medium flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">refresh</span>
              Clear Filters
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Search */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search by name, ID, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>
            
            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">
                  toggle_on
                </span>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full pl-10 pr-8 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none bg-white"
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>
                      {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>
            
            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">
                  business
                </span>
                <select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  className="w-full pl-10 pr-8 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none bg-white"
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept}>
                      {dept === 'all' ? 'All Departments' : dept}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-4 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleSelectAll}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700 transition-colors"
            >
              {selectedEmployees.length === filteredEmployees.length ? 'Deselect All' : 'Select All'}
            </button>
            <button
              onClick={() => setSelectedEmployees([])}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700 transition-colors"
            >
              Clear Selection
            </button>
          </div>
          
          {/* Active Filters Display */}
          {(searchTerm || filterStatus !== 'all' || filterDepartment !== 'all') && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                {searchTerm && (
                  <div className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                    <span>Search: {searchTerm}</span>
                    <button
                      onClick={() => setSearchTerm('')}
                      className="ml-1 hover:text-primary/80"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                )}
                {filterStatus !== 'all' && (
                  <div className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                    <span>Status: {filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}</span>
                    <button
                      onClick={() => setFilterStatus('all')}
                      className="ml-1 hover:text-primary/80"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                )}
                {filterDepartment !== 'all' && (
                  <div className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                    <span>Department: {filterDepartment}</span>
                    <button
                      onClick={() => setFilterDepartment('all')}
                      className="ml-1 hover:text-primary/80"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Employee Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Employee Verification ({filteredEmployees.length})
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
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedEmployees.length === filteredEmployees.length && filteredEmployees.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
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
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Verification
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
                      <input
                        type="checkbox"
                        checked={selectedEmployees.includes(employee.id)}
                        onChange={() => handleSelectEmployee(employee.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
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
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(employee.status)}`}>
                        {employee.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getVerificationColor(employee.verified)}`}>
                          {employee.verified ? 'Verified' : 'Pending'}
                        </span>
                        {employee.verified && employee.verificationDate && (
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(employee.verificationDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">{employee.joinDate}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/hr/employees/${employee.id}`)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm mr-1">visibility</span>
                          View
                        </button>
                        {!employee.verified && (
                          <button
                            onClick={() => handleVerifyEmployee(employee.id)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
                          >
                            <span className="material-symbols-outlined text-sm mr-1">verified</span>
                            Verify
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Bulk Verify Modal */}
      {showBulkVerify && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Bulk Verify Employees</h2>
              <button
                onClick={() => setShowBulkVerify(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="mb-4">
              <p className="text-gray-600">
                Are you sure you want to verify {selectedEmployees.length} employees?
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowBulkVerify(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkVerify}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Verify Employees
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EmployeeVerification
