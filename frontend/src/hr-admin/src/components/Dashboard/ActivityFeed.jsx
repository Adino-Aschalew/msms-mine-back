import { UserPlus, UserMinus, FileText, CheckCircle } from 'lucide-react';

const activities = [
  { id: 1, type: 'onboarding', user: 'Sarah Jenkins', role: 'Software Engineer', time: '2 hours ago', icon: UserPlus, color: 'text-blue-500 bg-blue-50 dark:bg-blue-500/10' },
  { id: 2, type: 'leave', user: 'Michael Chen', text: 'requested 3 days sick leave', time: '4 hours ago', icon: FileText, color: 'text-amber-500 bg-amber-50 dark:bg-amber-500/10' },
  { id: 3, type: 'approval', user: 'HR Admin', text: 'approved leave request for Emma Davis', time: '5 hours ago', icon: CheckCircle, color: 'text-green-500 bg-green-50 dark:bg-green-500/10' },
  { id: 4, type: 'offboarding', user: 'David Smith', text: 'completed exit interview', time: '1 day ago', icon: UserMinus, color: 'text-red-500 bg-red-50 dark:bg-red-500/10' },
];

export default function ActivityFeed() {
  return (
    <div className="p-6 bg-card border border-border rounded-xl shadow-sm">
      <h3 className="text-base font-bold text-foreground mb-6 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
        Recent Activity
      </h3>
      <div className="relative border-l-2 border-slate-100 dark:border-slate-800/50 ml-3 space-y-6">
        {activities.map((activity) => {
          const Icon = activity.icon;
          return (
            <div key={activity.id} className="relative pl-7 group">
              <span className={`absolute -left-[18px] top-1 p-2 rounded-xl border-4 border-card shadow-sm transition-transform group-hover:scale-110 ${activity.color}`}>
                <Icon size={14} />
              </span>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <p className="text-sm">
                  <span className="font-bold text-foreground hover:text-primary-500 transition-colors cursor-pointer">{activity.user}</span>
                  {activity.type === 'onboarding' ? (
                    <span className="text-muted-foreground font-medium"> started onboarding as <span className="text-foreground">{activity.role}</span></span>
                  ) : (
                    <span className="text-muted-foreground font-medium"> {activity.text}</span>
                  )}
                </p>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 whitespace-nowrap bg-slate-50 dark:bg-slate-800/50 px-2 py-0.5 rounded-md border border-border/50">{activity.time}</span>
              </div>
            </div>
          );
        })}
      </div>
      <button className="w-full mt-6 py-2 text-xs font-bold text-primary-500 hover:text-primary-600 transition-colors border border-dashed border-border rounded-lg hover:bg-primary-50/50 dark:hover:bg-primary-500/5 uppercase tracking-widest">
        View All Activity
      </button>
    </div>
  );
}

