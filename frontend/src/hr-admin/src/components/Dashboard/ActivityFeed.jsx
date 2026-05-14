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
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
        Recent Activity
      </h3>
      
      {!hasActivities ? (
        <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-700/30 dark:border-gray-600">
          <Clock className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No recent activity found</p>
        </div>
      ) : (
        <div className="relative border-l-2 border-gray-100 dark:border-gray-700 ml-3 space-y-6">
          {activities.map((activity, index) => {
            const config = getActivityConfig(activity.type);
            const Icon = config.icon;
            return (
              <div key={activity.id || index} className="relative pl-7 group">
                <span className={`absolute -left-[18px] top-1 p-2 rounded-xl border-4 border-white dark:border-gray-800 shadow-sm transition-transform group-hover:scale-110 ${config.color}`}>
                  <Icon size={14} />
                </span>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <p className="text-sm">
                    <span className="font-bold text-gray-900 dark:text-white hover:text-blue-600 transition-colors cursor-pointer mr-1">{activity.user}</span>
                    <span className="text-gray-600 dark:text-gray-400 font-medium">
                      {activity.description || activity.action || 'performed an action'}
                      {activity.role && <span> as <span className="text-gray-900 dark:text-white">{activity.role}</span></span>}
                      {activity.text && <span> {activity.text}</span>}
                    </span>
                  </p>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 whitespace-nowrap bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-md border border-gray-200 dark:border-gray-600">
                    {formatTime(activity.time || activity.timestamp)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {hasActivities && (
        <button className="w-full mt-6 py-2 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors border border-dashed border-gray-200 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 dark:border-gray-600 dark:text-blue-400 uppercase tracking-widest">
          View All Activity
        </button>
      )}
    </div>
  );
}

