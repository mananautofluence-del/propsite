import React from 'react';
import { SlideData, ThemeConfig, PresentationPhoto } from '@/lib/presentationTypes';

interface Props { data: SlideData; theme: ThemeConfig; photos: PresentationPhoto[]; slideHeight?: number; }

function findPhoto(photos: PresentationPhoto[], tags: string[]): string {
  for (const t of tags) { const f = photos.find(p => p.tag === t); if (f) return f.url; }
  return photos[0]?.url || '';
}

export default function MagazineSplit({ data, theme, photos, slideHeight }: Props) {
  const h = slideHeight || 1080;
  const img = findPhoto(photos, data.imageTags || ['exterior', 'living']);
  const bodyLen = (data.bodyText || '').length;
  const bodyFontSize = bodyLen > 300 ? '18px' : '22px';
  const bullets = data.bulletPoints || [];

  return (
    <div style={{ width: '1080px', height: `${h}px`, boxSizing: 'border-box', position: 'relative', overflow: 'hidden', fontFamily: theme.bodyFont }}>
      {/* Left — image */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: '540px', height: `${h}px`, overflow: 'hidden' }}>
        {img && <img src={img} alt="" crossOrigin="anonymous" style={{ position: 'absolute', top: 0, left: 0, width: '540px', height: `${h}px`, objectFit: 'cover', objectPosition: 'center', display: 'block', maxWidth: 'none', minWidth: '540px', minHeight: `${h}px` }} />}
      </div>
      {/* Accent line */}
      <div style={{ position: 'absolute', left: '540px', top: 0, width: '3px', height: `${h}px`, backgroundColor: theme.accentColor, zIndex: 2 }} />
      {/* Right — text */}
      <div style={{ position: 'absolute', left: '540px', top: 0, width: '540px', height: `${h}px`, backgroundColor: theme.backgroundColor, padding: '80px 56px', boxSizing: 'border-box', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div>
          {data.eyebrow && <div style={{ fontSize: '16px', letterSpacing: '4px', textTransform: 'uppercase' as const, color: theme.accentColor, marginBottom: '12px', fontWeight: 600 }}>{data.eyebrow}</div>}
          {data.headline && <div style={{ fontSize: '64px', fontFamily: theme.headingFont, color: theme.textColor, marginTop: '16px', lineHeight: '1.05', fontWeight: 700 }}>{data.headline}</div>}
          <div style={{ width: '48px', height: '2px', backgroundColor: theme.accentColor, marginTop: '28px', marginBottom: '28px' }} />
          {data.bodyText && <div style={{ fontSize: bodyFontSize, fontFamily: theme.bodyFont, lineHeight: '1.7', color: theme.textColor, opacity: 0.75, maxWidth: '420px' }}>{data.bodyText}</div>}
        </div>
        {bullets.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: '36px' }}>
            {bullets.map((bp, i) => (
              <div key={i}>
                {i > 0 && <div style={{ height: '1px', backgroundColor: theme.textColor, opacity: 0.1 }} />}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 0' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: theme.accentColor, flexShrink: 0 }} />
                  <div style={{ fontSize: '18px', fontFamily: theme.bodyFont, color: theme.textColor, opacity: 0.8, lineHeight: '1.4' }}>{bp}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
