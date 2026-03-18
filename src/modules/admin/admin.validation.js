// Simple validation functions for admin operations

// HR Admin creation validation
const validateCreateHRAdmin = (req, res, next) => {
  const {
    employee_id,
    first_name,
    last_name,
    email,
    phone_number,
    department,
    job_title,
    password
  } = req.body;

  const errors = [];

  // Employee ID validation
  if (!employee_id || employee_id.trim() === '') {
    errors.push('Employee ID is required');
  } else if (employee_id.length < 3 || employee_id.length > 20) {
    errors.push('Employee ID must be 3-20 characters');
  } else if (!/^[A-Z0-9]+$/.test(employee_id)) {
    errors.push('Employee ID must contain only uppercase letters and numbers');
  }

  // First name validation
  if (!first_name || first_name.trim() === '') {
    errors.push('First name is required');
  } else if (first_name.length < 2 || first_name.length > 50) {
    errors.push('First name must be 2-50 characters');
  } else if (!/^[a-zA-Z\s]+$/.test(first_name)) {
    errors.push('First name must contain only letters and spaces');
  }

  // Last name validation
  if (!last_name || last_name.trim() === '') {
    errors.push('Last name is required');
  } else if (last_name.length < 2 || last_name.length > 50) {
    errors.push('Last name must be 2-50 characters');
  } else if (!/^[a-zA-Z\s]+$/.test(last_name)) {
    errors.push('Last name must contain only letters and spaces');
  }

  // Email validation
  if (!email || email.trim() === '') {
    errors.push('Email is required');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('Valid email is required');
    }
  }

  // Phone number validation
  if (!phone_number || phone_number.trim() === '') {
    errors.push('Phone number is required');
  } else {
    const phoneRegex = /^[+]?[\d\s\-\(\)]+$/;
    if (!phoneRegex.test(phone_number)) {
      errors.push('Invalid phone number format');
    }
  }

  // Department validation
  if (!department || department.trim() === '') {
    errors.push('Department is required');
  } else if (!['HR', 'Human Resources', 'Administration'].includes(department)) {
    errors.push('Department must be HR related');
  }

  // Job title validation
  if (!job_title || job_title.trim() === '') {
    errors.push('Job title is required');
  } else if (job_title.length < 2 || job_title.length > 100) {
    errors.push('Job title must be 2-100 characters');
  }

  // Password validation
  if (!password || password.trim() === '') {
    errors.push('Password is required');
  } else if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one uppercase letter, one lowercase letter, and one number');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors
    });
  }

  next();
};

// Loan Committee Admin creation validation
const validateCreateLoanCommitteeAdmin = (req, res, next) => {
  const {
    employee_id,
    first_name,
    last_name,
    email,
    phone_number,
    department,
    job_title,
    committee_level,
    max_loan_amount,
    password
  } = req.body;

  const errors = [];

  // Employee ID validation
  if (!employee_id || employee_id.trim() === '') {
    errors.push('Employee ID is required');
  } else if (employee_id.length < 3 || employee_id.length > 20) {
    errors.push('Employee ID must be 3-20 characters');
  } else if (!/^[A-Z0-9]+$/.test(employee_id)) {
    errors.push('Employee ID must contain only uppercase letters and numbers');
  }

  // First name validation
  if (!first_name || first_name.trim() === '') {
    errors.push('First name is required');
  } else if (first_name.length < 2 || first_name.length > 50) {
    errors.push('First name must be 2-50 characters');
  } else if (!/^[a-zA-Z\s]+$/.test(first_name)) {
    errors.push('First name must contain only letters and spaces');
  }

  // Last name validation
  if (!last_name || last_name.trim() === '') {
    errors.push('Last name is required');
  } else if (last_name.length < 2 || last_name.length > 50) {
    errors.push('Last name must be 2-50 characters');
  } else if (!/^[a-zA-Z\s]+$/.test(last_name)) {
    errors.push('Last name must contain only letters and spaces');
  }

  // Email validation
  if (!email || email.trim() === '') {
    errors.push('Email is required');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('Valid email is required');
    }
  }

  // Phone number validation
  if (!phone_number || phone_number.trim() === '') {
    errors.push('Phone number is required');
  } else {
    const phoneRegex = /^[+]?[\d\s\-\(\)]+$/;
    if (!phoneRegex.test(phone_number)) {
      errors.push('Invalid phone number format');
    }
  }

  // Department validation
  if (!department || department.trim() === '') {
    errors.push('Department is required');
  } else if (!['Finance', 'Credit', 'Loan Committee', 'Risk Management'].includes(department)) {
    errors.push('Department must be finance/credit related');
  }

  // Job title validation
  if (!job_title || job_title.trim() === '') {
    errors.push('Job title is required');
  } else if (job_title.length < 2 || job_title.length > 100) {
    errors.push('Job title must be 2-100 characters');
  }

  // Committee level validation
  if (committee_level && !['Junior', 'Senior', 'Lead', 'Chair', 'LEVEL_1', 'LEVEL_2', 'LEVEL_3', 'LEVEL_4'].includes(committee_level)) {
    errors.push('Invalid committee level');
  }

  // Max loan amount validation
  if (max_loan_amount !== undefined && max_loan_amount !== null && max_loan_amount !== '') {
    const amount = parseFloat(max_loan_amount);
    if (isNaN(amount) || amount < 0) {
      errors.push('Max loan amount must be a positive number');
    }
  }

  // Password validation
  if (!password || password.trim() === '') {
    errors.push('Password is required');
  } else if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one uppercase letter, one lowercase letter, and one number');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors
    });
  }

  next();
};

