import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { employeeService, formatAmount } from '../../services/employeeService';
import {
  ScreenScroll, ScreenHeader, Card, SectionLabel, LoadingState, ErrorState,
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

  const getChartData = () => {
    const txns = data?.transactions || [];
    const contributions = txns
      .filter((t) => t.transaction_type === 'CONTRIBUTION')
      .slice(0, 6)
      .reverse();

    if (contributions.length < 2) {
      const bal = parseFloat(data?.savings?.current_balance || 0);
      return {
        labels: ['', '', '', '', '', 'Now'],
        datasets: [{ data: [0, 0, 0, 0, 0, Math.max(bal, 1)] }],
      };
    }

    let running = 0;
    const labels = [];
    const points = [];
    contributions.forEach((t) => {
      running += parseFloat(t.amount || 0);
      labels.push(new Date(t.transaction_date).toLocaleDateString('en', { month: 'short' }));
      points.push(running);
    });
    return { labels, datasets: [{ data: points }] };
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
          title={`${user?.first_name || 'Member'}`}
          subtitle={greeting()}
          rightAction={(
            <TouchableOpacity
              style={styles.notifBtn}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Ionicons name="notifications-outline" size={22} color="#fff" />
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
        <View style={[styles.warnBanner, { backgroundColor: '#fef3c7' }]}>
          <Ionicons name="warning-outline" size={16} color="#b45309" />
          <Text style={styles.warnText}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Salary</Text>
          <Text style={[styles.statValue, { color: theme.text }]}>{formatAmount(salary)}</Text>
          <Text style={[styles.statUnit, { color: theme.textMuted }]}>ETB / month</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Savings rate</Text>
          <Text style={[styles.statValue, { color: theme.text }]}>{savingRate}%</Text>
          <Text style={[styles.statUnit, { color: theme.textMuted }]}>of salary</Text>
        </Card>
      </View>

      <TouchableOpacity
        style={[styles.heroCard, { backgroundColor: theme.primary }]}
        onPress={() => navigation.navigate('Finance')}
        activeOpacity={0.9}
      >
        <View style={styles.heroTop}>
          <Ionicons name="wallet-outline" size={22} color="#fff" />
          <Text style={styles.heroLabel}>Total savings</Text>
        </View>
        <Text style={styles.heroAmount}>{formatAmount(savings.current_balance)} <Text style={styles.heroUnit}>ETB</Text></Text>
        <View style={styles.heroFooter}>
          <Text style={styles.heroMeta}>Interest +{formatAmount(savings.interest_earned)} ETB</Text>
          <Text style={styles.heroMeta}>Deduction ~{formatAmount(monthlyDeduction)} ETB/mo</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.heroCard, { backgroundColor: theme.accent }]}
        onPress={() => navigation.navigate('Finance')}
        activeOpacity={0.9}
      >
        <View style={styles.heroTop}>
          <Ionicons name="cash-outline" size={22} color="#fff" />
          <Text style={styles.heroLabel}>Active loan</Text>
        </View>
        {activeLoan ? (
          <>
            <Text style={styles.heroAmount}>
              {formatAmount(activeLoan.remaining_balance || activeLoan.outstanding_balance)} <Text style={styles.heroUnit}>ETB</Text>
            </Text>
            <Text style={styles.heroMeta}>Monthly {formatAmount(activeLoan.monthly_repayment || activeLoan.monthly_deduction)} ETB</Text>
          </>
        ) : (
          <Text style={styles.heroAmountSmall}>No active loan</Text>
        )}
      </TouchableOpacity>

      <SectionLabel>Quick actions</SectionLabel>
      <View style={styles.actions}>
        {[
          { icon: 'trending-up', label: 'Savings', screen: 'Finance', color: theme.primary },
          { icon: 'document-text', label: 'Loans', screen: 'Finance', color: theme.accent },
          { icon: 'people', label: 'Guarantors', screen: 'Guarantors', color: '#7c3aed' },
          { icon: 'calculator', label: 'Calculator', screen: 'LoanCalculator', color: '#d97706' },
          { icon: 'receipt', label: 'Payroll', screen: 'Payroll', color: '#0ea5e9' },
          { icon: 'notifications', label: 'Alerts', screen: 'Notifications', color: '#64748b' },
        ].map((item) => (
          <TouchableOpacity
            key={item.label}
            style={[styles.actionItem, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => navigation.navigate(item.screen)}
          >
            <View style={[styles.actionIcon, { backgroundColor: item.color + '15' }]}>
              <Ionicons name={item.icon} size={22} color={item.color} />
            </View>
            <Text style={[styles.actionLabel, { color: theme.textSecondary }]}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <SectionLabel>Savings growth</SectionLabel>
      <Card style={styles.chartCard}>
        <LineChart
          data={getChartData()}
          width={width - 64}
          height={180}
          yAxisSuffix=""
          chartConfig={{
            backgroundColor: theme.card,
            backgroundGradientFrom: theme.card,
            backgroundGradientTo: theme.card,
            decimalPlaces: 0,
            color: () => theme.primary,
            labelColor: () => theme.textMuted,
            propsForDots: { r: '4', strokeWidth: '2', stroke: theme.primary },
            propsForBackgroundLines: { stroke: theme.border },
          }}
          bezier
          style={styles.chart}
          withVerticalLines={false}
        />
      </Card>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  notifBtn: {
    width: 42, height: 42, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)', justifyContent: 'center', alignItems: 'center',
  },
  badge: {
    position: 'absolute', top: -2, right: -2, minWidth: 18, height: 18, borderRadius: 9,
    backgroundColor: '#ef4444', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  warnBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: 12, borderRadius: 12, marginBottom: 12,
  },
  warnText: { flex: 1, color: '#92400e', fontSize: 13, fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  statCard: { flex: 1, padding: 14 },
  statLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: 'bold', marginTop: 4 },
  statUnit: { fontSize: 11, marginTop: 2 },
  heroCard: { borderRadius: 22, padding: 20, marginBottom: 12 },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  heroLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '600' },
  heroAmount: { color: '#fff', fontSize: 30, fontWeight: 'bold' },
  heroAmountSmall: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  heroUnit: { fontSize: 14, fontWeight: '600' },
  heroFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  heroMeta: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '500' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  actionItem: {
    width: (width - 52) / 3, alignItems: 'center', paddingVertical: 14,
    borderRadius: 16, borderWidth: 1,
  },
  actionIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  actionLabel: { fontSize: 11, fontWeight: '600', marginTop: 8 },
  chartCard: { padding: 12, overflow: 'hidden' },
  chart: { marginLeft: -8, borderRadius: 12 },
});
