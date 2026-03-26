import React from 'react';
import { SlideData, ThemeConfig, PresentationPhoto } from '@/lib/presentationTypes';
import SlideShell from './SlideShell';

interface Props {
  data: SlideData; theme: ThemeConfig;
  photos: PresentationPhoto[]; pageNumber?: number;
}

export default function ContactSplit({ data, theme, pageNumber }: Props) {
  const c = data.contactInfo || {} as any;
  const initials = (c.name || 'P')
    .trim().split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();
  const hl = (data.headline || '').length;
  const headlineSize = hl <= 20 ? 64 : hl <= 35 ? 52 : 42;

  return (
    <SlideShell theme={theme} pageNumber={pageNumber ?? 1} agencyName={data.agencyName}>
      <div style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        padding: '0 80px',
        boxSizing: 'border-box',
      }}>
        {/* Left */}
        <div style={{
          flex: 1,
          minWidth: 0,
          paddingRight: '64px',
          boxSizing: 'border-box',
        }}>
          {data.headline && (
            <div style={{
              fontFamily: theme.headingFont,
              fontSize: `${headlineSize}px`,
              fontWeight: 700,
              color: theme.textColor,
              lineHeight: 0.95,
              marginBottom: '20px',
            }}>
              {data.headline}
            </div>
          )}
          {(data.bodyText || data.subheadline) && (
            <div style={{
              fontSize: '17px',
              color: theme.textColor,
              opacity: 0.6,
              lineHeight: 1.6,
              fontFamily: theme.bodyFont,
            }}>
              {data.bodyText || data.subheadline}
            </div>
          )}
        </div>

        {/* Divider */}
        <div style={{
          width: '1px',
          height: '280px',
          backgroundColor: theme.textColor,
          opacity: 0.2,
          flexShrink: 0,
        }} />

        {/* Right */}
        <div style={{
          flex: 1,
          paddingLeft: '64px',
          boxSizing: 'border-box',
        }}>
          {/* Monogram */}
          <div style={{
            width: '60px', height: '60px',
            borderRadius: '50%',
            border: `1.5px solid ${theme.accentColor}`,
            display: 'flex', alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px', fontWeight: 700,
            fontFamily: theme.headingFont,
            color: theme.accentColor,
            marginBottom: '16px',
          }}>
            {initials}
          </div>

          {c.name && (
            <div style={{
              fontSize: '22px', fontWeight: 700,
              fontFamily: theme.headingFont,
              color: theme.textColor, marginBottom: '4px',
            }}>
              {c.name}
            </div>
          )}

          {c.agency && (
            <div style={{
              fontSize: '12px',
              color: theme.textColor, opacity: 0.45,
              textTransform: 'uppercase' as const,
              fontFamily: theme.bodyFont,
              marginBottom: '28px',
            }}>
              {c.agency}
            </div>
          )}

          {c.phone && (
            <div style={{
              display: 'flex', alignItems: 'center',
              gap: '16px', marginBottom: '14px',
            }}>
              <div style={{
                width: '44px', height: '44px',
                borderRadius: '50%',
                backgroundColor: `${theme.textColor}0F`,
                display: 'flex', alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px', flexShrink: 0,
              }}>
                📞
              </div>
              <span style={{
                fontSize: '20px', fontWeight: 600,
                color: theme.textColor,
                fontFamily: theme.bodyFont,
              }}>
                {c.phone}
              </span>
            </div>
          )}

          {c.rera && c.rera !== 'N/A' && c.rera !== 'NOT AVAILABLE'
            && !c.rera.toLowerCase().includes('not') && (
            <div style={{
              fontSize: '11px',
              color: theme.textColor, opacity: 0.3,
              textTransform: 'uppercase' as const,
              fontFamily: theme.bodyFont,
              marginTop: '16px',
            }}>
              RERA: {c.rera}
            </div>
          )}
        </div>
      </div>
    </SlideShell>
  );
}
