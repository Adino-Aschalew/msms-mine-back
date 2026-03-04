# Microfinance Frontend

A modern React frontend for the Microfinance System backend.

## Features

- 🔐 Authentication & Authorization
- 📊 Dashboard with real-time stats
- 💰 Savings management
- 💳 Loan applications and management
- 📄 Payroll processing
- 📈 Reports and analytics
- 🤖 AI-powered risk assessment
- 📱 Responsive design
- 🎨 Modern UI with Tailwind CSS

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Routing**: React Router
- **State Management**: React Context + useReducer

## Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

### Project Structure

```
src/
├── components/
│   ├── common/
│   │   ├── Layout.jsx
│   │   └── ...
│   └── auth/
│       └── ProtectedRoute.jsx
├── context/
│   ├── AuthContext.jsx
│   └── ThemeContext.jsx
├── pages/
│   ├── Dashboard.jsx
│   ├── Login.jsx
│   ├── Loans.jsx
│   ├── Savings.jsx
│   ├── Payroll.jsx
│   ├── Reports.jsx
│   └── AI.jsx
├── services/
│   └── api.js
└── utils/
    └── helpers.js
```

## API Integration

The frontend is configured to proxy API requests to:
- Backend: `http://localhost:9999/api`
- Authentication: JWT Bearer tokens
- Auto-redirect on 401 responses

## Environment Variables

Create a `.env` file in the frontend root:

```env
VITE_API_URL=http://localhost:9999/api
```

## Features Overview

### Authentication
- Login/logout functionality
- JWT token management
- Protected routes
- Auto token refresh

### Dashboard
- Real-time statistics
- Recent activity feed
- Quick action cards
- Responsive layout

### Loans Module
- Apply for new loans
- View existing loans
- Track loan status
- Make payments

### Savings Module
- View account balance
- Transaction history
- Deposit funds
- Interest calculations

### Payroll Module
- Upload payroll files
- View payroll history
- Process employee salaries
- Generate reports

### Reports Module
- Generate various reports
- Filter by date range
- Export functionality
- Visual charts

### AI Module
- Risk assessment
- Loan predictions
- Recommendations
- Anomaly detection

## Contributing

1. Follow the existing code style
2. Use semantic HTML
3. Ensure responsive design
4. Test thoroughly
5. Document changes
