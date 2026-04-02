import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../../shared/contexts/AuthContext';
import Navbar from '../components/Shared/Navbar';
import Sidebar from '../components/Shared/Sidebar';

const DashboardLayout = () => {
  const { isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isAuthenticated) {
    
    return <div>Please login to access this page.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {}
      {sidebarOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          </div>
        </>
      )}
      
      {}
      <div className="hidden lg:block lg:fixed lg:inset-y-0 lg:left-0 lg:z-40">
        <Sidebar isOpen={true} onClose={() => setSidebarOpen(false)} />
      </div>
      
      {}
      <div className="flex-1 flex flex-col min-h-0 lg:ml-64">
        {}
        <div className="sticky top-0 z-40 lg:z-40">
          <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        </div>
        
        {}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
