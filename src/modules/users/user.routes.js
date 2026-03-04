const express = require('express');
const UserController = require('./user.controller');
const { authMiddleware, roleMiddleware } = require('../../middleware/auth');
const { auditMiddleware } = require('../../middleware/audit');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Admin/HR only routes
router.post('/', roleMiddleware(['SUPER_ADMIN', 'ADMIN', 'HR']), auditMiddleware('USER_CREATED'), UserController.createUser);
router.get('/all', roleMiddleware(['SUPER_ADMIN', 'ADMIN', 'HR']), UserController.getAllUsersWithInactive);
router.put('/:userId/deactivate', roleMiddleware(['SUPER_ADMIN', 'ADMIN', 'HR']), auditMiddleware('USER_DEACTIVATED'), UserController.deactivateUser);
router.put('/:userId/activate', roleMiddleware(['SUPER_ADMIN', 'ADMIN', 'HR']), auditMiddleware('USER_ACTIVATED'), UserController.activateUser);
router.delete('/:userId', roleMiddleware(['SUPER_ADMIN', 'ADMIN']), auditMiddleware('USER_DELETED'), UserController.deleteUser);
router.put('/:userId/reset-password', roleMiddleware(['SUPER_ADMIN', 'ADMIN', 'HR']), auditMiddleware('PASSWORD_RESET'), UserController.resetPassword);
router.get('/stats', roleMiddleware(['SUPER_ADMIN', 'ADMIN', 'HR']), UserController.getUserStats);

// General user management routes (Admin/HR)
router.get('/', roleMiddleware(['SUPER_ADMIN', 'ADMIN', 'HR']), UserController.getAllUsers);
router.get('/:userId', roleMiddleware(['SUPER_ADMIN', 'ADMIN', 'HR']), UserController.getUserById);
router.put('/:userId', roleMiddleware(['SUPER_ADMIN', 'ADMIN', 'HR']), auditMiddleware('USER_UPDATED'), UserController.updateUser);
router.put('/:userId/profile', roleMiddleware(['SUPER_ADMIN', 'ADMIN', 'HR']), auditMiddleware('PROFILE_UPDATED'), UserController.updateUserProfile);

// Search users (Admin/HR)
router.get('/search', roleMiddleware(['SUPER_ADMIN', 'ADMIN', 'HR']), UserController.searchUsers);

module.exports = router;
