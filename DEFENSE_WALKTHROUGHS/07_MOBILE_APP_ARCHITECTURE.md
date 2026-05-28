# Mobile App Architecture - Detailed Code Walkthrough

## Overview

The mobile app is a **React Native (Expo)** client for **employees only**. It connects to the same Express API as the web app but uses secure storage and supports biometric login.

Location: `mobile/` directory

Key files:
- Entry: `mobile/index.js` → `App.js`
- Navigation: `mobile/src/navigation/AppNavigator.js`
- Auth: `mobile/src/context/AuthContext.js`
- API: `mobile/src/api/axios.js`
- Screens: `mobile/src/screens/`

---

## 1. App Bootstrap

### File: `mobile/index.js`

Registers the root component with Expo. Loads environment from `mobile/.env`:
```
EXPO_PUBLIC_API_URL=http://<your-pc-ip>:9999/api
```

**Physical device testing:** Must use LAN IP (not `localhost`). Server logs this hint on startup (`server.js` line 11).

---

## 2. API Client

### File: `mobile/src/api/axios.js`

```javascript
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.18.140.213:9999/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});
```

**Axios instance** with base URL from environment variable.

### Request Interceptor (Lines 18–32)

```javascript
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**Every API call automatically includes JWT** from encrypted device storage.

**Why SecureStore vs AsyncStorage?**
- SecureStore uses iOS Keychain / Android Keystore
- Tokens are not accessible to other apps
- Required for financial app security posture

---

## 3. Authentication Context

### File: `mobile/src/context/AuthContext.js`

### State (Lines 7–9)

```javascript
const [user, setUser] = useState(null);
const [loading, setLoading] = useState(true);
```

### Persist Session on Launch (Lines 11–27)

```javascript
useEffect(() => {
  const loadUser = async () => {
    const token = await SecureStore.getItemAsync('token');
    const savedUser = await SecureStore.getItemAsync('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  };
  loadUser();
}, []);
```

**On app open:** Restores session without re-login if token exists.

### Login (Lines 29–58)

```javascript
const login = async (identifier, password) => {
  const response = await api.post('/auth/login', {
    identifier,
    password,
    role: 'EMPLOYEE'  // Mobile is employee-only
  });

  if (response.data && response.data.success) {
    const { token, user: userData } = response.data.data;
    await SecureStore.setItemAsync('token', token);
    await SecureStore.setItemAsync('user', JSON.stringify(userData));
    setUser(userData);

    const needsVerification = userData.role?.toUpperCase() === 'EMPLOYEE' && !userData.email_verified;
    return { success: true, data: { ...userData, needsVerification } };
  }
};
```

**Key differences from web login:**
1. Hardcoded `role: 'EMPLOYEE'` — mobile cannot login as admin/finance
2. Stores token in SecureStore (not localStorage)
3. Returns `needsVerification` flag for navigation to OTP screen

### OTP Verification (Lines 70–101)

```javascript
const requestOTP = async () => {
  const response = await api.post('/auth/request-otp');
  // Backend sends 6-digit code via email (60 second expiry)
};

const verifyOTP = async (otpCode) => {
  const response = await api.post('/auth/verify-otp', { otpCode });
  if (response.data.success) {
    const updatedUser = { ...user, email_verified: true };
    await SecureStore.setItemAsync('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    return { success: true, requiresPasswordChange: user?.password_change_required };
  }
};
```

**Matches backend:** `AuthService.requestOTP` / `verifyOTP` in `src/modules/auth/auth.service.js`.

### Logout (Lines 60–68)

```javascript
await SecureStore.deleteItemAsync('token');
await SecureStore.deleteItemAsync('user');
setUser(null);
```

---

## 4. Login Screen — Biometric Auth

### File: `mobile/src/screens/auth/LoginScreen.js`

```javascript
const BIOMETRIC_KEY = 'msms_biometric_credentials';

useEffect(() => {
  checkBiometrics();
}, []);
```

```javascript
const checkBiometrics = async () => {
  const compatible = await LocalAuthentication.hasHardwareAsync();
  const enrolled = await LocalAuthentication.isEnrolledAsync();
  const savedCreds = await SecureStore.getItemAsync(BIOMETRIC_KEY);

  if (compatible && enrolled && savedCreds) {
    handleBiometricLogin();  // Auto-prompt on app open
  }
};
```

**Biometric flow:**
1. Check device has fingerprint/face hardware
2. Check user enrolled biometrics on device
3. If saved credentials exist → prompt biometric
4. On success → parse saved `{ identifier, password }` → call `login()`
5. On failure → clear saved credentials, ask for password

```javascript
const result = await LocalAuthentication.authenticateAsync({
  promptMessage: 'Sign in to MSMS',
  disableDeviceFallback: true,
});
```

**Security note:** Credentials stored in SecureStore after first successful password login. Biometric only unlocks access to stored credentials — it does not replace server authentication.

### Post-Login Navigation

```javascript
if (loginResult.success) {
  if (loginResult.data.needsVerification) {
    navigation.replace('EmailVerification');
  } else if (loginResult.data.password_change_required) {
    navigation.replace('ChangePassword', { isForced: true });
  }
  // else: AppNavigator shows main tabs automatically
}
```

**Gate sequence:** Login → Email OTP (if needed) → Force password change (if needed) → Dashboard

---

## 5. Navigation Structure

### File: `mobile/src/navigation/AppNavigator.js`

Typical structure:
```
AuthStack (not logged in)
  ├── LoginScreen
  ├── EmailVerificationScreen
  └── ChangePasswordScreen

MainTabs (logged in)
  ├── HomeScreen
  ├── SavingsScreen
  ├── LoansScreen
  ├── GuarantorsScreen
  ├── RepaymentsScreen
  ├── PayrollScreen
  ├── NotificationsScreen
  ├── ProfileScreen
  └── HelpScreen
```

**Conditional rendering based on `user` from AuthContext:**
```javascript
{user ? <MainTabs /> : <AuthStack />}
```

---

## 6. Feature Screens (API Integration)

| Screen | File | API Endpoints |
|--------|------|---------------|
| Home | `HomeScreen.js` | Dashboard summary |
| Savings | `SavingsScreen.js` | `GET /savings/dashboard` |
| Loans | `LoansScreen.js` | `GET /loans/my-loans`, `POST /loans/apply` |
| Guarantors | `GuarantorsScreen.js` | `GET /guarantors`, status updates |
| Repayments | `RepaymentsScreen.js` | Loan payment history |
| Payroll | `PayrollScreen.js` | `GET /finance/payroll/history` |
| Notifications | `NotificationsScreen.js` | `GET /notifications` |
| Profile | `ProfileScreen.js` | `GET/PUT /auth/profile` |

All screens use the shared `api` axios instance — token attached automatically.

---

## 7. Theme Context

### File: `mobile/src/context/ThemeContext.js`

Provides dark/light mode styling across screens. Persisted preference for UX consistency.

---

## 8. Error Handling on Mobile

```javascript
catch (error) {
  return {
    success: false,
    message: error.response?.data?.message || 'Login failed. Check your network.'
  };
}
```

**Pattern throughout mobile:**
- API errors: show `response.data.message` from backend
- Network errors: generic "Check your network" message
- UI: `Alert.alert()` for critical errors

**No global 401 interceptor on mobile** (unlike web) — session expiry handled per-screen or on next API call failure.

---

## 9. Mobile vs Web Comparison

| Aspect | Mobile | Web |
|--------|--------|-----|
| Framework | React Native (Expo) | React (Vite) |
| Token storage | SecureStore | localStorage |
| Roles supported | EMPLOYEE only | All roles |
| Biometric login | Yes | No |
| Token refresh | Manual re-login | Auto refresh via `api.js` |
| API base URL | `EXPO_PUBLIC_API_URL` | `VITE_API_URL` |
| Navigation | React Navigation | React Router |

---

## Examiner Q&A

**Q: Why a separate mobile app instead of responsive web?**
A: Employees in the field need quick access with biometric login and offline-capable UX patterns. Native SecureStore provides better credential protection than browser localStorage.

**Q: How do you prevent non-employees from using the mobile app?**
A: Login always sends `role: 'EMPLOYEE'`. Backend `validateLogin` checks role matches user's actual DB role — admin cannot login through mobile.

**Q: What happens when JWT expires on mobile?**
A: API returns 401. User must re-login (or use biometric with stored credentials to get new token). Web has automatic refresh token retry; mobile currently relies on re-authentication.

**Q: Is the OTP code visible in development?**
A: Yes — `NotificationService.sendEmail` logs OTP to console when SMTP fails in development mode (`notification.service.js` lines 44–52).

---

## Summary

The mobile app is a **thin client** — all business logic lives on the server. Mobile responsibilities: secure credential storage, biometric UX, employee-specific navigation, and API communication with JWT authentication.
