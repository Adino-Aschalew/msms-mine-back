const { query } = require('../config/database');

class SettingsService {
  /**
   * Get user preferences with fallback to defaults
   */
  static async getUserPreferences(userId, category) {
    try {
      const preferences = await query(
        'SELECT settings FROM user_preferences WHERE user_id = ? AND category = ?',
        [userId, category]
      );

      if (preferences.length === 0) {
        return this.getDefaultSettings(category);
      }

      return JSON.parse(preferences[0].settings);
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return this.getDefaultSettings(category);
    }
  }

  /**
   * Update user preferences
   */
  static async updateUserPreferences(userId, category, settings) {
    try {
      await query(
        `INSERT INTO user_preferences (user_id, category, settings) 
         VALUES (?, ?, ?) 
         ON DUPLICATE KEY UPDATE settings = VALUES(settings), updated_at = NOW()`,
        [userId, category, JSON.stringify(settings)]
      );

      return true;
    } catch (error) {
      console.error('Error updating user preferences:', error);
      return false;
    }
  }

  /**
   * Get all user preferences
   */
  static async getAllUserPreferences(userId) {
    try {
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
          result[category] = this.getDefaultSettings(category);
        }
      });

      return result;
    } catch (error) {
      console.error('Error getting all user preferences:', error);
      return {
        personal: this.getDefaultSettings('personal'),
        security: this.getDefaultSettings('security'),
        notifications: this.getDefaultSettings('notifications')
      };
    }
  }

  /**
   * Get system settings
   */
  static async getSystemSettings(category) {
    try {
      const settings = await query(
        'SELECT settings FROM system_settings WHERE category = ?',
        [category]
      );

      if (settings.length === 0) {
        return this.getDefaultSystemSettings(category);
      }

      return JSON.parse(settings[0].settings);
    } catch (error) {
      console.error('Error getting system settings:', error);
      return this.getDefaultSystemSettings(category);
    }
  }

  /**
   * Update system settings
   */
  static async updateSystemSettings(category, settings, updatedBy) {
    try {
      await query(
        `INSERT INTO system_settings (category, settings, updated_by) 
         VALUES (?, ?, ?) 
         ON DUPLICATE KEY UPDATE settings = VALUES(settings), updated_by = VALUES(updated_by), updated_at = NOW()`,
        [category, JSON.stringify(settings), updatedBy]
      );

      return true;
    } catch (error) {
      console.error('Error updating system settings:', error);
      return false;
    }
  }

  /**
   * Get login attempts with filtering
   */
  static async getLoginAttempts(userId, startDate, endDate, limit = 100) {
    try {
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
         ORDER BY created_at DESC LIMIT ?`,
        [...params, limit]
      );

      return attempts;
    } catch (error) {
      console.error('Error getting login attempts:', error);
      return [];
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
   * Validate settings object
   */
  static validateSettings(category, settings) {
    const errors = [];

    switch (category) {
      case 'personal':
        if (settings.theme && !['light', 'dark', 'system'].includes(settings.theme)) {
          errors.push('Invalid theme value');
        }
        if (settings.emailNotifications !== undefined && typeof settings.emailNotifications !== 'boolean') {
          errors.push('Email notifications must be a boolean');
        }
        if (settings.pushNotifications !== undefined && typeof settings.pushNotifications !== 'boolean') {
          errors.push('Push notifications must be a boolean');
        }
        break;

      case 'security':
        if (settings.twoFactorEnabled !== undefined && typeof settings.twoFactorEnabled !== 'boolean') {
          errors.push('Two-factor auth must be a boolean');
        }
        break;

      case 'notifications':
        const notificationFields = ['emailAlerts', 'systemUpdates', 'securityAlerts', 'weeklyReports'];
        notificationFields.forEach(field => {
          if (settings[field] !== undefined && typeof settings[field] !== 'boolean') {
            errors.push(`${field} must be a boolean`);
          }
        });
        break;
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate system settings
   */
  static validateSystemSettings(category, settings) {
    const errors = [];

    switch (category) {
      case 'system':
        if (settings.sessionTimeout !== undefined) {
          const timeout = parseInt(settings.sessionTimeout);
          if (isNaN(timeout) || timeout < 5 || timeout > 480) {
            errors.push('Session timeout must be between 5 and 480 minutes');
          }
        }
        if (settings.maxFileSize !== undefined) {
          const size = parseInt(settings.maxFileSize);
          if (isNaN(size) || size < 1 || size > 100) {
            errors.push('Max file size must be between 1 and 100 MB');
          }
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Initialize default settings for a new user
   */
  static async initializeUserSettings(userId) {
    try {
      const categories = ['personal', 'security', 'notifications'];
      
      for (const category of categories) {
        const defaultSettings = this.getDefaultSettings(category);
        await this.updateUserPreferences(userId, category, defaultSettings);
      }

      return true;
    } catch (error) {
      console.error('Error initializing user settings:', error);
      return false;
    }
  }

  /**
   * Export settings to JSON
   */
  static async exportUserSettings(userId) {
    try {
      const allSettings = await this.getAllUserPreferences(userId);
      
      return {
        userId,
        exportDate: new Date().toISOString(),
        settings: allSettings
      };
    } catch (error) {
      console.error('Error exporting user settings:', error);
      return null;
    }
  }

  /**
   * Import settings from JSON
   */
  static async importUserSettings(userId, settingsData) {
    try {
      if (!settingsData.settings) {
        throw new Error('Invalid settings data format');
      }

      const { settings } = settingsData;
      const categories = ['personal', 'security', 'notifications'];

      for (const category of categories) {
        if (settings[category]) {
          const validation = this.validateSettings(category, settings[category]);
          if (!validation.isValid) {
            throw new Error(`Invalid ${category} settings: ${validation.errors.join(', ')}`);
          }

          await this.updateUserPreferences(userId, category, settings[category]);
        }
      }

      return true;
    } catch (error) {
      console.error('Error importing user settings:', error);
      throw error;
    }
  }
}

module.exports = SettingsService;
