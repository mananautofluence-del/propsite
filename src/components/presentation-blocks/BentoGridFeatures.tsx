import React from 'react';
import { SlideData, ThemeConfig, PresentationPhoto } from '@/lib/presentationTypes';

interface Props { data: SlideData; theme: ThemeConfig; photos: PresentationPhoto[]; }

export default function BentoGridFeatures({ data, theme }: Props) {
  const boxes = data.bentoBoxes || (data.bulletPoints || []).map((bp, i) => ({ icon: '✦', title: bp, description: '', size: i === 0 ? 'large' as const : 'small' as const }));
  return (
    <div style={{ width: '1080px', height: '1080px', boxSizing: 'border-box', position: 'relative', overflow: 'hidden', fontFamily: theme.bodyFont, backgroundColor: theme.backgroundColor, padding: '64px' }}>
      {/* Header */}
      {data.eyebrow && <div style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', color: theme.accentColor, marginBottom: '8px' }}>{data.eyebrow}</div>}
      {data.headline && <div style={{ fontSize: '48px', fontFamily: theme.headingFont, color: theme.textColor, marginBottom: '40px', lineHeight: '1.05', fontWeight: 700 }}>{data.headline}</div>}
      {/* Bento boxes — FLEXBOX ONLY */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', flex: 1 }}>
        {boxes.map((box, i) => (
          <div key={i} style={{
            width: box.size === 'large' ? 'calc(66.666% - 8px)' : 'calc(33.333% - 11px)',
            minHeight: '200px',
            backgroundColor: theme.accentColor + '14',
            border: `1px solid ${theme.accentColor}33`,
            borderRadius: '16px', padding: '28px', boxSizing: 'border-box',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>{box.icon}</div>
            <div>
              <div style={{ fontSize: '18px', fontFamily: theme.headingFont, color: theme.textColor, fontWeight: 600 }}>{box.title}</div>
              {box.description && <div style={{ fontSize: '13px', color: theme.textColor, opacity: 0.65, lineHeight: '1.5', marginTop: '8px' }}>{box.description}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
