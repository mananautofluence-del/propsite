import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Building2, Eye, FolderOpen, Flame, Plus, Link as LinkIcon, ExternalLink, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ liveListings: 0, totalViews: 0, leads: 0, collections: 0 });
  const [recentListings, setRecentListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchDashboardData = async () => {
      const { data: prof } = await supabase.from('profiles').select('full_name, credits_remaining, avatar_url, phone, whatsapp, agency_name, rera_number').eq('id', user.id).single();
      setProfile(prof);

      const { data: listings } = await supabase
        .from('listings')
        .select('*, listing_photos(url, is_hero)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      const rows = listings || [];
      const liveListings = rows.filter(l => l.status === 'live');
      const totalViews = rows.reduce((s: number, l: any) => s + (l.total_views || 0), 0);

      const { count: collCount } = await supabase.from('collections').select('id', { count: 'exact', head: true }).eq('user_id', user.id);
      const { count: leadsCount } = await supabase.from('leads').select('id', { count: 'exact', head: true }).eq('user_id', user.id);

      setStats({
        liveListings: liveListings.length,
        totalViews,
        leads: leadsCount || 0,
        collections: collCount || 0,
      });

      setRecentListings(rows.slice(0, 4));

      setLoading(false);
    };
    fetchDashboardData();
  }, [user]);

  const firstName = profile?.full_name?.split(' ')[0] || user?.user_metadata?.full_name?.split(' ')[0] || 'there';

  const handleCopyLink = async (e: React.MouseEvent, slug: string) => {
    e.stopPropagation();
    const url = `${window.location.origin}/l/${slug}`;
    await navigator.clipboard.writeText(url);
    toast.success('Link copied!');
  };

  const statCards = [
    { label: 'Active', value: stats.liveListings, icon: Building2, path: '/dashboard/listings' },
    { label: 'Leads', value: stats.leads, icon: Flame, path: '/dashboard/leads' },
    { label: 'Collections', value: stats.collections, icon: FolderOpen, path: '/dashboard/collections' },
  ];

  if (loading) {
    return (
      <div className="p-4 md:p-6 animate-pulse">
        <div className="h-14 bg-surface-2 rounded-xl mb-5"></div>
        <div className="h-11 bg-surface-2 rounded-xl mb-5"></div>
        <div className="grid grid-cols-2 gap-3"><div className="h-20 bg-surface-2 rounded-xl"></div><div className="h-20 bg-surface-2 rounded-xl"></div></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 flex flex-col gap-5 font-sans">

      {/* Greeting & Credits */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[20px] font-semibold text-text-1">Welcome, {firstName}</h1>
          <p className="text-[13px] text-text-2 mt-0.5">Ready to close some deals?</p>
        </div>
        <div className="bg-surface border border-[#EBEBEB] rounded-lg px-2.5 py-1.5 flex items-center gap-2 shadow-sm">
          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Zap size={12} className="fill-current" />
          </div>
          <div className="flex flex-row items-center gap-3">
            <span className="text-[11px] font-semibold leading-none">{profile?.credits_remaining || 0} Credits</span>
            <button className="text-[10px] text-primary font-medium hover:underline text-left">Upgrade</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1">
        <Link
          to="/create"
          className="bg-primary hover:bg-primary-hover text-primary-foreground h-12 rounded-xl flex items-center justify-center gap-2 text-[15px] font-bold shadow-md transition-transform hover:scale-[1.01] active:scale-[0.98]"
        >
          <Plus size={18} /> Create New Listing
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        {statCards.map((card) => (
          <Link key={card.label} to={card.path} className="bg-white border border-[#EBEBEB] rounded-xl p-3 shadow-sm flex flex-col items-center text-center hover:bg-surface-2 transition-colors cursor-pointer block">
            <card.icon size={16} className="text-text-3 mb-1.5" />
            <div className="font-display text-[22px] font-bold text-text-1 leading-none tabular-nums">{card.value}</div>
            <span className="text-[10px] text-text-3 font-medium mt-1">{card.label}</span>
          </Link>
        ))}
      </div>

      {/* Content Tabs */}
      <div>
        <div className="flex items-center gap-5 border-b border-[#EBEBEB] mb-4">
          <h2 className="pb-2 text-[14px] font-bold font-sans text-text-1 border-b-2 border-primary">
             Recent Listings
          </h2>
        </div>

        {recentListings.length === 0 ? (
          <div className="bg-white border border-[#EBEBEB] rounded-xl p-5 text-center shadow-sm">
            <Building2 size={24} className="text-text-3 mx-auto mb-2" />
            <h3 className="text-[13px] font-medium text-text-1">No listings yet</h3>
            <p className="text-[11px] text-text-2 mt-1 mb-3">Create your first listing to get started.</p>
            <Link to="/create" className="btn-secondary text-[12px] h-8 px-4 inline-flex items-center justify-center">Create Listing</Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {recentListings.map((l: any) => {
              const photos = l.listing_photos || [];
              const heroUrl = (photos.find((p: any) => p.is_hero) || photos[0])?.url;
              return (
                <div key={l.id} className="bg-white border border-[#EBEBEB] rounded-xl p-2.5 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex gap-3 items-center" onClick={() => navigate(`/l/${l.slug}`)}>
                  <div className="w-14 h-14 rounded-lg bg-surface-2 overflow-hidden shrink-0">
                    {heroUrl ? (
                      <img src={heroUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-lg">🏠</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[13px] font-semibold text-text-1 truncate">{l.headline || 'Untitled Listing'}</h3>
                    <div className="text-[11px] text-text-2 mt-0.5 truncate">
                      {l.price ? `₹${l.price.toLocaleString('en-IN')}` : 'Price on Request'} · {l.status === 'live' ? 'Live' : 'Draft'}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={(e) => handleCopyLink(e, l.slug)}
                      className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center text-text-2 hover:text-text-1 hover:bg-[#EBEBEB] transition-colors"
                      title="Copy link"
                    >
                      <LinkIcon size={14} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/l/${l.slug}`); }}
                      className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center text-text-2 hover:text-text-1 hover:bg-[#EBEBEB] transition-colors"
                      title="View listing"
                    >
                      <ExternalLink size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
