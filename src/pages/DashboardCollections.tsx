import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { formatPrice } from '@/lib/mock-data';
import { Copy, MessageCircle, Pencil, Trash2, Layers } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';

const SHARE_BASE = 'https://propsite.pages.dev';

function makeCollectionSlug(title: string) {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 40);
  return (base || 'collection') + '-' + Math.random().toString(36).slice(2, 8);
}

export default function DashboardCollections() {
  const { user } = useAuth();
  const [listings, setListings] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Create / edit modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [modalTitle, setModalTitle] = useState('');
  const [modalDescription, setModalDescription] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  // Delete confirmation
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadListings = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('listings')
      .select('id, headline, locality, city, price, transaction_type, status, listing_photos(url, is_hero)')
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

  // ── Modal helpers ──

  const openCreate = () => {
    setEditingId(null);
    setModalTitle('');
    setModalDescription('');
    setSelectedIds(new Set());
    setModalOpen(true);
  };

  const openEdit = (c: any) => {
    setEditingId(c.id);
    setModalTitle(c.title || '');
    setModalDescription(c.description || '');
    setSelectedIds(new Set(c.listing_ids || []));
    setModalOpen(true);
  };

  const toggleId = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSave = async () => {
    if (!user) return;
    if (!modalTitle.trim()) { toast.error('Please enter a title'); return; }
    if (selectedIds.size === 0) { toast.error('Select at least one listing'); return; }

    setSaving(true);

    if (editingId) {
      // Update existing
      const { error } = await supabase
        .from('collections')
        .update({
          title: modalTitle.trim(),
          description: modalDescription.trim() || null,
          listing_ids: Array.from(selectedIds),
        })
        .eq('id', editingId);
      setSaving(false);
      if (error) { toast.error(error.message || 'Could not update'); return; }
      toast.success('Collection updated');
    } else {
      // Create new
      const slug = makeCollectionSlug(modalTitle);
      const { error } = await supabase.from('collections').insert({
        user_id: user.id,
        title: modalTitle.trim(),
        description: modalDescription.trim() || null,
        slug,
        listing_ids: Array.from(selectedIds),
        status: 'live',
      });
      setSaving(false);
      if (error) { toast.error(error.message || 'Could not save'); return; }
      toast.success('Collection created');
    }

    setModalOpen(false);
    await loadCollections();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const { error } = await supabase.from('collections').delete().eq('id', deleteId);
    setDeleting(false);
    if (error) { toast.error(error.message || 'Could not delete'); return; }
    toast.success('Collection deleted');
    setDeleteId(null);
    await loadCollections();
  };

  const copyLink = (slug: string) => {
    navigator.clipboard.writeText(`${SHARE_BASE}/c/${slug}`);
    toast.success('Link copied!');
  };

  const shareWhatsApp = (slug: string) => {
    window.open(`https://wa.me/?text=${encodeURIComponent(`${SHARE_BASE}/c/${slug}`)}`, '_blank');
  };

  const getHeroUrl = (l: any) => {
    const photos = l.listing_photos || [];
    const hero = photos.find((p: any) => p.is_hero) || photos[0];
    return hero?.url;
  };

  // Resolve listing names for a collection
  const getListingNames = (ids: string[]) => {
    return ids
      .map(id => listings.find(l => l.id === id))
      .filter(Boolean)
      .map((l: any) => l.headline || 'Unnamed')
      .slice(0, 3);
  };

  return (
    <DashboardLayout title="Collections">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-[22px] font-medium text-text-1">Collections</h2>
            <span className="text-xs text-text-3 bg-surface-2 px-2 py-0.5 rounded">{collections.length}</span>
          </div>
          <button type="button" onClick={openCreate} className="btn-primary text-xs h-8 px-3">
            + New Collection
          </button>
        </div>

        {/* Collection list */}
        {loading ? (
          <div className="text-center py-16 text-sm text-text-3">Loading…</div>
        ) : collections.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">📂</div>
            <h3 className="text-h4 text-text-1 mb-1">No collections yet</h3>
            <p className="text-xs text-text-2 mb-4">Bundle multiple listings under one shareable link</p>
            <button type="button" onClick={openCreate} className="btn-primary inline-flex items-center text-xs h-8 px-4">
              Create Collection
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {collections.map(c => {
              const names = getListingNames(c.listing_ids || []);
              const total = (c.listing_ids || []).length;
              return (
                <div key={c.id} className="card-base p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <Layers size={14} className="text-primary shrink-0" />
                        <div className="text-sm font-medium text-text-1 truncate">{c.title}</div>
                      </div>
                      {c.description && (
                        <p className="text-2xs text-text-2 mt-0.5 line-clamp-2">{c.description}</p>
                      )}
                      <div className="text-2xs text-text-3 mt-1.5">
                        {total} listing{total !== 1 ? 's' : ''} · {c.total_views ?? 0} views
                      </div>
                      {names.length > 0 && (
                        <div className="text-2xs text-text-3 mt-0.5 truncate">
                          {names.join(', ')}{total > 3 ? ` +${total - 3} more` : ''}
                        </div>
                      )}
                      <div className="text-2xs text-text-3 mt-1 break-all font-mono">{SHARE_BASE}/c/{c.slug}</div>
                    </div>

                    <div className="flex flex-wrap gap-2 shrink-0">
                      <button type="button" onClick={() => copyLink(c.slug)} className="btn-primary text-2xs h-7 px-2.5 flex items-center gap-1">
                        <Copy size={11} /> Copy
                      </button>
                      <button type="button" onClick={() => shareWhatsApp(c.slug)} className="btn-secondary text-2xs h-7 px-2.5 flex items-center gap-1">
                        <MessageCircle size={11} /> Share
                      </button>
                      <button type="button" onClick={() => openEdit(c)} className="btn-secondary text-2xs h-7 px-2.5 flex items-center gap-1">
                        <Pencil size={11} /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteId(c.id)}
                        className="h-7 px-2.5 rounded-md border border-red-200 text-red-600 hover:bg-red-50 text-2xs flex items-center gap-1 transition-colors"
                      >
                        <Trash2 size={11} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Create / Edit Modal ── */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-display">{editingId ? 'Edit collection' : 'New collection'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 flex-1 min-h-0 flex flex-col">
            <input
              className="input-base w-full"
              placeholder="Collection title"
              value={modalTitle}
              onChange={e => setModalTitle(e.target.value)}
            />
            <textarea
              className="input-base w-full resize-none"
              rows={2}
              placeholder="Description (optional)"
              value={modalDescription}
              onChange={e => setModalDescription(e.target.value)}
            />
            <div className="text-label text-text-3">Select listings</div>
            <div className="overflow-y-auto flex-1 max-h-[40vh] space-y-1 pr-1 border border-border rounded-md p-2">
              {listings.filter(l => l.status === 'live').length === 0 ? (
                <p className="text-xs text-text-3 py-2">No live listings to add yet.</p>
              ) : (
                listings.filter(l => l.status === 'live').map(l => (
                  <label key={l.id} className="flex items-start gap-2.5 p-2 rounded-md hover:bg-surface-2 cursor-pointer">
                    <Checkbox checked={selectedIds.has(l.id)} onCheckedChange={() => toggleId(l.id)} className="mt-0.5" />
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {getHeroUrl(l) ? (
                        <img src={getHeroUrl(l)} alt="" className="w-8 h-6 rounded object-cover shrink-0" />
                      ) : (
                        <div className="w-8 h-6 rounded bg-surface-2 shrink-0" />
                      )}
                      <span className="text-xs text-text-1 min-w-0">
                        <span className="font-medium block truncate">{l.headline || 'Untitled'}</span>
                        <span className="text-2xs text-text-3">{l.locality}{l.city ? `, ${l.city}` : ''}</span>
                      </span>
                    </div>
                  </label>
                ))
              )}
            </div>
            {selectedIds.size > 0 && (
              <div className="text-2xs text-primary font-medium">{selectedIds.size} listing{selectedIds.size !== 1 ? 's' : ''} selected</div>
            )}
          </div>
          <DialogFooter>
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="button" className="btn-primary" disabled={saving} onClick={handleSave}>
              {saving ? 'Saving…' : editingId ? 'Update' : 'Create'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Modal ── */}
      <Dialog open={deleteId !== null} onOpenChange={(open) => { if (!open) setDeleteId(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">Delete collection?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-text-2">This will permanently delete this collection link. Your listings won't be affected.</p>
          <DialogFooter>
            <button type="button" className="btn-secondary" onClick={() => setDeleteId(null)}>
              Cancel
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={handleDelete}
              className="h-9 px-4 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
