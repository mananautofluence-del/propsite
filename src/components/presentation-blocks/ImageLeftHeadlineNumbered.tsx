import React from 'react';
import { SlideData, ThemeConfig, PresentationPhoto } from '@/lib/presentationTypes';
import SlideShell from './SlideShell';

interface Props {
  data: SlideData; theme: ThemeConfig;
  photos: PresentationPhoto[]; pageNumber?: number;
}

function getPhoto(photos: PresentationPhoto[], tags: string[]): string {
  for (const t of (tags || [])) {
    const f = photos.find(p => p.tag === t);
    if (f) return f.url;
  }
  return photos[0]?.url || '';
}

export default function ImageLeftHeadlineNumbered({ data, theme, photos, pageNumber }: Props) {
  const imgUrl = getPhoto(photos, data.imageTags || []);
  const items = (data.numberedItems || []).slice(0, 2);
  const hl = (data.headline || '').length;
  const headlineSize = hl <= 20 ? 64 : hl <= 35 ? 52 : 42;

  return (
    <SlideShell theme={theme} pageNumber={pageNumber ?? 1} agencyName={data.agencyName}>
      <div style={{ display: 'flex', height: '100%', width: '100%' }}>
        {/* Image — left */}
        <div style={{
          width: '520px',
          flexShrink: 0,
          padding: '32px 32px 32px 56px',
          boxSizing: 'border-box',
        }}>
          {imgUrl ? (
            <img src={imgUrl} alt="" crossOrigin="anonymous" style={{
              width: '432px',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center center',
              borderRadius: '16px',
              display: 'block',
            }} />
          ) : (
            <div style={{
              width: '432px', height: '100%',
              borderRadius: '16px',
              backgroundColor: `${theme.accentColor}22`,
            }} />
          )}
        </div>

        {/* Right — headline + numbered items */}
        <div style={{
          flex: 1,
          minWidth: 0,
          padding: '48px 56px 48px 40px',
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
              marginBottom: '40px',
            }}>
              {data.headline}
            </div>
          )}

          {items.map((item, i) => (
            <div key={i}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{
                  width: '52px', height: '52px',
                  border: `1.5px solid ${theme.textColor}`,
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '14px', fontWeight: 600,
                  flexShrink: 0,
                  color: theme.textColor, opacity: 0.65,
                  fontFamily: theme.bodyFont,
                }}>
                  {item.number || String(i + 1).padStart(2, '0')}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{
                    fontSize: '18px', fontWeight: 700,
                    color: theme.textColor, marginBottom: '8px',
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
              </div>
              {i < items.length - 1 && (
                <div style={{
                  width: '100%', height: '1px',
                  backgroundColor: theme.textColor, opacity: 0.1,
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
