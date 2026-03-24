import React from 'react';
import { SlideData, ThemeConfig, PresentationPhoto } from '@/lib/presentationTypes';

interface Props {
  data: SlideData;
  theme: ThemeConfig;
  photos: PresentationPhoto[];
}

function findPhoto(photos: PresentationPhoto[], tags: string[]): string {
  for (const tag of tags) {
    const found = photos.find(p => p.tag === tag);
    if (found) return found.url;
  }
  return photos[0]?.url || '';
}

export default function HeroCover({ data, theme, photos }: Props) {
  const bgImage = findPhoto(photos, data.imageTags || ['cover']);

  return (
    <div style={{
      width: 1080, height: 1080, overflow: 'hidden',
      position: 'relative', backgroundColor: theme.backgroundColor,
      fontFamily: theme.bodyFont
    }}>
      {/* Background Image */}
      {bgImage && (
        <img
          src={bgImage}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }}
        />
      )}
      {/* Dark Gradient Overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.15) 100%)'
      }} />

      {/* Content */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '60px 64px', zIndex: 10,
        display: 'flex', flexDirection: 'column', gap: 16
      }}>
        {data.subheadline && (
          <div style={{
            color: theme.accentColor,
            fontSize: 20, fontWeight: 700,
            letterSpacing: '0.15em', textTransform: 'uppercase',
            fontFamily: theme.bodyFont
          }}>
            {data.subheadline}
          </div>
        )}
        {data.headline && (
          <div style={{
            color: '#FFFFFF',
            fontSize: 72, fontWeight: 800, lineHeight: 1.05,
            fontFamily: theme.headingFont,
            maxWidth: 900
          }}>
            {data.headline}
          </div>
        )}
        {/* Stats Row */}
        {data.stats && data.stats.length > 0 && (
          <div style={{ display: 'flex', gap: 32, marginTop: 24 }}>
            {data.stats.map((s, i) => (
              <div key={i} style={{ borderLeft: `3px solid ${theme.accentColor}`, paddingLeft: 16 }}>
                <div style={{ color: '#FFFFFF', fontSize: 28, fontWeight: 700, fontFamily: theme.headingFont }}>{s.value}</div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
