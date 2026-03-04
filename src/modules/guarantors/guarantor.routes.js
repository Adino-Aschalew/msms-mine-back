const express = require('express');
const GuarantorController = require('./guarantor.controller');
const { authMiddleware, roleMiddleware } = require('../../middleware/auth');
const { auditMiddleware } = require('../../middleware/audit');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// User routes (authenticated users)
router.post('/', auditMiddleware('GUARANTOR_ADDED'), GuarantorController.addGuarantor);
router.get('/', GuarantorController.getGuantors);
router.get('/stats', GuarantorController.getGuarantorStats);

// Individual guarantor routes
router.get('/:guarantorId', GuarantorController.getGuarantorById);
router.put('/:guarantorId/status', auditMiddleware('GUARANTOR_STATUS_UPDATE'), GuarantorController.updateGuarantorStatus);

// Admin/HR routes
router.get('/by-application/:loanApplicationId', roleMiddleware(['ADMIN', 'HR', 'LOAN_COMMITTEE']), GuarantorController.getGuarantors);
router.get('/by-status/:status', roleMiddleware(['ADMIN', 'HR', 'LOAN_COMMITTEE']), GuarantorController.getGuarantors);

// Validation routes
router.post('/validate', GuarantorController.validateGuarantor);

module.exports = router;
