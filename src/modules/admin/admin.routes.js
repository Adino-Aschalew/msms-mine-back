const express = require('express');
const AdminController = require('./admin.controller');
const { authMiddleware, roleMiddleware } = require('../../middleware/auth');
const { auditMiddleware } = require('../../middleware/audit');
const {
  validateCreateHRAdmin,
  validateCreateLoanCommitteeAdmin,
  validateCreateFinanceAdmin,
  validateCreateRegularAdmin,
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
router.get('/statistics', roleMiddleware(['SUPER_ADMIN']), AdminController.getAdminStatistics);

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

// Finance Admin Management
router.post('/finance-admins', roleMiddleware(['SUPER_ADMIN']), validateCreateFinanceAdmin, auditMiddleware('FINANCE_ADMIN_CREATED'), AdminController.createFinanceAdmin);
router.get('/finance-admins', roleMiddleware(['SUPER_ADMIN']), AdminController.getFinanceAdmins);
router.put('/finance-admins/:adminId', roleMiddleware(['SUPER_ADMIN']), validateUpdateAdmin, auditMiddleware('FINANCE_ADMIN_UPDATED'), AdminController.updateFinanceAdmin);
router.delete('/finance-admins/:adminId', roleMiddleware(['SUPER_ADMIN']), auditMiddleware('FINANCE_ADMIN_DELETED'), AdminController.deleteFinanceAdmin);
router.put('/finance-admins/:adminId/deactivate', roleMiddleware(['SUPER_ADMIN']), auditMiddleware('FINANCE_ADMIN_DEACTIVATED'), AdminController.deactivateFinanceAdmin);
router.put('/finance-admins/:adminId/activate', roleMiddleware(['SUPER_ADMIN']), auditMiddleware('FINANCE_ADMIN_ACTIVATED'), AdminController.activateFinanceAdmin);

// Regular Admin Management
router.post('/regular-admins', roleMiddleware(['SUPER_ADMIN']), validateCreateRegularAdmin, auditMiddleware('REGULAR_ADMIN_CREATED'), AdminController.createAdmin);
router.get('/regular-admins', roleMiddleware(['SUPER_ADMIN']), AdminController.getRegularAdmins);
router.put('/regular-admins/:adminId', roleMiddleware(['SUPER_ADMIN']), validateUpdateAdmin, auditMiddleware('REGULAR_ADMIN_UPDATED'), AdminController.updateRegularAdmin);
router.delete('/regular-admins/:adminId', roleMiddleware(['SUPER_ADMIN']), auditMiddleware('REGULAR_ADMIN_DELETED'), AdminController.deleteRegularAdmin);
router.put('/regular-admins/:adminId/deactivate', roleMiddleware(['SUPER_ADMIN']), auditMiddleware('REGULAR_ADMIN_DEACTIVATED'), AdminController.deactivateRegularAdmin);
router.put('/regular-admins/:adminId/activate', roleMiddleware(['SUPER_ADMIN']), auditMiddleware('REGULAR_ADMIN_ACTIVATED'), AdminController.activateRegularAdmin);

// System Management
router.get('/system/health', roleMiddleware(['SUPER_ADMIN']), AdminController.getSystemHealth);
router.get('/system/logs', roleMiddleware(['SUPER_ADMIN']), AdminController.getSystemLogs);
router.post('/system/maintenance', roleMiddleware(['SUPER_ADMIN']), auditMiddleware('MAINTENANCE_MODE_TOGGLE'), AdminController.toggleMaintenanceMode);

module.exports = router;
