const express = require('express');
const AuthController = require('./auth.controller');
const { authMiddleware } = require('../../middleware/auth');
const { auditMiddleware } = require('../../middleware/audit');
const {
  validateLogin,
  validateChangePassword,
  validateUpdateProfile,
  validateRefreshToken,
  validateForgotPassword,
  validateResetPassword
} = require('./auth.validation');

const router = express.Router();

router.post('/login', validateLogin, auditMiddleware('LOGIN_ATTEMPT'), AuthController.login);
router.post('/refresh-token', validateRefreshToken, AuthController.refreshToken);
router.post('/change-password', authMiddleware, validateChangePassword, auditMiddleware('PASSWORD_CHANGE'), AuthController.changePassword);
router.post('/force-change-password', authMiddleware, auditMiddleware('PASSWORD_CHANGE'), AuthController.forceChangePassword);
router.post('/forgot-password', validateForgotPassword, auditMiddleware('PASSWORD_RESET_REQUEST'), AuthController.forgotPassword);
router.post('/reset-password', validateResetPassword, auditMiddleware('PASSWORD_RESET'), AuthController.resetPassword);
router.get('/profile', authMiddleware, AuthController.getProfile);
router.put('/profile', authMiddleware, validateUpdateProfile, auditMiddleware('PROFILE_UPDATE', 'employee_profiles'), AuthController.updateProfile);

module.exports = router;
