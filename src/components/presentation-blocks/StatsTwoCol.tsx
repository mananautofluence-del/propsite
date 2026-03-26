import React from 'react';
import { SlideData, ThemeConfig, PresentationPhoto } from '@/lib/presentationTypes';
import SlideShell from './SlideShell';

interface Props {
  data: SlideData; theme: ThemeConfig;
  photos: PresentationPhoto[]; pageNumber?: number;
}

function getValueFontSize(value: string): string {
  const len = (value || '').replace(/\s/g, '').length;
  if (len <= 2) return '160px';
  if (len <= 4) return '130px';
  if (len <= 6) return '110px';
  if (len <= 8) return '88px';
  return '64px';
}

export default function StatsTwoCol({ data, theme, pageNumber }: Props) {
  const stats = (data.stats || []).slice(0, 2);
  const s1 = stats[0] || { value: '—', label: '', description: '' };
  const s2 = stats[1] || { value: '—', label: '', description: '' };

  const StatBlock = ({ s }: { s: typeof s1 }) => (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '0 48px',
      minWidth: 0,
    }}>
      <div style={{
        fontFamily: theme.headingFont,
        fontSize: getValueFontSize(s.value),
        fontWeight: 700,
        color: theme.textColor,
        lineHeight: 0.9,
        letterSpacing: '-0.03em',
        whiteSpace: 'nowrap',
      }}>
        {s.value}
      </div>
      <div style={{
        width: '120px',
        height: '1px',
        backgroundColor: theme.textColor,
        opacity: 0.2,
        margin: '20px auto',
      }} />
      <div style={{
        fontSize: '22px',
        fontFamily: theme.headingFont,
        fontWeight: 600,
        color: theme.textColor,
        marginBottom: '12px',
      }}>
        {s.label}
      </div>
      {s.description && (
        <div style={{
          fontSize: '16px',
          color: theme.textColor,
          opacity: 0.55,
          lineHeight: 1.5,
          maxWidth: '300px',
          fontFamily: theme.bodyFont,
        }}>
          {s.description}
        </div>
      )}
    </div>
  );

  return (
    <SlideShell theme={theme} pageNumber={pageNumber ?? 1} agencyName={data.agencyName}>
      <div style={{
        display: 'flex',
        height: '100%',
        width: '100%',
        alignItems: 'center',
        position: 'relative',
      }}>
        <StatBlock s={s1} />

        {/* Vertical divider */}
        <div style={{
          width: '1px',
          height: '50%',
          backgroundColor: theme.textColor,
          opacity: 0.15,
          flexShrink: 0,
        }} />

        <StatBlock s={s2} />
      </div>
    </SlideShell>
  );
}
