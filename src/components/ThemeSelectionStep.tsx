import React from 'react';
import { ThemeConfig } from '@/lib/presentationTypes';

const THEMES: { name: string; vibe: string; preview: string; swatchLeft: string; swatchRight: string; config: ThemeConfig }[] = [
  {
    name: 'Quiet Luxury', vibe: 'Old money. Whispered elegance.',
    preview: 'Kashmir', swatchLeft: '#1C2B1E', swatchRight: '#8B6E4E',
    config: { backgroundColor: '#F2EDE4', textColor: '#1C2B1E', accentColor: '#8B6E4E', headingFont: 'Cormorant Garamond', bodyFont: 'DM Sans' }
  },
  {
    name: 'Modern Penthouse', vibe: 'Power. Gold. Silence.',
    preview: 'Penthouse', swatchLeft: '#1A1A1A', swatchRight: '#C9A84C',
    config: { backgroundColor: '#0D0D0D', textColor: '#F5F0E8', accentColor: '#C9A84C', headingFont: 'Playfair Display', bodyFont: 'Plus Jakarta Sans' }
  },
  {
    name: 'Minimalist Avant-Garde', vibe: 'Less. But better.',
    preview: 'Residence', swatchLeft: '#111111', swatchRight: '#9A9A9A',
    config: { backgroundColor: '#F8F8F8', textColor: '#111111', accentColor: '#9A9A9A', headingFont: 'DM Serif Display', bodyFont: 'Outfit' }
  },
  {
    name: 'Coastal Estate', vibe: 'Salt air. Barefoot luxury.',
    preview: 'Shoreline', swatchLeft: '#2D6A8F', swatchRight: '#C4714A',
    config: { backgroundColor: '#FDF6EC', textColor: '#1A2C3D', accentColor: '#C4714A', headingFont: 'Fraunces', bodyFont: 'Jost' }
  },
];

interface Props {
  onThemeSelect: (theme: ThemeConfig) => void;
  selectedTheme: ThemeConfig | null;
}

export default function ThemeSelectionStep({ onThemeSelect, selectedTheme }: Props) {
  return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#0A0A0A',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '48px 20px 80px', boxSizing: 'border-box'
    }}>
      <div style={{
        fontFamily: '"Playfair Display", serif', fontSize: 28, color: '#FFFFFF',
        fontWeight: 700, textAlign: 'center', marginBottom: 8, letterSpacing: '-0.02em'
      }}>
        Choose Your Visual Identity
      </div>
      <div style={{
        fontFamily: '"DM Sans", sans-serif', fontSize: 15, color: '#666',
        textAlign: 'center', marginBottom: 40
      }}>
        This sets the soul of your presentation
      </div>

      <div style={{
        display: 'flex', flexDirection: 'column', gap: 16,
        width: '100%', maxWidth: 480
      }}>
        {THEMES.map((t, i) => {
          const isSelected = selectedTheme?.backgroundColor === t.config.backgroundColor && selectedTheme?.accentColor === t.config.accentColor;
          return (
            <button key={i} onClick={() => onThemeSelect(t.config)}
              style={{
                width: '100%', height: 160, borderRadius: 16, overflow: 'hidden',
                border: isSelected ? `3px solid ${t.config.accentColor}` : '1px solid #222',
                backgroundColor: t.config.backgroundColor,
                cursor: 'pointer', position: 'relative',
                transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                transition: 'all 0.2s ease', padding: 0,
                display: 'flex', flexDirection: 'column'
              }}>
              {/* Swatch strip */}
              <div style={{ display: 'flex', height: 6, width: '100%' }}>
                <div style={{ flex: 1, backgroundColor: t.swatchLeft }} />
                <div style={{ flex: 1, backgroundColor: t.swatchRight }} />
              </div>
              {/* Content */}
              <div style={{
                flex: 1, padding: '20px 28px',
                display: 'flex', flexDirection: 'column', justifyContent: 'center'
              }}>
                <div style={{
                  fontSize: 11, letterSpacing: '3px', textTransform: 'uppercase' as const,
                  color: t.config.accentColor, marginBottom: 8, fontFamily: '"DM Sans", sans-serif'
                }}>
                  {t.name}
                </div>
                <div style={{
                  fontSize: 36, fontFamily: `"${t.config.headingFont}", serif`,
                  color: t.config.textColor, fontWeight: 700, lineHeight: 1, marginBottom: 8
                }}>
                  {t.preview}
                </div>
                <div style={{
                  fontSize: 13, fontFamily: '"DM Sans", sans-serif',
                  color: t.config.textColor, opacity: 0.5, fontStyle: 'italic'
                }}>
                  {t.vibe}
                </div>
              </div>
              {/* Selected checkmark */}
              {isSelected && (
                <div style={{
                  position: 'absolute', top: 12, right: 12,
                  width: 28, height: 28, borderRadius: '50%',
                  backgroundColor: t.config.accentColor,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
