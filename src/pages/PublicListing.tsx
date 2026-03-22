import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { formatPrice } from '@/lib/mock-data';
import { supabase } from '@/integrations/supabase/client';
import { ChevronLeft, ChevronRight, X, MapPin, Phone, MessageCircle, Check, Camera, Loader2, Share2, Heart, ArrowLeft } from 'lucide-react';

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

function PhotoFallback() {
  return (
    <div className="w-full h-full bg-surface-2 flex items-center justify-center">
      <Camera size={24} className="text-text-3" />
    </div>
  );
}

function SafeImage({ src, alt = '', className = '', onError }: { src: string; alt?: string; className?: string; onError?: () => void }) {
  const [error, setError] = useState(false);
  if (error) return <PhotoFallback />;
  return <img src={src} alt={alt} className={className} onError={() => { setError(true); onError?.(); }} loading="lazy" />;
}

function getHighlightIcon(text: string): string {
  const t = text.toLowerCase();
  const rules: [RegExp, string][] = [
    [/area|sqft|carpet|sq\.?\s*ft/, '📐'],
    [/sea|ocean|water\s*view|seaface/, '🌊'],
    [/floor|view|high/, '🏙️'],
    [/parking|car/, '🚗'],
    [/furnished|furniture/, '🛋️'],
    [/pool|swimming/, '🏊'],
    [/gym|gymnasium/, '💪'],
    [/garden|park|green/, '🌿'],
    [/school|education/, '🎓'],
    [/hospital|medical/, '🏥'],
    [/metro|station|transport/, '🚇'],
    [/cricket|sport|ground/, '🏏'],
    [/security|cctv|gated/, '🔒'],
    [/lift|elevator/, '🛗'],
    [/power|backup/, '⚡'],
    [/vastu/, '🕉️'],
  ];
  for (const [re, icon] of rules) {
    if (re.test(t)) return icon;
  }
  return '✨';
}

function getHighlightParts(text: string): { title: string; subtitle: string } {
  const words = text.split(/\s+/);
  const title = words.slice(0, 4).join(' ');
  const subtitle = words.slice(4).join(' ');
  return { title, subtitle };
}

function AboutProperty({ text }: { text: string | null | undefined }) {
  const [expanded, setExpanded] = useState(false);
  const words = useMemo(() => (text || '').trim().split(/\s+/).filter(Boolean), [text]);
  const isLong = words.length > 40;
  const preview = words.slice(0, 40).join(' ');
  const full = words.join(' ');

  if (!text?.trim()) return null;

  return (
    <div>
      <div className="text-[13px] uppercase tracking-wide text-text-3 font-sans font-medium mb-3">About this property</div>
      <p className="text-[15px] text-text-2 font-sans" style={{ lineHeight: 1.8 }}>
        {isLong && !expanded ? (
          <>
            {preview}
            …{' '}
            <button type="button" onClick={() => setExpanded(true)} className="text-primary font-medium text-sm inline">
              Show more →
            </button>
          </>
        ) : (
          <>
            {full}
            {isLong && expanded && (
              <>
                {' '}
                <button type="button" onClick={() => setExpanded(false)} className="text-primary font-medium text-sm inline">
                  Show less
                </button>
              </>
            )}
          </>
        )}
      </p>
      <div className="mt-5 border-b border-border" />
    </div>
  );
}

function VirtualTourEmbed({ url }: { url: string }) {
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|watch\?v=))([\w-]+)/);
  if (yt) {
    return (
      <div className="aspect-video w-full rounded-2xl overflow-hidden border border-border">
        <iframe title="Virtual tour" className="w-full h-full" src={`https://www.youtube.com/embed/${yt[1]}`} allowFullScreen />
      </div>
    );
  }
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="btn-primary w-full inline-flex items-center justify-center gap-2">
      Open virtual tour
    </a>
  );
}

function AnalyticsTracker({ listingId }: { listingId: string }) {
  const sessionIdRef = useRef('');
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    let sessionId = sessionStorage.getItem('propsite_session');
    if (!sessionId) {
      sessionId = `s_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      sessionStorage.setItem('propsite_session', sessionId);
    }
    sessionIdRef.current = sessionId;
    const deviceType = /mobile/i.test(navigator.userAgent) ? 'mobile' : 'desktop';
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
    const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    const trackUrl = `https://${projectId}.supabase.co/functions/v1/track-event`;

    fetch(trackUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': anonKey },
      body: JSON.stringify({ session_id: sessionId, listing_id: listingId, event_type: 'page_view', device_type: deviceType })
    }).catch(() => {});

    const interval = setInterval(() => {
      const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
      fetch(trackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': anonKey },
        body: JSON.stringify({ session_id: sessionId, listing_id: listingId, event_type: 'ping', duration_seconds: duration })
      }).catch(() => {});
    }, 30000);

    return () => clearInterval(interval);
  }, [listingId]);

  return null;
}

