import React from 'react';
import { SlideData, ThemeConfig, PresentationPhoto } from '@/lib/presentationTypes';
import SlideShell from './SlideShell';

interface Props {
  data: SlideData;
  theme: ThemeConfig;
  photos: PresentationPhoto[];
  pageNumber?: number;
}

function getPhotos(photos: PresentationPhoto[], tags: string[], count: number): string[] {
  const result: string[] = [];
  const used = new Set<string>();
  for (const tag of (tags || [])) {
    if (result.length >= count) break;
    const match = photos.find(p => p.tag === tag && !used.has(p.url));
    if (match) { result.push(match.url); used.add(match.url); }
  }
  for (const photo of photos) {
    if (result.length >= count) break;
    if (!used.has(photo.url)) { result.push(photo.url); used.add(photo.url); }
  }
  return result;
}
function getPhoto(photos: PresentationPhoto[], tags: string[]): string {
  return getPhotos(photos, tags || [], 1)[0] || '';
}

export default function Headline2Img2Numbered({ data, theme, photos, pageNumber }: Props) {
  const img1 = getPhoto(photos, data.imageTags || [], 0);
  const img2 = getPhoto(photos, data.imageTags || [], 1);
  const items = (data.numberedItems || []).slice(0, 2);

  return (
    <SlideShell theme={theme} pageNumber={data.pageNumber} agencyName={data.agencyName}>
      <div style={{ display: 'flex', height: '100%' }}>
        {/* LEFT */}
        <div style={{
          width: '540px', padding: '40px 40px 40px 56px',
          boxSizing: 'border-box', display: 'flex', flexDirection: 'column'
        }}>
          {data.headline && (
            <div style={{
              fontFamily: theme.headingFont, fontSize: '60px',
              fontWeight: 700, color: theme.textColor, lineHeight: 1,
              marginBottom: '32px',
            }}>
              {data.headline}
            </div>
          )}

          <div style={{ flex: 1 }}>
            {items.map((item, i) => (
              <React.Fragment key={i}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                  <div style={{
                    width: '48px', height: '48px',
                    border: `2px solid ${theme.textColor}`, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '14px', fontWeight: 600, flexShrink: 0,
                    color: theme.textColor, opacity: 0.7,
                  }}>
                    {item.number || String(i + 1).padStart(2, '0')}
                  </div>
                  <div>
                    <div style={{
                      fontSize: '17px', fontWeight: 700, color: theme.textColor, marginBottom: '6px',
                    }}>
                      {item.title}
                    </div>
                    <div style={{
                      fontSize: '15px', color: theme.textColor, opacity: 0.6, lineHeight: 1.5,
                    }}>
                      {item.body}
                    </div>
                  </div>
                </div>
                {i < items.length - 1 && (
                  <div style={{
                    width: '100%', height: '1px', backgroundColor: theme.textColor,
                    opacity: 0.12, margin: '20px 0',
                  }} />
                )}
              </React.Fragment>
            ))}
          </div>

          {data.bodyText && (
            <div style={{
              fontSize: '16px', color: theme.textColor, opacity: 0.55,
              lineHeight: 1.6, marginTop: '24px',
            }}>
              {data.bodyText}
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div style={{
          flex: 1, padding: '24px 56px 24px 24px', boxSizing: 'border-box',
          display: 'flex', flexDirection: 'column', gap: '16px',
        }}>
          {img1 ? (
            <img src={img1} alt="" crossOrigin="anonymous" style={{
              flex: 1, width: '100%', objectFit: 'cover',
              borderRadius: '16px', display: 'block'
            , objectPosition: 'center center'}} />
          ) : (
            <div style={{ flex: 1, width: '100%', borderRadius: '16px', backgroundColor: `${theme.accentColor}22` }} />
          )}
          {img2 ? (
            <img src={img2} alt="" crossOrigin="anonymous" style={{
              flex: 1, width: '100%', objectFit: 'cover',
              borderRadius: '16px', display: 'block'
            , objectPosition: 'center center'}} />
          ) : (
            <div style={{ flex: 1, width: '100%', borderRadius: '16px', backgroundColor: `${theme.accentColor}22` }} />
          )}
        </div>
      </div>
    </SlideShell>
  );
}
