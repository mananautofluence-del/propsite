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
        <header className="md:hidden flex items-center justify-between h-16 px-4 bg-surface border-b border-border sticky top-0 z-40">
          <Link to="/dashboard" className="flex items-center gap-1.5">
            <span className="font-display text-[20px] font-medium text-text-1">PropSite</span>
            <span className="w-2 h-2 rounded-full bg-primary" />
          </Link>
          <button className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-2 text-text-2 hover:text-text-1 relative">
            <Bell size={18} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border border-surface"></span>
          </button>
        </header>

        {/* Main Content Container with bottom padding for Tab Bar */}
        <main className="flex-1 min-w-0 pb-24 max-w-md mx-auto w-full md:max-w-none w-full">
          <Outlet />
        </main>
      </div>
      <MobileTabBar />
    </div>
  );
}
