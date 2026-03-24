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
router.post('/employees', HrController.createEmployee);
router.get('/employees/stats', HrController.getEmployeeStats);
router.get('/employees/departments', HrController.getDepartments);
router.get('/employees/job-grades', HrController.getJobGrades);

// Dashboard and analytics routes
router.get('/dashboard-stats', HrController.getDashboardStats);
router.put('/dashboard-stats', auditMiddleware('DASHBOARD_STATS_UPDATED'), HrController.updateDashboardStats);
router.get('/attendance', HrController.getAttendanceData);
router.get('/department-stats', HrController.getDepartmentData);
router.get('/diversity-stats', HrController.getDiversityData);
router.get('/recent-activities', HrController.getRecentActivities);
router.get('/unverified', HrController.getUnverifiedEmployees);
router.post('/sync', HrController.syncWithHRDatabase);

// Individual employee routes
router.get('/employees/:userId', HrController.getEmployeeById);
router.put('/employees/:userId/profile', HrController.updateEmployeeProfile);
router.put('/employees/:userId/verify', auditMiddleware('EMPLOYEE_VERIFIED'), HrController.verifyEmployee);
router.put('/employees/:userId/status', auditMiddleware('EMPLOYMENT_STATUS_UPDATE'), HrController.updateEmploymentStatus);

// Bulk operations
router.post('/employees/bulk-verify', auditMiddleware('BULK_EMPLOYEE_VERIFICATION'), HrController.bulkVerifyEmployees);

// Create new employee
router.post('/employees', auditMiddleware('EMPLOYEE_CREATED'), HrController.createEmployee);

// Performance Management
router.get('/performance-stats', HrController.getPerformanceStats);
router.get('/performance-reviews', HrController.getPerformanceReviews);
router.post('/performance-reviews', auditMiddleware('PERFORMANCE_REVIEW_CREATED'), HrController.createPerformanceReview);

// Reports Management
router.get('/reports', HrController.getReportsData);

// Account Management
router.get('/profile', HrController.getUserProfile);
router.put('/profile', auditMiddleware('PROFILE_UPDATED'), HrController.updateUserProfile);

module.exports = router;
