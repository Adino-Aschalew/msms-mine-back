import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Settings, X, ChevronRight, AlertCircle } from 'lucide-react';
import NotificationItem from './NotificationItem';
import { notificationsData } from './NotificationData';

export default function NotificationDropdown({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(notificationsData);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleMarkRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleViewDetail = (notif) => {
    setSelectedNotification(notif);
  };

  const handleViewAll = () => {
    navigate('/notifications');
    onClose();
  };

  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      ref={dropdownRef}
      className="absolute top-full right-0 mt-4 w-96 glass-card rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden animate-in slide-in-from-top-2 duration-300 z-[60]"
    >
      {}
      <div className="p-5 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
        <div>
          <h3 className="text-base font-black text-foreground tracking-tight flex items-center gap-2">
            Notifications
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-primary-500 text-[10px] font-black text-white shadow-lg shadow-primary-500/20">
                {unreadCount} New
              </span>
            )}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button 
              onClick={handleMarkAllRead}
              className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-all"
              title="Mark all as read"
            >
              <CheckCheck size={18} />
            </button>
          )}
          <button className="p-2 text-slate-400 hover:text-foreground hover:bg-white/5 rounded-xl transition-all">
            <Settings size={18} />
          </button>
        </div>
      </div>

      {}
      <div className="max-h-[420px] overflow-y-auto custom-scrollbar divide-y divide-white/5">
        {notifications.length > 0 ? (
          notifications.map(notif => (
            <NotificationItem 
              key={notif.id} 
              notification={notif} 
              onMarkRead={handleMarkRead}
              onViewDetail={handleViewDetail}
            />
          ))
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-4">
              <Bell className="text-slate-300 dark:text-slate-600" size={32} />
            </div>
            <p className="text-sm font-bold text-foreground">All caught up!</p>
            <p className="text-xs text-slate-500 mt-1">No new notifications for now.</p>
          </div>
        )}
      </div>

      {}
      <button 
        onClick={handleViewAll}
        className="w-full p-4 text-center border-t border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors group"
      >
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-primary-500 transition-colors flex items-center justify-center gap-2">
          View All Notifications <ChevronRight size={12} />
        </span>
      </button>

      {}
      {selectedNotification && (
        <div className="absolute inset-0 bg-[#0b0e14] z-10 p-6 flex flex-col animate-in fade-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center mb-6">
            <button 
              onClick={() => setSelectedNotification(null)}
              className="p-2 -ml-2 text-slate-400 hover:text-foreground hover:bg-white/5 rounded-xl transition-all"
            >
              <X size={20} />
            </button>
            <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-primary-500/10 text-primary-500`}>
              {selectedNotification.type}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
            <h4 className="text-xl font-black text-foreground tracking-tight mb-2" >
              {selectedNotification.title}
            </h4>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-6" >
              {selectedNotification.time}
            </div>
            <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/5 mb-6" >
              <p className="text-sm font-medium text-slate-300 leading-relaxed italic" >
                "{selectedNotification.message}"
              </p>
            </div>
            <div className="space-y-4" >
              <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2" >
                <AlertCircle size={12} className="text-primary-500" />
                Additional Details
              </h5>
              <p className="text-sm text-slate-400 leading-relaxed font-medium" >
                {selectedNotification.detail || 'No further details available for this notification.'}
              </p>
            </div>
          </div>
          <div className="pt-6 mt-auto" >
            <button 
              onClick={() => setSelectedNotification(null)}
              className="w-full py-4 bg-primary-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary-500/20 hover:bg-primary-600 transition-all active:scale-[0.98]" 
            >
              Back to List
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
