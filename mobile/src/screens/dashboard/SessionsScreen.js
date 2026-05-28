import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ScreenScroll, Card, Badge, Button, ScreenHeader } from '../../components/ui';

export default function SessionsScreen({ navigation }) {
  const { theme } = useTheme();
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);

  // Mock sessions data as API is not available
  const sessions = [
    {
      id: '1',
      device: Platform.OS === 'ios' ? 'iPhone 15 Pro' : 'Samsung Galaxy S23',
      location: 'Addis Ababa, ET',
      lastActive: 'Active Now',
      isCurrent: true,
      browser: 'Native App',
    },
    {
      id: '2',
      device: 'MacBook Pro (Chrome)',
      location: 'Addis Ababa, ET',
      lastActive: '2 hours ago',
      isCurrent: false,
      browser: 'Chrome 124.0.0',
    },
  ];

  const handleRevokeAll = () => {
    Alert.alert(
      'Security Check',
      'This will log you out from all other devices. Do you want to proceed?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Proceed', 
          style: 'destructive', 
          onPress: async () => {
            setLoading(true);
            // In a real app, this would call an API
            setTimeout(() => {
              setLoading(false);
              Alert.alert('Success', 'Other sessions have been revoked.');
            }, 1500);
          } 
        },
      ]
    );
  };

  return (
    <ScreenScroll
      header={(
        <ScreenHeader 
          title="Active Sessions" 
          subtitle="Manage your logged-in devices" 
          backAction={() => navigation.goBack()}
        />
      )}
    >
      <View style={styles.container}>
        <Text style={[styles.infoText, { color: theme.textSecondary }]}>
          These devices are currently logged into your account. If you don't recognize a device, revoke its access immediately.
        </Text>

        {sessions.map(session => (
          <View key={session.id} style={[styles.sessionRow, { borderColor: theme.border }]}>
            <View style={[styles.iconBg, { backgroundColor: theme.cardElevated }]}>
              <Ionicons 
                name={session.device.includes('Mac') || session.device.includes('Chrome') ? 'desktop-outline' : 'phone-portrait-outline'} 
                size={22} 
                color={session.isCurrent ? theme.primary : theme.textSecondary} 
              />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.titleRow}>
                <Text style={[styles.deviceText, { color: theme.text }]}>{session.device}</Text>
                {session.isCurrent && <Badge label="Current" type="primary" />}
              </View>
              <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                {session.browser} · {session.location}
              </Text>
              <Text style={[styles.activeText, { color: session.isCurrent ? theme.success : theme.textMuted }]}>
                {session.lastActive}
              </Text>
            </View>
          </View>
        ))}

        <Card style={styles.securityCard}>
          <Ionicons name="shield-checkmark-outline" size={32} color={theme.success} />
          <Text style={[styles.cardTitle, { color: theme.text }]}>Security Tip</Text>
          <Text style={[styles.cardText, { color: theme.textSecondary }]}>
            Always log out from public devices and change your password regularly to keep your account safe.
          </Text>
        </Card>

        <Button 
          title="Logout from all other devices" 
          onPress={handleRevokeAll} 
          type="danger" 
          outline
          loading={loading}
          style={{ marginTop: 24 }}
          icon="log-out-outline"
        />
      </View>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20 },
  infoText: { fontSize: 13, lineHeight: 18, marginBottom: 24, fontWeight: '500' },
  sessionRow: { 
    flexDirection: 'row', alignItems: 'center', paddingVertical: 16, 
    borderBottomWidth: 1, gap: 16 
  },
  iconBg: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  deviceText: { fontSize: 16, fontWeight: '700' },
  metaText: { fontSize: 12, fontWeight: '500' },
  activeText: { fontSize: 11, fontWeight: '700', marginTop: 4, textTransform: 'uppercase' },
  securityCard: { marginTop: 32, padding: 24, alignItems: 'center', textAlign: 'center' },
  cardTitle: { fontSize: 18, fontWeight: '800', marginTop: 12, marginBottom: 8 },
  cardText: { fontSize: 13, textAlign: 'center', lineHeight: 20, fontWeight: '500' },
});
