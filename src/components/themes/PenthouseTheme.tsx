import React from 'react';
import { PresentationContent, PresentationPhoto, PageType } from '@/lib/presentationTypes';

interface ThemeProps {
  content: PresentationContent;
  pageType: PageType;
  photos: PresentationPhoto[];
  format: 'square' | 'landscape';
}

function getPhoto(photos: PresentationPhoto[], tag: string): string {
  const photo = photos.find(p => p.tag === tag);
  return photo?.url || photos[0]?.url || '';
}

export default function PenthouseTheme({ content, pageType, photos }: ThemeProps) {
  const bg = '#0A0A0A';
  const text = '#F0EDE8';
  const accent = '#C9A96E';
  
  const containerStyle: React.CSSProperties = {
    width: '1080px', height: '1080px', overflow: 'hidden',
    backgroundColor: bg, color: text, position: 'relative',
    fontFamily: '"Inter", sans-serif'
  };
  
  const hFont: React.CSSProperties = { fontFamily: '"Playfair Display", serif' };

  if (pageType === 'cover') {
    return (
      <div style={containerStyle}>
        <img src={getPhoto(photos, 'cover')} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.65, position: 'absolute' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)' }}></div>
        
        <div style={{ position: 'absolute', top: 40, right: 40, backgroundColor: 'rgba(201,169,110,0.15)', border: '1px solid rgba(201,169,110,0.4)', backdropFilter: 'blur(20px)', color: accent, fontSize: 13, letterSpacing: '0.4em', textTransform: 'uppercase', padding: '10px 20px', fontWeight: 600 }}>
          Exclusive Listing
        </div>
        
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 48, backgroundColor: 'rgba(10,10,10,0.7)', backdropFilter: 'blur(30px)', borderTop: `2px solid ${accent}` }}>
          <div style={{ color: accent, fontSize: 14, letterSpacing: '0.4em', textTransform: 'uppercase', fontWeight: 600 }}>{content.locationDisplay}</div>
          <div style={{ ...hFont, fontSize: 64, color: text, lineHeight: 1.1, marginTop: 12 }}>{content.headline}</div>
          <div style={{ fontSize: 20, color: text, opacity: 0.6, marginTop: 12, fontWeight: 300 }}>{content.tagline}</div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }}>
            <div style={{ ...hFont, fontSize: 52, color: accent, fontWeight: 700 }}>{content.price}</div>
            {content.priceNote && (
              <div style={{ backgroundColor: 'rgba(201,169,110,0.15)', border: '1px solid rgba(201,169,110,0.25)', color: accent, fontSize: 13, padding: '6px 14px', borderRadius: 999 }}>
                {content.priceNote}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (pageType === 'overview') {
    const stat1Val = content.bhkConfig || 'Luxury';
    const stat1Lab = content.bhkConfig ? 'Configuration' : 'Category';
    return (
      <div style={{ ...containerStyle, display: 'flex' }}>
        <div style={{ width: '50%', position: 'relative' }}>
          <img src={getPhoto(photos, 'living')} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, transparent, #0A0A0A)' }}></div>
        </div>
        <div style={{ width: '50%', padding: '60px 52px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
          <div style={{ width: 48, height: 2, backgroundColor: accent, marginBottom: 32 }}></div>
          <div style={{ ...hFont, fontSize: 44, color: text, lineHeight: 1.2 }}>{content.subheadline || 'Property Overview'}</div>
          <div style={{ fontSize: 22, color: text, opacity: 0.6, lineHeight: 1.8, marginTop: 20, fontWeight: 300 }}>{content.description}</div>
          
          <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 20, flex: 1, justifyContent: 'flex-end' }}>
            {[{v: stat1Val, l: stat1Lab}, {v: content.carpetArea || content.builtupArea, l: 'Area Focus'}, {v: content.floorNumber || content.propertyType, l: 'Level / Type'}].map((s, i) => s.v ? (
              <div key={i} style={{ borderTop: '1px solid rgba(201,169,110,0.3)', paddingTop: 20 }}>
                <div style={{ ...hFont, fontSize: 40, color: accent, fontWeight: 700 }}>{s.v}</div>
                <div style={{ fontSize: 13, color: text, opacity: 0.4, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.l}</div>
              </div>
            ) : null)}
          </div>
        </div>
      </div>
    );
  }

  if (pageType === 'highlights') {
    return (
      <div style={containerStyle}>
        <div style={{ padding: '60px 60px 0' }}>
          <div style={{ color: accent, fontSize: 13, letterSpacing: '0.4em', textTransform: 'uppercase', fontWeight: 600 }}>Signature Highlights</div>
          <div style={{ ...hFont, fontSize: 52, color: text, marginTop: 8 }}>What Sets It Apart</div>
        </div>
        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column' }}>
          {(content.highlights || []).slice(0, 5).map((h, i) => (
            <div key={i} style={{ padding: '22px 60px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 28, alignItems: 'center' }}>
              <div style={{ width: 56, height: 56, border: `1px solid ${accent}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="1.5">
                  <path d="M12 2L2 9l10 13L22 9l-10-7z"/><path d="M2 9h20M12 2l-5 7M12 2l5 7"/>
                </svg>
              </div>
              <div style={{ fontSize: 24, color: text, fontWeight: 400 }}>{h}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (pageType === 'gallery') {
    const galleryTags = ['exterior', 'living', 'bedroom', 'kitchen', 'bathroom', 'balcony'];
    const pPhotos = photos.filter(p => p.tag !== 'cover').slice(0, 4);
    while (pPhotos.length < 4 && photos.length > 0) pPhotos.push(photos[0]);
    
    return (
      <div style={{ ...containerStyle, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '48px 48px 24px' }}>
          <div style={{ color: accent, fontSize: 13, letterSpacing: '0.4em', textTransform: 'uppercase', fontWeight: 600 }}>Gallery</div>
          <div style={{ ...hFont, fontSize: 44, color: text }}>Visual Experience</div>
        </div>
        <div style={{ flex: 1, padding: '0 48px 48px 48px', display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 16 }}>
          {pPhotos.slice(0, 4).map((p, i) => (
            <img key={i} src={p.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', border: '2px solid rgba(201,169,110,0.2)' }} />
          ))}
        </div>
      </div>
    );
  }

  if (pageType === 'specs') {
    const specsList = [
      { l: 'Property Type', v: content.propertyType },
      { l: 'Configuration', v: content.bhkConfig },
      { l: 'Carpet Area', v: content.carpetArea },
      { l: 'Built-up Area', v: content.builtupArea },
      { l: 'Floor', v: content.floorNumber },
      { l: 'Total Floors', v: content.totalFloors },
      { l: 'Facing', v: content.facing },
      { l: 'Furnishing', v: content.furnishing },
      { l: 'Parking', v: content.parking },
      { l: 'Possession', v: content.possession },
      { l: 'Bathrooms', v: content.bathrooms },
    ].filter(s => !!s.v);

    return (
      <div style={{ ...containerStyle, display: 'flex' }}>
        <div style={{ width: '50%', backgroundColor: '#111111', padding: 60, boxSizing: 'border-box' }}>
          <div style={{ color: accent, fontSize: 13, letterSpacing: '0.4em', textTransform: 'uppercase', fontWeight: 600 }}>Technical Details</div>
          <div style={{ ...hFont, fontSize: 44, color: text, marginTop: 8, marginBottom: 20 }}>Specifications</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {specsList.map((s, i) => (
              <div key={i} style={{ padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: 13, color: text, opacity: 0.4, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.l}</div>
                <div style={{ fontSize: 24, color: text, fontWeight: 600, marginTop: 4 }}>{s.v}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ width: '50%' }}>
          <img src={getPhoto(photos, 'balcony') || getPhoto(photos, 'bedroom')} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      </div>
    );
  }

  if (pageType === 'amenities') {
    return (
      <div style={{ ...containerStyle, padding: 60, boxSizing: 'border-box' }}>
        <div style={{ color: accent, fontSize: 13, letterSpacing: '0.4em', textTransform: 'uppercase', fontWeight: 600 }}>World-Class Amenities</div>
        <div style={{ ...hFont, fontSize: 52, color: text, marginTop: 8, marginBottom: 48 }}>Lifestyle Elevated</div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
          {(content.amenities || []).slice(0, 9).map((am, i) => (
            <div key={i} style={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A', padding: '32px 24px', textAlign: 'center', borderRadius: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 160 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: accent, marginBottom: 16 }}></div>
              <div style={{ fontSize: 22, color: text, fontWeight: 500 }}>{am}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (pageType === 'location') {
    return (
      <div style={{ ...containerStyle, display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: '45%', position: 'relative' }}>
          <img src={getPhoto(photos, 'exterior') || getPhoto(photos, 'balcony')} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent, #0A0A0A)' }}></div>
        </div>
        <div style={{ height: '55%', backgroundColor: bg, padding: 52, boxSizing: 'border-box' }}>
          <div style={{ color: accent, fontSize: 13, letterSpacing: '0.4em', textTransform: 'uppercase', fontWeight: 600 }}>Prime Location</div>
          <div style={{ ...hFont, fontSize: 48, color: text, marginTop: 8, marginBottom: 32 }}>{content.locationDisplay}</div>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {content.nearby?.slice(0, 4).map((nb, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: accent }}></div>
                <div style={{ fontSize: 24, color: text, opacity: 0.7 }}>{nb}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (pageType === 'contact') {
    return (
      <div style={{ ...containerStyle, display: 'flex' }}>
        <div style={{ width: '60%', padding: 60, boxSizing: 'border-box', position: 'relative' }}>
          <div style={{ width: 48, height: 2, backgroundColor: accent, marginBottom: 32 }}></div>
          <div style={{ color: accent, fontSize: 13, letterSpacing: '0.4em', textTransform: 'uppercase', fontWeight: 600 }}>Your Private Advisor</div>
          <div style={{ ...hFont, fontSize: 56, color: text, marginTop: 12 }}>{content.brokerName || 'Real Estate Advisor'}</div>
          {content.brokerAgency && <div style={{ fontSize: 22, color: text, opacity: 0.4, marginTop: 6 }}>{content.brokerAgency}</div>}
          <div style={{ color: accent, fontSize: 28, fontWeight: 600, marginTop: 32 }}>{content.brokerPhone}</div>
          {content.brokerRera && <div style={{ fontSize: 16, color: text, opacity: 0.3, marginTop: 16 }}>RERA: {content.brokerRera}</div>}
          
          <div style={{ position: 'absolute', bottom: 40, left: 60, fontSize: 14, opacity: 0.2, color: text }}>
            Created with PropSite · propsite.pages.dev
          </div>
        </div>
        <div style={{ width: '40%', backgroundColor: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 240, height: 240, border: `2px solid ${accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#111111' }}>
            <div style={{ ...hFont, fontSize: 80, color: accent }}>
              {content.brokerName ? content.brokerName.split(' ').map(n=>n[0]).slice(0,2).join('') : 'A'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
