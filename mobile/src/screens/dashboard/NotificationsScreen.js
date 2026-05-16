import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, FlatList, RefreshControl,
  ActivityIndicator, TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/axios';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data || []);
      }
    } catch (error) {
      console.error('Notifications error:', error.response?.data || error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);
  const onRefresh = () => { setRefreshing(true); fetchNotifications(); };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (error) {
      console.error('Mark read error:', error);
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Mark all read error:', error);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'SUCCESS': return { name: 'checkmark-circle', color: '#10b981' };
      case 'WARNING': return { name: 'warning', color: '#f59e0b' };
      case 'ERROR': return { name: 'close-circle', color: '#ef4444' };
      default: return { name: 'information-circle', color: '#3b82f6' };
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#2563eb" /></View>;
  }

  const unreadCount = Array.isArray(notifications) ? notifications.filter(n => !n.is_read).length : 0;

  return (
    <View style={styles.container}>
      {/* Header Actions */}
      {unreadCount > 0 && (
        <TouchableOpacity style={styles.markAllBtn} onPress={markAllRead}>
          <Ionicons name="checkmark-done-outline" size={18} color="#2563eb" />
          <Text style={styles.markAllText}>Mark all as read ({unreadCount})</Text>
        </TouchableOpacity>
      )}

      {!Array.isArray(notifications) || notifications.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="notifications-off-outline" size={40} color="#94a3b8" />
          </View>
          <Text style={styles.emptyTitle}>No Notifications</Text>
          <Text style={styles.emptySubtitle}>You're all caught up! New alerts will appear here.</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => String(item.id)}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => {
            const icon = getIcon(item.notification_type);
            return (
              <TouchableOpacity
                style={[styles.notifCard, !item.is_read && styles.unreadCard]}
                onPress={() => !item.is_read && markAsRead(item.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.iconContainer, { backgroundColor: icon.color + '15' }]}>
                  <Ionicons name={icon.name} size={24} color={icon.color} />
                </View>
                <View style={styles.notifContent}>
                  <Text style={[styles.notifTitle, !item.is_read && styles.unreadTitle]}>{item.title}</Text>
                  <Text style={styles.notifMessage} numberOfLines={2}>{item.message}</Text>
                  <Text style={styles.notifTime}>{formatTime(item.created_at)}</Text>
                </View>
                {!item.is_read && <View style={styles.unreadDot} />}
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
  markAllBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    padding: 14, backgroundColor: '#eff6ff', borderBottomWidth: 1, borderBottomColor: '#dbeafe',
  },
  markAllText: { color: '#2563eb', fontSize: 14, fontWeight: '700', marginLeft: 8 },
  emptyState: { alignItems: 'center', padding: 48, marginTop: 40 },
  emptyIconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#334155' },
  emptySubtitle: { fontSize: 14, color: '#94a3b8', textAlign: 'center', marginTop: 6 },
  notifCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    marginHorizontal: 16, marginTop: 10, padding: 16, borderRadius: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 5, elevation: 1,
  },
  unreadCard: { backgroundColor: '#f0f7ff', borderLeftWidth: 4, borderLeftColor: '#2563eb' },
  iconContainer: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: 15, fontWeight: 'bold', color: '#1e293b' },
  unreadTitle: { color: '#0f172a' },
  notifMessage: { fontSize: 13, color: '#64748b', marginTop: 4, lineHeight: 18 },
  notifTime: { fontSize: 11, color: '#94a3b8', marginTop: 8, fontWeight: '600' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#2563eb', marginLeft: 10 },
});
