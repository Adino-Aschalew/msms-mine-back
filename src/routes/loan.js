const express = require('express');
const LoanController = require('../controllers/loanController');
const { authMiddleware, roleCheck, selfOrRoleCheck } = require('../middleware/auth');
const { auditMiddleware } = require('../middleware/audit');

const router = express.Router();

router.get('/eligibility', authMiddleware, LoanController.checkEligibility);
router.post('/application', authMiddleware, auditMiddleware('LOAN_APPLICATION_CREATE', 'loan_applications'), LoanController.createApplication);
router.get('/applications', authMiddleware, LoanController.getApplications);
router.get('/application/:applicationId', authMiddleware, LoanController.getApplication);

router.get('/all-applications', authMiddleware, roleCheck(['SUPER_ADMIN', 'LOAN_COMMITTEE']), LoanController.getAllApplications);
router.put('/application/:applicationId/review', authMiddleware, roleCheck(['SUPER_ADMIN', 'LOAN_COMMITTEE']), auditMiddleware('LOAN_APPLICATION_REVIEW', 'loan_applications'), LoanController.reviewApplication);

router.get('/active', authMiddleware, roleCheck(['SUPER_ADMIN', 'LOAN_COMMITTEE', 'FINANCE_ADMIN']), LoanController.getActiveLoans);
router.get('/loan/:loanId', authMiddleware, LoanController.getLoan);
router.post('/loan/:loanId/repayment', authMiddleware, auditMiddleware('LOAN_REPAYMENT', 'loan_repayments'), LoanController.makeRepayment);
router.get('/loan/:loanId/repayments', authMiddleware, LoanController.getLoanRepayments);

router.get('/stats', authMiddleware, roleCheck(['SUPER_ADMIN', 'LOAN_COMMITTEE', 'FINANCE_ADMIN']), LoanController.getLoanStats);
router.post('/check-defaults', authMiddleware, roleCheck(['SUPER_ADMIN', 'FINANCE_ADMIN']), auditMiddleware('LOAN_DEFAULT_CHECK', 'penalties'), LoanController.checkLoanDefaults);

module.exports = router;
