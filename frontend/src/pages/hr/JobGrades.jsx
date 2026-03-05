import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import hrApi from '../../services/hrApi'

const JobGrades = () => {
  const navigate = useNavigate()
  const [jobGrades, setJobGrades] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedGrade, setSelectedGrade] = useState(null)

  useEffect(() => {
    fetchJobGrades()
    fetchEmployees()
  }, [])

  const fetchJobGrades = async () => {
    try {
      const gradesData = await hrApi.getJobGrades()
      setJobGrades(gradesData)
    } catch (error) {
      console.error('Error fetching job grades:', error)
      // Fallback to mock data
      setJobGrades([
        { id: 1, grade: 'INTERN', level: 1, description: 'Internship position', minSalary: 0, maxSalary: 1000 },
        { id: 2, grade: 'JUNIOR', level: 2, description: 'Junior level position', minSalary: 1000, maxSalary: 3000 },
        { id: 3, grade: 'MID', level: 3, description: 'Mid-level position', minSalary: 3000, maxSalary: 6000 },
        { id: 4, grade: 'SENIOR', level: 4, description: 'Senior level position', minSalary: 6000, maxSalary: 10000 },
        { id: 5, grade: 'MANAGER', level: 5, description: 'Management position', minSalary: 10000, maxSalary: 15000 },
        { id: 6, grade: 'DIRECTOR', level: 6, description: 'Director level position', minSalary: 15000, maxSalary: 25000 }
      ])
    } finally {
      setLoading(false)
    }
  }

  const fetchEmployees = async () => {
    try {
      const employeesData = await hrApi.getEmployees()
      setEmployees(employeesData)
    } catch (error) {
      console.error('Error fetching employees:', error)
    }
  }

  const getEmployeesByGrade = (grade) => {
    return employees.filter(emp => emp.job_grade === grade).length
  }

  const getSalaryRangeColor = (grade) => {
    const colors = {
      'INTERN': 'bg-gray-100 text-gray-800',
      'JUNIOR': 'bg-blue-100 text-blue-800',
      'MID': 'bg-green-100 text-green-800',
      'SENIOR': 'bg-purple-100 text-purple-800',
      'MANAGER': 'bg-orange-100 text-orange-800',
      'DIRECTOR': 'bg-red-100 text-red-800'
    }
    return colors[grade] || 'bg-gray-100 text-gray-800'
  }

  const getLevelColor = (level) => {
    if (level <= 2) return 'text-blue-600'
    if (level <= 4) return 'text-green-600'
    if (level <= 6) return 'text-purple-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading job grades...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Job Grades</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
              >
                <span className="material-symbols-outlined mr-2">add</span>
                Add Job Grade
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
                <span className="material-symbols-outlined text-blue-600">grade</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Total Grades</p>
                <p className="text-2xl font-bold text-gray-900">{jobGrades.length}</p>
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
                <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <span className="material-symbols-outlined text-purple-600">trending_up</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Avg Salary Range</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${jobGrades.length > 0 
                    ? Math.round(jobGrades.reduce((sum, grade) => sum + (grade.minSalary + grade.maxSalary) / 2, 0) / jobGrades.length).toLocaleString()
                    : 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-full">
                <span className="material-symbols-outlined text-orange-600">bar_chart</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Max Grade Level</p>
                <p className="text-2xl font-bold text-gray-900">
                  {jobGrades.length > 0 ? Math.max(...jobGrades.map(g => g.level)) : 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Job Grades Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobGrades.map((grade) => (
            <div
              key={grade.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedGrade(grade)}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`px-3 py-1 rounded-full ${getSalaryRangeColor(grade.grade)}`}>
                    <span className="text-sm font-bold">{grade.grade}</span>
                  </div>
                  <div className="flex items-center">
                    <span className={`text-lg font-bold ${getLevelColor(grade.level)}`}>
                      Level {grade.level}
                    </span>
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-2">{grade.description}</h3>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Salary Range:</span>
                    <span className="font-medium text-gray-900">
                      ${grade.minSalary.toLocaleString()} - ${grade.maxSalary.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Employees:</span>
                    <span className="font-medium text-gray-900">{getEmployeesByGrade(grade.grade)}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-blue-400 to-green-400"
                        style={{ width: `${(grade.level / 6) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500">Level {grade.level}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Employees by Grade */}
        <div className="mt-8 bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Employees by Job Grade</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job Grade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Salary Range
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {jobGrades.map((grade) => (
                  <tr key={grade.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getSalaryRangeColor(grade.grade)}`}>
                        {grade.grade}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-bold ${getLevelColor(grade.level)}`}>
                        {grade.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{grade.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ${grade.minSalary.toLocaleString()} - ${grade.maxSalary.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{getEmployeesByGrade(grade.grade)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedGrade(grade)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        View Details
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add Job Grade Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Add Job Grade</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="text-center text-gray-500">
              Add job grade form would go here...
            </div>
          </div>
        </div>
      )}

      {/* Grade Details Modal */}
      {selectedGrade && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">{selectedGrade.grade} Details</h2>
              <button
                onClick={() => setSelectedGrade(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Grade Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Grade</p>
                    <p className="font-medium text-gray-900">{selectedGrade.grade}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Level</p>
                    <p className="font-medium text-gray-900">{selectedGrade.level}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Description</p>
                    <p className="font-medium text-gray-900">{selectedGrade.description}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Salary Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Minimum Salary</p>
                    <p className="font-medium text-gray-900">${selectedGrade.minSalary.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Maximum Salary</p>
                    <p className="font-medium text-gray-900">${selectedGrade.maxSalary.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Average Salary</p>
                    <p className="font-medium text-gray-900">
                      ${Math.round((selectedGrade.minSalary + selectedGrade.maxSalary) / 2).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Employees in this Grade</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-center text-gray-500">
                  {getEmployeesByGrade(selectedGrade.grade)} employees
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default JobGrades
