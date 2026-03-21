import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, List, Layers, FolderOpen, FileText, BarChart3, Users, Settings, LogOut, CreditCard } from 'lucide-react';
import { demoProfile } from '@/lib/mock-data';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/dashboard/listings', icon: List, label: 'My Listings' },
  { to: '/dashboard/collections', icon: Layers, label: 'Collections' },
  { to: '/dashboard/projects', icon: FolderOpen, label: 'Projects' },
  { to: '/dashboard/brochures', icon: FileText, label: 'Brochures' },
  { to: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/dashboard/leads', icon: Users, label: 'Leads' },
  { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const loc = useLocation();
  const p = demoProfile;

  return (
    <aside className="hidden md:flex flex-col w-[220px] bg-surface border-r border-border h-screen sticky top-0">
      <div className="h-[52px] flex items-center px-4 border-b border-border">
        <Link to="/" className="font-sans text-[15px] font-medium text-text-1">PropSite</Link>
        <span className="ml-1.5 text-2xs text-text-3 bg-surface-2 px-1.5 py-0.5 rounded">Beta</span>
      </div>

      <div className="px-3 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-medium">
            {p.full_name[0]}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-medium text-text-1 truncate">{p.full_name}</div>
            <span className="badge-live text-2xs">{p.plan}</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-2 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = loc.pathname === item.to || (item.to !== '/dashboard' && loc.pathname.startsWith(item.to));
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-2.5 h-9 px-2.5 rounded-md text-[13px] transition-colors ${
                active
                  ? 'bg-green-light text-primary font-medium border-l-2 border-primary'
                  : 'text-text-2 hover:text-text-1 hover:bg-surface-2'
              }`}
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border space-y-2">
        <div className="bg-surface-2 rounded-md p-2.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-2xs text-text-3">Credits</span>
            <span className="text-2xs font-medium text-text-1">{p.credits_remaining}</span>
          </div>
          <div className="h-1 bg-border rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(100, (p.credits_remaining / 50) * 100)}%` }} />
          </div>
        </div>
        {p.plan === 'free' && (
          <Link to="/upgrade" className="flex items-center gap-2 text-xs text-primary font-medium hover:underline">
            <CreditCard size={14} /> Upgrade Plan
          </Link>
        )}
        <button className="flex items-center gap-2 text-xs text-text-3 hover:text-text-1 w-full">
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </aside>
  );
}
