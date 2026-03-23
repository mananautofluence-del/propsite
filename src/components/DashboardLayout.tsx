import { Outlet, Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import Sidebar from './Sidebar';
import MobileTabBar from './MobileTabBar';

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-background font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Top Header */}
        <header className="md:hidden flex items-center justify-between h-14 px-4 bg-surface border-b border-border sticky top-0 z-40">
          <Link to="/dashboard" className="flex items-center gap-1.5">
            <span className="font-display text-[18px] font-medium text-text-1">PropSite</span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          </Link>
          <button className="w-9 h-9 rounded-full flex items-center justify-center bg-surface-2 text-text-2 hover:text-text-1 relative">
            <Bell size={16} />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary rounded-full border border-surface"></span>
          </button>
        </header>

        {/* Main Content */}
        <main className="flex-1 min-w-0 pb-20 md:pb-0 w-full max-w-lg mx-auto md:max-w-none">
          <Outlet />
        </main>
      </div>
      <MobileTabBar />
    </div>
  );
}
