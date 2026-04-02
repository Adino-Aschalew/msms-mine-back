import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './SidebarNew';
import Header from './HeaderNew';
import CommandPalette from './CommandPalette';

export default function Layout() {
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground selection:bg-primary/30 selection:text-primary">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        setCollapsed={setSidebarCollapsed}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      
      <div className="flex flex-col flex-1 overflow-hidden relative w-full">
        {}
        <div className="hidden dark:block absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(59,130,246,0.15),transparent_70%)] pointer-events-none" />
        <div className="hidden dark:block absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.05),transparent_40%)] pointer-events-none" />
        
        <Header 
          setMobileMenuOpen={setMobileMenuOpen} 
          mobileMenuOpen={mobileMenuOpen}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-50/30 dark:bg-transparent h-full relative z-10 transition-colors duration-500">
          <Outlet />
        </main>
      </div>
      <CommandPalette />
    </div>
  );
}