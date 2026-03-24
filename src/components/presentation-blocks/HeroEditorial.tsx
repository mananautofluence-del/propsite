import React from 'react';
import { SlideData, ThemeConfig, PresentationPhoto } from '@/lib/presentationTypes';

interface Props { data: SlideData; theme: ThemeConfig; photos: PresentationPhoto[]; }

function findPhoto(photos: PresentationPhoto[], tags: string[]): string {
  for (const t of tags) { const f = photos.find(p => p.tag === t); if (f) return f.url; }
  return photos[0]?.url || '';
}

export default function HeroEditorial({ data, theme, photos }: Props) {
  const img = findPhoto(photos, data.imageTags || ['interior', 'living']);
  const stats = data.stats || [];
  return (
    <div style={{ width: '1080px', height: '1080px', boxSizing: 'border-box', position: 'relative', overflow: 'hidden', fontFamily: theme.bodyFont }}>
      {/* Left panel */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: '520px', height: '1080px', backgroundColor: theme.backgroundColor, padding: '80px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
        {data.eyebrow && <div style={{ textTransform: 'uppercase', letterSpacing: '6px', fontSize: '11px', color: theme.accentColor, fontFamily: theme.bodyFont }}>{data.eyebrow}</div>}
        {data.headline && <div style={{ fontSize: '72px', lineHeight: '0.95', fontFamily: theme.headingFont, color: theme.textColor, marginTop: '24px', marginBottom: '32px', fontWeight: 700 }}>{data.headline}</div>}
        <div style={{ width: '48px', height: '1px', backgroundColor: theme.accentColor }} />
        {data.bodyText && <div style={{ fontSize: '17px', lineHeight: '1.7', color: theme.textColor, opacity: 0.75, marginTop: '24px', maxWidth: '380px', fontFamily: theme.bodyFont }}>{data.bodyText}</div>}
        <div style={{ marginTop: 'auto', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {stats.map((s, i) => (
            <div key={i} style={{ border: `1px solid ${theme.accentColor}`, borderRadius: '999px', padding: '6px 16px', fontSize: '12px', color: theme.accentColor, fontFamily: theme.bodyFont }}>
              {s.value} {s.unit || ''} {s.label}
            </div>
          ))}
        </div>
      </div>
      {/* Right panel */}
      <div style={{ position: 'absolute', left: '520px', top: 0, width: '560px', height: '1080px', overflow: 'hidden' }}>
        {img && <img src={img} alt="" style={{ width: '560px', height: '1080px', objectFit: 'cover' }} />}
        <div style={{ position: 'absolute', left: 0, top: '80px', bottom: '80px', width: '1px', backgroundColor: theme.accentColor }} />
      </div>
    </div>
  );
}
