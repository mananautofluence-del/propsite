import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { formatPrice } from '@/lib/mock-data';
import { supabase } from '@/integrations/supabase/client';
import { ChevronLeft, ChevronRight, X, MapPin, Phone, MessageCircle, Check, Camera, Loader2 } from 'lucide-react';

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

function AboutProperty({ text }: { text: string | null | undefined }) {
  const [expanded, setExpanded] = useState(false);
  const words = useMemo(() => (text || '').trim().split(/\s+/).filter(Boolean), [text]);
  const isLong = words.length > 60;
  const preview = words.slice(0, 60).join(' ');
  const full = words.join(' ');

  if (!text?.trim()) return null;

  return (
    <div>
      <div className="text-label text-text-3 mb-2">About This Property</div>
      <p className="text-sm text-text-2 font-sans" style={{ lineHeight: 1.75 }}>
        {isLong && !expanded ? (
          <>
            {preview}
            …{' '}
            <button type="button" onClick={() => setExpanded(true)} className="text-primary font-medium text-sm inline">
              Read more
            </button>
          </>
        ) : (
          <>
            {full}
            {isLong && expanded && (
              <>
                {' '}
                <button type="button" onClick={() => setExpanded(false)} className="text-primary font-medium text-sm inline">
                  Read less
                </button>
              </>
            )}
          </>
        )}
      </p>
    </div>
  );
}

