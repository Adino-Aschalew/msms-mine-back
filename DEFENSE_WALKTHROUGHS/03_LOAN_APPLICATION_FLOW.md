# Loan Application Flow - Detailed Code Walkthrough

## Overview

The loan lifecycle: **Eligibility Check → Application → Guarantor Validation → Committee Review → Approval (creates loan record) → Disbursement → Repayment**.

Files involved:
- Routes: `src/modules/loans/loan.routes.js`
- Controller: `src/modules/loans/loan.controller.js`
- Service: `src/modules/loans/loan.service.js`
- Model: `src/modules/loans/loan.model.js`
- Frontend (employee): `frontend/src/employee/src/pages/LoanRequestPage.jsx`
- Mobile: `mobile/src/screens/dashboard/LoansScreen.js`

---

## 1. Route Protection

### File: `src/modules/loans/loan.routes.js`

```javascript
router.use(authMiddleware);
```
**All loan routes require a valid JWT.** Unauthenticated requests get 401 before reaching any handler.

```javascript
router.post('/apply', auditMiddleware('LOAN_APPLICATION_CREATED'), LoanController.applyForLoan);
```
**POST /api/loans/apply** — Creates application. Audit middleware logs the attempt.

```javascript
router.get('/check-eligibility', LoanController.checkEligibility);
```
**GET /api/loans/check-eligibility** — Pre-check before showing the application form.

```javascript
router.get('/check-guarantor/:employeeId', LoanController.checkGuarantorCapacity);
```
**Validates guarantor before form submission.**

Role-restricted routes use `roleMiddleware(['ADMIN', 'LOAN_COMMITTEE'])` for committee actions and `roleMiddleware(['ADMIN', 'FINANCE'])` for disbursement.

---

## 2. Apply for Loan — Service Layer

### File: `src/modules/loans/loan.service.js` (Lines 8–117)

```javascript
static async applyForLoan(applicationData, userId, ip, userAgent) {
```
**Entry point for loan application business logic.**

```javascript
const eligibility = await LoanModel.checkEligibility(userId);
if (!eligibility.eligible) {
  throw new Error(eligibility.reason);
}
```
**Business rule gate:** User must pass all eligibility checks before proceeding. Throws error → controller returns 400.

```javascript
const { loan_amount, interest_rate, loan_term_months } = applicationData;
const calculation = await LoanModel.calculateLoanAmount(loan_amount, interest_rate, loan_term_months);
```
**Calculates monthly payment using amortization formula** (see Section 5).

```javascript
const [userProfile] = await query(`
  SELECT ep.salary FROM employee_profiles ep WHERE ep.user_id = ?
`, [userId]);
const user_monthly_income = userProfile?.salary || 0;
```
**Fetches salary for debt-to-income tracking** stored on the application record.

```javascript
const applicationId = await LoanModel.createLoanApplication({ ... });
```
**Persists application with status `PENDING`.**

```javascript
if (applicationData.guarantor_details) {
  if (guarantorData.type !== 'internal') {
    throw new Error('Only internal employee guarantors are allowed');
  }
  const capacity = await LoanModel.checkGuarantorCapacity(...);
  if (!capacity.eligible) {
    throw new Error(`Guarantor validation failed: ${capacity.reason}`);
  }
  await this.saveGuarantorInformation(applicationId, userId, { ... });
}
```
**Guarantor business rules:**
- Only internal employees can guarantee
- Cannot be self-guarantor
- Max 3 active guarantees
- Requested amount ≤ guarantor salary × 5

```javascript
await NotificationService.createNotification(userId, 'Loan Application Submitted', ...);
```
**In-app notification to applicant.**

```javascript
for (const member of committeeMembers) {
  await NotificationService.createNotification(member.user_id, 'New Loan Application', ...);
}
```
**Notifies all loan committee members** to review the pending application.

---

## 3. Eligibility Check — Model Layer

### File: `src/modules/loans/loan.model.js` (Lines 704–807)

```javascript
static async checkEligibility(userId) {
```

**SQL query joins `users` + `employee_profiles` and counts:**
- Active loans (`status IN ('ACTIVE', 'OVERDUE')`)
- Pending applications (`status = 'PENDING'`)

**Validation chain (each returns `{ eligible: false, reason: '...' }`):**

| Check | Rule |
|-------|------|
| User exists | Must have employee profile |
| `is_active` | Account must be active |
| `email_verified` | Must complete OTP verification |
| `employment_status` | Must be `'ACTIVE'` |
| `active_loans >= 2` | Maximum 2 concurrent loans |
| `pending_applications > 0` | Only one pending application at a time |

```javascript
const financials = await query(`
  SELECT salary,
    (SELECT COALESCE(SUM(current_balance), 0) FROM savings_accounts WHERE user_id = ?) as savings_balance
  FROM employee_profiles WHERE user_id = ?
`, [userId, userId]);
```

**Returns financial limits for UI validation:**
```javascript
financials: {
  salary: parseFloat(...),
  savings_balance: parseFloat(...),
  max_loan_by_savings: savings_balance * 2,      // 2× savings rule
  max_monthly_repayment: salary * 0.33            // 33% of salary rule
}
```

