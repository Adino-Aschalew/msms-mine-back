import React, { useState } from 'react';
import { Monitor, Smartphone, Tablet, Globe, LogOut, AlertTriangle } from 'lucide-react';

const Sessions = () => {
  const [sessions] = useState([
    {
      id: 1,
      device: 'Desktop',
      browser: 'Chrome on Windows',
      location: 'New York, USA',
      ip: '192.168.1.1',
      lastActive: '2 minutes ago',
      isCurrent: true
    },
    {
      id: 2,
      device: 'Mobile',
      browser: 'Safari on iPhone',
      location: 'Los Angeles, USA',
      ip: '192.168.1.2',
      lastActive: '1 hour ago',
      isCurrent: false
    },
    {
      id: 3,
      device: 'Tablet',
      browser: 'Chrome on iPad',
      location: 'Chicago, USA',
      ip: '192.168.1.3',
      lastActive: '3 hours ago',
      isCurrent: false
    },
    {
      id: 4,
      device: 'Desktop',
      browser: 'Firefox on Mac',
      location: 'London, UK',
      ip: '192.168.1.4',
      lastActive: '1 day ago',
      isCurrent: false
    },
    {
      id: 5,
      device: 'Mobile',
      browser: 'Chrome on Android',
      location: 'Tokyo, Japan',
      ip: '192.168.1.5',
      lastActive: '2 days ago',
      isCurrent: false
    }
  ]);

  const getDeviceIcon = (device) => {
    switch (device) {
      case 'Desktop':
        return <Monitor className="h-5 w-5" />;
      case 'Mobile':
        return <Smartphone className="h-5 w-5" />;
      case 'Tablet':
        return <Tablet className="h-5 w-5" />;
      default:
        return <Globe className="h-5 w-5" />;
    }
  };

  const handleLogoutSession = (sessionId) => {
    console.log('Logging out session:', sessionId);
    // In a real app, this would call an API to logout the session
  };

  const handleLogoutAllSessions = () => {
    console.log('Logging out all sessions');
    // In a real app, this would call an API to logout all sessions
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Active Sessions</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage and monitor your active login sessions.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sessions List */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Active Sessions ({sessions.length})
                </h2>
                <button
                  onClick={handleLogoutAllSessions}
                  className="btn-outline text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  Logout All Devices
                </button>
              </div>
            </div>

            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {sessions.map((session) => (
                <div key={session.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="mt-1">
                        {getDeviceIcon(session.device)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {session.device}
                          </h3>
                          {session.isCurrent && (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                              Current Session
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {session.browser}
                        </p>
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Globe className="h-3 w-3" />
                            {session.location}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span className="font-mono text-xs">{session.ip}</span>
                          </div>
                          <div className="text-sm text-gray-500">
                            Last active: {session.lastActive}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {!session.isCurrent && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleLogoutSession(session.id)}
                          className="btn-outline text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <LogOut className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Security Info */}
        <div className="lg:col-span-1">
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Security Tips</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Review Active Sessions
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Regularly review your active sessions and log out any devices you don't recognize.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Use Strong Passwords
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Ensure your password is unique and difficult to guess. Enable two-factor authentication.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Secure Network
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Avoid logging in from public Wi-Fi networks. Use a VPN when accessing sensitive information.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Keep Software Updated
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Keep your browser and operating system updated to protect against security vulnerabilities.
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6 mt-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Session Statistics
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Sessions</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {sessions.length}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Desktop</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {sessions.filter(s => s.device === 'Desktop').length}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Mobile</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {sessions.filter(s => s.device === 'Mobile').length}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Tablet</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {sessions.filter(s => s.device === 'Tablet').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sessions;
