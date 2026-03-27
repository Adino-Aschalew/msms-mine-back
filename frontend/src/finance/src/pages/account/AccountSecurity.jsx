import React, { useState } from 'react';
import { Shield, Lock, Key, Smartphone, Mail, Eye, EyeOff, AlertTriangle, CheckCircle, Clock, User, Save } from 'lucide-react';
import { authAPI } from '../../../../shared/services/authAPI';

const AccountSecurity = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);

  const securitySettings = {
    lastPasswordChange: '2024-02-15',
    twoFactorEnabled: false,
    activeSessions: 3,
    loginAttempts: 0,
    securityScore: 85
  };

  const activeSessions = [
    {
      id: 1,
      device: 'Chrome on Windows',
      location: 'New York, NY',
      ip: '192.168.1.1',
      lastActive: '2024-03-15 09:30 AM',
      current: true
    },
    {
      id: 2,
      device: 'Safari on iPhone',
      location: 'New York, NY',
      ip: '192.168.1.2',
      lastActive: '2024-03-14 06:45 PM',
      current: false
    },
    {
      id: 3,
      device: 'Chrome on MacBook',
      location: 'Boston, MA',
      ip: '192.168.1.3',
      lastActive: '2024-03-13 02:15 PM',
      current: false
    }
  ];

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All password fields are required');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await authAPI.changePassword({
        currentPassword,
        newPassword
      });
      
      if (response.success) {
        setSuccess('Password changed successfully! You will need to use your new password next time you login.');
        // Clear form
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        
        // Update last password change date
        const today = new Date().toISOString().split('T')[0];
        securitySettings.lastPasswordChange = today;
      } else {
        setError(response.message || 'Failed to change password');
      }
    } catch (err) {
      setError(err.message || 'Failed to change password. Please check your current password and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTwoFactorToggle = () => {
    setTwoFactorEnabled(!twoFactorEnabled);
  };

  const handleRevokeSession = (sessionId) => {
    console.log('Revoking session:', sessionId);
  };

  const getPasswordStrength = (password) => {
    if (password.length < 8) return { strength: 'weak', color: 'red', text: 'Weak' };
    if (password.length < 12) return { strength: 'medium', color: 'yellow', text: 'Medium' };
    return { strength: 'strong', color: 'green', text: 'Strong' };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Security Settings
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage your account security and authentication
        </p>
      </div>

      {/* Security Score */}
      <div className="card">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Security Score
            </h3>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              securitySettings.securityScore >= 80 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
              securitySettings.securityScore >= 60 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
              'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
              {securitySettings.securityScore}/100
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                securitySettings.securityScore >= 80 ? 'bg-green-500' :
                securitySettings.securityScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${securitySettings.securityScore}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Your account security is {securitySettings.securityScore >= 80 ? 'excellent' : 'good'}. Keep it up!
          </p>
        </div>
      </div>

      {/* Password Change */}
      <div className="card">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Change Password
          </h3>
          
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}
          
          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <div className="flex">
                <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                <p className="text-sm text-green-800">{success}</p>
              </div>
            </div>
          )}
          
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="input w-full pl-10 pr-10"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                New Password
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input w-full pl-10 pr-10"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {newPassword && (
                <div className="mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Password strength:</span>
                    <span className={`text-xs font-medium ${
                      passwordStrength.color === 'green' ? 'text-green-600 dark:text-green-400' :
                      passwordStrength.color === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-red-600 dark:text-red-400'
                    }`}>
                      {passwordStrength.text}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                    <div
                      className={`h-1 rounded-full ${
                        passwordStrength.color === 'green' ? 'bg-green-500' :
                        passwordStrength.color === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: passwordStrength.strength === 'strong' ? '100%' : passwordStrength.strength === 'medium' ? '60%' : '30%' }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input w-full pl-10 pr-10"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating Password...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Password
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="card">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Two-Factor Authentication
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Add an extra layer of security to your account
              </p>
            </div>
            <button
              onClick={handleTwoFactorToggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                twoFactorEnabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          {twoFactorEnabled ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                  <span className="text-sm text-green-800 dark:text-green-200">
                    Two-factor authentication is enabled
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <Smartphone className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Authenticator App</span>
                  </div>
                  <span className="text-xs text-green-600 dark:text-green-400">Active</span>
                </div>
                <button className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                  Configure backup methods
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                  <span className="text-sm text-yellow-800 dark:text-yellow-200">
                    Two-factor authentication is not enabled
                  </span>
                </div>
              </div>
              <button className="btn btn-outline">
                <Smartphone className="h-4 w-4 mr-2" />
                Set Up 2FA
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Active Sessions */}
      <div className="card">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Active Sessions
          </h3>
          <div className="space-y-3">
            {activeSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {session.device}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {session.location} • {session.ip}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Last active: {session.lastActive}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {session.current && (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Current
                    </span>
                  )}
                  {!session.current && (
                    <button
                      onClick={() => handleRevokeSession(session.id)}
                      className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Security Notifications */}
      <div className="card">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Security Notifications
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Email alerts for security events
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Get notified about suspicious activity
                </p>
              </div>
              <button
                onClick={() => setEmailNotifications(!emailNotifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  emailNotifications ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    emailNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-start">
                <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Security notifications are sent to your email
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    john.doe@company.com
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSecurity;
