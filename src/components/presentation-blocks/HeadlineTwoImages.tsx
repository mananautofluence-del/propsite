import React from 'react';
import { SlideData, ThemeConfig, PresentationPhoto } from '@/lib/presentationTypes';
import SlideShell from './SlideShell';

interface Props {
  data: SlideData; theme: ThemeConfig;
  photos: PresentationPhoto[]; pageNumber?: number;
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

export default function HeadlineTwoImages({ data, theme, photos, pageNumber }: Props) {
  const [img1, img2] = getPhotos(photos, data.imageTags || [], 2);
  const hl = (data.headline || '').length;
  const headlineSize = hl <= 20 ? 64 : hl <= 35 ? 52 : 42;

  const ImgBlock = ({ src }: { src: string }) => src ? (
    <img src={src} alt="" crossOrigin="anonymous" style={{
      flex: 1,
      width: '50%',
      height: '420px',
      objectFit: 'cover',
      objectPosition: 'center center',
      borderRadius: '14px',
      display: 'block',
      minHeight: '420px',
    }} />
  ) : (
    <div style={{
      flex: 1,
      height: '420px',
      borderRadius: '14px',
      backgroundColor: `${theme.accentColor}18`,
    }} />
  );

  return (
    <SlideShell theme={theme} pageNumber={pageNumber ?? 1} agencyName={data.agencyName}>
      {/* Top text row */}
      <div style={{
        height: '196px',
        padding: '32px 56px 16px',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '40px',
        boxSizing: 'border-box',
      }}>
        <div style={{ flex: '0 0 50%', minWidth: 0 }}>
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
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {data.bodyText && (
            <div style={{
              fontSize: '16px',
              color: theme.textColor,
              opacity: 0.65,
              lineHeight: 1.6,
              fontFamily: theme.bodyFont,
            }}>
              {data.bodyText}
            </div>
          )}
        </div>
      </div>

      {/* Two images */}
      <div style={{
        display: 'flex',
        gap: '14px',
        padding: '0 56px',
        height: '420px',
        boxSizing: 'border-box',
      }}>
        <ImgBlock src={img1} />
        <ImgBlock src={img2} />
      </div>
    </SlideShell>
  );
}
