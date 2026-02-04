const express = require('express');
const GuarantorController = require('../controllers/guarantorController');
const { authMiddleware, roleCheck, selfOrRoleCheck } = require('../middleware/auth');
const { auditMiddleware } = require('../middleware/audit');

const router = express.Router();

router.post('/application/:applicationId', authMiddleware, auditMiddleware('GUARANTOR_ADD', 'guarantors'), GuarantorController.addGuarantor);
router.get('/application/:applicationId', authMiddleware, GuarantorController.getGuarantors);
router.get('/:guarantorId', authMiddleware, GuarantorController.getGuarantor);
router.put('/:guarantorId', authMiddleware, auditMiddleware('GUARANTOR_UPDATE', 'guarantors'), GuarantorController.updateGuarantor);
router.delete('/:guarantorId', authMiddleware, auditMiddleware('GUARANTOR_DELETE', 'guarantors'), GuarantorController.deleteGuarantor);

router.put('/:guarantorId/approve', authMiddleware, roleCheck(['SUPER_ADMIN', 'LOAN_COMMITTEE']), auditMiddleware('GUARANTOR_APPROVE', 'guarantors'), GuarantorController.approveGuarantor);
router.put('/:guarantorId/reject', authMiddleware, roleCheck(['SUPER_ADMIN', 'LOAN_COMMITTEE']), auditMiddleware('GUARANTOR_REJECT', 'guarantors'), GuarantorController.rejectGuarantor);
router.get('/:guarantorId/validate', authMiddleware, roleCheck(['SUPER_ADMIN', 'LOAN_COMMITTEE']), GuarantorController.validateGuarantor);
router.get('/:guarantorId/exposure', authMiddleware, roleCheck(['SUPER_ADMIN', 'LOAN_COMMITTEE']), GuarantorController.getGuarantorExposure);

router.get('/all/list', authMiddleware, roleCheck(['SUPER_ADMIN', 'LOAN_COMMITTEE']), GuarantorController.getAllGuarantors);
router.get('/stats', authMiddleware, roleCheck(['SUPER_ADMIN', 'LOAN_COMMITTEE']), GuarantorController.getGuarantorStats);

module.exports = router;
