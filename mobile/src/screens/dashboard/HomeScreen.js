import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { employeeService, formatAmount, formatDate } from '../../services/employeeService';
import {
  ScreenScroll, ScreenHeader, Card, StatCard, SectionLabel, Button, LoadingState, ErrorState, Badge,
} from '../../components/ui';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError(null);
    try {
      const bundle = await employeeService.getDashboardBundle(user?.id);
      setData(bundle);
      if (bundle.errors?.length) {
        setError('Some data could not be loaded. Pull to refresh.');
      }
    } catch (err) {
      setError(err.message || 'Network Error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };


  if (loading) return <LoadingState message="Loading your dashboard..." />;
  if (error && !data) {
    return <ErrorState message={error} onRetry={() => load()} />;
  }

  const savings = data?.savings || {};
  const activeLoan = data?.activeLoan;
  const salary = data?.grossSalary || 0;
  const savingRate = parseFloat(savings.saving_percentage || 0);
  const monthlyDeduction = salary > 0 ? (salary * savingRate) / 100 : 0;

  return (
    <ScreenScroll
      refreshing={refreshing}
      onRefresh={() => { setRefreshing(true); load(true); }}
      header={(
        <ScreenHeader
          title={`Hello, ${user?.first_name || 'Member'}`}
          subtitle={greeting()}
          rightAction={(
            <TouchableOpacity
              style={styles.notifBtn}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Ionicons name="notifications-outline" size={24} color="#fff" />
              {data?.unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{data.unreadCount > 9 ? '9+' : data.unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        />
      )}
    >
      {error ? (
        <View style={[styles.warnBanner, { backgroundColor: theme.warning + '15' }]}>
          <Ionicons name="warning-outline" size={16} color={theme.warning} />
          <Text style={[styles.warnText, { color: theme.warning }]}>{error}</Text>
        </View>
      ) : null}

      <SectionLabel>Overview</SectionLabel>
      <View style={styles.statsGrid}>
        <StatCard 
          title="Gross Salary" 
          value={formatAmount(salary)} 
          icon="cash-outline" 
          color={theme.primary} 
        />
        <StatCard 
          title="Savings Rate" 
          value={`${savingRate}%`} 
          icon="trending-up" 
          color={theme.success} 
          trend="up"
          trendValue="Standard"
        />
      </View>

      <Card style={styles.mainBalanceCard} elevated>
        <View style={styles.balanceHeader}>
          <View style={[styles.iconBg, { backgroundColor: theme.primary + '15' }]}>
            <Ionicons name="wallet" size={22} color={theme.primary} />
          </View>
          <Text style={[styles.balanceLabel, { color: theme.textSecondary }]}>Total Savings Balance</Text>
        </View>
        <Text style={[styles.balanceAmount, { color: theme.text }]}>
          {formatAmount(savings.current_balance)} <Text style={styles.currency}>ETB</Text>
        </Text>
        <View style={styles.balanceDivider} />
        <View style={styles.balanceFooter}>
          <View>
            <Text style={[styles.footerLabel, { color: theme.textMuted }]}>Interest Earned</Text>
            <Text style={[styles.footerValue, { color: theme.success }]}>+{formatAmount(savings.interest_earned)}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[styles.footerLabel, { color: theme.textMuted }]}>Monthly Deposit</Text>
            <Text style={[styles.footerValue, { color: theme.primary }]}>{formatAmount(monthlyDeduction)}</Text>
          </View>
        </View>
        <Button 
          title="View Savings Details" 
          onPress={() => navigation.navigate('Savings')} 
          type="primary" 
          style={{ marginTop: 20, height: 52 }}
          icon="stats-chart"
        />
      </Card>

      <SectionLabel 
        rightAction={
          <TouchableOpacity onPress={() => navigation.navigate('Loans')}>
            <Text style={{ color: theme.primary, fontWeight: '700', fontSize: 13 }}>View All</Text>
          </TouchableOpacity>
        }
      >
        Active Loan
      </SectionLabel>
      
      {activeLoan ? (
        <Card style={styles.loanCard}>
          <View style={styles.loanTop}>
            <View>
              <Text style={[styles.loanLabel, { color: theme.textSecondary }]}>Remaining Balance</Text>
              <Text style={[styles.loanValue, { color: theme.text }]}>
                {formatAmount(activeLoan.remaining_balance || activeLoan.outstanding_balance)}
              </Text>
            </View>
            <Badge label="Active" type="primary" />
          </View>
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
              <View 
                style={[
                  styles.progressFill, 
                  { backgroundColor: theme.accent, width: `${(activeLoan.paid_amount / activeLoan.total_amount) * 100}%` }
                ]} 
              />
            </View>
            <View style={styles.progressTextRow}>
              <Text style={[styles.progressText, { color: theme.textSecondary }]}>
                {formatAmount(activeLoan.paid_amount)} paid
              </Text>
              <Text style={[styles.progressText, { color: theme.textSecondary }]}>
                {activeLoan.repayment_period} months
              </Text>
            </View>
          </View>
          <Button 
            title="Repay Now" 
            onPress={() => navigation.navigate('Repay', { loanId: activeLoan.id })} 
            type="accent" 
            style={{ marginTop: 20, height: 44 }}
            icon="card-outline"
          />
        </Card>
      ) : (
        <Card style={styles.emptyLoanCard}>
          <Ionicons name="leaf-outline" size={32} color={theme.textMuted} />
          <Text style={[styles.emptyLoanText, { color: theme.textSecondary }]}>No active loans</Text>
          <Button 
            title="Apply for Loan" 
            onPress={() => navigation.navigate('Loans')} 
            type="secondary"
            style={{ marginTop: 12, height: 40, paddingHorizontal: 16 }}
          />
        </Card>
      )}

      <SectionLabel>Quick Access</SectionLabel>
      <View style={styles.actionGrid}>
        {[
          { icon: 'cash-outline', label: 'Apply Loan', screen: 'Loans', color: '#3b82f6', bg: '#3b82f610' },
          { icon: 'card-outline', label: 'Repayment', screen: 'Repay', color: '#10b981', bg: '#10b98110' },
          { icon: 'people-outline', label: 'Guarantors', screen: 'Guarantors', color: '#f59e0b', bg: '#f59e0b10' },
          { icon: 'calculator-outline', label: 'Calculator', screen: 'LoanCalculator', color: '#8b5cf6', bg: '#8b5cf610' },
        ].map((item, idx) => (
          <TouchableOpacity
            key={idx}
            style={[styles.actionBox, { borderColor: theme.border, backgroundColor: theme.card }]}
            onPress={() => {
              if (['Loans', 'Savings', 'Profile'].includes(item.screen)) {
                navigation.navigate('DashboardTabs', { screen: item.screen });
              } else {
                navigation.navigate(item.screen);
              }
            }}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconBg, { backgroundColor: item.bg }]}>
              <Ionicons name={item.icon} size={22} color={item.color} />
            </View>
            <Text style={[styles.actionText, { color: theme.text }]}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <SectionLabel 
        rightAction={
          <TouchableOpacity onPress={() => navigation.navigate('Savings')}>
            <Text style={{ color: theme.primary, fontWeight: '700', fontSize: 13 }}>View All</Text>
          </TouchableOpacity>
        }
      >
        Recent Activity
      </SectionLabel>

      <Card style={styles.activityCard}>
        {data?.transactions?.length === 0 ? (
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No recent activity</Text>
        ) : (
          data.transactions.slice(0, 5).map((txn, index) => {
            const isCredit = txn.transaction_type === 'CONTRIBUTION' || txn.transaction_type === 'INTEREST';
            return (
              <View key={txn.id || index} style={[styles.txnRow, { borderBottomColor: theme.border, borderBottomWidth: index === 4 ? 0 : 0.5 }]}>
                <View style={[styles.miniIconBg, { backgroundColor: isCredit ? theme.success + '10' : theme.danger + '10' }]}>
                  <Ionicons 
                    name={isCredit ? 'arrow-down-outline' : 'arrow-up-outline'} 
                    size={16} 
                    color={isCredit ? theme.success : theme.danger} 
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.txnTitle, { color: theme.text }]}>{txn.transaction_type.replace('_', ' ')}</Text>
                  <Text style={[styles.txnDate, { color: theme.textMuted }]}>{formatDate(txn.transaction_date)}</Text>
                </View>
                <Text style={[styles.txnAmount, { color: isCredit ? theme.success : theme.danger }]}>
                  {isCredit ? '+' : '-'}{formatAmount(txn.amount)}
                </Text>
              </View>
            );
          })
        )}
      </Card>

      <View style={{ height: 100 }} /> 
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  notifBtn: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center',
  },
  badge: {
    position: 'absolute', top: 8, right: 8, minWidth: 16, height: 16, borderRadius: 8,
    backgroundColor: '#ef4444', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#0F172A',
  },
  badgeText: { color: '#fff', fontSize: 8, fontWeight: 'bold' },
  warnBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: 16, borderRadius: 16, marginBottom: 16,
  },
  warnText: { flex: 1, fontSize: 13, fontWeight: '600' },
  statsGrid: { flexDirection: 'row', gap: 12 },
  mainBalanceCard: { marginTop: 12, padding: 24 },
  balanceHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  iconBg: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  balanceLabel: { fontSize: 14, fontWeight: '600' },
  balanceAmount: { fontSize: 32, fontWeight: '800' },
  currency: { fontSize: 16, fontWeight: '600', opacity: 0.6 },
  balanceDivider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 20, opacity: 0.1 },
  balanceFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  footerLabel: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', marginBottom: 4 },
  footerValue: { fontSize: 15, fontWeight: '700' },
  loanCard: { padding: 20 },
  loanTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  loanLabel: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  loanValue: { fontSize: 24, fontWeight: '800' },
  progressContainer: { marginTop: 8 },
  progressBar: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  progressTextRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  progressText: { fontSize: 11, fontWeight: '600' },
  emptyLoanCard: { padding: 32, alignItems: 'center' },
  emptyLoanText: { fontSize: 14, fontWeight: '600', marginTop: 12 },
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionBox: {
    width: (width - 52) / 2, padding: 16, borderRadius: 20, borderWidth: 1,
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  actionIconBg: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  actionText: { fontSize: 14, fontWeight: '700' },
  activityCard: { padding: 8, paddingHorizontal: 16 },
  txnRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  miniIconBg: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  txnTitle: { fontSize: 14, fontWeight: '700', textTransform: 'capitalize' },
  txnDate: { fontSize: 11, fontWeight: '500', marginTop: 1 },
  txnAmount: { fontSize: 14, fontWeight: '800' },
  emptyText: { textAlign: 'center', padding: 20, fontSize: 13, fontWeight: '500' },
});
