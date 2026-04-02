import React, { useState } from 'react';
import { X, User, Mail, Phone, Building2, Briefcase, Lock, Eye, EyeOff } from 'lucide-react';
import { adminAPI } from '../../shared/services/adminAPI';

const AdminCreationModal = ({ isOpen, onClose, adminType }) => {
  const [formData, setFormData] = useState({
    employee_id: '',
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    department: '',
    job_title: '',
    password: '',
    committee_level: '',
    max_loan_amount: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  const resetForm = () => {
    setFormData({
      employee_id: '',
      first_name: '',
      last_name: '',
      email: '',
      phone_number: '',
      department: '',
      job_title: '',
      password: '',
      committee_level: '',
      max_loan_amount: ''
    });
    setErrors([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateForm = () => {
    const newErrors = [];

    if (!formData.employee_id || formData.employee_id.trim() === '') {
      newErrors.push('Employee ID is required');
    } else if (formData.employee_id.length < 3 || formData.employee_id.length > 20) {
      newErrors.push('Employee ID must be 3-20 characters');
    }

    if (!formData.first_name || formData.first_name.trim() === '') {
      newErrors.push('First name is required');
    }

    if (!formData.last_name || formData.last_name.trim() === '') {
      newErrors.push('Last name is required');
    }

    if (!formData.email || formData.email.trim() === '') {
      newErrors.push('Email is required');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.push('Valid email is required');
      }
    }

    if (!formData.phone_number || formData.phone_number.trim() === '') {
      newErrors.push('Phone number is required');
    }

    if (!formData.department || formData.department.trim() === '') {
      newErrors.push('Department is required');
    }

    if (!formData.job_title || formData.job_title.trim() === '') {
      newErrors.push('Job title is required');
    }

    if (!formData.password || formData.password.trim() === '') {
      newErrors.push('Password is required');
    } else if (formData.password.length < 8) {
      newErrors.push('Password must be at least 8 characters long');
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.push('Password must contain at least one uppercase letter, one lowercase letter, and one number');
    }

    
    if (adminType === 'loan-committee') {
      if (formData.max_loan_amount && (isNaN(formData.max_loan_amount) || parseFloat(formData.max_loan_amount) < 0)) {
        newErrors.push('Maximum loan amount must be a positive number');
      }
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      let response;
      const submitData = { ...formData };
      
      
      if (adminType !== 'loan-committee') {
        delete submitData.committee_level;
        delete submitData.max_loan_amount;
      } else {
        
        if (submitData.max_loan_amount) {
          submitData.max_loan_amount = parseFloat(submitData.max_loan_amount);
        }
      }

      switch (adminType) {
        case 'hr':
          response = await adminAPI.createHRAdmin(submitData);
          break;
        case 'finance':
          response = await adminAPI.createFinanceAdmin(submitData);
          break;
        case 'regular':
          response = await adminAPI.createRegularAdmin(submitData);
          break;
        case 'loan-committee':
          response = await adminAPI.createLoanCommitteeAdmin(submitData);
          break;
        default:
          throw new Error('Invalid admin type');
      }

      alert('Admin created successfully!');
      handleClose();
      
      
      window.location.reload();
      
    } catch (error) {
      setErrors([error.message || 'Failed to create admin']);
    } finally {
      setLoading(false);
    }
  };

  const getDepartmentOptions = () => {
    switch (adminType) {
      case 'hr':
        return ['HR', 'Human Resources', 'Administration'];
      case 'finance':
        return ['Finance', 'Accounting', 'Financial Services', 'Treasury'];
      case 'regular':
        return ['Administration', 'Operations', 'IT', 'General Administration'];
      case 'loan-committee':
        return ['Finance', 'Credit', 'Loan Committee', 'Risk Management'];
      default:
        return [];
    }
  };

  const getCommitteeLevelOptions = () => {
    return ['Junior', 'Senior', 'Lead', 'Chair'];
  };

  const getModalTitle = () => {
    switch (adminType) {
      case 'hr': return 'Create HR Admin';
      case 'finance': return 'Create Finance Admin';
      case 'regular': return 'Create Regular Admin';
      case 'loan-committee': return 'Create Loan Committee Admin';
      default: return 'Create Admin';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={handleClose}></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {getModalTitle()}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Create a new system administrator with the specified role and permissions.
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {errors.length > 0 && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-6 mb-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    {errors.map((error, index) => (
                      <span key={index}>{error}{index < errors.length - 1 && ', '}</span>
                    ))}
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="px-6 pb-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Employee ID
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={formData.employee_id}
                    onChange={(e) => setFormData({ ...formData, employee_id: e.target.value.toUpperCase() })}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="e.g., HR001"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Department
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Select Department</option>
                    {getDepartmentOptions().map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Job Title
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Briefcase className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={formData.job_title}
                      onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              {adminType === 'loan-committee' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Committee Level
                    </label>
                    <select
                      value={formData.committee_level}
                      onChange={(e) => setFormData({ ...formData, committee_level: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="">Select Level</option>
                      {getCommitteeLevelOptions().map((level) => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Max Loan Amount (Optional)
                    </label>
                    <input
                      type="number"
                      value={formData.max_loan_amount}
                      onChange={(e) => setFormData({ ...formData, max_loan_amount: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Password must be at least 8 characters with uppercase, lowercase, and number
                </p>
              </div>
            </div>
          </form>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </div>
              ) : (
                'Create Admin'
              )}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCreationModal;
