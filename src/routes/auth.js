const express = require('express');
const AuthController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');
const { auditMiddleware } = require('../middleware/audit');

const router = express.Router();

router.post('/login', auditMiddleware('LOGIN_ATTEMPT'), AuthController.login);
router.post('/register', auditMiddleware('USER_REGISTER'), AuthController.register);
router.post('/refresh-token', AuthController.refreshToken);
router.post('/change-password', authMiddleware, auditMiddleware('PASSWORD_CHANGE'), AuthController.changePassword);
router.get('/profile', authMiddleware, AuthController.getProfile);
router.put('/profile', authMiddleware, auditMiddleware('PROFILE_UPDATE', 'employee_profiles'), AuthController.updateProfile);

module.exports = router;
