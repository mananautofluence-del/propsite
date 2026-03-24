import React from 'react';
import { SlideData, ThemeConfig, PresentationPhoto } from '@/lib/presentationTypes';

interface Props { data: SlideData; theme: ThemeConfig; photos: PresentationPhoto[]; }

function findPhotos(photos: PresentationPhoto[], tags: string[]): string[] {
  const urls: string[] = [];
  for (const t of tags) { const f = photos.find(p => p.tag === t && !urls.includes(p.url)); if (f) urls.push(f.url); }
  for (const p of photos) { if (!urls.includes(p.url)) urls.push(p.url); if (urls.length >= 3) break; }
  return urls;
}

export default function GalleryMasonry({ data, theme, photos }: Props) {
  const imgs = findPhotos(photos, data.imageTags || []);
  return (
    <div style={{ width: '1080px', height: '1080px', boxSizing: 'border-box', position: 'relative', overflow: 'hidden', fontFamily: theme.bodyFont, backgroundColor: theme.backgroundColor }}>
      {/* Photo 1 — Large left */}
      {imgs[0] && (
        <div style={{ position: 'absolute', left: '40px', top: '40px', width: '580px', height: '660px', borderRadius: '12px', overflow: 'hidden' }}>
          <img src={imgs[0]} alt="" style={{ width: '580px', height: '660px', objectFit: 'cover', display: 'block' }} />
        </div>
      )}
      {/* Photo 2 — Top right */}
      {imgs[1] && (
        <div style={{ position: 'absolute', left: '640px', top: '40px', width: '400px', height: '320px', borderRadius: '12px', overflow: 'hidden' }}>
          <img src={imgs[1]} alt="" style={{ width: '400px', height: '320px', objectFit: 'cover', display: 'block' }} />
        </div>
      )}
      {/* Photo 3 — Bottom right */}
      {imgs[2] && (
        <div style={{ position: 'absolute', left: '640px', top: '380px', width: '400px', height: '320px', borderRadius: '12px', overflow: 'hidden' }}>
          <img src={imgs[2]} alt="" style={{ width: '400px', height: '320px', objectFit: 'cover', display: 'block' }} />
        </div>
      )}
      {/* Bottom caption */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '340px', background: `linear-gradient(to top, ${theme.backgroundColor} 60%, transparent)`, padding: '0 60px', display: 'flex', alignItems: 'flex-end', paddingBottom: '48px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
          {data.eyebrow && <span style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', color: theme.accentColor }}>{data.eyebrow}</span>}
          {data.eyebrow && data.headline && <span style={{ color: theme.textColor, opacity: 0.3, fontSize: '16px' }}>·</span>}
          {data.headline && <span style={{ fontSize: '28px', fontFamily: theme.headingFont, color: theme.textColor, fontWeight: 600 }}>{data.headline}</span>}
        </div>
      </div>
    </div>
  );
}
