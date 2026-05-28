# MSMS Defense Master Guide

## What This System Is

**MSMS (Microfinance & Savings Management System)** is an enterprise platform for a mining company's internal financial services:

| Module | Purpose |
|--------|---------|
| **Authentication** | JWT login, OTP email verification, password reset, role-based access |
| **Savings** | Mandatory employee savings (15–65%), interest, penalties, payroll deductions |
| **Loans** | Application → committee review → approval → disbursement → repayment |
| **Guarantors** | Internal employee guarantors with capacity checks |
| **Payroll** | CSV/Excel import → validate → approve → process (auto savings + loan deductions) |
| **HR Integration** | Employee profiles synced/validated against HR data |
| **Notifications** | In-app + email (SMTP) alerts |
| **Scheduler** | Cron jobs for interest, compliance, analytics |

---

## Architecture (3-Tier + Mobile)

```
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│  React Web App  │   │ React Native    │   │  Admin Modules  │
│  (Vite)         │   │ Mobile (Expo)   │   │  HR/Finance/    │
│  frontend/      │   │ mobile/         │   │  Loan Committee │
└────────┬────────┘   └────────┬────────┘   └────────┬────────┘
         │  HTTPS + JWT Bearer │                     │
         └─────────────────────┼─────────────────────┘
                               ▼
                    ┌──────────────────────┐
                    │  Express API         │
                    │  server.js → app.js  │
                    │  /api/* routes       │
                    └──────────┬───────────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         ▼                     ▼                     ▼
   Controllers            Services               Models
   (HTTP layer)      (business logic)         (SQL queries)
         │                     │                     │
         └─────────────────────┼─────────────────────┘
                               ▼
                    ┌──────────────────────┐
                    │  MySQL (InnoDB)      │
                    │  microfinance_system │
                    └──────────────────────┘
```

**Entry points:**
- Backend boot: `server.js` → `src/app.js`
- API routes: `src/routes.js` (modular under `src/modules/`)
- DB config: `src/config/database.js`
- Schema: `migrations/schema.sql`

---

## Layered Backend Pattern

Every feature follows the same structure:

```
Route (auth + validation + audit)
  → Controller (HTTP status codes, req/res)
    → Service (business rules, notifications)
      → Model (SQL, transactions)
        → MySQL
```

**Example – loan application:**
`src/modules/loans/loan.routes.js` → `loan.controller.js` → `loan.service.js` → `loan.model.js`

---

## User Roles & Access Control

| DB Role | Web Portal | Mobile |
|---------|-----------|--------|
| `EMPLOYEE` | `/employee/*` | Yes (primary client) |
| `LOAN_COMMITTEE` | `/loan-committee/*` | No |
| `FINANCE_ADMIN` | `/finance/*` | No |
| `HR` | `/hr/*` | No |
| `SUPER_ADMIN` / `ADMIN` | `/admin/*` | No |

**Backend:** `authMiddleware` verifies JWT → loads user from DB → `roleMiddleware(['ROLE'])` checks permission.

**Frontend:** `ProtectedRoute.jsx` normalizes role strings and redirects unauthenticated/unauthorized users.

**Important:** Login requires **identifier + password + role** (see `auth.validation.js`). The role in the request must match the user's actual DB role.

---

## Cross-Cutting Concerns (Examiner Topics)

### 1. Business Logic

Business rules live primarily in **Service** and **Model** layers, not in React components.

| Rule | Where enforced |
|------|----------------|
| Savings % between 15–65% | DB CHECK constraint + controller validation |
| One savings account per user | `Savings.createSavingsAccount` |
| 6-month withdrawal lock | `lock_period_end_date` check on withdraw |
| Max 2 active loans | `loan.model.js → checkEligibility` |
| Email must be verified to apply | `checkEligibility` |
| Guarantor max 3 active guarantees | `checkGuarantorCapacity` |
| Guarantor capacity = salary × 5 | `checkGuarantorCapacity` |
| Monthly repayment ≤ 33% of salary | Returned in eligibility `financials` |
| Loan max by savings = 2× balance | Returned in eligibility `financials` |
| Risk score 0–100 → LOW/MEDIUM/HIGH/CRITICAL | `committee.service.js → calculateRiskScore` |

### 2. Validation Techniques

