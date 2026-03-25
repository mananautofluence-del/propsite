import React from 'react';
import { SlideData, ThemeConfig, PresentationPhoto } from '@/lib/presentationTypes';
import SlideShell from './SlideShell';

interface Props { data: SlideData; theme: ThemeConfig; photos: PresentationPhoto[]; }

export default function CenteredNumberedCols({ data, theme }: Props) {
  const items = (data.numberedItems || []).slice(0, 3);

  return (
    <SlideShell theme={theme} pageNumber={data.pageNumber} agencyName={data.agencyName}>
      {/* TOP */}
      <div style={{ padding: '48px 56px 40px', textAlign: 'center', boxSizing: 'border-box' }}>
        {data.headline && (
          <div style={{
            fontFamily: theme.headingFont, fontSize: '80px',
            fontWeight: 700, color: theme.textColor, lineHeight: 0.95,
          }}>
            {data.headline}
          </div>
        )}
        {data.bodyText && (
          <div style={{
            fontSize: '18px', color: theme.textColor, opacity: 0.65,
            maxWidth: '700px', margin: '20px auto 0', lineHeight: 1.55,
          }}>
            {data.bodyText}
          </div>
        )}
      </div>

      {/* BOTTOM */}
      <div style={{ display: 'flex', padding: '0 56px', gap: 0, boxSizing: 'border-box', position: 'relative' }}>
        {items.map((item, i) => (
          <div key={i} style={{ flex: 1, padding: '0 24px' }}>
            <div style={{
              width: '72px', height: '72px',
              border: `2px solid ${theme.textColor}`,
              borderRadius: '50%',
              fontSize: '18px', fontWeight: 600,
              margin: '0 auto 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: theme.textColor, opacity: 0.7,
            }}>
              {item.number || String(i + 1).padStart(2, '0')}
            </div>
            <div style={{
              fontSize: '20px', fontWeight: 700,
              textAlign: 'center', color: theme.textColor,
              marginBottom: '12px',
            }}>
              {item.title}
            </div>
            <div style={{
              fontSize: '16px', textAlign: 'center',
              color: theme.textColor, opacity: 0.6,
              lineHeight: 1.5,
            }}>
              {item.body}
            </div>
          </div>
        ))}
        
        {/* Dividers */}
        {items.length > 1 && (
          <div style={{
            position: 'absolute', width: '1px', top: '10px', bottom: '10px',
            left: '33.333%', backgroundColor: theme.textColor, opacity: 0.12,
          }} />
        )}
        {items.length > 2 && (
          <div style={{
            position: 'absolute', width: '1px', top: '10px', bottom: '10px',
            left: '66.666%', backgroundColor: theme.textColor, opacity: 0.12,
          }} />
        )}
      </div>
    </SlideShell>
  );
}
