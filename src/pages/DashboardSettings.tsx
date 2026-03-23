import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { LogOut, Save, Loader2, User as UserIcon } from 'lucide-react';

interface ProfileData {
  full_name: string;
  agency_name: string;
  phone: string;
  whatsapp: string;
  rera_number: string;
  city: string;
}

export default function DashboardSettings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loadingConfig, setLoadingConfig] = useState(true);
  
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ProfileData>();

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (data) {
        reset({
          full_name: data.full_name || '',
          agency_name: data.agency_name || '',
          phone: data.phone || '',
          whatsapp: data.whatsapp || '',
          rera_number: data.rera_number || '',
          city: data.city || ''
        });
      }
      setLoadingConfig(false);
    };
    fetchProfile();
  }, [user, reset]);

  const onSubmit = async (data: ProfileData) => {
    if (!user) return;
    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', user.id);
      
    if (error) {
      toast.error('Failed to save profile details');
    } else {
      toast.success('Settings saved successfully!');
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (loadingConfig) {
    return (
      <div className="p-4 md:p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 size={24} className="animate-spin text-text-3" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 font-sans max-w-2xl mx-auto w-full pb-20">
      <div className="mb-6">
        <h1 className="font-display text-[22px] font-semibold text-text-1">Settings</h1>
        <p className="text-[13px] text-text-2 mt-1">Manage your professional profile and account.</p>
      </div>

      <div className="bg-white border border-[#EBEBEB] rounded-2xl shadow-sm overflow-hidden mb-6">
        <div className="p-5 border-b border-[#EBEBEB] bg-surface/50">
          <h2 className="text-[15px] font-bold text-text-1 flex items-center gap-2">
            <UserIcon size={18} className="text-text-3" />
            Profile Information
          </h2>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-5 flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[13px] font-bold text-text-1 mb-1.5 font-sans">Full Name</label>
              <input
                {...register('full_name', { required: 'Name is required' })}
                placeholder="John Doe"
                className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-sans text-[14px] bg-surface focus:bg-white transition-all"
              />
              {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
            </div>

            <div>
              <label className="block text-[13px] font-bold text-text-1 mb-1.5 font-sans">Agency Name</label>
              <input
                {...register('agency_name')}
                placeholder="Real Estate Co."
                className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-sans text-[14px] bg-surface focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-[13px] font-bold text-text-1 mb-1.5 font-sans">Phone Number</label>
              <input
                {...register('phone')}
                placeholder="+91 9876543210"
                className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-sans text-[14px] bg-surface focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-[13px] font-bold text-text-1 mb-1.5 font-sans">WhatsApp Number</label>
              <input
                {...register('whatsapp')}
                placeholder="+91 9876543210"
                className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-sans text-[14px] bg-surface focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-[13px] font-bold text-text-1 mb-1.5 font-sans">RERA Number</label>
              <input
                {...register('rera_number')}
                placeholder="RERA-12345"
                className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-sans text-[14px] bg-surface focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-[13px] font-bold text-text-1 mb-1.5 font-sans">City</label>
              <input
                {...register('city')}
                placeholder="Mumbai"
                className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-sans text-[14px] bg-surface focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto h-11 px-8 bg-primary hover:bg-primary-hover text-primary-foreground rounded-xl font-bold font-sans text-[14px] flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-[0.98] disabled:opacity-70"
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Save Changes
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white border border-[#EBEBEB] rounded-2xl shadow-sm overflow-hidden p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-[15px] text-text-1">Session</h3>
          <p className="text-[13px] text-text-3 mt-0.5">Log out from your current session on this device.</p>
        </div>
        <button
          onClick={handleSignOut}
          className="h-11 px-6 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-bold font-sans text-[14px] flex items-center justify-center gap-2 transition-colors shrink-0"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </div>
  );
}
