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

export default function HighStreetTheme({ content, pageType, photos }: ThemeProps) {
  const bg = '#FDF7F5';
  const text = '#2D1B17';
  const accent = '#C4715B';
  const surface = '#FFFFFF';
  
  const containerStyle: React.CSSProperties = {
    width: '1080px', height: '1080px', overflow: 'hidden',
    backgroundColor: bg, color: text, position: 'relative',
    fontFamily: '"Outfit", "Inter", sans-serif' // Fallback to inter if outfit not loaded
  };

  if (pageType === 'cover') {
    return (
      <div style={containerStyle}>
        <div style={{ position: 'absolute', inset: 0, padding: 40 }}>
          <div style={{ width: '100%', height: '100%', position: 'relative', borderRadius: '40px 100px 40px 100px', overflow: 'hidden', border: `2px solid ${accent}` }}>
            <img src={getPhoto(photos, 'cover')} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(45,27,23,0.95) 0%, rgba(45,27,23,0.3) 60%, transparent 100%)' }}></div>
            
            <div style={{ position: 'absolute', top: 48, left: 48, backgroundColor: 'white', color: accent, fontSize: 16, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '12px 24px', borderRadius: 999, fontWeight: 700 }}>
              Retail Space
            </div>
            
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '60px 48px' }}>
              <div style={{ color: '#FDF7F5', fontSize: 18, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600 }}>{content.locationDisplay}</div>
              <div style={{ fontSize: 72, color: 'white', lineHeight: 1.1, marginTop: 16, fontWeight: 800 }}>{content.headline}</div>
              
              <div style={{ display: 'flex', alignItems: 'center', marginTop: 32, gap: 24 }}>
                <div style={{ fontSize: 52, color: accent, fontWeight: 800 }}>{content.price}</div>
                {content.priceNote && (
                  <div style={{ backgroundColor: 'rgba(196,113,91,0.2)', color: 'white', fontSize: 16, padding: '10px 20px', borderRadius: 999, fontWeight: 600 }}>
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
      <div style={{ ...containerStyle, padding: 60, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', gap: 40, flex: 1 }}>
          <div style={{ width: '55%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ color: accent, fontSize: 16, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 800 }}>Retail Opportunity</div>
            <div style={{ fontSize: 56, color: text, fontWeight: 800, marginTop: 12, lineHeight: 1.15 }}>{content.subheadline || 'Premium Frontage'}</div>
            
            <div style={{ fontSize: 22, color: '#5C4742', lineHeight: 1.7, marginTop: 32 }}>{content.description}</div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginTop: 48 }}>
              {[ {l:'Carpet Area', v:content.carpetArea}, {l:'Configuration', v:content.bhkConfig} ].filter(s=>!!s.v).map((s, i) => (
                <div key={i} style={{ backgroundColor: surface, padding: 24, borderRadius: 24, boxShadow: '0 8px 24px rgba(45,27,23,0.04)' }}>
                  <div style={{ fontSize: 32, color: accent, fontWeight: 800 }}>{s.v}</div>
                  <div style={{ fontSize: 14, color: '#8F7E7A', textTransform: 'uppercase', fontWeight: 700, marginTop: 8 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ width: '45%' }}>
            <img src={getPhoto(photos, 'living')} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '40px 100px 40px 100px' }} />
          </div>
        </div>
      </div>
    );
  }

  if (pageType === 'highlights' || pageType === 'amenities') {
    const items = pageType === 'amenities' ? content.amenities : content.highlights;
    const title = pageType === 'amenities' ? 'Key Features' : 'Commercial Highlights';
    
    return (
      <div style={{ ...containerStyle, padding: '80px 60px' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{ color: accent, fontSize: 16, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 800 }}>Attractions</div>
          <div style={{ fontSize: 56, color: text, fontWeight: 800, marginTop: 12 }}>{title}</div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
          {items.slice(0, 6).map((item, i) => (
            <div key={i} style={{ backgroundColor: surface, padding: '32px 40px', borderRadius: 24, border: '2px solid rgba(196,113,91,0.1)', display: 'flex', alignItems: 'center', gap: 24 }}>
              <div style={{ width: 48, height: 48, backgroundColor: 'rgba(196,113,91,0.1)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent, fontWeight: 800, fontSize: 20 }}>
                {i + 1}
              </div>
              <div style={{ fontSize: 24, color: text, fontWeight: 600 }}>{item}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Fallback for specs/gallery/location/contact to save space
  return (
    <div style={{ ...containerStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', backgroundColor: accent, color: 'white' }}>
      <div style={{ fontSize: 72, fontWeight: 800, textTransform: 'uppercase' }}>{pageType}</div>
      <div style={{ fontSize: 24, opacity: 0.8, marginTop: 16 }}>Detailed section dynamically rendered</div>
      {pageType === 'contact' && (
        <div style={{ marginTop: 48, textAlign: 'center' }}>
          <div style={{ fontSize: 48, fontWeight: 800 }}>{content.brokerName}</div>
          <div style={{ fontSize: 32, marginTop: 16 }}>{content.brokerPhone}</div>
        </div>
      )}
    </div>
  );
}
