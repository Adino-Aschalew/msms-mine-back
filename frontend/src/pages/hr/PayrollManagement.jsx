import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const PayrollManagement = () => {
  const navigate = useNavigate()
  const [payrollRecords, setPayrollRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [filterDepartment, setFilterDepartment] = useState('all')
  const [showGeneratePayroll, setShowGeneratePayroll] = useState(false)

  useEffect(() => {
    fetchPayrollRecords()
  }, [selectedMonth])

  const fetchPayrollRecords = async () => {
    try {
      // Mock data - replace with actual API call
      const mockPayrollRecords = [
        {
          id: 1,
          employeeId: 'EMP001',
          employeeName: 'John Doe',
          department: 'IT',
          position: 'Senior Developer',
          baseSalary: 8000,
          overtime: 500,
          bonus: 1000,
          deductions: 1200,
          netSalary: 7300,
          status: 'Processed',
          payDate: '2024-01-31'
        },
        {
          id: 2,
          employeeId: 'EMP002',
          employeeName: 'Jane Smith',
          department: 'Finance',
          position: 'Accountant',
          baseSalary: 6500,
          overtime: 200,
          bonus: 500,
          deductions: 980,
          netSalary: 6220,
          status: 'Processed',
          payDate: '2024-01-31'
        },
        {
          id: 3,
          employeeId: 'EMP003',
          employeeName: 'Michael Johnson',
          department: 'HR',
          position: 'HR Manager',
          baseSalary: 7500,
          overtime: 0,
          bonus: 800,
          deductions: 1150,
          netSalary: 7150,
          status: 'Pending',
          payDate: '2024-01-31'
        },
        {
          id: 4,
          employeeId: 'EMP004',
          employeeName: 'Sarah Williams',
          department: 'Operations',
          position: 'Operations Manager',
          baseSalary: 7000,
          overtime: 300,
          bonus: 600,
          deductions: 1050,
          netSalary: 6850,
          status: 'Processed',
          payDate: '2024-01-31'
        },
        {
          id: 5,
          employeeId: 'EMP005',
          employeeName: 'David Brown',
          department: 'Marketing',
          position: 'Marketing Specialist',
          baseSalary: 5500,
          overtime: 150,
          bonus: 400,
          deductions: 825,
          netSalary: 5225,
          status: 'Processed',
          payDate: '2024-01-31'
        }
      ]
      setPayrollRecords(mockPayrollRecords)
    } catch (error) {
      console.error('Error fetching payroll records:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredRecords = payrollRecords.filter(record => {
    const matchesDepartment = filterDepartment === 'all' || record.department === filterDepartment
    return matchesDepartment
  })

  const departments = ['all', 'IT', 'Finance', 'HR', 'Operations', 'Marketing']

  const getStatusColor = (status) => {
    const colors = {
      'Processed': 'bg-green-100 text-green-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Failed': 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const calculateStats = () => {
    const totalPayroll = payrollRecords.reduce((sum, record) => sum + record.netSalary, 0)
    const processed = payrollRecords.filter(r => r.status === 'Processed').length
    const pending = payrollRecords.filter(r => r.status === 'Pending').length
    const averageSalary = payrollRecords.length > 0 ? totalPayroll / payrollRecords.length : 0
    
    return { totalPayroll, processed, pending, averageSalary }
  }

  const stats = calculateStats()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payroll data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button 
                onClick={() => navigate('/hr')}
                className="mr-4 text-gray-500 hover:text-gray-700"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Payroll Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowGeneratePayroll(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
              >
                <span className="material-symbols-outlined mr-2">calculate</span>
                Generate Payroll
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <span className="material-symbols-outlined text-blue-600">payments</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Total Payroll</p>
                <p className="text-2xl font-bold text-gray-900">${stats.totalPayroll.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <span className="material-symbols-outlined text-green-600">check_circle</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Processed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.processed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <span className="material-symbols-outlined text-yellow-600">pending</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <span className="material-symbols-outlined text-purple-600">trending_up</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Average Salary</p>
                <p className="text-2xl font-bold text-gray-900">${Math.round(stats.averageSalary).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>
                    {dept === 'all' ? 'All Departments' : dept}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilterDepartment('all')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Payroll Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Payroll Records - {new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} ({filteredRecords.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Base Salary
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Overtime
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bonus
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deductions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Net Salary
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{record.employeeName}</div>
                        <div className="text-sm text-gray-500">{record.employeeId} • {record.department}</div>
                        <div className="text-sm text-gray-500">{record.position}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${record.baseSalary.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${record.overtime.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${record.bonus.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-red-600">-${record.deductions.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">${record.netSalary.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(record.status)}`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">View</button>
                      <button className="text-gray-600 hover:text-gray-900 mr-3">Edit</button>
                      <button className="text-green-600 hover:text-green-900">Payslip</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Generate Payroll Modal */}
      {showGeneratePayroll && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Generate Payroll</h2>
              <button
                onClick={() => setShowGeneratePayroll(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="text-center text-gray-500">
              Payroll generation form would go here...
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PayrollManagement
