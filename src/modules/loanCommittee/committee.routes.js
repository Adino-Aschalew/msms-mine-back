const express = require('express');
const CommitteeController = require('./committee.controller');
const { authMiddleware, roleMiddleware } = require('../../middleware/auth');
const { auditMiddleware } = require('../../middleware/audit');

const router = express.Router();


router.use(authMiddleware);
router.use(roleMiddleware(['ADMIN', 'LOAN_COMMITTEE']));


router.get('/applications/pending', CommitteeController.getPendingApplications);
router.get('/applications/approved', CommitteeController.getApprovedApplications);
router.get('/applications/:applicationId', CommitteeController.getApplicationById);
router.put('/applications/:applicationId/review', auditMiddleware('LOAN_APPLICATION_REVIEWED'), CommitteeController.reviewApplication);
router.post('/applications/:applicationId/disburse', auditMiddleware('LOAN_DISBURSED'), CommitteeController.disburseLoan);
router.post('/applications/bulk-review', auditMiddleware('BULK_APPLICATION_REVIEW'), CommitteeController.bulkReviewApplications);


router.get('/applications/risk-analysis', CommitteeController.getRiskAnalysis);
router.get('/applications/trends', CommitteeController.getApprovalTrends);
router.get('/applications/export', CommitteeController.exportApplications);


router.get('/dashboard', CommitteeController.getDashboardData);
router.get('/reports', CommitteeController.getReportsData);


router.get('/meetings', CommitteeController.getCommitteeMeetings);
router.post('/meetings', auditMiddleware('COMMITTEE_MEETING_CREATED'), CommitteeController.createMeeting);
router.get('/meetings/:meetingId', CommitteeController.getCommitteeMeetings);


router.get('/members', CommitteeController.getCommitteeMembers);
router.get('/profile', CommitteeController.getProfile);
router.put('/profile', auditMiddleware('PROFILE_UPDATED'), CommitteeController.updateProfile);
router.get('/stats', CommitteeController.getCommitteeStats);
router.get('/workload', CommitteeController.getCommitteeWorkload);


router.get('/applications/:applicationId/history', CommitteeController.getApplicationHistory);

module.exports = router;
