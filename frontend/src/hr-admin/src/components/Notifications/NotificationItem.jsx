import { Bell, Info, AlertTriangle, FileText, Check, ExternalLink } from 'lucide-react';

export default function NotificationItem({ notification, onMarkRead, onViewDetail }) {
  const getIcon = () => {
    switch (notification.type) {
      case 'request': return <FileText className="text-blue-500" size={16} />;
      case 'alert': return <AlertTriangle className="text-amber-500" size={16} />;
      case 'system': return <Bell className="text-rose-500" size={16} />;
      default: return <Info className="text-primary-500" size={16} />;
    }
  };

  const getBgColor = () => {
    switch (notification.type) {
      case 'request': return 'bg-blue-500/10';
      case 'alert': return 'bg-amber-500/10';
      case 'system': return 'bg-rose-500/10';
      default: return 'bg-primary-500/10';
    }
  };

  return (
    <div className={`p-4 transition-all duration-300 border-l-2 ${notification.isRead ? 'border-transparent bg-transparent' : 'border-primary-500 bg-primary-500/[0.03]'} hover:bg-slate-100/50 dark:hover:bg-white/[0.03] group relative`}>
      <div className="flex gap-4">
        <div className={`w-10 h-10 rounded-xl ${getBgColor()} flex items-center justify-center shrink-0`}>
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <h4 className={`text-sm font-bold truncate ${notification.isRead ? 'text-foreground/80' : 'text-foreground'} tracking-tight`}>
              {notification.title}
            </h4>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap ml-2">
              {notification.time}
            </span>
          </div>
          <p className="text-[12px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-medium">
            {notification.message}
          </p>
          
          <div className="flex items-center gap-4 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => onViewDetail(notification)}
              className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary-500 hover:text-primary-600 transition-colors"
            >
              <ExternalLink size={12} />
              View Detail
            </button>
            {!notification.isRead && (
              <button 
                onClick={() => onMarkRead(notification.id)}
                className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-500 hover:text-emerald-600 transition-colors"
              >
                <Check size={12} />
                Mark as Read
              </button>
            )}
          </div>
        </div>
      </div>
      {!notification.isRead && (
        <div className="absolute top-4 right-4 w-2 h-2 bg-primary-500 rounded-full animate-pulse group-hover:hidden"></div>
      )}
    </div>
  );
}
