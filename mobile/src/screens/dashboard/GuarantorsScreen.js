import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { employeeService, formatAmount } from '../../services/employeeService';
import {
  ScreenScroll, Card, StatCard, Badge, Button, SectionLabel, LoadingState, ErrorState, EmptyState, ScreenHeader
} from '../../components/ui';

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

  const [tab, setTab] = useState('inbox');
  const [submitting, setSubmitting] = useState(false);

  const handleAction = async (requestId, action) => {
    setSubmitting(true);
    try {
      // Assuming these methods exist or can be inferred from the context
      await employeeService.respondToGuarantorRequest(requestId, action);
      Alert.alert('Success', `Request ${action}ed successfully.`);
      load(true);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || `Failed to ${action} request`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState message="Loading inbox..." />;
  if (error && guarantors.length === 0) return <ErrorState message={error} onRetry={load} />;

  const filteredGuarantors = guarantors.filter((g) => {
    if (tab === 'inbox') return g.status === 'PENDING';
    if (tab === 'active') return ['APPROVED', 'ACTIVE'].includes(g.status);
    return true;
  });

  const content = (
    <>
      <ScreenHeader 
        title="Guarantors" 
        subtitle="Manage colleague requests" 
      />

      <View style={styles.tabWrap}>
        <View style={[styles.tabs, { backgroundColor: theme.cardElevated }]}>
          {[
            { id: 'inbox', label: 'Inbox', icon: 'mail-unread' },
            { id: 'active', label: 'Active', icon: 'shield-checkmark' },
            { id: 'history', label: 'All', icon: 'list' },
          ].map((item) => {
            const active = tab === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => setTab(item.id)}
                style={[styles.tabBtn, active && { backgroundColor: theme.primary }]}
              >
                <Ionicons 
                  name={item.icon} 
                  size={16} 
                  color={active ? '#fff' : theme.textSecondary} 
                />
                <Text style={[styles.tabText, { color: active ? '#fff' : theme.textSecondary }]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.scrollPadding}>
        {filteredGuarantors.length === 0 ? (
          <EmptyState 
            icon={tab === 'inbox' ? 'mail-open-outline' : 'people-outline'} 
            title={tab === 'inbox' ? 'Inbox is empty' : 'No guarantees found'} 
            subtitle={tab === 'inbox' ? 'You have no pending requests to review.' : 'Your active guarantees will appear here.'}
          />
        ) : (
          filteredGuarantors.map((g, i) => (
            <Card key={g.id || i} style={styles.requestCard}>
              <View style={styles.requestTop}>
                <View style={[styles.avatar, { backgroundColor: theme.primary + '15' }]}>
                  <Text style={[styles.avatarText, { color: theme.primary }]}>
                    {(g.guarantor_name || g.guarantor_id || '?').charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.requesterName, { color: theme.text }]}>
                    {g.guarantor_name || 'Anonymous User'}
                  </Text>
                  <Text style={[styles.requestMeta, { color: theme.textSecondary }]}>
                    Req. for Loan {formatAmount(g.loan_amount || 0)} ETB
                  </Text>
                </View>
                <Badge 
                  label={g.status || 'Pending'} 
                  type={g.status === 'APPROVED' ? 'success' : g.status === 'REJECTED' ? 'danger' : 'warning'} 
                />
              </View>

              {g.status === 'PENDING' && (
                <View style={styles.actionRow}>
                  <Button 
                    title="Reject" 
                    onPress={() => handleAction(g.id, 'reject')}
                    type="secondary"
                    style={{ flex: 1 }}
                    outline
                    loading={submitting}
                  />
                  <Button 
                    title="Approve" 
                    onPress={() => handleAction(g.id, 'approve')}
                    type="primary"
                    style={{ flex: 2 }}
                    loading={submitting}
                  />
                </View>
              )}
            </Card>
          ))
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
  tabWrap: { paddingHorizontal: 20, marginBottom: 20, marginTop: -20 },
  tabs: { flexDirection: 'row', padding: 6, borderRadius: 20 },
  tabBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 16 },
  tabText: { fontSize: 13, fontWeight: '700' },
  scrollPadding: { paddingHorizontal: 20 },
  requestCard: { padding: 16, marginBottom: 16 },
  requestTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 18, fontWeight: '800' },
  requesterName: { fontSize: 16, fontWeight: '800' },
  requestMeta: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 16, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 16 },
});
