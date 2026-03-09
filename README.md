# Microfinance & Savings Management System

A comprehensive microfinance and savings management system with predictive analytics and reporting capabilities, built with Node.js, Express.js, and MySQL.

## 🚀 Features

### Core Functionality
- **Employee Registration & HR Verification**: Only verified employees can participate
- **Automated Savings**: Salary-based savings with configurable percentages (15-65%)
- **Loan Management**: Committee-based loan approval with guarantor system
- **Payroll Integration**: Automated deductions from payroll uploads
- **Predictive Analytics**: AI-powered forecasting for planning and risk management
- **Comprehensive Reporting**: Operational, financial, and audit reports

### Key Features
- **Role-Based Access Control (RBAC)**: Employee, Loan Committee, Finance Admin, Super Admin
- **Audit Logging**: Complete audit trail for all critical operations
- **Automated Calculations**: Interest calculations, penalties, and repayments
- **Document Management**: PDF/CSV generation for approvals and reports
- **Real-time Notifications**: System alerts and updates
- **Data Integrity**: Maker-checker principles and immutable logs

## 📋 System Requirements

- Node.js 16.0.0 or higher
- MySQL 8.0 or higher
- npm 8.0.0 or higher

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd microfinance-system
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Setup
```bash
# Create the database and tables
mysql -u root -p < schema.sql
```

### 4. Environment Configuration
Copy the example environment file and update the configuration:
```bash
cp config.env.example config.env
```

Update the following variables in `config.env`:
```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=microfinance_system
DB_PORT=3307

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Server Configuration
PORT=3000
NODE_ENV=development
```

### 5. Start the Application
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 🏗️ Project Structure

```
microfinance-system/
├── src/
│   ├── config/          # Database configuration
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Authentication, audit, validation
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── services/        # Business logic services
│   ├── utils/           # Utility functions
│   └── app.js           # Express application setup
├── uploads/             # File uploads (documents, reports, payroll)
├── logs/                # Application logs
├── schema.sql           # Database schema
├── server.js            # Server entry point
├── package.json         # Dependencies and scripts
└── README.md           # This file
```

## 🔐 Authentication & Authorization

### Roles
- **EMPLOYEE**: Can manage savings, apply for loans, view personal data
- **LOAN_COMMITTEE**: Review and approve loan applications, manage guarantors
- **FINANCE_ADMIN**: Upload payroll, process deductions, view financial reports
- **SUPER_ADMIN**: System configuration, user management, all reports

### Default Admin
- **Username**: admin
- **Password**: admin123
- **Role**: SUPER_ADMIN

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh-token` - Refresh JWT token
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Employee Management
- `POST /api/employee/verify` - Verify employee from HR database
- `GET /api/employee/profile` - Get employee profile
- `GET /api/employee/all` - Get all employees (Admin)
- `GET /api/employee/unverified` - Get unverified employees (Admin)

### Savings Management
- `POST /api/savings/account` - Create savings account
- `GET /api/savings/account` - Get savings account details
- `PUT /api/savings/account/percentage` - Update saving percentage
- `GET /api/savings/transactions` - Get savings transactions
- `POST /api/savings/contribute` - Add savings contribution
- `POST /api/savings/withdraw` - Withdraw savings

## 💾 Database Schema

The system uses MySQL with the following main tables:

- **users**: System authentication and roles
- **employee_profiles**: Employee information (synced with HR)
- **savings_accounts**: Savings account management
- **savings_transactions**: All savings-related transactions
- **loan_applications**: Loan application workflow
- **loans**: Active loan management
- **loan_repayments**: Loan repayment tracking
- **guarantors**: Loan guarantor information
- **payroll_batches**: Payroll upload and processing
- **payroll_details**: Individual payroll records
- **penalties**: System penalties management
- **audit_logs**: Complete audit trail
- **ai_forecasts**: Predictive analytics results
- **generated_reports**: Report generation history

## 🔧 Configuration

### System Configuration
Key system parameters are stored in the `system_configuration` table:

- `savings_interest_rate`: Annual savings interest rate (default: 7%)
- `loan_interest_rate`: Annual loan interest rate (default: 11%)
- `min_saving_percentage`: Minimum saving percentage (default: 15%)
- `max_saving_percentage`: Maximum saving percentage (default: 65%)
- `savings_lock_period_months`: Savings lock period (default: 6 months)
- `min_loan_eligibility_months`: Minimum months for loan eligibility (default: 6)
- `max_loan_multiplier`: Maximum loan as multiplier of savings (default: 6)

## 📈 Predictive Analytics

The system includes AI-powered forecasting using JavaScript-based statistical models:

- **User Registration Forecasting**: Predicts new user registrations
- **Loan Demand Forecasting**: Forecasts loan demand and amounts
- **Liquidity Planning**: Predicts cash flow and liquidity needs
- **Risk Indicators**: Identifies potential risk factors

Forecasts are generated automatically via scheduled jobs and are read-only advisory tools.

## 📋 Reports

### Report Types
- **Operational Reports**: Daily operations, transactions, penalties
- **Financial Reports**: Savings, loans, interest, liquidity analysis
- **Audit Reports**: Compliance, admin activities, system changes
- **Forecast Comparison**: Predicted vs actual performance

### Export Formats
- PDF (official reports)
- CSV/Excel (data analysis)

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Granular permission management
- **Audit Logging**: Complete audit trail for all operations
- **Input Validation**: Comprehensive input sanitization
- **SQL Injection Prevention**: Parameterized queries
- **Rate Limiting**: API rate limiting protection
- **Password Security**: Bcrypt hashing with configurable rounds

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📝 Logging

The system maintains comprehensive logs:
- Application logs in `logs/` directory
- Database audit logs in `audit_logs` table
- Error tracking and monitoring
- Performance metrics

## 🚀 Deployment

### Production Setup
1. Set `NODE_ENV=production` in environment
2. Use a process manager like PM2
3. Configure reverse proxy (nginx/Apache)
4. Set up SSL/TLS certificates
5. Configure database backups
6. Set up monitoring and alerting

### Environment Variables
Ensure all sensitive configuration is stored in environment variables, not in code.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

## 🔄 Version History

- **v1.0.0**: Initial release with core functionality
  - User authentication and authorization
  - Employee registration and HR verification
  - Savings management with automated deductions
  - Loan management with committee approval
  - Payroll integration
  - Basic reporting and analytics

## 📊 System Architecture

The system follows enterprise architecture patterns:
- **Separation of Concerns**: Clear separation between business logic, data access, and presentation
- **Scalability**: Designed for horizontal scaling
- **Maintainability**: Clean code structure and comprehensive documentation
- **Security**: Defense-in-depth security approach
- **Compliance**: Built with regulatory requirements in mind

## 🎯 Business Rules

### Savings Rules
- Employees can save 15-65% of their salary
- Savings are locked for 6 months
- 7% annual interest calculated monthly
- Penalties for missed contributions after 10 days

### Loan Rules
- Minimum 6 months of consecutive savings required
- Maximum loan = 6 × total savings
- Only one active loan at a time
- 11% annual interest calculated monthly
- Committee approval required

### Payroll Rules
- Only Finance Admin can upload payroll
- Automatic deduction of savings and loan repayments
- Maker-checker principle for payroll processing
- Complete audit trail maintained

This system is designed for academic submission and enterprise deployment, with strong financial discipline, separation of duties, and complete reporting capabilities.
