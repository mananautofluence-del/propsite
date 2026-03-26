import React from 'react';
import { SlideData, ThemeConfig, PresentationPhoto } from '@/lib/presentationTypes';
import SlideShell from './SlideShell';

interface Props {
  data: SlideData; theme: ThemeConfig;
  photos: PresentationPhoto[]; pageNumber?: number;
}

export default function CenteredNumberedCols({ data, theme, pageNumber }: Props) {
  const items = (data.numberedItems || []).slice(0, 3);
  const hl = (data.headline || '').length;
  const headlineSize = hl <= 20 ? 80 : hl <= 35 ? 64 : 52;

  return (
    <SlideShell theme={theme} pageNumber={pageNumber ?? 1} agencyName={data.agencyName}>
      <div style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Top headline area */}
        <div style={{
          padding: '40px 80px 32px',
          textAlign: 'center',
          boxSizing: 'border-box',
          flexShrink: 0,
        }}>
          {data.headline && (
            <div style={{
              fontFamily: theme.headingFont,
              fontSize: `${headlineSize}px`,
              fontWeight: 700,
              color: theme.textColor,
              lineHeight: 0.95,
            }}>
              {data.headline}
            </div>
          )}
          {data.bodyText && (
            <div style={{
              fontSize: '17px',
              color: theme.textColor,
              opacity: 0.6,
              maxWidth: '700px',
              margin: '16px auto 0',
              lineHeight: 1.55,
              fontFamily: theme.bodyFont,
            }}>
              {data.bodyText}
            </div>
          )}
        </div>

        {/* Horizontal rule */}
        <div style={{
          height: '1px',
          backgroundColor: theme.textColor,
          opacity: 0.1,
          margin: '0 80px',
        }} />

        {/* Columns */}
        <div style={{
          flex: 1,
          display: 'flex',
          padding: '0 40px',
        }}>
          {items.map((item, i) => (
            <div key={i} style={{
              flex: 1,
              padding: '40px 40px',
              textAlign: 'center',
              borderRight: i < items.length - 1
                ? `1px solid ${theme.textColor}18`
                : 'none',
              boxSizing: 'border-box',
            }}>
              {/* Circle */}
              <div style={{
                width: '64px', height: '64px',
                border: `1.5px solid ${theme.textColor}`,
                borderRadius: '50%',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px', fontWeight: 600,
                margin: '0 auto 24px',
                color: theme.textColor, opacity: 0.6,
                fontFamily: theme.bodyFont,
              }}>
                {item.number || String(i + 1).padStart(2, '0')}
              </div>
              <div style={{
                fontSize: '19px', fontWeight: 700,
                color: theme.textColor, marginBottom: '12px',
                fontFamily: theme.bodyFont,
              }}>
                {item.title}
              </div>
              <div style={{
                fontSize: '15px', color: theme.textColor,
                opacity: 0.6, lineHeight: 1.55,
                fontFamily: theme.bodyFont,
              }}>
                {item.body}
              </div>
            </div>
          ))}
        </div>
      </div>
    </SlideShell>
  );
}
