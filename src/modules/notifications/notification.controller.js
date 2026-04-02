const NotificationService = require('../../services/notification.service');

class NotificationController {
  
  static async getUserNotifications(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10, type, read } = req.query;
      
      const filters = {};
      if (type) filters.type = type;
      if (read !== undefined) filters.read = read === 'true';

      const result = await NotificationService.getUserNotifications(
        userId,
        parseInt(page),
        parseInt(limit),
        filters
      );

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error in getUserNotifications', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch notifications',
        error: error.message
      });
    }
  }

  
  static async markAsRead(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const result = await NotificationService.markNotificationAsRead(id, userId);

      res.status(200).json(result);
    } catch (error) {
      console.error('Error in markAsRead', error);
      res.status(400).json({
        success: false,
        message: 'Failed to mark notification as read',
        error: error.message
      });
    }
  }

  
  static async markAllAsRead(req, res) {
    try {
      const userId = req.user.id;

      const result = await NotificationService.markAllNotificationsAsRead(userId);

      res.status(200).json(result);
    } catch (error) {
      console.error('Error in markAllAsRead', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark notifications as read',
        error: error.message
      });
    }
  }

  
  static async getUnreadCount(req, res) {
    try {
      const userId = req.user.id;

      const result = await NotificationService.getUnreadCount(userId);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error in getUnreadCount', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get unread count',
        error: error.message
      });
    }
  }

  
  static async deleteNotification(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const result = await NotificationService.deleteNotification(id, userId);

      res.status(200).json(result);
    } catch (error) {
      console.error('Error in deleteNotification', error);
      res.status(400).json({
        success: false,
        message: 'Failed to delete notification',
        error: error.message
      });
    }
  }
}

module.exports = NotificationController;
