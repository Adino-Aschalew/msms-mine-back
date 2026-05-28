import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ScreenScroll, Card, SectionLabel, InfoRow, Badge, Button } from '../../components/ui';

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
        <View style={[styles.header, { backgroundColor: theme.cardElevated, paddingTop: insets.top + 20 }]}>
          <View style={[styles.avatarBox, { borderColor: theme.primary + '30' }]}>
            <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
              <Text style={styles.avatarText}>
                {(user?.first_name?.[0] || '') + (user?.last_name?.[0] || '')}
              </Text>
            </View>
            <View style={[styles.editIcon, { backgroundColor: theme.card }]}>
              <Ionicons name="camera" size={14} color={theme.primary} />
            </View>
          </View>
          <Text style={[styles.name, { color: theme.text }]}>{user?.first_name} {user?.last_name}</Text>
          <View style={[styles.roleBadge, { backgroundColor: theme.primary + '15' }]}>
            <Ionicons name="shield-checkmark" size={14} color={theme.primary} />
            <Text style={[styles.roleText, { color: theme.primary }]}>{user?.role || 'EMPLOYEE'}</Text>
          </View>
        </View>
      )}
    >
      <View style={styles.body}>
        <SectionLabel>Personal Information</SectionLabel>
        <Card style={styles.infoCard}>
          <InfoRow 
            icon="finger-print" 
            label="Employee ID" 
            value={user?.employee_id} 
            color="#3b82f6" 
            theme={theme} 
          />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <InfoRow 
            icon="mail" 
            label="Official Email" 
            value={user?.email} 
            color="#10b981" 
            theme={theme} 
          />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <InfoRow 
            icon="business" 
            label="Department" 
            value={user?.department} 
            color="#f59e0b" 
            theme={theme} 
          />
        </Card>

        <SectionLabel>Preferences</SectionLabel>
        <Card style={styles.infoCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={[styles.iconBg, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]}>
                <Ionicons name={isDark ? 'moon' : 'sunny'} size={20} color={isDark ? '#cbd5e1' : '#f59e0b'} />
              </View>
              <Text style={[styles.settingText, { color: theme.text }]}>Dark Mode</Text>
            </View>
            <Switch 
              value={isDark} 
              onValueChange={toggleTheme} 
              trackColor={{ false: '#cbd5e1', true: theme.primary }} 
              thumbColor="#fff" 
            />
          </View>
        </Card>

        <SectionLabel>Security & Account</SectionLabel>
        <Card style={styles.infoCard}>
          <TouchableOpacity style={styles.actionRow} onPress={() => navigation.navigate('ChangePassword')}>
            <View style={styles.settingInfo}>
              <View style={[styles.iconBg, { backgroundColor: theme.danger + '10' }]}>
                <Ionicons name="lock-closed" size={20} color={theme.danger} />
              </View>
              <Text style={[styles.settingText, { color: theme.text }]}>Change Password</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <TouchableOpacity style={styles.actionRow} onPress={() => navigation.navigate('Guarantors')}>
            <View style={styles.settingInfo}>
              <View style={[styles.iconBg, { backgroundColor: theme.primary + '10' }]}>
                <Ionicons name="people" size={20} color={theme.primary} />
              </View>
              <Text style={[styles.settingText, { color: theme.text }]}>Guarantor Status</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <TouchableOpacity style={styles.actionRow} onPress={() => navigation.navigate('Sessions')}>
            <View style={styles.settingInfo}>
              <View style={[styles.iconBg, { backgroundColor: '#8b5cf610' }]}>
                <Ionicons name="laptop-outline" size={20} color="#8b5cf6" />
              </View>
              <Text style={[styles.settingText, { color: theme.text }]}>Active Sessions</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <TouchableOpacity style={styles.actionRow} onPress={() => navigation.navigate('Support')}>
            <View style={styles.settingInfo}>
              <View style={[styles.iconBg, { backgroundColor: theme.success + '10' }]}>
                <Ionicons name="help-buoy" size={20} color={theme.success} />
              </View>
              <Text style={[styles.settingText, { color: theme.text }]}>Help & Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
          </TouchableOpacity>
        </Card>

        <Button 
          title="Sign Out" 
          onPress={handleLogout} 
          type="danger" 
          outline
          style={{ marginTop: 32 }}
          icon="log-out-outline"
        />
        
        <Text style={[styles.version, { color: theme.textMuted }]}>
          MSMS Employee Hub · Version 2.0.0
        </Text>
      </View>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center', paddingBottom: 40,
    borderBottomLeftRadius: 40, borderBottomRightRadius: 40,
  },
  avatarBox: {
    padding: 6, borderRadius: 52, borderWidth: 2,
    position: 'relative',
  },
  avatar: {
    width: 90, height: 90, borderRadius: 45,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 36, fontWeight: '800', color: '#fff' },
  editIcon: {
    position: 'absolute', bottom: 0, right: 0,
    width: 32, height: 32, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 4,
  },
  name: { fontSize: 24, fontWeight: '800', marginTop: 16 },
  roleBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 24, marginTop: 12,
  },
  roleText: { fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  body: { padding: 20, marginTop: -12 },
  infoCard: { padding: 4 },
  divider: { height: 1.5, marginHorizontal: 20, opacity: 0.1 },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  settingInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconBg: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  settingText: { marginLeft: 16, fontSize: 16, fontWeight: '700' },
  actionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  version: { textAlign: 'center', fontSize: 13, marginTop: 32, fontWeight: '600' },
});
