import api from './api'

const hrApi = {
  // Employee Management
  getEmployees: async () => {
    const response = await api.get('/hr/employees')
    return response.data
  },

  getEmployeeStats: async () => {
    const response = await api.get('/hr/employees/stats')
    return response.data
  },

  getDepartments: async () => {
    const response = await api.get('/hr/employees/departments')
    return response.data
  },

  getJobGrades: async () => {
    const response = await api.get('/hr/employees/job-grades')
    return response.data
  },

  getEmployeeById: async (userId) => {
    const response = await api.get(`/hr/employees/${userId}`)
    return response.data
  },

  updateEmployeeProfile: async (userId, profileData) => {
    const response = await api.put(`/hr/employees/${userId}/profile`, profileData)
    return response.data
  },

  verifyEmployee: async (userId) => {
    const response = await api.put(`/hr/employees/${userId}/verify`)
    return response.data
  },

  updateEmploymentStatus: async (userId, status) => {
    const response = await api.put(`/hr/employees/${userId}/status`, { status })
    return response.data
  },

  bulkVerifyEmployees: async (employeeIds) => {
    const response = await api.post('/hr/employees/bulk-verify', { employeeIds })
    return response.data
  },

  createEmployee: async (employeeData) => {
    const response = await api.post('/hr/employees', employeeData)
    return response.data
  },

  // Attendance Management
  getAttendance: async (date, department, status) => {
    const params = new URLSearchParams()
    if (date) params.append('date', date)
    if (department) params.append('department', department)
    if (status) params.append('status', status)
    
    const response = await api.get(`/hr/attendance?${params}`)
    return response.data
  },

  markAttendance: async (attendanceData) => {
    const response = await api.post('/hr/attendance', attendanceData)
    return response.data
  },

  updateAttendance: async (attendanceId, attendanceData) => {
    const response = await api.put(`/hr/attendance/${attendanceId}`, attendanceData)
    return response.data
  },

  getAttendanceStats: async (date) => {
    const response = await api.get(`/hr/attendance/stats?date=${date}`)
    return response.data
  },

  // Leave Management
  getLeaveRequests: async (status, type) => {
    const params = new URLSearchParams()
    if (status) params.append('status', status)
    if (type) params.append('type', type)
    
    const response = await api.get(`/hr/leave?${params}`)
    return response.data
  },

  createLeaveRequest: async (leaveData) => {
    const response = await api.post('/hr/leave', leaveData)
    return response.data
  },

  approveLeaveRequest: async (leaveId) => {
    const response = await api.put(`/hr/leave/${leaveId}/approve`)
    return response.data
  },

  rejectLeaveRequest: async (leaveId, reason) => {
    const response = await api.put(`/hr/leave/${leaveId}/reject`, { reason })
    return response.data
  },

  getLeaveStats: async () => {
    const response = await api.get('/hr/leave/stats')
    return response.data
  },

  // Payroll Management
  getPayrollRecords: async (month, department) => {
    const params = new URLSearchParams()
    if (month) params.append('month', month)
    if (department) params.append('department', department)
    
    const response = await api.get(`/hr/payroll?${params}`)
    return response.data
  },

  generatePayroll: async (payrollData) => {
    const response = await api.post('/hr/payroll/generate', payrollData)
    return response.data
  },

  getPayrollStats: async (month) => {
    const response = await api.get(`/hr/payroll/stats?month=${month}`)
    return response.data
  },

  getPayslip: async (payrollId) => {
    const response = await api.get(`/hr/payroll/${payrollId}/payslip`)
    return response.data
  },

  // Performance Reviews
  getPerformanceReviews: async (status, rating) => {
    const params = new URLSearchParams()
    if (status) params.append('status', status)
    if (rating) params.append('rating', rating)
    
    const response = await api.get(`/hr/performance?${params}`)
    return response.data
  },

  createPerformanceReview: async (reviewData) => {
    const response = await api.post('/hr/performance', reviewData)
    return response.data
  },

  updatePerformanceReview: async (reviewId, reviewData) => {
    const response = await api.put(`/hr/performance/${reviewId}`, reviewData)
    return response.data
  },

  getPerformanceStats: async () => {
    const response = await api.get('/hr/performance/stats')
    return response.data
  },

  // Training & Development
  getTrainingPrograms: async (status, type) => {
    const params = new URLSearchParams()
    if (status) params.append('status', status)
    if (type) params.append('type', type)
    
    const response = await api.get(`/hr/training?${params}`)
    return response.data
  },

  createTrainingProgram: async (trainingData) => {
    const response = await api.post('/hr/training', trainingData)
    return response.data
  },

  enrollEmployee: async (trainingId, employeeId) => {
    const response = await api.post(`/hr/training/${trainingId}/enroll`, { employeeId })
    return response.data
  },

  getTrainingStats: async () => {
    const response = await api.get('/hr/training/stats')
    return response.data
  },

  // Reports & Analytics
  getEmployeeReport: async (filters) => {
    const params = new URLSearchParams(filters)
    const response = await api.get(`/hr/reports/employees?${params}`)
    return response.data
  },

  getAttendanceReport: async (filters) => {
    const params = new URLSearchParams(filters)
    const response = await api.get(`/hr/reports/attendance?${params}`)
    return response.data
  },

  getPayrollReport: async (filters) => {
    const params = new URLSearchParams(filters)
    const response = await api.get(`/hr/reports/payroll?${params}`)
    return response.data
  },

  getPerformanceReport: async (filters) => {
    const params = new URLSearchParams(filters)
    const response = await api.get(`/hr/reports/performance?${params}`)
    return response.data
  },

  exportReport: async (reportType, filters) => {
    const params = new URLSearchParams(filters)
    const response = await api.get(`/hr/reports/${reportType}/export?${params}`)
    return response.data
  }
}

export default hrApi