// Admin update validation (less strict for updates)
const validateUpdateAdmin = (req, res, next) => {
  const {
    first_name,
    last_name,
    email,
    phone_number,
    department,
    job_title,
    committee_level,
    max_loan_amount
  } = req.body;

  const errors = [];

  // First name validation
  if (first_name !== undefined && first_name !== null && first_name !== '') {
    if (first_name.length < 2 || first_name.length > 50) {
      errors.push('First name must be 2-50 characters');
    } else if (!/^[a-zA-Z\s]+$/.test(first_name)) {
      errors.push('First name must contain only letters and spaces');
    }
  }

  // Last name validation
  if (last_name !== undefined && last_name !== null && last_name !== '') {
    if (last_name.length < 2 || last_name.length > 50) {
      errors.push('Last name must be 2-50 characters');
    } else if (!/^[a-zA-Z\s]+$/.test(last_name)) {
      errors.push('Last name must contain only letters and spaces');
    }
  }

  // Email validation
  if (email !== undefined && email !== null && email !== '') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('Valid email is required');
    }
  }

  // Phone number validation
  if (phone_number !== undefined && phone_number !== null && phone_number !== '') {
    const phoneRegex = /^[+]?[\d\s\-\(\)]+$/;
    if (!phoneRegex.test(phone_number)) {
      errors.push('Invalid phone number format');
    }
  }

  // Department validation
  if (department !== undefined && department !== null && department !== '') {
    if (department.length < 2 || department.length > 100) {
      errors.push('Department must be 2-100 characters');
    }
  }

  // Job title validation
  if (job_title !== undefined && job_title !== null && job_title !== '') {
    if (job_title.length < 2 || job_title.length > 100) {
      errors.push('Job title must be 2-100 characters');
    }
  }

  // Committee level validation
  if (committee_level !== undefined && committee_level !== null && committee_level !== '') {
    if (!['Junior', 'Senior', 'Lead', 'Chair'].includes(committee_level)) {
      errors.push('Invalid committee level');
    }
  }

  // Max loan amount validation
  if (max_loan_amount !== undefined && max_loan_amount !== null && max_loan_amount !== '') {
    const amount = parseFloat(max_loan_amount);
    if (isNaN(amount) || amount < 0) {
      errors.push('Max loan amount must be a positive number');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors
    });
  }

  next();
};

