import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext2';
import { 
  User, Mail, Phone, MapPin, Shield, Bell, Settings, LogOut, Edit, Camera, Key,
  CreditCard, HelpCircle, ChevronRight, Lock, Eye, EyeOff, Save, X, Activity, Clock, Globe, Users, CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../shared/contexts/AuthContext';

const Account = () => {
  const { theme } = useTheme();
  const { user, updateProfile, changePassword, refreshUserProfile } = useAuth();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [profileImage, setProfileImage] = useState('https://images.unsplash.com/photo-1472099645785?auto=compress&cs=tinysrgb&dpr=2&w=150&h=150&fit=crop&face=face&auto=format&fit=face-area');
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    department: '',
    job_title: '',
    role: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Load user data on mount
  useEffect(() => {
    if (user && !isEditing) {
      setFormData(prev => ({
        ...prev,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        department: user.department || '',
        job_title: user.job_title || '',
        role: user.role || 'Admin'
      }));
    }
  }, [user, isEditing]);

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
        phone: formData.phone_number
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
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-8">
          <div className="relative">
            <img 
              src={profileImage} 
              alt="Profile" 
              className="h-32 w-32 rounded-full border-4 border-white/20 object-cover"
            />
            <input
              type="file"
              id="profile-image-upload"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-3">{formData.first_name} {formData.last_name}</h2>
            <p className="text-blue-100 mb-6 text-lg tracking-wider uppercase font-black">{formData.role}</p>
            <div className="flex items-center gap-6 mb-6">
              <div>
                <p className="text-base text-blue-100">Member Since</p>
                <p className="text-xl font-medium">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <label
                htmlFor="profile-image-upload"
                className="flex items-center gap-3 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors duration-200 cursor-pointer text-base font-medium"
              >
                <Camera className="h-5 w-5" />
                Change Photo
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Information */}
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
                  disabled={!isEditing}
                  className="w-full pl-12 pr-4 py-4 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                />
              </div>
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
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-3">Role</label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                disabled={!isEditing}
                className="w-full px-4 py-4 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="mt-8 flex gap-4">
            <button
              onClick={handleSave}
              className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-base font-medium"
            >
              <Save className="h-5 w-5" />
              Save Changes
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-3 px-8 py-4 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 text-base font-medium"
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

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-8">Two-Factor Authentication</h3>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Enable 2FA</h4>
              <p className="text-base text-gray-600 dark:text-gray-400">Add an extra layer of security to your account</p>
            </div>
            <button className="relative inline-flex h-8 w-14 items-center rounded-full bg-gray-200 dark:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              <span className="inline-block h-6 w-6 rounded-full bg-white transform translate-x-0 transition-transform"></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-8">Notification Preferences</h3>
        
        <div className="space-y-6">
          {[
            { title: 'Email Notifications', description: 'Receive notifications via email' },
            { title: 'Push Notifications', description: 'Receive push notifications in your browser' },
            { title: 'Security Alerts', description: 'Get notified about security-related activities' },
            { title: 'System Updates', description: 'Stay informed about system updates and maintenance' },
            { title: 'Marketing Emails', description: 'Receive promotional emails and newsletters' }
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{item.title}</h4>
                <p className="text-base text-gray-600 dark:text-gray-400">{item.description}</p>
              </div>
              <button className="relative inline-flex h-8 w-14 items-center rounded-full bg-gray-200 dark:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                <span className="inline-block h-6 w-6 rounded-full bg-white transform translate-x-0 transition-transform"></span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderActivityTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-8">Recent Activity</h3>
        
        <div className="space-y-6">
          {[
            {
              icon: <User className="h-6 w-6 text-blue-500" />,
              title: 'Profile Updated',
              description: 'Your profile information was successfully updated',
              time: '2 hours ago',
              type: 'success'
            },
            {
              icon: <Shield className="h-6 w-6 text-green-500" />,
              title: 'Password Changed',
              description: 'Your password was successfully changed',
              time: '1 day ago',
              type: 'success'
            },
            {
              icon: <Bell className="h-6 w-6 text-yellow-500" />,
              title: 'Notification Settings Updated',
              description: 'Your notification preferences were updated',
              time: '3 days ago',
              type: 'warning'
            },
            {
              icon: <Users className="h-6 w-6 text-purple-500" />,
              title: 'New Team Member Added',
              description: 'A new team member was added to your organization',
              time: '5 days ago',
              type: 'info'
            },
            {
              icon: <Globe className="h-6 w-6 text-red-500" />,
              title: 'Login from New Device',
              description: 'New login detected from Chrome on Windows',
              time: '1 week ago',
              type: 'error'
            }
          ].map((activity, index) => (
            <div key={index} className="flex items-start gap-6 p-6 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
              <div className="flex-shrink-0">
                {activity.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-lg font-medium text-gray-900 dark:text-white">{activity.title}</p>
                <p className="text-base text-gray-600 dark:text-gray-400 mt-2">{activity.description}</p>
                <div className="flex items-center gap-3 mt-3">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">{activity.time}</span>
                </div>
              </div>
              <div className="flex-shrink-0">
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-8">Activity Statistics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full mb-4">
              <Activity className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">127</p>
            <p className="text-base text-gray-600 dark:text-gray-400">Total Activities</p>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
              <Shield className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">24</p>
            <p className="text-base text-gray-600 dark:text-gray-400">Security Actions</p>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full mb-4">
              <Users className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">8</p>
            <p className="text-base text-gray-600 dark:text-gray-400">Team Activities</p>
          </div>
        </div>
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
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-tight">Account Settings</h1>
            <p className="text-gray-600 dark:text-gray-400 font-medium">Manage your digital identity and security</p>
          </div>
          {activeTab === 'profile' && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 font-black uppercase tracking-widest text-xs transition-all active:scale-95 flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit Profile
            </button>
          )}
        </div>

        {/* Navigation Tabs */}
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

        {/* Content */}
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
