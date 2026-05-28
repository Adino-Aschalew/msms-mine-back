import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, StatusBar, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function ChangePasswordScreen({ route }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, setUser } = useAuth();
  
  const isForced = route.params?.isForced || false;

  // Password strength checker
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { level: 0, label: '', color: '#e5e7eb' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    
    if (score <= 1) return { level: 1, label: 'Weak', color: '#ef4444' };
    if (score === 2) return { level: 2, label: 'Fair', color: '#f59e0b' };
    if (score === 3) return { level: 3, label: 'Good', color: '#3b82f6' };
    return { level: 4, label: 'Strong', color: '#10b981' };
  };

  const strength = getPasswordStrength(newPassword);

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    try {
      const endpoint = isForced ? '/auth/force-change-password' : '/auth/change-password';
      const response = await api.post(endpoint, { newPassword });
      
      if (response.data.success) {
        Alert.alert('Success', 'Password changed successfully!');
        const updatedUser = { ...user, password_change_required: false };
        await SecureStore.setItemAsync('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.outerContainer, { backgroundColor: isForced ? '#0f172a' : '#f8fafc' }]}>
      <StatusBar barStyle="light-content" backgroundColor={isForced ? '#0f172a' : '#0f172a'} />
      
      {/* Header */}
      <View style={[styles.headerSection, { backgroundColor: '#0f172a' }]}>
        <View style={styles.iconCircle}>
          <Ionicons name="key" size={36} color="#fff" />
        </View>
        <Text style={styles.headerTitle}>
          {isForced ? 'Set Your Password' : 'Change Password'}
        </Text>
        <Text style={styles.headerSubtitle}>
          {isForced 
            ? 'For security, you must create a personal password' 
            : 'Keep your account secure'}
        </Text>
      </View>

      {/* Form */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.formWrapper}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          style={styles.formContainer} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          
          {isForced && (
            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={22} color="#2563eb" />
              <Text style={styles.infoText}>
                You are currently using the default password. Please create a new, secure password to continue.
              </Text>
            </View>
          )}

          {/* New Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>New Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="At least 8 characters"
                placeholderTextColor="#9ca3af"
                secureTextEntry={!showNew}
              />
              <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowNew(!showNew)}>
                <Ionicons name={showNew ? 'eye-off-outline' : 'eye-outline'} size={22} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* Strength Indicator */}
            {newPassword.length > 0 && (
              <View style={styles.strengthRow}>
                <View style={styles.strengthBars}>
                  {[1, 2, 3, 4].map(i => (
                    <View key={i} style={[
                      styles.strengthBar,
                      { backgroundColor: i <= strength.level ? strength.color : '#e5e7eb' }
                    ]} />
                  ))}
                </View>
                <Text style={[styles.strengthLabel, { color: strength.color }]}>{strength.label}</Text>
              </View>
            )}
          </View>

          {/* Confirm Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={[
              styles.inputWrapper,
              confirmPassword.length > 0 && confirmPassword !== newPassword && styles.inputError
            ]}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Re-enter new password"
                placeholderTextColor="#9ca3af"
                secureTextEntry={!showConfirm}
              />
              <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowConfirm(!showConfirm)}>
                <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={22} color="#6b7280" />
              </TouchableOpacity>
            </View>
            {confirmPassword.length > 0 && confirmPassword !== newPassword && (
              <Text style={styles.errorText}>Passwords do not match</Text>
            )}
            {confirmPassword.length > 0 && confirmPassword === newPassword && (
              <View style={styles.matchRow}>
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                <Text style={styles.matchText}>Passwords match</Text>
              </View>
            )}
          </View>

          {/* Requirements */}
          <View style={styles.reqBox}>
            <Text style={styles.reqTitle}>Password Requirements:</Text>
            <View style={styles.reqRow}>
              <Ionicons name={newPassword.length >= 8 ? 'checkmark-circle' : 'ellipse-outline'} size={16} color={newPassword.length >= 8 ? '#10b981' : '#9ca3af'} />
              <Text style={[styles.reqText, newPassword.length >= 8 && styles.reqMet]}>At least 8 characters</Text>
            </View>
            <View style={styles.reqRow}>
              <Ionicons name={/[A-Z]/.test(newPassword) ? 'checkmark-circle' : 'ellipse-outline'} size={16} color={/[A-Z]/.test(newPassword) ? '#10b981' : '#9ca3af'} />
              <Text style={[styles.reqText, /[A-Z]/.test(newPassword) && styles.reqMet]}>One uppercase letter</Text>
            </View>
            <View style={styles.reqRow}>
              <Ionicons name={/[0-9]/.test(newPassword) ? 'checkmark-circle' : 'ellipse-outline'} size={16} color={/[0-9]/.test(newPassword) ? '#10b981' : '#9ca3af'} />
              <Text style={[styles.reqText, /[0-9]/.test(newPassword) && styles.reqMet]}>One number</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.submitButton, (!newPassword || !confirmPassword || newPassword !== confirmPassword) && styles.disabledBtn]} 
            onPress={handleChangePassword}
            disabled={loading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.submitButtonText}>Update Password</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
              </>
            )}
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: { flex: 1, backgroundColor: '#1e3a5f' },
  headerSection: { alignItems: 'center', paddingTop: 60, paddingBottom: 30 },
  iconCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#fff' },
  headerSubtitle: { fontSize: 14, color: '#93c5fd', marginTop: 4 },
  formWrapper: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  formContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30, borderTopRightRadius: 30,
    padding: 24, paddingTop: 28,
  },
  infoBox: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: '#eff6ff', borderRadius: 12, padding: 14, marginBottom: 20,
    borderLeftWidth: 4, borderLeftColor: '#2563eb',
  },
  infoText: { color: '#1e40af', fontSize: 14, marginLeft: 10, flex: 1, lineHeight: 20 },
  inputContainer: { marginBottom: 18 },
  label: { fontSize: 14, color: '#374151', marginBottom: 8, fontWeight: '600' },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 12, backgroundColor: '#f9fafb',
  },
  inputError: { borderColor: '#ef4444' },
  inputIcon: { paddingLeft: 14 },
  input: { flex: 1, padding: 14, fontSize: 16, color: '#1f2937' },
  eyeIcon: { padding: 14 },
  strengthRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  strengthBars: { flexDirection: 'row', flex: 1, gap: 4 },
  strengthBar: { flex: 1, height: 4, borderRadius: 2 },
  strengthLabel: { fontSize: 12, fontWeight: '600', marginLeft: 8 },
  errorText: { color: '#ef4444', fontSize: 13, marginTop: 6 },
  matchRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  matchText: { color: '#10b981', fontSize: 13, marginLeft: 4 },
  reqBox: { backgroundColor: '#f9fafb', padding: 14, borderRadius: 12, marginBottom: 20 },
  reqTitle: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 8 },
  reqRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  reqText: { fontSize: 13, color: '#9ca3af', marginLeft: 8 },
  reqMet: { color: '#10b981' },
  submitButton: {
    flexDirection: 'row', backgroundColor: '#2563eb',
    padding: 16, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#2563eb', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 8, elevation: 6,
  },
  disabledBtn: { backgroundColor: '#93c5fd', elevation: 0, shadowOpacity: 0 },
  submitButtonText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
});
