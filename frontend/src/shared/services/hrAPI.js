import apiClient from '../services/api';

// HR API
export const hrAPI = {
  // Get all employees
  getAllEmployees: async (page = 1, limit = 10, filters = {}) => {
    const params = { page, limit, ...filters };
    const response = await apiClient.get('/api/hr/employees', params);
    return response.data;
  },

  // Get employee details
  getEmployee: async (employeeId) => {
    const response = await apiClient.get(`/api/hr/employees/${employeeId}`);
    return response.data;
  },

  // Verify employee
  verifyEmployee: async (employeeId, verificationData) => {
    const response = await apiClient.put(`/api/hr/employees/${employeeId}/verify`, verificationData);
    return response.data;
  },

  // Create employee profile
  createEmployeeProfile: async (profileData) => {
    const response = await apiClient.post('/api/hr/employees', profileData);
    return response.data;
  },

  // Get dashboard statistics
  getDashboardStats: async () => {
    const response = await apiClient.get('/api/hr/dashboard-stats');
    return response.data;
  },

  // Update dashboard statistics
  updateDashboardStats: async (statsData) => {
    const response = await apiClient.put('/api/hr/dashboard-stats', statsData);
    return response.data;
  },

  // Get attendance data
  getAttendanceData: async (period = 'month') => {
    const response = await apiClient.get(`/api/hr/attendance?period=${period}`);
    return response.data;
  },

  // Get department data
  getDepartmentData: async () => {
    const response = await apiClient.get('/api/hr/department-stats');
    return response.data;
  },

  // Get diversity data
  getDiversityData: async () => {
    const response = await apiClient.get('/api/hr/diversity-stats');
    return response.data;
  },

  // Get recent activities
  getRecentActivities: async (limit = 10) => {
    const response = await apiClient.get(`/api/hr/recent-activities?limit=${limit}`);
    return response.data;
  },

  // Performance Management
  getPerformanceStats: async () => {
    const response = await apiClient.get('/api/hr/performance-stats');
    return response.data;
  },

  getPerformanceReviews: async (page = 1, limit = 10) => {
    const response = await apiClient.get(`/api/hr/performance-reviews?page=${page}&limit=${limit}`);
    return response.data;
  },

  createPerformanceReview: async (reviewData) => {
    const response = await apiClient.post('/api/hr/performance-reviews', reviewData);
    return response.data;
  },

  // Reports Management
  getReportsData: async (reportType = 'payroll') => {
    const response = await apiClient.get(`/api/hr/reports?reportType=${reportType}`);
    return response.data;
  },

  // Account Management
  getUserProfile: async () => {
    const response = await apiClient.get('/api/hr/profile');
    return response.data;
  },

  updateUserProfile: async (profileData) => {
    const response = await apiClient.put('/api/hr/profile', profileData);
    return response.data;
  },

  // Update employee profile
  updateEmployeeProfile: async (employeeId, profileData) => {
    const response = await apiClient.put(`/api/hr/employees/${employeeId}/profile`, profileData);
    return response.data;
  },

  // Get unverified employees
  getUnverifiedEmployees: async () => {
    const response = await apiClient.get('/api/hr/unverified');
    return response.data;
  },

  // Bulk verify employees
  bulkVerifyEmployees: async (employeeIds) => {
    const response = await apiClient.post('/api/hr/employees/bulk-verify', {
      userIds: employeeIds
    });
    return response.data;
  },

  // Get employee statistics
  getEmployeeStats: async () => {
    const response = await apiClient.get('/api/hr/employees/stats');
    return response.data;
  },

  // Sync with HR database
  syncWithHRDatabase: async () => {
    const response = await apiClient.post('/api/hr/sync');
    return response.data;
  },

  // Get department breakdown
  getDepartmentBreakdown: async () => {
    const response = await apiClient.get('/api/hr/employees/departments');
    return response.data;
  },

  // Update employment status
  updateEmploymentStatus: async (employeeId, status) => {
    const response = await apiClient.put(`/api/hr/employees/${employeeId}/status`, {
      employment_status: status
    });
    return response.data;
  },

  // Get job grades
  getJobGrades: async () => {
    const response = await apiClient.get('/api/hr/employees/job-grades');
    return response.data;
  }
};
