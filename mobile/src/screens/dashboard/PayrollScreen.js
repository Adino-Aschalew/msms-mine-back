import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as SecureStore from 'expo-secure-store';
import { useTheme } from '../../context/ThemeContext';
import { employeeService, formatAmount, formatDate } from '../../services/employeeService';
import {
  ScreenScroll, Card, StatCard, Badge, Button, SectionLabel, LoadingState, ErrorState, EmptyState, ScreenHeader
} from '../../components/ui';

export default function PayrollScreen() {
  const { theme } = useTheme();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [downloading, setDownloading] = useState(false);

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

  const content = (
    <>
      <ScreenHeader 
        title="Payroll" 
        subtitle="Your earnings and slips" 
      />

      <View style={styles.scrollPadding}>
        {latest ? (
          <View style={[styles.latestCompact, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.latestHeader}>
              <View>
                <Text style={[styles.latestLabel, { color: theme.textSecondary }]}>Latest Net Pay</Text>
                <Text style={[styles.latestDate, { color: theme.textMuted }]}>{formatDate(latest.payroll_date)}</Text>
              </View>
              <Badge label="Processed" type="success" />
            </View>
            
            <View style={styles.mainValueRow}>
              <Text style={[styles.mainAmountRefined, { color: theme.text }]}>
                {formatAmount(latest.net_salary)} <Text style={styles.currency}>ETB</Text>
              </Text>
            </View>
            
            <View style={styles.statsRowRefined}>
              <StatCard 
                title="Gross" 
                value={formatAmount(latest.gross_salary)} 
                icon="cash-outline" 
                color={theme.primary} 
              />
              <StatCard 
                title="Deductions" 
                value={formatAmount((latest.gross_salary - latest.net_salary))} 
                icon="trending-down" 
                color={theme.danger} 
              />
            </View>
            
            <TouchableOpacity 
              style={[styles.miniViewStatement, { backgroundColor: theme.primary + '10' }]}
              onPress={() => setSelectedRecord(latest)}
            >
              <Text style={[styles.miniViewText, { color: theme.primary }]}>View Full Statement</Text>
              <Ionicons name="arrow-forward" size={14} color={theme.primary} />
            </TouchableOpacity>
          </View>
        ) : null}

        <SectionLabel>Payment History</SectionLabel>
        
        {records.length === 0 ? (
          <EmptyState title="No payroll records" subtitle="Your monthly payslips will appear here." />
        ) : (
          records.map((row, index) => (
            <TouchableOpacity 
              key={row.id || index}
              style={[styles.historyRowRefined, { borderBottomColor: theme.border }]}
              onPress={() => setSelectedRecord(row)}
            >
              <View style={[styles.miniIconBg, { backgroundColor: theme.cardElevated }]}>
                <Ionicons name="receipt-outline" size={18} color={theme.textSecondary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.historyTitle, { color: theme.text }]}>
                  {row.batch_name || 'Regular Payroll'}
                </Text>
                <Text style={[styles.historyDate, { color: theme.textSecondary }]}>
                  {formatDate(row.payroll_date || row.created_at)}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.historyAmount, { color: theme.text }]}>
                  {formatAmount(row.net_salary)}
                </Text>
                <Text style={[styles.historySub, { color: theme.textMuted }]}>Net Pay</Text>
              </View>
              <Ionicons name="chevron-forward" size={14} color={theme.textMuted} style={{ marginLeft: 12 }} />
            </TouchableOpacity>
          ))
        )}
      </View>
      <View style={{ height: 100 }} />

      <Modal visible={!!selectedRecord} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: theme.text }]}>Payslip Detail</Text>
                <Text style={[styles.modalSub, { color: theme.textSecondary }]}>
                  {selectedRecord?.batch_name || 'Payroll'} · {formatDate(selectedRecord?.payroll_date)}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedRecord(null)}>
                <Ionicons name="close" size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={[styles.detailBox, { backgroundColor: theme.cardElevated }]}>
                <DetailRow label="Gross Salary" value={formatAmount(selectedRecord?.gross_salary)} theme={theme} bold />
                <View style={styles.divider} />
                
                <Text style={[styles.groupLabel, { color: theme.primary }]}>Earnings</Text>
                <DetailRow label="Base Pay" value={formatAmount(selectedRecord?.base_salary || selectedRecord?.gross_salary)} theme={theme} />
                {selectedRecord?.allowance > 0 && (
                  <DetailRow label="Allowances" value={formatAmount(selectedRecord.allowance)} theme={theme} />
                )}
                {selectedRecord?.overtime > 0 && (
                  <DetailRow label="Overtime" value={formatAmount(selectedRecord.overtime)} theme={theme} />
                )}

                <View style={styles.divider} />
                <Text style={[styles.groupLabel, { color: theme.danger }]}>Deductions</Text>
                <DetailRow label="Income Tax" value={formatAmount(selectedRecord?.tax || 0)} theme={theme} />
                <DetailRow label="Pension" value={formatAmount(selectedRecord?.pension || 0)} theme={theme} />
                {selectedRecord?.loan_deduction > 0 && (
                  <DetailRow label="Loan Repayment" value={formatAmount(selectedRecord.loan_deduction)} theme={theme} />
                )}
                {selectedRecord?.savings_deduction > 0 && (
                  <DetailRow label="Savings Contribution" value={formatAmount(selectedRecord.savings_deduction)} theme={theme} />
                )}
                
                <View style={[styles.totalRow, { backgroundColor: theme.primary + '10' }]}>
                  <Text style={[styles.totalLabel, { color: theme.text }]}>Net Salary</Text>
                  <Text style={[styles.totalValue, { color: theme.primary }]}>
                    {formatAmount(selectedRecord?.net_salary)} ETB
                  </Text>
                </View>
              </View>
              
              <Button 
                title="Download PDF" 
                onPress={async () => {
                  if (!selectedRecord) return;
                  setDownloading(true);
                  try {
                    const token = await SecureStore.getItemAsync('token');
                    const url = employeeService.getPayslipPdfUrl(selectedRecord.id);
                    const filename = `payslip-${selectedRecord.id}.pdf`;
                    const fileUri = FileSystem.cacheDirectory + filename;

                    const downloadRes = await FileSystem.downloadAsync(url, fileUri, {
                      headers: { 'Authorization': `Bearer ${token}` }
                    });

                    if (downloadRes.status === 200) {
                      await Sharing.shareAsync(downloadRes.uri);
                    } else {
                      Alert.alert('Error', 'Failed to generate PDF. Please try again.');
                    }
                  } catch (err) {
                    Alert.alert('Error', 'Download failed: ' + err.message);
                  } finally {
                    setDownloading(false);
                  }
                }} 
                icon="download-outline"
                type="primary"
                style={{ marginTop: 24 }}
                loading={downloading}
              />
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

