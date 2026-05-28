import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, Modal, TextInput, Alert, TouchableOpacity, ActivityIndicator, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { employeeService, formatAmount, formatDate } from '../../services/employeeService';
import {
  ScreenScroll, Card, StatCard, Badge, Button, SectionLabel, LoadingState, ErrorState, EmptyState, ScreenHeader
} from '../../components/ui';

export default function LoansScreen({ navigation, embedded = false }) {
  const { theme } = useTheme();
  const { user } = useAuth();
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
  const [downloading, setDownloading] = useState(false);
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [duration, setDuration] = useState('12');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [guarantorError, setGuarantorError] = useState('');

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
    if (!amount || !purpose || !duration) {
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
        loan_amount: reqAmount,
        loan_purpose: purpose,
        loan_term_months: dur,
        guarantor_details: guarantorInfo ? JSON.stringify([{
          type: 'internal',
          employeeId: guarantorId,
          relationship: 'Colleague'
        }]) : undefined,
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

  const getStatusColor = (status) => {
    const s = String(status || '').toUpperCase();
    if (['APPROVED', 'ACTIVE', 'COMPLETED', 'DISBURSED'].includes(s)) return theme.accent;
    if (['PENDING', 'UNDER_REVIEW'].includes(s)) return '#f59e0b';
    if (['REJECTED', 'DEFAULTED'].includes(s)) return '#ef4444';
    return theme.textMuted;
  };

  const [step, setStep] = useState(1);
  const [guarantorId, setGuarantorId] = useState('');
  const [validatingGuarantor, setValidatingGuarantor] = useState(false);
  const [guarantorInfo, setGuarantorInfo] = useState(null);

  const calculateRepayment = () => {
    const amt = parseFloat(amount) || 0;
    const dur = parseInt(duration, 10) || 1;
    const rate = 0.01; // Example 1% monthly interest
    if (amt <= 0) return 0;
    return (amt / dur) + (amt * rate);
  };

  const validateGuarantor = async () => {
    if (!guarantorId) return;

    // Block self-guarantor
    const myEmpId = user?.employee_id || user?.employeeId || '';
    if (guarantorId.toUpperCase() === String(myEmpId).toUpperCase()) {
      setGuarantorInfo(null);
      setGuarantorError('You cannot be your own guarantor');
      return;
    }

    setValidatingGuarantor(true);
    setGuarantorInfo(null);
    setGuarantorError('');
    try {
      const res = await employeeService.checkGuarantorCapacity(guarantorId, parseFloat(amount) || 0);
      if (res.eligible) {
        setGuarantorInfo({
          name: res.guarantor_data?.name || res.name || 'Employee',
          department: res.guarantor_data?.department || res.department || '',
        });
        setGuarantorError('');
      } else {
        setGuarantorInfo(null);
        setGuarantorError(res.reason || 'This employee is not eligible as a guarantor');
      }
    } catch (err) {
      setGuarantorInfo(null);
      setGuarantorError(err.response?.data?.message || err.message || 'Guarantor not found or ineligible');
    } finally {
      setValidatingGuarantor(false);
    }
  };

  if (loading) return <LoadingState message="Loading loans..." />;
  if (error && !eligibility && loans.length === 0) return <ErrorState message={error} onRetry={load} />;

  const isEligible = eligibility?.isEligible ?? eligibility?.is_eligible;
  const maxAmount = eligibility?.maxLoanAmount || eligibility?.max_loan_amount || 0;

  const content = (
    <>
      <ScreenHeader 
        title="Loans" 
        subtitle="Fueling your dreams" 
        backAction={embedded ? null : () => navigation.goBack()}
      />

      <View style={styles.scrollPadding}>
        <View style={[styles.eligCompact, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.eligHeader}>
            <View style={[styles.miniIconBg, { backgroundColor: isEligible ? theme.success + '10' : theme.danger + '10' }]}>
              <Ionicons 
                name={isEligible ? 'sparkles-outline' : 'alert-circle-outline'} 
                size={18} 
                color={isEligible ? theme.success : theme.danger} 
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.eligValue, { color: theme.text }]}>{formatAmount(maxAmount)}</Text>
              <Text style={[styles.eligLabel, { color: theme.textSecondary }]}>Maximum Eligibility</Text>
            </View>
            <Badge label={isEligible ? 'Eligible' : 'Locked'} type={isEligible ? 'success' : 'danger'} />
          </View>
          <Button 
            title="Start Application" 
            onPress={() => { setStep(1); setShowApplyModal(true); }}
            disabled={!isEligible}
            type={isEligible ? 'primary' : 'secondary'}
            style={{ marginTop: 16, height: 48 }}
          />
        </View>

        <SectionLabel>Active Loans</SectionLabel>
        {loans.length === 0 ? (
          <EmptyState icon="leaf-outline" title="No active loans" subtitle="Looking for a loan? Start your application above." />
        ) : (
          loans.map((loan, i) => (
            <View key={loan.id || i} style={[styles.loanCardCompact, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.loanTop}>
                <View>
                  <Text style={[styles.loanValueCompact, { color: theme.text }]}>
                    {formatAmount(loan.remaining_balance || loan.outstanding_balance)}
                  </Text>
                  <Text style={[styles.loanLabelCompact, { color: theme.textSecondary }]}>Remaining Balance</Text>
                </View>
                <TouchableOpacity style={styles.iconAction} onPress={() => handleViewSchedule(loan)}>
                  <Ionicons name="calendar-outline" size={20} color={theme.primary} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.progressSection}>
                <View style={[styles.progressBar, { backgroundColor: theme.cardElevated }]}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { backgroundColor: theme.primary, width: `${(loan.paid_amount / loan.loan_amount) * 100}%` }
                    ]} 
                  />
                </View>
                <View style={styles.progressInfo}>
                  <Text style={[styles.progressText, { color: theme.textSecondary }]}>
                    {loan.duration_months} Months · Term
                  </Text>
                  <Text style={[styles.progressText, { color: theme.textSecondary }]}>
                    {((loan.paid_amount / loan.loan_amount) * 100).toFixed(0)}% Repaid
                  </Text>
                </View>
                <View style={styles.loanActionRow}>
                  <Button 
                    title="Repayment Portal" 
                    onPress={() => navigation.navigate('Repay', { loanId: loan.id })} 
                    type="outline" 
                    style={{ flex: 1, height: 40 }}
                    icon="card-outline"
                  />
                  <TouchableOpacity 
                    style={[styles.downloadBtn, { borderColor: theme.border }]}
                    onPress={async () => {
                      setDownloading(true);
                      try {
                        const token = await SecureStore.getItemAsync('token');
                        const url = employeeService.getLoanAgreementPdfUrl(loan.id);
                        const filename = `loan-agreement-${loan.id}.pdf`;
                        const fileUri = FileSystem.cacheDirectory + filename;

                        const downloadRes = await FileSystem.downloadAsync(url, fileUri, {
                          headers: { 'Authorization': `Bearer ${token}` }
                        });

                        if (downloadRes.status === 200) {
                          await Sharing.shareAsync(downloadRes.uri);
                        } else {
                          Alert.alert('Error', 'Failed to generate PDF');
                        }
                      } catch (err) {
                        Alert.alert('Error', 'Download failed: ' + err.message);
                      } finally {
                        setDownloading(false);
                      }
                    }}
                  >
                    {downloading ? <ActivityIndicator size="small" color={theme.primary} /> : <Ionicons name="document-attach-outline" size={20} color={theme.primary} />}
                  </TouchableOpacity>
                </View>
              </View>
            </View> // loanCardCompact end
          ))
        )}

        <SectionLabel>My Applications</SectionLabel>
        {applications.length === 0 ? (
          <EmptyState icon="document-text-outline" title="Nothing pending" />
        ) : (
          applications.map((app, i) => (
            <Card key={app.id || i} style={styles.appCard}>
              <View style={styles.appRow}>
                <View style={[styles.appIcon, { backgroundColor: theme.cardElevated }]}>
                  <Ionicons name="document-text" size={20} color={theme.textMuted} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.appTitle, { color: theme.text }]}>{formatAmount(app.requested_amount)} ETB</Text>
                  <Text style={[styles.appDate, { color: theme.textSecondary }]}>{formatDate(app.created_at)}</Text>
                </View>
                <Badge label={app.status} type={app.status === 'APPROVED' ? 'success' : 'warning'} />
              </View>
            </Card>
          ))
        )}
      </View>
      <View style={{ height: 100 }} />

      <Modal visible={showApplyModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Apply for Loan</Text>
              <TouchableOpacity onPress={() => setShowApplyModal(false)}>
                <Ionicons name="close" size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            {step === 1 && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={[styles.stepTitle, { color: theme.textSecondary }]}>Step 1: Details & Purpose</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
                  placeholder="Amount (ETB)"
                  placeholderTextColor={theme.textMuted}
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                />
                <TextInput
                  style={[styles.input, styles.textArea, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
                  placeholder="Purpose of Loan"
                  placeholderTextColor={theme.textMuted}
                  multiline
                  value={purpose}
                  onChangeText={setPurpose}
                />
                <TextInput
                  style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
                  placeholder="Duration (Months, e.g. 12)"
                  placeholderTextColor={theme.textMuted}
                  keyboardType="numeric"
                  value={duration}
                  onChangeText={setDuration}
                />
                
                <View style={[styles.calcBox, { backgroundColor: theme.primary + '08' }]}>
                  <Text style={[styles.calcLabel, { color: theme.textSecondary }]}>Estimated Monthly Repayment</Text>
                  <Text style={[styles.calcValue, { color: theme.primary }]}>{formatAmount(calculateRepayment())} ETB</Text>
                </View>
                
                <Button title="Next Step" onPress={() => setStep(2)} style={{ marginTop: 12 }} />
              </ScrollView>
            )}

            {step === 2 && (
              <View>
                <Text style={[styles.stepTitle, { color: theme.textSecondary }]}>Step 2: Internal Guarantor</Text>
                <Text style={[styles.modalSub, { color: theme.textSecondary }]}>
                  Provide the Employee ID of a colleague who will act as your guarantor. They must not already be guaranteeing another active loan.
                </Text>
                <View style={styles.searchRow}>
                  <TextInput
                    style={[styles.input, { flex: 1, marginBottom: 0, backgroundColor: theme.inputBg, borderColor: guarantorError ? '#ef4444' : theme.inputBorder, color: theme.text }]}
                    placeholder="Colleague ID (e.g. EMP102)"
                    placeholderTextColor={theme.textMuted}
                    value={guarantorId}
                    onChangeText={(t) => { setGuarantorId(t); setGuarantorError(''); setGuarantorInfo(null); }}
                    autoCapitalize="characters"
                  />
                  <TouchableOpacity 
                    onPress={validateGuarantor}
                    style={[styles.searchBtn, { backgroundColor: theme.primary + '15' }]}
                  >
                    {validatingGuarantor ? <ActivityIndicator size="small" color={theme.primary} /> : <Ionicons name="search" size={20} color={theme.primary} />}
                  </TouchableOpacity>
                </View>

                {guarantorError ? (
                  <View style={[styles.guarantorPreview, { borderColor: '#ef4444', backgroundColor: '#fef2f2' }]}>
                    <Ionicons name="close-circle" size={40} color="#ef4444" />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: '#ef4444' }}>Not Eligible</Text>
                      <Text style={{ fontSize: 12, color: '#b91c1c', marginTop: 2 }}>{guarantorError}</Text>
                    </View>
                  </View>
                ) : null}
                
                {guarantorInfo && (
                  <View style={[styles.guarantorPreview, { borderColor: theme.success }]}>
                    <Ionicons name="person-circle" size={40} color={theme.success} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={[styles.guarantorName, { color: theme.text }]}>{guarantorInfo.name}</Text>
                      <Text style={[styles.guarantorDept, { color: theme.textSecondary }]}>{guarantorInfo.department}</Text>
                    </View>
                    <Ionicons name="checkmark-done" size={24} color={theme.success} />
                  </View>
                )}
                
                <View style={styles.btnRow}>
                  <Button title="Back" type="secondary" onPress={() => setStep(1)} style={{ flex: 1 }} />
                  <Button 
                    title="Finish" 
                    onPress={handleApply} 
                    loading={submitting}
                    disabled={!guarantorInfo || submitting}
                    style={{ flex: 2 }} 
                  />
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      <Modal visible={showScheduleModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: theme.card, maxHeight: '80%' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Repayment Schedule</Text>
              <TouchableOpacity onPress={() => setShowScheduleModal(false)}>
                <Ionicons name="close" size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {loanSchedule.length === 0 ? (
                <EmptyState icon="calendar" title="No schedule available" />
              ) : (
                loanSchedule.map((item, idx) => (
                  <View key={idx} style={[styles.scheduleRow, { borderBottomColor: theme.border }]}>
                    <View style={styles.installmentBox}>
                      <Text style={[styles.installmentNo, { color: theme.textSecondary }]}>{item.installment_no || idx + 1}</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={[styles.itemLabel, { color: theme.textSecondary }]}>Due Date</Text>
                      <Text style={[styles.itemValue, { color: theme.text }]}>{formatDate(item.due_date)}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={[styles.itemLabel, { color: theme.textSecondary }]}>Amount</Text>
                      <Text style={[styles.itemValue, { color: theme.primary, fontWeight: '800' }]}>{formatAmount(item.amount)}</Text>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );

  return (
    <ScreenScroll refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} contentStyle={{ padding: 0 }}>
      {content}
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  scrollPadding: { paddingHorizontal: 20 },
  eligCompact: { padding: 20, borderRadius: 24, borderWidth: 1, marginTop: -24 },
  eligHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  eligLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  eligValue: { fontSize: 22, fontWeight: '800' },
  loanCardCompact: { padding: 16, borderRadius: 20, borderWidth: 1, marginBottom: 16 },
  loanTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  loanLabelCompact: { fontSize: 11, fontWeight: '600' },
  loanValueCompact: { fontSize: 24, fontWeight: '800' },
  iconAction: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center' },
  progressSection: { marginTop: 4 },
  progressInfo: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  progressText: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },
  progressBar: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  loanActionRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  downloadBtn: { width: 40, height: 40, borderRadius: 10, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  appCard: { padding: 16, marginBottom: 12 },
  appRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  appIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  appTitle: { fontSize: 16, fontWeight: '800' },
  appDate: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modal: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 22, fontWeight: '800' },
  modalSub: { fontSize: 14, marginBottom: 20, lineHeight: 20 },
  stepTitle: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', marginBottom: 16, letterSpacing: 1 },
  input: { height: 56, borderWidth: 1.5, borderRadius: 16, paddingHorizontal: 16, fontSize: 16, marginBottom: 16 },
  textArea: { height: 100, textAlignVertical: 'top', paddingTop: 16 },
  calcBox: { padding: 16, borderRadius: 16, marginBottom: 16 },
  calcLabel: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  calcValue: { fontSize: 20, fontWeight: '800' },
  searchRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  searchBtn: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  guarantorPreview: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 24 },
  guarantorName: { fontSize: 16, fontWeight: '800' },
  guarantorDept: { fontSize: 12, fontWeight: '600' },
  btnRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
  scheduleRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1 },
  installmentBox: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center' },
  installmentNo: { fontSize: 12, fontWeight: '700' },
  itemLabel: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', marginBottom: 2 },
  itemValue: { fontSize: 14, fontWeight: '700' },
});
