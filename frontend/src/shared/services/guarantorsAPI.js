import apiClient from '../services/api';


export const guarantorsAPI = {
  
  getGuarantors: async (params = {}) => {
    const response = await apiClient.get('/guarantors', params);
    return response.data;
  },

  
  getGuarantorById: async (guarantorId) => {
    const response = await apiClient.get(`/guarantors/${guarantorId}`);
    return response.data;
  },

  
  createGuarantor: async (guarantorData) => {
    const response = await apiClient.post('/guarantors', guarantorData);
    return response.data;
  },

  
  updateGuarantor: async (guarantorId, guarantorData) => {
    const response = await apiClient.put(`/guarantors/${guarantorId}`, guarantorData);
    return response.data;
  },

  
  deleteGuarantor: async (guarantorId) => {
    const response = await apiClient.delete(`/guarantors/${guarantorId}`);
    return response.data;
  },

  
  uploadGuarantorDocument: async (guarantorId, formData) => {
    const response = await apiClient.post(`/guarantors/${guarantorId}/documents`, formData);
    return response.data;
  },

  
  getGuarantorDocuments: async (guarantorId) => {
    const response = await apiClient.get(`/guarantors/${guarantorId}/documents`);
    return response.data;
  }
};
