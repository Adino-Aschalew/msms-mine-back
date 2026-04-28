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
  const [profileImage, setProfileImage] = useState('');
  const profileDropdownRef = useRef(null);
  const themeDropdownRef = useRef(null);

  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); 
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await adminAPI.getSystemActivity(10);
      
      let activities = [];
      if (response && response.success && response.data?.activities) {
        activities = response.data.activities;
      } else if (response && Array.isArray(response)) {
        activities = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        activities = response.data;
      }

      const readLogs = JSON.parse(localStorage.getItem('read_notifications') || '[]');

      const getNotificationType = (action) => {
        if (!action) return 'system';
        const a = action.toUpperCase();
        if (a.includes('LOGIN') || a.includes('AUTH')) return 'auth';
        if (a.includes('CREATE') || a.includes('ADD')) return 'request';
        if (a.includes('UPDATE') || a.includes('SETTING')) return 'settings';
        if (a.includes('DELETE') || a.includes('REMOVE')) return 'alert';
        if (a.includes('SUSPEND') || a.includes('BAN')) return 'alert';
        return 'system';
      };

      const getNotificationTitle = (action) => {
        if (!action) return 'System Activity';
        const a = action.toUpperCase();
        if (a.includes('LOGIN')) return 'Login Activity';
        if (a.includes('LOGOUT')) return 'Logout Activity';
        if (a.includes('HR_ADMIN_CREATED')) return 'New HR Admin Added';
        if (a.includes('LOAN_COMMITTEE_ADMIN_CREATED')) return 'New Loan Committee Admin';
        if (a.includes('FINANCE_ADMIN_CREATED')) return 'New Finance Admin Added';
        if (a.includes('REGULAR_ADMIN_CREATED')) return 'New Admin Added';
        if (a.includes('ADMIN_CREATED')) return 'New Admin Added';
        if (a.includes('USER_CREATED')) return 'New User Registered';
        if (a.includes('SYSTEM_CONFIG_UPDATE')) return 'System Settings Changed';
        if (a.includes('SETTING')) return 'Settings Updated';
        if (a.includes('PROFILE_UPDATE')) return 'Profile Updated';
        if (a.includes('PASSWORD')) return 'Password Changed';
        if (a.includes('SUSPEND') || a.includes('DEACTIVATE')) return 'Account Suspended';
        if (a.includes('ACTIVATE')) return 'Account Activated';
        if (a.includes('DELETE')) return 'Account Deleted';
        if (a.includes('LOAN')) return 'Loan Activity';
        if (a.includes('SAVINGS')) return 'Savings Activity';
        if (a.includes('PAYROLL')) return 'Payroll Activity';
        return action.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      };

      const getNotificationMessage = (act) => {
        const userName = act.first_name && act.last_name 
          ? `${act.first_name} ${act.last_name}` 
          : act.employee_id || 'System';
        const action = act.action || '';
        const a = action.toUpperCase();
        
        if (a.includes('LOGIN')) return `${userName} logged in`;
        if (a.includes('LOGOUT')) return `${userName} logged out`;
        if (a.includes('CREATED')) return `${userName} was added as ${act.role || 'admin'}`;
        if (a.includes('UPDATED') || a.includes('UPDATE')) return `${userName} updated ${action.split('_').slice(0, -1).join(' ').toLowerCase()}`;
        if (a.includes('DELETED')) return `${userName} was removed`;
        if (a.includes('SUSPENDED') || a.includes('DEACTIVATE')) return `${userName} was suspended`;
        if (a.includes('ACTIVATE')) return `${userName} was activated`;
        if (a.includes('CONFIG')) return `System configuration updated by ${userName}`;
        return `${userName} - ${action.replace(/_/g, ' ').toLowerCase()}`;
      };

      const mapped = activities.map((act, index) => {
        const notifType = getNotificationType(act.action);
        const timeAgo = act.created_at 
          ? formatDistanceToNow(new Date(act.created_at), { addSuffix: true })
          : 'Just now';

        return {
          id: index + 1,
          log_id: `${act.action}_${act.created_at}`,
          title: getNotificationTitle(act.action),
          message: getNotificationMessage(act),
          time: timeAgo,
          detail: `${act.action?.replace(/_/g, ' ')} by ${act.first_name || 'System'} ${act.last_name || ''}${act.ip_address ? ` from IP ${act.ip_address}` : ''}${act.role ? ` (Role: ${act.role})` : ''}`,
          isRead: readLogs.includes(`${act.action}_${act.created_at}`),
          type: notifType
        };
      });

      setNotifications(mapped);
    } catch (err) {
      console.error('Failed to fetch activities:', err);
      setNotifications([]);
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

  const [notifTab, setNotifTab] = useState('all');

  const filteredNotifications = notifTab === 'unread' 
    ? notifications.filter(n => !n.isRead) 
    : notifications;

  const NotificationItem = ({ notification, onMarkRead, onViewDetail }) => {
    const getIcon = () => {
      switch (notification.type) {
        case 'auth': return <FiShield className="text-green-500" size={14} />;
        case 'request': return <FiFileText className="text-blue-500" size={14} />;
        case 'settings': return <FiSettings className="text-purple-500" size={14} />;
        case 'alert': return <FiAlertTriangle className="text-amber-500" size={14} />;
        case 'system': return <FiBell className="text-rose-500" size={14} />;
        default: return <FiInfo className="text-blue-500" size={14} />;
      }
    };

    const getAccentColor = () => {
      switch (notification.type) {
        case 'auth': return 'from-green-500 to-emerald-600';
        case 'request': return 'from-blue-500 to-cyan-600';
        case 'settings': return 'from-purple-500 to-violet-600';
        case 'alert': return 'from-amber-500 to-orange-600';
        case 'system': return 'from-rose-500 to-pink-600';
        default: return 'from-blue-500 to-cyan-600';
      }
    };

    const getLightBg = () => {
      switch (notification.type) {
        case 'auth': return 'bg-green-50 dark:bg-green-900/20';
        case 'request': return 'bg-blue-50 dark:bg-blue-900/20';
        case 'settings': return 'bg-purple-50 dark:bg-purple-900/20';
        case 'alert': return 'bg-amber-50 dark:bg-amber-900/20';
        case 'system': return 'bg-rose-50 dark:bg-rose-900/20';
        default: return 'bg-blue-50 dark:bg-blue-900/20';
      }
    };

    return (
      <div 
        onClick={() => onViewDetail(notification)}
        className={`relative px-4 py-3 cursor-pointer transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 ${!notification.isRead ? getLightBg() : ''}`}
      >
        <div className="flex items-start gap-3">
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getAccentColor()} flex items-center justify-center shrink-0 shadow-sm`}>
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className={`text-sm truncate ${notification.isRead ? 'text-gray-600 dark:text-gray-400 font-medium' : 'text-gray-900 dark:text-white font-semibold'}`}>
                {notification.title}
              </p>
              <span className="text-[11px] text-gray-400 dark:text-gray-500 whitespace-nowrap shrink-0">
                {notification.time}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
              {notification.message}
            </p>
          </div>
          {!notification.isRead && (
            <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-2"></div>
          )}
        </div>
        <div className="flex items-center gap-2 mt-2 ml-11 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
          {!notification.isRead && (
            <button 
              onClick={() => onMarkRead(notification.id)}
              className="text-[11px] text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1"
            >
              <FiCheck size={10} /> Mark read
            </button>
          )}
        </div>
      </div>
    );
  };

  
  useEffect(() => {
    const savedImage = localStorage.getItem('userProfileImage');
    if (savedImage) {
      setProfileImage(savedImage);
    }
    
    
    const handleStorageChange = (e) => {
      
      if (e.key === 'userProfileImage' || !e.key) {
        const updatedImage = localStorage.getItem('userProfileImage');
        if (updatedImage) {
          setProfileImage(updatedImage);
        }
      }
    };
    
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('storage', handleStorageChange);
    
    
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
            className="p-2 hover:bg-gray-600 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200 lg:hidden"
          >
            <FiMenu className="text-center h-5 w-5 text-gray-700 dark:text-gray-300" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Welcome Back, <span className='text-blue-600 dark:text-blue-400'>{user?.name || "Admin"}</span>
            </h1>
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
              <div className="fixed sm:absolute right-4 sm:right-0 top-16 sm:top-auto mt-0 sm:mt-3 w-[calc(100vw-2rem)] sm:w-[400px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700/50 overflow-hidden z-[60]">
                {}
                {selectedNotification ? (
                  <div className="flex flex-col max-h-[520px]">
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                      <button 
                        onClick={() => setSelectedNotification(null)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
                      >
                        <FiChevronRight size={16} className="rotate-180" />
                      </button>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">Notification Detail</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${
                          selectedNotification.type === 'auth' ? 'from-green-500 to-emerald-600' :
                          selectedNotification.type === 'request' ? 'from-blue-500 to-cyan-600' :
                          selectedNotification.type === 'settings' ? 'from-purple-500 to-violet-600' :
                          selectedNotification.type === 'alert' ? 'from-amber-500 to-orange-600' :
                          'from-rose-500 to-pink-600'
                        } flex items-center justify-center shadow-sm`}>
                          {selectedNotification.type === 'auth' ? <FiShield className="text-white" size={18} /> :
                           selectedNotification.type === 'request' ? <FiFileText className="text-white" size={18} /> :
                           selectedNotification.type === 'settings' ? <FiSettings className="text-white" size={18} /> :
                           selectedNotification.type === 'alert' ? <FiAlertTriangle className="text-white" size={18} /> :
                           <FiBell className="text-white" size={18} />}
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{selectedNotification.title}</h4>
                          <p className="text-xs text-gray-400 dark:text-gray-500">{selectedNotification.time}</p>
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50">
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                          {selectedNotification.message}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">Details</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                          {selectedNotification.detail || 'No additional details available.'}
                        </p>
                      </div>
                    </div>
                    <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800">
                      <button 
                        onClick={() => { handleMarkRead(selectedNotification.id); setSelectedNotification(null); }}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {}
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          Notifications
                          {unreadCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded-md bg-blue-600 text-[10px] font-bold text-white">
                              {unreadCount}
                            </span>
                          )}
                        </h3>
                        {unreadCount > 0 && (
                          <button 
                            onClick={handleMarkAllRead}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center gap-1"
                          >
                            <FiCheck size={12} /> Mark all read
                          </button>
                        )}
                      </div>
                      {}
                      <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
                        <button
                          onClick={() => setNotifTab('all')}
                          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                            notifTab === 'all' 
                              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' 
                              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                          }`}
                        >
                          All
                        </button>
                        <button
                          onClick={() => setNotifTab('unread')}
                          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                            notifTab === 'unread' 
                              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' 
                              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                          }`}
                        >
                          Unread{unreadCount > 0 ? ` (${unreadCount})` : ''}
                        </button>
                      </div>
                    </div>

                    {}
                    <div className="max-h-[380px] overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
                      {filteredNotifications.length > 0 ? (
                        filteredNotifications.map(notif => (
                          <NotificationItem 
                            key={notif.id} 
                            notification={notif} 
                            onMarkRead={handleMarkRead}
                            onViewDetail={handleViewDetail}
                          />
                        ))
                      ) : (
                        <div className="py-16 text-center">
                          <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
                            <FiBell className="text-gray-300 dark:text-gray-600" size={24} />
                          </div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            {notifTab === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                          </p>
                        </div>
                      )}
                    </div>

                    {}
                    <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                      <button 
                        onClick={() => { setNotificationsOpen(false); navigate('/admin/settings'); }}
                        className="w-full py-2 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center justify-center gap-1.5"
                      >
                        View All Activity <FiChevronRight size={12} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="relative" ref={profileDropdownRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            >
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                {!profileImage || profileImage === 'https://i.pravatar.cc/150?img=1' ? (
                  <FiUser className="h-4 w-4 text-white" />
                ) : (
                  <img 
                    src={profileImage} 
                    alt="Profile" 
                    className="h-full w-full object-cover rounded-full"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const parent = e.target.parentElement;
                      parent.innerHTML = '<FiUser class="h-4 w-4 text-white" />';
                    }}
                  />
                )}
              </div>
              <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300">
                {user?.first_name} {user?.last_name}
              </span>
              <FiChevronDown className="h-4 w-4 text-gray-700 dark:text-gray-300" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800">
                <div className="p-4">
                  {}
                  <div className="flex items-center gap-4 pb-4 border-b border-gray-200 dark:border-gray-700 mb-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                      {!profileImage || profileImage === 'https://i.pravatar.cc/150?img=1' ? (
                        <FiUser className="h-6 w-6 text-white" />
                      ) : (
                        <img 
                          src={profileImage} 
                          alt="Profile" 
                          className="h-full w-full object-cover rounded-full"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            const parent = e.target.parentElement;
                            const icon = document.createElement('div');
                            icon.innerHTML = '<FiUser class="h-6 w-6 text-white" />';
                            parent.innerHTML = '<FiUser class="h-6 w-6 text-white" />';
                          }}
                        />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {user?.first_name} {user?.last_name}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                    </div>
                  </div>

                  {}
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
