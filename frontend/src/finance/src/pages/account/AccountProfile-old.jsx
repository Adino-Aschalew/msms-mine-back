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

  
  const stats = [
    { label: 'Total Transactions', value: '1,234', icon: Activity, color: 'text-blue-600' },
    { label: 'Account Balance', value: '45.6KETB', icon: Target, color: 'text-green-600' },
    { label: 'Active Since', value: profile.joinDate || '2023', icon: Calendar, color: 'text-purple-600' },
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
      
      
      let profileData = response;
      if (response.data) {
        profileData = response.data;
      }
      
      
      if (!profileData) {
        throw new Error('No profile data received');
      }
      
      
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
        phone: profile.phone,
        address: profile.location,
        bio: profile.bio
      };
      
      const response = await authAPI.updateProfile(updateData);
      
      if (response.success) {
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
        
        await fetchProfile();
      } else {
        setError(response.message || 'Failed to update profile');
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    fetchProfile(); 
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newAvatar = reader.result;
        setProfile({...profile, avatar: newAvatar});
        
        updateProfile({ avatar: newAvatar });
      };
      reader.readAsDataURL(file);
    }
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
    <div className="p-8 min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="w-full">
        {}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}
        
        {}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
              <p className="text-sm text-green-800">{success}</p>
            </div>
          </div>
        )}
        
        {}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="p-2 bg-blue-100 rounded-2xl shadow">
                  {profile.avatar ? (
                    <img 
                      src={profile.avatar} 
                      alt="Profile" 
                      className="h-11 w-11 rounded-full object-cover border-2 border-white"
                    />
                  ) : (
                    <User className="h-11 w-11 text-black" />
                  )}
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Profile Settings
                </h1>
                <p className="text-lg text-gray-600 mt-2">
                  Manage your personal profile information
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCancel}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              {}
              <div className="flex flex-col items-center">
                <div className="relative mb-6">
                  <img
                    src={profile.avatar}
                    alt="Profile"
                    className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-xl"
                  />
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full cursor-pointer hover:shadow-lg transform hover:scale-110 transition-all duration-200">
                      <Camera className="h-5 w-5 text-white" />
                      <input
                        type="file"
                        accept="image}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Personal Information</h3>
              
              {}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={profile.firstName}
                    onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 border-2 rounded-xl  focus:border-blue-500 text-lg ${
                      isEditing ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={profile.lastName}
                    onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 border-2 rounded-xl  focus:border-blue-500 text-lg ${
                      isEditing ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({...profile, email: e.target.value})}
                      disabled={!isEditing}
                      className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl  focus:border-blue-500 text-lg ${
                        isEditing ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Phone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({...profile, phone: e.target.value})}
                      disabled={!isEditing}
                      className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl  focus:border-blue-500 text-lg ${
                        isEditing ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Job Title
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={profile.jobTitle}
                      onChange={(e) => setProfile({...profile, jobTitle: e.target.value})}
                      disabled={!isEditing}
                      className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl  focus:border-blue-500 text-lg ${
                        isEditing ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Department
                  </label>
                  <div className="relative">
                    <Building className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <select
                      value={profile.department}
                      onChange={(e) => setProfile({...profile, department: e.target.value})}
                      disabled={!isEditing}
                      className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl  focus:border-blue-500 text-lg appearance-none ${
                        isEditing ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <option value="Finance">Finance</option>
                      <option value="HR">Human Resources</option>
                      <option value="Operations">Operations</option>
                      <option value="Marketing">Marketing</option>
                      <option value="IT">Information Technology</option>
                    </select>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={profile.location}
                      onChange={(e) => setProfile({...profile, location: e.target.value})}
                      disabled={!isEditing}
                      className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl  focus:border-blue-500 text-lg ${
                        isEditing ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50'
                      }`}
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Bio
                  </label>
                  <textarea
                    value={profile.bio}
                    onChange={(e) => setProfile({...profile, bio: e.target.value})}
                    disabled={!isEditing}
                    rows={4}
                    className={`w-full px-4 py-3 border-2 rounded-xl  focus:border-blue-500 text-lg resize-none ${
                      isEditing ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50'
                    }`}
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Account Activity</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-xl border border-blue-200">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <Calendar className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-900">
                        Last Login
                      </p>
                      <p className="text-sm text-gray-600">
                        Most recent sign-in to your account
                      </p>
                    </div>
                  </div>
                  <span className="text-lg font-medium text-blue-600">
                    {profile.lastLogin}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-4  rounded-xl border border-green-200">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-green-100 rounded-xl">
                      <User className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-900">
                        Account Created
                      </p>
                      <p className="text-sm text-gray-600">
                        When you first joined the platform
                      </p>
                    </div>
                  </div>
                  <span className="text-lg font-medium text-green-600">
                    {new Date(profile.joinDate).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-xl border border-purple-200">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-purple-100 rounded-xl">
                      <Mail className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-900">
                        Email Verified
                      </p>
                      <p className="text-sm text-gray-600">
                        Your email address has been verified
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <span className="px-3 py-1 text-sm font-bold rounded-full bg-green-100 text-green-800">
                      Verified
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Account Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Shield className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Security Level</span>
                  </div>
                  <span className="text-sm font-bold text-blue-600">High</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Award className="h-5 w-5 text-green-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Account Type</span>
                  </div>
                  <span className="text-sm font-bold text-green-600">Premium</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Calendar className="h-5 w-5 text-purple-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Days Active</span>
                  </div>
                  <span className="text-sm font-bold text-purple-600">732</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountProfile;
