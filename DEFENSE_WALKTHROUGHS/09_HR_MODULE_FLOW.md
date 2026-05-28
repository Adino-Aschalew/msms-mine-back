# HR Module Flow - Detailed Code Walkthrough

## Overview

The HR module is the **source of truth for employee identity and employment status** inside MSMS. It governs:

- **Onboarding**: create employee user + profile
- **Verification**: HR verifies employee records (`hr_verified`)
- **Employment status**: ACTIVE / ON_LEAVE / TERMINATED
- **HR sync + validation**: validates an employee ID against HR dataset, and “syncs” internal records
- **Dashboards**: employee counts, departments, recent HR activities from `audit_logs`

Core files:
- Routes: `src/modules/hr/hr.routes.js`
- Controller: `src/modules/hr/hr.controller.js`
- Service: `src/modules/hr/hr.service.js`
- DB table: `employee_profiles` in `migrations/schema.sql`

API mounted at: `src/routes.js` → `router.use('/hr', hrRoutes);`

---

## 1. Route Protection & RBAC

### File: `src/modules/hr/hr.routes.js`

```javascript
router.use(authMiddleware);
```
**All HR endpoints require JWT authentication**.

```javascript
router.get('/validate/:employeeId', HrController.validateEmployee);
```
Employee validation is available to any authenticated user (still protected by JWT).

```javascript
router.use(roleMiddleware(['SUPER_ADMIN', 'ADMIN', 'HR']));
```
Everything after this line is restricted to HR/Admin roles.

**Examiner angle:** this is server-side enforcement; even if someone tampers frontend routes, backend rejects with **403**.

---

## 2. HR “Validate Employee” (HR integration stub)

### Where it’s exposed

- `GET /api/hr/validate/:employeeId` (in `hr.routes.js`)
- Also duplicated convenience route: `GET /api/hr/validate/:employeeId` in `src/routes.js` (same behavior, also uses `authMiddleware`)

### File: `src/modules/hr/hr.service.js` (method `validateEmployee`, around line 276)

```javascript
const mockHREmployees = [ ... ];
const employee = mockHREmployees.find(emp => emp.employee_id === employee_id);
if (!employee) throw new Error('Employee not found in HR database or not active');
return employee;
```

**Business meaning:** This simulates “checking an employee exists in the company HR system”. In production this would call an HR DB/API; here it’s **mock data**.

**Examiner questions you should be ready for:**
- **Why validate?** Prevent non-employees from self-registering and getting financial access.
- **Why is it mock?** Because external HR system integration is environment-dependent; current code keeps the contract/shape.

---

## 3. Create Employee (Onboarding)

### File: `src/modules/hr/hr.controller.js` (method `createEmployee`)

Controller maps request fields (frontend naming) into DB naming:

```javascript
const employeeData = {
  employee_id: employeeId || `EMP${Date.now().toString().slice(-6)}`,
  username: email,
  email: email,
  role: 'EMPLOYEE'
};

const profileData = {
  first_name: firstName,
  last_name: lastName,
  grandfather_name: grandfatherName,
  phone,
  address,
  department,
  job_grade: type,
  job_role: role || jobRole,
  salary,
  employment_status: ...,
  hire_date: joinDate
};
```

Basic required check before calling service:
```javascript
if (!employeeData.employee_id || !employeeData.username || !employeeData.email) {
  return res.status(400).json({ success: false, message: 'Employee ID, username, and email are required' });
}
```

### File: `src/modules/hr/hr.service.js` (method `createEmployee`, around line 201)

Key steps:

1) **Uniqueness guard**
```javascript
const existing = await query('SELECT id FROM users WHERE employee_id = ?', [employee_id]);
if (existing.length > 0) throw new Error('Employee ID already exists');
```

2) **Default password policy**
```javascript
const defaultPassword = 'BIT##123';
const password_hash = await bcrypt.hash(defaultPassword, saltRounds);
```

3) **Create `users` row**
```sql
INSERT INTO users (..., email_verified, password_change_required)
VALUES (..., FALSE, TRUE)
```
**Meaning:** user must log in and change password; email still needs OTP verification.

4) **Create `employee_profiles` row**
```sql
INSERT INTO employee_profiles (user_id, employee_id, first_name, last_name, ..., employment_status, hire_date, ...)
```

5) **Audit trail**
```javascript
await auditLog(createdBy, 'EMPLOYEE_CREATED', 'users', userId, null, {...}, ip, userAgent);
```

**Examiner angle (security):**
- Default passwords are acceptable only in a controlled onboarding flow + forced change (`password_change_required = TRUE`).
- This is a common topic: “how do you prevent leaked default passwords?” → answer: forced change + (ideally) deliver default password out-of-band; here it’s returned in response for demo/testing.

---

## 4. HR Verification (`hr_verified`)

### File: `src/modules/hr/hr.service.js` (method `verifyEmployee`, around line 97)

```sql
SELECT u.*, ep.hr_verified
FROM users u
LEFT JOIN employee_profiles ep ON u.id = ep.user_id
WHERE u.id = ? AND ep.hr_verified = FALSE
```

```sql
UPDATE employee_profiles
SET hr_verified = TRUE, hr_verification_date = NOW()
WHERE user_id = ?
```

```javascript
await auditLog(verifiedBy, 'EMPLOYEE_VERIFIED', 'users', userId, null, {...}, ip, userAgent);
```

