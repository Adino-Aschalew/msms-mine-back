const express = require('express');
const DocumentController = require('./document.controller');
const { authMiddleware } = require('../../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/payslip/:detailId', DocumentController.getPayslipPdf);
router.get('/loan-agreement/:loanId', DocumentController.getLoanAgreementPdf);

module.exports = router;
