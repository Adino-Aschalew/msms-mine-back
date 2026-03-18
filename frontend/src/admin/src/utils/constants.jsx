export const API_ENDPOINTS = {
  USERS: '/api/users',
  ADMINS: '/api/admins',
  ANALYTICS: '/api/analytics',
  SETTINGS: '/api/settings',
  SESSIONS: '/api/sessions',
  ACTIVITY: '/api/activity'
};

export const THEME_OPTIONS = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
};

export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  USER: 'user'
};

export const STATUS_OPTIONS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended'
};

export const DATE_FORMATS = {
  'MM/DD/YYYY': 'MM/DD/YYYY',
  'DD/MM/YYYY': 'DD/MM/YYYY',
  'YYYY-MM-DD': 'YYYY-MM-DD',
  'DD.MM.YYYY': 'DD.MM.YYYY'
};

export const TIME_FORMATS = {
  '12h': '12h',
  '24h': '24h'
};

export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

export const PAGINATION_DEFAULTS = {
  ITEMS_PER_PAGE: 10,
  MAX_VISIBLE_PAGES: 5
};

export const CHART_COLORS = {
  PRIMARY: 'rgba(59, 130, 246, 1)',
  SECONDARY: 'rgba(34, 197, 94, 1)',
  TERTIARY: 'rgba(168, 85, 247, 1)',
  WARNING: 'rgba(250, 204, 21, 1)',
  DANGER: 'rgba(239, 68, 68, 1)',
  GRAY: 'rgba(107, 114, 128, 1)'
};

export const ACTIVITY_TYPES = {
  LOGIN: 'login',
  LOGOUT: 'logout',
  PASSWORD_CHANGE: 'password_change',
  PROFILE_UPDATE: 'profile_update',
  SECURITY_SETTING: 'security_setting',
  ADMIN_ADDED: 'admin_added',
  USER_DELETED: 'user_deleted',
  SETTINGS_UPDATED: 'settings_updated'
};

export const DEVICE_TYPES = {
  DESKTOP: 'Desktop',
  MOBILE: 'Mobile',
  TABLET: 'Tablet'
};
