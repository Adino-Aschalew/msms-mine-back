import { X, Mail, Phone, MapPin, Calendar, Briefcase, DollarSign, Award, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function ViewEmployeeModal({ isOpen, onClose, employee }) {
  if (!isOpen || !employee) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {}
      <div 
        className="absolute inset-0 bg-[#0b0e14]/60 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />
      
      {}
      <div 
        className="relative glass-card w-full max-w-3xl rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden border border-white/10 animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]"
        role="dialog"
      >
        {}
        <div className="h-40 bg-gradient-to-br from-primary-600 to-indigo-900 relative shrink-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.1),transparent_70%)]"></div>
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-3 bg-black/20 hover:bg-black/40 text-white rounded-2xl backdrop-blur-md transition-all duration-300 z-10"
          >
            <X size={20} />
          </button>
        </div>

        {}
        <div className="px-10 pb-10 -mt-16 flex-1 overflow-y-auto custom-scrollbar">
          <div className="flex flex-col md:flex-row gap-8 items-start mb-10">
            <div className="relative shrink-0">
              <img 
                src={employee.avatar} 
                alt={employee.name} 
                className="w-32 h-32 rounded-[2.5rem] border-4 border-[#0b0e14] shadow-2xl object-cover bg-slate-800"
              />
              <div className={`absolute bottom-2 right-2 w-6 h-6 rounded-full border-4 border-[#0b0e14] ${employee.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
            </div>
            <div className="pt-16 md:pt-20">
              <h2 className="text-3xl font-black text-foreground tracking-tight">{employee.name}</h2>
              <div className="flex flex-wrap items-center gap-4 mt-2">
                <span className="text-primary-400 font-bold text-sm tracking-wide">{employee.role}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
                <span className="text-slate-400 font-medium text-sm">{employee.department}</span>
              </div>
            </div>
            <div className="md:ml-auto pt-16 md:pt-20 flex gap-3">
              <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/5 bg-white/5 ${
                employee.status === 'Active' ? 'text-emerald-400' : 'text-slate-400'
              }`}>
                {employee.status}
              </span>
            </div>
          </div>

          {}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {}
            <div className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                <Mail size={12} className="text-primary-500" />
                Contact Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
                    <Mail size={18} />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Email Address</div>
                    <div className="text-sm font-bold text-foreground">{employee.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 opacity-60">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
                    <Phone size={18} />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Phone Number</div>
                    <div className="text-sm font-bold text-foreground">+1 (555) 000-0000</div>
                  </div>
                </div>
              </div>
            </div>

            {}
            <div className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                <Briefcase size={12} className="text-primary-500" />
                Employment Details
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Join Date</div>
                    <div className="text-sm font-bold text-foreground">{format(new Date(employee.dateJoined), 'MMMM do, yyyy')}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
                    <DollarSign size={18} />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Annual Salary</div>
                    <div className="text-sm font-bold text-foreground">${employee.salary.toLocaleString()} / year</div>
                  </div>
                </div>
              </div>
            </div>

            {}
            <div className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                <Award size={12} className="text-amber-500" />
                Performance Metrics
              </h3>
              <div className="p-6 rounded-[2rem] bg-gradient-to-br from-white/[0.04] to-transparent border border-white/5">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <div className="text-3xl font-black text-foreground">{employee.performance}%</div>
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Overall Rating</div>
                  </div>
                  <div className="px-3 py-1 bg-primary-500/10 text-primary-500 rounded-lg text-[10px] font-black uppercase tracking-widest">
                    Top 10%
                  </div>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all duration-1000 ease-out"
                    style={{ width: `${employee.performance}%` }}
                  />
                </div>
              </div>
            </div>

            {}
            <div className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                <Clock size={12} className="text-primary-500" />
                System Activity
              </h3>
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex gap-4">
                   <div className="text-sm font-medium text-slate-400">Employee ID:</div>
                   <div className="text-sm font-black text-foreground">{employee.id}</div>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex gap-4">
                   <div className="text-sm font-medium text-slate-400">Reports to:</div>
                   <div className="text-sm font-black text-foreground">{employee.manager || 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
