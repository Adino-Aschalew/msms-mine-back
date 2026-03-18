import React, { useState } from 'react';
import { User, Mail, Shield, Lock, CheckCircle } from 'lucide-react';

import { adminAPI } from "../../../../shared/services/adminAPI";

const AddAdminForm = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '', // New field
    role: 'admin',
    password: '',
    confirmPassword: '',
    status: 'active'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and a number';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      
      let department = 'Administration';
      let jobTitle = 'System Administrator';
      
      if (formData.role === 'hr_admin') {
        department = 'HR';
        jobTitle = 'HR Manager';
      } else if (formData.role === 'loan_committee') {
        department = 'Finance';
        jobTitle = 'Loan Officer';
      } else if (formData.role === 'finance_admin') {
        department = 'Finance';
        jobTitle = 'Finance Manager';
      }

      const payload = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone_number: formData.phoneNumber,
        password: formData.password,
        role: formData.role.toUpperCase(),
        department: department,
        job_title: jobTitle,
        employee_id: `ADM${Date.now().toString().slice(-5)}`
      };

      let response;
      switch (formData.role) {
        case 'hr_admin':
          response = await adminAPI.createHRAdmin({ ...payload, department: 'HR' });
          break;
        case 'loan_committee':
          response = await adminAPI.createLoanCommitteeAdmin({ ...payload, committee_level: 'LEVEL_1' });
          break;
        case 'finance_admin':
          response = await adminAPI.createFinanceAdmin({ ...payload, group: 'FINANCE' });
          break;
        default:
          response = await adminAPI.createRegularAdmin(payload);
          break;
      }

      if (response.success) {
        if (onSubmit) onSubmit(response.data);
        onClose();
      } else {
        setErrors({ submit: response.message || 'Failed to create admin' });
      }
    } catch (err) {
      console.error('Submission error:', err);
      setErrors({ submit: err.response?.data?.message || 'Server error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name Fields */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <User className="h-4 w-4 text-blue-600" />
            First Name
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className={`w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 shadow-sm hover:shadow-md dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-400 dark:focus:ring-blue-400/20 ${
              errors.firstName ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
            }`}
            placeholder="John"
          />
          {errors.firstName && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <span className="text-xs">⚠</span> {errors.firstName}
            </p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <User className="h-4 w-4 text-blue-600" />
            Last Name
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className={`w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 shadow-sm hover:shadow-md dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-400 dark:focus:ring-blue-400/20 ${
              errors.lastName ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
            }`}
            placeholder="Doe"
          />
          {errors.lastName && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <span className="text-xs">⚠</span> {errors.lastName}
            </p>
          )}
        </div>
      </div>
      
      {/* Email */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <Mail className="h-4 w-4 text-blue-600" />
          Email Address
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 shadow-sm hover:shadow-md dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-400 dark:focus:ring-blue-400/20 ${
            errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
          }`}
          placeholder="john.doe@example.com"
        />
        {errors.email && (
          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
            <span className="text-xs">⚠</span> {errors.email}
          </p>
        )}
      </div>

      {/* Phone Number */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          Phone Number
        </label>
        <input
          type="tel"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleChange}
          className={`w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 shadow-sm hover:shadow-md dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-400 dark:focus:ring-blue-400/20 ${
            errors.phoneNumber ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
          }`}
          placeholder="+1234567890"
        />
        {errors.phoneNumber && (
          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
            <span className="text-xs">⚠</span> {errors.phoneNumber}
          </p>
        )}
      </div>
      
      {/* Role */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <Shield className="h-4 w-4 text-blue-600" />
          Role
        </label>
        <div className="relative">
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full appearance-none px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400/20"
          >
            <option value="admin">Admin</option>
            <option value="loan_committee">Loan Committee</option>
            <option value="finance_admin">Finance Admin</option>
            <option value="hr_admin">HR Admin</option>
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Password Fields */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <Lock className="h-4 w-4 text-blue-600" />
            Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 shadow-sm hover:shadow-md dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-400 dark:focus:ring-blue-400/20 ${
              errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
            }`}
            placeholder="••••••••"
          />
          {errors.password && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <span className="text-xs">⚠</span> {errors.password}
            </p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-blue-600" />
            Confirm Password
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 shadow-sm hover:shadow-md dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-400 dark:focus:ring-blue-400/20 ${
              errors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
            }`}
            placeholder="••••••••"
          />
          {errors.confirmPassword && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <span className="text-xs">⚠</span> {errors.confirmPassword}
            </p>
          )}
        </div>
      </div>
      
      {/* Status */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Account Status
        </label>
        <div className="flex gap-4">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="status"
              value="active"
              checked={formData.status === 'active'}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">Active</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="status"
              value="inactive"
              checked={formData.status === 'inactive'}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">Inactive</span>
          </label>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex gap-4 pt-6">
        <button
          onClick={onClose}
          type="button"
          disabled={isSubmitting}
          className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {isSubmitting ? (
            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <CheckCircle className="h-5 w-5" />
          )}
          {isSubmitting ? 'Creating...' : 'Create Admin'}
        </button>
      </div>
      {errors.submit && (
        <p className="mt-4 text-center text-sm text-red-600 bg-red-50 p-2 rounded-lg border border-red-100 font-medium">
          {errors.submit}
        </p>
      )}
    </form>
  );
};

export default AddAdminForm;
