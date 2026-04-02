import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header.jsx';
import Sidebar from './Sidebar.jsx';
import { useTheme } from '../../contexts/ThemeContext';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-black ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="flex h-screen overflow-hidden">
        {}
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        
        {}
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-black">
            <div className="p-4 sm:p-6 lg:p-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
