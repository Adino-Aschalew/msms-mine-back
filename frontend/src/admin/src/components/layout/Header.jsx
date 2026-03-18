import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext2';
import { useAuth } from '../../../../shared/contexts/AuthContext';
import { 
  FiMenu, FiSearch, FiBell, FiChevronDown, FiSun, FiMoon, FiMonitor,
  FiUser, FiShield, FiSettings, FiLogOut, FiHelpCircle, FiCheck, FiX,
  FiChevronRight, FiAlertCircle, FiFileText, FiAlertTriangle, FiInfo, FiExternalLink
} from 'react-icons/fi';
import { adminAPI } from '../../../../shared/services/adminAPI';
import { formatDistanceToNow } from 'date-fns';

const Header = ({ sidebarOpen, setSidebarOpen }) => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [profileImage, setProfileImage] = useState('https://images.unsplash.com/photo-1472099645785?auto=compress&cs=tinysrgb&dpr=2&w=150&h=150&fit=crop&face=face&auto=format&fit=face-area');
  const profileDropdownRef = useRef(null);
  const themeDropdownRef = useRef(null);

  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await adminAPI.getSystemActivity({ limit: 10 });
      if (response.success && response.data?.activities) {
        const readLogs = JSON.parse(localStorage.getItem('read_notifications') || '[]');
        
        const mapped = response.data.activities.map((act, index) => {
          let type = 'system';
          if (act.action.includes('CREATED') || act.action.includes('REGISTERED')) type = 'request';
          if (act.action.includes('UPDATED')) type = 'alert';
          
          return {
            id: act.created_at + index, // Using timestamp + index as ID
            log_id: act.created_at,
            title: act.action.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' '),
            message: `${act.first_name || 'System'} ${act.last_name || ''}: ${act.action.toLowerCase().replace(/_/g, ' ')}`,
            time: formatDistanceToNow(new Date(act.created_at), { addSuffix: true }),
            detail: act.description || `Action performed by ${act.first_name || 'Admin'} (${act.employee_id || 'N/A'}) from IP ${act.ip_address || 'Unknown'}.`,
            isRead: readLogs.includes(act.created_at),
            type: type
          };
        });
        
        // Add a special growth notification if we have many new users
        const newUsers = response.data.activities.filter(a => a.action === 'USER_REGISTERED').length;
        if (newUsers > 3) {
          mapped.unshift({
            id: 'growth-alert',
            log_id: 'growth-alert',
            title: 'Growth Rate Up',
            message: `User registration surge: ${newUsers} new accounts in the last batch!`,
            time: 'Just now',
            detail: 'The system has detected a significant increase in user registrations. Marketing campaigns or organic growth may be driving this traffic.',
            isRead: readLogs.includes('growth-alert'),
            type: 'alert'
          });
        }

        setNotifications(mapped);
      }
    } catch (err) {
      console.error('Failed to fetch activities:', err);
    }
  };

  const handleMarkRead = (id) => {
    const notif = notifications.find(n => n.id === id);
    if (!notif) return;
    
    const readLogs = JSON.parse(localStorage.getItem('read_notifications') || '[]');
    if (!readLogs.includes(notif.log_id)) {
      readLogs.push(notif.log_id);
      localStorage.setItem('read_notifications', JSON.stringify(readLogs));
    }
    
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleMarkAllRead = () => {
    const readLogs = JSON.parse(localStorage.getItem('read_notifications') || '[]');
    notifications.forEach(n => {
      if (!readLogs.includes(n.log_id)) readLogs.push(n.log_id);
    });
    localStorage.setItem('read_notifications', JSON.stringify(readLogs));
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const NotificationItem = ({ notification, onMarkRead, onViewDetail }) => {
    const getIcon = () => {
      switch (notification.type) {
        case 'request': return <FiFileText className="text-blue-500" size={16} />;
        case 'alert': return <FiAlertTriangle className="text-amber-500" size={16} />;
        case 'system': return <FiBell className="text-rose-500" size={16} />;
        default: return <FiInfo className="text-blue-500" size={16} />;
      }
    };

    const getBgColor = () => {
      switch (notification.type) {
        case 'request': return 'bg-blue-500/10';
        case 'alert': return 'bg-amber-500/10';
        case 'system': return 'bg-rose-500/10';
        default: return 'bg-blue-500/10';
      }
    };

    return (
      <div className={`p-4 transition-all duration-300 border-l-2 ${notification.isRead ? 'border-transparent bg-transparent' : 'border-blue-500 bg-blue-500/[0.03]'} hover:bg-slate-100/50 dark:hover:bg-white/[0.03] group relative`}>
        <div className="flex gap-4">
          <div className={`w-10 h-10 rounded-xl ${getBgColor()} flex items-center justify-center shrink-0`}>
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-0.5">
              <h4 className={`text-sm font-bold truncate ${notification.isRead ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white'} tracking-tight`}>
                {notification.title}
              </h4>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap ml-2">
                {notification.time}
              </span>
            </div>
            <p className="text-[12px] text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed font-medium">
              {notification.message}
            </p>
            
            <div className="flex items-center gap-4 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => onViewDetail(notification)}
                className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-600 transition-colors"
              >
                <FiExternalLink size={12} />
                View Detail
              </button>
              {!notification.isRead && (
                <button 
                  onClick={() => onMarkRead(notification.id)}
                  className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-500 hover:text-emerald-600 transition-colors"
                >
                  <FiCheck size={12} />
                  Mark as Read
                </button>
              )}
            </div>
          </div>
        </div>
        {!notification.isRead && (
          <div className="absolute top-4 right-4 w-2 h-2 bg-blue-500 rounded-full animate-pulse group-hover:hidden"></div>
        )}
      </div>
    );
  };

  // Load profile image from localStorage on component mount
  useEffect(() => {
    const savedImage = localStorage.getItem('userProfileImage');
    if (savedImage) {
      setProfileImage(savedImage);
    }
    
    // Listen for storage changes to update profile image in real-time
    const handleStorageChange = (e) => {
      // Check if it's our custom storage event or actual storage change
      if (e.key === 'userProfileImage' || !e.key) {
        const updatedImage = localStorage.getItem('userProfileImage');
        if (updatedImage) {
          setProfileImage(updatedImage);
        }
      }
    };
    
    // Listen for both storage events and custom events
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically for immediate updates (fallback)
    const interval = setInterval(() => {
      const currentImage = localStorage.getItem('userProfileImage');
      if (currentImage && currentImage !== profileImage) {
        setProfileImage(currentImage);
      }
    }, 500);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [profileImage]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(event.target)) {
        setThemeOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleThemeChange = (newTheme) => {
    toggleTheme(newTheme);
  };

  const handleViewDetail = (notif) => {
    setSelectedNotification(notif);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 backdrop-blur dark:border-gray-800">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
          >
            <FiMenu className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          </button>
          
          <div className="relative hidden md:block">
            <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input w-80 pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-white/90 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800/90 dark:text-white"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
            >
              <FiBell className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 text-xs text-white font-semibold shadow-sm">
                  {unreadCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div className="fixed sm:absolute right-4 sm:right-0 top-16 sm:top-auto mt-0 sm:mt-4 w-[calc(100vw-2rem)] sm:w-96 bg-white rounded-3xl sm:rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] border border-gray-200 dark:border-gray-700 dark:bg-gray-800 overflow-hidden animate-in slide-in-from-top-2 duration-300 z-[60]">
                {/* Header */}
                <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                      Notifications
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-500 text-[10px] font-black text-white shadow-lg">
                          {unreadCount} New
                        </span>
                      )}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button 
                        onClick={handleMarkAllRead}
                        className="p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-all"
                        title="Mark all as read"
                      >
                        <FiCheck size={18} />
                      </button>
                    )}
                    <button className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all">
                      <FiSettings size={18} />
                    </button>
                  </div>
                </div>

                {/* List */}
                <div className="max-h-[420px] overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700">
                  {notifications.length > 0 ? (
                    notifications.map(notif => (
                      <NotificationItem 
                        key={notif.id} 
                        notification={notif} 
                        onMarkRead={handleMarkRead}
                        onViewDetail={handleViewDetail}
                      />
                    ))
                  ) : (
                    <div className="p-12 text-center">
                      <div className="w-16 h-16 rounded-3xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
                        <FiBell className="text-gray-300 dark:text-gray-600" size={32} />
                      </div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">All caught up!</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">No new notifications for now.</p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <button className="w-full p-4 text-center border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 group-hover:text-blue-500 transition-colors flex items-center justify-center gap-2">
                    View All Notifications <FiChevronRight size={12} />
                  </span>
                </button>

                {/* Detail Overlay */}
                {selectedNotification && (
                  <div className="absolute inset-0 bg-gray-900 dark:bg-gray-800 z-10 p-6 flex flex-col animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-center mb-6">
                      <button 
                        onClick={() => setSelectedNotification(null)}
                        className="p-2 -ml-2 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all"
                      >
                        <FiX size={20} />
                      </button>
                      <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-500`}>
                        {selectedNotification.type}
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2">
                      <h4 className="text-xl font-black text-gray-900 dark:text-white tracking-tight mb-2">
                        {selectedNotification.title}
                      </h4>
                      <div className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-6">
                        {selectedNotification.time}
                      </div>
                      <div className="p-5 rounded-3xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 mb-6">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-relaxed italic">
                          "{selectedNotification.message}"
                        </p>
                      </div>
                      <div className="space-y-4">
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 flex items-center gap-2">
                          <FiAlertCircle size={12} className="text-blue-500" />
                          Additional Details
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                          {selectedNotification.detail || 'No further details available for this notification.'}
                        </p>
                      </div>
                    </div>
                    <div className="pt-6 mt-auto">
                      <button 
                        onClick={() => setSelectedNotification(null)}
                        className="w-full py-4 bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-blue-600 transition-all active:scale-[0.98]"
                      >
                        Back to List
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="relative" ref={profileDropdownRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            >
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center overflow-hidden">
                <img 
                  src={profileImage} 
                  alt="Profile" 
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    const fallbackDiv = document.createElement('div');
                    fallbackDiv.className = 'h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center';
                    const userIcon = document.createElement('div');
                    userIcon.innerHTML = '<FiUser class="h-4 w-4 text-white" />';
                    fallbackDiv.appendChild(userIcon);
                    e.target.parentElement.appendChild(fallbackDiv);
                  }}
                />
              </div>
              <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300">
                {user?.first_name} {user?.last_name}
              </span>
              <FiChevronDown className="h-4 w-4 text-gray-700 dark:text-gray-300" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-white/30 bg-gradient-to-br from-white/60 via-white/40 to-white/20 backdrop-blur-xl shadow-2xl dark:border-gray-600/30 dark:from-gray-800/60 dark:via-gray-800/40 dark:to-gray-800/20">
                <div className="p-4">
                  {/* Profile Header */}
                  <div className="flex items-center gap-4 pb-4 border-b border-white/20 dark:border-gray-600/20 mb-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md overflow-hidden">
                      <img 
                        src={profileImage} 
                        alt="Profile" 
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const fallbackDiv = document.createElement('div');
                          fallbackDiv.className = 'h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md';
                          const userIcon = document.createElement('div');
                          userIcon.innerHTML = '<FiUser class="h-6 w-6 text-white" />';
                          fallbackDiv.appendChild(userIcon);
                          e.target.parentElement.appendChild(fallbackDiv);
                        }}
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {user?.first_name} {user?.last_name}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                    </div>
                  </div>

                  {/* FiMenu Items */}
                  <div className="space-y-2">
                    <Link 
                      to="/admin/account/profile" 
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                      <FiUser className="h-4 w-4" />
                      View Profile
                    </Link>
                    <Link 
                      to="/admin/settings" 
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                      <FiSettings className="h-4 w-4" />
                      Account Settings
                    </Link>
                    <button 
                      onClick={() => {
                        logout();
                        navigate('/login');
                      }}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200 w-full text-left"
                    >
                      <FiLogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => themeOpen ? setThemeOpen(false) : setThemeOpen(true)}
              className="h-11 w-11 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 p-0 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-700 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center"
            >
              {theme === 'light' ? <FiSun className="h-5 w-5 text-yellow-500" /> : theme === 'dark' ? <FiMoon className="h-5 w-5 text-blue-400" /> : <FiMonitor className="h-5 w-5 text-gray-600 dark:text-gray-400" />}
            </button>

            {themeOpen && (
              <div ref={themeDropdownRef} className="absolute right-0 mt-2 w-48 rounded-2xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                <div className="p-2">
                  <button
                    onClick={() => {
                      handleThemeChange('light');
                      setThemeOpen(false);
                    }}
                    className={`group flex w-full items-center gap-3 rounded-xl p-3 text-sm hover:bg-blue-500 hover:text-white transition-all duration-200 ${
                      theme === 'light' ? 'text-blue-600 dark:text-blue-400' : ''
                    } dark:text-white`}
                  >
                    <FiSun className={`h-4 w-4 text-yellow-500 transition-colors duration-200 ${
                      theme === 'light' ? 'group-hover:text-white' : ''
                    }`} />
                    <span className="font-medium">Light</span>
                  </button>
                  <button
                    onClick={() => {
                      handleThemeChange('dark');
                      setThemeOpen(false);
                    }}
                    className={`group flex w-full items-center gap-3 rounded-xl p-3 text-sm hover:bg-blue-500 hover:text-white transition-all duration-200 ${
                      theme === 'dark' ? 'text-blue-600 dark:text-blue-400' : ''
                    } dark:text-white`}
                  >
                    <FiMoon className={`h-4 w-4 text-blue-400 transition-colors duration-200 ${
                      theme === 'dark' ? 'group-hover:text-white' : ''
                    }`} />
                    <span className="font-medium">Dark</span>
                  </button>
                  <button
                    onClick={() => {
                      handleThemeChange('system');
                      setThemeOpen(false);
                    }}
                    className={`group flex w-full items-center gap-3 rounded-xl p-3 text-sm hover:bg-blue-500 hover:text-white transition-all duration-200 ${
                      theme === 'system' ? 'text-blue-600 dark:text-blue-400' : ''
                    } dark:text-white`}
                  >
                    <FiMonitor className={`h-4 w-4 text-gray-600 dark:text-gray-400 transition-colors duration-200 ${
                      theme === 'system' ? 'group-hover:text-white' : ''
                    }`} />
                    <span className="font-medium">System</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
