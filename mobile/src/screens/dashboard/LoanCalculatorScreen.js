import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const SLIDER_WIDTH = width - 80;

// Simple custom slider since @react-native-community/slider may not be available
const CustomSlider = ({ min, max, step, value, onValueChange, color }) => {
  const percent = ((value - min) / (max - min)) * 100;
  
  return (
    <View style={sliderStyles.track}>
      <View style={[sliderStyles.fill, { width: `${percent}%`, backgroundColor: color || '#2563eb' }]} />
      <View style={[sliderStyles.thumb, { left: `${percent}%`, borderColor: color || '#2563eb' }]} />
      <View 
        style={sliderStyles.touchArea}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={(e) => {
          const x = e.nativeEvent.locationX;
          const newVal = Math.round((x / SLIDER_WIDTH) * (max - min) / step) * step + min;
          onValueChange(Math.max(min, Math.min(max, newVal)));
        }}
        onResponderMove={(e) => {
          const x = e.nativeEvent.locationX;
          const newVal = Math.round((x / SLIDER_WIDTH) * (max - min) / step) * step + min;
          onValueChange(Math.max(min, Math.min(max, newVal)));
        }}
      />
    </View>
  );
};

const sliderStyles = StyleSheet.create({
  track: {
    height: 6, backgroundColor: '#e2e8f0', borderRadius: 3,
    position: 'relative', justifyContent: 'center',
  },
  fill: {
    height: '100%', borderRadius: 3, position: 'absolute', left: 0,
  },
  thumb: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: '#fff',
    borderWidth: 3, position: 'absolute', marginLeft: -12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 4, elevation: 4,
  },
  touchArea: {
    position: 'absolute', top: -20, bottom: -20, left: 0, right: 0,
  },
});

import { ScreenHeader, Card, SectionLabel, Button } from '../../components/ui';
import { useTheme } from '../../context/ThemeContext';

