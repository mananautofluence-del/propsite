/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef, useMemo } from 'react';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams } from 'react-router-dom';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { formatPrice } from '@/lib/mock-data';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '@/integrations/supabase/client';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChevronLeft, ChevronRight, X, MapPin, Phone, MessageCircle, Check, Camera, Loader2, Share2, Heart, ArrowLeft } from 'lucide-react';

const getEmoji = (text: string) => {
  const t = text.toLowerCase();
  if (/bhk|bedroom|room|chalet|studio/.test(t)) return '🛏️';
  if (/sqft|sq ft|carpet|area|space/.test(t)) return '📐';
  if (/cricket|sport|ground|stadium/.test(t)) return '🏏';
  if (/kitchen|cook|pantry/.test(t)) return '🍳';
  if (/location|city|prime|central/.test(t)) return '📍';
  if (/parking|car|garage/.test(t)) return '🚗';
  if (/pool|swim/.test(t)) return '🏊';
  if (/gym|fitness|workout/.test(t)) return '💪';
  if (/garden|park|green|nature/.test(t)) return '🌿';
  if (/sea|ocean|view|facing/.test(t)) return '🌊';
  if (/security|gated|cctv|guard/.test(t)) return '🔒';
  if (/furnished|furniture/.test(t)) return '🛋️';
  if (/school|college|education/.test(t)) return '🎓';
  if (/hospital|clinic|medical/.test(t)) return '🏥';
  if (/metro|station|transport/.test(t)) return '🚇';
  if (/lift|elevator/.test(t)) return '🛗';
  if (/power|backup|generator/.test(t)) return '⚡';
  if (/vastu/.test(t)) return '🕉️';
  if (/terrace|balcony/.test(t)) return '🌅';
  if (/air|ac|conditioned/.test(t)) return '❄️';
  return '✨';
};

