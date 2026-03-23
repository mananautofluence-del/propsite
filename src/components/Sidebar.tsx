import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Building2, FolderOpen, BarChart3, Settings, Search, Flame } from 'lucide-react';

const NAV = [
  { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { to: '/dashboard/listings', label: 'My Listings', icon: Building2 },
  { to: '/dashboard/collections', label: 'Collections', icon: FolderOpen },
  { to: '/dashboard/leads', label: 'Leads', icon: Flame },
  { to: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const loc = useLocation();

  return (
    <aside className="hidden md:flex flex-col w-[240px] h-screen bg-surface border-r border-border sticky top-0 py-6 px-4">
      {/* Logo */}
      <Link to="/dashboard" className="flex items-center gap-1 mb-8 px-2">
        <span className="font-display text-[20px] font-medium text-text-1">PropSite</span>
        <span className="w-2 h-2 rounded-full bg-primary" />
      </Link>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {NAV.map(item => {
          const active = loc.pathname === item.to || (item.to !== '/dashboard' && loc.pathname.startsWith(item.to));
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 h-10 rounded-xl text-[13px] font-medium font-sans transition-all duration-150 ${
                active
                  ? 'bg-[hsl(var(--green-light))] text-primary'
                  : 'text-text-2 hover:text-text-1 hover:bg-surface-2'
              }`}
            >
              <item.icon size={18} className={active ? 'text-primary' : ''} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Create listing button */}
      <Link to="/create" className="btn-primary w-full flex items-center justify-center gap-1.5 mt-4">
        + New Listing
      </Link>
    </aside>
  );
}
