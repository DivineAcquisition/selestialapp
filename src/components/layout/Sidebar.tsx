import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Zap, Settings, LogOut, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBusiness } from '@/contexts/BusinessContext';
import { useAuth } from '@/contexts/AuthContext';
import { useConversations } from '@/hooks/useConversations';
import { Button } from '@/components/ui/button';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Inbox', href: '/inbox', icon: MessageSquare, showBadge: true },
  { name: 'Quotes', href: '/quotes', icon: FileText },
  { name: 'Sequences', href: '/sequences', icon: Zap },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const { business } = useBusiness();
  const { user, signOut } = useAuth();
  const { totalUnread } = useConversations();
  const navigate = useNavigate();
  
  const initials = business?.owner_name
    ? business.owner_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="flex h-screen w-64 flex-col bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-sidebar-foreground">Selestial</span>
          <span className="text-xs text-sidebar-foreground/60">Quote Follow-Up</span>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              )
            }
          >
            <div className="flex items-center gap-3">
              <item.icon className="h-5 w-5" />
              {item.name}
            </div>
            {item.showBadge && totalUnread > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold bg-destructive text-destructive-foreground rounded-full">
                {totalUnread > 99 ? '99+' : totalUnread}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
      
      {/* Bottom section */}
      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {business?.owner_name || 'User'}
            </p>
            <p className="text-xs text-sidebar-foreground/60 truncate">
              {user?.email || ''}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign out">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
