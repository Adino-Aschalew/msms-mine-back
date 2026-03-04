# 🚀 Microfinance System API Testing Guide

## 📋 Prerequisites
- Server running on `http://localhost:3003`
- Postman installed
- JWT token from login

## 🔑 Step 1: Get JWT Token

### **Login Request**
```
POST http://localhost:3003/api/auth/login
Content-Type: application/json

{
  "employee_id": "ADMIN001",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {...}
  }
}
```

**Copy the token and save it as `{{token}}` in Postman variables.**

---

## 🧪 Step 2: Test Core APIs

### **Authentication APIs**

#### **Get Profile**
```
GET http://localhost:3003/api/auth/profile
Authorization: Bearer {{token}}
```

#### **Change Password**
```
POST http://localhost:3003/api/auth/change-password
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "current_password": "admin123",
  "new_password": "Newpassword123",
  "confirm_password": "Newpassword123"
}
```

---

### **User Management APIs**

#### **Get All Users**
```
GET http://localhost:3003/api/users
Authorization: Bearer {{token}}
```

#### **Create User**
```
POST http://localhost:3003/api/users
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "employee_id": "EMP004",
  "username": "newuser",
  "email": "newuser@company.com",
  "password": "password123",
  "role": "EMPLOYEE"
}
```

---

### **HR APIs**

#### **Get Employees**
```
GET http://localhost:3003/api/hr/employees
Authorization: Bearer {{token}}
```

#### **Create Employee**
```
POST http://localhost:3003/api/hr/employees
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "employee_id": "EMP005",
  "username": "hruser",
  "email": "hruser@company.com",
  "password": "password123",
  "first_name": "HR",
  "last_name": "User",
  "phone": "+1234567890",
  "address": "123 HR St",
  "department": "HR",
  "job_grade": "B1",
  "employment_status": "ACTIVE",
  "hire_date": "2024-01-15"
}
```

---

### **Savings APIs**

#### **Get Savings Accounts**
```
GET http://localhost:3003/api/savings/accounts
Authorization: Bearer {{token}}
```

#### **Add Contribution**
```
POST http://localhost:3003/api/savings/contribute
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "amount": 500,
  "description": "Monthly contribution"
}
```

#### **Get Transactions**
```
GET http://localhost:3003/api/savings/transactions
Authorization: Bearer {{token}}
```

---

### **Loan APIs**

#### **Apply for Loan**
```
POST http://localhost:3003/api/loans/apply
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "loan_amount": 5000,
  "loan_purpose": "Home renovation",
  "loan_term_months": 12,
  "interest_rate": 0.15,
  "monthly_payment": 450,
  "collateral_description": "Car and property"
}
```

#### **Get Loans**
```
GET http://localhost:3003/api/loans
Authorization: Bearer {{token}}
```

#### **Make Payment**
```
POST http://localhost:3003/api/loans/1/pay
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "payment_amount": 450,
  "payment_method": "bank_transfer"
}
```

---

### **Finance APIs**

#### **Financial Overview**
```
GET http://localhost:3003/api/finance/overview
Authorization: Bearer {{token}}
```

#### **Upload Payroll**
```
POST http://localhost:3003/api/finance/payroll/upload
Authorization: Bearer {{token}}
Content-Type: multipart/form-data

[File: test_payroll.csv]
```

#### **Get Payroll Batches**
```
GET http://localhost:3003/api/finance/payroll/batches
Authorization: Bearer {{token}}
```

---

### **Report APIs**

#### **Generate Report**
```
POST http://localhost:3003/api/reports/generate
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "reportType": "loan_portfolio",
  "format": "json",
  "filters": {}
}
```

#### **Get Report Templates**
```
GET http://localhost:3003/api/reports/templates
Authorization: Bearer {{token}}
```

---

### **AI/Analytics APIs**

#### **Get Predictions**
```
POST http://localhost:3003/api/ai/predictions
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "predictionType": "loan_default",
  "parameters": {}
}
```

#### **Risk Assessment**
```
POST http://localhost:3003/api/ai/risk-assessment
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "userId": 2,
  "loanAmount": 5000,
  "loanTerm": 12
}
```

---

## 🧪 Step 3: Test Payroll Upload

### **Using the Test CSV File**
1. Use the `test_payroll.csv` file in the project root
2. Upload it to: `POST /api/finance/payroll/upload`
3. Check the response for processing status

---

## 📊 Step 4: Test Complete Workflows

### **Complete Loan Application Flow:**
1. Login → Get token
2. Apply for loan → `POST /api/loans/apply`
3. Check application status → `GET /api/loans`
4. Make payment → `POST /api/loans/{id}/pay`

### **Complete Savings Flow:**
1. Login → Get token
2. Check account → `GET /api/savings/accounts`
3. Add contribution → `POST /api/savings/contribute`
4. Check transactions → `GET /api/savings/transactions`

### **Complete Payroll Flow:**
1. Login → Get token
2. Upload payroll → `POST /api/finance/payroll/upload`
3. Check batches → `GET /api/finance/payroll/batches`
4. Check payroll history → `GET /api/finance/payroll/history/{userId}`

---

## 🔍 Step 5: Test Error Handling

### **Invalid Token**
```
GET http://localhost:3003/api/users
Authorization: Bearer invalid_token
```

### **Invalid Data**
```
POST http://localhost:3003/api/loans/apply
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "loan_amount": -1000,
  "loan_purpose": ""
}
```

### **Missing Required Fields**
```
POST http://localhost:3003/api/users
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "username": "test"
}
```

---

## 📝 Step 6: Test Reports

### **Generate Different Report Types**
- `loan_portfolio`
- `savings_summary`
- `financial_overview`
- `employee_summary`
- `transaction_history`
- `audit_trail`
- `risk_assessment`

### **Export Formats**
- `format: "json"`
- `format: "pdf"`
- `format: "csv"`

---

## 🎯 Success Indicators

✅ **Successful Response:**
```json
{
  "success": true,
  "data": {...},
  "message": "Operation completed successfully"
}
```

❌ **Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "error": {...}
}
```

---

## 🚀 Quick Start Commands

1. **Login First:**
```bash
curl -X POST http://localhost:3003/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"employee_id": "ADMIN001", "password": "admin123"}'
```

2. **Test Health Check:**
```bash
curl http://localhost:3003/api/health
```

3. **Test with Token:**
```bash
curl -X GET http://localhost:3003/api/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📱 Available Users for Testing

| Role | Employee ID | Password | Description |
|------|-------------|----------|-------------|
| Admin | ADMIN001 | admin123 | Full access |
| Employee | EMP001 | password123 | John Doe (IT) |
| Employee | EMP002 | password123 | Jane Smith (HR) |
| Employee | EMP003 | password123 | Bob Wilson (Finance) |

---

## 🎉 Happy Testing! 🚀

The system is now ready for comprehensive API testing. Start with the authentication flow and work through each module systematically.
