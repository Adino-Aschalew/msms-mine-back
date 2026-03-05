import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const PerformanceReviews = () => {
  const navigate = useNavigate()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterRating, setFilterRating] = useState('all')
  const [showNewReview, setShowNewReview] = useState(false)
  const [selectedReview, setSelectedReview] = useState(null)

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      // Mock data - replace with actual API call
      const mockReviews = [
        {
          id: 1,
          employeeId: 'EMP001',
          employeeName: 'John Doe',
          department: 'IT',
          position: 'Senior Developer',
          reviewPeriod: 'Q4 2023',
          reviewDate: '2024-01-15',
          reviewer: 'Sarah Williams',
          overallRating: 4.5,
          technicalSkills: 4.8,
          communication: 4.2,
          teamwork: 4.6,
          leadership: 4.0,
          productivity: 4.7,
          status: 'Completed',
          strengths: ['Excellent problem-solving skills', 'Strong technical knowledge', 'Good team collaboration'],
          improvements: ['Time management', 'Documentation skills'],
          goals: ['Lead a project team', 'Mentor junior developers', 'Complete certification course']
        },
        {
          id: 2,
          employeeId: 'EMP002',
          employeeName: 'Jane Smith',
          department: 'Finance',
          position: 'Accountant',
          reviewPeriod: 'Q4 2023',
          reviewDate: '2024-01-18',
          reviewer: 'Michael Johnson',
          overallRating: 4.2,
          technicalSkills: 4.5,
          communication: 4.0,
          teamwork: 4.3,
          leadership: 3.8,
          productivity: 4.4,
          status: 'Completed',
          strengths: ['Attention to detail', 'Analytical skills', 'Reliability'],
          improvements: ['Presentation skills', 'Cross-department collaboration'],
          goals: ['Improve financial reporting', 'Lead budget planning', 'Develop training materials']
        },
        {
          id: 3,
          employeeId: 'EMP003',
          employeeName: 'Michael Johnson',
          department: 'HR',
          position: 'HR Manager',
          reviewPeriod: 'Q4 2023',
          reviewDate: '2024-01-20',
          reviewer: 'David Brown',
          overallRating: 4.7,
          technicalSkills: 4.5,
          communication: 4.8,
          teamwork: 4.9,
          leadership: 4.6,
          productivity: 4.6,
          status: 'In Progress',
          strengths: ['Leadership skills', 'Employee relations', 'Strategic thinking'],
          improvements: ['Technology adoption', 'Process optimization'],
          goals: ['Implement new HR system', 'Develop leadership training', 'Improve employee engagement']
        },
        {
          id: 4,
          employeeId: 'EMP004',
          employeeName: 'Sarah Williams',
          department: 'Operations',
          position: 'Operations Manager',
          reviewPeriod: 'Q4 2023',
          reviewDate: '2024-01-22',
          reviewer: 'John Doe',
          overallRating: 4.3,
          technicalSkills: 4.1,
          communication: 4.4,
          teamwork: 4.5,
          leadership: 4.2,
          productivity: 4.3,
          status: 'Pending',
          strengths: ['Operational efficiency', 'Problem resolution', 'Team management'],
          improvements: ['Strategic planning', 'Innovation initiatives'],
          goals: ['Optimize supply chain', 'Reduce operational costs', 'Improve quality metrics']
        },
        {
          id: 5,
          employeeId: 'EMP005',
          employeeName: 'David Brown',
          department: 'Marketing',
          position: 'Marketing Specialist',
          reviewPeriod: 'Q4 2023',
          reviewDate: '2024-01-25',
          reviewer: 'Emily Davis',
          overallRating: 3.8,
          technicalSkills: 3.5,
          communication: 4.2,
          teamwork: 3.9,
          leadership: 3.2,
          productivity: 4.1,
          status: 'Scheduled',
          strengths: ['Creativity', 'Market research', 'Campaign management'],
          improvements: ['Data analysis', 'ROI measurement', 'Digital marketing skills'],
          goals: ['Complete digital marketing certification', 'Improve campaign analytics', 'Lead major product launch']
        }
      ]
      setReviews(mockReviews)
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredReviews = reviews.filter(review => {
    const matchesStatus = filterStatus === 'all' || review.status === filterStatus
    const matchesRating = filterRating === 'all' || 
      (filterRating === '5' && review.overallRating >= 4.5) ||
      (filterRating === '4' && review.overallRating >= 3.5 && review.overallRating < 4.5) ||
      (filterRating === '3' && review.overallRating >= 2.5 && review.overallRating < 3.5) ||
      (filterRating === '2' && review.overallRating < 2.5)
    return matchesStatus && matchesRating
  })

  const statuses = ['all', 'Scheduled', 'In Progress', 'Completed', 'Pending']
  const ratings = ['all', '5', '4', '3', '2']

  const getStatusColor = (status) => {
    const colors = {
      'Scheduled': 'bg-blue-100 text-blue-800',
      'In Progress': 'bg-yellow-100 text-yellow-800',
      'Completed': 'bg-green-100 text-green-800',
      'Pending': 'bg-gray-100 text-gray-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'text-green-600'
    if (rating >= 3.5) return 'text-blue-600'
    if (rating >= 2.5) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getRatingStars = (rating) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<span key={i} className="material-symbols-outlined text-yellow-400">star</span>)
      } else if (i - 0.5 <= rating) {
        stars.push(<span key={i} className="material-symbols-outlined text-yellow-400">star_half</span>)
      } else {
        stars.push(<span key={i} className="material-symbols-outlined text-gray-300">star</span>)
      }
    }
    return stars
  }

  const calculateStats = () => {
    const total = reviews.length
    const completed = reviews.filter(r => r.status === 'Completed').length
    const inProgress = reviews.filter(r => r.status === 'In Progress').length
    const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.overallRating, 0) / reviews.length : 0
    
    return { total, completed, inProgress, avgRating }
  }

  const stats = calculateStats()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading performance reviews...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Performance Reviews</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowNewReview(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
              >
                <span className="material-symbols-outlined mr-2">add</span>
                New Review
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
                <span className="material-symbols-outlined text-blue-600">assessment</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Total Reviews</p>
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
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <span className="material-symbols-outlined text-yellow-600">pending</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <span className="material-symbols-outlined text-purple-600">star</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Avg Rating</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avgRating.toFixed(1)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
              <select
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {ratings.map(rating => (
                  <option key={rating} value={rating}>
                    {rating === 'all' ? 'All Ratings' : `${rating} Stars`}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilterStatus('all')
                  setFilterRating('all')
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Performance Reviews ({filteredReviews.length})
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
                    Review Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Overall Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reviewer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Review Date
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
                {filteredReviews.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{review.employeeName}</div>
                        <div className="text-sm text-gray-500">{review.employeeId} • {review.department}</div>
                        <div className="text-sm text-gray-500">{review.position}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{review.reviewPeriod}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`text-lg font-bold ${getRatingColor(review.overallRating)}`}>
                          {review.overallRating.toFixed(1)}
                        </span>
                        <div className="ml-2 flex">
                          {getRatingStars(review.overallRating)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{review.reviewer}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{review.reviewDate}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(review.status)}`}>
                        {review.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedReview(review)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        View
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

      {/* New Review Modal */}
      {showNewReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">New Performance Review</h2>
              <button
                onClick={() => setShowNewReview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="text-center text-gray-500">
              New performance review form would go here...
            </div>
          </div>
        </div>
      )}

      {/* Review Details Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Performance Review Details</h2>
              <button
                onClick={() => setSelectedReview(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Employee Info */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Employee Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium text-gray-900">{selectedReview.employeeName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Employee ID</p>
                    <p className="font-medium text-gray-900">{selectedReview.employeeId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Department</p>
                    <p className="font-medium text-gray-900">{selectedReview.department}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Position</p>
                    <p className="font-medium text-gray-900">{selectedReview.position}</p>
                  </div>
                </div>
              </div>

              {/* Review Info */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Review Period</p>
                    <p className="font-medium text-gray-900">{selectedReview.reviewPeriod}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Review Date</p>
                    <p className="font-medium text-gray-900">{selectedReview.reviewDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Reviewer</p>
                    <p className="font-medium text-gray-900">{selectedReview.reviewer}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedReview.status)}`}>
                      {selectedReview.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ratings */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Ratings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Technical Skills</span>
                    <div className="flex items-center">
                      <span className={`font-bold ${getRatingColor(selectedReview.technicalSkills)}`}>
                        {selectedReview.technicalSkills.toFixed(1)}
                      </span>
                      <div className="ml-2 flex">
                        {getRatingStars(selectedReview.technicalSkills)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Communication</span>
                    <div className="flex items-center">
                      <span className={`font-bold ${getRatingColor(selectedReview.communication)}`}>
                        {selectedReview.communication.toFixed(1)}
                      </span>
                      <div className="ml-2 flex">
                        {getRatingStars(selectedReview.communication)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Teamwork</span>
                    <div className="flex items-center">
                      <span className={`font-bold ${getRatingColor(selectedReview.teamwork)}`}>
                        {selectedReview.teamwork.toFixed(1)}
                      </span>
                      <div className="ml-2 flex">
                        {getRatingStars(selectedReview.teamwork)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Leadership</span>
                    <div className="flex items-center">
                      <span className={`font-bold ${getRatingColor(selectedReview.leadership)}`}>
                        {selectedReview.leadership.toFixed(1)}
                      </span>
                      <div className="ml-2 flex">
                        {getRatingStars(selectedReview.leadership)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Productivity</span>
                    <div className="flex items-center">
                      <span className={`font-bold ${getRatingColor(selectedReview.productivity)}`}>
                        {selectedReview.productivity.toFixed(1)}
                      </span>
                      <div className="ml-2 flex">
                        {getRatingStars(selectedReview.productivity)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Overall Rating</span>
                    <div className="flex items-center">
                      <span className={`text-lg font-bold ${getRatingColor(selectedReview.overallRating)}`}>
                        {selectedReview.overallRating.toFixed(1)}
                      </span>
                      <div className="ml-2 flex">
                        {getRatingStars(selectedReview.overallRating)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Strengths and Improvements */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Strengths</h3>
                <div className="bg-green-50 rounded-lg p-4">
                  <ul className="space-y-2">
                    {selectedReview.strengths.map((strength, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-700">
                        <span className="material-symbols-outlined text-green-600 mr-2">check_circle</span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Areas for Improvement</h3>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <ul className="space-y-2">
                    {selectedReview.improvements.map((improvement, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-700">
                        <span className="material-symbols-outlined text-yellow-600 mr-2">trending_up</span>
                        {improvement}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Goals */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Goals for Next Period</h3>
              <div className="bg-blue-50 rounded-lg p-4">
                <ul className="space-y-2">
                  {selectedReview.goals.map((goal, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-700">
                      <span className="material-symbols-outlined text-blue-600 mr-2">flag</span>
                      {goal}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PerformanceReviews
