import React from 'react';
import { ThemeConfig } from '@/lib/presentationTypes';

interface Props {
  theme: ThemeConfig;
  pageNumber: number;
  agencyName?: string;
  children: React.ReactNode;
}

export default function SlideShell({ theme, pageNumber, agencyName, children }: Props) {
  return (
    <div style={{
      width: '1456px',
      height: '816px',
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: theme.backgroundColor,
      fontFamily: theme.bodyFont,
      boxSizing: 'border-box',
    }}>
      {/* HEADER — consistent on every slide */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 56px',
        zIndex: 10,
      }}>
        <span style={{
          fontSize: '14px',
          color: theme.textColor,
          opacity: 0.65,
          fontFamily: theme.bodyFont,
          fontWeight: 500,
          letterSpacing: '0.3px',
        }}>
          {agencyName || 'PropSite'}
        </span>
        {/* Hamburger icon */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', cursor: 'pointer' }}>
          {[0,1,2].map(i => (
            <div key={i} style={{
              width: '22px', height: '2px',
              backgroundColor: theme.textColor,
              opacity: 0.45,
              borderRadius: '1px',
            }} />
          ))}
        </div>
      </div>

      {/* CONTENT AREA */}
      <div style={{
        position: 'absolute',
        top: '64px',
        left: 0, right: 0, bottom: '52px',
        overflow: 'hidden',
      }}>
        {children}
      </div>

      {/* FOOTER — consistent on every slide */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        height: '52px',
        borderTop: `1px solid ${theme.textColor}1E`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 56px',
      }}>
        <span style={{
          fontSize: '12px',
          color: theme.textColor,
          opacity: 0.4,
          fontFamily: theme.bodyFont,
          letterSpacing: '0.5px',
        }}>
          Real Estate Presentation
        </span>
        <span style={{
          fontSize: '12px',
          color: theme.textColor,
          fontFamily: theme.bodyFont,
          fontWeight: 600,
          letterSpacing: '0.5px',
        }}>
          Page {String(pageNumber).padStart(2, '0')}
        </span>
      </div>
    </div>
  );
}
