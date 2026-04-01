const express = require('express');
const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/users/user.routes');
const savingsRoutes = require('./modules/savings/savings.routes');

// Placeholder routes for modules to be created
const hrRoutes = require('./modules/hr/hr.routes');
const financeRoutes = require('./modules/finance/finance.routes');
const loanRoutes = require('./modules/loans/loan.routes');
const loanCommitteeRoutes = require('./modules/loanCommittee/committee.routes');
const guarantorRoutes = require('./modules/guarantors/guarantor.routes');
const reportRoutes = require('./modules/reports/report.routes');
const aiRoutes = require('./modules/ai/ai.routes');
const adminRoutes = require('./modules/admin/admin.routes');
const notificationRoutes = require('./modules/notifications/notification.routes');

// Import HR service for employee validation
const HrService = require('./modules/hr/hr.service');

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

// Employee validation route (accessible to all authenticated users)
const { authMiddleware } = require('./middleware/auth');
router.get('/hr/validate/:employeeId', authMiddleware, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const employee = await HrService.validateEmployee(employeeId);
    
    res.json({
      success: true,
      data: employee,
      message: 'Employee validated successfully'
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message || 'Employee not found'
    });
  }
});

// Module routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/savings', savingsRoutes);
router.use('/hr', hrRoutes);
router.use('/finance', financeRoutes);
router.use('/loans', loanRoutes);
router.use('/loan-committee', loanCommitteeRoutes);
router.use('/guarantors', guarantorRoutes);
router.use('/reports', reportRoutes);
router.use('/ai', aiRoutes);
router.use('/admin', adminRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router;
