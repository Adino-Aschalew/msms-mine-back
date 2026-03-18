import React, { useState } from 'react';
import {
  FiSettings,
  FiSun,
  FiMoon,
  FiMonitor,
  FiBell,
  FiShield,
  FiLock,
  FiTrash2,
  FiDownload,
  FiCheck,
  FiAlertCircle,
  FiEye,
  FiEyeOff,
} from 'react-icons/fi';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../../../shared/contexts/AuthContext';

const Section = ({ title, description, children }) => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
      <h3 className="text-sm font-black uppercase tracking-widest text-gray-700 dark:text-gray-300">{title}</h3>
      {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const Toggle = ({ label, description, checked, onChange }) => (
  <div className="flex items-center justify-between py-3">
    <div>
      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{label}</p>
      {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
    </div>
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
        checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
      }`}
    >
      <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${checked ? 'translate-x-5' : ''}`} />
    </button>
  </div>
);

const AccountSettingsPage = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const [notifications, setNotifications] = useState({
    loanUpdates: true,
    payrollAlerts: true,
    savingsDigest: false,
    guarantorRequests: true,
    systemAnnouncements: true,
    emailDigest: false,
  });

  const [privacy, setPrivacy] = useState({
    showProfile: true,
    activityVisible: false,
    twoFactor: false,
  });

  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [showPasswords, setShowPasswords] = useState({ current: false, next: false, confirm: false });
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [activeTab, setActiveTab] = useState('appearance');

  const tabs = [
    { id: 'appearance', label: 'Appearance', icon: FiSun },
    { id: 'notifications', label: 'Notifications', icon: FiBell },
    { id: 'security', label: 'Security', icon: FiShield },
    { id: 'data', label: 'Data', icon: FiDownload },
  ];

  const themeOptions = [
    { id: 'light', label: 'Light', icon: FiSun, desc: 'Clean white interface' },
    { id: 'dark', label: 'Dark', icon: FiMoon, desc: 'Easy on the eyes' },
    { id: 'system', label: 'System', icon: FiMonitor, desc: 'Follows OS setting' },
  ];

  const handlePasswordChange = (e) => {
    e.preventDefault();
    setPasswordError('');
    if (passwords.current !== 'password') {
      setPasswordError('Current password is incorrect.');
      return;
    }
    if (passwords.next.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }
    if (passwords.next !== passwords.confirm) {
      setPasswordError('New passwords do not match.');
      return;
    }
    setPasswordSuccess(true);
    setPasswords({ current: '', next: '', confirm: '' });
    setTimeout(() => setPasswordSuccess(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Account Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Manage preferences, notifications, and security for your account.</p>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl w-fit">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-150 ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Appearance Tab */}
      {activeTab === 'appearance' && (
        <div className="space-y-4">
          <Section title="Theme" description="Choose how the interface looks">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {themeOptions.map(opt => {
                const Icon = opt.icon;
                const isActive = theme === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={toggleTheme}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                      isActive
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-800 dark:text-gray-200'}`}>{opt.label}</p>
                      <p className="text-xs text-gray-400">{opt.desc}</p>
                    </div>
                    {isActive && <FiCheck className="w-4 h-4 text-blue-600 ml-auto" />}
                  </button>
                );
              })}
            </div>
          </Section>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="space-y-4">
          <Section title="In-App Alerts" description="Receive alerts inside the dashboard">
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              <Toggle label="Loan Updates" description="Approval, rejection, and disbursement notices" checked={notifications.loanUpdates} onChange={v => setNotifications(p => ({ ...p, loanUpdates: v }))} />
              <Toggle label="Payroll Alerts" description="Salary processed and deduction confirmations" checked={notifications.payrollAlerts} onChange={v => setNotifications(p => ({ ...p, payrollAlerts: v }))} />
              <Toggle label="Savings Digest" description="Monthly savings summary" checked={notifications.savingsDigest} onChange={v => setNotifications(p => ({ ...p, savingsDigest: v }))} />
              <Toggle label="Guarantor Requests" description="When someone requests you as a guarantor" checked={notifications.guarantorRequests} onChange={v => setNotifications(p => ({ ...p, guarantorRequests: v }))} />
              <Toggle label="System Announcements" description="Important platform updates and downtime notices" checked={notifications.systemAnnouncements} onChange={v => setNotifications(p => ({ ...p, systemAnnouncements: v }))} />
            </div>
          </Section>

          <Section title="Email Notifications" description="Notifications delivered to your email">
            <Toggle label="Weekly Email Digest" description={`Sent to ${user?.email}`} checked={notifications.emailDigest} onChange={v => setNotifications(p => ({ ...p, emailDigest: v }))} />
          </Section>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-4">
          <Section title="Change Password" description="Update your login credentials">
            {passwordSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-2">
                <FiCheck className="w-4 h-4 text-emerald-600" />
                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Password changed successfully.</p>
              </div>
            )}
            {passwordError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-2">
                <FiAlertCircle className="w-4 h-4 text-red-500" />
                <p className="text-sm font-bold text-red-600 dark:text-red-400">{passwordError}</p>
              </div>
            )}
            <form onSubmit={handlePasswordChange} className="space-y-4">
              {[
                { key: 'current', label: 'Current Password', placeholder: 'Enter current password' },
                { key: 'next', label: 'New Password', placeholder: 'At least 8 characters' },
                { key: 'confirm', label: 'Confirm New Password', placeholder: 'Re-enter new password' },
              ].map(({ key, label, placeholder }) => (
                <div key={key} className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-gray-400 tracking-widest">{label}</label>
                  <div className="relative">
                    <input
                      type={showPasswords[key] ? 'text' : 'password'}
                      value={passwords[key]}
                      onChange={e => setPasswords(p => ({ ...p, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className="w-full px-4 py-3 pr-10 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 text-sm text-gray-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(p => ({ ...p, [key]: !p[key] }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords[key] ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="submit"
                disabled={!passwords.current || !passwords.next || !passwords.confirm}
                className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-black uppercase tracking-widest text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
              >
                <FiLock className="inline w-4 h-4 mr-2" />
                Update Password
              </button>
            </form>
          </Section>

          <Section title="Privacy" description="Control your account visibility">
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              <Toggle label="Show Profile to Colleagues" description="Others can see your basic profile info" checked={privacy.showProfile} onChange={v => setPrivacy(p => ({ ...p, showProfile: v }))} />
              <Toggle label="Activity Visibility" description="Show when you were last active" checked={privacy.activityVisible} onChange={v => setPrivacy(p => ({ ...p, activityVisible: v }))} />
              <Toggle label="Two-Factor Authentication" description="Require OTP on login (requires HR setup)" checked={privacy.twoFactor} onChange={v => setPrivacy(p => ({ ...p, twoFactor: v }))} />
            </div>
          </Section>

          <Section title="Active Sessions">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700">
              <div>
                <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Current Session</p>
                <p className="text-xs text-gray-400">This device • Active now</p>
              </div>
              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded uppercase tracking-widest">Active</span>
            </div>
          </Section>
        </div>
      )}

      {/* Data Tab */}
      {activeTab === 'data' && (
        <div className="space-y-4">
          <Section title="Export Your Data" description="Download a copy of your account data">
            <div className="space-y-3">
              {[
                { label: 'Payroll History', desc: 'All payroll records as CSV', format: 'CSV' },
                { label: 'Savings History', desc: 'Monthly savings deductions', format: 'CSV' },
                { label: 'Loan Records', desc: 'Loan requests and repayments', format: 'PDF' },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-700 rounded-xl">
                  <div>
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{row.label}</p>
                    <p className="text-xs text-gray-400">{row.desc}</p>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-xs font-bold uppercase tracking-wider">
                    <FiDownload className="w-3.5 h-3.5" />
                    {row.format}
                  </button>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Danger Zone" description="Irreversible account actions">
            <div className="space-y-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl">
                <div className="flex items-start gap-3 mb-4">
                  <FiAlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-red-800 dark:text-red-400 uppercase tracking-tight">Delete Account</p>
                    <p className="text-xs text-red-600 dark:text-red-500 mt-1">
                      This will permanently delete your account and all associated data. This action cannot be undone. Please contact HR after submitting.
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Type <span className="font-black">DELETE</span> to confirm</label>
                  <input
                    type="text"
                    value={deleteConfirm}
                    onChange={e => setDeleteConfirm(e.target.value)}
                    placeholder="DELETE"
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-red-300 dark:border-red-700 rounded-lg outline-none text-sm text-gray-900 dark:text-white"
                  />
                  <button
                    disabled={deleteConfirm !== 'DELETE'}
                    onClick={logout}
                    className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black uppercase tracking-widest text-sm disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    <FiTrash2 className="w-4 h-4" />
                    Delete My Account
                  </button>
                </div>
              </div>
            </div>
          </Section>
        </div>
      )}
    </div>
  );
};

export default AccountSettingsPage;
