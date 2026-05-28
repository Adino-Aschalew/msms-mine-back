import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  ActivityIndicator, TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/axios';
import { useTheme } from '../../context/ThemeContext';

export default function RepaymentsScreen() {
  const { theme, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('summary');
  const [loans, setLoans] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const formatAmount = (v) => {
    const num = parseFloat(v);
    if (isNaN(num)) return '0.00 ETB';
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ETB';
  };

  const formatCompactNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [loansRes, transRes] = await Promise.all([
        api.get('/loans/my-loans').catch(() => ({ data: { success: false, data: [] } })),
        api.get('/loans/transactions').catch(() => ({ data: { success: false, data: [] } }))
      ]);

      const realLoans = Array.isArray(loansRes.data?.data?.data) ? loansRes.data.data.data : 
                       Array.isArray(loansRes.data?.data) ? loansRes.data.data : 
                       Array.isArray(loansRes.data) ? loansRes.data : [];
      const realTrans = Array.isArray(transRes.data?.data?.data) ? transRes.data.data.data : 
                       Array.isArray(transRes.data?.data) ? transRes.data.data : 
                       Array.isArray(transRes.data) ? transRes.data : [];

      setLoans(realLoans);
      setHistory(realTrans);
    } catch (error) {
      console.error('Repayments fetch error:', error.response?.data || error.message);
      setLoans([]);
      setHistory([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);
  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const repaymentSummary = {
    totalLoanBalance: loans.reduce((sum, l) => sum + parseFloat(l.loan_amount || 0), 0),
    totalRepaid: loans.reduce((sum, l) => sum + parseFloat(l.paid_amount || 0), 0),
    remainingBalance: loans.reduce((sum, l) => sum + parseFloat(l.outstanding_balance || 0), 0),
    monthlyDeduction: loans.filter(l => l.status === 'ACTIVE' || l.status === 'active').reduce((sum, l) => sum + parseFloat(l.monthly_repayment || l.monthly_payment || l.monthly_deduction || 0), 0),
  };

  const activeLoansList = loans.filter(l => l.status === 'ACTIVE' || l.status === 'active').map(l => ({
    id: l.id.toString(),
    loanType: l.loan_type || l.purpose || 'Personal',
    approvedAmount: parseFloat(l.loan_amount || 0),
    remainingBalance: parseFloat(l.outstanding_balance || 0),
    monthlyInstallment: parseFloat(l.monthly_repayment || l.monthly_payment || l.monthly_deduction || 0),
    interestRate: l.interest_rate || 5,
    startDate: l.start_date || l.disbursement_date || l.created_at,
    endDate: l.maturity_date || 'N/A',
  }));

  const repaymentHistory = history.map(t => ({
    id: t.id,
    date: t.transaction_date || t.created_at,
    loanId: t.loan_id?.toString() || 'N/A',
    installmentAmount: parseFloat(t.amount || 0),
    principal: parseFloat(t.amount || 0) * 0.9,
    interest: parseFloat(t.amount || 0) * 0.1,
    remainingBalance: parseFloat(t.balance_after_transaction || 0),
    status: 'paid',
  }));

  const calculateProgress = (approvedAmount, remainingBalance) => {
    if (approvedAmount === 0) return 0;
    return ((approvedAmount - remainingBalance) / approvedAmount) * 100;
  };

  const tabs = [
    { id: 'summary', label: 'Summary', icon: 'stats-chart' },
    { id: 'history', label: 'History', icon: 'time' },
  ];

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} tintColor={theme.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Stats */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.statIconBg, { backgroundColor: theme.error + '15' }]}>
              <Ionicons name="card" size={24} color={theme.error} />
            </View>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total Loan Balance</Text>
            <Text style={[styles.statValue, { color: theme.text }]}>{formatCompactNumber(repaymentSummary.totalLoanBalance)}</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.statIconBg, { backgroundColor: theme.success + '15' }]}>
              <Ionicons name="trending-down" size={24} color={theme.success} />
            </View>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total Repaid</Text>
            <Text style={[styles.statValue, { color: theme.text }]}>{formatCompactNumber(repaymentSummary.totalRepaid)}</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.statIconBg, { backgroundColor: theme.warning + '15' }]}>
              <Ionicons name="card" size={24} color={theme.warning} />
            </View>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Remaining Balance</Text>
            <Text style={[styles.statValue, { color: theme.text }]}>{formatCompactNumber(repaymentSummary.remainingBalance)}</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.statIconBg, { backgroundColor: theme.info + '15' }]}>
              <Ionicons name="calendar" size={24} color={theme.info} />
            </View>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Monthly Deduction</Text>
            <Text style={[styles.statValue, { color: theme.text }]}>{formatCompactNumber(repaymentSummary.monthlyDeduction)}</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={[styles.tabContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.activeTab, { backgroundColor: activeTab === tab.id ? theme.primary : 'transparent' }]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Ionicons name={tab.icon} size={18} color={activeTab === tab.id ? '#fff' : theme.textSecondary} />
              <Text style={[styles.tabText, { color: activeTab === tab.id ? '#fff' : theme.textSecondary }]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Summary Tab Content */}
        {activeTab === 'summary' && (
          <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Repayment Progress</Text>
            
            {activeLoansList.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="card-outline" size={40} color={theme.textMuted} />
                <Text style={[styles.emptyTitle, { color: theme.text }]}>No Active Loans</Text>
                <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>You don't have any active loans to track.</Text>
              </View>
            ) : (
              activeLoansList.map((loan) => (
                <View key={loan.id} style={[styles.loanCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <View style={styles.loanHeader}>
                    <Text style={[styles.loanTitle, { color: theme.text }]}>{loan.loanType} Loan ({loan.id})</Text>
                    <Text style={[styles.loanProgress, { color: theme.textSecondary }]}>
                      {calculateProgress(loan.approvedAmount, loan.remainingBalance).toFixed(1)}% repaid
                    </Text>
                  </View>

                  <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
                      <View 
                        style={[
                          styles.progressFill, 
                          { width: `${calculateProgress(loan.approvedAmount, loan.remainingBalance)}%`, backgroundColor: theme.primary }
                        ]} 
                      />
                    </View>
                  </View>

                  <View style={styles.loanStats}>
                    <View style={styles.loanStat}>
                      <Text style={[styles.loanStatLabel, { color: theme.textSecondary }]}>Progress</Text>
                      <Text style={[styles.loanStatValue, { color: theme.text }]}>
                        {formatCompactNumber(loan.approvedAmount - loan.remainingBalance)} / {formatCompactNumber(loan.approvedAmount)}
                      </Text>
                    </View>
                    <View style={styles.loanStat}>
                      <Text style={[styles.loanStatLabel, { color: theme.textSecondary }]}>Monthly</Text>
                      <Text style={[styles.loanStatValue, { color: theme.text }]}>{formatCompactNumber(loan.monthlyInstallment)}</Text>
                    </View>
                    <View style={styles.loanStat}>
                      <Text style={[styles.loanStatLabel, { color: theme.textSecondary }]}>Remaining</Text>
                      <Text style={[styles.loanStatValue, { color: theme.text }]}>{formatCompactNumber(loan.remainingBalance)}</Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* History Tab Content */}
        {activeTab === 'history' && (
          <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Repayment History</Text>

            {repaymentHistory.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="time-outline" size={40} color={theme.textMuted} />
                <Text style={[styles.emptyTitle, { color: theme.text }]}>No Repayment History</Text>
                <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>Your repayment history will appear here.</Text>
              </View>
            ) : (
              repaymentHistory.map((payment) => (
                <View key={payment.id} style={[styles.historyCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <View style={styles.historyHeader}>
                    <Text style={[styles.historyDate, { color: theme.text }]}>
                      {new Date(payment.date).toLocaleDateString()}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: theme.success + '15' }]}>
                      <Text style={[styles.statusText, { color: theme.success }]}>Paid</Text>
                    </View>
                  </View>

                  <View style={styles.historyRow}>
                    <Text style={[styles.historyLabel, { color: theme.textSecondary }]}>Loan ID</Text>
                    <Text style={[styles.historyValue, { color: theme.text }]}>{payment.loanId}</Text>
                  </View>

                  <View style={styles.historyRow}>
                    <Text style={[styles.historyLabel, { color: theme.textSecondary }]}>Installment</Text>
                    <Text style={[styles.historyValue, { color: theme.text }]}>{formatAmount(payment.installmentAmount)}</Text>
                  </View>

                  <View style={styles.historyRow}>
                    <Text style={[styles.historyLabel, { color: theme.textSecondary }]}>Principal</Text>
                    <Text style={[styles.historyValue, { color: theme.text }]}>{formatAmount(payment.principal)}</Text>
                  </View>

                  <View style={styles.historyRow}>
                    <Text style={[styles.historyLabel, { color: theme.textSecondary }]}>Interest</Text>
                    <Text style={[styles.historyValue, { color: theme.text }]}>{formatAmount(payment.interest)}</Text>
                  </View>

                  <View style={[styles.historyRow, styles.historyRowBold]}>
                    <Text style={[styles.historyLabel, { color: theme.text }]}>Remaining Balance</Text>
                    <Text style={[styles.historyValue, { color: theme.text }]}>{formatAmount(payment.remainingBalance)}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', margin: 16, gap: 12,
  },
  statCard: {
    flex: 1, minWidth: '45%', padding: 16, borderRadius: 16,
    borderWidth: 1.5,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  statIconBg: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  statLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  statValue: { fontSize: 18, fontWeight: 'bold', marginTop: 4 },
  tabContainer: {
    margin: 16, marginTop: 0, padding: 4, borderRadius: 16,
    flexDirection: 'row', borderWidth: 1.5,
  },
  tab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 10, borderRadius: 12, gap: 6,
  },
  activeTab: {},
  tabText: { fontSize: 13, fontWeight: '600' },
  section: {
    margin: 16, marginTop: 12, padding: 20, borderRadius: 20,
    borderWidth: 1.5,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', letterSpacing: -0.2, marginBottom: 16 },
  emptyState: { alignItems: 'center', padding: 40, marginTop: 16 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 16 },
  emptySubtitle: { fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  loanCard: {
    padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1,
  },
  loanHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  loanTitle: { fontSize: 16, fontWeight: 'bold' },
  loanProgress: { fontSize: 13, fontWeight: '600' },
  progressBarContainer: { marginBottom: 12 },
  progressBar: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  loanStats: { flexDirection: 'row', justifyContent: 'space-between' },
  loanStat: { flex: 1 },
  loanStatLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  loanStatValue: { fontSize: 14, fontWeight: 'bold', marginTop: 4 },
  historyCard: {
    padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1,
  },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  historyDate: { fontSize: 15, fontWeight: 'bold' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  historyRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  historyRowBold: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' },
  historyLabel: { fontSize: 13, fontWeight: '600' },
  historyValue: { fontSize: 14, fontWeight: 'bold' },
});
