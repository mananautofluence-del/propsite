import React from 'react';
import { SlideData, ThemeConfig, PresentationPhoto } from '@/lib/presentationTypes';

interface Props {
  data: SlideData;
  theme: ThemeConfig;
  photos: PresentationPhoto[];
  pageNumber?: number;
}

export default function BentoGridFeatures({ data, theme, slideHeight }: Props) {
  const h = slideHeight || 1080;
  const boxes = data.bentoBoxes
    || (data.bulletPoints || []).map((bp, i) => ({
        icon: ['✦', '◎', '◇', '△', '☽', '◉'][i % 6],
        title: bp, description: '',
        size: i === 0 ? 'large' as const : 'small' as const,
      }));

  return (
    <div style={{ width: '1080px', height: `${h}px`, boxSizing: 'border-box', position: 'relative', overflow: 'hidden', fontFamily: theme.bodyFont, backgroundColor: theme.backgroundColor, display: 'flex', flexDirection: 'column', padding: '64px' }}>
      {/* Header */}
      <div style={{ marginBottom: '36px', flexShrink: 0 }}>
        {data.eyebrow && (
            {data.eyebrow}
          </div>
        )}
        {data.headline && (
          <div style={{ fontSize: '64px', fontFamily: theme.headingFont, color: theme.textColor, lineHeight: '1.0', fontWeight: 700 }}>
            {data.headline}
          </div>
        )}
        <div style={{ width: '48px', height: '3px', backgroundColor: theme.accentColor, marginTop: '20px' }} />
      </div>

      {/* Bento boxes — FLEXBOX only */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', flex: 1, alignContent: 'flex-start' }}>
        {boxes.map((box, i) => {
          const isLarge = box.size === 'large';
          return (
            <div key={i} style={{
              width: isLarge ? 'calc(66.666% - 8px)' : 'calc(33.333% - 11px)',
              minHeight: boxes.length <= 4 ? '240px' : '200px',
              backgroundColor: theme.accentColor + '12',
              border: `1px solid ${theme.accentColor}30`,
              borderRadius: '16px', padding: '32px',
              boxSizing: 'border-box',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            }}>
              <div style={{ fontSize: '36px', marginBottom: '16px', lineHeight: 1 }}>{box.icon}</div>
              <div>
                <div style={{ fontSize: '24px', fontFamily: theme.headingFont, color: theme.textColor, fontWeight: 600, lineHeight: '1.2' }}>
                  {box.title}
                </div>
                {box.description && (
                  <div style={{ fontSize: '17px', color: theme.textColor, opacity: 0.6, lineHeight: '1.5', marginTop: '10px', fontFamily: theme.bodyFont }}>
                    {box.description}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
