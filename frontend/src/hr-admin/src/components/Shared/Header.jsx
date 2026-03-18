import { useState } from 'react';
import { FiSearch, FiBell, FiSun, FiMoon, FiUser, FiMenu, FiLogOut } from 'react-icons/fi';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../../../shared/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import NotificationDropdown from '../Notifications/NotificationDropdown';

export default function Header({ setMobileMenuOpen, mobileMenuOpen }) {
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-8 border-b border-sidebar-border/50 dark:border-white/5 glass z-20 shrink-0 transition-all duration-500">
      <div className="flex-1 flex items-center gap-6">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2.5 -ml-2 rounded-xl lg:hidden text-muted-foreground hover:bg-primary-500/10 dark:hover:bg-white/5 hover:text-primary-500 transition-all"
        >
          <FiMenu size={20} />
        </button>
        <div className="relative w-full max-w-lg hidden sm:block text-muted-foreground focus-within:text-foreground transition-colors group">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-all duration-300" size={18} />
          <input 
            type="text" 
            placeholder="Search anything..." 
            className="w-full pl-11 pr-4 py-2 bg-slate-100/50 dark:bg-white/5 border border-transparent focus:border-primary-500/50 focus:bg-background/50 dark:focus:bg-slate-900/50 rounded-xl outline-none transition-all duration-300 text-sm placeholder:text-slate-400/70"
          />
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 opacity-60 group-focus-within:opacity-100 transition-opacity">
            <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold text-slate-500 bg-slate-200/50 dark:bg-slate-800/50 rounded-md border border-slate-300/50 dark:border-slate-700/50">⌘</kbd>
            <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold text-slate-500 bg-slate-200/50 dark:bg-slate-800/50 rounded-md border border-slate-300/50 dark:border-slate-700/50">K</kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-6 ml-auto">
        <div className="relative">
          <button 
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className={`relative p-2.5 rounded-xl transition-all group ${isNotifOpen ? 'bg-primary-500/10 text-primary-500' : 'text-slate-600 dark:text-slate-400 hover:bg-primary-500/10 dark:hover:bg-white/5 hover:text-primary-500 dark:hover:text-primary-400'}`}
          >
            <FiBell size={20} className={`${isNotifOpen ? '' : 'group-hover:rotate-12'} transition-transform`} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-50 dark:border-slate-900 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>
          </button>
          
          <NotificationDropdown 
            isOpen={isNotifOpen} 
            onClose={() => setIsNotifOpen(false)} 
          />
        </div>
        
        <button 
          onClick={toggleTheme}
          className="p-2.5 rounded-xl hover:bg-primary-500/10 dark:hover:bg-white/5 transition-all text-slate-600 dark:text-slate-400 hover:text-primary-500 dark:hover:text-primary-400 group"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <FiSun size={20} className="group-hover:rotate-90 transition-transform duration-500" /> : <FiMoon size={20} className="group-hover:-rotate-12 transition-transform duration-500" />}
        </button>

        <div className="h-6 w-px bg-slate-200 dark:bg-white/10 mx-1 hidden sm:block"></div>

        <button className="flex items-center gap-3 p-1.5 pr-4 rounded-2xl hover:bg-primary-500/10 dark:hover:bg-white/5 transition-all border border-transparent hover:border-primary-500/20 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 to-primary-400 flex items-center justify-center text-white shrink-0 shadow-lg shadow-primary-500/20 group-hover:scale-105 transition-transform">
            <FiUser size={18} />
          </div>
          <div className="hidden md:flex flex-col items-start leading-tight">
            <span className="text-sm font-bold">HR Admin</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Premium</span>
          </div>
        </button>
        
        <button 
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="flex items-center gap-2 p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          title="Sign Out"
        >
          <FiLogOut size={18} />
        </button>
      </div>
    </header>
  );
}
