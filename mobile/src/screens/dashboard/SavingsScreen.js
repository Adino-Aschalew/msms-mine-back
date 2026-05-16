import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, RefreshControl, 
  ActivityIndicator, FlatList, TouchableOpacity, Modal, TextInput, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/axios';

export default function SavingsScreen() {
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showPercentageModal, setShowPercentageModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [newPercentage, setNewPercentage] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawReason, setWithdrawReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [accRes, txnRes] = await Promise.all([
        api.get('/savings/account'),
        api.get('/savings/transactions'),
      ]);
      if (accRes.data.success) setAccount(accRes.data.data);
      if (txnRes.data.success) setTransactions(txnRes.data.data?.transactions || txnRes.data.data || []);
    } catch (error) {
      console.error('Savings fetch error:', error.response?.data || error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const handleUpdatePercentage = async () => {
    const pct = parseFloat(newPercentage);
    if (isNaN(pct) || pct < 15 || pct > 65) {
      Alert.alert('Invalid', 'Percentage must be between 15% and 65%');
      return;
    }
    setSubmitting(true);
    try {
      await api.put('/savings/account/percentage', { saving_percentage: pct });
      Alert.alert('Success', 'Savings percentage update requested!');
      setShowPercentageModal(false);
      setNewPercentage('');
      fetchData();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update percentage');
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    if (amt > account.current_balance) {
      Alert.alert('Error', 'Insufficient savings balance');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/savings/withdraw', { amount: amt, reason: withdrawReason });
      Alert.alert('Success', 'Withdrawal request submitted!');
      setShowWithdrawModal(false);
      setWithdrawAmount(''); setWithdrawReason('');
      fetchData();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Withdrawal failed');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatAmount = (amount) => {
    const num = parseFloat(amount);
    if (isNaN(num)) return '0.00';
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Account Summary - Premium Glass Card */}
        <View style={styles.premiumCard}>
          <View style={styles.cardTop}>
            <View>
              <Text style={styles.premiumLabel}>Current Balance</Text>
              <Text style={styles.premiumAmount}>{formatAmount(account?.current_balance)} <Text style={styles.premiumCurrency}>ETB</Text></Text>
            </View>
            <View style={[styles.statusBadge, account?.account_status === 'ACTIVE' ? styles.activeBadge : styles.frozenBadge]}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>{account?.account_status || 'N/A'}</Text>
            </View>
          </View>

          <View style={styles.premiumGrid}>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Interest Earned</Text>
              <Text style={[styles.gridValue, { color: '#4ade80' }]}>+{formatAmount(account?.interest_earned)}</Text>
            </View>
            <View style={styles.gridDivider} />
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Saving Rate</Text>
              <Text style={styles.gridValue}>{account?.saving_percentage || 0}%</Text>
            </View>
          </View>

          <View style={styles.premiumActions}>
            <TouchableOpacity 
              style={[styles.premiumActionBtn, { flex: 1, backgroundColor: '#10b981' }]} 
              onPress={() => setShowWithdrawModal(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-down-circle" size={18} color="#fff" />
              <Text style={styles.premiumActionText}>Withdraw</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.premiumActionBtn, { flex: 1.2, backgroundColor: '#2563eb' }]} 
              onPress={() => setShowPercentageModal(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="options-outline" size={18} color="#fff" />
              <Text style={styles.premiumActionText}>Adjust Plan</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Transactions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Transaction History</Text>
        </View>

        {!Array.isArray(transactions) || transactions.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="receipt-outline" size={40} color="#94a3b8" />
            </View>
            <Text style={styles.emptyTitle}>No Transactions</Text>
            <Text style={styles.emptySubtitle}>Your savings activity will appear here.</Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {transactions.slice(0, 20).map((txn, index) => (
              <View key={txn.id || index} style={styles.txnItem}>
                <View style={[
                  styles.txnIconBg, 
                  { backgroundColor: txn.transaction_type === 'CONTRIBUTION' ? '#ecfdf5' : '#fef2f2' }
                ]}>
                  <Ionicons
                    name={txn.transaction_type === 'CONTRIBUTION' ? 'add-circle' : 'remove-circle'}
                    size={24}
                    color={txn.transaction_type === 'CONTRIBUTION' ? '#10b981' : '#ef4444'}
                  />
                </View>
                <View style={styles.txnInfo}>
                  <Text style={styles.txnType}>{txn.transaction_type}</Text>
                  <Text style={styles.txnDate}>{formatDate(txn.transaction_date)}</Text>
                </View>
                <View style={styles.txnAmountContainer}>
                  <Text style={[
                    styles.txnAmountText,
                    { color: txn.transaction_type === 'CONTRIBUTION' ? '#10b981' : '#ef4444' }
                  ]}>
                    {txn.transaction_type === 'CONTRIBUTION' ? '+' : '-'}{formatAmount(txn.amount)}
                  </Text>
                  <Text style={styles.txnCurrency}>ETB</Text>
                </View>
              </View>
            ))}
          </View>
        )}
        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Change Percentage Modal */}
      <Modal visible={showPercentageModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Saving Percentage</Text>
            <Text style={styles.modalSubtitle}>Must be between 15% and 65% of your salary</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              placeholder="e.g. 25"
              value={newPercentage}
              onChangeText={setNewPercentage}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowPercentageModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleUpdatePercentage} disabled={submitting}>
                {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Submit</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Withdraw Modal */}
      <Modal visible={showWithdrawModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Withdraw Savings</Text>
              <TouchableOpacity onPress={() => setShowWithdrawModal(false)}>
                <Ionicons name="close-circle" size={28} color="#9ca3af" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>Enter the amount you wish to withdraw</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Amount (ETB)</Text>
              <TextInput
                style={styles.modalInput}
                keyboardType="numeric"
                placeholder="0.00"
                value={withdrawAmount}
                onChangeText={setWithdrawAmount}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Reason (Optional)</Text>
              <TextInput
                style={[styles.modalInput, { fontSize: 16, height: 60, textAlignVertical: 'top', paddingTop: 12 }]}
                multiline
                placeholder="Why are you withdrawing?"
                value={withdrawReason}
                onChangeText={setWithdrawReason}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowWithdrawModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.submitBtn, { backgroundColor: '#10b981' }]} onPress={handleWithdraw} disabled={submitting}>
                {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Confirm Withdrawal</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
  premiumCard: {
    backgroundColor: '#0f172a', margin: 16, padding: 24, borderRadius: 28,
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 15, elevation: 8,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  premiumLabel: { fontSize: 13, color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  premiumAmount: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginTop: 4 },
  premiumCurrency: { fontSize: 16, color: '#64748b' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  activeBadge: { backgroundColor: 'rgba(16, 185, 129, 0.15)' },
  frozenBadge: { backgroundColor: 'rgba(239, 68, 68, 0.15)' },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10b981', marginRight: 6 },
  statusText: { color: '#10b981', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' },
  premiumGrid: { flexDirection: 'row', marginTop: 24, paddingTop: 20, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  gridItem: { flex: 1 },
  gridLabel: { fontSize: 11, color: '#64748b', fontWeight: '600', textTransform: 'uppercase' },
  gridValue: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginTop: 4 },
  gridDivider: { width: 1, height: '100%', backgroundColor: 'rgba(255,255,255,0.05)', marginHorizontal: 16 },
  premiumActions: { flexDirection: 'row', gap: 12, marginTop: 24 },
  premiumActionBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    padding: 14, borderRadius: 16,
  },
  premiumActionText: { color: '#fff', fontSize: 13, fontWeight: 'bold', marginLeft: 8 },
  sectionHeader: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  emptyState: { alignItems: 'center', padding: 48, marginTop: 20 },
  emptyIconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#334155' },
  emptySubtitle: { fontSize: 14, color: '#94a3b8', textAlign: 'center', marginTop: 6 },
  listContainer: { paddingHorizontal: 16 },
  txnItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    padding: 16, borderRadius: 18, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 5, elevation: 1,
  },
  txnIconBg: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  txnInfo: { flex: 1, marginLeft: 16 },
  txnType: { fontSize: 15, fontWeight: 'bold', color: '#1e293b' },
  txnDate: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  txnAmountContainer: { alignItems: 'flex-end' },
  txnAmountText: { fontSize: 16, fontWeight: 'bold' },
  txnCurrency: { fontSize: 10, color: '#94a3b8', fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#1e293b' },
  modalSubtitle: { fontSize: 14, color: '#64748b', marginBottom: 24 },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 12, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: 8, letterSpacing: 0.5 },
  modalInput: {
    borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 16, padding: 18,
    fontSize: 24, fontWeight: 'bold', backgroundColor: '#f8fafc', textAlign: 'center', color: '#1e293b',
  },
  modalButtons: { flexDirection: 'row', marginTop: 10, gap: 12 },
  cancelBtn: { flex: 1, padding: 16, borderRadius: 14, backgroundColor: '#f1f5f9', alignItems: 'center' },
  cancelBtnText: { color: '#64748b', fontSize: 16, fontWeight: 'bold' },
  submitBtn: { flex: 1, padding: 16, borderRadius: 14, backgroundColor: '#2563eb', alignItems: 'center' },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
