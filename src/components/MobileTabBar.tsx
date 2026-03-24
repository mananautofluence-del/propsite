import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Building2, Plus, Users, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';

const TABS = [
  { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { to: '/dashboard/listings', label: 'Listings', icon: Building2 },
  { to: '/create', label: 'Create', icon: Plus, isAction: true },
  { to: '/dashboard/leads', label: 'Leads', icon: Users },
];

const MORE_ITEMS = [
  { to: '/dashboard/collections', label: 'Collections' },
  { to: '/dashboard/presentations', label: 'Presentations' },
  { to: '/dashboard/settings', label: 'Settings' },
];

export default function MobileTabBar() {
  const loc = useLocation();
  const [showMore, setShowMore] = useState(false);

  return (
    <>
      <div
        className="fixed bottom-0 left-0 right-0 md:hidden bg-surface z-50 safe-bottom"
        style={{ borderRadius: '20px 20px 0 0', boxShadow: 'var(--shadow-lg)' }}
      >
        <div className="flex items-center justify-around h-16">
          {TABS.map(tab => {
            const active = tab.to === '/dashboard'
              ? loc.pathname === '/dashboard'
              : loc.pathname.startsWith(tab.to);

            if (tab.isAction) {
              return (
                <Link key={tab.to} to={tab.to} className="flex flex-col items-center justify-center -mt-2">
                  <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center shadow-md">
                    <Plus size={20} className="text-primary-foreground" />
                  </div>
                </Link>
              );
            }

            return (
              <Link key={tab.to} to={tab.to} className="flex flex-col items-center justify-center gap-0.5 min-w-[56px]">
                <tab.icon size={20} className={active ? 'text-primary' : 'text-text-3'} />
                <span className={`text-[10px] ${active ? 'text-primary font-medium' : 'text-text-3'}`}>{tab.label}</span>
              </Link>
            );
          })}
          <button onClick={() => setShowMore(!showMore)} className="flex flex-col items-center justify-center gap-0.5 min-w-[56px]">
            <MoreHorizontal size={20} className={showMore ? 'text-primary' : 'text-text-3'} />
            <span className={`text-[10px] ${showMore ? 'text-primary font-medium' : 'text-text-3'}`}>More</span>
          </button>
        </div>
      </div>

      {/* More menu modal */}
      {showMore && (
        <>
          <div className="fixed inset-0 bg-dark/30 z-40 md:hidden" onClick={() => setShowMore(false)} />
          <div
            className="fixed bottom-20 left-4 right-4 bg-surface rounded-2xl z-50 p-2 md:hidden"
            style={{ boxShadow: 'var(--shadow-lg)' }}
          >
            {MORE_ITEMS.map(item => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setShowMore(false)}
                className="flex items-center h-11 px-4 rounded-xl text-[13px] font-medium text-text-1 hover:bg-surface-2 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </>
      )}
    </>
  );
}
