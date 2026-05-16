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

export default function LoanCalculatorScreen({ navigation }) {
  const [amount, setAmount] = useState(10000);
  const [months, setMonths] = useState(12);
  const [rate, setRate] = useState(5);

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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Result Card */}
      <View style={styles.resultCard}>
        <Text style={styles.resultLabel}>Monthly Payment</Text>
        <Text style={styles.resultAmount}>
          {formatAmount(results.monthlyPayment)} <Text style={styles.resultCurrency}>ETB</Text>
        </Text>

        <View style={styles.breakdownBar}>
          <View style={[styles.barPrincipal, { flex: results.principalPercent }]} />
          <View style={[styles.barInterest, { flex: results.interestPercent || 1 }]} />
        </View>

        <View style={styles.breakdownRow}>
          <View style={styles.breakdownItem}>
            <View style={[styles.legendDot, { backgroundColor: '#2563eb' }]} />
            <View>
              <Text style={styles.breakdownLabel}>Principal</Text>
              <Text style={styles.breakdownValue}>{formatAmount(amount)} ETB</Text>
            </View>
          </View>
          <View style={styles.breakdownItem}>
            <View style={[styles.legendDot, { backgroundColor: '#f59e0b' }]} />
            <View>
              <Text style={styles.breakdownLabel}>Total Interest</Text>
              <Text style={styles.breakdownValue}>{formatAmount(results.totalInterest)} ETB</Text>
            </View>
          </View>
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Repayment</Text>
          <Text style={styles.totalValue}>{formatAmount(results.totalPayment)} ETB</Text>
        </View>
      </View>

      {/* Sliders Section */}
      <View style={styles.slidersCard}>
        {/* Loan Amount Slider */}
        <View style={styles.sliderSection}>
          <View style={styles.sliderHeader}>
            <View style={styles.sliderTitleRow}>
              <View style={[styles.sliderIconBg, { backgroundColor: '#eff6ff' }]}>
                <Ionicons name="cash" size={18} color="#2563eb" />
              </View>
              <Text style={styles.sliderTitle}>Loan Amount</Text>
            </View>
            <View style={styles.valueBadge}>
              <Text style={styles.valueBadgeText}>{formatAmount(amount)} ETB</Text>
            </View>
          </View>
          <CustomSlider 
            min={1000} max={100000} step={1000} 
            value={amount} onValueChange={setAmount}
            color="#2563eb"
          />
          <View style={styles.sliderRange}>
            <Text style={styles.rangeText}>1,000</Text>
            <Text style={styles.rangeText}>100,000</Text>
          </View>
        </View>

        {/* Duration Slider */}
        <View style={styles.sliderSection}>
          <View style={styles.sliderHeader}>
            <View style={styles.sliderTitleRow}>
              <View style={[styles.sliderIconBg, { backgroundColor: '#ecfdf5' }]}>
                <Ionicons name="calendar" size={18} color="#10b981" />
              </View>
              <Text style={styles.sliderTitle}>Duration</Text>
            </View>
            <View style={[styles.valueBadge, { backgroundColor: '#ecfdf5' }]}>
              <Text style={[styles.valueBadgeText, { color: '#10b981' }]}>{months} months</Text>
            </View>
          </View>
          <CustomSlider 
            min={3} max={60} step={3} 
            value={months} onValueChange={setMonths}
            color="#10b981"
          />
          <View style={styles.sliderRange}>
            <Text style={styles.rangeText}>3 mo</Text>
            <Text style={styles.rangeText}>60 mo</Text>
          </View>
        </View>

        {/* Interest Rate Slider */}
        <View style={[styles.sliderSection, { borderBottomWidth: 0 }]}>
          <View style={styles.sliderHeader}>
            <View style={styles.sliderTitleRow}>
              <View style={[styles.sliderIconBg, { backgroundColor: '#fef3c7' }]}>
                <Ionicons name="trending-up" size={18} color="#f59e0b" />
              </View>
              <Text style={styles.sliderTitle}>Interest Rate</Text>
            </View>
            <View style={[styles.valueBadge, { backgroundColor: '#fef3c7' }]}>
              <Text style={[styles.valueBadgeText, { color: '#f59e0b' }]}>{rate}% / year</Text>
            </View>
          </View>
          <CustomSlider 
            min={1} max={20} step={1} 
            value={rate} onValueChange={setRate}
            color="#f59e0b"
          />
          <View style={styles.sliderRange}>
            <Text style={styles.rangeText}>1%</Text>
            <Text style={styles.rangeText}>20%</Text>
          </View>
        </View>
      </View>

      {/* Amortization Preview */}
      <View style={styles.amortCard}>
        <Text style={styles.amortTitle}>Payment Schedule Preview</Text>
        <View style={styles.amortHeader}>
          <Text style={[styles.amortColHead, { flex: 0.8 }]}>Month</Text>
          <Text style={styles.amortColHead}>Payment</Text>
          <Text style={styles.amortColHead}>Principal</Text>
          <Text style={styles.amortColHead}>Interest</Text>
        </View>
        {[1, 2, 3, Math.ceil(months / 2), months].map((m, i) => {
          const monthlyRate = rate / 100 / 12;
          const mp = monthlyRate === 0 
            ? amount / months 
            : amount * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
          const interestPart = amount * Math.pow(1 + monthlyRate, m - 1) * monthlyRate || 0;
          const principalPart = mp - interestPart;
          
          return (
            <View key={i} style={[styles.amortRow, i % 2 === 0 && { backgroundColor: '#f8fafc' }]}>
              <Text style={[styles.amortCell, { flex: 0.8, color: '#64748b' }]}>#{m}</Text>
              <Text style={styles.amortCell}>{formatAmount(mp)}</Text>
              <Text style={[styles.amortCell, { color: '#2563eb' }]}>{formatAmount(Math.max(0, principalPart))}</Text>
              <Text style={[styles.amortCell, { color: '#f59e0b' }]}>{formatAmount(Math.max(0, interestPart))}</Text>
            </View>
          );
        })}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  resultCard: {
    backgroundColor: '#0f172a', margin: 16, padding: 24, borderRadius: 28,
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10,
  },
  resultLabel: { color: '#94a3b8', fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  resultAmount: { color: '#fff', fontSize: 36, fontWeight: 'bold', marginTop: 8 },
  resultCurrency: { fontSize: 18, color: '#64748b' },
  breakdownBar: {
    flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden', marginTop: 24,
  },
  barPrincipal: { backgroundColor: '#2563eb', borderTopLeftRadius: 4, borderBottomLeftRadius: 4 },
  barInterest: { backgroundColor: '#f59e0b', borderTopRightRadius: 4, borderBottomRightRadius: 4 },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  breakdownItem: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  breakdownLabel: { color: '#94a3b8', fontSize: 11, fontWeight: '600' },
  breakdownValue: { color: '#fff', fontSize: 14, fontWeight: 'bold', marginTop: 1 },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)',
  },
  totalLabel: { color: '#94a3b8', fontSize: 13, fontWeight: '600' },
  totalValue: { color: '#4ade80', fontSize: 18, fontWeight: 'bold' },
  slidersCard: {
    backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 24, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 15, elevation: 3,
  },
  sliderSection: { paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  sliderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sliderTitleRow: { flexDirection: 'row', alignItems: 'center' },
  sliderIconBg: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  sliderTitle: { fontSize: 15, fontWeight: 'bold', color: '#1e293b' },
  valueBadge: { backgroundColor: '#eff6ff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  valueBadgeText: { fontSize: 13, fontWeight: 'bold', color: '#2563eb' },
  sliderRange: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  rangeText: { fontSize: 11, color: '#94a3b8', fontWeight: '600' },
  amortCard: {
    backgroundColor: '#fff', marginHorizontal: 16, marginTop: 16, borderRadius: 24, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 15, elevation: 3,
  },
  amortTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b', marginBottom: 16 },
  amortHeader: { flexDirection: 'row', paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  amortColHead: { flex: 1, fontSize: 11, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' },
  amortRow: { flexDirection: 'row', paddingVertical: 10, borderRadius: 8 },
  amortCell: { flex: 1, fontSize: 13, fontWeight: '600', color: '#1e293b' },
});
