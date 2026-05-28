# Authentication (Current Module) - Line by Line Walkthrough

> **Note:** `01_AUTHENTICATION_FLOW.md` documents the legacy `src/controllers/authController.js` + `src/models/User.js` pattern. **The live API uses `src/modules/auth/`** mounted at `/api/auth` in `src/routes.js`. This document reflects the **current** implementation.

---

## File Map

| File | Role |
|------|------|
| `src/modules/auth/auth.routes.js` | Routes + multer + validation middleware |
| `src/modules/auth/auth.validation.js` | Request validation |
| `src/modules/auth/auth.controller.js` | HTTP handlers |
| `src/modules/auth/auth.service.js` | Business logic |
| `src/middleware/auth.js` | JWT verification |
| `src/middleware/audit.js` | Audit logging |

---

## 1. Login Route Chain

### `auth.routes.js` Line 48

```javascript
router.post('/login', validateLogin, auditMiddleware('LOGIN_ATTEMPT'), AuthController.login);
```

**Order of execution:**
1. `validateLogin` — reject bad input before hitting DB
2. `auditMiddleware` — log attempt
3. `AuthController.login` — call service

---

## 2. Validation Middleware

### `auth.validation.js` Lines 6–44

```javascript
const validateLogin = (req, res, next) => {
  const { identifier, password, role } = req.body;

  if (!identifier || !password || !role) {
    return res.status(400).json({ success: false, message: 'Identifier, password, and role are required' });
  }
```

**All three fields required** — prevents portal mismatch attacks.

```javascript
  const validRoles = ['ADMIN', 'SUPER_ADMIN', 'HR', 'FINANCE', 'LOAN_COMMITTEE', 'EMPLOYEE'];
  if (!validRoles.includes(normalizedRole)) {
    return res.status(400).json({ success: false, message: 'Invalid role' });
  }
  req.body.role = normalizedRole;
  next();
};
```

**Whitelist approach** — only known roles accepted.

---

## 3. Controller

### `auth.controller.js` Lines 4–31

```javascript
static async login(req, res) {
  const { identifier, password, role } = req.body;
  const result = await AuthService.login(identifier, password, role, req.ip, req.get('User-Agent'));
  res.json({ success: true, message: 'Login successful', data: result });
}
```

**Error mapping:**
- Message contains `'required'` → 400
- Message contains `'credentials'` → 401
- Other → 500

---

## 4. Service — Core Login Logic

### `auth.service.js` Lines 106–192

```javascript
static async login(identifier, password, role, ip, userAgent) {
```

### Identifier Routing (Lines 117–135)

```javascript
if (identifier.includes('@')) {
  user = await this.findByEmail(identifier);
} else {
  user = await this.findByEmployeeId(identifier.toUpperCase());
}
```

**Dual login:** Email for staff; Employee ID (uppercased) for mine workers.

### Active Check (Lines 137–141)

```javascript
if (!user || !user.is_active) {
  await auditLog(null, 'LOGIN_FAILED', 'users', null, null, { identifier }, ip, userAgent);
  throw new Error('Invalid credentials. Please check your username/ID and password.');
}
```

**Generic error message** — does not reveal whether user exists (security).

### Password Verify (Lines 143–149)

```javascript
const isValidPassword = await bcrypt.compare(password, user.password_hash);
if (!isValidPassword) {
  await auditLog(user.id, 'LOGIN_FAILED', ...);
  throw new Error('Invalid credentials...');
}
```

**bcrypt.compare** — constant-time comparison, resistant to timing attacks.

### Token Generation (Lines 159–169)

```javascript
const token = jwt.sign(
  { userId: user.id, employee_id: user.employee_id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN }
);

const refreshToken = jwt.sign(
  { userId: user.id },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
);
```

**Access token** carries role for authorization. **Refresh token** minimal payload (userId only).

### Response Shape (Lines 171–188)

```javascript
return {
  user: { id, employee_id, username, email, role, first_name, last_name,
          email_verified, password_change_required, ... },
  token,
  refreshToken
};
```

**No password_hash in response** — stripped before sending to client.

---

## 5. Auth Middleware

### `middleware/auth.js` Lines 4–48

```javascript
const token = req.header('Authorization')?.replace('Bearer ', '');
const decoded = jwt.verify(token, process.env.JWT_SECRET);

const userResult = await pool.execute(userQuery, [decoded.userId]);
req.user = user[0];
req.userId = decoded.userId;
next();
```

**Re-loads user from DB on every request** — revoked/deactivated users blocked immediately even if JWT not expired.

---

## 6. OTP Email Verification

### `auth.service.js` Lines 552–600 — Request OTP

```javascript
const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
const expiresAt = new Date(Date.now() + 1 * 60 * 1000); // 60 seconds

await query(`
  INSERT INTO otp_verifications (user_id, otp_code, expires_at)
  VALUES (?, ?, ?)
  ON DUPLICATE KEY UPDATE otp_code = VALUES(otp_code), expires_at = VALUES(expires_at)
`, [userId, otpCode, expiresAt]);

await NotificationService.sendEmail(user.email, subject, message);
```

**Business rules:**
- Employees only (`role !== 'EMPLOYEE'` → error)
- 6-digit code, 60-second expiry
- Upsert: one active OTP per user

### Lines 602–631 — Verify OTP

```javascript
const [otpRecord] = await query(`SELECT * FROM otp_verifications WHERE user_id = ? AND otp_code = ?`, ...);
if (new Date(otpRecord.expires_at) < now) throw new Error('Verification code has expired...');

await query('UPDATE users SET email_verified = TRUE WHERE id = ?', [userId]);
await query('DELETE FROM otp_verifications WHERE user_id = ?', [userId]);
```

---

## 7. Password Reset

### Forgot Password (Lines 13–57)

```javascript
const user = await this.findByEmail(email);
if (!user) {
  // Still return success — prevents email enumeration
  return { success: true, message: 'If an account with this email exists...' };
}
const resetToken = crypto.randomBytes(32).toString('hex');
const resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
```

### Reset Password (Lines 59–104)

```javascript
const users = await query(`
  SELECT id FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()
`, [token]);
const hashedPassword = await bcrypt.hash(newPassword, 10);
await query(`UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expiry = NULL ...`);
```

**Token single-use:** Cleared after successful reset.

---

## 8. Frontend + Mobile Integration

| Client | Login call | Token storage |
|--------|-----------|---------------|
| Web | `authAPI.login(identifier, password, role)` | localStorage |
| Mobile | `api.post('/auth/login', { identifier, password, role: 'EMPLOYEE' })` | SecureStore |

Both attach `Authorization: Bearer <token>` on subsequent requests.

---

## Examiner Quick Answers

| Question | Answer |
|----------|--------|
| Hashing algorithm? | bcrypt, 12 rounds (configurable via `BCRYPT_ROUNDS`) |
| Token type? | JWT (stateless access + refresh) |
| How is role enforced? | `roleMiddleware` on routes + `ProtectedRoute` on frontend |
| Email verification? | OTP, 60s expiry, required for employees before loans |
| Audit trail? | `auditLog()` on login, password change, OTP, profile update |
