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

export default function HeadlineBodyImageNumbered({ data, theme, photos, pageNumber }: Props) {
  const imgUrl = getPhoto(photos, data.imageTags || []);
  const items = (data.numberedItems || []).slice(0, 2);

  return (
    <SlideShell theme={theme} pageNumber={data.pageNumber} agencyName={data.agencyName}>
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        
        {/* LEFT COLUMN */}
        <div style={{
          position: 'absolute', left: '56px', width: '600px',
          top: 0, bottom: 0,
        }}>
          {data.headline && (
            <div style={{
              position: 'absolute', top: '32px',
              fontFamily: theme.headingFont, fontSize: '64px',
              fontWeight: 700, color: theme.textColor, lineHeight: 0.95,
            }}>
              {data.headline}
            </div>
          )}
          
          {data.bodyText && (
            <div style={{
              position: 'absolute', top: '230px',
              fontSize: '18px', color: theme.textColor, opacity: 0.65,
              lineHeight: 1.6, maxWidth: '520px',
            }}>
              {data.bodyText}
            </div>
          )}
          
          {imgUrl ? (
            <img src={imgUrl} alt="" crossOrigin="anonymous" style={{
              position: 'absolute', left: 0, bottom: '24px',
              width: '480px', height: '320px', borderRadius: '16px',
              objectFit: 'cover', display: 'block'
            , objectPosition: 'center center'}} />
          ) : (
            <div style={{
              position: 'absolute', left: 0, bottom: '24px',
              width: '480px', height: '320px', borderRadius: '16px',
              backgroundColor: `${theme.accentColor}22`
            }} />
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div style={{
          position: 'absolute', left: '680px', right: '56px', top: '56px',
        }}>
          {items.map((item, i) => (
            <React.Fragment key={i}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
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
                  margin: '32px 0',
                }} />
              )}
            </React.Fragment>
          ))}
        </div>
        
      </div>
    </SlideShell>
  );
}
