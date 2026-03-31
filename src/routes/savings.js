const express = require('express');
const SavingsController = require('../controllers/savingsController');
const { authMiddleware, roleCheck, selfOrRoleCheck } = require('../middleware/auth');
const { auditMiddleware } = require('../middleware/audit');

const router = express.Router();

router.post('/account', authMiddleware, auditMiddleware('SAVINGS_ACCOUNT_CREATE', 'savings_accounts'), SavingsController.createAccount);
router.get('/account', authMiddleware, SavingsController.getAccount);
router.put('/account/percentage', authMiddleware, auditMiddleware('SAVING_PERCENTAGE_REQUEST_CREATE', 'savings_update_requests'), SavingsController.updateSavingPercentage);
router.get('/requests', authMiddleware, roleCheck(['SUPER_ADMIN', 'FINANCE_ADMIN']), SavingsController.getSavingsRequests);
router.put('/requests/:requestId/handle', authMiddleware, roleCheck(['SUPER_ADMIN', 'FINANCE_ADMIN']), auditMiddleware('SAVING_PERCENTAGE_REQUEST_HANDLE', 'savings_update_requests'), SavingsController.handleSavingsRequest);
router.get('/transactions', authMiddleware, SavingsController.getTransactions);
router.post('/contribute', authMiddleware, auditMiddleware('SAVINGS_CONTRIBUTION', 'savings_transactions'), SavingsController.addContribution);
router.post('/withdraw', authMiddleware, auditMiddleware('SAVINGS_WITHDRAWAL', 'savings_transactions'), SavingsController.withdrawSavings);

router.get('/all', authMiddleware, roleCheck(['SUPER_ADMIN', 'FINANCE_ADMIN', 'LOAN_COMMITTEE']), SavingsController.getAllAccounts);
router.get('/stats', authMiddleware, roleCheck(['SUPER_ADMIN', 'FINANCE_ADMIN', 'LOAN_COMMITTEE']), SavingsController.getSavingsStats);
router.put('/:userId/freeze', authMiddleware, roleCheck(['SUPER_ADMIN']), auditMiddleware('SAVINGS_ACCOUNT_FREEZE', 'savings_accounts'), SavingsController.freezeAccount);
router.post('/process-interest', authMiddleware, roleCheck(['SUPER_ADMIN', 'FINANCE_ADMIN']), auditMiddleware('MONTHLY_INTEREST_PROCESS', 'savings_transactions'), SavingsController.processMonthlyInterest);
router.post('/check-missed', authMiddleware, roleCheck(['SUPER_ADMIN', 'FINANCE_ADMIN']), auditMiddleware('MISSED_SAVINGS_CHECK', 'penalties'), SavingsController.checkMissedSavings);

module.exports = router;
