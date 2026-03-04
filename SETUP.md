# Microfinance System Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 16.0+ 
- MySQL 5.7+
- npm or yarn

### 1. Clone and Install
```bash
git clone <repository-url>
cd microfinance-system
npm install
```

### 2. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your database credentials
nano .env
```

### 3. Database Setup
```bash
# Create database and run migrations
npm run setup-db

# Seed with sample data
npm run seed

# Or do both at once
npm run setup
```

### 4. Start the Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

### 5. Access the System
- **API**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/api/health

## 🔑 Default Login Credentials

| Role | Employee ID | Password |
|------|-------------|----------|
| Admin | ADMIN001 | admin123 |
| Employee | EMP001 | password123 |
| HR | HR001 | password123 |
| Finance | FIN001 | password123 |

## 📊 Available Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `GET /api/auth/profile` - Get profile
- `POST /api/auth/change-password` - Change password

### Users
- `GET /api/users` - Get users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### HR
- `GET /api/hr/employees` - Get employees
- `POST /api/hr/employees` - Create employee
- `PUT /api/hr/employees/:id/verify` - Verify employee
- `PUT /api/hr/employees/:id/status` - Update status

### Finance
- `GET /api/finance/overview` - Financial overview
- `POST /api/finance/payroll/upload` - Upload payroll
- `GET /api/finance/payroll/batches` - Payroll batches
- `GET /api/finance/reports/:type` - Generate reports

### Savings
- `GET /api/savings/accounts` - Get accounts
- `POST /api/savings/contribute` - Add contribution
- `POST /api/savings/withdraw` - Withdraw
- `GET /api/savings/transactions` - Get transactions

### Loans
- `POST /api/loans/apply` - Apply for loan
- `GET /api/loans` - Get loans
- `POST /api/loans/:id/pay` - Make payment
- `GET /api/loans/:id/transactions` - Get transactions

### Loan Committee
- `GET /api/loan-committee/applications/pending` - Pending applications
- `PUT /api/loan-committee/applications/:id/review` - Review application
- `GET /api/loan-committee/risk-analysis` - Risk analysis

### Reports
- `POST /api/reports/generate` - Generate report
- `GET /api/reports/history` - Report history
- `GET /api/reports/templates` - Report templates

### AI/Analytics
- `POST /api/ai/predictions` - Get predictions
- `POST /api/ai/risk-assessment` - Risk assessment
- `POST /api/ai/recommendations` - Recommendations
- `POST /api/ai/forecast` - Forecast

## 📁 Project Structure

```
microfinance-system/
├── src/
│   ├── modules/           # Business logic modules
│   │   ├── auth/
│   │   ├── users/
│   │   ├── hr/
│   │   ├── finance/
│   │   ├── savings/
│   │   ├── loans/
│   │   ├── loanCommittee/
│   │   ├── guarantors/
│   │   ├── reports/
│   │   └── ai/
│   ├── middleware/        # Express middleware
│   ├── services/          # Business services
│   ├── utils/            # Utility functions
│   ├── jobs/             # Background jobs
│   └── config/           # Configuration
├── migrations/             # Database migrations
├── scripts/               # Setup scripts
├── tests/                 # Test files
└── uploads/              # File uploads
```

## 🔧 Configuration

### Environment Variables
```bash
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=microfinance_system

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Server
PORT=3001
NODE_ENV=development
```

## 🧪 Testing

### Run Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Coverage
- Authentication flows
- User management
- Loan applications
- Savings operations
- Financial reporting
- API endpoints

## 📊 Features

### Core Features
- ✅ User authentication & authorization
- ✅ Employee management
- ✅ Savings accounts with interest
- ✅ Loan applications and management
- ✅ Payroll processing
- ✅ Financial reporting
- ✅ Risk assessment
- ✅ Predictive analytics
- ✅ Audit logging
- ✅ Email notifications

### Advanced Features
- ✅ AI-powered risk scoring
- ✅ Automated interest calculations
- ✅ Scheduled jobs
- ✅ PDF report generation
- ✅ CSV/Excel import/export
- ✅ Multi-role permissions
- ✅ Real-time notifications
- ✅ Comprehensive audit trail

## 🔒 Security

- JWT-based authentication
- Role-based access control
- Password hashing with bcrypt
- SQL injection protection
- Rate limiting
- CORS configuration
- Input validation
- Audit logging

## 📈 Monitoring

### Health Check
```bash
curl http://localhost:3001/api/health
```

### Logs
- Application logs: `logs/app.log`
- Database connection logs
- Error tracking
- Audit trail

## 🚀 Deployment

### Production Setup
1. Set `NODE_ENV=production`
2. Configure database credentials
3. Set up SSL/HTTPS
4. Configure reverse proxy (nginx)
5. Set up process monitoring

### Environment Variables
```bash
NODE_ENV=production
DB_HOST=your-db-host
DB_USER=your-db-user
DB_PASSWORD=your-db-password
JWT_SECRET=your-jwt-secret
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check database credentials in .env
   - Ensure MySQL is running
   - Verify database exists

2. **JWT Token Error**
   - Check JWT_SECRET in .env
   - Ensure token is not expired

3. **Upload File Error**
   - Check file size limit
   - Verify file type is allowed
   - Ensure uploads directory exists

4. **Email Not Sending**
   - Check SMTP configuration
   - Verify email credentials
   - Check firewall settings

## 📞 Support

For support:
1. Check the logs in `logs/` directory
2. Review the troubleshooting section
3. Check the GitHub issues
4. Contact the development team

## 📝 License

MIT License - see LICENSE file for details.
