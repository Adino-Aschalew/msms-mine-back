import React, { useState, useRef } from 'react';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiCalendar,
  FiMapPin,
  FiEdit2,
  FiCamera,
  FiSave,
  FiX,
  FiBriefcase,
  FiShield,
  FiBell,
  FiLock,
  FiAward,
  FiTrendingUp,
  FiActivity,
  FiTarget,
  FiUsers,
  FiSettings,
  FiChevronRight,
  FiClock,
  FiDollarSign,
  FiFileText,
  FiZap,
  FiCheck
} from 'react-icons/fi';
import { useAuth } from '../../../shared/contexts/AuthContext';
import Button from '../components/Shared/Button';
import Input from '../components/Shared/Input';
import Modal from '../components/Shared/Modal';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const avatarInputRef = useRef(null);

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      updateProfile({ avatar: ev.target.result });
    };
    reader.readAsDataURL(file);
  };
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPasswordSuccess, setShowPasswordSuccess] = useState(false);
  const [showPasswordError, setShowPasswordError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [formData, setFormData] = useState({
    fullName: user?.name || 'John Doe',
    email: user?.email || 'employee@company.com',
    phone: '+1234567890',
    address: '123 Main St, City, State 12345',
    dateOfBirth: '1990-01-01',
    emergencyContact: 'Jane Doe - +1234567891',
    bio: 'Senior software developer with 5+ years of experience in full-stack development.',
    department: user?.department || 'Engineering',
    position: user?.position || 'Senior Developer',
    employeeId: user?.employeeId || 'EMP001',
    startDate: 'January 15, 2022',
    employmentType: 'Full-time',
  });

  const handleSave = async () => {
    try {
      await updateProfile({ name: formData.fullName });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: user?.name || 'John Doe',
      email: user?.email || 'employee@company.com',
      phone: '+1234567890',
      address: '123 Main St, City, State 12345',
      dateOfBirth: '1990-01-01',
      emergencyContact: 'Jane Doe - +1234567891',
      bio: 'Senior software developer with 5+ years of experience in full-stack development.',
      department: user?.department || 'Engineering',
      position: user?.position || 'Senior Developer',
      employeeId: user?.employeeId || 'EMP001',
      startDate: 'January 15, 2022',
      employmentType: 'Full-time',
    });
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordErrorMessage('New passwords do not match');
      setShowPasswordError(true);
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordErrorMessage('Password must be at least 8 characters long');
      setShowPasswordError(true);
      return;
    }

    // Simulate API call
    console.log('Changing password...');
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Reset form and close modal
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setShowPasswordModal(false);
    setShowPasswordSuccess(true);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FiUser },
    { id: 'employment', label: 'Employment', icon: FiBriefcase },
    { id: 'security', label: 'Security', icon: FiShield },
  ];

  const stats = [
    { label: 'Years of Service', value: '3', icon: FiClock, color: 'blue' },
    { label: 'Projects Completed', value: '47', icon: FiTarget, color: 'green' },
    { label: 'Performance Score', value: '4.8', icon: FiTrendingUp, color: 'purple' },
    { label: 'Team Size', value: '12', icon: FiUsers, color: 'orange' },
  ];

  const achievements = [
    { title: 'Employee of the Year', date: '2023', icon: FiAward, color: 'yellow' },
    { title: 'Innovation Award', date: '2022', icon: FiZap, color: 'blue' },
    { title: 'Team Excellence', date: '2023', icon: FiUsers, color: 'green' },
  ];

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
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? 'secondary' : 'primary'}
              icon={isEditing ? FiX : FiEdit2}
              className="px-6 py-3"
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </div>
        </div>
      </div>

      {/* Profile Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8">
        <div className="bg-blue-600 rounded-3xl shadow-2xl p-8 pt-20 text-white relative">
          {/* Avatar - Floating on top */}
          <div className="absolute -top-16 left-1/2 -translate-x-1/2">
            <div className="relative group">
              <div className="w-32 h-32 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border-4 border-white shadow-2xl overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-4xl font-black">
                    {formData.fullName.charAt(0)}
                  </span>
                )}
                {/* Visual overlay for hover */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <FiCamera className="w-8 h-8 text-white" />
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
                <FiCamera className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Centered Content */}
          <div className="flex flex-col items-center text-center">
            <div className="space-y-2 mb-6">
              <h2 className="text-4xl font-black tracking-tight">{formData.fullName}</h2>
              <p className="text-blue-100 text-xl font-medium tracking-wide opacity-90">{formData.position}</p>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-sm font-medium">
              <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm hover:bg-white/20 transition-colors">
                <FiMail className="w-4 h-4 text-blue-200" />
                <span>{formData.email}</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm hover:bg-white/20 transition-colors">
                <FiPhone className="w-4 h-4 text-blue-200" />
                <span>{formData.phone}</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm hover:bg-white/20 transition-colors">
                <FiMapPin className="w-4 h-4 text-blue-200" />
                <span>{formData.address}</span>
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
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl bg-${stat.color}-100 dark:bg-${stat.color}-900/50`}>
                    <Icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs and Content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
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
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
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
                        value={formData.email}
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
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-800"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-800"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Address
                      </label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-800"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Bio
                      </label>
                      <textarea
                        value={formData.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-800"
                        rows={4}
                        placeholder="Tell us about yourself..."
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Emergency Contact
                      </label>
                      <input
                        type="text"
                        value={formData.emergencyContact}
                        onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-800"
                        placeholder="Name - Phone Number"
                      />
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex justify-end space-x-4 mt-6">
                      <Button onClick={handleCancel} variant="secondary">
                        Cancel
                      </Button>
                      <Button onClick={handleSave} icon={FiSave}>
                        Save Changes
                      </Button>
                    </div>
                  )}
                </div>

                {/* Achievements */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Achievements</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {achievements.map((achievement, index) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg bg-${achievement.color}-100 dark:bg-${achievement.color}-900/50`}>
                            <FiAward className={`w-5 h-5 text-${achievement.color}-600 dark:text-${achievement.color}-400`} />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">{achievement.title}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{achievement.date}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Employment Tab */}
            {activeTab === 'employment' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Employment Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Employee ID
                      </label>
                      <input
                        type="text"
                        value={formData.employeeId}
                        disabled
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Department
                      </label>
                      <input
                        type="text"
                        value={formData.department}
                        disabled={!isEditing}
                        onChange={(e) => handleInputChange('department', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-800"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Position
                      </label>
                      <input
                        type="text"
                        value={formData.position}
                        disabled={!isEditing}
                        onChange={(e) => handleInputChange('position', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-800"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Start Date
                      </label>
                      <input
                        type="text"
                        value={formData.startDate}
                        disabled
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Employment Type
                      </label>
                      <input
                        type="text"
                        value={formData.employmentType}
                        disabled
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Performance Metrics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center justify-between mb-4">
                        <FiActivity className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">94%</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Attendance Rate</p>
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                      <div className="flex items-center justify-between mb-4">
                        <FiTarget className="w-8 h-8 text-green-600 dark:text-green-400" />
                        <span className="text-2xl font-bold text-green-600 dark:text-green-400">112%</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Goals Achieved</p>
                    </div>

                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
                      <div className="flex items-center justify-between mb-4">
                        <FiTrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                        <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">4.8</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Performance Rating</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                      <FiLock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">Change Password</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Update your account password</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                  >
                    Change
                  </button>
                </div>

                <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-lg">
                      <FiShield className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">Two-Factor Authentication</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Add an extra layer of security</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Enable
                  </Button>
                </div>

                <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                      <FiSettings className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">Privacy Settings</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Control your privacy preferences</p>
                    </div>
                  </div>
                  <FiChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Avatar Upload Modal */}
      <Modal
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        title="Update Profile Picture"
        size="sm"
      >
        <div className="space-y-4">
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto flex items-center justify-center">
              <FiCamera className="w-8 h-8 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Choose File
            </label>
            <input
              type="file"
              accept="image/*"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              JPG, PNG or GIF. Maximum size 2MB.
            </p>
          </div>

          <div className="flex space-x-4">
            <Button
              onClick={() => setShowAvatarModal(false)}
              variant="secondary"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={() => setShowAvatarModal(false)}
              className="flex-1"
            >
              Upload
            </Button>
          </div>
        </div>
      </Modal>

      {/* Password Change Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Change Password"
        size="md"
      >
        <form onSubmit={handlePasswordSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Current Password *
            </label>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your current password"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              New Password *
            </label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your new password"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Confirm New Password *
            </label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Confirm your new password"
              required
            />
          </div>

          {/* Password Requirements */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <FiShield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Password Requirements</h4>
                <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
                  <li>• Minimum 8 characters</li>
                  <li>• Must contain at least one uppercase letter</li>
                  <li>• Must contain at least one lowercase letter</li>
                  <li>• Must contain at least one number</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <Button
              type="button"
              onClick={() => setShowPasswordModal(false)}
              variant="secondary"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
            >
              Change Password
            </Button>
          </div>
        </form>
      </Modal>

      {/* Password Success Modal */}
      <Modal
        isOpen={showPasswordSuccess}
        onClose={() => setShowPasswordSuccess(false)}
        title="Password Changed Successfully"
        size="sm"
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto">
            <FiCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Password Updated!
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Your password has been changed successfully. You can now use your new password to log in.
            </p>
          </div>

          <Button
            onClick={() => setShowPasswordSuccess(false)}
            className="w-full"
          >
            Continue
          </Button>
        </div>
      </Modal>

      {/* Password Error Modal */}
      <Modal
        isOpen={showPasswordError}
        onClose={() => setShowPasswordError(false)}
        title="Password Change Failed"
        size="sm"
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mx-auto">
            <FiX className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Unable to Change Password
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {passwordErrorMessage}
            </p>
          </div>

          <Button
            onClick={() => setShowPasswordError(false)}
            className="w-full"
          >
            Try Again
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ProfilePage;
