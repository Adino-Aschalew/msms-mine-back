import { NavLink } from 'react-router-dom';
import { 
  FiGrid,
  FiUsers,
  FiActivity,
  FiFileText,
  FiSettings,
  FiUser,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiX
} from 'react-icons/fi';

const navItems = [
  { name: 'Dashboard', path: '/hr', icon: FiGrid },
  { name: 'Employees', path: '/hr/employees', icon: FiUsers },
  { name: 'Performance System', path: '/hr/performance', icon: FiActivity },
  { name: 'Reports', path: '/hr/reports', icon: FiFileText },
  { name: 'Settings', path: '/hr/settings', icon: FiSettings },
  { name: 'Account', path: '/hr/account', icon: FiUser },
];

export default function Sidebar({ collapsed, setCollapsed, mobileMenuOpen, setMobileMenuOpen }) {
  return (
    <>
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 flex flex-col glass-sidebar transition-all duration-300 lg:static lg:translate-x-0 ${
          collapsed ? 'lg:w-20' : 'lg:w-64'
        } ${mobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'}`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-sidebar-border/50 dark:border-white/5 shrink-0">
          {(!collapsed || mobileMenuOpen) && (
            <span className="text-xl font-bold bg-gradient-to-r from-primary-500 to-primary-300 bg-clip-text text-transparent truncate tracking-tight">
              HR Admin
            </span>
          )}
          {/* Desktop Collapse Toggle */}
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className={`hidden lg:flex p-1.5 rounded-lg hover:bg-primary-500/10 dark:hover:bg-white/5 text-sidebar-foreground/70 hover:text-primary-500 dark:hover:text-primary-400 transition-all ${collapsed ? 'mx-auto' : ''}`}
          >
            {collapsed ? <FiChevronRight size={18} /> : <FiChevronLeft size={18} />}
          </button>
          
          {/* Mobile Close Button */}
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-sidebar-foreground/70 transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            // On mobile, force uncollapsed view visually for navigation items
            const visuallyCollapsed = collapsed && !mobileMenuOpen;
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group relative ${
                    isActive 
                      ? 'bg-primary-500/10 dark:bg-primary-400/10 text-primary-600 dark:text-primary-400 font-semibold shadow-[0_0_20px_rgba(59,130,246,0.15)]' 
                      : 'text-sidebar-foreground/60 hover:text-foreground hover:bg-slate-100 dark:hover:bg-white/5'
                  } ${visuallyCollapsed ? 'justify-center' : ''}`
                }
              >
                <Icon size={20} className={`shrink-0 transition-transform duration-300 group-hover:scale-110`} />
                {!visuallyCollapsed && <span className="text-sm">{item.name}</span>}
                {visuallyCollapsed && (
                  <div className="absolute left-14 px-2.5 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[11px] font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-xl translate-x-1 group-hover:translate-x-0">
                    {item.name}
                  </div>
                )}
                {/* Active Indicator Dot */}
                {/* {isActive && !visuallyCollapsed && (
                  <div className="absolute right-3 w-1 h-1 rounded-full bg-primary-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                )} */}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border/50 dark:border-white/5 shrink-0">
          <button 
            className={`flex items-center gap-3 w-full px-3 py-2.5 text-red-500 hover:bg-red-500/10 rounded-xl transition-all duration-300 group ${(collapsed && !mobileMenuOpen) ? 'justify-center' : ''}`}
          >
            <FiLogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            {!(collapsed && !mobileMenuOpen) && <span className="text-sm font-medium">Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
