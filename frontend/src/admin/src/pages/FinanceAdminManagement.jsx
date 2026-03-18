import React, { useState } from 'react';
import { 
  Users,
  UserPlus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Shield,
  Lock,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Settings,
  Activity
} from 'lucide-react';
import Modal from '../components/common/Modal';
import AddFinanceAdminForm from '../components/common/AddFinanceAdminForm';

const FinanceAdminManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const itemsPerPage = 10;

  const [financeAdmins, setFinanceAdmins] = useState([
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@company.com',
      role: 'finance_admin',
      department: 'Finance',
      permissions: ['payroll', 'budgets', 'reports', 'transactions'],
      status: 'active',
      lastLogin: '2024-03-15 14:30',
      createdDate: '2024-01-15',
      managedUsers: 45,
      approvedTransactions: 1247
    },
    {
      id: 2,
      name: 'Michael Chen',
      email: 'michael.chen@company.com',
      role: 'payroll_admin',
      department: 'HR',
      permissions: ['payroll', 'employees'],
      status: 'active',
      lastLogin: '2024-03-15 16:45',
      createdDate: '2024-01-20',
      managedUsers: 89,
      approvedTransactions: 892
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      email: 'emily.rodriguez@company.com',
      role: 'budget_admin',
      department: 'Finance',
      permissions: ['budgets', 'reports'],
      status: 'active',
      lastLogin: '2024-03-15 11:20',
      createdDate: '2024-02-01',
      managedUsers: 12,
      approvedTransactions: 156
    },
    {
      id: 4,
      name: 'David Kim',
      email: 'david.kim@company.com',
      role: 'audit_admin',
      department: 'Compliance',
      permissions: ['reports', 'audit', 'transactions'],
      status: 'active',
      lastLogin: '2024-03-15 09:15',
      createdDate: '2024-02-10',
      managedUsers: 0,
      approvedTransactions: 2341
    },
    {
      id: 5,
      name: 'Lisa Thompson',
      email: 'lisa.thompson@company.com',
      role: 'finance_admin',
      department: 'Finance',
      permissions: ['payroll', 'budgets', 'reports'],
      status: 'inactive',
      lastLogin: '2024-03-10 16:30',
      createdDate: '2024-02-15',
      managedUsers: 23,
      approvedTransactions: 567
    },
    {
      id: 6,
      name: 'James Wilson',
      email: 'james.wilson@company.com',
      role: 'transaction_admin',
      department: 'Finance',
      permissions: ['transactions', 'reports'],
      status: 'suspended',
      lastLogin: '2024-03-08 13:45',
      createdDate: '2024-02-20',
      managedUsers: 0,
      approvedTransactions: 189
    }
  ]);

  const filteredAdmins = financeAdmins.filter(admin => {
    const matchesSearch = admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         admin.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         admin.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || admin.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || admin.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalPages = Math.ceil(filteredAdmins.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAdmins = filteredAdmins.slice(startIndex, startIndex + itemsPerPage);

  const openModal = (admin, modalType) => {
    setSelectedAdmin(admin);
    setActiveModal(modalType);
    if (modalType === 'edit') {
      setEditFormData({
        name: admin.name,
        email: admin.email,
        role: admin.role,
        department: admin.department,
        permissions: admin.permissions,
        status: admin.status
      });
    }
  };

  const closeModal = () => {
    setSelectedAdmin(null);
    setActiveModal(null);
    setEditFormData({});
  };

  const handleAction = () => {
    switch (activeModal) {
      case 'delete':
        setFinanceAdmins(prev => prev.filter(admin => admin.id !== selectedAdmin.id));
        break;
      case 'suspend':
        setFinanceAdmins(prev => prev.map(admin => 
          admin.id === selectedAdmin.id 
            ? { ...admin, status: 'suspended' }
            : admin
        ));
        break;
      case 'activate':
        setFinanceAdmins(prev => prev.map(admin => 
          admin.id === selectedAdmin.id 
            ? { ...admin, status: 'active' }
            : admin
        ));
        break;
      case 'edit':
        setFinanceAdmins(prev => prev.map(admin => 
          admin.id === selectedAdmin.id 
            ? { ...admin, ...editFormData }
            : admin
        ));
        break;
    }
    closeModal();
  };

  const handleAddAdmin = (adminData) => {
    const newAdmin = {
      id: financeAdmins.length + 1,
      name: `${adminData.firstName} ${adminData.lastName}`,
      email: adminData.email,
      role: adminData.role,
      department: adminData.department,
      permissions: adminData.permissions,
      status: adminData.status || 'active',
      lastLogin: null,
      createdDate: new Date().toISOString().split('T')[0],
      managedUsers: 0,
      approvedTransactions: 0
    };
    
    setFinanceAdmins(prev => [...prev, newAdmin]);
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'finance_admin': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'payroll_admin': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'budget_admin': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'audit_admin': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'transaction_admin': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      case 'inactive': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
      case 'suspended': return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
      default: return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400';
    }
  };

  const formatRole = (role) => {
    return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Finance Admin Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage finance administrators, roles, and permissions
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Add Admin
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Admins</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{financeAdmins.length}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
              <p className="text-2xl font-bold text-green-600">
                {financeAdmins.filter(a => a.status === 'active').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Inactive</p>
              <p className="text-2xl font-bold text-gray-600">
                {financeAdmins.filter(a => a.status === 'inactive').length}
              </p>
            </div>
            <XCircle className="h-8 w-8 text-gray-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Suspended</p>
              <p className="text-2xl font-bold text-red-600">
                {financeAdmins.filter(a => a.status === 'suspended').length}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search admins..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Roles</option>
            <option value="finance_admin">Finance Admin</option>
            <option value="payroll_admin">Payroll Admin</option>
            <option value="budget_admin">Budget Admin</option>
            <option value="audit_admin">Audit Admin</option>
            <option value="transaction_admin">Transaction Admin</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Admins Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permissions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedAdmins.map((admin) => (
                <tr key={admin.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{admin.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{admin.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(admin.role)}`}>
                      {formatRole(admin.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {admin.department}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {admin.permissions.slice(0, 2).map((permission, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300 rounded text-xs"
                        >
                          {permission}
                        </span>
                      ))}
                      {admin.permissions.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300 rounded text-xs">
                          +{admin.permissions.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(admin.status)}`}>
                      {admin.status.charAt(0).toUpperCase() + admin.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {admin.lastLogin || 'Never'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openModal(admin, 'view')}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openModal(admin, 'edit')}
                        className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openModal(admin, 'delete')}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredAdmins.length)} of{' '}
              {filteredAdmins.length} results
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Admin Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Finance Admin"
      >
        <AddFinanceAdminForm
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleAddAdmin}
        />
      </Modal>

      {/* Action Modals */}
      {activeModal && selectedAdmin && (
        <Modal
          isOpen={true}
          onClose={closeModal}
          title={`${activeModal.charAt(0).toUpperCase() + activeModal.slice(1)} Admin`}
        >
          <div className="p-6">
            {activeModal === 'view' && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                  <p className="text-gray-900 dark:text-white">{selectedAdmin.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  <p className="text-gray-900 dark:text-white">{selectedAdmin.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Role</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(selectedAdmin.role)}`}>
                    {formatRole(selectedAdmin.role)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Managed Users</p>
                  <p className="text-gray-900 dark:text-white">{selectedAdmin.managedUsers}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Approved Transactions</p>
                  <p className="text-gray-900 dark:text-white">{selectedAdmin.approvedTransactions}</p>
                </div>
              </div>
            )}
            
            {activeModal === 'delete' && (
              <div>
                <p className="text-gray-900 dark:text-white mb-4">
                  Are you sure you want to delete {selectedAdmin.name}? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAction}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
            
            {activeModal === 'suspend' && (
              <div>
                <p className="text-gray-900 dark:text-white mb-4">
                  Are you sure you want to suspend {selectedAdmin.name}?
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAction}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                  >
                    Suspend
                  </button>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default FinanceAdminManagement;
