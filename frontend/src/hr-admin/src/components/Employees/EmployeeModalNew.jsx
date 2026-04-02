import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, UserPlus, Briefcase, Mail, DollarSign, User, Edit, Shield, Phone, Calendar, MapPin } from 'lucide-react';

export default function EmployeeModal({ isOpen, onClose, onSave, employee = null }) {
  const isEdit = !!employee;
  const [formData, setFormData] = useState({
    employeeId: '',
    firstName: '',
    lastName: '',
    grandfatherName: '',
    email: '',
    phone: '',
    department: 'Engineering',
    role: '',
    type: 'Full-time',
    salary: '',
    address: '',
    emergencyContact: '',
    joinDate: new Date().toISOString().split('T')[0],
    status: 'Active'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (employee) {
      setFormData({
        employeeId: employee.employeeId || employee.employee_id || '',
        firstName: employee.firstName || employee.first_name || '',
        lastName: employee.lastName || employee.last_name || '',
        grandfatherName: employee.grandfatherName || employee.grandfather_name || '',
        email: employee.email || '',
        phone: employee.phone || '',
        department: employee.department || 'Engineering',
        role: employee.job_role || employee.role || '',
        type: employee.type || employee.job_grade || 'Full-time',
        salary: employee.salary || employee.salary_grade || '',
        address: employee.address || '',
        emergencyContact: employee.emergencyContact || employee.emergency_contact || '',
        joinDate: employee.joinDate || employee.hire_date || new Date().toISOString().split('T')[0],
        status: employee.status || employee.employment_status || 'Active'
      });
    } else {
      setFormData({
        employeeId: '',
        firstName: '',
        lastName: '',
        grandfatherName: '',
        email: '',
        phone: '',
        department: 'Engineering',
        role: '',
        type: 'Full-time',
        salary: '',
        address: '',
        emergencyContact: '',
        joinDate: new Date().toISOString().split('T')[0],
        status: 'Active'
      });
    }
    setErrors({});
  }, [employee, isOpen]);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors = {};

    if (!formData.employeeId.trim()) newErrors.employeeId = 'Employee ID is required';
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.role.trim()) newErrors.role = 'Job role is required';
    if (!formData.salary || formData.salary <= 0) newErrors.salary = 'Valid salary is required';

    


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const newEmployee = {
      ...employee,
      id: employee?.id || formData.employeeId,
      employeeId: formData.employeeId,
      firstName: formData.firstName,
      lastName: formData.lastName,
      grandfatherName: formData.grandfatherName,
      name: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      phone: formData.phone,
      department: formData.department,
      role: formData.role,
      type: formData.type,
      salary: Number(formData.salary),
      address: formData.address,
      emergencyContact: formData.emergencyContact,
      joinDate: formData.joinDate,
      status: formData.status,
      avatar: employee?.avatar || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70) + 1}`,
      performance: employee?.performance || 0,
    };

    


    onSave(newEmployee);
    onClose();
  };

  const departments = [
    'Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Design', 'Product', 'Operations', 'Customer Support', 'Legal'
  ];

  const employmentTypes = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Temporary'];
  const statuses = ['Active', 'On Leave', 'Probation', 'Inactive'];

  return isOpen ? createPortal(
    <div className="fixed inset-0 z-[999999999] flex items-center justify-center p-4">
      {}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {}
      <div
        className="relative bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]"
        role="dialog"
      >
        {}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-lg">
              <UserPlus size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {isEdit ? 'Edit Employee Details' : 'Add New Employee'}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {isEdit ? `Update information for ${employee?.name}` : 'Create a new employee profile'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-300"
          >
            <X size={20} />
          </button>
        </div>

        {}
        <div className="p-6 overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} className="space-y-6">

            {}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <User className="text-blue-500" size={20} />
                Employee Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Employee ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.employeeId}
                    onChange={e => setFormData({ ...formData, employeeId: e.target.value.toUpperCase() })}
                    className={`w-full px-4 py-2 bg-white dark:bg-slate-700 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm ${errors.employeeId ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                      }`}
                    placeholder="EMP001"
                  />
                  {errors.employeeId && <p className="text-red-500 text-xs">{errors.employeeId}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.firstName}
                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                    className={`w-full px-4 py-2 bg-white dark:bg-slate-700 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm ${errors.firstName ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                      }`}
                    placeholder="John"
                  />
                  {errors.firstName && <p className="text-red-500 text-xs">{errors.firstName}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.lastName}
                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                    className={`w-full px-4 py-2 bg-white dark:bg-slate-700 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm ${errors.lastName ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                      }`}
                    placeholder="Doe"
                  />
                  {errors.lastName && <p className="text-red-500 text-xs">{errors.lastName}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Grandfather Name
                </label>
                <input
                  type="text"
                  value={formData.grandfatherName}
                  onChange={e => setFormData({ ...formData, grandfatherName: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                  placeholder="Michael"
                />
              </div>
            </div>

            {}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Mail className="text-blue-500" size={20} />
                Contact Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full px-4 py-2 bg-white dark:bg-slate-700 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm ${errors.email ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                      }`}
                    placeholder="john.doe@company.com"
                  />
                  {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full px-4 py-2 bg-white dark:bg-slate-700 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm ${errors.phone ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                      }`}
                    placeholder="+1 234 567 8900"
                  />
                  {errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                  placeholder="123 Main St, City, State"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Emergency Contact
                </label>
                <input
                  type="text"
                  value={formData.emergencyContact}
                  onChange={e => setFormData({ ...formData, emergencyContact: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                  placeholder="Jane Doe - +1 234 567 8901"
                />
              </div>
            </div>

            {}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Briefcase className="text-blue-500" size={20} />
                Job Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                  >
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Job Role <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                    className={`w-full px-4 py-2 bg-white dark:bg-slate-700 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm ${errors.role ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                      }`}
                    placeholder="Senior Developer"
                  />
                  {errors.role && <p className="text-red-500 text-xs">{errors.role}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Employment Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                  >
                    {employmentTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Annual Salary (ETB) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      required
                      type="number"
                      value={formData.salary}
                      onChange={e => setFormData({ ...formData, salary: e.target.value })}
                      className={`w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-700 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm ${errors.salary ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                        }`}
                      placeholder="75000"
                    />
                  </div>
                  {errors.salary && <p className="text-red-500 text-xs">{errors.salary}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Join Date
                  </label>
                  <input
                    type="date"
                    value={formData.joinDate}
                    onChange={e => setFormData({ ...formData, joinDate: e.target.value })}
                    className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {}

          </form>
        </div>

        {}
        <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-4 bg-slate-50 dark:bg-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 text-sm font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all shadow-lg"
          >
            {isEdit ? 'Update Employee' : 'Add Employee'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  ) : null;
}
