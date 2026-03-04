const express = require('express');
const HrController = require('./hr.controller');
const { authMiddleware, roleMiddleware } = require('../../middleware/auth');
const { auditMiddleware } = require('../../middleware/audit');

const router = express.Router();

// Apply authentication and role middleware
router.use(authMiddleware);
router.use(roleMiddleware(['SUPER_ADMIN', 'ADMIN', 'HR']));

// Employee management routes
router.get('/employees', HrController.getEmployees);
router.get('/employees/stats', HrController.getEmployeeStats);
router.get('/employees/departments', HrController.getDepartments);
router.get('/employees/job-grades', HrController.getJobGrades);

// Individual employee routes
router.get('/employees/:userId', HrController.getEmployeeById);
router.put('/employees/:userId/profile', HrController.updateEmployeeProfile);
router.put('/employees/:userId/verify', auditMiddleware('EMPLOYEE_VERIFIED'), HrController.verifyEmployee);
router.put('/employees/:userId/status', auditMiddleware('EMPLOYMENT_STATUS_UPDATE'), HrController.updateEmploymentStatus);

// Bulk operations
router.post('/employees/bulk-verify', auditMiddleware('BULK_EMPLOYEE_VERIFICATION'), HrController.bulkVerifyEmployees);

// Create new employee
router.post('/employees', auditMiddleware('EMPLOYEE_CREATED'), HrController.createEmployee);

module.exports = router;
