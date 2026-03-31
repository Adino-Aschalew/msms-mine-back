import { UserPlus, UserMinus, FileText, CheckCircle, RefreshCw, UserCheck, AlertCircle, Clock3 as Clock } from 'lucide-react';

const getActivityConfig = (type) => {
  const configs = {
    'onboarding': { icon: UserPlus, color: 'text-blue-500 bg-blue-50 dark:bg-blue-500/10' },
    'employee_created': { icon: UserPlus, color: 'text-blue-500 bg-blue-50 dark:bg-blue-500/10' },
    'leave': { icon: FileText, color: 'text-amber-500 bg-amber-50 dark:bg-amber-500/10' },
    'approval': { icon: CheckCircle, color: 'text-green-500 bg-green-50 dark:bg-green-500/10' },
    'employee_verified': { icon: UserCheck, color: 'text-green-500 bg-green-50 dark:bg-green-500/10' },
    'offboarding': { icon: UserMinus, color: 'text-red-500 bg-red-50 dark:bg-red-500/10' },
    'employment_status_update': { icon: RefreshCw, color: 'text-purple-500 bg-purple-50 dark:bg-purple-500/10' },
    'terminated': { icon: UserMinus, color: 'text-red-500 bg-red-50 dark:bg-red-500/10' }
  };
  return configs[type.toLowerCase()] || { icon: AlertCircle, color: 'text-slate-500 bg-slate-50 dark:bg-slate-500/10' };
};

const formatTime = (timestamp) => {
  if (!timestamp) return 'Just now';
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 8400)} days ago`;
};

export default function ActivityFeed({ activities = [] }) {
  const hasActivities = Array.isArray(activities) && activities.length > 0;

  return (
    <div className="p-6 bg-card border border-border rounded-xl shadow-sm h-full flex flex-col">
      <h3 className="text-base font-bold text-foreground mb-6 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
        Recent Activity
      </h3>
      
      {!hasActivities ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-border rounded-lg bg-slate-50/30 dark:bg-slate-800/20">
          <Clock className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-3" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No recent activity found</p>
        </div>
      ) : (
        <div className="flex-1 relative border-l-2 border-slate-100 dark:border-slate-800/50 ml-3 space-y-6">
          {activities.map((activity, index) => {
            const config = getActivityConfig(activity.type);
            const Icon = config.icon;
            return (
              <div key={activity.id || index} className="relative pl-7 group">
                <span className={`absolute -left-[18px] top-1 p-2 rounded-xl border-4 border-card shadow-sm transition-transform group-hover:scale-110 ${config.color}`}>
                  <Icon size={14} />
                </span>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <p className="text-sm">
                    <span className="font-bold text-foreground hover:text-primary-500 transition-colors cursor-pointer mr-1">{activity.user}</span>
                    <span className="text-muted-foreground font-medium">
                      {activity.description || activity.action || 'performed an action'}
                      {activity.role && <span> as <span className="text-foreground">{activity.role}</span></span>}
                      {activity.text && <span> {activity.text}</span>}
                    </span>
                  </p>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 whitespace-nowrap bg-slate-50 dark:bg-slate-800/50 px-2 py-0.5 rounded-md border border-border/50">
                    {formatTime(activity.time || activity.timestamp)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {hasActivities && (
        <button className="w-full mt-6 py-2 text-xs font-bold text-primary-500 hover:text-primary-600 transition-colors border border-dashed border-border rounded-lg hover:bg-primary-50/50 dark:hover:bg-primary-500/5 uppercase tracking-widest">
          View All Activity
        </button>
      )}
    </div>
  );
}

