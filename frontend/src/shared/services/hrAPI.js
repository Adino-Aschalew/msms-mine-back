import apiClient from '../services/api';


export const hrAPI = {
  
  getAllEmployees: async (page = 1, limit = 10, filters = {}) => {
    const params = { page, limit, ...filters };
    const response = await apiClient.get('/hr/employees', params);
    return response.data;
  },

  
  getEmployee: async (employeeId) => {
    const response = await apiClient.get(`/hr/employees/${employeeId}`);
    return response.data;
  },

  
  verifyEmployee: async (employeeId, verificationData) => {
    const response = await apiClient.put(`/hr/employees/${employeeId}/verify`, verificationData);
    return response.data;
  },

  
  createEmployeeProfile: async (profileData) => {
    const response = await apiClient.post('/hr/employees', profileData);
    return response.data;
  },

  
  getDashboardStats: async () => {
    const response = await apiClient.get('/hr/dashboard-stats');
    return response.data;
  },

  
  updateDashboardStats: async (statsData) => {
    const response = await apiClient.put('/hr/dashboard-stats', statsData);
    return response.data;
  },

  
  getAttendanceData: async (period = 'month') => {
    const response = await apiClient.get(`/hr/attendance?period=${period}`);
    return response.data;
  },

  
  getDepartmentData: async () => {
    const response = await apiClient.get('/hr/department-stats');
    return response.data;
  },

  
  getDiversityData: async () => {
    const response = await apiClient.get('/hr/diversity-stats');
    return response.data;
  },

  
  getRecentActivities: async (limit = 10) => {
    const response = await apiClient.get(`/hr/recent-activities?limit=${limit}`);
    return response.data;
  },

  
  getPerformanceStats: async () => {
    const response = await apiClient.get('/hr/performance-stats');
    return response.data;
  },

  getPerformanceReviews: async (page = 1, limit = 10) => {
    const response = await apiClient.get(`/hr/performance-reviews?page=${page}&limit=${limit}`);
    return response.data;
  },

  createPerformanceReview: async (reviewData) => {
    const response = await apiClient.post('/hr/performance-reviews', reviewData);
    return response.data;
  },

  
  getReportsData: async (reportType = 'payroll') => {
    const response = await apiClient.get(`/hr/reports?reportType=${reportType}`);
    return response.data;
  },

  
  getUserProfile: async () => {
    const response = await apiClient.get('/hr/profile');
    return response.data;
  },

  updateUserProfile: async (profileData) => {
    const response = await apiClient.put('/hr/profile', profileData);
    return response.data;
  },

  
  updateEmployeeProfile: async (employeeId, profileData) => {
    const response = await apiClient.put(`/hr/employees/${employeeId}/profile`, profileData);
    return response.data;
  },

  
  getUnverifiedEmployees: async () => {
    const response = await apiClient.get('/hr/unverified');
    return response.data;
  },

  
  bulkVerifyEmployees: async (employeeIds) => {
    const response = await apiClient.post('/hr/employees/bulk-verify', {
      userIds: employeeIds
    });
    return response.data;
  },

  
  getEmployeeStats: async () => {
    const response = await apiClient.get('/hr/employees/stats');
    return response.data;
  },

  
  syncWithHRDatabase: async () => {
    const response = await apiClient.post('/hr/sync');
    return response.data;
  },

  
  getDepartmentBreakdown: async () => {
    const response = await apiClient.get('/hr/employees/departments');
    return response.data;
  },

  
  updateEmploymentStatus: async (employeeId, status) => {
    const response = await apiClient.put(`/hr/employees/${employeeId}/status`, {
      employment_status: status
    });
    return response.data;
  },

  
  getJobGrades: async () => {
    const response = await apiClient.get('/hr/employees/job-grades');
    return response.data;
  }
};
