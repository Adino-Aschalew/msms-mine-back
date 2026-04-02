const express = require('express');
const GuarantorController = require('./guarantor.controller');
const { authMiddleware, roleMiddleware } = require('../../middleware/auth');
const { auditMiddleware } = require('../../middleware/audit');

const router = express.Router();


router.use(authMiddleware);


router.post('/', GuarantorController.addGuarantor);
router.get('/', GuarantorController.getGuarantors);
router.get('/stats', GuarantorController.getGuarantorStats);


router.get('/:guarantorId', GuarantorController.getGuarantorById);
router.put('/:guarantorId/status', GuarantorController.updateGuarantorStatus);


router.get('/by-application/:loanApplicationId', roleMiddleware(['ADMIN', 'HR', 'LOAN_COMMITTEE']), GuarantorController.getGuarantors);
router.get('/by-status/:status', roleMiddleware(['ADMIN', 'HR', 'LOAN_COMMITTEE']), GuarantorController.getGuarantors);


router.post('/validate', GuarantorController.validateGuarantor);

module.exports = router;
