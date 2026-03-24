import React from 'react';
import { SlideData, ThemeConfig, PresentationPhoto } from '@/lib/presentationTypes';

interface Props { data: SlideData; theme: ThemeConfig; photos: PresentationPhoto[]; }

function findPhoto(photos: PresentationPhoto[], tags: string[]): string {
  for (const t of tags) { const f = photos.find(p => p.tag === t); if (f) return f.url; }
  return photos[0]?.url || '';
}

export default function HeroCinematic({ data, theme, photos }: Props) {
  const bg = findPhoto(photos, data.imageTags || ['cover', 'exterior']);
  return (
    <div style={{ width: '1080px', height: '1080px', boxSizing: 'border-box', position: 'relative', overflow: 'hidden', fontFamily: theme.bodyFont }}>
      {bg && <img src={bg} alt="" style={{ position: 'absolute', top: 0, left: 0, width: '1080px', height: '1080px', objectFit: 'cover' }} />}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.1) 100%)' }} />
      <div style={{ position: 'absolute', bottom: '80px', left: '80px', right: '80px', zIndex: 1 }}>
        <div style={{ width: '48px', height: '1px', backgroundColor: theme.accentColor, marginBottom: '16px' }} />
        {data.eyebrow && <div style={{ textTransform: 'uppercase', letterSpacing: '6px', fontSize: '11px', color: theme.accentColor, marginBottom: '16px', fontFamily: theme.bodyFont }}>{data.eyebrow}</div>}
        {data.headline && <div style={{ fontSize: '88px', lineHeight: '0.92', fontFamily: theme.headingFont, color: '#FFFFFF', letterSpacing: '-0.03em', fontWeight: 700, marginBottom: '24px' }}>{data.headline}</div>}
        {data.subheadline && <div style={{ fontSize: '18px', color: 'rgba(255,255,255,0.75)', fontFamily: theme.bodyFont, maxWidth: '480px', lineHeight: '1.5' }}>{data.subheadline}</div>}
      </div>
    </div>
  );
}
