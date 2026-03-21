import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/lib/auth';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const isLanding = loc.pathname === '/';

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="h-[52px] bg-surface border-b border-border sticky top-0 z-50">
      <div className="container h-full flex items-center justify-between">
        <Link to="/" className="font-display text-lg font-medium text-text-1">PropSite</Link>
        
        {isLanding && (
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-text-2 hover:text-text-1 transition-colors">Features</a>
            <a href="#pricing" className="text-sm text-text-2 hover:text-text-1 transition-colors">Pricing</a>
            <a href="#agencies" className="text-sm text-text-2 hover:text-text-1 transition-colors">For Agencies</a>
          </div>
        )}

        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              <Link to="/dashboard" className="btn-ghost inline-flex items-center">Dashboard</Link>
              <button onClick={handleSignOut} className="btn-secondary inline-flex items-center text-xs">Sign Out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost inline-flex items-center">Sign In</Link>
              <Link to="/create" className="btn-primary inline-flex items-center">Get Started Free</Link>
            </>
          )}
        </div>

        <button onClick={() => setOpen(!open)} className="md:hidden p-2 -mr-2">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-surface border-b border-border p-4 space-y-3">
          {isLanding && (
            <>
              <a href="#features" className="block text-sm text-text-2" onClick={() => setOpen(false)}>Features</a>
              <a href="#pricing" className="block text-sm text-text-2" onClick={() => setOpen(false)}>Pricing</a>
            </>
          )}
          {user ? (
            <>
              <Link to="/dashboard" className="block text-sm text-text-2" onClick={() => setOpen(false)}>Dashboard</Link>
              <button onClick={() => { handleSignOut(); setOpen(false); }} className="block text-sm text-text-2">Sign Out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="block text-sm text-text-2" onClick={() => setOpen(false)}>Sign In</Link>
              <Link to="/create" className="btn-primary inline-flex items-center w-full justify-center" onClick={() => setOpen(false)}>Get Started Free</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
