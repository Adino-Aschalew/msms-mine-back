export const LOAN_TYPES = {
  EMERGENCY: 'emergency',
  PERSONAL: 'personal',
  EDUCATION: 'education',
  MEDICAL: 'medical',
};

export const LOAN_TYPE_LABELS = {
  [LOAN_TYPES.EMERGENCY]: 'Emergency Loan',
  [LOAN_TYPES.PERSONAL]: 'Personal Loan',
  [LOAN_TYPES.EDUCATION]: 'Education Loan',
  [LOAN_TYPES.MEDICAL]: 'Medical Loan',
};

export const LOAN_TYPE_LIMITS = {
  [LOAN_TYPES.EMERGENCY]: { maxAmount: 10000, maxDuration: 12 },
  [LOAN_TYPES.PERSONAL]: { maxAmount: 25000, maxDuration: 36 },
  [LOAN_TYPES.EDUCATION]: { maxAmount: 20000, maxDuration: 24 },
  [LOAN_TYPES.MEDICAL]: { maxAmount: 15000, maxDuration: 18 },
};

export const LOAN_STATUSES = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  COMPLETED: 'completed',
};

export const LOAN_STATUS_LABELS = {
  [LOAN_STATUSES.PENDING]: 'Pending',
  [LOAN_STATUSES.APPROVED]: 'Approved',
  [LOAN_STATUSES.REJECTED]: 'Rejected',
  [LOAN_STATUSES.ACTIVE]: 'Active',
  [LOAN_STATUSES.SUSPENDED]: 'Suspended',
  [LOAN_STATUSES.COMPLETED]: 'Completed',
};

export const REPAYMENT_STATUSES = {
  PAID: 'paid',
  PENDING: 'pending',
  OVERDUE: 'overdue',
};

export const REPAYMENT_STATUS_LABELS = {
  [REPAYMENT_STATUSES.PAID]: 'Paid',
  [REPAYMENT_STATUSES.PENDING]: 'Pending',
  [REPAYMENT_STATUSES.OVERDUE]: 'Overdue',
};

export const WITHDRAWAL_STATUSES = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  PAID: 'paid',
};

export const WITHDRAWAL_STATUS_LABELS = {
  [WITHDRAWAL_STATUSES.PENDING]: 'Pending',
  [WITHDRAWAL_STATUSES.APPROVED]: 'Approved',
  [WITHDRAWAL_STATUSES.REJECTED]: 'Rejected',
  [WITHDRAWAL_STATUSES.PAID]: 'Paid',
};

export const GUARANTOR_TYPES = {
  INTERNAL: 'internal',
  EXTERNAL: 'external',
};

export const GUARANTOR_TYPE_LABELS = {
  [GUARANTOR_TYPES.INTERNAL]: 'Internal Employee',
  [GUARANTOR_TYPES.EXTERNAL]: 'External Guarantor',
};

export const NOTIFICATION_TYPES = {
  LOAN_APPROVAL: 'loan_approval',
  LOAN_REJECTION: 'loan_rejection',
  LOAN_REPAYMENT: 'loan_repayment',
  SAVINGS_DEDUCTION: 'savings_deduction',
  SAVINGS_RATE_UPDATE: 'savings_rate_update',
  WITHDRAWAL_REQUEST: 'withdrawal_request',
  SYSTEM_UPDATE: 'system_update',
  GUARANTOR_REQUIRED: 'guarantor_required',
};

export const NOTIFICATION_TYPE_LABELS = {
  [NOTIFICATION_TYPES.LOAN_APPROVAL]: 'Loan Approved',
  [NOTIFICATION_TYPES.LOAN_REJECTION]: 'Loan Rejected',
  [NOTIFICATION_TYPES.LOAN_REPAYMENT]: 'Loan Repayment',
  [NOTIFICATION_TYPES.SAVINGS_DEDUCTION]: 'Savings Deduction',
  [NOTIFICATION_TYPES.SAVINGS_RATE_UPDATE]: 'Savings Rate Updated',
  [NOTIFICATION_TYPES.WITHDRAWAL_REQUEST]: 'Withdrawal Request',
  [NOTIFICATION_TYPES.SYSTEM_UPDATE]: 'System Update',
  [NOTIFICATION_TYPES.GUARANTOR_REQUIRED]: 'Guarantor Required',
};

export const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
};

export const PRIORITY_LEVEL_LABELS = {
  [PRIORITY_LEVELS.LOW]: 'Low',
  [PRIORITY_LEVELS.MEDIUM]: 'Medium',
  [PRIORITY_LEVELS.HIGH]: 'High',
};

export const PAYROLL_STATUSES = {
  PROCESSED: 'processed',
  PENDING: 'pending',
  FAILED: 'failed',
};

export const PAYROLL_STATUS_LABELS = {
  [PAYROLL_STATUSES.PROCESSED]: 'Processed',
  [PAYROLL_STATUSES.PENDING]: 'Pending',
  [PAYROLL_STATUSES.FAILED]: 'Failed',
};

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
};

export const THEME_LABELS = {
  [THEMES.LIGHT]: 'Light',
  [THEMES.DARK]: 'Dark',
  [THEMES.SYSTEM]: 'System',
};

export const LANGUAGES = {
  ENGLISH: 'english',
  SPANISH: 'spanish',
  FRENCH: 'french',
  GERMAN: 'german',
};

