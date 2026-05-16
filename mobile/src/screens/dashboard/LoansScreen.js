import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, RefreshControl,
  ActivityIndicator, TouchableOpacity, Modal, TextInput, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/axios';

export default function LoansScreen() {
  const [applications, setApplications] = useState([]);
  const [loans, setLoans] = useState([]);
  const [eligibility, setEligibility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showTxnModal, setShowTxnModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [loanSchedule, setLoanSchedule] = useState([]);
  const [loanTransactions, setLoanTransactions] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Apply form
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [duration, setDuration] = useState('12');
  const [monthlyIncome, setMonthlyIncome] = useState('');

  const fetchData = async () => {
    try {
      const [appRes, loanRes, eligRes] = await Promise.all([
        api.get('/loans/my-applications'),
        api.get('/loans/my-loans'),
        api.get('/loans/check-eligibility'),
      ]);
      if (appRes.data.success) setApplications(appRes.data.data || []);
      if (loanRes.data.success) setLoans(loanRes.data.data || []);
      if (eligRes.data.success) setEligibility(eligRes.data.data);
    } catch (error) {
      console.error('Loans fetch error:', error.response?.data || error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);
  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const handleApply = async () => {
    if (!amount || !purpose || !duration || !monthlyIncome) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    const reqAmount = parseFloat(amount);
    if (isNaN(reqAmount) || reqAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    const dur = parseInt(duration);
    if (isNaN(dur) || dur < 6 || dur > 60) {
      Alert.alert('Error', 'Duration must be between 6 and 60 months');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/loans/apply', {
        requested_amount: reqAmount,
        purpose,
        repayment_duration_months: dur,
        monthly_income: parseFloat(monthlyIncome),
      });
      if (res.data.success) {
        Alert.alert('Success', 'Loan application submitted successfully!');
        setShowApplyModal(false);
        setAmount(''); setPurpose(''); setDuration('12'); setMonthlyIncome('');
        fetchData();
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewSchedule = async (loan) => {
    setSelectedLoan(loan);
    setLoading(true);
    try {
      const res = await api.get(`/loans/my-loans/${loan.id}`);
      if (res.data.success) {
        setLoanSchedule(res.data.data.schedule || []);
        setShowScheduleModal(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch repayment schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleViewTransactions = async (loan) => {
    setSelectedLoan(loan);
    setLoading(true);
    try {
      const res = await api.get(`/loans/my-transactions?loanId=${loan.id}`);
      if (res.data.success) {
        setLoanTransactions(res.data.data || []);
        setShowTxnModal(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch loan transactions');
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (v) => {
    const num = parseFloat(v);
    if (isNaN(num)) return '0.00';
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatDate = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED': case 'ACTIVE': case 'COMPLETED': case 'DISBURSED': return '#10b981';
      case 'PENDING': case 'UNDER_REVIEW': return '#f59e0b';
      case 'REJECTED': case 'DEFAULTED': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#2563eb" /></View>;
  }

  return (
    <View style={styles.container}>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        
        {/* Eligibility Card - Premium Status */}
        {eligibility && (
          <View style={styles.eligibilityCard}>
            <View style={styles.eligTop}>
              <View style={[styles.eligIconBg, { backgroundColor: (eligibility.isEligible || eligibility.is_eligible) ? '#10b981' : '#ef4444' }]}>
                <Ionicons name={(eligibility.isEligible || eligibility.is_eligible) ? 'checkmark-circle' : 'alert-circle'} size={24} color="#fff" />
              </View>
              <View style={styles.eligTextContainer}>
                <Text style={styles.eligTitle}>Loan Eligibility</Text>
                <Text style={[styles.eligStatus, { color: (eligibility.isEligible || eligibility.is_eligible) ? '#10b981' : '#ef4444' }]}>
                  {(eligibility.isEligible || eligibility.is_eligible) ? 'Verified Eligible' : 'Not Eligible Currently'}
                </Text>
              </View>
            </View>
            
            <View style={styles.eligDivider} />
            
            <View style={styles.eligBottom}>
              <View>
                <Text style={styles.eligLabel}>Maximum Limit</Text>
                <Text style={styles.eligValue}>{formatAmount(eligibility.maxLoanAmount || eligibility.max_loan_amount)} <Text style={styles.eligCurrency}>ETB</Text></Text>
              </View>
              <TouchableOpacity 
                style={[styles.applyBtnSmall, !(eligibility.isEligible || eligibility.is_eligible) && styles.disabledApplyBtn]} 
                onPress={() => setShowApplyModal(true)}
                disabled={!(eligibility.isEligible || eligibility.is_eligible)}
              >
                <Text style={styles.applyBtnTextSmall}>Apply Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Active Loans */}
        <Text style={styles.sectionTitle}>My Active Loans</Text>
        {!Array.isArray(loans) || loans.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="wallet-outline" size={40} color="#94a3b8" />
            </View>
            <Text style={styles.emptyTitle}>No Active Loans</Text>
            <Text style={styles.emptySubtitle}>When you have an active loan, it will appear here.</Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {loans.map((loan, i) => (
              <View key={loan.id || i} style={styles.loanCard}>
                <View style={styles.loanCardHeader}>
                  <View>
                    <Text style={styles.loanCardLabel}>Active Loan Balance</Text>
                    <Text style={styles.loanCardAmount}>{formatAmount(loan.remaining_balance)} <Text style={styles.loanCurrency}>ETB</Text></Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(loan.status) + '15' }]}>
                    <Text style={[styles.statusBadgeText, { color: getStatusColor(loan.status) }]}>{loan.status}</Text>
                  </View>
                </View>
                
                <View style={styles.loanStatsGrid}>
                  <View style={styles.loanStatItem}>
                    <Text style={styles.loanStatLabel}>Original Loan</Text>
                    <Text style={styles.loanStatValue}>{formatAmount(loan.loan_amount)}</Text>
                  </View>
                  <View style={styles.loanStatItem}>
                    <Text style={styles.loanStatLabel}>Monthly Repayment</Text>
                    <Text style={styles.loanStatValue}>{formatAmount(loan.monthly_repayment)}</Text>
                  </View>
                  <View style={styles.loanStatItem}>
                    <Text style={styles.loanStatLabel}>Rate</Text>
                    <Text style={styles.loanStatValue}>{loan.interest_rate}%</Text>
                  </View>
                  <View style={styles.loanStatItem}>
                    <Text style={styles.loanStatLabel}>Duration</Text>
                    <Text style={styles.loanStatValue}>{loan.duration_months} Mo</Text>
                  </View>
                </View>

                <View style={styles.progressContainer}>
                  <View style={styles.progressLabelRow}>
                    <Text style={styles.progressLabel}>Repayment Progress</Text>
                    <Text style={styles.progressPercent}>
                      {Math.round((1 - (loan.remaining_balance / (loan.loan_amount * (1 + (loan.interest_rate/100))))) * 100)}%
                    </Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${Math.min(100, Math.round((1 - (loan.remaining_balance / (loan.loan_amount * (1 + (loan.interest_rate/100))))) * 100))}%` }]} />
                  </View>
                </View>

                <View style={styles.loanActions}>
                  <TouchableOpacity style={[styles.loanActionBtn, { backgroundColor: '#f8fafc' }]} onPress={() => handleViewSchedule(loan)}>
                    <Ionicons name="calendar-outline" size={18} color="#2563eb" />
                    <Text style={[styles.loanActionText, { color: '#2563eb' }]}>Schedule</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.loanActionBtn, { backgroundColor: '#f8fafc' }]} onPress={() => handleViewTransactions(loan)}>
                    <Ionicons name="list-outline" size={18} color="#64748b" />
                    <Text style={[styles.loanActionText, { color: '#64748b' }]}>History</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Applications */}
        <Text style={styles.sectionTitle}>My Applications</Text>
        {!Array.isArray(applications) || applications.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="document-text-outline" size={40} color="#94a3b8" />
            </View>
            <Text style={styles.emptyTitle}>No Applications</Text>
            <Text style={styles.emptySubtitle}>Your submitted loan requests will show here.</Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {applications.map((app, i) => (
              <View key={app.id || i} style={styles.appCard}>
                <View style={styles.appHeader}>
                  <View style={styles.appInfo}>
                    <Text style={styles.appAmount}>{formatAmount(app.requested_amount)} <Text style={styles.appCurrency}>ETB</Text></Text>
                    <Text style={styles.appPurpose}>{app.purpose}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(app.status) + '15' }]}>
                    <Text style={[styles.statusBadgeText, { color: getStatusColor(app.status) }]}>{app.status}</Text>
                  </View>
                </View>
                <View style={styles.appFooter}>
                  <Text style={styles.appDate}>Submitted on {formatDate(app.created_at)}</Text>
                  <Ionicons name="time-outline" size={14} color="#94a3b8" />
                </View>
              </View>
            ))}
          </View>
        )}
        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Apply Modal */}
      <Modal visible={showApplyModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Apply for Loan</Text>
              <TouchableOpacity onPress={() => setShowApplyModal(false)}>
                <Ionicons name="close-circle" size={28} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Requested Amount (ETB)</Text>
              <TextInput style={styles.input} keyboardType="numeric" placeholder="e.g. 50000" value={amount} onChangeText={setAmount} />

              <Text style={styles.inputLabel}>Monthly Income (ETB)</Text>
              <TextInput style={styles.input} keyboardType="numeric" placeholder="e.g. 15000" value={monthlyIncome} onChangeText={setMonthlyIncome} />

              <Text style={styles.inputLabel}>Repayment Duration (Months)</Text>
              <TextInput style={styles.input} keyboardType="numeric" placeholder="6 - 60 months" value={duration} onChangeText={setDuration} />

              <Text style={styles.inputLabel}>Purpose</Text>
              <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]} multiline placeholder="Describe the purpose of the loan" value={purpose} onChangeText={setPurpose} />

              <TouchableOpacity style={styles.submitBtn} onPress={handleApply} disabled={submitting}>
                {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Submit Application</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Schedule Modal */}
      <Modal visible={showScheduleModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '80%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Repayment Schedule</Text>
              <TouchableOpacity onPress={() => setShowScheduleModal(false)}>
                <Ionicons name="close-circle" size={28} color="#9ca3af" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeadCell, { flex: 0.5 }]}>#</Text>
                <Text style={styles.tableHeadCell}>Due Date</Text>
                <Text style={styles.tableHeadCell}>Amount</Text>
                <Text style={styles.tableHeadCell}>Status</Text>
              </View>
              {loanSchedule.map((item, idx) => (
                <View key={idx} style={[styles.tableRow, idx % 2 === 0 && { backgroundColor: '#f8fafc' }]}>
                  <Text style={[styles.tableCell, { flex: 0.5, color: '#94a3b8' }]}>{item.installment_no || idx + 1}</Text>
                  <Text style={styles.tableCell}>{formatDate(item.due_date)}</Text>
                  <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>{formatAmount(item.amount)}</Text>
                  <Text style={[styles.tableCell, { color: getStatusColor(item.status), fontWeight: '600', fontSize: 10 }]}>{item.status}</Text>
                </View>
              ))}
              {loanSchedule.length === 0 && <Text style={styles.emptyTableText}>No schedule data available</Text>}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Transactions Modal */}
      <Modal visible={showTxnModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '80%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Payment History</Text>
              <TouchableOpacity onPress={() => setShowTxnModal(false)}>
                <Ionicons name="close-circle" size={28} color="#9ca3af" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {loanTransactions.map((txn, idx) => (
                <View key={txn.id || idx} style={styles.txnItem}>
                  <View style={styles.txnIcon}>
                    <Ionicons name="cash-outline" size={20} color="#10b981" />
                  </View>
                  <View style={styles.txnInfo}>
                    <Text style={styles.txnLabel}>Repayment</Text>
                    <Text style={styles.txnDate}>{formatDate(txn.transaction_date)}</Text>
                  </View>
                  <Text style={styles.txnAmount}>-{formatAmount(txn.amount)}</Text>
                </View>
              ))}
              {loanTransactions.length === 0 && (
                <View style={styles.emptyTableState}>
                  <Ionicons name="receipt-outline" size={40} color="#cbd5e1" />
                  <Text style={styles.emptyTableText}>No payments recorded yet</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
  eligibilityCard: {
    backgroundColor: '#fff', margin: 16, padding: 20, borderRadius: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 15, elevation: 4,
    borderWidth: 1, borderColor: '#f1f5f9',
  },
  eligTop: { flexDirection: 'row', alignItems: 'center' },
  eligIconBg: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  eligTextContainer: { marginLeft: 16 },
  eligTitle: { fontSize: 13, fontWeight: '700', color: '#64748b', textTransform: 'uppercase' },
  eligStatus: { fontSize: 16, fontWeight: 'bold', marginTop: 2 },
  eligDivider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 20 },
  eligBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  eligLabel: { fontSize: 12, color: '#94a3b8', fontWeight: '600' },
  eligValue: { fontSize: 22, fontWeight: 'bold', color: '#1e293b', marginTop: 2 },
  eligCurrency: { fontSize: 14, color: '#94a3b8' },
  applyBtnSmall: { backgroundColor: '#2563eb', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  disabledApplyBtn: { backgroundColor: '#cbd5e1' },
  applyBtnTextSmall: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', paddingHorizontal: 20, paddingTop: 24, paddingBottom: 12 },
  emptyState: { alignItems: 'center', padding: 40, marginTop: 10 },
  emptyIconCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 16, fontWeight: 'bold', color: '#334155' },
  emptySubtitle: { fontSize: 13, color: '#94a3b8', textAlign: 'center', marginTop: 4 },
  listContainer: { paddingHorizontal: 16 },
  loanCard: {
    backgroundColor: '#fff', padding: 20, borderRadius: 24, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 1,
    borderWidth: 1, borderColor: '#f1f5f9',
  },
  loanCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  loanCardLabel: { fontSize: 12, color: '#94a3b8', fontWeight: '600' },
  loanCardAmount: { fontSize: 24, fontWeight: 'bold', color: '#1e293b', marginTop: 2 },
  loanCurrency: { fontSize: 14, color: '#94a3b8' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusBadgeText: { fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' },
  loanStatsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 20, gap: 12 },
  loanStatItem: { width: '47%', backgroundColor: '#f8fafc', padding: 12, borderRadius: 12 },
  loanStatLabel: { fontSize: 11, color: '#94a3b8', fontWeight: '600' },
  loanStatValue: { fontSize: 14, fontWeight: 'bold', color: '#1e293b', marginTop: 2 },
  progressContainer: { marginTop: 20 },
  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel: { fontSize: 12, color: '#64748b', fontWeight: '600' },
  progressPercent: { fontSize: 12, color: '#2563eb', fontWeight: 'bold' },
  progressBar: { height: 8, backgroundColor: '#f1f5f9', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#2563eb', borderRadius: 4 },
  appCard: {
    backgroundColor: '#fff', padding: 16, borderRadius: 20, marginBottom: 12,
    borderWidth: 1, borderColor: '#f1f5f9',
  },
  appHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  appInfo: { flex: 1 },
  appAmount: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  appCurrency: { fontSize: 12, color: '#94a3b8' },
  appPurpose: { fontSize: 14, color: '#64748b', marginTop: 4 },
  appFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f8fafc' },
  appDate: { fontSize: 12, color: '#94a3b8' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#1e293b' },
  inputLabel: { fontSize: 13, color: '#64748b', fontWeight: '700', textTransform: 'uppercase', marginBottom: 8, marginTop: 16 },
  input: {
    borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 16, padding: 14,
    fontSize: 16, backgroundColor: '#f8fafc', color: '#1e293b',
  },
  submitBtn: {
    backgroundColor: '#2563eb', padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 28, marginBottom: 10,
    shadowColor: '#2563eb', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 4,
  },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  loanActions: { flexDirection: 'row', gap: 10, marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  loanActionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10, gap: 6 },
  loanActionText: { fontSize: 13, fontWeight: 'bold' },
  tableHeader: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e2e8f0', backgroundColor: '#f8fafc', paddingHorizontal: 10, borderRadius: 8 },
  tableHeadCell: { flex: 1, fontSize: 11, fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' },
  tableRow: { flexDirection: 'row', paddingVertical: 14, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', alignItems: 'center' },
  tableCell: { flex: 1, fontSize: 13, color: '#1e293b' },
  emptyTableText: { textAlign: 'center', color: '#94a3b8', marginTop: 30, fontSize: 14 },
  emptyTableState: { alignItems: 'center', marginTop: 40 },
  txnItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  txnIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#ecfdf5', justifyContent: 'center', alignItems: 'center' },
  txnInfo: { flex: 1, marginLeft: 12 },
  txnLabel: { fontSize: 15, fontWeight: 'bold', color: '#1e293b' },
  txnDate: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  txnAmount: { fontSize: 16, fontWeight: 'bold', color: '#ef4444' },
});
