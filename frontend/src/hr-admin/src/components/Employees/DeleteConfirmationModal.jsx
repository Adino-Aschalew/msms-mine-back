import { X, Trash2, AlertTriangle } from 'lucide-react';

export default function DeleteConfirmationModal({ isOpen, onClose, onConfirm, employeeName }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#0b0e14]/80 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div 
        className="relative glass-card w-full max-w-md rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden border border-white/10 animate-in zoom-in-95 duration-300 flex flex-col"
        role="dialog"
      >
        <div className="p-8 text-center">
          <div className="w-20 h-20 rounded-[2rem] bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(244,63,94,0.2)]">
            <Trash2 size={32} />
          </div>
          
          <h2 className="text-2xl font-black text-foreground tracking-tight mb-2">Delete Member?</h2>
          <p className="text-slate-400 font-medium mb-8">
            Are you sure you want to remove <span className="text-foreground font-bold">{employeeName}</span>? This action cannot be undone.
          </p>

          <div className="flex flex-col gap-3">
            <button 
              onClick={onConfirm}
              className="w-full py-4 text-xs font-black bg-rose-500 text-white rounded-2xl hover:bg-rose-600 transition-all shadow-xl shadow-rose-500/20 active:scale-[0.98] tracking-widest uppercase"
            >
              Confirm Deletion
            </button>
            <button 
              onClick={onClose}
              className="w-full py-4 text-xs font-black text-slate-400 hover:text-foreground hover:bg-white/5 rounded-2xl transition-all tracking-widest uppercase"
            >
              Keep Profile
            </button>
          </div>
        </div>
        
        <div className="px-8 py-4 bg-rose-500/5 border-t border-rose-500/10 flex items-center justify-center gap-2">
          <AlertTriangle size={14} className="text-rose-500" />
          <span className="text-[10px] font-black text-rose-500/80 uppercase tracking-widest">Permanent Action</span>
        </div>
      </div>
    </div>
  );
}
