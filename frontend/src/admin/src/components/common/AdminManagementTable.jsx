import React, { useState } from 'react';
import { Search, Filter, Eye, Edit, Ban, Trash2, Download, Plus, ChevronLeft, ChevronRight, ChevronDown, X, User, Mail, Calendar, Shield } from 'lucide-react';

const AdminManagementTable = ({ admins, onAddAdmin, setAdmins }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [activeModal, setActiveModal] = useState(null); // 'view', 'edit', 'delete', 'suspend'
  const [editFormData, setEditFormData] = useState({});
  const itemsPerPage = 10;

  const filteredAdmins = admins.filter(admin => {
    const matchesSearch = admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         admin.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || admin.status === statusFilter;
    return matchesSearch && matchesStatus;
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
        // Remove admin from the list
        setAdmins(prev => prev.filter(admin => admin.id !== selectedAdmin.id));
        break;
      case 'suspend':
        // Update admin status to suspended
        setAdmins(prev => prev.map(admin => 
          admin.id === selectedAdmin.id 
            ? { ...admin, status: 'suspended' }
            : admin
        ));
        break;
      case 'edit':
        // Update admin information
        setAdmins(prev => prev.map(admin => 
          admin.id === selectedAdmin.id 
            ? { ...admin, ...editFormData }
            : admin
        ));
        break;
      default:
        break;
    }
    closeModal();
  };

  const handleEditFormChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleExportData = () => {
    // Get filtered data based on current search and status filter
    const exportData = filteredAdmins.map(admin => ({
      'ID': admin.id,
      'Name': admin.name,
      'Email': admin.email,
      'Role': admin.role,
      'Status': admin.status,
      'Created Date': admin.createdDate
    }));

    // Convert to CSV
    const csvHeaders = Object.keys(exportData[0]).join(',');
    const csvData = exportData.map(row => 
      Object.values(row).map(value => `"${value}"`).join(',')
    ).join('\n');
    const csv = `${csvHeaders}\n${csvData}`;

    // Create download link
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `admin_data_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Admin Management</h2>
        <div className="flex gap-3">
          <button
            onClick={onAddAdmin}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Admin
          </button>
          <button onClick={handleExportData} className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-medium hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Data
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search admins by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 shadow-sm hover:shadow-md dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-400 dark:focus:ring-blue-400/20"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none pl-10 pr-10 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400/20"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  #
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Admin Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Created Date
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {paginatedAdmins.map((admin, index) => (
                <tr key={admin.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                      {startIndex + index + 1}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                        <span className="text-sm font-bold text-white">
                          {admin.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {admin.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                      {admin.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${
                      admin.role === 'Super Admin' || admin.role === 'super_admin'
                        ? 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700'
                        : admin.role === 'Admin' || admin.role === 'admin'
                        ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700'
                        : admin.role === 'Loan Committee' || admin.role === 'loan_committee'
                        ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700'
                        : admin.role === 'Finance Admin' || admin.role === 'finance_admin'
                        ? 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700'
                        : admin.role === 'HR Admin' || admin.role === 'hr_admin'
                        ? 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700'
                        : 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-700'
                    }`}>
                      {admin.role.replace('_', ' ')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${
                      admin.status === 'active'
                        ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700'
                        : admin.status === 'inactive'
                        ? 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-700'
                        : 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700'
                    }`}>
                      <span className={`w-2 h-2 rounded-full mr-2 ${
                        admin.status === 'active'
                          ? 'bg-green-500'
                          : admin.status === 'inactive'
                          ? 'bg-gray-500'
                          : 'bg-red-500'
                      }`}></span>
                      {admin.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                      {admin.createdDate}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => openModal(admin, 'view')}
                        className="group relative p-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-200 hover:scale-105 hover:shadow-md"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                          View Details
                        </span>
                      </button>
                      <button 
                        onClick={() => openModal(admin, 'edit')}
                        className="group relative p-2.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-all duration-200 hover:scale-105 hover:shadow-md"
                      >
                        <Edit className="h-4 w-4" />
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                          Edit Admin
                        </span>
                      </button>
                      <button 
                        onClick={() => openModal(admin, 'suspend')}
                        className="group relative p-2.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-xl hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-all duration-200 hover:scale-105 hover:shadow-md"
                      >
                        <Ban className="h-4 w-4" />
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                          Suspend Admin
                        </span>
                      </button>
                      <button 
                        onClick={() => openModal(admin, 'delete')}
                        className="group relative p-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-200 hover:scale-105 hover:shadow-md"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                          Delete Admin
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              Showing <span className="text-gray-900 dark:text-white font-semibold">{startIndex + 1}</span>–<span className="text-gray-900 dark:text-white font-semibold">{Math.min(startIndex + itemsPerPage, filteredAdmins.length)}</span> of <span className="text-gray-900 dark:text-white font-semibold">{filteredAdmins.length}</span> results
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="h-9 w-9 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 flex items-center justify-center"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`h-9 w-9 rounded-lg font-medium transition-colors duration-150 flex items-center justify-center ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              {totalPages > 5 && (
                <>
                  <span className="flex items-center px-2 text-gray-500 dark:text-gray-400">...</span>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className={`h-9 w-9 rounded-lg font-medium transition-colors duration-150 flex items-center justify-center ${
                      currentPage === totalPages
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {totalPages}
                  </button>
                </>
              )}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="h-9 w-9 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 flex items-center justify-center"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {activeModal && selectedAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-sm" 
            onClick={closeModal} 
          />
          <div className="relative z-50 w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className={`px-6 py-4 ${
              activeModal === 'delete' ? 'bg-gradient-to-r from-red-600 to-red-700' :
              activeModal === 'suspend' ? 'bg-gradient-to-r from-yellow-600 to-yellow-700' :
              activeModal === 'edit' ? 'bg-gradient-to-r from-green-600 to-green-700' :
              'bg-gradient-to-r from-blue-600 to-blue-700'
            }`}>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">
                  {activeModal === 'view' && 'View Admin Details'}
                  {activeModal === 'edit' && 'Edit Admin'}
                  {activeModal === 'delete' && 'Delete Admin'}
                  {activeModal === 'suspend' && 'Suspend Admin'}
                </h3>
                <button
                  onClick={closeModal}
                  className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 transition-colors duration-200 flex items-center justify-center"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>
            </div>
            
            {/* Modal Content */}
            <div className="p-6">
              {activeModal === 'view' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                      <span className="text-xl font-bold text-white">
                        {selectedAdmin.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedAdmin.name}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{selectedAdmin.role}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{selectedAdmin.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Created: {selectedAdmin.createdDate}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Shield className="h-4 w-4 text-gray-400" />
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedAdmin.status === 'active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : selectedAdmin.status === 'inactive'
                          ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                      }`}>
                        {selectedAdmin.status}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {(activeModal === 'delete' || activeModal === 'suspend') && (
                <div className="text-center space-y-4">
                  <div className={`h-16 w-16 rounded-full mx-auto flex items-center justify-center ${
                    activeModal === 'delete' ? 'bg-red-100' : 'bg-yellow-100'
                  }`}>
                    {activeModal === 'delete' ? (
                      <Trash2 className={`h-8 w-8 text-red-600`} />
                    ) : (
                      <Ban className={`h-8 w-8 text-yellow-600`} />
                    )}
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {activeModal === 'delete' ? 'Delete Admin Account' : 'Suspend Admin Account'}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Are you sure you want to {activeModal === 'delete' ? 'permanently delete' : 'suspend'} the admin account for <strong>{selectedAdmin.name}</strong>?
                    </p>
                    {activeModal === 'delete' && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        This action cannot be undone.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {activeModal === 'edit' && (
                <div className="space-y-4">
                  <div className="text-center">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Edit Admin Information</h4>
                    <p className="text-gray-600 dark:text-gray-400">Update the information for {selectedAdmin.name}</p>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                      <input
                        type="text"
                        value={editFormData.name || ''}
                        onChange={(e) => handleEditFormChange('name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                      <input
                        type="email"
                        value={editFormData.email || ''}
                        onChange={(e) => handleEditFormChange('email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                      <select
                        value={editFormData.role || ''}
                        onChange={(e) => handleEditFormChange('role', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="Admin">Admin</option>
                        <option value="Loan Committee">Loan Committee</option>
                        <option value="Finance Admin">Finance Admin</option>
                        <option value="HR Admin">HR Admin</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                      <select
                        value={editFormData.status || ''}
                        onChange={(e) => handleEditFormChange('status', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                  {activeModal === 'view' ? 'Close' : 'Cancel'}
                </button>
                {activeModal !== 'view' && (
                  <button
                    onClick={handleAction}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                      activeModal === 'delete' ? 'bg-red-600 text-white hover:bg-red-700' :
                      activeModal === 'suspend' ? 'bg-yellow-600 text-white hover:bg-yellow-700' :
                      'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {activeModal === 'delete' && 'Delete'}
                    {activeModal === 'suspend' && 'Suspend'}
                    {activeModal === 'edit' && 'Save Changes'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManagementTable;
