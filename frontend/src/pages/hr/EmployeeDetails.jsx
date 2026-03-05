import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import hrApi from '../../services/hrApi'

const EmployeeDetails = () => {
  const navigate = useNavigate()
  const { userId } = useParams()
  const [employee, setEmployee] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [profileData, setProfileData] = useState({})

  useEffect(() => {
    fetchEmployeeDetails()
  }, [userId])

  const fetchEmployeeDetails = async () => {
    try {
      const employeeData = await hrApi.getEmployeeById(userId)
      setEmployee(employeeData)
      setProfileData({
        first_name: employeeData.first_name,
        last_name: employeeData.last_name,
        phone: employeeData.phone,
        address: employeeData.address
      })
    } catch (error) {
      console.error('Error fetching employee details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async () => {
    try {
      await hrApi.updateEmployeeProfile(userId, profileData)
      setEmployee(prev => ({ ...prev, ...profileData }))
      setEditing(false)
      console.log('Profile updated successfully')
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile. Please try again.')
    }
  }

  const handleVerifyEmployee = async () => {
    try {
      await hrApi.verifyEmployee(userId)
      fetchEmployeeDetails()
      console.log('Employee verified successfully')
    } catch (error) {
      console.error('Error verifying employee:', error)
      alert('Failed to verify employee. Please try again.')
    }
  }

  const handleUpdateStatus = async (newStatus) => {
    try {
      await hrApi.updateEmploymentStatus(userId, newStatus)
      fetchEmployeeDetails()
      console.log('Status updated successfully')
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update status. Please try again.')
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
          <p className="mt-4 text-gray-600">Loading employee details...</p>
        </div>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Employee not found</p>
          <button
            onClick={() => navigate('/hr/employees')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Employees
          </button>
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
                onClick={() => navigate('/hr/employees')}
                className="mr-4 text-gray-500 hover:text-gray-700"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Employee Details</h1>
            </div>
            <div className="flex items-center space-x-4">
              {!employee.hr_verified && (
                <button
                  onClick={handleVerifyEmployee}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
                >
                  <span className="material-symbols-outlined mr-2">verified</span>
                  Verify Employee
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Employee Overview */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                <span className="material-symbols-outlined text-gray-500 text-2xl">person</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {employee.first_name} {employee.last_name}
                </h2>
                <p className="text-gray-500">{employee.employee_id}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(employee.employment_status)}`}>
                    {employee.employment_status}
                  </span>
                  {employee.hr_verified && (
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Verified
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setEditing(!editing)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {editing ? 'Cancel' : 'Edit Profile'}
              </button>
              <div className="relative">
                <button
                  onClick={() => document.getElementById('status-dropdown').classList.toggle('hidden')}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
                >
                  <span className="material-symbols-outlined mr-2">settings</span>
                  Update Status
                </button>
                <div id="status-dropdown" className="hidden absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                  <div className="py-1">
                    <button
                      onClick={() => handleUpdateStatus('ACTIVE')}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      Set Active
                    </button>
                    <button
                      onClick={() => handleUpdateStatus('INACTIVE')}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      Set Inactive
                    </button>
                    <button
                      onClick={() => handleUpdateStatus('ON_LEAVE')}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      Set On Leave
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Employee Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Basic Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Employee ID</p>
                  <p className="font-medium text-gray-900">{employee.employee_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{employee.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  {editing ? (
                    <input
                      type="text"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="font-medium text-gray-900">{employee.phone || 'Not provided'}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  {editing ? (
                    <textarea
                      value={profileData.address}
                      onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                    />
                  ) : (
                    <p className="font-medium text-gray-900">{employee.address || 'Not provided'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Employment Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Employment Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Department</p>
                  <p className="font-medium text-gray-900">{employee.department}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Job Grade</p>
                  <p className="font-medium text-gray-900">{employee.job_grade}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Employment Status</p>
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(employee.employment_status)}`}>
                    {employee.employment_status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Hire Date</p>
                  <p className="font-medium text-gray-900">{employee.hire_date}</p>
                </div>
              </div>
            </div>

            {/* Verification Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">HR Verified</p>
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    employee.hr_verified 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {employee.hr_verified ? 'Verified' : 'Pending'}
                  </span>
                </div>
                {employee.hr_verification_date && (
                  <div>
                    <p className="text-sm text-gray-500">Verification Date</p>
                    <p className="font-medium text-gray-900">{employee.hr_verification_date}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Created Date</p>
                  <p className="font-medium text-gray-900">{employee.created_at}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="font-medium text-gray-900">{employee.updated_at}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Actions */}
          {editing && (
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setEditing(false)
                  setProfileData({
                    first_name: employee.first_name,
                    last_name: employee.last_name,
                    phone: employee.phone,
                    address: employee.address
                  })
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateProfile}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>

        {/* Additional Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="text-center text-gray-500">
              Recent activity would be displayed here...
            </div>
          </div>

          {/* Performance Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
            <div className="text-center text-gray-500">
              Performance data would be displayed here...
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default EmployeeDetails
