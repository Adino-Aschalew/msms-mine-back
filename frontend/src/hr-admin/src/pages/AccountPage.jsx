import { useState } from 'react';
import { 
  User, 
  ShieldCheck, 
  MapPin, 
  Clock, 
  Settings2, 
  AlertTriangle,
  LogOut,
  Camera,
  Smartphone,
  Laptop,
  Mail,
  CheckCircle2,
  XCircle,
  Monitor
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const { theme, toggleTheme } = useTheme();

  const tabs = [
    { id: 'profile', label: 'Profile Settings', icon: User, desc: 'Personal info & avatar' },
    { id: 'security', label: 'Security & Password', icon: ShieldCheck, desc: 'Passwords & 2FA' },
    { id: 'sessions', label: 'Active Sessions', icon: MapPin, desc: 'Logged in devices' },
    { id: 'activity', label: 'Account Activity', icon: Clock, desc: 'Recent login history' },
    { id: 'preferences', label: 'Preferences', icon: Settings2, desc: 'Themes & notifications' },
    { id: 'danger', label: 'Danger Zone', icon: AlertTriangle, desc: 'Account deletion' },
  ];

  const Toggle = ({ defaultChecked = false }) => (
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" className="sr-only peer" defaultChecked={defaultChecked} />
      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-500"></div>
    </label>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">User Preferences</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your personal employee profile, security settings, and app preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start min-h-[600px]">
        {/* Navigation Sidebar */}
        <div className="w-full md:w-64 shrink-0 flex flex-col gap-2 relative">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isDanger = tab.id === 'danger';
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all text-left group ${
                  isActive && !isDanger
                    ? 'bg-primary-500/10 ring-1 ring-primary-500/30 text-primary-600 dark:text-primary-400' 
                    : isActive && isDanger
                    ? 'bg-rose-500/10 ring-1 ring-rose-500/30 text-rose-600 dark:text-rose-400'
                    : isDanger
                    ? 'hover:bg-rose-500/10 text-rose-500 hover:text-rose-600'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className={`p-2 rounded-xl transition-all ${
                  isActive && !isDanger ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' : 
                  isActive && isDanger ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' :
                  isDanger ? 'bg-rose-500/10 text-rose-500 group-hover:bg-rose-500 group-hover:text-white' :
                  'bg-slate-100 dark:bg-slate-800 text-muted-foreground group-hover:text-foreground'
                }`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate">{tab.label}</div>
                  {isActive && <div className={`text-[10px] font-medium truncate uppercase tracking-widest mt-0.5 ${isDanger ? 'text-rose-500/70' : 'text-primary-500/70'}`}>Active Section</div>}
                </div>
              </button>
            );
          })}
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 w-full min-w-0 space-y-6">
          
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                 <div className="h-40 bg-gradient-to-br from-primary-600 via-primary-500 to-indigo-600 relative">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                    <button className="absolute top-4 right-4 px-3 py-1.5 bg-black/30 hover:bg-black/50 text-white rounded-xl backdrop-blur-md transition-all text-[11px] font-bold flex items-center gap-2 border border-white/10 uppercase tracking-widest">
                      <Camera size={14} /> Edit Banner
                    </button>
                 </div>
                 <div className="px-6 pb-8 sm:px-10 sm:pb-10 relative">
                    <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end -mt-16 mb-10">
                      <div className="relative group">
                        <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-[2.5rem] bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border-[6px] border-card shadow-2xl group-hover:border-primary-500 transition-all duration-300">
                          <img src="https://i.pravatar.cc/150?img=11" alt="Profile" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                        </div>
                        <button className="absolute bottom-1 right-1 p-2.5 bg-primary-600 text-white rounded-2xl shadow-xl border-4 border-card hover:bg-primary-500 transition-all active:scale-95">
                          <Camera size={16} />
                        </button>
                      </div>
                      <div className="flex-1 pb-2">
                        <h2 className="text-3xl font-bold text-foreground">Alex Admin</h2>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2 py-0.5 bg-primary-500/10 text-primary-500 text-[10px] font-bold uppercase tracking-widest rounded-md border border-primary-500/20">Administrator</span>
                          <span className="text-sm text-muted-foreground font-medium">Product Design Lead · San Francisco, CA</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-1 block ml-1">First Name</label>
                        <input type="text" defaultValue="Alex" className="w-full px-4 py-3 bg-background border border-border rounded-xl outline-none focus:border-primary-500 transition-all font-semibold text-sm shadow-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-1 block ml-1">Last Name</label>
                        <input type="text" defaultValue="Admin" className="w-full px-4 py-3 bg-background border border-border rounded-xl outline-none focus:border-primary-500 transition-all font-semibold text-sm shadow-sm" />
                      </div>
                      <div className="md:col-span-2 space-y-1.5">
                        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-1 block ml-1">Work Email</label>
                        <div className="flex relative group">
                          <span className="inline-flex items-center px-4 border border-r-0 border-border bg-slate-50 dark:bg-slate-800/80 text-muted-foreground rounded-l-xl transition-colors">
                            <Mail size={16} />
                          </span>
                          <input type="email" defaultValue="alex.admin@hrsystem.com" disabled className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-border rounded-r-xl text-sm font-bold text-muted-foreground cursor-not-allowed opacity-70" />
                        </div>
                        <p className="text-[10px] text-muted-foreground font-bold mt-2 ml-1 uppercase tracking-tighter italic">Contact IT Support to change your organizational identifier.</p>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-1 block ml-1">Direct Phone</label>
                        <input type="tel" defaultValue="+1 (555) 000-0000" className="w-full px-4 py-3 bg-background border border-border rounded-xl outline-none focus:border-primary-500 transition-all font-semibold text-sm shadow-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-1 block ml-1">Internal Job Title</label>
                        <input type="text" defaultValue="Product Design Lead" disabled className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-border rounded-xl text-sm font-bold text-muted-foreground cursor-not-allowed opacity-70 transition-all" />
                      </div>
                    </div>
                 </div>
                 <div className="px-6 py-5 sm:px-10 border-t border-border bg-slate-50/30 dark:bg-slate-800/20 flex justify-end">
                   <button className="px-6 py-2.5 bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-primary-600/20 active:scale-95">
                     Save Profile Changes
                   </button>
                 </div>
              </div>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="p-5 border-b border-border bg-slate-50/50 dark:bg-slate-800/30">
                  <h3 className="text-sm font-semibold text-foreground">Change Password</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Ensure your account is using a long, random password to stay secure.</p>
                </div>
                <div className="p-6 flex flex-col md:flex-row gap-8">
                  <div className="flex-1 space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground block mb-1.5">Current Password</label>
                      <input type="password" placeholder="••••••••" className="w-full px-3 py-2 bg-background border border-border rounded-lg outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm transition" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground block mb-1.5">New Password</label>
                      <input type="password" placeholder="••••••••" className="w-full px-3 py-2 bg-background border border-border rounded-lg outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm transition" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground block mb-1.5">Confirm New Password</label>
                      <input type="password" placeholder="••••••••" className="w-full px-3 py-2 bg-background border border-border rounded-lg outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm transition" />
                    </div>
                    <button className="px-5 py-2 bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium rounded-lg transition-colors shadow-sm mt-2">
                       Update Password
                    </button>
                  </div>
                  <div className="w-full md:w-64 shrink-0 bg-slate-50 dark:bg-slate-800/30 p-5 rounded-xl border border-border self-start">
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-4">Password Requirements</h4>
                    <ul className="space-y-2.5">
                      <li className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400"><CheckCircle2 size={14}/> Minimum 8 characters</li>
                      <li className="flex items-center gap-2 text-xs text-muted-foreground"><XCircle size={14}/> At least one uppercase letter</li>
                      <li className="flex items-center gap-2 text-xs text-muted-foreground"><XCircle size={14}/> At least one number</li>
                      <li className="flex items-center gap-2 text-xs text-muted-foreground"><XCircle size={14}/> At least one special symbol</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="p-5 border-b border-border bg-slate-50/50 dark:bg-slate-800/30">
                  <h3 className="text-sm font-semibold text-foreground">Two-Factor Authentication (2FA)</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Add an extra layer of security to your account.</p>
                </div>
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border border-border rounded-xl bg-slate-50 dark:bg-slate-800/30">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-border text-primary-500">
                        <Smartphone size={24} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-foreground">Authenticator App</h4>
                        <p className="text-xs text-muted-foreground max-w-sm mt-1">Use an authenticator app directly on your mobile device to generate one-time codes.</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-border shadow-sm text-foreground text-sm font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shrink-0">
                      Setup 2FA
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PREFERENCES TAB */}
          {activeTab === 'preferences' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="p-5 border-b border-border bg-slate-50/50 dark:bg-slate-800/30">
                  <h3 className="text-sm font-semibold text-foreground">Appearance</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Customize the UI theme of your dashboard.</p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <button 
                      onClick={() => theme !== 'light' && toggleTheme()}
                      className={`relative flex flex-col gap-3 group text-left ${theme === 'light' ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      <div className={`w-full aspect-[4/3] rounded-xl border-2 transition-all p-2 bg-slate-100 ${theme === 'light' ? 'border-primary-500 ring-4 ring-primary-500/20' : 'border-slate-200 group-hover:border-slate-300'}`}>
                         <div className="w-full h-full bg-white rounded-md shadow-sm border border-slate-200 flex flex-col">
                           <div className="h-3 border-b border-slate-100 flex items-center px-2 shrink-0">
                             <div className="w-1.5 h-1.5 rounded-full bg-slate-200 mr-1"></div>
                             <div className="w-8 h-1 bg-slate-100 rounded"></div>
                           </div>
                           <div className="flex-1 flex gap-1 p-1 pl-0">
                             <div className="w-3 h-full border-r border-slate-100"></div>
                             <div className="flex-1 bg-slate-50 rounded-sm m-1 border border-slate-100"></div>
                           </div>
                         </div>
                      </div>
                      <div className="flex items-center justify-between">
                         <span className="text-sm font-semibold text-foreground">Light Mode</span>
                         {theme === 'light' && <CheckCircle2 size={16} className="text-primary-500" />}
                      </div>
                    </button>

                    <button 
                      onClick={() => theme !== 'dark' && toggleTheme()}
                      className={`relative flex flex-col gap-3 group text-left ${theme === 'dark' ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      <div className={`w-full aspect-[4/3] rounded-xl border-2 transition-all p-2 bg-slate-900 ${theme === 'dark' ? 'border-primary-500 ring-4 ring-primary-500/20' : 'border-slate-800 group-hover:border-slate-700'}`}>
                         <div className="w-full h-full bg-slate-950 rounded-md shadow-sm border border-slate-800 flex flex-col">
                           <div className="h-3 border-b border-slate-800 flex items-center px-2 shrink-0">
                             <div className="w-1.5 h-1.5 rounded-full bg-slate-800 mr-1"></div>
                             <div className="w-8 h-1 bg-slate-800 rounded"></div>
                           </div>
                           <div className="flex-1 flex gap-1 p-1 pl-0">
                             <div className="w-3 h-full border-r border-slate-800"></div>
                             <div className="flex-1 bg-slate-900 rounded-sm m-1 border border-slate-800"></div>
                           </div>
                         </div>
                      </div>
                      <div className="flex items-center justify-between">
                         <span className="text-sm font-semibold text-foreground text-left flex-1">Dark Mode</span>
                         {theme === 'dark' && <CheckCircle2 size={16} className="text-primary-500" />}
                      </div>
                    </button>

                    <button className="relative flex flex-col gap-3 group text-left cursor-not-allowed opacity-60">
                      <div className="w-full aspect-[4/3] rounded-xl border-2 border-dashed border-border p-2 bg-slate-50 dark:bg-slate-800/50 flex flex-col items-center justify-center text-slate-400">
                         <Monitor size={32} className="mb-2" />
                      </div>
                      <div className="flex items-center justify-between">
                         <span className="text-sm font-semibold text-foreground">System Sync</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="p-5 border-b border-border bg-slate-50/50 dark:bg-slate-800/30">
                  <h3 className="text-sm font-semibold text-foreground">Email Notifications</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Choose what updates you want to receive via email.</p>
                </div>
                <div className="p-0">
                  <div className="divide-y divide-border">
                    {[
                      { id: 'notif-1', label: 'News & Announcements', desc: 'Major generic product updates.', on: true },
                      { id: 'notif-2', label: 'Weekly Summary', desc: 'Get a weekly digest of HR activities.', on: true },
                      { id: 'notif-3', label: 'Leave Requests', desc: 'Immediate pings when employees request time-off.', on: true },
                      { id: 'notif-4', label: 'Security Alerts', desc: 'Warnings about unrecognized logins (Cannot be disabled).', on: true, disabled: true }
                    ].map(notif => (
                      <div key={notif.id} className="flex items-center justify-between p-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <div className="pr-4">
                          <p className={`text-sm font-semibold ${notif.disabled ? 'text-muted-foreground' : 'text-foreground'}`}>{notif.label}</p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notif.desc}</p>
                        </div>
                        <Toggle defaultChecked={notif.on} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SESSIONS TAB */}
          {activeTab === 'sessions' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="p-5 border-b border-border bg-slate-50/50 dark:bg-slate-800/30 flex justify-between items-center">
                   <div>
                     <h3 className="text-sm font-semibold text-foreground">Active Sessions</h3>
                     <p className="text-xs text-muted-foreground mt-0.5">Devices currently logged into your account.</p>
                   </div>
                   <button className="text-xs font-semibold text-rose-500 hover:text-rose-600 transition-colors">Revoke All Unknown</button>
                </div>
                <div className="p-0 divide-y divide-border">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors bg-blue-50/30 dark:bg-blue-900/10">
                    <div className="flex gap-4 items-start">
                      <div className="p-2.5 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl shrink-0">
                        <Laptop size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground flex items-center gap-2">Windows PC · Chrome Browser <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 rounded">Current Session</span></p>
                        <p className="text-xs text-muted-foreground mt-1">San Francisco, CA • IP: 192.168.1.1</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Last active: Just now</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <div className="flex gap-4 items-start">
                      <div className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl shrink-0">
                        <Smartphone size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">iPhone 14 Pro · Safari Mobile</p>
                        <p className="text-xs text-muted-foreground mt-1">Los Angeles, CA • IP: 104.28.10.1</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Last active: 2 days ago</p>
                      </div>
                    </div>
                    <button className="px-3 py-1.5 border border-border shadow-sm bg-white dark:bg-slate-800 text-foreground hover:text-rose-500 hover:border-rose-200 dark:hover:border-rose-900 text-xs font-semibold rounded-lg transition-colors">
                      Revoke Access
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ACTIVITY TAB */}
          {activeTab === 'activity' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
               <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="p-5 border-b border-border bg-slate-50/50 dark:bg-slate-800/30">
                  <h3 className="text-sm font-semibold text-foreground">Recent Security Activity</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Security log spanning the last 30 days.</p>
                </div>
                <div className="p-6 md:p-8">
                  <div className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-3 space-y-8">
                    {[
                      { title: 'Password changed successfully', time: 'Today at 10:45 AM', color: 'bg-emerald-500', desc: 'Password was updated via the Account Settings page.' },
                      { title: 'Logged in from new device (MacBook Pro)', time: 'Yesterday at 3:20 PM', color: 'bg-blue-500', desc: 'Session authenticated via Google SSO.' },
                      { title: 'Updated Notification Preferences', time: 'Mar 12, 2026 at 11:15 AM', color: 'bg-slate-400', desc: 'Disabled News & Announcements emails.' },
                      { title: 'Failed login attempt (Location: Unknown)', time: 'Mar 10, 2026 at 02:00 AM', color: 'bg-rose-500', desc: 'Invalid password attempted three times.' }
                    ].map((act, i) => (
                      <div key={i} className="relative pl-6 sm:pl-8">
                        <span className={`absolute -left-2 sm:-left-2.5 top-1.5 w-4 h-4 rounded-full ${act.color} ring-4 ring-card`}></span>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{act.title}</p>
                          <p className="text-[11px] text-muted-foreground mb-1">{act.time}</p>
                          <p className="text-xs text-slate-500">{act.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
               </div>
            </div>
          )}

          {/* DANGER ZONE TAB */}
          {activeTab === 'danger' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <div className="bg-rose-50/30 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-xl shadow-sm overflow-hidden p-6 relative">
                 <AlertTriangle size={120} className="absolute -bottom-6 -right-6 text-rose-100 dark:text-rose-900/30 rotate-12" />
                 <div className="relative z-10 max-w-xl">
                    <h3 className="text-lg font-bold text-rose-600 dark:text-rose-500 mb-2">Delete Account</h3>
                    <p className="text-sm text-foreground mb-6">Once you delete your account, there is no going back. All your data, settings, and generated reports will be permanently wiped from the internal system.</p>
                    
                    <div className="space-y-4">
                       <label className="text-sm font-semibold text-foreground block">To verify, type <span className="bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-400 px-1.5 py-0.5 rounded italic selection:bg-rose-300">delete my account</span> below:</label>
                       <input type="text" className="w-full max-w-sm px-3 py-2 bg-background border border-rose-200 dark:border-rose-900 rounded-lg outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 text-sm transition" />
                       <button className="block w-full max-w-sm px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm">
                         Delete Account Permanently
                       </button>
                    </div>
                 </div>
              </div>

               <div className="bg-amber-50/30 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-xl shadow-sm overflow-hidden p-6">
                 <h3 className="text-base font-bold text-foreground mb-2">Force Log Out</h3>
                 <p className="text-sm text-muted-foreground mb-4">If you notice suspicious activity, you can immediately invalidate all active sessions across all devices.</p>
                 <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/30 text-amber-700 dark:text-amber-500 text-sm font-semibold rounded-lg transition-colors shadow-sm">
                   <LogOut size={16} /> Log Out Everywhere
                 </button>
               </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
