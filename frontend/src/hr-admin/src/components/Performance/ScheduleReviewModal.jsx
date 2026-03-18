import { useState } from 'react';
import { X, Calendar, User, Clock, Info, ShieldCheck } from 'lucide-react';

export default function ScheduleReviewModal({ isOpen, onClose, onSchedule }) {
  const [formData, setFormData] = useState({
    employee: '',
    type: 'Annual Review',
    date: '',
    reviewer: '',
    notes: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSchedule(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-xl glass-card rounded-[2.5rem] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary-600 via-primary-400 to-primary-600"></div>
        
        <div className="p-10">
          <div className="flex justify-between items-start mb-10">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-primary-500 shadow-xl shadow-primary-500/20 flex items-center justify-center text-white">
                <Calendar size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-foreground tracking-tight">Schedule Review</h2>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Configure new assessment session</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-3 text-slate-400 hover:text-foreground hover:bg-white/5 rounded-2xl transition-all"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2.5">
                <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                  <User size={12} className="text-primary-500" /> Employee Name
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-primary-500 focus:bg-white/[0.08] transition-all text-sm font-bold text-foreground placeholder:text-slate-500/50"
                  value={formData.employee}
                  onChange={(e) => setFormData({...formData, employee: e.target.value})}
                />
              </div>

              <div className="space-y-2.5">
                <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                  <ShieldCheck size={12} className="text-primary-500" /> Reviewer
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. David Chen"
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-primary-500 focus:bg-white/[0.08] transition-all text-sm font-bold text-foreground placeholder:text-slate-500/50"
                  value={formData.reviewer}
                  onChange={(e) => setFormData({...formData, reviewer: e.target.value})}
                />
              </div>

              <div className="space-y-2.5">
                <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                   Review Type
                </label>
                <select
                  required
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-primary-500 focus:bg-white/[0.08] transition-all text-sm font-bold text-foreground appearance-none cursor-pointer"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                >
                  <option className="bg-slate-900" value="Annual Review">Annual Review</option>
                  <option className="bg-slate-900" value="Q-Check-in">Q-Check-in</option>
                  <option className="bg-slate-900" value="Probation">Probation</option>
                  <option className="bg-slate-900" value="Project Eval">Project Eval</option>
                </select>
              </div>

              <div className="space-y-2.5">
                <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                  <Clock size={12} className="text-primary-500" /> Target Date
                </label>
                <input
                  required
                  type="date"
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-primary-500 focus:bg-white/[0.08] transition-all text-sm font-bold text-foreground cursor-pointer"
                  value={formData.date}
                  onChange={(e) => (setFormData({...formData, date: e.target.value}))}
                />
              </div>
            </div>

            <div className="space-y-2.5">
                <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                  <Info size={12} className="text-primary-500" /> Additional Notes
                </label>
                <textarea
                  rows="3"
                  placeholder="Focus areas, goals, or specific feedback points..."
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-primary-500 focus:bg-white/[0.08] transition-all text-sm font-bold text-foreground placeholder:text-slate-500/50 resize-none"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-foreground hover:bg-white/5 rounded-2xl transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-2 py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary-600/20 active:scale-[0.98] transition-all px-12"
              >
                Schedule Session
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
