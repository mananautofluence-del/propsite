import React from 'react';
import { SlideData, ThemeConfig, PresentationPhoto } from '@/lib/presentationTypes';

interface Props {
  data: SlideData;
  theme: ThemeConfig;
  photos: PresentationPhoto[];
}

function findPhotos(photos: PresentationPhoto[], tags: string[]): string[] {
  const urls: string[] = [];
  for (const tag of tags) {
    const found = photos.find(p => p.tag === tag && !urls.includes(p.url));
    if (found) urls.push(found.url);
  }
  // Fill remaining slots with any unused photos
  for (const p of photos) {
    if (!urls.includes(p.url)) urls.push(p.url);
    if (urls.length >= 4) break;
  }
  return urls;
}

export default function FullGallery({ data, theme, photos }: Props) {
  const galleryPhotos = findPhotos(photos, data.imageTags || []);

  return (
    <div style={{
      width: 1080, height: 1080, overflow: 'hidden',
      backgroundColor: theme.backgroundColor,
      fontFamily: theme.bodyFont,
      display: 'flex', flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{ padding: '56px 64px 28px' }}>
        {data.subheadline && (
          <div style={{
            color: theme.accentColor, fontSize: 14, fontWeight: 700,
            letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8
          }}>
            {data.subheadline}
          </div>
        )}
        {data.headline && (
          <div style={{
            color: theme.textColor, fontSize: 48, fontWeight: 700,
            lineHeight: 1.1, fontFamily: theme.headingFont
          }}>
            {data.headline}
          </div>
        )}
      </div>

      {/* Photo Grid */}
      <div style={{
        flex: 1, padding: '0 64px 64px',
        display: 'grid',
        gridTemplateColumns: galleryPhotos.length >= 3 ? '1fr 1fr' : '1fr',
        gridTemplateRows: galleryPhotos.length >= 3 ? '1fr 1fr' : '1fr',
        gap: 12
      }}>
        {galleryPhotos.slice(0, 4).map((url, i) => (
          <div key={i} style={{ borderRadius: 12, overflow: 'hidden', position: 'relative' }}>
            <img
              src={url}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
