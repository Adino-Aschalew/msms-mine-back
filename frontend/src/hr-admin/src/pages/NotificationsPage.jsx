import { useState } from 'react';
import { Bell, CheckCheck, Trash2, Filter, Search, MoreHorizontal, CheckCircle, Info, AlertTriangle, MessageSquare } from 'lucide-react';
import { notificationsData } from '../components/Notifications/NotificationData';
import { format } from 'date-fns';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(notificationsData);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNotifications = notifications.filter(notif => {
    const matchesFilter = 
      filter === 'all' ? true :
      filter === 'unread' ? !notif.isRead :
      filter === 'read' ? notif.isRead : true;
    
    const matchesSearch = 
      notif.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notif.message.toLowerCase().includes(searchQuery.toLowerCase());
      
    return matchesFilter && matchesSearch;
  });

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleMarkRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleDelete = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle className="text-emerald-500" size={20} />;
      case 'warning': return <AlertTriangle className="text-amber-500" size={20} />;
      case 'info': return <Info className="text-primary-500" size={20} />;
      case 'message': return <MessageSquare className="text-indigo-500" size={20} />;
      default: return <Bell className="text-slate-400" size={20} />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase italic border-l-8 border-primary-500 pl-6">Notifications</h1>
          <p className="text-slate-500 dark:text-slate-400 text-[11px] font-black uppercase tracking-[0.3em] mt-3 ml-1">Central dispatch & communication log</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleMarkAllRead}
            className="flex items-center gap-3 px-6 py-3 bg-white/[0.03] border border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/10 text-foreground hover:text-emerald-500 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest"
          >
            <CheckCheck size={16} />
            Mark everything read
          </button>
        </div>
      </div>

      <div className="glass-card rounded-[2.5rem] shadow-2xl border border-white/10 overflow-hidden flex flex-col">
        {}
        <div className="p-8 border-b border-white/5 bg-white/[0.01] flex flex-col md:flex-row justify-between items-stretch md:items-center gap-6">
          <div className="flex bg-slate-100 dark:bg-white/5 p-1.5 rounded-2xl">
            {['all', 'unread', 'read'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  filter === f 
                    ? 'bg-white dark:bg-white/10 text-foreground shadow-lg' 
                    : 'text-slate-500 hover:text-foreground'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-white/[0.03] border border-white/5 rounded-2xl text-sm font-bold text-foreground outline-none focus:border-primary-500 focus:bg-white/[0.08] transition-all placeholder:text-slate-500/50"
            />
          </div>
        </div>

        {}
        <div className="divide-y divide-white/5">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map(notif => (
              <div 
                key={notif.id} 
                className={`group p-8 flex items-start gap-6 transition-all relative overflow-hidden ${
                  !notif.isRead ? 'bg-primary-500/[0.02] dark:bg-white/[0.02]' : 'hover:bg-white/[0.01]'
                }`}
              >
                {!notif.isRead && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
                )}
                
                <div className={`mt-1 p-4 rounded-2xl glass-card border border-white/10 shadow-lg group-hover:scale-110 transition-transform ${!notif.isRead ? 'shadow-primary-500/10' : ''}`}>
                  {getIcon(notif.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className={`text-lg tracking-tight font-black ${!notif.isRead ? 'text-foreground' : 'text-slate-400'}`}>
                      {notif.title}
                    </h4>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 bg-white/[0.02] px-3 py-1.5 rounded-lg border border-white/5">
                      {notif.time}
                    </span>
                  </div>
                  <p className={`text-sm leading-relaxed font-medium mb-4 ${!notif.isRead ? 'text-slate-300' : 'text-slate-500'}`}>
                    {notif.message}
                  </p>
                  
                  {notif.detail && (
                     <div className="mt-4 p-5 rounded-2xl bg-white/[0.01] border border-white/5 text-xs font-bold text-slate-500 italic leading-relaxed">
                       {notif.detail}
                     </div>
                  )}

                  <div className="mt-6 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!notif.isRead && (
                      <button 
                        onClick={() => handleMarkRead(notif.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 rounded-xl hover:text-white transition-all text-[10px] font-black uppercase tracking-widest"
                      >
                        <CheckCheck size={14} /> Mark Read
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(notif.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500 rounded-xl hover:text-white transition-all text-[10px] font-black uppercase tracking-widest"
                    >
                      <Trash2 size={14} /> Delete log
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white/5 text-slate-400 hover:text-foreground rounded-xl transition-all text-[10px] font-black uppercase tracking-widest">
                      <MoreHorizontal size={14} /> Options
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-24 text-center">
              <div className="w-24 h-24 rounded-[2.5rem] bg-white/[0.02] border border-white/10 flex items-center justify-center mx-auto mb-8 shadow-inner">
                <Bell size={48} className="text-slate-600 opacity-30 rotate-12" />
              </div>
              <h3 className="text-2xl font-black text-foreground mb-3 tracking-tighter uppercase italic">Neutral State</h3>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] max-w-xs mx-auto leading-relaxed">
                No telemetry data matched your parameters.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