---

## 4. Loan Amount Calculation

### File: `src/modules/loans/loan.model.js` (Lines 455–468)

```javascript
static async calculateLoanAmount(loanAmount, interestRate, termMonths) {
  const monthlyRate = interestRate / 100 / 12;
  const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
                       (Math.pow(1 + monthlyRate, termMonths) - 1);
```

**Standard amortization formula (PMT):**

\[
PMT = P \times \frac{r(1+r)^n}{(1+r)^n - 1}
\]

Where:
- P = principal (loan amount)
- r = monthly interest rate
- n = term in months

```javascript
monthlyPayment: Math.round(monthlyPayment * 100) / 100,
totalInterest: Math.round((monthlyPayment * termMonths - loanAmount) * 100) / 100,
```
**Rounded to 2 decimal places** for currency precision.

---

## 5. Approve Application — Database Transaction

### File: `src/modules/loans/loan.model.js` (Lines 137–192)

```javascript
static async approveLoanApplication(applicationId, approvedAmount, approvedTerm, approvedRate, reviewedBy) {
  const connection = await transaction();
```

**Uses manual transaction** (begin → commit/rollback) because `approveLoanApplication` calls `connection.execute` directly.

```javascript
await connection.execute(`
  UPDATE loan_applications SET status = 'APPROVED', reviewed_by = ?, ...
`, [...]);
```
**Step 1:** Mark application as APPROVED with approved terms.

```javascript
const nextPaymentDate = new Date();
nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
```
**Step 2:** First payment due in 1 month.

```javascript
await connection.execute(insertLoanQuery, [
  applicationId, appData.user_id, appData.employee_id, approvedAmount, ...
]);
```
**Step 3:** Create `loans` record with status `'ACTIVE'` and `outstanding_balance = approvedAmount`.

```javascript
await connection.commit();
```
**Both updates succeed or neither does** — prevents orphaned approved applications without loans.

```javascript
} catch (error) {
  await connection.rollback();
  throw error;
}
```

---

## 6. Loan Payment — Concurrency Control

### File: `src/modules/loans/loan.model.js` (Lines 294–362)

```javascript
static async addLoanTransaction(loanId, transactionType, amount, referenceId, description) {
```

```javascript
const [loan] = await connection.execute(
  'SELECT outstanding_balance FROM loans WHERE id = ? FOR UPDATE',
  [loanId]
);
```
**`FOR UPDATE` row lock:** If two payments arrive simultaneously, the second waits until the first transaction commits. Prevents double-spending the same balance.

```javascript
if (transactionType === 'PAYMENT') {
  newBalance = currentBalance - amount;
  if (newBalance < 0) {
    throw new Error('Payment exceeds outstanding balance');
  }
}
```
**Insufficient balance check** inside the locked transaction.

```javascript
INSERT INTO loan_transactions (..., balance_before, balance_after, ...)
UPDATE loans SET outstanding_balance = ?
if (newBalance <= 0) UPDATE loans SET status = "COMPLETED"
```
**Atomic triple operation:** transaction record + balance update + auto-completion when paid off.

---

## 7. Disbursement

### File: `src/modules/loans/loan.service.js` (Lines 305–348)

```javascript
if (loan.status !== 'ACTIVE') throw new Error('Loan is not in active status');
if (loan.disbursement_date) throw new Error('Loan has already been disbursed');
```

**Idempotency guard:** Cannot disburse twice.

```javascript
await LoanModel.addLoanTransaction(loanId, 'DISBURSEMENT', loan.loan_amount, ...);
await LoanModel.updateLoanStatus(loanId, 'DISBURSED');
```

---

## 8. Error Handling Pattern

### Controller layer (typical pattern):

```javascript
try {
  const result = await LoanService.applyForLoan(...);
  res.status(201).json({ success: true, data: result });
} catch (error) {
  res.status(400).json({ success: false, message: error.message });
}
```

**Service throws descriptive errors** → Controller maps to HTTP 400.
**Unexpected errors** → Global `errorHandler` in `error.middleware.js` returns 500.

---

## 9. Frontend Integration

### File: `frontend/src/shared/services/loansAPI.js`

Employee calls:
- `GET /loans/check-eligibility` before showing form
- `GET /loans/check-guarantor/:employeeId` when selecting guarantor
- `POST /loans/apply` with `{ loan_amount, loan_purpose, loan_term_months, interest_rate, guarantor_details }`

### Mobile: `mobile/src/screens/dashboard/LoansScreen.js`

Same API endpoints via `mobile/src/api/axios.js` with Bearer token from SecureStore.

---

## Summary — Key Defense Points

1. **Eligibility is server-enforced**, not just UI validation
2. **Guarantor capacity** prevents over-guaranteeing
3. **Approval uses DB transaction** — application + loan created atomically
4. **`FOR UPDATE` lock** prevents race conditions on payments
5. **Notifications** keep applicant and committee informed
6. **Audit log** records every state change with IP/User-Agent
