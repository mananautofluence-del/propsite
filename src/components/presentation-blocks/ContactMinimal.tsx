import React from 'react';
import { SlideData, ThemeConfig, PresentationPhoto } from '@/lib/presentationTypes';

interface Props { data: SlideData; theme: ThemeConfig; photos: PresentationPhoto[]; slideHeight?: number; }

export default function ContactMinimal({ data, theme, slideHeight }: Props) {
  const h = slideHeight || 1080;
  const c = data.contactInfo;
  const initials = c?.name ? c.name.trim().split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : '?';

  return (
    <div style={{ width: '1080px', height: `${h}px`, boxSizing: 'border-box', position: 'relative', overflow: 'hidden', fontFamily: theme.bodyFont, backgroundColor: theme.backgroundColor }}>
      {/* Radial glow */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '700px', height: '700px', borderRadius: '50%', background: `radial-gradient(circle, ${theme.accentColor}0F 0%, transparent 70%)`, zIndex: 0 }} />

      {/* Corner marks */}
      <div style={{ position: 'absolute', top: '56px', left: '56px', zIndex: 1 }}>
        <div style={{ width: '32px', height: '2px', backgroundColor: theme.accentColor, opacity: 0.35 }} />
        <div style={{ width: '2px', height: '32px', backgroundColor: theme.accentColor, opacity: 0.35, marginTop: '-2px' }} />
      </div>
      <div style={{ position: 'absolute', bottom: '56px', right: '56px', zIndex: 1 }}>
        <div style={{ width: '2px', height: '32px', backgroundColor: theme.accentColor, opacity: 0.35, marginLeft: '30px' }} />
        <div style={{ width: '32px', height: '2px', backgroundColor: theme.accentColor, opacity: 0.35, marginTop: '-2px' }} />
      </div>

      {/* Centered content */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, width: '640px' }}>
        <div style={{ width: '48px', height: '2px', backgroundColor: theme.accentColor, marginBottom: '48px' }} />

        {/* Monogram */}
        <div style={{ width: '108px', height: '108px', borderRadius: '50%', border: `2px solid ${theme.accentColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '36px' }}>
          <div style={{ fontSize: '32px', fontFamily: theme.headingFont, color: theme.accentColor, fontWeight: 600 }}>{initials}</div>
        </div>

        {data.headline && (
          <div style={{ fontSize: '56px', fontFamily: theme.headingFont, color: theme.textColor, fontWeight: 700, marginBottom: '10px', lineHeight: '1.1' }}>{data.headline}</div>
        )}

        {c?.tagline && (
          <div style={{ fontSize: '16px', color: theme.textColor, opacity: 0.45, letterSpacing: '3px', textTransform: 'uppercase' as const, marginBottom: '52px', fontFamily: theme.bodyFont }}>{c.tagline}</div>
        )}

        {c?.name && (
          <div style={{ fontSize: '28px', fontFamily: theme.headingFont, color: theme.textColor, fontWeight: 600, marginBottom: '6px' }}>{c.name}</div>
        )}

        {c?.agency && (
          <div style={{ fontSize: '15px', color: theme.textColor, opacity: 0.55, letterSpacing: '2px', textTransform: 'uppercase' as const, marginBottom: '44px', fontFamily: theme.bodyFont }}>{c.agency}</div>
        )}

        {c?.phone && (
          <div style={{ backgroundColor: theme.accentColor, color: '#FFFFFF', borderRadius: '999px', padding: '20px 64px', fontSize: '24px', fontWeight: 700, letterSpacing: '1px', marginBottom: '36px', display: 'inline-block', fontFamily: theme.bodyFont }}>{c.phone}</div>
        )}

        {c?.rera && c.rera !== 'N/A' && c.rera !== 'Not Available' && (
          <div style={{ fontSize: '13px', color: theme.textColor, opacity: 0.28, letterSpacing: '2px', textTransform: 'uppercase' as const, fontFamily: theme.bodyFont }}>RERA: {c.rera}</div>
        )}
      </div>

      {/* Branding */}
      <div style={{ position: 'absolute', bottom: '36px', left: '50%', transform: 'translateX(-50%)', fontSize: '12px', color: theme.textColor, opacity: 0.18, letterSpacing: '4px', textTransform: 'uppercase' as const, fontFamily: theme.bodyFont, whiteSpace: 'nowrap' as const }}>
        Created with PropSite
      </div>
    </div>
  );
}
