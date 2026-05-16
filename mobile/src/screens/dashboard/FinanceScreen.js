import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { ScreenHeader } from '../../components/ui';
import SavingsScreen from './SavingsScreen';
import LoansScreen from './LoansScreen';

export default function FinanceScreen() {
  const { theme } = useTheme();
  const [tab, setTab] = useState('savings');

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScreenHeader title="Finance" subtitle="Savings & loans" />
      <View style={styles.segmentWrap}>
        <View style={[styles.segment, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {[
            { id: 'savings', label: 'Savings' },
            { id: 'loans', label: 'Loans' },
          ].map((item) => {
            const active = tab === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.segmentBtn, active && { backgroundColor: theme.primary }]}
                onPress={() => setTab(item.id)}
              >
                <Text style={[styles.segmentText, { color: active ? '#fff' : theme.textSecondary }]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
      <View style={styles.content}>
        {tab === 'savings' ? <SavingsScreen embedded /> : <LoansScreen embedded />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  segmentWrap: { paddingHorizontal: 16, marginTop: -8, marginBottom: 4 },
  segment: {
    flexDirection: 'row', borderRadius: 14, padding: 4, borderWidth: 1,
  },
  segmentBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  segmentText: { fontSize: 14, fontWeight: '700' },
  content: { flex: 1 },
});
