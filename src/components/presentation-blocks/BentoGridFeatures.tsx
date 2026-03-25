import React from 'react';
import { SlideData, ThemeConfig, PresentationPhoto } from '@/lib/presentationTypes';

interface Props { data: SlideData; theme: ThemeConfig; photos: PresentationPhoto[]; slideHeight?: number; }

export default function BentoGridFeatures({ data, theme, slideHeight }: Props) {
  const h = slideHeight || 1080;
  const boxes = data.bentoBoxes
    || (data.bulletPoints || []).map((bp, i) => ({
        icon: ['✦', '◎', '◇', '△', '☽', '◉'][i % 6],
        title: bp,
        description: '',
        size: i === 0 ? 'large' as const : 'small' as const,
      }));

  return (
    <div style={{
      width: '1080px', height: `${h}px`,
      boxSizing: 'border-box', position: 'relative',
      overflow: 'hidden', fontFamily: theme.bodyFont,
      backgroundColor: theme.backgroundColor,
      display: 'flex', flexDirection: 'column',
      padding: '64px',
    }}>
      {/* Header */}
      <div style={{ marginBottom: '32px', flexShrink: 0 }}>
        {data.eyebrow && (
          <div style={{
            fontSize: '11px', letterSpacing: '4px',
            textTransform: 'uppercase' as const, color: theme.accentColor,
            marginBottom: '12px', fontFamily: theme.bodyFont,
          }}>
            {data.eyebrow}
          </div>
        )}
        {data.headline && (
          <div style={{
            fontSize: '52px', fontFamily: theme.headingFont,
            color: theme.textColor, lineHeight: '1.0',
            fontWeight: 700,
          }}>
            {data.headline}
          </div>
        )}
        <div style={{
          width: '48px', height: '2px',
          backgroundColor: theme.accentColor, marginTop: '16px',
        }} />
      </div>

      {/* Bento boxes — FLEXBOX, never CSS Grid */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '14px',
        flex: 1, alignContent: 'flex-start',
      }}>
        {boxes.map((box, i) => {
          const isLarge = box.size === 'large';
          return (
            <div key={i} style={{
              width: isLarge ? 'calc(66.666% - 7px)' : 'calc(33.333% - 9.33px)',
              minHeight: boxes.length <= 4 ? '220px' : '180px',
              backgroundColor: theme.accentColor + '10',
              border: `1px solid ${theme.accentColor}25`,
              borderRadius: '16px', padding: '28px',
              boxSizing: 'border-box',
              display: 'flex', flexDirection: 'column',
              justifyContent: 'space-between',
            }}>
              <div style={{
                fontSize: '28px', marginBottom: '12px',
                lineHeight: 1,
              }}>
                {box.icon}
              </div>
              <div>
                <div style={{
                  fontSize: '17px', fontFamily: theme.headingFont,
                  color: theme.textColor, fontWeight: 600,
                  lineHeight: '1.2',
                }}>
                  {box.title}
                </div>
                {box.description && (
                  <div style={{
                    fontSize: '13px', color: theme.textColor,
                    opacity: 0.6, lineHeight: '1.5', marginTop: '8px',
                    fontFamily: theme.bodyFont,
                  }}>
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
