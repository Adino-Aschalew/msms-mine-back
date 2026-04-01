import apiClient from '../services/api';

// Guarantors API
export const guarantorsAPI = {
  // Get all guarantors for current user
  getGuarantors: async (params = {}) => {
    const response = await apiClient.get('/guarantors', params);
    return response.data;
  },

  // Get guarantor by ID
  getGuarantorById: async (guarantorId) => {
    const response = await apiClient.get(`/guarantors/${guarantorId}`);
    return response.data;
  },

  // Create new guarantor
  createGuarantor: async (guarantorData) => {
    const response = await apiClient.post('/guarantors', guarantorData);
    return response.data;
  },

  // Update guarantor
  updateGuarantor: async (guarantorId, guarantorData) => {
    const response = await apiClient.put(`/guarantors/${guarantorId}`, guarantorData);
    return response.data;
  },

  // Delete guarantor
  deleteGuarantor: async (guarantorId) => {
    const response = await apiClient.delete(`/guarantors/${guarantorId}`);
    return response.data;
  },

  // Upload guarantor document
  uploadGuarantorDocument: async (guarantorId, formData) => {
    const response = await apiClient.post(`/guarantors/${guarantorId}/documents`, formData);
    return response.data;
  },

  // Get guarantor documents
  getGuarantorDocuments: async (guarantorId) => {
    const response = await apiClient.get(`/guarantors/${guarantorId}/documents`);
    return response.data;
  }
};
