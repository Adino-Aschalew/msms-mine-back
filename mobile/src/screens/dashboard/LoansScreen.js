import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, Modal, TextInput, Alert, TouchableOpacity, ActivityIndicator, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { employeeService, formatAmount, formatDate } from '../../services/employeeService';
import { ScreenScroll, LoadingState, ErrorState, EmptyState } from '../../components/ui';

export default function LoansScreen({ embedded = false }) {
  const { theme } = useTheme();
  const [applications, setApplications] = useState([]);
  const [loans, setLoans] = useState([]);
  const [eligibility, setEligibility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [loanSchedule, setLoanSchedule] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [duration, setDuration] = useState('12');
  const [monthlyIncome, setMonthlyIncome] = useState('');

  const load = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError(null);
    try {
      const [apps, myLoans, elig] = await Promise.all([
        employeeService.getMyApplications(),
        employeeService.getMyLoans(),
        employeeService.checkEligibility(),
      ]);
      setApplications(apps);
      setLoans(myLoans);
      setEligibility(elig);
    } catch (err) {
      setError(err.message || 'Network Error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleApply = async () => {
    if (!amount || !purpose || !duration || !monthlyIncome) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    const reqAmount = parseFloat(amount);
    const dur = parseInt(duration, 10);
    if (Number.isNaN(reqAmount) || reqAmount <= 0) {
      Alert.alert('Error', 'Enter a valid amount');
      return;
    }
    if (Number.isNaN(dur) || dur < 6 || dur > 60) {
      Alert.alert('Error', 'Duration must be 6–60 months');
      return;
    }
    setSubmitting(true);
    try {
      await employeeService.applyForLoan({
        requested_amount: reqAmount,
        purpose,
        repayment_duration_months: dur,
        monthly_income: parseFloat(monthlyIncome),
      });
      Alert.alert('Success', 'Loan application submitted.');
      setShowApplyModal(false);
      setAmount('');
      setPurpose('');
      setDuration('12');
      setMonthlyIncome('');
      load(true);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewSchedule = async (loan) => {
    try {
      const detail = await employeeService.getLoanDetail(loan.id);
      setLoanSchedule(detail?.schedule || []);
      setShowScheduleModal(true);
    } catch {
      Alert.alert('Error', 'Could not load repayment schedule');
    }
  };

  const isEligible = eligibility?.isEligible ?? eligibility?.is_eligible;

  const getStatusColor = (status) => {
    const s = String(status || '').toUpperCase();
    if (['APPROVED', 'ACTIVE', 'COMPLETED', 'DISBURSED'].includes(s)) return theme.accent;
    if (['PENDING', 'UNDER_REVIEW'].includes(s)) return '#f59e0b';
    if (['REJECTED', 'DEFAULTED'].includes(s)) return '#ef4444';
    return theme.textMuted;
  };

  if (loading) return <LoadingState message="Loading loans..." />;
  if (error && !eligibility && loans.length === 0) return <ErrorState message={error} onRetry={load} />;

  const content = (
    <>
      {eligibility ? (
        <View style={[styles.eligCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.eligRow}>
            <Ionicons name={isEligible ? 'checkmark-circle' : 'alert-circle'} size={28} color={isEligible ? theme.accent : '#ef4444'} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.eligTitle, { color: theme.text }]}>{isEligible ? 'Eligible for a loan' : 'Not eligible yet'}</Text>
              <Text style={[styles.eligSub, { color: theme.textSecondary }]}>
                Max {formatAmount(eligibility.maxLoanAmount || eligibility.max_loan_amount)} ETB
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.applyBtn, { backgroundColor: isEligible ? theme.primary : theme.border }]}
              onPress={() => setShowApplyModal(true)}
              disabled={!isEligible}
            >
              <Text style={[styles.applyBtnText, { color: isEligible ? '#fff' : theme.textMuted }]}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      <Text style={[styles.sectionTitle, { color: theme.text }]}>Active loans</Text>
      {loans.length === 0 ? (
        <EmptyState icon="wallet-outline" title="No active loans" subtitle="Approved loans will appear here." />
      ) : (
        loans.map((loan, i) => (
          <View key={loan.id || i} style={[styles.loanCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.loanHeader}>
              <Text style={[styles.loanAmount, { color: theme.text }]}>
                {formatAmount(loan.remaining_balance || loan.outstanding_balance)} ETB
              </Text>
              <Text style={[styles.badge, { color: getStatusColor(loan.status) }]}>{loan.status}</Text>
            </View>
            <Text style={[styles.loanMeta, { color: theme.textSecondary }]}>
              Principal {formatAmount(loan.loan_amount)} · {loan.duration_months || '—'} mo · {loan.interest_rate || 0}%
            </Text>
            <TouchableOpacity style={[styles.linkBtn, { borderColor: theme.border }]} onPress={() => handleViewSchedule(loan)}>
              <Ionicons name="calendar-outline" size={16} color={theme.primary} />
              <Text style={[styles.linkText, { color: theme.primary }]}>View schedule</Text>
            </TouchableOpacity>
          </View>
        ))
      )}

      <Text style={[styles.sectionTitle, { color: theme.text }]}>Applications</Text>
      {applications.length === 0 ? (
        <EmptyState icon="document-text-outline" title="No applications" subtitle="Submitted requests appear here." />
      ) : (
        applications.map((app, i) => (
          <View key={app.id || i} style={[styles.appCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.loanAmount, { color: theme.text }]}>{formatAmount(app.requested_amount)} ETB</Text>
            <Text style={[styles.loanMeta, { color: theme.textSecondary }]}>{app.purpose}</Text>
            <View style={styles.appFooter}>
              <Text style={[styles.loanMeta, { color: theme.textMuted }]}>{formatDate(app.created_at)}</Text>
              <Text style={[styles.badge, { color: getStatusColor(app.status) }]}>{app.status}</Text>
            </View>
          </View>
        ))
      )}

      <Modal visible={showApplyModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Apply for loan</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Field label="Amount (ETB)" value={amount} onChangeText={setAmount} theme={theme} />
              <Field label="Monthly income (ETB)" value={monthlyIncome} onChangeText={setMonthlyIncome} theme={theme} />
              <Field label="Duration (months)" value={duration} onChangeText={setDuration} theme={theme} />
              <Field label="Purpose" value={purpose} onChangeText={setPurpose} theme={theme} multiline />
              <TouchableOpacity style={[styles.submitBtn, { backgroundColor: theme.primary }]} onPress={handleApply} disabled={submitting}>
                {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Submit</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={showScheduleModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: theme.card, maxHeight: '75%' }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Repayment schedule</Text>
            <ScrollView>
              {loanSchedule.length === 0 ? (
                <Text style={[styles.loanMeta, { color: theme.textMuted, textAlign: 'center', marginTop: 20 }]}>No schedule available</Text>
              ) : (
                loanSchedule.map((item, idx) => (
                  <View key={idx} style={[styles.scheduleRow, { borderBottomColor: theme.border }]}>
                    <Text style={{ color: theme.textMuted, width: 28 }}>{item.installment_no || idx + 1}</Text>
                    <Text style={{ flex: 1, color: theme.text }}>{formatDate(item.due_date)}</Text>
                    <Text style={{ color: theme.text, fontWeight: 'bold' }}>{formatAmount(item.amount)}</Text>
                  </View>
                ))
              )}
            </ScrollView>
            <TouchableOpacity style={[styles.submitBtn, { backgroundColor: theme.border, marginTop: 12 }]} onPress={() => setShowScheduleModal(false)}>
              <Text style={[styles.submitText, { color: theme.text }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );

  if (embedded) {
    return (
      <ScreenScroll refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} contentStyle={{ paddingTop: 8 }}>
        {content}
      </ScreenScroll>
    );
  }

  return (
    <ScreenScroll refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }}>
      {content}
    </ScreenScroll>
  );
}

function Field({ label, theme, multiline, ...props }) {
  return (
    <>
      <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          multiline && styles.textArea,
          { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text },
        ]}
        placeholderTextColor={theme.textMuted}
        multiline={multiline}
        {...props}
      />
    </>
  );
}

const styles = StyleSheet.create({
  eligCard: { padding: 16, borderRadius: 18, borderWidth: 1, marginBottom: 14 },
  eligRow: { flexDirection: 'row', alignItems: 'center' },
  eligTitle: { fontSize: 15, fontWeight: 'bold' },
  eligSub: { fontSize: 13, marginTop: 2 },
  applyBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  applyBtnText: { fontWeight: 'bold', fontSize: 13 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, marginTop: 6 },
  loanCard: { padding: 16, borderRadius: 18, borderWidth: 1, marginBottom: 10 },
  loanHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  loanAmount: { fontSize: 20, fontWeight: 'bold' },
  badge: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  loanMeta: { fontSize: 13, marginTop: 4 },
  linkBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12,
    paddingVertical: 8, borderTopWidth: 1, borderColor: 'transparent',
  },
  linkText: { fontSize: 13, fontWeight: '700' },
  appCard: { padding: 14, borderRadius: 16, borderWidth: 1, marginBottom: 8 },
  appFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  modal: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 32 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  fieldLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginTop: 10, marginBottom: 6 },
  input: { borderWidth: 1.5, borderRadius: 14, padding: 14, fontSize: 16 },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  submitBtn: { padding: 16, borderRadius: 14, alignItems: 'center', marginTop: 16 },
  submitText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  scheduleRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
});
