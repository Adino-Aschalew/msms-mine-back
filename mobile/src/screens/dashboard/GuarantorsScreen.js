import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  ActivityIndicator, TouchableOpacity, Alert, Modal, TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/axios';
import { useTheme } from '../../context/ThemeContext';

export default function GuarantorsScreen() {
  const { theme } = useTheme();
  const [guarantors, setGuarantors] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form
  const [guarantorId, setGuarantorId] = useState('');
  const [relationship, setRelationship] = useState('');

  const fetchData = async () => {
    try {
      const [listRes, statsRes] = await Promise.all([
        api.get('/guarantors'),
        api.get('/guarantors/stats')
      ]);
      if (listRes.data.success) setGuarantors(listRes.data.data || []);
      if (statsRes.data.success) setStats(statsRes.data.data);
    } catch (error) {
      console.error('Guarantors fetch error:', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);
  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const handleAddGuarantor = async () => {
    if (!guarantorId || !relationship) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/guarantors', {
        guarantor_employee_id: guarantorId,
        relationship
      });
      if (res.data.success) {
        Alert.alert('Success', 'Guarantor request sent!');
        setShowAddModal(false);
        setGuarantorId(''); setRelationship('');
        fetchData();
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to add guarantor');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED': case 'ACTIVE': return '#10b981';
      case 'PENDING': return '#f59e0b';
      case 'REJECTED': return '#ef4444';
      default: return '#64748b';
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Header */}
        <View style={[styles.statsCard, { backgroundColor: theme.headerBg }]}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Active Guarantors</Text>
            <Text style={styles.statValue}>{stats?.active_count || 0}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Pending Requests</Text>
            <Text style={[styles.statValue, { color: '#f59e0b' }]}>{stats?.pending_count || 0}</Text>
          </View>
        </View>

        <View style={styles.headerRow}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Guarantor List</Text>
          <TouchableOpacity style={[styles.addBtn, { backgroundColor: theme.primary }]} onPress={() => setShowAddModal(true)}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addBtnText}>Add New</Text>
          </TouchableOpacity>
        </View>

        {guarantors.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIconBg, { backgroundColor: theme.card }]}>
              <Ionicons name="people-outline" size={48} color={theme.textMuted} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No Guarantors</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              You need guarantors to apply for major loans.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {guarantors.map((g, i) => (
              <View key={g.id || i} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={styles.cardHeader}>
                  <View style={[styles.avatar, { backgroundColor: theme.primary + '20' }]}>
                    <Text style={[styles.avatarText, { color: theme.primary }]}>
                      {g.guarantor_name?.split(' ').map(n => n[0]).join('') || '?'}
                    </Text>
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={[styles.cardName, { color: theme.text }]}>{g.guarantor_name || g.guarantor_employee_id}</Text>
                    <Text style={[styles.cardSub, { color: theme.textSecondary }]}>{g.relationship} • {g.guarantor_employee_id}</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: getStatusColor(g.status) + '15' }]}>
                    <Text style={[styles.badgeText, { color: getStatusColor(g.status) }]}>{g.status}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Add Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Request Guarantor</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close-circle" size={28} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Guarantor Employee ID</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.inputBorder }]}
              placeholder="e.g. EMP123"
              placeholderTextColor={theme.textMuted}
              value={guarantorId}
              onChangeText={setGuarantorId}
            />

            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Relationship</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.inputBorder }]}
              placeholder="e.g. Colleague, Friend"
              placeholderTextColor={theme.textMuted}
              value={relationship}
              onChangeText={setRelationship}
            />

            <TouchableOpacity style={[styles.submitBtn, { backgroundColor: theme.primary }]} onPress={handleAddGuarantor} disabled={submitting}>
              {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Send Request</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  statsCard: {
    margin: 16, padding: 24, borderRadius: 24,
    flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 4,
  },
  statItem: { alignItems: 'center' },
  statLabel: { fontSize: 12, color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase' },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginTop: 4 },
  statDivider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.1)' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  addBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  addBtnText: { color: '#fff', fontWeight: 'bold', marginLeft: 4, fontSize: 14 },
  emptyState: { alignItems: 'center', padding: 60, marginTop: 20 },
  emptyIconBg: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold' },
  emptySubtitle: { fontSize: 14, textAlign: 'center', marginTop: 8 },
  list: { padding: 16 },
  card: { padding: 16, borderRadius: 20, marginBottom: 12, borderWidth: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontWeight: 'bold', fontSize: 16 },
  cardInfo: { flex: 1, marginLeft: 16 },
  cardName: { fontSize: 16, fontWeight: 'bold' },
  cardSub: { fontSize: 12, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 22, fontWeight: 'bold' },
  inputLabel: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', marginBottom: 8, marginTop: 16 },
  input: { borderWidth: 1.5, borderRadius: 16, padding: 14, fontSize: 16 },
  submitBtn: { padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 32 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
