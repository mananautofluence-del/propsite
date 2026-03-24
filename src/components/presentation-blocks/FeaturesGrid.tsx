import React from 'react';
import { SlideData, ThemeConfig, PresentationPhoto } from '@/lib/presentationTypes';

interface Props {
  data: SlideData;
  theme: ThemeConfig;
  photos: PresentationPhoto[];
}

export default function FeaturesGrid({ data, theme }: Props) {
  const items = data.bulletPoints || [];
  const stats = data.stats || [];
  const hasStats = stats.length > 0;

  return (
    <div style={{
      width: 1080, height: 1080, overflow: 'hidden',
      backgroundColor: theme.backgroundColor,
      fontFamily: theme.bodyFont,
      padding: '72px 64px', boxSizing: 'border-box',
      display: 'flex', flexDirection: 'column'
    }}>
      {/* Header */}
      {data.subheadline && (
        <div style={{
          color: theme.accentColor, fontSize: 14, fontWeight: 700,
          letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8
        }}>
          {data.subheadline}
        </div>
      )}
      {data.headline && (
        <div style={{
          color: theme.textColor, fontSize: 52, fontWeight: 800,
          lineHeight: 1.1, fontFamily: theme.headingFont, marginBottom: 12
        }}>
          {data.headline}
        </div>
      )}
      {data.bodyText && (
        <div style={{
          color: theme.textColor, opacity: 0.6, fontSize: 20,
          lineHeight: 1.6, marginBottom: 32, maxWidth: 700
        }}>
          {data.bodyText}
        </div>
      )}

      {/* Stats Row */}
      {hasStats && (
        <div style={{ display: 'flex', gap: 20, marginBottom: 40, flexWrap: 'wrap' }}>
          {stats.map((s, i) => (
            <div key={i} style={{
              flex: '1 1 auto', minWidth: 140,
              borderLeft: `3px solid ${theme.accentColor}`, paddingLeft: 16, paddingTop: 4, paddingBottom: 4
            }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: theme.textColor, fontFamily: theme.headingFont }}>{s.value}</div>
              <div style={{ fontSize: 13, color: theme.textColor, opacity: 0.5, textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Features Grid */}
      {items.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: items.length <= 4 ? '1fr 1fr' : '1fr 1fr 1fr',
          gap: 16, flex: 1, alignContent: 'start'
        }}>
          {items.map((item, i) => (
            <div key={i} style={{
              backgroundColor: theme.accentColor + '10',
              borderRadius: 16, padding: '28px 24px',
              display: 'flex', alignItems: 'center', gap: 16
            }}>
              <div style={{
                width: 12, height: 12, borderRadius: '50%',
                backgroundColor: theme.accentColor, flexShrink: 0
              }} />
              <div style={{
                color: theme.textColor, fontSize: 20, fontWeight: 500, lineHeight: 1.4
              }}>
                {item}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
