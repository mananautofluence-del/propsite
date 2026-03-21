import { Link, useLocation } from 'react-router-dom';
import { Home, List, PlusCircle, BarChart3, MoreHorizontal } from 'lucide-react';

const tabs = [
  { to: '/dashboard', icon: Home, label: 'Home' },
  { to: '/dashboard/listings', icon: List, label: 'Listings' },
  { to: '/dashboard/listings/new', icon: PlusCircle, label: 'Create', isCreate: true },
  { to: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/dashboard/settings', icon: MoreHorizontal, label: 'More' },
];

export default function MobileTabBar() {
  const loc = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 h-14 bg-surface border-t border-border flex items-center justify-around z-50 safe-bottom md:hidden">
      {tabs.map((t) => {
        const active = loc.pathname === t.to || (t.to !== '/dashboard' && loc.pathname.startsWith(t.to));
        if (t.isCreate) {
          return (
            <Link key={t.to} to={t.to} className="flex flex-col items-center -mt-3">
              <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center">
                <PlusCircle size={22} className="text-primary-foreground" />
              </div>
            </Link>
          );
        }
        return (
          <Link key={t.to} to={t.to} className="flex flex-col items-center gap-0.5">
            <t.icon size={20} className={active ? 'text-primary' : 'text-text-3'} />
            <span className={`text-2xs ${active ? 'text-primary font-medium' : 'text-text-3'}`}>{t.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
