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

export default function ImageLeftHeadlineNumbered({ data, theme, photos, pageNumber }: Props) {
  const imgUrl = getPhoto(photos, data.imageTags || []);
  const items = (data.numberedItems || []).slice(0, 2);

  return (
    <SlideShell theme={theme} pageNumber={data.pageNumber} agencyName={data.agencyName}>
      <div style={{ display: 'flex', height: '100%' }}>
        {/* LEFT */}
        <div style={{ width: '580px', padding: '40px 40px 40px 56px', boxSizing: 'border-box' }}>
          {imgUrl ? (
            <img src={imgUrl} alt="" crossOrigin="anonymous" style={{
              width: '524px', height: '580px',
              objectFit: 'cover', borderRadius: '16px', display: 'block'
            , objectPosition: 'center center'}} />
          ) : (
            <div style={{
              width: '524px', height: '580px', borderRadius: '16px',
              backgroundColor: `${theme.accentColor}22`
            }} />
          )}
        </div>

        {/* RIGHT */}
        <div style={{ flex: 1, padding: '40px 56px 40px 40px', boxSizing: 'border-box' }}>
          {data.headline && (
            <div style={{
              fontFamily: theme.headingFont, fontSize: '72px',
              fontWeight: 700, color: theme.textColor, lineHeight: 0.92,
              marginBottom: '40px',
            }}>
              {data.headline}
            </div>
          )}

          {items.map((item, i) => (
            <React.Fragment key={i}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px' }}>
                <div style={{
                  width: '56px', height: '56px',
                  border: `2px solid ${theme.textColor}`,
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '15px', fontWeight: 600, flexShrink: 0,
                  color: theme.textColor, opacity: 0.7,
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
                  margin: '24px 0',
                }} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </SlideShell>
  );
}
