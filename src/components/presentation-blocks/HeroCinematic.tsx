import React from 'react';
import { SlideData, ThemeConfig, PresentationPhoto } from '@/lib/presentationTypes';

interface Props { data: SlideData; theme: ThemeConfig; photos: PresentationPhoto[]; slideHeight?: number; }

function findPhoto(photos: PresentationPhoto[], tags: string[]): string {
  for (const t of tags) {
    const f = photos.find(p => p.tag === t);
    if (f) return f.url;
  }
  return photos[0]?.url || '';
}

export default function HeroCinematic({ data, theme, photos, slideHeight }: Props) {
  const h = slideHeight || 1080;
  const bg = findPhoto(photos, data.imageTags?.length ? data.imageTags : ['cover', 'exterior']);
  const headlineLen = (data.headline || '').length;
  const headlineFontSize = headlineLen <= 12 ? '112px'
    : headlineLen <= 20 ? '88px'
    : headlineLen <= 30 ? '72px' : '58px';

  return (
    <div style={{
      width: '1080px', height: `${h}px`,
      boxSizing: 'border-box', position: 'relative',
      overflow: 'hidden', fontFamily: theme.bodyFont,
      backgroundColor: theme.backgroundColor,
    }}>
      {bg ? (
        <img src={bg} alt="" crossOrigin="anonymous" style={{
          position: 'absolute', top: 0, left: 0,
          width: '1080px', height: `${h}px`,
          objectFit: 'cover', objectPosition: 'center',
          display: 'block', maxWidth: 'none',
          minWidth: '1080px', minHeight: `${h}px`,
        }} />
      ) : (
        <div style={{
          position: 'absolute', inset: 0,
          background: `linear-gradient(135deg, ${theme.backgroundColor} 0%, ${theme.accentColor}55 100%)`
        }} />
      )}

      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.90) 0%, rgba(0,0,0,0.45) 45%, rgba(0,0,0,0.08) 100%)',
      }} />

      <div style={{
        position: 'absolute', top: '56px', left: '72px',
        display: 'flex', alignItems: 'center', gap: '10px',
      }}>
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: theme.accentColor }} />
        <div style={{ fontSize: '11px', letterSpacing: '4px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' as const, fontFamily: theme.bodyFont }}>PropSite</div>
      </div>

      <div style={{ position: 'absolute', bottom: '72px', left: '72px', right: '72px', zIndex: 1 }}>
        <div style={{ width: '56px', height: '2px', backgroundColor: theme.accentColor, marginBottom: '20px' }} />

        {data.eyebrow && (
          <div style={{ textTransform: 'uppercase' as const, letterSpacing: '5px', fontSize: '12px', color: theme.accentColor, marginBottom: '20px', fontFamily: theme.bodyFont, fontWeight: 500 }}>
            {data.eyebrow}
          </div>
        )}

        {data.headline && (
          <div style={{ fontSize: headlineFontSize, lineHeight: '0.93', fontFamily: theme.headingFont, color: '#FFFFFF', letterSpacing: '-0.03em', fontWeight: 700, marginBottom: '28px', textShadow: '0 2px 24px rgba(0,0,0,0.4)' }}>
            {data.headline}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '40px' }}>
          {data.subheadline && (
            <div style={{ fontSize: '19px', color: 'rgba(255,255,255,0.75)', fontFamily: theme.bodyFont, maxWidth: '520px', lineHeight: '1.55' }}>
              {data.subheadline}
            </div>
          )}
          <div style={{ flexShrink: 0, padding: '10px 22px', border: `1px solid ${theme.accentColor}77`, borderRadius: '999px', fontSize: '11px', letterSpacing: '3px', color: theme.accentColor, textTransform: 'uppercase' as const, fontFamily: theme.bodyFont, whiteSpace: 'nowrap' as const }}>
            {data.eyebrow?.split('·')[1]?.trim() || 'Estate'}
          </div>
        </div>
      </div>
    </div>
  );
}
