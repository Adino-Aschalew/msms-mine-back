const API_BASE_URL = 'http://localhost:5000/api';

class SettingsAPI {
  // Get authentication token from localStorage
  static getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // User Preferences
  static async getUserPreferences(category) {
    try {
      const response = await fetch(`${API_BASE_URL}/settings/user/${category}`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting user preferences:', error);
      throw error;
    }
  }

  static async updateUserPreferences(category, settings) {
    try {
      const response = await fetch(`${API_BASE_URL}/settings/user/${category}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ settings })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }

  static async getAllUserPreferences() {
    try {
      const response = await fetch(`${API_BASE_URL}/settings/user/all`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting all user preferences:', error);
      throw error;
    }
  }

  // System Settings (Admin/HR only)
  static async getSystemSettings(category) {
    try {
      const response = await fetch(`${API_BASE_URL}/settings/system/${category}`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting system settings:', error);
      throw error;
    }
  }

  static async updateSystemSettings(category, settings) {
    try {
      const response = await fetch(`${API_BASE_URL}/settings/system/${category}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ settings })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating system settings:', error);
      throw error;
    }
  }

  // Security
  static async changePassword(passwordData) {
    try {
      const response = await fetch(`${API_BASE_URL}/settings/change-password`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(passwordData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }

  // Login Attempts
  static async getLoginAttempts(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `${API_BASE_URL}/settings/login-attempts${queryString ? '?' + queryString : ''}`;
      
      const response = await fetch(url, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Check if response is CSV (for export)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/csv')) {
        return {
          success: true,
          isCSV: true,
          data: await response.text()
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting login attempts:', error);
      throw error;
    }
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
