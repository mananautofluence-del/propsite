import React from 'react';
import { ThemeConfig } from '@/lib/presentationTypes';

const THEMES = [
  {
    name: 'Classic Warm',
    vibe: 'Timeless. Professional. Elegant.',
    config: { backgroundColor: '#F5F0E8', textColor: '#1A1A1A', 
      accentColor: '#8B7355', headingFont: 'Cormorant Garamond', 
      bodyFont: 'DM Sans' }
  },
  {
    name: 'Modern Dark',
    vibe: 'Bold. Premium. Contemporary.',
    config: { backgroundColor: '#111111', textColor: '#F5F0E8', 
      accentColor: '#C9A84C', headingFont: 'Playfair Display', 
      bodyFont: 'Plus Jakarta Sans' }
  },
  {
    name: 'Clean White',
    vibe: 'Minimal. Sharp. Confident.',
    config: { backgroundColor: '#FFFFFF', textColor: '#111111', 
      accentColor: '#333333', headingFont: 'DM Serif Display', 
      bodyFont: 'Outfit' }
  },
  {
    name: 'Coastal Warm',
    vibe: 'Fresh. Inviting. Modern.',
    config: { backgroundColor: '#FDF8F2', textColor: '#1A2C3D', 
      accentColor: '#C4714A', headingFont: 'Fraunces', 
      bodyFont: 'Jost' }
  },
];

interface Props {
  selectedTheme: ThemeConfig;
  onThemeSelect: (theme: ThemeConfig) => void;
}

export default function ThemeSelectionStep({ selectedTheme, onThemeSelect }: Props) {
  return (
    <div style={{ 
      flex: 1, padding: '24px 20px 120px',
      backgroundColor: '#FFFFFF',
    }}>
      <h1 style={{ 
        fontSize: '24px', fontWeight: 700, color: '#111111',
        fontFamily: 'Playfair Display, serif', marginBottom: '6px' 
      }}>
        Choose Your Style
      </h1>
      <p style={{ 
        fontSize: '14px', color: '#888888', 
        fontFamily: 'DM Sans, sans-serif', marginBottom: '28px' 
      }}>
        Pick a visual identity for your presentation
      </p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {THEMES.map(t => {
          const selected = selectedTheme?.headingFont === t.config.headingFont;
          return (
            <button key={t.name} onClick={() => onThemeSelect(t.config)}
              style={{
                width: '100%', height: '88px', borderRadius: '14px',
                border: selected ? `2px solid ${t.config.accentColor}` : '1.5px solid #E8E8E8',
                backgroundColor: selected ? t.config.backgroundColor : '#FAFAFA',
                cursor: 'pointer', display: 'flex', alignItems: 'center',
                padding: '0 20px', gap: '16px',
                boxShadow: selected ? `0 0 0 3px ${t.config.accentColor}22` : 'none',
                transition: 'all 0.15s ease',
              }}>
              {/* Color swatch */}
              <div style={{
                width: '52px', height: '52px', borderRadius: '10px',
                backgroundColor: t.config.backgroundColor,
                border: '1px solid #E0E0E0', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{
                  width: '28px', height: '4px',
                  backgroundColor: t.config.accentColor, borderRadius: '2px',
                }} />
              </div>
              {/* Text */}
              <div style={{ textAlign: 'left', flex: 1 }}>
                <div style={{ 
                  fontSize: '16px', fontWeight: 700, color: '#111111',
                  fontFamily: t.config.headingFont + ', serif',
                  marginBottom: '3px',
                }}>
                  {t.name}
                </div>
                <div style={{ 
                  fontSize: '12px', color: '#888888',
                  fontFamily: 'DM Sans, sans-serif',
                }}>
                  {t.vibe}
                </div>
              </div>
              {/* Check */}
              {selected && (
                <div style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  backgroundColor: t.config.accentColor,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '13px', color: '#FFFFFF', flexShrink: 0,
                }}>
                  ✓
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