function DetailRow({ label, value, theme, bold }) {
  return (
    <View style={styles.detailRow}>
      <Text style={[styles.rowLabel, { color: theme.textSecondary, fontWeight: bold ? '700' : '500' }]}>{label}</Text>
      <Text style={[styles.rowValue, { color: theme.text, fontWeight: bold ? '800' : '600' }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollPadding: { paddingHorizontal: 20 },
  latestCompact: { padding: 20, borderRadius: 24, borderWidth:1, marginTop: -24 },
  latestHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  latestLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  latestDate: { fontSize: 11, marginTop: 2 },
  mainValueRow: { marginBottom: 20 },
  mainAmountRefined: { fontSize: 32, fontWeight: '800' },
  currency: { fontSize: 16, fontWeight: '600', opacity: 0.5 },
  statsRowRefined: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  miniViewStatement: { 
    height: 44, borderRadius: 12, flexDirection: 'row', 
    alignItems: 'center', justifyContent: 'center', gap: 8 
  },
  miniViewText: { fontSize: 14, fontWeight: '700' },
  historyRowRefined: { 
    flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1 
  },
  miniIconBg: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  historyTitle: { fontSize: 15, fontWeight: '700' },
  historyDate: { fontSize: 12, fontWeight: '500', marginTop: 1 },
  historyAmount: { fontSize: 15, fontWeight: '800' },
  historySub: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', marginTop: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modal: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  modalTitle: { fontSize: 22, fontWeight: '800' },
  modalSub: { fontSize: 14, marginTop: 2 },
  detailBox: { borderRadius: 20, padding: 20 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  rowLabel: { fontSize: 14 },
  rowValue: { fontSize: 14 },
  divider: { height: 1.5, backgroundColor: '#e2e8f0', marginVertical: 8, opacity: 0.1 },
  groupLabel: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', marginTop: 12, marginBottom: 4, letterSpacing: 0.5 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, padding: 16, borderRadius: 12 },
  totalLabel: { fontSize: 16, fontWeight: '800' },
  totalValue: { fontSize: 18, fontWeight: '900' },
});
