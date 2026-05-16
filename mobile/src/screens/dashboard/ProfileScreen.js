import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ScreenScroll, Card, SectionLabel, InfoRow } from '../../components/ui';

export default function ProfileScreen({ navigation }) {
  const { user, logout, refreshProfile } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    refreshProfile?.();
  }, []);

  const handleLogout = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <ScreenScroll
      contentStyle={{ padding: 0 }}
      header={(
        <View style={[styles.header, { backgroundColor: theme.headerBg, paddingTop: insets.top + 16 }]}>
          <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
            <Text style={styles.avatarText}>
              {(user?.first_name?.[0] || '') + (user?.last_name?.[0] || '')}
            </Text>
          </View>
          <Text style={styles.name}>{user?.first_name} {user?.last_name}</Text>
          <View style={styles.roleBadge}>
            <Ionicons name="shield-checkmark" size={14} color="#93c5fd" />
            <Text style={styles.roleText}>{user?.role || 'EMPLOYEE'}</Text>
          </View>
        </View>
      )}
    >
      <View style={styles.body}>
        <SectionLabel>Appearance</SectionLabel>
        <Card>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={[styles.iconBg, { backgroundColor: isDark ? '#334155' : '#f1f5f9' }]}>
                <Ionicons name={isDark ? 'moon' : 'sunny'} size={20} color={isDark ? '#f1f5f9' : '#f59e0b'} />
              </View>
              <Text style={[styles.settingText, { color: theme.text }]}>Dark mode</Text>
            </View>
            <Switch value={isDark} onValueChange={toggleTheme} trackColor={{ false: '#cbd5e1', true: theme.primary }} thumbColor="#fff" />
          </View>
        </Card>

        <SectionLabel>Personal information</SectionLabel>
        <Card>
          <InfoRow icon="card" label="Employee ID" value={user?.employee_id} color="#3b82f6" theme={theme} />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <InfoRow icon="mail" label="Email" value={user?.email} color="#10b981" theme={theme} />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <InfoRow icon="business" label="Department" value={user?.department} color="#f59e0b" theme={theme} />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <InfoRow icon="ribbon" label="Job grade" value={user?.job_grade} color="#8b5cf6" theme={theme} />
        </Card>

        <SectionLabel>Account</SectionLabel>
        <Card>
          <TouchableOpacity style={styles.actionRow} onPress={() => navigation.navigate('Payroll')}>
            <View style={styles.settingInfo}>
              <View style={[styles.iconBg, { backgroundColor: '#f0f9ff' }]}>
                <Ionicons name="receipt" size={20} color="#0ea5e9" />
              </View>
              <Text style={[styles.settingText, { color: theme.text }]}>Payroll history</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <TouchableOpacity style={styles.actionRow} onPress={() => navigation.navigate('ChangePassword')}>
            <View style={styles.settingInfo}>
              <View style={[styles.iconBg, { backgroundColor: '#fef2f2' }]}>
                <Ionicons name="lock-closed" size={20} color="#ef4444" />
              </View>
              <Text style={[styles.settingText, { color: theme.text }]}>Change password</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <TouchableOpacity style={styles.actionRow} onPress={() => navigation.navigate('Guarantors')}>
            <View style={styles.settingInfo}>
              <View style={[styles.iconBg, { backgroundColor: '#f5f3ff' }]}>
                <Ionicons name="people" size={20} color="#7c3aed" />
              </View>
              <Text style={[styles.settingText, { color: theme.text }]}>Guarantors</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
          </TouchableOpacity>
        </Card>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={styles.logoutText}>Sign out</Text>
        </TouchableOpacity>
        <Text style={[styles.version, { color: theme.textMuted }]}>MSMS Employee · v1.1.0</Text>
      </View>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center', paddingBottom: 32,
    borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
  },
  avatar: {
    width: 96, height: 96, borderRadius: 48,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.15)',
  },
  avatarText: { fontSize: 34, fontWeight: 'bold', color: '#fff' },
  name: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginTop: 14 },
  roleBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20, marginTop: 8,
  },
  roleText: { color: '#93c5fd', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
  body: { padding: 20, marginTop: -8 },
  divider: { height: 1, marginHorizontal: 16 },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  settingInfo: { flexDirection: 'row', alignItems: 'center' },
  iconBg: { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  settingText: { marginLeft: 14, fontSize: 16, fontWeight: '600' },
  actionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  logoutBtn: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8,
    backgroundColor: '#ef4444', marginTop: 28, padding: 16, borderRadius: 16,
  },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  version: { textAlign: 'center', fontSize: 12, marginTop: 28 },
});
