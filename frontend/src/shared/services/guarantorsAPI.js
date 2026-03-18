import apiClient from '../services/api';

// Guarantors API
export const guarantorsAPI = {
  // Get all guarantors for current user
  getGuarantors: async (page = 1, limit = 10, filters = {}) => {
    const params = { page, limit, ...filters };
    const response = await apiClient.get('/api/guarantors', params);
    return response.data;
  },

  // Get guarantor by ID
  getGuarantorById: async (guarantorId) => {
    const response = await apiClient.get(`/api/guarantors/${guarantorId}`);
    return response.data;
  },

  // Create new guarantor
  createGuarantor: async (guarantorData) => {
    const response = await apiClient.post('/api/guarantors', guarantorData);
    return response.data;
  },

  // Update guarantor
  updateGuarantor: async (guarantorId, guarantorData) => {
    const response = await apiClient.put(`/api/guarantors/${guarantorId}`, guarantorData);
    return response.data;
  },

  // Delete guarantor
  deleteGuarantor: async (guarantorId) => {
    const response = await apiClient.delete(`/api/guarantors/${guarantorId}`);
    return response.data;
  },

  // Upload guarantor document
  uploadGuarantorDocument: async (guarantorId, formData) => {
    const response = await apiClient.post(`/api/guarantors/${guarantorId}/documents`, formData);
    return response.data;
  },

  // Get guarantor documents
  getGuarantorDocuments: async (guarantorId) => {
    const response = await apiClient.get(`/api/guarantors/${guarantorId}/documents`);
    return response.data;
  }
};
