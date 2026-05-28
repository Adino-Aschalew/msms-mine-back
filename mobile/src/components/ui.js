import React from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { API_BASE_URL } from '../api/config';

export function ScreenHeader({ title, subtitle, rightAction, backAction }) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { backgroundColor: theme.headerBg, paddingTop: insets.top + 16 }]}>
      <View style={styles.headerRow}>
        {backAction ? (
          <TouchableOpacity onPress={backAction} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
        ) : null}
        <View style={{ flex: 1 }}>
          {subtitle ? <Text style={styles.headerSubtitle}>{subtitle}</Text> : null}
          <Text style={styles.headerTitle}>{title}</Text>
        </View>
        {rightAction}
      </View>
    </View>
  );
}

export function SectionLabel({ children, rightAction }) {
  const { theme } = useTheme();
  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>{children}</Text>
      {rightAction}
    </View>
  );
}

export function Card({ children, style, elevated = false }) {
  const { theme } = useTheme();
  return (
    <View style={[
      styles.card, 
      { 
        backgroundColor: elevated ? theme.cardElevated : theme.card, 
        borderColor: theme.border,
        borderWidth: elevated ? 0 : 1,
      }, 
      style
    ]}>
      {children}
    </View>
  );
}

export function StatCard({ title, value, icon, color, trend, trendValue }) {
  const { theme } = useTheme();
  const iconColor = color || theme.primary;
  
  return (
    <View style={[styles.statCardRefined, { backgroundColor: theme.cardElevated, borderColor: theme.border }]}>
      <View style={[styles.statIconBgRefined, { backgroundColor: iconColor + '10' }]}>
        <Ionicons name={icon} size={16} color={iconColor} />
      </View>
      <View style={styles.statContent}>
        <Text style={[styles.statLabelRefined, { color: theme.textSecondary }]}>{title}</Text>
        <Text style={[styles.statValueRefined, { color: theme.text }]}>{value}</Text>
      </View>
    </View>
  );
}

export function Button({ title, onPress, type = 'primary', icon, loading, disabled, style }) {
  const { theme } = useTheme();
  
  const getColors = () => {
    switch (type) {
      case 'secondary': return { bg: theme.cardElevated, text: theme.text, border: theme.border };
      case 'outline': return { bg: 'transparent', text: theme.primary, border: theme.primary };
      case 'danger': return { bg: theme.danger, text: '#fff', border: theme.danger };
      default: return { bg: theme.primary, text: '#fff', border: theme.primary };
    }
  };

  const colors = getColors();
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity 
      onPress={onPress} 
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        styles.btn, 
        { backgroundColor: colors.bg, borderColor: colors.border },
        type === 'outline' && { borderWidth: 1.5 },
        isDisabled && { opacity: 0.6 },
        style
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.text} />
      ) : (
        <View style={styles.btnContent}>
          {icon && <Ionicons name={icon} size={18} color={colors.text} style={{ marginRight: 8 }} />}
          <Text style={[styles.btnText, { color: colors.text }]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export function InfoRow({ icon, label, value, color, theme, last }) {
  return (
    <View style={[styles.infoRow, !last && { borderBottomColor: theme.border, borderBottomWidth: 1 }]}>
      <View style={[styles.infoIconBg, { backgroundColor: (color || theme.primary) + (theme.mode === 'dark' ? '20' : '10') }]}>
        <Ionicons name={icon} size={20} color={color || theme.primary} />
      </View>
      <View style={styles.infoTextContainer}>
        <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: theme.text }]}>{value ?? 'N/A'}</Text>
      </View>
    </View>
  );
}

export function Badge({ label, type = 'neutral' }) {
  const { theme } = useTheme();
  
  const getStyles = () => {
    switch (type) {
      case 'success': return { bg: theme.success + '10', text: theme.success, border: theme.success + '30' };
      case 'warning': return { bg: theme.warning + '10', text: theme.warning, border: theme.warning + '30' };
      case 'danger': return { bg: theme.danger + '10', text: theme.danger, border: theme.danger + '30' };
      case 'primary': return { bg: theme.primary + '10', text: theme.primary, border: theme.primary + '30' };
      default: return { bg: theme.textMuted + '10', text: theme.textSecondary, border: theme.textMuted + '30' };
    }
  };

  const s = getStyles();

  return (
    <View style={[styles.badge, { backgroundColor: s.bg, borderColor: s.border, borderWidth: 1 }]}>
      <Text style={[styles.badgeText, { color: s.text }]}>{label}</Text>
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
      <View style={[styles.errorIcon, { backgroundColor: theme.danger + '10' }]}>
        <Ionicons name="alert-circle-outline" size={36} color={theme.danger} />
      </View>
      <Text style={[styles.errorTitle, { color: theme.text }]}>Something went wrong</Text>
      <Text style={[styles.muted, { color: theme.textSecondary, textAlign: 'center', marginTop: 8 }]}>
        {message || 'Check your connection and that the server is running.'}
      </Text>
      {onRetry ? (
        <Button 
          title="Try Again" 
          onPress={onRetry} 
          icon="refresh" 
          style={{ marginTop: 24, paddingHorizontal: 32 }} 
        />
      ) : null}
    </View>
  );
}

export function EmptyState({ icon = 'file-tray-outline', title, subtitle }) {
  const { theme } = useTheme();
  return (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIcon, { backgroundColor: theme.cardElevated }]}>
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
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: '600' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#fff', marginTop: 2 },
  backBtn: { marginRight: 16, width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 24 },
  sectionLabel: {
    fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.2,
  },
  card: {
    borderRadius: 20, padding: 16, borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 12, elevation: 1,
  },
  statCardRefined: { 
    flex: 1, padding: 12, borderRadius: 16, borderWidth: 1, 
    flexDirection: 'row', alignItems: 'center', gap: 10 
  },
  statIconBgRefined: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  statLabelRefined: { fontSize: 11, fontWeight: '500' },
  statValueRefined: { fontSize: 15, fontWeight: '700', marginTop: 1 },
  statCard: { flex: 1, padding: 16, minHeight: 120 },
  statIconBg: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  statContent: { flex: 1 },
  statLabel: { fontSize: 12, fontWeight: '600' },
  statValue: { fontSize: 19, fontWeight: '800', marginTop: 4 },
  trendRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 4 },
  trendText: { fontSize: 11, fontWeight: '700' },
  btn: {
    height: 56, borderRadius: 18, justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 2,
  },
  btnContent: { flexDirection: 'row', alignItems: 'center' },
  btnText: { fontSize: 16, fontWeight: '700' },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16 },
  infoIconBg: { width: 44, height: 44, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  infoTextContainer: { marginLeft: 16, flex: 1 },
  infoLabel: { fontSize: 12, fontWeight: '600' },
  infoValue: { fontSize: 16, fontWeight: '700', marginTop: 2 },
  muted: { fontSize: 14 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  errorIcon: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center' },
  errorTitle: { fontSize: 20, fontWeight: '800', marginTop: 16 },
  emptyState: { alignItems: 'center', padding: 40 },
  emptyIcon: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '800' },
  scrollContent: { padding: 20, paddingBottom: 40 },
});
