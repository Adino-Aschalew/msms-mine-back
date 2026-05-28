import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { employeeService, formatAmount, formatDate } from '../../services/employeeService';
import { ScreenScroll, Card, StatCard, Badge, Button, SectionLabel, LoadingState, ErrorState, ScreenHeader, EmptyState } from '../../components/ui';

export default function RepayScreen({ route, navigation }) {
  const { theme } = useTheme();
  const { loanId } = route.params || {};
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!loanId) {
        // Find first active loan if no ID provided
        const myLoans = await employeeService.getMyLoans();
        const active = myLoans.find(l => ['ACTIVE', 'DISBURSED'].includes(String(l.status || '').toUpperCase()));
        if (!active) throw new Error('No active loan found to repay.');
        const detail = await employeeService.getLoanDetail(active.id);
        setLoan(detail);
      } else {
        const detail = await employeeService.getLoanDetail(loanId);
        setLoan(detail);
      }
    } catch (err) {
      setError(err.message || 'Failed to load loan details');
    } finally {
      setLoading(false);
    }
  }, [loanId]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingState message="Loading loan details..." />;
  if (error === 'No active loan found to repay.') {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background, justifyContent: 'center' }}>
        <EmptyState 
          icon="cash-outline" 
          title="No Active Loans" 
          subtitle="You do not have any active loans to repay right now." 
        />
        <Button 
          title="Apply for a Loan" 
          onPress={() => navigation.navigate('Loans')} 
          style={{ marginHorizontal: 40, marginTop: 24 }} 
        />
      </View>
    );
  }
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!loan) return <ErrorState message="Loan not found" onRetry={load} />;

  const remaining = parseFloat(loan.remaining_balance || loan.outstanding_balance || 0);

  return (
    <ScreenScroll
      header={
        <ScreenHeader 
          title="Loan Repayment" 
          subtitle={loan.loan_type?.name || 'Standard Loan'} 
          backAction={() => navigation.goBack()}
        />
      }
    >
      <SectionLabel>Payment Summary</SectionLabel>
      <Card style={styles.summaryCard} elevated>
        <Text style={[styles.balanceLabel, { color: theme.textSecondary }]}>Remaining Balance</Text>
        <Text style={[styles.balanceAmount, { color: theme.primary }]}>
          {formatAmount(remaining)} <Text style={styles.currency}>ETB</Text>
        </Text>
        
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        
        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: theme.textMuted }]}>Monthly Installment</Text>
            <Text style={[styles.detailValue, { color: theme.text }]}>
              {formatAmount(loan.monthly_installment)}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: theme.textMuted }]}>Next Due Date</Text>
            <Text style={[styles.detailValue, { color: theme.text }]}>
              {formatDate(loan.next_repayment_date) || 'TBD'}
            </Text>
          </View>
        </View>
      </Card>

      <SectionLabel>Loan Details</SectionLabel>
      <Card style={styles.loanInfoCard}>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Total Amount</Text>
          <Text style={[styles.infoValue, { color: theme.text }]}>{formatAmount(loan.loan_amount)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Interest Rate</Text>
          <Text style={[styles.infoValue, { color: theme.text }]}>{loan.interest_rate}%</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Paid Amount</Text>
          <Text style={[styles.infoValue, { color: theme.success }]}>{formatAmount(loan.paid_amount || 0)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Repayment Duration</Text>
          <Text style={[styles.infoValue, { color: theme.text }]}>{loan.repayment_period} months</Text>
        </View>
      </Card>

      <SectionLabel>Payment Instructions</SectionLabel>
      <Card style={[styles.instructionCard, { backgroundColor: theme.primary + '08', borderColor: theme.primary + '20' }]}>
        <Ionicons name="information-circle-outline" size={24} color={theme.primary} />
        <Text style={[styles.instructionText, { color: theme.textSecondary }]}>
          Repayments are typically deducted from your monthly salary. To make an additional payment or early settlement, please contact the finance office.
        </Text>
      </Card>

      <Button 
        title="Deducted Monthly" 
        onPress={() => Alert.alert('Information', 'Repayments are automatically processed during the payroll cycle.')}
        style={{ marginTop: 24 }}
        icon="sync-outline"
        type="secondary"
      />
      
      <View style={{ height: 40 }} />
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  summaryCard: { padding: 24, alignItems: 'center' },
  balanceLabel: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  balanceAmount: { fontSize: 36, fontWeight: '800' },
  currency: { fontSize: 18, opacity: 0.6 },
  divider: { width: '100%', height: 1, marginVertical: 20, opacity: 0.1 },
  detailsGrid: { flexDirection: 'row', width: '100%', justifyContent: 'space-between' },
  detailItem: { width: '48%' },
  detailLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
  detailValue: { fontSize: 16, fontWeight: '700' },
  loanInfoCard: { padding: 16 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  infoLabel: { fontSize: 14, fontWeight: '600' },
  infoValue: { fontSize: 14, fontWeight: '700' },
  instructionCard: { padding: 20, flexDirection: 'row', gap: 16, borderLeftWidth: 4 },
  instructionText: { flex: 1, fontSize: 14, lineHeight: 20 },
});
