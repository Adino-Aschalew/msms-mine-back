import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { employeeService } from '../../services/employeeService';
import { ScreenScroll, LoadingState, ErrorState, EmptyState } from '../../components/ui';

export default function GuarantorsScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [guarantors, setGuarantors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError(null);
    try {
      const list = await employeeService.getGuarantors(user?.id);
      setGuarantors(list);
    } catch (err) {
      setError(err.message || 'Network Error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  const activeCount = guarantors.filter((g) => g.is_approved === true || g.status === 'APPROVED' || g.status === 'ACTIVE').length;
  const pendingCount = guarantors.length - activeCount;

  const getStatusColor = (g) => {
    if (g.is_approved === true || g.status === 'APPROVED' || g.status === 'ACTIVE') return theme.accent;
    if (g.is_approved === false || g.status === 'REJECTED') return '#ef4444';
    return '#f59e0b';
  };

  const getStatusLabel = (g) => {
    if (g.is_approved === true) return 'Approved';
    if (g.is_approved === false) return 'Rejected';
    return g.status || 'Pending';
  };

  if (loading) return <LoadingState message="Loading guarantors..." />;
  if (error && guarantors.length === 0) return <ErrorState message={error} onRetry={load} />;

  return (
    <ScreenScroll refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }}>
      <View style={[styles.stats, { backgroundColor: theme.headerBg }]}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Active</Text>
          <Text style={styles.statValue}>{activeCount}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Pending</Text>
          <Text style={[styles.statValue, { color: '#fbbf24' }]}>{pendingCount}</Text>
        </View>
      </View>

      {guarantors.length === 0 ? (
        <EmptyState
          icon="people-outline"
          title="No guarantors"
          subtitle="Guarantors linked to your loan applications will appear here."
        />
      ) : (
        guarantors.map((g, i) => (
          <View key={g.id || i} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.avatar, { backgroundColor: theme.primary + '18' }]}>
              <Text style={[styles.avatarText, { color: theme.primary }]}>
                {(g.guarantor_name || g.guarantor_id || '?').charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.name, { color: theme.text }]}>{g.guarantor_name || g.guarantor_id}</Text>
              <Text style={[styles.sub, { color: theme.textSecondary }]}>
                {g.relationship || '—'} · {g.guarantor_id || 'N/A'}
              </Text>
            </View>
            <Text style={[styles.status, { color: getStatusColor(g) }]}>{getStatusLabel(g)}</Text>
          </View>
        ))
      )}
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  stats: {
    flexDirection: 'row', borderRadius: 20, padding: 20, marginBottom: 16,
    justifyContent: 'space-around',
  },
  stat: { alignItems: 'center' },
  statLabel: { color: '#94a3b8', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  statValue: { color: '#fff', fontSize: 26, fontWeight: 'bold', marginTop: 4 },
  divider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.12)' },
  card: {
    flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 18,
    borderWidth: 1, marginBottom: 10,
  },
  avatar: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { fontSize: 18, fontWeight: 'bold' },
  name: { fontSize: 15, fontWeight: 'bold' },
  sub: { fontSize: 12, marginTop: 2 },
  status: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
});
