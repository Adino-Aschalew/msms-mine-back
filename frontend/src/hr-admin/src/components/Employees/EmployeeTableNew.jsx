import { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  ArrowUpDown,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign
} from 'lucide-react';
import { format } from 'date-fns';

// Modal Components
import EmployeeModalNew from './EmployeeModalNew';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import ViewEmployeeModal from './ViewEmployeeModal';

export default function EmployeeTable({ employees, onDelete, onUpdate }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal States
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredData = useMemo(() => {
    let filtered = [...employees];

    if (searchTerm) {
      filtered = filtered.filter(emp => 
        `${emp.first_name || ''} ${emp.last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employee_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (departmentFilter !== 'All') {
      filtered = filtered.filter(emp => emp.department === departmentFilter);
    }

    if (statusFilter !== 'All') {
      filtered = filtered.filter(emp => emp.employment_status === statusFilter);
    }

    filtered.sort((a, b) => {
      let valA = a[sortConfig.key];
      let valB = b[sortConfig.key];
      
      // Handle special case for name field
      if (sortConfig.key === 'name') {
        valA = `${a.first_name || ''} ${a.last_name || ''}`.trim();
        valB = `${b.first_name || ''} ${b.last_name || ''}`.trim();
      }
      
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [searchTerm, departmentFilter, statusFilter, sortConfig, employees]);

  const pageCount = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800 border-green-200';
      case 'ON_LEAVE': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'INACTIVE': return 'bg-red-100 text-red-800 border-red-200';
      case 'PROBATION': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'TERMINATED': return 'bg-red-100 text-red-800 border-red-200';
      case 'Active': return 'bg-green-100 text-green-800 border-green-200';
      case 'On Leave': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Inactive': return 'bg-red-100 text-red-800 border-red-200';
      case 'Probation': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPerformanceColor = (score) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 75) return 'bg-blue-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Handlers
  const openView = (emp) => {
    setSelectedEmployee(emp);
    setIsViewOpen(true);
  };

  const openEdit = (emp) => {
    setSelectedEmployee(emp);
    setIsEditOpen(true);
  };

  const openDelete = (emp) => {
    setSelectedEmployee(emp);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    onDelete(selectedEmployee.id);
    setIsDeleteOpen(false);
  };

  const departments = ['All', 'Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Design', 'Product', 'Operations', 'Customer Support', 'Legal'];
  const statuses = ['All', 'Active', 'On Leave', 'Probation', 'Inactive'];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg overflow-hidden">
      {/* Table Toolbar */}
      <div className="p-6 border-b border-gray-200 dark:border-slate-700">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search employees..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <select 
              value={departmentFilter}
              onChange={(e) => { setDepartmentFilter(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept === 'All' ? 'All Departments' : dept}</option>
              ))}
            </select>
            
            <select 
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              {statuses.map(status => (
                <option key={status} value={status}>{status === 'All' ? 'All Statuses' : status}</option>
              ))}
            </select>
            
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700" onClick={() => handleSort('name')}>
                <div className="flex items-center gap-2">
                  Employee <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700" onClick={() => handleSort('department')}>
                <div className="flex items-center gap-2">
                  Department <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700" onClick={() => handleSort('status')}>
                <div className="flex items-center gap-2">
                  Status <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700" onClick={() => handleSort('salary')}>
                <div className="flex items-center gap-2">
                  Salary <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Join Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-slate-700">
            {paginatedData.length > 0 ? (
              paginatedData.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                          {emp.first_name?.charAt(0) || emp.last_name?.charAt(0) || 'E'}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {emp.first_name && emp.last_name ? `${emp.first_name} ${emp.last_name}` : emp.first_name || emp.last_name || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {emp.employee_id || emp.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {emp.job_role || emp.role}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {emp.department || 'N/A'} • {emp.type}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Mail className="w-3 h-3 mr-1" />
                        {emp.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Phone className="w-3 h-3 mr-1" />
                        {emp.phone}
                      </div>
                      {emp.address && (
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <MapPin className="w-3 h-3 mr-1" />
                          {emp.address}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(emp.employment_status)}`}>
                      {emp.employment_status || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      ${emp.salary?.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Calendar className="w-3 h-3 mr-1" />
                      {emp.hire_date ? format(new Date(emp.hire_date), 'MMM dd, yyyy') : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => openView(emp)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => openEdit(emp)}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => openDelete(emp)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                      <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-900 dark:text-white font-medium">No employees found</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {paginatedData.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-700 flex items-center justify-between">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing <span className="font-medium">{((currentPage - 1) * itemsPerPage + 1)}</span> to{' '}
            <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> of{' '}
            <span className="font-medium">{filteredData.length}</span> results
          </div>
          <div className="flex items-center gap-2">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className="p-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(pageCount, 5) }).map((_, i) => {
                const pageNum = i + 1;
                const isActive = currentPage === pageNum;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-blue-500 text-white' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button 
              disabled={currentPage === pageCount || pageCount === 0}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, pageCount))}
              className="p-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <ViewEmployeeModal 
        isOpen={isViewOpen} 
        onClose={() => setIsViewOpen(false)} 
        employee={selectedEmployee} 
      />
      
      <EmployeeModalNew 
        isOpen={isEditOpen} 
        onClose={() => setIsEditOpen(false)} 
        onSave={onUpdate}
        employee={selectedEmployee}
      />
      
      <DeleteConfirmationModal 
        isOpen={isDeleteOpen} 
        onClose={() => setIsDeleteOpen(false)} 
        onConfirm={confirmDelete}
        employeeName={selectedEmployee?.name}
      />
    </div>
  );
}
