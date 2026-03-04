const UserModel = require('./user.model');
const bcrypt = require('bcryptjs');
const { auditLog } = require('../../middleware/audit');

class UserService {
  static async createUser(userData, profileData, ip, userAgent) {
    try {
      const { employee_id, username, email, password, role = 'EMPLOYEE' } = userData;
      
      // Hash password
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
      const password_hash = await bcrypt.hash(password, saltRounds);
      
      // Create user with profile
      const userId = await UserModel.createWithProfile(
        { employee_id, username, email, password_hash, role },
        profileData || {}
      );

      await auditLog(null, 'USER_CREATED', 'users', userId, null, { employee_id, username, email, role }, ip, userAgent);
      
      return { userId, message: 'User created successfully' };
    } catch (error) {
      throw error;
    }
  }

  static async getAllUsers(page = 1, limit = 10, filters = {}) {
    try {
      const result = await UserModel.getAllUsers(page, limit, filters);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async getAllUsersWithInactive(page = 1, limit = 10, filters = {}) {
    try {
      const result = await UserModel.getAllUsersWithInactive(page, limit, filters);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async getUserById(userId) {
    try {
      const user = await UserModel.findByIdWithProfile(userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      // Remove sensitive data
      delete user.password_hash;
      
      return user;
    } catch (error) {
      throw error;
    }
  }

  static async updateUser(userId, userData, ip, userAgent) {
    try {
      // Check if user exists
      const existingUser = await UserModel.findById(userId);
      if (!existingUser) {
        throw new Error('User not found');
      }

      // Update user
      await UserModel.updateUser(userId, userData);

      await auditLog(null, 'USER_UPDATED', 'users', userId, null, userData, ip, userAgent);
      
      return { message: 'User updated successfully' };
    } catch (error) {
      throw error;
    }
  }

  static async updateUserProfile(userId, profileData, ip, userAgent) {
    try {
      // Check if user exists
      const existingUser = await UserModel.findById(userId);
      if (!existingUser) {
        throw new Error('User not found');
      }

      // Update profile
      await UserModel.updateProfile(userId, profileData);

      await auditLog(userId, 'PROFILE_UPDATED', 'employee_profiles', userId, null, profileData, ip, userAgent);
      
      return { message: 'Profile updated successfully' };
    } catch (error) {
      throw error;
    }
  }

  static async deactivateUser(userId, ip, userAgent) {
    try {
      // Check if user exists
      const existingUser = await UserModel.findById(userId);
      if (!existingUser) {
        throw new Error('User not found');
      }

      await UserModel.deactivateUser(userId);

      await auditLog(null, 'USER_DEACTIVATED', 'users', userId, null, null, ip, userAgent);
      
      return { message: 'User deactivated successfully' };
    } catch (error) {
      throw error;
    }
  }

  static async activateUser(userId, ip, userAgent) {
    try {
      // Check if user exists (including inactive)
      const allUsers = await UserModel.getAllUsersWithInactive(1, 1, { is_active: false });
      const userToActivate = allUsers.users.find(u => u.id == userId);
      
      if (!userToActivate) {
        throw new Error('User not found');
      }

      await UserModel.activateUser(userId);

      await auditLog(null, 'USER_ACTIVATED', 'users', userId, null, null, ip, userAgent);
      
      return { message: 'User activated successfully' };
    } catch (error) {
      throw error;
    }
  }

  static async deleteUser(userId, ip, userAgent) {
    try {
      // Check if user exists
      const existingUser = await UserModel.findById(userId);
      if (!existingUser) {
        throw new Error('User not found');
      }

      await UserModel.deleteUser(userId);

      await auditLog(null, 'USER_DELETED', 'users', userId, null, null, ip, userAgent);
      
      return { message: 'User deleted successfully' };
    } catch (error) {
      throw error;
    }
  }

  static async resetUserPassword(userId, newPassword, ip, userAgent) {
    try {
      // Check if user exists
      const existingUser = await UserModel.findById(userId);
      if (!existingUser) {
        throw new Error('User not found');
      }

      // Hash new password
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
      const password_hash = await bcrypt.hash(newPassword, saltRounds);

      await UserModel.updatePassword(userId, password_hash);

      await auditLog(null, 'PASSWORD_RESET', 'users', userId, null, null, ip, userAgent);
      
      return { message: 'Password reset successfully' };
    } catch (error) {
      throw error;
    }
  }

  static async getUserStats() {
    try {
      const stats = await UserModel.getUserStats();
      const departmentStats = await UserModel.getUsersByDepartment();
      
      return {
        ...stats,
        departments: departmentStats
      };
    } catch (error) {
      throw error;
    }
  }

  static async searchUsers(searchTerm, page = 1, limit = 10) {
    try {
      const filters = { search: searchTerm };
      const result = await UserModel.getAllUsers(page, limit, filters);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async getUsersByRole(role, page = 1, limit = 10) {
    try {
      const filters = { role };
      const result = await UserModel.getAllUsers(page, limit, filters);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async getUsersByDepartment(department, page = 1, limit = 10) {
    try {
      const filters = { department };
      const result = await UserModel.getAllUsers(page, limit, filters);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async verifyEmployeeId(employeeId) {
    try {
      const user = await UserModel.findByEmployeeId(employeeId);
      return !!user;
    } catch (error) {
      throw error;
    }
  }

  static async verifyUsername(username) {
    try {
      const user = await UserModel.findByUsername(username);
      return !!user;
    } catch (error) {
      throw error;
    }
  }

  static async verifyEmail(email) {
    try {
      const user = await UserModel.findByEmail(email);
      return !!user;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = UserService;
