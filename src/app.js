require('dotenv').config({ path: '../config.env' });

const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employee');
const savingsRoutes = require('./routes/savings');
const loanRoutes = require('./routes/loan');
const guarantorRoutes = require('./routes/guarantor');
const payrollRoutes = require('./routes/payroll');
const analyticsRoutes = require('./routes/analytics');
const reportRoutes = require('./routes/report');
const adminRoutes = require('./routes/admin');

const SchedulerService = require('./services/schedulerService');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/employee', employeeRoutes);
app.use('/api/savings', savingsRoutes);
app.use('/api/loan', loanRoutes);
app.use('/api/guarantor', guarantorRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);

// Initialize scheduler service
SchedulerService.initialize();

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Microfinance System API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Microfinance System API running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

module.exports = app;
