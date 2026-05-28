# Loan Committee Review Flow - Detailed Code Walkthrough

## Overview

The Loan Committee module lets authorized reviewers inspect pending applications, view computed **risk scores**, and approve/reject/request more info.

Files:
- Routes: `src/modules/loanCommittee/committee.routes.js`
- Service: `src/modules/loanCommittee/committee.service.js`
- Frontend: `frontend/src/loan-commitee/src/pages/LoanRequests.jsx`
- API client: `frontend/src/loan-commitee/src/services/committeeAPI.jsx`

---

## 1. Access Control

Only users with role `LOAN_COMMITTEE`, `ADMIN`, or `SUPER_ADMIN` can access committee endpoints.

```javascript
// committee.routes.js (typical pattern)
router.use(authMiddleware);
router.use(roleMiddleware(['LOAN_COMMITTEE', 'ADMIN', 'SUPER_ADMIN']));
```

**401** if no token. **403** if wrong role (authenticated but not authorized).

---

## 2. Fetch Pending Applications

### File: `src/modules/loanCommittee/committee.service.js` (Lines 6–102)

```javascript
static async getPendingApplications(page = 1, limit = 10, filters = {}) {
  let whereClause = 'WHERE la.status = "PENDING"';
```

**Only PENDING applications** appear in the review queue (FIFO: `ORDER BY la.created_at ASC`).

**Enriched SQL** pulls contextual data in one query:

```sql
SELECT la.*, ep.first_name, ep.last_name, ep.department, ep.salary as monthly_income,
  DATEDIFF(NOW(), ep.hire_date) as days_employed,
  (SELECT current_balance FROM savings_accounts WHERE user_id = la.user_id LIMIT 1) as savings_balance,
  (SELECT COUNT(*) FROM loans WHERE user_id = la.user_id AND status IN ('ACTIVE', 'OVERDUE')) as existing_loans,
  (SELECT AVG(outstanding_balance) FROM loans WHERE user_id = la.user_id ...) as avg_balance,
  (SELECT COUNT(*) FROM loan_applications WHERE user_id = la.user_id AND status = 'APPROVED') as approved_count
FROM loan_applications la ...
```

**Why subqueries?** Gives committee a full financial picture without N+1 API calls.

```javascript
const [countResult, applications] = await Promise.all([
  query(countQuery, params),
  query(selectQuery, [...params, limit, offset])
]);
```
**Parallel count + data queries** for efficient pagination.

```javascript
const applicationsWithRisk = await Promise.all(
  applications.map(async (app) => {
    const riskScore = await this.calculateRiskScore(app);
    return { ...app, risk_score: riskScore.score, risk_level: riskScore.level };
  })
);
```
**Risk score computed per application** before returning to frontend.

---

## 3. Risk Scoring Algorithm

### File: `src/modules/loanCommittee/committee.service.js` (Lines 176–274)

```javascript
static async calculateRiskScore(application) {
  let score = 0;
  let deductions = [];
```

**Point-based scoring system (max ~110, capped at 100):**

### Factor 1: Employment Status (+30)
```javascript
if (application.employment_status === 'ACTIVE') {
  score += 30;
} else {
  deductions.push('Not actively employed');
}
```

### Factor 2: Tenure (+10 to +25)
```javascript
if (application.days_employed >= 365) score += 25;
else if (application.days_employed >= 180) score += 20;
else if (application.days_employed >= 90) score += 15;
else if (application.days_employed >= 30) score += 10;
else deductions.push('Insufficient employment duration');
```

### Factor 3: Income Grade (+5 to +20)
```javascript
// Grades based on monthly_income thresholds
if (monthlyIncome >= 20000) incomeGrade = 5;  // +20 points
else if (monthlyIncome >= 15000) incomeGrade = 4;  // +20
else if (monthlyIncome >= 10000) incomeGrade = 3;  // +15
// ... down to +5 for lowest tier
```

### Factor 4: Loan-to-Income Ratio (+5 to +15)
```javascript
const loanRatio = application.requested_amount / (monthlyIncomeForRisk * 12);
if (loanRatio <= 0.3) score += 15;       // ≤30% of annual income
else if (loanRatio <= 0.5) score += 10;
else if (loanRatio <= 0.8) score += 5;
else deductions.push('Requested amount too high for income');
```

### Factor 5: Existing Loans (+0 to +10)
```javascript
if (application.existing_loans === 0) score += 10;
else if (application.existing_loans === 1) score += 5;
else deductions.push('Multiple existing loans');
```

### Factor 6: Repayment History (+0 to +10)
```javascript
if (application.approved_count > 0) {
  if (application.avg_balance < 5000) score += 10;
  else if (application.avg_balance < 20000) score += 5;
  else deductions.push('High outstanding balance on existing loans');
}
```

### Risk Level Classification
```javascript
if (score >= 80) level = 'LOW';
else if (score >= 60) level = 'MEDIUM';
else if (score >= 40) level = 'HIGH';
else level = 'CRITICAL';
```