| Layer | Technique | File |
|-------|-----------|------|
| Route middleware | Required fields, type checks, role whitelist | `auth.validation.js` |
| Controller | Early return with 400/401/404 | All controllers |
| Service | Business rule throws `Error(message)` | `loan.service.js`, `auth.service.js` |
| Database | ENUM, CHECK, UNIQUE, FOREIGN KEY | `migrations/schema.sql` |
| Frontend | Form validation before API call | React pages |
| File upload | Multer: MIME filter, 5MB limit | `auth.routes.js` |

### 3. Error Handling

| Pattern | Implementation |
|---------|----------------|
| try/catch in every async handler | Controllers & services |
| Global error handler | `src/middleware/error.middleware.js` |
| HTTP status mapping | 400 validation, 401 auth, 403 forbidden, 404 not found, 409 duplicate, 500 server |
| Generic login errors | "Invalid credentials" (no user enumeration) |
| Forgot password | Always returns success even if email not found |
| Batch job isolation | Each account in loop has own try/catch (interest, penalties) |
| Dev-only stack traces | `NODE_ENV === 'development'` in error middleware |

### 4. Concurrency & Data Integrity

| Mechanism | Purpose | File |
|-----------|---------|------|
| **Database transactions** | All-or-nothing balance updates | `database.js → transaction()` |
| **FOR UPDATE row lock** | Prevent double-spend on loan payments | `loan.model.js → addLoanTransaction` |
| **Connection pool** | Reuse DB connections (limit 10) | `database.js` |
| **Parameterized queries** | SQL injection prevention | All `query(sql, [params])` calls |
| **Sequential batch processing** | Avoid DB overload on interest job | `Savings.processMonthlyInterest` |
| **Audit log** | Immutable action trail | `middleware/audit.js` |

**ACID example (savings transaction):**
1. BEGIN transaction
2. SELECT current_balance
3. Validate sufficient funds
4. INSERT savings_transactions (balance_before, balance_after)
5. UPDATE savings_accounts.current_balance
6. COMMIT (or ROLLBACK on any error)

### 5. Security

- **Passwords:** bcrypt (12 rounds default via `BCRYPT_ROUNDS`)
- **Tokens:** JWT access + refresh; payload `{ userId, role }`
- **OTP:** 6-digit, 60-second expiry, stored in `otp_verifications`
- **CORS:** Whitelist in development; `ALLOWED_ORIGINS` in production (`app.js`)
- **Mobile tokens:** Stored in Expo SecureStore (encrypted keychain)
- **Audit:** IP + User-Agent on sensitive actions

### 6. Scheduled Jobs

Initialized in `app.js` via `SchedulerService.initialize()`:

| Schedule | Job |
|----------|-----|
| Daily 02:00 UTC | Analytics forecasts |
| Monthly 1st 01:00 | Interest calculation + liquidity forecast |
| Weekly Sunday 23:00 | Missed savings penalties + loan defaults |
| Every 6 hours | System health check |
| Quarterly / Yearly | Risk assessment, cleanup |

---

## Database Key Tables

```
users ────────────── employee_profiles
  │                        │
  ├── savings_accounts ─── savings_transactions
  ├── loan_applications ── guarantors
  │         │
  │         └── loans ─── loan_transactions
  │                        loan_repayments
  ├── payroll_batches ─── payroll_details
  ├── notifications
  ├── otp_verifications
  └── audit_logs
```

See full DDL in `migrations/schema.sql`.

---

## API Route Map

| Prefix | Module |
|--------|--------|
| `/api/auth` | Login, profile, OTP, password |
| `/api/savings` | Account, contributions, withdrawals |
| `/api/loans` | Apply, pay, eligibility |
| `/api/loan-committee` | Review pending applications |
| `/api/guarantors` | Guarantor CRUD & status |
| `/api/finance` | Payroll upload/process |
| `/api/hr` | Employee management |
| `/api/notifications` | User notifications |
| `/api/admin` | System admin |
| `/api/health` | Health check |

---

## Walkthrough Documents Index

