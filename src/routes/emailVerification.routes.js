const express = require('express');
const EmailVerificationController = require('../controllers/emailVerification.controller');

const router = express.Router();

// Email verification routes don't require authentication tokens
// since they're used during the initial login process

// Send verification code
router.post('/send', EmailVerificationController.sendVerificationCode);

// Verify code
router.post('/verify', EmailVerificationController.verifyCode);

// Resend verification code
router.post('/resend', EmailVerificationController.resendVerificationCode);

// Check verification status
router.get('/status/:email', EmailVerificationController.checkVerificationStatus);

module.exports = router;
