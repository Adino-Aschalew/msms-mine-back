import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  ActivityIndicator, KeyboardAvoidingView, Platform, 
  Alert, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

export default function EmailVerificationScreen({ navigation }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(60);
  const { user, logout, requestOTP, verifyOTP } = useAuth();
  
  const inputRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Auto-request OTP on mount
  useEffect(() => {
    handleRequestOTP();
  }, []);

  const handleRequestOTP = async () => {
    try {
      setResending(true);
      const result = await requestOTP();
      if (result.success) {
        setTimer(60);
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send verification code');
    } finally {
      setResending(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleKeyPress = (index, key) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) {
      Alert.alert('Incomplete Code', 'Please enter all 6 digits');
      return;
    }

    try {
      setLoading(true);
      const result = await verifyOTP(code);
      if (result.success) {
        // Success handled by AuthContext state update which triggers navigator
      } else {
        Alert.alert('Verification Failed', result.message);
        setOtp(['', '', '', '', '', '']);
        inputRefs[0].current.focus();
      }
    } catch (error) {
      Alert.alert('Error', 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Ionicons name="log-out-outline" size={24} color="#64748b" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.iconBg}>
            <Ionicons name="mail" size={40} color="#2563eb" />
          </View>
          <Text style={styles.title}>Verify Your Email</Text>
          <Text style={styles.subtitle}>
            We've sent a 6-digit code to{'\n'}
            <Text style={styles.emailText}>{user?.email}</Text>
          </Text>
        </View>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={inputRefs[index]}
              style={[
                styles.otpInput,
                digit ? styles.otpInputFilled : null
              ]}
              value={digit}
              onChangeText={(v) => handleOtpChange(index, v)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        <TouchableOpacity 
          style={[styles.verifyBtn, otp.some(d => !d) ? styles.verifyBtnDisabled : null]} 
          onPress={handleVerify}
          disabled={loading || otp.some(d => !d)}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.verifyBtnText}>Verify and Continue</Text>
          )}
        </TouchableOpacity>

        <View style={styles.resendContainer}>
          <Text style={styles.resendLabel}>Didn't receive code?</Text>
          <TouchableOpacity 
            onPress={handleRequestOTP} 
            disabled={timer > 0 || resending}
          >
            {resending ? (
              <ActivityIndicator size="small" color="#2563eb" />
            ) : (
              <Text style={[styles.resendLink, timer > 0 ? styles.resendDisabled : null]}>
                {timer > 0 ? `Resend in ${timer}s` : 'Resend Code'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, padding: 24, alignItems: 'center' },
  logoutBtn: { 
    alignSelf: 'flex-end', flexDirection: 'row', 
    alignItems: 'center', marginBottom: 40 
  },
  logoutText: { marginLeft: 8, color: '#64748b', fontWeight: '600' },
  header: { alignItems: 'center', marginBottom: 40 },
  iconBg: { 
    width: 80, height: 80, borderRadius: 24, 
    backgroundColor: '#eff6ff', justifyContent: 'center', 
    alignItems: 'center', marginBottom: 24 
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1e293b', marginBottom: 12 },
  subtitle: { fontSize: 16, color: '#64748b', textAlign: 'center', lineHeight: 24 },
  emailText: { color: '#1e293b', fontWeight: 'bold' },
  otpContainer: { 
    flexDirection: 'row', justifyContent: 'space-between', 
    width: '100%', marginBottom: 40 
  },
  otpInput: {
    width: (width - 48 - 40) / 6,
    height: 60,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    backgroundColor: '#f8fafc'
  },
  otpInputFilled: {
    borderColor: '#2563eb',
    backgroundColor: '#fff'
  },
  verifyBtn: {
    width: '100%', height: 56, backgroundColor: '#2563eb',
    borderRadius: 16, justifyContent: 'center', alignItems: 'center',
    shadowColor: '#2563eb', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 4
  },
  verifyBtnDisabled: { backgroundColor: '#94a3b8', shadowOpacity: 0 },
  verifyBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  resendContainer: { marginTop: 32, alignItems: 'center' },
  resendLabel: { color: '#64748b', fontSize: 14, marginBottom: 8 },
  resendLink: { color: '#2563eb', fontSize: 16, fontWeight: 'bold' },
  resendDisabled: { color: '#94a3b8' }
});
