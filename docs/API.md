# Microfinance System API Documentation

## Overview

The Microfinance System API provides comprehensive endpoints for managing savings, loans, payroll, analytics, and reporting in a microfinance organization. The API follows RESTful principles and uses JSON for data exchange.

## Base URL

```
http://localhost:3000/api
```

## Authentication

All endpoints (except login and registration) require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Roles

- **EMPLOYEE**: Can manage personal savings, apply for loans
- **LOAN_COMMITTEE**: Can review and approve loan applications
- **FINANCE_ADMIN**: Can manage payroll and view financial reports
- **SUPER_ADMIN**: Full system access and configuration

## Response Format

All responses follow this format:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

Error responses:
```json
{
  "success": false,
  "message": "Error description"
}
```

## Endpoints

### Authentication

#### POST /auth/login
Login to the system.

**Request Body:**
```json
{
  "employee_id": "EMP001",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "jwt-token",
    "refreshToken": "refresh-token"
  }
}
```

#### POST /auth/register
Register a new user.

**Request Body:**
```json
{
  "employee_id": "EMP002",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "confirm_password": "password123"
}
```

#### GET /auth/profile
Get current user profile.

#### PUT /auth/profile
Update current user profile.

### Employee Management

#### POST /employee/verify
Verify employee from HR database.

#### GET /employee/profile
Get employee profile.

#### GET /employee/all
Get all employees (Admin only).

#### GET /employee/unverified
Get unverified employees (Admin only).

### Savings Management

#### POST /savings/account
Create savings account.

**Request Body:**
```json
{
  "saving_percentage": 20
}
```

#### GET /savings/account
Get savings account details.

#### PUT /savings/account/percentage
Update saving percentage.

#### GET /savings/transactions
Get savings transactions.

#### POST /savings/contribute
Add savings contribution.

#### POST /savings/withdraw
Withdraw from savings.

### Loan Management

#### GET /loan/eligibility
Check loan eligibility.

#### POST /loan/application
Create loan application.

**Request Body:**
```json
{
  "requested_amount": 5000,
  "purpose": "Home renovation",
  "repayment_duration_months": 12,
  "monthly_income": 3000
}
```

#### GET /loan/applications
Get loan applications.

#### GET /loan/application/:applicationId
Get specific loan application.

#### PUT /loan/application/:applicationId/review
Review loan application (Admin only).

#### GET /loan/active
Get active loans.

#### GET /loan/loan/:loanId
Get specific loan details.

#### POST /loan/loan/:loanId/repayment
Make loan repayment.

### Guarantor Management

#### POST /guarantor/application/:applicationId
Add guarantor to loan application.

**Request Body:**
```json
{
  "guarantor_type": "INTERNAL",
  "guarantor_name": "Jane Smith",
  "guarantor_id": "EMP003",
  "relationship": "Colleague",
  "monthly_income": 4000,
  "contact_phone": "+1234567890",
  "contact_email": "jane@example.com"
}
```

#### GET /guarantor/application/:applicationId
Get guarantors for loan application.

#### PUT /guarantor/:guarantorId/approve
Approve guarantor (Admin only).

#### PUT /guarantor/:guarantorId/reject
Reject guarantor (Admin only).

### Payroll Management

#### POST /payroll/upload
Upload payroll file (Admin only).

**Request:** Multipart form with file field `payroll_file`.

#### GET /payroll/batches
Get payroll batches (Admin only).

#### GET /payroll/batch/:batchId
Get specific payroll batch (Admin only).

#### PUT /payroll/batch/:batchId/validate
Validate payroll batch (Admin only).

#### PUT /payroll/batch/:batchId/confirm
Confirm payroll batch (Admin only).

#### GET /payroll/template
Download payroll template (Admin only).

### Analytics

#### POST /analytics/forecast
Generate forecast (Admin only).

**Request Body:**
```json
{
  "forecast_type": "USER_REGISTRATION",
  "forecast_period": "MONTHLY",
  "future_periods": 12
}
```

#### GET /analytics/dashboard
Get dashboard analytics (Admin only).

#### GET /analytics/forecast/types
Get available forecast types (Admin only).

### Reports

#### POST /reports/generate
Generate report (Admin only).

**Request Body:**
```json
{
  "report_type": "OPERATIONAL",
  "file_format": "PDF",
  "filters": {
    "start_date": "2024-01-01",
    "end_date": "2024-12-31",
    "department": "IT"
  }
}
```

#### GET /reports/history
Get report history (Admin only).

#### GET /reports/download/:reportId
Download report file (Admin only).

#### GET /reports/types
Get available report types (Admin only).

### Admin

#### GET /admin/config
Get system configuration (Super Admin only).

#### PUT /admin/config
Update system configuration (Super Admin only).

#### GET /admin/audit-logs
Get audit logs (Super Admin only).

#### GET /admin/health
Get system health (Super Admin only).

#### GET /admin/compliance
Get compliance report (Super Admin only).

#### GET /admin/stats
Get system statistics (Admin only).

## Error Codes

- **400**: Bad Request - Invalid input data
- **401**: Unauthorized - Authentication required
- **403**: Forbidden - Insufficient permissions
- **404**: Not Found - Resource not found
- **500**: Internal Server Error - Server error

## Rate Limiting

API requests are limited to 100 requests per 15 minutes per IP address.

## File Uploads

- Maximum file size: 10MB
- Supported formats: CSV, XLSX, XLS
- Upload endpoint: `/api/payroll/upload`

## Pagination

List endpoints support pagination:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

Example: `/api/loan/applications?page=2&limit=20`

## Filtering

Many endpoints support filtering via query parameters:
- `start_date`: Filter by start date
- `end_date`: Filter by end date
- `status`: Filter by status
- `department`: Filter by department

Example: `/api/savings/transactions?start_date=2024-01-01&end_date=2024-12-31`

## Webhooks

The system supports webhooks for real-time notifications:
- Loan application status changes
- Payroll processing completion
- System alerts

Configure webhooks via admin panel.

## SDK Examples

### JavaScript/Node.js

```javascript
const axios = require('axios');

// Login
const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
  employee_id: 'EMP001',
  password: 'password123'
});

const token = loginResponse.data.data.token;

// Get savings account
const savingsResponse = await axios.get('http://localhost:3000/api/savings/account', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Python

```python
import requests

# Login
login_response = requests.post('http://localhost:3000/api/auth/login', json={
    'employee_id': 'EMP001',
    'password': 'password123'
})

token = login_response.json()['data']['token']

# Get savings account
savings_response = requests.get('http://localhost:3000/api/savings/account', headers={
    'Authorization': f'Bearer {token}'
})
```

## Testing

Use the provided test suite or tools like Postman to test endpoints.

## Support

For API support and questions, contact the development team or check the system documentation.
