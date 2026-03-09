import React, { useState, useEffect } from 'react'
import { Brain, TrendingUp, Shield, AlertTriangle, Search, BarChart3, Play } from 'lucide-react'
import api from '../services/api'

const AI = () => {
  const [predictions, setPredictions] = useState([])
  const [riskAssessments, setRiskAssessments] = useState([])
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [activeTab, setActiveTab] = useState('predictions')

  useEffect(() => {
    fetchAIData()
  }, [])

  const fetchAIData = async () => {
    try {
      setLoading(true)
      // Fetch predictions from backend AI API
      const predictionsRes = await api.get('/ai/predictions').catch(() => ({ data: [] }))
      setPredictions(predictionsRes.data || [])
      
      // Fetch risk assessments from loans eligibility endpoint
      const riskRes = await api.get('/loans/eligibility-score').catch(() => ({ data: [] }))
      const riskData = Array.isArray(riskRes.data) ? riskRes.data : []
      setRiskAssessments(riskData)
    } catch (error) {
      console.error('Failed to fetch AI data:', error)
      setPredictions([])
      setRiskAssessments([])
    } finally {
      setLoading(false)
    }
  }

  const runAnalysis = async () => {
    try {
      setAnalyzing(true)
      // Run eligibility check
      await api.get('/loans/eligibility-score')
      alert('Analysis completed successfully!')
      fetchAIData()
    } catch (error) {
      console.error('Failed to run analysis:', error)
      alert('Failed to run analysis. Please try again.')
    } finally {
      setAnalyzing(false)
    }
  }

  const getRiskLevel = (score) => {
    if (score < 0.3) return 'LOW'
    if (score < 0.7) return 'MEDIUM'
    return 'HIGH'
  }

  const getRiskColor = (level) => {
    switch (level) {
      case 'LOW':
        return 'bg-green-100 text-green-800'
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800'
      case 'HIGH':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">AI & Analytics</h1>
        <button 
          className="btn btn-primary flex items-center"
          onClick={runAnalysis}
          disabled={analyzing}
        >
          <Brain className="h-4 w-4 mr-2" />
          {analyzing ? 'Analyzing...' : 'Run Analysis'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <Brain className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Predictions</p>
              <p className="text-2xl font-semibold text-gray-900">
                {predictions.length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Risk Assessments</p>
              <p className="text-2xl font-semibold text-gray-900">
                {riskAssessments.length}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg. Confidence</p>
              <p className="text-2xl font-semibold text-gray-900">
                {predictions.length > 0 ? (predictions.reduce((sum, p) => sum + (p.confidence || 0), 0) / predictions.length * 100).toFixed(1) : 0}%
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">High Risk</p>
              <p className="text-2xl font-semibold text-gray-900">
                {riskAssessments.filter(r => getRiskLevel(r.risk_score || r.score) === 'HIGH').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('predictions')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'predictions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Predictions
          </button>
          <button
            onClick={() => setActiveTab('risk')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'risk'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Risk Assessment
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'predictions' && (
        <div className="space-y-4">
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prediction
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Confidence
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {predictions.length > 0 ? (
                    predictions.map((prediction) => (
                      <tr key={prediction.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            (prediction.type || '').includes('loan') 
                              ? 'bg-red-100 text-red-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {(prediction.type || 'unknown').replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {prediction.user_id || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            (prediction.prediction || '').includes('LOW') || (prediction.prediction || '').includes('HIGH')
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {(prediction.prediction || 'N/A').replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${(prediction.confidence || 0) * 100}%` }}
                              ></div>
                            </div>
                            {((prediction.confidence || 0) * 100).toFixed(1)}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {prediction.created_at ? new Date(prediction.created_at).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900">
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                        No predictions found. Run analysis to generate predictions.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'risk' && (
        <div className="space-y-4">
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Loan Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Risk Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Risk Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {riskAssessments.length > 0 ? (
                    riskAssessments.map((assessment, index) => {
                      const riskScore = assessment.risk_score || assessment.score || 0
                      const riskLevel = getRiskLevel(riskScore)
                      return (
                        <tr key={assessment.id || index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {assessment.user_id || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${(assessment.loan_amount || assessment.amount || 0).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    riskScore < 0.3 ? 'bg-green-600' :
                                    riskScore < 0.7 ? 'bg-yellow-600' : 'bg-red-600'
                                  }`}
                                  style={{ width: `${riskScore * 100}%` }}
                                ></div>
                              </div>
                              {(riskScore * 100).toFixed(1)}%
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRiskColor(riskLevel)}`}>
                              {riskLevel}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {assessment.created_at ? new Date(assessment.created_at).toLocaleDateString() : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-blue-600 hover:text-blue-900">
                              View Details
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                        No risk assessments found. Run analysis to generate assessments.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AI
