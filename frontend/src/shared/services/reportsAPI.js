import apiClient from '../services/api';


export const reportsAPI = {
  
  getStats: async () => {
    const response = await apiClient.get('/reports/stats');
    return response;
  },

  
  getReports: async (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.type && filters.type !== 'all') {
      params.append('type', filters.type);
    }
    
    if (filters.period) {
      params.append('period', filters.period);
    }
    
    if (filters.search) {
      params.append('search', filters.search);
    }
    
    const response = await apiClient.get(`/reports?${params.toString()}`);
    return response;
  },

  
  getTemplates: async () => {
    const response = await apiClient.get('/reports/templates');
    return response;
  },

  
  generateReport: async (reportType, format = 'json', filters = {}) => {
    const response = await apiClient.post('/reports/generate', {
      reportType,
      format,
      filters
    });
    return response;
  },

  
  getHistory: async (page = 1, limit = 10, filters = {}) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    if (filters.report_type) {
      params.append('report_type', filters.report_type);
    }
    
    if (filters.generated_by) {
      params.append('generated_by', filters.generated_by);
    }
    
    if (filters.start_date) {
      params.append('start_date', filters.start_date);
    }
    
    if (filters.end_date) {
      params.append('end_date', filters.end_date);
    }
    
    const response = await apiClient.get(`/reports/history?${params.toString()}`);
    return response;
  },

  
  getReportById: async (reportId) => {
    const response = await apiClient.get(`/reports/history/${reportId}`);
    return response;
  },

  
  deleteReport: async (reportId) => {
    const response = await apiClient.delete(`/api/reports/history/${reportId}`);
    return response.data;
  },

  
  scheduleReport: async (reportType, schedule, parameters, recipients) => {
    const response = await apiClient.post('/api/reports/schedule', {
      reportType,
      schedule,
      parameters,
      recipients
    });
    return response.data;
  },

  
  getScheduledReports: async (page = 1, limit = 10, filters = {}) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    if (filters.status) {
      params.append('status', filters.status);
    }
    
    if (filters.next_run) {
      params.append('next_run', filters.next_run);
    }
    
    const response = await apiClient.get(`/api/reports/scheduled?${params.toString()}`);
    return response.data;
  },

  
  cancelScheduledReport: async (reportId) => {
    const response = await apiClient.delete(`/api/reports/scheduled/${reportId}`);
    return response.data;
  },

  
  getDefinitions: async () => {
    const response = await apiClient.get('/api/reports/definitions');
    return response.data;
  }
};
