# Web Frontend Architecture - Detailed Code Walkthrough

## Overview

The web frontend is a **React + Vite** multi-portal application. Each user role gets a dedicated module with shared authentication, API client, and route protection.

Location: `frontend/src/`

Portals:
- `employee/` — Employee self-service
- `loan-commitee/` — Loan committee review
- `finance/` — Finance admin operations
- `hr-admin/` — HR management
- `admin/` — System administration
- `shared/` — Common auth, API, components

---

## 1. Application Entry & Routing

### File: `frontend/src/App.jsx`

Top-level router defines paths per role:
```javascript
// Typical structure
<Route path="/login" element={<LoginPage />} />
<Route path="/employee/*" element={
  <ProtectedRoute requiredRole="employee"><EmployeeModule /></ProtectedRoute>
} />
<Route path="/loan-committee/*" element={
  <ProtectedRoute requiredRole="loan_committee"><LoanCommitteeModule /></ProtectedRoute>
} />
// ... finance, hr, admin
```

**Each portal is lazy-loaded** as a separate module for code splitting.

---

## 2. Authentication Context

### File: `frontend/src/shared/contexts/AuthContext.jsx`

### Role Definitions (Lines 5–20)

```javascript
export const ROLES = {
  ADMIN: 'admin', HR: 'hr', FINANCE: 'finance',
  LOAN_COMMITTEE: 'loan_committee', EMPLOYEE: 'employee'
};

export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: ['/admin/*'],
  [ROLES.HR]: ['/hr/*'],
  [ROLES.FINANCE]: ['/finance/*'],
  [ROLES.LOAN_COMMITTEE]: ['/loan-committee/*'],
  [ROLES.EMPLOYEE]: ['/employee/*']
};
```

**Maps normalized roles to allowed URL prefixes.**

### Login Flow (Lines 57–106)

```javascript
const login = async (credentials, role) => {
  const response = await authAPI.login(identifier, password, role);
  const apiClient = (await import('../services/api')).default;
  apiClient.setTokens(response.token, response.refreshToken);
  setUser(response.user);

  const needsVerification = response.user.role.toUpperCase() === 'EMPLOYEE' && !response.user.email_verified;
  if (needsVerification) return { ...response.user, needsVerification: true };

  if (response.user.password_change_required) {
    setIsForcedPasswordChange(true);
    setShowPasswordChangeModal(true);
  }
  return response.user;
};
```

**Post-login gates:**
1. Email verification (employees only)
2. Forced password change modal
3. Role-based redirect

### Profile Refresh on Mount (Lines 43–55)

```javascript
useEffect(() => {
  const token = localStorage.getItem('authToken');
  if (token && user) {
    authAPI.getProfile()
      .then(response => setUser(prev => ({ ...prev, ...response.data })))
      .catch(() => {});
  }
}, []);
```

**Ensures fresh data** (profile picture, email_verified) after page reload.

### Permission Check (Lines 238–267)

```javascript
const hasPermission = (path) => {
  const allowedPaths = ROLE_PERMISSIONS[user.role.toLowerCase()];
  return allowedPaths.some(allowedPath => {
    if (allowedPath.endsWith('/*')) {
      return path.startsWith(allowedPath.slice(0, -2));
    }
    return path === allowedPath;
  });
};
```

**Client-side route guard** (supplementary to server-side roleMiddleware).

### Role Redirect (Lines 269–288)

```javascript
const getRoleRedirectPath = () => {
  switch (user.role.toUpperCase()) {
    case 'SUPER_ADMIN':
    case 'ADMIN': return '/admin';
    case 'HR': return '/hr';
    case 'FINANCE_ADMIN':
    case 'FINANCE': return '/finance';
    case 'LOAN_COMMITTEE': return '/loan-committee';
    case 'EMPLOYEE': return '/employee';
    default: return '/login';
  }
};
```

---

## 3. Protected Routes

### File: `frontend/src/shared/components/ProtectedRoute.jsx`

```javascript
const normalizeRole = (dbRole) => {
  if (r === 'super_admin' || r === 'admin') return 'admin';
  if (r === 'finance_admin' || r === 'finance') return 'finance';
  if (r === 'loan_committee') return 'loan_committee';
  // ...
};
```

**Maps database role strings to frontend role keys** (handles SUPER_ADMIN vs admin mismatch).

```javascript
if (!isAuthenticated) {
  return <Navigate to="/login" state={{ from: location }} replace />;
}
```

**Unauthenticated → login page** (preserves intended destination in state).

```javascript
if (userRole === 'employee' && !user?.email_verified && location.pathname !== '/verify-email') {
  return <Navigate to="/verify-email" replace />;
}
```

**Email verification gate** for employees before accessing any employee route.

```javascript
if (requiredRole && userRole !== requiredRole.toLowerCase()) {
  return <Navigate to="/unauthorized" replace />;
}
```

**Wrong role → unauthorized page** (not login — user IS authenticated).

---

## 4. API Client

### File: `frontend/src/shared/services/api.js`

### Token Management (Lines 12–28)

```javascript
setTokens(token, refreshToken) {
  this.token = token;
  this.refreshToken = refreshToken;
  localStorage.setItem('authToken', token);
  localStorage.setItem('refreshToken', refreshToken);
}

clearTokens() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('refreshToken');
}
```

### Request Method (Lines 31–100)

