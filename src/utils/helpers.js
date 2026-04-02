


const generateEmployeeId = (role = 'EMP') => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  
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


const generateLoanId = () => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `LN${timestamp}${random}`;
};


const generateSavingsId = () => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `SV${timestamp}${random}`;
};


const generateTransactionId = () => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `TX${timestamp}${random}`;
};


const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};


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


const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};


const isValidPhone = (phone) => {
  const phoneRegex = /^[+]?[\d\s\-\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};


const generatePassword = (length = 12) => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
  password += '0123456789'[Math.floor(Math.random() * 10)];
  password += '!@#$%^&*'[Math.floor(Math.random() * 8)];
  
  
  for (let i = 4; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  
  return password.split('').sort(() => Math.random() - 0.5).join('');
};


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


const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};


const isDateInRange = (date, startDate, endDate) => {
  const checkDate = new Date(date);
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return checkDate >= start && checkDate <= end;
};


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


const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\\/g, '&#92;');
};


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
