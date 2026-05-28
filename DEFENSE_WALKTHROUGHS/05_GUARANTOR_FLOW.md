# Guarantor Flow - Detailed Code Walkthrough

## Overview

Loans require an **internal employee guarantor**. The system validates guarantor identity, capacity, and tracks approval status through the loan lifecycle.

Files:
- Routes: `src/modules/guarantors/guarantor.routes.js`
- Controller: `src/modules/guarantors/guarantor.controller.js`
- Service: `src/modules/guarantors/guarantor.service.js`
- Loan integration: `src/modules/loans/loan.service.js → saveGuarantorInformation`
- Capacity check: `src/modules/loans/loan.model.js → checkGuarantorCapacity`
- Frontend: `frontend/src/employee/src/pages/GuarantorsPage.jsx`
- Mobile: `mobile/src/screens/dashboard/GuarantorsScreen.js`

---

## 1. When Guarantors Are Created

Guarantors are attached **during loan application**, not as a separate step:

### File: `src/modules/loans/loan.service.js` (Lines 56–75)

```javascript
if (applicationData.guarantor_details) {
  const guarantorData = typeof applicationData.guarantor_details === 'string'
    ? JSON.parse(applicationData.guarantor_details)
    : applicationData.guarantor_details;

  if (guarantorData.type !== 'internal') {
    throw new Error('Only internal employee guarantors are allowed');
  }

  const capacity = await LoanModel.checkGuarantorCapacity(
    guarantorData.employeeId, loan_amount, userId
  );
  if (!capacity.eligible) {
    throw new Error(`Guarantor validation failed: ${capacity.reason}`);
  }

  await this.saveGuarantorInformation(applicationId, userId, {
    ...guarantorData,
    guarantor_user_id: capacity.guarantor_data.id,
    fullName: capacity.guarantor_data.name
  });
}
```

**Flow:**
1. Parse guarantor JSON from application payload
2. Reject external guarantors
3. Check capacity (server-side)
4. Insert guarantor record linked to application

---

## 2. Guarantor Capacity Check

### File: `src/modules/loans/loan.model.js` (Lines 809–864)

```javascript
static async checkGuarantorCapacity(guarantorEmployeeId, requestedAmount, applicantId) {
```

**SQL lookup:**
```sql
SELECT u.id as user_id, ep.first_name, ep.last_name, ep.salary,
  (SELECT COUNT(*) FROM guarantors WHERE guarantor_id = ? AND status = 'ACTIVE') as active_guarantees
FROM users u
JOIN employee_profiles ep ON u.id = ep.user_id
WHERE ep.employee_id = ? AND u.is_active = true
```

### Business Rules

| Rule | Code | Reason |
|------|------|--------|
| Guarantor must exist | `if (!guarantor)` | Invalid employee ID |
| Cannot self-guarantee | `guarantor.user_id === applicantId` | Conflict of interest |
| Max 3 active guarantees | `active_guarantees >= 3` | Limit exposure |
| Amount ≤ salary × 5 | `requestedAmount > maxGuaranteeCapacity` | Income-based capacity |

```javascript
const maxGuaranteeCapacity = guarantor.salary * 5;
if (requestedAmount > maxGuaranteeCapacity) {
  return { eligible: false, reason: `Requested amount exceeds guarantor's capacity based on salary` };
}
```

**Returns on success:**
```javascript
{
  eligible: true,
  guarantor_data: { id, name, department }
}
```

### Pre-check Endpoint

`GET /api/loans/check-guarantor/:employeeId` — Called by frontend **before** form submission so user gets immediate feedback.

---

## 3. Saving Guarantor Record

### File: `src/modules/loans/loan.service.js` (Lines 631–660)

```javascript
static async saveGuarantorInformation(loanApplicationId, userId, guarantorDetails) {
  const insertQuery = `
    INSERT INTO guarantors (
      loan_application_id, user_id, guarantor_type, guarantor_name,
      guarantor_id, relationship, status, created_at, updated_at
    ) VALUES (?, ?, 'INTERNAL', ?, ?, ?, 'PENDING', NOW(), NOW())
  `;
```

**Fields:**
- `loan_application_id` — Links to the loan application
- `user_id` — The applicant's user ID
- `guarantor_type` — Always `'INTERNAL'`
- `guarantor_id` — Employee ID of the guarantor
- `status` — Starts as `'PENDING'` (awaiting guarantor acceptance)

---

## 4. Guarantor Service — CRUD Operations

### File: `src/modules/guarantors/guarantor.service.js`

#### Validation (Lines 270–325)

```javascript
static async validateGuarantor(guarantorDetails) {
  const errors = [];

  if (!guarantorDetails.guarantor_name?.trim()) errors.push('Guarantor name is required');
  if (!guarantorDetails.guarantor_email?.trim()) errors.push('Guarantor email is required');
  // ... phone, address, relationship, guarantee_amount

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(guarantorDetails.guarantor_email)) errors.push('Invalid email format');

  const phoneRegex = /^[+]?[\d\s\-\(\)]+$/;
  if (!phoneRegex.test(guarantorDetails.guarantor_phone)) errors.push('Invalid phone number format');

  return { isValid: errors.length === 0, errors };
}
```

**Validation pattern:** Collect all errors in array → return together (better UX than failing on first error).

#### Status Update (Lines 196–248)

```javascript
static async updateGuarantorStatus(guarantorId, status, updatedBy, ip, userAgent) {
  const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'RELEASED'];
  if (!validStatuses.includes(status)) throw new Error('Invalid guarantor status');
