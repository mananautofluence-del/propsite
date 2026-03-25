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

export default function ContentImageBottom({ data, theme, photos, pageNumber }: Props) {
  const imgUrl = getPhoto(photos, data.imageTags || []);
  const cols = (data.numberedItems || []).slice(0, 3);

  return (
    <SlideShell theme={theme} pageNumber={data.pageNumber} agencyName={data.agencyName}>
      {/* TOP SECTION */}
      <div style={{ display: 'flex', height: '380px' }}>
        <div style={{ width: '540px', padding: '56px 40px 40px 56px', boxSizing: 'border-box' }}>
          {data.headline && (
            <div style={{
              fontFamily: theme.headingFont, fontSize: '72px',
              fontWeight: 700, color: theme.textColor,
              lineHeight: 0.95, marginBottom: '24px',
            }}>
              {data.headline}
            </div>
          )}
          {data.bodyText && (
            <div style={{
              fontSize: '18px', fontFamily: theme.bodyFont,
              color: theme.textColor, opacity: 0.65,
              lineHeight: 1.65, maxWidth: '420px',
            }}>
              {data.bodyText}
            </div>
          )}
        </div>
        
        <div style={{ flex: 1, padding: '24px 40px 24px 0', boxSizing: 'border-box' }}>
          {imgUrl && (
            <img src={imgUrl} alt="" crossOrigin="anonymous" style={{
              width: '100%', height: '332px',
              objectFit: 'cover', borderRadius: '16px', display: 'block'
            , objectPosition: 'center center'}} />
          )}
        </div>
      </div>

      {/* DIVIDER */}
      <div style={{ width: '100%', height: '1px', backgroundColor: theme.textColor, opacity: 0.12 }} />

      {/* BOTTOM SECTION */}
      <div style={{ display: 'flex', height: '320px', paddingTop: '16px', boxSizing: 'border-box' }}>
        {cols.map((col, i) => (
          <div key={i} style={{
            flex: 1,
            borderLeft: `2px solid ${theme.textColor}26`, // 0.15 opacity
            padding: '24px 32px',
          }}>
            <div style={{
              fontSize: '17px', fontWeight: 700,
              color: theme.textColor, marginBottom: '8px',
            }}>
              {col.title}
            </div>
            <div style={{
              fontSize: '15px', color: theme.textColor,
              opacity: 0.6, lineHeight: 1.55,
            }}>
              {col.body}
            </div>
          </div>
        ))}
      </div>
    </SlideShell>
  );
}