| # | Document | Topic |
|---|----------|-------|
| 01 | `01_AUTHENTICATION_FLOW.md` | Auth (note: core logic now in `src/modules/auth/`) |
| 02 | `02_SAVINGS_ACCOUNT_FLOW.md` | Savings transactions & ACID |
| 03 | `03_LOAN_APPLICATION_FLOW.md` | Loan apply → approve → pay |
| 04 | `04_LOAN_COMMITTEE_REVIEW_FLOW.md` | Risk scoring & committee decisions |
| 05 | `05_GUARANTOR_FLOW.md` | Guarantor validation & capacity |
| 06 | `06_PAYROLL_AUTOMATIC_SAVINGS_FLOW.md` | Payroll batch processing |
| 09 | `09_HR_MODULE_FLOW.md` | HR onboarding, verification, status & sync |
| 07 | `07_MOBILE_APP_ARCHITECTURE.md` | React Native / Expo client |
| 08 | `08_WEB_FRONTEND_ARCHITECTURE.md` | React web, RBAC, API client |

---

## Common Examiner Questions & Answers

### "Explain your authentication flow."

1. User sends `identifier` (email or employee ID), `password`, and `role` to `POST /api/auth/login`.
2. `validateLogin` middleware checks required fields and role whitelist.
3. `AuthService.login` finds user by email or employee ID, compares bcrypt hash.
4. On success: JWT access token + refresh token issued; `last_login` updated; audit logged.
5. Client stores token; every request sends `Authorization: Bearer <token>`.
6. `authMiddleware` verifies JWT, reloads user from DB (ensures still active).
7. Employees must verify email via OTP before accessing loan features.

### "How do you prevent SQL injection?"

All queries use **parameterized placeholders** (`?`) via `mysql2/promise`:
```javascript
await query('SELECT * FROM users WHERE id = ?', [userId]);
```
User input never concatenated into SQL strings.

### "How do you handle concurrent loan payments?"

`addLoanTransaction` uses a DB transaction with `SELECT ... FOR UPDATE` on the loan row, locking it until the payment commits. Two simultaneous payments cannot both read the same balance.

### "What happens if payroll processing fails mid-batch?"

The entire batch runs inside `transaction()`. If any employee's savings/loan update fails, **ROLLBACK** reverses all changes in that batch.

### "How is loan eligibility determined?"

Checks in `loan.model.js → checkEligibility`:
- Active user + verified email + active employment
- No pending applications
- Max 2 active/overdue loans
- Returns financial limits (salary, savings, max loan, max monthly repayment)

### "Explain the risk scoring algorithm."

`CommitteeService.calculateRiskScore` adds points for:
- Active employment (+30)
- Tenure (up to +25)
- Income grade (up to +20)
- Loan-to-annual-income ratio (up to +15)
- Existing loan count (up to +10)
- Repayment history (up to +10)

Score ≥80 = LOW risk, ≥60 = MEDIUM, ≥40 = HIGH, else CRITICAL.

### "Why separate Service and Model layers?"

- **Model:** Pure data access (SQL, transactions)
- **Service:** Business orchestration (eligibility, notifications, audit, cross-module calls)
- **Controller:** HTTP concerns only (status codes, request parsing)

This separation makes unit testing and defense explanation easier.

### "How does the mobile app differ from web?"

Mobile is **employee-only** (`role: 'EMPLOYEE'` hardcoded in login). Uses SecureStore instead of localStorage. Supports biometric login. Same REST API backend.

### "What audit trail do you maintain?"

`auditLog(userId, action, table, recordId, oldValues, newValues, ip, userAgent)` records every sensitive operation: login, password change, loan approval, savings transactions, payroll processing.

---

## Demo Flow for Defense (Recommended Order)

1. **Login** as employee (web or mobile) → show OTP verification if needed
2. **Savings dashboard** → show balance, contribution history, deduction ratio
3. **Apply for loan** → show eligibility check, guarantor selection
4. **Switch to Loan Committee** → show pending queue with risk score
5. **Approve loan** → show notification to employee
6. **Finance: upload payroll** → process batch → show savings auto-contribution
7. **Show audit log / notifications** as proof of traceability

---

## Known Implementation Notes (Be Honest If Asked)

- Employment duration check for loans is currently **bypassed** (see log in `checkEligibility` line ~765).
- Auth exists in two places: legacy `src/controllers/authController.js` and current `src/modules/auth/` (routes use the module version).
- Some guarantor service SQL references columns that differ from original schema (evolved over development).
- SMS/push notifications are stubbed (logged, not sent to real providers).