```

**State machine:**
```
PENDING → APPROVED (guarantor accepts)
PENDING → REJECTED (guarantor declines)
APPROVED → RELEASED (loan completed or guarantor released)
```

Each transition triggers audit log + notification + email.

#### Release Guarantor (Lines 373–422)

```javascript
static async releaseGuarantor(guarantorId, reason, releasedBy, ip, userAgent) {
  await this.updateGuarantorStatus(guarantorId, 'RELEASED', ...);
  await query(`UPDATE guarantors SET notes = ? WHERE id = ?`, [reason, guarantorId]);
```

**When loan is fully repaid**, guarantor obligations are released with documented reason.

---

## 5. Guarantor Eligibility (Standalone Check)

### File: `src/modules/guarantors/guarantor.service.js` (Lines 424–460)

```javascript
static async checkGuarantorEligibility(userId, loanAmount) {
  const [activeLoans] = await query(`
    SELECT COUNT(*) as count, SUM(outstanding_balance) as total_balance
    FROM loans WHERE user_id = ? AND status IN ('ACTIVE', 'OVERDUE')
  `, [userId]);

  const [pendingApplications] = await query(`
    SELECT COUNT(*) as count, SUM(requested_amount) as total_amount
    FROM loan_applications WHERE user_id = ? AND status IN ('PENDING', 'UNDER_REVIEW')
  `, [userId]);

  const totalObligations = totalActiveBalance + totalPendingAmount;
  const maxGuaranteeRatio = 0.5;
  const maxGuaranteeAmount = monthlyIncome * maxGuaranteeRatio;

  return {
    can_be_guarantor: totalObligations < maxGuaranteeAmount,
    remaining_capacity: Math.max(0, maxGuaranteeAmount - totalObligations)
  };
}
```

**Checks if a user has enough remaining capacity** to take on another guarantee obligation.

---

## 6. Listing Guarantors (Employee View)

### File: `src/modules/guarantors/guarantor.service.js` (Lines 91–168)

```javascript
static async getGuarantors(page = 1, limit = 10, filters = {}) {
```

**Two filter modes:**
```javascript
if (filters.guarantorOnly) {
  // Show loans where I am the guarantor
  whereClause += ' AND g.guarantor_id IN (SELECT employee_id FROM employee_profiles WHERE user_id = ?)';
} else {
  // Show guarantors on my loan applications
  whereClause += ' AND la.user_id = ?';
}
```

**Pagination:** Parallel count + select queries with `LIMIT/OFFSET`.

---

## 7. Frontend — Employee Guarantors Page

### File: `frontend/src/employee/src/pages/GuarantorsPage.jsx`

Employee can:
- View guarantor requests where they are named as guarantor
- Accept or reject guarantor requests
- See status of guarantors on their own loan applications

Uses `frontend/src/shared/services/guarantorsAPI.js`:
- `GET /guarantors?guarantorOnly=true` — Requests for me
- `PUT /guarantors/:id/status` — Accept/reject

### Mobile: `mobile/src/screens/dashboard/GuarantorsScreen.js`

Same API endpoints via axios client with SecureStore token.

---

## 8. Notifications

When guarantor is added:
```javascript
await NotificationService.createNotification(userId, 'Guarantor Added', ...);
await NotificationService.sendEmail(guarantorDetails.guarantor_email, 'Guarantor Request', ...);
```

When status changes:
```javascript
await NotificationService.createNotification(guarantor.user_id, 'Guarantor Status Updated', ...);
await NotificationService.sendEmail(guarantor.guarantor_email, emailSubject, emailContent);
```

---

## Database Schema

### File: `migrations/schema.sql` (Lines 180–200)

```sql
CREATE TABLE guarantors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  loan_application_id INT NOT NULL,
  user_id INT NOT NULL,           -- applicant
  guarantor_type ENUM('INTERNAL', 'EXTERNAL') NOT NULL,
  guarantor_name VARCHAR(200) NOT NULL,
  guarantor_id VARCHAR(100) NOT NULL,  -- employee ID
  relationship VARCHAR(100) NOT NULL,
  ...
  FOREIGN KEY (loan_application_id) REFERENCES loan_applications(id) ON DELETE CASCADE
);
```

**CASCADE delete:** If application is deleted, guarantor records are removed too.

---

## Examiner Q&A

**Q: Why only internal guarantors?**
A: Internal employees have verifiable salary, employment status, and savings data in the same system — external guarantors lack this integration.

**Q: What happens if guarantor becomes inactive after approval?**
A: Currently no automatic re-check. The loan proceeds with the original guarantor record. A production system might add periodic guarantor health checks.

**Q: How do you prevent the same person guaranteeing too many loans?**
A: `active_guarantees >= 3` check in `checkGuarantorCapacity`, plus salary × 5 capacity limit.

**Q: Explain the difference between guarantor validation in loan.service vs guarantor.service.**
A: `loan.service` validates at application time (capacity check). `guarantor.service` handles ongoing CRUD, status updates, and release after loan completion.

---

## Summary

| Step | Action | File |
|------|--------|------|
| 1 | Employee selects guarantor on loan form | Frontend |
| 2 | Pre-check capacity | `loan.model.js → checkGuarantorCapacity` |
| 3 | Save guarantor on application | `loan.service.js → saveGuarantorInformation` |
| 4 | Guarantor accepts/rejects | `guarantor.service.js → updateGuarantorStatus` |
| 5 | Committee reviews with guarantor data | `committee.service.js → getApplicationById` |
| 6 | Release on loan completion | `guarantor.service.js → releaseGuarantor` |
