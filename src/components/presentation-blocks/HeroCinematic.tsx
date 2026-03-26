import React from 'react';
import { SlideData, ThemeConfig, PresentationPhoto } from '@/lib/presentationTypes';

interface Props {
  data: SlideData;
  theme: ThemeConfig;
  photos: PresentationPhoto[];
  pageNumber?: number;
}

function findPhoto(photos: PresentationPhoto[], tags: string[]): string {
  for (const t of tags) { const f = photos.find(p => p.tag === t); if (f) return f.url; }
  return photos[0]?.url || '';
}

export default function HeroCinematic({ data, theme, photos, slideHeight }: Props) {
  const h = slideHeight || 1080;
  const bg = findPhoto(photos, data.imageTags?.length ? data.imageTags : ['cover', 'exterior']);
  const hl = (data.headline || '').length;
  const headlineSize = hl <= 12 ? '120px' : hl <= 20 ? '96px' : hl <= 30 ? '80px' : '64px';

  return (
    <div style={{ width: '1080px', height: `${h}px`, boxSizing: 'border-box', position: 'relative', overflow: 'hidden', fontFamily: theme.bodyFont, backgroundColor: theme.backgroundColor }}>
      {bg ? (
        <img src={bg} alt="" crossOrigin="anonymous" style={{ position: 'absolute', top: 0, left: 0, width: '1080px', height: `${h}px`, objectFit: 'cover', objectPosition: 'center', display: 'block', maxWidth: 'none', minWidth: '1080px', minHeight: `${h}px` }} / style={{ objectPosition: 'center center', display: 'block' }}>
      ) : (
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${theme.backgroundColor} 0%, ${theme.accentColor}55 100%)` }} />
      )}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.40) 45%, rgba(0,0,0,0.05) 100%)' }} />

      {/* Top branding */}
      <div style={{ position: 'absolute', top: '48px', left: '64px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: theme.accentColor }} />
      </div>

      {/* Bottom content */}
      <div style={{ position: 'absolute', bottom: '80px', left: '72px', right: '72px', zIndex: 1 }}>
        <div style={{ width: '56px', height: '3px', backgroundColor: theme.accentColor, marginBottom: '24px' }} />

        {data.eyebrow && (
            {data.eyebrow}
          </div>
        )}

        {data.headline && (
            {data.headline}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '40px' }}>
          {data.subheadline && (
            <div style={{ fontSize: '24px', color: 'rgba(255,255,255,0.80)', fontFamily: theme.bodyFont, maxWidth: '600px', lineHeight: '1.5' }}>
              {data.subheadline}
            </div>
          )}
            {data.eyebrow?.split('·')[1]?.trim() || 'Estate'}
          </div>
        </div>
      </div>
    </div>
  );
}
