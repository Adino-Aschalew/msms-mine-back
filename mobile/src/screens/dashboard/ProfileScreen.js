import React from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Switch 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const InfoRow = ({ icon, label, value, color, theme }) => (
  <View style={[styles.infoRow, { borderBottomColor: theme.border }]}>
    <View style={[styles.infoIconBg, { backgroundColor: color + '15' }]}>
      <Ionicons name={icon} size={20} color={color} />
    </View>
    <View style={styles.infoTextContainer}>
      <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: theme.text }]}>{value || 'N/A'}</Text>
    </View>
  </View>
);

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout }
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
      {/* Header Profile Section */}
      <View style={[styles.header, { backgroundColor: theme.headerBg }]}>
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
            <Text style={styles.avatarText}>
              {(user?.first_name?.[0] || '') + (user?.last_name?.[0] || '')}
            </Text>
          </View>
          <TouchableOpacity style={[styles.editAvatarBtn, { backgroundColor: theme.primary, borderColor: theme.headerBg }]}>
            <Ionicons name="camera" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.name}>{user?.first_name} {user?.last_name}</Text>
        <View style={styles.roleBadge}>
          <Ionicons name="shield-checkmark" size={14} color="#93c5fd" />
          <Text style={styles.roleText}>{user?.role || 'EMPLOYEE'}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Appearance</Text>
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={[styles.actionIconBg, { backgroundColor: isDark ? '#334155' : '#f1f5f9' }]}>
                <Ionicons name={isDark ? "moon" : "sunny"} size={20} color={isDark ? "#f1f5f9" : "#f59e0b"} />
              </View>
              <Text style={[styles.actionText, { color: theme.text }]}>Dark Mode</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#cbd5e1', true: theme.primary }}
              thumbColor="#fff"
            />
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Personal Information</Text>
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <InfoRow icon="card" label="Employee ID" value={user?.employee_id} color="#3b82f6" theme={theme} />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <InfoRow icon="mail" label="Email Address" value={user?.email} color="#10b981" theme={theme} />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <InfoRow icon="business" label="Department" value={user?.department || 'N/A'} color="#f59e0b" theme={theme} />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <InfoRow icon="ribbon" label="Job Grade" value={user?.job_grade || 'N/A'} color="#8b5cf6" theme={theme} />
        </View>

        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Account Settings</Text>
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <TouchableOpacity style={styles.actionRow} onPress={() => navigation.navigate('ChangePassword')}>
            <View style={styles.settingInfo}>
              <View style={[styles.actionIconBg, { backgroundColor: '#fef2f2' }]}>
                <Ionicons name="lock-closed" size={20} color="#ef4444" />
              </View>
              <Text style={[styles.actionText, { color: theme.text }]}>Change Password</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <TouchableOpacity style={styles.actionRow}>
            <View style={styles.settingInfo}>
              <View style={[styles.actionIconBg, { backgroundColor: '#f0f9ff' }]}>
                <Ionicons name="help-circle" size={22} color="#0ea5e9" />
              </View>
              <Text style={[styles.actionText, { color: theme.text }]}>Help & Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.logoutBtn]} onPress={handleLogout}>
          <Ionicons name="log-out" size={20} color="#fff" />
          <Text style={styles.logoutBtnText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={[styles.appVersion, { color: theme.textMuted }]}>MSMS Mobile v1.1.0</Text>
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    alignItems: 'center', 
    paddingTop: 60, paddingBottom: 40,
    borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
  },
  avatarContainer: { position: 'relative' },
  avatar: {
    width: 100, height: 100, borderRadius: 50,
    justifyContent: 'center', alignItems: 'center', 
    borderWidth: 4, borderColor: 'rgba(255,255,255,0.1)',
  },
  avatarText: { fontSize: 36, fontWeight: 'bold', color: '#fff', textTransform: 'uppercase' },
  editAvatarBtn: {
    position: 'absolute', bottom: 0, right: 0,
    width: 32, height: 32, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center', borderWidth: 3,
  },
  name: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginTop: 16 },
  roleBadge: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginTop: 10,
  },
  roleText: { color: '#93c5fd', fontSize: 13, fontWeight: 'bold', marginLeft: 6, textTransform: 'uppercase' },
  content: { padding: 20 },
  sectionTitle: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginTop: 24 },
  card: {
    borderRadius: 20, padding: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  infoIconBg: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  infoTextContainer: { marginLeft: 16 },
  infoLabel: { fontSize: 11, fontWeight: '600' },
  infoValue: { fontSize: 16, fontWeight: 'bold', marginTop: 1 },
  divider: { height: 1, marginHorizontal: 16 },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  settingInfo: { flexDirection: 'row', alignItems: 'center' },
  actionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  actionIconBg: { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  actionText: { marginLeft: 14, fontSize: 16, fontWeight: '600' },
  logoutBtn: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#ef4444', marginTop: 32, padding: 16, borderRadius: 16,
    shadowColor: '#ef4444', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4,
  },
  logoutBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  appVersion: { textAlign: 'center', fontSize: 12, marginTop: 32, fontWeight: '500' },
});
