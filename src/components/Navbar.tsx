import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Menu, LogOut, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';

export default function Navbar() {
  const { user, signIn, logOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 text-indigo-600">
            <Building2 className="w-6 h-6" />
            <span className="font-bold text-xl tracking-tight">PropSite</span>
          </Link>
          
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link to="/dashboard" className="text-sm font-medium text-slate-600 hover:text-slate-900 hidden sm:block">
                  Dashboard
                </Link>
                <div className="hidden sm:flex items-center gap-3 ml-4 border-l border-slate-200 pl-4">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold overflow-hidden">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
                    ) : (
                      user.email?.charAt(0).toUpperCase()
                    )}
                  </div>
                  <button onClick={logOut} className="text-slate-500 hover:text-red-600" title="Log out">
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={signIn} className="hidden sm:flex">
                Sign In
              </Button>
            )}
            <button 
              className="sm:hidden p-2 text-slate-600 hover:text-slate-900"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {user ? (
            <>
              <div className="flex items-center gap-3 px-3 py-3 border-b border-slate-100 mb-2">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold overflow-hidden">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
                  ) : (
                    user.email?.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <div className="font-medium text-slate-900">{user.displayName || 'User'}</div>
                  <div className="text-xs text-slate-500">{user.email}</div>
                </div>
              </div>
              <Link 
                to="/dashboard" 
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link 
                to="/create-listing" 
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Create Listing
              </Link>
              <Link 
                to="/create-brochure" 
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Create Brochure
              </Link>
              <button 
                onClick={() => {
                  logOut();
                  setIsMobileMenuOpen(false);
                }} 
                className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Log out
              </button>
            </>
          ) : (
            <div className="px-3 py-2">
              <Button 
                className="w-full" 
                onClick={() => {
                  signIn();
                  setIsMobileMenuOpen(false);
                }}
              >
                Sign In
              </Button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
