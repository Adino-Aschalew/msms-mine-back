import api from '../api/axios';

function unwrap(payload) {
  if (!payload) return null;
  if (payload.success === false) return null;
  return payload.data ?? payload;
}

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.transactions)) return value.transactions;
  if (Array.isArray(value?.history)) return value.history;
  if (Array.isArray(value?.records)) return value.records;
  if (Array.isArray(value?.data)) return value.data;
  return [];
}

export function formatAmount(value) {
  const num = parseFloat(value);
  if (Number.isNaN(num)) return '0.00';
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatDate(dateString, options = { month: 'short', day: 'numeric', year: 'numeric' }) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', options);
}

export const employeeService = {
  async getProfile() {
    const res = await api.get('/users/profile');
    return unwrap(res.data);
  },

  async getSavingsDashboard() {
    try {
      const res = await api.get('/savings/dashboard');
      const data = unwrap(res.data) || {};
      
      // Normalize Enterprise Dashboard Data (camelCase to snake_case)
      if (data.account) {
        const acc = data.account;
        data.account = {
          current_balance: acc.currentBalance || acc.current_balance || 0,
          saving_percentage: acc.currentValue || acc.saving_percentage || 0,
          account_status: acc.accountStatus || acc.account_status || 'ACTIVE',
          interest_earned: data.insights?.ytdInterest || acc.interest_earned || 0,
          salary: acc.salary || 0,
          ...acc
        };
      }
      
      if (data.insights?.recentContributions) {
        data.recentTransactions = data.insights.recentContributions.map(c => ({
          transaction_date: c.date || c.transaction_date,
          amount: c.amount,
          transaction_type: 'CONTRIBUTION',
          ...c
        }));
      }
      
      return data;
    } catch {
      try {
        const [accountRes, txnRes] = await Promise.all([
          api.get('/savings/account'),
          api.get('/savings/transactions', { params: { page: 1, limit: 20 } }),
        ]);
        const account = unwrap(accountRes.data);
        const txnPayload = unwrap(txnRes.data);
        return {
          account: account || {},
          recentTransactions: asArray(txnPayload),
        };
      } catch (err) {
        console.warn('Savings fetch failed:', err.message);
        return { account: {}, recentTransactions: [] };
      }
    }
  },

  async getSavingsAccount() {
    const res = await api.get('/savings/account');
    return unwrap(res.data);
  },

  async activateSavingsAccount(savingPercentage = null) {
    const payload = savingPercentage ? { saving_percentage: savingPercentage } : {};
    const res = await api.post('/savings/account', payload);
    return unwrap(res.data);
  },

  async getSavingsTransactions(page = 1, limit = 20) {
    const res = await api.get('/savings/transactions', { params: { page, limit } });
    return asArray(unwrap(res.data));
  },

  async updateSavingPercentage(savingPercentage, reason = '') {
    const res = await api.put('/savings/account/percentage', { saving_percentage: savingPercentage, reason });
    return res.data;
  },

  async withdrawSavings(amount, reason) {
    const res = await api.post('/savings/withdraw', { amount, reason });
    return res.data;
  },

  async getLoanDashboard() {
    const res = await api.get('/loans/dashboard');
    return unwrap(res.data);
  },

  async getMyLoans() {
    const res = await api.get('/loans/my-loans');
    return asArray(unwrap(res.data));
  },

  async getMyApplications() {
    const res = await api.get('/loans/my-applications');
    return asArray(unwrap(res.data));
  },

  async checkEligibility() {
    const res = await api.get('/loans/check-eligibility');
    const data = unwrap(res.data);
    if (data && typeof data === 'object') {
      return {
        isEligible: data.eligible ?? data.isEligible ?? data.is_eligible ?? false,
        max_loan_amount: data.financials?.max_loan_by_savings ?? data.max_loan_by_savings ?? data.max_loan_amount ?? data.maxLoanAmount ?? 0,
        ...data
      };
    }
    return data;
  },

  async applyForLoan(payload) {
    const res = await api.post('/loans/apply', payload);
    return res.data;
  },

  async getLoanDetail(loanId) {
    const res = await api.get(`/loans/my-loans/${loanId}`);
    return unwrap(res.data);
  },

  async getLoanTransactions(loanId) {
    const res = await api.get('/loans/my-transactions', { params: { loanId } });
    return asArray(unwrap(res.data));
  },

  async getPayrollHistory(page = 1, limit = 12) {
    const res = await api.get('/users/me/payroll', { params: { page, limit } });
    const payload = unwrap(res.data);
    return asArray(payload?.history ?? payload);
  },

  async getGuarantors(userId) {
    const res = await api.get('/guarantors', { params: { page: 1, limit: 100 } });
    const list = asArray(unwrap(res.data));
    if (!userId) return list;
    return list.filter((g) => String(g.user_id) === String(userId));
  },

  async checkGuarantorCapacity(employeeId, loanAmount) {
    const res = await api.get(`/loans/check-guarantor/${employeeId}`, {
      params: { loan_amount: loanAmount }
    });
    return unwrap(res.data);
  },

  async getNotifications() {
    const res = await api.get('/notifications');
    return asArray(unwrap(res.data));
  },

  async getUnreadCount() {
    const res = await api.get('/notifications/unread-count');
    const payload = unwrap(res.data);
    return payload?.count ?? payload ?? 0;
  },

  async markNotificationRead(id) {
    await api.put(`/notifications/${id}/read`);
  },

  async markAllNotificationsRead() {
    await api.put('/notifications/mark-all-read');
  },

  // Document Center
  getPayslipPdfUrl(detailId) {
    const baseURL = api.defaults.baseURL;
    return `${baseURL}/documents/payslip/${detailId}`;
  },

  getLoanAgreementPdfUrl(loanId) {
    const baseURL = api.defaults.baseURL;
    return `${baseURL}/documents/loan-agreement/${loanId}`;
  },

  async getDashboardBundle(userId) {
    const results = await Promise.allSettled([
      this.getSavingsDashboard(),
      this.getLoanDashboard(),
      this.getMyLoans(),
      this.getPayrollHistory(1, 1),
      this.getUnreadCount(),
      this.getGuarantors(userId),
    ]);

    const pick = (index, fallback = null) =>
      results[index].status === 'fulfilled' ? results[index].value : fallback;

    const savingsDashboard = pick(0) || {};
    const loanDashboard = pick(1) || {};
    const loans = pick(2) || [];
    const payroll = pick(3) || [];
    const unreadCount = pick(4, 0);
    const guarantors = pick(5) || [];

    // Ensure we have a valid savings object even if pick returns null
    const account = savingsDashboard?.account || (savingsDashboard?.current_balance !== undefined ? savingsDashboard : {});
    const latestPayroll = payroll[0] || null;
    const activeLoan =
      loanDashboard?.activeLoan ||
      loans.find((l) => ['ACTIVE', 'DISBURSED'].includes(String(l.status || '').toUpperCase())) ||
      null;

    return {
      savings: {
        current_balance: account.current_balance || 0,
        interest_earned: account.interest_earned || 0,
        saving_percentage: account.saving_percentage || 0,
        ...account
      },
      transactions: savingsDashboard?.recentTransactions || [],
      loanDashboard,
      loans,
      activeLoan,
      latestPayroll,
      grossSalary: parseFloat(latestPayroll?.gross_salary || account.salary || 0),
      unreadCount,
      guarantorCount: guarantors.length,
      errors: results
        .map((r, i) => (r.status === 'rejected' ? { index: i, message: r.reason?.message } : null))
        .filter(Boolean),
    };
  },
};
