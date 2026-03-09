import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:9999/api'

class EmployeeService {
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

  // Profile Management
  async getProfile() {
    const response = await this.api.get('/employee/profile')
    return response.data
  }

  async updateProfile(profileData) {
    const response = await this.api.put('/employee/profile', profileData)
    return response.data
  }

  async verifyEmployee(employeeId) {
    const response = await this.api.post('/employee/verify', { employee_id: employeeId })
    return response.data
  }

  // Loan Management
  async getMyLoans() {
    const response = await this.api.get('/loans/my-loans')
    return response.data
  }

  async getMyLoanApplications() {
    const response = await this.api.get('/loans/my-applications')
    return response.data
  }

  async applyForLoan(loanData) {
    const response = await this.api.post('/loans/apply', loanData)
    return response.data
  }

  async getLoanById(loanId) {
    const response = await this.api.get(`/loans/my-loans/${loanId}`)
    return response.data
  }

  async checkEligibility() {
    const response = await this.api.get('/loans/check-eligibility')
    return response.data
  }

  async getEligibilityScore() {
    const response = await this.api.get('/loans/eligibility-score')
    return response.data
  }

  async calculateLoanSchedule(params) {
    const response = await this.api.get('/loans/calculate-schedule', { params })
    return response.data
  }

  async makeLoanPayment(loanId, paymentData) {
    const response = await this.api.post(`/loans/${loanId}/pay`, paymentData)
    return response.data
  }

  async getLoanTransactions(loanId) {
    const response = await this.api.get(`/loans/${loanId}/transactions`)
    return response.data
  }

  // Savings Management
  async getSavingsAccount() {
    const response = await this.api.get('/savings/account')
    return response.data
  }

  async getSavingsAccountSummary() {
    const response = await this.api.get('/savings/account/summary')
    return response.data
  }

  async createSavingsAccount(accountData) {
    const response = await this.api.post('/savings/account', accountData)
    return response.data
  }

  async updateSavingsPercentage(percentage) {
    const response = await this.api.put('/savings/account/percentage', { percentage })
    return response.data
  }

  async getSavingsTransactions() {
    const response = await this.api.get('/savings/transactions')
    return response.data
  }

  async addSavingsContribution(contributionData) {
    const response = await this.api.post('/savings/contribute', contributionData)
    return response.data
  }

  async withdrawSavings(withdrawalData) {
    const response = await this.api.post('/savings/withdraw', withdrawalData)
    return response.data
  }

  // Dashboard Data
  async getDashboardData() {
    try {
      const [profileRes, loansRes, applicationsRes, savingsRes, eligibilityRes] = await Promise.allSettled([
        this.getProfile(),
        this.getMyLoans(),
        this.getMyLoanApplications(),
        this.getSavingsAccountSummary(),
        this.checkEligibility()
      ])

      return {
        profile: profileRes.status === 'fulfilled' ? profileRes.value.data : null,
        loans: loansRes.status === 'fulfilled' ? loansRes.value.data : [],
        applications: applicationsRes.status === 'fulfilled' ? applicationsRes.value.data : [],
        savings: savingsRes.status === 'fulfilled' ? savingsRes.value.data : null,
        eligibility: eligibilityRes.status === 'fulfilled' ? eligibilityRes.value.data : null
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      throw error
    }
  }
}

const employeeService = new EmployeeService()
export default employeeService
