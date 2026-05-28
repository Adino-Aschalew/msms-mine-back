# Payroll & Automatic Savings Flow - Detailed Code Walkthrough

## Overview

Finance admins upload payroll files (CSV/Excel). After validation and approval, processing **automatically deducts savings contributions** and **loan repayments** from each employee's payroll.

Files:
- Routes: `src/routes/payroll.js` and `src/modules/finance/finance.routes.js`
- Controller: `src/controllers/payrollController.js`
- Model: `src/models/Payroll.js`
- Scheduler reference: `src/services/scheduler.service.js` (health check for stuck batches)

---

## 1. Payroll Batch Lifecycle (State Machine)

```
UPLOADED → VALIDATED → CONFIRMED → PROCESSED
                ↑                      ↓
              (reverse)            (reverse)
```

| Status | Meaning |
|--------|---------|
| `UPLOADED` | File parsed, rows in `payroll_details` |
| `VALIDATED` | Finance reviewed data for errors |
| `CONFIRMED` | Approved for processing |
| `PROCESSED` | Savings + loan deductions applied |
| `REVERSED` | Rolled back (if supported) |

---

## 2. Route Protection

### File: `src/routes/payroll.js`

```javascript
router.post('/upload',
  authMiddleware,
  roleCheck(['SUPER_ADMIN', 'FINANCE_ADMIN']),
  PayrollController.uploadMiddleware,
  auditMiddleware('PAYROLL_UPLOAD', 'payroll_batches'),
  PayrollController.uploadPayroll
);
```

**Only finance admins** can upload. Multer middleware handles file parsing.

```javascript
router.put('/batch/:batchId/process',
  authMiddleware,
  roleCheck(['SUPER_ADMIN', 'FINANCE_ADMIN']),
  auditMiddleware('PAYROLL_BATCH_PROCESS', 'payroll_batches'),
  PayrollController.processBatch
);
```

**Processing is a privileged action** — triggers financial transactions.

---

## 3. Upload Payroll

### File: `src/controllers/payrollController.js` (Lines 29+)

Typical upload flow:
1. Multer saves CSV/Excel to `uploads/` directory
2. Parse rows: `employee_id`, `gross_salary`, `saving`, `deduction`, `net_salary`, `payroll_date`
3. Match each `employee_id` to `users` + `employee_profiles`
4. Create `payroll_batches` record (status: `UPLOADED`)
5. Insert rows into `payroll_details` linked to batch
6. Return batch ID for review

**Validation during upload:**
- Employee ID must exist in system
- Numeric fields must be positive
- Duplicate employee IDs in same batch flagged

---

## 4. Process Batch — Core Business Logic

### File: `src/models/Payroll.js` (Lines 591+)

```javascript
static async processPayrollBatch(batchId, processedBy) {
  return await transaction(async (connection) => {
```

**Entire batch runs in ONE database transaction.** If any employee fails, entire batch rolls back.

### Step 1: Validate Batch State

```javascript
const batch = await this.getPayrollBatch(batchId);
if (!batch) throw new Error('Payroll batch not found');
if (batch.status !== 'CONFIRMED') {
  throw new Error('Payroll batch must be approved before processing');
}
```

**Cannot process unapproved batches** — separation of duties (uploader ≠ approver ideally).

### Step 2: Loop Through Employees

```javascript
const details = await this.getPayrollDetails(batchId, 1, 10000);
for (const detail of details.details) {
```

**Processes up to 10,000 rows** per batch sequentially (not parallel — avoids DB contention).

### Step 3: Automatic Savings Contribution

```javascript
const savingsAccountQuery = `
  SELECT id, current_balance, saving_percentage
  FROM savings_accounts
  WHERE user_id = ? AND account_status = "ACTIVE"
`;
const [savingsAccount] = await connection.query(savingsAccountQuery, [detail.user_id]);
```

```javascript
if (savingsAccount && savingsAccount.length > 0) {
  const netSalary = parseFloat(detail.net_salary);
  const savingPercentage = parseFloat(savingsAccount[0].saving_percentage) || 15;
  savingsContribution = (netSalary * savingPercentage) / 100;
  savingsContribution = Math.max(savingsContribution, 100);  // minimum 100
```

**Business rules:**
- Contribution = `net_salary × saving_percentage / 100`
- **Minimum contribution: 100** (even if percentage calculates lower)
- Default percentage: 15% if not set

```javascript
const balanceBefore = parseFloat(savingsAccount[0].current_balance) || 0;
const balanceAfter = balanceBefore + savingsContribution;

await connection.query(`
  INSERT INTO savings_transactions
  (savings_account_id, user_id, transaction_type, amount, balance_before, balance_after,
   reference_id, description, payroll_batch_id)
  VALUES (?, ?, 'CONTRIBUTION', ?, ?, ?, ?, ?, ?)
`, [
  savingsAccount[0].id, detail.user_id, savingsContribution,
  balanceBefore, balanceAfter,
  `PAYROLL-${batchId}`, 'Automatic savings deduction from payroll', batchId
]);

await connection.query(`
  UPDATE savings_accounts
  SET current_balance = ?, last_contribution_date = NOW(), updated_at = NOW()
  WHERE id = ?
`, [balanceAfter, savingsAccount[0].id]);
```

