import React from 'react';
import { SlideData, ThemeConfig, PresentationPhoto } from '@/lib/presentationTypes';

interface Props { data: SlideData; theme: ThemeConfig; photos: PresentationPhoto[]; }

export default function StatsMonumental({ data, theme }: Props) {
  const stats = data.stats || [];
  return (
    <div style={{ width: '1080px', height: '1080px', boxSizing: 'border-box', position: 'relative', overflow: 'hidden', fontFamily: theme.bodyFont, backgroundColor: theme.backgroundColor, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Top */}
      {data.eyebrow && <div style={{ textTransform: 'uppercase', letterSpacing: '6px', fontSize: '11px', color: theme.accentColor, marginTop: '80px', textAlign: 'center' }}>{data.eyebrow}</div>}
      <div style={{ width: '120px', height: '1px', backgroundColor: theme.accentColor, marginTop: '24px', marginBottom: '80px' }} />

      {/* Stats row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', flex: 1, width: '100%', padding: '0 60px', boxSizing: 'border-box' }}>
        {stats.map((s, i) => (
          <React.Fragment key={i}>
            {i > 0 && <div style={{ width: '1px', height: '120px', backgroundColor: theme.textColor, opacity: 0.15 }} />}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ fontSize: '120px', fontFamily: theme.headingFont, color: theme.textColor, lineHeight: '0.85', letterSpacing: '-0.04em', fontWeight: 700 }}>{s.value}</div>
              {s.unit && <div style={{ fontSize: '14px', letterSpacing: '4px', color: theme.accentColor, marginTop: '12px', textTransform: 'uppercase' }}>{s.unit}</div>}
              <div style={{ fontSize: '11px', letterSpacing: '3px', color: theme.textColor, opacity: 0.5, marginTop: '8px', textTransform: 'uppercase' }}>{s.label}</div>
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* Bottom */}
      {data.headline && <div style={{ fontFamily: theme.headingFont, fontSize: '24px', textAlign: 'center', marginBottom: '80px', fontStyle: 'italic', color: theme.textColor, opacity: 0.5, padding: '0 80px' }}>{data.headline}</div>}
    </div>
  );
}
