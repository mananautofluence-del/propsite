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

export default function SignatureTheme({ content, pageType, photos }: ThemeProps) {
  const bg = '#FFFFFF';
  const text = '#111111';
  const accent = '#1A5C3A';
  
  const containerStyle: React.CSSProperties = {
    width: '1080px', height: '1080px', overflow: 'hidden',
    backgroundColor: bg, color: text, position: 'relative',
    fontFamily: '"Inter", sans-serif'
  };

  if (pageType === 'cover') {
    return (
      <div style={containerStyle}>
        <div style={{ height: '100%', width: '100%', position: 'absolute', top: 0, left: 0 }}>
          <img src={getPhoto(photos, 'cover')} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.4) 40%, transparent 100%)' }}></div>
        </div>
        
        <div style={{ position: 'absolute', top: 40, right: 0, backgroundColor: accent, color: 'white', fontSize: 13, letterSpacing: '0.3em', textTransform: 'uppercase', padding: '10px 20px', fontWeight: 700, borderRadius: '12px 0 0 12px' }}>
          Exclusive
        </div>
        
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 48, backgroundColor: 'white' }}>
          <div style={{ color: accent, fontSize: 14, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>{content.locationDisplay}</div>
          <div style={{ fontSize: 60, color: text, lineHeight: 1.1, marginTop: 8, fontWeight: 800 }}>{content.headline}</div>
          
          <div style={{ display: 'flex', gap: 24, marginTop: 20 }}>
            {[{v: content.bhkConfig, l: 'Config'}, {v: content.carpetArea, l: 'Area'}, {v: content.propertyType, l: 'Type'}].filter(s => !!s.v).map((s, i) => (
              <div key={i} style={{ borderLeft: `3px solid ${accent}`, paddingLeft: 12 }}>
                <div style={{ fontSize: 24, color: accent, fontWeight: 700 }}>{s.v}</div>
                <div style={{ fontSize: 12, color: '#888888', textTransform: 'uppercase', fontWeight: 600 }}>{s.l}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 24 }}>
            <div style={{ fontSize: 52, color: text, fontWeight: 800 }}>{content.price}</div>
            {content.priceNote && (
              <div style={{ backgroundColor: '#EAF3ED', color: accent, fontSize: 13, padding: '6px 14px', borderRadius: 6, fontWeight: 600 }}>
                {content.priceNote}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (pageType === 'overview') {
    return (
      <div style={{ ...containerStyle, display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: '55%', position: 'relative' }}>
          <img src={getPhoto(photos, 'living')} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.9))' }}></div>
        </div>
        <div style={{ height: '45%', backgroundColor: 'white', padding: 48, boxSizing: 'border-box' }}>
          <div style={{ color: accent, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>Property Overview</div>
          <div style={{ fontSize: 44, color: text, fontWeight: 700, marginTop: 8 }}>{content.subheadline || 'Key Details'}</div>
          <div style={{ fontSize: 22, color: '#444444', lineHeight: 1.8, marginTop: 16 }}>{content.description}</div>
          
          <div style={{ display: 'flex', gap: 16, marginTop: 32 }}>
            {[{v: content.bhkConfig}, {v: content.carpetArea}, {v: content.facing}].filter(s => !!s.v).slice(0, 3).map((s, i) => (
              <div key={i} style={{ backgroundColor: '#F5F5F5', borderRadius: 999, padding: '12px 24px', display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontSize: 24, fontWeight: 700, color: text }}>{s.v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (pageType === 'highlights') {
    return (
      <div style={{ ...containerStyle, display: 'flex' }}>
        <div style={{ width: 8, height: '100%', backgroundColor: accent }}></div>
        <div style={{ padding: '60px 60px 60px 72px', flex: 1 }}>
          <div style={{ color: accent, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>Key Highlights</div>
          <div style={{ fontSize: 52, color: text, fontWeight: 800, marginBottom: 48, marginTop: 8 }}>What Makes It Special</div>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {(content.highlights || []).slice(0, 5).map((h, i) => (
              <div key={i} style={{ padding: '24px 0', borderBottom: '1px solid #F0F0F0', display: 'flex', gap: 24, alignItems: 'center' }}>
                <div style={{ width: 48, height: 48, backgroundColor: '#EAF3ED', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <div style={{ fontSize: 26, color: text, fontWeight: 500, lineHeight: 1.4 }}>{h}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (pageType === 'gallery') {
    const pPhotos = photos.filter(p => !['cover'].includes(p.tag)).slice(0, 4);
    while (pPhotos.length < 4 && photos.length > 0) pPhotos.push(photos[0]);
    
    return (
      <div style={{ ...containerStyle, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '48px 48px 24px' }}>
          <div style={{ color: accent, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>Gallery</div>
          <div style={{ fontSize: 44, color: text, fontWeight: 700, marginTop: 4 }}>A Visual Tour</div>
        </div>
        <div style={{ flex: 1, padding: '0 48px 48px 48px', display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 8 }}>
          {pPhotos.slice(0, 4).map((p, i) => (
            <img key={i} src={p.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }} />
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
        <div style={{ width: '50%', backgroundColor: '#F8F8F8', padding: 60, boxSizing: 'border-box' }}>
          <div style={{ color: accent, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>Specifications</div>
          <div style={{ fontSize: 40, color: text, fontWeight: 700, marginTop: 8, marginBottom: 24 }}>Property Details</div>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {specsList.map((s, i) => (
              <div key={i} style={{ padding: '18px 0', borderBottom: '1px solid #EFEFEF', display: 'flex' }}>
                <div style={{ fontSize: 15, color: '#888888', width: '40%' }}>{s.l}</div>
                <div style={{ fontSize: 20, color: text, fontWeight: 600, width: '60%' }}>{s.v}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ width: '50%' }}>
          <img src={getPhoto(photos, 'bedroom') || getPhoto(photos, 'bathroom')} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      </div>
    );
  }

  if (pageType === 'amenities') {
    return (
      <div style={{ ...containerStyle, padding: 60, boxSizing: 'border-box' }}>
        <div style={{ color: accent, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>Amenities</div>
        <div style={{ fontSize: 48, color: text, fontWeight: 700, marginTop: 8, marginBottom: 40 }}>Included Features</div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
          {(content.amenities || []).slice(0, 9).map((am, i) => (
            <div key={i} style={{ backgroundColor: '#F8F8F8', borderRadius: 12, padding: '28px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: accent, marginBottom: 12 }}></div>
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
        <div style={{ height: '40%', position: 'relative' }}>
          <img src={getPhoto(photos, 'exterior') || getPhoto(photos, 'balcony')} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div style={{ height: '60%', backgroundColor: 'white', padding: 52, boxSizing: 'border-box' }}>
          <div style={{ width: 60, height: 3, backgroundColor: accent, marginBottom: 24 }}></div>
          <div style={{ color: accent, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>Location</div>
          <div style={{ fontSize: 48, color: text, fontWeight: 700, marginTop: 8, marginBottom: 32 }}>{content.locationDisplay}</div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {content.nearby?.slice(0, 4).map((nb, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: accent }}></div>
                <div style={{ fontSize: 24, color: '#444444' }}>{nb}</div>
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
          <div style={{ color: accent, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>Your Advisor</div>
          <div style={{ fontSize: 56, color: text, fontWeight: 800, marginTop: 8 }}>{content.brokerName || 'Estate Advisor'}</div>
          {content.brokerAgency && <div style={{ fontSize: 22, color: '#888888', marginTop: 4 }}>{content.brokerAgency}</div>}
          
          <div style={{ backgroundColor: '#EAF3ED', borderRadius: 12, padding: 32, marginTop: 40 }}>
            <div style={{ color: accent, fontSize: 32, fontWeight: 700 }}>{content.brokerPhone}</div>
            {content.brokerRera && <div style={{ fontSize: 16, color: accent, opacity: 0.6, marginTop: 8, fontWeight: 600 }}>RERA: {content.brokerRera}</div>}
          </div>
          
          <div style={{ position: 'absolute', bottom: 40, left: 60, fontSize: 14, color: '#888888' }}>
            Created with PropSite · propsite.pages.dev
          </div>
        </div>
        <div style={{ width: '40%', backgroundColor: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 200, height: 200, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#EBEBEB', border: `3px solid ${accent}` }}>
            <div style={{ fontSize: 72, color: accent, fontWeight: 800 }}>
              {content.brokerName ? content.brokerName.split(' ').map(n=>n[0]).slice(0,2).join('') : 'A'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
