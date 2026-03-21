import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, List, PlusCircle, BarChart3, MoreHorizontal } from 'lucide-react';
import { useAuth } from '@/lib/auth';

const tabs = [
  { to: '/dashboard', icon: Home, label: 'Home' },
  { to: '/dashboard/listings', icon: List, label: 'Listings' },
  { to: '/dashboard/listings/new', icon: PlusCircle, label: 'Create', isCreate: true },
  { to: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
  { label: 'More', icon: MoreHorizontal, isMore: true },
];

export default function MobileTabBar() {
  const loc = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);

  const closeMore = () => setMoreOpen(false);

  const moreActive = loc.pathname.startsWith('/dashboard/settings') || moreOpen;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 h-14 bg-surface border-t border-border flex items-center justify-around z-50 safe-bottom md:hidden">
        {tabs.map((t) => {
          if (t.isCreate) {
            return (
              <Link key={t.to} to={t.to!} className="flex flex-col items-center -mt-3">
                <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center">
                  <PlusCircle size={22} className="text-primary-foreground" />
                </div>
              </Link>
            );
          }
          if (t.isMore) {
            return (
              <button
                key="more"
                type="button"
                onClick={() => setMoreOpen(true)}
                className="flex flex-col items-center gap-0.5"
              >
                <MoreHorizontal size={20} className={moreActive ? 'text-primary' : 'text-text-3'} />
                <span className={`text-2xs ${moreActive ? 'text-primary font-medium' : 'text-text-3'}`}>{t.label}</span>
              </button>
            );
          }
          const active = loc.pathname === t.to || (t.to !== '/dashboard' && loc.pathname.startsWith(t.to!));
          return (
            <Link key={t.to} to={t.to!} className="flex flex-col items-center gap-0.5">
              <t.icon size={20} className={active ? 'text-primary' : 'text-text-3'} />
              <span className={`text-2xs ${active ? 'text-primary font-medium' : 'text-text-3'}`}>{t.label}</span>
            </Link>
          );
        })}
      </div>

      {moreOpen && (
        <>
          <button type="button" className="fixed inset-0 z-[60] bg-black/50 md:hidden" aria-label="Close menu" onClick={closeMore} />
          <div className="fixed bottom-0 left-0 right-0 z-[70] bg-surface rounded-t-2xl border-t border-border shadow-lg md:hidden animate-in slide-in-from-bottom duration-200 safe-bottom">
            <div className="w-10 h-1 bg-border rounded-full mx-auto mt-2 mb-1" />
            <nav className="px-4 pb-6 pt-2 space-y-0.5">
              <Link to="/dashboard/settings" onClick={closeMore} className="flex items-center h-11 px-3 rounded-md text-sm text-text-1 hover:bg-surface-2">
                Settings
              </Link>
              <Link to="/dashboard/settings" onClick={closeMore} className="flex items-center h-11 px-3 rounded-md text-sm text-text-1 hover:bg-surface-2">
                My Profile
              </Link>
              <Link to="/dashboard/settings" onClick={closeMore} className="flex items-center h-11 px-3 rounded-md text-sm text-text-1 hover:bg-surface-2">
                Billing & Credits
              </Link>
              <Link to="/" onClick={closeMore} className="flex items-center h-11 px-3 rounded-md text-sm text-text-1 hover:bg-surface-2">
                Help
              </Link>
              <button
                type="button"
                onClick={async () => {
                  closeMore();
                  await signOut();
                  navigate('/login');
                }}
                className="flex items-center w-full h-11 px-3 rounded-md text-sm text-text-1 hover:bg-surface-2 text-left"
              >
                Sign Out
              </button>
            </nav>
          </div>
        </>
      )}
    </>
  );
}
