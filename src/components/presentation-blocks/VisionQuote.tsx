import React from 'react';
import { SlideData, ThemeConfig, PresentationPhoto } from '@/lib/presentationTypes';

interface Props { data: SlideData; theme: ThemeConfig; photos: PresentationPhoto[]; }

export default function VisionQuote({ data, theme }: Props) {
  const quoteText = data.pullQuote || data.headline || '';
  const fontSize = quoteText.length <= 50 ? '80px'
    : quoteText.length <= 80 ? '64px'
    : quoteText.length <= 110 ? '52px' : '42px';

  const name = data.contactInfo?.name;
  const agency = data.contactInfo?.agency;

  return (
    <div style={{
      width: '1080px', height: '1080px',
      boxSizing: 'border-box', position: 'relative',
      overflow: 'hidden', fontFamily: theme.bodyFont,
      backgroundColor: theme.backgroundColor,
    }}>
      {/* Giant decorative quote mark */}
      <div style={{
        position: 'absolute', top: '-80px', left: '32px',
        fontSize: '480px', fontFamily: theme.headingFont,
        color: theme.accentColor, opacity: 0.06,
        lineHeight: 1, zIndex: 0,
        userSelect: 'none' as const,
      }}>
        &ldquo;
      </div>

      {/* Subtle accent corner line */}
      <div style={{
        position: 'absolute', bottom: '80px', right: '80px',
        width: '80px', height: '1px',
        backgroundColor: theme.accentColor, opacity: 0.4,
      }} />
      <div style={{
        position: 'absolute', bottom: '80px', right: '80px',
        width: '1px', height: '80px',
        backgroundColor: theme.accentColor, opacity: 0.4,
      }} />

      {/* Centered content */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '840px', textAlign: 'center', zIndex: 1,
      }}>
        {quoteText && (
          <div style={{
            fontSize, fontFamily: theme.headingFont,
            fontStyle: 'italic', lineHeight: '1.22',
            color: theme.textColor, letterSpacing: '-0.01em',
            fontWeight: 400,
          }}>
            {quoteText}
          </div>
        )}

        {/* Attribution */}
        {(name || agency) && (
          <>
            <div style={{
              width: '48px', height: '1px',
              backgroundColor: theme.accentColor,
              margin: '40px auto 16px',
            }} />
            <div style={{
              fontSize: '13px', letterSpacing: '3px',
              color: theme.accentColor, textTransform: 'uppercase' as const,
              fontFamily: theme.bodyFont,
            }}>
              {name}{agency ? ` · ${agency}` : ''}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
