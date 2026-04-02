import React, { useState, useEffect } from 'react';
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
  MapPin,
  FileText,
  Settings,
  Users,
  Target,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { committeeAPI } from '../../services/committeeAPI';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

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

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      const profileData = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phone: profile.phone,
        location: profile.location,
        timezone: profile.timezone,
        bio: profile.bio,
        emergencyContact: profile.emergencyContact,
      };
      
      const res = await committeeAPI.updateProfile(profileData);
      
      if (res.data?.success) {
        setIsEditing(false);
        setHasChanges(false);
        // Show success message or toast here
      } else {
        setError(res.data?.message || 'Failed to save profile changes.');
      }
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Failed to save profile changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setHasChanges(false);
  };

  const handleAvatarUpload = () => {
    console.log('Uploading avatar');
  };

  // Fetch profile data from backend
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch profile data
        const profileRes = await committeeAPI.getProfile();
        if (profileRes.data?.success && profileRes.data?.data) {
          const data = profileRes.data.data;
          setProfile(prev => ({
            ...prev,
            firstName: data.firstName || data.first_name || prev.firstName,
            lastName: data.lastName || data.last_name || prev.lastName,
            email: data.email || prev.email,
            phone: data.phone || prev.phone,
            department: data.department || prev.department,
            position: data.position || prev.position,
            employeeId: data.employeeId || data.employee_id || prev.employeeId,
            joinDate: data.joinDate || data.join_date || prev.joinDate,
            location: data.location || prev.location,
            timezone: data.timezone || prev.timezone,
            bio: data.bio || prev.bio,
            expertise: data.expertise || prev.expertise,
            certifications: data.certifications || prev.certifications,
            office: data.office || prev.office,
            manager: data.manager || prev.manager,
            emergencyContact: data.emergencyContact || data.emergency_contact || prev.emergencyContact,
          }));
        }

        // Fetch committee stats
        const statsRes = await committeeAPI.getCommitteeStats();
        if (statsRes.data?.success && statsRes.data?.data) {
          const stats = statsRes.data.data;
          setSystemStats(prev => ({
            ...prev,
            totalLoansReviewed: stats.totalLoansReviewed || stats.total_reviews || prev.totalLoansReviewed,
            loansApproved: stats.loansApproved || stats.approved || prev.loansApproved,
            loansRejected: stats.loansRejected || stats.rejected || prev.loansRejected,
            averageReviewTime: stats.averageReviewTime || stats.avg_review_time || prev.averageReviewTime,
            accuracyRate: stats.accuracyRate || stats.accuracy || prev.accuracyRate,
            committeesServed: stats.committeesServed || stats.committees || prev.committeesServed,
            yearsOfService: stats.yearsOfService || stats.years || prev.yearsOfService,
            currentWorkload: stats.currentWorkload || stats.workload || prev.currentWorkload,
            pendingReviews: stats.pendingReviews || stats.pending || prev.pendingReviews,
          }));
        }
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError('Failed to load profile data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/50 dark:from-gray-900 dark:via-blue-900/10 dark:to-indigo-900/10">
      {/* System-Level Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg">
                <Briefcase className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Committee Profile</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">System Administrator • Loan Committee Member</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">System Active</span>
              </div>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all hover:scale-105 active:scale-95 shadow-lg"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="px-6 py-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!hasChanges || saving}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all hover:scale-105 active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-800 dark:text-red-200 font-medium">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-900/30 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Loading profile data...</p>
        </div>
      ) : (
        <>
          {/* Unsaved Changes Alert */}
          {hasChanges && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <p className="text-amber-800 dark:text-amber-200 font-medium">
                You have unsaved changes. Remember to save your profile updates.
              </p>
            </div>
          )}

      {/* Modern Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-1">
        <nav className="flex gap-1">
          {[
            { id: 'overview', label: 'Overview', icon: User },
            { id: 'professional', label: 'Professional', icon: Briefcase },
            { id: 'activity', label: 'Activity', icon: Clock },
            { id: 'system', label: 'System', icon: Settings }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-8">
              <div className="text-center">
                {/* Avatar */}
                <div className="relative inline-block">
                  <div className="w-28 h-28 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto shadow-xl ring-4 ring-white dark:ring-gray-700">
                    <User className="w-14 h-14 text-white" />
                  </div>
                  {isEditing && (
                    <button
                      onClick={handleAvatarUpload}
                      className="absolute bottom-0 right-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
                    >
                      <Camera className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {/* Name and Title */}
                <h3 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white">
                  {profile.firstName} {profile.lastName}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 font-medium mt-1">{profile.position}</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">{profile.department}</p>

                {/* Quick Stats */}
                <div className="mt-8 grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-4">
                    <p className="text-3xl font-black text-blue-600">{systemStats.totalLoansReviewed}</p>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">Total Reviews</p>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-2xl p-4">
                    <p className="text-3xl font-black text-emerald-600">{systemStats.accuracyRate}</p>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">Accuracy Rate</p>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="mt-6">
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-full text-sm font-bold shadow-lg">
                    <Shield className="w-4 h-4" />
                    Active Committee Member
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={profile.firstName}
                    onChange={(e) => handleProfileChange('firstName', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={profile.lastName}
                    onChange={(e) => handleProfileChange('lastName', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => handleProfileChange('email', e.target.value)}
                      disabled={!isEditing}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => handleProfileChange('phone', e.target.value)}
                      disabled={!isEditing}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={profile.location}
                      onChange={(e) => handleProfileChange('location', e.target.value)}
                      disabled={!isEditing}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Timezone
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={profile.timezone}
                      onChange={(e) => handleProfileChange('timezone', e.target.value)}
                      disabled={!isEditing}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                  <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                Professional Bio
              </h3>
              <textarea
                value={profile.bio}
                onChange={(e) => handleProfileChange('bio', e.target.value)}
                disabled={!isEditing}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed transition-all resize-none"
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
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              Work Information
            </h3>
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Position</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{profile.position}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                  <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Department</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{profile.department}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
                <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                  <Calendar className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Join Date</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{profile.joinDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                  <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Employee ID</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white font-mono">{profile.employeeId}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Expertise & Certifications */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              Expertise & Certifications
            </h3>
            <div className="space-y-8">
              <div>
                <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Areas of Expertise</p>
                <div className="flex flex-wrap gap-2">
                  {profile.expertise.map((skill, index) => (
                    <span key={index} className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full text-sm font-semibold shadow-md">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Certifications</p>
                <div className="flex flex-wrap gap-2">
                  {profile.certifications.map((cert, index) => (
                    <span key={index} className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full text-sm font-semibold shadow-md">
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* System Performance */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              System Performance
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-5 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-2xl">
                <div className="p-3 bg-white dark:bg-gray-700 rounded-xl shadow-sm w-fit mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-emerald-600" />
                </div>
                <p className="text-2xl font-black text-gray-900 dark:text-white">{systemStats.loansApproved}</p>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">Loans Approved</p>
              </div>
              <div className="text-center p-5 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl">
                <div className="p-3 bg-white dark:bg-gray-700 rounded-xl shadow-sm w-fit mx-auto mb-3">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-2xl font-black text-gray-900 dark:text-white">{systemStats.averageReviewTime}</p>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">Avg Review Time</p>
              </div>
              <div className="text-center p-5 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl">
                <div className="p-3 bg-white dark:bg-gray-700 rounded-xl shadow-sm w-fit mx-auto mb-3">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-2xl font-black text-gray-900 dark:text-white">{systemStats.committeesServed}</p>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">Committees</p>
              </div>
              <div className="text-center p-5 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-2xl">
                <div className="p-3 bg-white dark:bg-gray-700 rounded-xl shadow-sm w-fit mx-auto mb-3">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
                <p className="text-2xl font-black text-gray-900 dark:text-white">{systemStats.yearsOfService}</p>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">Years of Service</p>
              </div>
            </div>
          </div>

          {/* Current Workload */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                <Target className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              Current Workload
            </h3>
            <div className="space-y-5">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Active Reviews</span>
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full font-bold">{systemStats.currentWorkload}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Pending Decisions</span>
                <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full font-bold">{systemStats.pendingReviews}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Office Location</span>
                <span className="font-semibold text-gray-900 dark:text-white">{profile.office}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Reporting Manager</span>
                <span className="font-semibold text-gray-900 dark:text-white">{profile.manager}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activity Tab */}
      {activeTab === 'activity' && (
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-8">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            Recent Loan Activity
          </h3>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={activity.id} className="flex items-center justify-between p-5 bg-gray-50 dark:bg-gray-700/30 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all group">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${
                    activity.type === 'approved' ? 'bg-emerald-100 dark:bg-emerald-900/30' :
                    activity.type === 'rejected' ? 'bg-red-100 dark:bg-red-900/30' :
                    'bg-blue-100 dark:bg-blue-900/30'
                  }`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)} - {activity.loanId}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{activity.amount}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    activity.status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' :
                    activity.status === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' :
                    activity.status === 'approved' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                  }`}>
                    {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">{activity.time}</span>
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
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              System Access & Permissions
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-5 bg-gray-50 dark:bg-gray-700/30 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                    <Shield className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">Loan Review Access</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Full committee privileges</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-bold">Active</span>
              </div>
              <div className="flex items-center justify-between p-5 bg-gray-50 dark:bg-gray-700/30 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">Report Generation</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Can generate all reports</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-bold">Active</span>
              </div>
              <div className="flex items-center justify-between p-5 bg-gray-50 dark:bg-gray-700/30 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                    <Settings className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">System Settings</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Read-only access</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-bold">Active</span>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl">
                <Phone className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              Emergency Contact
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Contact Person
                </label>
                <input
                  type="text"
                  value={profile.emergencyContact}
                  onChange={(e) => handleProfileChange('emergencyContact', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed transition-all"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )}
      </div>
    </div>
  );
};

export default Profile;
