import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const LeaveManagement = () => {
  const navigate = useNavigate()
  const [leaveRequests, setLeaveRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [showNewRequest, setShowNewRequest] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)

  useEffect(() => {
    fetchLeaveRequests()
  }, [])

  const fetchLeaveRequests = async () => {
    try {
      // Mock data - replace with actual API call
      const mockLeaveRequests = [
        {
          id: 1,
          employeeId: 'EMP001',
          employeeName: 'John Doe',
          department: 'IT',
          leaveType: 'Annual',
          startDate: '2024-01-20',
          endDate: '2024-01-24',
          days: 5,
          reason: 'Family vacation',
          status: 'Pending',
          appliedDate: '2024-01-10',
          approver: null
        },
        {
          id: 2,
          employeeId: 'EMP002',
          employeeName: 'Jane Smith',
          department: 'Finance',
          leaveType: 'Sick',
          startDate: '2024-01-15',
          endDate: '2024-01-16',
          days: 2,
          reason: 'Medical appointment',
          status: 'Approved',
          appliedDate: '2024-01-14',
          approver: 'Michael Johnson'
        },
        {
          id: 3,
          employeeId: 'EMP003',
          employeeName: 'Michael Johnson',
          department: 'HR',
          leaveType: 'Personal',
          startDate: '2024-01-25',
          endDate: '2024-01-25',
          days: 1,
          reason: 'Personal work',
          status: 'Rejected',
          appliedDate: '2024-01-18',
          approver: 'Sarah Williams'
        },
        {
          id: 4,
          employeeId: 'EMP004',
          employeeName: 'Sarah Williams',
          department: 'Operations',
          leaveType: 'Maternity',
          startDate: '2024-02-01',
          endDate: '2024-05-01',
          days: 90,
          reason: 'Maternity leave',
          status: 'Approved',
          appliedDate: '2024-01-05',
          approver: 'David Brown'
        },
        {
          id: 5,
          employeeId: 'EMP005',
          employeeName: 'David Brown',
          department: 'Marketing',
          leaveType: 'Annual',
          startDate: '2024-01-18',
          endDate: '2024-01-19',
          days: 2,
          reason: 'Short break',
          status: 'Pending',
          appliedDate: '2024-01-12',
          approver: null
        }
      ]
      setLeaveRequests(mockLeaveRequests)
    } catch (error) {
      console.error('Error fetching leave requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredRequests = leaveRequests.filter(request => {
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus
    const matchesType = filterType === 'all' || request.leaveType === filterType
    return matchesStatus && matchesType
  })

  const statuses = ['all', 'Pending', 'Approved', 'Rejected']
  const leaveTypes = ['all', 'Annual', 'Sick', 'Personal', 'Maternity', 'Paternity', 'Emergency']

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Approved': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getLeaveTypeColor = (type) => {
    const colors = {
      'Annual': 'bg-blue-100 text-blue-800',
      'Sick': 'bg-red-100 text-red-800',
      'Personal': 'bg-gray-100 text-gray-800',
      'Maternity': 'bg-pink-100 text-pink-800',
      'Paternity': 'bg-purple-100 text-purple-800',
      'Emergency': 'bg-orange-100 text-orange-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  const handleApprove = (request) => {
    // Handle approval logic
    console.log('Approve request:', request)
  }

  const handleReject = (request) => {
    // Handle rejection logic
    console.log('Reject request:', request)
  }

  const handleViewDetails = (request) => {
    setSelectedRequest(request)
  }

  const calculateStats = () => {
    const total = leaveRequests.length
    const pending = leaveRequests.filter(r => r.status === 'Pending').length
    const approved = leaveRequests.filter(r => r.status === 'Approved').length
    const rejected = leaveRequests.filter(r => r.status === 'Rejected').length
    
    return { total, pending, approved, rejected }
  }

  const stats = calculateStats()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading leave requests...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowNewRequest(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
              >
                <span className="material-symbols-outlined mr-2">add</span>
                New Request
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
                <span className="material-symbols-outlined text-blue-600">beach_access</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
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
              <div className="p-3 bg-green-100 rounded-full">
                <span className="material-symbols-outlined text-green-600">check_circle</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-full">
                <span className="material-symbols-outlined text-red-600">cancel</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Rejected</p>
                <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Leave Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {leaveTypes.map(type => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'All Types' : type}
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
                  setFilterStatus('all')
                  setFilterType('all')
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Leave Requests Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Leave Requests ({filteredRequests.length})
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
                    Leave Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applied Date
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
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{request.employeeName}</div>
                        <div className="text-sm text-gray-500">{request.employeeId} • {request.department}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getLeaveTypeColor(request.leaveType)}`}>
                        {request.leaveType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {request.startDate} to {request.endDate}
                      </div>
                      <div className="text-sm text-gray-500">{request.days} days</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate" title={request.reason}>
                        {request.reason}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {request.appliedDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                      {request.approver && (
                        <div className="text-xs text-gray-500 mt-1">by {request.approver}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewDetails(request)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        View
                      </button>
                      {request.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(request)}
                            className="text-green-600 hover:text-green-900 mr-3"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(request)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* New Request Modal */}
      {showNewRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">New Leave Request</h2>
              <button
                onClick={() => setShowNewRequest(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="text-center text-gray-500">
              New leave request form would go here...
            </div>
          </div>
        </div>
      )}

      {/* Request Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Leave Request Details</h2>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900">Employee Information</h3>
                <p className="text-gray-600">{selectedRequest.employeeName} ({selectedRequest.employeeId})</p>
                <p className="text-gray-600">{selectedRequest.department}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Leave Details</h3>
                <p className="text-gray-600">Type: {selectedRequest.leaveType}</p>
                <p className="text-gray-600">Duration: {selectedRequest.startDate} to {selectedRequest.endDate}</p>
                <p className="text-gray-600">Days: {selectedRequest.days}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Reason</h3>
                <p className="text-gray-600">{selectedRequest.reason}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Application Details</h3>
                <p className="text-gray-600">Applied: {selectedRequest.appliedDate}</p>
                <p className="text-gray-600">Status: {selectedRequest.status}</p>
                {selectedRequest.approver && (
                  <p className="text-gray-600">Approved by: {selectedRequest.approver}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LeaveManagement
