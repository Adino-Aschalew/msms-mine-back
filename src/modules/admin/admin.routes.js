const express = require('express');
const AdminController = require('./admin.controller');
const { authMiddleware, roleMiddleware } = require('../../middleware/auth');
const { auditMiddleware } = require('../../middleware/audit');
const {
  validateCreateHRAdmin,
  validateCreateLoanCommitteeAdmin,
  validateUpdateAdmin
} = require('./admin.validation');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Super Admin only routes
router.get('/dashboard', roleMiddleware(['SUPER_ADMIN']), AdminController.getDashboard);
router.get('/stats', roleMiddleware(['SUPER_ADMIN']), AdminController.getSystemStats);
router.get('/admins', roleMiddleware(['SUPER_ADMIN']), AdminController.getAllAdmins);
router.get('/activity', roleMiddleware(['SUPER_ADMIN']), AdminController.getSystemActivity);

// HR Admin Management
router.post('/hr-admins', roleMiddleware(['SUPER_ADMIN']), validateCreateHRAdmin, auditMiddleware('HR_ADMIN_CREATED'), AdminController.createHRAdmin);
router.get('/hr-admins', roleMiddleware(['SUPER_ADMIN']), AdminController.getHRAdmins);
router.put('/hr-admins/:adminId', roleMiddleware(['SUPER_ADMIN']), validateUpdateAdmin, auditMiddleware('HR_ADMIN_UPDATED'), AdminController.updateHRAdmin);
router.delete('/hr-admins/:adminId', roleMiddleware(['SUPER_ADMIN']), auditMiddleware('HR_ADMIN_DELETED'), AdminController.deleteHRAdmin);
router.put('/hr-admins/:adminId/deactivate', roleMiddleware(['SUPER_ADMIN']), auditMiddleware('HR_ADMIN_DEACTIVATED'), AdminController.deactivateHRAdmin);
router.put('/hr-admins/:adminId/activate', roleMiddleware(['SUPER_ADMIN']), auditMiddleware('HR_ADMIN_ACTIVATED'), AdminController.activateHRAdmin);

// Loan Committee Admin Management
router.post('/loan-committee-admins', roleMiddleware(['SUPER_ADMIN']), validateCreateLoanCommitteeAdmin, auditMiddleware('LOAN_COMMITTEE_ADMIN_CREATED'), AdminController.createLoanCommitteeAdmin);
router.get('/loan-committee-admins', roleMiddleware(['SUPER_ADMIN']), AdminController.getLoanCommitteeAdmins);
router.put('/loan-committee-admins/:adminId', roleMiddleware(['SUPER_ADMIN']), validateUpdateAdmin, auditMiddleware('LOAN_COMMITTEE_ADMIN_UPDATED'), AdminController.updateLoanCommitteeAdmin);
router.delete('/loan-committee-admins/:adminId', roleMiddleware(['SUPER_ADMIN']), auditMiddleware('LOAN_COMMITTEE_ADMIN_DELETED'), AdminController.deleteLoanCommitteeAdmin);
router.put('/loan-committee-admins/:adminId/deactivate', roleMiddleware(['SUPER_ADMIN']), auditMiddleware('LOAN_COMMITTEE_ADMIN_DEACTIVATED'), AdminController.deactivateLoanCommitteeAdmin);
router.put('/loan-committee-admins/:adminId/activate', roleMiddleware(['SUPER_ADMIN']), auditMiddleware('LOAN_COMMITTEE_ADMIN_ACTIVATED'), AdminController.activateLoanCommitteeAdmin);

// System Management
router.get('/system/health', roleMiddleware(['SUPER_ADMIN']), AdminController.getSystemHealth);
router.get('/system/logs', roleMiddleware(['SUPER_ADMIN']), AdminController.getSystemLogs);
router.post('/system/maintenance', roleMiddleware(['SUPER_ADMIN']), auditMiddleware('MAINTENANCE_MODE_TOGGLE'), AdminController.toggleMaintenanceMode);

module.exports = router;
