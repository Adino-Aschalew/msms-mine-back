import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import EmployeeTableNew from '../components/Employees/EmployeeTableNew';
import EmployeeModalNew from '../components/Employees/EmployeeModalNew';
import { hrAPI } from '../../../shared/services/hrAPI';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await hrAPI.getAllEmployees(1, 1000); // Get all employees for now
      setEmployees(Array.isArray(data) ? data : (data.data || []));
    } catch (err) {
      setError('Failed to fetch employees');
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async (newEmployee) => {
    try {
      const response = await hrAPI.createEmployeeProfile(newEmployee);
      if (response.success) {
        await fetchEmployees(); // Refresh the list
        setIsModalOpen(false);
        
        // Show success message with default password
        const defaultPassword = response.data?.employee?.defaultPassword || 'BIT##123';
        alert(`Employee created successfully!\n\nDefault Password: ${defaultPassword}\n\nThe employee will receive an email with their login credentials.`);
      }
    } catch (err) {
      console.error('Error adding employee:', err);
      setError('Failed to add employee');
    }
  };

  const handleUpdateEmployee = async (updatedEmployee) => {
    try {
      await hrAPI.updateEmployeeProfile(updatedEmployee.id, updatedEmployee);
      await fetchEmployees(); // Refresh the list
      setSuccessMessage('Employee profile updated successfully!');
    } catch (err) {
      console.error('Error updating employee:', err);
      setError('Failed to update employee');
    }
  };

  const handleDeleteEmployee = async (id) => {
    try {
      await hrAPI.updateEmploymentStatus(id, 'TERMINATED');
      await fetchEmployees(); // Refresh the list
    } catch (err) {
      console.error('Error deleting employee:', err);
      setError('Failed to delete employee');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-red-800">{error}</p>
            <button 
              onClick={fetchEmployees}
              className="mt-2 text-sm text-red-600 underline hover:text-red-800"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Employees Directory</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your team members, track roles, and organize departments.</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm font-medium text-sm w-full sm:w-auto justify-center"
        >
          <Plus size={18} />
          <span>Add Employee</span>
        </button>
      </div>
      
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
          <div className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
            <div className="bg-white/20 p-1 rounded-full">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="font-medium text-sm">{successMessage}</span>
          </div>
        </div>
      )}
      
      <div className="w-full">
        <EmployeeTableNew 
          employees={employees} 
          onDelete={handleDeleteEmployee}
          onUpdate={handleUpdateEmployee}
        />
      </div>

      <EmployeeModalNew 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleAddEmployee}
      />
    </div>
  );
}
