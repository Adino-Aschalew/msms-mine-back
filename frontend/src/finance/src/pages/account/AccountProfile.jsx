import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Camera, Save, Edit2, Upload, Briefcase, Building, CheckCircle, Shield, Award, AlertTriangle, Settings, Lock, Bell, Activity, Target, Users, ChevronRight, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useTheme } from '../../contexts/ThemeContext';
import { authAPI } from '../../../../shared/services/authAPI';

const AccountProfile = () => {
  const { theme } = useTheme();
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const avatarInputRef = useRef(null);
  
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    jobTitle: '',
    department: '',
    location: '',
    bio: '',
    avatar: '',
    joinDate: '',
    lastLogin: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '2023';
    try {
      const date = new Date(dateString);
      return date.getFullYear();
    } catch {
      return '2023';
    }
  };

  // Stats data for finance user
  const stats = [
    { label: 'Total Transactions', value: '1,234', icon: Activity, color: 'text-blue-600' },
    { label: 'Account Balance', value: '45.6K', icon: Target, color: 'text-green-600' },
    { label: 'Active Since', value: formatDate(profile.joinDate), icon: Calendar, color: 'text-purple-600' },
    { label: 'Security Level', value: 'High', icon: Shield, color: 'text-orange-600' },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'activity', label: 'Activity', icon: Activity },
  ];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getProfile();
      
      // Handle different response structures
      let profileData = response;
      if (response.data) {
        profileData = response.data;
      }
      
      // Check if profileData exists and has the expected structure
      if (!profileData) {
        throw new Error('No profile data received');
      }
      
      // Map backend data to frontend state with proper fallbacks
      setProfile({
        firstName: profileData.first_name || profileData.firstName || '',
        lastName: profileData.last_name || profileData.lastName || '',
        email: profileData.email || '',
        phone: profileData.phone || profileData.phone_number || '',
        jobTitle: profileData.job_grade || profileData.job_title || profileData.role || '',
        department: profileData.department || '',
        location: profileData.address || profileData.location || '',
        bio: profileData.bio || '',
        avatar: profileData.avatar || user?.avatar || '',
        joinDate: profileData.created_at || profileData.joinDate || '',
        lastLogin: profileData.last_login || profileData.lastLogin || ''
      });
    } catch (err) {
      setError('Failed to load profile data');
      console.error('Profile fetch error:', err);
      // Set default profile data on error
      setProfile({
        firstName: user?.first_name || '',
        lastName: user?.last_name || '',
        email: user?.email || '',
        phone: '',
        jobTitle: user?.role || '',
        department: '',
        location: '',
        bio: '',
        avatar: user?.avatar || '',
        joinDate: '',
        lastLogin: ''
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      
      const updateData = {
        first_name: profile.firstName,
        last_name: profile.lastName,
        phone_number: profile.phone,
        address: profile.location
        // bio field not supported by backend yet
      };
      
      console.log('Sending update data:', updateData);
      
      try {
        const response = await authAPI.updateProfile(updateData);
        console.log('Update response received:', response);
        console.log('Response type:', typeof response);
        console.log('Response keys:', response ? Object.keys(response) : 'Response is null/undefined');
        
        // Backend returns user data directly, not wrapped in success property
        if (response && (response.id || response.employee_id)) {
          setSuccess('Profile updated successfully!');
          setIsEditing(false);
          // Refresh profile data
          await fetchProfile();
        } else {
          console.log('Response indicates failure:', response);
          setError('Failed to update profile - invalid response structure');
        }
      } catch (apiError) {
        console.error('API call failed:', apiError);
        setError(apiError.message || 'API call failed');
      }
    } catch (err) {
      console.error('General update error:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    fetchProfile(); // Reset to original values
  };

  const handleInputChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    
    const reader = new FileReader();
    reader.onload = (ev) => {
      setProfile(prev => ({
        ...prev,
        avatar: ev.target.result
      }));
    };
    reader.readAsDataURL(file);
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      await authAPI.changePassword(passwordData);
      setSuccess('Password changed successfully!');
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.message || 'Failed to change password');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                My Profile
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage your personal information and account settings
              </p>
            </div>
            <div className="flex gap-3">
              {isEditing && (
                <>
                  <button
                    onClick={handleCancel}
                    className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium rounded-xl transition-all transform hover:scale-105 active:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </>
              )}
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl shadow-2xl p-8 pt-20 text-white relative">
          {/* Avatar - Floating on top */}
          <div className="absolute -top-16 left-1/2 -translate-x-1/2">
            <div className="relative group">
              <div className="w-32 h-32 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border-4 border-white shadow-2xl overflow-hidden">
                {profile.avatar ? (
                  <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-4xl font-black">
                    {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
                  </span>
                )}
                {/* Visual overlay for hover */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-8 h-8 text-white" />
                </div>
              </div>
              <input
                type="file"
                ref={avatarInputRef}
                onChange={handleAvatarUpload}
                className="hidden"
                accept="image/*"
              />
              <button
                onClick={() => avatarInputRef.current.click()}
                className="absolute bottom-1 right-1 bg-white text-blue-600 p-2.5 rounded-full shadow-lg hover:bg-blue-50 transition-all transform hover:scale-110 active:scale-90 z-10"
                title="Change Avatar"
              >
                <Camera className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Centered Content */}
          <div className="flex flex-col items-center text-center">
            <div className="space-y-2 mb-6">
              <h2 className="text-2xl font-bold  tracking-wide">{profile.firstName} {profile.lastName}</h2>
              <p className="text-blue-100 text-xl font-medium tracking-wide opacity-90">{profile.jobTitle}</p>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-sm font-medium">
              <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm hover:bg-white/20 transition-colors">
                <Mail className="w-4 h-4 text-blue-200" />
                <span>{profile.email}</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm hover:bg-white/20 transition-colors">
                <Phone className="w-4 h-4 text-blue-200" />
                <span>{profile.phone || 'No phone'}</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm hover:bg-white/20 transition-colors">
                <Building className="w-4 h-4 text-blue-200" />
                <span>{profile.department || 'Finance'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
                  </div>
                  <Icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs and Content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4 pb-12">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex space-x-8 px-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {/* Error and Success Messages */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-800">{error}</p>
              </div>
            )}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                <p className="text-green-800">{success}</p>
              </div>
            )}

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={profile.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-800"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={profile.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-800"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-800"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-800"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Job Title
                      </label>
                      <input
                        type="text"
                        value={profile.jobTitle}
                        onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-800"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Department
                      </label>
                      <input
                        type="text"
                        value={profile.department}
                        onChange={(e) => handleInputChange('department', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-800"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        value={profile.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-800"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Bio
                      </label>
                      <textarea
                        value={profile.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        disabled={!isEditing}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-800"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Security Settings</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <Lock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">Password</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Last changed 30 days ago</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowPasswordModal(true)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        Change Password
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <Shield className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">Two-Factor Authentication</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Add an extra layer of security</p>
                        </div>
                      </div>
                      <button className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 rounded-lg transition-colors">
                        Enable
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Notification Preferences</h3>
                  
                  <div className="space-y-4">
                    {[
                      { label: 'Email Notifications', description: 'Receive updates via email' },
                      { label: 'Transaction Alerts', description: 'Get notified for transactions' },
                      { label: 'Security Alerts', description: 'Important security notifications' },
                      { label: 'Marketing Emails', description: 'Promotional content and updates' },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{item.label}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked={index < 3} />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Recent Activity</h3>
                  
                  <div className="space-y-4">
                    {[
                      { action: 'Profile updated', time: '2 hours ago', icon: User },
                      { action: 'Password changed', time: '3 days ago', icon: Lock },
                      { action: 'Login from new device', time: '1 week ago', icon: Shield },
                      { action: 'Account created', time: profile.joinDate || 'Unknown', icon: User },
                    ].map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                            <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-gray-100">{item.action}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{item.time}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Change Password</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordChange}
                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountProfile;