**Returns:** `{ score, level, deductions }` — deductions explain why score is low (useful for committee discussion).

---

## 4. Application Detail View

### File: `src/modules/loanCommittee/committee.service.js` (Lines 104–174)

```javascript
static async getApplicationById(applicationId) {
```

**Extended query** adds:
- Phone, address, hire date
- Total savings contributions
- Savings withdrawal count
- All guarantors linked to application

```javascript
const guarantorsQuery = `
  SELECT g.*, ep.first_name, ep.last_name,
    (SELECT current_balance FROM savings_accounts WHERE user_id = g.user_id LIMIT 1) as guarantor_savings_balance
  FROM guarantors g
  LEFT JOIN employee_profiles ep ON g.guarantor_id = ep.employee_id
  WHERE g.loan_application_id = ?
`;
```

**Committee sees guarantor financial standing** before approving.

```javascript
if (application.guarantor_details) {
  application.guarantor_details = JSON.parse(application.guarantor_details);
}
const riskScore = await this.calculateRiskScore(application);
application.risk_score = riskScore.score;
application.risk_level = riskScore.level;
```

---

## 5. Review Decision

### File: `src/modules/loanCommittee/committee.service.js` (Lines 276–315)

```javascript
static async reviewApplication(applicationId, reviewData, reviewedBy, ip, userAgent) {
  const actionType = (decision || action || '').toString().toLowerCase();

  if (application.status !== 'PENDING' && application.status !== 'UNDER_REVIEW') {
    throw new Error('Application is not pending review');
  }
```

**State machine guard:** Only pending/under-review applications can be acted on.

```javascript
switch (actionType) {
  case 'approve':
  case 'approved':
    result = await this.approveApplication(...);
    break;
  case 'reject':
  case 'rejected':
    result = await this.rejectApplication(...);
    break;
  case 'request_more_info':
  case 'more_info':
    result = await this.requestMoreInfo(...);
    break;
  default:
    throw new Error('Invalid decision: ' + actionType);
}
```

**Three possible outcomes:**
1. **Approve** — Creates loan record (DB transaction), notifies applicant via email + in-app
2. **Reject** — Updates status, sends rejection reason
3. **Request more info** — Sets status to UNDER_REVIEW, notifies applicant

---

## 6. Approval Flow (Committee)

### File: `src/modules/loanCommittee/committee.service.js` (Lines 317+)

```javascript
static async approveApplication(applicationId, approvedAmount, approvedTerm, approvedRate, conditions, reviewedBy, ip, userAgent) {
```

**Steps inside approval:**
1. Validate approved amount/term/rate
2. Begin DB transaction
3. Update `loan_applications` → `APPROVED`
4. Insert into `loans` table with `ACTIVE` status
5. Commit transaction
6. `auditLog(reviewedBy, 'LOAN_APPLICATION_APPROVED', ...)`
7. `NotificationService.createNotification(applicant, 'Loan Application Approved', ...)`
8. `NotificationService.sendEmail(applicant.email, ...)`

**Committee may approve different amount/term/rate** than requested — flexible underwriting.

---

## 7. Frontend — Loan Committee Dashboard

### File: `frontend/src/loan-commitee/src/pages/LoanRequests.jsx`

Typical flow:
1. Fetch pending applications via `committeeAPI.getPendingApplications()`
2. Display table with risk level badges (LOW=green, CRITICAL=red)
3. Click row → detail modal with guarantor info, risk deductions
4. Approve/Reject buttons call `committeeAPI.reviewApplication(id, { decision, approved_amount, ... })`

### File: `frontend/src/loan-commitee/src/services/committeeAPI.jsx`

Uses shared `api.js` client with JWT token auto-attached.

---

## 8. Notifications After Review

Both approve and reject trigger:
- **In-app notification** (`notifications` table)
- **Email** via SMTP (`NotificationService.sendEmail`)
- **Audit log** with reviewer ID, IP, User-Agent

---

## Examiner Q&A for This Module

**Q: Why compute risk score on the server, not the frontend?**
A: Client-side scores can be manipulated. Server-side scoring ensures consistent, auditable decisions.

**Q: Can a committee member approve their own loan?**
A: The system does not explicitly block self-approval in code — this would be an organizational policy enforced by role assignment (committee members typically don't apply for loans they review). Could be added as a business rule.

**Q: What if two committee members review the same application simultaneously?**
A: The status check (`status !== 'PENDING'`) prevents double-processing. First approval wins; second gets "Application is not pending review" error.

**Q: How is pagination handled?**
A: Standard offset pagination: `LIMIT ? OFFSET ?` with total count query for page navigation.

---

## Summary

| Concept | Implementation |
|---------|----------------|
| Authorization | JWT + roleMiddleware |
| Risk scoring | Weighted point system, 6 factors |
| Data enrichment | SQL subqueries for financial context |
| Atomic approval | DB transaction (application + loan) |
| Audit trail | auditLog on every decision |
| Notifications | In-app + email on approve/reject |
