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
      return unwrap(res.data);
    } catch {
      const [accountRes, txnRes] = await Promise.all([
        api.get('/savings/account'),
        api.get('/savings/transactions', { params: { page: 1, limit: 20 } }),
      ]);
      const account = unwrap(accountRes.data);
      const txnPayload = unwrap(txnRes.data);
      return {
        account,
        recentTransactions: asArray(txnPayload),
      };
    }
  },

  async getSavingsAccount() {
    const res = await api.get('/savings/account');
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
    return unwrap(res.data);
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

    const savingsDashboard = pick(0, {});
    const loanDashboard = pick(1, {});
    const loans = pick(2, []);
    const payroll = pick(3, []);
    const unreadCount = pick(4, 0);
    const guarantors = pick(5, []);

    const account = savingsDashboard?.account || savingsDashboard || {};
    const latestPayroll = payroll[0] || null;
    const activeLoan =
      loanDashboard?.activeLoan ||
      loans.find((l) => ['ACTIVE', 'DISBURSED'].includes(String(l.status || '').toUpperCase())) ||
      null;

    return {
      savings: account,
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
