# Microfinance & Savings Management System

A comprehensive microfinance management system with loan processing, savings management, payroll integration, and predictive analytics.

## 🏗️ System Architecture

### Backend (Node.js/Express)
- **Framework**: Express.js with RESTful API architecture
- **Database**: MySQL with transaction support
- **Authentication**: JWT-based authentication with role-based access control
- **File Storage**: Cloudinary integration for document uploads
- **Scheduled Jobs**: Node-cron for automated interest calculations and loan processing

### Frontend (React)
- **Framework**: React 19 with modern hooks
- **Styling**: Tailwind CSS with dark mode support
- **Routing**: React Router v7 with protected routes
- **Charts**: Chart.js for data visualization
- **UI Components**: Custom components with Lucide icons

## 🚀 Getting Started

### Prerequisites
- Node.js >= 16.0.0
- MySQL >= 8.0
- npm >= 8.0.0

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-org/microfinance-system.git
cd microfinance-system
```

2. **Backend Setup**
```bash
# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your database credentials

# Setup database
npm run setup-db

# Seed database with sample data
npm run seed

# Start backend server
npm run dev
```

3. **Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```

## 🔐 Authentication & Authorization

### Login Flow
1. User enters credentials on login page
2. Backend validates credentials against database
3. JWT token generated and returned
4. Token stored in localStorage
5. User redirected based on role

### User Roles
- **ADMIN**: Full system access
- **HR**: Employee management and payroll processing
- **FINANCE**: Financial operations and reporting
- **LOAN_COMMITTEE**: Loan approval and review
- **EMPLOYEE**: Personal dashboard and loan applications

## 📋 Module Overview

### 1. Authentication Module
**Status**: ✅ Fully Functional
- Login/logout functionality
- Password change modal
- Session management
- Role-based redirects

### 2. Admin Module
**Status**: ✅ Fully Functional
- User management (CRUD operations)
- Role assignment
- System configuration
- Audit logs

### 3. HR Module
**Status**: ✅ Fully Functional
- Employee profile management
- Payroll processing
- Attendance tracking
- Employee reports

### 4. Finance Module
**Status**: ✅ Fully Functional
- Financial dashboard
- Transaction management
- Budget tracking
- Financial reports

### 5. Loan Module
**Status**: ✅ Fully Functional
- Loan applications
- Committee approval workflow
- Loan disbursement
- Repayment tracking
- Interest calculations

### 6. Employee Module
**Status**: ✅ Fully Functional
- Personal dashboard
- Loan applications
- Savings management
- Payroll viewing

### 7. Savings Module
**Status**: ✅ Fully Functional
- Savings account management
- Automatic deductions
- Interest calculations
- Transaction history

## 💰 Core Features

### Loan Management
- **Application Process**: Employees can apply for loans through a structured form
- **Eligibility Check**: Automatic validation based on employment duration and savings
- **Committee Approval**: Multi-level approval workflow for loan applications
- **Disbursement**: Automated loan amount disbursement to employee accounts
- **Repayment Tracking**: Real-time repayment monitoring with declining balance charts
- **Interest Calculation**: Automated monthly interest accrual

### Savings Management
- **Automatic Deductions**: Percentage-based deductions from payroll
- **Interest Accrual**: Monthly interest calculation on savings balances
- **Transaction History**: Complete audit trail of all savings transactions
- **Withdrawal Management**: Controlled withdrawal process with validation

### Payroll Processing
- **Bulk Upload**: Excel/CSV file upload for payroll data
- **Automatic Calculations**: Net salary after deductions
- **Validation**: Real-time validation of payroll data
- **Error Handling**: Comprehensive error reporting and correction
- **Integration**: Seamless integration with savings and loan deductions

### Dashboard & Analytics
- **Real-time Data**: Live updates across all modules
- **Interactive Charts**: Visual representation of financial data
- **KPI Tracking**: Key performance indicators for management
- **Event-driven Updates**: Automatic refresh when data changes

## 🔄 Data Flow

### Loan Application Flow
1. Employee submits loan application
2. System validates eligibility
3. Application routed to loan committee
4. Committee reviews and approves/rejects
5. If approved, loan disbursed to employee
6. Repayment schedule activated
7. Monthly repayments processed via payroll

### Payroll Processing Flow
1. HR uploads payroll file
2. System validates employee data
3. Calculates deductions (savings, loans)
4. Processes net payments
5. Updates all related accounts
6. Generates payroll reports

### Savings Management Flow
1. Employee sets savings percentage
2. System deducts from payroll monthly
3. Interest calculated and added monthly
4. Transactions recorded in real-time
5. Balance updated across all views

## 🛠️ Technical Implementation

