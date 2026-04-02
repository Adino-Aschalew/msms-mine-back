const nodemailer = require('nodemailer');
const { query } = require('../config/database');

class NotificationService {
  static async sendEmail(to, subject, message, options = {}) {
    try {
      
      if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log('Email configuration not found, skipping email send');
        return { success: false, message: 'Email not configured' };
      }

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to,
        subject,
        html: message,
        ...options
      };

      const result = await transporter.sendMail(mailOptions);
      
      
      await this.logNotification('EMAIL', to, subject, message, 'SENT');
      
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Email send error:', error);
      
      
      await this.logNotification('EMAIL', to, subject, message, 'FAILED', error.message);
      
      
      return { success: false, message: `Failed to send email: ${error.message}` };
    }
  }

  static async sendSMS(phoneNumber, message, options = {}) {
    try {
      
      
      
      console.log(`SMS to ${phoneNumber}: ${message}`);
      
      
      await this.logNotification('SMS', phoneNumber, 'SMS Notification', message, 'SENT');
      
      return { success: true, messageId: `sms_${Date.now()}` };
    } catch (error) {
      console.error('SMS send error:', error);
      
      
      await this.logNotification('SMS', phoneNumber, 'SMS Notification', message, 'FAILED', error.message);
      
      throw new Error(`Failed to send SMS: ${error.message}`);
    }
  }

  static async sendPushNotification(userId, title, message, data = {}) {
    try {
      
      
      
      console.log(`Push notification to user ${userId}: ${title} - ${message}`);
      
      
      await this.logNotification('PUSH', userId, title, message, 'SENT', null, data);
      
      return { success: true, messageId: `push_${Date.now()}` };
    } catch (error) {
      console.error('Push notification error:', error);
      
      
      await this.logNotification('PUSH', userId, title, message, 'FAILED', error.message, data);
      
      throw new Error(`Failed to send push notification: ${error.message}`);
    }
  }

  static async createNotification(userId, title, message, type = 'INFO', data = {}) {
    try {
      const insertQuery = `
        INSERT INTO notifications (user_id, title, message, notification_type, reference_id, created_at)
        VALUES (?, ?, ?, ?, ?, NOW())
      `;
      
      const result = await query(insertQuery, [userId, title, message, type, data.employee_id || null]);
      
      return { success: true, notificationId: result.insertId };
    } catch (error) {
      console.error('Create notification error:', error);
      throw new Error(`Failed to create notification: ${error.message}`);
    }
  }

  static async getUserNotifications(userId, page = 1, limit = 10, filters = {}) {
    try {
      const offset = (page - 1) * limit;
      let whereClause = 'WHERE user_id = ?';
      const params = [userId];
      
      if (filters.type) {
        whereClause += ' AND notification_type = ?';
        params.push(filters.type);
      }
      
      if (filters.read !== undefined) {
        whereClause += ' AND is_read = ?';
        params.push(filters.read);
      }
      
      const countQuery = `
        SELECT COUNT(*) as total FROM notifications ${whereClause}
      `;
      
      const selectQuery = `
        SELECT * FROM notifications ${whereClause}
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `;
      
      const [countResult, notifications] = await Promise.all([
        query(countQuery, params),
        query(selectQuery, [...params, limit, offset])
      ]);
      
      return {
        notifications,
        pagination: {
          page,
          limit,
          total: countResult[0].total,
          pages: Math.ceil(countResult[0].total / limit)
        }
      };
    } catch (error) {
      console.error('Get user notifications error:', error);
      throw new Error(`Failed to fetch notifications: ${error.message}`);
    }
  }

  static async markNotificationAsRead(notificationId, userId) {
    try {
      const updateQuery = `
        UPDATE notifications 
        SET is_read = true, read_at = NOW()
        WHERE id = ? AND user_id = ?
      `;
      
      const result = await query(updateQuery, [notificationId, userId]);
      
      if (result.affectedRows === 0) {
        throw new Error('Notification not found or access denied');
      }
      
      return { success: true, message: 'Notification marked as read' };
    } catch (error) {
      console.error('Mark notification as read error:', error);
      throw new Error(`Failed to mark notification as read: ${error.message}`);
    }
  }

  static async markAllNotificationsAsRead(userId) {
    try {
      const updateQuery = `
        UPDATE notifications 
        SET is_read = true, read_at = NOW()
        WHERE user_id = ? AND is_read = false
      `;
      
      const result = await query(updateQuery, [userId]);
      
      return { 
        success: true, 
        message: `Marked ${result.affectedRows} notifications as read` 
      };
    } catch (error) {
      console.error('Mark all notifications as read error:', error);
      throw new Error(`Failed to mark notifications as read: ${error.message}`);
    }
  }

  static async deleteNotification(notificationId, userId) {
    try {
      const deleteQuery = 'DELETE FROM notifications WHERE id = ? AND user_id = ?';
      const result = await query(deleteQuery, [notificationId, userId]);
      
      if (result.affectedRows === 0) {
        throw new Error('Notification not found or access denied');
      }
      
      return { success: true, message: 'Notification deleted' };
    } catch (error) {
      console.error('Delete notification error:', error);
      throw new Error(`Failed to delete notification: ${error.message}`);
    }
  }

  static async getUnreadCount(userId) {
    try {
      const countQuery = `
        SELECT COUNT(*) as count 
        FROM notifications 
        WHERE user_id = ? AND is_read = false
      `;
      
      const result = await query(countQuery, [userId]);
      
      return { unreadCount: result[0].count };
    } catch (error) {
      console.error('Get unread count error:', error);
      throw new Error(`Failed to get unread count: ${error.message}`);
    }
  }

  static async logNotification(type, recipient, title, message, status, error = null, data = {}) {
    try {
      const insertQuery = `
        INSERT INTO notification_logs (notification_type, recipient, title, message, status, error_message, data, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      `;
      
      await query(insertQuery, [
        type,
        recipient,
        title,
        message,
        status,
        error,
        JSON.stringify(data)
      ]);
    } catch (logError) {
      console.error('Failed to log notification:', logError);
    }
  }

  static async sendWelcomeEmail(userId, email, firstName) {
    const subject = 'Welcome to Microfinance System';
    const message = `
      <h2>Welcome, ${firstName}!</h2>
      <p>Thank you for joining our Microfinance System. Your account has been successfully created.</p>
      <p>You can now:</p>
      <ul>
        <li>Apply for savings accounts</li>
        <li>Request loans</li>
        <li>Manage your profile</li>
        <li>View your transaction history</li>
      </ul>
      <p>If you have any questions, please don't hesitate to contact our support team.</p>
      <p>Best regards,<br>Microfinance System Team</p>
    `;
    
    await this.createNotification(userId, subject, 'Welcome to the system!', 'INFO');
    return await this.sendEmail(email, subject, message);
  }

  static async sendLoanStatusNotification(userId, loanApplicationId, status) {
    const subject = `Loan Application ${status}`;
    const message = `Your loan application #${loanApplicationId} has been ${status}. Please check your account for more details.`;
    
    await this.createNotification(userId, subject, message, status === 'APPROVED' ? 'SUCCESS' : 'INFO');
    
    if (user && user[0]) {
      const emailMessage = `
        <h2>Loan Application ${status}</h2>
        <p>Dear ${user[0].first_name || 'Valued Customer'},</p>
        <p>Your loan application #${loanApplicationId} has been ${status}.</p>
        <p>Please log in to your account to view more details and next steps.</p>
        <p>Best regards,<br>Microfinance System Team</p>
      `;
      
      await this.sendEmail(user[0].email, subject, emailMessage);
    }
  }

  static async sendSavingsStatusNotification(userId, requestId, status, newValue, comments) {
    const subject = `Savings Change Request ${status}`;
    const valueDisplay = newValue + '%';
    const message = status === 'APPROVED' 
      ? `Your request to change savings percentage to ${valueDisplay} has been approved.`
      : `Your request to change savings percentage to ${valueDisplay} was rejected. Reason: ${comments || 'No reason provided'}`;
    
    await this.createNotification(userId, subject, message, status === 'APPROVED' ? 'SUCCESS' : 'DANGER');
    
    
    const userQuery = 'SELECT email, first_name FROM users u LEFT JOIN employee_profiles ep ON u.id = ep.user_id WHERE u.id = ?';
    const userArr = await query(userQuery, [userId]);
    const user = userArr[0];
    
    if (user && user.email) {
      const emailTitle = status === 'APPROVED' ? 'Approved' : 'Rejected';
      const emailMessage = `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: ${status === 'APPROVED' ? '#10b981' : '#f43f5e'};">Savings Request ${emailTitle}</h2>
          <p>Dear ${user.first_name || 'Employee'},</p>
          <p>Your request (ID: #${requestId}) to update your monthly savings contribution to <strong>${valueDisplay}</strong> has been <strong>${status.toLowerCase()}</strong>.</p>
          ${status === 'REJECTED' ? `<p><strong>Reason:</strong> ${comments || 'No specific reason provided.'}</p>` : ''}
          ${status === 'APPROVED' ? `<p>This change will be effective from the next payroll cycle.</p>` : ''}
          <p>You can view the full details on your savings dashboard.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #666;">This is an automated notification from the Microfinance System. Please do not reply to this email.</p>
        </div>
      `;
      
      await this.sendEmail(user.email, subject, emailMessage);
    }
  }
}

module.exports = NotificationService;
