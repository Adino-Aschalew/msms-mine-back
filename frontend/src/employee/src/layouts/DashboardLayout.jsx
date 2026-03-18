import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../../shared/contexts/AuthContext';
import Navbar from '../components/Shared/Navbar';
import Sidebar from '../components/Shared/Sidebar';

const DashboardLayout = () => {
  const { isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isAuthenticated) {
    // This shouldn't happen with our protected routes, but just in case
    return <div>Please login to access this page.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Fixed Sidebar */}
      <div className="hidden lg:block">
        <Sidebar isOpen={true} onClose={() => setSidebarOpen(false)} />
      </div>
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </div>
      )}
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0 lg:ml-64">
        {/* Fixed Header — must be z-50 so dropdowns appear above all page content */}
        <div className="sticky top-0 z-50">
          <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        </div>
        
        {/* Scrollable Content — isolate keeps page content in its own stacking context below z-50 */}
        <main className="flex-1 p-6 overflow-y-auto isolate">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
