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

export default function HeadlineTwoColImages({ data, theme, photos, pageNumber }: Props) {
  const img1 = getPhoto(photos, data.imageTags || [], 0);
  const img2 = getPhoto(photos, data.imageTags || [], 1);
  const items = data.numberedItems || [];

  return (
    <SlideShell theme={theme} pageNumber={data.pageNumber} agencyName={data.agencyName}>
      <div style={{ display: 'flex', height: '100%' }}>
        {/* LEFT */}
        <div style={{ width: '480px', padding: '56px 40px 56px 56px', boxSizing: 'border-box' }}>
          {data.headline && (
            <div style={{
              fontFamily: theme.headingFont, fontSize: '72px',
              fontWeight: 700, color: theme.textColor, lineHeight: 0.95,
            }}>
              {data.headline}
            </div>
          )}
          {data.bodyText && (
            <div style={{
              fontSize: '18px', color: theme.textColor, opacity: 0.65,
              lineHeight: 1.6, marginTop: '24px',
            }}>
              {data.bodyText}
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div style={{
          flex: 1, padding: '24px 56px 24px 0', boxSizing: 'border-box',
          display: 'flex', gap: '16px',
        }}>
          {/* Col 1 */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {img1 ? (
              <img src={img1} alt="" crossOrigin="anonymous" style={{
                width: '100%', height: '440px',
                objectFit: 'cover', borderRadius: '16px', display: 'block'
              , objectPosition: 'center center'}} />
            ) : (
              <div style={{ width: '100%', height: '440px', borderRadius: '16px', backgroundColor: `${theme.accentColor}22` }} />
            )}
            {items[0] && (
              <>
                <div style={{
                  fontSize: '15px', textAlign: 'center', color: theme.textColor,
                  fontWeight: 600, marginTop: '12px',
                }}>
                  {items[0].title}
                </div>
                <div style={{
                  fontSize: '13px', opacity: 0.55, textAlign: 'center', marginTop: '4px',
                }}>
                  {items[0].body}
                </div>
              </>
            )}
          </div>

          {/* Col 2 */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {img2 ? (
              <img src={img2} alt="" crossOrigin="anonymous" style={{
                width: '100%', height: '440px',
                objectFit: 'cover', borderRadius: '16px', display: 'block'
              , objectPosition: 'center center'}} />
            ) : (
              <div style={{ width: '100%', height: '440px', borderRadius: '16px', backgroundColor: `${theme.accentColor}22` }} />
            )}
            {items[1] && (
              <>
                <div style={{
                  fontSize: '15px', textAlign: 'center', color: theme.textColor,
                  fontWeight: 600, marginTop: '12px',
                }}>
                  {items[1].title}
                </div>
                <div style={{
                  fontSize: '13px', opacity: 0.55, textAlign: 'center', marginTop: '4px',
                }}>
                  {items[1].body}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </SlideShell>
  );
}
