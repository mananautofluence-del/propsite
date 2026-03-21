import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/lib/mock-data';
import { Loader2, MapPin, Phone, MessageCircle, Check, ChevronLeft, ChevronRight, X, Camera } from 'lucide-react';

/* ── Amenity icon mapper ── */
function getAmenityIcon(text: string): string {
  const t = text.toLowerCase();
  const map: [RegExp, string][] = [
    [/lift|elevator/, '🛗'], [/power|backup|generator/, '⚡'], [/pool|swimming/, '🏊'],
    [/gym|fitness/, '💪'], [/security|cctv|gated/, '🔒'], [/parking|car/, '🚗'],
    [/garden|park|green|landscape/, '🌿'], [/club\s*house/, '🏛️'], [/play|children|kids/, '🎮'],
    [/cricket|sport|court/, '🏏'], [/jogging|track|walking/, '🏃'], [/rain\s*water/, '💧'],
    [/fire/, '🧯'], [/intercom|wifi|internet/, '📶'], [/solar/, '☀️'],
    [/temple|meditation|yoga/, '🧘'], [/library|reading/, '📚'], [/spa|sauna/, '🧖'],
    [/cinema|theater|theatre/, '🎬'], [/pet/, '🐾'],
  ];
  for (const [re, icon] of map) if (re.test(t)) return icon;
  return '✓';
}

/* ── Highlight icon mapper ── */
function getHighlightIcon(text: string): string {
  const t = text.toLowerCase();
  const map: [RegExp, string][] = [
    [/area|sqft|carpet/, '📐'], [/sea|ocean|water\s*view/, '🌊'], [/floor|view|high/, '🏙️'],
    [/parking|car/, '🚗'], [/furnished|furniture/, '🛋️'], [/pool|swimming/, '🏊'],
    [/gym/, '💪'], [/garden|park|green/, '🌿'], [/school|education/, '🎓'],
    [/hospital|medical/, '🏥'], [/metro|station|transport/, '🚇'], [/cricket|sport/, '🏏'],
    [/security|cctv|gated/, '🔒'], [/lift|elevator/, '🛗'], [/power|backup/, '⚡'], [/vastu/, '🕉️'],
  ];
  for (const [re, icon] of map) if (re.test(t)) return icon;
  return '✨';
}

function SafeImage({ src, alt = '', className = '' }: { src: string; alt?: string; className?: string }) {
  const [err, setErr] = useState(false);
  if (err) return <div className="w-full h-full bg-surface-2 flex items-center justify-center"><Camera size={20} className="text-text-3" /></div>;
  return <img src={src} alt={alt} className={className} onError={() => setErr(true)} loading="lazy" />;
}

