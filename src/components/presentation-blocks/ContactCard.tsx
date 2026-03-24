import React from 'react';
import { SlideData, ThemeConfig, PresentationPhoto } from '@/lib/presentationTypes';

interface Props {
  data: SlideData;
  theme: ThemeConfig;
  photos: PresentationPhoto[];
}

export default function ContactCard({ data, theme }: Props) {
  const contact = data.contactInfo;
  const initials = contact?.name
    ? contact.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <div style={{
      width: 1080, height: 1080, overflow: 'hidden',
      backgroundColor: theme.backgroundColor,
      fontFamily: theme.bodyFont,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        textAlign: 'center', padding: '80px 64px', boxSizing: 'border-box',
        maxWidth: 750
      }}>
        {/* Accent line */}
        <div style={{
          width: 64, height: 4, backgroundColor: theme.accentColor,
          borderRadius: 2, marginBottom: 40
        }} />

        {data.subheadline && (
          <div style={{
            color: theme.accentColor, fontSize: 14, fontWeight: 700,
            letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 16
          }}>
            {data.subheadline}
          </div>
        )}

        {data.headline && (
          <div style={{
            color: theme.textColor, fontSize: 48, fontWeight: 800,
            lineHeight: 1.1, fontFamily: theme.headingFont, marginBottom: 40
          }}>
            {data.headline}
          </div>
        )}

        {/* Avatar Circle */}
        {contact && (
          <div style={{
            width: 120, height: 120, borderRadius: '50%',
            backgroundColor: theme.accentColor + '20',
            border: `3px solid ${theme.accentColor}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 28
          }}>
            <div style={{
              fontSize: 48, fontWeight: 800, color: theme.accentColor,
              fontFamily: theme.headingFont
            }}>
              {initials}
            </div>
          </div>
        )}

        {contact?.name && (
          <div style={{
            color: theme.textColor, fontSize: 36, fontWeight: 700,
            fontFamily: theme.headingFont, marginBottom: 4
          }}>
            {contact.name}
          </div>
        )}
        {contact?.agency && (
          <div style={{
            color: theme.textColor, opacity: 0.5, fontSize: 20,
            marginBottom: 32
          }}>
            {contact.agency}
          </div>
        )}

        {/* Contact Pill */}
        {contact?.phone && (
          <div style={{
            backgroundColor: theme.accentColor,
            color: '#FFFFFF', fontSize: 28, fontWeight: 700,
            padding: '18px 48px', borderRadius: 16, marginBottom: 20
          }}>
            {contact.phone}
          </div>
        )}

        {contact?.rera && (
          <div style={{
            color: theme.textColor, opacity: 0.4, fontSize: 16,
            fontWeight: 600, marginBottom: 48
          }}>
            RERA: {contact.rera}
          </div>
        )}

        {/* Branding */}
        <div style={{
          color: theme.textColor, opacity: 0.25, fontSize: 14, fontWeight: 600,
          letterSpacing: '0.1em'
        }}>
          Created with PropSite
        </div>
      </div>
    </div>
  );
}
