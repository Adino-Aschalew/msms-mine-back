const express = require('express');
const AuthController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');
const { auditMiddleware } = require('../middleware/audit');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Profile picture upload configuration
const profilePicStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/profile-pictures');
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
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

const router = express.Router();

router.post('/login', auditMiddleware('LOGIN_ATTEMPT'), AuthController.login);
router.post('/register', auditMiddleware('USER_REGISTER'), AuthController.register);
router.post('/refresh-token', AuthController.refreshToken);
router.post('/change-password', authMiddleware, auditMiddleware('PASSWORD_CHANGE'), AuthController.changePassword);
router.get('/profile', authMiddleware, AuthController.getProfile);
router.put('/profile', authMiddleware, auditMiddleware('PROFILE_UPDATE', 'employee_profiles'), AuthController.updateProfile);
router.post('/profile-picture', authMiddleware, profilePicUpload.single('profile_picture'), AuthController.uploadProfilePicture);

module.exports = router;
