import apiClient from './api';

class SettingsAPI {
  // User Preferences
  static async getUserPreferences(category) {
    const response = await apiClient.get(`/settings/user/${category}`);
    return response;
  }

  static async updateUserPreferences(category, settings) {
    const response = await apiClient.put(`/settings/user/${category}`, { settings });
    return response;
  }

  static async getAllUserPreferences() {
    const response = await apiClient.get('/settings/user/all');
    return response;
  }

  // System Settings (Admin/HR only)
  static async getSystemSettings(category) {
    const response = await apiClient.get(`/settings/system/${category}`);
    return response;
  }

  static async updateSystemSettings(category, settings) {
    const response = await apiClient.put(`/settings/system/${category}`, { settings });
    return response;
  }

  // Security
  static async changePassword(passwordData) {
    const response = await apiClient.post('/settings/change-password', passwordData);
    return response;
  }

  // Login Attempts
  static async getLoginAttempts(params = {}) {
    const response = await apiClient.get('/settings/login-attempts', params);
    return response;
  }

  // Helper methods for common operations
  static async updatePersonalSettings(settings) {
    return this.updateUserPreferences('personal', settings);
  }

  static async updateSecuritySettings(settings) {
    return this.updateUserPreferences('security', settings);
  }

  static async updateNotificationSettings(settings) {
    return this.updateUserPreferences('notifications', settings);
  }

  static async updateSystemSettingsAdmin(settings) {
    return this.updateSystemSettings('system', settings);
  }

  // Default settings
  static getDefaultPersonalSettings() {
    return {
      theme: 'light',
      emailNotifications: true,
      pushNotifications: false
    };
  }

  static getDefaultSecuritySettings() {
    return {
      twoFactorEnabled: false
    };
  }

  static getDefaultNotificationSettings() {
    return {
      emailAlerts: true,
      systemUpdates: true,
      securityAlerts: true,
      weeklyReports: false
    };
  }

  static getDefaultSystemSettings() {
    return {
      sessionTimeout: 30,
      maxFileSize: 10
    };
  }

  // Validation helpers
  static validatePersonalSettings(settings) {
    const errors = [];
    
    if (settings.theme && !['light', 'dark', 'system'].includes(settings.theme)) {
      errors.push('Invalid theme value');
    }
    
    if (settings.emailNotifications !== undefined && typeof settings.emailNotifications !== 'boolean') {
      errors.push('Email notifications must be a boolean');
    }
    
    if (settings.pushNotifications !== undefined && typeof settings.pushNotifications !== 'boolean') {
      errors.push('Push notifications must be a boolean');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validatePasswordChange(passwordData) {
    const errors = [];
    
    if (!passwordData.currentPassword) {
      errors.push('Current password is required');
    }
    
    if (!passwordData.newPassword) {
      errors.push('New password is required');
    }
    
    if (!passwordData.confirmPassword) {
      errors.push('Password confirmation is required');
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.push('New passwords do not match');
    }
    
    if (passwordData.newPassword && passwordData.newPassword.length < 6) {
      errors.push('New password must be at least 6 characters long');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default SettingsAPI;
