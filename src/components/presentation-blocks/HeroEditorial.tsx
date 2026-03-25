import React from 'react';
import { SlideData, ThemeConfig, PresentationPhoto } from '@/lib/presentationTypes';

interface Props { data: SlideData; theme: ThemeConfig; photos: PresentationPhoto[]; slideHeight?: number; }

function findPhoto(photos: PresentationPhoto[], tags: string[]): string {
  for (const t of tags) { const f = photos.find(p => p.tag === t); if (f) return f.url; }
  return photos[0]?.url || '';
}

export default function HeroEditorial({ data, theme, photos, slideHeight }: Props) {
  const h = slideHeight || 1080;
  const img = findPhoto(photos, data.imageTags || ['interior', 'living']);
  const stats = data.stats || [];
  const hl = (data.headline || '').length;
  const headlineSize = hl <= 15 ? '84px' : hl <= 25 ? '68px' : '54px';

  return (
    <div style={{ width: '1080px', height: `${h}px`, boxSizing: 'border-box', position: 'relative', overflow: 'hidden', fontFamily: theme.bodyFont }}>
      {/* Left panel */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: '520px', height: `${h}px`, backgroundColor: theme.backgroundColor, padding: '80px 72px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
        {data.eyebrow && <div style={{ textTransform: 'uppercase' as const, letterSpacing: '5px', fontSize: '16px', color: theme.accentColor, fontFamily: theme.bodyFont, fontWeight: 600 }}>{data.eyebrow}</div>}
        {data.headline && <div style={{ fontSize: headlineSize, lineHeight: '0.95', fontFamily: theme.headingFont, color: theme.textColor, marginTop: '28px', marginBottom: '36px', fontWeight: 700 }}>{data.headline}</div>}
        <div style={{ width: '48px', height: '2px', backgroundColor: theme.accentColor }} />
        {data.bodyText && <div style={{ fontSize: '22px', lineHeight: '1.65', color: theme.textColor, opacity: 0.75, marginTop: '28px', maxWidth: '380px', fontFamily: theme.bodyFont }}>{data.bodyText}</div>}
        <div style={{ marginTop: 'auto', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {stats.map((s, i) => (
            <div key={i} style={{ border: `1px solid ${theme.accentColor}`, borderRadius: '999px', padding: '8px 20px', fontSize: '15px', color: theme.accentColor, fontFamily: theme.bodyFont, fontWeight: 500 }}>
              {s.value} {s.unit || ''} {s.label}
            </div>
          ))}
        </div>
      </div>
      {/* Right panel */}
      <div style={{ position: 'absolute', left: '520px', top: 0, width: '560px', height: `${h}px`, overflow: 'hidden' }}>
        {img && <img src={img} alt="" crossOrigin="anonymous" style={{ position: 'absolute', top: 0, left: 0, width: '560px', height: `${h}px`, objectFit: 'cover', objectPosition: 'center', display: 'block', maxWidth: 'none', minWidth: '560px', minHeight: `${h}px` }} />}
        <div style={{ position: 'absolute', left: 0, top: '80px', bottom: '80px', width: '2px', backgroundColor: theme.accentColor }} />
      </div>
    </div>
  );
}
