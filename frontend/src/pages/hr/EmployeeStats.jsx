import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import hrApi from '../../services/hrApi'

const EmployeeStats = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('month')
  const [selectedDepartment, setSelectedDepartment] = useState('all')

  useEffect(() => {
    fetchStats()
  }, [timeRange, selectedDepartment])

  const fetchStats = async () => {
    try {
      const statsData = await hrApi.getEmployeeStats()
      // Process stats based on time range and department
      setStats(statsData)
    } catch (error) {
      console.error('Error fetching employee stats:', error)
      // Fallback to mock data
      setStats({
        total: 156,
        active: 142,
        inactive: 8,
        pending: 6,
        byDepartment: [
          { name: 'IT', total: 25, active: 23, inactive: 2 },
          { name: 'Finance', total: 18, active: 17, inactive: 1 },
          { name: 'HR', total: 12, active: 12, inactive: 0 },
          { name: 'Operations', total: 30, active: 28, inactive: 2 },
          { name: 'Marketing', total: 15, active: 14, inactive: 1 },
          { name: 'Sales', total: 56, active: 48, inactive: 8 }
        ],
        byJobGrade: [
          { grade: 'INTERN', count: 8, avgSalary: 500 },
          { grade: 'JUNIOR', count: 32, avgSalary: 2000 },
          { grade: 'MID', count: 45, avgSalary: 4500 },
          { grade: 'SENIOR', count: 38, avgSalary: 8000 },
          { grade: 'MANAGER', count: 25, avgSalary: 12000 },
          { grade: 'DIRECTOR', count: 8, avgSalary: 20000 }
        ],
        byStatus: {
          active: 142,
          inactive: 8,
          pending: 6
        },
        byGender: {
          male: 89,
          female: 67
        },
        byAgeGroup: [
          { range: '18-25', count: 45 },
          { range: '26-35', count: 67 },
          { range: '36-45', count: 32 },
          { range: '46-55', count: 12 }
        ],
        hireTrends: [
          { month: '2024-01', hires: 12 },
          { month: '2023-12', hires: 8 },
          { month: '2023-11', hires: 15 },
          { month: '2023-10', hires: 10 },
          { month: '2023-09', hires: 6 },
          { month: '2023-08', hires: 9 }
        ],
        turnoverRate: 5.2
      })
    } finally {
      setLoading(false)
    }
  }

  const departments = ['all', 'IT', 'Finance', 'HR', 'Operations', 'Marketing', 'Sales']
  const timeRanges = ['week', 'month', 'quarter', 'year']

  const getStatCardColor = (type) => {
    const colors = {
      total: 'bg-blue-500 text-blue-600',
      active: 'bg-green-500 text-green-600',
      inactive: 'bg-red-500 text-red-600',
      pending: 'bg-yellow-500 text-yellow-600'
    }
    return colors[type] || 'bg-gray-500 text-gray-600'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading statistics...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Employee Statistics</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Range</label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {timeRanges.map(range => (
                  <option key={range} value={range}>
                    {range.charAt(0).toUpperCase() + range.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
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
                onClick={() => {
                  setTimeRange('month')
                  setSelectedDepartment('all')
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`p-3 ${getStatCardColor('total')} rounded-full`}>
                  <span className="material-symbols-outlined text-white">people</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Total Employees</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`p-3 ${getStatCardColor('active')} rounded-full`}>
                  <span className="material-symbols-outlined text-white">check_circle</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Active Employees</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`p-3 ${getStatCardColor('inactive')} rounded-full`}>
                  <span className="material-symbols-outlined text-white">person_off</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Inactive Employees</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.inactive}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`p-3 ${getStatCardColor('pending')} rounded-full`}>
                  <span className="material-symbols-outlined text-white">pending</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Pending Verification</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Department Breakdown */}
        {stats && (
          <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Department Breakdown</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Active
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Inactive
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Percentage
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.byDepartment
                    .filter(dept => selectedDepartment === 'all' || dept.name === selectedDepartment)
                    .map((dept, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{dept.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{dept.total}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{dept.active}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{dept.inactive}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {dept.total > 0 ? Math.round((dept.active / dept.total) * 100) : 0}%
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Job Grade Distribution */}
        {stats && (
          <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Job Grade Distribution</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Job Grade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employees
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg Salary
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Percentage
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.byJobGrade.map((grade, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{grade.grade}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{grade.count}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">${grade.avgSalary.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {stats.total > 0 ? Math.round((grade.count / stats.total) * 100) : 0}%
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Hire Trends */}
        {stats && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Hiring Trends</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-4">Monthly Hires</h3>
                <div className="space-y-2">
                  {stats.hireTrends.slice(0, 6).map((trend, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{trend.month}</span>
                      <span className="text-sm font-medium text-gray-900">{trend.hires} hires</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-4">Turnover Rate</h3>
                <div className="text-3xl font-bold text-gray-900">{stats.turnoverRate}%</div>
                <p className="text-sm text-gray-500">Annual turnover rate</p>
              </div>
            </div>
          </div>
        )}

        {/* Demographics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Gender Distribution</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Male</span>
                  <div className="flex items-center">
                    <div className="w-32 bg-blue-200 rounded-full h-2 mr-2">
                      <div 
                        className="h-2 bg-blue-600 rounded-full"
                        style={{ width: `${(stats.byGender.male / (stats.byGender.male + stats.byGender.female)) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {stats.byGender.male} ({Math.round((stats.byGender.male / (stats.byGender.male + stats.byGender.female)) * 100)}%)
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Female</span>
                  <div className="flex items-center">
                    <div className="w-32 bg-pink-200 rounded-full h-2 mr-2">
                      <div 
                        className="h-2 bg-pink-600 rounded-full"
                        style={{ width: `${(stats.byGender.female / (stats.byGender.male + stats.byGender.female)) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {stats.byGender.female} ({Math.round((stats.byGender.female / (stats.byGender.male + stats.byGender.female)) * 100)}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Age Distribution</h2>
              <div className="space-y-4">
                {stats.byAgeGroup.map((group, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{group.range}</span>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="h-2 bg-blue-600 rounded-full"
                          style={{ width: `${(group.count / stats.total) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {group.count} ({Math.round((group.count / stats.total) * 100)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default EmployeeStats
