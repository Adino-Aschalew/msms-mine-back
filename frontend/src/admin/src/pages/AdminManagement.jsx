import React, { useState, useEffect } from 'react';
import AdminManagementTable from '../components/common/AdminManagementTable';
import Modal from '../components/common/Modal';
import AddAdminForm from '../components/common/AddAdminForm';
import { adminAPI } from '../../../shared/services/adminAPI';

const AdminManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllAdmins();
      // Map backend fields to frontend table fields
      const formattedAdmins = (response.data || []).map(admin => ({
        id: admin.id,
        name: `${admin.first_name || ''} ${admin.last_name || ''}`.trim() || admin.employee_id,
        first_name: admin.first_name,
        last_name: admin.last_name,
        email: admin.email,
        role: admin.role,
        status: admin.is_active ? 'active' : 'suspended',
        createdDate: admin.created_at ? new Date(admin.created_at).toISOString().split('T')[0] : 'N/A'
      }));
      setAdmins(formattedAdmins);
    } catch (err) {
      console.error('Error fetching admins:', err);
      setError('Failed to load administrators');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async (adminData) => {
    // This will be handled by specific role creation if we use those, 
    // or we can add a generic createAdmin if needed.
    // For now, let's refresh the list after creation if the modal handles it.
    fetchAdmins();
    setIsModalOpen(false);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Management</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage system administrators and their permissions.</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-800">
          {error}
        </div>
      ) : (
        <div>
          <AdminManagementTable 
            admins={admins} 
            onAddAdmin={() => setIsModalOpen(true)}
            refreshData={fetchAdmins}
          />
        </div>
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Add New Admin"
      >
        <AddAdminForm 
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleAddAdmin}
        />
      </Modal>
    </div>
  );
};

export default AdminManagement;
