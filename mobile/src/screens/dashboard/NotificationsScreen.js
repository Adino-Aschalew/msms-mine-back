import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { employeeService } from '../../services/employeeService';
import {
  LoadingState, ErrorState, EmptyState, ScreenHeader, Card, ScreenScroll
} from '../../components/ui';

export default function NotificationsScreen() {
  const { theme } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
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
    } catch (err) {}
  };

  const markAllRead = async () => {
    try {
      await employeeService.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {}
  };

  const getIcon = (type) => {
    switch (type) {
      case 'SUCCESS': return { name: 'checkmark-circle', color: theme.accent, bg: theme.accent + '15' };
      case 'WARNING': return { name: 'warning', color: '#f59e0b', bg: '#f59e0b15' };
      case 'ERROR': return { name: 'close-circle', color: theme.danger, bg: theme.danger + '15' };
      default: return { name: 'notifications', color: theme.primary, bg: theme.primary + '15' };
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

  if (loading) return <LoadingState message="Checking for updates..." />;
  if (error && notifications.length === 0) return <ErrorState message={error} onRetry={load} />;

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const content = (
    <>
      <ScreenHeader 
        title="Notifications" 
        subtitle="Stay updated on your status" 
      />
      
      <View style={styles.scrollPadding}>
        {unreadCount > 0 && (
          <TouchableOpacity 
            style={[styles.markAll, { backgroundColor: theme.primary + '10' }]} 
            onPress={markAllRead}
          >
            <Ionicons name="checkmark-done" size={18} color={theme.primary} />
            <Text style={[styles.markAllText, { color: theme.primary }]}>
              Mark all as read ({unreadCount})
            </Text>
          </TouchableOpacity>
        )}

        {notifications.length === 0 ? (
          <EmptyState 
            icon="notifications-off" 
            title="All caught up" 
            subtitle="You have no new notifications at the moment." 
          />
        ) : (
          notifications.map((item, index) => {
            const icon = getIcon(item.notification_type);
            return (
              <TouchableOpacity
                key={item.id || index}
                style={[
                  styles.notifCard,
                  { backgroundColor: item.is_read ? theme.card : theme.cardElevated },
                  !item.is_read && { borderLeftWidth: 4, borderLeftColor: theme.primary }
                ]}
                onPress={() => !item.is_read && markAsRead(item.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.iconBg, { backgroundColor: icon.bg }]}>
                  <Ionicons name={icon.name} size={22} color={icon.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.notifHeader}>
                    <Text style={[styles.notifTitle, { color: theme.text }]}>{item.title}</Text>
                    <Text style={[styles.time, { color: theme.textMuted }]}>{formatTime(item.created_at)}</Text>
                  </View>
                  <Text style={[styles.message, { color: theme.textSecondary }]} numberOfLines={3}>
                    {item.message}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </View>
      <View style={{ height: 100 }} />
    </>
  );

  return (
    <ScreenScroll 
      refreshing={refreshing} 
      onRefresh={() => { setRefreshing(true); load(true); }}
      contentStyle={{ padding: 0 }}
    >
      {content}
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  scrollPadding: { paddingHorizontal: 20, marginTop: -20 },
  markAll: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', 
    padding: 14, borderRadius: 16, gap: 8, marginBottom: 20
  },
  markAllText: { fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  notifCard: { 
    flexDirection: 'row', padding: 16, borderRadius: 20, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2
  },
  iconBg: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  notifHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  notifTitle: { fontSize: 15, fontWeight: '800', flex: 1, marginRight: 8 },
  message: { fontSize: 13, lineHeight: 18, fontWeight: '500' },
  time: { fontSize: 11, fontWeight: '700' },
});
