import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { formatPrice } from '@/lib/mock-data';
import { supabase } from '@/integrations/supabase/client';
import { ChevronLeft, ChevronRight, X, Phone, MapPin, Camera, Loader2 } from 'lucide-react';

// ─── Unchanged helper components ──────────────────────────────────────────────

function PhotoFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-[#EDECE8]">
      <Camera size={28} className="text-[#9C9A93]" />
    </div>
  );
}

function SafeImage({ src, alt = '', className = '', onError }: { src: string; alt?: string; className?: string; onError?: () => void }) {
  const [error, setError] = useState(false);
  if (error) return <PhotoFallback />;
  return <img src={src} alt={alt} className={className} onError={() => { setError(true); onError?.(); }} loading="lazy" />;
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
    <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 w-full h-11 rounded-[10px] bg-[#1A5C3A] text-white text-sm font-semibold">
      Open Virtual Tour
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

// ─── New luxury sub-components ────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 600, color: '#9C9A93', letterSpacing: '0.08em', marginBottom: 10, textTransform: 'uppercase' }}>
      {children}
    </div>
  );
}

function AboutSection({ text }: { text: string | null | undefined }) {
  const [expanded, setExpanded] = useState(false);
  const words = useMemo(() => (text || '').trim().split(/\s+/).filter(Boolean), [text]);
  const isLong = words.length > 150;
  const preview = words.slice(0, 100).join(' ');
  const full = words.join(' ');
  if (!text?.trim()) return null;
  return (
    <div style={{ marginTop: 24, padding: '0 20px' }}>
      <SectionLabel>About</SectionLabel>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: '#3C3A34', lineHeight: 1.7, margin: 0 }}>
        {isLong && !expanded ? (
          <>
            {preview}…{' '}
            <button
              type="button"
              onClick={() => setExpanded(true)}
              style={{ color: '#1A5C3A', background: 'none', border: 'none', padding: 0, fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 500, cursor: 'pointer' }}
            >
              Read more
            </button>
          </>
        ) : (
          <>
            {full}
            {isLong && expanded && (
              <>
                {' '}
                <button
                  type="button"
                  onClick={() => setExpanded(false)}
                  style={{ color: '#1A5C3A', background: 'none', border: 'none', padding: 0, fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 500, cursor: 'pointer' }}
                >
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

// WhatsApp SVG icon
const WhatsAppIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.95 11a19.79 19.79 0 01-3.07-8.67A2 2 0 012.86 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z" />
  </svg>
);

// Desktop sticky contact card
function StickyContactCard({
  listing,
  whatsappUrl,
  trackEvent,
}: {
  listing: any;
  whatsappUrl: string;
  trackEvent: (e: string) => void;
}) {
  const initials = (listing.broker_name || 'B').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div style={{
      position: 'sticky',
      top: 80,
      background: '#FFFFFF',
      border: '1px solid #E2E0D8',
      borderRadius: 12,
      padding: 20,
    }}>
      {/* Price */}
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 600, color: '#1A5C3A', marginBottom: 4 }}>
        {formatPrice(listing.price, listing.transaction_type)}
      </div>
      {listing.price_negotiable && (
        <span style={{
          display: 'inline-block', background: '#E8F3ED', color: '#1A5C3A',
          fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 500,
          borderRadius: 20, padding: '3px 10px', marginBottom: 16,
        }}>
          Negotiable
        </span>
      )}
      {!listing.price_negotiable && <div style={{ marginBottom: 16 }} />}

      {/* CTA buttons */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener"
        onClick={() => trackEvent('whatsapp_click')}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          background: '#1A5C3A', color: '#fff', borderRadius: 10, height: 44,
          fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600,
          textDecoration: 'none', marginBottom: 10, width: '100%',
        }}
      >
        <WhatsAppIcon /> WhatsApp
      </a>
      <a
        href={`tel:+91${listing.broker_phone}`}
        onClick={() => trackEvent('call_click')}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          background: '#fff', color: '#141210', border: '1px solid #E2E0D8',
          borderRadius: 10, height: 44, fontFamily: "'DM Sans', sans-serif",
          fontSize: 14, fontWeight: 500, textDecoration: 'none', marginBottom: 20, width: '100%',
        }}
      >
        <PhoneIcon /> Call
      </a>

      {/* Broker info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {listing.broker_avatar_url ? (
          <img src={listing.broker_avatar_url} alt={listing.broker_name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
        ) : (
          <div style={{
            width: 40, height: 40, borderRadius: '50%', background: '#E8F3ED',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 14, color: '#1A5C3A',
          }}>
            {initials}
          </div>
        )}
        <div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: '#141210' }}>{listing.broker_name}</div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#9C9A93' }}>{listing.broker_agency}</div>
          {listing.broker_rera && (
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: '#9C9A93' }}>RERA: {listing.broker_rera}</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main page component ───────────────────────────────────────────────────────

export default function PublicListingPage() {
  const { slug } = useParams();
  const [listing, setListing] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [showStickyHeader, setShowStickyHeader] = useState(false);

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
      <div style={{ minHeight: '100vh', background: '#F7F6F3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={28} style={{ color: '#1A5C3A', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (notFound || !listing) {
    return (
      <div style={{ minHeight: '100vh', background: '#F7F6F3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 500, color: '#141210', marginBottom: 8 }}>
            Listing not found
          </h1>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#9C9A93' }}>
            This listing may have been removed or expired.
          </p>
        </div>
      </div>
    );
  }

  // ── Derived data (unchanged logic) ──────────────────────────────────────────
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
    listing.possession_status
      ? String(listing.possession_status).replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
      : null,
  ].filter(Boolean);

  const whatsappUrl = `https://wa.me/91${listing.broker_whatsapp}?text=${encodeURIComponent(`Hi, I'm interested in ${listing.headline}`)}`;

  const propertyDetails = [
    ['Type', listing.property_type],
    ['BHK', listing.bhk_config],
    ['Carpet Area', listing.carpet_area ? `${listing.carpet_area} sq ft` : null],
    ['Built-up', listing.builtup_area ? `${listing.builtup_area} sq ft` : null],
    ['Floor', listing.floor_number ? `${listing.floor_number} of ${listing.total_floors}` : null],
    ['Total Floors', listing.total_floors],
    ['Age', listing.property_age],
    ['Possession', listing.possession_status],
    ['RERA', listing.rera_number],
    ['Facing', listing.facing_direction],
    ['Bathrooms', listing.bathroom_count],
    ['Balconies', listing.balcony_count],
    ['Parking', listing.parking_car ? `${listing.parking_car} car, ${listing.parking_two_wheeler} 2W` : null],
    ['Furnishing', listing.furnishing_status],
  ].filter(([_, v]) => v != null && v !== '' && v !== 0) as [string, string | number][];

  const amenities = listing.amenities || [];
  const aiHighlights = (listing.ai_highlights || []).filter(Boolean);
  const neighbourhoodHighlights = listing.ai_neighbourhood_highlights || [];

  const rawPriceNote = listing.price_history_note?.trim();
  const priceHistoryBadge =
    rawPriceNote &&
    (rawPriceNote.startsWith('↓') || rawPriceNote.toLowerCase().includes('reduced')
      ? rawPriceNote
      : `↓ Reduced from ${rawPriceNote}`);

  const brokerInitials = (listing.broker_name || 'B').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

  // ── Shared inline styles ────────────────────────────────────────────────────
  const sectionPad: React.CSSProperties = { padding: '0 20px' };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#F7F6F3', fontFamily: "'DM Sans', sans-serif" }}>
      <AnalyticsTracker listingId={listing.id} />

      {/* Urgency banner */}
      {listing.urgency_badge && (
        <div style={{ background: '#FFFBEB', borderBottom: '1px solid #FCD34D', padding: '8px 0', textAlign: 'center' }}>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, color: '#92400E' }}>
            ⚡ {listing.urgency_badge}
          </span>
        </div>
      )}

      {/* Sticky header on scroll */}
      {showStickyHeader && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, height: 52,
          background: '#fff', borderBottom: '1px solid #E2E0D8',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 16px', zIndex: 50,
        }}>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, color: '#141210', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '50%' }}>
            {shortHeadline}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, fontWeight: 600, color: '#1A5C3A' }}>
              {formatPrice(listing.price, listing.transaction_type)}
            </span>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener"
              onClick={() => trackEvent('whatsapp_click')}
              style={{
                background: '#1A5C3A', color: '#fff', borderRadius: 8,
                padding: '6px 14px', fontFamily: "'DM Sans', sans-serif",
                fontSize: 12, fontWeight: 600, textDecoration: 'none',
              }}
            >
              Contact
            </a>
          </div>
        </div>
      )}

      {/* ── Desktop: two-column wrapper ── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>

          {/* ── LEFT COLUMN (all content) ─── */}
          <div style={{ flex: '1 1 60%', minWidth: 0 }}>

            {/* ─────────────────────────────────────────────────── */}
            {/* SECTION 1 — HERO PHOTOS                            */}
            {/* ─────────────────────────────────────────────────── */}

            {/* Mobile hero - full bleed */}
            <div
              className="md:hidden"
              style={{ width: '100vw', position: 'relative', left: '50%', right: '50%', marginLeft: '-50vw', marginRight: '-50vw', height: 260, overflow: 'hidden', cursor: 'pointer' }}
              onClick={() => setLightbox(0)}
            >
              {heroPhoto ? (
                <>
                  <SafeImage src={heroPhoto.url} className="w-full h-full" style={{ objectFit: 'cover', objectPosition: 'center', display: 'block', width: '100%', height: '100%' } as any} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.32) 0%, transparent 50%)' }} />
                  {allPhotos.length > 1 && (
                    <div style={{
                      position: 'absolute', bottom: 12, right: 14,
                      background: 'rgba(0,0,0,0.45)', borderRadius: 20,
                      padding: '3px 10px', color: '#fff',
                      fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 500,
                    }}>
                      1/{allPhotos.length}
                    </div>
                  )}
                </>
              ) : (
                <PhotoFallback />
              )}
            </div>

            {/* Desktop hero — grid of photos */}
            <div
              className="hidden md:grid"
              style={{ gridTemplateColumns: '60% 40%', gap: 4, height: 440, overflow: 'hidden', borderRadius: 0, marginLeft: -24, marginRight: -24 }}
            >
              {heroPhoto && (
                <div style={{ overflow: 'hidden', cursor: 'pointer' }} onClick={() => setLightbox(0)}>
                  <SafeImage src={heroPhoto.url} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' } as any} />
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 4 }}>
                {allPhotos.slice(1, 5).map((p: any, i: number) => (
                  <div key={p.id} style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer' }} onClick={() => setLightbox(i + 1)}>
                    <SafeImage src={p.url} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' } as any} />
                    {i === 3 && allPhotos.length > 5 && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.52)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ color: '#fff', fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500 }}>+{allPhotos.length - 5} more</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ─────────────────────────────────────────────────── */}
            {/* SECTION 2 — PROPERTY IDENTITY                      */}
            {/* ─────────────────────────────────────────────────── */}
            <div style={{ ...sectionPad, marginTop: 16 }}>
              {/* Locality + City */}
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#9C9A93', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                {[listing.locality, listing.city].filter(Boolean).join(', ')}
              </div>

              {/* Headline */}
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 500, color: '#141210', lineHeight: 1.3, margin: '0 0 10px 0' }}>
                {listing.headline}
              </h1>

              {/* Price row */}
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 600, color: '#1A5C3A' }}>
                  {formatPrice(listing.price, listing.transaction_type)}
                </span>
                {listing.price_negotiable && (
                  <span style={{
                    background: '#E8F3ED', color: '#1A5C3A', borderRadius: 20,
                    fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 500,
                    padding: '3px 10px',
                  }}>
                    Negotiable
                  </span>
                )}
                {priceHistoryBadge && (
                  <span style={{
                    background: '#FFFBEB', color: '#92400E', borderRadius: 6,
                    fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 500,
                    padding: '3px 10px',
                  }}>
                    {priceHistoryBadge}
                  </span>
                )}
              </div>
            </div>

            {/* ─────────────────────────────────────────────────── */}
            {/* SECTION 3 — SPEC CHIPS                             */}
            {/* ─────────────────────────────────────────────────── */}
            {specChips.length > 0 && (
              <div style={{ marginTop: 12, padding: '0 20px' }}>
                <div style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none', paddingBottom: 2 }}>
                  {specChips.map((chip, i) => (
                    <span
                      key={i}
                      style={{
                        flexShrink: 0,
                        background: '#fff',
                        border: '1px solid #E2E0D8',
                        borderRadius: 20,
                        padding: '5px 12px',
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 12,
                        color: '#5C5A54',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* ─────────────────────────────────────────────────── */}
            {/* SECTION 4 — HIGHLIGHTS                             */}
            {/* ─────────────────────────────────────────────────── */}
            {aiHighlights.length > 0 && (
              <div style={{ marginTop: 20, ...sectionPad }}>
                <SectionLabel>Highlights</SectionLabel>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {aiHighlights.map((h: string, i: number) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#1A5C3A', marginTop: 6, flexShrink: 0 }} />
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#141210', lineHeight: 1.5 }}>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ─────────────────────────────────────────────────── */}
            {/* SECTION 5 — ABOUT                                  */}
            {/* ─────────────────────────────────────────────────── */}
            <AboutSection text={listing.ai_description} />

            {/* ─────────────────────────────────────────────────── */}
            {/* SECTION 6 — PROPERTY DETAILS                       */}
            {/* ─────────────────────────────────────────────────── */}
            {propertyDetails.length > 0 && (
              <div style={{ marginTop: 24, ...sectionPad }}>
                <SectionLabel>Details</SectionLabel>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 0 }}>
                  {propertyDetails.map(([label, val], i) => (
                    <div
                      key={i}
                      style={{
                        height: 36,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        borderBottom: '1px solid #F0EFE9',
                        paddingRight: 8,
                      }}
                    >
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#9C9A93' }}>{label}</div>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, color: '#141210' }}>
                        {String(val)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ─────────────────────────────────────────────────── */}
            {/* SECTION 7 — AMENITIES                              */}
            {/* ─────────────────────────────────────────────────── */}
            {amenities.length > 0 && (
              <div style={{ marginTop: 24, ...sectionPad }}>
                <SectionLabel>Amenities</SectionLabel>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px 0' }}>
                  {amenities.map((a: string, i: number) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ color: '#1A5C3A', fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, lineHeight: 1 }}>✓</span>
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#5C5A54' }}>{a}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ─────────────────────────────────────────────────── */}
            {/* SECTION 8 — FLOOR PLAN                             */}
            {/* ─────────────────────────────────────────────────── */}
            {listing.floor_plan_url && (
              <div style={{ marginTop: 24, ...sectionPad }}>
                <SectionLabel>Floor Plan</SectionLabel>
                <SafeImage
                  src={listing.floor_plan_url}
                  alt="Floor plan"
                  style={{ width: '100%', border: '1px solid #E2E0D8', borderRadius: 8, display: 'block' } as any}
                />
              </div>
            )}

            {/* Virtual Tour */}
            {listing.virtual_tour_url && (
              <div style={{ marginTop: 24, ...sectionPad }}>
                <SectionLabel>Virtual Tour</SectionLabel>
                <VirtualTourEmbed url={listing.virtual_tour_url} />
              </div>
            )}

            {/* Neighbourhood highlights */}
            {neighbourhoodHighlights.length > 0 && (
              <div style={{ marginTop: 24, ...sectionPad }}>
                <SectionLabel>Nearby</SectionLabel>
                <div style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 4 }}>
                  {neighbourhoodHighlights.map((h: string, i: number) => (
                    <span
                      key={i}
                      style={{
                        flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 6,
                        background: '#F0EFE9', border: '1px solid #E2E0D8', borderRadius: 20,
                        padding: '5px 12px', fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#141210',
                      }}
                    >
                      <MapPin size={11} color="#9C9A93" /> {h}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Google Maps */}
            {listing.google_maps_url && (
              <div style={{ marginTop: 24, ...sectionPad }}>
                <SectionLabel>Location</SectionLabel>
                <a href={listing.google_maps_url} target="_blank" rel="noopener" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#1A5C3A', textDecoration: 'none' }}>
                  <MapPin size={14} /> Open in Google Maps
                </a>
              </div>
            )}

            {/* Broker personal note */}
            {listing.broker_personal_note && (
              <div style={{ marginTop: 24, ...sectionPad }}>
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, fontStyle: 'italic', color: '#5C5A54', lineHeight: 1.7, margin: 0 }}>
                  &ldquo;{listing.broker_personal_note}&rdquo;
                </p>
              </div>
            )}

            {/* Open house */}
            {listing.open_house_date && (
              <div style={{ marginTop: 24, ...sectionPad }}>
                <div style={{ background: '#E8F3ED', borderRadius: 8, padding: '10px 14px', fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#141210', fontWeight: 500 }}>
                  🗓 Open House: {listing.open_house_date}
                  {listing.open_house_time_start && (
                    <span style={{ color: '#5C5A54', fontWeight: 400 }}>
                      {' '}{listing.open_house_time_start}{listing.open_house_time_end ? ` – ${listing.open_house_time_end}` : ''}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* ─────────────────────────────────────────────────── */}
            {/* SECTION 9 — BROKER CARD (mobile only)              */}
            {/* ─────────────────────────────────────────────────── */}
            {listing.show_broker_card && (
              <div
                className="md:hidden"
                style={{
                  marginTop: 32,
                  background: '#fff',
                  borderTop: '1px solid #E2E0D8',
                  padding: 20,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {listing.broker_avatar_url ? (
                    <img src={listing.broker_avatar_url} alt={listing.broker_name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%', background: '#E8F3ED',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 15, color: '#1A5C3A',
                    }}>
                      {brokerInitials}
                    </div>
                  )}
                  <div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: '#141210' }}>{listing.broker_name}</div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#9C9A93' }}>{listing.broker_agency}</div>
                    {listing.broker_rera && (
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: '#9C9A93' }}>RERA: {listing.broker_rera}</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 10 — Bottom padding */}
            <div style={{ height: 100 }} />

          </div>{/* end LEFT COLUMN */}

          {/* ── RIGHT COLUMN (desktop sticky card) ─── */}
          <div className="hidden md:block" style={{ flex: '0 0 38%', maxWidth: 380 }}>
            <StickyContactCard listing={listing} whatsappUrl={whatsappUrl} trackEvent={trackEvent} />
          </div>

        </div>{/* end two-col flex */}
      </div>{/* end max-width container */}

      {/* ─────────────────────────────────────────────────── */}
      {/* FIXED BOTTOM CONTACT BAR (mobile only)            */}
      {/* ─────────────────────────────────────────────────── */}
      <div
        className="md:hidden"
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
          height: 64, background: '#fff', borderTop: '1px solid #E2E0D8',
          boxShadow: '0 -4px 12px rgba(0,0,0,0.08)',
          padding: '10px 16px',
          display: 'flex', gap: 10,
        }}
      >
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener"
          onClick={() => trackEvent('whatsapp_click')}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            background: '#1A5C3A', color: '#fff', borderRadius: 10, height: 44,
            fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          <WhatsAppIcon /> WhatsApp
        </a>
        <a
          href={`tel:+91${listing.broker_phone}`}
          onClick={() => trackEvent('call_click')}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            background: '#fff', color: '#141210', border: '1px solid #E2E0D8',
            borderRadius: 10, height: 44,
            fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          <PhoneIcon /> Call
        </a>
      </div>

      {/* ─────────────────────────────────────────────────── */}
      {/* LIGHTBOX                                           */}
      {/* ─────────────────────────────────────────────────── */}
      {lightbox !== null && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setLightbox(null)}
        >
          <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 10, display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ color: '#fff', fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>{lightbox + 1}/{allPhotos.length}</span>
            <button type="button" onClick={() => setLightbox(null)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 4 }}>
              <X size={24} />
            </button>
          </div>
          <button
            type="button"
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', zIndex: 10 }}
            onClick={e => { e.stopPropagation(); setLightbox(Math.max(0, lightbox - 1)); }}
          >
            <ChevronLeft size={36} />
          </button>
          <button
            type="button"
            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', zIndex: 10 }}
            onClick={e => { e.stopPropagation(); setLightbox(Math.min(allPhotos.length - 1, lightbox + 1)); }}
          >
            <ChevronRight size={36} />
          </button>
          <div style={{ maxWidth: '90vw', maxHeight: '80vh', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <SafeImage src={allPhotos[lightbox]?.url} style={{ maxWidth: '90vw', maxHeight: '80vh', objectFit: 'contain', display: 'block' } as any} />
            {allPhotos[lightbox]?.room_tag && allPhotos[lightbox].room_tag !== 'general' && (
              <div style={{ position: 'absolute', bottom: 12, left: 12, background: 'rgba(255,255,255,0.9)', color: '#141210', fontFamily: "'DM Sans', sans-serif", fontSize: 12, padding: '4px 10px', borderRadius: 6 }}>
                {allPhotos[lightbox].room_tag}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
