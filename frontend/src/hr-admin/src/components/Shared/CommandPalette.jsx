import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command } from 'cmdk';
import { 
  Search, 
  LayoutDashboard, 
  Users, 
  TrendingUp, 
  FileText, 
  Settings, 
  UserCircle 
} from 'lucide-react';

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // Toggle the menu when ⌘K is pressed
  useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = (command) => {
    setOpen(false);
    command();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-start justify-center pt-[20vh]" onClick={() => setOpen(false)}>
      <Command 
        className="w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        loop
      >
        <div className="flex items-center border-b border-border px-3" cmdk-input-wrapper="">
          <Search className="w-5 h-5 text-muted-foreground mr-2 shrink-0" />
          <Command.Input 
            autoFocus 
            placeholder="Type a command or search..." 
            className="flex-1 h-12 bg-transparent outline-none text-foreground placeholder-muted-foreground"
          />
        </div>
        
        <Command.List className="max-h-[300px] overflow-y-auto p-2 scrollbar-thin">
          <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
            No results found.
          </Command.Empty>

          <Command.Group heading="Navigation" className="text-xs font-medium text-muted-foreground px-2 py-1.5 [&_[cmdk-group-items]]:mt-1.5 [&_[cmdk-item]]:flex [&_[cmdk-item]]:items-center [&_[cmdk-item]]:gap-2 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-2 [&_[cmdk-item]]:rounded-md [&_[cmdk-item]]:cursor-pointer [&_[cmdk-item]]:transition-colors [&_[cmdk-item][data-selected]]:bg-primary-50 [&_[cmdk-item][data-selected]]:text-primary-600 dark:[&_[cmdk-item][data-selected]]:bg-primary-900/20 dark:[&_[cmdk-item][data-selected]]:text-primary-400">
            <Command.Item onSelect={() => runCommand(() => navigate('/'))} className="text-sm text-foreground">
              <LayoutDashboard size={16} /> Go to Dashboard
            </Command.Item>
            <Command.Item onSelect={() => runCommand(() => navigate('/employees'))} className="text-sm text-foreground">
              <Users size={16} /> View Employees
            </Command.Item>
            <Command.Item onSelect={() => runCommand(() => navigate('/performance'))} className="text-sm text-foreground">
              <TrendingUp size={16} /> Track Performance
            </Command.Item>
            <Command.Item onSelect={() => runCommand(() => navigate('/reports'))} className="text-sm text-foreground">
              <FileText size={16} /> Open Reports
            </Command.Item>
            <Command.Item onSelect={() => runCommand(() => navigate('/settings'))} className="text-sm text-foreground">
              <Settings size={16} /> System Settings
            </Command.Item>
            <Command.Item onSelect={() => runCommand(() => navigate('/account'))} className="text-sm text-foreground">
              <UserCircle size={16} /> My Account
            </Command.Item>
          </Command.Group>

          <Command.Separator className="h-px bg-border my-2" />

          <Command.Group heading="Quick Actions" className="text-xs font-medium text-muted-foreground px-2 py-1.5 [&_[cmdk-group-items]]:mt-1.5 [&_[cmdk-item]]:flex [&_[cmdk-item]]:items-center [&_[cmdk-item]]:gap-2 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-2 [&_[cmdk-item]]:rounded-md [&_[cmdk-item]]:cursor-pointer [&_[cmdk-item]]:transition-colors [&_[cmdk-item][data-selected]]:bg-primary-50 [&_[cmdk-item][data-selected]]:text-primary-600 dark:[&_[cmdk-item][data-selected]]:bg-primary-900/20 dark:[&_[cmdk-item][data-selected]]:text-primary-400">
            <Command.Item onSelect={() => runCommand(() => navigate('/employees?action=add'))} className="text-sm text-foreground">
              <Users size={16} /> Add New Employee
            </Command.Item>
            <Command.Item onSelect={() => runCommand(() => navigate('/reports?action=generate'))} className="text-sm text-foreground">
              <FileText size={16} /> Generate Payroll Report
            </Command.Item>
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  );
}
