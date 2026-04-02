import { useState } from 'react';
import { 
  Building, 
  Users, 
  Link as LinkIcon, 
  CreditCard,
  Save,
  Check,
  Upload,
  Globe,
  Plus,
  ArrowUpRight,
  ShieldAlert,
  Download
} from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('organization');

  const tabs = [
    { id: 'organization', label: 'Company Profile', icon: Building, desc: 'Corporate identity & operations.' },
    { id: 'roles', label: 'Roles & Permissions', icon: Users, desc: 'Access control & hierarchies.' },
    { id: 'integrations', label: 'Integrations', icon: LinkIcon, desc: 'Slack, Google, & payroll.' },
    { id: 'billing', label: 'Plan & Billing', icon: CreditCard, desc: 'Subscriptions & invoices.' },
  ];

  const Toggle = ({ defaultChecked = false }) => (
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" className="sr-only peer" defaultChecked={defaultChecked} />
      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-500"></div>
    </label>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Platform Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">Configure global HR system parameters, integrations, and billing.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-border bg-background hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-sm font-medium transition flex items-center gap-2">
            Discard Changes
          </button>
          <button className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm font-medium transition shadow-sm flex items-center gap-2">
            <Save size={16} /> Save Settings
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start min-h-[600px]">
        {}
        <div className="w-full md:w-64 shrink-0 flex flex-col gap-2 relative">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all text-left group ${
                  isActive 
                    ? 'bg-primary-500/10 ring-1 ring-primary-500/30 text-primary-600 dark:text-primary-400' 
                    : 'bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50 text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' : 'bg-slate-100 dark:bg-slate-800 text-muted-foreground group-hover:text-foreground'}`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate">{tab.label}</div>
                  {isActive && <div className="text-[10px] font-medium text-primary-500/70 truncate uppercase tracking-widest mt-0.5">Active Section</div>}
                </div>
              </button>
            );
          })}
        </div>

        {}
        <div className="flex-1 w-full min-w-0">
          
          {}
          {activeTab === 'organization' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              {}
              <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
                <div className="p-5 border-b border-border bg-slate-50/50 dark:bg-slate-800/30">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                    Company Branding
                  </h3>
                  <p className="text-[11px] font-medium text-muted-foreground mt-0.5 ml-3.5">Customize your corporate identity.</p>
                </div>
                <div className="p-8">
                  <div className="flex flex-col sm:flex-row gap-8 items-start">
                    <div className="w-28 h-28 rounded-[2rem] bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-border flex flex-col items-center justify-center text-slate-400 hover:text-primary-500 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-all cursor-pointer group shrink-0 shadow-inner">
                      <Upload size={24} className="mb-2 group-hover:-translate-y-1 transition-transform" />
                      <span className="text-[10px] font-bold tracking-widest uppercase">Upload</span>
                    </div>
                    <div className="flex-1 space-y-6 w-full">
                      <div className="max-w-md">
                        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2 block ml-1">Company Name</label>
                        <input type="text" defaultValue="Acme Corporation" className="w-full px-4 py-3 bg-background border border-border rounded-xl outline-none focus:border-primary-500 transition-all font-medium text-sm shadow-sm" />
                      </div>
                      <div className="max-w-md">
                        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2 block ml-1">Company Website</label>
                        <div className="flex relative group">
                          <span className="inline-flex items-center px-4 border border-r-0 border-border bg-slate-50/80 dark:bg-slate-800/80 text-muted-foreground text-xs font-bold rounded-l-xl">https:
                          <input type="text" defaultValue="acmecorp.com" className="flex-1 px-4 py-3 bg-background border border-border rounded-r-xl outline-none focus:border-primary-500 transition-all font-medium text-sm shadow-sm" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {}
              <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-700">
                <div className="p-5 border-b border-border bg-slate-50/50 dark:bg-slate-800/30">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                    Legal Information
                  </h3>
                  <p className="text-[11px] font-medium text-muted-foreground mt-0.5 ml-3.5">Registration details for payroll and tax.</p>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2 block ml-1">Registration Number</label>
                    <input type="text" defaultValue="REG-9982441-A" className="w-full px-4 py-3 bg-background border border-border rounded-xl outline-none focus:border-primary-500 transition-all font-semibold text-sm shadow-sm" />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2 block ml-1">Tax ID / EIN</label>
                    <input type="text" defaultValue="XX-XXXXXXX" className="w-full px-4 py-3 bg-background border border-border rounded-xl outline-none focus:border-primary-500 transition-all font-semibold text-sm shadow-sm" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2 block ml-1">Headquarters Address</label>
                    <textarea rows="3" defaultValue="123 Innovation Drive, Tech Valley, CA 94043\nUnited States" className="w-full px-4 py-3 bg-background border border-border rounded-xl outline-none focus:border-primary-500 transition-all font-medium text-sm shadow-sm resize-none"></textarea>
                  </div>
                </div>
              </div>

              {}
              <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-1000">
                <div className="p-5 border-b border-border bg-slate-50/50 dark:bg-slate-800/30">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                    Localization
                  </h3>
                </div>
                <div className="p-8 grid grid-cols-1 sm:grid-cols-3 gap-8">
                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2 block ml-1">Timezone</label>
                    <select className="w-full px-4 py-3 bg-background border border-border rounded-xl outline-none focus:border-primary-500 transition-all font-bold text-xs shadow-sm appearance-none">
                      <option>(GMT-08:00) Pacific Time</option>
                      <option>(GMT-05:00) Eastern Time</option>
                      <option>(GMT+00:00) London</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2 block ml-1">Base Currency</label>
                    <select className="w-full px-4 py-3 bg-background border border-border rounded-xl outline-none focus:border-primary-500 transition-all font-bold text-xs shadow-sm appearance-none">
                      <option>USD ($)</option>
                      <option>EUR (€)</option>
                      <option>GBP (£)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2 block ml-1">Date Format</label>
                    <select className="w-full px-4 py-3 bg-background border border-border rounded-xl outline-none focus:border-primary-500 transition-all font-bold text-xs shadow-sm appearance-none">
                      <option>MM/DD/YYYY</option>
                      <option>DD/MM/YYYY</option>
                      <option>YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {}
          {activeTab === 'roles' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex justify-between items-center bg-card border border-border rounded-xl p-5 shadow-sm">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Role Management</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Control what different users can see and do.</p>
                </div>
                <button className="flex items-center gap-2 px-3 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm font-medium transition shadow-sm">
                  <Plus size={16} /> Create Role
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'Super Admin', desc: 'Full access to all modules, billing, and system configuration.', members: 2, perms: 'All Permissions', isSystem: true, danger: true },
                  { name: 'HR Manager', desc: 'Can manage employees, view performance, and generate reports.', members: 5, perms: '42 Permissions', isSystem: true },
                  { name: 'Department Head', desc: 'View metrics and approve leave for department members.', members: 12, perms: '18 Permissions' },
                  { name: 'Employee', desc: 'Basic access to own profile, directory, and leave requests.', members: 1234, perms: '5 Permissions', isSystem: true }
                ].map((role, i) => (
                  <div key={i} className="bg-card border border-border rounded-xl p-5 shadow-sm hover:ring-1 hover:ring-primary-500/50 transition relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
                        {role.name}
                        {role.danger && <ShieldAlert size={14} className="text-rose-500" />}
                        {role.isSystem && <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-500 rounded uppercase tracking-wider text-[9px]">Default</span>}
                      </h4>
                      <div className="px-2 py-0.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium text-xs rounded-full">
                        {role.members} users
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-4 line-clamp-2 h-8">{role.desc}</p>
                    <div className="flex justify-between items-center pt-3 border-t border-border mt-auto">
                      <span className="text-xs font-medium text-slate-500">{role.perms}</span>
                      <button className="text-xs font-semibold text-primary-600 dark:text-primary-400 group-hover:underline">Edit Role</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {}
          {activeTab === 'integrations' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { name: 'Slack', category: 'Communication', desc: 'Send automated leave requests and daily HR briefing summaries directly to Slack channels.', logo: 'https:
                  { name: 'Google Workspace', category: 'Identity & SSO', desc: 'Enable Single Sign-On (SSO) and auto-sync employee calendars with company holidays.', logo: 'https:
                  { name: 'Gusto', category: 'Payroll', desc: 'Sync hours worked, approved leaves, and update employee bank details directly.', logo: 'https:
                  { name: 'Zoom', category: 'Interviews', desc: 'Automatically generate and attach meeting links for scheduled candidate interviews.', logo: 'https:
                ].map((app, i) => (
                  <div key={i} className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-center p-2.5">
                        <img src={app.logo} alt={app.name} className="w-full h-full object-contain" />
                      </div>
                      <Toggle defaultChecked={app.active} />
                    </div>
                    <h4 className="font-semibold text-foreground text-sm">{app.name}</h4>
                    <span className="text-[10px] font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-2 block">{app.category}</span>
                    <p className="text-xs text-muted-foreground mb-4 flex-1">{app.desc}</p>
                    <div className="pt-3 border-t border-border flex justify-between items-center">
                      <span className={`text-xs font-medium flex items-center gap-1.5 ${app.active ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>
                         <span className={`w-2 h-2 rounded-full ${app.active ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}></span>
                         {app.active ? 'Connected' : 'Not Configured'}
                      </span>
                      {app.active && <button className="text-xs font-semibold text-foreground hover:underline">Settings</button>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {}
          {activeTab === 'billing' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              {}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/20 blur-[80px] rounded-full"></div>
                
                <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                  <div>
                    <span className="inline-block px-2.5 py-1 bg-white/10 rounded-full text-[10px] font-bold border border-white/20 mb-2 uppercase tracking-wider text-primary-200">Current Plan</span>
                    <h2 className="text-2xl font-bold flex items-center gap-2">Enterprise HR Suite <span className="bg-primary-500 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded">Annual</span></h2>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="text-3xl font-bold">$4,990<span className="text-slate-400 text-sm font-medium ml-1">/ yr</span></div>
                    <p className="text-xs text-slate-400 mt-1">Renews on Oct 1st, 2026</p>
                  </div>
                </div>

                <div className="relative z-10">
                  <div className="flex justify-between text-xs font-medium text-slate-300 mb-2">
                    <span>1,245 Active Employees</span>
                    <span>1,500 Limit</span>
                  </div>
                  <div className="w-full bg-slate-700/50 rounded-full h-2 mb-4 border border-slate-600">
                    <div className="bg-gradient-to-r from-primary-500 to-indigo-500 h-2 rounded-full w-[83%] relative">
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow border-2 border-primary-500"></div>
                    </div>
                  </div>
                  <button className="text-xs font-semibold text-primary-300 hover:text-white transition flex items-center gap-1">
                    Upgrade Capacity <ArrowUpRight size={14} />
                  </button>
                </div>
              </div>

              {}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                  <h3 className="text-sm font-semibold text-foreground mb-4">Payment Method</h3>
                  <div className="p-4 border border-border rounded-lg bg-slate-50 dark:bg-slate-800/30 flex items-center gap-4">
                    <div className="w-12 h-8 bg-slate-900 rounded flex items-center justify-center text-white font-bold italic text-sm">
                      VISA
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">•••• •••• •••• 4242</p>
                      <p className="text-xs text-muted-foreground">Expires 12/28</p>
                    </div>
                    <button className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline">Edit</button>
                  </div>
                  <button className="w-full mt-4 py-2 border border-border bg-background hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-xs font-semibold transition">
                    + Add Backup Method
                  </button>
                </div>

                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
                  <div className="p-5 border-b border-border bg-slate-50/50 dark:bg-slate-800/30 flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-foreground">Billing History</h3>
                    <button className="text-xs font-medium text-primary-600 dark:text-primary-400">View All</button>
                  </div>
                  <div className="flex-1 overflow-auto">
                    <table className="w-full text-xs text-left">
                      <tbody className="divide-y divide-border">
                        {[
                          { date: 'Oct 01, 2025', amt: '$4,990.00', status: 'Paid' },
                          { date: 'Oct 01, 2024', amt: '$4,990.00', status: 'Paid' },
                          { date: 'Oct 01, 2023', amt: '$3,490.00', status: 'Paid' },
                        ].map((inv, i) => (
                          <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                            <td className="px-4 py-3 font-medium text-foreground">{inv.date}</td>
                            <td className="px-4 py-3 text-foreground">{inv.amt}</td>
                            <td className="px-4 py-3"><span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 rounded-full font-medium">{inv.status}</span></td>
                            <td className="px-4 py-3 text-right">
                              <button className="text-muted-foreground hover:text-foreground"><Download size={14}/></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