export default function PublicListingPage() {
  const { slug } = useParams();
  const [listing, setListing] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const [heroIdx, setHeroIdx] = useState(0);
  const [showAllHighlights, setShowAllHighlights] = useState(false);
  const heroTouchStartX = useRef(0);
  const lbTouchStartX = useRef(0);

  useEffect(() => {
    const fetchListing = async () => {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'live')
        .single();

      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const { data: photoData } = await supabase
        .from('listing_photos')
        .select('*')
        .eq('listing_id', data.id)
        .order('order_index');

      setListing(data);
      setPhotos(photoData || []);
      setLoading(false);
    };
    fetchListing();
  }, [slug]);

  useEffect(() => {
    const handleScroll = () => setShowStickyHeader(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const trackEvent = (eventType: string) => {
    const sessionId = sessionStorage.getItem('propsite_session');
    if (!sessionId || !listing) return;
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
    const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    fetch(`https://${projectId}.supabase.co/functions/v1/track-event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': anonKey },
      body: JSON.stringify({ session_id: sessionId, listing_id: listing.id, event_type: eventType })
    }).catch(() => {});
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-primary" />
      </div>
    );
  }

  if (notFound || !listing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-2xl font-medium text-text-1 mb-2">Listing not found</h1>
          <p className="text-sm text-text-2">This listing may have been removed or expired.</p>
        </div>
      </div>
    );
  }

  const heroPhoto = photos.find((p: any) => p.is_hero) || photos[0];
  const otherPhotos = photos.filter((p: any) => p.id !== heroPhoto?.id);
  const allPhotos = heroPhoto ? [heroPhoto, ...otherPhotos] : photos;

  const shortHeadline =
    (listing.headline || '').length > 20 ? `${(listing.headline || '').slice(0, 20)}…` : listing.headline || '';

  const specChips = [
    listing.bhk_config,
    listing.carpet_area ? `${listing.carpet_area} sq ft` : null,
    listing.floor_number != null && listing.total_floors != null
      ? `Floor ${listing.floor_number}/${listing.total_floors}`
      : listing.floor_number != null
        ? `Floor ${listing.floor_number}`
        : null,
    listing.parking_car != null && listing.parking_car > 0 ? `${listing.parking_car} Parking` : null,
    listing.furnishing_status
      ? String(listing.furnishing_status).replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
      : null,
  ].filter(Boolean);

  const whatsappUrl = `https://wa.me/91${listing.broker_whatsapp}?text=${encodeURIComponent(`Hi ${listing.broker_name}, I'm interested in ${listing.headline}. Please share more details.`)}`;

  const propertyDetails = [
    ['🏠', 'Type', listing.property_type],
    ['🛏', 'Config', listing.bhk_config],
    ['📐', 'Carpet Area', listing.carpet_area ? `${listing.carpet_area} sq ft` : null],
    ['🏗', 'Built-up Area', listing.builtup_area ? `${listing.builtup_area} sq ft` : null],
    ['🏙️', 'Floor', listing.floor_number ? `${listing.floor_number} of ${listing.total_floors}` : null],
    ['📅', 'Age', listing.property_age],
    ['🔑', 'Possession', listing.possession_status],
    ['🛋️', 'Furnishing', listing.furnishing_status],
    ['🧭', 'Facing', listing.facing_direction],
    ['🚗', 'Parking', listing.parking_car ? `${listing.parking_car} car, ${listing.parking_two_wheeler} 2W` : null],
    ['🚿', 'Bathrooms', listing.bathroom_count],
    ['🌅', 'Balconies', listing.balcony_count],
    ['📋', 'RERA', listing.rera_number],
  ].filter(([, , v]) => v != null && v !== '' && v !== 0) as [string, string, string | number][];

  const amenities = listing.amenities || [];
  const aiHighlights = (listing.ai_highlights || []).filter(Boolean);
  const neighbourhoodHighlights = listing.ai_neighbourhood_highlights || [];

  const rawPriceNote = listing.price_history_note?.trim();
  const priceHistoryBadge =
    rawPriceNote &&
    (rawPriceNote.startsWith('↓') || rawPriceNote.toLowerCase().includes('reduced')
      ? rawPriceNote
      : `↓ Reduced from ${rawPriceNote}`);

  const aiTagline = listing.ai_description?.trim()?.split(/[.!?]/)?.[0]?.trim();
  const priceLabel = listing.transaction_type === 'rent' ? '/month' : listing.transaction_type === 'lease' ? '/lease' : '';

  const visibleHighlights = showAllHighlights ? aiHighlights : aiHighlights.slice(0, 3);

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      <AnalyticsTracker listingId={listing.id} />

      {listing.urgency_badge && (
        <div className="bg-[hsl(var(--amber-light))] border-b border-[hsl(38_60%_80%)] py-2 text-center">
          <span className="text-[13px] font-medium text-[hsl(var(--amber))]">⚡ {listing.urgency_badge}</span>
        </div>
      )}

      {showStickyHeader && (
        <div
          className="fixed top-0 left-0 right-0 h-[52px] bg-white/95 backdrop-blur-sm border-b border-border flex items-center justify-between px-4 z-50 animate-fade-in"
          style={{ boxShadow: 'var(--shadow-sm)' }}
        >
          <div className="text-sm font-medium text-text-1 truncate max-w-[45%] font-sans">{shortHeadline}</div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="font-display text-sm font-medium text-primary">{formatPrice(listing.price, listing.transaction_type)}</span>
            <a href={whatsappUrl} target="_blank" rel="noopener" onClick={() => trackEvent('whatsapp_click')} className="btn-primary text-xs h-8">
              Contact
            </a>
          </div>
        </div>
      )}

      {/* ═══ HERO SECTION ═══ */}
      <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden">
        {/* Desktop: grid layout */}
        <div className="hidden md:grid grid-cols-[60%_40%] gap-1.5 h-[480px]">
          {heroPhoto && (
            <div className="cursor-pointer overflow-hidden rounded-bl-[20px]" onClick={() => setLightbox(0)}>
              <SafeImage src={heroPhoto.url} className="w-full h-full object-cover object-center" />
            </div>
          )}
          <div className="grid grid-cols-2 grid-rows-2 gap-1.5">
            {allPhotos.slice(1, 5).map((p: any, i: number) => (
              <div key={p.id} className="relative cursor-pointer overflow-hidden" onClick={() => setLightbox(i + 1)}>
                <SafeImage src={p.url} className="w-full h-full object-cover" />
                {i === 3 && allPhotos.length > 5 && (
                  <div className="absolute inset-0 bg-dark/50 flex items-center justify-center">
                    <span className="text-surface text-sm font-medium">+{allPhotos.length - 5} more</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile: swipeable full-width hero */}
        <div
          className="md:hidden h-[300px] w-full relative rounded-b-[20px] overflow-hidden"
          onTouchStart={e => { heroTouchStartX.current = e.touches[0].clientX; }}
          onTouchEnd={e => {
            const delta = e.changedTouches[0].clientX - heroTouchStartX.current;
            if (Math.abs(delta) > 50) {
              if (delta < 0 && heroIdx < allPhotos.length - 1) setHeroIdx(heroIdx + 1);
              else if (delta > 0 && heroIdx > 0) setHeroIdx(heroIdx - 1);
            }
          }}
        >
          {allPhotos.length > 0 && (
            <div className="w-full h-full cursor-pointer" onClick={() => setLightbox(heroIdx)}>
              <SafeImage src={allPhotos[heroIdx]?.url} className="w-full h-full object-cover object-center" />
            </div>
          )}

          {/* Back button */}
          <button
            type="button"
            onClick={() => window.history.back()}
            className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center z-10"
            style={{ boxShadow: 'var(--shadow-md)' }}
          >
            <ArrowLeft size={18} className="text-text-1" />
          </button>

          {/* Share + Save buttons */}
          <div className="absolute top-4 right-4 flex gap-2 z-10">
            <button
              type="button"
              onClick={() => {
                if (navigator.share) navigator.share({ url: window.location.href, title: listing.headline });
              }}
              className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center"
              style={{ boxShadow: 'var(--shadow-md)' }}
            >
              <Share2 size={16} className="text-text-1" />
            </button>
            <button
              type="button"
              className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center"
              style={{ boxShadow: 'var(--shadow-md)' }}
            >
              <Heart size={16} className="text-text-1" />
            </button>
          </div>

          {/* Photo counter pill */}
          {allPhotos.length > 1 && (
            <div className="absolute bottom-3 right-3 bg-black/50 text-white text-[12px] px-2.5 py-1 rounded-full font-sans">
              {heroIdx + 1} / {allPhotos.length}
            </div>
          )}
        </div>
      </div>

      <div className="px-5 md:px-0 md:container md:max-w-5xl overflow-hidden">
        {/* ═══ PROPERTY IDENTITY ═══ */}
        <div className="mt-5">
          <div className="flex items-center gap-1.5 text-[13px] text-text-3 font-sans mb-1.5">
            📍 {listing.locality}, {listing.city}
          </div>
          <h1 className="font-display text-[26px] font-semibold text-text-1 leading-[1.3] break-words">{listing.headline}</h1>
          <div className="flex items-center flex-wrap gap-2 mt-3">
            <span className="font-display text-[30px] font-medium text-primary">{formatPrice(listing.price, listing.transaction_type)}</span>
            {priceLabel && <span className="text-[14px] text-text-3 font-sans self-end mb-1">{priceLabel}</span>}
            {listing.price_negotiable && <span className="badge-live text-2xs">Negotiable</span>}
            {priceHistoryBadge && (
              <span className="text-2xs text-[hsl(var(--amber))] bg-[hsl(var(--amber-light))] px-2.5 py-0.5 rounded-full font-sans">{priceHistoryBadge}</span>
            )}
          </div>
          {aiTagline && aiTagline.length > 10 && (
            <p className="text-[13px] text-text-2 italic font-sans mt-2">{aiTagline}</p>
          )}
        </div>

        {/* ═══ SPECS ROW ═══ */}
        <div className="mt-5 -mx-5 px-5">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {specChips.map((s, i) => (
              <span key={i} className="bg-surface-2 border border-border text-text-2 text-[12px] px-3.5 py-1.5 rounded-full shrink-0 font-sans whitespace-nowrap">
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* ═══ PHOTO STRIP ═══ */}
        {allPhotos.length > 1 && (
          <div className="mt-4 -mx-5 px-5">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {allPhotos.map((p: any, i: number) => (
                <div key={p.id} className="shrink-0 w-[100px] h-[72px] rounded-xl overflow-hidden relative cursor-pointer bg-surface-2" onClick={() => setLightbox(i)}>
                  <SafeImage src={p.url} className="w-full h-full object-cover" />
                  {p.room_tag && p.room_tag !== 'general' && (
                    <div className="absolute bottom-0 left-0 right-0 bg-dark/55 text-surface font-sans text-[9px] px-1.5 py-0.5">{p.room_tag}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-[65%_35%] gap-6 mt-6">
          <div className="space-y-6 min-w-0">
            {/* ═══ HIGHLIGHTS (Airbnb-style) ═══ */}
            {aiHighlights.length > 0 && (
              <div>
                <div className="text-[13px] uppercase tracking-wide text-text-3 font-sans font-medium mb-4">What this property offers</div>
                <div className="space-y-0">
                  {visibleHighlights.map((h: string, i: number) => {
                    const { title, subtitle } = getHighlightParts(h);
                    return (
                      <div key={i}>
                        <div className="flex items-start gap-4 py-3.5">
                          <div className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-[18px] leading-none" aria-hidden>{getHighlightIcon(h)}</span>
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
                {aiHighlights.length > 3 && !showAllHighlights && (
                  <button type="button" onClick={() => setShowAllHighlights(true)} className="text-primary text-[14px] font-medium font-sans mt-2 hover:underline">
                    Show all {aiHighlights.length} highlights
                  </button>
                )}
                <div className="mt-4 border-b border-border" />
              </div>
            )}

            {/* ═══ ABOUT ═══ */}
            <AboutProperty text={listing.ai_description} />

            {/* ═══ PROPERTY DETAILS TABLE ═══ */}
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

            {/* ═══ AMENITIES ═══ */}
            {amenities.length > 0 && (
              <div>
                <div className="text-[13px] uppercase tracking-wide text-text-3 font-sans font-medium mb-3">Amenities</div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {amenities.map((a: string, i: number) => {
                    const icon = getAmenityIcon(a);
                    return (
                      <div key={i} className="flex items-center gap-2.5 text-[13px] text-text-2 font-sans">
                        <span className="text-primary text-base leading-none shrink-0">
                          {icon === '✓' ? <Check size={14} className="text-primary" /> : <span className="text-primary">✓</span>}
                        </span>
                        <span>{a}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {listing.floor_plan_url && (
              <div>
                <div className="text-[13px] uppercase tracking-wide text-text-3 font-sans font-medium mb-3">Floor Plan</div>
                <SafeImage
                  src={listing.floor_plan_url}
                  alt="Floor plan"
                  className="w-full rounded-2xl border border-border"
                />
              </div>
            )}

            {listing.virtual_tour_url && (
              <div>
                <div className="text-[13px] uppercase tracking-wide text-text-3 font-sans font-medium mb-3">Virtual Tour</div>
                <VirtualTourEmbed url={listing.virtual_tour_url} />
              </div>
            )}

            {neighbourhoodHighlights.length > 0 && (
              <div>
                <div className="text-[13px] uppercase tracking-wide text-text-3 font-sans font-medium mb-3">Nearby</div>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
                  {neighbourhoodHighlights.map((h: string, i: number) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 shrink-0 text-[12px] text-text-1 font-sans bg-surface-2 border border-border rounded-full px-3 py-1.5"
                    >
                      <span aria-hidden>📍</span>
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {listing.google_maps_url && (
              <div>
                <div className="text-[13px] uppercase tracking-wide text-text-3 font-sans font-medium mb-3">Location</div>
                <a href={listing.google_maps_url} target="_blank" rel="noopener" className="text-xs text-primary hover:underline flex items-center gap-1.5 font-sans">
                  <MapPin size={14} /> Open in Google Maps
                </a>
              </div>
            )}

            {listing.broker_personal_note && (
              <div className="bg-surface-2/80 rounded-2xl p-4 border border-border/60">
                <p className="text-xs text-text-2 italic font-sans leading-relaxed">
                  &ldquo;{listing.broker_personal_note}&rdquo;
                </p>
              </div>
            )}

            {listing.open_house_date && (
              <div className="rounded-2xl p-4 bg-[hsl(var(--green-light))] border border-primary/15">
                <div className="text-sm font-medium text-text-1 font-sans">
                  🗓 Open House: {listing.open_house_date}
                  {listing.open_house_time_start && (
                    <span className="text-text-2 font-normal">
                      {' '}
                      {listing.open_house_time_start}
                      {listing.open_house_time_end ? ` – ${listing.open_house_time_end}` : ''}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* ═══ BROKER CARD (mobile) ═══ */}
            {listing.show_broker_card && (
              <div className="lg:hidden rounded-2xl p-5" style={{ boxShadow: 'var(--shadow-md)' }}>
                <div className="flex items-center gap-3.5 mb-4">
                  <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium font-display text-lg">
                    {listing.broker_name?.[0]}
                  </div>
                  <div>
                    <div className="text-[16px] font-semibold text-text-1 font-sans">{listing.broker_name}</div>
                    <div className="text-[13px] text-text-2 font-sans">{listing.broker_agency}</div>
                    {listing.broker_rera && (
                      <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-medium text-primary bg-[hsl(var(--green-light))] px-2 py-0.5 rounded-full">
                        ✓ Verified Broker
                      </span>
                    )}
                  </div>
                </div>
                <div className="space-y-2.5">
                  <a href={whatsappUrl} target="_blank" onClick={() => trackEvent('whatsapp_click')}
                    className="w-full h-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center gap-1.5 text-sm font-medium font-sans">
                    <MessageCircle size={16} /> WhatsApp
                  </a>
                  <a href={`tel:+91${listing.broker_phone}`} onClick={() => trackEvent('call_click')}
                    className="w-full h-11 rounded-xl bg-surface border border-border text-text-1 flex items-center justify-center gap-1.5 text-sm font-medium font-sans">
                    <Phone size={16} /> Call
                  </a>
                </div>
                {listing.broker_rera && <div className="text-[11px] text-text-3 font-sans mt-3">RERA: {listing.broker_rera}</div>}
              </div>
            )}
          </div>

          {/* ═══ DESKTOP SIDEBAR ═══ */}
          <div className="hidden lg:block">
            <div className="sticky top-20 space-y-4">
              <div className="rounded-2xl p-5" style={{ boxShadow: 'var(--shadow-md)' }}>
                <div className="flex items-center gap-3.5 mb-4">
                  <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-lg font-medium font-display">
                    {listing.broker_name?.[0]}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-text-1 font-sans">{listing.broker_name}</div>
                    <div className="text-[12px] text-text-2 font-sans">{listing.broker_agency}</div>
                    {listing.broker_rera && (
                      <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-medium text-primary bg-[hsl(var(--green-light))] px-2 py-0.5 rounded-full">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                </div>
                <div className="font-display text-2xl font-medium text-primary mb-4">{formatPrice(listing.price, listing.transaction_type)}</div>
                <a href={whatsappUrl} target="_blank" onClick={() => trackEvent('whatsapp_click')}
                  className="w-full h-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center gap-1.5 text-sm font-medium font-sans mb-2.5">
                  <MessageCircle size={16} /> WhatsApp Broker
                </a>
                <a href={`tel:+91${listing.broker_phone}`} onClick={() => trackEvent('call_click')}
                  className="w-full h-11 rounded-xl bg-surface border border-border text-text-1 flex items-center justify-center gap-1.5 text-sm font-medium font-sans mb-4">
                  <Phone size={16} /> Call Broker
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ FIXED BOTTOM BAR (mobile) ═══ */}
      <div
        className="fixed bottom-0 left-0 right-0 h-20 bg-surface flex items-center px-4 lg:hidden z-50 safe-bottom"
        style={{ boxShadow: 'var(--shadow-lg)' }}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-medium font-display shrink-0">
            {listing.broker_name?.[0]}
          </div>
          <div className="min-w-0">
            <div className="text-[13px] font-medium text-text-1 truncate font-sans">{listing.broker_name}</div>
            <div className="text-[11px] text-text-3 truncate font-sans">{listing.broker_agency}</div>
          </div>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <a href={whatsappUrl} target="_blank" rel="noopener" onClick={() => trackEvent('whatsapp_click')}
            className="h-11 px-5 rounded-xl bg-primary text-primary-foreground text-sm font-medium font-sans flex items-center gap-1.5">
            <MessageCircle size={16} /> WhatsApp
          </a>
          <a href={`tel:+91${listing.broker_phone}`} onClick={() => trackEvent('call_click')}
            className="h-11 px-4 rounded-xl bg-surface border border-border text-text-1 text-sm font-medium font-sans flex items-center gap-1.5">
            <Phone size={16} /> Call
          </a>
        </div>
      </div>

      {/* ═══ LIGHTBOX ═══ */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 bg-dark/95 z-[100] flex items-center justify-center"
          onClick={() => setLightbox(null)}
          onTouchStart={e => { lbTouchStartX.current = e.touches[0].clientX; }}
          onTouchEnd={e => {
            const delta = e.changedTouches[0].clientX - lbTouchStartX.current;
            if (Math.abs(delta) > 50) {
              if (delta < 0 && lightbox < allPhotos.length - 1) setLightbox(lightbox + 1);
              else if (delta > 0 && lightbox > 0) setLightbox(lightbox - 1);
            }
          }}
        >
          <div className="absolute top-4 right-4 z-10 flex items-center gap-3">
            <span className="text-surface text-sm bg-black/40 px-2.5 py-1 rounded-full">{lightbox + 1}/{allPhotos.length}</span>
            <button type="button" onClick={() => setLightbox(null)} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-surface">
              <X size={20} />
            </button>
          </div>
          {lightbox > 0 && (
            <button
              type="button"
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-surface/80 hover:text-surface z-10"
              onClick={e => { e.stopPropagation(); setLightbox(lightbox - 1); }}
            >
              <ChevronLeft size={24} />
            </button>
          )}
          {lightbox < allPhotos.length - 1 && (
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-surface/80 hover:text-surface z-10"
              onClick={e => { e.stopPropagation(); setLightbox(lightbox + 1); }}
            >
              <ChevronRight size={24} />
            </button>
          )}
          <div className="max-w-4xl max-h-[80vh] relative" onClick={e => e.stopPropagation()}>
            <SafeImage src={allPhotos[lightbox]?.url} className="max-w-full max-h-[80vh] object-contain rounded-2xl" />
            {allPhotos[lightbox]?.room_tag && allPhotos[lightbox].room_tag !== 'general' && (
              <div className="absolute bottom-4 left-4 bg-white/90 text-text-1 text-xs px-2.5 py-1 rounded-lg font-sans">{allPhotos[lightbox].room_tag}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
