import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext2';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Shield, 
  Bell, 
  Settings, 
  LogOut, 
  Edit, 
  Camera, 
  Key,
  CreditCard,
  HelpCircle,
  ChevronRight,
  Lock,
  Eye,
  EyeOff,
  Save,
  X,
  Activity,
  Clock,
  Globe,
  Users
} from 'lucide-react';

const Account = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState('https://images.unsplash.com/photo-1472099645785?auto=compress&cs=tinysrgb&dpr=2&w=150&h=150&fit=crop&face=face&auto=format&fit=face-area');
  const [formData, setFormData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    department: 'IT Administration',
    role: 'Super Admin',
    bio: 'Experienced system administrator with expertise in user management and system security.',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result;
        setProfileImage(imageUrl);
        // Store in localStorage to persist across pages
        localStorage.setItem('userProfileImage', imageUrl);
        // Dispatch storage event to notify Header component
        window.dispatchEvent(new Event('storage'));
      };
      reader.readAsDataURL(file);
    }
  };

  // Load profile image from localStorage on component mount
  useEffect(() => {
    const savedImage = localStorage.getItem('userProfileImage');
    if (savedImage) {
      setProfileImage(savedImage);
    }
  }, []);

  const handleSave = () => {
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
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
            <h2 className="text-3xl font-bold mb-3">{formData.name}</h2>
            <p className="text-blue-100 mb-6 text-lg">{formData.role}</p>
            <div className="flex items-center gap-6 mb-6">
              <div>
                <p className="text-base text-blue-100">Member Since</p>
                <p className="text-xl font-medium">2024-01-15</p>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-3 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors duration-200 text-base font-medium"
              >
                <Edit className="h-5 w-5" />
                Edit Profile
              </button>
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
            <div>
              <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-3">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                disabled={!isEditing}
                className="w-full px-4 py-4 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white disabled:opacity-50"
              />
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
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
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
            <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-3">New Password</label>
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
          <button className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-base font-medium">
            <Lock className="h-5 w-5" />
            Update Password
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 w-full">
      <div className="w-full max-w-full px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Account Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your account settings and preferences</p>
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
