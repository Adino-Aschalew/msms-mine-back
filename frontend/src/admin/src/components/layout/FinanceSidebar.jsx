import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  Wallet,
  Users,
  PieChart,
  FileText,
  BarChart3,
  FileSpreadsheet,
  Settings,
  UserCircle,
  Bell,
  HelpCircle,
  LogOut,
  CreditCard,
  Receipt,
  Building,
  Target
} from 'lucide-react';

const FinanceSidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/finance/dashboard',
      icon: Home,
      current: location.pathname === '/finance/dashboard'
    },
    {
      name: 'Transactions',
      icon: ArrowUpDown,
      current: location.pathname.startsWith('/finance/transactions'),
      children: [
        { name: 'All Transactions', href: '/finance/transactions' },
        { name: 'Income', href: '/finance/transactions/income' },
        { name: 'Expenses', href: '/finance/transactions/expenses' },
        { name: 'Transfers', href: '/finance/transactions/transfers' }
      ]
    },
    {
      name: 'Accounts',
      href: '/finance/accounts',
      icon: Wallet,
      current: location.pathname === '/finance/accounts'
    },
    {
      name: 'Payroll',
      icon: Users,
      current: location.pathname.startsWith('/finance/payroll'),
      children: [
        { name: 'Import Payroll', href: '/finance/payroll/import' },
        { name: 'Payroll History', href: '/finance/payroll/history' },
        { name: 'Payroll Reports', href: '/finance/payroll/reports' }
      ]
    },
    {
      name: 'Employees',
      href: '/finance/employees',
      icon: Building,
      current: location.pathname === '/finance/employees'
    },
    {
      name: 'Budgets',
      href: '/finance/budgets',
      icon: Target,
      current: location.pathname === '/finance/budgets'
    },
    {
      name: 'Invoices',
      href: '/finance/invoices',
      icon: Receipt,
      current: location.pathname === '/finance/invoices'
    },
    {
      name: 'Analytics',
      href: '/finance/analytics',
      icon: BarChart3,
      current: location.pathname === '/finance/analytics'
    },
    {
      name: 'Reports',
      href: '/finance/reports',
      icon: FileSpreadsheet,
      current: location.pathname === '/finance/reports'
    },
    {
      name: 'Users & Roles',
      href: '/finance/users',
      icon: UserCircle,
      current: location.pathname === '/finance/users'
    },
    {
      name: 'Notifications',
      href: '/finance/notifications',
      icon: Bell,
      current: location.pathname === '/finance/notifications'
    }
  ];

  const accountNavigation = [
    {
      name: 'Profile',
      href: '/finance/account/profile',
      icon: UserCircle,
      current: location.pathname === '/finance/account/profile'
    },
    {
      name: 'Security',
      href: '/finance/account/security',
      icon: Settings,
      current: location.pathname === '/finance/account/security'
    },
    {
      name: 'Sessions',
      href: '/finance/account/sessions',
      icon: CreditCard,
      current: location.pathname === '/finance/account/sessions'
    },
    {
      name: 'Preferences',
      href: '/finance/account/preferences',
      icon: Settings,
      current: location.pathname === '/finance/account/preferences'
    },
    {
      name: 'Help & Support',
      href: '/finance/help',
      icon: HelpCircle,
      current: location.pathname === '/finance/help'
    },
    {
      name: 'Sign Out',
      href: '/finance/logout',
      icon: LogOut,
      current: false
    }
  ];

  const NavLink = ({ item, isChild = false }) => {
    const isActive = item.current;
    
    if (item.children) {
      return (
        <div className="space-y-1">
          <div className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            isActive 
              ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' 
              : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
          } ${isChild ? 'ml-6' : ''}`}>
            <item.icon className="h-5 w-5" />
            {item.name}
          </div>
          <div className="space-y-1">
            {item.children.map((child) => (
              <Link
                key={child.href}
                to={child.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === child.href
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' 
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                } ml-6`}
              >
                {child.name}
              </Link>
            ))}
          </div>
        </div>
      );
    }

    return (
      <Link
        to={item.href}
        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          isActive 
            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' 
            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
        } ${isChild ? 'ml-6' : ''}`}
      >
        <item.icon className="h-5 w-5" />
        {item.name}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 dark:bg-gray-900 dark:border-gray-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-3 px-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
              <PieChart className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">FinanceHub</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Enterprise Finance</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-6 px-4 py-6 overflow-y-auto">
            <div className="space-y-1">
              {navigation.map((item) => (
                <NavLink key={item.name} item={item} />
              ))}
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="space-y-1">
                {accountNavigation.map((item) => (
                  <NavLink key={item.name} item={item} isChild={false} />
                ))}
              </div>
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">System Status</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">All systems operational</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Version 2.4.1</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FinanceSidebar;
