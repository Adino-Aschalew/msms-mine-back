import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { employeeService, formatAmount, formatDate } from '../../services/employeeService';
import { ScreenScroll, Card, LoadingState, ErrorState, EmptyState } from '../../components/ui';

export default function PayrollScreen() {
  const { theme } = useTheme();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError(null);
    try {
      const list = await employeeService.getPayrollHistory(1, 24);
      setRecords(list);
    } catch (err) {
      setError(err.message || 'Failed to load payroll');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingState message="Loading payroll..." />;
  if (error && records.length === 0) return <ErrorState message={error} onRetry={load} />;

  const latest = records[0];

  return (
    <ScreenScroll refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }}>
      {latest ? (
        <Card style={[styles.summary, { backgroundColor: theme.headerBg, borderColor: 'transparent' }]}>
          <Text style={styles.summaryLabel}>Latest net pay</Text>
          <Text style={styles.summaryAmount}>
            {formatAmount(latest.net_salary)} <Text style={styles.summaryUnit}>ETB</Text>
          </Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryMeta}>Gross {formatAmount(latest.gross_salary)} ETB</Text>
            <Text style={styles.summaryMeta}>{formatDate(latest.payroll_date || latest.created_at)}</Text>
          </View>
        </Card>
      ) : null}

      {records.length === 0 ? (
        <EmptyState icon="receipt-outline" title="No payroll records" subtitle="Processed payroll will appear here." />
      ) : (
        records.map((row, index) => (
          <Card key={row.id || index} style={styles.row}>
            <View style={styles.rowTop}>
              <View style={[styles.iconBg, { backgroundColor: theme.primary + '15' }]}>
                <Ionicons name="calendar-outline" size={20} color={theme.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, { color: theme.text }]}>
                  {row.batch_name || 'Payroll'}
                </Text>
                <Text style={[styles.rowDate, { color: theme.textSecondary }]}>
                  {formatDate(row.payroll_date || row.created_at)}
                </Text>
              </View>
              <Text style={[styles.net, { color: theme.accent }]}>{formatAmount(row.net_salary)}</Text>
            </View>
            <View style={[styles.details, { borderTopColor: theme.border }]}>
              <Detail label="Gross" value={formatAmount(row.gross_salary)} theme={theme} />
              <Detail label="Savings" value={formatAmount(row.saving || row.savings_deduction)} theme={theme} />
              <Detail label="Deductions" value={formatAmount(row.deduction)} theme={theme} />
            </View>
          </Card>
        ))
      )}
    </ScreenScroll>
  );
}

function Detail({ label, value, theme }) {
  return (
    <View style={styles.detailItem}>
      <Text style={[styles.detailLabel, { color: theme.textMuted }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: theme.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  summary: { padding: 20, marginBottom: 8 },
  summaryLabel: { color: '#94a3b8', fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  summaryAmount: { color: '#fff', fontSize: 32, fontWeight: 'bold', marginTop: 6 },
  summaryUnit: { fontSize: 14, color: '#94a3b8' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  summaryMeta: { color: '#cbd5e1', fontSize: 12, fontWeight: '500' },
  row: { padding: 14, marginBottom: 10 },
  rowTop: { flexDirection: 'row', alignItems: 'center' },
  iconBg: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  rowTitle: { fontSize: 15, fontWeight: 'bold' },
  rowDate: { fontSize: 12, marginTop: 2 },
  net: { fontSize: 16, fontWeight: 'bold' },
  details: { flexDirection: 'row', marginTop: 12, paddingTop: 12, borderTopWidth: 1 },
  detailItem: { flex: 1 },
  detailLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  detailValue: { fontSize: 13, fontWeight: 'bold', marginTop: 2 },
});
