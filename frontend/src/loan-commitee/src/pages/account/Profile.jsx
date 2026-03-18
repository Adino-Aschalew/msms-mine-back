import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Calendar,
  Camera,
  Save,
  Edit2,
  Shield,
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  Globe,
  MapPin,
  FileText,
  Settings,
  LogOut,
  Users,
  Target,
  TrendingUp
} from 'lucide-react';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const [profile, setProfile] = useState({
    firstName: 'John',
    lastName: 'Committee',
    email: 'john.committee@company.com',
    phone: '+1 (555) 123-4567',
    department: 'Loan Committee',
    position: 'Senior Committee Member',
    employeeId: 'LC-2024-001',
    joinDate: '2020-03-15',
    location: 'New York, NY',
    timezone: 'EST (UTC-5)',
    language: 'English',
    bio: 'Senior loan committee member with over 10 years of experience in financial risk assessment and loan management. Specialized in corporate loans and risk mitigation strategies.',
    expertise: ['Risk Assessment', 'Corporate Finance', 'Compliance', 'Loan Structuring'],
    certifications: ['CFA Level III', 'FRM Certified', 'Risk Management Professional'],
    office: 'Building A, Floor 12, Suite 1205',
    manager: 'Sarah Mitchell - Head of Loan Committee',
    emergencyContact: 'Jane Committee - Spouse: +1 (555) 987-6543'
  });

  const systemStats = {
    totalLoansReviewed: 1247,
    loansApproved: 892,
    loansRejected: 265,
    averageReviewTime: '2.3 days',
    accuracyRate: '94.2%',
    committeesServed: 3,
    yearsOfService: 4.2,
    currentWorkload: 23,
    pendingReviews: 8
  };

  const recentActivity = [
    { id: 1, type: 'approved', loanId: 'LN-2024-089', amount: '$45,000', time: '2 hours ago', status: 'completed' },
    { id: 2, type: 'reviewed', loanId: 'LN-2024-090', amount: '$28,000', time: '5 hours ago', status: 'pending' },
    { id: 3, type: 'rejected', loanId: 'LN-2024-088', amount: '$75,000', time: '1 day ago', status: 'completed' },
    { id: 4, type: 'approved', loanId: 'LN-2024-087', amount: '$32,000', time: '2 days ago', status: 'completed' },
    { id: 5, type: 'reviewed', loanId: 'LN-2024-086', amount: '$18,000', time: '3 days ago', status: 'approved' }
  ];

  const handleProfileChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    console.log('Saving profile:', profile);
    setIsEditing(false);
    setHasChanges(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setHasChanges(false);
  };

  const handleAvatarUpload = () => {
    console.log('Uploading avatar');
  };

  const getActivityIcon = (type) => {
    const icons = {
      approved: <CheckCircle className="w-4 h-4 text-success-600" />,
      rejected: <AlertCircle className="w-4 h-4 text-danger-600" />,
      reviewed: <FileText className="w-4 h-4 text-warning-600" />
    };
    return icons[type] || icons.reviewed;
  };

  const getStatusBadge = (status) => {
    const badges = {
      completed: 'status-approved',
      pending: 'status-pending',
      approved: 'status-approved',
      rejected: 'status-rejected'
    };
    return badges[status] || 'status-pending';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">System Profile</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive committee member profile and system metrics
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="btn btn-primary"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Profile
            </button>
          ) : (
            <>
              <button
                onClick={handleCancel}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!hasChanges}
                className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </button>
            </>
          )}
        </div>
      </div>

      {/* Unsaved Changes Alert */}
      {hasChanges && (
        <div className="card p-4 bg-warning-50 dark:bg-warning-900/20 border-warning-200 dark:border-warning-800">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-warning-600 mr-2" />
            <p className="text-warning-800 dark:text-warning-200">
              You have unsaved changes. Remember to save your profile updates.
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {['overview', 'professional', 'activity', 'system'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="card p-6">
              <div className="text-center">
                {/* Avatar */}
                <div className="relative inline-block">
                  <div className="w-24 h-24 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center mx-auto">
                    <User className="w-12 h-12 text-white" />
                  </div>
                  {isEditing && (
                    <button
                      onClick={handleAvatarUpload}
                      className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full hover:bg-primary-700 transition-colors"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Name and Title */}
                <h3 className="mt-4 text-xl font-bold text-gray-900 dark:text-gray-100">
                  {profile.firstName} {profile.lastName}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">{profile.position}</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">{profile.department}</p>

                {/* Quick Stats */}
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary-600">{systemStats.totalLoansReviewed}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total Reviews</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-success-600">{systemStats.accuracyRate}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Accuracy Rate</p>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="mt-6">
                  <span className="status-badge status-approved inline-flex items-center">
                    <Shield className="w-3 h-3 mr-1" />
                    Active Committee Member
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={profile.firstName}
                    onChange={(e) => handleProfileChange('firstName', e.target.value)}
                    disabled={!isEditing}
                    className="input disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={profile.lastName}
                    onChange={(e) => handleProfileChange('lastName', e.target.value)}
                    disabled={!isEditing}
                    className="input disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => handleProfileChange('email', e.target.value)}
                      disabled={!isEditing}
                      className="input pl-10 disabled:bg-gray-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => handleProfileChange('phone', e.target.value)}
                      disabled={!isEditing}
                      className="input pl-10 disabled:bg-gray-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={profile.location}
                      onChange={(e) => handleProfileChange('location', e.target.value)}
                      disabled={!isEditing}
                      className="input pl-10 disabled:bg-gray-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Timezone
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={profile.timezone}
                      onChange={(e) => handleProfileChange('timezone', e.target.value)}
                      disabled={!isEditing}
                      className="input pl-10 disabled:bg-gray-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
                Professional Bio
              </h3>
              <textarea
                value={profile.bio}
                onChange={(e) => handleProfileChange('bio', e.target.value)}
                disabled={!isEditing}
                rows={4}
                className="input disabled:bg-gray-50 disabled:cursor-not-allowed resize-none"
                placeholder="Tell us about your professional experience..."
              />
            </div>
          </div>
        </div>
      )}

      {/* Professional Tab */}
      {activeTab === 'professional' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Work Information */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
              Work Information
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Briefcase className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Position</p>
                  <p className="text-gray-600 dark:text-gray-400">{profile.position}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Building2 className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Department</p>
                  <p className="text-gray-600 dark:text-gray-400">{profile.department}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Join Date</p>
                  <p className="text-gray-600 dark:text-gray-400">{profile.joinDate}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Award className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Employee ID</p>
                  <p className="text-gray-600 dark:text-gray-400">{profile.employeeId}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Expertise & Certifications */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
              Expertise & Certifications
            </h3>
            <div className="space-y-6">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Areas of Expertise</p>
                <div className="flex flex-wrap gap-2">
                  {profile.expertise.map((skill, index) => (
                    <span key={index} className="status-badge status-approved">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Certifications</p>
                <div className="flex flex-wrap gap-2">
                  {profile.certifications.map((cert, index) => (
                    <span key={index} className="status-badge status-pending">
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* System Performance */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
              System Performance
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <TrendingUp className="w-8 h-8 text-success-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{systemStats.loansApproved}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Loans Approved</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Target className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{systemStats.averageReviewTime}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Avg Review Time</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Users className="w-8 h-8 text-warning-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{systemStats.committeesServed}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Committees Served</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Clock className="w-8 h-8 text-info-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{systemStats.yearsOfService}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Years of Service</p>
              </div>
            </div>
          </div>

          {/* Current Workload */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
              Current Workload
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Active Reviews</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">{systemStats.currentWorkload}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Pending Decisions</span>
                <span className="font-semibold text-warning-600">{systemStats.pendingReviews}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Office Location</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">{profile.office}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Reporting Manager</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">{profile.manager}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activity Tab */}
      {activeTab === 'activity' && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Recent Loan Activity
          </h3>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-4">
                  {getActivityIcon(activity.type)}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)} - {activity.loanId}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{activity.amount}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`status-badge ${getStatusBadge(activity.status)}`}>
                    {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* System Tab */}
      {activeTab === 'system' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Access */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
              System Access & Permissions
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-success-600" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Loan Review Access</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Full committee privileges</p>
                  </div>
                </div>
                <span className="status-badge status-approved">Active</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-primary-600" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Report Generation</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Can generate all reports</p>
                  </div>
                </div>
                <span className="status-badge status-approved">Active</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Settings className="w-5 h-5 text-warning-600" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">System Settings</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Read-only access</p>
                  </div>
                </div>
                <span className="status-badge status-approved">Active</span>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
              Emergency Contact
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contact Person
                </label>
                <input
                  type="text"
                  value={profile.emergencyContact}
                  onChange={(e) => handleProfileChange('emergencyContact', e.target.value)}
                  disabled={!isEditing}
                  className="input disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
