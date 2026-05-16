import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, Modal, TextInput, Alert, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { employeeService, formatAmount, formatDate } from '../../services/employeeService';
import { ScreenScroll, LoadingState, ErrorState, EmptyState } from '../../components/ui';

export default function SavingsScreen({ embedded = false }) {
  const { theme } = useTheme();
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [showPercentageModal, setShowPercentageModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [newPercentage, setNewPercentage] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawReason, setWithdrawReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError(null);
    try {
      const dashboard = await employeeService.getSavingsDashboard();
      const acc = dashboard?.account || dashboard || {};
      const txns = dashboard?.recentTransactions || await employeeService.getSavingsTransactions(1, 20);
      setAccount(acc);
      setTransactions(txns);
    } catch (err) {
      setError(err.message || 'Network Error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleUpdatePercentage = async () => {
    const pct = parseFloat(newPercentage);
    if (Number.isNaN(pct) || pct < 15 || pct > 65) {
      Alert.alert('Invalid', 'Percentage must be between 15% and 65%');
      return;
    }
    setSubmitting(true);
    try {
      await employeeService.updateSavingPercentage(pct);
      Alert.alert('Success', 'Savings percentage update requested.');
      setShowPercentageModal(false);
      setNewPercentage('');
      load(true);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update percentage');
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    const amt = parseFloat(withdrawAmount);
    if (Number.isNaN(amt) || amt <= 0) {
      Alert.alert('Error', 'Enter a valid amount');
      return;
    }
    if (amt > parseFloat(account?.current_balance || 0)) {
      Alert.alert('Error', 'Insufficient balance');
      return;
    }
    setSubmitting(true);
    try {
      await employeeService.withdrawSavings(amt, withdrawReason);
      Alert.alert('Success', 'Withdrawal request submitted.');
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      setWithdrawReason('');
      load(true);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Withdrawal failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState message="Loading savings..." />;
  if (error && !account) return <ErrorState message={error} onRetry={load} />;

  const content = (
    <>
      <View style={[styles.balanceCard, { backgroundColor: theme.headerBg }]}>
        <Text style={styles.balanceLabel}>Current balance</Text>
        <Text style={styles.balanceAmount}>{formatAmount(account?.current_balance)} <Text style={styles.balanceUnit}>ETB</Text></Text>
        <View style={styles.balanceMeta}>
          <Meta label="Interest" value={`+${formatAmount(account?.interest_earned)}`} />
          <Meta label="Rate" value={`${account?.saving_percentage || 0}%`} />
          <Meta label="Status" value={account?.account_status || 'N/A'} />
        </View>
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.btn, { backgroundColor: theme.accent }]} onPress={() => setShowWithdrawModal(true)}>
            <Ionicons name="arrow-down-circle-outline" size={18} color="#fff" />
            <Text style={styles.btnText}>Withdraw</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, { backgroundColor: theme.primary }]} onPress={() => setShowPercentageModal(true)}>
            <Ionicons name="options-outline" size={18} color="#fff" />
            <Text style={styles.btnText}>Adjust rate</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.text }]}>Transactions</Text>
      {transactions.length === 0 ? (
        <EmptyState title="No transactions" subtitle="Your savings activity will appear here." />
      ) : (
        transactions.slice(0, 20).map((txn, index) => {
          const isCredit = txn.transaction_type === 'CONTRIBUTION';
          return (
            <View key={txn.id || txn.transaction_id || index} style={[styles.txn, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={[styles.txnIcon, { backgroundColor: isCredit ? '#ecfdf5' : '#fef2f2' }]}>
                <Ionicons name={isCredit ? 'add-circle' : 'remove-circle'} size={22} color={isCredit ? theme.accent : '#ef4444'} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.txnType, { color: theme.text }]}>{txn.transaction_type}</Text>
                <Text style={[styles.txnDate, { color: theme.textSecondary }]}>{formatDate(txn.transaction_date)}</Text>
              </View>
              <Text style={{ color: isCredit ? theme.accent : '#ef4444', fontWeight: 'bold' }}>
                {isCredit ? '+' : '-'}{formatAmount(txn.amount)}
              </Text>
            </View>
          );
        })
      )}

      <Modal visible={showPercentageModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Change saving rate</Text>
            <Text style={[styles.modalSub, { color: theme.textSecondary }]}>Between 15% and 65% of salary</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
              keyboardType="numeric"
              placeholder="e.g. 25"
              placeholderTextColor={theme.textMuted}
              value={newPercentage}
              onChangeText={setNewPercentage}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: theme.border }]} onPress={() => setShowPercentageModal(false)}>
                <Text style={{ color: theme.textSecondary, fontWeight: 'bold' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: theme.primary }]} onPress={handleUpdatePercentage} disabled={submitting}>
                {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Submit</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showWithdrawModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Withdraw savings</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
              keyboardType="numeric"
              placeholder="Amount (ETB)"
              placeholderTextColor={theme.textMuted}
              value={withdrawAmount}
              onChangeText={setWithdrawAmount}
            />
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
              multiline
              placeholder="Reason (optional)"
              placeholderTextColor={theme.textMuted}
              value={withdrawReason}
              onChangeText={setWithdrawReason}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: theme.border }]} onPress={() => setShowWithdrawModal(false)}>
                <Text style={{ color: theme.textSecondary, fontWeight: 'bold' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: theme.accent }]} onPress={handleWithdraw} disabled={submitting}>
                {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Confirm</Text>}
              </TouchableOpacity>
            </View>
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

function Meta({ label, value }) {
  return (
    <View style={styles.metaItem}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  balanceCard: { borderRadius: 22, padding: 20, marginBottom: 16 },
  balanceLabel: { color: '#94a3b8', fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  balanceAmount: { color: '#fff', fontSize: 30, fontWeight: 'bold', marginTop: 4 },
  balanceUnit: { fontSize: 14, color: '#94a3b8' },
  balanceMeta: { flexDirection: 'row', marginTop: 16, gap: 12 },
  metaItem: { flex: 1 },
  metaLabel: { color: '#64748b', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  metaValue: { color: '#fff', fontSize: 14, fontWeight: 'bold', marginTop: 2 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 18 },
  btn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, padding: 12, borderRadius: 12 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  txn: {
    flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 16,
    marginBottom: 8, borderWidth: 1,
  },
  txnIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  txnType: { fontSize: 14, fontWeight: 'bold' },
  txnDate: { fontSize: 12, marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  modal: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 36 },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  modalSub: { fontSize: 13, marginTop: 4, marginBottom: 16 },
  input: { borderWidth: 1.5, borderRadius: 14, padding: 14, fontSize: 16, marginBottom: 12 },
  textArea: { minHeight: 72, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  modalBtn: { flex: 1, padding: 14, borderRadius: 14, alignItems: 'center' },
});
