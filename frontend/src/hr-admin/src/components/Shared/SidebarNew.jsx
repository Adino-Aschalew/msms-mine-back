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
      {}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 transition-all duration-300 lg:static lg:translate-x-0 ${
          collapsed ? 'lg:w-20' : 'lg:w-64'
        } ${mobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'}`}
      >
        {}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-slate-700 shrink-0">
          {(!collapsed || mobileMenuOpen) && (
            <span className="text-lg font-bold text-gray-900 dark:text-white truncate">
              HR Admin
            </span>
          )}
          
          {}
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className={`hidden lg:flex p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all ${collapsed ? 'mx-auto' : ''}`}
          >
            {collapsed ? <FiChevronRight size={18} /> : <FiChevronLeft size={18} />}
          </button>
          
          {}
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-400 transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        {}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            
            const visuallyCollapsed = collapsed && !mobileMenuOpen;
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => {
                  const baseClasses = 'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 group relative';
                  const activeClasses = isActive 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white';
                  const collapsedClasses = visuallyCollapsed ? 'justify-center' : '';
                  
                  return `${baseClasses} ${activeClasses} ${collapsedClasses}`;
                }}
              >
                <Icon size={20} className="shrink-0 transition-transform duration-300 group-hover:scale-110 text-gray-500 dark:text-gray-400" />
                {!visuallyCollapsed && <span className="text-sm font-medium">{item.name}</span>}
                {visuallyCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-medium rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-lg">
                    {item.name}
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>

        {}
        <div className="p-3 border-t border-gray-200 dark:border-slate-700 shrink-0">
          <button 
            onClick={() => {
              
              window.location.href = '/login';
            }}
            className={`flex items-center gap-3 w-full px-3 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-300 group ${(collapsed && !mobileMenuOpen) ? 'justify-center' : ''}`}
          >
            <FiLogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            {!(collapsed && !mobileMenuOpen) && <span className="text-sm font-medium">Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
