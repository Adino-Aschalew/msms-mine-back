import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import hrApi from '../../services/hrApi'
import HRHeader from '../../components/common/HRHeader'

const EmployeeVerification = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
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

  const getVerificationColor = (verified) => {
    return verified 
      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-emerald-500/30' 
      : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-amber-500/30'
  }

  const stats = {
    total: employees.length,
    verified: employees.filter(emp => emp.verified).length,
    pending: employees.filter(emp => !emp.verified).length,
    rate: employees.length > 0 
      ? Math.round((employees.filter(emp => emp.verified).length / employees.length) * 100)
      : 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading verification data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-gray-50">
      {/* Consistent HR Header */}
      <HRHeader 
        currentPage="verification"
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
              <div className="w-12 h-12 bg-gradient-to-br from-slate-500 to-gray-600 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-500/30 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-white text-xl">people</span>
              </div>
              <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2 py-1 rounded-full">Total</span>
            </div>
            <p className="text-gray-500 text-sm mt-4">Total Employees</p>
            <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-white/40 hover:shadow-xl transition-all group">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-white text-xl">check_circle</span>
              </div>
              <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-full">Verified</span>
            </div>
            <p className="text-gray-500 text-sm mt-4">Verified</p>
            <p className="text-3xl font-bold text-gray-800">{stats.verified}</p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-white/40 hover:shadow-xl transition-all group">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-white text-xl">pending</span>
              </div>
              <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded-full">Pending</span>
            </div>
            <p className="text-gray-500 text-sm mt-4">Pending Verification</p>
            <p className="text-3xl font-bold text-gray-800">{stats.pending}</p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-white/40 hover:shadow-xl transition-all group">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/30 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-white text-xl">percent</span>
              </div>
              <span className="bg-cyan-100 text-cyan-700 text-xs font-bold px-2 py-1 rounded-full">Rate</span>
            </div>
            <p className="text-gray-500 text-sm mt-4">Verification Rate</p>
            <p className="text-3xl font-bold text-gray-800">{stats.rate}%</p>
            <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" style={{ width: `${stats.rate}%` }}></div>
            </div>
          </div>
        </div>

        {/* Filters Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/40 mb-6 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-emerald-600 text-xl">filter_list</span>
                <h3 className="text-lg font-bold text-gray-800">Filter Employees</h3>
              </div>
              <button
                onClick={() => {
                  setSearchTerm('')
                  setFilterStatus('all')
                  setFilterDepartment('all')
                }}
                className="text-emerald-600 hover:text-emerald-800 text-sm font-semibold flex items-center gap-1 hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-all"
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
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors">search</span>
                  <input
                    type="text"
                    placeholder="Name, ID, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-sm bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all"
                  />
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
                    className="w-full px-4 py-3 text-sm bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 appearance-none cursor-pointer transition-all"
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>
                        {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
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
                    className="w-full px-4 py-3 text-sm bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 appearance-none cursor-pointer transition-all"
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
            </div>
            
            {/* Selection Actions */}
            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-2">
              <button
                onClick={handleSelectAll}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold transition-all"
              >
                {selectedEmployees.length === filteredEmployees.length ? 'Deselect All' : 'Select All'}
              </button>
              <button
                onClick={() => setSelectedEmployees([])}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold transition-all"
              >
                Clear Selection
              </button>
              <span className="ml-auto text-sm font-semibold text-gray-600 flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600">check_box</span>
                {selectedEmployees.length} selected
              </span>
            </div>
            
            {/* Active Filters */}
            {(searchTerm || filterStatus !== 'all' || filterDepartment !== 'all') && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex flex-wrap gap-2">
                  {searchTerm && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold">
                      <span className="material-symbols-outlined text-sm">search</span>
                      <span>{searchTerm}</span>
                      <button onClick={() => setSearchTerm('')} className="hover:bg-emerald-200 rounded-full p-0.5">
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                  )}
                  {filterStatus !== 'all' && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-100 text-teal-700 rounded-full text-sm font-semibold">
                      <span className="material-symbols-outlined text-sm">toggle_on</span>
                      <span>{filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}</span>
                      <button onClick={() => setFilterStatus('all')} className="hover:bg-teal-200 rounded-full p-0.5">
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                  )}
                  {filterDepartment !== 'all' && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-cyan-100 text-cyan-700 rounded-full text-sm font-semibold">
                      <span className="material-symbols-outlined text-sm">business</span>
                      <span>{filterDepartment}</span>
                      <button onClick={() => setFilterDepartment('all')} className="hover:bg-cyan-200 rounded-full p-0.5">
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Verification Table Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/40 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="material-symbols-outlined text-white">fact_check</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">Employee Verification</h2>
                <p className="text-gray-500 text-sm">{filteredEmployees.length} employees</p>
              </div>
            </div>
            <button
              onClick={() => setShowBulkVerify(true)}
              disabled={selectedEmployees.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
            >
              <span className="material-symbols-outlined">verified</span>
              Bulk Verify ({selectedEmployees.length})
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedEmployees.length === filteredEmployees.length && filteredEmployees.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                  </th>
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
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Verification
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
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-emerald-50/30 transition-all group">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedEmployees.includes(employee.id)}
                        onChange={() => handleSelectEmployee(employee.id)}
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
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
                        <span className="material-symbols-outlined text-gray-400 text-lg">business</span>
                        <span className="text-sm text-gray-800">{employee.department}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-3 py-1.5 text-xs font-bold rounded-full bg-gray-100 text-gray-700">
                        {employee.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1.5 text-xs font-bold rounded-full shadow-md ${getVerificationColor(employee.verified)}`}>
                        {employee.verified ? 'Verified' : 'Pending'}
                      </span>
                      {employee.verified && employee.verificationDate && (
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(employee.verificationDate).toLocaleDateString()}
                        </div>
                      )}
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
                          onClick={() => navigate(`/hr/employees/${employee.id}`)}
                          className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                          title="View"
                        >
                          <span className="material-symbols-outlined">visibility</span>
                        </button>
                        {!employee.verified && (
                          <button
                            onClick={() => handleVerifyEmployee(employee.id)}
                            className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                            title="Verify"
                          >
                            <span className="material-symbols-outlined">verified</span>
                          </button>
                        )}
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
                <span className="material-symbols-outlined text-gray-400 text-4xl">fact_check</span>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">No employees found</h3>
              <p className="text-gray-500">Try adjusting your filters or search term</p>
            </div>
          )}
        </div>
      </main>

      {/* Bulk Verify Modal */}
      {showBulkVerify && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined">verified</span>
                  Bulk Verify Employees
                </h2>
                <button
                  onClick={() => setShowBulkVerify(false)}
                  className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-1"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-emerald-600 text-3xl">group</span>
                </div>
              </div>
              <p className="text-gray-600 text-center text-lg mb-2">
                Are you sure you want to verify <span className="font-bold text-emerald-600">{selectedEmployees.length}</span> employees?
              </p>
              <p className="text-gray-400 text-center text-sm">
                This action cannot be undone.
              </p>
            </div>
            <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
              <button
                onClick={() => setShowBulkVerify(false)}
                className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkVerify}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all"
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
