import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext2';
import { 
  User, Mail, Phone, MapPin, Shield, Bell, Settings, LogOut, Edit, Camera, Key,UserRound,
  CreditCard, HelpCircle, ChevronRight, Lock, Eye, EyeOff, Save, X, Activity, Clock, Globe, Users, CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { adminAPI } from '../../../shared/services/adminAPI';

const Account = () => {
  const { theme } = useTheme();
  const { user, updateProfile, changePassword, refreshUserProfile } = useAuth();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    securityAlerts: true,
    systemUpdates: true,
    marketingEmails: false
  });
  const [notificationLoading, setNotificationLoading] = useState(false);
  
  const [profileImage, setProfileImage] = useState('');
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    address: '',
    department: '',
    job_title: '',
    role: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  
  useEffect(() => {
    // Fetch fresh user data from API
    refreshUserProfile();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        address: user.address || '',
        department: user.department || '',
        job_title: user.job_title || '',
        role: user.role || 'Admin'
      }));
      if (user.profile_picture) {
        setProfileImage(user.profile_picture);
      } else {
        const savedImage = localStorage.getItem('userProfileImage');
        if (savedImage) setProfileImage(savedImage);
      }
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'activity') {
      fetchActivities();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'notifications') {
      fetchNotificationSettings();
    }
  }, [activeTab]);

  const fetchNotificationSettings = async () => {
    setNotificationLoading(true);
    try {
      const response = await adminAPI.getSystemConfig();
      if (response && response.success) {
        const config = response.data;
        setNotificationSettings({
          emailNotifications: config.email_notifications !== undefined ? config.email_notifications : true,
          pushNotifications: config.system_alerts !== undefined ? config.system_alerts : true,
          securityAlerts: config.system_alerts !== undefined ? config.system_alerts : true,
          systemUpdates: config.user_activity_logs !== undefined ? config.user_activity_logs : true,
          marketingEmails: config.marketing_emails !== undefined ? config.marketing_emails : false
        });
      }
    } catch (error) {
      console.error('Error fetching notification settings:', error);
    } finally {
      setNotificationLoading(false);
    }
  };

  const handleNotificationToggle = async (key) => {
    const newSettings = {
      ...notificationSettings,
      [key]: !notificationSettings[key]
    };
    setNotificationSettings(newSettings);

    // Map to system config keys
    const configPayload = {
      email_notifications: newSettings.emailNotifications,
      system_alerts: newSettings.securityAlerts,
      user_activity_logs: newSettings.systemUpdates,
      backup_notifications: newSettings.securityAlerts,
      loan_notifications: newSettings.emailNotifications,
      payment_notifications: newSettings.emailNotifications,
      marketing_emails: newSettings.marketingEmails
    };

    try {
      await adminAPI.updateSystemConfig(configPayload);
    } catch (error) {
      console.error('Error updating notification settings:', error);
      // Revert on error
      setNotificationSettings(notificationSettings);
    }
  };

  const fetchActivities = async () => {
    if (!user?.id) return;
    setActivitiesLoading(true);
    try {
      const response = await adminAPI.getUserActivity(user.id, 20);
      if (response && response.success) {
        setActivities(response.data.activities || []);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
      setActivities([]);
    } finally {
      setActivitiesLoading(false);
    }
  };

  const getActivityIcon = (action) => {
    const actionLower = action?.toLowerCase() || '';
    
    if (actionLower.includes('login') || actionLower.includes('logout')) {
      return <Globe className="h-6 w-6 text-blue-500" />;
    } else if (actionLower.includes('password') || actionLower.includes('security')) {
      return <Shield className="h-6 w-6 text-green-500" />;
    } else if (actionLower.includes('profile') || actionLower.includes('update')) {
      return <User className="h-6 w-6 text-purple-500" />;
    } else if (actionLower.includes('notification') || actionLower.includes('alert')) {
      return <Bell className="h-6 w-6 text-yellow-500" />;
    } else if (actionLower.includes('delete') || actionLower.includes('remove')) {
      return <X className="h-6 w-6 text-red-500" />;
    } else if (actionLower.includes('create') || actionLower.includes('add')) {
      return <CheckCircle className="h-6 w-6 text-green-500" />;
    } else {
      return <Activity className="h-6 w-6 text-gray-500" />;
    }
  };

  const getActivityDetails = (action) => {
    const actionLower = action?.toLowerCase() || '';
    
    if (actionLower.includes('login')) {
      return {
        title: 'Login Activity',
        description: 'You logged into the system'
      };
    } else if (actionLower.includes('logout')) {
      return {
        title: 'Logout',
        description: 'You logged out of the system'
      };
    } else if (actionLower.includes('password')) {
      return {
        title: 'Password Changed',
        description: 'Your password was successfully changed'
      };
    } else if (actionLower.includes('profile')) {
      return {
        title: 'Profile Updated',
        description: 'Your profile information was updated'
      };
    } else if (actionLower.includes('notification')) {
      return {
        title: 'Notification Settings',
        description: 'Your notification preferences were updated'
      };
    } else if (actionLower.includes('create')) {
      return {
        title: 'Record Created',
        description: 'A new record was created'
      };
    } else if (actionLower.includes('delete')) {
      return {
        title: 'Record Deleted',
        description: 'A record was deleted'
      };
    } else if (actionLower.includes('update')) {
      return {
        title: 'Record Updated',
        description: 'A record was updated'
      };
    } else {
      return {
        title: action || 'Activity',
        description: 'System activity recorded'
      };
    }
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown time';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result;
        setProfileImage(imageUrl);
        localStorage.setItem('userProfileImage', imageUrl);
        window.dispatchEvent(new Event('storage'));
      };
      reader.readAsDataURL(file);
    }
  };

  const [statusModal, setStatusModal] = useState({ isOpen: false, type: 'success', message: '' });

  const showStatus = (type, message) => {
    setStatusModal({ isOpen: true, type, message });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await updateProfile({
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone_number: formData.phone_number,
        address: formData.address || '',
        profile_picture: profileImage
      });
      setIsEditing(false);
      showStatus('success', 'Your profile has been updated successfully.');
      
      
      
    } catch (error) {
      showStatus('error', error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      showStatus('error', 'New passwords do not match');
      return;
    }
    try {
      setLoading(true);
      await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword
      });
      setFormData({...formData, currentPassword: '', newPassword: '', confirmPassword: ''});
      showStatus('success', 'Your password has been changed successfully.');
    } catch (error) {
      showStatus('error', error.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (user) {
      setFormData({
        ...formData,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone_number: user.phone_number || ''
      });
    }
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-8">
          <div className="relative">
            {profileImage ? (
              <img 
                src={profileImage} 
                alt="Profile" 
                className="h-32 w-32 rounded-full border-4 border-white/20 object-cover"
              />
            ) : (
              <div className="h-32 w-32 rounded-full border-4 border-white/20 bg-blue-400 flex items-center justify-center">
                <UserRound className="h-16 w-16 text-white" />
              </div>
            )}
            <input
              type="file"
              id="profile-image-upload"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            <label 
              htmlFor="profile-image-upload"
              className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer hover:bg-blue-600 transition-colors"
            >
              <Camera className="w-4 h-4" />
            </label>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold">{user?.first_name} {user?.last_name}</h2>
            <p className="text-blue-100">{user?.email}</p>
            <p className="text-blue-100">{user?.role}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-8">Profile Information</h3>
        
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-3">First Name</label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                  disabled={!isEditing}
                  className="w-full px-4 py-4 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                  placeholder="First Name"
                />
              </div>
              <div>
                <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-3">Last Name</label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                  disabled={!isEditing}
                  className="w-full px-4 py-4 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                  placeholder="Last Name"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-3">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  disabled={true}
                  className="w-full pl-12 pr-4 py-4 text-base border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  title="Email cannot be edited"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Email cannot be changed</p>
            </div>
            
            <div>
              <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-3">Phone</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                  disabled={!isEditing}
                  className="w-full pl-12 pr-4 py-4 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-3">Address</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  value={formData.address || ''}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  disabled={!isEditing}
                  className="w-full pl-12 pr-4 py-4 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white disabled:opacity-50 resize-none"
                  placeholder="Enter your address"
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-3">Role</label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                disabled={true}
                className="w-full px-4 py-4 text-base border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                title="Role cannot be edited"
              />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Role cannot be changed</p>
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="mt-8 flex gap-4">
            <button
              onClick={handleSave}
              className="flex items-center gap-3 px-6 py-2.5 bg-blue-600 text-white rounded-sm hover:bg-blue-700 transition-colors duration-200 text-base font-medium"
            >
              <Save className="h-5 w-5" />
              Save Changes
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-3 px-6 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 text-base font-medium"
            >
              <X className="h-5 w-5" />
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-8">Security Settings</h3>
        
        <div className="space-y-8">
          <div>
            <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-3">Current Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={formData.currentPassword}
                onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                className="w-full pl-12 pr-12 py-4 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
            <p className="text-xs text-gray-500 mb-3 italic">Must be at least 8 characters with uppercase, lowercase, number, and special character.</p>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type={showNewPassword ? "text" : "password"}
                value={formData.newPassword}
                onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                className="w-full pl-12 pr-12 py-4 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-3">Confirm New Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                className="w-full pl-12 pr-4 py-4 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Confirm new password"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 flex gap-4">
          <button 
            onClick={handlePasswordChange}
            disabled={loading}
            className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-base font-medium disabled:opacity-50"
          >
            {loading ? 'Changing...' : <><Lock className="h-5 w-5" /> Update Password</>}
          </button>
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-8">Notification Preferences</h3>
        
        {notificationLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading notification settings...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {[
              { key: 'emailNotifications', title: 'Email Notifications', description: 'Receive notifications via email' },
              { key: 'pushNotifications', title: 'Push Notifications', description: 'Receive push notifications in your browser' },
              { key: 'securityAlerts', title: 'Security Alerts', description: 'Get notified about security-related activities' },
              { key: 'systemUpdates', title: 'System Updates', description: 'Stay informed about system updates and maintenance' },
              { key: 'marketingEmails', title: 'Marketing Emails', description: 'Receive promotional emails and newsletters' }
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{item.title}</h4>
                  <p className="text-base text-gray-600 dark:text-gray-400">{item.description}</p>
                </div>
                <button
                  onClick={() => handleNotificationToggle(item.key)}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    notificationSettings[item.key] ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 rounded-full bg-white transform transition-transform ${
                      notificationSettings[item.key] ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderActivityTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-8">Recent Activity</h3>
        
        {activitiesLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading activities...</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No recent activity found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {activities.map((activity, index) => {
              const icon = getActivityIcon(activity.action);
              const { title, description } = getActivityDetails(activity.action);
              const time = formatTimeAgo(activity.created_at);
              
              return (
                <div key={index} className="flex items-start gap-6 p-6 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                  <div className="flex-shrink-0">
                    {icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-medium text-gray-900 dark:text-white">{title}</p>
                    <p className="text-base text-gray-600 dark:text-gray-400 mt-2">{description}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">{time}</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 w-full relative">
      <AnimatePresence>
        {statusModal.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" 
              onClick={() => setStatusModal({ ...statusModal, isOpen: false })} 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 max-w-sm w-full relative z-10 border border-gray-100 dark:border-gray-700"
            >
              <div className={`h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
                statusModal.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
              }`}>
                {statusModal.type === 'success' ? (
                  <CheckCircle className="h-10 w-10 font-bold" />
                ) : (
                  <X className="h-10 w-10" />
                )}
              </div>
              <h3 className="text-2xl font-black text-center text-gray-900 dark:text-white mb-2 leading-tight uppercase">
                {statusModal.type === 'success' ? 'Success!' : 'Oops!'}
              </h3>
              <p className="text-center text-gray-500 dark:text-gray-400 mb-8 font-medium">
                {statusModal.message}
              </p>
              <button
                onClick={() => setStatusModal({ ...statusModal, isOpen: false })}
                className={`w-full py-4 rounded-xl text-white font-black uppercase tracking-widest shadow-lg ${
                  statusModal.type === 'success' ? 'bg-green-600 hover:bg-green-700 shadow-green-500/20' : 'bg-red-600 hover:bg-red-700 shadow-red-500/20'
                }`}
              >
                Got it
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {statusModal.isOpen && statusModal.type === 'success' && (
          <motion.div
            initial={{ opacity: 0, x: 50, y: -20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 50, y: -20 }}
            className="fixed top-8 right-8 z-[200] bg-white dark:bg-gray-800 shadow-2xl rounded-2xl p-4 pr-12 border-l-4 border-green-500 flex items-center gap-4 min-w-[320px] shadow-green-500/10"
          >
            <div className="h-10 w-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">System Message</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{statusModal.message}</p>
            </div>
            <button 
              onClick={() => setStatusModal({ ...statusModal, isOpen: false })}
              className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="w-full max-w-full px-4 py-8">
        {}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-tight">Account Settings</h1>
            <p className="text-gray-600 dark:text-gray-400 font-medium">Manage your digital identity and security</p>
          </div>
          {activeTab === 'profile' && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-sm shadow-sm shadow-blue-500/20 hover:bg-blue-700 font-bold uppercase tracking-widest text-[14px] transition-all active:scale-95 flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit
            </button>
          )}
        </div>

        {}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <nav className="flex space-x-1 sm:space-x-2 md:space-x-4 lg:space-x-8">
            {[
              { id: 'profile', label: 'Profile', icon: User },
              { id: 'security', label: 'Security', icon: Shield },
              { id: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'activity', label: 'Activity', icon: Activity }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-4 border-b-2 font-medium text-sm sm:text-base transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
                    : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden text-xs">{tab.label.charAt(0)}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="space-y-8">
          {activeTab === 'profile' && renderProfileTab()}
          {activeTab === 'security' && renderSecurityTab()}
          {activeTab === 'notifications' && renderNotificationsTab()}
          {activeTab === 'activity' && renderActivityTab()}
        </div>
      </div>
    </div>
  );
};

export default Account;
