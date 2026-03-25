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

export default function MagazineSplit({ data, theme, photos, slideHeight }: Props) {
  const h = slideHeight || 1080;
  const img = findPhoto(photos, data.imageTags || ['exterior', 'living']);
  const bodyLen = (data.bodyText || '').length;
  const bodyFontSize = bodyLen > 300 ? '13px' : '15px';
  const bullets = data.bulletPoints || [];
  return (
    <div style={{ width: '1080px', height: `${h}px`, boxSizing: 'border-box', position: 'relative', overflow: 'hidden', fontFamily: theme.bodyFont }}>
      {/* Left — image */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: '540px', height: `${h}px`, overflow: 'hidden' }}>
        {img && <img src={img} alt="" crossOrigin="anonymous" style={{
          position: 'absolute', top: 0, left: 0,
          width: '540px', height: `${h}px`,
          objectFit: 'cover', objectPosition: 'center',
          display: 'block', maxWidth: 'none',
          minWidth: '540px', minHeight: `${h}px`,
        }} />}
      </div>
      {/* Accent line */}
      <div style={{ position: 'absolute', left: '540px', top: 0, width: '3px', height: `${h}px`, backgroundColor: theme.accentColor, zIndex: 2 }} />
      {/* Right — text */}
      <div style={{ position: 'absolute', left: '540px', top: 0, width: '540px', height: `${h}px`, backgroundColor: theme.backgroundColor, padding: '80px 64px', boxSizing: 'border-box', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          {data.eyebrow && <div style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase' as const, color: theme.accentColor, marginBottom: '8px' }}>{data.eyebrow}</div>}
          {data.headline && <div style={{ fontSize: '52px', fontFamily: theme.headingFont, color: theme.textColor, marginTop: '16px', lineHeight: '1.05', fontWeight: 700 }}>{data.headline}</div>}
          <div style={{ width: '48px', height: '1px', backgroundColor: theme.accentColor, marginTop: '24px', marginBottom: '24px' }} />
          {data.bodyText && <div style={{ fontSize: bodyFontSize, fontFamily: theme.bodyFont, lineHeight: '1.75', color: theme.textColor, opacity: 0.7, maxWidth: '380px' }}>{data.bodyText}</div>}
        </div>
        {bullets.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {bullets.map((bp, i) => (
              <div key={i}>
                {i > 0 && <div style={{ height: '1px', backgroundColor: theme.textColor, opacity: 0.1 }} />}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: theme.accentColor, flexShrink: 0 }} />
                  <div style={{ fontSize: '13px', fontFamily: theme.bodyFont, color: theme.textColor, opacity: 0.8 }}>{bp}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
