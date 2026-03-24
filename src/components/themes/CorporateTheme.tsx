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

export default function CorporateTheme({ content, pageType, photos }: ThemeProps) {
  const bg = '#0F172A';
  const surface = '#1E293B';
  const text = '#F8FAFC';
  const textMuted = '#94A3B8';
  const accent = '#3B82F6';
  
  const containerStyle: React.CSSProperties = {
    width: '1080px', height: '1080px', overflow: 'hidden',
    backgroundColor: bg, color: text, position: 'relative',
    fontFamily: '"Inter", sans-serif'
  };

  if (pageType === 'cover') {
    return (
      <div style={containerStyle}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.4 }}>
          <img src={getPhoto(photos, 'cover')} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #0F172A 0%, rgba(15,23,42,0.6) 100%)' }}></div>
        </div>
        
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 8, backgroundColor: accent }}></div>
        
        <div style={{ position: 'absolute', top: 60, left: 60, border: `1px solid ${accent}`, color: accent, fontSize: 14, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '10px 24px', fontWeight: 700 }}>
          Commercial Grade
        </div>
        
        <div style={{ position: 'absolute', bottom: 60, left: 60, right: 60 }}>
          <div style={{ color: accent, fontSize: 18, textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.1em' }}>{content.locationDisplay}</div>
          <div style={{ fontSize: 72, color: 'white', lineHeight: 1.1, marginTop: 16, fontWeight: 900, textTransform: 'uppercase' }}>{content.headline}</div>
          <div style={{ fontSize: 24, color: textMuted, marginTop: 16, fontWeight: 400, maxWidth: '80%' }}>{content.tagline}</div>
          
          <div style={{ display: 'flex', alignItems: 'center', marginTop: 40, gap: 32 }}>
            <div style={{ backgroundColor: accent, color: 'white', padding: '16px 32px', fontSize: 40, fontWeight: 800 }}>
              {content.price}
            </div>
            {content.priceNote && (
              <div style={{ color: textMuted, fontSize: 18, fontWeight: 600 }}>
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
      <div style={{ ...containerStyle, padding: 60, boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', gap: 40, height: '100%' }}>
          <div style={{ width: '45%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ color: accent, fontSize: 16, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 800 }}>Executive Overview</div>
            <div style={{ fontSize: 48, color: 'white', fontWeight: 800, marginTop: 16, lineHeight: 1.2 }}>{content.subheadline || 'Property Details'}</div>
            
            <div style={{ backgroundColor: surface, padding: 32, marginTop: 40, borderLeft: `4px solid ${accent}` }}>
              <div style={{ fontSize: 20, color: textMuted, lineHeight: 1.7 }}>{content.description}</div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 40 }}>
              {[ {l:'Type', v:content.propertyType}, {l:'Area', v:content.carpetArea} ].filter(s=>!!s.v).map((s, i) => (
                <div key={i}>
                  <div style={{ fontSize: 14, color: textMuted, textTransform: 'uppercase', fontWeight: 700 }}>{s.l}</div>
                  <div style={{ fontSize: 28, color: 'white', fontWeight: 800, marginTop: 8 }}>{s.v}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ width: '55%', position: 'relative' }}>
            <img src={getPhoto(photos, 'living')} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', bottom: 32, right: 32, backgroundColor: bg, padding: '16px 24px', borderLeft: `4px solid ${accent}`, color: 'white', fontWeight: 700 }}>
              Prime Asset
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (pageType === 'gallery') {
    const pPhotos = photos.filter(p => !['cover'].includes(p.tag)).slice(0, 4);
    while (pPhotos.length < 4 && photos.length > 0) pPhotos.push(photos[0]);
    
    return (
      <div style={{ ...containerStyle, padding: 60, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 }}>
          <div>
            <div style={{ color: accent, fontSize: 16, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 800 }}>Visual Perspective</div>
            <div style={{ fontSize: 56, color: 'white', fontWeight: 900, marginTop: 8, textTransform: 'uppercase' }}>Property Gallery</div>
          </div>
          <div style={{ width: 120, height: 4, backgroundColor: accent }}></div>
        </div>
        
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 24 }}>
          {pPhotos.map((p, i) => (
            <div key={i} style={{ position: 'relative', overflow: 'hidden', borderBottom: `4px solid ${accent}` }}>
              <img src={p.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
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
      <div style={{ ...containerStyle, padding: 60, display: 'flex', flexDirection: 'column' }}>
        <div style={{ color: accent, fontSize: 16, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 800 }}>Technical Data</div>
        <div style={{ fontSize: 56, color: 'white', fontWeight: 900, marginTop: 8, marginBottom: 48, textTransform: 'uppercase' }}>Specifications</div>
        
        <div style={{ backgroundColor: surface, padding: 48, flex: 1, borderTop: `4px solid ${accent}` }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
            {specsList.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid rgba(255,255,255,0.1)`, paddingBottom: 16 }}>
                <div style={{ fontSize: 16, color: textMuted, textTransform: 'uppercase', fontWeight: 600 }}>{s.l}</div>
                <div style={{ fontSize: 24, color: 'white', fontWeight: 700 }}>{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (pageType === 'amenities' || pageType === 'highlights') {
    const items = pageType === 'amenities' ? content.amenities : content.highlights;
    const title = pageType === 'amenities' ? 'Infrastructure' : 'Key Advantages';
    
    return (
      <div style={{ ...containerStyle, padding: 60, display: 'flex' }}>
        <div style={{ width: '40%', paddingRight: 40, borderRight: `1px solid rgba(255,255,255,0.1)`, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ color: accent, fontSize: 16, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 800 }}>Features</div>
          <div style={{ fontSize: 56, color: 'white', fontWeight: 900, marginTop: 16, lineHeight: 1.1, textTransform: 'uppercase' }}>{title}</div>
          <div style={{ width: 60, height: 4, backgroundColor: accent, marginTop: 32 }}></div>
        </div>
        <div style={{ width: '60%', paddingLeft: 60, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 24 }}>
          {items.slice(0, 7).map((item, i) => (
            <div key={i} style={{ backgroundColor: surface, padding: '24px 32px', display: 'flex', alignItems: 'center', gap: 24, borderLeft: `4px solid ${i % 2 === 0 ? accent : textMuted}` }}>
              <div style={{ fontSize: 20, color: accent, fontWeight: 900 }}>{String(i + 1).padStart(2, '0')}</div>
              <div style={{ fontSize: 24, color: 'white', fontWeight: 600 }}>{item}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (pageType === 'location') {
    return (
      <div style={{ ...containerStyle, padding: 60, display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: '50%', backgroundColor: surface, padding: 48, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ color: accent, fontSize: 16, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 800 }}>Strategic Location</div>
          <div style={{ fontSize: 64, color: 'white', fontWeight: 900, marginTop: 16, textTransform: 'uppercase' }}>{content.locationDisplay}</div>
          
          <div style={{ display: 'flex', gap: 24, marginTop: 40 }}>
            {content.nearby?.slice(0, 3).map((nb, i) => (
              <div key={i} style={{ border: `1px solid ${accent}`, color: accent, padding: '16px 24px', fontSize: 20, fontWeight: 700 }}>
                {nb}
              </div>
            ))}
          </div>
        </div>
        <div style={{ height: '50%', position: 'relative', marginTop: 24 }}>
          <img src={getPhoto(photos, 'exterior') || getPhoto(photos, 'balcony')} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      </div>
    );
  }

  if (pageType === 'contact') {
    return (
      <div style={{ ...containerStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 60 }}>
        <div style={{ backgroundColor: surface, width: '100%', padding: '80px 60px', borderTop: `8px solid ${accent}`, textAlign: 'center' }}>
          <div style={{ width: 120, height: 120, borderRadius: '50%', backgroundColor: bg, color: accent, fontSize: 48, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px' }}>
            {content.brokerName ? content.brokerName.split(' ').map(n=>n[0]).slice(0,2).join('') : 'AG'}
          </div>
          
          <div style={{ color: textMuted, fontSize: 16, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 800 }}>Contact Representative</div>
          <div style={{ fontSize: 56, color: 'white', fontWeight: 900, marginTop: 16, textTransform: 'uppercase' }}>{content.brokerName || 'Corporate Sales'}</div>
          {content.brokerAgency && <div style={{ fontSize: 24, color: accent, marginTop: 12, fontWeight: 700 }}>{content.brokerAgency}</div>}
          
          <div style={{ marginTop: 48, backgroundColor: bg, display: 'inline-block', padding: '24px 48px', fontSize: 40, color: 'white', fontWeight: 800 }}>
            {content.brokerPhone}
          </div>
          
          {content.brokerRera && <div style={{ fontSize: 16, color: textMuted, marginTop: 24 }}>RERA: {content.brokerRera}</div>}
        </div>
        
        <div style={{ marginTop: 40, fontSize: 14, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Generated by PropSite Commercial
        </div>
      </div>
    );
  }

  return null;
}
