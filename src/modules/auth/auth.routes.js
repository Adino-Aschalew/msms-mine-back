const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
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

const profilePicStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../../uploads/profile-pictures');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `profile-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const profilePicFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, GIF, and WebP images are allowed'), false);
  }
};

const profilePicUpload = multer({
  storage: profilePicStorage,
  fileFilter: profilePicFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

router.post('/login', validateLogin, auditMiddleware('LOGIN_ATTEMPT'), AuthController.login);
router.post('/refresh-token', validateRefreshToken, AuthController.refreshToken);
router.post('/change-password', authMiddleware, validateChangePassword, auditMiddleware('PASSWORD_CHANGE'), AuthController.changePassword);
router.post('/force-change-password', authMiddleware, auditMiddleware('PASSWORD_CHANGE'), AuthController.forceChangePassword);
router.post('/forgot-password', validateForgotPassword, auditMiddleware('PASSWORD_RESET_REQUEST'), AuthController.forgotPassword);
router.post('/reset-password', validateResetPassword, auditMiddleware('PASSWORD_RESET'), AuthController.resetPassword);
router.get('/profile', authMiddleware, AuthController.getProfile);
router.put('/profile', authMiddleware, validateUpdateProfile, auditMiddleware('PROFILE_UPDATE', 'employee_profiles'), AuthController.updateProfile);
router.post('/profile-picture', authMiddleware, profilePicUpload.single('profile_picture'), AuthController.uploadProfilePicture);
router.post('/request-otp', authMiddleware, AuthController.requestOTP);
router.post('/verify-otp', authMiddleware, AuthController.verifyOTP);
router.get('/activity', authMiddleware, AuthController.getActivityLog);

module.exports = router;
