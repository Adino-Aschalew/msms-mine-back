import React, { useState, useEffect } from 'react';
import { 
  Search,
  Filter,
  Plus,
  Users,
  DollarSign,
  TrendingUp,
  Calendar,
  Mail,
  Phone,
  Building,
  Briefcase,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  UserPlus,
  Download,
  ChevronRight,
  X,
  Loader2
} from 'lucide-react';
import { financeAPI } from '../../../shared/services/financeAPI';

const FinanceEmployees = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [departments, setDepartments] = useState(['Engineering', 'Marketing', 'Sales', 'Finance', 'HR', 'Operations']);

  useEffect(() => {
    fetchEmployees();
  }, [searchQuery, filterDepartment]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await financeAPI.getEmployees({
        search: searchQuery,
        department: filterDepartment === 'all' ? '' : filterDepartment
      });
      
      if (response.success) {
        setEmployees(response.data.employees || []);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError('Failed to load employees.');
      setLoading(false);
    }
  };

  const totalSavings = employees.reduce((sum, emp) => sum + (parseFloat(emp.savingsBalance) || 0), 0);
  const totalPayroll = employees.reduce((sum, emp) => sum + (parseFloat(emp.salary) || 0), 0);
  const averageSavings = employees.length > 0 ? totalSavings / employees.length : 0;

  const EmployeeCard = ({ employee }) => {
    const contributionRate = ((employee.savingsBalance / (employee.salary * 2)) * 100).toFixed(1);
    
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
              {employee.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{employee.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{employee.position}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">{employee.department}</p>
            </div>
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            employee.status === 'active' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
          }`}>
            {employee.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Annual Salary</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">${employee.salary.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Savings Balance</p>
            <p className="text-lg font-bold text-green-600">${employee.savingsBalance.toLocaleString()}</p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">Savings Rate</p>
            <p className="text-xs font-medium text-gray-900 dark:text-white">{contributionRate}%</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
            <div 
              className="bg-green-500 h-2 rounded-full" 
              style={{ width: `${Math.min(contributionRate, 100)}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-4">
          <Calendar className="h-3 w-3" />
          <span>Joined {employee.joinDate}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedEmployee(employee);
              setShowDetails(true);
            }}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
          >
            <Eye className="h-4 w-4" />
            View Details
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <Edit className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Employees</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage employee financial profiles and savings</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 rounded-lg text-sm font-medium text-white hover:bg-blue-600">
            <UserPlus className="h-4 w-4" />
            Add Employee
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Employees</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{employees.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg dark:bg-blue-900/20">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Payroll</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">${totalPayroll.toLocaleString()}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg dark:bg-green-900/20">
              <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Savings</p>
              <p className="text-2xl font-bold text-green-600">${totalSavings.toLocaleString()}</p>
            </div>
            <div className="bg-emerald-100 p-3 rounded-lg dark:bg-emerald-900/20">
              <TrendingUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Savings</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">${Math.round(averageSavings).toLocaleString()}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg dark:bg-purple-900/20">
              <Briefcase className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {}
      <div className="bg-white rounded-xl border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>

            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
              <Filter className="h-4 w-4" />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-2" />
          <p className="text-gray-500">Loading employees...</p>
        </div>
      ) : employees.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employees.map((employee) => (
            <EmployeeCard key={employee.id} employee={employee} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center dark:bg-gray-800 dark:border-gray-700">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No employees found</h3>
          <p className="text-gray-500">Try adjusting your search or filters.</p>
        </div>
      )}

      {}
      {showDetails && selectedEmployee && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto dark:bg-gray-800">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl">
                    {selectedEmployee.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedEmployee.name}</h2>
                    <p className="text-gray-600 dark:text-gray-400">{selectedEmployee.position}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">{selectedEmployee.department}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700"
                >
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                      <p className="text-gray-900 dark:text-white">{selectedEmployee.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                      <p className="text-gray-900 dark:text-white">{selectedEmployee.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Building className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Department</p>
                      <p className="text-gray-900 dark:text-white">{selectedEmployee.department}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Join Date</p>
                      <p className="text-gray-900 dark:text-white">{selectedEmployee.joinDate}</p>
                    </div>
                  </div>
                </div>
              </div>

              {}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Financial Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4 dark:bg-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Annual Salary</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">${selectedEmployee.salary.toLocaleString()}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 dark:bg-green-900/20">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Savings Balance</p>
                    <p className="text-2xl font-bold text-green-600">${selectedEmployee.savingsBalance.toLocaleString()}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 dark:bg-blue-900/20">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Monthly Contribution</p>
                    <p className="text-2xl font-bold text-blue-600">${(selectedEmployee.salary * 0.01).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payroll Contribution History</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                          Contribution
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                          Balance After
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {selectedEmployee.payrollHistory.map((record, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{record.date}</td>
                          <td className="px-4 py-3 text-sm text-green-600 font-medium">+${record.contribution.toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium">${record.balance.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceEmployees;
