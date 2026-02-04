const express = require('express');
const EmployeeController = require('../controllers/employeeController');
const { authMiddleware, roleCheck, selfOrRoleCheck } = require('../middleware/auth');
const { auditMiddleware } = require('../middleware/audit');

const router = express.Router();

router.post('/verify', authMiddleware, auditMiddleware('HR_VERIFICATION'), EmployeeController.verifyEmployee);
router.get('/profile', authMiddleware, EmployeeController.getProfile);
router.put('/profile', authMiddleware, auditMiddleware('PROFILE_UPDATE', 'employee_profiles'), EmployeeController.updateProfile);

router.get('/all', authMiddleware, roleCheck(['SUPER_ADMIN', 'LOAN_COMMITTEE', 'FINANCE_ADMIN']), EmployeeController.getAllEmployees);
router.get('/unverified', authMiddleware, roleCheck(['SUPER_ADMIN', 'LOAN_COMMITTEE']), EmployeeController.getUnverifiedEmployees);
router.post('/bulk-verify', authMiddleware, roleCheck(['SUPER_ADMIN', 'LOAN_COMMITTEE']), auditMiddleware('BULK_HR_VERIFICATION', 'employee_profiles'), EmployeeController.bulkVerifyEmployees);
router.put('/:userId/status', authMiddleware, roleCheck(['SUPER_ADMIN']), auditMiddleware('EMPLOYMENT_STATUS_UPDATE', 'employee_profiles'), EmployeeController.updateEmployeeStatus);
router.get('/stats', authMiddleware, roleCheck(['SUPER_ADMIN', 'LOAN_COMMITTEE', 'FINANCE_ADMIN']), EmployeeController.getEmployeeStats);

module.exports = router;
