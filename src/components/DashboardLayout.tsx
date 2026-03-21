import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Plus } from 'lucide-react';
import Sidebar from './Sidebar';
import MobileTabBar from './MobileTabBar';

export default function DashboardLayout({ children, title }: { children: ReactNode; title: string }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-[52px] bg-surface border-b border-border flex items-center justify-between px-4 md:px-6 sticky top-0 z-40">
          <h1 className="font-sans text-sm font-medium text-text-1">{title}</h1>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 rounded-md border border-border bg-surface flex items-center justify-center hover:bg-surface-2 transition-colors">
              <Bell size={16} className="text-text-2" />
            </button>
            <Link to="/dashboard/listings/new" className="btn-primary inline-flex items-center gap-1.5 text-xs">
              <Plus size={14} /> New Listing
            </Link>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">
          {children}
        </main>
      </div>
      <MobileTabBar />
    </div>
  );
}
