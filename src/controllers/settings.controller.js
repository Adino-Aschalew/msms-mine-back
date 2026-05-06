const { query } = require('../config/database');
const { auditLog } = require('../middleware/audit');
const bcrypt = require('bcryptjs');

class SettingsController {
  /**
   * Get user preferences by category
   */
  static async getUserPreferences(req, res) {
    try {
      const { category } = req.params;
      const userId = req.user.id;

      const preferences = await query(
        'SELECT settings FROM user_preferences WHERE user_id = ? AND category = ?',
        [userId, category]
      );

      if (preferences.length === 0) {
        // Return default settings if none exist
        const defaultSettings = SettingsController.getDefaultSettings(category);
        return res.json({
          success: true,
          data: defaultSettings,
          isDefault: true
        });
      }

      res.json({
        success: true,
        data: JSON.parse(preferences[0].settings),
        isDefault: false
      });
    } catch (error) {
      console.error('Error getting user preferences:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get preferences'
      });
    }
  }

  /**
   * Update user preferences by category
   */
  static async updateUserPreferences(req, res) {
    try {
      const { category } = req.params;
      const { settings } = req.body;
      const userId = req.user.id;
      const clientIP = req.ip || req.connection.remoteAddress;

      // Validate settings based on category
      const validation = SettingsController.validateSettings(category, settings);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: validation.error
        });
      }

      // Upsert preferences
      await query(
        `INSERT INTO user_preferences (user_id, category, settings) 
         VALUES (?, ?, ?) 
         ON DUPLICATE KEY UPDATE settings = VALUES(settings), updated_at = NOW()`,
        [userId, category, JSON.stringify(settings)]
      );

      // Log the change
      await auditLog(userId, 'SETTINGS_UPDATED', 'user_preferences', null, null, 
        { category, settings: Object.keys(settings) }, clientIP, req.get('User-Agent'));

      res.json({
        success: true,
        message: 'Preferences updated successfully'
      });
    } catch (error) {
      console.error('Error updating user preferences:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update preferences'
      });
    }
  }

  /**
   * Get all user preferences
   */
  static async getAllUserPreferences(req, res) {
    try {
      const userId = req.user.id;

      const preferences = await query(
        'SELECT category, settings FROM user_preferences WHERE user_id = ?',
        [userId]
      );

      const result = {};
      preferences.forEach(pref => {
        result[pref.category] = JSON.parse(pref.settings);
      });

      // Fill in missing categories with defaults
      const categories = ['personal', 'security', 'notifications'];
      categories.forEach(category => {
        if (!result[category]) {
          result[category] = SettingsController.getDefaultSettings(category);
        }
      });

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error getting all user preferences:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get preferences'
      });
    }
  }

  /**
   * Get system settings (admin only)
   */
  static async getSystemSettings(req, res) {
    try {
      const { category } = req.params;

      const settings = await query(
        'SELECT settings FROM system_settings WHERE category = ?',
        [category]
      );

      if (settings.length === 0) {
        const defaultSettings = SettingsController.getDefaultSystemSettings(category);
        return res.json({
          success: true,
          data: defaultSettings,
          isDefault: true
        });
      }

      res.json({
        success: true,
        data: JSON.parse(settings[0].settings),
        isDefault: false
      });
    } catch (error) {
      console.error('Error getting system settings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get system settings'
      });
    }
  }

  /**
   * Update system settings (admin only)
   */
  static async updateSystemSettings(req, res) {
    try {
      const { category } = req.params;
      const { settings } = req.body;
      const userId = req.user.id;
      const clientIP = req.ip || req.connection.remoteAddress;

      // Validate settings
      const validation = SettingsController.validateSystemSettings(category, settings);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: validation.error
        });
      }

      // Upsert system settings
      await query(
        `INSERT INTO system_settings (category, settings, updated_by) 
         VALUES (?, ?, ?) 
         ON DUPLICATE KEY UPDATE settings = VALUES(settings), updated_by = VALUES(updated_by), updated_at = NOW()`,
        [category, JSON.stringify(settings), userId]
      );

      // Log the change
      await auditLog(userId, 'SYSTEM_SETTINGS_UPDATED', 'system_settings', null, null, 
        { category, settings: Object.keys(settings) }, clientIP, req.get('User-Agent'));

      res.json({
        success: true,
        message: 'System settings updated successfully'
      });
    } catch (error) {
      console.error('Error updating system settings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update system settings'
      });
    }
  }

  /**
   * Change password
   */
  static async changePassword(req, res) {
    try {
      const { currentPassword, newPassword, confirmPassword } = req.body;
      const userId = req.user.id;
      const clientIP = req.ip || req.connection.remoteAddress;

      // Validate input
      if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({
          success: false,
          message: 'All password fields are required'
        });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: 'New passwords do not match'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters long'
        });
      }

      // Get current password
      const users = await query(
        'SELECT password FROM users WHERE id = ?',
        [userId]
      );

      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, users[0].password);
      if (!isValidPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update password
      await query(
        'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?',
        [hashedPassword, userId]
      );

      // Log password change
      await auditLog(userId, 'PASSWORD_CHANGED', 'users', userId, null, {}, clientIP, req.get('User-Agent'));

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      console.error('Error changing password:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to change password'
      });
    }
  }

  /**
   * Get login attempts for security monitoring
   */
  static async getLoginAttempts(req, res) {
    try {
      const { startDate, endDate, export: exportCsv } = req.query;
      const userId = req.user.id;

      let dateFilter = '';
      const params = [userId];

      if (startDate && endDate) {
        dateFilter = 'AND created_at BETWEEN ? AND ?';
        params.push(startDate, endDate);
      }

      const attempts = await query(
        `SELECT * FROM audit_logs 
         WHERE user_id = ? AND (action = 'LOGIN_SUCCESS' OR action = 'LOGIN_FAILED') 
         ${dateFilter}
         ORDER BY created_at DESC LIMIT 100`,
        params
      );

      if (exportCsv === 'true') {
        // Generate CSV
        const csv = SettingsController.generateLoginAttemptsCSV(attempts);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=login-attempts.csv');
        res.send(csv);
      } else {
        res.json({
          success: true,
          data: attempts
        });
      }
    } catch (error) {
      console.error('Error getting login attempts:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get login attempts'
      });
    }
  }

  /**
   * Get default settings for a category
   */
  static getDefaultSettings(category) {
    const defaults = {
      personal: {
        theme: 'light',
        emailNotifications: true,
        pushNotifications: false
      },
      security: {
        twoFactorEnabled: false
      },
      notifications: {
        emailAlerts: true,
        systemUpdates: true,
        securityAlerts: true,
        weeklyReports: false
      }
    };

    return defaults[category] || {};
  }

  /**
   * Get default system settings
   */
  static getDefaultSystemSettings(category) {
    const defaults = {
      system: {
        sessionTimeout: 30,
        maxFileSize: 10
      }
    };

    return defaults[category] || {};
  }

  /**
   * Validate user settings
   */
  static validateSettings(category, settings) {
    switch (category) {
      case 'personal':
        if (settings.theme && !['light', 'dark', 'system'].includes(settings.theme)) {
          return { isValid: false, error: 'Invalid theme value' };
        }
        if (settings.emailNotifications !== undefined && typeof settings.emailNotifications !== 'boolean') {
          return { isValid: false, error: 'Email notifications must be a boolean' };
        }
        if (settings.pushNotifications !== undefined && typeof settings.pushNotifications !== 'boolean') {
          return { isValid: false, error: 'Push notifications must be a boolean' };
        }
        break;

      case 'security':
        if (settings.twoFactorEnabled !== undefined && typeof settings.twoFactorEnabled !== 'boolean') {
          return { isValid: false, error: 'Two-factor auth must be a boolean' };
        }
        break;

      case 'notifications':
        const notificationFields = ['emailAlerts', 'systemUpdates', 'securityAlerts', 'weeklyReports'];
        for (const field of notificationFields) {
          if (settings[field] !== undefined && typeof settings[field] !== 'boolean') {
            return { isValid: false, error: `${field} must be a boolean` };
          }
        }
        break;
    }

    return { isValid: true };
  }

  /**
   * Validate system settings
   */
  static validateSystemSettings(category, settings) {
    switch (category) {
      case 'system':
        if (settings.sessionTimeout !== undefined) {
          const timeout = parseInt(settings.sessionTimeout);
          if (isNaN(timeout) || timeout < 5 || timeout > 480) {
            return { isValid: false, error: 'Session timeout must be between 5 and 480 minutes' };
          }
        }
        if (settings.maxFileSize !== undefined) {
          const size = parseInt(settings.maxFileSize);
          if (isNaN(size) || size < 1 || size > 100) {
            return { isValid: false, error: 'Max file size must be between 1 and 100 MB' };
          }
        }
        break;
    }

    return { isValid: true };
  }

  /**
   * Generate CSV for login attempts
   */
  static generateLoginAttemptsCSV(attempts) {
    const headers = ['Date', 'Action', 'IP Address', 'User Agent', 'Details'];
    const rows = attempts.map(attempt => [
      attempt.created_at,
      attempt.action,
      attempt.ip_address,
      attempt.user_agent,
      attempt.details ? JSON.stringify(attempt.details) : ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
  }
}

module.exports = SettingsController;
