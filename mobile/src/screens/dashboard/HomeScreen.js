import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, RefreshControl,
  ActivityIndicator, TouchableOpacity, Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [savingsData, setSavingsData] = useState(null);
  const [loanData, setLoanData] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [savingsRes, loanRes, notifRes, txnRes] = await Promise.all([
        api.get('/savings/account').catch(() => ({ data: { success: false } })),
        api.get('/loans/dashboard').catch(() => ({ data: { success: false } })),
        api.get('/notifications/unread-count').catch(() => ({ data: { success: false } })),
        api.get('/savings/transactions').catch(() => ({ data: { success: false } })),
      ]);
      if (savingsRes.data.success) setSavingsData(savingsRes.data.data);
      if (loanRes.data.success) setLoanData(loanRes.data.data);
      if (notifRes.data.success) setUnreadCount(notifRes.data.data?.count || notifRes.data.data || 0);
      if (txnRes.data.success && Array.isArray(txnRes.data.data)) {
        setTransactions(txnRes.data.data);
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchDashboardData(); }, []);
  const onRefresh = () => { setRefreshing(true); fetchDashboardData(); };

  const formatAmount = (v) => {
    const num = parseFloat(v);
    if (isNaN(num)) return '0.00';
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Build chart data from recent transactions
  const getChartData = () => {
    const contributions = transactions
      .filter(t => t.transaction_type === 'CONTRIBUTION')
      .slice(0, 6)
      .reverse();

    if (contributions.length < 2) {
      return {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{ data: [0, 500, 1200, 2100, 3500, parseFloat(savingsData?.current_balance || 5000)] }],
      };
    }

    let runningBalance = 0;
    const labels = [];
    const dataPoints = [];
    contributions.forEach((t) => {
      runningBalance += parseFloat(t.amount || 0);
      const d = new Date(t.transaction_date);
      labels.push(d.toLocaleDateString('en', { month: 'short' }));
      dataPoints.push(runningBalance);
    });

    return { labels, datasets: [{ data: dataPoints }] };
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading your dashboard...</Text>
      </View>
    );
  }

  const chartData = getChartData();

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563eb']} tintColor="#2563eb" />}
    >
      {/* Welcome Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'},</Text>
          <Text style={styles.userName}>{user?.first_name || user?.employee_id || 'Member'}</Text>
        </View>
        <TouchableOpacity 
          style={styles.notifButton} 
          onPress={() => navigation.navigate('Notifications')}
        >
          <View style={styles.notifIconBg}>
            <Ionicons name="notifications" size={22} color="#fff" />
          </View>
          {unreadCount > 0 && (
            <View style={styles.notifBadge}>
              <Text style={styles.notifBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Savings Card */}
        <TouchableOpacity 
          style={styles.premiumCard} 
          onPress={() => navigation.navigate('Savings')}
          activeOpacity={0.9}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardIconBg}>
              <Ionicons name="wallet" size={20} color="#fff" />
            </View>
            <Text style={styles.cardHeaderText}>Total Savings</Text>
          </View>
          <Text style={styles.bigAmount}>{formatAmount(savingsData?.current_balance)} <Text style={styles.currencyText}>ETB</Text></Text>
          
          <View style={styles.cardFooter}>
            <View style={styles.cardStat}>
              <Text style={styles.cardStatLabel}>Monthly Rate</Text>
              <Text style={styles.cardStatValue}>{savingsData?.saving_percentage || 0}%</Text>
            </View>
            <View style={styles.cardStat}>
              <Text style={[styles.cardStatLabel, { textAlign: 'right' }]}>Interest Earned</Text>
              <Text style={[styles.cardStatValue, { textAlign: 'right', color: '#4ade80' }]}>
                +{formatAmount(savingsData?.interest_earned)} ETB
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Loan Card */}
        <TouchableOpacity 
          style={[styles.premiumCard, styles.loanCardGradient]}
          onPress={() => navigation.navigate('Loans')}
          activeOpacity={0.9}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.cardIconBg, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Ionicons name="cash" size={20} color="#fff" />
            </View>
            <Text style={styles.cardHeaderText}>Active Loan</Text>
          </View>
          
          {loanData?.activeLoan ? (
            <>
              <Text style={styles.bigAmount}>{formatAmount(loanData.activeLoan.remaining_balance)} <Text style={styles.currencyText}>ETB</Text></Text>
              <View style={styles.progressBarBg}>
                <View 
                  style={[
                    styles.progressBarFill, 
                    { 
                      width: `${Math.min(100, Math.max(0, 100 - (loanData.activeLoan.remaining_balance / loanData.activeLoan.principal_amount * 100)))}%` 
                    }
                  ]} 
                /> 
              </View>
              <Text style={styles.loanSubtext}>
                {Math.round(100 - (loanData.activeLoan.remaining_balance / loanData.activeLoan.principal_amount * 100))}% Repaid
              </Text>
            </>
          ) : (
            <View style={styles.noLoanContent}>
              <Text style={styles.noLoanText}>No active loan</Text>
              <Text style={styles.loanSubtext}>You are eligible to apply</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Savings Growth Chart */}
        <Text style={styles.sectionTitle}>Savings Growth</Text>
        <View style={styles.chartCard}>
          <LineChart
            data={chartData}
            width={width - 64}
            height={200}
            yAxisSuffix=""
            yAxisLabel=""
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
              style: { borderRadius: 16 },
              propsForDots: {
                r: '5',
                strokeWidth: '2',
                stroke: '#2563eb',
              },
              propsForBackgroundLines: {
                strokeDasharray: '',
                stroke: '#f1f5f9',
                strokeWidth: 1,
              },
            }}
            bezier
            style={styles.chart}
            withInnerLines={true}
            withOuterLines={false}
            withVerticalLines={false}
          />
        </View>

        {/* Quick Actions Grid */}
        <Text style={styles.sectionTitle}>Services</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('Savings')}>
            <View style={[styles.actionIconBg, { backgroundColor: '#eff6ff' }]}>
              <Ionicons name="trending-up" size={26} color="#2563eb" />
            </View>
            <Text style={styles.actionLabel}>Savings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('Loans')}>
            <View style={[styles.actionIconBg, { backgroundColor: '#ecfdf5' }]}>
              <Ionicons name="document-text" size={26} color="#059669" />
            </View>
            <Text style={styles.actionLabel}>Loans</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('Guarantors')}>
            <View style={[styles.actionIconBg, { backgroundColor: '#f5f3ff' }]}>
              <Ionicons name="people" size={26} color="#7c3aed" />
            </View>
            <Text style={styles.actionLabel}>Guarantors</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('LoanCalculator')}>
            <View style={[styles.actionIconBg, { backgroundColor: '#fef3c7' }]}>
              <Ionicons name="calculator" size={26} color="#d97706" />
            </View>
            <Text style={styles.actionLabel}>Calculator</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { paddingHorizontal: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
  loadingText: { color: '#64748b', marginTop: 12, fontSize: 15, fontWeight: '500' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#0f172a', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 25,
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
  },
  greeting: { fontSize: 14, color: '#94a3b8', fontWeight: '500' },
  userName: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginTop: 2 },
  notifButton: { position: 'relative' },
  notifIconBg: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center', alignItems: 'center',
  },
  notifBadge: {
    position: 'absolute', top: -4, right: -4,
    backgroundColor: '#ef4444', borderRadius: 10, minWidth: 20, height: 20,
    justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#0f172a',
  },
  notifBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  premiumCard: {
    backgroundColor: '#2563eb', marginTop: 20, padding: 24, borderRadius: 24,
    shadowColor: '#2563eb', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 10,
  },
  loanCardGradient: {
    backgroundColor: '#059669', marginTop: 16,
    shadowColor: '#059669',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  cardIconBg: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center', alignItems: 'center',
  },
  cardHeaderText: { color: 'rgba(255,255,255,0.9)', fontSize: 14, fontWeight: '600', marginLeft: 10 },
  bigAmount: { color: '#fff', fontSize: 34, fontWeight: 'bold' },
  currencyText: { fontSize: 16, fontWeight: '600', color: 'rgba(255,255,255,0.7)' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
  cardStat: { flex: 1 },
  cardStatLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
  cardStatValue: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginTop: 2 },
  noLoanContent: { marginTop: 4 },
  noLoanText: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  loanSubtext: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4, fontWeight: '500' },
  progressBarBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3, marginTop: 14 },
  progressBarFill: { height: '100%', backgroundColor: '#fff', borderRadius: 3 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginTop: 28, marginBottom: 16 },
  chartCard: {
    backgroundColor: '#fff', borderRadius: 24, padding: 16, paddingRight: 0,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 15, elevation: 3,
  },
  chart: { borderRadius: 16, marginLeft: -8 },
  quickActions: { flexDirection: 'row', justifyContent: 'space-between' },
  actionItem: { width: (width - 60) / 4, alignItems: 'center' },
  actionIconBg: {
    width: 60, height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2,
  },
  actionLabel: { fontSize: 12, fontWeight: '600', color: '#64748b', marginTop: 8 },
});