function SafeImage({ src, alt, className }: { src: string; alt?: string; className?: string }) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  
  if (!src || error) {
    return null;
  }
  
  return (
    <div className={`relative ${className} overflow-hidden`}>
      {!loaded && <div className="absolute inset-0 bg-[#FAFAFA] animate-pulse" />}
      <img src={src} alt={alt || ''} className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`} onLoad={() => setLoaded(true)} onError={() => setError(true)} />
    </div>
  );
}


function AboutProperty({ text }: { text: string | null | undefined }) {
  const [expanded, setExpanded] = useState(false);
  if (!text?.trim()) return null;

  return (
    <div className="mt-[24px]">
      <div className="font-sans text-[11px] font-[700] text-[#111111] tracking-[0.08em] uppercase mb-[12px]">ABOUT THIS PROPERTY</div>
      <div>
        <div 
          className="font-sans text-[15px] text-[#111111] leading-[1.75]" 
          style={!expanded ? { display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' } : {}}
        >
          {text}
        </div>
        <button 
          type="button" 
          onClick={() => setExpanded(!expanded)} 
          className="w-full h-[44px] bg-[#F5F5F5] rounded-[10px] font-sans text-[14px] font-[600] text-[#111111] border-none mt-[12px]"
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      </div>
      <div className="h-[1px] bg-[#F0F0F0] my-[20px]" />
    </div>
  );
}

function VirtualTourEmbed({ url }: { url: string }) {
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|watch\?v=))([\w-]+)/);
  if (yt) {
    return (
      <div className="aspect-video w-full rounded-[12px] overflow-hidden border border-[#EFEFEF]">
        <iframe title="Virtual tour" className="w-full h-full" src={`https://www.youtube.com/embed/${yt[1]}`} allowFullScreen />
      </div>
    );
  }
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="h-[44px] w-full bg-[#FAFAFA] border border-[#EFEFEF] text-[#111111] rounded-[10px] font-sans text-[14px] font-[600] flex items-center justify-center gap-2">
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
    if (!listing) return;
    document.title = listing.headline || 'PropSite Listing';

    const setMeta = (property: string, content: string) => {
      let el = document.querySelector(`meta[property="${property}"]`) || document.querySelector(`meta[name="${property}"]`);
      if (!el) {
        el = document.createElement('meta');
        if (property.startsWith('og:')) el.setAttribute('property', property);
        else el.setAttribute('name', property);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };
    
    const heroPhoto = photos.find((p: any) => p.is_hero) || photos[0];
    const desc = listing.ai_description ? listing.ai_description.slice(0, 120) : '';

    setMeta('og:title', listing.headline || '');
    setMeta('og:description', desc);
    setMeta('og:image', heroPhoto?.url || '');
    setMeta('og:image:width', '1200');
    setMeta('og:image:height', '630');
    setMeta('og:type', 'website');
    setMeta('og:url', `https://propsite.pages.dev/l/${slug}`);
    
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', listing.headline || '');
    setMeta('twitter:description', desc);
    setMeta('twitter:image', heroPhoto?.url || '');

  }, [listing, slug, photos]);

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
      <div className="min-h-screen bg-[#FFFFFF] flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-[#111111]" />
      </div>
    );
  }

  if (notFound || !listing) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-[24px] font-[600] text-[#111111] mb-2">Listing not found</h1>
          <p className="font-sans text-[15px] text-[#888888]">This listing may have been removed or expired.</p>
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
    ['Type', listing.property_type],
    ['Config', listing.bhk_config],
    ['Carpet Area', listing.carpet_area ? `${listing.carpet_area} sq ft` : null],
    ['Built-up Area', listing.builtup_area ? `${listing.builtup_area} sq ft` : null],
    ['Floor', listing.floor_number ? `${listing.floor_number} of ${listing.total_floors}` : null],
    ['Age', listing.property_age],
    ['Possession', listing.possession_status],
    ['Furnishing', listing.furnishing_status],
    ['Facing', listing.facing_direction],
    ['Parking', listing.parking_car ? `${listing.parking_car} car, ${listing.parking_two_wheeler} 2W` : null],
    ['Bathrooms', listing.bathroom_count],
    ['Balconies', listing.balcony_count],
    ['RERA', listing.rera_number],
  ].filter(([, v]) => v != null && v !== '' && v !== 0) as [string, string | number][];

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

  const visibleHighlights = showAllHighlights ? aiHighlights : aiHighlights.slice(0, 4);

  return (
    <div className="min-h-screen bg-[#FFFFFF] pb-[120px] md:pb-0">
      <AnalyticsTracker listingId={listing.id} />

      {listing.urgency_badge && (
        <div className="bg-[hsl(var(--amber-light))] border-b border-[hsl(38_60%_80%)] py-2 text-center">
          <span className="font-sans text-[13px] font-[500] text-[hsl(var(--amber))]">⚡ {listing.urgency_badge}</span>
        </div>
      )}

      {showStickyHeader && (
        <div
          className="fixed top-0 left-0 right-0 h-[52px] bg-white/95 backdrop-blur-sm border-b border-[#EFEFEF] flex items-center justify-between px-4 z-50 animate-fade-in shadow-sm"
        >
          <div className="font-sans text-[14px] font-[500] text-[#111111] truncate max-w-[45%]">{shortHeadline}</div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="font-display text-[14px] font-[600] text-[#1A5C3A]">{formatPrice(listing.price, listing.transaction_type)}</span>
            <a href={whatsappUrl} target="_blank" rel="noopener" onClick={() => trackEvent('whatsapp_click')} className="h-[32px] px-[12px] bg-[#1A5C3A] text-white rounded-[6px] font-sans text-[12px] font-[600] inline-flex items-center justify-center">
              Contact
            </a>
          </div>
        </div>
      )}

      {/* ═══ HERO SECTION ═══ */}
      <div className="w-screen bg-[#FFFFFF] md:w-full md:max-w-[1080px] mx-auto md:mt-[24px]">
        {/* Desktop: grid layout */}
        <div className="hidden md:grid grid-cols-[60%_40%] gap-[10px] h-[480px] rounded-[24px] overflow-hidden">
          {heroPhoto && (
            <div className="cursor-pointer overflow-hidden" onClick={() => setLightbox(0)}>
              <SafeImage src={heroPhoto.url} className="w-full h-full object-cover object-center" />
            </div>
          )}
          <div className="grid grid-cols-2 grid-rows-2 gap-[10px]">
            {allPhotos.slice(1, 5).map((p: any, i: number) => (
              <div key={p.id} className="relative cursor-pointer overflow-hidden" onClick={() => setLightbox(i + 1)}>
                <SafeImage src={p.url} className="w-full h-full object-cover" />
                {i === 3 && allPhotos.length > 5 && (
                  <div className="absolute inset-0 bg-[#000000]/50 flex items-center justify-center">
                    <span className="text-white font-sans text-[15px] font-[600]">+{allPhotos.length - 5} more</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile: CSS scroll-snap swipeable flex container */}
        <div className="md:hidden h-[300px] w-full relative overflow-hidden rounded-[0_0_28px_28px]">
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
            className="absolute top-[16px] left-[16px] w-[36px] h-[36px] rounded-full bg-white flex items-center justify-center z-10 shadow-sm"
          >
            <ArrowLeft size={16} color="#111111" strokeWidth={2} />
          </button>

          {/* Share + Save buttons */}
          <div className="absolute top-[16px] right-[16px] flex gap-[8px] z-10">
            <button
              type="button"
              onClick={() => {
                if (navigator.share) navigator.share({ url: window.location.href, title: listing.headline });
              }}
              className="w-[36px] h-[36px] rounded-full bg-white flex items-center justify-center shadow-sm"
            >
              <Share2 size={16} color="#111111" strokeWidth={2} />
            </button>
            <button
              type="button"
              className="w-[36px] h-[36px] rounded-full bg-white flex items-center justify-center shadow-sm"
            >
              <Heart size={16} color="#111111" strokeWidth={2} />
            </button>
          </div>

          {/* Photo counter pill */}
          {allPhotos.length > 1 && (
            <div className="absolute bottom-[16px] right-[16px] bg-[#000000]/55 text-white font-sans text-[12px] font-[500] px-[10px] py-[4px] rounded-full pointer-events-none">
              {heroIdx + 1} / {allPhotos.length}
            </div>
          )}
        </div>
      </div>

      <div className="w-full md:max-w-[1080px] mx-auto overflow-hidden">
        {/* Mobile Wrapper */}
        <div className="bg-[#FFFFFF] rounded-[24px_24px_0_0] -mt-[24px] relative z-10 px-[20px] pt-[24px] pb-[120px] md:px-[24px] md:mt-[24px] md:pt-0 md:pb-[80px]">
          
          <div className="md:grid grid-cols-[58%_42%] gap-[40px]">
            <div className="min-w-0">
              {/* ═══ PROPERTY IDENTITY ═══ */}
              <div>
                <div className="font-sans text-[11px] font-[600] text-[#888888] tracking-[0.08em] uppercase mb-[8px]">
                  📍 {listing.locality}, {listing.city}
                </div>
                <h1 className="font-display text-[26px] font-[600] text-[#111111] leading-[1.3] break-words mb-[10px]">{listing.headline}</h1>
                
                <div className="flex items-center flex-wrap gap-[8px]">
                  {(listing.price == null && listing.monthly_rent == null) ? (
                    <span className="font-display text-[22px] font-[400] text-[#111111]">Price on Request</span>
                  ) : (
                    <span className="font-display text-[28px] font-[700] text-[#1A5C3A]">{formatPrice(listing.price, listing.transaction_type)}</span>
                  )}
                  {priceLabel && (listing.price != null || listing.monthly_rent != null) && <span className="font-sans text-[15px] text-[#555555] font-[400] self-end mb-1">{priceLabel}</span>}
                  {listing.price_negotiable && <span className="font-sans text-[11px] font-[600] text-[#1A5C3A] bg-[#EAF3ED] px-[10px] py-[3px] rounded-full shrink-0">Negotiable</span>}
                  {priceHistoryBadge && (
                    <span className="font-sans text-[11px] font-[600] text-[#1A5C3A] bg-[#EAF3ED] px-[10px] py-[3px] rounded-full shrink-0">{priceHistoryBadge}</span>
                  )}
                </div>
                {aiTagline && (
                  <p className="font-sans text-[14px] text-[#666666] italic mt-[6px]">{aiTagline}</p>
                )}
                <div className="h-[1px] bg-[#F0F0F0] my-[16px]" />
              </div>

              {/* ═══ SPECS ROW ═══ */}
              <div className="mb-[8px] -mx-[20px] px-[20px] md:mx-0 md:px-0">
                <div className="flex gap-[8px] overflow-x-auto pb-2 scrollbar-hide">
                  {specChips.map((s, i) => (
                    <span key={i} className="bg-[#F5F5F5] text-[#333333] text-[13px] font-[500] px-[14px] py-[6px] rounded-full shrink-0 font-sans whitespace-nowrap h-[32px] flex items-center justify-center border-none">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div className="h-[1px] bg-[#F0F0F0] my-[16px]" />

              {/* ═══ HIGHLIGHTS ═══ */}
              {aiHighlights.length > 0 && (
                <div className="mt-[24px]">
                  <div className="font-sans text-[11px] font-[700] tracking-[0.08em] text-[#111111] uppercase mb-[14px]">WHAT THIS PROPERTY OFFERS</div>
                  <div className="grid grid-cols-2 gap-[10px]">
                    {visibleHighlights.map((h: string, i: number) => (
                      <div key={i} className="bg-[#FAFAFA] border border-[#EFEFEF] rounded-[14px] p-[14px_12px] flex flex-col gap-[10px]">
                        <div className="text-[28px] leading-none">
                          {getEmoji(h)}
                        </div>
                        <div className="font-sans text-[13px] font-[600] text-[#111111] leading-[1.4] line-clamp-2">{h}</div>
                      </div>
                    ))}
                  </div>
                  {aiHighlights.length > 4 && !showAllHighlights && (
                    <button type="button" onClick={() => setShowAllHighlights(true)} className="font-sans text-[13px] font-[600] text-[#111111] mt-[10px] block underline w-full text-left">
                      Show all {aiHighlights.length} highlights
                    </button>
                  )}
                  <div className="h-[1px] bg-[#F0F0F0] my-[20px]" />
                </div>
              )}

            {/* ═══ ABOUT ═══ */}
            <AboutProperty text={listing.ai_description} />

            {/* ═══ PROPERTY DETAILS TABLE ═══ */}
            {propertyDetails.length > 0 && (
              <div className="mt-[24px]">
                <div className="font-sans text-[11px] font-[700] text-[#111111] tracking-[0.08em] uppercase mb-[12px]">PROPERTY DETAILS</div>
                <div className="border border-[#EFEFEF] rounded-[14px] overflow-hidden">
                  {propertyDetails.map(([label, val], i) => (
                    <div key={i} className={`flex items-center justify-between p-[13px_16px] ${i < propertyDetails.length - 1 ? 'border-b border-[#F5F5F5]' : ''} ${i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'}`}>
                      <span className="font-sans text-[13px] font-[400] text-[#888888]">{label}</span>
                      <span className="font-sans text-[14px] font-[600] text-[#111111]">{String(val)}</span>
                    </div>
                  ))}
                </div>
                <div className="h-[1px] bg-[#F0F0F0] my-[20px]" />
              </div>
            )}

            {/* ═══ AMENITIES ═══ */}
            {amenities.length > 0 && (
              <div className="mt-[24px]">
                <div className="font-sans text-[11px] font-[700] text-[#111111] tracking-[0.08em] uppercase mb-[12px]">AMENITIES</div>
                <div className="grid grid-cols-2 gap-[12px_8px]">
                  {amenities.map((a: string, i: number) => (
                    <div key={i} className="flex items-center gap-[8px] p-[10px_14px] bg-[#F0FDF4] border border-[#BBF7D0] rounded-[10px]">
                      <div className="w-[8px] h-[8px] rounded-full bg-[#16A34A] shrink-0" />
                      <span className="font-sans text-[13px] font-[500] text-[#166534]">{a}</span>
                    </div>
                  ))}
                </div>
                <div className="h-[1px] bg-[#F0F0F0] my-[20px]" />
              </div>
            )}

            {/* ═══ FLOOR PLAN ═══ */}
            {listing.floor_plan_url && listing.floor_plan_url.trim() !== '' && (
              <div className="mt-[24px]">
                <div className="font-sans text-[11px] font-[700] text-[#111111] tracking-[0.08em] uppercase mb-[12px]">FLOOR PLAN</div>
                <SafeImage
                  src={listing.floor_plan_url}
                  alt="Floor plan"
                  className="w-full rounded-[12px] border border-[#EFEFEF] object-contain"
                />
                <div className="h-[1px] bg-[#F0F0F0] my-[20px]" />
              </div>
            )}

            {/* ═══ VIRTUAL TOUR ═══ */}
            {listing.virtual_tour_url && listing.virtual_tour_url.trim() !== '' && (
              <div className="mt-[24px]">
                <div className="font-sans text-[11px] font-[700] text-[#111111] tracking-[0.08em] uppercase mb-[12px]">VIRTUAL TOUR</div>
                <VirtualTourEmbed url={listing.virtual_tour_url} />
                <div className="h-[1px] bg-[#F0F0F0] my-[20px]" />
              </div>
            )}

            {/* ═══ NEARBY ═══ */}
            {neighbourhoodHighlights.length > 0 && (
              <div className="mt-[24px]">
                <div className="font-sans text-[11px] font-[700] text-[#111111] tracking-[0.08em] uppercase mb-[12px]">NEARBY</div>
                <div className="flex gap-[10px] overflow-x-auto pb-[4px] scrollbar-hide -mx-[20px] px-[20px] md:mx-0 md:px-0">
                  {neighbourhoodHighlights.map((h: string, i: number) => (
                    <div key={i} className="bg-white border border-[#EFEFEF] rounded-[12px] p-[12px_14px] flex items-center justify-start gap-[10px] shrink-0 min-w-[160px]">
                      <div className="w-[32px] h-[32px] rounded-full bg-[#FEF2F2] flex items-center justify-center shrink-0 text-[16px]">
                        📍
                      </div>
                      <span className="font-sans text-[13px] font-[500] text-[#111111] line-clamp-2 leading-[1.3]">{h}</span>
                    </div>
                  ))}
                </div>
                <div className="h-[1px] bg-[#F0F0F0] my-[20px]" />
              </div>
            )}

            {listing.google_maps_url && (
              <div className="mt-[24px]">
                <div className="font-sans text-[11px] font-[700] text-[#111111] tracking-[0.08em] uppercase mb-[12px]">LOCATION</div>
                <a href={listing.google_maps_url} target="_blank" rel="noopener" className="text-[13px] font-[500] text-[#111111] underline flex items-center gap-[6px] font-sans">
                  <MapPin size={16} /> Open in Google Maps
                </a>
                <div className="h-[1px] bg-[#F0F0F0] my-[20px]" />
              </div>
            )}

            {listing.broker_personal_note && listing.broker_personal_note.trim() !== '' && (
              <div className="mt-[24px]">
                <div className="font-sans text-[11px] font-[700] text-[#111111] tracking-[0.08em] uppercase mb-[12px]">BROKER NOTE</div>
                <div className="bg-[#FAFAFA] rounded-[14px] p-[16px] border border-[#EFEFEF]">
                  <p className="font-sans text-[14px] font-[500] text-[#555555] italic leading-[1.6]">
                    "{listing.broker_personal_note}"
                  </p>
                </div>
                <div className="h-[1px] bg-[#F0F0F0] my-[20px]" />
              </div>
            )}

            {listing.open_house_date && listing.open_house_date.trim() !== '' && (
              <div className="mt-[24px] rounded-[16px] p-[16px] bg-[#F5F5F5]">
                <div className="text-[14px] font-[600] text-[#111111] font-sans">
                  🗓 Open House: {listing.open_house_date}
                  {listing.open_house_time_start && (
                    <span className="font-[400] text-[#555555]">
                      <br />{listing.open_house_time_start}
                      {listing.open_house_time_end ? ` – ${listing.open_house_time_end}` : ''}
                    </span>
                  )}
                </div>
                <div className="h-[1px] bg-[#F0F0F0] my-[20px]" />
              </div>
            )}

            {/* ═══ BROKER CARD (mobile) ═══ */}
            {listing.show_broker_card && (
              <div className="md:hidden mt-[24px] bg-white border border-[#EFEFEF] rounded-[16px] p-[18px]">
                <div className="flex items-center gap-[14px]">
                  {listing.broker_avatar_url ? (
                    <SafeImage src={listing.broker_avatar_url} className="w-[52px] h-[52px] rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-[52px] h-[52px] rounded-full bg-[#EAF3ED] flex items-center justify-center text-[#1A5C3A] font-[700] font-sans text-[18px] shrink-0">
                      {listing.broker_name?.[0]}
                    </div>
                  )}
                  <div>
                    <div className="font-sans text-[16px] font-[700] text-[#111111]">{listing.broker_name}</div>
                    <div className="font-sans text-[13px] text-[#888888] mt-[2px]">{listing.broker_agency}</div>
                    {listing.broker_rera && (
                      <div className="font-sans text-[11px] font-[600] text-[#1A5C3A] bg-[#EAF3ED] px-[8px] py-[2px] rounded-full inline-block mt-[4px]">
                        RERA Verified ✓
                      </div>
                    )}
                  </div>
                </div>
                <div className="border-t border-[#F0F0F0] my-[14px]" />
                <div className="flex flex-col gap-[10px]">
                  <a href={whatsappUrl} target="_blank" onClick={() => trackEvent('whatsapp_click')}
                    className="w-full h-[50px] rounded-[12px] bg-[#1A5C3A] text-white flex items-center justify-center gap-[10px] font-sans text-[15px] font-[700]">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    WhatsApp Broker
                  </a>
                  <a href={`tel:+91${listing.broker_phone}`} onClick={() => trackEvent('call_click')}
                    className="w-full h-[50px] rounded-[12px] bg-white border-[1.5px] border-[#EFEFEF] text-[#111111] flex items-center justify-center gap-[10px] font-sans text-[15px] font-[500]">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.1 19.86 19.86 0 0 1 1.61 4.5 2 2 0 0 1 3.6 2.32h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.06 6.06l.98-.98a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 17z"/></svg>
                    Call Broker
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
          className="fixed inset-0 bg-[#000000]/95 z-[100] flex items-center justify-center"
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
          <div className="absolute top-[16px] right-[16px] z-10 flex items-center gap-[12px]">
            <span className="text-white text-[14px] bg-black/40 px-[10px] py-[4px] rounded-full font-sans">{lightbox + 1}/{allPhotos.length}</span>
            <button type="button" onClick={() => setLightbox(null)} className="w-[40px] h-[40px] rounded-full bg-white/10 flex items-center justify-center text-white">
              <X size={20} />
            </button>
          </div>
          {lightbox > 0 && (
            <button
              type="button"
              className="absolute left-[16px] top-1/2 -translate-y-1/2 w-[40px] h-[40px] rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:text-white z-10"
              onClick={e => { e.stopPropagation(); setLightbox(lightbox - 1); }}
            >
              <ChevronLeft size={24} />
            </button>
          )}
          {lightbox < allPhotos.length - 1 && (
            <button
              type="button"
              className="absolute right-[16px] top-1/2 -translate-y-1/2 w-[40px] h-[40px] rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:text-white z-10"
              onClick={e => { e.stopPropagation(); setLightbox(lightbox + 1); }}
            >
              <ChevronRight size={24} />
            </button>
          )}
          <div className="max-w-4xl max-h-[80vh] relative" onClick={e => e.stopPropagation()}>
            <SafeImage src={allPhotos[lightbox]?.url} className="max-w-full max-h-[80vh] object-contain rounded-[16px]" />
            {allPhotos[lightbox]?.room_tag && allPhotos[lightbox].room_tag !== 'general' && (
              <div className="absolute bottom-[16px] left-[16px] bg-white/90 text-[#111111] text-[12px] font-[600] px-[10px] py-[4px] rounded-[8px] font-sans">{allPhotos[lightbox].room_tag}</div>
            )}
          </div>
        </div>
      )}
    </div>
  </div>
  );
}
