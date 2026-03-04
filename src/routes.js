const express = require('express');
const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/users/user.routes');
const savingsRoutes = require('./modules/savings/savings.routes');

// Placeholder routes for modules to be created
const hrRoutes = require('./modules/hr/hr.routes');
const financeRoutes = require('./modules/finance/finance.routes');
const loanRoutes = require('./modules/loans/loan.routes');
const loanCommitteeRoutes = require('./modules/loanCommittee/committee.routes');
// const guarantorRoutes = require('./modules/guarantors/guarantor.routes');
const reportRoutes = require('./modules/reports/report.routes');
const aiRoutes = require('./modules/ai/ai.routes');

const router = express.Router();

// Health check route
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Microfinance System API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Module routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/savings', savingsRoutes);
router.use('/hr', hrRoutes);
router.use('/finance', financeRoutes);
router.use('/loans', loanRoutes);
router.use('/loan-committee', loanCommitteeRoutes);
// router.use('/guarantors', guarantorRoutes);
router.use('/reports', reportRoutes);
router.use('/ai', aiRoutes);

module.exports = router;
