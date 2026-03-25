import React from 'react';
import { SlideData, ThemeConfig, PresentationPhoto } from '@/lib/presentationTypes';
import SlideShell from './SlideShell';

interface Props {
  data: SlideData;
  theme: ThemeConfig;
  photos: PresentationPhoto[];
  pageNumber?: number;
}

export default function StatsTwoCol({ data, theme }: Props) {
  const stats = (data.stats || []).slice(0, 2);

  return (
    <SlideShell theme={theme} pageNumber={data.pageNumber} agencyName={data.agencyName}>
      <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center' }}>
        {stats.map((s, i) => (
          <div key={i} style={{ width: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 56px' }}>
            <div style={{
              fontFamily: theme.headingFont, fontSize: '160px',
              fontWeight: 700, color: theme.textColor, lineHeight: 0.85,
            }}>
              {s.value}
            </div>
            
            <div style={{
              width: '80%', height: '1px',
              backgroundColor: theme.textColor, opacity: 0.25,
              margin: '24px auto',
            }} />
            
            <div style={{
              fontSize: '28px', fontFamily: theme.headingFont,
              fontWeight: 600, color: theme.textColor,
              marginTop: '16px', textAlign: 'center',
            }}>
              {s.label}
            </div>
            
            {s.description && (
              <div style={{
                fontSize: '18px', color: theme.textColor, opacity: 0.6,
                lineHeight: 1.5, maxWidth: '340px', textAlign: 'center',
                marginTop: '12px',
              }}>
                {s.description}
              </div>
            )}
          </div>
        ))}

        {stats.length > 1 && (
          <div style={{
            position: 'absolute', left: '50%', top: '15%', bottom: '15%',
            width: '1px', backgroundColor: theme.textColor, opacity: 0.15,
          }} />
        )}
      </div>
    </SlideShell>
  );
}
