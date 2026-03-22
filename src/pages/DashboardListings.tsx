import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/lib/mock-data';
import { Plus, Search, ExternalLink, MoreVertical, Eye, Building2 } from 'lucide-react';

const STATUS_TABS = ['all', 'live', 'draft', 'expired'] as const;

export default function DashboardListings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<typeof STATUS_TABS[number]>('all');

  useEffect(() => {
    if (!user) return;
    const run = async () => {
      const { data } = await supabase
        .from('listings')
        .select('id, headline, slug, status, price, transaction_type, total_views, city, locality, bhk_config, created_at, listing_photos(url, is_hero)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setListings(data || []);
      setLoading(false);
    };
    run();
  }, [user]);

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
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[12px] text-text-3">
                    <Eye size={12} /> {l.total_views || 0} views
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); navigate(`/dashboard/listings/${l.id}/edit`); }}
                    className="w-8 h-8 rounded-lg hover:bg-surface-2 flex items-center justify-center"
                  >
                    <MoreVertical size={14} className="text-text-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
