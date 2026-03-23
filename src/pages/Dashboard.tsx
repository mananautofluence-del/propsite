import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Building2, Eye, FolderOpen, Flame, Plus, Link as LinkIcon, Image as ImageIcon, Edit2, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { toJpeg } from 'html-to-image';
import { WhatsAppStoryTemplate } from '@/components/WhatsAppStoryTemplate';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ liveListings: 0, totalViews: 0, leads: 0, collections: 0 });
  const [recentListings, setRecentListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const storyRef = useRef<HTMLDivElement>(null);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [selectedListingForStory, setSelectedListingForStory] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    const fetchDashboardData = async () => {
      // 1. Fetch Profile (Name & Credits)
      const { data: prof } = await supabase.from('profiles').select('full_name, credits_remaining, avatar_url, phone, whatsapp, agency_name, rera_number').eq('id', user.id).single();
      setProfile(prof);

      // 2. Fetch Stats & Listings
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

      setRecentListings(rows.slice(0, 3));
      setLoading(false);
    };
    fetchDashboardData();
  }, [user]);

  const firstName = profile?.full_name?.split(' ')[0] || user?.user_metadata?.full_name?.split(' ')[0] || 'there';

  const handleCopyLink = async (e: React.MouseEvent, slug: string) => {
    e.stopPropagation();
    const url = `${window.location.origin}/l/${slug}`;
    await navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  const handleGenerateStory = async (e: React.MouseEvent, listing: any) => {
    e.stopPropagation();
    if (!storyRef.current || !profile) {
        toast.error('Could not load profile or template');
        return;
    }
    setGeneratingId(listing.id);
    setSelectedListingForStory(listing);
    
    setTimeout(async () => {
      try {
        const dataUrl = await toJpeg(storyRef.current!, { quality: 0.95, pixelRatio: 2 });
        const link = document.createElement('a');
        link.download = `story-${listing.slug}.jpg`;
        link.href = dataUrl;
        link.click();
        toast.success('Story downloaded!');
      } catch (err) {
        toast.error('Failed to generate story');
      } finally {
        setGeneratingId(null);
      }
    }, 150);
  };

  const statCards = [
    { label: 'Active Listings', value: stats.liveListings, icon: Building2 },
    { label: 'Total Views', value: stats.totalViews, icon: Eye },
    { label: 'Total Leads', value: stats.leads, icon: Flame },
    { label: 'Collections', value: stats.collections, icon: FolderOpen },
  ];

  if (loading) {
      return (
          <div className="p-6 max-w-md mx-auto md:max-w-none w-full animate-pulse">
              <div className="h-20 bg-surface-2 rounded-2xl mb-8"></div>
              <div className="h-16 bg-surface-2 rounded-2xl mb-8"></div>
              <div className="grid grid-cols-2 gap-4"><div className="h-24 bg-surface-2 rounded-2xl"></div><div className="h-24 bg-surface-2 rounded-2xl"></div></div>
          </div>
      );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-md mx-auto md:max-w-none w-full flex flex-col gap-6 font-sans">
      
      {/* Hidden Story Template */}
      {selectedListingForStory && profile && (
        <WhatsAppStoryTemplate 
          listing={selectedListingForStory} 
          photos={selectedListingForStory.listing_photos || []} 
          broker={{ name: profile.full_name, avatar_url: profile.avatar_url, agency: profile.agency_name, phone: profile.phone, whatsapp: profile.whatsapp }}
          templateRef={storyRef}
        />
      )}

      {/* Greeting & Credits */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[26px] font-semibold text-text-1">Welcome back, {firstName}</h1>
          <p className="text-[14px] text-text-2 mt-0.5">Ready to close some deals?</p>
        </div>
        <div className="flex flex-col items-end">
            <div className="bg-surface border border-[#EBEBEB] rounded-xl px-3 py-1.5 flex items-center gap-2 shadow-sm">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Zap size={14} className="fill-current" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[12px] font-semibold leading-none">{profile?.credits_remaining || 0} Credits</span>
                    <button className="text-[10px] text-primary font-medium hover:underline text-left mt-0.5">Upgrade</button>
                </div>
            </div>
        </div>
      </div>

      {/* Primary Action Button */}
      <Link 
        to="/create" 
        className="w-full bg-primary hover:bg-primary-hover text-primary-foreground h-16 rounded-2xl flex items-center justify-center gap-2 text-[18px] font-medium shadow-lg transition-transform hover:scale-[1.02] active:scale-95"
      >
        <Plus size={24} /> Create New Listing
      </Link>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white border border-[#EBEBEB] rounded-2xl p-4 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center text-text-2">
                    <card.icon size={16} />
                </div>
                <span className="text-[12px] text-text-2 font-medium">{card.label}</span>
            </div>
            <div className="font-display text-[32px] font-bold text-text-1 leading-none tabular-nums tracking-tight">
                {card.value}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Listings */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-[16px] font-bold text-text-1 font-sans">Recent Listings</h2>
          <Link to="/dashboard/listings" className="text-[13px] text-primary font-medium hover:underline">View all</Link>
        </div>
        
        {recentListings.length === 0 ? (
            <div className="bg-white border border-[#EBEBEB] rounded-2xl p-6 text-center shadow-sm">
                <Building2 size={32} className="text-text-3 mx-auto mb-2" />
                <h3 className="text-[14px] font-medium text-text-1">No listings yet</h3>
                <p className="text-[12px] text-text-2 mt-1 mb-4">Create your first property listing to get started.</p>
                <Link to="/create" className="btn-secondary text-[13px] h-9">Create Listing</Link>
            </div>
        ) : (
            <div className="flex flex-col gap-3">
            {recentListings.map((l: any) => {
                const photos = l.listing_photos || [];
                const heroUrl = (photos.find((p: any) => p.is_hero) || photos[0])?.url;
                return (
                <div key={l.id} className="bg-white border border-[#EBEBEB] rounded-2xl p-3 shadow-sm hover:shadow-md transition-shadow cursor-default flex flex-col gap-3">
                    <div className="flex gap-3 items-center" onClick={() => navigate(`/l/${l.slug}`)} style={{ cursor: 'pointer' }}>
                        <div className="w-16 h-16 rounded-xl bg-surface-2 overflow-hidden shrink-0">
                            {heroUrl ? (
                                <img src={heroUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-xl">🏠</div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-[14px] font-semibold text-text-1 truncate">{l.headline || 'Untitled Listing'}</h3>
                            <div className="text-[12px] text-text-2 mt-0.5 truncate">
                                {l.price ? `₹${l.price.toLocaleString('en-IN')}` : 'Price on Request'} • {l.status === 'live' ? 'Live' : 'Draft'}
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center grid grid-cols-3 gap-2 border-t border-border pt-3">
                        <button 
                            onClick={(e) => handleCopyLink(e, l.slug)}
                            className="flex items-center justify-center gap-1.5 h-9 rounded-xl bg-surface-2 text-text-2 hover:text-text-1 hover:bg-[#EBEBEB] transition-colors text-[12px] font-medium"
                        >
                            <LinkIcon size={14} /> Copy Link
                        </button>
                        <button 
                            onClick={(e) => handleGenerateStory(e, l)}
                            disabled={generatingId === l.id}
                            className={`flex items-center justify-center gap-1.5 h-9 rounded-xl bg-[hsl(var(--green-light))] text-primary hover:bg-[#DDF3E4] transition-colors text-[12px] font-medium ${generatingId === l.id ? 'opacity-70 pointer-events-none' : ''}`}
                        >
                            {generatingId === l.id ? <ImageIcon size={14} className="animate-pulse" /> : <ImageIcon size={14} />} 
                            {generatingId === l.id ? 'Loading...' : 'Story'}
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/listings/edit/${l.id}`); }}
                            className="flex items-center justify-center gap-1.5 h-9 rounded-xl bg-surface-2 text-text-2 hover:text-text-1 hover:bg-[#EBEBEB] transition-colors text-[12px] font-medium"
                        >
                            <Edit2 size={14} /> Edit
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
