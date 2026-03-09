import React, { useState, useEffect } from 'react'
import { TrendingUp, Plus, Search, DollarSign, Eye, ArrowUpRight } from 'lucide-react'
import api from '../services/api'

const Savings = () => {
  const [savings, setSavings] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [accountSummary, setAccountSummary] = useState({
    current_balance: 0,
    total_savings: 0,
    total_contributions: 0,
    interest_earned: 0,
    interest_rate: 0
  })

  useEffect(() => {
    fetchSavings()
  }, [])

  const fetchSavings = async () => {
    try {
      setLoading(true)
      // Fetch user's savings account from backend
      const accountRes = await api.get('/savings/account')
      const transactionsRes = await api.get('/savings/transactions').catch(() => ({ data: [] }))
      
      // Set account summary
      if (accountRes.data) {
        setAccountSummary({
          current_balance: accountRes.data.current_balance || 0,
          total_savings: accountRes.data.total_savings || accountRes.data.current_balance || 0,
          total_contributions: accountRes.data.total_contributions || 0,
          interest_earned: accountRes.data.interest_earned || 0,
          interest_rate: accountRes.data.interest_rate || 0
        })
        setSavings([accountRes.data])
      } else if (Array.isArray(accountRes.data)) {
        setAccountSummary({
          current_balance: accountRes.data.reduce((sum, acc) => sum + (acc.current_balance || 0), 0),
          total_savings: accountRes.data.reduce((sum, acc) => sum + (acc.current_balance || 0), 0),
          total_contributions: accountRes.data.reduce((sum, acc) => sum + (acc.total_contributions || 0), 0),
          interest_earned: accountRes.data.reduce((sum, acc) => sum + (acc.interest_earned || 0), 0),
          interest_rate: accountRes.data[0]?.interest_rate || 0
        })
        setSavings(accountRes.data)
      } else {
        setSavings([])
      }
    } catch (error) {
      console.error('Failed to fetch savings:', error)
      // Keep empty on error
      setSavings([])
    } finally {
      setLoading(false)
    }
  }

  const filteredSavings = savings.filter(account =>
    (account.employee_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (account.account_type || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getAccountTypeColor = (type) => {
    switch (type) {
      case 'REGULAR':
        return 'bg-blue-100 text-blue-800'
      case 'FIXED':
        return 'bg-green-100 text-green-800'
      case 'SAVINGS':
        return 'bg-purple-100 text-purple-800'
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
        <h1 className="text-3xl font-bold text-gray-900">Savings Accounts</h1>
        <button className="btn btn-primary flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          New Account
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Current Balance</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${(accountSummary.current_balance || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Contributions</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${(accountSummary.total_contributions || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <ArrowUpRight className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Interest Earned</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${(accountSummary.interest_earned || 0).toLocaleString()} ({accountSummary.interest_rate}%)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search savings accounts..."
            className="input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Savings Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Balance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Interest Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Contributions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSavings.length > 0 ? (
                filteredSavings.map((account) => (
                  <tr key={account.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      #{account.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getAccountTypeColor(account.account_type)}`}>
                        {account.account_type || 'SAVINGS'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${(account.current_balance || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {account.interest_rate || 0}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${(account.total_contributions || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {account.created_at ? new Date(account.created_at).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        Deposit
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    No savings account found. Create a new account to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Savings
