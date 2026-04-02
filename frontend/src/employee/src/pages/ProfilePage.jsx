import React, { useState, useRef, useEffect } from 'react';
import {
  User, Mail, Phone, Calendar, MapPin, Edit2, Camera, Save, X, Briefcase, Shield, Lock,
  Award, TrendingUp, Activity, Target, Settings, ChevronRight, BadgeCheck, Sparkles,
  Building, Check, Eye, EyeOff
} from 'lucide-react';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { employeeAPI } from '../../../shared/services/employeeAPI';

// Toast Notification
const Toast = ({ message, type, onClose }) => {
  useEffect(() => { const timer = setTimeout(onClose, 3000); return () => clearTimeout(timer); }, [onClose]);
  return (
    <div className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl animate-bounce ${type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
      {type === 'success' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
      <span className="font-medium">{message}</span>
    </div>
  );
};

// Input Component
const InputField = ({ label, value, onChange, disabled, type = 'text', icon: Icon, textarea = false }) => (
  <div className="group">
    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">{label}</label>
    <div className="relative">
      {Icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Icon className="w-5 h-5" /></div>}
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange?.(e.target.value)} disabled={disabled} rows={4}
          className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${Icon ? 'pl-12' : ''} ${disabled ? 'bg-gray-50 border-gray-200 text-gray-500' : 'bg-white border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'}`} />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange?.(e.target.value)} disabled={disabled}
          className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${Icon ? 'pl-12' : ''} ${disabled ? 'bg-gray-50 border-gray-200 text-gray-500' : 'bg-white border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'}`} />
      )}
    </div>
  </div>
);

// Stat Card
const StatCard = ({ label, value, icon: Icon, color = 'blue' }) => {
  const colors = { blue: 'bg-blue-50 text-blue-600 border-blue-200', green: 'bg-emerald-50 text-emerald-600 border-emerald-200', purple: 'bg-purple-50 text-purple-600 border-purple-200', orange: 'bg-orange-50 text-orange-600 border-orange-200' };
  return (
    <div className={`p-6 rounded-2xl border-2 ${colors[color]} transition-transform hover:scale-105`}>
      <div className="flex items-center justify-between">
        <div><p className="text-sm font-medium opacity-80">{label}</p><p className="text-2xl font-black mt-1">{value}</p></div>
        <Icon className="w-8 h-8 opacity-60" />
      </div>
    </div>
  );
};

