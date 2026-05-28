import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, Modal, TextInput, Alert, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { employeeService, formatAmount, formatDate } from '../../services/employeeService';
import {
  ScreenScroll, Card, Button, SectionLabel, LoadingState, ErrorState, EmptyState, ScreenHeader, Badge
} from '../../components/ui';

export default function SavingsScreen({ navigation, embedded = false }) {
  const { theme } = useTheme();
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [newPercentage, setNewPercentage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError(null);
    try {
      const dashboard = await employeeService.getSavingsDashboard();
      const acc = dashboard?.account || (dashboard?.current_balance !== undefined ? dashboard : {});
      const txns = dashboard?.recentTransactions || (Array.isArray(dashboard) ? dashboard : []);

      // Rely on backend's explicit flag if present, otherwise check if the account object has actual properties
      const isAccountEmpty = Object.keys(acc).length === 0 || (acc.saving_percentage === undefined && acc.currentValue === undefined);

      if (dashboard?.hasAccount === false || (dashboard?.hasAccount === undefined && isAccountEmpty)) {
        setAccount(null);
      } else {
        setAccount({
          current_balance: acc.current_balance || 0,
          interest_earned: acc.interest_earned || 0,
          saving_percentage: acc.saving_percentage || 0,
          account_status: acc.account_status || 'ACTIVE',
          salary: acc.salary || 0,
          ...acc
        });
      }
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
      setNewPercentage('');
      load(true);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update percentage');
    } finally {
      setSubmitting(false);
    }
  };


  if (loading) return <LoadingState message="Loading savings..." />;
  if (error && !account) return <ErrorState message={error} onRetry={load} />;

  const handleActivate = async () => {
    setSubmitting(true);
    try {
      await employeeService.activateSavingsAccount();
      Alert.alert('Success', 'Savings account activated successfully!');
      load(true);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to activate account');
    } finally {
      setSubmitting(false);
    }
  };

  if (!account && !error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: theme.background }}>
        <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: theme.primary + '20', justifyContent: 'center', alignItems: 'center', marginBottom: 24 }}>
          <Ionicons name="wallet-outline" size={40} color={theme.primary} />
        </View>
        <Text style={{ fontSize: 24, fontWeight: '800', color: theme.text, marginBottom: 12 }}>Setup Savings</Text>
        <Text style={{ fontSize: 16, color: theme.textSecondary, textAlign: 'center', marginBottom: 32, lineHeight: 24 }}>
          You haven't activated your payroll-deducted savings account yet. Activate it now to start saving automatically.
        </Text>
        <Button
          title="Activate Now"
          onPress={handleActivate}
          loading={submitting}
          style={{ width: '100%', maxWidth: 300, height: 56, borderRadius: 16 }}
        />
      </View>
    );
  }


  const salary = account?.salary || 0;
  const currentPct = account?.saving_percentage || 0;
  const simulatedPct = parseFloat(newPercentage) || currentPct;
  const currentDeduction = (salary * currentPct) / 100;
  const simulatedDeduction = (salary * simulatedPct) / 100;
  const deductionDiff = simulatedDeduction - currentDeduction;

  const content = (
    <>
      <ScreenHeader
        title="Savings"
        subtitle={account?.account_status || 'ACTIVE'}
        backAction={embedded ? null : () => navigation.goBack()}
      />

      <View style={styles.scrollPadding}>
        <View style={[styles.heroCompact, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.heroRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.heroAmount, { color: theme.text }]}>
                {formatAmount(account?.current_balance)} <Text style={styles.currency}>ETB</Text>
              </Text>
              <Text style={[styles.heroLabel, { color: theme.textSecondary }]}>Total Savings Balance</Text>
            </View>
            <Badge label={account?.account_status || 'ACTIVE'} type="success" />
          </View>

          <View style={styles.heroStats}>
            <View style={styles.heroStatItem}>
              <Text style={[styles.heroStatLabel, { color: theme.textMuted }]}>Interest earned</Text>
              <Text style={[styles.heroStatValue, { color: theme.success }]}>+{formatAmount(account?.interest_earned)}</Text>
            </View>
            <View style={styles.heroStatItem}>
              <Text style={[styles.heroStatLabel, { color: theme.textMuted }]}>Current Rate</Text>
              <Text style={[styles.heroStatValue, { color: theme.primary }]}>{currentPct}%</Text>
            </View>
          </View>
        </View>

        <SectionLabel>Simulator</SectionLabel>
        <Card style={styles.simCardRefined}>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.simInputCompact, { backgroundColor: theme.cardElevated, borderColor: theme.border, color: theme.text }]}
              keyboardType="numeric"
              placeholder="Set New %"
              placeholderTextColor={theme.textMuted}
              value={newPercentage}
              onChangeText={setNewPercentage}
            />
            <Button
              title="Apply Change"
              onPress={handleUpdatePercentage}
              loading={submitting}
              disabled={!newPercentage || submitting}
              style={{ flex: 1, height: 44 }}
            />
          </View>

          {newPercentage ? (
            <View style={styles.simResult}>
              <Text style={[styles.simLabelRefined, { color: theme.textSecondary }]}>
                Monthly Impact: <Text style={{ color: deductionDiff > 0 ? theme.danger : theme.success, fontWeight: '700' }}>
                  {deductionDiff > 0 ? '-' : '+'}{formatAmount(Math.abs(deductionDiff))}
                </Text> from salary
              </Text>
            </View>
          ) : null}
        </Card>

        <SectionLabel
        >
          Recent Activity
        </SectionLabel>

        {transactions.length === 0 ? (
          <EmptyState title="No transactions" subtitle="Activity will appear here." />
        ) : (
          transactions.slice(0, 10).map((txn, index) => {
            const isCredit = txn.transaction_type === 'CONTRIBUTION' || txn.transaction_type === 'INTEREST';
            return (
              <View key={txn.id || txn.transaction_id || index} style={[styles.txnRowRefined, { borderBottomColor: theme.border }]}>
                <View style={[styles.miniIconBg, { backgroundColor: isCredit ? theme.success + '10' : theme.danger + '10' }]}>
                  <Ionicons
                    name={isCredit ? 'arrow-down-outline' : 'arrow-up-outline'}
                    size={18}
                    color={isCredit ? theme.success : theme.danger}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.txnTypeRefined, { color: theme.text }]}>
                    {txn.transaction_type.replace('_', ' ')}
                  </Text>
                  <Text style={[styles.txnDateRefined, { color: theme.textMuted }]}>
                    {formatDate(txn.transaction_date)}
                  </Text>
                </View>
                <Text style={[styles.txnAmountRefined, { color: isCredit ? theme.success : theme.danger }]}>
                  {isCredit ? '+' : '-'}{formatAmount(txn.amount)}
                </Text>
              </View>
            );
          })
        )}
      </View>
      <View style={{ height: 100 }} />
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
  heroCompact: { padding: 24, borderRadius: 24, borderWidth: 1, marginTop: -24 },
  heroRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  heroAmount: { fontSize: 32, fontWeight: '800' },
  currency: { fontSize: 16, fontWeight: '600', opacity: 0.5 },
  heroLabel: { fontSize: 13, fontWeight: '600', marginTop: 4 },
  heroStats: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)', paddingTop: 20 },
  heroStatItem: { flex: 1 },
  heroStatLabel: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', marginBottom: 4 },
  heroStatValue: { fontSize: 15, fontWeight: '700' },
  simCardRefined: { padding: 12, borderRadius: 20, borderWidth: 1 },
  inputRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  simInputCompact: { flex: 0.4, height: 44, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, fontSize: 14 },
  simResult: { marginTop: 10, paddingLeft: 4 },
  simLabelRefined: { fontSize: 12, fontWeight: '500' },
  txnRowRefined: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1 },
  miniIconBg: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  txnTypeRefined: { fontSize: 14, fontWeight: '700', textTransform: 'capitalize' },
  txnDateRefined: { fontSize: 11, fontWeight: '500', marginTop: 1 },
  txnAmountRefined: { fontSize: 14, fontWeight: '800' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modal: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: '800' },
  input: { height: 52, borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 16, fontSize: 16, marginBottom: 12 },
  textArea: { height: 80, textAlignVertical: 'top', paddingTop: 14 },
});