// Finance Admin creation validation
const validateCreateFinanceAdmin = (req, res, next) => {
  const {
    employee_id,
    first_name,
    last_name,
    email,
    phone_number,
    department,
    job_title,
    password
  } = req.body;

  const errors = [];

  // Employee ID validation
  if (!employee_id || employee_id.trim() === '') {
    errors.push('Employee ID is required');
  } else if (employee_id.length < 3 || employee_id.length > 20) {
    errors.push('Employee ID must be 3-20 characters');
  } else if (!/^[A-Z0-9]+$/.test(employee_id)) {
    errors.push('Employee ID must contain only uppercase letters and numbers');
  }

  // First name validation
  if (!first_name || first_name.trim() === '') {
    errors.push('First name is required');
  } else if (first_name.length < 2 || first_name.length > 50) {
    errors.push('First name must be 2-50 characters');
  } else if (!/^[a-zA-Z\s]+$/.test(first_name)) {
    errors.push('First name must contain only letters and spaces');
  }

  // Last name validation
  if (!last_name || last_name.trim() === '') {
    errors.push('Last name is required');
  } else if (last_name.length < 2 || last_name.length > 50) {
    errors.push('Last name must be 2-50 characters');
  } else if (!/^[a-zA-Z\s]+$/.test(last_name)) {
    errors.push('Last name must contain only letters and spaces');
  }

  // Email validation
  if (!email || email.trim() === '') {
    errors.push('Email is required');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('Valid email is required');
    }
  }

  // Phone number validation
  if (!phone_number || phone_number.trim() === '') {
    errors.push('Phone number is required');
  } else {
    const phoneRegex = /^[+]?[\d\s\-\(\)]+$/;
    if (!phoneRegex.test(phone_number)) {
      errors.push('Invalid phone number format');
    }
  }

  // Department validation
  if (!department || department.trim() === '') {
    errors.push('Department is required');
  } else if (!['Finance', 'Accounting', 'Financial Services', 'Treasury'].includes(department)) {
    errors.push('Department must be finance related');
  }

  // Job title validation
  if (!job_title || job_title.trim() === '') {
    errors.push('Job title is required');
  } else if (job_title.length < 2 || job_title.length > 100) {
    errors.push('Job title must be 2-100 characters');
  }

  // Password validation
  if (!password || password.trim() === '') {
    errors.push('Password is required');
  } else if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one uppercase letter, one lowercase letter, and one number');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors
    });
  }

  next();
};

// Regular Admin creation validation
const validateCreateRegularAdmin = (req, res, next) => {
  const {
    employee_id,
    first_name,
    last_name,
    email,
    phone_number,
    department,
    job_title,
    password
  } = req.body;

  const errors = [];

  // Employee ID validation
  if (!employee_id || employee_id.trim() === '') {
    errors.push('Employee ID is required');
  } else if (employee_id.length < 3 || employee_id.length > 20) {
    errors.push('Employee ID must be 3-20 characters');
  } else if (!/^[A-Z0-9]+$/.test(employee_id)) {
    errors.push('Employee ID must contain only uppercase letters and numbers');
  }

  // First name validation
  if (!first_name || first_name.trim() === '') {
    errors.push('First name is required');
  } else if (first_name.length < 2 || first_name.length > 50) {
    errors.push('First name must be 2-50 characters');
  } else if (!/^[a-zA-Z\s]+$/.test(first_name)) {
    errors.push('First name must contain only letters and spaces');
  }

  // Last name validation
  if (!last_name || last_name.trim() === '') {
    errors.push('Last name is required');
  } else if (last_name.length < 2 || last_name.length > 50) {
    errors.push('Last name must be 2-50 characters');
  } else if (!/^[a-zA-Z\s]+$/.test(last_name)) {
    errors.push('Last name must contain only letters and spaces');
  }

  // Email validation
  if (!email || email.trim() === '') {
    errors.push('Email is required');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('Valid email is required');
    }
  }

  // Phone number validation
  if (!phone_number || phone_number.trim() === '') {
    errors.push('Phone number is required');
  } else {
    const phoneRegex = /^[+]?[\d\s\-\(\)]+$/;
    if (!phoneRegex.test(phone_number)) {
      errors.push('Invalid phone number format');
    }
  }

  // Department validation
  if (!department || department.trim() === '') {
    errors.push('Department is required');
  } else if (!['Administration', 'Operations', 'IT', 'General Administration'].includes(department)) {
    errors.push('Department must be administration related');
  }

  // Job title validation
  if (!job_title || job_title.trim() === '') {
    errors.push('Job title is required');
  } else if (job_title.length < 2 || job_title.length > 100) {
    errors.push('Job title must be 2-100 characters');
  }

  // Password validation
  if (!password || password.trim() === '') {
    errors.push('Password is required');
  } else if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one uppercase letter, one lowercase letter, and one number');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors
    });
  }

  next();
};

module.exports = {
  validateCreateHRAdmin,
  validateCreateFinanceAdmin,
  validateCreateRegularAdmin,
  validateCreateLoanCommitteeAdmin,
  validateUpdateAdmin
};
