import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, ActivityIndicator, Text, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

import LoginScreen from '../screens/auth/LoginScreen';
import ChangePasswordScreen from '../screens/auth/ChangePasswordScreen';
import EmailVerificationScreen from '../screens/auth/EmailVerificationScreen';

import HomeScreen from '../screens/dashboard/HomeScreen';
import SavingsScreen from '../screens/dashboard/SavingsScreen';
import LoansScreen from '../screens/dashboard/LoansScreen';
import PayrollScreen from '../screens/dashboard/PayrollScreen';
import ProfileScreen from '../screens/dashboard/ProfileScreen';
import NotificationsScreen from '../screens/dashboard/NotificationsScreen';
import LoanCalculatorScreen from '../screens/dashboard/LoanCalculatorScreen';
import GuarantorsScreen from '../screens/dashboard/GuarantorsScreen';
import RepayScreen from '../screens/dashboard/RepayScreen';
import SupportScreen from '../screens/dashboard/SupportScreen';
import SessionsScreen from '../screens/dashboard/SessionsScreen';

import { StyleSheet } from 'react-native';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function DashboardTabs() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  
  // Adjusted height for a more "floating" look
  const tabBarHeight = 70 + (Platform.OS === 'ios' ? insets.bottom : 12);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = 'ellipse-outline';
          if (route.name === 'Home') iconName = focused ? 'grid' : 'grid-outline';
          if (route.name === 'Savings') iconName = focused ? 'wallet' : 'wallet-outline';
          if (route.name === 'Loans') iconName = focused ? 'cash' : 'cash-outline';
          if (route.name === 'Payroll') iconName = focused ? 'receipt' : 'receipt-outline';
          if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          
          return (
            <View style={[
              styles.iconContainer, 
              focused && { backgroundColor: theme.primary + '15' }
            ]}>
              <Ionicons name={iconName} size={22} color={color} />
            </View>
          );
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          height: tabBarHeight,
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? insets.bottom : 20,
          left: 16,
          right: 16,
          borderRadius: 24,
          backgroundColor: theme.card,
          borderTopWidth: 0,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 24 : 14,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.1,
          shadowRadius: 20,
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginTop: 2,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Savings" component={SavingsScreen} />
      <Tab.Screen name="Loans" component={LoansScreen} />
      <Tab.Screen name="Payroll" component={PayrollScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function MainStack() {
  const { theme } = useTheme();
  const headerOptions = {
    headerStyle: { backgroundColor: theme.headerBg },
    headerTintColor: '#fff',
    headerTitleStyle: { fontWeight: 'bold', fontSize: 17 },
    headerShadowVisible: false,
  };

  return (
    <Stack.Navigator screenOptions={headerOptions}>
      <Stack.Screen name="DashboardTabs" component={DashboardTabs} options={{ headerShown: false }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
      <Stack.Screen name="Payroll" component={PayrollScreen} options={{ title: 'Payroll History' }} />
      <Stack.Screen name="LoanCalculator" component={LoanCalculatorScreen} options={{ title: 'Loan Calculator' }} />
      <Stack.Screen name="Guarantors" component={GuarantorsScreen} options={{ title: 'Guarantors' }} />
      <Stack.Screen name="Repay" component={RepayScreen} options={{ title: 'Loan Repayment' }} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ title: 'Change Password' }} />
      <Stack.Screen name="Support" component={SupportScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Sessions" component={SessionsScreen} options={{ title: 'Active Sessions' }} />
    </Stack.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();
  const { theme } = useTheme();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.headerBg }}>
        <Ionicons name="wallet" size={56} color="#fff" style={{ marginBottom: 12 }} />
        <Text style={{ color: '#93c5fd', fontSize: 22, fontWeight: 'bold' }}>MSMS</Text>
        <Text style={{ color: '#94a3b8', fontSize: 14, marginTop: 4 }}>Employee Portal</Text>
        <ActivityIndicator size="large" color="#fff" style={{ marginTop: 28 }} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!user ? (
        <AuthStack />
      ) : !user.email_verified ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
        </Stack.Navigator>
      ) : user.password_change_required ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen
            name="ForcedChangePassword"
            component={ChangePasswordScreen}
            initialParams={{ isForced: true }}
          />
        </Stack.Navigator>
      ) : (
        <MainStack />
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
