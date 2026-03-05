import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import hrApi from '../../services/hrApi'

const BulkOperations = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedEmployees, setSelectedEmployees] = useState([])
  const [operation, setOperation] = useState('')
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [operationResult, setOperationResult] = useState(null)

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
        status: emp.employment_status,
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

  const handleSelectEmployee = (employeeId) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId) 
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    )
  }

  const handleSelectAll = () => {
    if (selectedEmployees.length === employees.length) {
      setSelectedEmployees([])
    } else {
      setSelectedEmployees(employees.map(emp => emp.id))
    }
  }

  const handleBulkOperation = async () => {
    if (selectedEmployees.length === 0) {
      alert('Please select employees to perform operation')
      return
    }

    try {
      let result
      switch (operation) {
        case 'verify':
          result = await hrApi.bulkVerifyEmployees(selectedEmployees)
          break
        case 'activate':
          // Update status to ACTIVE for all selected employees
          await Promise.all(selectedEmployees.map(id => hrApi.updateEmploymentStatus(id, 'ACTIVE')))
          result = { success: true, message: 'Employees activated successfully' }
          break
        case 'deactivate':
          // Update status to INACTIVE for all selected employees
          await Promise.all(selectedEmployees.map(id => hrApi.updateEmploymentStatus(id, 'INACTIVE')))
          result = { success: true, message: 'Employees deactivated successfully' }
          break
        default:
          throw new Error('Invalid operation')
      }

      setOperationResult(result)
      setSelectedEmployees([])
      fetchEmployees()
      setShowConfirmModal(false)
      setOperation('')
    } catch (error) {
      console.error('Error performing bulk operation:', error)
      setOperationResult({ success: false, message: 'Operation failed. Please try again.' })
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
              className="text-dark/80 text-sm font-semibold hover:text-primary transition-colors"
            >
              Verification
            </button>
            <button 
              onClick={() => navigate('/hr/bulk-operations')}
              className="text-primary text-sm font-semibold hover:text-primary/80 transition-colors"
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
                  className="text-primary text-sm font-semibold hover:text-primary/80 transition-colors py-2 text-left"
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
        {/* Operation Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Select Operation</h3>
            <button
              onClick={() => setOperation('')}
              className="text-sm text-gray-500 hover:text-gray-700 font-medium flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">refresh</span>
              Clear Selection
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setOperation('verify')}
              className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                operation === 'verify' 
                  ? 'border-green-500 bg-green-50 shadow-md' 
                  : 'border-gray-200 hover:border-green-300 hover:shadow-sm'
              }`}
            >
              <div className="flex flex-col items-center text-center">
                <span className={`material-symbols-outlined text-3xl mb-3 ${
                  operation === 'verify' ? 'text-green-600' : 'text-gray-400'
                }`}>verified</span>
                <div className={`text-sm font-semibold mb-1 ${
                  operation === 'verify' ? 'text-green-900' : 'text-gray-900'
                }`}>Bulk Verify</div>
                <div className="text-xs text-gray-500">Verify multiple employees at once</div>
              </div>
            </button>

            <button
              onClick={() => setOperation('activate')}
              className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                operation === 'activate' 
                  ? 'border-blue-500 bg-blue-50 shadow-md' 
                  : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
              }`}
            >
              <div className="flex flex-col items-center text-center">
                <span className={`material-symbols-outlined text-3xl mb-3 ${
                  operation === 'activate' ? 'text-blue-600' : 'text-gray-400'
                }`}>person_add</span>
                <div className={`text-sm font-semibold mb-1 ${
                  operation === 'activate' ? 'text-blue-900' : 'text-gray-900'
                }`}>Activate Employees</div>
                <div className="text-xs text-gray-500">Set employee status to Active</div>
              </div>
            </button>

            <button
              onClick={() => setOperation('deactivate')}
              className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                operation === 'deactivate' 
                  ? 'border-red-500 bg-red-50 shadow-md' 
                  : 'border-gray-200 hover:border-red-300 hover:shadow-sm'
              }`}
            >
              <div className="flex flex-col items-center text-center">
                <span className={`material-symbols-outlined text-3xl mb-3 ${
                  operation === 'deactivate' ? 'text-red-600' : 'text-gray-400'
                }`}>person_off</span>
                <div className={`text-sm font-semibold mb-1 ${
                  operation === 'deactivate' ? 'text-red-900' : 'text-gray-900'
                }`}>Deactivate Employees</div>
                <div className="text-xs text-gray-500">Set employee status to Inactive</div>
              </div>
            </button>
          </div>
        </div>

        {/* Employee Selection */}
        {operation && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Select Employees ({selectedEmployees.length} selected)
              </h2>
              <div className="flex gap-3">
                <button
                  onClick={handleSelectAll}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm mr-2">
                    {selectedEmployees.length === employees.length ? 'deselect' : 'select_all'}
                  </span>
                  {selectedEmployees.length === employees.length ? 'Deselect All' : 'Select All'}
                </button>
                <button
                  onClick={() => setShowConfirmModal(true)}
                  disabled={selectedEmployees.length === 0}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="material-symbols-outlined text-sm mr-2">play_arrow</span>
                  Execute {operation.charAt(0).toUpperCase() + operation.slice(1)}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedEmployees.length === employees.length && employees.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Verification
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {employees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedEmployees.includes(employee.id)}
                          onChange={() => handleSelectEmployee(employee.id)}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                          <div className="text-sm text-gray-500">{employee.employeeId}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{employee.department}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(employee.status)}`}>
                          {employee.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getVerificationColor(employee.verified)}`}>
                          {employee.verified ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Operation Result */}
        {operationResult && (
          <div className={`rounded-lg p-6 mb-6 ${
            operationResult.success 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center">
              <span className={`material-symbols-outlined text-xl mr-3 ${
                operationResult.success ? 'text-green-600' : 'text-red-600'
              }`}>
                {operationResult.success ? 'check_circle' : 'error'}
              </span>
              <div>
                <h3 className={`text-lg font-medium ${
                  operationResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {operationResult.success ? 'Operation Successful' : 'Operation Failed'}
                </h3>
                <p className={`text-sm ${
                  operationResult.success ? 'text-green-700' : 'text-red-700'
                }`}>
                  {operationResult.message}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Confirm Bulk Operation</h2>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="mb-4">
              <p className="text-gray-600">
                Are you sure you want to {operation} {selectedEmployees.length} employees?
              </p>
              <p className="text-sm text-gray-500 mt-2">
                This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkOperation}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {operation.charAt(0).toUpperCase() + operation.slice(1)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BulkOperations
