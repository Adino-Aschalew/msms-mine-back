import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { TrendingUp, Users, DollarSign, CreditCard, Activity } from 'lucide-react'

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalSavings: 0,
    activeLoans: 0,
    monthlyDeposits: 0,
    pendingApplications: 0
  })
  const [loading, setLoading] = useState(true)
  const [recentActivity, setRecentActivity] = useState([])

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        // Fetch data from backend APIs
        const [savingsRes, loansRes, applicationsRes] = await Promise.all([
          api.get('/savings/account'),
          api.get('/loans/my-loans'),
          api.get('/loans/applications').catch(() => ({ data: [] }))
        ])

        setStats({
          totalSavings: savingsRes.data?.current_balance || savingsRes.data?.totalBalance || 0,
          activeLoans: loansRes.data?.filter(loan => loan.status === 'ACTIVE').length || 0,
          monthlyDeposits: savingsRes.data?.recent_contribution || savingsRes.data?.monthlyDeposits || 0,
          pendingApplications: applicationsRes.data?.filter(app => app.status === 'PENDING').length || 0
        })
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error)
        // Fallback - keep zeros on error
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardStats()
  }, [])

  const statCards = [
    {
      title: 'Total Savings',
      value: `$${stats.totalSavings.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Active Loans',
      value: stats.activeLoans,
      icon: CreditCard,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Monthly Deposits',
      value: `$${stats.monthlyDeposits.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Pending Applications',
      value: stats.pendingApplications,
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div key={index} className="card p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Activity className="w-5 h-5 mr-2" />
          Recent Activity
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <span className="text-sm text-gray-600">Loan Application Submitted</span>
            <span className="text-sm text-gray-500">2 hours ago</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <span className="text-sm text-gray-600">Savings Deposit</span>
            <span className="text-sm text-gray-500">1 day ago</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <span className="text-sm text-gray-600">Loan Payment Received</span>
            <span className="text-sm text-gray-500">3 days ago</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
