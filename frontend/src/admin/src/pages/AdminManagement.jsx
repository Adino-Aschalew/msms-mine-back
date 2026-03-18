import React, { useState } from 'react';
import AdminManagementTable from '../components/common/AdminManagementTable';
import Modal from '../components/common/Modal';
import AddAdminForm from '../components/common/AddAdminForm';

const AdminManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [admins, setAdmins] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Finance Admin', status: 'active', createdDate: '2024-01-15' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Admin', status: 'active', createdDate: '2024-01-20' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Loan Committee', status: 'inactive', createdDate: '2024-02-01' },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Admin', status: 'active', createdDate: '2024-02-10' },
    { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', role: 'Finance Admin', status: 'suspended', createdDate: '2024-02-15' },
    { id: 6, name: 'Diana Miller', email: 'diana@example.com', role: 'Admin', status: 'active', createdDate: '2024-02-20' },
    { id: 7, name: 'Edward Davis', email: 'edward@example.com', role: 'HR Admin', status: 'active', createdDate: '2024-03-01' },
    { id: 8, name: 'Fiona Garcia', email: 'fiona@example.com', role: 'HR Admin', status: 'inactive', createdDate: '2024-03-05' },
    { id: 9, name: 'George Martinez', email: 'george@example.com', role: 'Admin', status: 'active', createdDate: '2024-03-10' },
    { id: 10, name: 'Helen Rodriguez', email: 'helen@example.com', role: 'Loan Committee', status: 'active', createdDate: '2024-03-15' },
    { id: 11, name: 'Ian Thompson', email: 'ian@example.com', role: 'Finance Admin', status: 'active', createdDate: '2024-03-20' },
    { id: 12, name: 'Julia White', email: 'julia@example.com', role: 'HR Admin', status: 'active', createdDate: '2024-03-25' },
  ]);


  const handleAddAdmin = (adminData) => {
    const newAdmin = {
      id: admins.length + 1,
      name: `${adminData.firstName} ${adminData.lastName}`,
      email: adminData.email,
      role: adminData.role.replace('_', ' ').split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' '),
      status: adminData.status,
      createdDate: new Date().toISOString().split('T')[0]
    };
    
    setAdmins(prev => [...prev, newAdmin]);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Management</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage system administrators and their permissions.</p>
      </div>

      <div>
        <AdminManagementTable 
          admins={admins} 
          onAddAdmin={() => setIsModalOpen(true)}
          setAdmins={setAdmins}
        />
      </div>

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
