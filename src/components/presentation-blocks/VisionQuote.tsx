import React from 'react';
import { SlideData, ThemeConfig, PresentationPhoto } from '@/lib/presentationTypes';

interface Props { data: SlideData; theme: ThemeConfig; photos: PresentationPhoto[]; }

export default function VisionQuote({ data, theme }: Props) {
  const name = data.contactInfo?.name;
  const agency = data.contactInfo?.agency;
  return (
    <div style={{ width: '1080px', height: '1080px', boxSizing: 'border-box', position: 'relative', overflow: 'hidden', fontFamily: theme.bodyFont, backgroundColor: theme.backgroundColor }}>
      {/* Giant decorative quote mark */}
      <div style={{ position: 'absolute', top: '-60px', left: '40px', fontSize: '400px', fontFamily: theme.headingFont, color: theme.accentColor, opacity: 0.08, lineHeight: 1, zIndex: 0 }}>"</div>
      {/* Centered content */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '820px', textAlign: 'center', zIndex: 1 }}>
        {(data.pullQuote || data.headline) && (
          <div style={{ fontSize: '54px', fontFamily: theme.headingFont, fontStyle: 'italic', lineHeight: '1.25', color: theme.textColor, letterSpacing: '-0.01em' }}>
            {data.pullQuote || data.headline}
          </div>
        )}
        {(name || agency) && (
          <div style={{ fontSize: '14px', letterSpacing: '3px', color: theme.accentColor, marginTop: '48px', textTransform: 'uppercase' }}>
            — {name}{agency ? `, ${agency}` : ''}
          </div>
        )}
      </div>
    </div>
  );
}
