const express = require('express');
const OTPController = require('../controllers/otp.controller');

const router = express.Router();

/**
 * OTP Routes - Secure Email Verification System
 * 
 * These routes handle OTP generation, verification, and management
 * with built-in rate limiting and security measures.
 */

// Send OTP to user email
// POST /api/otp/send
// Body: { email, userId }
router.post('/send', OTPController.sendOTP);

// Verify OTP code
// POST /api/otp/verify
// Body: { email, otp }
router.post('/verify', OTPController.verifyOTP);

// Resend OTP (with stricter rate limiting)
// POST /api/otp/resend
// Body: { email, userId }
router.post('/resend', OTPController.resendOTP);

// Check OTP status (for frontend polling)
// GET /api/otp/status/:email
router.get('/status/:email', OTPController.checkOTPStatus);

// Cleanup expired OTPs (admin/maintenance)
// DELETE /api/otp/cleanup
// Note: Add auth middleware for production
router.delete('/cleanup', OTPController.cleanupExpiredOTPs);

module.exports = router;
