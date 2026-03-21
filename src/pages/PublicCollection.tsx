import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/lib/mock-data';
import { Loader2 } from 'lucide-react';

export default function PublicCollectionPage() {
  const { slug } = useParams();
  const [collection, setCollection] = useState<{ id: string; title: string; listing_ids: string[]; total_views: number | null } | null>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const run = async () => {
      const { data, error } = await supabase
        .from('collections')
        .select('id, title, listing_ids, total_views, status')
        .eq('slug', slug)
        .eq('status', 'live')
        .maybeSingle();

      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const ids = data.listing_ids || [];
      if (ids.length === 0) {
        setCollection({ id: data.id, title: data.title, listing_ids: ids, total_views: data.total_views });
        setListings([]);
        setLoading(false);
        return;
      }

      const { data: listingRows } = await supabase
        .from('listings')
        .select('id, headline, slug, price, locality, city, transaction_type, listing_photos(url, is_hero)')
        .in('id', ids)
        .eq('status', 'live');

      const order = new Map(ids.map((id, i) => [id, i]));
      const sorted = (listingRows || []).sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));

      setCollection({ id: data.id, title: data.title, listing_ids: ids, total_views: data.total_views });
      setListings(sorted);
      setLoading(false);
    };
    run();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-primary" />
      </div>
    );
  }

  if (notFound || !collection) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="font-display text-2xl font-medium text-text-1 mb-2">Collection not found</h1>
          <p className="text-sm text-text-2">This collection may have been removed.</p>
        </div>
      </div>
    );
  }

  const getHero = (l: any) => {
    const photos = l.listing_photos || [];
    const hero = photos.find((p: any) => p.is_hero) || photos[0];
    return hero?.url;
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="border-b border-border bg-surface">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <h1 className="font-display text-2xl md:text-[28px] font-medium text-text-1">{collection.title}</h1>
          <p className="text-xs text-text-3 mt-1">{listings.length} listing{listings.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((l) => (
            <Link key={l.id} to={`/l/${l.slug}`} className="card-base p-0 overflow-hidden hover:border-primary/30 transition-colors">
              <div className="h-[140px] bg-surface-2">
                {getHero(l) ? <img src={getHero(l)} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-3xl">🏠</div>}
              </div>
              <div className="p-3">
                <div className="text-[13px] font-medium text-text-1 line-clamp-2">{l.headline}</div>
                <div className="text-2xs text-text-3 mt-0.5">{l.locality}, {l.city}</div>
                <div className="text-sm font-medium text-primary mt-1 font-display">{formatPrice(l.price, l.transaction_type)}</div>
              </div>
            </Link>
          ))}
        </div>
        {listings.length === 0 && <p className="text-sm text-text-3 text-center py-12">No listings in this collection yet.</p>}
      </div>
    </div>
  );
}
