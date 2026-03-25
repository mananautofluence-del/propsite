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

export default function ImageTopHeadlineNumbered({ data, theme, photos, pageNumber }: Props) {
  const imgUrl = getPhoto(photos, data.imageTags || []);
  const items = (data.numberedItems || []).slice(0, 2);

  return (
    <SlideShell theme={theme} pageNumber={data.pageNumber} agencyName={data.agencyName}>
      {/* TOP */}
      <div style={{
        height: '340px', display: 'flex', gap: '24px', padding: '24px 56px 0',
        boxSizing: 'border-box'
      }}>
        {imgUrl ? (
          <img src={imgUrl} alt="" crossOrigin="anonymous" style={{
            flex: 1, height: '316px', objectFit: 'cover',
            borderRadius: '16px', display: 'block'
          , objectPosition: 'center center'}} />
        ) : (
          <div style={{ flex: 1, height: '316px', borderRadius: '16px', backgroundColor: `${theme.accentColor}22` }} />
        )}
        
        <div style={{ width: '380px', display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'center' }}>
          {items.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{
                width: '40px', height: '40px',
                border: `2px solid ${theme.textColor}`, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '13px', fontWeight: 600, flexShrink: 0,
                color: theme.textColor, opacity: 0.7,
              }}>
                {item.number || String(i + 1).padStart(2, '0')}
              </div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: theme.textColor, marginBottom: '4px' }}>
                  {item.title}
                </div>
                <div style={{ fontSize: '14px', color: theme.textColor, opacity: 0.6, lineHeight: 1.5 }}>
                  {item.body}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DIVIDER */}
      <div style={{ width: 'auto', height: '1px', backgroundColor: theme.textColor, opacity: 0.12, margin: '24px 56px' }} />

      {/* BOTTOM */}
      <div style={{ display: 'flex', padding: '0 56px', boxSizing: 'border-box' }}>
        <div style={{
          fontFamily: theme.headingFont, fontSize: '64px',
          fontWeight: 700, color: theme.textColor, lineHeight: 0.95,
          flex: 1, paddingRight: '40px'
        }}>
          {data.headline}
        </div>
        <div style={{
          fontSize: '18px', color: theme.textColor, opacity: 0.65,
          lineHeight: 1.6, flex: 1,
        }}>
          {data.bodyText}
        </div>
      </div>
    </SlideShell>
  );
}
