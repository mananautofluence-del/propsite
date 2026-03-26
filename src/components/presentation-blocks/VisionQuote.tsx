import React from 'react';
import { SlideData, ThemeConfig, PresentationPhoto } from '@/lib/presentationTypes';

interface Props {
  data: SlideData;
  theme: ThemeConfig;
  photos: PresentationPhoto[];
  pageNumber?: number;
}

export default function VisionQuote({ data, theme, slideHeight }: Props) {
  const h = slideHeight || 1080;
  const quoteText = data.pullQuote || data.headline || '';
  const fontSize = quoteText.length <= 50 ? '88px'
    : quoteText.length <= 80 ? '72px'
    : quoteText.length <= 110 ? '58px' : '48px';

  const name = data.contactInfo?.name;
  const agency = data.contactInfo?.agency;

  return (
    <div style={{ width: '1080px', height: `${h}px`, boxSizing: 'border-box', position: 'relative', overflow: 'hidden', fontFamily: theme.bodyFont, backgroundColor: theme.backgroundColor }}>
      {/* Giant decorative quote mark */}
      <div style={{ position: 'absolute', top: '-80px', left: '32px', fontSize: '480px', fontFamily: theme.headingFont, color: theme.accentColor, opacity: 0.06, lineHeight: 1, zIndex: 0, userSelect: 'none' as const }}>
        &ldquo;
      </div>

      {/* Corner accent */}
      <div style={{ position: 'absolute', bottom: '80px', right: '80px', width: '80px', height: '2px', backgroundColor: theme.accentColor, opacity: 0.4 }} />
      <div style={{ position: 'absolute', bottom: '80px', right: '80px', width: '2px', height: '80px', backgroundColor: theme.accentColor, opacity: 0.4 }} />

      {/* Centered content */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '840px', textAlign: 'center', zIndex: 1 }}>
        {quoteText && (
            {quoteText}
          </div>
        )}
        {(name || agency) && (
          <>
            <div style={{ width: '48px', height: '2px', backgroundColor: theme.accentColor, margin: '44px auto 20px' }} />
              {name}{agency ? ` · ${agency}` : ''}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