```javascript
async request(endpoint, options = {}) {
  if (this.token) {
    config.headers.Authorization = `Bearer ${this.token}`;
  }
  const response = await fetch(url, config);

  if (!response.ok) { /* parse error JSON, throw */ }

  // Token refresh on 401
  if (response.status === 401 && data.message?.includes('token')) {
    await this.refreshAccessToken();
    config.headers.Authorization = `Bearer ${this.token}`;
    const retryResponse = await fetch(url, config);
    return await retryResponse.json();
  }
}
```

**Automatic token refresh:** On 401 with token-related message, calls `POST /auth/refresh-token`, retries original request.

**Employee module API:** `frontend/src/employee/src/services/api.jsx` wraps shared client with employee-specific endpoints.

---

## 5. Login Page

### File: `frontend/src/shared/pages/LoginPage.jsx`

```javascript
// User selects role portal (Employee, Finance, Loan Committee, etc.)
// Enters identifier (employee ID or email) + password
const user = await login({ identifier, password }, selectedRole);
if (user.needsVerification) {
  navigate('/verify-email');
} else {
  navigate(getRoleRedirectPath());
}
```

**Role selector on login** ensures `validateLogin` middleware receives matching role.

---

## 6. Employee Portal

### Key Pages

| Page | File | Purpose |
|------|------|---------|
| Dashboard | `employee/src/pages/DashboardPage.jsx` | Summary cards |
| Loan Request | `employee/src/pages/LoanRequestPage.jsx` | Apply with guarantor |
| Guarantors | `employee/src/pages/GuarantorsPage.jsx` | Accept/reject requests |
| Savings | (via shared savings API) | View balance, history |

### Loan Request Page Flow

1. `GET /loans/check-eligibility` — show/hide form
2. User fills amount, term, purpose, selects guarantor
3. `GET /loans/check-guarantor/:employeeId` — validate guarantor
4. `POST /loans/apply` — submit application
5. Show success + redirect to applications list

---

## 7. Loan Committee Portal

### File: `frontend/src/loan-commitee/src/pages/LoanRequests.jsx`

```javascript
// Fetch pending applications with risk scores
const data = await committeeAPI.getPendingApplications({ page, limit, ...filters });

// Display: applicant name, amount, department, risk_level badge, risk_score
// Actions: Approve (with adjusted terms), Reject (with reason), Request Info
```

### File: `frontend/src/loan-commitee/src/pages/Dashboard.jsx`

Summary statistics: pending count, approved this month, portfolio overview.

### API: `frontend/src/loan-commitee/src/services/committeeAPI.jsx`

Wraps `/api/loan-committee/*` endpoints.

---

## 8. Finance Portal

### Key Pages

| Page | Purpose |
|------|---------|
| `FinancePayrollImport.jsx` | Upload payroll CSV |
| `FinanceReports.jsx` | Financial reports |
| `AccountProfile.jsx` | Finance user profile |

Payroll flow: Upload → Review batch → Validate → Approve → Process

---

## 9. Validation on Frontend

Frontend validation is **supplementary** (UX), not authoritative:

```javascript
// Example patterns in forms
if (!loanAmount || loanAmount <= 0) setError('Amount must be positive');
if (loanAmount > eligibility.financials.max_loan_by_savings) setError('Exceeds maximum');
```

**Server always re-validates** — never trust client-only checks.

---

## 10. Error Handling Patterns

### API Level
```javascript
catch (err) {
  const errorMessage = err.message || 'Login failed';
  setError(errorMessage);
  throw new Error(errorMessage);
}
```

### Axios Interceptor (employee api.jsx)
```javascript
if (error.response?.status === 401) {
  localStorage.removeItem('authToken');
  window.location.href = '/login';
}
```

**401 → clear tokens → redirect to login** (hard redirect, not React navigate).

### UI Level
- Toast notifications for success/error
- Form field-level error messages
- Loading spinners during API calls (`loading` state in AuthContext)

---

## 11. State Management

**No Redux/Zustand** — uses React Context API:
- `AuthContext` — user, tokens, permissions
- `ThemeContext` — dark/light mode (per portal)
- `NotificationContext` — unread notification count (finance module)

**Local state** in individual pages for forms and lists.

---

## Architecture Diagram

```
App.jsx (Router)
  │
  ├── shared/
  │   ├── contexts/AuthContext.jsx     ← global auth state
  │   ├── services/api.js              ← HTTP client + token refresh
  │   ├── services/authAPI.js          ← auth endpoints
  │   ├── services/loansAPI.js         ← shared loan endpoints
  │   └── components/ProtectedRoute.jsx
  │
  ├── employee/     → /employee/*
  ├── loan-commitee/  → /loan-committee/*
  ├── finance/        → /finance/*
  ├── hr-admin/       → /hr/*
  └── admin/          → /admin/*
```

---

## Examiner Q&A

**Q: Why multiple frontend modules instead of one app with conditional menus?**
A: Separation reduces bundle size per role, prevents employees from seeing admin code, and mirrors organizational structure. Each portal can be deployed/tested independently.

**Q: How do you prevent an employee from accessing /finance routes?**
A: Three layers: (1) `ProtectedRoute` checks role, (2) `hasPermission` for fine-grained paths, (3) backend `roleMiddleware` rejects API calls regardless of frontend.

**Q: What if someone modifies localStorage role?**
A: Frontend role is cosmetic. JWT payload contains real role; backend `authMiddleware` loads user from DB and `roleMiddleware` enforces permissions.

**Q: Explain token refresh flow.**
A: On 401, `api.js` calls `POST /auth/refresh-token` with stored refresh token, gets new access token, retries failed request transparently.

---

## Summary

The web frontend is a **role-segregated SPA** with shared authentication infrastructure. Business logic stays on the server; the frontend handles routing, form UX, token management, and displaying API responses.
