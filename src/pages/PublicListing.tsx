import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { formatPrice } from '@/lib/mock-data';
import { supabase } from '@/integrations/supabase/client';
import { Share2, Copy, ChevronLeft, ChevronRight, X, MapPin, Phone, MessageCircle, Calendar, Clock, Check, Camera, Loader2 } from 'lucide-react';

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

  const quickSpecs = [
    listing.bhk_config,
    listing.carpet_area ? `${listing.carpet_area} sq ft` : null,
    listing.floor_number ? `Floor ${listing.floor_number}/${listing.total_floors}` : null,
    listing.parking_car ? `${listing.parking_car} Parking` : null,
    listing.possession_status === 'ready' || listing.possession_status === 'Ready to Move' ? 'Ready Possession' : listing.possession_status,
    listing.furnishing_status ? listing.furnishing_status.replace('-', ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) : null,
    listing.facing_direction ? `${listing.facing_direction} Facing` : null,
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
  ].filter(([_, v]) => v != null && v !== '' && v !== 0) as [string, string | number][];

  const amenities = listing.amenities || [];
  const aiHighlights = listing.ai_highlights || [];
  const neighbourhoodHighlights = listing.ai_neighbourhood_highlights || [];

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <AnalyticsTracker listingId={listing.id} />

      {listing.urgency_badge && (
        <div className="bg-[hsl(var(--amber-light))] border-b border-[hsl(38_60%_80%)] py-2 text-center">
          <span className="text-[13px] font-medium text-[hsl(var(--amber))]">⚡ {listing.urgency_badge}</span>
        </div>
      )}

      {showStickyHeader && (
        <div className="fixed top-0 left-0 right-0 h-14 bg-surface/95 backdrop-blur-sm border-b border-border flex items-center justify-between px-4 z-50 animate-fade-in">
          <div className="text-sm font-medium text-text-1 truncate max-w-[50%]">{listing.headline}</div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-primary hidden sm:block">{formatPrice(listing.price)}</span>
            <a href={whatsappUrl} target="_blank" rel="noopener" onClick={() => trackEvent('whatsapp_click')} className="btn-primary text-xs h-8">Contact</a>
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
              <div className="flex items-center gap-1.5 mt-1.5 text-sm text-text-2">
                <MapPin size={14} /> {listing.locality}, {listing.city}
              </div>
              <div className="flex items-center flex-wrap gap-2 mt-3">
                <span className="text-price text-primary">{formatPrice(listing.price, listing.transaction_type)}</span>
                {listing.price_negotiable && <span className="badge-live text-2xs">Negotiable</span>}
                {listing.price_history_note && (
                  <span className="text-2xs text-[hsl(var(--amber))] bg-[hsl(var(--amber-light))] px-2 py-0.5 rounded">{listing.price_history_note}</span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 overflow-x-auto">
              {quickSpecs.map((s, i) => (
                <span key={i} className="bg-surface-2 text-text-1 text-xs px-2.5 py-1 rounded shrink-0">{s}</span>
              ))}
            </div>

            <div>
              <div className="text-label text-text-3 mb-2">About This Property</div>
              <p className="text-sm text-text-2 leading-relaxed">{listing.ai_description}</p>
              {aiHighlights.length > 0 && (
                <div className="mt-4 space-y-2">
                  {aiHighlights.filter(Boolean).map((h: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-text-1">
                      <div className="w-0.5 h-full min-h-[20px] bg-primary rounded-full mt-0.5 shrink-0" />
                      {h}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="text-label text-text-3 mb-3">Property Details</div>
              <div className="grid grid-cols-2 gap-x-4">
                {propertyDetails.map(([label, val], i) => (
                  <div key={i} className="py-2.5 border-b border-border">
                    <div className="text-[11px] text-text-3 mb-0.5">{label}</div>
                    <div className="text-[13px] font-medium text-text-1">{String(val)}</div>
                  </div>
                ))}
              </div>
            </div>

            {amenities.length > 0 && (
              <div>
                <div className="text-label text-text-3 mb-2.5">Amenities</div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {amenities.map((a: string, i: number) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs text-text-2">
                      <Check size={14} className="text-primary shrink-0" /> {a}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {neighbourhoodHighlights.length > 0 && (
              <div>
                <div className="text-label text-text-3 mb-3">Neighbourhood</div>
                <div className="flex flex-wrap gap-2">
                  {neighbourhoodHighlights.map((h: string, i: number) => (
                    <span key={i} className="bg-surface-2 text-text-1 text-xs px-3 py-1.5 rounded-md flex items-center gap-1.5">
                      <MapPin size={12} className="text-primary" /> {h}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {listing.google_maps_url && (
              <div>
                <div className="text-label text-text-3 mb-3">Location</div>
                <a href={listing.google_maps_url} target="_blank" rel="noopener" className="text-xs text-primary hover:underline flex items-center gap-1">
                  <MapPin size={14} /> Open in Google Maps
                </a>
              </div>
            )}

            {listing.show_broker_card && (
              <div className="card-base p-4">
                <div className="text-label text-text-3 mb-3">Presented By</div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium">
                    {listing.broker_name?.[0]}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-text-1">{listing.broker_name}</div>
                    <div className="text-xs text-text-2">{listing.broker_agency}</div>
                    {listing.broker_rera && <div className="text-2xs text-text-3">RERA: {listing.broker_rera}</div>}
                  </div>
                </div>
                {listing.broker_personal_note && (
                  <div className="bg-surface-2 rounded-md p-3 mb-3 text-xs text-text-2 italic">"{listing.broker_personal_note}"</div>
                )}
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
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
                    {listing.broker_name?.[0]}
                  </div>
                  <div>
                    <div className="text-xs font-medium text-text-1">{listing.broker_name}</div>
                    <div className="text-2xs text-text-3">{listing.broker_agency}</div>
                  </div>
                </div>
                <div className="font-display text-2xl font-medium text-primary mb-4">{formatPrice(listing.price, listing.transaction_type)}</div>
                <a href={whatsappUrl} target="_blank" onClick={() => trackEvent('whatsapp_click')} className="btn-primary w-full flex items-center justify-center gap-1.5 mb-2">
                  <MessageCircle size={14} /> WhatsApp Broker
                </a>
                <a href={`tel:+91${listing.broker_phone}`} onClick={() => trackEvent('call_click')} className="btn-secondary w-full flex items-center justify-center gap-1.5 mb-4">
                  <Phone size={14} /> Call Broker
                </a>

                {listing.open_house_date && (
                  <div className="bg-surface-2 rounded-md p-3 mb-4">
                    <div className="text-label text-text-3 mb-1">Open House</div>
                    <div className="flex items-center gap-1.5 text-xs text-text-1">
                      <Calendar size={12} /> {listing.open_house_date}
                      {listing.open_house_time_start && <span className="text-text-3">· {listing.open_house_time_start} - {listing.open_house_time_end}</span>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 h-14 bg-surface border-t border-border flex lg:hidden z-50 safe-bottom">
        <a href={whatsappUrl} target="_blank" onClick={() => trackEvent('whatsapp_click')} className="flex-1 flex items-center justify-center gap-1.5 bg-primary text-primary-foreground text-sm font-medium">
          <MessageCircle size={16} /> WhatsApp
        </a>
        <a href={`tel:+91${listing.broker_phone}`} onClick={() => trackEvent('call_click')} className="flex-1 flex items-center justify-center gap-1.5 bg-surface text-text-1 text-sm font-medium border-l border-border">
          <Phone size={16} /> Call
        </a>
      </div>

      {lightbox !== null && (
        <div className="fixed inset-0 bg-dark/95 z-[100] flex items-center justify-center" onClick={() => setLightbox(null)}>
          <div className="absolute top-4 right-4 z-10">
            <span className="text-surface text-sm mr-4">{lightbox + 1}/{allPhotos.length}</span>
            <button onClick={() => setLightbox(null)} className="text-surface"><X size={24} /></button>
          </div>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-surface/80 hover:text-surface z-10"
            onClick={e => { e.stopPropagation(); setLightbox(Math.max(0, lightbox - 1)); }}
          >
            <ChevronLeft size={32} />
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-surface/80 hover:text-surface z-10"
            onClick={e => { e.stopPropagation(); setLightbox(Math.min(allPhotos.length - 1, lightbox + 1)); }}
          >
            <ChevronRight size={32} />
          </button>
          <div className="max-w-4xl max-h-[80vh] relative" onClick={e => e.stopPropagation()}>
            <SafeImage src={allPhotos[lightbox]?.url} className="max-w-full max-h-[80vh] object-contain" />
            {allPhotos[lightbox]?.room_tag && allPhotos[lightbox].room_tag !== 'general' && (
              <div className="absolute bottom-4 left-4 bg-surface/90 text-text-1 text-xs px-2.5 py-1 rounded-md">
                {allPhotos[lightbox].room_tag}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
