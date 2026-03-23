import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/lib/mock-data';
import { Plus, Search, ExternalLink, MoreVertical, Eye, Building2, Download, UserPlus, Share2, Loader2, X } from 'lucide-react';
import { toJpeg } from 'html-to-image';
import { toast } from 'sonner';
import { WhatsAppStoryTemplate } from '@/components/WhatsAppStoryTemplate';

const STATUS_TABS = ['all', 'live', 'draft', 'marketplace'] as const;

export default function DashboardListings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<typeof STATUS_TABS[number]>(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const tab = searchParams.get('tab') as any;
    if (STATUS_TABS.includes(tab)) return tab;
    if (window.location.pathname.includes('marketplace')) return 'marketplace';
    return 'all';
  });
  const [profile, setProfile] = useState<any>(null);

  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [showCobrokeModal, setShowCobrokeModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const storyRef = useRef<HTMLDivElement>(null);

  const handleCopyLink = async (listing: any) => {
    const url = `${window.location.origin}/l/${listing.slug}`;
    await navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  useEffect(() => {
    if (!user) return;
    const run = async () => {
      // 1. Fetch Profile
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(prof);

      // 2. Fetch Listings
      let query = supabase.from('listings').select('*, listing_photos(url, is_hero)');
      
      if (activeTab === 'marketplace') {
        query = query.eq('status', 'live').neq('user_id', user.id);
      } else {
        query = query.eq('user_id', user.id);
        if (activeTab !== 'all') {
          query = query.eq('status', activeTab);
        }
      }

      const { data } = await query.order('created_at', { ascending: false });
      setListings(data || []);
      setLoading(false);
    };
    run();
  }, [user, activeTab]);

  const handleDownloadStory = async (listing: any) => {
    if (!storyRef.current) return;
    setGeneratingId(listing.id);
    setSelectedListing(listing);
    
    // Small delay to ensure template renders with correct data
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
    }, 100);
  };

  const handleGenerateCobroke = async () => {
    if (!selectedListing || !user) return;
    setIsGeneratingLink(true);
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('generate_cobroke_link' as any, {
        p_listing_id: selectedListing.id,
        p_partner_id: user.id
      });

      if (rpcError) throw rpcError;

      const result = rpcData as any;
      if (result.success) {
        const url = `${window.location.origin}/l/${selectedListing.slug}?partner=${user.id}`;
        await navigator.clipboard.writeText(url);
        toast.success('Co-Broke link copied to clipboard!');
        setShowCobrokeModal(false);
      } else {
        toast.error(result.message || 'Failed to generate link');
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred');
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const filtered = listings.filter(l => {
    if (activeTab !== 'all' && l.status !== activeTab) return false;
    if (search && !(l.headline || '').toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getHeroPhoto = (l: any) => {
    const photos = l.listing_photos || [];
    return (photos.find((p: any) => p.is_hero) || photos[0])?.url;
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-[24px] font-medium text-text-1">My Listings</h1>
        <Link to="/create" className="btn-primary flex items-center gap-1.5">
          <Plus size={14} /> New Listing
        </Link>
      </div>

      {/* Search + Tabs */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-3" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search listings..."
            className="input-base w-full pl-9"
          />
        </div>
        <div className="flex gap-1.5">
          {STATUS_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-[12px] px-3.5 py-1.5 rounded-full font-sans font-medium transition-all ${
                activeTab === tab
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-surface-2 text-text-2 hover:text-text-1'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Listing Grid */}
      {loading ? (
        <div className="text-center text-text-3 py-12">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <Building2 size={32} className="text-text-3 mx-auto mb-3" />
          <div className="text-sm text-text-2 mb-4">No listings found</div>
          <Link to="/create" className="btn-primary inline-flex items-center gap-1.5">
            <Plus size={14} /> Create your first listing
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((l) => (
            <div
              key={l.id}
              className="rounded-2xl overflow-hidden group cursor-pointer transition-all hover:translate-y-[-2px]"
              style={{ boxShadow: 'var(--shadow-sm)' }}
              onClick={() => navigate(`/l/${l.slug}`)}
            >
              {/* Photo */}
              <div className="relative aspect-[4/3] bg-surface-2">
                {getHeroPhoto(l) ? (
                  <img src={getHeroPhoto(l)} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl">🏠</div>
                )}
                {/* Status badge */}
                <div className="absolute top-3 left-3">
                  <span className={
                    l.status === 'live' ? 'badge-live' :
                    l.status === 'draft' ? 'badge-draft' :
                    'badge-expired'
                  }>
                    {l.status === 'live' ? '● Live' : l.status === 'draft' ? 'Draft' : 'Expired'}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="font-display text-[18px] font-medium text-primary mb-1">
                  {l.price ? formatPrice(l.price, l.transaction_type) : '—'}
                </div>
                <div className="text-[14px] font-medium text-text-1 font-sans line-clamp-2 mb-1.5 leading-snug">
                  {l.headline || 'Untitled'}
                </div>
                <div className="text-[12px] text-text-3 font-sans mb-3">
                  {[l.locality, l.city].filter(Boolean).join(', ')} {l.bhk_config ? `· ${l.bhk_config}` : ''}
                </div>
                <div className="flex items-center justify-between mt-auto pt-2">
                  <div className="flex items-center gap-1 text-[12px] text-text-3">
                    <Eye size={12} /> {l.total_views || 0} views
                  </div>
                  <div className="flex items-center gap-1">
                    {activeTab === 'marketplace' ? (
                      <button
                        onClick={e => { e.stopPropagation(); setSelectedListing(l); setShowCobrokeModal(true); }}
                        className="p-1.5 hover:bg-surface-2 rounded-lg text-primary"
                        title="Co-Broke"
                      >
                        <UserPlus size={16} />
                      </button>
                    ) : (
                      <button
                        onClick={e => { e.stopPropagation(); setSelectedListing(l); setShowShareModal(true); }}
                        className="p-1.5 hover:bg-surface-2 rounded-lg text-primary"
                        title="Share"
                      >
                        <Share2 size={16} />
                      </button>
                    )}
                    <button
                      onClick={e => { e.stopPropagation(); navigate(`/dashboard/listings/${l.id}/edit`); }}
                      className="p-1.5 hover:bg-surface-2 rounded-lg"
                    >
                      <MoreVertical size={16} className="text-text-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hidden Story Template */}
      {selectedListing && (
        <WhatsAppStoryTemplate 
          listing={selectedListing}
          photos={selectedListing.listing_photos || []}
          broker={{
            name: profile?.full_name || 'Expert Broker',
            agency: profile?.agency_name || 'PropSite Partner',
            avatar_url: profile?.avatar_url,
            rera_number: profile?.rera_number
          }}
          templateRef={storyRef}
        />
      )}

      {/* Listing Share Modal */}
      {showShareModal && selectedListing && (
        <div className="fixed inset-0 bg-black/60 z-[1000] flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-[32px] p-8 animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Share Listing</h3>
              <button onClick={() => setShowShareModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => handleCopyLink(selectedListing)}
                className="flex items-center gap-4 p-4 rounded-2xl bg-surface-2 hover:bg-surface-3 transition-colors text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
                  <Share2 size={20} className="text-primary" />
                </div>
                <div>
                  <div className="font-bold text-text-1 text-[15px]">Copy Public Link</div>
                  <div className="text-text-3 text-[13px]">Standard shareable URL</div>
                </div>
              </button>

              <button
                onClick={() => { setShowShareModal(false); handleDownloadStory(selectedListing); }}
                disabled={generatingId === selectedListing.id}
                className="flex items-center gap-4 p-4 rounded-2xl bg-surface-2 hover:bg-surface-3 transition-colors text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
                  {generatingId === selectedListing.id ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} className="text-primary" />}
                </div>
                <div>
                  <div className="font-bold text-text-1 text-[15px]">Download WhatsApp Story</div>
                  <div className="text-text-3 text-[13px]">9:16 high-res status image</div>
                </div>
              </button>
            </div>

            <button
              onClick={() => setShowShareModal(false)}
              className="w-full mt-6 py-4 bg-gray-100 text-gray-900 rounded-2xl font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Co-Broke Modal */}
      {showCobrokeModal && selectedListing && (
        <div className="fixed inset-0 bg-black/60 z-[1000] flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-[32px] p-8 animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Co-Broke Listing</h3>
              <button onClick={() => setShowCobrokeModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Generate a client-ready link for this listing for 1 credit.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleGenerateCobroke}
                disabled={isGeneratingLink}
                className="w-full py-4 bg-[#1A5C3A] text-white rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isGeneratingLink ? <Loader2 className="animate-spin" /> : <UserPlus size={20} />}
                Confirm & Generate
              </button>
              <button
                onClick={() => setShowCobrokeModal(false)}
                className="w-full py-4 bg-gray-100 text-gray-900 rounded-2xl font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
