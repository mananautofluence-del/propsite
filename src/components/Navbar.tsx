import { Link } from 'react-router-dom';
import { Building2, Menu } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 text-indigo-600">
            <Building2 className="w-6 h-6" />
            <span className="font-bold text-xl tracking-tight">PropSite</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-sm font-medium text-slate-600 hover:text-slate-900 hidden sm:block">
              Dashboard
            </Link>
            <button className="sm:hidden p-2 text-slate-600 hover:text-slate-900">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
