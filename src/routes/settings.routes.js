const express = require('express');
const router = express.Router();
const SettingsController = require('../controllers/settings.controller');
const { authMiddleware } = require('../middleware/auth');
const { roleMiddleware } = require('../middleware/role.middleware');

// User Preferences Routes
router.get('/user/:category', authMiddleware, SettingsController.getUserPreferences);
router.put('/user/:category', authMiddleware, SettingsController.updateUserPreferences);
router.get('/user/all', authMiddleware, SettingsController.getAllUserPreferences);

// Security Routes
router.post('/change-password', authMiddleware, SettingsController.changePassword);
router.get('/login-attempts', authMiddleware, SettingsController.getLoginAttempts);

// System Settings Routes (Admin/HR only)
router.get('/system/:category', authMiddleware, roleMiddleware(['ADMIN', 'HR']), SettingsController.getSystemSettings);
router.put('/system/:category', authMiddleware, roleMiddleware(['ADMIN', 'HR']), SettingsController.updateSystemSettings);

module.exports = router;
