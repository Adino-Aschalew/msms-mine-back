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
import FinanceScreen from '../screens/dashboard/FinanceScreen';
import ProfileScreen from '../screens/dashboard/ProfileScreen';
import NotificationsScreen from '../screens/dashboard/NotificationsScreen';
import LoanCalculatorScreen from '../screens/dashboard/LoanCalculatorScreen';
import GuarantorsScreen from '../screens/dashboard/GuarantorsScreen';
import PayrollScreen from '../screens/dashboard/PayrollScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function DashboardTabs() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const tabBarHeight = 58 + Math.max(insets.bottom, Platform.OS === 'android' ? 10 : 0);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = 'ellipse-outline';
          if (route.name === 'Home') iconName = focused ? 'grid' : 'grid-outline';
          if (route.name === 'Finance') iconName = focused ? 'wallet' : 'wallet-outline';
          if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          height: tabBarHeight,
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 6,
          borderTopWidth: 1,
          borderTopColor: theme.border,
          backgroundColor: theme.card,
          elevation: 12,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginBottom: 2,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="Finance" component={FinanceScreen} options={{ title: 'Finance' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
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
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ title: 'Change Password' }} />
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
