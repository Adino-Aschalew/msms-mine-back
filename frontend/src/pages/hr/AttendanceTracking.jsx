import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const AttendanceTracking = () => {
  const navigate = useNavigate()
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [filterDepartment, setFilterDepartment] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showMarkAttendance, setShowMarkAttendance] = useState(false)

  useEffect(() => {
    fetchAttendance()
  }, [selectedDate])

  const fetchAttendance = async () => {
    try {
      // Mock data - replace with actual API call
      const mockAttendance = [
        { id: 1, employeeId: 'EMP001', name: 'John Doe', department: 'IT', checkIn: '09:00', checkOut: '18:00', status: 'Present', overtime: '1h' },
        { id: 2, employeeId: 'EMP002', name: 'Jane Smith', department: 'Finance', checkIn: '08:45', checkOut: '17:30', status: 'Present', overtime: '0h' },
        { id: 3, employeeId: 'EMP003', name: 'Michael Johnson', department: 'HR', checkIn: '09:15', checkOut: '', status: 'Late', overtime: '0h' },
        { id: 4, employeeId: 'EMP004', name: 'Sarah Williams', department: 'Operations', checkIn: '', checkOut: '', status: 'Absent', overtime: '0h' },
        { id: 5, employeeId: 'EMP005', name: 'David Brown', department: 'Marketing', checkIn: '08:30', checkOut: '19:00', status: 'Present', overtime: '2h' },
        { id: 6, employeeId: 'EMP006', name: 'Emily Davis', department: 'IT', checkIn: '09:30', checkOut: '', status: 'Late', overtime: '0h' }
      ]
      setAttendance(mockAttendance)
    } catch (error) {
      console.error('Error fetching attendance:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAttendance = attendance.filter(record => {
    const matchesDepartment = filterDepartment === 'all' || record.department === filterDepartment
    const matchesStatus = filterStatus === 'all' || record.status === filterStatus
    return matchesDepartment && matchesStatus
  })

  const departments = ['all', 'IT', 'Finance', 'HR', 'Operations', 'Marketing']
  const statuses = ['all', 'Present', 'Late', 'Absent', 'On Leave']

  const getStatusColor = (status) => {
    const colors = {
      'Present': 'bg-green-100 text-green-800',
      'Late': 'bg-yellow-100 text-yellow-800',
      'Absent': 'bg-red-100 text-red-800',
      'On Leave': 'bg-blue-100 text-blue-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusIcon = (status) => {
    const icons = {
      'Present': 'check_circle',
      'Late': 'schedule',
      'Absent': 'cancel',
      'On Leave': 'beach_access'
    }
    return icons[status] || 'help'
  }

  const calculateStats = () => {
    const total = attendance.length
    const present = attendance.filter(a => a.status === 'Present').length
    const late = attendance.filter(a => a.status === 'Late').length
    const absent = attendance.filter(a => a.status === 'Absent').length
    const onLeave = attendance.filter(a => a.status === 'On Leave').length
    
    return { total, present, late, absent, onLeave }
  }

  const stats = calculateStats()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading attendance data...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Attendance Tracking</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowMarkAttendance(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
              >
                <span className="material-symbols-outlined mr-2">how_to_reg</span>
                Mark Attendance
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <span className="material-symbols-outlined text-blue-600">people</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Total Employees</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <span className="material-symbols-outlined text-green-600">check_circle</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Present</p>
                <p className="text-2xl font-bold text-gray-900">{stats.present}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <span className="material-symbols-outlined text-yellow-600">schedule</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Late</p>
                <p className="text-2xl font-bold text-gray-900">{stats.late}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-full">
                <span className="material-symbols-outlined text-red-600">cancel</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Absent</p>
                <p className="text-2xl font-bold text-gray-900">{stats.absent}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <span className="material-symbols-outlined text-blue-600">beach_access</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">On Leave</p>
                <p className="text-2xl font-bold text-gray-900">{stats.onLeave}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'all' ? 'All Statuses' : status}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilterDepartment('all')
                  setFilterStatus('all')
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Attendance Records - {selectedDate} ({filteredAttendance.length})
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
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check In
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check Out
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Overtime
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAttendance.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="material-symbols-outlined text-gray-500">person</span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{record.name}</div>
                          <div className="text-sm text-gray-500">{record.employeeId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{record.department}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{record.checkIn || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{record.checkOut || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(record.status)}`}>
                        <span className="material-symbols-outlined text-xs mr-1">{getStatusIcon(record.status)}</span>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{record.overtime}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                      <button className="text-gray-600 hover:text-gray-900">Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Mark Attendance Modal */}
      {showMarkAttendance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Mark Attendance</h2>
              <button
                onClick={() => setShowMarkAttendance(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="text-center text-gray-500">
              Mark attendance form would go here...
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AttendanceTracking
