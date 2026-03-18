const express = require('express');
const NotificationController = require('./notification.controller');
const { authMiddleware } = require('../../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all notification routes
router.use(authMiddleware);

router.get('/', NotificationController.getUserNotifications);
router.get('/unread-count', NotificationController.getUnreadCount);
router.put('/mark-all-read', NotificationController.markAllAsRead);
router.put('/:id/read', NotificationController.markAsRead);
router.delete('/:id', NotificationController.deleteNotification);

module.exports = router;
