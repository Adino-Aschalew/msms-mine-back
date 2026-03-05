import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import hrApi from '../../services/hrApi'

const DepartmentOverview = () => {
  const navigate = useNavigate()
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDepartment, setSelectedDepartment] = useState(null)

  useEffect(() => {
    fetchDepartments()
  }, [])

  const fetchDepartments = async () => {
    try {
      const departmentsData = await hrApi.getDepartments()
      const employeesData = await hrApi.getEmployees()
      
      // Process departments with employee counts and stats
      const processedDepartments = departmentsData.map(dept => {
        const deptEmployees = employeesData.filter(emp => emp.department === dept.name)
        const avgPerformance = deptEmployees.length > 0 
          ? deptEmployees.reduce((sum, emp) => sum + (emp.performance_rating || 0), 0) / deptEmployees.length 
          : 0
        
        return {
          id: dept.id,
          name: dept.name,
          head: dept.head || 'Not Assigned',
          employeeCount: deptEmployees.length,
          budget: dept.budget || 0,
          performance: Math.round(avgPerformance * 20), // Convert to 100 scale
          description: dept.description || `${dept.name} Department`,
          color: getColorForDepartment(dept.name)
        }
      })
      
      setDepartments(processedDepartments)
    } catch (error) {
      console.error('Error fetching departments:', error)
      // Fallback to mock data if API fails
      const mockDepartments = [
        {
          id: 1,
          name: 'IT',
          head: 'John Doe',
          employeeCount: 25,
          budget: 500000,
          performance: 92,
          description: 'Information Technology and Systems',
          color: 'blue'
        },
        {
          id: 2,
          name: 'Finance',
          head: 'Jane Smith',
          employeeCount: 18,
          budget: 350000,
          performance: 88,
          description: 'Financial Management and Accounting',
          color: 'green'
        },
        {
          id: 3,
          name: 'HR',
          head: 'Michael Johnson',
          employeeCount: 12,
          budget: 200000,
          performance: 95,
          description: 'Human Resources and Administration',
          color: 'purple'
        },
        {
          id: 4,
          name: 'Operations',
          head: 'Sarah Williams',
          employeeCount: 30,
          budget: 450000,
          performance: 85,
          description: 'Operations and Logistics',
          color: 'orange'
        },
        {
          id: 5,
          name: 'Marketing',
          head: 'David Brown',
          employeeCount: 15,
          budget: 300000,
          performance: 90,
          description: 'Marketing and Sales',
          color: 'pink'
        }
      ]
      setDepartments(mockDepartments)
    } finally {
      setLoading(false)
    }
  }

  const getColorForDepartment = (deptName) => {
    const colors = {
      'IT': 'blue',
      'Finance': 'green',
      'HR': 'purple',
      'Operations': 'orange',
      'Marketing': 'pink'
    }
    return colors[deptName] || 'gray'
  }

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-500 text-blue-600',
      green: 'bg-green-500 text-green-600',
      purple: 'bg-purple-500 text-purple-600',
      orange: 'bg-orange-500 text-orange-600',
      pink: 'bg-pink-500 text-pink-600'
    }
    return colors[color] || 'bg-gray-500 text-gray-600'
  }

  const getLightColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-800',
      green: 'bg-green-100 text-green-800',
      purple: 'bg-purple-100 text-purple-800',
      orange: 'bg-orange-100 text-orange-800',
      pink: 'bg-pink-100 text-pink-800'
    }
    return colors[color] || 'bg-gray-100 text-gray-800'
  }

  const handleDepartmentClick = (department) => {
    setSelectedDepartment(department)
  }

  const handleCloseDetail = () => {
    setSelectedDepartment(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading departments...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Department Overview</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
                <span className="material-symbols-outlined mr-2">add</span>
                Add Department
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <span className="material-symbols-outlined text-blue-600">business</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Total Departments</p>
                <p className="text-2xl font-bold text-gray-900">{departments.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <span className="material-symbols-outlined text-green-600">people</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Total Employees</p>
                <p className="text-2xl font-bold text-gray-900">
                  {departments.reduce((sum, dept) => sum + dept.employeeCount, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <span className="material-symbols-outlined text-purple-600">payments</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Total Budget</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${departments.reduce((sum, dept) => sum + dept.budget, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-full">
                <span className="material-symbols-outlined text-orange-600">trending_up</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Avg Performance</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(departments.reduce((sum, dept) => sum + dept.performance, 0) / departments.length)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Department Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((department) => (
            <div
              key={department.id}
              onClick={() => handleDepartmentClick(department)}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-full ${getColorClasses(department.color).split(' ')[0]}`}>
                    <span className="material-symbols-outlined text-white">business</span>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getLightColorClasses(department.color)}`}>
                    {department.performance}% Performance
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-2">{department.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{department.description}</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Department Head:</span>
                    <span className="font-medium text-gray-900">{department.head}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Employees:</span>
                    <span className="font-medium text-gray-900">{department.employeeCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Budget:</span>
                    <span className="font-medium text-gray-900">${department.budget.toLocaleString()}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className={`h-2 rounded-full ${getColorClasses(department.color).split(' ')[0]}`}
                          style={{ width: `${department.performance}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">{department.performance}%</span>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Department Detail Modal */}
      {selectedDepartment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{selectedDepartment.name} Department</h2>
              <button
                onClick={handleCloseDetail}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Department Info */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Department Head</p>
                    <p className="font-medium text-gray-900">{selectedDepartment.head}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Description</p>
                    <p className="font-medium text-gray-900">{selectedDepartment.description}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Employee Count</p>
                    <p className="font-medium text-gray-900">{selectedDepartment.employeeCount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Annual Budget</p>
                    <p className="font-medium text-gray-900">${selectedDepartment.budget.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Performance Score</p>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className={`h-2 rounded-full ${getColorClasses(selectedDepartment.color).split(' ')[0]}`}
                          style={{ width: `${selectedDepartment.performance}%` }}
                        ></div>
                      </div>
                      <span className="font-medium text-gray-900">{selectedDepartment.performance}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center">
                    <span className="material-symbols-outlined mr-2">people</span>
                    View Employees
                  </button>
                  <button className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center">
                    <span className="material-symbols-outlined mr-2">assessment</span>
                    Performance Report
                  </button>
                  <button className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center justify-center">
                    <span className="material-symbols-outlined mr-2">payments</span>
                    Budget Details
                  </button>
                  <button className="w-full bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center justify-center">
                    <span className="material-symbols-outlined mr-2">edit</span>
                    Edit Department
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-center text-gray-500">
                  Recent activity would be displayed here...
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DepartmentOverview