export default function PublicCollectionPage() {
  const { slug } = useParams();
  const [collection, setCollection] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);

  // Touch swipe state
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  // Lightbox touch state
  const lbTouchStartX = useRef(0);

  const chipsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const run = async () => {
      const { data, error } = await supabase
        .from('collections')
        .select('id, title, description, listing_ids, total_views, status')
        .eq('slug', slug)
        .eq('status', 'live')
        .maybeSingle();

      if (error || !data) { setNotFound(true); setLoading(false); return; }

      const ids = data.listing_ids || [];
      if (ids.length === 0) {
        setCollection(data); setListings([]); setLoading(false); return;
      }

      const { data: rows } = await supabase
        .from('listings')
        .select('*, listing_photos(url, is_hero, order_index, room_tag)')
        .in('id', ids)
        .eq('status', 'live');

      const order = new Map(ids.map((id: string, i: number) => [id, i]));
      const sorted = (rows || []).sort((a: any, b: any) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));

      setCollection(data);
      setListings(sorted);
      setLoading(false);
    };
    run();
  }, [slug]);

  // Scroll active chip into view
  useEffect(() => {
    if (!chipsRef.current) return;
    const chip = chipsRef.current.children[activeIdx] as HTMLElement;
    if (chip) chip.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [activeIdx]);

  const goTo = useCallback((idx: number) => {
    if (idx < 0 || idx >= listings.length) return;
    setActiveIdx(idx);
    setDragOffset(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [listings.length]);

  // ── Touch handlers for main swipe ──
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
    setDragging(true);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragging) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
    setDragOffset(touchDeltaX.current);
  };
  const onTouchEnd = () => {
    setDragging(false);
    if (Math.abs(touchDeltaX.current) > 60) {
      if (touchDeltaX.current < 0 && activeIdx < listings.length - 1) goTo(activeIdx + 1);
      else if (touchDeltaX.current > 0 && activeIdx > 0) goTo(activeIdx - 1);
      else setDragOffset(0);
    } else {
      setDragOffset(0);
    }
    touchDeltaX.current = 0;
  };

  // ── Lightbox touch handlers ──
  const onLbTouchStart = (e: React.TouchEvent) => { lbTouchStartX.current = e.touches[0].clientX; };
  const onLbTouchEnd = (e: React.TouchEvent) => {
    if (lightbox === null) return;
    const listing = listings[activeIdx];
    const photos = getPhotos(listing);
    const delta = e.changedTouches[0].clientX - lbTouchStartX.current;
    if (Math.abs(delta) > 50) {
      if (delta < 0 && lightbox < photos.length - 1) setLightbox(lightbox + 1);
      else if (delta > 0 && lightbox > 0) setLightbox(lightbox - 1);
    }
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 size={24} className="animate-spin text-primary" /></div>;
  if (notFound || !collection) return <div className="min-h-screen bg-background flex items-center justify-center px-4"><div className="text-center"><h1 className="font-display text-2xl font-medium text-text-1 mb-2">Collection not found</h1><p className="text-sm text-text-2">This collection may have been removed.</p></div></div>;
  if (listings.length === 0) return <div className="min-h-screen bg-background flex items-center justify-center px-4"><div className="text-center"><h1 className="font-display text-xl font-medium text-text-1 mb-1">{collection.title}</h1><p className="text-sm text-text-3">No listings in this collection yet.</p></div></div>;

  const getHero = (l: any) => { const p = l.listing_photos || []; return (p.find((x: any) => x.is_hero) || p[0])?.url; };
  const getPhotos = (l: any) => {
    const p = l.listing_photos || [];
    const hero = p.find((x: any) => x.is_hero) || p[0];
    const rest = p.filter((x: any) => x.id !== hero?.id);
    return hero ? [hero, ...rest] : p;
  };

  const current = listings[activeIdx];
  const currentPhotos = getPhotos(current);
  const specChips = [
    current.bhk_config,
    current.carpet_area ? `${current.carpet_area} sq ft` : null,
    current.floor_number != null && current.total_floors != null ? `Floor ${current.floor_number}/${current.total_floors}` : current.floor_number != null ? `Floor ${current.floor_number}` : null,
    current.parking_car > 0 ? `${current.parking_car} Parking` : null,
    current.furnishing_status ? String(current.furnishing_status).replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) : null,
  ].filter(Boolean);

  const propertyDetails = [
    ['🏠', 'Type', current.property_type],
    ['🛏', 'Config', current.bhk_config],
    ['📐', 'Carpet Area', current.carpet_area ? `${current.carpet_area} sq ft` : null],
    ['🏗', 'Built-up', current.builtup_area ? `${current.builtup_area} sq ft` : null],
    ['🏙️', 'Floor', current.floor_number ? `${current.floor_number} of ${current.total_floors}` : null],
    ['📅', 'Age', current.property_age],
    ['🔑', 'Possession', current.possession_status],
    ['🛋️', 'Furnishing', current.furnishing_status],
    ['🧭', 'Facing', current.facing_direction],
    ['🚗', 'Parking', current.parking_car ? `${current.parking_car} car` : null],
    ['🚿', 'Bathrooms', current.bathroom_count],
    ['🌅', 'Balconies', current.balcony_count],
  ].filter(([, , v]) => v != null && v !== '' && v !== 0) as [string, string, string | number][];

  const amenities = current.amenities || [];
  const highlights = (current.ai_highlights || []).filter(Boolean);
  const whatsappUrl = current.broker_whatsapp ? `https://wa.me/91${current.broker_whatsapp}?text=${encodeURIComponent(`Hi ${current.broker_name || ''}, I'm interested in ${current.headline}. Please share more details.`)}` : null;

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* ── Sticky top bar with collection title + tab chips ── */}
      <div className="sticky top-0 z-40 bg-white border-b border-border">
        <div className="max-w-3xl mx-auto px-4 pt-3 pb-0">
          <div className="flex items-center justify-between mb-2">
            <h1 className="font-display text-sm font-medium text-text-1 truncate">{collection.title}</h1>
            <span className="text-2xs text-text-3 shrink-0 ml-2">{activeIdx + 1}/{listings.length}</span>
          </div>
          <div ref={chipsRef} className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
            {listings.map((l: any, i: number) => (
              <button
                key={l.id}
                type="button"
                onClick={() => goTo(i)}
                className={`shrink-0 text-[11px] px-3 py-1.5 rounded-full transition-all duration-200 whitespace-nowrap ${
                  i === activeIdx
                    ? 'bg-primary text-primary-foreground font-medium shadow-sm'
                    : 'bg-surface-2 text-text-2 hover:bg-border'
                }`}
              >
                {(l.headline || 'Untitled').length > 25 ? (l.headline || 'Untitled').slice(0, 25) + '…' : (l.headline || 'Untitled')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Swipable listing content ── */}
      <div
        ref={containerRef}
        className="overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          style={{
            transform: `translateX(${dragOffset}px)`,
            transition: dragging ? 'none' : 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          }}
        >
          {/* Hero photo */}
          <div className="w-full h-[260px] md:h-[400px] relative bg-surface-2">
            {getHero(current) ? (
              <div className="w-full h-full cursor-pointer" onClick={() => setLightbox(0)}>
                <SafeImage src={getHero(current)} className="w-full h-full object-cover object-center" />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl">🏠</div>
            )}
            {currentPhotos.length > 1 && (
              <div className="absolute bottom-3 right-3 bg-black/60 text-white text-[11px] px-2 py-0.5 rounded-full font-sans">
                1/{currentPhotos.length}
              </div>
            )}
            {/* Swipe hint arrows */}
            {activeIdx > 0 && (
              <button type="button" onClick={() => goTo(activeIdx - 1)} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 text-white flex items-center justify-center">
                <ChevronLeft size={18} />
              </button>
            )}
            {activeIdx < listings.length - 1 && (
              <button type="button" onClick={() => goTo(activeIdx + 1)} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 text-white flex items-center justify-center">
                <ChevronRight size={18} />
              </button>
            )}
          </div>

          {/* Photo strip */}
          {currentPhotos.length > 1 && (
            <div className="px-4 mt-2 -mx-0">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {currentPhotos.map((p: any, i: number) => (
                  <div key={p.id || i} className="shrink-0 w-[80px] h-[56px] rounded-md overflow-hidden cursor-pointer bg-surface-2 border-2 transition-colors duration-150" style={{ borderColor: i === 0 ? 'var(--primary)' : 'transparent' }} onClick={() => setLightbox(i)}>
                    <SafeImage src={p.url} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Listing content */}
          <div className="max-w-3xl mx-auto px-4 py-5 space-y-5">
            {/* Headline + Price */}
            <div>
              <h2 className="font-display text-xl md:text-2xl font-medium text-text-1 leading-tight">{current.headline}</h2>
              <div className="flex items-center gap-1.5 mt-1 text-sm text-text-2 font-sans">
                <MapPin size={13} /> {current.locality}, {current.city}
              </div>
              <div className="flex items-center flex-wrap gap-2 mt-2.5">
                <span className="text-xl font-display font-semibold text-primary">{formatPrice(current.price, current.transaction_type)}</span>
                {current.price_negotiable && <span className="badge-live text-2xs">Negotiable</span>}
              </div>
            </div>

            {/* Spec chips */}
            {specChips.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {specChips.map((s, i) => (
                  <span key={i} className="bg-surface-2 text-text-1 text-xs px-2.5 py-1 rounded-md font-sans">{s}</span>
                ))}
              </div>
            )}

            {/* Highlights */}
            {highlights.length > 0 && (
              <div>
                <div className="text-label text-text-3 mb-2">Highlights</div>
                <div className="space-y-2">
                  {highlights.map((h: string, i: number) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="text-xl leading-none shrink-0 mt-0.5">{getHighlightIcon(h)}</span>
                      <p className="text-[13px] text-text-1 leading-snug font-sans">{h}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* About */}
            {current.ai_description?.trim() && (
              <div>
                <div className="text-label text-text-3 mb-2">About This Property</div>
                <p className="text-sm text-text-2 font-sans" style={{ lineHeight: 1.75 }}>
                  {current.ai_description.trim().split(/\s+/).length > 60
                    ? current.ai_description.trim().split(/\s+/).slice(0, 60).join(' ') + '…'
                    : current.ai_description.trim()
                  }
                </p>
              </div>
            )}

            {/* Property Details */}
            {propertyDetails.length > 0 && (
              <div>
                <div className="text-label text-text-3 mb-3">Property Details</div>
                <div className="grid grid-cols-2 gap-x-4">
                  {propertyDetails.map(([emoji, label, val], i) => (
                    <div key={i} className="py-2.5 border-b border-border">
                      <div className="text-[11px] text-text-3 mb-0.5 flex items-center gap-1">
                        <span className="text-sm">{emoji}</span> {label}
                      </div>
                      <div className="text-[13px] font-medium text-text-1 font-sans">{String(val)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Amenities */}
            {amenities.length > 0 && (
              <div>
                <div className="text-label text-text-3 mb-2.5">Amenities</div>
                <div className="grid grid-cols-2 gap-2.5">
                  {amenities.map((a: string, i: number) => {
                    const icon = getAmenityIcon(a);
                    return (
                      <div key={i} className="flex items-center gap-2 text-[13px] text-text-1 font-sans">
                        <span className="text-base leading-none">{icon === '✓' ? <Check size={14} className="text-primary" /> : icon}</span>
                        <span>{a}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Broker card */}
            {current.show_broker_card && current.broker_name && (
              <div className="card-base p-4">
                <div className="text-label text-text-3 mb-2">Presented By</div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium font-display">
                    {current.broker_name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-text-1 font-sans">{current.broker_name}</div>
                    {current.broker_agency && <div className="text-xs text-text-2 font-sans">{current.broker_agency}</div>}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Fixed Bottom Bar ── */}
      <div className="fixed bottom-0 left-0 right-0 h-14 bg-surface border-t border-border flex z-50 safe-bottom">
        {whatsappUrl ? (
          <>
            <a href={whatsappUrl} target="_blank" rel="noopener" className="flex-1 flex items-center justify-center gap-1.5 bg-primary text-primary-foreground text-sm font-medium font-sans">
              <MessageCircle size={16} /> WhatsApp
            </a>
            <a href={`tel:+91${current.broker_phone}`} className="flex-1 flex items-center justify-center gap-1.5 bg-surface text-text-1 text-sm font-medium border-l border-border font-sans">
              <Phone size={16} /> Call
            </a>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-sm text-text-3 font-sans">Contact info not available</div>
        )}
      </div>

      {/* ── Lightbox ── */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 bg-dark/95 z-[100] flex items-center justify-center"
          onClick={() => setLightbox(null)}
          onTouchStart={onLbTouchStart}
          onTouchEnd={onLbTouchEnd}
        >
          <div className="absolute top-4 right-4 z-10 flex items-center gap-3">
            <span className="text-surface text-sm">{lightbox + 1}/{currentPhotos.length}</span>
            <button type="button" onClick={() => setLightbox(null)} className="text-surface"><X size={24} /></button>
          </div>
          {lightbox > 0 && (
            <button type="button" className="absolute left-3 top-1/2 -translate-y-1/2 text-surface/80 hover:text-surface z-10" onClick={e => { e.stopPropagation(); setLightbox(lightbox - 1); }}>
              <ChevronLeft size={28} />
            </button>
          )}
          {lightbox < currentPhotos.length - 1 && (
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-surface/80 hover:text-surface z-10" onClick={e => { e.stopPropagation(); setLightbox(lightbox + 1); }}>
              <ChevronRight size={28} />
            </button>
          )}
          <div className="max-w-4xl max-h-[80vh] relative" onClick={e => e.stopPropagation()}>
            <SafeImage src={currentPhotos[lightbox]?.url} className="max-w-full max-h-[80vh] object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
