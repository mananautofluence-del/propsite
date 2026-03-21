import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { formatPrice } from '@/lib/mock-data';
import { Search, Grid3X3, List, Copy, MessageCircle, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

const statusTabs = ['All', 'Live', 'Draft', 'Expired'];

export default function DashboardListings() {
  const { user } = useAuth();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('All');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');

  const loadListings = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('listings')
      .select('*, listing_photos(url, is_hero, order_index)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setListings(data || []);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      await loadListings();
      setLoading(false);
    })();
  }, [user, loadListings]);

  const filtered = listings.filter(l => {
    if (tab !== 'All' && l.status !== tab.toLowerCase()) return false;
    if (search && !l.headline?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getHeroUrl = (l: any) => {
    const photos = l.listing_photos || [];
    const hero = photos.find((p: any) => p.is_hero) || photos[0];
    return hero?.url;
  };

  const copyLink = (slug: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/l/${slug}`);
    toast.success('Link copied!');
  };

  return (
    <DashboardLayout title="My Listings">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-[22px] font-medium text-text-1">Listings</h2>
            <span className="text-xs text-text-3 bg-surface-2 px-2 py-0.5 rounded">{listings.length}</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-3" />
              <input value={search} onChange={e => setSearch(e.target.value)} className="input-base pl-8 w-48" placeholder="Search listings..." />
            </div>
            <div className="flex border border-border rounded-md overflow-hidden">
              <button type="button" onClick={() => setView('grid')} className={`w-8 h-8 flex items-center justify-center ${view === 'grid' ? 'bg-surface-2' : 'bg-surface'}`}>
                <Grid3X3 size={14} className="text-text-2" />
              </button>
              <button type="button" onClick={() => setView('list')} className={`w-8 h-8 flex items-center justify-center ${view === 'list' ? 'bg-surface-2' : 'bg-surface'}`}>
                <List size={14} className="text-text-2" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-4 border-b border-border flex-wrap">
          {statusTabs.map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`pb-2 text-xs font-medium transition-colors ${tab === t ? 'text-text-1 border-b-2 border-primary' : 'text-text-3 hover:text-text-2'}`}
            >
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-16 text-sm text-text-3">Loading…</div>
        ) : view === 'grid' ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map(l => (
              <div key={l.id} className="card-base p-0 overflow-hidden group">
                <div className="relative h-[180px] bg-surface-2">
                  {getHeroUrl(l) ? (
                    <img src={getHeroUrl(l)} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-3 text-2xl">🏠</div>
                  )}
                  <div className="absolute top-2 left-2">
                    {l.status === 'live' ? <span className="badge-live">Live</span> : <span className="badge-draft">Draft</span>}
                  </div>
                </div>
                <div className="p-3">
                  <div className="text-[13px] font-medium text-text-1 truncate">{l.headline}</div>
                  <div className="text-xs text-text-3 mt-0.5">{l.locality}, {l.city}</div>
                  <div className="text-sm font-medium text-primary mt-1">{formatPrice(l.price, l.transaction_type)}</div>
                  <div className="flex items-center gap-3 mt-1 text-2xs text-text-3">
                    <span className="flex items-center gap-1">
                      <Eye size={10} /> {l.total_views || 0}
                    </span>
                  </div>
                  <div className="border-t border-border mt-2.5 pt-2.5 flex items-center gap-1.5">
                    <button type="button" onClick={() => copyLink(l.slug)} className="btn-primary text-2xs h-7 px-3 flex items-center gap-1">
                      <Copy size={10} /> Copy Link
                    </button>
                    <a href={`https://wa.me/?text=${encodeURIComponent(`${window.location.origin}/l/${l.slug}`)}`} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-md border border-border flex items-center justify-center hover:bg-surface-2">
                      <MessageCircle size={12} className="text-primary" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card-base p-0 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="text-label text-text-3 py-2.5 px-3">Listing</th>
                  <th className="text-label text-text-3 py-2.5 px-3 hidden md:table-cell">Price</th>
                  <th className="text-label text-text-3 py-2.5 px-3 hidden md:table-cell">Views</th>
                  <th className="text-label text-text-3 py-2.5 px-3 hidden lg:table-cell">Status</th>
                  <th className="text-label text-text-3 py-2.5 px-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(l => (
                  <tr key={l.id} className="border-b border-border last:border-0 h-11 hover:bg-surface-2/50">
                    <td className="px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-7 rounded bg-surface-2 overflow-hidden">{getHeroUrl(l) ? <img src={getHeroUrl(l)} alt="" className="w-full h-full object-cover" /> : null}</div>
                        <div className="min-w-0">
                          <div className="text-xs font-medium text-text-1 truncate">{l.headline}</div>
                          <div className="text-2xs text-text-3">{l.locality}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 text-xs font-medium text-text-1 hidden md:table-cell">{formatPrice(l.price, l.transaction_type)}</td>
                    <td className="px-3 text-xs text-text-2 hidden md:table-cell">{l.total_views || 0}</td>
                    <td className="px-3 hidden lg:table-cell">{l.status === 'live' ? <span className="badge-live">Live</span> : <span className="badge-draft">Draft</span>}</td>
                    <td className="px-3">
                      <button type="button" onClick={() => copyLink(l.slug)} className="btn-primary text-2xs h-6 px-2">
                        <Copy size={10} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">🏠</div>
            <h3 className="text-h4 text-text-1 mb-1">No listings yet</h3>
            <p className="text-xs text-text-2 mb-4">Create your first listing to get started</p>
            <Link to="/dashboard/listings/new" className="btn-primary inline-flex items-center">
              Create Listing
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
