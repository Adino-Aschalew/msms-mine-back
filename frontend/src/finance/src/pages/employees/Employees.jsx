import React, { useState } from 'react';
import { Search, UserPlus, Filter, Download, Mail, Phone, Calendar, DollarSign, TrendingUp, Users, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { financeAPI } from '../../../../shared/services/financeAPI';
import { useNotifications } from '../../contexts/NotificationContext';

const fmt = (n) => {
  if (n === null || n === undefined || n === '') return '—';
  const num = parseFloat(n);
  if (isNaN(num)) return '—';
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M ETB`;
  if (num >= 1_000)     return `${(num / 1_000).toFixed(1)}K ETB`;
  return `${num.toFixed(2)} ETB`;
};

const Employees = () => {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { addNotification } = useNotifications();
  const [exporting, setExporting] = useState(false);
  const [stats, setStats] = useState({ totalSalaries: 0, totalSavings: 0, activeCount: 0 });
  const [departments, setDepartments] = useState(['all']);

  React.useEffect(() => {
    fetchDepartments();
  }, []);

  React.useEffect(() => {
    fetchEmployees();
  }, [searchTerm, selectedDepartment]);

  const fetchDepartments = async () => {
    try {
      const response = await financeAPI.getDepartments();
      if (response && response.length > 0) {
        setDepartments(['all', ...response.map(d => d.name || d.department)]);
      }
    } catch (err) {
      setDepartments(['all', 'Engineering', 'Sales', 'Marketing', 'HR', 'Finance']);
    }
  };

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await financeAPI.getEmployees({
        search: searchTerm || undefined,
        department: selectedDepartment === 'all' ? undefined : selectedDepartment,
        page: 1,
        limit: 500
      });
      
      const list = response?.employees || [];
      setEmployees(list);
      
      
      const salary = list.reduce((sum, emp) => sum + parseFloat(emp.salary || 0), 0);
      const savings = list.reduce((sum, emp) => sum + parseFloat(emp.savingsBalance || 0), 0);
      const active = list.filter(emp => emp.status === 'active' || emp.is_active || emp.account_status === 'ACTIVE').length;
      
      setStats({ totalSalaries: salary, totalSavings: savings, activeCount: active });
    } catch (err) {
      setError('Failed to fetch employees');
      addNotification({ type: 'error', title: 'Error', message: 'Failed to synchronize employee data' });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const response = await financeAPI.exportEmployees({
        search: searchTerm || undefined,
        department: selectedDepartment === 'all' ? undefined : selectedDepartment
      });
      
      
      const blob = new Blob([response.data || response], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `employees_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      addNotification({ type: 'success', title: 'Success', message: 'Employee list exported successfully' });
    } catch (err) {
      addNotification({ type: 'error', title: 'Error', message: 'Failed to export employee list' });
    } finally {
      setExporting(false);
    }
  };

  const totalEmployees = employees.length;
  const totalSalaries = stats.totalSalaries;
  const totalSavings = stats.totalSavings;
  const activeEmployees = stats.activeCount;

  return (
    <div className="space-y-6">
      {}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Employees with Active Savings
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Employees who have activated their savings account in the employee portal
        </p>
        {error && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Employees</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalEmployees}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Salaries</p>
              <p className="text-2xl font-bold text-emerald-600 font-black">{fmt(totalSalaries)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Savings</p>
              <p className="text-2xl font-bold text-blue-600 font-black">{fmt(totalSavings)}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
              <p className="text-2xl font-bold text-orange-600">{activeEmployees}</p>
            </div>
            <Calendar className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>
                  {dept === 'all' ? 'All Departments' : dept}
                </option>
              ))}
            </select>
            
            <button className="flex items-center px-4 py-2 bg-gray-600 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600 text-white text-sm font-medium rounded-md transition-colors">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </button>
            <button 
              onClick={handleExport}
              disabled={exporting || loading}
              className="flex items-center px-4 py-2 bg-gray-600 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50"
            >
              {exporting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Export
            </button>
          </div>
        </div>
      </div>

      {}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Salary
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Savings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Join Date
                </th>
              </tr>
            </thead>
             <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
               {loading ? (
                 <tr>
                   <td colSpan="6" className="px-6 py-12 text-center">
                     <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
                   </td>
                 </tr>
               ) : employees.length === 0 ? (
                 <tr>
                   <td colSpan="6" className="px-6 py-12 text-center text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest text-xs">
                     No matching employees found
                   </td>
                 </tr>
               ) : (
                 employees.map((employee) => (
                   <tr key={employee.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                     <td className="px-6 py-4 whitespace-nowrap">
                       <div className="flex items-center">
                         <div className="h-10 w-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center font-black text-indigo-700 dark:text-indigo-400">
                           {employee.first_name?.[0]}{employee.last_name?.[0]}
                         </div>
                         <div className="ml-4">
                           <div className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase">
                             {employee.name || `${employee.first_name || ''} ${employee.last_name || ''}`.trim()}
                           </div>
                           <div className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest">
                             {employee.job_grade || employee.position || 'Employee'}
                           </div>
                         </div>
                       </div>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-xs font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest">
                       {employee.department}
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-[9px] font-black uppercase">
                       <span className={`px-2 py-1 rounded-full ${
                         employee.status === 'ACTIVE' || employee.status === 'active' || employee.is_active
                           ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                           : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                       }`}>
                         {employee.account_status === 'ACTIVE' ? 'Savings active' : (employee.status || 'Active')}
                       </span>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-gray-900 dark:text-gray-100 tracking-tighter">
                       {fmt(employee.salary || 0)}
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-blue-600 dark:text-blue-400 tracking-tighter">
                       {fmt(employee.savingsBalance || 0)}
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-gray-400 dark:text-gray-500">
                       {employee.joinDate
                         ? (Number.isNaN(new Date(employee.joinDate).getTime())
                           ? employee.joinDate
                           : new Date(employee.joinDate).toLocaleDateString())
                         : '—'}
                     </td>
                   </tr>
                 ))
               )}
             </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Employees;
