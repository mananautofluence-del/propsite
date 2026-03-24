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

export default function SplitRightImage({ data, theme, photos }: Props) {
  const img = findPhoto(photos, data.imageTags || ['bedroom']);

  return (
    <div style={{
      width: 1080, height: 1080, overflow: 'hidden',
      display: 'flex', backgroundColor: theme.backgroundColor,
      fontFamily: theme.bodyFont
    }}>
      {/* Left: Content */}
      <div style={{
        width: '50%', padding: '64px 56px',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        boxSizing: 'border-box'
      }}>
        {data.subheadline && (
          <div style={{
            color: theme.accentColor, fontSize: 14, fontWeight: 700,
            letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12
          }}>
            {data.subheadline}
          </div>
        )}
        {data.headline && (
          <div style={{
            color: theme.textColor, fontSize: 44, fontWeight: 700,
            lineHeight: 1.15, fontFamily: theme.headingFont, marginBottom: 20
          }}>
            {data.headline}
          </div>
        )}
        {data.bodyText && (
          <div style={{
            color: theme.textColor, opacity: 0.7, fontSize: 20,
            lineHeight: 1.7, marginBottom: 24
          }}>
            {data.bodyText}
          </div>
        )}
        {/* Bullet Points */}
        {data.bulletPoints && data.bulletPoints.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 8 }}>
            {data.bulletPoints.map((bp, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  backgroundColor: theme.accentColor, flexShrink: 0, marginTop: 8
                }} />
                <div style={{ color: theme.textColor, fontSize: 20, lineHeight: 1.5 }}>{bp}</div>
              </div>
            ))}
          </div>
        )}
        {/* Stats */}
        {data.stats && data.stats.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, marginTop: 28 }}>
            {data.stats.map((s, i) => (
              <div key={i} style={{
                backgroundColor: theme.accentColor + '15',
                borderRadius: 12, padding: '14px 20px', minWidth: 100
              }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: theme.textColor, fontFamily: theme.headingFont }}>{s.value}</div>
                <div style={{ fontSize: 12, color: theme.textColor, opacity: 0.5, textTransform: 'uppercase', fontWeight: 600 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right: Image */}
      <div style={{ width: '50%', height: '100%', position: 'relative', flexShrink: 0 }}>
        {img ? (
          <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', backgroundColor: theme.accentColor, opacity: 0.15 }} />
        )}
      </div>
    </div>
  );
}
