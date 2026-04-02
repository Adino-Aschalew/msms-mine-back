import { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  Bell, 
  Palette,
  Camera,
  Edit2,
  Save,
  X,
  CheckCircle,
  AlertTriangle,
  Clock,
  Globe,
  Lock,
  Key,
  Smartphone,
  Monitor
} from 'lucide-react';
import { hrAPI } from '../../../shared/services/hrAPI';
import { useAuth } from '../../../shared/contexts/AuthContext';

export default function AccountPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    first_Name: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    department: '',
    role: '',
    employeeId: '',
    joinDate: '',
    manager: ''
  });

  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await hrAPI.getUserProfile();
        console.log('Full API response:', response);
        console.log('Response structure:', JSON.stringify(response, null, 2));
        
        
        const data = response.data || response;
        const user = data.user || {}; 
        
        if (user && Object.keys(user).length > 0) {
          console.log('Profile data object:', data);
          console.log('User object:', user);
          console.log('Available fields:', Object.keys(user));
          console.log('All user properties:', JSON.stringify(user, null, 2));
          
          setProfileData(user);
          setFormData({
            first_Name: user.first_name || user.firstName || user.first_Name || user.username?.split('@')[0] || '',
            lastName: user.last_name || user.lastName || user.username?.split('@')[0] || '',
            email: user.email || '',
            phone: user.phone || user.phone_number || '',
            address: user.address || '',
            department: user.department || '',
            role: user.role || user.job_grade || '',
            employeeId: user.employee_id || user.employeeId || user.id || '',
            joinDate: user.hire_date || user.joinDate || user.join_date || '',
            manager: user.manager || ''
          });
          console.log('AccountPage - Profile data:', user);
          console.log('AccountPage - Form data after setting:', formData);
        } else {
          console.log('No user data found in response:', response);
          
          
          try {
            const employeeResponse = await hrAPI.getEmployeeStats();
            console.log('Employee profile response:', employeeResponse);
          } catch (empError) {
            console.log('Could not fetch employee profile:', empError);
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    weeklyReports: false,
    systemUpdates: true,
    securityAlerts: true
  });

  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'light',
    language: 'English',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY'
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Preferences', icon: Palette }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (field, value) => {
    setNotificationSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleAppearanceChange = (field, value) => {
    setAppearanceSettings(prev => ({ ...prev, [field]: value }));
  };

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading profile...</span>
        </div>
      );
    }

    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            {}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h3>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  {isEditing ? (
                    <>
                      <X size={16} />
                      <span>Cancel</span>
                    </>
                  ) : (
                    <>
                      <Edit2 size={16} />
                      <span>Edit</span>
                    </>
                  )}
                </button>
              </div>

              {}
              <div className="flex items-center gap-6 mb-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                    {formData.first_Name.charAt(0)}{formData.lastName.charAt(0)}
                  </div>
                  {isEditing && (
                    <button className="absolute bottom-0 right-0 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors">
                      <Camera size={16} />
                    </button>
                  )}
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {formData.first_Name} {formData.lastName}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">{formData.role}</p>
                </div>
              </div>

              {}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.first_Name}
                    onChange={(e) => handleInputChange('first_Name', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
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
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
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
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
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
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <Save size={16} />
                    <span>Save Changes</span>
                  </button>
                </div>
              )}
            </div>

            {}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Work Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Employee ID
                  </label>
                  <input
                    type="text"
                    value={formData.employeeId}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700 text-sm disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Department
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700 text-sm disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Role
                  </label>
                  <input
                    type="text"
                    value={formData.role}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700 text-sm disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Manager
                  </label>
                  <input
                    type="text"
                    value={formData.manager}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700 text-sm disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Join Date
                  </label>
                  <input
                    type="text"
                    value={formData.joinDate}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700 text-sm disabled:opacity-50"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            {}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Change Password</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                  Update Password
                </button>
              </div>
            </div>

            {}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Two-Factor Authentication</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-slate-600 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Smartphone className="text-blue-500" size={24} />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Authenticator App</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Use Google Authenticator or similar app</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                    Setup
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-slate-600 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail className="text-green-500" size={24} />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Email Authentication</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Receive codes via email</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                    Setup
                  </button>
                </div>
              </div>
            </div>

            {}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Active Sessions</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-slate-600 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Monitor className="text-blue-500" size={20} />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Windows PC - Chrome</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">192.168.1.1 • Last active 2 minutes ago</p>
                    </div>
                  </div>
                  <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                    Revoke
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-slate-600 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Smartphone className="text-green-500" size={20} />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">iPhone - Safari</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">192.168.1.2 • Last active 1 hour ago</p>
                    </div>
                  </div>
                  <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                    Revoke
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Notification Preferences</h3>
              <div className="space-y-6">
                {Object.entries({
                  emailNotifications: { label: 'Email Notifications', description: 'Receive notifications via email' },
                  pushNotifications: { label: 'Push Notifications', description: 'Browser push notifications' },
                  weeklyReports: { label: 'Weekly Reports', description: 'Summary of weekly activities' },
                  systemUpdates: { label: 'System Updates', description: 'Important system updates' },
                  securityAlerts: { label: 'Security Alerts', description: 'Security-related notifications' }
                }).map(([key, config]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">{config.label}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{config.description}</p>
                    </div>
                    <button
                      onClick={() => handleNotificationChange(key, !notificationSettings[key])}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notificationSettings[key] ? 'bg-blue-600' : 'bg-gray-200 dark:bg-slate-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notificationSettings[key] ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'preferences':
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Display Preferences</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Theme
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['light', 'dark', 'auto'].map((theme) => (
                      <button
                        key={theme}
                        onClick={() => handleAppearanceChange('theme', theme)}
                        className={`p-3 border rounded-lg capitalize transition-colors ${
                          appearanceSettings.theme === theme
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                            : 'border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700'
                        }`}
                      >
                        {theme}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Language
                  </label>
                  <select
                    value={appearanceSettings.language}
                    onChange={(e) => handleAppearanceChange('language', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Timezone
                  </label>
                  <select
                    value={appearanceSettings.timezone}
                    onChange={(e) => handleAppearanceChange('timezone', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="UTC">UTC</option>
                    <option value="EST">EST</option>
                    <option value="PST">PST</option>
                    <option value="GMT">GMT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date Format
                  </label>
                  <select
                    value={appearanceSettings.dateFormat}
                    onChange={(e) => handleAppearanceChange('dateFormat', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Account Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            Manage your profile and account preferences
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {}
        <div className="lg:w-64">
          <nav className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'
                }`}
              >
                <tab.icon size={20} />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {}
        <div className="flex-1">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}
