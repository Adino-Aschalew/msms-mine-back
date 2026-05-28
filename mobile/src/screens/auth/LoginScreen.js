import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, StatusBar, ScrollView, Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const BIOMETRIC_KEY = 'msms_biometric_credentials';

export default function LoginScreen({ navigation }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [hasSavedCredentials, setHasSavedCredentials] = useState(false);
  const { login } = useAuth();

  const [forgotPasswordModal, setForgotPasswordModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetStep, setResetStep] = useState(1);
  const [resetLoading, setResetLoading] = useState(false);

  // Check biometric availability on mount
  useEffect(() => {
    checkBiometrics();
  }, []);

  const checkBiometrics = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      const savedCreds = await SecureStore.getItemAsync(BIOMETRIC_KEY);

      setBiometricAvailable(compatible && enrolled);
      setHasSavedCredentials(!!savedCreds);

      // Auto-prompt biometric login if credentials are saved
      if (compatible && enrolled && savedCreds) {
        handleBiometricLogin();
      }
    } catch (error) {
      console.log('Biometric check error:', error);
    }
  };

  const handleBiometricLogin = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to MSMS',
        subtitle: 'Use your fingerprint or face to sign in',
        cancelLabel: 'Use Password',
        disableDeviceFallback: true,
      });

      if (result.success) {
        const savedCreds = await SecureStore.getItemAsync(BIOMETRIC_KEY);
        if (savedCreds) {
          const { identifier: savedId, password: savedPw } = JSON.parse(savedCreds);
          setLoading(true);
          const loginResult = await login(savedId, savedPw);
          setLoading(false);

          if (loginResult.success) {
            if (loginResult.data.password_change_required) {
              navigation.replace('ChangePassword', { isForced: true });
            }
          } else {
            // Credentials may have changed, clear saved
            await SecureStore.deleteItemAsync(BIOMETRIC_KEY);
            setHasSavedCredentials(false);
            Alert.alert('Session Expired', 'Please log in with your password again.');
          }
        }
      }
    } catch (error) {
      console.log('Biometric auth error:', error);
    }
  };

  const handleLogin = async () => {
    if (!identifier || !password) {
      Alert.alert('Error', 'Please enter both Email and password');
      return;
    }

    setLoading(true);
    const result = await login(identifier, password);
    setLoading(false);

    if (result.success) {
      // Save credentials for biometric login if available
      if (biometricAvailable) {
        try {
          await SecureStore.setItemAsync(
            BIOMETRIC_KEY,
            JSON.stringify({ identifier, password })
          );
          setHasSavedCredentials(true);
        } catch (e) {
          console.log('Failed to save biometric credentials:', e);
        }
      }

      if (result.data.password_change_required) {
        navigation.replace('ChangePassword', { isForced: true });
      }
    } else {
      Alert.alert('Login Failed', result.message);
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setResetLoading(true);
    try {
      const response = await api.post('/auth/forgot-password', { email: resetEmail });
      Alert.alert('Success', response.data.message || 'OTP has been sent to your email');
      setResetStep(2);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setResetLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetOtp || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }

    setResetLoading(true);
    try {
      const response = await api.post('/auth/reset-password', {
        otp: resetOtp,
        newPassword,
        confirmPassword
      });
      Alert.alert('Success', response.data.message || 'Password has been reset successfully');
      setForgotPasswordModal(false);
      setResetStep(1);
      setResetEmail('');
      setResetOtp('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to reset password');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <View style={styles.outerContainer}>
      <StatusBar barStyle="light-content" />

      {/* Background blobs for depth */}
      <View style={[styles.blob, styles.blob1]} />
      <View style={[styles.blob, styles.blob2]} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.formWrapper}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.brandSection}>
            <View style={styles.logoBox}>
              <Ionicons name="sparkles" size={40} color="#fff" />
            </View>
            <Text style={styles.brandTitle}>MSMS</Text>
            <View style={styles.pillBadge}>
              <Text style={styles.pillText}>Employee Portal</Text>
            </View>
          </View>

          <View style={styles.glassCard}>
            <Text style={styles.formTitle}>Welcome back</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email Address</Text>
              <View style={[styles.inputWrapper, { backgroundColor: '#ffffff07', borderColor: '#ffffff15' }]}>
                <Ionicons name="mail-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: '#fff' }]}
                  value={identifier}
                  onChangeText={setIdentifier}
                  placeholder="name@company.com"
                  placeholderTextColor="#64748b"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={[styles.inputWrapper, { backgroundColor: '#ffffff07', borderColor: '#ffffff15' }]}>
                <Ionicons name="lock-closed-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: '#fff' }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor="#64748b"
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#94a3b8" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.forgotBtn}
              onPress={() => {
                setForgotPasswordModal(true);
                setResetStep(1);
              }}
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginBtn}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.9}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.loginBtnText}>Continue</Text>
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                </>
              )}
            </TouchableOpacity>

            {biometricAvailable && hasSavedCredentials && (
              <TouchableOpacity
                style={styles.biometricBtn}
                onPress={handleBiometricLogin}
                activeOpacity={0.7}
              >
                <Ionicons name="finger-print" size={24} color="#3b82f6" />
                <Text style={styles.biometricBtnText}>Biometric Login</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={forgotPasswordModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalGlass}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Reset Password</Text>
              <TouchableOpacity onPress={() => setForgotPasswordModal(false)}>
                <Ionicons name="close" size={24} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {resetStep === 1 ? (
              <>
                <Text style={styles.modalSub}>Enter your email to receive recovery instructions.</Text>
                <View style={styles.modalInput}>
                  <TextInput
                    style={styles.input}
                    value={resetEmail}
                    onChangeText={setResetEmail}
                    placeholder="Enter email address"
                    placeholderTextColor="#64748b"
                    autoCapitalize="none"
                  />
                </View>
                <TouchableOpacity style={styles.modalBtn} onPress={handleForgotPassword} disabled={resetLoading}>
                  <Text style={styles.modalBtnText}>Send Code</Text>
                </TouchableOpacity>
              </>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.modalSub}>We sent a code to your email. Enter it below.</Text>
                <View style={styles.modalInput}>
                  <TextInput
                    style={styles.input}
                    value={resetOtp}
                    onChangeText={setResetOtp}
                    placeholder="6-digit OTP"
                    placeholderTextColor="#64748b"
                    keyboardType="number-pad"
                  />
                </View>
                <View style={styles.modalInput}>
                  <TextInput
                    style={styles.input}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="New Password"
                    placeholderTextColor="#64748b"
                    secureTextEntry
                  />
                </View>
                <TouchableOpacity style={styles.modalBtn} onPress={handleResetPassword} disabled={resetLoading}>
                  <Text style={styles.modalBtnText}>Reset Password</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: { flex: 1, backgroundColor: '#020617' },
  blob: { position: 'absolute', width: 300, height: 300, borderRadius: 150, opacity: 0.15 },
  blob1: { top: -100, left: -50, backgroundColor: '#3b82f6' },
  blob2: { bottom: -50, right: -50, backgroundColor: '#8b5cf6' },
  formWrapper: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  brandSection: { alignItems: 'center', marginBottom: 40 },
  logoBox: { width: 80, height: 80, borderRadius: 24, backgroundColor: '#1e293b', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  brandTitle: { fontSize: 32, fontWeight: '900', color: '#fff', letterSpacing: 4 },
  pillBadge: { backgroundColor: '#3b82f615', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginTop: 12 },
  pillText: { color: '#60a5fa', fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  glassCard: { backgroundColor: '#ffffff05', borderRadius: 32, padding: 24, borderWidth: 1, borderColor: '#ffffff10' },
  formTitle: { fontSize: 28, fontWeight: '800', color: '#fff' },
  formSubtitle: { fontSize: 14, color: '#94a3b8', marginTop: 8, marginBottom: 32 },
  inputContainer: { marginBottom: 20 },
  label: { color: '#94a3b8', fontSize: 12, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', height: 56, borderWidth: 1, borderRadius: 16 },
  inputIcon: { paddingLeft: 16 },
  input: { flex: 1, paddingHorizontal: 12, fontSize: 16, color: '#fff' },
  eyeIcon: { paddingRight: 16 },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 24 },
  forgotText: { color: '#3b82f6', fontWeight: '700', fontSize: 13 },
  loginBtn: {
    height: 60, backgroundColor: '#3b82f6', borderRadius: 18,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10,
    shadowColor: '#3b82f6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8
  },
  loginBtnText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  biometricBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    marginTop: 20, paddingVertical: 12
  },
  biometricBtnText: { color: '#94a3b8', fontSize: 15, fontWeight: '600' },
  footerVersion: { textAlign: 'center', color: '#334155', fontSize: 12, marginTop: 40, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 24 },
  modalGlass: { backgroundColor: '#0f172a', borderRadius: 32, padding: 24, borderWidth: 1, borderColor: '#ffffff10' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 24, fontWeight: '800', color: '#fff' },
  modalSub: { fontSize: 14, color: '#94a3b8', marginBottom: 20 },
  modalInput: { height: 56, backgroundColor: '#ffffff07', borderRadius: 16, borderWidth: 1, borderColor: '#ffffff15', marginBottom: 16 },
  modalBtn: { height: 56, backgroundColor: '#3b82f6', borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  modalBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
