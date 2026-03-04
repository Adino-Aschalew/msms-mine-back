const express = require('express');
const AuthController = require('./auth.controller');
const { authMiddleware } = require('../../middleware/auth');
const { auditMiddleware } = require('../../middleware/audit');
const {
  validateLogin,
  validateRegister,
  validateChangePassword,
  validateUpdateProfile,
  validateRefreshToken
} = require('./auth.validation');

const router = express.Router();

router.post('/login', validateLogin, auditMiddleware('LOGIN_ATTEMPT'), AuthController.login);
router.post('/register', validateRegister, auditMiddleware('USER_REGISTER'), AuthController.register);
router.post('/refresh-token', validateRefreshToken, AuthController.refreshToken);
router.post('/change-password', authMiddleware, validateChangePassword, auditMiddleware('PASSWORD_CHANGE'), AuthController.changePassword);
router.get('/profile', authMiddleware, AuthController.getProfile);
router.put('/profile', authMiddleware, validateUpdateProfile, auditMiddleware('PROFILE_UPDATE', 'employee_profiles'), AuthController.updateProfile);

module.exports = router;