export default function LoanCalculatorScreen({ navigation }) {
  const { theme } = useTheme();
  const [amount, setAmount] = useState(10000);
  const [months, setMonths] = useState(12);
  const [rate, setRate] = useState(12);

  const results = useMemo(() => {
    const principal = amount;
    const monthlyRate = rate / 100 / 12;
    let monthlyPayment;
    let totalPayment;
    let totalInterest;

    if (monthlyRate === 0) {
      monthlyPayment = principal / months;
      totalPayment = principal;
      totalInterest = 0;
    } else {
      monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) 
                        / (Math.pow(1 + monthlyRate, months) - 1);
      totalPayment = monthlyPayment * months;
      totalInterest = totalPayment - principal;
    }

    return {
      monthlyPayment: monthlyPayment.toFixed(2),
      totalPayment: totalPayment.toFixed(2),
      totalInterest: totalInterest.toFixed(2),
      principalPercent: Math.round((principal / totalPayment) * 100),
      interestPercent: Math.round((totalInterest / totalPayment) * 100),
    };
  }, [amount, months, rate]);

  const formatAmount = (v) => {
    return parseFloat(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
      <ScreenHeader 
        title="Loan Calculator" 
        subtitle="Estimate your monthly repayments" 
      />

      <View style={styles.scrollPadding}>
        <Card style={styles.resultCard} elevated>
          <Text style={[styles.resultLabel, { color: theme.textSecondary }]}>Estimated Monthly Payment</Text>
          <Text style={[styles.resultAmount, { color: theme.primary }]}>
            {formatAmount(results.monthlyPayment)} <Text style={styles.resultCurrency}>ETB</Text>
          </Text>

          <View style={[styles.breakdownBar, { backgroundColor: theme.border + '20' }]}>
            <View style={[styles.barPrincipal, { flex: results.principalPercent, backgroundColor: theme.primary }]}>
              <View style={[styles.barGlow, { backgroundColor: theme.primary }]} />
            </View>
            <View style={[styles.barInterest, { flex: results.interestPercent || 1, backgroundColor: theme.accent }]}>
              <View style={[styles.barGlow, { backgroundColor: theme.accent }]} />
            </View>
          </View>

          <View style={styles.breakdownRow}>
            <View style={styles.breakdownItem}>
              <View style={[styles.legendDot, { backgroundColor: theme.primary }]} />
              <View>
                <Text style={[styles.breakdownLabel, { color: theme.textSecondary }]}>Principal</Text>
                <Text style={[styles.breakdownValue, { color: theme.text }]}>{formatAmount(amount)}</Text>
              </View>
            </View>
            <View style={styles.breakdownItem}>
              <View style={[styles.legendDot, { backgroundColor: theme.accent }]} />
              <View>
                <Text style={[styles.breakdownLabel, { color: theme.textSecondary }]}>Interest</Text>
                <Text style={[styles.breakdownValue, { color: theme.text }]}>{formatAmount(results.totalInterest)}</Text>
              </View>
            </View>
          </View>

          <View style={[styles.totalRow, { borderTopColor: theme.border + '20' }]}>
            <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>Total Repayment</Text>
            <Text style={[styles.totalValue, { color: theme.text }]}>{formatAmount(results.totalPayment)} ETB</Text>
          </View>
        </Card>

        <SectionLabel>Adjust Parameters</SectionLabel>
        
        <Card style={styles.slidersCard}>
          <View style={styles.sliderSection}>
            <View style={styles.sliderHeader}>
              <View style={styles.sliderTitleRow}>
                <View style={[styles.sliderIconBg, { backgroundColor: theme.primary + '10' }]}>
                  <Ionicons name="cash" size={18} color={theme.primary} />
                </View>
                <Text style={[styles.sliderTitle, { color: theme.text }]}>Loan Amount</Text>
              </View>
              <Text style={[styles.valueText, { color: theme.primary }]}>{formatAmount(amount)} ETB</Text>
            </View>
            <CustomSlider 
              min={1000} max={500000} step={5000} 
              value={amount} onValueChange={setAmount}
              color={theme.primary}
            />
          </View>

          <View style={styles.sliderSection}>
            <View style={styles.sliderHeader}>
              <View style={styles.sliderTitleRow}>
                <View style={[styles.sliderIconBg, { backgroundColor: theme.accent + '10' }]}>
                  <Ionicons name="calendar" size={18} color={theme.accent} />
                </View>
                <Text style={[styles.sliderTitle, { color: theme.text }]}>Repayment Duration</Text>
              </View>
              <Text style={[styles.valueText, { color: theme.accent }]}>{months} Months</Text>
            </View>
            <CustomSlider 
              min={3} max={48} step={3} 
              value={months} onValueChange={setMonths}
              color={theme.accent}
            />
          </View>

          <View style={[styles.sliderSection, { borderBottomWidth: 0 }]}>
            <View style={styles.sliderHeader}>
              <View style={styles.sliderTitleRow}>
                <View style={[styles.sliderIconBg, { backgroundColor: '#f59e0b15' }]}>
                  <Ionicons name="trending-up" size={18} color="#f59e0b" />
                </View>
                <Text style={[styles.sliderTitle, { color: theme.text }]}>Annual Interest Rate</Text>
              </View>
              <Text style={[styles.valueText, { color: '#f59e0b' }]}>{rate}%</Text>
            </View>
            <CustomSlider 
              min={1} max={20} step={0.5} 
              value={rate} onValueChange={setRate}
              color="#f59e0b"
            />
          </View>
        </Card>

        <Button 
          title="Apply for this Loan" 
          onPress={() => navigation.navigate('Loans')}
          type="primary"
          style={{ marginTop: 24 }}
          icon="arrow-forward"
        />
        
        <View style={{ height: 100 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollPadding: { paddingHorizontal: 20 },
  resultCard: { padding: 24, marginTop: -20 },
  resultLabel: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  resultAmount: { fontSize: 36, fontWeight: '900', marginTop: 8 },
  resultCurrency: { fontSize: 18, fontWeight: '600', opacity: 0.6 },
  breakdownBar: {
    flexDirection: 'row', height: 10, borderRadius: 5, overflow: 'hidden', marginTop: 24,
    position: 'relative'
  },
  barPrincipal: { borderTopLeftRadius: 5, borderBottomLeftRadius: 5, position: 'relative' },
  barInterest: { borderTopRightRadius: 5, borderBottomRightRadius: 5, position: 'relative' },
  barGlow: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.3 },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  breakdownItem: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  breakdownLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  breakdownValue: { fontSize: 15, fontWeight: '800', marginTop: 2 },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 24, paddingTop: 16, borderTopWidth: 1
  },
  totalLabel: { fontSize: 14, fontWeight: '700' },
  totalValue: { fontSize: 18, fontWeight: '900' },
  slidersCard: { padding: 20 },
  sliderSection: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f908' },
  sliderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sliderTitleRow: { flexDirection: 'row', alignItems: 'center' },
  sliderIconBg: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  sliderTitle: { fontSize: 15, fontWeight: '700' },
  valueText: { fontSize: 16, fontWeight: '800' },
});
