import React from 'react';
import { ThemeConfig } from '@/lib/presentationTypes';

interface Props {
  theme: ThemeConfig;
  pageNumber?: number;
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
      {/* Header */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 56px',
        zIndex: 10,
      }}>
        <span style={{
          fontSize: '13px',
          color: theme.textColor,
          opacity: 0.45,
          fontFamily: theme.bodyFont,
          fontWeight: 500,
          letterSpacing: '0.3px',
        }}>
          {agencyName || 'PropSite'}
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: '20px',
              height: '1.5px',
              backgroundColor: theme.textColor,
              opacity: 0.3,
              borderRadius: '1px',
            }} />
          ))}
        </div>
      </div>

      {/* Content area */}
      <div style={{
        position: 'absolute',
        top: '56px',
        left: 0, right: 0, bottom: 0,
        overflow: 'hidden',
      }}>
        {children}
      </div>
    </div>
  );
}
