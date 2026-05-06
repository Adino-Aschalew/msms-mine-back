const express = require('express');
const router = express.Router();
const SettingsController = require('../controllers/settings.controller');
const { authenticateToken } = require('../middleware/auth');
const { roleMiddleware } = require('../middleware/role.middleware');

// User Preferences Routes
router.get('/user/:category', authenticateToken, SettingsController.getUserPreferences);
router.put('/user/:category', authenticateToken, SettingsController.updateUserPreferences);
router.get('/user/all', authenticateToken, SettingsController.getAllUserPreferences);

// Security Routes
router.post('/change-password', authenticateToken, SettingsController.changePassword);
router.get('/login-attempts', authenticateToken, SettingsController.getLoginAttempts);

// System Settings Routes (Admin/HR only)
router.get('/system/:category', authenticateToken, roleMiddleware(['ADMIN', 'HR']), SettingsController.getSystemSettings);
router.put('/system/:category', authenticateToken, roleMiddleware(['ADMIN', 'HR']), SettingsController.updateSystemSettings);

module.exports = router;