**ACID within transaction:**
1. Insert transaction record with before/after balances
2. Update account balance
3. Both succeed or both rollback

**If employee has no savings account:** Logged and skipped (no error — payroll still processes).

### Step 4: Loan Repayment Deduction

```javascript
if (detail.loan_repayment_deduction > 0) {
  const loanQuery = 'SELECT id FROM loans WHERE user_id = ? AND status = "ACTIVE"';
  const [loan] = await connection.query(loanQuery, [detail.user_id]);
```

**If payroll row includes loan deduction amount:**
- Find active loan
- Create `loan_transactions` PAYMENT record
- Reduce `outstanding_balance`
- May auto-complete loan if balance reaches 0

(Same pattern as manual payment in `loan.model.js → addLoanTransaction`)

### Step 5: Mark Batch Processed

After all employees processed:
```javascript
UPDATE payroll_batches SET status = 'PROCESSED', processed_by = ?, processed_at = NOW()
```

---

## 5. Controller Wrapper

### File: `src/controllers/payrollController.js` (Lines 347–368)

```javascript
static async processBatch(req, res) {
  try {
    const { batchId } = req.params;
    const processedBy = req.userId;
    const result = await Payroll.processPayrollBatch(batchId, processedBy);
    await auditLog(processedBy, 'PAYROLL_BATCH_PROCESS', 'payroll_batches', batchId, null, result, req.ip, req.get('User-Agent'));
    res.json({ success: true, message: 'Payroll batch processed successfully', data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
```

**Audit trail records who processed which batch** with full result summary.

---

## 6. Enterprise Savings Dashboard Integration

### File: `src/modules/savings/enterprise-savings.service.js` (Lines 69–139)

The savings dashboard shows how payroll deductions affect the employee:

```javascript
const loanQuery = `
  SELECT COALESCE(SUM(monthly_deduction), 0) as total_loan_deductions
  FROM loans WHERE user_id = ? AND status IN ('ACTIVE', 'APPROVED')
`;
```

```javascript
const currentDeduction = accountData.savings_type === 'PERCENTAGE'
  ? (grossSalary * accountData.saving_percentage / 100)
  : accountData.fixed_amount || 0;
const totalDeductions = currentDeduction + loanDeductions;
const deductionRatio = grossSalary > 0 ? (totalDeductions / grossSalary * 100) : 0;
```

**Health status based on deduction ratio:**
```javascript
let healthStatus = 'SAFE';
if (deductionRatio > 50) healthStatus = 'RISKY';
else if (deductionRatio >= 30) healthStatus = 'MODERATE';
```

**Business insight:** If savings + loan deductions exceed 50% of gross salary, employee is flagged as RISKY.

---

## 7. Scheduler Health Check

### File: `src/services/scheduler.service.js` (Lines 198–207)

```javascript
const stuckPayroll = await query(`
  SELECT COUNT(*) as count FROM payroll_batches
  WHERE status IN ('UPLOADED', 'VALIDATED')
  AND created_at < DATE_SUB(NOW(), INTERVAL 7 DAY)
`);
if (stuckPayroll[0].count > 0) {
  issues.push(`${stuckPayroll[0].count} payroll batches stuck in processing`);
}
```

**Runs every 6 hours** — alerts admins if batches are stuck for 7+ days.

---

## 8. Template Download

### File: `src/controllers/payrollController.js` (Lines 412–450)

```javascript
worksheet.columns = [
  { header: 'Employee ID', key: 'employee_id' },
  { header: 'Gross Salary', key: 'gross_salary' },
  { header: 'Savings Deduction', key: 'saving' },
  { header: 'Loan Deduction', key: 'deduction' },
  { header: 'Net Salary', key: 'net_salary' },
  { header: 'Payroll Date', key: 'payroll_date' }
];
```

Finance downloads Excel template, fills data, uploads back.

---

## Concurrency & Error Handling

| Concern | Solution |
|---------|----------|
| Partial batch failure | Single `transaction()` wraps entire batch |
| Double processing | Status check: only `CONFIRMED` can be processed |
| Missing savings account | Skip employee, log message, continue |
| Invalid employee ID | Caught during validation phase (before process) |
| Audit | `auditLog` on upload, validate, approve, process |

---

## Examiner Q&A

**Q: Why calculate savings from net salary, not gross?**
A: Savings are deducted after other payroll deductions, so net salary reflects what the employee actually receives. The percentage applies to take-home pay.

**Q: What if the same batch is processed twice?**
A: After first processing, status becomes `PROCESSED`. Second attempt fails: "Payroll batch must be approved before processing" (status is no longer `CONFIRMED`).

**Q: How does this relate to manual savings contributions?**
A: Manual contributions use the same `savings_transactions` table with `transaction_type = 'CONTRIBUTION'` but without `payroll_batch_id`. Payroll contributions link to the batch for traceability.

**Q: Explain the minimum contribution of 100.**
A: Business rule ensuring every active saver contributes at least 100 per payroll cycle, even if their percentage calculates lower on small salaries.

---

## Summary

Payroll processing is the **automated bridge** between HR/finance operations and the savings/loan modules. It enforces consistent deductions every pay cycle inside ACID transactions, with full audit trails and health monitoring.
