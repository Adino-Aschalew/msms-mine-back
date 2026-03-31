const express = require('express');
const SavingsController = require('./savings.controller');
const EnterpriseSavingsController = require('./enterprise-savings.controller');
const { authMiddleware, roleMiddleware } = require('../../middleware/auth');
const { auditMiddleware } = require('../../middleware/audit');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// User routes (authenticated users)
router.post('/account', SavingsController.createAccount);
router.get('/account', SavingsController.getAccount);
router.get('/account/summary', SavingsController.getAccountSummary);
router.put('/account/percentage', SavingsController.updateSavingPercentage);
router.get('/transactions', SavingsController.getTransactions);
router.post('/contribute', SavingsController.addContribution);
router.post('/withdraw', SavingsController.withdrawSavings);

// Enterprise Savings Dashboard Routes
router.get('/dashboard', EnterpriseSavingsController.getSavingsDashboard);
router.get('/statistics', EnterpriseSavingsController.getSavingsStatistics);
router.get('/history', EnterpriseSavingsController.getSavingsHistory);
router.get('/constraints', EnterpriseSavingsController.getSavingsConstraints);
router.get('/requests/pending', EnterpriseSavingsController.getPendingRequests);

// Savings Request Management
router.post('/simulate', EnterpriseSavingsController.simulateSavingsChange);
router.post('/requests', EnterpriseSavingsController.submitSavingsRequest);
router.delete('/requests/:requestId', EnterpriseSavingsController.cancelRequest);

// Finance Admin routes for savings requests
router.get('/requests', roleMiddleware(['ADMIN', 'FINANCE_ADMIN']), SavingsController.getSavingsRequests);
router.put('/requests/:requestId/handle', roleMiddleware(['ADMIN', 'FINANCE_ADMIN']), auditMiddleware('SAVING_PERCENTAGE_REQUEST_HANDLE'), SavingsController.handleSavingsRequest);

// Admin/HR routes
router.get('/all', roleMiddleware(['ADMIN', 'HR']), SavingsController.getAllAccounts);
router.get('/stats', roleMiddleware(['ADMIN', 'HR']), SavingsController.getSavingsStats);
router.get('/account/:accountId', roleMiddleware(['ADMIN', 'HR']), SavingsController.getAccountById);
router.get('/account/:accountId/transactions', roleMiddleware(['ADMIN', 'HR']), SavingsController.getAccountTransactions);
router.put('/freeze/:userId', roleMiddleware(['ADMIN', 'HR']), auditMiddleware('SAVINGS_ACCOUNT_FREEZE'), SavingsController.freezeAccount);
router.put('/unfreeze/:userId', roleMiddleware(['ADMIN', 'HR']), auditMiddleware('SAVINGS_ACCOUNT_UNFREEZE'), SavingsController.unfreezeAccount);
router.post('/process-interest', roleMiddleware(['ADMIN']), auditMiddleware('MONTHLY_INTEREST_PROCESS'), SavingsController.processMonthlyInterest);
router.post('/check-missed', roleMiddleware(['ADMIN']), auditMiddleware('MISSED_SAVINGS_CHECK'), SavingsController.checkMissedSavings);

module.exports = router;
