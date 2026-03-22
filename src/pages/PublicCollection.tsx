import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/lib/mock-data';
import { Loader2, MapPin, Phone, MessageCircle, Check, ChevronLeft, ChevronRight, X, Camera, Share2, Heart, ArrowLeft } from 'lucide-react';

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

function getHighlightParts(text: string): { title: string; subtitle: string } {
  const words = text.split(/\s+/);
  return { title: words.slice(0, 4).join(' '), subtitle: words.slice(4).join(' ') };
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
  const [showAllHighlights, setShowAllHighlights] = useState(false);

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
    setShowAllHighlights(false);
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
  const visibleHighlights = showAllHighlights ? highlights : highlights.slice(0, 3);
  const whatsappUrl = current.broker_whatsapp ? `https://wa.me/91${current.broker_whatsapp}?text=${encodeURIComponent(`Hi ${current.broker_name || ''}, I'm interested in ${current.headline}. Please share more details.`)}` : null;
  const priceLabel = current.transaction_type === 'rent' ? '/month' : current.transaction_type === 'lease' ? '/lease' : '';

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* ── Sticky top bar with collection title + tab chips ── */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-border" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <div className="max-w-3xl mx-auto px-4 pt-3 pb-0">
          <div className="flex items-center justify-center mb-2 relative">
            <h1 className="font-display text-[20px] font-medium text-text-1 text-center">{collection.title}</h1>
            <span className="absolute right-0 text-2xs text-text-3">{activeIdx + 1}/{listings.length}</span>
          </div>
          <div ref={chipsRef} className="flex gap-2 overflow-x-auto pb-2.5 scrollbar-hide -mx-1 px-1">
            {listings.map((_l: any, i: number) => (
              <button
                key={_l.id}
                type="button"
                onClick={() => goTo(i)}
                className={`shrink-0 text-[12px] px-4 py-1.5 rounded-full transition-all duration-200 whitespace-nowrap font-sans ${
                  i === activeIdx
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'bg-surface-2 text-text-2 hover:bg-border'
                }`}
              >
                Listing {i + 1}
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
          <div className="w-full h-[300px] md:h-[480px] relative bg-surface-2 rounded-b-[20px] overflow-hidden">
            {getHero(current) ? (
              <div className="w-full h-full cursor-pointer" onClick={() => setLightbox(0)}>
                <SafeImage src={getHero(current)} className="w-full h-full object-cover object-center" />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl">🏠</div>
            )}
            {currentPhotos.length > 1 && (
              <div className="absolute bottom-3 right-3 bg-black/50 text-white text-[12px] px-2.5 py-1 rounded-full font-sans">
                1/{currentPhotos.length}
              </div>
            )}
            {/* Swipe hint arrows */}
            {activeIdx > 0 && (
              <button type="button" onClick={() => goTo(activeIdx - 1)} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 text-text-1 flex items-center justify-center" style={{ boxShadow: 'var(--shadow-md)' }}>
                <ChevronLeft size={20} />
              </button>
            )}
            {activeIdx < listings.length - 1 && (
              <button type="button" onClick={() => goTo(activeIdx + 1)} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 text-text-1 flex items-center justify-center" style={{ boxShadow: 'var(--shadow-md)' }}>
                <ChevronRight size={20} />
              </button>
            )}
          </div>

          {/* Photo strip */}
          {currentPhotos.length > 1 && (
            <div className="px-5 mt-3">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {currentPhotos.map((p: any, i: number) => (
                  <div key={p.id || i} className="shrink-0 w-[100px] h-[72px] rounded-xl overflow-hidden cursor-pointer bg-surface-2 border-2 transition-colors duration-150" style={{ borderColor: i === 0 ? 'hsl(var(--primary))' : 'transparent' }} onClick={() => setLightbox(i)}>
                    <SafeImage src={p.url} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Listing content */}
          <div className="max-w-3xl mx-auto px-5 py-6 space-y-6">
            {/* Headline + Price */}
            <div>
              <div className="flex items-center gap-1.5 text-[13px] text-text-3 font-sans mb-1.5">
                📍 {current.locality}, {current.city}
              </div>
              <h2 className="font-display text-[22px] md:text-[26px] font-semibold text-text-1 leading-[1.3]">{current.headline}</h2>
              <div className="flex items-center flex-wrap gap-2 mt-3">
                <span className="font-display text-[26px] font-medium text-primary">{formatPrice(current.price, current.transaction_type)}</span>
                {priceLabel && <span className="text-[14px] text-text-3 font-sans self-end mb-0.5">{priceLabel}</span>}
                {current.price_negotiable && <span className="badge-live text-2xs">Negotiable</span>}
              </div>
            </div>

            {/* Spec chips */}
            {specChips.length > 0 && (
              <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-5 px-5">
                {specChips.map((s, i) => (
                  <span key={i} className="bg-surface-2 border border-border text-text-2 text-[12px] px-3.5 py-1.5 rounded-full shrink-0 font-sans whitespace-nowrap">{s}</span>
                ))}
              </div>
            )}

            {/* Highlights (Airbnb-style) */}
            {highlights.length > 0 && (
              <div>
                <div className="text-[13px] uppercase tracking-wide text-text-3 font-sans font-medium mb-3">What this property offers</div>
                <div className="space-y-0">
                  {visibleHighlights.map((h: string, i: number) => {
                    const { title, subtitle } = getHighlightParts(h);
                    return (
                      <div key={i}>
                        <div className="flex items-start gap-4 py-3">
                          <div className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-[18px] leading-none">{getHighlightIcon(h)}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[14px] font-semibold text-text-1 font-sans">{title}</div>
                            {subtitle && <div className="text-[13px] text-text-2 font-sans mt-0.5">{subtitle}</div>}
                          </div>
                        </div>
                        {i < visibleHighlights.length - 1 && <div className="border-b border-border" />}
                      </div>
                    );
                  })}
                </div>
                {highlights.length > 3 && !showAllHighlights && (
                  <button type="button" onClick={() => setShowAllHighlights(true)} className="text-primary text-[14px] font-medium font-sans mt-2 hover:underline">
                    Show all {highlights.length} highlights
                  </button>
                )}
                <div className="mt-4 border-b border-border" />
              </div>
            )}

            {/* About */}
            {current.ai_description?.trim() && (
              <div>
                <div className="text-[13px] uppercase tracking-wide text-text-3 font-sans font-medium mb-3">About this property</div>
                <p className="text-[15px] text-text-2 font-sans" style={{ lineHeight: 1.8 }}>
                  {current.ai_description.trim().split(/\s+/).length > 40
                    ? current.ai_description.trim().split(/\s+/).slice(0, 40).join(' ') + '…'
                    : current.ai_description.trim()
                  }
                </p>
                <div className="mt-5 border-b border-border" />
              </div>
            )}

            {/* Property Details */}
            {propertyDetails.length > 0 && (
              <div>
                <div className="text-[13px] uppercase tracking-wide text-text-3 font-sans font-medium mb-3">Property Details</div>
                <div className="rounded-xl overflow-hidden" style={{ boxShadow: 'var(--shadow-sm)' }}>
                  {propertyDetails.map(([emoji, label, val], i) => (
                    <div key={i} className={`flex items-center justify-between px-4 py-3 ${i % 2 === 0 ? 'bg-white' : 'bg-surface-2'}`}>
                      <span className="text-[13px] text-text-3 font-sans flex items-center gap-1.5">
                        <span className="text-sm">{emoji}</span> {label}
                      </span>
                      <span className="text-[13px] font-medium text-text-1 font-sans">{String(val)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Amenities */}
            {amenities.length > 0 && (
              <div>
                <div className="text-[13px] uppercase tracking-wide text-text-3 font-sans font-medium mb-3">Amenities</div>
                <div className="grid grid-cols-2 gap-3">
                  {amenities.map((a: string, i: number) => {
                    const icon = getAmenityIcon(a);
                    return (
                      <div key={i} className="flex items-center gap-2.5 text-[13px] text-text-2 font-sans">
                        <span className="text-primary text-base leading-none">{icon === '✓' ? <Check size={14} className="text-primary" /> : <span className="text-primary">✓</span>}</span>
                        <span>{a}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Broker card */}
            {current.show_broker_card && current.broker_name && (
              <div className="rounded-2xl p-5" style={{ boxShadow: 'var(--shadow-md)' }}>
                <div className="flex items-center gap-3.5 mb-4">
                  <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-lg font-medium font-display">
                    {current.broker_name[0]}
                  </div>
                  <div>
                    <div className="text-[16px] font-semibold text-text-1 font-sans">{current.broker_name}</div>
                    {current.broker_agency && <div className="text-[13px] text-text-2 font-sans">{current.broker_agency}</div>}
                    {current.broker_rera && (
                      <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-medium text-primary bg-[hsl(var(--green-light))] px-2 py-0.5 rounded-full">
                        ✓ Verified Broker
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Fixed Bottom Bar ── */}
      <div
        className="fixed bottom-0 left-0 right-0 h-20 bg-surface flex items-center px-4 z-50 safe-bottom"
        style={{ boxShadow: 'var(--shadow-lg)' }}
      >
        {whatsappUrl ? (
          <div className="flex items-center gap-3 w-full">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-medium font-display shrink-0">
                {current.broker_name?.[0]}
              </div>
              <div className="min-w-0">
                <div className="text-[13px] font-medium text-text-1 truncate font-sans">{current.broker_name}</div>
                <div className="text-[11px] text-text-3 truncate font-sans">{current.broker_agency}</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <a href={whatsappUrl} target="_blank" rel="noopener"
                className="h-11 px-5 rounded-xl bg-primary text-primary-foreground text-sm font-medium font-sans flex items-center gap-1.5">
                <MessageCircle size={16} /> WhatsApp
              </a>
              <a href={`tel:+91${current.broker_phone}`}
                className="h-11 px-4 rounded-xl bg-surface border border-border text-text-1 text-sm font-medium font-sans flex items-center gap-1.5">
                <Phone size={16} /> Call
              </a>
            </div>
          </div>
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
            <span className="text-surface text-sm bg-black/40 px-2.5 py-1 rounded-full">{lightbox + 1}/{currentPhotos.length}</span>
            <button type="button" onClick={() => setLightbox(null)} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-surface"><X size={20} /></button>
          </div>
          {lightbox > 0 && (
            <button type="button" className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-surface/80 hover:text-surface z-10" onClick={e => { e.stopPropagation(); setLightbox(lightbox - 1); }}>
              <ChevronLeft size={24} />
            </button>
          )}
          {lightbox < currentPhotos.length - 1 && (
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-surface/80 hover:text-surface z-10" onClick={e => { e.stopPropagation(); setLightbox(lightbox + 1); }}>
              <ChevronRight size={24} />
            </button>
          )}
          <div className="max-w-4xl max-h-[80vh] relative" onClick={e => e.stopPropagation()}>
            <SafeImage src={currentPhotos[lightbox]?.url} className="max-w-full max-h-[80vh] object-contain rounded-2xl" />
          </div>
        </div>
      )}
    </div>
  );
}
