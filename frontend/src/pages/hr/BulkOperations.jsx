import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import hrApi from '../../services/hrApi'
import HRHeader from '../../components/common/HRHeader'

const BulkOperations = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
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
      const response = await hrApi.getEmployees()
      const employeesData = response.data || []
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
          await Promise.all(selectedEmployees.map(id => hrApi.updateEmploymentStatus(id, 'ACTIVE')))
          result = { success: true, message: 'Employees activated successfully' }
          break
        case 'deactivate':
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
      'Active': 'bg-gradient-to-r from-green-500 to-emerald-600 text-white',
      'On Leave': 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white',
      'Pending': 'bg-gradient-to-r from-rose-500 to-pink-600 text-white',
      'Inactive': 'bg-gradient-to-r from-slate-500 to-zinc-600 text-white'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getVerificationColor = (verified) => {
    return verified 
      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white' 
      : 'bg-gradient-to-r from-amber-500 to-yellow-600 text-white'
  }

  const operations = [
    {
      id: 'verify',
      name: 'Bulk Verify',
      description: 'Verify multiple employees at once',
      icon: 'verified',
      color: 'from-violet-500 to-purple-600',
      hoverColor: 'hover:border-violet-500 hover:shadow-violet-500/30',
      iconBg: 'bg-violet-100',
      iconColor: 'text-violet-600'
    },
    {
      id: 'activate',
      name: 'Activate Employees',
      description: 'Set employee status to Active',
      icon: 'person_add',
      color: 'from-teal-500 to-cyan-600',
      hoverColor: 'hover:border-teal-500 hover:shadow-teal-500/30',
      iconBg: 'bg-teal-100',
      iconColor: 'text-teal-600'
    },
    {
      id: 'deactivate',
      name: 'Deactivate Employees',
      description: 'Set employee status to Inactive',
      icon: 'person_off',
      color: 'from-orange-500 to-red-600',
      hoverColor: 'hover:border-orange-500 hover:shadow-orange-500/30',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600'
    }
  ]

  const stats = {
    total: employees.length,
    verified: employees.filter(e => e.verified).length,
    active: employees.filter(e => e.status === 'ACTIVE' || e.status === 'Active').length,
    inactive: employees.filter(e => e.status === 'INACTIVE' || e.status === 'Inactive').length
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading bulk operations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-gray-50">
      {/* Consistent HR Header */}
      <HRHeader 
        currentPage="bulk-operations"
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
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-white text-xl">people</span>
              </div>
              <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded-full">Total</span>
            </div>
            <p className="text-gray-500 text-sm mt-4">Total Employees</p>
            <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-white/40 hover:shadow-xl transition-all group">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/30 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-white text-xl">verified</span>
              </div>
              <span className="bg-violet-100 text-violet-700 text-xs font-bold px-2 py-1 rounded-full">Verified</span>
            </div>
            <p className="text-gray-500 text-sm mt-4">Verified</p>
            <p className="text-3xl font-bold text-gray-800">{stats.verified}</p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-white/40 hover:shadow-xl transition-all group">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/30 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-white text-xl">check_circle</span>
              </div>
              <span className="bg-teal-100 text-teal-700 text-xs font-bold px-2 py-1 rounded-full">Active</span>
            </div>
            <p className="text-gray-500 text-sm mt-4">Active</p>
            <p className="text-3xl font-bold text-gray-800">{stats.active}</p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-white/40 hover:shadow-xl transition-all group">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-white text-xl">person_off</span>
              </div>
              <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-full">Inactive</span>
            </div>
            <p className="text-gray-500 text-sm mt-4">Inactive</p>
            <p className="text-3xl font-bold text-gray-800">{stats.inactive}</p>
          </div>
        </div>

        {/* Operation Selection */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/40 mb-6 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-violet-500/10 to-purple-500/10 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-violet-600 text-xl">bolt</span>
                <h3 className="text-lg font-bold text-gray-800">Select Operation</h3>
              </div>
              <button
                onClick={() => setOperation('')}
                className="text-violet-600 hover:text-violet-800 text-sm font-semibold flex items-center gap-1 hover:bg-violet-50 px-3 py-1.5 rounded-lg transition-all"
              >
                <span className="material-symbols-outlined text-sm">refresh</span>
                Clear
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {operations.map((op) => (
                <button
                  key={op.id}
                  onClick={() => setOperation(op.id)}
                  className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                    operation === op.id 
                      ? `border-${op.color.split(' ')[0].replace('from-', '')} bg-gradient-to-br ${op.color} text-white shadow-xl` 
                      : `border-gray-200 hover:border-${op.color.split(' ')[0].replace('from-', '')} hover:shadow-lg bg-white`
                  }`}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 ${
                      operation === op.id ? 'bg-white/20' : op.iconBg
                    }`}>
                      <span className={`material-symbols-outlined text-3xl ${
                        operation === op.id ? 'text-white' : op.iconColor
                      }`}>{op.icon}</span>
                    </div>
                    <div className={`text-base font-bold mb-1 ${
                      operation === op.id ? 'text-white' : 'text-gray-900'
                    }`}>{op.name}</div>
                    <div className={`text-xs ${
                      operation === op.id ? 'text-white/80' : 'text-gray-500'
                    }`}>{op.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Employee Selection */}
        {operation && (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/40 mb-6 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
                  operation === 'verify' ? 'bg-gradient-to-br from-violet-500 to-purple-600' :
                  operation === 'activate' ? 'bg-gradient-to-br from-teal-500 to-cyan-600' :
                  'bg-gradient-to-br from-orange-500 to-red-600'
                }`}>
                  <span className="material-symbols-outlined text-white">
                    {operation === 'verify' ? 'verified' : operation === 'activate' ? 'person_add' : 'person_off'}
                  </span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Select Employees</h2>
                  <p className="text-gray-500 text-sm">{selectedEmployees.length} of {employees.length} selected</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSelectAll}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 font-semibold transition-all"
                >
                  <span className="material-symbols-outlined text-sm">
                    {selectedEmployees.length === employees.length ? 'deselect' : 'select_all'}
                  </span>
                  {selectedEmployees.length === employees.length ? 'Deselect All' : 'Select All'}
                </button>
                <button
                  onClick={() => setShowConfirmModal(true)}
                  disabled={selectedEmployees.length === 0}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                    operation === 'verify' ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-violet-500/30 hover:shadow-violet-500/50' :
                    operation === 'activate' ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-teal-500/30 hover:shadow-teal-500/50' :
                    'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-orange-500/30 hover:shadow-orange-500/50'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">play_arrow</span>
                  Execute {operation.charAt(0).toUpperCase() + operation.slice(1)}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left">
                      <input
                        type="checkbox"
                        checked={selectedEmployees.length === employees.length && employees.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Position
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Verification
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {employees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-violet-50/30 transition-all">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedEmployees.includes(employee.id)}
                          onChange={() => handleSelectEmployee(employee.id)}
                          className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                            {employee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-900">{employee.name}</div>
                            <div className="text-xs text-gray-400 font-mono">{employee.employeeId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-gray-400 text-lg">business</span>
                          <span className="text-sm text-gray-800">{employee.department}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-800">{employee.position}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1.5 text-xs font-bold rounded-full shadow-md ${getStatusColor(employee.status)}`}>
                          {employee.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1.5 text-xs font-bold rounded-full shadow-md ${getVerificationColor(employee.verified)}`}>
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
          <div className={`rounded-2xl p-6 mb-6 shadow-lg border ${
            operationResult.success 
              ? 'bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border-teal-200' 
              : 'bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-200'
          }`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                operationResult.success ? 'bg-gradient-to-br from-teal-500 to-cyan-500' : 'bg-gradient-to-br from-orange-500 to-red-500'
              }`}>
                <span className="material-symbols-outlined text-white text-xl">
                  {operationResult.success ? 'check_circle' : 'error'}
                </span>
              </div>
              <div>
                <h3 className={`text-lg font-bold ${
                  operationResult.success ? 'text-teal-800' : 'text-orange-800'
                }`}>
                  {operationResult.success ? 'Operation Successful' : 'Operation Failed'}
                </h3>
                <p className={`text-sm ${
                  operationResult.success ? 'text-teal-700' : 'text-orange-700'
                }`}>
                  {operationResult.message}
                </p>
              </div>
              <button
                onClick={() => setOperationResult(null)}
                className="ml-auto p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <span className="material-symbols-outlined text-gray-500">close</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className={`px-6 py-4 rounded-t-2xl ${
              operation === 'verify' ? 'bg-gradient-to-r from-violet-500 to-purple-600' :
              operation === 'activate' ? 'bg-gradient-to-r from-teal-500 to-cyan-600' :
              'bg-gradient-to-r from-orange-500 to-red-600'
            }`}>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined">
                    {operation === 'verify' ? 'verified' : operation === 'activate' ? 'person_add' : 'person_off'}
                  </span>
                  Confirm Bulk Operation
                </h2>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-1"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-center mb-6">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  operation === 'verify' ? 'bg-gradient-to-br from-violet-100 to-purple-100' :
                  operation === 'activate' ? 'bg-gradient-to-br from-teal-100 to-cyan-100' :
                  'bg-gradient-to-br from-orange-100 to-red-100'
                }`}>
                  <span className={`material-symbols-outlined text-3xl ${
                    operation === 'verify' ? 'text-violet-600' :
                    operation === 'activate' ? 'text-teal-600' :
                    'text-orange-600'
                  }`}>group</span>
                </div>
              </div>
              <p className="text-gray-600 text-center text-lg mb-2">
                Are you sure you want to <span className="font-bold">{
                  operation === 'verify' ? 'verify' : operation === 'activate' ? 'activate' : 'deactivate'
                }</span> <span className="font-bold text-violet-600">{selectedEmployees.length}</span> employees?
              </p>
              <p className="text-gray-400 text-center text-sm">
                This action cannot be undone.
              </p>
            </div>
            <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkOperation}
                className={`px-4 py-2 rounded-xl font-semibold shadow-lg transition-all ${
                  operation === 'verify' ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:shadow-violet-500/50' :
                  operation === 'activate' ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white hover:shadow-teal-500/50' :
                  'bg-gradient-to-r from-orange-500 to-red-600 text-white hover:shadow-orange-500/50'
                }`}
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
