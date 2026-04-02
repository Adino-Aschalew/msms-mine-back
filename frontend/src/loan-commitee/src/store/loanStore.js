import { create } from 'zustand';
import { loanAPI } from '../services/api';

const useLoanStore = create((set, get) => ({
  
  loans: [],
  currentLoan: null,
  loading: false,
  error: null,
  stats: null,
  filters: {
    search: '',
    department: 'all',
    loanType: 'all',
    status: 'all',
    amountRange: { min: '', max: '' },
  },

  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),

  setFilters: (filters) => set({ filters: { ...get().filters, ...filters } }),

  resetFilters: () => set({
    filters: {
      search: '',
      department: 'all',
      loanType: 'all',
      status: 'all',
      amountRange: { min: '', max: '' },
    }
  }),

  
  fetchLoans: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await loanAPI.getLoanRequests(params);
      set({ 
        loans: response.data.data || response.data || [],
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch loans',
        loading: false 
      });
    }
  },

  
  fetchLoanById: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await loanAPI.getLoanById(id);
      set({ 
        currentLoan: response.data.data || response.data,
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch loan details',
        loading: false 
      });
    }
  },

  
  approveLoan: async (id, approvalData) => {
    set({ loading: true, error: null });
    try {
      await loanAPI.approveLoan(id, approvalData);
      
      set(state => ({
        loans: state.loans.map(loan => 
          loan.id === id ? { ...loan, status: 'approved', ...approvalData } : loan
        ),
        loading: false
      }));
      return true;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to approve loan',
        loading: false 
      });
      return false;
    }
  },

  
  rejectLoan: async (id, rejectionData) => {
    set({ loading: true, error: null });
    try {
      await loanAPI.rejectLoan(id, rejectionData);
      
      set(state => ({
        loans: state.loans.map(loan => 
          loan.id === id ? { ...loan, status: 'rejected', ...rejectionData } : loan
        ),
        loading: false
      }));
      return true;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to reject loan',
        loading: false 
      });
      return false;
    }
  },

  
  suspendLoan: async (id, suspensionData) => {
    set({ loading: true, error: null });
    try {
      await loanAPI.suspendLoan(id, suspensionData);
      
      set(state => ({
        loans: state.loans.map(loan => 
          loan.id === id ? { ...loan, status: 'suspended', ...suspensionData } : loan
        ),
        loading: false
      }));
      return true;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to suspend loan',
        loading: false 
      });
      return false;
    }
  },

  
  fetchStats: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await loanAPI.getLoanStats(params);
      set({ 
        stats: response.data.data || response.data,
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch statistics',
        loading: false 
      });
    }
  },

  
  clearCurrentLoan: () => set({ currentLoan: null }),

  
  clearError: () => set({ error: null }),
}));

export default useLoanStore;
