import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  UserPlus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  UserX,
  UserCheck,
  Mail,
  Phone,
  Building,
  Briefcase,
  Shield,
  DollarSign,
  ArrowLeft
} from 'lucide-react'
import adminService from '../../services/adminService'

const LoanCommitteeAdminManagement = () => {
  const [loanAdmins, setLoanAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchLoanAdmins()
  }, [])

  const fetchLoanAdmins = async () => {
    try {
      setLoading(true)
      const response = await adminService.getLoanCommitteeAdmins()
      setLoanAdmins(response.data)
    } catch (err) {
      setError(err.message || 'Failed to fetch loan committee admins')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (adminId, currentStatus) => {
    try {
      setActionLoading(true)
      if (currentStatus) {
        await adminService.deactivateLoanCommitteeAdmin(adminId)
      } else {
        await adminService.activateLoanCommitteeAdmin(adminId)
      }
      await fetchLoanAdmins()
    } catch (err) {
      setError(err.message || 'Failed to update admin status')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedAdmin) return

    try {
      setActionLoading(true)
      await adminService.deleteLoanCommitteeAdmin(selectedAdmin.user_id)
      setShowDeleteModal(false)
      setSelectedAdmin(null)
      await fetchLoanAdmins()
    } catch (err) {
      setError(err.message || 'Failed to delete admin')
    } finally {
      setActionLoading(false)
    }
  }

  const filteredAdmins = loanAdmins.filter(admin => 
    admin.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.employee_id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getCommitteeLevelColor = (level) => {
    const colors = {
      'Chair': 'bg-purple-100 text-purple-700',
      'Lead': 'bg-blue-100 text-blue-700',
      'Senior': 'bg-emerald-100 text-emerald-700',
      'Junior': 'bg-amber-100 text-amber-700'
    }
    return colors[level] || 'bg-slate-100 text-slate-700'
  }

  if (loading) {
    return (
      <div className="font-display min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-500/30">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div className="absolute inset-0 rounded-2xl animate-ping bg-emerald-400 opacity-20"></div>
          </div>
          <p className="text-slate-600 font-medium">Loading Loan Committee...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="font-display min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/20">
      {/* Modern Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 lg:px-8">
        <div className="max-w-[1400px] mx-auto mt-4 rounded-2xl px-6 py-3 flex items-center justify-between bg-white/80 backdrop-blur-2xl border border-white/40 shadow-xl shadow-slate-200/50">
          {/* Logo & Back */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/admin')}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-slate-800 text-lg font-bold tracking-tight">Loan Committee</h2>
                <p className="text-slate-400 text-xs">Management Console</p>
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            <Link
              to="/admin/loan-committee-admins/create"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl text-sm font-bold hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-500/25"
            >
              <UserPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Create Committee Admin</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-8 px-4 lg:px-8">
        <div className="max-w-[1400px] mx-auto">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-black text-slate-800 mb-2">Loan Committee Admins</h1>
            <p className="text-slate-500">Manage and monitor loan committee administrator accounts</p>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/40 shadow-xl shadow-slate-200/50 p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or employee ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-emerald-500 focus:bg-white transition-all text-sm font-medium text-slate-700 placeholder:text-slate-400"
                  />
                </div>
              </div>
              <button className="flex items-center justify-center gap-2 px-5 py-3 border-2 border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all">
                <Filter className="h-4 w-4" />
                Filters
              </button>
            </div>
          </div>

          {/* Committee Admins Table - Modern Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/40 shadow-xl shadow-slate-200/50 overflow-hidden">
            {filteredAdmins.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Admin Info
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Department & Role
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Committee Info
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAdmins.map((admin) => (
                      <tr key={admin.user_id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-md">
                              <span className="text-white font-bold text-sm">
                                {admin.first_name?.[0]}{admin.last_name?.[0]}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800">
                                {admin.first_name} {admin.last_name}
                              </p>
                              <p className="text-xs text-slate-500">
                                {admin.employee_id}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Mail className="h-4 w-4 text-slate-400" />
                              {admin.email}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                              <Phone className="h-4 w-4 text-slate-400" />
                              {admin.phone_number}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Building className="h-4 w-4 text-slate-400" />
                              {admin.department}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                              <Briefcase className="h-4 w-4 text-slate-400" />
                              {admin.job_title}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            {admin.committee_level && (
                              <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-bold ${getCommitteeLevelColor(admin.committee_level)}`}>
                                {admin.committee_level}
                              </span>
                            )}
                            {admin.max_loan_amount && (
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <DollarSign className="h-4 w-4 text-emerald-500" />
                                <span className="font-semibold">Limit:</span>
                                <span>${admin.max_loan_amount.toLocaleString()}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                            admin.is_active 
                              ? 'bg-emerald-100 text-emerald-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {admin.is_active ? (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                Active
                              </>
                            ) : (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                Inactive
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/admin/loan-committee-admins/${admin.user_id}`}
                              className="p-2 rounded-xl text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            <Link
                              to={`/admin/loan-committee-admins/${admin.user_id}/edit`}
                              className="p-2 rounded-xl text-slate-500 hover:bg-violet-50 hover:text-violet-600 transition-colors"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => handleToggleStatus(admin.user_id, admin.is_active)}
                              disabled={actionLoading}
                              className={`p-2 rounded-xl transition-colors ${
                                admin.is_active 
                                  ? 'text-orange-500 hover:bg-orange-50 hover:text-orange-600' 
                                  : 'text-emerald-500 hover:bg-emerald-50 hover:text-emerald-600'
                              }`}
                            >
                              {admin.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                            </button>
                            <button
                              onClick={() => {
                                setSelectedAdmin(admin)
                                setShowDeleteModal(true)
                              }}
                              disabled={actionLoading}
                              className="p-2 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-6 py-20 text-center">
                <div className="bg-slate-100 rounded-2xl p-5 w-20 h-20 mx-auto mb-5 flex items-center justify-center">
                  <Shield className="h-10 w-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">No loan committee admins found</h3>
                <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                  {searchTerm ? 'No admins match your search criteria.' : 'Start by creating your first loan committee administrator account.'}
                </p>
                <Link
                  to="/admin/loan-committee-admins/create"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-bold hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-500/25"
                >
                  <UserPlus className="h-5 w-5" />
                  Create First Committee Admin
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal - Modern */}
      {showDeleteModal && selectedAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => {
              setShowDeleteModal(false)
              setSelectedAdmin(null)
            }}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 border border-slate-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-2xl bg-red-50">
                <Trash2 className="h-7 w-7 text-red-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Delete Committee Admin</h3>
                <p className="text-sm text-slate-500">This action cannot be undone</p>
              </div>
            </div>
            
            <div className="mb-8 p-4 bg-slate-50 rounded-2xl">
              <p className="text-slate-700 font-medium">
                Are you sure you want to delete <span className="text-slate-900 font-bold">{selectedAdmin.first_name} {selectedAdmin.last_name}</span>?
              </p>
              <p className="text-sm text-slate-500 mt-2">
                Employee ID: <span className="font-semibold text-slate-700">{selectedAdmin.employee_id}</span>
              </p>
              {selectedAdmin.committee_level && (
                <p className="text-sm text-slate-500">
                  Committee Level: <span className="font-semibold text-slate-700">{selectedAdmin.committee_level}</span>
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setSelectedAdmin(null)
                }}
                disabled={actionLoading}
                className="flex-1 px-5 py-3 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="flex-1 px-5 py-3 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-500/25 disabled:opacity-50"
              >
                {actionLoading ? 'Deleting...' : 'Delete Admin'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LoanCommitteeAdminManagement
