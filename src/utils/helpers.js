/**
 * Utility helper functions for the microfinance system
 */

/**
 * Generate a unique employee ID based on role and timestamp
 * @param {string} role - The role of the employee (HR, LOAN_COMMITTEE, etc.)
 * @returns {string} Generated employee ID
 */
const generateEmployeeId = (role = 'EMP') => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  // Role prefixes
  const prefixes = {
    'HR': 'HR',
    'LOAN_COMMITTEE': 'LC',
    'SUPER_ADMIN': 'SA',
    'ADMIN': 'AD',
    'FINANCE': 'FN',
    'EMPLOYEE': 'EMP'
  };
  
  const prefix = prefixes[role.toUpperCase()] || 'EMP';
  return `${prefix}${timestamp}${random}`;
};

/**
 * Generate a unique loan application ID
 * @returns {string} Generated loan ID
 */
const generateLoanId = () => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `LN${timestamp}${random}`;
};

/**
 * Generate a unique savings account ID
 * @returns {string} Generated savings account ID
 */
const generateSavingsId = () => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `SV${timestamp}${random}`;
};

/**
 * Generate a unique transaction ID
 * @returns {string} Generated transaction ID
 */
const generateTransactionId = () => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `TX${timestamp}${random}`;
};

/**
 * Format currency amount
 * @param {number} amount - The amount to format
 * @param {string} currency - Currency code (default: 'USD')
 * @returns {string} Formatted currency string
 */
const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

/**
 * Calculate interest on a loan
 * @param {number} principal - Loan principal amount
 * @param {number} rate - Annual interest rate (as percentage)
 * @param {number} months - Loan term in months
 * @returns {object} Interest calculation details
 */
const calculateInterest = (principal, rate, months) => {
  const monthlyRate = rate / 100 / 12;
  const totalInterest = principal * monthlyRate * months;
  const totalPayment = principal + totalInterest;
  const monthlyPayment = totalPayment / months;
  
  return {
    principal,
    rate,
    months,
    monthlyRate,
    totalInterest,
    totalPayment,
    monthlyPayment
  };
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid phone number
 */
const isValidPhone = (phone) => {
  const phoneRegex = /^[+]?[\d\s\-\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

/**
 * Generate a random password
 * @param {number} length - Password length (default: 12)
 * @returns {string} Generated password
 */
const generatePassword = (length = 12) => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  // Ensure at least one of each required character type
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
  password += '0123456789'[Math.floor(Math.random() * 10)];
  password += '!@#$%^&*'[Math.floor(Math.random() * 8)];
  
  // Fill remaining length
  for (let i = 4; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

/**
 * Calculate age from date of birth
 * @param {Date|string} dateOfBirth - Date of birth
 * @returns {number} Age in years
 */
const calculateAge = (dateOfBirth) => {
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Format date to readable string
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Check if a date is within a specified range
 * @param {Date|string} date - Date to check
 * @param {Date|string} startDate - Start of range
 * @param {Date|string} endDate - End of range
 * @returns {boolean} True if date is within range
 */
const isDateInRange = (date, startDate, endDate) => {
  const checkDate = new Date(date);
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return checkDate >= start && checkDate <= end;
};

/**
 * Generate a pagination object
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total items
 * @returns {object} Pagination metadata
 */
const generatePagination = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  
  return {
    page,
    limit,
    total,
    totalPages,
    offset,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    nextPage: page < totalPages ? page + 1 : null,
    prevPage: page > 1 ? page - 1 : null
  };
};

/**
 * Sanitize user input to prevent XSS
 * @param {string} input - Input string to sanitize
 * @returns {string} Sanitized string
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Deep clone an object
 * @param {object} obj - Object to clone
 * @returns {object} Cloned object
 */
const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  
  const cloned = {};
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  
  return cloned;
};

module.exports = {
  generateEmployeeId,
  generateLoanId,
  generateSavingsId,
  generateTransactionId,
  formatCurrency,
  calculateInterest,
  isValidEmail,
  isValidPhone,
  generatePassword,
  calculateAge,
  formatDate,
  isDateInRange,
  generatePagination,
  sanitizeInput,
  deepClone
};
