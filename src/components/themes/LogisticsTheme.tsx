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

export default function LogisticsTheme({ content, pageType, photos }: ThemeProps) {
  const bg = '#FFFBEB';
  const surface = '#FFFFFF';
  const text = '#1E293B';
  const accent = '#F59E0B'; // Amber
  
  const containerStyle: React.CSSProperties = {
    width: '1080px', height: '1080px', overflow: 'hidden',
    backgroundColor: bg, color: text, position: 'relative',
    fontFamily: '"Inter", sans-serif'
  };

  if (pageType === 'cover') {
    return (
      <div style={{ ...containerStyle, display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: '60%', position: 'relative' }}>
          <img src={getPhoto(photos, 'cover')} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 16, backgroundColor: accent }}></div>
          <div style={{ position: 'absolute', top: 40, right: 40, backgroundColor: 'white', color: text, fontSize: 16, fontWeight: 800, padding: '12px 24px', boxShadow: '4px 4px 0 rgba(0,0,0,1)' }}>
            LOGISTICS / INDUSTRIAL
          </div>
        </div>
        
        <div style={{ height: '40%', padding: '48px 60px', boxSizing: 'border-box', backgroundColor: surface, position: 'relative' }}>
          <div style={{ color: '#64748B', fontSize: 20, fontWeight: 800, textTransform: 'uppercase' }}>{content.locationDisplay}</div>
          <div style={{ fontSize: 64, color: text, fontWeight: 900, marginTop: 12, lineHeight: 1.1, textTransform: 'uppercase' }}>{content.headline}</div>
          
          <div style={{ position: 'absolute', bottom: 48, right: 60, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
             <div style={{ fontSize: 56, color: text, fontWeight: 900 }}>{content.price}</div>
             {content.priceNote && <div style={{ fontSize: 18, color: '#64748B', fontWeight: 700 }}>{content.priceNote}</div>}
          </div>
        </div>
      </div>
    );
  }

  // Simplified fallback for other pages to save logic size
  return (
    <div style={{ ...containerStyle, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '60px 60px 40px', backgroundColor: accent, color: text }}>
        <div style={{ fontSize: 24, fontWeight: 900, textTransform: 'uppercase' }}>{pageType} Section</div>
        <div style={{ fontSize: 64, fontWeight: 900, textTransform: 'uppercase', marginTop: 8 }}>{content.subheadline || content.headline}</div>
      </div>
      <div style={{ flex: 1, padding: 60, backgroundColor: bg }}>
        {pageType === 'overview' && <div style={{ fontSize: 32, fontWeight: 600 }}>{content.description}</div>}
        {pageType === 'contact' && (
          <div>
            <div style={{ fontSize: 48, fontWeight: 900 }}>{content.brokerName}</div>
            <div style={{ fontSize: 32, fontWeight: 700, marginTop: 16 }}>{content.brokerPhone}</div>
          </div>
        )}
      </div>
    </div>
  );
}
