import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Settings, Activity, Shield, Database, AlertCircle, CheckCircle, XCircle, Eye, Edit, Trash2, Power, PowerOff } from 'lucide-react';
import { adminAPI } from '../../shared/services/adminAPI';

const AdminManagement = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState(null);
  const [adminStats, setAdminStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Admin lists
  const [hrAdmins, setHRAdmins] = useState([]);
  const [financeAdmins, setFinanceAdmins] = useState([]);
  const [regularAdmins, setRegularAdmins] = useState([]);
  const [loanCommitteeAdmins, setLoanCommitteeAdmins] = useState([]);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [adminType, setAdminType] = useState('');

  useEffect(() => {
    fetchDashboardData();
    fetchAdminStatistics();
  }, []);

  useEffect(() => {
    if (activeTab !== 'overview') {
      fetchAdminsByType(activeTab);
    }
  }, [activeTab]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getDashboard();
      setDashboardData(response.data);
    } catch (err) {
      setError('Failed to fetch dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminStatistics = async () => {
    try {
      const response = await adminAPI.getAdminStatistics();
      setAdminStats(response.data);
    } catch (err) {
      console.error('Admin stats error:', err);
    }
  };

  const fetchAdminsByType = async (type) => {
    try {
      setLoading(true);
      let response;
      
      switch (type) {
        case 'hr':
          response = await adminAPI.getHRAdmins();
          setHRAdmins(response.data);
          break;
        case 'finance':
          response = await adminAPI.getFinanceAdmins();
          setFinanceAdmins(response.data);
          break;
        case 'regular':
          response = await adminAPI.getRegularAdmins();
          setRegularAdmins(response.data);
          break;
        case 'loan-committee':
          response = await adminAPI.getLoanCommitteeAdmins();
          setLoanCommitteeAdmins(response.data);
          break;
        default:
          break;
      }
    } catch (err) {
      setError(`Failed to fetch ${type} admins`);
      console.error('Fetch admins error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (adminId, type, isActive) => {
    try {
      if (type === 'hr') {
        await isActive ? adminAPI.deactivateHRAdmin(adminId) : adminAPI.activateHRAdmin(adminId);
      } else if (type === 'finance') {
        await isActive ? adminAPI.deactivateFinanceAdmin(adminId) : adminAPI.activateFinanceAdmin(adminId);
      } else if (type === 'regular') {
        await isActive ? adminAPI.deactivateRegularAdmin(adminId) : adminAPI.activateRegularAdmin(adminId);
      } else if (type === 'loan-committee') {
        await isActive ? adminAPI.deactivateLoanCommitteeAdmin(adminId) : adminAPI.activateLoanCommitteeAdmin(adminId);
      }
      
      // Refresh the list
      fetchAdminsByType(activeTab);
    } catch (err) {
      setError('Failed to toggle admin status');
      console.error('Toggle status error:', err);
    }
  };

  const handleDeleteAdmin = async (adminId, type) => {
    if (!window.confirm('Are you sure you want to delete this admin? This action cannot be undone.')) {
      return;
    }

    try {
      if (type === 'hr') {
        await adminAPI.deleteHRAdmin(adminId);
      } else if (type === 'finance') {
        await adminAPI.deleteFinanceAdmin(adminId);
      } else if (type === 'regular') {
        await adminAPI.deleteRegularAdmin(adminId);
      } else if (type === 'loan-committee') {
        await adminAPI.deleteLoanCommitteeAdmin(adminId);
      }
      
      // Refresh the list
      fetchAdminsByType(activeTab);
    } catch (err) {
      setError('Failed to delete admin');
      console.error('Delete admin error:', err);
    }
  };

  const getAdminsByType = () => {
    switch (activeTab) {
      case 'hr': return hrAdmins;
      case 'finance': return financeAdmins;
      case 'regular': return regularAdmins;
      case 'loan-committee': return loanCommitteeAdmins;
      default: return [];
    }
  };

  const renderAdminTable = () => {
    const admins = getAdminsByType();
    
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (admins.length === 0) {
      return (
        <div className="text-center py-8">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">No {activeTab} admins found</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employee ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Department
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
            {admins.map((admin) => (
              <tr key={admin.user_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {admin.employee_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {admin.first_name} {admin.last_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {admin.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {admin.department || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    admin.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {admin.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleToggleStatus(admin.user_id, activeTab, admin.is_active)}
                      className={`inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded ${
                        admin.is_active
                          ? 'text-red-600 hover:text-red-900'
                          : 'text-green-600 hover:text-green-900'
                      }`}
                    >
                      {admin.is_active ? <PowerOff className="h-3 w-3 mr-1" /> : <Power className="h-3 w-3 mr-1" />}
                      {admin.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDeleteAdmin(admin.user_id, activeTab)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Settings },
    { id: 'hr', label: 'HR Admins', icon: Users },
    { id: 'finance', label: 'Finance Admins', icon: Database },
    { id: 'regular', label: 'Regular Admins', icon: Shield },
    { id: 'loan-committee', label: 'Loan Committee', icon: Activity },
  ];

  if (loading && !dashboardData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Management</h1>
        <p className="mt-2 text-gray-600">Manage system administrators and their permissions</p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="mr-2 h-5 w-5" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && dashboardData && (
          <div>
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Users className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                        <dd className="text-lg font-medium text-gray-900">{dashboardData.overview?.totalUsers || 0}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Shield className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Active HR Admins</dt>
                        <dd className="text-lg font-medium text-gray-900">{dashboardData.overview?.activeHRAdmins || 0}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Database className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Loan Committee</dt>
                        <dd className="text-lg font-medium text-gray-900">{dashboardData.overview?.activeLoanCommitteeAdmins || 0}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Activity className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Pending Applications</dt>
                        <dd className="text-lg font-medium text-gray-900">{dashboardData.overview?.pendingApplications || 0}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Statistics */}
            {adminStats && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Admin Statistics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{adminStats.total}</div>
                      <div className="text-sm text-gray-500">Total Admins</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{adminStats.active}</div>
                      <div className="text-sm text-gray-500">Active Admins</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{adminStats.inactive}</div>
                      <div className="text-sm text-gray-500">Inactive Admins</div>
                    </div>
                  </div>
                  
                  {adminStats.byRole && (
                    <div className="mt-6">
                      <h4 className="text-md font-medium text-gray-900 mb-3">Admins by Role</h4>
                      <div className="space-y-2">
                        {adminStats.byRole.map((roleStat) => (
                          <div key={roleStat.role} className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">{roleStat.role}</span>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium">{roleStat.count}</span>
                              <span className="text-xs text-green-600">({roleStat.active_count} active)</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab !== 'overview' && (
          <div>
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                {tabs.find(tab => tab.id === activeTab)?.label}
              </h2>
              <button
                onClick={() => {
                  setAdminType(activeTab);
                  setShowCreateModal(true);
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add {activeTab === 'hr' ? 'HR' : activeTab === 'finance' ? 'Finance' : activeTab === 'regular' ? 'Regular' : 'Loan Committee'} Admin
              </button>
            </div>
            
            {renderAdminTable()}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminManagement;
