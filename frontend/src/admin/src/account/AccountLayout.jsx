import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  User, 
  Shield, 
  Monitor, 
  Clock, 
  Settings, 
  AlertTriangle,
  Menu,
  X
} from 'lucide-react';

const AccountLayout = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Profile', href: '/account/profile', icon: User },
    { name: 'Security', href: '/account/security', icon: Shield },
    { name: 'Sessions', href: '/account/sessions', icon: Monitor },
    { name: 'Activity', href: '/account/activity', icon: Clock },
    { name: 'Preferences', href: '/account/preferences', icon: Settings },
    { name: 'Danger Zone', href: '/account/danger', icon: AlertTriangle },
  ];

  const isActive = (href) => {
    return location.pathname === href;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="lg:pl-64">
        {}
        <div className="lg:hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Account</h1>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="btn-outline h-8 w-8 p-0"
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-gray-900/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {}
        <aside
          className={`
            fixed left-0 top-0 z-50 h-screen w-64 transform border-r border-gray-200 bg-white transition-transform duration-300 ease-in-out dark:border-gray-700 dark:bg-gray-900 lg:translate-x-0 lg:pt-16
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700 lg:hidden">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Account</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="btn-outline h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <nav className="p-4">
            <div className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`
                      flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all
                      ${isActive(item.href)
                        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                      }
                    `}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </nav>
        </aside>

        {}
        <main className="p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AccountLayout;
