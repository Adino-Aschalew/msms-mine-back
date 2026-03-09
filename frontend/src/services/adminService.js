import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:9999/api'

class AdminService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // Add auth token to requests
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })
  }

  // Dashboard
  async getDashboard() {
    const response = await this.api.get('/admin/dashboard')
    return response.data
  }

  async getSystemHealth() {
    const response = await this.api.get('/admin/system/health')
    return response.data
  }

  async getSystemStats() {
    const response = await this.api.get('/admin/stats')
    return response.data
  }

  async getSystemActivity(params = {}) {
    const response = await this.api.get('/admin/activity', { params })
    return response.data
  }

  async getHRAdmins() {
    const response = await this.api.get('/admin/hr-admins')
    return response.data
  }

  async getLoanCommitteeAdmins() {
    const response = await this.api.get('/admin/loan-committee-admins')
    return response.data
  }

  async toggleMaintenanceMode() {
    const response = await this.api.post('/admin/system/maintenance')
    return response.data
  }

  async getAllAdmins() {
    const response = await this.api.get('/admin/admins')
    return response.data
  }

  // HR Admin Management
  async createHRAdmin(adminData) {
    const response = await this.api.post('/admin/hr-admins', adminData)
    return response.data
  }

  async getHRAdmins() {
    const response = await this.api.get('/admin/hr-admins')
    return response.data
  }

  async updateHRAdmin(adminId, updateData) {
    const response = await this.api.put(`/admin/hr-admins/${adminId}`, updateData)
    return response.data
  }

  async deleteHRAdmin(adminId) {
    const response = await this.api.delete(`/admin/hr-admins/${adminId}`)
    return response.data
  }

  async deactivateHRAdmin(adminId) {
    const response = await this.api.put(`/admin/hr-admins/${adminId}/deactivate`)
    return response.data
  }

  async activateHRAdmin(adminId) {
    const response = await this.api.put(`/admin/hr-admins/${adminId}/activate`)
    return response.data
  }

  // Loan Committee Admin Management
  async createLoanCommitteeAdmin(adminData) {
    const response = await this.api.post('/admin/loan-committee-admins', adminData)
    return response.data
  }

  async getLoanCommitteeAdmins() {
    const response = await this.api.get('/admin/loan-committee-admins')
    return response.data
  }

  async updateLoanCommitteeAdmin(adminId, updateData) {
    const response = await this.api.put(`/admin/loan-committee-admins/${adminId}`, updateData)
    return response.data
  }

  async deleteLoanCommitteeAdmin(adminId) {
    const response = await this.api.delete(`/admin/loan-committee-admins/${adminId}`)
    return response.data
  }

  async deactivateLoanCommitteeAdmin(adminId) {
    const response = await this.api.put(`/admin/loan-committee-admins/${adminId}/deactivate`)
    return response.data
  }

  async activateLoanCommitteeAdmin(adminId) {
    const response = await this.api.put(`/admin/loan-committee-admins/${adminId}/activate`)
    return response.data
  }

  // System Management
  async getSystemHealth() {
    const response = await this.api.get('/admin/system/health')
    return response.data
  }

  async getSystemLogs(params = {}) {
    const response = await this.api.get('/admin/system/logs', { params })
    return response.data
  }

  async toggleMaintenanceMode(enabled) {
    const response = await this.api.post('/admin/system/maintenance', { enabled })
    return response.data
  }
}

const adminService = new AdminService()
export default adminService
