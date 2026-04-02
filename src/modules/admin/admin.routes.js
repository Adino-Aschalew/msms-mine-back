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


router.use(authMiddleware);


router.get('/dashboard', roleMiddleware(['SUPER_ADMIN', 'ADMIN']), AdminController.getDashboard);
router.get('/stats', roleMiddleware(['SUPER_ADMIN', 'ADMIN']), AdminController.getSystemStats);
router.get('/admins', roleMiddleware(['SUPER_ADMIN', 'ADMIN']), AdminController.getAllAdmins);
router.get('/activity', roleMiddleware(['SUPER_ADMIN', 'ADMIN']), AdminController.getSystemActivity);
router.get('/statistics', roleMiddleware(['SUPER_ADMIN', 'ADMIN']), AdminController.getAdminStatistics);


router.put('/admins/:adminId', roleMiddleware(['SUPER_ADMIN', 'ADMIN']), AdminController.updateAdmin);
router.put('/admins/:adminId/status', roleMiddleware(['SUPER_ADMIN', 'ADMIN']), AdminController.toggleAdminStatus);
router.delete('/admins/:adminId', roleMiddleware(['SUPER_ADMIN', 'ADMIN']), AdminController.deleteAdmin);


router.post('/hr-admins', roleMiddleware(['SUPER_ADMIN', 'ADMIN']), validateCreateHRAdmin, auditMiddleware('HR_ADMIN_CREATED'), AdminController.createHRAdmin);
router.get('/hr-admins', roleMiddleware(['SUPER_ADMIN', 'ADMIN']), AdminController.getHRAdmins);
router.put('/hr-admins/:adminId', roleMiddleware(['SUPER_ADMIN', 'ADMIN']), validateUpdateAdmin, auditMiddleware('HR_ADMIN_UPDATED'), AdminController.updateHRAdmin);
router.delete('/hr-admins/:adminId', roleMiddleware(['SUPER_ADMIN', 'ADMIN']), auditMiddleware('HR_ADMIN_DELETED'), AdminController.deleteHRAdmin);
router.put('/hr-admins/:adminId/deactivate', roleMiddleware(['SUPER_ADMIN', 'ADMIN']), auditMiddleware('HR_ADMIN_DEACTIVATED'), AdminController.deactivateHRAdmin);
router.put('/hr-admins/:adminId/activate', roleMiddleware(['SUPER_ADMIN', 'ADMIN']), auditMiddleware('HR_ADMIN_ACTIVATED'), AdminController.activateHRAdmin);


router.post('/loan-committee-admins', roleMiddleware(['SUPER_ADMIN', 'ADMIN']), validateCreateLoanCommitteeAdmin, auditMiddleware('LOAN_COMMITTEE_ADMIN_CREATED'), AdminController.createLoanCommitteeAdmin);
router.get('/loan-committee-admins', roleMiddleware(['SUPER_ADMIN', 'ADMIN']), AdminController.getLoanCommitteeAdmins);
router.put('/loan-committee-admins/:adminId', roleMiddleware(['SUPER_ADMIN', 'ADMIN']), validateUpdateAdmin, auditMiddleware('LOAN_COMMITTEE_ADMIN_UPDATED'), AdminController.updateLoanCommitteeAdmin);
router.delete('/loan-committee-admins/:adminId', roleMiddleware(['SUPER_ADMIN', 'ADMIN']), auditMiddleware('LOAN_COMMITTEE_ADMIN_DELETED'), AdminController.deleteLoanCommitteeAdmin);
router.put('/loan-committee-admins/:adminId/deactivate', roleMiddleware(['SUPER_ADMIN', 'ADMIN']), auditMiddleware('LOAN_COMMITTEE_ADMIN_DEACTIVATED'), AdminController.deactivateLoanCommitteeAdmin);
router.put('/loan-committee-admins/:adminId/activate', roleMiddleware(['SUPER_ADMIN', 'ADMIN']), auditMiddleware('LOAN_COMMITTEE_ADMIN_ACTIVATED'), AdminController.activateLoanCommitteeAdmin);


router.post('/finance-admins', roleMiddleware(['SUPER_ADMIN', 'ADMIN']), validateCreateFinanceAdmin, auditMiddleware('FINANCE_ADMIN_CREATED'), AdminController.createFinanceAdmin);
router.get('/finance-admins', roleMiddleware(['SUPER_ADMIN', 'ADMIN']), AdminController.getFinanceAdmins);
router.put('/finance-admins/:adminId', roleMiddleware(['SUPER_ADMIN', 'ADMIN']), validateUpdateAdmin, auditMiddleware('FINANCE_ADMIN_UPDATED'), AdminController.updateFinanceAdmin);
router.delete('/finance-admins/:adminId', roleMiddleware(['SUPER_ADMIN', 'ADMIN']), auditMiddleware('FINANCE_ADMIN_DELETED'), AdminController.deleteFinanceAdmin);
router.put('/finance-admins/:adminId/deactivate', roleMiddleware(['SUPER_ADMIN', 'ADMIN']), auditMiddleware('FINANCE_ADMIN_DEACTIVATED'), AdminController.deactivateFinanceAdmin);
router.put('/finance-admins/:adminId/activate', roleMiddleware(['SUPER_ADMIN', 'ADMIN']), auditMiddleware('FINANCE_ADMIN_ACTIVATED'), AdminController.activateFinanceAdmin);


router.post('/regular-admins', roleMiddleware(['SUPER_ADMIN', 'ADMIN']), validateCreateRegularAdmin, auditMiddleware('REGULAR_ADMIN_CREATED'), AdminController.createAdmin);
router.get('/regular-admins', roleMiddleware(['SUPER_ADMIN', 'ADMIN']), AdminController.getRegularAdmins);
router.put('/regular-admins/:adminId', roleMiddleware(['SUPER_ADMIN', 'ADMIN']), validateUpdateAdmin, auditMiddleware('REGULAR_ADMIN_UPDATED'), AdminController.updateRegularAdmin);
router.delete('/regular-admins/:adminId', roleMiddleware(['SUPER_ADMIN', 'ADMIN']), auditMiddleware('REGULAR_ADMIN_DELETED'), AdminController.deleteRegularAdmin);
router.put('/regular-admins/:adminId/deactivate', roleMiddleware(['SUPER_ADMIN', 'ADMIN']), auditMiddleware('REGULAR_ADMIN_DEACTIVATED'), AdminController.deactivateRegularAdmin);
router.put('/regular-admins/:adminId/activate', roleMiddleware(['SUPER_ADMIN', 'ADMIN']), auditMiddleware('REGULAR_ADMIN_ACTIVATED'), AdminController.activateRegularAdmin);


router.get('/system/health', roleMiddleware(['SUPER_ADMIN', 'ADMIN']), AdminController.getSystemHealth);
router.get('/system/logs', roleMiddleware(['SUPER_ADMIN', 'ADMIN']), AdminController.getSystemLogs);
router.post('/system/maintenance', roleMiddleware(['SUPER_ADMIN', 'ADMIN']), auditMiddleware('MAINTENANCE_MODE_TOGGLE'), AdminController.toggleMaintenanceMode);

module.exports = router;
