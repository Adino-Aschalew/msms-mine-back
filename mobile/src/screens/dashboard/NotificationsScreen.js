import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { employeeService } from '../../services/employeeService';
import { LoadingState, ErrorState, EmptyState } from '../../components/ui';

export default function NotificationsScreen() {
  const { theme } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError(null);
    try {
      const list = await employeeService.getNotifications();
      setNotifications(list);
    } catch (err) {
      setError(err.message || 'Network Error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const markAsRead = async (id) => {
    try {
      await employeeService.markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    } catch (err) {
      console.error('Mark read error:', err.message);
    }
  };

  const markAllRead = async () => {
    try {
      await employeeService.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Mark all read error:', err.message);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'SUCCESS': return { name: 'checkmark-circle', color: theme.accent };
      case 'WARNING': return { name: 'warning', color: '#f59e0b' };
      case 'ERROR': return { name: 'close-circle', color: '#ef4444' };
      default: return { name: 'information-circle', color: theme.primary };
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    const diff = Math.floor((Date.now() - d) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) return <LoadingState message="Loading notifications..." />;
  if (error && notifications.length === 0) return <ErrorState message={error} onRetry={load} />;

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {unreadCount > 0 ? (
        <TouchableOpacity style={[styles.markAll, { backgroundColor: theme.primary + '12' }]} onPress={markAllRead}>
          <Ionicons name="checkmark-done-outline" size={18} color={theme.primary} />
          <Text style={[styles.markAllText, { color: theme.primary }]}>Mark all read ({unreadCount})</Text>
        </TouchableOpacity>
      ) : null}

      {notifications.length === 0 ? (
        <EmptyState icon="notifications-off-outline" title="No notifications" subtitle="You're all caught up." />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => String(item.id)}
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); load(true); }}
          contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
          renderItem={({ item }) => {
            const icon = getIcon(item.notification_type);
            return (
              <TouchableOpacity
                style={[
                  styles.card,
                  { backgroundColor: theme.card, borderColor: theme.border },
                  !item.is_read && { borderLeftWidth: 3, borderLeftColor: theme.primary },
                ]}
                onPress={() => !item.is_read && markAsRead(item.id)}
              >
                <View style={[styles.iconBg, { backgroundColor: icon.color + '15' }]}>
                  <Ionicons name={icon.name} size={22} color={icon.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.title, { color: theme.text }]}>{item.title}</Text>
                  <Text style={[styles.message, { color: theme.textSecondary }]} numberOfLines={2}>{item.message}</Text>
                  <Text style={[styles.time, { color: theme.textMuted }]}>{formatTime(item.created_at)}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  markAll: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, gap: 8 },
  markAllText: { fontSize: 14, fontWeight: '700' },
  card: {
    flexDirection: 'row', padding: 14, borderRadius: 16, marginBottom: 10, borderWidth: 1,
  },
  iconBg: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  title: { fontSize: 15, fontWeight: 'bold' },
  message: { fontSize: 13, marginTop: 4, lineHeight: 18 },
  time: { fontSize: 11, marginTop: 8, fontWeight: '600' },
});
