import React from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { API_BASE_URL } from '../api/config';

export function ScreenHeader({ title, subtitle, rightAction }) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { backgroundColor: theme.headerBg, paddingTop: insets.top + 12 }]}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          {subtitle ? <Text style={styles.headerSubtitle}>{subtitle}</Text> : null}
          <Text style={styles.headerTitle}>{title}</Text>
        </View>
        {rightAction}
      </View>
    </View>
  );
}

export function SectionLabel({ children }) {
  const { theme } = useTheme();
  return <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>{children}</Text>;
}

export function Card({ children, style }) {
  const { theme } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }, style]}>
      {children}
    </View>
  );
}

export function InfoRow({ icon, label, value, color, theme }) {
  return (
    <View style={[styles.infoRow, { borderBottomColor: theme.border }]}>
      <View style={[styles.infoIconBg, { backgroundColor: (color || theme.primary) + '15' }]}>
        <Ionicons name={icon} size={20} color={color || theme.primary} />
      </View>
      <View style={styles.infoTextContainer}>
        <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: theme.text }]}>{value ?? 'N/A'}</Text>
      </View>
    </View>
  );
}

export function LoadingState({ message = 'Loading...' }) {
  const { theme } = useTheme();
  return (
    <View style={[styles.center, { backgroundColor: theme.background }]}>
      <ActivityIndicator size="large" color={theme.primary} />
      <Text style={[styles.muted, { color: theme.textSecondary, marginTop: 12 }]}>{message}</Text>
    </View>
  );
}

export function ErrorState({ message, onRetry }) {
  const { theme } = useTheme();
  return (
    <View style={[styles.center, { backgroundColor: theme.background, padding: 24 }]}>
      <View style={[styles.errorIcon, { backgroundColor: '#fef2f2' }]}>
        <Ionicons name="cloud-offline-outline" size={36} color="#ef4444" />
      </View>
      <Text style={[styles.errorTitle, { color: theme.text }]}>Unable to load data</Text>
      <Text style={[styles.muted, { color: theme.textSecondary, textAlign: 'center', marginTop: 8 }]}>
        {message || 'Check your connection and that the server is running.'}
      </Text>
      <Text style={[styles.apiHint, { color: theme.textMuted }]}>API: {API_BASE_URL}</Text>
      {onRetry ? (
        <TouchableOpacity style={[styles.retryBtn, { backgroundColor: theme.primary }]} onPress={onRetry}>
          <Ionicons name="refresh" size={18} color="#fff" />
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export function EmptyState({ icon = 'file-tray-outline', title, subtitle }) {
  const { theme } = useTheme();
  return (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIcon, { backgroundColor: theme.border }]}>
        <Ionicons name={icon} size={36} color={theme.textMuted} />
      </View>
      <Text style={[styles.emptyTitle, { color: theme.text }]}>{title}</Text>
      {subtitle ? <Text style={[styles.muted, { color: theme.textSecondary, textAlign: 'center', marginTop: 6 }]}>{subtitle}</Text> : null}
    </View>
  );
}

export function ScreenScroll({
  children, refreshing, onRefresh, contentStyle, header,
}) {
  const { theme } = useTheme();
  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      {header}
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.scrollContent, contentStyle]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={theme.primary} colors={[theme.primary]} />
          ) : undefined
        }
      >
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  headerSubtitle: { fontSize: 13, color: '#94a3b8', fontWeight: '500' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginTop: 2 },
  sectionLabel: {
    fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1,
    marginBottom: 12, marginTop: 20,
  },
  card: {
    borderRadius: 20, padding: 4, borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  infoIconBg: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  infoTextContainer: { marginLeft: 16, flex: 1 },
  infoLabel: { fontSize: 11, fontWeight: '600' },
  infoValue: { fontSize: 16, fontWeight: 'bold', marginTop: 1 },
  muted: { fontSize: 14 },
  errorIcon: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center' },
  errorTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 16 },
  apiHint: { fontSize: 11, marginTop: 12, textAlign: 'center' },
  retryBtn: {
    flexDirection: 'row', alignItems: 'center', marginTop: 20,
    paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14, gap: 8,
  },
  retryText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  emptyState: { alignItems: 'center', padding: 40 },
  emptyIcon: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  emptyTitle: { fontSize: 17, fontWeight: 'bold' },
  scrollContent: { padding: 16, paddingBottom: 32 },
});
