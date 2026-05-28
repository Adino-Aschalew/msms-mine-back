import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Modal, Linking, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

export default function HelpScreen() {
  const { theme, isDark } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategory, setExpandedCategory] = useState('loans');

  const faqCategories = [
    {
      id: 'loans',
      title: 'Loans & Applications',
      icon: 'book',
      description: 'Everything about loan applications, eligibility, and approval process',
      color: theme.info,
      questions: [
        {
          q: 'How do I apply for a loan?',
          a: 'Navigate to the "Loans" section and click "Request New Loan". Complete the multi-step form with your loan details, guarantor information, and supporting documents. Submit for approval.'
        },
        {
          q: 'What are the loan eligibility requirements?',
          a: 'You must have been employed for at least 6 months, have sufficient savings balance (minimum 20% of requested amount), and meet salary requirements (monthly installment ≤ 40% of salary).'
        },
        {
          q: 'What types of loans are available?',
          a: 'We offer Emergency Loans (up to 5,000 ETB), Personal Loans (up to 10,000 ETB), Education Loans (up to 15,000 ETB), and Medical Loans (up to 8,000 ETB). Each has different APR rates and terms.'
        },
        {
          q: 'How long does the loan approval process take?',
          a: 'Loan applications are typically reviewed within 2-3 business days. You\'ll receive email notifications at each step. Approved loans are disbursed within 1 business day.'
        },
        {
          q: 'What documents do I need for loan application?',
          a: 'Basic information is sufficient for initial application. For external guarantors, ID documents and employment proof are required before final approval.'
        },
      ]
    },
    {
      id: 'savings',
      title: 'Savings & Contributions',
      icon: 'shield-checkmark',
      description: 'Manage your savings rate, track contributions, and handle withdrawals',
      color: theme.success,
      questions: [
        {
          q: 'How do I change my savings rate?',
          a: 'Go to the "Savings" section and use the slider to adjust your contribution rate between 15% and 65% of your monthly salary. Changes apply in the next payroll cycle.'
        },
        {
          q: 'When are savings contributions deducted?',
          a: 'Savings are automatically deducted from your monthly payroll on the last business day of each month, along with any loan repayments.'
        },
        {
          q: 'How do I withdraw my savings?',
          a: 'You can request a full withdrawal in the "Savings" section. Submit your reason, optional supporting documents, and confirm. Requests require admin approval and take 3-5 business days to process.'
        },
        {
          q: 'Can I make partial withdrawals?',
          a: 'No, only full balance withdrawals are allowed. This policy ensures you maintain emergency savings. Partial withdrawals are not permitted.'
        },
        {
          q: 'What interest rate do my savings earn?',
          a: 'Your savings earn 2.5% annual interest, compounded monthly. Interest is calculated on your average daily balance.'
        },
      ]
    },
    {
      id: 'repayments',
      title: 'Repayments & Payments',
      icon: 'time',
      description: 'Track your loan repayments, payment schedules, and financial history',
      color: theme.accent,
      questions: [
        {
          q: 'How are loan repayments processed?',
          a: 'All loan repayments are automatically deducted from your monthly payroll. You can view your payment schedule and history in the "Repayments" section.'
        },
        {
          q: 'Can I make extra payments on my loan?',
          a: 'Currently, all repayments are processed through automatic payroll deductions. Extra payments are not supported at this time. Contact HR if you need to discuss payment arrangements.'
        },
        {
          q: 'How can I check my loan repayment progress?',
          a: 'Visit the "Repayments" section to view your loan details, payment schedule, remaining balance, and repayment history with detailed transaction records.'
        },
        {
          q: 'What happens if I miss a payroll deduction?',
          a: 'If a payroll deduction fails, you\'ll receive a notification. Contact HR immediately to arrange alternative payment. Continued missed payments may affect your eligibility for future loans.'
        },
      ]
    },
    {
      id: 'account',
      title: 'Account & Security',
      icon: 'person',
      description: 'Manage your profile, security settings, and account preferences',
      color: theme.warning,
      questions: [
        {
          q: 'How do I update my personal information?',
          a: 'Go to "Profile" and click "Edit Profile". Update your information including contact details, address, and emergency contact. Changes are saved automatically.'
        },
        {
          q: 'How do I change my password?',
          a: 'In your Profile page, go to the "Security" tab and click "Change Password". Enter your current password and choose a new secure password following the requirements shown.'
        },
        {
          q: 'How do I enable two-factor authentication?',
          a: 'Two-factor authentication can be enabled in the "Security" tab of your Profile. This adds an extra layer of security to your account login.'
        },
        {
          q: 'I forgot my password. How do I reset it?',
          a: 'On the login page, click "Forgot Password" and enter your email address. You\'ll receive instructions to reset your password securely.'
        },
        {
          q: 'How do I update my notification preferences?',
          a: 'Notification settings can be managed in the "Notifications" tab of your Profile. Choose your preferences for email and system notifications.'
        },
      ]
    }
  ];

  const quickActions = [
    {
      title: 'Email Support',
      description: 'Send us an email',
      icon: 'mail',
      action: 'mailto:support@msms.com',
      color: theme.success,
      available: true
    },
    {
      title: 'Phone Support',
      description: 'Call our help desk',
      icon: 'call',
      action: 'tel:+251911000000',
      color: theme.accent,
      available: true
    },
    {
      title: 'Live Chat',
      description: 'Chat with our support team',
      icon: 'chatbubble',
      action: '#',
      color: theme.info,
      available: false
    },
    {
      title: 'Video Tutorials',
      description: 'Step-by-step guides',
      icon: 'play-circle',
      action: '#',
      color: theme.warning,
      available: false
    }
  ];

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(q =>
      q.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.a.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  const toggleCategory = (categoryId) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const handleQuickAction = (action) => {
    if (action.startsWith('mailto') || action.startsWith('tel')) {
      Linking.openURL(action).catch(err => Alert.alert('Error', 'Unable to open link'));
    } else {
      Alert.alert('Coming Soon', 'This feature will be available soon.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.primary }]}>
          <Ionicons name="help-circle" size={48} color="#fff" style={styles.headerIcon} />
          <Text style={[styles.headerTitle, { color: '#fff' }]}>Help & Support</Text>
          <Text style={[styles.headerSubtitle, { color: 'rgba(255,255,255,0.9)' }]}>Find answers and get support</Text>
        </View>

        {/* Search */}
        <View style={[styles.searchContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Ionicons name="search" size={20} color={theme.textMuted} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: theme.text, backgroundColor: theme.inputBg }]}
            placeholder="Search for help articles..."
            placeholderTextColor={theme.textMuted}
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Get Help Fast</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.quickActionCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                onPress={() => action.available && handleQuickAction(action.action)}
                activeOpacity={0.7}
                disabled={!action.available}
              >
                <View style={[styles.quickActionIconBg, { backgroundColor: action.color + '15' }]}>
                  <Ionicons name={action.icon} size={24} color={action.available ? action.color : theme.textMuted} />
                </View>
                <Text style={[styles.quickActionTitle, { color: action.available ? theme.text : theme.textMuted }]}>{action.title}</Text>
                <Text style={[styles.quickActionDesc, { color: theme.textSecondary }]}>{action.description}</Text>
                {!action.available && (
                  <Text style={[styles.comingSoonText, { color: theme.textMuted }]}>Coming Soon</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* FAQs */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Frequently Asked Questions</Text>

          {filteredCategories.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="search" size={40} color={theme.textMuted} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No Results Found</Text>
              <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                We couldn't find any articles matching "{searchTerm}"
              </Text>
              <TouchableOpacity
                style={[styles.clearBtn, { backgroundColor: theme.primary }]}
                onPress={() => setSearchTerm('')}
              >
                <Text style={styles.clearBtnText}>Clear Search</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredCategories.map((category) => {
              const isExpanded = expandedCategory === category.id;

              return (
                <View key={category.id} style={[styles.categoryCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <TouchableOpacity
                    onPress={() => toggleCategory(category.id)}
                    style={styles.categoryHeader}
                    activeOpacity={0.7}
                  >
                    <View style={styles.categoryLeft}>
                      <View style={[styles.categoryIconBg, { backgroundColor: category.color + '15' }]}>
                        <Ionicons name={category.icon} size={24} color={category.color} />
                      </View>
                      <View style={styles.categoryText}>
                        <Text style={[styles.categoryTitle, { color: theme.text }]}>{category.title}</Text>
                        <Text style={[styles.categoryDesc, { color: theme.textSecondary }]}>{category.description}</Text>
                      </View>
                    </View>
                    <View style={styles.categoryRight}>
                      <View style={[styles.badge, { backgroundColor: theme.inputBg }]}>
                        <Text style={[styles.badgeText, { color: theme.textSecondary }]}>{category.questions.length} articles</Text>
                      </View>
                      <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={20} color={theme.textMuted} />
                    </View>
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.questionsContainer}>
                      {category.questions.map((item, index) => (
                        <View key={index} style={[styles.questionCard, { backgroundColor: theme.card, borderColor: theme.border, borderLeftColor: category.color }]}>
                          <Text style={[styles.question, { color: theme.text }]}>{item.q}</Text>
                          <Text style={[styles.answer, { color: theme.textSecondary }]}>{item.a}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 56, paddingBottom: 32, paddingHorizontal: 16,
    alignItems: 'center',
  },
  headerIcon: { marginBottom: 16 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  headerSubtitle: { fontSize: 14, textAlign: 'center' },
  searchContainer: {
    margin: 16, flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16,
    borderWidth: 1.5,
  },
  searchIcon: { marginRight: 12 },
  searchInput: { flex: 1, fontSize: 16, fontWeight: '500' },
  section: { paddingHorizontal: 16, marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, letterSpacing: -0.2 },
  quickActionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  quickActionCard: {
    flex: 1, minWidth: '45%', padding: 16, borderRadius: 16,
    borderWidth: 1.5, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  quickActionIconBg: {
    width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center',
    marginBottom: 12,
  },
  quickActionTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  quickActionDesc: { fontSize: 12, textAlign: 'center', lineHeight: 16 },
  comingSoonText: { fontSize: 10, fontWeight: '700', marginTop: 8, textTransform: 'uppercase' },
  categoryCard: {
    marginBottom: 12, borderRadius: 16, borderWidth: 1.5,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  categoryHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16,
  },
  categoryLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  categoryIconBg: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  categoryText: { flex: 1 },
  categoryTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  categoryDesc: { fontSize: 13, lineHeight: 18 },
  categoryRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  questionsContainer: { paddingHorizontal: 16, paddingBottom: 16 },
  questionCard: {
    padding: 16, borderRadius: 12, marginBottom: 8, borderWidth: 1,
    borderLeftWidth: 4,
  },
  question: { fontSize: 15, fontWeight: 'bold', marginBottom: 8 },
  answer: { fontSize: 14, lineHeight: 22 },
  emptyState: { alignItems: 'center', padding: 40, marginTop: 20 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 16 },
  emptySubtitle: { fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  clearBtn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, marginTop: 20 },
  clearBtnText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
});
