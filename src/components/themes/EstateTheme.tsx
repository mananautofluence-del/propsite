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

export default function EstateTheme({ content, pageType, photos }: ThemeProps) {
  const bg = '#F5F0E8';
  const text = '#3D3425';
  const accent = '#6B8F71';
  
  const containerStyle: React.CSSProperties = {
    width: '1080px', height: '1080px', overflow: 'hidden',
    backgroundColor: bg, color: text, position: 'relative',
    fontFamily: '"Inter", sans-serif'
  };
  
  const hFont: React.CSSProperties = { fontFamily: '"Playfair Display", serif' };

  if (pageType === 'cover') {
    return (
      <div style={containerStyle}>
        <div style={{ position: 'absolute', inset: 0, padding: 32 }}>
          <div style={{ width: '100%', height: '100%', position: 'relative', borderRadius: 24, overflow: 'hidden' }}>
            <img src={getPhoto(photos, 'cover')} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(61,52,37,0.95) 0%, rgba(61,52,37,0.4) 50%, transparent 100%)' }}></div>
            
            <div style={{ position: 'absolute', top: 32, right: 32, backgroundColor: accent, color: 'white', fontSize: 13, letterSpacing: '0.2em', textTransform: 'uppercase', padding: '12px 24px', borderRadius: 40, fontWeight: 600 }}>
              Premium Estate
            </div>
            
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 48 }}>
              <div style={{ color: '#E8E1D5', fontSize: 16, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600 }}>{content.locationDisplay}</div>
              <div style={{ ...hFont, fontSize: 68, color: 'white', lineHeight: 1.1, marginTop: 12 }}>{content.headline}</div>
              <div style={{ fontSize: 22, color: 'rgba(255,255,255,0.8)', marginTop: 12, fontWeight: 300 }}>{content.tagline}</div>
              
              <div style={{ display: 'flex', alignItems: 'center', marginTop: 32, gap: 24 }}>
                <div style={{ fontSize: 48, color: accent, fontWeight: 700 }}>{content.price}</div>
                {content.priceNote && (
                  <div style={{ border: `1px solid ${accent}`, color: 'white', fontSize: 14, padding: '8px 16px', borderRadius: 40 }}>
                    {content.priceNote}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (pageType === 'overview') {
    return (
      <div style={{ ...containerStyle, display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: '60%', position: 'relative', padding: 32, paddingBottom: 0 }}>
          <img src={getPhoto(photos, 'living')} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '24px 24px 0 0' }} />
        </div>
        <div style={{ height: '40%', backgroundColor: bg, padding: '40px 48px', boxSizing: 'border-box', display: 'flex' }}>
          <div style={{ width: '65%', paddingRight: 40 }}>
            <div style={{ color: accent, fontSize: 14, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700 }}>The Estate</div>
            <div style={{ ...hFont, fontSize: 44, color: text, marginTop: 8 }}>{content.subheadline || 'A Place to Belong'}</div>
            <div style={{ fontSize: 20, color: '#5C5446', lineHeight: 1.8, marginTop: 16 }}>{content.description}</div>
          </div>
          <div style={{ width: '35%', borderLeft: `1px solid rgba(107,143,113,0.3)`, paddingLeft: 40, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 24 }}>
            {[ {l:'Configuration', v:content.bhkConfig}, {l:'Total Area', v:content.carpetArea}, {l:'Property', v:content.propertyType} ].filter(s=>!!s.v).map((s, i) => (
              <div key={i}>
                <div style={{ fontSize: 28, color: accent, fontWeight: 700 }}>{s.v}</div>
                <div style={{ fontSize: 12, color: '#8A8173', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (pageType === 'highlights') {
    return (
      <div style={{ ...containerStyle, padding: 60, display: 'flex', flexDirection: 'column' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{ color: accent, fontSize: 14, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700 }}>Exceptional Details</div>
          <div style={{ ...hFont, fontSize: 56, color: text, marginTop: 12 }}>Property Highlights</div>
          <div style={{ width: 60, height: 2, backgroundColor: accent, margin: '24px auto 0' }}></div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, flex: 1 }}>
          {content.highlights.slice(0, 4).map((h, i) => (
            <div key={i} style={{ backgroundColor: 'white', borderRadius: 20, padding: 40, display: 'flex', flexDirection: 'column', justifyContent: 'center', boxShadow: '0 4px 20px rgba(61,52,37,0.03)' }}>
              <div style={{ width: 56, height: 56, backgroundColor: 'rgba(107,143,113,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                <div style={{ width: 16, height: 16, backgroundColor: accent, borderRadius: '50%' }}></div>
              </div>
              <div style={{ ...hFont, fontSize: 32, color: text, lineHeight: 1.3 }}>{h}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (pageType === 'gallery') {
    const pPhotos = photos.filter(p => !['cover'].includes(p.tag)).slice(0, 3);
    while (pPhotos.length < 3 && photos.length > 0) pPhotos.push(photos[0]);
    
    return (
      <div style={{ ...containerStyle, padding: 32, boxSizing: 'border-box', display: 'grid', gridTemplateColumns: '2fr 1fr', gridTemplateRows: '1fr 1fr', gap: 24 }}>
        <div style={{ gridColumn: '1 / 2', gridRow: '1 / 3', position: 'relative', borderRadius: 24, overflow: 'hidden' }}>
          <img src={pPhotos[0]?.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', bottom: 32, left: 32, backgroundColor: 'white', padding: '16px 32px', borderRadius: 40, fontSize: 18, color: text, fontWeight: 600 }}>Visual Tour</div>
        </div>
        <div style={{ gridColumn: '2 / 3', gridRow: '1 / 2', borderRadius: 24, overflow: 'hidden' }}>
          <img src={pPhotos[1]?.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div style={{ gridColumn: '2 / 3', gridRow: '2 / 3', borderRadius: 24, overflow: 'hidden' }}>
          <img src={pPhotos[2]?.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
        <div style={{ color: accent, fontSize: 14, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700 }}>Specifications</div>
        <div style={{ ...hFont, fontSize: 48, color: text, marginTop: 8, marginBottom: 40 }}>The Details</div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'x: 60px, y: 32px', columnGap: 60, rowGap: 32 }}>
          {specsList.map((s, i) => (
            <div key={i} style={{ borderBottom: '1px solid rgba(61,52,37,0.1)', paddingBottom: 16 }}>
              <div style={{ fontSize: 13, color: '#8A8173', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.l}</div>
              <div style={{ fontSize: 24, color: text, fontWeight: 600, marginTop: 8 }}>{s.v}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (pageType === 'amenities') {
    return (
      <div style={{ ...containerStyle, display: 'flex' }}>
        <div style={{ width: '40%' }}>
          <img src={getPhoto(photos, 'amenity') || getPhoto(photos, 'exterior')} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div style={{ width: '60%', padding: '80px 60px', boxSizing: 'border-box', backgroundColor: 'white' }}>
          <div style={{ color: accent, fontSize: 14, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700 }}>Lifestyle</div>
          <div style={{ ...hFont, fontSize: 48, color: text, marginTop: 8, marginBottom: 48 }}>Amenities</div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {content.amenities.slice(0, 8).map((am, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: accent }}></div>
                <div style={{ fontSize: 26, color: text, fontWeight: 400 }}>{am}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (pageType === 'location') {
    return (
      <div style={{ ...containerStyle, display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: '50%', position: 'relative', padding: '32px 32px 0 32px' }}>
          <img src={getPhoto(photos, 'exterior') || getPhoto(photos, 'cover')} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '24px 24px 0 0' }} />
        </div>
        <div style={{ height: '50%', backgroundColor: bg, padding: '40px 60px', boxSizing: 'border-box' }}>
          <div style={{ color: accent, fontSize: 14, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700 }}>Neighbourhood</div>
          <div style={{ ...hFont, fontSize: 48, color: text, marginTop: 8, marginBottom: 32 }}>{content.locationDisplay}</div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {content.nearby?.slice(0, 4).map((nb, i) => (
              <div key={i} style={{ backgroundColor: 'white', padding: '24px 32px', borderRadius: 16, fontSize: 20, color: text, fontWeight: 500, boxShadow: '0 4px 12px rgba(61,52,37,0.02)' }}>
                {nb}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (pageType === 'contact') {
    return (
      <div style={{ ...containerStyle, padding: 32, boxSizing: 'border-box' }}>
        <div style={{ height: '100%', backgroundColor: 'white', borderRadius: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 60 }}>
          <div style={{ width: 160, height: 160, borderRadius: '50%', backgroundColor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 40 }}>
            <div style={{ ...hFont, fontSize: 64, color: accent }}>
              {content.brokerName ? content.brokerName.split(' ').map(n=>n[0]).slice(0,2).join('') : 'AE'}
            </div>
          </div>
          
          <div style={{ color: accent, fontSize: 14, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700 }}>To Schedule a Viewing</div>
          <div style={{ ...hFont, fontSize: 56, color: text, marginTop: 16 }}>{content.brokerName || 'Estate Advisor'}</div>
          {content.brokerAgency && <div style={{ fontSize: 22, color: '#8A8173', marginTop: 8 }}>{content.brokerAgency}</div>}
          
          <div style={{ width: 80, height: 2, backgroundColor: accent, margin: '40px auto' }}></div>
          
          <div style={{ fontSize: 40, color: text, fontWeight: 700 }}>{content.brokerPhone}</div>
          {content.brokerRera && <div style={{ fontSize: 16, color: '#8A8173', marginTop: 12 }}>RERA: {content.brokerRera}</div>}
        </div>
      </div>
    );
  }

  return null;
}
