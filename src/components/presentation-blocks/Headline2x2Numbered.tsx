import React from 'react';
import { SlideData, ThemeConfig, PresentationPhoto } from '@/lib/presentationTypes';
import SlideShell from './SlideShell';

interface Props {
  data: SlideData;
  theme: ThemeConfig;
  photos: PresentationPhoto[];
  pageNumber?: number;
}

export default function Headline2x2Numbered({ data, theme }: Props) {
  const items = (data.numberedItems || []).slice(0, 4);

  return (
    <SlideShell theme={theme} pageNumber={data.pageNumber} agencyName={data.agencyName}>
      {/* TOP */}
      <div style={{
        height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '40px 56px 32px', boxSizing: 'border-box',
      }}>
        <div style={{ flex: 1, paddingRight: '40px' }}>
          {data.headline && (
            <div style={{
              fontFamily: theme.headingFont, fontSize: '72px',
              fontWeight: 700, color: theme.textColor, lineHeight: 0.95,
            }}>
              {data.headline}
            </div>
          )}
        </div>
        <div style={{ width: '440px', flexShrink: 0 }}>
          {data.bodyText && (
            <div style={{
              fontSize: '18px', color: theme.textColor, opacity: 0.65,
              lineHeight: 1.6,
            }}>
              {data.bodyText}
            </div>
          )}
        </div>
      </div>

      {/* DIVIDER */}
      <div style={{ width: '100%', height: '1px', backgroundColor: theme.textColor, opacity: 0.12 }} />

      {/* BOTTOM */}
      <div style={{
        flex: 1, display: 'flex', flexWrap: 'wrap',
        padding: '24px 56px', boxSizing: 'border-box', alignContent: 'flex-start',
      }}>
        {items.map((item, i) => (
          <div key={i} style={{
            width: '50%', display: 'flex', gap: '20px',
            padding: '16px 32px 16px 16px', boxSizing: 'border-box',
          }}>
            <div style={{
              width: '56px', height: '56px',
              border: `2px solid ${theme.textColor}`,
              borderRadius: '50%', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: '15px', fontWeight: 600,
              flexShrink: 0, color: theme.textColor, opacity: 0.7,
            }}>
              {item.number || String(i + 1).padStart(2, '0')}
            </div>
            <div>
              <div style={{
                fontSize: '18px', fontWeight: 700,
                color: theme.textColor, marginBottom: '8px',
              }}>
                {item.title}
              </div>
              <div style={{
                fontSize: '15px', color: theme.textColor,
                opacity: 0.6, lineHeight: 1.5,
              }}>
                {item.body}
              </div>
            </div>
          </div>
        ))}
      </div>
    </SlideShell>
  );
}
