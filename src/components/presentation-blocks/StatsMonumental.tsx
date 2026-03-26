import React from 'react';
import { SlideData, ThemeConfig, PresentationPhoto } from '@/lib/presentationTypes';

interface Props {
  data: SlideData;
  theme: ThemeConfig;
  photos: PresentationPhoto[];
  pageNumber?: number;
}

function getStatFontSize(value: string): string {
  const len = value.replace(/[^a-zA-Z0-9]/g, '').length;
  if (len <= 2) return '160px';
  if (len <= 4) return '132px';
  if (len <= 6) return '108px';
  if (len <= 8) return '80px';
  return '64px';
}

export default function StatsMonumental({ data, theme, slideHeight }: Props) {
  const h = slideHeight || 1080;
  const stats = (data.stats || []).slice(0, 3);

  return (
    <div style={{ width: '1080px', height: `${h}px`, boxSizing: 'border-box', position: 'relative', overflow: 'hidden', fontFamily: theme.bodyFont, backgroundColor: theme.backgroundColor, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      {/* Background texture */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.03, backgroundImage: `repeating-linear-gradient(45deg, ${theme.textColor} 0px, ${theme.textColor} 1px, transparent 1px, transparent 40px)` }} />

      {/* Top eyebrow */}
      {data.eyebrow && (
          {data.eyebrow}
        </div>
      )}

      <div style={{ position: 'absolute', top: '112px', width: '120px', height: '2px', backgroundColor: theme.accentColor }} />

      {/* Stats row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0px', width: '100%', padding: '0 60px', boxSizing: 'border-box', zIndex: 1 }}>
        {stats.map((s, i) => (
          <React.Fragment key={i}>
            {i > 0 && <div style={{ width: '2px', height: '160px', backgroundColor: theme.textColor, opacity: 0.12, flexShrink: 0, margin: '0 48px' }} />}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', minWidth: 0, flex: 1 }}>
                {s.value}
              </div>
              {s.unit && (
                  {s.unit}
                </div>
              )}
                {s.label}
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>

      {data.headline && (
          {data.headline}
        </div>
      )}
    </div>
  );
}
