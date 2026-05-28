import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { ScreenScroll, Card, ScreenHeader, SectionLabel } from '../../components/ui';

export default function SupportScreen({ navigation }) {
  const { theme } = useTheme();

  const handleEmailSupport = () => {
    const email = 'support@msms.com';
    Linking.openURL(`mailto:${email}?subject=MSMS Support Request`).catch(() => {
      Alert.alert('Error', 'Unable to open mail app. Please email support@msms.com directly.');
    });
  };

  const handleCallSupport = () => {
    const phone = '+251112345678';
    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert('Error', 'Unable to open dialer.');
    });
  };

  const faqs = [
    { q: 'How do I change my savings rate?', a: 'Go to the Savings tab, enter a new percentage in the simulator, and tap Apply Change.' },
    { q: 'When will my loan be approved?', a: 'Loan requests typically take 2-3 business days to be reviewed by the finance department.' },
    { q: 'How do I update my profile info?', a: 'Personal info is synced with HR. Contact your department admin for official changes.' },
  ];

  return (
    <ScreenScroll
      contentStyle={{ padding: 0 }}
      header={
        <ScreenHeader 
          title="Help & Support" 
          subtitle="We're here to help you" 
          backAction={() => navigation.goBack()} 
        />
      }
    >
      <View style={styles.container}>
        <SectionLabel>Contact Us</SectionLabel>
        <View style={styles.contactGrid}>
          <TouchableOpacity 
            style={[styles.contactCard, { backgroundColor: theme.cardElevated }]}
            onPress={handleEmailSupport}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#3b82f615' }]}>
              <Ionicons name="mail" size={24} color="#3b82f6" />
            </View>
            <Text style={[styles.contactTitle, { color: theme.text }]}>Email Us</Text>
            <Text style={[styles.contactSub, { color: theme.textSecondary }]}>support@msms.com</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.contactCard, { backgroundColor: theme.cardElevated }]}
            onPress={handleCallSupport}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#10b98115' }]}>
              <Ionicons name="call" size={24} color="#10b981" />
            </View>
            <Text style={[styles.contactTitle, { color: theme.text }]}>Call Us</Text>
            <Text style={[styles.contactSub, { color: theme.textSecondary }]}>+251 112 345 678</Text>
          </TouchableOpacity>
        </View>

        <SectionLabel>Frequently Asked Questions</SectionLabel>
        {faqs.map((faq, index) => (
          <Card key={index} style={styles.faqCard}>
            <Text style={[styles.faqQ, { color: theme.text }]}>{faq.q}</Text>
            <Text style={[styles.faqA, { color: theme.textSecondary }]}>{faq.a}</Text>
          </Card>
        ))}

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textMuted }]}>
            Available Monday - Friday, 8:30 AM - 5:30 PM
          </Text>
        </View>
      </View>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, marginTop: -20 },
  contactGrid: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  contactCard: { flex: 1, padding: 20, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  iconCircle: { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  contactTitle: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  contactSub: { fontSize: 12, fontWeight: '500' },
  faqCard: { padding: 20, marginBottom: 12, borderRadius: 20 },
  faqQ: { fontSize: 15, fontWeight: '700', marginBottom: 8 },
  faqA: { fontSize: 13, lineHeight: 20 },
  footer: { marginTop: 32, alignItems: 'center', paddingBottom: 40 },
  footerText: { fontSize: 12, fontWeight: '600', textAlign: 'center' },
});
