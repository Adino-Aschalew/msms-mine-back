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
      console.log('Fetching admins from API...');
      const response = await adminAPI.getAllUsers();
      console.log('AdminManagement API response:', response);
      console.log('Response type:', typeof response);
      console.log('Response success:', response?.success);
      console.log('Response data:', response?.data);
      
      // Handle the response format
      let adminUsers = [];
      if (response && response.success && response.data) {
        adminUsers = response.data;
        console.log('Using response.data array');
      } else if (response && Array.isArray(response)) {
        adminUsers = response;
        console.log('Using response as direct array');
      } else if (response && response.data && Array.isArray(response.data)) {
        adminUsers = response.data;
        console.log('Using response.data as array');
      } else {
        console.error('Unexpected response format:', response);
        console.error('Response keys:', response ? Object.keys(response) : 'null');
        setError('Failed to load administrators: Invalid data format');
        return;
      }
      
      console.log('Admin users from API:', adminUsers);
      console.log('Admin users count:', adminUsers.length);
      
      if (adminUsers.length === 0) {
        console.log('No admin users found, might be permission issue');
        setError('No administrators found or insufficient permissions');
        return;
      }
      
      const formattedAdmins = adminUsers.map(admin => ({
        id: admin.id,
        name: `${admin.first_name || ''} ${admin.last_name || ''}`.trim() || admin.employee_id || admin.username || 'Unknown',
        first_name: admin.first_name,
        last_name: admin.last_name,
        email: admin.email,
        role: admin.role,
        status: admin.is_active ? 'active' : 'suspended',
        createdDate: admin.created_at ? new Date(admin.created_at).toISOString().split('T')[0] : 'N/A'
      }));
      console.log('Formatted admins:', formattedAdmins);
      console.log('Formatted admins length:', formattedAdmins.length);
      setAdmins(formattedAdmins);
      setError(null); // Clear any previous error
    } catch (err) {
      console.error('Error fetching admins:', err);
      console.error('Error status:', err.response?.status);
      console.error('Error data:', err.response?.data);
      console.error('Error message:', err.message);
      
      if (err.response?.status === 401) {
        setError('Failed to load administrators: Authentication required');
      } else if (err.response?.status === 403) {
        setError('Failed to load administrators: Insufficient permissions');
      } else if (err.response?.status === 404) {
        setError('Failed to load administrators: Endpoint not found');
      } else {
        setError('Failed to load administrators: ' + (err.message || 'Unknown error'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async (adminData) => {
    
    
    
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
