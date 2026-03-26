import React from 'react';
import { SlideData, ThemeConfig, PresentationPhoto } from '@/lib/presentationTypes';
import SlideShell from './SlideShell';

interface Props {
  data: SlideData; theme: ThemeConfig;
  photos: PresentationPhoto[]; pageNumber?: number;
}

export default function HeadlineNumberedList({ data, theme, pageNumber }: Props) {
  const items = (data.numberedItems || []).slice(0, 3);
  const hl = (data.headline || '').length;
  const headlineSize = hl <= 20 ? 72 : hl <= 35 ? 58 : 46;

  return (
    <SlideShell theme={theme} pageNumber={pageNumber ?? 1} agencyName={data.agencyName}>
      <div style={{
        display: 'flex',
        height: '100%',
        width: '100%',
      }}>
        {/* LEFT — fixed width, headline + body */}
        <div style={{
          width: '440px',
          flexShrink: 0,
          padding: '48px 40px 48px 56px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          {data.headline && (
            <div style={{
              fontFamily: theme.headingFont,
              fontSize: `${headlineSize}px`,
              fontWeight: 700,
              color: theme.textColor,
              lineHeight: 0.95,
              letterSpacing: '-0.02em',
            }}>
              {data.headline}
            </div>
          )}
          {data.bodyText && (
            <div style={{
              fontSize: '17px',
              color: theme.textColor,
              opacity: 0.6,
              lineHeight: 1.6,
              marginTop: '24px',
              fontFamily: theme.bodyFont,
            }}>
              {data.bodyText}
            </div>
          )}
        </div>

        {/* Vertical divider */}
        <div style={{
          width: '1px',
          alignSelf: 'stretch',
          backgroundColor: theme.textColor,
          opacity: 0.1,
          margin: '48px 0',
          flexShrink: 0,
        }} />

        {/* RIGHT — numbered items, MUST have minWidth:0 */}
        <div style={{
          flex: 1,
          minWidth: 0,
          padding: '48px 56px 48px 56px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '0px',
        }}>
          {items.map((item, i) => (
            <div key={i}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '24px',
              }}>
                {/* Number circle */}
                <div style={{
                  width: '52px',
                  height: '52px',
                  border: `1.5px solid ${theme.textColor}`,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 600,
                  flexShrink: 0,
                  color: theme.textColor,
                  opacity: 0.65,
                  fontFamily: theme.bodyFont,
                }}>
                  {item.number || String(i + 1).padStart(2, '0')}
                </div>

                {/* Text — minWidth:0 prevents overflow */}
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: theme.textColor,
                    marginBottom: '8px',
                    fontFamily: theme.bodyFont,
                    whiteSpace: 'normal',
                    wordBreak: 'break-word',
                  }}>
                    {item.title}
                  </div>
                  <div style={{
                    fontSize: '15px',
                    color: theme.textColor,
                    opacity: 0.6,
                    lineHeight: 1.55,
                    fontFamily: theme.bodyFont,
                    whiteSpace: 'normal',
                    wordBreak: 'break-word',
                  }}>
                    {item.body}
                  </div>
                </div>
              </div>

              {/* Divider between items */}
              {i < items.length - 1 && (
                <div style={{
                  width: '100%',
                  height: '1px',
                  backgroundColor: theme.textColor,
                  opacity: 0.1,
                  margin: '24px 0',
                }} />
              )}
            </div>
          ))}
        </div>
      </div>
    </SlideShell>
  );
}
