import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { formatPrice } from '@/lib/mock-data';
import { Search, Grid3X3, List, Copy, MessageCircle, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';

const statusTabs = ['All', 'Live', 'Draft', 'Expired', 'Collections'];

const SHARE_BASE = 'https://propsite.pages.dev';

function makeCollectionSlug(title: string) {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 40);
  return (base || 'collection') + '-' + Math.random().toString(36).slice(2, 8);
}

export default function DashboardListings() {
  const { user } = useAuth();
  const [listings, setListings] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('All');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [collectionModalOpen, setCollectionModalOpen] = useState(false);
  const [newCollectionTitle, setNewCollectionTitle] = useState('');
  const [selectedListingIds, setSelectedListingIds] = useState<Set<string>>(new Set());
  const [savingCollection, setSavingCollection] = useState(false);

  const loadListings = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('listings')
      .select('*, listing_photos(url, is_hero, order_index)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setListings(data || []);
  }, [user]);

  const loadCollections = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('collections')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setCollections(data || []);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      await Promise.all([loadListings(), loadCollections()]);
      setLoading(false);
    })();
  }, [user, loadListings, loadCollections]);

  const filtered = listings.filter(l => {
    if (tab !== 'All' && tab !== 'Collections' && l.status !== tab.toLowerCase()) return false;
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

  const copyCollectionLink = (slug: string) => {
    const url = `${SHARE_BASE}/c/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success('Collection link copied!');
  };

  const shareCollectionWhatsApp = (slug: string) => {
    const url = `${SHARE_BASE}/c/${slug}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(url)}`, '_blank');
  };

  const toggleListingSelect = (id: string) => {
    setSelectedListingIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const saveCollection = async () => {
    if (!user || !newCollectionTitle.trim()) {
      toast.error('Please enter a title');
      return;
    }
    if (selectedListingIds.size === 0) {
      toast.error('Select at least one listing');
      return;
    }
    setSavingCollection(true);
    const slug = makeCollectionSlug(newCollectionTitle);
    const { error } = await supabase.from('collections').insert({
      user_id: user.id,
      title: newCollectionTitle.trim(),
      slug,
      listing_ids: Array.from(selectedListingIds),
      status: 'live',
    });
    setSavingCollection(false);
    if (error) {
      toast.error(error.message || 'Could not save collection');
      return;
    }
    toast.success('Collection created');
    setCollectionModalOpen(false);
    setNewCollectionTitle('');
    setSelectedListingIds(new Set());
    await loadCollections();
    setTab('Collections');
  };

  const openNewCollectionModal = () => {
    setNewCollectionTitle('');
    setSelectedListingIds(new Set());
    setCollectionModalOpen(true);
  };

  return (
    <DashboardLayout title="My Listings">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-[22px] font-medium text-text-1">Listings</h2>
            <span className="text-xs text-text-3 bg-surface-2 px-2 py-0.5 rounded">{tab === 'Collections' ? collections.length : listings.length}</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {tab === 'Collections' && (
              <button type="button" onClick={openNewCollectionModal} className="btn-primary text-xs h-8 px-3">
                + New Collection
              </button>
            )}
            {tab !== 'Collections' && (
              <>
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
              </>
            )}
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
        ) : tab === 'Collections' ? (
          <div className="space-y-3">
            {collections.map(c => (
              <div key={c.id} className="card-base p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-text-1">{c.title}</div>
                  <div className="text-2xs text-text-3 mt-1">
                    {(c.listing_ids || []).length} listing{(c.listing_ids || []).length !== 1 ? 's' : ''} · {c.total_views ?? 0} views
                  </div>
                  <div className="text-2xs text-text-3 mt-1 break-all">{SHARE_BASE}/c/{c.slug}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => copyCollectionLink(c.slug)} className="btn-primary text-2xs h-8 px-3 flex items-center gap-1">
                    <Copy size={12} /> Copy link
                  </button>
                  <button type="button" onClick={() => shareCollectionWhatsApp(c.slug)} className="btn-secondary text-2xs h-8 px-3 flex items-center gap-1">
                    <MessageCircle size={12} /> WhatsApp
                  </button>
                </div>
              </div>
            ))}
            {collections.length === 0 && (
              <div className="text-center py-12 text-sm text-text-3">No collections yet. Create one to share multiple listings.</div>
            )}
          </div>
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

        {!loading && tab !== 'Collections' && filtered.length === 0 && (
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

      <Dialog open={collectionModalOpen} onOpenChange={setCollectionModalOpen}>
        <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-display">New collection</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 flex-1 min-h-0 flex flex-col">
            <input
              className="input-base w-full"
              placeholder="Collection title"
              value={newCollectionTitle}
              onChange={e => setNewCollectionTitle(e.target.value)}
            />
            <div className="text-label text-text-3">Select listings</div>
            <div className="overflow-y-auto flex-1 max-h-[45vh] space-y-2 pr-1 border border-border rounded-md p-2">
              {listings.length === 0 ? (
                <p className="text-xs text-text-3 py-2">No listings to add yet.</p>
              ) : (
                listings.map(l => (
                  <label key={l.id} className="flex items-start gap-2 p-2 rounded-md hover:bg-surface-2 cursor-pointer">
                    <Checkbox checked={selectedListingIds.has(l.id)} onCheckedChange={() => toggleListingSelect(l.id)} className="mt-0.5" />
                    <span className="text-xs text-text-1">
                      <span className="font-medium">{l.headline}</span>
                      <span className="block text-2xs text-text-3">{l.locality}</span>
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>
          <DialogFooter>
            <button type="button" className="btn-secondary" onClick={() => setCollectionModalOpen(false)}>
              Cancel
            </button>
            <button type="button" className="btn-primary" disabled={savingCollection} onClick={saveCollection}>
              {savingCollection ? 'Saving…' : 'Save'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