function VirtualTourEmbed({ url }: { url: string }) {
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|watch\?v=))([\w-]+)/);
  if (yt) {
    return (
      <div className="aspect-video w-full rounded-lg overflow-hidden border border-[#E2E0D8]">
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

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <AnalyticsTracker listingId={listing.id} />

      {listing.urgency_badge && (
        <div className="bg-[hsl(var(--amber-light))] border-b border-[hsl(38_60%_80%)] py-2 text-center">
          <span className="text-[13px] font-medium text-[hsl(var(--amber))]">⚡ {listing.urgency_badge}</span>
        </div>
      )}

      {showStickyHeader && (
        <div
          className="fixed top-0 left-0 right-0 h-[52px] bg-white border-b border-[#E2E0D8] flex items-center justify-between px-4 z-50 animate-fade-in"
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

      <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden">
        <div className="hidden md:grid grid-cols-[60%_40%] gap-1.5 h-[460px]">
          {heroPhoto && (
            <div className="cursor-pointer overflow-hidden" onClick={() => setLightbox(0)}>
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

        <div className="md:hidden h-[260px] w-full">
          {heroPhoto && (
            <div className="w-full h-full cursor-pointer" onClick={() => setLightbox(0)}>
              <SafeImage src={heroPhoto.url} className="w-full h-full object-cover object-center" />
            </div>
          )}
        </div>
      </div>

      <div className="px-4 md:px-0 md:container md:max-w-5xl overflow-hidden">
        <div className="md:hidden mt-3 -mx-4 px-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {allPhotos.map((p: any, i: number) => (
              <div key={p.id} className="shrink-0 w-[150px] h-[100px] rounded-md overflow-hidden relative cursor-pointer bg-surface-2" onClick={() => setLightbox(i)}>
                <SafeImage src={p.url} className="w-full h-full object-cover" />
                {p.room_tag && p.room_tag !== 'general' && (
                  <div className="absolute bottom-0 left-0 right-0 bg-dark/55 text-surface font-sans text-[9px] px-1.5 py-0.5 rounded-b-md">{p.room_tag}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-[65%_35%] gap-6 mt-6">
          <div className="space-y-6 min-w-0">
            <div>
              <h1 className="font-display text-2xl md:text-[32px] font-medium text-text-1 leading-tight break-words">{listing.headline}</h1>
              <div className="flex items-center gap-1.5 mt-1.5 text-sm text-text-2 font-sans">
                <MapPin size={14} /> {listing.locality}, {listing.city}
              </div>
              <div className="flex items-center flex-wrap gap-2 mt-3">
                <span className="text-price text-primary font-display">{formatPrice(listing.price, listing.transaction_type)}</span>
                {listing.price_negotiable && <span className="badge-live text-2xs">Negotiable</span>}
                {priceHistoryBadge && (
                  <span className="text-2xs text-[hsl(var(--amber))] bg-[hsl(var(--amber-light))] px-2 py-0.5 rounded font-sans">{priceHistoryBadge}</span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 overflow-x-auto">
              {specChips.map((s, i) => (
                <span key={i} className="bg-surface-2 text-text-1 text-xs px-2.5 py-1 rounded shrink-0 font-sans">
                  {s}
                </span>
              ))}
            </div>

            {aiHighlights.length > 0 && (
              <div>
                <div className="text-label text-text-3 mb-2">Highlights</div>
                <div className="space-y-2.5">
                  {aiHighlights.map((h: string, i: number) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="text-xl leading-none shrink-0 mt-0.5" aria-hidden>
                        {getHighlightIcon(h)}
                      </span>
                      <p className="text-[13px] text-text-1 leading-snug font-sans">{h}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <AboutProperty text={listing.ai_description} />

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

            {amenities.length > 0 && (
              <div>
                <div className="text-label text-text-3 mb-2.5">Amenities</div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                  {amenities.map((a: string, i: number) => {
                    const icon = getAmenityIcon(a);
                    return (
                      <div key={i} className="flex items-center gap-2 text-[13px] text-text-1 font-sans">
                        <span className="text-base leading-none shrink-0">{icon === '✓' ? <Check size={14} className="text-primary" /> : icon}</span>
                        <span>{a}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {listing.floor_plan_url && (
              <div>
                <div className="text-label text-text-3 mb-2">FLOOR PLAN</div>
                <SafeImage
                  src={listing.floor_plan_url}
                  alt="Floor plan"
                  className="w-full rounded-lg border border-[#E2E0D8]"
                />
              </div>
            )}

            {listing.virtual_tour_url && (
              <div>
                <div className="text-label text-text-3 mb-2">VIRTUAL TOUR</div>
                <VirtualTourEmbed url={listing.virtual_tour_url} />
              </div>
            )}

            {neighbourhoodHighlights.length > 0 && (
              <div>
                <div className="text-label text-text-3 mb-2">NEARBY</div>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
                  {neighbourhoodHighlights.map((h: string, i: number) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 shrink-0 text-[12px] text-text-1 font-sans bg-[#F0EFE9] border border-[#E2E0D8] rounded-[20px] px-3 py-1.5"
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
                <div className="text-label text-text-3 mb-3">Location</div>
                <a href={listing.google_maps_url} target="_blank" rel="noopener" className="text-xs text-primary hover:underline flex items-center gap-1 font-sans">
                  <MapPin size={14} /> Open in Google Maps
                </a>
              </div>
            )}

            {listing.broker_personal_note && (
              <div className="bg-surface-2/80 rounded-lg p-3 border border-border/60">
                <p className="text-xs text-text-2 italic font-sans leading-relaxed">
                  &ldquo;{listing.broker_personal_note}&rdquo;
                </p>
              </div>
            )}

            {listing.open_house_date && (
              <div className="rounded-lg p-3 bg-[hsl(var(--green-light))] border border-primary/15">
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

            {listing.show_broker_card && (
              <div className="card-base p-4">
                <div className="text-label text-text-3 mb-3">Presented By</div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium font-display">
                    {listing.broker_name?.[0]}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-text-1 font-sans">{listing.broker_name}</div>
                    <div className="text-xs text-text-2 font-sans">{listing.broker_agency}</div>
                    {listing.broker_rera && <div className="text-2xs text-text-3 font-sans">RERA: {listing.broker_rera}</div>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <a href={whatsappUrl} target="_blank" onClick={() => trackEvent('whatsapp_click')} className="btn-secondary flex-1 flex items-center justify-center gap-1.5 text-xs">
                    <MessageCircle size={14} /> WhatsApp
                  </a>
                  <a href={`tel:+91${listing.broker_phone}`} onClick={() => trackEvent('call_click')} className="btn-secondary flex-1 flex items-center justify-center gap-1.5 text-xs">
                    <Phone size={14} /> Call
                  </a>
                </div>
              </div>
            )}
          </div>

          <div className="hidden lg:block">
            <div className="sticky top-20 space-y-4">
              <div className="card-base p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium font-display">
                    {listing.broker_name?.[0]}
                  </div>
                  <div>
                    <div className="text-xs font-medium text-text-1 font-sans">{listing.broker_name}</div>
                    <div className="text-2xs text-text-3 font-sans">{listing.broker_agency}</div>
                  </div>
                </div>
                <div className="font-display text-2xl font-medium text-primary mb-4">{formatPrice(listing.price, listing.transaction_type)}</div>
                <a href={whatsappUrl} target="_blank" onClick={() => trackEvent('whatsapp_click')} className="btn-primary w-full flex items-center justify-center gap-1.5 mb-2">
                  <MessageCircle size={14} /> WhatsApp Broker
                </a>
                <a href={`tel:+91${listing.broker_phone}`} onClick={() => trackEvent('call_click')} className="btn-secondary w-full flex items-center justify-center gap-1.5 mb-4">
                  <Phone size={14} /> Call Broker
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 h-14 bg-surface border-t border-border flex lg:hidden z-50 safe-bottom">
        <a href={whatsappUrl} target="_blank" onClick={() => trackEvent('whatsapp_click')} className="flex-1 flex items-center justify-center gap-1.5 bg-primary text-primary-foreground text-sm font-medium font-sans">
          <MessageCircle size={16} /> WhatsApp
        </a>
        <a href={`tel:+91${listing.broker_phone}`} onClick={() => trackEvent('call_click')} className="flex-1 flex items-center justify-center gap-1.5 bg-surface text-text-1 text-sm font-medium border-l border-border font-sans">
          <Phone size={16} /> Call
        </a>
      </div>

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
            <span className="text-surface text-sm">{lightbox + 1}/{allPhotos.length}</span>
            <button type="button" onClick={() => setLightbox(null)} className="text-surface">
              <X size={24} />
            </button>
          </div>
          {lightbox > 0 && (
            <button
              type="button"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-surface/80 hover:text-surface z-10"
              onClick={e => { e.stopPropagation(); setLightbox(lightbox - 1); }}
            >
              <ChevronLeft size={32} />
            </button>
          )}
          {lightbox < allPhotos.length - 1 && (
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-surface/80 hover:text-surface z-10"
              onClick={e => { e.stopPropagation(); setLightbox(lightbox + 1); }}
            >
              <ChevronRight size={32} />
            </button>
          )}
          <div className="max-w-4xl max-h-[80vh] relative" onClick={e => e.stopPropagation()}>
            <SafeImage src={allPhotos[lightbox]?.url} className="max-w-full max-h-[80vh] object-contain" />
            {allPhotos[lightbox]?.room_tag && allPhotos[lightbox].room_tag !== 'general' && (
              <div className="absolute bottom-4 left-4 bg-surface/90 text-text-1 text-xs px-2.5 py-1 rounded-md font-sans">{allPhotos[lightbox].room_tag}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