export const LANGUAGE_LABELS = {
  [LANGUAGES.ENGLISH]: 'English',
  [LANGUAGES.SPANISH]: 'Spanish',
  [LANGUAGES.FRENCH]: 'French',
  [LANGUAGES.GERMAN]: 'German',
};

export const FILE_TYPES = {
  PDF: 'application/pdf',
  DOC: 'application/msword',
  DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  JPG: 'image/jpeg',
  JPEG: 'image/jpeg',
  PNG: 'image/png',
};

export const FILE_TYPE_LABELS = {
  [FILE_TYPES.PDF]: 'PDF',
  [FILE_TYPES.DOC]: 'DOC',
  [FILE_TYPES.DOCX]: 'DOCX',
  [FILE_TYPES.JPG]: 'JPG',
  [FILE_TYPES.JPEG]: 'JPEG',
  [FILE_TYPES.PNG]: 'PNG',
};

export const MAX_FILE_SIZE = 5 * 1024 * 1024; 

export const ELIGIBILITY_RULES = {
  MIN_EMPLOYMENT_DURATION: 6, 
  MAX_SAVINGS_MULTIPLIER: 2, 
  MAX_SALARY_PERCENTAGE: 40, 
  MIN_SAVING_RATE: 15, 
  MAX_SAVING_RATE: 65, 
  INTEREST_RATE: 5, 
};

export const ROUTES = {
  DASHBOARD: '/dashboard',
  LOANS: '/loans',
  LOAN_REQUEST: '/loans/request',
  SAVINGS: '/savings',
  GUARANTORS: '/guarantors',
  REPAYMENTS: '/repayments',
  PAYROLL: '/payroll',
  NOTIFICATIONS: '/notifications',
  ACCOUNT: '/account',
  LOGIN: '/login',
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
  },
  LOANS: {
    LIST: '/loans',
    DETAIL: '/loans/:id',
    CREATE: '/loans',
    UPDATE: '/loans/:id',
    DELETE: '/loans/:id',
    ELIGIBILITY: '/loans/eligibility',
  },
  SAVINGS: {
    INFO: '/savings',
    RATE: '/savings/rate',
    PAYROLL_HISTORY: '/savings/payroll-history',
    WITHDRAWAL: '/savings/withdrawal',
  },
  GUARANTORS: {
    LIST: '/guarantors',
    DETAIL: '/guarantors/:id',
    CREATE: '/guarantors',
    UPDATE: '/guarantors/:id',
    DELETE: '/guarantors/:id',
    SEARCH_EMPLOYEE: '/guarantors/search-employee/:id',
  },
  REPAYMENTS: {
    SUMMARY: '/repayments/summary',
    HISTORY: '/repayments/history',
    SCHEDULE: '/repayments/schedule',
    LOAN_REPAYMENTS: '/repayments/loan/:id',
  },
  PAYROLL: {
    HISTORY: '/payroll/history',
    CURRENT: '/payroll/current',
    STATS: '/payroll/stats',
  },
  NOTIFICATIONS: {
    LIST: '/notifications',
    MARK_READ: '/notifications/:id/read',
    MARK_ALL_READ: '/notifications/read-all',
    DELETE: '/notifications/:id',
    DELETE_ALL: '/notifications',
    PREFERENCES: '/notifications/preferences',
  },
  DASHBOARD: {
    DATA: '/dashboard',
    STATS: '/dashboard/stats',
    CHARTS: '/dashboard/charts/:type',
    ACTIVITY: '/dashboard/activity',
  },
  UPLOAD: {
    FILE: '/upload',
    DELETE: '/upload/:id',
  },
};

export const CHART_TYPES = {
  LINE: 'line',
  BAR: 'bar',
  PIE: 'pie',
  DOUGHNUT: 'doughnut',
};

export const DATE_FORMATS = {
  SHORT: 'MMM dd, yyyy',
  LONG: 'MMMM dd, yyyy',
  WITH_TIME: 'MMM dd, yyyy HH:mm',
  ISO: 'yyyy-MM-dd',
  DISPLAY: 'MM/dd/yyyy',
};

export const TABLE_CONFIGS = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZES: [5, 10, 25, 50, 100],
  DEFAULT_SORT: { field: 'createdAt', direction: 'desc' },
};

export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s\-\(\)]+$/,
  PASSWORD: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHARS: true,
  },
  EMPLOYEE_ID: /^[A-Z]{3}\d{3}$/,
};

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'You do not have permission to access this resource.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  FILE_TOO_LARGE: 'File size exceeds the maximum allowed size.',
  INVALID_FILE_TYPE: 'Invalid file type. Please upload a valid file.',
};

export const SUCCESS_MESSAGES = {
  PROFILE_UPDATED: 'Profile updated successfully.',
  PASSWORD_UPDATED: 'Password updated successfully.',
  LOAN_SUBMITTED: 'Loan application submitted successfully.',
  SAVINGS_RATE_UPDATED: 'Savings rate updated successfully.',
  WITHDRAWAL_REQUESTED: 'Withdrawal request submitted successfully.',
  GUARANTOR_ADDED: 'Guarantor added successfully.',
  GUARANTOR_UPDATED: 'Guarantor updated successfully.',
  GUARANTOR_DELETED: 'Guarantor deleted successfully.',
  NOTIFICATIONS_READ: 'All notifications marked as read.',
  NOTIFICATIONS_DELETED: 'Notifications deleted successfully.',
  PREFERENCES_UPDATED: 'Preferences updated successfully.',
};
