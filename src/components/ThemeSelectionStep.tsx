import React from 'react';
import { ThemeConfig } from '@/lib/presentationTypes';

const THEMES = [
  {
    name: 'Classic Warm',
    vibe: 'Timeless · Professional · Elegant',
    preview: 'Property Name',
    swatchA: '#8B7355',
    swatchB: '#F5F0E8',
    config: {
      backgroundColor: '#F5F0E8', textColor: '#1A1A1A',
      accentColor: '#8B7355', headingFont: 'Cormorant Garamond',
      bodyFont: 'DM Sans'
    }
  },
  {
    name: 'Modern Dark',
    vibe: 'Bold · Premium · Contemporary',
    preview: 'Property Name',
    swatchA: '#C9A84C',
    swatchB: '#111111',
    config: {
      backgroundColor: '#111111', textColor: '#F5F0E8',
      accentColor: '#C9A84C', headingFont: 'Playfair Display',
      bodyFont: 'Plus Jakarta Sans'
    }
  },
  {
    name: 'Clean White',
    vibe: 'Minimal · Sharp · Confident',
    preview: 'Property Name',
    swatchA: '#333333',
    swatchB: '#FFFFFF',
    config: {
      backgroundColor: '#FFFFFF', textColor: '#111111',
      accentColor: '#333333', headingFont: 'DM Serif Display',
      bodyFont: 'Outfit'
    }
  },
  {
    name: 'Coastal Warm',
    vibe: 'Fresh · Inviting · Modern',
    preview: 'Property Name',
    swatchA: '#C4714A',
    swatchB: '#FDF8F2',
    config: {
      backgroundColor: '#FDF8F2', textColor: '#1A2C3D',
      accentColor: '#C4714A', headingFont: 'Fraunces',
      bodyFont: 'Jost'
    }
  },
];

interface Props {
  selectedTheme: ThemeConfig | null;
  onThemeSelect: (theme: ThemeConfig) => void;
}

export default function ThemeSelectionStep({ selectedTheme, onThemeSelect }: Props) {
  return (
    <div style={{
      flex: 1,
      backgroundColor: '#F7F7F7',
      padding: '28px 20px 140px 20px',
      minHeight: '100vh',
    }}>
      {/* Page header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{
          fontSize: '22px', fontWeight: 700, color: '#111111',
          fontFamily: '"DM Sans", sans-serif', marginBottom: '6px',
          letterSpacing: '-0.3px',
        }}>
          Choose a Style
        </h1>
        <p style={{
          fontSize: '14px', color: '#888888',
          fontFamily: '"DM Sans", sans-serif',
        }}>
          Sets the look and feel of your entire presentation
        </p>
      </div>

      {/* Theme cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {THEMES.map((t) => {
          const isSelected = selectedTheme?.headingFont === t.config.headingFont;
          return (
            <button
              key={t.name}
              onClick={() => onThemeSelect(t.config)}
              style={{
                width: '100%',
                backgroundColor: '#FFFFFF',
                border: isSelected
                  ? `2px solid ${t.config.accentColor}`
                  : '1.5px solid #E5E5E5',
                borderRadius: '16px',
                padding: '0',
                cursor: 'pointer',
                overflow: 'hidden',
                boxShadow: isSelected
                  ? `0 4px 16px ${t.config.accentColor}28`
                  : '0 1px 4px rgba(0,0,0,0.06)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Mini preview strip — shows actual bg color */}
              <div style={{
                width: '100%',
                height: '72px',
                backgroundColor: t.config.backgroundColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 20px',
                borderBottom: '1px solid rgba(0,0,0,0.07)',
              }}>
                {/* Fake headline preview */}
                <span style={{
                  fontFamily: t.config.headingFont + ', serif',
                  fontSize: '22px',
                  fontWeight: 700,
                  color: t.config.textColor,
                  letterSpacing: '-0.3px',
                }}>
                  {t.preview}
                </span>
                {/* Accent dot */}
                <div style={{
                  width: '10px', height: '10px',
                  borderRadius: '50%',
                  backgroundColor: t.config.accentColor,
                }} />
              </div>

              {/* Card info row */}
              <div style={{
                padding: '14px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#FFFFFF',
              }}>
                <div style={{ textAlign: 'left' }}>
                  <div style={{
                    fontSize: '15px', fontWeight: 700,
                    color: '#111111',
                    fontFamily: '"DM Sans", sans-serif',
                    marginBottom: '2px',
                  }}>
                    {t.name}
                  </div>
                  <div style={{
                    fontSize: '12px', color: '#999999',
                    fontFamily: '"DM Sans", sans-serif',
                  }}>
                    {t.vibe}
                  </div>
                </div>

                {/* Selected checkmark OR empty radio */}
                <div style={{
                  width: '24px', height: '24px',
                  borderRadius: '50%',
                  border: isSelected
                    ? 'none'
                    : '2px solid #DDDDDD',
                  backgroundColor: isSelected ? t.config.accentColor : 'transparent',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.15s ease',
                }}>
                  {isSelected && (
                    <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                      <path d="M1 4L4.5 7.5L11 1" stroke="white" strokeWidth="2"
                        strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