// Modal
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const avatarInputRef = useRef(null);
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '', address: '', dateOfBirth: '', emergencyContact: '', bio: '', department: '', position: '', employeeId: '', startDate: '', employmentType: '' });

  const showNotification = (message, type = 'success') => setToast({ message, type });

  const handleSave = async () => {
    try { await updateProfile({ name: formData.fullName }); setIsEditing(false); showNotification('Profile updated!'); }
    catch (error) { showNotification('Update failed', 'error'); }
  };

  const handleCancel = () => { loadProfileData(); setIsEditing(false); };
  const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (!file?.type.startsWith('image/')) { showNotification('Please select an image', 'error'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => { updateProfile({ avatar: ev.target.result }); showNotification('Avatar updated!'); };
    reader.readAsDataURL(file);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) { showNotification('Passwords do not match', 'error'); return; }
    if (passwordData.newPassword.length < 8) { showNotification('Password too short', 'error'); return; }
    await new Promise(r => setTimeout(r, 1000));
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setShowPasswordModal(false);
    showNotification('Password changed!');
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'employment', label: 'Employment', icon: Briefcase },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  const loadProfileData = async () => {
    setLoading(true);
    try {
      const res = await employeeAPI.getProfile();
      const data = res.data || res;
      setFormData({
        fullName: data.employeeProfile?.first_name ? `${data.employeeProfile.first_name} ${data.employeeProfile.last_name}` : data.user?.name || 'N/A',
        email: data.user?.email || 'N/A', phone: data.employeeProfile?.phone || 'Not provided',
        address: data.employeeProfile?.address || 'Not provided', dateOfBirth: data.employeeProfile?.date_of_birth ? data.employeeProfile.date_of_birth.split('T')[0] : '',
        emergencyContact: data.employeeProfile?.emergency_contact || 'Not provided', bio: data.employeeProfile?.bio || '',
        department: data.employeeProfile?.department || 'N/A', position: data.employeeProfile?.position || 'N/A',
        employeeId: data.employeeProfile?.employee_id || 'N/A', startDate: data.employeeProfile?.hire_date ? new Date(data.employeeProfile.hire_date).toLocaleDateString() : 'N/A',
        employmentType: data.employeeProfile?.employment_type || 'Full-time',
      });
    } catch (err) { showNotification('Failed to load profile', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadProfileData(); }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-12">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl"><User className="w-6 h-6 text-white" /></div>
              <div><h1 className="text-2xl font-black">My Profile</h1><p className="text-sm text-gray-500">Manage your personal information</p></div>
            </div>
            <button onClick={() => isEditing ? handleCancel() : setIsEditing(true)} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${isEditing ? 'bg-gray-100 text-gray-700' : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg'}`}>
              {isEditing ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}{isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 rounded-3xl shadow-2xl overflow-hidden relative">
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2" />
          <div className="relative px-8 py-12 pt-32 text-center">
            <div className="absolute -top-16 left-1/2 -translate-x-1/2">
              <div className="relative">
                <div className="w-36 h-36 bg-white rounded-full p-1 shadow-2xl">
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                    {user?.avatar ? <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" /> : <span className="text-5xl font-black text-gray-400">{formData.fullName.charAt(0)}</span>}
                  </div>
                </div>
                <input type="file" ref={avatarInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*" />
                <button onClick={() => avatarInputRef.current?.click()} className="absolute bottom-2 right-2 bg-white text-gray-700 p-2.5 rounded-full shadow-lg hover:bg-gray-50 transition-all hover:scale-110">
                  <Camera className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-white">{formData.fullName}</h2>
              <div className="flex items-center justify-center gap-2">
                <BadgeCheck className="w-5 h-5 text-blue-200" />
                <p className="text-xl text-white/90 font-medium">{formData.position}</p>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              {[{ icon: Mail, value: formData.email }, { icon: Phone, value: formData.phone }, { icon: MapPin, value: formData.address }].map((item, i) => (
                <div key={i} className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-white/90">
                  <item.icon className="w-4 h-4" /><span className="text-sm font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Department" value={formData.department} icon={Building} color="blue" />
          <StatCard label="Employee ID" value={formData.employeeId} icon={BadgeCheck} color="green" />
          <StatCard label="Start Date" value={formData.startDate} icon={Calendar} color="purple" />
          <StatCard label="Employment" value={formData.employmentType} icon={Sparkles} color="orange" />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-100">
            <div className="flex gap-1 p-2">
              {tabs.map((tab) => {
                const Icon = tab.icon, isActive = activeTab === tab.id;
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}>
                    <Icon className="w-4 h-4" />{tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-8">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-100 rounded-lg"><User className="w-5 h-5 text-blue-600" /></div>
                    <h3 className="text-xl font-bold">Personal Information</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Full Name" value={formData.fullName} onChange={(v) => handleChange('fullName', v)} disabled={!isEditing} icon={User} />
                    <InputField label="Email" value={formData.email} onChange={(v) => handleChange('email', v)} disabled={!isEditing} icon={Mail} />
                    <InputField label="Phone" value={formData.phone} onChange={(v) => handleChange('phone', v)} disabled={!isEditing} icon={Phone} />
                    <InputField label="Date of Birth" value={formData.dateOfBirth} onChange={(v) => handleChange('dateOfBirth', v)} disabled={!isEditing} type="date" icon={Calendar} />
                    <div className="md:col-span-2"><InputField label="Address" value={formData.address} onChange={(v) => handleChange('address', v)} disabled={!isEditing} icon={MapPin} /></div>
                    <div className="md:col-span-2"><InputField label="Bio" value={formData.bio} onChange={(v) => handleChange('bio', v)} disabled={!isEditing} textarea /></div>
                    <div className="md:col-span-2"><InputField label="Emergency Contact" value={formData.emergencyContact} onChange={(v) => handleChange('emergencyContact', v)} disabled={!isEditing} icon={Phone} /></div>
                  </div>
                  {isEditing && (
                    <div className="flex justify-end gap-3 mt-6">
                      <button onClick={handleCancel} className="px-6 py-2.5 rounded-xl font-medium text-gray-700 hover:bg-gray-100">Cancel</button>
                      <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg"><Save className="w-4 h-4" />Save Changes</button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'employment' && (
              <div className="space-y-8">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-purple-100 rounded-lg"><Briefcase className="w-5 h-5 text-purple-600" /></div>
                    <h3 className="text-xl font-bold">Employment Details</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Employee ID" value={formData.employeeId} disabled icon={BadgeCheck} />
                    <InputField label="Department" value={formData.department} onChange={(v) => handleChange('department', v)} disabled={!isEditing} icon={Building} />
                    <InputField label="Position" value={formData.position} onChange={(v) => handleChange('position', v)} disabled={!isEditing} icon={User} />
                    <InputField label="Start Date" value={formData.startDate} disabled icon={Calendar} />
                    <InputField label="Employment Type" value={formData.employmentType} disabled icon={Sparkles} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-emerald-100 rounded-lg"><TrendingUp className="w-5 h-5 text-emerald-600" /></div>
                    <h3 className="text-xl font-bold">Performance</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard label="Attendance" value="94%" icon={Activity} color="blue" />
                    <StatCard label="Goals" value="112%" icon={Target} color="green" />
                    <StatCard label="Rating" value="4.8/5" icon={Award} color="purple" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-red-100 rounded-lg"><Shield className="w-5 h-5 text-red-600" /></div>
                  <h3 className="text-xl font-bold">Security</h3>
                </div>
                {[{ icon: Lock, title: 'Change Password', desc: 'Update your password', action: 'Change', onClick: () => setShowPasswordModal(true) }, { icon: Shield, title: '2FA', desc: 'Add extra security', action: 'Enable' }, { icon: Settings, title: 'Privacy', desc: 'Control preferences', action: <ChevronRight className="w-5 h-5" /> }].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-300 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white rounded-xl"><item.icon className="w-6 h-6 text-gray-600" /></div>
                      <div><h4 className="font-bold">{item.title}</h4><p className="text-sm text-gray-500">{item.desc}</p></div>
                    </div>
                    <button onClick={item.onClick} className="px-4 py-2 bg-white border border-gray-200 rounded-xl font-medium text-sm hover:bg-gray-50">{item.action}</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Password Modal */}
      <Modal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} title="Change Password">
        <form onSubmit={handlePasswordSubmit} className="space-y-5">
          {[{ key: 'currentPassword', label: 'Current' }, { key: 'newPassword', label: 'New' }, { key: 'confirmPassword', label: 'Confirm' }].map(({ key, label }) => (
            <div key={key}>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-2">{label}</label>
              <div className="relative">
                <input type={showPasswords[key] ? 'text' : 'password'} value={passwordData[key]} onChange={(e) => setPasswordData(p => ({ ...p, [key]: e.target.value }))}
                  className="w-full px-4 py-3 pr-10 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" required />
                <button type="button" onClick={() => setShowPasswords(p => ({ ...p, [key]: !p[key] }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPasswords[key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm">Requirements</h4>
                <ul className="text-sm text-blue-600 mt-1"><li>• Min 8 chars • Upper & lower • Numbers</li></ul>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setShowPasswordModal(false)} className="flex-1 px-4 py-3 rounded-xl font-medium text-gray-700 hover:bg-gray-100">Cancel</button>
            <button type="submit" className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium">Update</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProfilePage;