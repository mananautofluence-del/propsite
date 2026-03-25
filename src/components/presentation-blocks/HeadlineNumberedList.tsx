import React from 'react';
import { SlideData, ThemeConfig, PresentationPhoto } from '@/lib/presentationTypes';
import SlideShell from './SlideShell';

interface Props { data: SlideData; theme: ThemeConfig; photos: PresentationPhoto[]; }

export default function HeadlineNumberedList({ data, theme }: Props) {
  const items = (data.numberedItems || []).slice(0, 3);

  return (
    <SlideShell theme={theme} pageNumber={data.pageNumber} agencyName={data.agencyName}>
      <div style={{ display: 'flex', height: '100%' }}>
        {/* LEFT */}
        <div style={{ width: '480px', padding: '56px 40px 56px 56px', boxSizing: 'border-box' }}>
          {data.headline && (
            <div style={{
              fontFamily: theme.headingFont, fontSize: '72px',
              fontWeight: 700, color: theme.textColor, lineHeight: 0.95,
            }}>
              {data.headline}
            </div>
          )}
          {data.bodyText && (
            <div style={{
              fontSize: '18px', color: theme.textColor, opacity: 0.65,
              lineHeight: 1.6, marginTop: '24px',
            }}>
              {data.bodyText}
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div style={{ flex: 1, padding: '40px 56px 40px 40px', boxSizing: 'border-box' }}>
          {items.map((item, i) => (
            <React.Fragment key={i}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px' }}>
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
                    fontSize: '16px', color: theme.textColor,
                    opacity: 0.6, lineHeight: 1.5,
                  }}>
                    {item.body}
                  </div>
                </div>
              </div>
              {i < items.length - 1 && (
                <div style={{
                  width: '100%', height: '1px',
                  backgroundColor: theme.textColor, opacity: 0.12,
                  margin: '20px 0',
                }} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </SlideShell>
  );
}
