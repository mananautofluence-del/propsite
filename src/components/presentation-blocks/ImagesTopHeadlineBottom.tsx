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

export default function ImagesTopHeadlineBottom({ data, theme, photos, pageNumber }: Props) {
  const img1 = getPhoto(photos, data.imageTags || [], 0);
  const img2 = getPhoto(photos, data.imageTags || [], 1);

  return (
    <SlideShell theme={theme} pageNumber={data.pageNumber} agencyName={data.agencyName}>
      {/* TOP */}
      <div style={{ display: 'flex', height: '380px', gap: '16px', padding: '24px 56px 0', boxSizing: 'border-box' }}>
        {img1 && (
          <img src={img1} alt="" crossOrigin="anonymous" style={{
            flex: 1, height: '356px',
            objectFit: 'cover', borderRadius: '16px', display: 'block'
          , objectPosition: 'center center'}} />
        )}
        {img2 && (
          <img src={img2} alt="" crossOrigin="anonymous" style={{
            flex: 1, height: '356px',
            objectFit: 'cover', borderRadius: '16px', display: 'block'
          , objectPosition: 'center center'}} />
        )}
      </div>

      {/* BOTTOM */}
      <div style={{ display: 'flex', flex: 1, padding: '32px 56px 0', boxSizing: 'border-box' }}>
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
    </SlideShell>
  );
}
