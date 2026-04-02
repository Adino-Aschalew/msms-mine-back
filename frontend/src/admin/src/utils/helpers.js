
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};


export const formatDate = (date, options = {}) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  }).format(new Date(date));
};


export const formatDateTime = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};


export const calculatePercentageChange = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};


export const formatPercentage = (value, decimals = 1) => {
  return `${value.toFixed(decimals)}%`;
};


export const getValueColor = (value) => {
  return value >= 0 ? 'text-green-600' : 'text-red-600';
};


export const getStatusClasses = (status) => {
  const statusMap = {
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    failed: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    draft: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
    sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    paid: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400',
    overdue: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    active: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
  };
  return statusMap[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
};


export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};


export const generateId = () => {
  return Math.random().toString(36).substring(2, 9);
};


export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};


export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};


export const sortByKey = (array, key, direction = 'asc') => {
  return array.sort((a, b) => {
    if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
    if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};


export const filterBySearch = (array, searchTerm, keys) => {
  if (!searchTerm) return array;
  
  return array.filter(item => 
    keys.some(key => 
      item[key]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );
};


export const calculateTrend = (data, periods = 7) => {
  if (!data || data.length === 0) return [];
  
  const result = [];
  const dataLength = data.length;
  const step = Math.max(1, Math.floor(dataLength / periods));
  
  for (let i = 0; i < periods && i * step < dataLength; i++) {
    const index = i * step;
    result.push(data[index]);
  }
  
  return result;
};


export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};


export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};


export const isValidPhone = (phone) => {
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone);
};


export const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2);
};


export const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};


export const toTitleCase = (str) => {
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};
