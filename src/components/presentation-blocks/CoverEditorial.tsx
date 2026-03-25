import React from 'react';
import { SlideData, ThemeConfig, PresentationPhoto } from '@/lib/presentationTypes';
import SlideShell from './SlideShell';

interface Props { data: SlideData; theme: ThemeConfig; photos: PresentationPhoto[]; }

function getPhoto(photos: PresentationPhoto[], tags: string[], fallbackIndex = 0): string {
  for (const t of tags) { const f = photos.find(p => p.tag === t); if (f) return f.url; }
  return photos[fallbackIndex]?.url || photos[0]?.url || '';
}

export default function CoverEditorial({ data, theme, photos }: Props) {
  const imgUrl = getPhoto(photos, data.imageTags || ['cover']);

  return (
    <SlideShell theme={theme} pageNumber={data.pageNumber} agencyName={data.agencyName}>
      {/* Left zone */}
      <div style={{ position: 'absolute', left: '56px', width: '560px', height: '100%' }}>
        {data.headline && (
          <div style={{
            position: 'absolute', top: '80px',
            fontFamily: theme.headingFont, fontSize: '96px',
            lineHeight: 0.92, fontWeight: 700, color: theme.textColor,
            letterSpacing: '-0.02em',
          }}>
            {data.headline}
          </div>
        )}
        {(data.subheadline || data.bodyText) && (
          <div style={{
            position: 'absolute', top: '360px',
            fontSize: '20px', color: theme.textColor,
            opacity: 0.6, maxWidth: '400px', lineHeight: 1.4,
          }}>
            {data.subheadline || data.bodyText}
          </div>
        )}
      </div>

      {/* Right zone */}
      <div style={{
        position: 'absolute', right: '40px', top: '20px',
        width: '680px', height: '660px',
      }}>
        {imgUrl ? (
          <img src={imgUrl} alt="" crossOrigin="anonymous" style={{
            width: '680px', height: '660px',
            objectFit: 'cover', borderRadius: '20px', display: 'block'
          }} />
        ) : (
          <div style={{
            width: '680px', height: '660px', borderRadius: '20px',
            backgroundColor: `${theme.accentColor}22`
          }} />
        )}
      </div>
    </SlideShell>
  );
}
