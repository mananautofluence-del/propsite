import React from 'react';
import { SlideData, ThemeConfig, PresentationPhoto } from '@/lib/presentationTypes';

interface Props { data: SlideData; theme: ThemeConfig; photos: PresentationPhoto[]; }

export default function ContactMinimal({ data, theme }: Props) {
  const c = data.contactInfo;
  const initials = c?.name ? c.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : '?';
  return (
    <div style={{ width: '1080px', height: '1080px', boxSizing: 'border-box', position: 'relative', overflow: 'hidden', fontFamily: theme.bodyFont, backgroundColor: theme.backgroundColor }}>
      {/* Centered block */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Top rule */}
        <div style={{ width: '48px', height: '1px', backgroundColor: theme.accentColor, marginBottom: '48px' }} />
        {/* Monogram */}
        <div style={{ width: '96px', height: '96px', borderRadius: '48px', border: `1px solid ${theme.accentColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '28px', fontFamily: theme.headingFont, color: theme.accentColor }}>{initials}</div>
        </div>
        {/* Headline */}
        {data.headline && <div style={{ fontSize: '48px', fontFamily: theme.headingFont, color: theme.textColor, marginBottom: '8px', fontWeight: 700 }}>{data.headline}</div>}
        {/* Tagline */}
        {c?.tagline && <div style={{ fontSize: '14px', color: theme.textColor, opacity: 0.5, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '48px' }}>{c.tagline}</div>}
        {/* Name */}
        {c?.name && <div style={{ fontSize: '22px', fontFamily: theme.headingFont, color: theme.textColor, fontWeight: 600, marginBottom: '4px' }}>{c.name}</div>}
        {/* Agency */}
        {c?.agency && <div style={{ fontSize: '13px', color: theme.textColor, opacity: 0.6, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '40px' }}>{c.agency}</div>}
        {/* Phone CTA */}
        {c?.phone && <div style={{ backgroundColor: theme.accentColor, color: '#FFFFFF', borderRadius: '999px', padding: '18px 48px', fontSize: '20px', fontWeight: 700, letterSpacing: '1px', marginBottom: '32px', display: 'inline-block' }}>{c.phone}</div>}
        {/* RERA */}
        {c?.rera && <div style={{ fontSize: '11px', color: theme.textColor, opacity: 0.3, letterSpacing: '2px', textTransform: 'uppercase' }}>RERA: {c.rera}</div>}
      </div>
      {/* Bottom branding */}
      <div style={{ position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)', fontSize: '10px', color: theme.textColor, opacity: 0.2, letterSpacing: '3px', textTransform: 'uppercase' }}>Created with PropSite</div>
    </div>
  );
}
