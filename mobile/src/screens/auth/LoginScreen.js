import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, StatusBar, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from '../../context/AuthContext';

const BIOMETRIC_KEY = 'msms_biometric_credentials';

export default function LoginScreen({ navigation }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [hasSavedCredentials, setHasSavedCredentials] = useState(false);
  const { login } = useAuth();

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

  return (
    <View style={styles.outerContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      
      {/* Top Brand Section */}
      <View style={styles.brandSection}>
        <View style={styles.logoContainer}>
          <Ionicons name="shield-checkmark" size={48} color="#fff" />
        </View>
        <Text style={styles.brandTitle}>MSMS</Text>
        <Text style={styles.brandSubtitle}>Microfinance & Savings Management</Text>
      </View>

      {/* Login Form */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.formWrapper}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Employee Login</Text>
            <Text style={styles.formSubtitle}>Enter your credentials to continue</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={identifier}
                  onChangeText={setIdentifier}
                  placeholder="e.g. employee@msms.com"
                  placeholderTextColor="#9ca3af"
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter password"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons 
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
                    size={22} color="#6b7280" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading} activeOpacity={0.8}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.loginButtonText}>Sign In</Text>
                  <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
                </>
              )}
            </TouchableOpacity>

            {/* Biometric Login */}
            {biometricAvailable && hasSavedCredentials && (
              <TouchableOpacity style={styles.biometricButton} onPress={handleBiometricLogin} activeOpacity={0.7}>
                <View style={styles.biometricIconBg}>
                  <Ionicons name="finger-print" size={28} color="#2563eb" />
                </View>
                <Text style={styles.biometricText}>Sign in with Biometrics</Text>
              </TouchableOpacity>
            )}

            {biometricAvailable && !hasSavedCredentials && (
              <View style={styles.biometricHint}>
                <Ionicons name="finger-print" size={16} color="#94a3b8" />
                <Text style={styles.biometricHintText}>
                  Sign in once to enable fingerprint login
                </Text>
              </View>
            )}
            
            <View style={{ height: 40 }} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  brandSection: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
  },
  logoContainer: {
    width: 80, height: 80, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 16,
  },
  brandTitle: {
    fontSize: 32, fontWeight: 'bold', color: '#fff', letterSpacing: 2,
  },
  brandSubtitle: {
    fontSize: 14, color: '#93c5fd', marginTop: 4,
  },
  formWrapper: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 28,
    paddingTop: 32,
  },
  formTitle: {
    fontSize: 24, fontWeight: 'bold', color: '#1e293b',
  },
  formSubtitle: {
    fontSize: 15, color: '#64748b', marginBottom: 28,
  },
  inputContainer: {
    marginBottom: 18,
  },
  label: {
    fontSize: 13, color: '#64748b', marginBottom: 8, fontWeight: '700', textTransform: 'uppercase',
  },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 14,
    backgroundColor: '#f8fafc',
  },
  inputIcon: {
    paddingLeft: 14,
  },
  input: {
    flex: 1, padding: 14, fontSize: 16, color: '#1e293b',
  },
  eyeIcon: {
    padding: 14,
  },
  loginButton: {
    flexDirection: 'row',
    backgroundColor: '#2563eb',
    padding: 16, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  loginButtonText: {
    color: '#fff', fontSize: 17, fontWeight: 'bold',
  },
  biometricButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginTop: 24, paddingVertical: 16,
    borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 14,
    backgroundColor: '#f8fafc',
  },
  biometricIconBg: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: '#eff6ff',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  biometricText: {
    fontSize: 15, fontWeight: '600', color: '#334155',
  },
  biometricHint: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginTop: 24, paddingVertical: 10,
  },
  biometricHintText: {
    fontSize: 13, color: '#94a3b8', marginLeft: 8, fontWeight: '500',
  },
});