**Business meaning:** HR has checked the employee’s identity/documents and activated them as “verified”.

**Where it matters elsewhere:** Loan eligibility checks expect a valid employee profile and active employment; HR verification is one of the governance controls used in dashboards and onboarding.

---

## 5. Employment Status Updates (and account disabling)

### File: `src/modules/hr/hr.service.js` (method `updateEmploymentStatus`, around line 142)

```javascript
const validStatuses = ['ACTIVE', 'ON_LEAVE', 'TERMINATED'];
if (!validStatuses.includes(employmentStatus)) throw new Error('Invalid employment status');
```

Update profile status:
```sql
UPDATE employee_profiles SET employment_status = ? WHERE user_id = ?
```

If terminated, deactivate login:
```sql
UPDATE users SET is_active = FALSE WHERE id = ?
```

Audit:
```javascript
await auditLog(updatedBy, 'EMPLOYMENT_STATUS_UPDATE', 'employee_profiles', userId, null, {
  old_status: user.current_status,
  new_status: employmentStatus
}, ip, userAgent);
```

**Business meaning:** Employment termination must block system access; the HR module enforces that by flipping `users.is_active = FALSE`.

**Examiner angle (consistency):**
- This ensures auth middleware (`users.is_active`) blocks API access immediately even if JWT is not expired.

---

## 6. Employee List, Filters, Pagination

### File: `src/modules/hr/hr.service.js` (method `getEmployees`, lines 5–95)

Dynamic filtering builds a `WHERE` clause with parameters:
- department
- employment_status
- job_grade
- search (LIKE across `users` + `employee_profiles`)
- is_active

Pagination:
```javascript
LIMIT ? OFFSET ?
```

Parallel count + select:
```javascript
const [countResult, employees] = await Promise.all([
  query(countQuery, params),
  query(selectQuery, [...params, limit, offset])
]);
```

**Examiner angle:** performance awareness + avoids SQL injection (parameterized).

---

## 7. HR Dashboards + “Recent Activities” (Audit Log driven)

### File: `src/modules/hr/hr.service.js` (method `getDashboardStats`, around line 583)

This method aggregates:
- total employees
- active employees
- verified vs pending verification
- employment status distribution (ACTIVE/ON_LEAVE/TERMINATED)
- department count, job grade count
- recent HR activity pulled from `audit_logs`

Recent activity query filters actions:
```sql
WHERE al.action IN ('EMPLOYEE_CREATED', 'EMPLOYEE_PROFILE_UPDATE', 'EMPLOYEE_VERIFIED', 'EMPLOYMENT_STATUS_UPDATE')
ORDER BY al.created_at DESC
LIMIT 10
```

Then it formats descriptions for UI (“started onboarding…”, “verified employee…”, etc.).

**Business meaning:** Audit logs become both compliance trail and operational dashboard data source.

---

## 8. Sync With HR Database (internal consistency job)

### File: `src/modules/hr/hr.service.js` (method `syncWithHRDatabase`, around line 1038)

This is a “sync” routine that:
- Loads all current employees (users + profiles)
- Flags missing names as errors
- Forces profile status to TERMINATED when `users.is_active = false`
- Auto-verifies long-tenure employees (days since hire > 30) if active
- Detects orphaned profiles (profiles without users)
- Saves summary stats and writes an audit record:
```javascript
await auditLog(adminId, 'HR_SYNC', 'hr_sync', null, null, syncResult, ip, userAgent);
```

**Examiner angle:** It shows the *pattern* of integration and data hygiene even though HR is mocked in `validateEmployee`.

---

## 9. Database Table (employee_profiles)

### File: `migrations/schema.sql` (employee_profiles)

Key governance fields:
- `employment_status ENUM('ACTIVE','INACTIVE','TERMINATED')`
- `hire_date DATE NOT NULL`
- `hr_verified BOOLEAN DEFAULT FALSE`
- `hr_verification_date TIMESTAMP NULL`

**Note:** The HR module’s service currently uses `ON_LEAVE` as a status option, which differs from the schema’s ENUM (`INACTIVE`). If asked, say the model evolved; the DB schema/ENUM should be aligned in a migration.

---

## 10. Error Handling Patterns

HR controllers typically:
- Return **400** for invalid input (status, missing fields)
- Return **404** for “not found”
- Return **500** for unexpected failures

Service layer throws `Error(message)`; controllers translate.

---

## Examiner Q&A (HR)

**Q: Why is HR verification needed if a user can register?**  
A: Registration creates an account, but HR verification (`hr_verified`) is a control step to ensure only real employees get full access; it also supports compliance and audit.

**Q: How do you instantly block terminated employees?**  
A: HR sets `employee_profiles.employment_status = TERMINATED` and also sets `users.is_active = FALSE`. Auth middleware checks `is_active` on every request.

**Q: How do you keep HR data consistent with the system?**  
A: `syncWithHRDatabase` reconciles flags (inactive → terminated), auto-verifies after tenure threshold, and reports orphaned records.

**Q: Where is the audit trail stored and how is it used?**  
A: `audit_logs` is written via `auditLog()` on create/verify/status/profile updates; dashboards also read it to show “recent activities”.

**Q: Is the HR DB integrated for real?**  
A: `validateEmployee()` is currently a mock list that represents the contract; the same method can be swapped to query a real HR DB/API without changing routes/controllers.

