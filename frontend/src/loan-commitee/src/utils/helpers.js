

export const formatCurrency = (amount, currency = 'ETB') => {
  if (currency === 'ETB') {
    const num = typeof amount === 'string' ? parseFloat(amount.replace(/[^0-9.]/g, '')) : amount;
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)} METB`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)} KETB`;
    }
    return `${num} ETB`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};


export const formatETB = (amount) => formatCurrency(amount, 'ETB');

export const formatDate = (date, format = 'short') => {
  const options = {
    short: { year: 'numeric', month: 'short', day: 'numeric' },
    long: { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' },
    time: { hour: '2-digit', minute: '2-digit' },
  };
  
  return new Date(date).toLocaleDateString('en-US', options[format] || options.short);
};

export const calculateMonthlyInstallment = (principal, months, interestRate = 0) => {
  if (interestRate === 0) {
    return principal / months;
  }
  
  const monthlyRate = interestRate / 100 / 12;
  const installment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                      (Math.pow(1 + monthlyRate, months) - 1);
  
  return installment;
};

export const checkEligibility = (loanData, rules) => {
  const checks = [];
  
  
  const monthlyInstallment = calculateMonthlyInstallment(
    loanData.requestedAmount, 
    loanData.loanDuration, 
    rules.interestRate
  );
  const salaryPercentage = (monthlyInstallment / loanData.monthlySalary) * 100;
  checks.push({
    rule: 'Salary Rule',
    passed: salaryPercentage <= rules.salaryDeductionLimit,
    actual: `${salaryPercentage.toFixed(1)}%`,
    required: `≤ ${rules.salaryDeductionLimit}%`
  });
  
  
  const maxLoanFromSavings = loanData.savingsBalance * rules.savingsMultiplier;
  checks.push({
    rule: 'Savings Rule',
    passed: loanData.requestedAmount <= maxLoanFromSavings,
    actual: `${formatETB(loanData.requestedAmount)}`,
    required: `≤ ${formatETB(maxLoanFromSavings)}`
  });
  
  
  const employmentMonths = Math.floor(
    (new Date() - new Date(loanData.employmentDate)) / (1000 * 60 * 60 * 24 * 30)
  );
  checks.push({
    rule: 'Employment Period',
    passed: employmentMonths >= rules.minEmploymentPeriod,
    actual: `${employmentMonths} months`,
    required: `≥ ${rules.minEmploymentPeriod} months`
  });
  
  
  const requiredGuarantorSavings = loanData.requestedAmount * rules.guarantorSavingsRatio;
  checks.push({
    rule: 'Guarantor Rule',
    passed: loanData.guarantorSavings >= requiredGuarantorSavings,
    actual: `${formatETB(loanData.guarantorSavings)}`,
    required: `≥ ${formatETB(requiredGuarantorSavings)}`
  });
  
  return checks;
};

export const getStatusColor = (status) => {
  const colors = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
    suspended: 'gray',
    disbursed: 'success',
    failed: 'danger'
  };
  return colors[status] || 'gray';
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

export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone) => {
  const re = /^[\d\s\-\+\(\)]+$/;
  return re.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
};

export const calculateAge = (dateOfBirth) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

export const getInitials = (firstName, lastName) => {
  if (!firstName && !lastName) return 'U';
  if (!firstName) return lastName.charAt(0).toUpperCase();
  if (!lastName) return firstName.charAt(0).toUpperCase();
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy text: ', err);
    return false;
  }
};

export const downloadFile = (data, filename, type = 'text/plain') => {
  const blob = new Blob([data], { type });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

export const parseCSV = (csvText) => {
  const lines = csvText.split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = values[index];
    });
    return obj;
  }).filter(obj => Object.values(obj).some(val => val !== ''));
};

export const exportToCSV = (data, filename) => {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => row[header]).join(','))
  ].join('\n');
  
  downloadFile(csvContent, filename, 'text/csv');
};
