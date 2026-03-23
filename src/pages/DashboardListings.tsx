import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/lib/mock-data';
import { Plus, Search, Eye, Building2, UserPlus, Share2, Loader2, X, ExternalLink, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';

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

  const [showCobrokeModal, setShowCobrokeModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);

  const handleCopyClientLink = async (listing: any) => {
    const url = `${window.location.origin}/l/${listing.slug}`;
    await navigator.clipboard.writeText(url);
    toast.success('Client link copied!');
  };

  const handleCopyBrokerLink = async (listing: any) => {
    const url = `${window.location.origin}/l/${listing.slug}?share=broker`;
    await navigator.clipboard.writeText(url);
    toast.success('Broker link copied!');
  };

  useEffect(() => {
    if (!user) return;
    const run = async () => {
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(prof);

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
    if (activeTab !== 'all' && activeTab !== 'marketplace' && l.status !== activeTab) return false;
    if (search && !(l.headline || '').toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getHeroPhoto = (l: any) => {
    const photos = l.listing_photos || [];
    return (photos.find((p: any) => p.is_hero) || photos[0])?.url;
  };

  return (
    <div className="p-4 md:p-6 font-sans">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-display text-[20px] font-semibold text-text-1">My Listings</h1>
        <Link to="/create" className="btn-primary flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-lg text-[13px]">
          <Plus size={16} /> <span className="hidden sm:inline">New Listing</span>
        </Link>
      </div>

      {/* Search + Tabs */}
      <div className="flex flex-col gap-3 mb-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-3" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search properties..."
            className="w-full h-10 pl-9 pr-4 bg-white border border-[#EBEBEB] rounded-lg text-[13px] text-text-1 shadow-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow placeholder:text-text-3"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
          {STATUS_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-[12px] px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-all ${
                activeTab === tab
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-white border border-[#EBEBEB] text-text-2 hover:bg-surface-2'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Listing List */}
      {loading ? (
        <div className="text-center text-text-3 py-10 text-[13px]">Loading…</div>
      ) : listings.length === 0 ? (
        <div className="bg-white border border-[#EBEBEB] rounded-xl p-6 text-center shadow-sm mt-4 mx-auto max-w-sm">
          <div className="w-14 h-14 bg-surface-2 rounded-full flex items-center justify-center mx-auto mb-3">
            <Building2 size={24} className="text-text-3" />
          </div>
          <h3 className="text-[15px] font-semibold text-text-1 mb-1">No listings yet</h3>
          <p className="text-[12px] text-text-2 mb-4">Create your first property listing to get started.</p>
          <Link to="/create" className="btn-primary inline-flex items-center justify-center gap-2 h-10 px-6 w-full text-[13px]">
            <Plus size={16} /> Create Listing
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10 text-text-3 text-[13px]">No listings match your search.</div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filtered.map((l) => (
            <div
              key={l.id}
              className="bg-white border border-[#EBEBEB] rounded-xl p-2.5 shadow-sm transition-all hover:shadow-md cursor-pointer"
              onClick={() => navigate(`/l/${l.slug}`)}
            >
              <div className="flex gap-3 items-center">
                <div className="w-16 h-16 rounded-lg bg-surface-2 overflow-hidden shrink-0">
                  {getHeroPhoto(l) ? (
                    <img src={getHeroPhoto(l)} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl">🏠</div>
                  )}
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <div className="font-display text-[14px] font-bold text-primary truncate">
                      {l.price ? formatPrice(l.price, l.transaction_type) : 'Price on Request'}
                    </div>
                    <span className={`shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide ${
                      l.status === 'live' ? 'bg-[#DDF3E4] text-[#1A5C3A]' :
                      l.status === 'draft' ? 'bg-gray-100 text-gray-600' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {l.status}
                    </span>
                  </div>
                  <div className="text-[13px] font-medium text-text-1 font-sans line-clamp-1 mb-0.5">
                    {l.headline || 'Untitled Listing'}
                  </div>
                  <div className="text-[11px] text-text-3 font-sans truncate flex items-center gap-1">
                    <span>{[l.locality, l.city].filter(Boolean).join(', ')}</span>
                    {l.bhk_config && <span>· {l.bhk_config}</span>}
                    <span className="ml-auto flex items-center gap-0.5"><Eye size={10} /> {l.total_views || 0}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex gap-2 mt-2.5 pt-2.5 border-t border-border">
                {activeTab === 'marketplace' ? (
                  <button
                    onClick={e => { e.stopPropagation(); setSelectedListing(l); setShowCobrokeModal(true); }}
                    className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg text-primary bg-[hsl(var(--green-light))] hover:bg-[#DDF3E4] transition-colors text-[11px] font-medium"
                  >
                    <UserPlus size={13} /> Co-Broke
                  </button>
                ) : (
                  <button
                    onClick={e => { e.stopPropagation(); setSelectedListing(l); setShowShareModal(true); }}
                    className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg text-primary bg-[hsl(var(--green-light))] hover:bg-[#DDF3E4] transition-colors text-[11px] font-medium"
                  >
                    <Share2 size={13} /> Share
                  </button>
                )}
                <button
                  onClick={e => { e.stopPropagation(); navigate(`/l/${l.slug}`); }}
                  className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg bg-surface-2 text-text-2 hover:text-text-1 hover:bg-[#EBEBEB] transition-colors text-[11px] font-medium"
                >
                  <ExternalLink size={13} /> View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Share Modal (Phase 5: Client Link + Broker Link) */}
      {showShareModal && selectedListing && (
        <div className="fixed inset-0 bg-black/60 z-[1000] flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-t-[24px] sm:rounded-[20px] p-6 animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[16px] font-bold text-text-1">Share Listing</h3>
              <button onClick={() => setShowShareModal(false)} className="p-1.5 hover:bg-gray-100 rounded-full">
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => { handleCopyClientLink(selectedListing); setShowShareModal(false); }}
                className="flex items-center gap-3 p-3 rounded-xl bg-surface-2 hover:bg-[#EBEBEB] transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                  <LinkIcon size={18} className="text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-text-1 text-[13px]">Copy Client Link</div>
                  <div className="text-text-3 text-[11px]">Standard public URL for buyers</div>
                </div>
              </button>

              <button
                onClick={() => { handleCopyBrokerLink(selectedListing); setShowShareModal(false); }}
                className="flex items-center gap-3 p-3 rounded-xl bg-surface-2 hover:bg-[#EBEBEB] transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                  <UserPlus size={18} className="text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-text-1 text-[13px]">Copy Broker Link</div>
                  <div className="text-text-3 text-[11px]">Opens co-broke prompt for other brokers</div>
                </div>
              </button>
            </div>

            <button
              onClick={() => setShowShareModal(false)}
              className="w-full mt-4 py-3 bg-gray-100 text-gray-900 rounded-xl font-semibold text-[13px]"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Co-Broke Modal */}
      {showCobrokeModal && selectedListing && (
        <div className="fixed inset-0 bg-black/60 z-[1000] flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-t-[24px] sm:rounded-[20px] p-6 animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[16px] font-bold text-text-1">Co-Broke Listing</h3>
              <button onClick={() => setShowCobrokeModal(false)} className="p-1.5 hover:bg-gray-100 rounded-full">
                <X size={18} />
              </button>
            </div>
            <p className="text-[13px] text-gray-500 mb-5 leading-relaxed">
              Generate a client-ready link for this listing for 1 credit.
            </p>
            <div className="flex flex-col gap-2.5">
              <button
                onClick={handleGenerateCobroke}
                disabled={isGeneratingLink}
                className="w-full py-3 bg-[#1A5C3A] text-white rounded-xl font-bold text-[14px] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isGeneratingLink ? <Loader2 className="animate-spin" size={18} /> : <UserPlus size={18} />}
                Confirm & Generate
              </button>
              <button
                onClick={() => setShowCobrokeModal(false)}
                className="w-full py-3 bg-gray-100 text-gray-900 rounded-xl font-semibold text-[13px]"
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
