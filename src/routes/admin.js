const express = require('express');
const AdminController = require('../controllers/adminController');
const { authMiddleware, roleCheck } = require('../middleware/auth');
const { auditMiddleware } = require('../middleware/audit');

const router = express.Router();

router.get('/config', authMiddleware, roleCheck(['SUPER_ADMIN']), AdminController.getSystemConfiguration);
router.put('/config', authMiddleware, roleCheck(['SUPER_ADMIN']), auditMiddleware('SYSTEM_CONFIG_UPDATE', 'system_configuration'), AdminController.updateSystemConfiguration);

router.get('/audit-logs', authMiddleware, roleCheck(['SUPER_ADMIN']), AdminController.getAuditLogs);
router.get('/health', authMiddleware, roleCheck(['SUPER_ADMIN']), AdminController.getSystemHealth);
router.get('/compliance', authMiddleware, roleCheck(['SUPER_ADMIN']), AdminController.getComplianceReport);
router.get('/stats', authMiddleware, roleCheck(['SUPER_ADMIN', 'LOAN_COMMITTEE', 'FINANCE_ADMIN']), AdminController.getSystemStats);

module.exports = router;
