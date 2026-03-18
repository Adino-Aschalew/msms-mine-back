export default function StatCard({ title, value, icon: Icon, trend, trendValue, colorClass }) {
  return (
    <div className="p-6 bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{title}</p>
          <h3 className="text-2xl font-bold tracking-tight text-foreground">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10 dark:bg-opacity-20 text-current flex items-center justify-center`}>
           <div className={`absolute inset-0 rounded-xl ${colorClass} opacity-5 group-hover:opacity-10 transition-opacity`} />
           <Icon size={22} className="relative z-10" />
        </div>
      </div>
      
      {trend && (
        <div className="mt-4 flex items-center text-xs">
          <span className={`flex items-center gap-1 font-bold ${trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
            {trend === 'up' ? '↑' : '↓'} {trendValue}
          </span>
          <span className="text-slate-400 dark:text-slate-500 ml-2 font-medium">vs last month</span>
        </div>
      )}
    </div>
  );
}
