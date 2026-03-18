const express = require('express');
const LoanController = require('./loan.controller');
const { authMiddleware, roleMiddleware } = require('../../middleware/auth');
const { auditMiddleware } = require('../../middleware/audit');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// User routes (authenticated users)
router.get('/dashboard', LoanController.getEmployeeDashboard);
router.post('/apply', auditMiddleware('LOAN_APPLICATION_CREATED'), LoanController.applyForLoan);
router.get('/my-applications', LoanController.getUserLoanApplications);
router.get('/my-loans', LoanController.getUserLoans);
router.get('/my-loans/:loanId', LoanController.getUserLoanById);
router.get('/check-eligibility', LoanController.checkEligibility);
router.get('/eligibility-score', LoanController.getEligibilityScore);
router.get('/calculate-schedule', LoanController.calculateLoanSchedule);

// Admin routes (all loans)
router.get('/', roleMiddleware(['ADMIN', 'LOAN_COMMITTEE', 'SUPER_ADMIN']), LoanController.getAllLoans);

// Individual loan routes (loan owner or admin)
router.get('/:loanId', roleMiddleware(['ADMIN', 'LOAN_COMMITTEE', 'SUPER_ADMIN', 'EMPLOYEE']), LoanController.getLoanById);
router.get('/:loanId/transactions', LoanController.getLoanTransactions);
router.post('/:loanId/pay', auditMiddleware('LOAN_PAYMENT'), LoanController.makeLoanPayment);

// Admin/HR/Loan Committee routes
router.get('/applications', roleMiddleware(['ADMIN', 'HR', 'LOAN_COMMITTEE']), LoanController.getLoanApplications);
router.get('/applications/:applicationId', roleMiddleware(['ADMIN', 'HR', 'LOAN_COMMITTEE']), LoanController.getLoanApplicationById);
router.put('/applications/:applicationId/review', roleMiddleware(['ADMIN', 'LOAN_COMMITTEE']), auditMiddleware('LOAN_APPLICATION_REVIEWED'), LoanController.reviewLoanApplication);

// Admin/Finance routes
router.get('/', roleMiddleware(['ADMIN', 'FINANCE']), LoanController.getLoans);
router.get('/stats', roleMiddleware(['ADMIN', 'FINANCE']), LoanController.getLoanStats);
router.get('/overdue', roleMiddleware(['ADMIN', 'FINANCE']), LoanController.getOverdueLoans);
router.get('/portfolio', roleMiddleware(['ADMIN', 'FINANCE']), LoanController.getLoanPortfolio);
router.put('/:loanId/disburse', roleMiddleware(['ADMIN', 'FINANCE']), auditMiddleware('LOAN_DISBURSED'), LoanController.disburseLoan);
router.put('/:loanId/status', roleMiddleware(['ADMIN', 'FINANCE']), auditMiddleware('LOAN_STATUS_UPDATE'), LoanController.updateLoanStatus);

module.exports = router;
