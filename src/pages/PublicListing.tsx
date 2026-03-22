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
  if (!text?.trim()) return null;

  return (
    <div className="mt-[28px]">
      <div className="font-sans text-[11px] font-[600] text-[#888888] tracking-[0.08em] uppercase mb-[16px]">ABOUT THIS PROPERTY</div>
      <div className="relative">
        <p className={`font-sans text-[16px] text-[#111111] leading-[1.75] ${!expanded ? 'line-clamp-3' : ''}`}>
          {text}
        </p>
        {!expanded && (
          <button type="button" onClick={() => setExpanded(true)} className="font-sans text-[14px] font-[600] text-[#1A5C3A] mt-[8px]">
            Show more
          </button>
        )}
      </div>
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
    <div className="min-h-screen bg-[#FFFFFF] pb-[100px] md:pb-0">
      <AnalyticsTracker listingId={listing.id} />

      {listing.urgency_badge && (
        <div className="bg-[hsl(var(--amber-light))] border-b border-[hsl(38_60%_80%)] py-2 text-center">
          <span className="font-sans text-[13px] font-[500] text-[hsl(var(--amber))]">⚡ {listing.urgency_badge}</span>
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

        {/* Mobile: CSS scroll-snap swipeable flex container */}
        <div 
          className="md:hidden h-[260px] w-full relative overflow-hidden"
        >
          <div 
            className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide"
            onScroll={(e) => {
              const el = e.currentTarget;
              const idx = Math.round(el.scrollLeft / el.clientWidth);
              setHeroIdx(idx);
            }}
          >
            {allPhotos.map((p: any, i: number) => (
              <div 
                key={p.id} 
                className="w-full h-full shrink-0 snap-start cursor-pointer" 
                onClick={() => setLightbox(i)}
              >
                <SafeImage src={p.url} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>

          {/* Back button */}
          <button
            type="button"
            onClick={() => window.history.back()}
            className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white flex items-center justify-center z-10"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
          >
            <ArrowLeft size={18} className="text-[#111111]" />
          </button>

          {/* Share + Save buttons */}
          <div className="absolute top-4 right-4 flex gap-2 z-10">
            <button
              type="button"
              onClick={() => {
                if (navigator.share) navigator.share({ url: window.location.href, title: listing.headline });
              }}
              className="w-10 h-10 rounded-full bg-white flex items-center justify-center"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            >
              <Share2 size={16} className="text-[#111111]" />
            </button>
            <button
              type="button"
              className="w-10 h-10 rounded-full bg-white flex items-center justify-center"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            >
              <Heart size={16} className="text-[#111111]" />
            </button>
          </div>

          {/* Photo counter pill */}
          {allPhotos.length > 1 && (
            <div className="absolute bottom-3 right-3 bg-black/50 text-white font-sans text-[12px] font-[400] px-[10px] py-[4px] rounded-full pointer-events-none">
              {heroIdx + 1} / {allPhotos.length}
            </div>
          )}
        </div>
      </div>

      <div className="px-[20px] md:px-0 md:max-w-[1080px] mx-auto overflow-hidden">
        {/* ═══ PROPERTY IDENTITY ═══ */}
        <div className="mt-[20px]">
          <div className="flex items-center gap-1.5 font-sans text-[12px] text-[#888888] font-[600] tracking-[0.06em] uppercase mb-1.5">
            📍 {listing.locality}, {listing.city}
          </div>
          <h1 className="font-display text-[28px] font-[600] text-[#111111] leading-[1.25] break-words mt-[6px]">{listing.headline}</h1>
          <div className="flex items-center flex-wrap gap-2 mt-[8px]">
            <span className="font-display text-[26px] font-[700] text-[#1A5C3A]">{formatPrice(listing.price, listing.transaction_type)}</span>
            {priceLabel && <span className="font-sans text-[14px] text-[#888888] font-[400] self-end mb-1">{priceLabel}</span>}
            {listing.price_negotiable && <span className="font-sans text-[11px] font-[600] text-[#1A5C3A] bg-[#EAF3ED] px-[10px] py-[3px] rounded-full shrink-0">Negotiable</span>}
            {priceHistoryBadge && (
              <span className="font-sans text-[11px] font-[600] text-[#1A5C3A] bg-[#EAF3ED] px-[10px] py-[3px] rounded-full shrink-0">{priceHistoryBadge}</span>
            )}
          </div>
          {aiTagline && aiTagline.length > 10 && (
            <p className="font-sans text-[13px] text-[#555555] italic mt-2">{aiTagline}</p>
          )}
        </div>

        {/* ═══ SPECS ROW ═══ */}
        <div className="mt-[14px] -mx-[20px] px-[20px] md:mx-0 md:px-0">
          <div className="flex gap-[8px] overflow-x-auto pb-2 scrollbar-hide">
            {specChips.map((s, i) => (
              <span key={i} className="bg-[#F8F8F8] border border-[#EBEBEB] text-[#555555] text-[13px] font-[500] px-[14px] py-[6px] rounded-full shrink-0 font-sans whitespace-nowrap">
                {s}
              </span>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-[58%_42%] gap-6 mt-[28px]">
          <div className="space-y-6 min-w-0">
            {/* ═══ HIGHLIGHTS ═══ */}
            {aiHighlights.length > 0 && (
              <div className="mt-[28px]">
                <div className="font-sans text-[11px] font-[600] tracking-[0.08em] text-[#888888] uppercase mb-[16px]">What this property offers</div>
                <div className="space-y-0">
                  {visibleHighlights.map((h: string, i: number) => {
                    const { title, subtitle } = getHighlightParts(h);
                    return (
                      <div key={i} className={`flex items-start gap-[16px] py-[16px] ${i < visibleHighlights.length - 1 ? 'border-b border-[#F0F0F0]' : ''}`}>
                        <div className="w-[44px] h-[44px] rounded-[10px] bg-[#F8F8F8] border border-[#EBEBEB] flex items-center justify-center shrink-0 text-[20px] leading-none">
                          {getHighlightIcon(h)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-sans text-[15px] font-[600] text-[#111111] leading-[1.3]">{title}</div>
                          {subtitle && <div className="font-sans text-[14px] font-[400] text-[#555555] leading-[1.5] mt-[2px]">{subtitle}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {aiHighlights.length > 3 && !showAllHighlights && (
                  <button type="button" onClick={() => setShowAllHighlights(true)} className="font-sans text-[14px] font-[600] text-[#111111] mt-[14px] block underline w-full text-left">
                    Show all {aiHighlights.length} highlights
                  </button>
                )}
              </div>
            )}

            {/* ═══ ABOUT ═══ */}
            <AboutProperty text={listing.ai_description} />

            {/* ═══ PROPERTY DETAILS TABLE ═══ */}
            {propertyDetails.length > 0 && (
              <div className="mt-[28px]">
                <div className="font-sans text-[11px] font-[600] text-[#888888] tracking-[0.08em] uppercase mb-[16px]">PROPERTY DETAILS</div>
                <div className="bg-white border border-[#EBEBEB] rounded-[12px] overflow-hidden">
                  {propertyDetails.map(([emoji, label, val], i) => (
                    <div key={i} className={`flex items-center justify-between px-[16px] py-[14px] ${i < propertyDetails.length - 1 ? 'border-b border-[#F5F5F5]' : ''} ${i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'}`}>
                      <span className="font-sans text-[13px] font-[400] text-[#888888] flex items-center gap-[4px]">
                        <span className="text-[14px]">{emoji}</span> {label}
                      </span>
                      <span className="font-sans text-[14px] font-[600] text-[#111111]">{String(val)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ═══ AMENITIES ═══ */}
            {amenities.length > 0 && (
              <div className="mt-[28px]">
                <div className="font-sans text-[11px] font-[600] text-[#888888] tracking-[0.08em] uppercase mb-[16px]">AMENITIES</div>
                <div className="grid grid-cols-2 gap-x-[16px] gap-y-[12px]">
                  {amenities.map((a: string, i: number) => (
                    <div key={i} className="flex items-center gap-[10px]">
                      <div className="w-[18px] h-[18px] rounded-full bg-[#EAF3ED] flex items-center justify-center shrink-0 text-[#1A5C3A] [&>svg]:w-[12px] [&>svg]:h-[12px] [&>svg]:stroke-[1.5px]">
                        <Check />
                      </div>
                      <span className="font-sans text-[15px] font-[400] text-[#111111]">{a}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {listing.floor_plan_url && (
              <div className="mt-[28px]">
                <div className="font-sans text-[11px] font-[600] text-[#888888] tracking-[0.08em] uppercase mb-[16px]">FLOOR PLAN</div>
                <SafeImage
                  src={listing.floor_plan_url}
                  alt="Floor plan"
                  className="w-full rounded-[12px] border border-[#EBEBEB]"
                />
              </div>
            )}

            {listing.virtual_tour_url && (
              <div className="mt-[28px]">
                <div className="font-sans text-[11px] font-[600] text-[#888888] tracking-[0.08em] uppercase mb-[16px]">VIRTUAL TOUR</div>
                <VirtualTourEmbed url={listing.virtual_tour_url} />
              </div>
            )}

            {neighbourhoodHighlights.length > 0 && (
              <div className="mt-[28px]">
                <div className="font-sans text-[11px] font-[600] text-[#888888] tracking-[0.08em] uppercase mb-[16px]">NEARBY</div>
                <div className="flex gap-[8px] flex-wrap">
                  {neighbourhoodHighlights.map((h: string, i: number) => (
                    <span
                      key={i}
                      className="font-sans text-[13px] font-[500] text-[#555555] bg-[#F8F8F8] border border-[#EBEBEB] rounded-full px-[14px] py-[6px]"
                    >
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
              <div className="lg:hidden mt-[28px] bg-white border border-[#EBEBEB] rounded-[14px] p-[20px]">
                <div className="flex items-center gap-[14px]">
                  <div className="w-[48px] h-[48px] rounded-full bg-[#EAF3ED] flex items-center justify-center text-[#1A5C3A] font-[700] font-sans text-[16px]">
                    {listing.broker_name?.[0]}
                  </div>
                  <div>
                    <div className="font-sans text-[16px] font-[700] text-[#111111]">{listing.broker_name}</div>
                    <div className="font-sans text-[13px] text-[#888888]">{listing.broker_agency}</div>
                    {listing.broker_rera && (
                      <span className="inline-flex items-center gap-1 mt-[4px] font-sans text-[11px] font-[600] text-[#1A5C3A] bg-[#EAF3ED] px-[10px] py-[3px] rounded-full">
                        RERA Verified
                      </span>
                    )}
                  </div>
                </div>
                <div className="border-t border-[#EBEBEB] my-[16px]" />
                <div className="flex flex-col gap-[10px]">
                  <a href={whatsappUrl} target="_blank" onClick={() => trackEvent('whatsapp_click')}
                    className="w-full h-[50px] rounded-[12px] bg-[#1A5C3A] text-white flex items-center justify-center gap-[6px] font-sans text-[15px] font-[700]">
                    <MessageCircle size={18} /> WhatsApp
                  </a>
                  <a href={`tel:+91${listing.broker_phone}`} onClick={() => trackEvent('call_click')}
                    className="w-full h-[50px] rounded-[12px] bg-white border-[1.5px] border-[#EBEBEB] text-[#111111] flex items-center justify-center gap-[6px] font-sans text-[15px] font-[500]">
                    <Phone size={18} /> Call
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* ═══ DESKTOP SIDEBAR ═══ */}
          <div className="hidden md:block">
            <div className="sticky top-[80px]">
              <div className="bg-white border border-[#EBEBEB] rounded-[16px] p-[24px]">
                <div className="flex items-center gap-[14px]">
                  <div className="w-[48px] h-[48px] rounded-full bg-[#EAF3ED] flex items-center justify-center text-[#1A5C3A] font-[700] font-sans text-[16px]">
                    {listing.broker_name?.[0]}
                  </div>
                  <div>
                    <div className="font-sans text-[16px] font-[700] text-[#111111]">{listing.broker_name}</div>
                    <div className="font-sans text-[13px] text-[#888888]">{listing.broker_agency}</div>
                    {listing.broker_rera && (
                      <span className="inline-flex items-center gap-1 mt-[4px] font-sans text-[11px] font-[600] text-[#1A5C3A] bg-[#EAF3ED] px-[10px] py-[3px] rounded-full">
                        RERA Verified
                      </span>
                    )}
                  </div>
                </div>
                <div className="border-t border-[#EBEBEB] my-[16px]" />
                <div className="font-display text-[26px] font-[700] text-[#1A5C3A] mb-[12px]">{formatPrice(listing.price, listing.transaction_type)}</div>
                {listing.price_negotiable && <div className="font-sans text-[11px] font-[600] text-[#1A5C3A] bg-[#EAF3ED] px-[10px] py-[3px] rounded-full inline-block mb-[16px]">Negotiable</div>}
                <div className="flex flex-col gap-[10px]">
                  <a href={whatsappUrl} target="_blank" onClick={() => trackEvent('whatsapp_click')}
                    className="w-full h-[50px] rounded-[12px] bg-[#1A5C3A] text-white flex items-center justify-center gap-[6px] font-sans text-[15px] font-[700]">
                    <MessageCircle size={18} /> WhatsApp
                  </a>
                  <a href={`tel:+91${listing.broker_phone}`} onClick={() => trackEvent('call_click')}
                    className="w-full h-[50px] rounded-[12px] bg-white border-[1.5px] border-[#EBEBEB] text-[#111111] flex items-center justify-center gap-[6px] font-sans text-[15px] font-[500]">
                    <Phone size={18} /> Call
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ FIXED BOTTOM BAR (mobile) ═══ */}
      <div
        className="fixed bottom-0 left-0 right-0 h-[72px] bg-white flex items-center px-[20px] md:hidden z-50 safe-bottom border-t border-[#EBEBEB]"
        style={{ boxShadow: '0 -2px 16px rgba(0,0,0,0.08)' }}
      >
        <div className="flex items-center gap-[10px] flex-1 min-w-0">
          <div className="w-[36px] h-[36px] rounded-full bg-[#EAF3ED] flex items-center justify-center text-[#1A5C3A] text-[15px] font-[700] font-sans shrink-0">
            {listing.broker_name?.[0]}
          </div>
          <div className="min-w-0 pr-[10px]">
            <div className="font-sans text-[13px] font-[600] text-[#111111] truncate">{listing.broker_name}</div>
            <div className="font-sans text-[11px] text-[#888888] truncate">{listing.broker_agency}</div>
          </div>
        </div>
        <div className="flex items-center gap-[10px] shrink-0">
          <a href={whatsappUrl} target="_blank" rel="noopener" onClick={() => trackEvent('whatsapp_click')}
            className="h-[46px] w-[130px] rounded-[12px] bg-[#1A5C3A] text-white font-sans text-[14px] font-[700] flex items-center justify-center gap-[6px]">
            WhatsApp
          </a>
          <a href={`tel:+91${listing.broker_phone}`} onClick={() => trackEvent('call_click')}
            className="h-[46px] w-[52px] rounded-[12px] bg-white border border-[#EBEBEB] text-[#111111] flex items-center justify-center">
            <Phone size={20} strokeWidth={1.8} />
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
