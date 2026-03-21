import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const signUpWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/dashboard' }
    });
    if (error) toast.error('Google sign up failed: ' + error.message);
  };

  const signUpWithEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.name, phone: form.phone },
        emailRedirectTo: window.location.origin,
      }
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Check your email to verify your account');
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex items-center justify-center py-16 px-4">
        <div className="card-base p-6 w-full max-w-[420px]">
          <h1 className="font-display text-2xl font-medium text-text-1 mb-1">Create account</h1>
          <p className="text-xs text-text-2 mb-6">Start creating premium listings</p>

          <button onClick={signUpWithGoogle} className="btn-secondary w-full flex items-center justify-center gap-2 mb-4">
            <svg width="16" height="16" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"/><path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332Z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.166 6.656 3.58 9 3.58Z"/></svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-2xs text-text-3">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={signUpWithEmail} className="space-y-3">
            <div>
              <label className="text-label text-text-3 block mb-1">Full Name</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} className="input-base w-full" placeholder="Rahul Mehta" required />
            </div>
            <div>
              <label className="text-label text-text-3 block mb-1">Email</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)} className="input-base w-full" placeholder="you@agency.com" required />
            </div>
            <div>
              <label className="text-label text-text-3 block mb-1">Phone</label>
              <div className="flex gap-2">
                <div className="input-base w-14 flex items-center justify-center text-xs text-text-2">+91</div>
                <input value={form.phone} onChange={e => set('phone', e.target.value)} className="input-base flex-1" placeholder="98765 43210" />
              </div>
            </div>
            <div>
              <label className="text-label text-text-3 block mb-1">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)} className="input-base w-full pr-9" required />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-3">
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-label text-text-3 block mb-1">Confirm Password</label>
              <input type="password" value={form.confirm} onChange={e => set('confirm', e.target.value)} className="input-base w-full" required />
            </div>
            <label className="flex items-start gap-2 text-xs text-text-2 cursor-pointer">
              <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-0.5 accent-primary" />
              I agree to the Terms of Service and Privacy Policy
            </label>
            <button type="submit" disabled={!agreed || loading} className="btn-primary w-full">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-xs text-text-2 text-center mt-4">
            Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