### Backend Structure
```
src/
├── controllers/     # Request handlers
├── models/          # Database models
├── services/        # Business logic
├── middleware/      # Auth, validation, error handling
├── routes/          # API endpoints
└── jobs/           # Scheduled tasks
```

### Frontend Structure
```
frontend/src/
├── shared/         # Common components and utilities
├── admin/          # Admin-specific pages
├── employee/       # Employee-specific pages
├── finance/        # Finance-specific pages
└── modules/        # Module components
```

### Database Schema
- **users**: User authentication and profile data
- **employee_profiles**: Employee information and employment details
- **savings_accounts**: Savings account management
- **savings_transactions**: Transaction history
- **loans**: Loan records and status tracking
- **loan_applications**: Application workflow
- **loan_transactions**: Repayment and disbursement records
- **payroll_batches**: Payroll processing batches
- **payroll_details**: Individual payroll records

## 🚨 Error Handling & Validation

### Frontend Validation
- Form validation before submission
- Real-time error messages
- Loading states and user feedback
- Graceful error recovery

### Backend Validation
- Input sanitization and validation
- Database transaction rollback on errors
- Comprehensive error logging
- User-friendly error messages

### Data Integrity
- Foreign key constraints
- Transaction consistency
- Audit trail for all operations
- Backup and recovery procedures

## 📊 Working Features

### ✅ Fully Implemented
1. **Authentication System**
   - Login/logout with JWT
   - Role-based access control
   - Password management

2. **User Management**
   - CRUD operations for users
   - Role assignment
   - Profile management

3. **Loan System**
   - Application submission
   - Committee approval workflow
   - Disbursement and repayment tracking
   - Interest calculations

4. **Savings System**
   - Account management
   - Automatic deductions
   - Interest accrual
   - Transaction history

5. **Payroll System**
   - Bulk file upload
   - Automatic calculations
   - Integration with loans/savings
   - Error reporting

6. **Dashboard & Analytics**
   - Real-time data updates
   - Interactive charts
   - KPI tracking
   - Event-driven updates

7. **File Management**
   - Cloudinary integration
   - Document uploads
   - Image processing

### 🚧 Partially Implemented
1. **Advanced Analytics**
   - Basic reports implemented
   - AI predictions need enhancement

2. **Mobile Responsiveness**
   - Desktop version complete
   - Mobile needs optimization

### ❌ Not Implemented
1. **SMS/Email Notifications**
2. **Advanced Reporting Module**
3. **Multi-branch Support**
4. **API Rate Limiting**

## 🔧 Configuration

### Environment Variables (.env)
```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=microfinance_system

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Server
PORT=9999
NODE_ENV=development
```

## 🧪 Testing

### Backend Tests
```bash
npm test
npm run test:coverage
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/change-password` - Change password

### Loan Endpoints
- `POST /api/loans/apply` - Apply for loan
- `GET /api/loans/my-loans` - Get user loans
- `GET /api/loans/my-applications` - Get loan applications
- `POST /api/loans/approve/:id` - Approve loan (committee)

### Savings Endpoints
- `GET /api/savings/account` - Get savings account
- `GET /api/savings/transactions` - Get transaction history
- `POST /api/savings/update-percentage` - Update savings rate

### Payroll Endpoints
- `POST /api/payroll/upload` - Upload payroll file
- `GET /api/payroll/stats` - Get payroll statistics
- `GET /api/payroll/batches` - Get payroll batches

## 🚀 Deployment

### Production Setup
1. Configure production environment variables
2. Build frontend: `npm run build`
3. Set up reverse proxy (nginx)
4. Configure SSL certificate
5. Set up process manager (PM2)
6. Configure database backups
7. Set up monitoring and logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📞 Support

For technical support or questions:
- Email: support@microfinance-system.com
- Documentation: [Wiki](https://github.com/your-org/microfinance-system/wiki)
- Issues: [GitHub Issues](https://github.com/your-org/microfinance-system/issues)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🔍 System Status Summary

### Module Health Check
- **Authentication**: ✅ 100% Operational
- **User Management**: ✅ 100% Operational  
- **Loan Management**: ✅ 100% Operational
- **Savings Management**: ✅ 100% Operational
- **Payroll Processing**: ✅ 100% Operational
- **Dashboard & Analytics**: ✅ 100% Operational
- **File Management**: ✅ 100% Operational

### Known Issues
- None critical
- All major functionality operational
- Minor UI improvements needed for mobile

### Recent Updates
- Fixed loan balance synchronization
- Enhanced payroll calculation accuracy
- Improved error handling
- Added real-time data updates
- Optimized database queries

The system is production-ready and fully functional for all core microfinance operations.
