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
  ArrowUpDown
} from 'lucide-react';
import { format } from 'date-fns';


import EmployeeModal from './EmployeeModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import ViewEmployeeModal from './ViewEmployeeModal';

export default function EmployeeTable({ employees, onDelete, onUpdate }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  
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
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (departmentFilter !== 'All') {
      filtered = filtered.filter(emp => emp.department === departmentFilter);
    }

    if (statusFilter !== 'All') {
      filtered = filtered.filter(emp => emp.status === statusFilter);
    }

    filtered.sort((a, b) => {
      let valA = a[sortConfig.key];
      let valB = b[sortConfig.key];
      
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
      case 'Active': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30';
      case 'On Leave': return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-500/30';
      case 'Inactive': return 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border-rose-200 dark:border-rose-500/30';
      case 'Probation': return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border-blue-200 dark:border-blue-500/30';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400 border-slate-200 dark:border-slate-500/30';
    }
  };

  const getPerformanceColor = (score) => {
    if (score >= 90) return 'bg-primary-500';
    if (score >= 75) return 'bg-emerald-500';
    if (score >= 60) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  
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

  return (
    <div className="glass-card rounded-2xl shadow-premium overflow-hidden flex flex-col transition-all duration-500">
      {}
      <div className="p-5 md:p-6 border-b border-sidebar-border/50 dark:border-white/5 flex flex-col md:flex-row gap-5 justify-between items-center bg-slate-50/20 dark:bg-transparent">
        <div className="relative w-full md:max-w-md group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-all duration-300 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search employees..." 
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl text-sm outline-none focus:border-primary-500/50 focus:bg-white dark:focus:bg-slate-900/50 transition-all duration-300 shadow-sm placeholder:text-slate-400/70"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-100/50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm">
              <Filter className="w-4 h-4 text-slate-400" />
              <select 
                value={departmentFilter}
                onChange={(e) => { setDepartmentFilter(e.target.value); setCurrentPage(1); }}
                className="bg-transparent border-none text-sm font-medium outline-none focus:ring-0 appearance-none pr-6 cursor-pointer"
              >
                <option value="All">All Departments</option>
                <option value="Engineering">Engineering</option>
                <option value="Sales">Sales</option>
                <option value="Marketing">Marketing</option>
                <option value="HR">HR</option>
                <option value="Design">Design</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-100/50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm">
              <select 
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="bg-transparent border-none text-sm font-medium outline-none focus:ring-0 appearance-none pr-6 cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Probation">Probation</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
          
          <button className="flex items-center gap-2.5 px-4 py-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-white/10 hover:border-primary-500/30 transition-all shadow-sm ml-auto md:ml-0 group">
            <Download className="w-4 h-4 text-slate-400 group-hover:text-primary-500 transition-colors" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-slate-50/50 dark:bg-white/[0.02] text-slate-500 dark:text-slate-400 border-b border-sidebar-border/50 dark:border-white/5">
            <tr>
              <th className="px-8 py-5 font-bold text-[10px] uppercase tracking-[0.1em] cursor-pointer hover:text-primary-500 transition-all group" onClick={() => handleSort('name')}>
                <div className="flex items-center gap-2">
                  Employee <ArrowUpDown className="w-3 h-3 opacity-30 group-hover:opacity-100 transition-opacity" />
                </div>
              </th>
              <th className="px-6 py-5 font-bold text-[10px] uppercase tracking-[0.1em] cursor-pointer hover:text-primary-500 transition-all group" onClick={() => handleSort('department')}>
                <div className="flex items-center gap-2">
                  Role & Dept <ArrowUpDown className="w-3 h-3 opacity-30 group-hover:opacity-100 transition-opacity" />
                </div>
              </th>
              <th className="px-6 py-5 font-bold text-[10px] uppercase tracking-[0.1em] cursor-pointer hover:text-primary-500 transition-all group" onClick={() => handleSort('status')}>
                <div className="flex items-center gap-2">
                  Status <ArrowUpDown className="w-3 h-3 opacity-30 group-hover:opacity-100 transition-opacity" />
                </div>
              </th>
              <th className="px-6 py-5 font-bold text-[10px] uppercase tracking-[0.1em] cursor-pointer hover:text-primary-500 transition-all group" onClick={() => handleSort('salary')}>
                <div className="flex items-center gap-2">
                  Salary <ArrowUpDown className="w-3 h-3 opacity-30 group-hover:opacity-100 transition-opacity" />
                </div>
              </th>
              <th className="px-6 py-5 font-bold text-[10px] uppercase tracking-[0.1em]">Performance</th>
              <th className="px-8 py-5 font-bold text-[10px] uppercase tracking-[0.1em] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sidebar-border/50 dark:divide-white/5">
            {paginatedData.length > 0 ? (
              paginatedData.map((emp) => (
                <tr key={emp.id} className="hover:bg-primary-500/[0.02] dark:hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img src={emp.avatar} alt={emp.name} className="w-11 h-11 rounded-xl border border-slate-200 dark:border-white/10 object-cover bg-slate-100 dark:bg-slate-800 transition-transform group-hover:scale-105" />
                        <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 ${emp.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                      </div>
                      <div>
                        <div className="font-bold text-foreground leading-none mb-1.5 group-hover:text-primary-500 transition-colors">{emp.name}</div>
                        <div className="text-muted-foreground text-[11px] font-medium tracking-wide">{emp.id} • {emp.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-foreground font-bold mb-1">{emp.role}</div>
                    <div className="text-muted-foreground text-[11px] font-medium flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-500/50"></span>
                      {emp.department} • {emp.type}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all hover:scale-105 cursor-default ${getStatusColor(emp.status)}`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-foreground font-extrabold text-base tracking-tight mb-1">${emp.salary.toLocaleString()}</div>
                    <div className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest opacity-60">
                      Since {format(new Date(emp.dateJoined), 'MMM yyyy')}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden w-24">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ease-out ${getPerformanceColor(emp.performance)} shadow-[0_0_10px_rgba(var(--primary),0.3)]`} 
                          style={{ width: `${emp.performance}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-black text-foreground w-8">{emp.performance}%</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                      <button 
                        onClick={() => openView(emp)}
                        className="p-2 text-slate-400 hover:text-primary-500 hover:bg-primary-500/10 rounded-xl transition-all shadow-sm hover:shadow-primary-500/10" title="View Profile">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => openEdit(emp)}
                        className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-all shadow-sm hover:shadow-emerald-500/10" title="Edit">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => openDelete(emp)}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all shadow-sm hover:shadow-rose-500/10" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-20 text-center text-muted-foreground bg-slate-50/10">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-6">
                      <Search className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                    </div>
                    <p className="font-bold text-lg text-foreground mb-1">No employees found</p>
                    <p className="text-sm opacity-60">Try adjusting your filters or search terms.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {}
      <div className="p-5 md:p-6 border-t border-sidebar-border/50 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50/20 dark:bg-transparent">
        <div className="order-2 sm:order-1">
          Showing <span className="text-foreground">{((currentPage - 1) * itemsPerPage + 1).toString().padStart(2, '0')}</span> - <span className="text-foreground">{Math.min(currentPage * itemsPerPage, filteredData.length).toString().padStart(2, '0')}</span> of <span className="text-foreground">{filteredData.length.toString().padStart(2, '0')}</span>
        </div>
        <div className="flex items-center gap-2 order-1 sm:order-2">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-1.5 px-2">
            {Array.from({ length: pageCount }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-8 h-8 flex items-center justify-center rounded-xl text-[11px] font-black transition-all duration-300 ${
                  currentPage === i + 1 
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30 scale-110' 
                    : 'text-slate-400 hover:text-foreground hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                {(i + 1).toString().padStart(2, '0')}
              </button>
            ))}
          </div>

          <button 
            disabled={currentPage === pageCount || pageCount === 0}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, pageCount))}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {}
      <ViewEmployeeModal 
        isOpen={isViewOpen} 
        onClose={() => setIsViewOpen(false)} 
        employee={selectedEmployee} 
      />
      
      <EmployeeModal 
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
