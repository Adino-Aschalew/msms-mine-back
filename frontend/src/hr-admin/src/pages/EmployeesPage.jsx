import { useState } from 'react';
import { Plus } from 'lucide-react';
import EmployeeTableNew from '../components/Employees/EmployeeTableNew';
import EmployeeModalNew from '../components/Employees/EmployeeModalNew';
import { employeesData as initialEmployees } from '../components/Employees/MockDataNew';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState(initialEmployees);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddEmployee = (newEmployee) => {
    setEmployees(prev => [newEmployee, ...prev]);
  };

  const handleUpdateEmployee = (updatedEmployee) => {
    setEmployees(prev => prev.map(emp => emp.id === updatedEmployee.id ? updatedEmployee : emp));
  };

  const handleDeleteEmployee = (id) => {
    setEmployees(prev => prev.filter(emp => emp.id !== id));
  };

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
