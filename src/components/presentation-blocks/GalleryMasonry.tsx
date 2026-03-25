import React from 'react';
import { SlideData, ThemeConfig, PresentationPhoto } from '@/lib/presentationTypes';

interface Props {
  data: SlideData;
  theme: ThemeConfig;
  photos: PresentationPhoto[];
  pageNumber?: number;
}

function findPhotos(photos: PresentationPhoto[], tags: string[]): string[] {
  if (photos.length === 0) return [];
  const urls: string[] = [];
  for (const t of tags) { const f = photos.find(p => p.tag === t && !urls.includes(p.url)); if (f) urls.push(f.url); }
  for (const p of photos) { if (!urls.includes(p.url)) urls.push(p.url); if (urls.length >= 3) break; }
  return urls;
}

export default function GalleryMasonry({ data, theme, photos, slideHeight }: Props) {
  const h = slideHeight || 1080;
  const imgs = findPhotos(photos, data.imageTags || []);

  const placeholder = (w: number, ph: number) => (
    <div style={{ width: w, height: ph, backgroundColor: theme.accentColor + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}>
      <div style={{ fontSize: '48px', opacity: 0.25 }}>🏠</div>
    </div>
  );

  const p1H = Math.round(660 * h / 1080);
  const p2H = Math.round(320 * h / 1080);
  const p3Top = Math.round(380 * h / 1080);
  const captionH = Math.round(340 * h / 1080);

  return (
    <div style={{ width: '1080px', height: `${h}px`, boxSizing: 'border-box', position: 'relative', overflow: 'hidden', fontFamily: theme.bodyFont, backgroundColor: theme.backgroundColor }}>
      <div style={{ position: 'absolute', left: '40px', top: '40px', width: '580px', height: `${p1H}px`, borderRadius: '12px', overflow: 'hidden' }}>
        {imgs[0] ? <img src={imgs[0]} alt="" crossOrigin="anonymous" style={{ position: 'absolute', top: 0, left: 0, width: '580px', height: `${p1H}px`, objectFit: 'cover', objectPosition: 'center', display: 'block', maxWidth: 'none', minWidth: '580px', minHeight: `${p1H}px` }} / style={{ objectPosition: 'center center', display: 'block' }}> : placeholder(580, p1H)}
      </div>
      <div style={{ position: 'absolute', left: '640px', top: '40px', width: '400px', height: `${p2H}px`, borderRadius: '12px', overflow: 'hidden' }}>
        {imgs[1] ? <img src={imgs[1]} alt="" crossOrigin="anonymous" style={{ position: 'absolute', top: 0, left: 0, width: '400px', height: `${p2H}px`, objectFit: 'cover', objectPosition: 'center', display: 'block', maxWidth: 'none', minWidth: '400px', minHeight: `${p2H}px` }} / style={{ objectPosition: 'center center', display: 'block' }}> : placeholder(400, p2H)}
      </div>
      <div style={{ position: 'absolute', left: '640px', top: `${p3Top}px`, width: '400px', height: `${p2H}px`, borderRadius: '12px', overflow: 'hidden' }}>
        {imgs[2] ? <img src={imgs[2]} alt="" crossOrigin="anonymous" style={{ position: 'absolute', top: 0, left: 0, width: '400px', height: `${p2H}px`, objectFit: 'cover', objectPosition: 'center', display: 'block', maxWidth: 'none', minWidth: '400px', minHeight: `${p2H}px` }} / style={{ objectPosition: 'center center', display: 'block' }}> : placeholder(400, p2H)}
      </div>
      {/* Bottom caption */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${captionH}px`, background: `linear-gradient(to top, ${theme.backgroundColor} 60%, transparent)`, padding: '0 60px', display: 'flex', alignItems: 'flex-end', paddingBottom: '48px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px' }}>
          {data.eyebrow && <span style={{ fontSize: '16px', letterSpacing: '4px', textTransform: 'uppercase' as const, color: theme.accentColor, fontWeight: 600 }}>{data.eyebrow}</span>}
          {data.eyebrow && data.headline && <span style={{ color: theme.textColor, opacity: 0.3, fontSize: '20px' }}>·</span>}
          {data.headline && <span style={{ fontSize: '36px', fontFamily: theme.headingFont, color: theme.textColor, fontWeight: 600 }}>{data.headline}</span>}
        </div>
      </div>
    </div>
  );
}
